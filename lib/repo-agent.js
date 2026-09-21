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

// ── Which model wears the hat ─────────────────────────────────────────────────
// §PROVIDER 2026-09-21 — James: "the repo agent needs to be able to use
// chatgpt, gemini, deepseek as the agent wearing the hat. all outputs."
// The path already existed end to end and nothing set it: copilot's
// /api/prompt with backend:'guardian' calls _lifeline.dispatchToNcpAgent —
// guardian -> the provider's userscript (DOM injector in, mutation observer
// for the reply, same as clear-glass's agent mesh / cleardriver) — and
// returns the real text. So a provider here is only a ROUTE on the one
// dispatch the compartment agent already makes: the hat's persona, the
// retrieval context, the @learn protocol, the inject protocol and every
// output handling (learned observations, .inject nodes) are identical
// whichever model answers.
//
// The browser providers are read from guardian's own userscripts on disk,
// not a list kept here: a provider is offered iff guardian/userscript-<name>.js
// exists. ollama goes through copilot's ollama backend; 'auto' leaves the
// choice to copilot's own routing.
const SETTINGS_TABLE = 'repo_agent_settings';
const NON_PROVIDER_SCRIPTS = new Set(['memory', 'nexus-wake']);
function guardianProviders() {
  const dir = require('path').join(__dirname, '..', 'guardian');
  try {
    return require('fs').readdirSync(dir)
      .map(f => (f.match(/^userscript-([a-z0-9-]+)\.js$/) || [])[1])
      .filter(n => n && !NON_PROVIDER_SCRIPTS.has(n)).sort();
  } catch (_) { return []; }
}
function providers() { return ['auto', 'ollama', ...guardianProviders()]; }

/** routeFor(provider) -> the { backend, agent } copilot's /api/prompt reads. */
function routeFor(provider) {
  if (!provider || provider === 'auto') return { backend: null, agent: null };
  if (provider === 'ollama') return { backend: 'ollama', agent: null };
  return { backend: 'guardian', agent: provider };
}

function _settingsRow(repoUuid) { return (_jaa().query(SETTINGS_TABLE, r => r.repoUuid === repoUuid, 1) || [])[0] || null; }
function getProvider(repoUuid) {
  const row = _settingsRow(repoUuid);
  return row && providers().includes(row.provider) ? row.provider : 'auto';
}
function setProvider(repoUuid, provider) {
  const list = providers();
  if (!list.includes(provider)) return { ok: false, errors: [`provider must be one of: ${list.join(', ')}`] };
  const jaa = _jaa(), row = _settingsRow(repoUuid);
  if (row) jaa.update(SETTINGS_TABLE, { uuid: row.uuid }, { provider, updatedAt: Date.now() });
  else jaa.insert(SETTINGS_TABLE, { uuid: crypto.randomUUID(), repoUuid, provider, updatedAt: Date.now() });
  return { ok: true, repoUuid, provider, route: routeFor(provider) };
}

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
// ── Self-learning protocol ───────────────────────────────────────────────────
// §SELF-LEARN 2026-09-21 — the hat previously learned only from recorded
// corrections: nothing turned the agent's own work into observations.
//
// The agent is told it MAY end a reply with lines of the exact form
//   @learn <fact|convention|pitfall>: <text> [evidence: <file or chunk id>]
// dispatch() parses them out, records each through repo-hat's learn() — so
// it is live in the persona on the very next prompt — and strips them from
// the text the person reads.
//
// Why a stated protocol and not extraction from prose: an observation the
// agent explicitly declared is its own claim, attributable and checkable.
// Mining free text for "conventions" would be this module inventing claims
// on the agent's behalf — exactly the plausible-guess-as-fact failure the
// persona tells the agent not to commit.
//
// Constraints, each deliberate:
//   · `correction` is refused. It is the person's kind — the persona ranks it
//     above anything the agent concluded — so an agent able to write one
//     could promote its own guesses over the person's word.
//   · Evidence is GROUNDED only if it names a file or chunk id the agent was
//     actually given this turn. Ungrounded evidence is kept but marked, so a
//     citation the agent could not have read is never passed off as proof.
//   · At most LEARN_MAX per reply. The rest are reported as dropped, never
//     silently kept or silently lost.
const LEARN_KINDS = Object.freeze(['fact', 'convention', 'pitfall']);
const LEARN_MAX = 5;
const LEARN_RE = /^[ \t]*@learn[ \t]+([a-z]+)[ \t]*:[ \t]*(.+?)[ \t]*(?:\[evidence:[ \t]*([^\]]+?)[ \t]*\])?[ \t]*$/i;

const LEARN_PROTOCOL = [
  'If this work taught you something durable about THIS project, you may end your reply with lines of the exact form:',
  '@learn <fact|convention|pitfall>: <one sentence> [evidence: <file path or chunk id you were given>]',
  'Only things you verified in the code you were shown. Never restate the question. Omit the lines if you learned nothing.',
].join('\n');

/**
 * parseLearned(text, { files, chunkIds }) -> { clean, items, rejected, dropped }
 * Pure. items: [{ kind, text, evidence, grounded }]. rejected: lines that
 * looked like @learn but broke a rule, with the reason. Lines are removed
 * from `clean` whether accepted or rejected — a malformed protocol line is
 * still protocol, not prose meant for the person.
 */
function parseLearned(text, { files = [], chunkIds = [] } = {}) {
  const src = String(text || '');
  const known = new Set([...files, ...chunkIds].map(String));
  const keep = [], items = [], rejected = [];
  let dropped = 0;
  for (const line of src.split('\n')) {
    if (!/^[ \t]*@learn\b/i.test(line)) { keep.push(line); continue; }
    const m = line.match(LEARN_RE);
    if (!m) { rejected.push({ line: line.trim(), reason: 'malformed @learn line' }); continue; }
    const kind = m[1].toLowerCase();
    const body = m[2].trim();
    const evidence = m[3] ? m[3].trim() : null;
    if (kind === 'correction') { rejected.push({ line: line.trim(), reason: 'correction is the person\'s kind, not the agent\'s' }); continue; }
    if (!LEARN_KINDS.includes(kind)) { rejected.push({ line: line.trim(), reason: `unknown kind "${kind}"` }); continue; }
    if (body.length < 8) { rejected.push({ line: line.trim(), reason: 'too short to be an observation' }); continue; }
    if (items.length >= LEARN_MAX) { dropped++; continue; }
    const grounded = !!evidence && [...known].some(k => k && (evidence === k || evidence.includes(k)));
    items.push({ kind, text: body, evidence, grounded });
  }
  return { clean: keep.join('\n').replace(/\n+$/, ''), items, rejected, dropped };
}

/**
 * compose({ hat, message }) — the exact text that goes out.
 *
 * Exported and pure so the UI can show the person what their agent is
 * actually being sent. A persona the person cannot read is a persona they
 * cannot correct, and correcting it is half of how this thing learns.
 */
function compose({ hat, message, context = '' }) {
  const persona = (hat && hat.personaPrompt) || '';
  const ctx = context ? ['', context] : [];   // dispatch-time retrieval (lib/repo-context.js): between the persona and the question
  if (!persona && !ctx.length) return String(message || '');
  return [
    persona,
    ...(persona ? ['', LEARN_PROTOCOL, '', require('./repo-inject.js').INJECT_PROTOCOL] : []),
    ...ctx,
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
async function dispatch({ repo, repoDir, message, backend = null, agent = null, provider = null, timeoutMs = DEFAULT_TIMEOUT_MS, noContext = false, contextOptions = {}, layer = null } = {}) {
  if (!repo || !repo.uuid) return { ok: false, error: 'repo with a uuid is required' };
  if (!message || !String(message).trim()) return { ok: false, error: 'message is required' };

  const RH = _hat();

  // Which model wears the hat: an explicit backend/agent wins, then an
  // explicit provider, then this compartment's stored choice.
  let chosen = provider;
  if (!backend && !agent) {
    if (!chosen) chosen = getProvider(repo.uuid);
    const r = routeFor(chosen);
    if (chosen !== 'auto' && !providers().includes(chosen)) return { ok: false, error: `unknown provider "${chosen}" — one of: ${providers().join(', ')}` };
    backend = r.backend; agent = r.agent;
  }
  // A browser provider answers through a real tab (inject, then wait for the
  // DOM to finish the reply); 90s is too short for a long answer.
  if (backend === 'guardian' && timeoutMs === DEFAULT_TIMEOUT_MS) timeoutMs = 300000;

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
  // The agent is not asked to go looking. Idearium reads the repo's own chunk index for what the question
  // names and puts it in the prompt, within a hard budget, so a 0.6B-3B model gets the code it needs
  // without planning a search. Only ever reads THIS repo's directory.
  let context = { chunks: [], block: '', chars: 0, dropped: 0, reason: noContext ? 'disabled by caller' : 'no repoDir' };
  if (!noContext && repoDir) { try { context = require('./repo-context.js').retrieve({ repoDir, message, ...contextOptions }); } catch (e) { context = { chunks: [], block: '', chars: 0, dropped: 0, reason: `retrieval failed: ${e.message}` }; } }
  const prompt = compose({ hat, message, context: context.block });
  const ctxInfo = { chunkIds: context.chunks.map(c => c.id), files: [...new Set(context.chunks.map(c => c.file))], chars: context.chars, dropped: context.dropped, reason: context.reason || null };
  const started = Date.now();

  const payload = { prompt, channel: 'idearium-repo-agent', sessionId };
  if (backend) payload.backend = backend;
  if (agent) payload.agent = agent;

  let res;
  try {
    res = await _post(`${COPILOT_URL}/api/prompt`, payload, timeoutMs);
  } catch (e) {
    const out = { ok: false, error: `copilot :3750 unreachable — ${e.message}`, hatName: hat.name, sessionId, promptChars: prompt.length, context: ctxInfo };
    _log(repo.uuid, { message, out, started, hat, backend });
    return out;
  }

  const j = res.json || {};
  // copilot answers /api/prompt with { text, model_used, confidence, ... }
  // on success and { ok:false, error } on its explicit failure branches.
  const rawText = typeof j.text === 'string' ? j.text : null;
  // Self-learning: parse, strip, and record the agent's own @learn lines.
  // Ungrounded evidence is recorded with a marker rather than as proof.
  let learned = null, text = rawText;
  if (rawText !== null && res.status === 200) {
    const parsed = parseLearned(rawText, { files: ctxInfo.files, chunkIds: ctxInfo.chunkIds });
    text = parsed.clean;
    const recorded = [];
    for (const it of parsed.items) {
      const ev = it.evidence ? (it.grounded ? it.evidence : `${it.evidence} (ungrounded — not in the context given)`) : null;
      try {
        const r = RH.learn({ repo, repoDir, kind: it.kind, text: it.text, source: 'agent', evidence: ev });
        recorded.push({ ...it, ok: !!r.ok, deduped: !!r.deduped, hatUpdated: !!r.hatUpdated, errors: r.ok ? undefined : r.errors });
      } catch (e) { recorded.push({ ...it, ok: false, errors: [e.message] }); }
    }
    if (recorded.length || parsed.rejected.length || parsed.dropped) {
      learned = { recorded, rejected: parsed.rejected, dropped: parsed.dropped };
    }
  }
  // §INJECT 2026-09-21 — addressed code blocks become .inject nodes in this
  // compartment (applied at once in 'auto' mode). Needs the caller's repo
  // layer: with none, nothing is written and the reply says so, rather than
  // the code silently going nowhere.
  let injects = null;
  if (text !== null && res.status === 200 && /```/.test(text)) {
    if (!layer) injects = { mode: null, injects: [], commands: 0, unresolved: [], refused: [{ reason: 'no repo layer passed to dispatch — code not injected' }] };
    else {
      const RI = require('./repo-inject.js');
      // The agent resolves where its own unaddressed code goes — same backend,
      // a side session so the question never lands in the conversation.
      const resolve = async (q) => {
        const rp = await _post(`${COPILOT_URL}/api/prompt`, {
          prompt: compose({ hat, message: RI.resolvePrompt({ ...q, question: message }) }),
          channel: 'idearium-repo-agent-resolve', sessionId: `${sessionId}-resolve`,
          ...(backend ? { backend } : {}), ...(agent ? { agent } : {}),
        }, Math.min(timeoutMs, 60000));
        if (rp.status !== 200 || typeof (rp.json || {}).text !== 'string') throw new Error((rp.json && rp.json.error) || `backend returned ${rp.status}`);
        return rp.json.text;
      };
      try { injects = await RI.fromReply({ layer, repo, hat, text, repoDir, contextFiles: ctxInfo.files, resolve, exchange: { ts: started } }); }
      catch (e) { injects = { mode: null, injects: [], commands: 0, unresolved: [], refused: [{ reason: `inject failed: ${e.message}` }] }; }
      if (injects && !injects.injects.length && !injects.refused.length && !injects.unresolved.length && !injects.commands) injects = null;
    }
  }
  const out = (res.status === 200 && text !== null)
    ? {
        ok: true, text, learned, injects,
        hatName: hat.name,
        sessionId,
        promptChars: prompt.length, context: ctxInfo,
        backend: backend || j.provider_used || j.model_used || null,
        provider: chosen || agent || backend || 'auto',
        providerUsed: j.provider_used || agent || null,
        modelUsed: j.model_used || null,
        confidence: typeof j.confidence === 'number' ? j.confidence : null,
        requestId: j.requestId || null,
        elapsedMs: Date.now() - started,
      }
    : {
        ok: false,
        error: j.error || j.text || res.parseError || `copilot returned ${res.status}`,
        hatName: hat.name, sessionId, promptChars: prompt.length, context: ctxInfo,
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
      context: out.context || null,
      injects: out.injects ? out.injects.injects.map(i => ({ uuid: i.uuid, path: i.path, status: i.status })) : null,
      learned: out.learned ? { recorded: out.learned.recorded.filter(x => x.ok).length, rejected: out.learned.rejected.length, dropped: out.learned.dropped } : null,   // which chunks the agent was given: the evidence a later outcome can be tied to
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
  providers, guardianProviders, routeFor, getProvider, setProvider,
  LEARN_KINDS, LEARN_MAX, LEARN_PROTOCOL, parseLearned,
  MODULE_ID, VERSION, TABLE, COPILOT_URL, DEFAULT_TIMEOUT_MS,
  sessionIdFor, compose, dispatch, history, clearHistory, status,
};
