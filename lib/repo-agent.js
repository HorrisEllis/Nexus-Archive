'use strict';
/**
 * lib/repo-agent.js — dispatch as one repo compartment's own agent.
 * UUID: nexus-repo-agent-v1-0000-2026-0920-jamesbrooks-001
 * Version: 0.1.0
 *
 * §REPO-AGENT 2026-09-20 — James: "an agent tab for the agent cli for the
 * agent with the repo hat... no, each repo compartment in idearium."
 *
 * §WHY THIS DOES NOT TOUCH copilot/lib/self-model.js. The obvious way to
 * dispatch "as a hat" is copilot's own mechanism: POST /api/agent/switch
 * to setCurrentAgent(hatName), prompt, switch back. Checked, and rejected
 * for this caller: setCurrentAgent mutates copilot's ONE global current
 * agent. Every other surface talking to :3750 at that moment — the
 * tv-shell floating CLI, the guardian panel's ask box, intent-hat-router's
 * own temporary switches — would land under this repo's hat mid-flight.
 * A per-compartment agent that hijacks the host's identity is not
 * compartmentalised; it is the opposite.
 *
 * So nothing here switches anything. A hat's personaPrompt is a STRING
 * meant to be prepended to a system prompt — that is the field's whole
 * definition in lib/hat-forge.js's own schema. This module composes it
 * itself and sends one ordinary prompt, exactly the way guardian's own
 * userscripts already compose buildContextHeader(intel) + text, and the
 * way copilot/tool-runtime.js's makeNcpCallModel builds fullPrompt. One
 * established convention, reused, not a new dispatch path.
 *
 * §THE LIMIT THIS BUYS, STATED PLAINLY. Composing the persona gives real
 * behavioural constraint — the agent is told what project it is, what has
 * actually been indexed, what it has learned, and that it must stay inside
 * the compartment. It does NOT give capability constraint: the hat's
 * toolScope is not enforced through this path, because the backend
 * resolves its own tools and has no idea a hat is involved. An agent that
 * decides to call a tool outside its toolScope will succeed. Enforcing
 * that needs a per-request hat parameter on the backend itself, which does
 * not exist today. Named here rather than left to be discovered.
 *
 * §SESSION. sessionId is derived from the repo uuid, so each compartment
 * gets its own continuous conversation in copilot's own _getSession map —
 * two repos never share history, and the same repo picks up where it left
 * off. That is the compartment boundary doing real work, not decoration.
 */

const crypto = require('crypto');
const http = require('http');

const MODULE_ID = 'repo-agent';
const VERSION = '0.1.0';

const COPILOT_URL = process.env.COPILOT_URL || 'http://127.0.0.1:3750';
const DEFAULT_TIMEOUT_MS = 90000; // matches guardian/ask.js's own askSync budget

const TABLE = 'repo_agent_log';

function _hat()    { return require('./repo-hat.js'); }
function _memory() { return require('./repo-hat-memory.js'); }
function _jaa()    { return require('./../cortex/memory/jaa-db.js').jaaDB; }

/** One stable session per compartment. */
function sessionIdFor(repoUuid) { return `repo-agent-${repoUuid}`; }

// ── Transport ─────────────────────────────────────────────────────────────────
// Plain http.request rather than fetch: this module is required into
// idearium's ESM process through createRequire, and a bare http call has no
// dependency on which fetch implementation that process happens to have.
function _post(url, payload, timeoutMs) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(url); } catch (e) { return reject(new Error(`bad url: ${e.message}`)); }
    const body = JSON.stringify(payload);
    const req = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, json: null, raw: d.slice(0, 500), parseError: e.message }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(new Error(`timed out after ${timeoutMs}ms`)); });
    req.write(body);
    req.end();
  });
}

// ── Composition ───────────────────────────────────────────────────────────────
/**
 * compose({ hat, message }) — the exact text that goes out.
 *
 * Exported and pure so the UI can show the person what their agent is
 * actually being sent. A persona the person cannot read is a persona they
 * cannot correct, and correcting it is half of how this thing learns.
 */
function compose({ hat, message }) {
  const persona = (hat && hat.personaPrompt) || '';
  if (!persona) return String(message || '');
  return [
    persona,
    '',
    '───',
    '',
    String(message || ''),
  ].join('\n');
}

// ── Dispatch ──────────────────────────────────────────────────────────────────
/**
 * dispatch({ repo, repoDir, message, backend, agent, timeoutMs })
 *
 * Returns { ok, text, hatName, sessionId, promptChars, backend, requestId }
 * or { ok:false, error, ... }. Never throws for a backend that is simply
 * down — that is a real, reportable state, not an exception.
 *
 * `backend` maps straight onto copilot's own body.backend convention
 * ('guardian' | 'ollama'), omitted for its default routing. `agent` is
 * copilot's provider name, only meaningful when backend === 'guardian'.
 * Neither is invented here; both are that endpoint's existing contract.
 */
async function dispatch({ repo, repoDir, message, backend = null, agent = null, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!repo || !repo.uuid) return { ok: false, error: 'repo with a uuid is required' };
  if (!message || !String(message).trim()) return { ok: false, error: 'message is required' };

  const RH = _hat();

  // The hat is the agent. No hat, no compartment agent — forge it rather
  // than quietly dispatching an unconstrained host-wide prompt wearing this
  // repo's name, which is precisely what repo-hat.js refuses to allow.
  let hat = RH.getRepoHat(repo.uuid);
  if (!hat) {
    const ensured = RH.ensureRepoHat({ repo, repoDir });
    if (!ensured.ok) {
      return { ok: false, error: (ensured.errors || ['could not forge a hat for this repo']).join('; '), needsHat: true };
    }
    hat = ensured.hat;
  }

  const sessionId = sessionIdFor(repo.uuid);
  const prompt = compose({ hat, message });
  const started = Date.now();

  const payload = { prompt, channel: 'idearium-repo-agent', sessionId };
  if (backend) payload.backend = backend;
  if (agent) payload.agent = agent;

  let res;
  try {
    res = await _post(`${COPILOT_URL}/api/prompt`, payload, timeoutMs);
  } catch (e) {
    const out = { ok: false, error: `copilot :3750 unreachable — ${e.message}`, hatName: hat.name, sessionId, promptChars: prompt.length };
    _log(repo.uuid, { message, out, started, hat, backend });
    return out;
  }

  const j = res.json || {};
  // copilot answers /api/prompt with { text, model_used, confidence, ... }
  // on success and { ok:false, error } on its explicit failure branches.
  const text = typeof j.text === 'string' ? j.text : null;
  const out = (res.status === 200 && text !== null)
    ? {
        ok: true, text,
        hatName: hat.name,
        sessionId,
        promptChars: prompt.length,
        backend: backend || j.provider_used || j.model_used || null,
        modelUsed: j.model_used || null,
        confidence: typeof j.confidence === 'number' ? j.confidence : null,
        requestId: j.requestId || null,
        elapsedMs: Date.now() - started,
      }
    : {
        ok: false,
        error: j.error || j.text || res.parseError || `copilot returned ${res.status}`,
        hatName: hat.name, sessionId, promptChars: prompt.length,
        elapsedMs: Date.now() - started,
      };

  _log(repo.uuid, { message, out, started, hat, backend });
  return out;
}

// ── Exchange log ──────────────────────────────────────────────────────────────
// Per-compartment, not merged into cortex's global chat_log: the whole point
// of a compartment agent is that its history is its own. Failures are logged
// with the same weight as successes — a compartment whose agent has been
// failing for a week should be able to show that.
function _log(repoUuid, { message, out, started, hat, backend }) {
  try {
    _jaa().insert(TABLE, {
      uuid: crypto.randomUUID(),
      repoUuid,
      hatName: hat?.name || null,
      message: String(message).slice(0, 4000),
      response: out.ok ? String(out.text).slice(0, 8000) : null,
      error: out.ok ? null : String(out.error || '').slice(0, 1000),
      ok: !!out.ok,
      backend: backend || out.backend || null,
      promptChars: out.promptChars ?? null,
      elapsedMs: Date.now() - started,
      ts: Date.now(),
    });
  } catch (_) { /* a log write must never take down a real dispatch */ }
}

/** history(repoUuid, limit) — this compartment's own exchanges, newest first. */
function history(repoUuid, limit = 50) {
  if (!repoUuid) return [];
  const rows = _jaa().query(TABLE, r => r.repoUuid === repoUuid, 1000) || [];
  return rows.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, limit);
}

/** clearHistory(repoUuid) — forget this compartment's transcript. */
function clearHistory(repoUuid) {
  if (!repoUuid) return { ok: false, errors: ['repoUuid is required'] };
  const before = history(repoUuid, 100000).length;
  try {
    _jaa().delete(TABLE, r => r.repoUuid === repoUuid);
    return { ok: true, cleared: before };
  } catch (e) { return { ok: false, errors: [`clearHistory failed: ${e.message}`] }; }
}

/**
 * status({ repo, repoDir }) — everything the Agent tab needs in one read:
 * whether a hat exists, what it knows, and what it has been doing.
 */
function status({ repo, repoDir } = {}) {
  if (!repo || !repo.uuid) return { ok: false, error: 'repo with a uuid is required' };
  const RH = _hat();
  const hat = RH.getRepoHat(repo.uuid);
  return {
    ok: true,
    repoUuid: repo.uuid,
    compartmentId: repo.compartmentId || null,
    // exists:false is an ordinary state, not an error — same convention
    // repo.hat.show and repo.scan already use so the UI's api() helper
    // does not throw on it.
    exists: !!hat,
    hat: hat ? { name: hat.name, baseAgent: hat.baseAgent, seedKey: hat.seedKey, toolScope: hat.toolScope || [], personaPrompt: hat.personaPrompt || '' } : null,
    index: RH.readRepoIndex(repoDir),
    memory: _memory().stats(repo.uuid),
    sessionId: sessionIdFor(repo.uuid),
    exchanges: history(repo.uuid, 1).length ? history(repo.uuid, 100000).length : 0,
    toolScopeEnforced: false, // see this file's header — honest, not aspirational
  };
}

module.exports = {
  MODULE_ID, VERSION, TABLE, COPILOT_URL, DEFAULT_TIMEOUT_MS,
  sessionIdFor, compose, dispatch, history, clearHistory, status,
};
