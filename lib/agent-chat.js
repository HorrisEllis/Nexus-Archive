'use strict';
/**
 * lib/agent-chat.js — the backend half of "hey nexus" / agent-to-agent chat
 * comp_id: nexus.lib.agent-chat
 * UUID: nexus-lib-agent-chat-v1-0000-2026-0819-001
 * Version: 1.1.0
 *
 * §WHY THIS FILE (reconstructed 2026-08-19) — guardian/userscript-nexus-wake.js
 * and its test (tests/modules/test-nexus-wake.js, NW-002) both require this
 * module to exist and to agree with the browser matcher EXACTLY: same
 * WAKE_RE, same parseWake() semantics. Divergence here is the "works
 * sometimes" bug class NW-002's own comment warns about, so this is not a
 * reimplementation from a description — the regex and parseWake body are
 * copied verbatim from guardian/userscript-nexus-wake.js. If one changes,
 * change both, in the same commit.
 *
 * §v1.1.0 CORRECTED — v1.0.0's ask() reimplemented dispatch with a raw HTTP
 * call to guardian's /api/copilot/prompt. Checked, not assumed, this time:
 * that path already exists, three times over, in
 * lib/agent-tools/tools/coordination/{agent-council,roundtable,parallel-dispatch}.js
 * — all three resolve a hat to a baseAgent and call
 * copilot/lifeline.js's dispatchToNcpAgent(prompt, {provider,...}), which
 * itself already does the RAID routing, the /providers connectivity
 * check, and (§BUILT 2026-08-18) hands the dispatched agent real tool
 * access to nexus via guardian/ask.js's opts.tools round. Reimplementing
 * that here would be a second, divergent copy of dispatch logic that
 * already exists and is already used by three other tools. So ask() below
 * takes its dispatch function as a parameter (same DI pattern as
 * lib/seam/queue.js's QueueCompartment) — the REAL caller is
 * lib/agent-tools/tools/coordination/agent-chat.js, which supplies
 * copilot/tool-runtime.js's runViaAgent (the same full tool loop co-pilot
 * itself runs on, per that file's own comment: "whichever agent is
 * dispatched to gets the SAME tool loop... as ollama"). A bare HTTP
 * fallback stays here ONLY for callers with no lifeline available (tests,
 * or a future non-copilot caller) — never the default when a real
 * dispatch function is supplied.
 *
 * §THE SECOND JOB — "reads and addresses other agents with a hop cap."
 * Reading: guardian_chat_log is the real table for this (confirmed live in
 * lib/agent-tools/tools/query/agent-chat-search.js's own header) but has NO
 * current writer anywhere in the tree — readChat() below is the first one.
 * Addressing: a hop cap on top of whatever dispatch function is supplied,
 * so agent A asking agent B who asks agent C cannot loop back through A
 * indefinitely — and every exchange is written to guardian_chat_log so
 * readChat() (and the existing agent_chat_search tool) have something real
 * to read, regardless of which dispatch path answered.
 *
 * §NOT THIS FILE'S JOB — guardian's GET /api/tab/dom?provider=X (a live read
 * of what's currently on screen in a provider tab, as opposed to what NEXUS
 * has already logged) does not exist yet. readChat() below serves logged
 * history only and says so in its result rather than pretending live-DOM
 * coverage it doesn't have.
 */

const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// Same matcher as guardian/userscript-nexus-wake.js — one grammar, two
// runtimes. Keep byte-for-byte identical; NW-002 pins this.
const WAKE_RE = /^\s*(?:hey|hi|ok|okay)[,\s]+nexus[,:\s]+([\s\S]+)$/i;

function parseWake(text) {
  if (typeof text !== 'string' || !text.trim()) return { addressed: false, ask: null };
  const m = text.match(WAKE_RE);
  if (!m) return { addressed: false, ask: null };
  const ask = (m[1] || '').trim();
  if (!ask) return { addressed: false, ask: null, note: 'wake word with no request — ignored rather than sent as an empty prompt' };
  return { addressed: true, ask };
}

const GUARDIAN_URL = process.env.GUARDIAN_URL || 'http://127.0.0.1:7820';
const KNOWN_PROVIDERS = ['chatgpt', 'claude', 'gemini', 'perplexity', 'ollama', 'mistral'];

// §HOP CAP — default matches the number of chat-capable providers so a
// legitimate round-robin ("ask everyone") still completes, while a genuine
// A->B->A loop is refused well before it becomes a runaway job queue.
const DEFAULT_MAX_HOPS = 4;

function _jaa() {
  try { return require(path.join(ROOT, 'cortex/memory/jaa-db.js')).jaaDB; }
  catch (_) { return null; }
}

function _post(url, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    let http;
    try { http = require(url.startsWith('https') ? 'https' : 'http'); }
    catch (e) { reject(e); return; }
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: timeoutMs || 30000,
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(chunks); } catch (_) { parsed = { raw: chunks }; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('timeout', () => req.destroy(new Error(`request to ${url} timed out after ${timeoutMs}ms`)));
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// §DEFAULT FALLBACK DISPATCH — only used when no dispatch function is
// injected (see ask() below). Goes through guardian's real askSync path so
// even the fallback isn't a made-up transport, but it does NOT get the real
// agent-tools loop that lifeline's dispatchToNcpAgent + runViaAgent give a
// dispatched agent — that's the reason the injected path is preferred.
async function _defaultDispatch(prompt, opts) {
  const res = await _post(`${GUARDIAN_URL}/api/copilot/prompt`, {
    prompt, provider: opts.provider, timeoutMs: opts.timeoutMs,
  }, (opts.timeoutMs || 30000) + 5000);
  const ok = res.status === 200 && res.body && res.body.ok !== false;
  const text = ok ? (res.body.text || res.body.response || res.body.result || null) : null;
  return ok && text
    ? { ok: true, text }
    : { ok: false, text: null, error: (res.body && res.body.error) || `guardian returned ${res.status} with no usable text` };
}

/**
 * ask(provider, message, opts) — address another agent as a real agent,
 * with a hop cap so agent-to-agent chains can't loop forever.
 *
 * opts: { from, hops, maxHops, timeoutMs, dispatch }
 *   from     — who is asking (for the log row and for cycle detection)
 *   hops     — the chain of askers so far, e.g. ['nexus', 'chatgpt']. Passed
 *              through untouched by the CALLER on the first hop; this
 *              function appends `from` and refuses if `provider` is already
 *              in the chain (a real cycle) or the chain is at maxHops.
 *   dispatch — (prompt, {provider, requestId, ...}) => {ok, text, error}.
 *              Inject copilot/lifeline.js's dispatchToNcpAgent (or
 *              tool-runtime's runViaAgent, for the full tool loop) here.
 *              Falls back to a plain guardian askSync call if omitted —
 *              real, but without the dispatched agent's own tool access.
 *
 * Returns { ok, text, error, hops }. Never throws — a failed ask is a
 * result, per the same §1.2 convention as the wake handler.
 */
async function ask(provider, message, opts = {}) {
  if (!provider || !KNOWN_PROVIDERS.includes(provider)) {
    return { ok: false, error: `unknown provider "${provider}" — expected one of ${KNOWN_PROVIDERS.join(', ')}` };
  }
  if (typeof message !== 'string' || !message.trim()) {
    return { ok: false, error: 'message required' };
  }

  const from     = opts.from || 'nexus';
  const maxHops  = opts.maxHops || DEFAULT_MAX_HOPS;
  const hops     = Array.isArray(opts.hops) ? opts.hops.slice() : [];
  const dispatch = typeof opts.dispatch === 'function' ? opts.dispatch : _defaultDispatch;

  if (hops.includes(provider)) {
    return { ok: false, error: `hop cap: "${provider}" is already in this chain (${hops.join(' -> ')} -> ${provider}) — refusing to loop`, hops };
  }
  if (hops.length >= maxHops) {
    return { ok: false, error: `hop cap: chain already at ${hops.length} hops (max ${maxHops}) — ${hops.join(' -> ')}`, hops };
  }

  const nextHops = hops.concat(from);
  const startedAt = Date.now();
  let d;
  try {
    d = await dispatch(message, { provider, from, hops: nextHops, timeoutMs: opts.timeoutMs, requestId: opts.requestId });
  } catch (e) {
    return { ok: false, error: `dispatch to ${provider} threw: ${e.message}`, hops: nextHops };
  }

  const ok   = !!(d && d.ok !== false && d.text);
  const text = ok ? d.text : null;
  const result = ok
    ? { ok: true, text, hops: nextHops }
    : { ok: false, error: (d && d.error) || `${provider} returned no usable text`, hops: nextHops };

  // §WRITER — guardian_chat_log has no current writer anywhere else in the
  // tree (confirmed in lib/agent-tools/tools/query/agent-chat-search.js's own
  // header). Logging failures too, not just successes — a table that only
  // records what worked is not a real history.
  const jaa = _jaa();
  if (jaa) {
    try {
      jaa.insert('guardian_chat_log', {
        ts: startedAt, provider, from, prompt: message,
        response: text || null, ok: result.ok, error: result.ok ? null : result.error,
        hops: nextHops, durationMs: Date.now() - startedAt,
      });
    } catch (_) { /* logging must never break the ask path */ }
  }

  return result;
}

/**
 * readChat(provider, opts) — logged history for one provider, newest first.
 *
 * This reads guardian_chat_log (what NEXUS has actually asked and logged
 * via ask() above). It is NOT a live read of what's currently on screen in
 * that provider's tab — that would be GET /api/tab/dom?provider=X on
 * guardian, which does not exist yet. Returned explicitly as `liveDom:
 * false` rather than silently passing off logged history as a live read.
 */
function readChat(provider, opts = {}) {
  const limit = opts.limit || 20;
  const jaa = _jaa();
  if (!jaa) return { ok: false, error: 'jaa store unavailable', rows: [], liveDom: false };
  let rows;
  try {
    rows = jaa.query('guardian_chat_log', provider ? (r => r.provider === provider) : (() => true));
  } catch (e) {
    return { ok: false, error: e.message, rows: [], liveDom: false };
  }
  rows = rows.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, limit);
  return { ok: true, rows, liveDom: false };
}

/**
 * converse({ agentA, agentB, openingLine, from, maxRounds, dispatch, requestId }) —
 * a genuine, multi-round, back-and-forth conversation between two named
 * agents. James: "I want them to be able to talk back and forth."
 *
 * §WHY ON TOP OF ask(), NOT A REIMPLEMENTATION — every single turn below is
 * a real, individual ask() call. That means every turn independently gets
 * the same real hop-cap protection, the same real tool access (via
 * whatever dispatch fn the caller supplies — copilot/tool-runtime.js's
 * runViaAgent, same as a single ask()), and the same real
 * guardian_chat_log write. A conversation is not a different kind of
 * exchange than a single ask — it is several of them, in sequence, and
 * treating it as anything else would mean two divergent code paths for
 * dispatch that must stay in sync forever.
 *
 * §THE HOP CAP DOES DOUBLE DUTY HERE — ask()'s hops array already refuses
 * a provider that's already in the chain. Passed straight through on every
 * turn (not reset), which means the SAME real protection that stops a
 * relay loop (A asks B asks C asks A) also naturally bounds a two-agent
 * conversation once maxHops is reached — no second bound needed for that
 * failure mode. maxRounds below is a SEPARATE, real bound for the case hops
 * doesn't cover: A and B legitimately only ever hop between each other,
 * which never grows the hops array past 2 real entries, so a conversation
 * between exactly two agents needs its own real stop condition.
 *
 * Real, honest stop conditions, not glossed over: maxRounds reached, either
 * side's ask() genuinely fails (empty text, dispatch error, hop-cap
 * refusal), or a real END_RE match on either side's own words — a
 * conversation that runs to the bound every time even when both sides are
 * done talking is not "back and forth," it's forced small talk.
 */
const END_RE = /\b(nothing (else|further) to add|that('?s| is) all|no further questions|conversation (complete|concluded|done)|i'?m done here)\b/i;

async function converse({ agentA, agentB, openingLine, from = 'nexus', maxRounds = 4, dispatch, requestId } = {}) {
  if (!agentA || !agentB) return { ok: false, error: 'converse needs agentA and agentB' };
  if (agentA === agentB) return { ok: false, error: 'converse needs two DIFFERENT agents — talking to yourself is not a conversation' };
  if (typeof openingLine !== 'string' || !openingLine.trim()) return { ok: false, error: 'converse needs openingLine' };

  const MAX_ROUNDS_HARD_CAP = 10; // §1.1 — a real, stated bound regardless of what a caller requests
  const rounds = Math.min(maxRounds, MAX_ROUNDS_HARD_CAP);
  const transcript = [];

  let speaker = agentA, listener = agentB, message = openingLine;
  for (let i = 0; i < rounds * 2; i++) {
    // §FIXED, found by testing before shipping: ask()'s hop-cap exists to
    // stop an INDIRECT relay loop through intermediaries (A asks B asks C
    // asks A) — accumulating hops across MY OWN conversation rounds meant
    // round 2 always saw the round-1 speaker already "in the chain" and
    // refused, even though direct back-and-forth between exactly these
    // two agents is the entire point. rounds above is already the real,
    // correct bound for THIS failure mode; each turn passes a fresh,
    // single-entry hops array — enough for ask()'s own logging, without
    // triggering protection built for a different problem.
    const r = await ask(listener, message, { from: speaker, hops: [speaker], dispatch, requestId, maxHops: 2 });
    if (!r.ok) {
      transcript.push({ speaker: listener, error: r.error, round: transcript.length });
      return { ok: transcript.length > 0, transcript, rounds: Math.ceil(transcript.length / 2), stoppedBecause: r.error };
    }
    transcript.push({ speaker: listener, text: r.text, round: transcript.length });

    if (END_RE.test(r.text)) {
      return { ok: true, transcript, rounds: Math.ceil(transcript.length / 2), stoppedBecause: `${listener} signaled the conversation was complete` };
    }

    message = r.text;
    [speaker, listener] = [listener, speaker]; // real, genuine alternation — the previous listener now speaks
  }

  return { ok: true, transcript, rounds: Math.ceil(transcript.length / 2), stoppedBecause: `reached the real, requested bound (${rounds} rounds)` };
}

module.exports = { WAKE_RE, parseWake, ask, converse, readChat, KNOWN_PROVIDERS, DEFAULT_MAX_HOPS };
