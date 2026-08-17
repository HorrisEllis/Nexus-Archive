'use strict';
/**
 * copilot/server.js — Sovereign Co-pilot System
 * UUID: nexus-copilot-server-v3-0000-2026-0628-jamesbrooks-001
 * Port: 3750
 *
 * P73–73.6  — copilot-context.js now wires all 7 sensing layers into every
 *             prompt (was using bespoke 5-layer assembler in analysis.js).
 * P103      — Session continuity: last N chat_log injected at session start.
 * P110      — Dual cognition full wire: Cortex /api/intelligence/intuition
 *             and /api/intelligence/mastermind queried before Ollama dispatch.
 * P112      — Streaming /api/prompt/stream SSE endpoint — token-by-token via
 *             Ollama streamed jobs; timeout eliminated.
 * AX-008    — Idearium SSE wired in. Was the one sovereign system whose
 *             activity never reached copilot. Fixed 2026-06-29.
 */

const http   = require('http');
const crypto = require('crypto');
const path   = require('path');
const fs     = require('fs');

// §BUG FIXED 2026-07-11, extracted as a real shared function — "the
// co-pilot in the tv-ui is showing json strings — fixed over and over but
// keeps getting changed back." Root cause of the "keeps getting changed
// back" part specifically: the two call sites that needed this fix each
// had their OWN inline fallback chain (`r.text || r.result ||
// JSON.stringify(r)`), and tests/modules/copilot-handshake-dispatch.test.js
// tested a THIRD, independently-duplicated copy of the same logic rather
// than importing the real function — so a fix applied to the real code
// never touched what the test actually exercised, the test kept passing
// against its own stale mock, and nothing caught a regression that
// reintroduced the bug in either real call site. Extracting this once,
// exporting it, and having the test import the real function (not a mock)
// closes that loop — the test can no longer drift from the implementation.
//
// The bug itself: an upstream response can carry its text at `.text`,
// nested at `.result.text`, or (older/other providers) directly as a
// string at `.result`. Every UI consumer downstream treats the extracted
// value as a plain string — `.slice()`, template-literal interpolation,
// `textContent` assignment. Picking a raw object because it was first in
// an `||` chain breaks all of those; this always returns a string.
function extractDispatchText(r) {
  if (!r || typeof r !== 'object') return null;
  if (typeof r.text === 'string') return r.text;
  if (typeof r.result === 'string') return r.result;
  if (typeof r.result?.text === 'string') return r.result.text;
  if (typeof r.output === 'string') return r.output;
  if (typeof r.output?.text === 'string') return r.output.text;
  return null; // caller decides the fallback — different callers want different diagnostic messages
}

const PORT     = parseInt(process.env.COPILOT_PORT || '3750');
const GD_URL   = process.env.GUARDIAN_URL   || 'http://127.0.0.1:7820';
const CX_URL   = process.env.CORTEX_URL     || 'http://127.0.0.1:3748';

// §ADDED 2026-07-06 — completes the loop the Spotlight bug fix (same
// session) unblocked: ui/tv-shell/spotlight/spotlight.js's window.CP.exec
// now actually works, but nothing ever sent it a `ui{}` block. This is
// that decision logic — real, not a stub, with an honest limit stated
// directly: lib/nerve/index.js's own comment says per-node CFR stress is
// "a Phase 3+ concern... global field is honest for Phase 1," so WHICH
// system is stressed can't be answered yet — only "is the system as a
// whole calm or not" can. Built to match that real limit, not to pretend
// past it. This list must match ui/tv-shell/spotlight/spotlight.js's own
// EL registry — canonical source is that file; kept in sync manually
// since one's browser JS and one's Node, no shared import path today.
const SPOTLIGHT_TARGETS = ['guardian','cortex','idearium','orchestrator','bridge',
  'diagnostic','architect','emerge','forge','agent','blueprint'];

async function _fetchCFRField() {
  return new Promise((resolve) => {
    const u = new URL(`${CX_URL}/cfr/field`);
    const req = http.request({ hostname: u.hostname, port: u.port || 3748, path: u.pathname, timeout: 1500 }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { try { resolve(JSON.parse(d)); } catch(_) { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

/**
 * _buildSpotlightUI — real decision, real data, honest about its limit.
 * WHICH systems: literal name-mention matching against the same targets
 * Spotlight itself knows about — if the answer talks about guardian, the
 * guardian tile lights up. HOW urgently: the real global CFR regime
 * (stable vs. not) sets intensity/color — not per-system, because
 * per-system doesn't exist yet.
 */
async function _buildSpotlightUI(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const mentioned = SPOTLIGHT_TARGETS.filter(name => new RegExp(`\\b${name}\\b`).test(lower));
  if (!mentioned.length) return null;

  const field = await _fetchCFRField();
  const stable = !field || field.regime === 'stable'; // fail open to calm, never fabricate alarm from a failed fetch
  return {
    spotlight: mentioned,
    spotlightTtl: 8000,
    spotlightIntensity: stable ? 0.6 : 0.9,
    spotlightColor: stable ? null : '#ff5566',
  };
}
const OR_URL   = process.env.ORCH_URL       || 'http://127.0.0.1:9000';
const OL_URL   = process.env.OLLAMA_URL     || 'http://127.0.0.1:3749';
const IDR_URL  = process.env.IDEARIUM_URL   || 'http://127.0.0.1:4800';

const _cw = require('../lib/cortex-write')('copilot');

// Blueprint index — component awareness substrate (§BP-01)
let _blueprintIndex = null;
function _getBP() {
  if (_blueprintIndex) return _blueprintIndex;
  try { _blueprintIndex = require('../lib/blueprint-index'); return _blueprintIndex; } catch(_) { return null; }
}

// §P73: copilot-context — 7-layer sensing (L0 bus → L6 predictive intent)
let _copilotContext = null;
function _getCopilotContext() {
  if (_copilotContext) return _copilotContext;
  try { _copilotContext = require('../copilot/lib/copilot-context'); return _copilotContext; } catch(_) { return null; }
}

setImmediate(() => {
  try {
    const bi = _getBP();
    if (!bi?.load()) {
      const r = bi?.build();
      if (r?.ok) console.log(`[copilot] blueprint-index built: ${r.index?.totalComponents} components`);
    } else {
      console.log('[copilot] blueprint-index loaded');
    }
  } catch(e) { console.warn('[copilot] blueprint-index startup failed:', e.message); }
});

const _lifeline    = require('./lifeline');
const _modBuilder  = require('./module-builder');
const _rDiagnose   = require('./recursive-diagnose');
const SYSTEM_ID = 'copilot';
// §BUGFIX 2026-07-04: was a hardcoded '3.0.0', independent of
// lib/version.js's registry — sourcing from it now.
const VERSION   = require('../lib/version').services.copilot;

// ── CONTINUOUS STREAM — the co-pilot's consciousness ─────────────────────────
const _stream = [];
const MAX_STREAM = 500;

// §WIRED 2026-07-09 — copilot/lib/expectation-watcher.js arrived with
// nexus-autonomous-v8 and was orphaned: nothing in copilot/*.js required it.
// It is the event-driven expectation system — "co-pilot tracks errors from
// expected events" — detecting when a trigger fires and the expected
// follow-up never arrives within its timeout.
//
// It needs a bus. Copilot had none: its events arrive as SSE from cortex and
// guardian and land in the _stream ring via streamIngest(). Per §AX-011 the
// bus is a within-process spine, so copilot gets its own, fed by the real
// ingestion path. Same single-object event shape as nexus-bus (`on('*', ev)`),
// so anything written against that contract works here unchanged.
const { EventEmitter } = require('events');
const _copilotBus = new EventEmitter();
_copilotBus.setMaxListeners(50);

let _expectationWatcher = null;
try {
  const { createExpectationWatcher } = require('./lib/expectation-watcher.js');
  _expectationWatcher = createExpectationWatcher(_copilotBus);

  // §WIRE COMPLETED 2026-07-09 — the watcher emits 'copilot.error.detected'
  // onto the LOCAL bus, and ui/toast/toast.js already subscribes to exactly
  // that event type. But nothing carried it across: copilot never broadcast
  // it to its SSE clients, so a detected violation died in-process and the
  // user was never told. That is the dominant bug of this codebase — a real
  // detector wired to nothing — reproduced one more time. This is the wire.
  //
  // Per §AX-011 the bus is within-process; SSE is how it crosses to the UI.
  _copilotBus.on('copilot.error.detected', (d) => {
    try { broadcast('copilot.error.detected', d); }
    catch (e) { console.warn('[copilot] failed to broadcast error.detected:', e.message); }
  });

  console.log('[copilot] expectation-watcher attached — 5 expectations armed, violations broadcast to /sse');
} catch (e) {
  console.warn('[copilot] expectation-watcher not attached:', e.message);
}

function streamIngest(event) {
  _stream.push({ ...event, ingestedAt: Date.now() });
  if (_stream.length > MAX_STREAM) _stream.shift();
  broadcast('copilot.stream.event', { type: event.type, ts: event.ts || Date.now() });

  // Feed the local bus so the expectation watcher sees real traffic.
  // Both fan-outs, matching nexus-bus's contract exactly (specific + wildcard,
  // one event object). Never let a listener error break ingestion (§1.2:
  // report, don't swallow the pipeline).
  if (event?.type) {
    try { _copilotBus.emit(event.type, event); } catch (e) { console.warn('[copilot] bus listener error:', e.message); }
    try { _copilotBus.emit('*', event); }       catch (e) { console.warn('[copilot] bus wildcard error:', e.message); }
  }
}

// Subscribe to Cortex SSE for live events
function _connectCortexStream() {
  try {
    const u = new URL(`${CX_URL}/events`);
    const req = http.request({ hostname: u.hostname, port: u.port || 3748,
      path: u.pathname, headers: { Accept: 'text/event-stream' } }, res => {
      let buf = '';
      res.on('data', chunk => {
        buf += chunk.toString();
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const part of parts) {
          const line = part.split('\n').find(l => l.startsWith('data:'));
          if (!line) continue;
          try { streamIngest(JSON.parse(line.slice(5))); } catch(_) {}
        }
      });
      res.on('end', () => { setTimeout(_connectCortexStream, 2000); });
    });
    req.on('error', () => setTimeout(_connectCortexStream, 5000));
    req.end();
  } catch(_) { setTimeout(_connectCortexStream, 5000); }
}

// Subscribe to Guardian SSE
function _connectGuardianStream() {
  try {
    const u = new URL(`${GD_URL}/events`);
    const req = http.request({ hostname: u.hostname, port: u.port || 7820,
      path: '/bus', headers: { Accept: 'text/event-stream' } }, res => {
      let buf = '';
      res.on('data', chunk => {
        buf += chunk.toString();
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const part of parts) {
          const line = part.split('\n').find(l => l.startsWith('data:'));
          if (!line) continue;
          try { streamIngest(JSON.parse(line.slice(5))); } catch(_) {}
        }
      });
      res.on('end', () => setTimeout(_connectGuardianStream, 2000));
    });
    req.on('error', () => setTimeout(_connectGuardianStream, 5000));
    req.end();
  } catch(_) { setTimeout(_connectGuardianStream, 5000); }
}

// §AX-008 fix 2026-06-29: Subscribe to Idearium SSE — was scoped (IDR_URL has
// existed since at least v3) but never connected. idearium/index.js broadcasts
// every os.emit() (idea.create, idea.phase, spec.create, gap.open, ...) to all
// SSE clients on /sse — same shape as Guardian/Cortex's /events, different
// path. Closes AX-008: idearium's idea/project/lattice activity was invisible
// to copilot by construction; this is the missing wire. See hooks/idearium.hooks.js.
function _connectIdeariumStream() {
  try {
    const u = new URL(`${IDR_URL}/sse`);
    const req = http.request({ hostname: u.hostname, port: u.port || 4800,
      path: u.pathname, headers: { Accept: 'text/event-stream' } }, res => {
      let buf = '';
      res.on('data', chunk => {
        buf += chunk.toString();
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const part of parts) {
          const line = part.split('\n').find(l => l.startsWith('data:'));
          if (!line) continue;
          try {
            const ev = JSON.parse(line.slice(5));
            streamIngest({ ...ev, system: ev.system || 'idearium' });
          } catch(_) {}
        }
      });
      res.on('end', () => setTimeout(_connectIdeariumStream, 2000));
    });
    req.on('error', () => setTimeout(_connectIdeariumStream, 5000));
    req.end();
  } catch(_) { setTimeout(_connectIdeariumStream, 5000); }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function _fetch(url, opts = {}) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port || 80,
      path: u.pathname + (u.search || ''),
      method: opts.method || 'GET',
      headers: { 'Content-Type':'application/json', ...(opts.headers||{}) },
      timeout: opts.timeout || 5000,
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(_) { res(d); } });
    });
    req.on('error', rej);
    req.on('timeout', () => { req.destroy(); rej(new Error('timeout')); });
    if (opts.body) req.write(JSON.stringify(opts.body));
    req.end();
  });
}

async function _post(url, body, timeoutMs = 10000) {
  return _fetch(url, { method: 'POST', body, timeout: timeoutMs });
}

// ── Dual Cognition modules ─────────────────────────────────────────────────────
const _intuition   = require('./intuition');
const _analysis    = require('./analysis');
const _adversarial = require('./adversarial');

_adversarial.start(() => _stream.slice(-30));

// ── §P110: Cortex dual cognition — INTUITION + MASTERMIND via HTTP ────────────
// Cortex runs its own intelligence layer (Phase 84/85). Before dispatching to
// Ollama, we query Cortex for a fast intuition answer and a causal mastermind
// reading. Either can satisfy the prompt without a model call.
async function _queryCortexIntuition(prompt, sessionId) {
  try {
    const r = await _fetch(`${CX_URL}/api/intelligence/intuition`, {
      method: 'POST',
      body: { prompt, sessionId },
      timeout: 2000,
    });
    if (r?.ok && r?.text) return r;
    return null;
  } catch(_) { return null; }
}

async function _queryCortexMastermind(prompt, contextLayers, sessionId) {
  try {
    const r = await _fetch(`${CX_URL}/api/intelligence/mastermind`, {
      method: 'POST',
      body: { prompt, context: contextLayers, sessionId },
      timeout: 4000,
    });
    if (r?.ok && r?.analysis) return r;
    return null;
  } catch(_) { return null; }
}

// ── §P103: Session continuity — inject last N exchanges on session start ───────
// Fetches chat_log from Cortex and appends to the 7-layer context so the
// co-pilot remembers what was said earlier in the session.
// §MERGED 2026-07-09 from the parallel 07-07 branch (nexus-wired-v6).
// Pure decision function, deliberately kept out of the HTTP handler so it
// is directly testable. Given a fast intuition answer and (maybe) an
// adversarial verdict, decides what to actually say. A contradiction is
// surfaced to the user, never hidden.
function _resolveIntuitionResponse(cortexIntuition, adversarialVerdict) {
  const av = adversarialVerdict?.adversarial;
  if (av?.verdict === 'contradiction') {
    return {
      text: `${cortexIntuition.text} (Note: deeper analysis found a discrepancy — ${av.reasons.join('; ')}.)`,
      source: 'cortex.intuition+adversarial',
    };
  }
  if (av?.verdict === 'reconciled') {
    return {
      text: av.reconciled_hypothesis || cortexIntuition.text,
      source: 'cortex.intuition+mastermind.reconciled',
    };
  }
  return { text: cortexIntuition.text, source: 'cortex.intuition' };
}

// Runs both faculties server-side in one round trip and compares them,
// rather than making copilot fetch intuition and mastermind separately and
// reconcile them itself. Returns null on any failure — never a fabricated
// verdict, so the caller falls back to plain intuition text unchanged.
async function _queryCortexAdversarial(prompt, sessionId) {
  try {
    const r = await _fetch(`${CX_URL}/api/intelligence/adversarial`, {
      method: 'POST',
      body: { prompt, sessionId },
      timeout: 4000,
    });
    return r || null;
  } catch(_) { return null; }
}

async function _injectSessionHistory(session, contextText) {
  if (!session?.sessionId || session.exchanges > 1) return contextText;
  try {
    const mem = await _fetch(
      `${CX_URL}/api/memory?table=chat_log&n=8&sessionId=${encodeURIComponent(session.sessionId)}`,
      { timeout: 2000 }
    );
    const rows = mem?.rows || [];
    if (!rows.length) return contextText;
    const history = rows
      .slice(-5)
      .map(r => `  U: ${(r.prompt || '').slice(0, 80)}\n  A: ${(r.response || '').slice(0, 120)}`)
      .join('\n');
    return contextText + `\n\n=== SESSION HISTORY (last ${rows.length} exchanges) ===\n${history}`;
  } catch(_) { return contextText; }
}

// §BUILT 2026-07-13 — chunk_2 of docs/nexus-copilot-recall.spec: "copilot
// AUTOMATICALLY pulls relevant recall into context before answering —
// associative memory without the user asking." Deliberately distinct from
// _injectSessionHistory above, not a variant of it:
//   - session history = the last N messages of THIS session, by position,
//     only on the first exchange (continuity — "what did we just say").
//   - recall context = whatever's most RELEVANT to the CURRENT prompt,
//     across ALL past sessions, on EVERY exchange (association — "what do
//     we know about this topic, from whenever we discussed it").
// Built on top of the real §1.2-adjacent bugfix in cortex/boot.js's sibling
// route (POST /api/recall was silently dropping `query`) — checked that fix
// lands before building this, since this chunk would have silently
// inherited the same brokenness otherwise.
//
// Score threshold, not a fixed top-K alone — an irrelevant result with a
// low score is worse than no result; injecting it would poison the prompt
// exactly like this spec's own failure_modes_to_avoid warns against.
const RECALL_CONTEXT_SCORE_THRESHOLD = 0.3;
const RECALL_CONTEXT_TOP_K = 3;

// §PHASEMAP UM2 (docs/cortex-schema-registry-phasemap.spec) — query the
// user-model on EVERY prompt path, not just the tool-loop. buildUserContext()
// reads the confidence-weighted hypotheses (now schema-observed, UM1) so
// co-pilot knows the user and adjusts on every response. Injected like the other
// context layers (§8.6 same pattern as _injectRecallContext). Non-fatal: a
// user-model hiccup never breaks a response (§1.2).
// §PHASEMAP UM3 (docs/cortex-schema-registry-phasemap.spec) — richer capture.
// The model already supports channel/topic/preference/communication_style
// categories (observe), but the prompt paths only ever fed it intent strings.
// This extracts lightweight, real signals from a prompt — the channel used, the
// verbosity, an explicit correction — and feeds them as low-confidence
// observations that ACCRETE over time (§13.1 intent logged, §0.3 nothing lost).
// Low initial confidence (0.15 delta) so a single prompt nudges rather than
// asserts; repetition is what builds a real hypothesis. Non-fatal (§1.2).
function _captureUserSignals(prompt, channel) {
  try {
    const um = require('./lib/user-model');
    if (!um.observe || !prompt) return;
    // channel preference — which surface the user reaches for.
    if (channel && channel !== 'unknown') {
      um.observe(`uses the ${channel} channel`, 'channel', { via: 'signal-capture' }, 0.15);
    }
    // verbosity / communication style — a real, cheap signal from length.
    const words = prompt.trim().split(/\s+/).length;
    const style = words <= 6 ? 'terse prompts' : words >= 40 ? 'detailed prompts' : null;
    if (style) {
      um.observe(`writes ${style}`, 'communication_style', { via: 'signal-capture', words }, 0.15);
    }
    // explicit correction — the user pushing back is a high-value signal.
    if (/\b(no,|not what|that'?s wrong|incorrect|actually,|i said|try again)\b/i.test(prompt)) {
      um.observe('corrects co-pilot when it misunderstands', 'communication_style', { via: 'signal-capture' }, 0.2);
    }
  } catch (_) { /* capture is best-effort — never affects the response (§1.2) */ }
}

function _injectUserModel(contextText) {
  try {
    const um = require('./lib/user-model');
    const model = um.buildUserContext ? um.buildUserContext() : '';
    if (model && model.trim()) return `${model}\n\n${contextText}`;
  } catch (_) { /* user-model unavailable — respond without it */ }
  return contextText;
}

async function _injectRecallContext(prompt, contextText) {
  if (!prompt || prompt.length < 8) return contextText; // too short to search meaningfully
  try {
    const mem = await _fetch(`${CX_URL}/api/recall`, {
      method: 'POST',
      timeout: 2500,
      body: { intent: 'general', query: prompt },
    });
    // §FIXED 2026-07-13 — found by the relevant/irrelevant test this chunk's
    // own drift_gate requires, not assumed correct: a prompt with zero real
    // topical overlap ("explain quantum entanglement") was still surfacing
    // freshly-pushed, completely unrelated content, because recency alone
    // was enough to cross the score threshold. Fix: require an actual
    // topical signal (lexical, causal, or bep score > 0) in addition to the
    // threshold — recency can raise a genuinely relevant result's rank, but
    // can't manufacture relevance alone.
    const results = (mem?.results || [])
      .filter(r => (r.score || 0) >= RECALL_CONTEXT_SCORE_THRESHOLD)
      .filter(r => r.breakdown && ((r.breakdown.lexical || 0) > 0 || (r.breakdown.causal || 0) > 0 || (r.breakdown.bep || 0) > 0))
      .slice(0, RECALL_CONTEXT_TOP_K);
    if (!results.length) return contextText; // honest empty — nothing relevant enough, not a fabricated match
    const block = results
      .map(r => `  [score ${r.score.toFixed(2)}] ${(r.content || '').slice(0, 200)}`)
      .join('\n');
    return contextText + `\n\n=== RELEVANT PAST CONTEXT (${results.length} match${results.length===1?'':'es'}) ===\n${block}`;
  } catch (_) { return contextText; } // best-effort — never blocks a real answer over a recall lookup
}

// ── Dispatch to Ollama sovereign system ───────────────────────────────────────
async function _dispatchToOllama(prompt, context, opts = {}) {
  return _post(`${OL_URL}/api/jobs`, {
    prompt:      `SYSTEM CONTEXT:\n${context}\n\nUSER: ${prompt}\nNEXUS CO-PILOT: `,
    // §BUGFIX 2026-07-04: was hardcoded to 'mistral:7b' (ollama-bridge's
    // FALLBACK_MODEL) instead of leaving it unset so ollama-bridge's real
    // DEFAULT_MODEL (qwen2.5-coder:7b, what the CLI tells users to pull)
    // applies. See lifeline.js's matching fix for the full explanation.
    ...(opts.model ? { model: opts.model } : {}),
    intent:      opts.intent || 'ask',
    componentId: 'copilot.prompt',
    hookId:      'copilot.prompt.to-ollama',
    requestId:   opts.requestId,
    sessionId:   opts.sessionId,
    contractId:  'nexus-interaction-contract-v1::copilot',
    stream:      opts.stream || false,
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────
const _sessions = new Map();

function _getSession(sessionId, channel, prompt) {
  if (!sessionId) sessionId = crypto.randomUUID();
  if (!_sessions.has(sessionId)) {
    _sessions.set(sessionId, { sessionId, channel, exchanges: 0,
      startedAt: Date.now(), lastActive: Date.now(), lastPrompt: null });
  }
  const s = _sessions.get(sessionId);
  s.lastActive = Date.now();
  s.channel = channel || s.channel;
  // §2026-08-13 — recorded so GET /api/context/:sessionId can assemble a
  // snapshot for THIS session's actual intent rather than an empty one. Added
  // because the new route referenced a lastPrompt field that did not exist:
  // rather than read a field off a record that never had it (§1.1), the field
  // is made real at the one place every prompt path already passes through.
  if (typeof prompt === 'string' && prompt) s.lastPrompt = prompt;
  return s;
}

// ── Write to Cortex ───────────────────────────────────────────────────────────
async function _persist(table, row) {
  try { await _post(`${CX_URL}/api/memory/insert`, { table, row }); } catch(_) {}
}

// ── SSE broadcast ─────────────────────────────────────────────────────────────
const _sseClients = new Set();
function broadcast(type, payload) {
  const msg = `data: ${JSON.stringify({ type, payload, ts: Date.now() })}\n\n`;
  for (const c of _sseClients) { try { c.write(msg); } catch(_) { _sseClients.delete(c); } }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type':'application/json',
    'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'*',
    'Access-Control-Allow-Headers':'Content-Type,X-Session-Id' });
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  return new Promise((res,rej) => {
    let d=''; req.on('data',c=>d+=c);
    req.on('end',()=>{try{res(JSON.parse(d));}catch(_){res({});}});
    req.on('error',rej);
  });
}

// ── §P112: SSE streaming helpers ──────────────────────────────────────────────
function sseHeaders(res) {
  res.writeHead(200, {
    'Content-Type':                'text/event-stream',
    'Cache-Control':               'no-cache',
    'Connection':                  'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Session-Id',
    'X-Accel-Buffering':           'no',
  });
}

function sseSend(res, event, data) {
  try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch(_) {}
}

// Poll Ollama job and stream token chunks to SSE response
// §PHASEMAP P1 — headless job poll for the tool-loop (no SSE res coupling).
// runToolLoop needs a plain (jobRef) => { text, toolCalls } resolver; the
// streaming poll above is tied to an HTTP res. Same /api/jobs/:id status shape,
// no streaming side-effects. Carries tool_calls through if ollama returns them.
async function _pollOllamaJobHeadless(jobRef) {
  const jobId = jobRef?.jobId || jobRef;
  if (!jobId) return { text: '', toolCalls: null };
  const MAX_WAIT = 90;
  let lastText = '';
  for (let i = 0; i < MAX_WAIT; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const status = await _fetch(`${OL_URL}/api/jobs/${jobId}`, { timeout: 3000 });
      const job = status?.job;
      if (!job) continue;
      if (job.result && job.result.length > lastText.length) lastText = job.result;
      if (job.status === 'complete') {
        return { text: job.result || lastText, modelUsed: job.model || 'ollama',
          toolCalls: job.tool_calls || job.toolCalls || null };
      }
      if (job.status === 'failed') return { text: lastText, modelUsed: 'ollama', failed: true, toolCalls: null };
    } catch (_) {}
  }
  return { text: lastText, modelUsed: 'ollama', timedOut: true, toolCalls: null };
}

async function _streamOllamaJob(jobId, res, sessionId) {
  let lastText = '';
  const MAX_WAIT = 90; // seconds
  for (let i = 0; i < MAX_WAIT; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const status = await _fetch(`${OL_URL}/api/jobs/${jobId}`, { timeout: 3000 });
      const job = status?.job;
      if (!job) continue;

      // Stream any new text as a delta chunk
      if (job.result && job.result.length > lastText.length) {
        const delta = job.result.slice(lastText.length);
        lastText = job.result;
        sseSend(res, 'chunk', { delta, total: lastText.length });
      }

      if (job.status === 'complete') {
        return { text: job.result || lastText, modelUsed: job.model || 'ollama', done: true };
      }
      if (job.status === 'failed') {
        return { text: lastText, modelUsed: 'ollama', done: true, failed: true };
      }
    } catch(_) {}
  }
  return { text: lastText, modelUsed: 'ollama', done: true, timedOut: true };
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;
  const p      = url.pathname;

  if (method === 'OPTIONS') { json(res, 200, {}); return; }

  // SSE — event stream for UI
  if (p === '/events') {
    res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache',
      'Connection':'keep-alive', 'Access-Control-Allow-Origin':'*' });
    res.write(`data: ${JSON.stringify({ type:'copilot.connected', streamDepth: _stream.length })}\n\n`);
    _sseClients.add(res);
    req.on('close', () => _sseClients.delete(res));
    return;
  }

  if (p === '/contract') { json(res, 200, require('./registry-components')); return; }

  if (p === '/health') {
    json(res, 200, { ok:true, system:SYSTEM_ID, version:VERSION, port:PORT,
      streamDepth: _stream.length, sessions: _sessions.size,
      phases: { p73:'wired', p103:'wired', p110:'wired', p112:'wired' }, ts:Date.now() });
    return;
  }

  if (method === 'GET' && p === '/api/stream') {
    const n = parseInt(url.searchParams.get('n') || '50');
    json(res, 200, { ok:true, events: _stream.slice(-n), total: _stream.length });
    return;
  }

  // §GAP CLOSED 2026-07-07 — copilot's hook registry has declared
  // /api/axioms, /api/axioms/add and /api/axioms/remove as active since
  // it was written, while copilot/axiom-manager.js sat real, complete,
  // and unwired — zero references to "axioms" existed anywhere in this
  // file. Found by scripts/verify-wires.js, confirmed by hand. These
  // three routes were copilot's ONLY remaining gap against its own
  // registry (all 12 other checkable hooks verified real).
  if (method === 'GET' && p === '/api/axioms') {
    try {
      const am = require('./axiom-manager.js');
      const tier   = url.searchParams.get('tier')   || undefined;
      const status = url.searchParams.get('status') || undefined;
      const axioms = am.list({ tier, status });
      json(res, 200, { ok: true, count: axioms.length, axioms });
    } catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  if (method === 'POST' && p === '/api/axioms/add') {
    try {
      const am = require('./axiom-manager.js');
      const body = await readBody(req);
      if (!body.id || !body.text) { json(res, 400, { ok:false, error:'id and text required' }); return; }
      const result = am.add(body.id, body.text, { reason: body.reason, source: body.source || 'copilot-api', tier: body.tier || 'RUNTIME' });
      json(res, 200, { ok: true, axiom: result });
    } catch (e) {
      // axiom-manager throws real errors (duplicate id, immutable tier) —
      // surface them, never swallow into a false success.
      json(res, 400, { ok: false, error: e.message });
    }
    return;
  }

  if (method === 'POST' && p === '/api/axioms/remove') {
    try {
      const am = require('./axiom-manager.js');
      const body = await readBody(req);
      if (!body.id) { json(res, 400, { ok:false, error:'id required' }); return; }
      // confirm defaults false — axiom-manager's own guard refuses an
      // unconfirmed removal. Not overridden here: a destructive call
      // should require an explicit confirm from the caller, not a default.
      const result = am.remove(body.id, { confirm: body.confirm === true });
      json(res, 200, { ok: true, removed: result });
    } catch (e) { json(res, 400, { ok: false, error: e.message }); }
    return;
  }

  if (method === 'GET' && p === '/api/sessions') {
    json(res, 200, { ok:true, sessions: [..._sessions.values()] });
    return;
  }

  // §BUILT 2026-08-13 — both of these were declared in copilot.spec and had no
  // handler: only the exact '/api/sessions' above was ever matched, so every
  // consumer of the contract believed in two routes that did not exist. The
  // work underneath them was already real — _sessions is live, and
  // copilot/lib/copilot-context.js assembles all 7 layers and is already
  // called on the prompt path (see §P73 below) — there was simply no way to
  // LOOK at either. These expose what already runs; they compute nothing new.
  if (method === 'GET' && p.startsWith('/api/sessions/')) {
    const sessionId = decodeURIComponent(p.slice('/api/sessions/'.length));
    const session = _sessions.get(sessionId);
    // §1.2 — an unknown session is a real 404, not an empty object that would
    // read as "a session with no activity".
    if (!session) {
      json(res, 404, { ok:false, error:`no session "${sessionId}"`, known: [..._sessions.keys()] });
      return;
    }
    // Recent exchanges come from cortex chat_log, as the spec described.
    // §CORRECTED 2026-08-13 — first written against the LOCAL jaaDB, which
    // returned [] every time: copilot does not write chat_log locally, it
    // persists over HTTP to cortex via _persist(). Read it the same way
    // _injectSessionHistory() already does, so this route and copilot's own
    // session continuity agree about where history lives (§16.5).
    //
    // Note chat_log has TWO writers with different shapes: copilot's rows
    // carry { sessionId, prompt, response }, while lib/chat-logger.js writes
    // { sessionId: <its own logger session>, role, content }. Only copilot's
    // rows can match a copilot sessionId, which is why no shape translation
    // is attempted here — rows that don't match simply aren't this session's.
    let exchanges = [];
    try {
      const mem = await _fetch(
        `${CX_URL}/api/memory?table=chat_log&n=200&sessionId=${encodeURIComponent(sessionId)}`,
        { timeout: 2000 }
      );
      exchanges = (mem?.rows || []).slice(-25);
    } catch (e) {
      // §1.2 — report the failure. An empty array here would be
      // indistinguishable from a session that genuinely said nothing.
      json(res, 200, { ok:true, session, exchanges: null, exchangesError: `cortex unreachable: ${e.message}` });
      return;
    }
    json(res, 200, { ok:true, session, exchanges, exchangeCount: exchanges.length });
    return;
  }


  if (method === 'GET' && p.startsWith('/api/context/')) {
    const sessionId = decodeURIComponent(p.slice('/api/context/'.length));
    const cc = _getCopilotContext();
    if (!cc) { json(res, 503, { ok:false, error:'copilot-context module not loadable' }); return; }
    try {
      const session = _sessions.get(sessionId) || null;
      const snap = await cc.assemble({ eventBuffer: _stream, intent: (session && session.lastPrompt) || '' });
      json(res, 200, {
        ok: true, sessionId,
        sessionKnown: !!session,   // honest: a snapshot for an unknown session
                                   // is still a real system snapshot, but the
                                   // caller must know it isn't session-specific
        layerCount: Object.keys(snap.layers).length,
        tokensUsed: snap.tokensUsed,
        layers: snap.layers,
        text: snap.text,
      });
    } catch (e) { json(res, 500, { ok:false, error:e.message }); }
    return;
  }

  if (method === 'POST' && p === '/api/diagnose') {
    const body = await readBody(req);
    const result = await _rDiagnose.start(body.topic || 'system health', { requestId: body.requestId });
    json(res, 200, result);
    return;
  }

  if (method === 'GET' && p === '/api/diagnose/list') {
    json(res, 200, { ok:true, sessions: _rDiagnose.list() });
    return;
  }

  if (method === 'GET' && p === '/api/lifeline/health') {
    const h = await _lifeline.health();
    json(res, 200, { ok:true, ...h });
    return;
  }

  // §NEW 2026-07-11 — copilot only ever PULLED events (subscribing out to
  // Guardian/Cortex SSE streams via _connectGuardianStream/
  // _connectCortexStream). No system without its own SSE server could
  // ever push an event into copilot's stream/bus — which is exactly
  // Emerge's situation (a compiler library, not a service, confirmed:
  // no http.createServer anywhere under emerge/). Rather than build a
  // whole SSE server just for Emerge's consumer to report
  // accept/complete/fail, this is the general missing counterpart: any
  // system can POST a well-formed event here and it reaches the same
  // streamIngest() pull-based events already do — same ring buffer, same
  // expectation-watcher, same /sse broadcast.
  if (method === 'POST' && p === '/api/event') {
    const body = await readBody(req);
    if (!body?.type) { json(res, 400, { ok:false, error:'event.type required' }); return; }
    streamIngest({ ...body, ts: body.ts || Date.now() });
    json(res, 200, { ok: true });
    return;
  }

  if (method === 'POST' && p === '/api/build') {
    const body      = await readBody(req);
    const sessionId = body.sessionId || req.headers['x-session-id'];
    if (!body.description) { json(res, 400, { ok:false, error:'description required' }); return; }
    broadcast('copilot.build.started', { description: body.description.slice(0,100) });
    _modBuilder.build(body.description, { requestId: body.requestId, sessionId, skipGaps: body.skipGaps })
      .then(result => {
        broadcast('copilot.build.complete', { ok: result.ok, passed: result.passed });
        // §NEW 2026-07-11 — the real trigger for the
        // 'module-build-dispatched-then-accepted' expectation (see
        // expectation-watcher.js's own comment on it). module-builder.js's
        // build() only calls cq.dispatch() — which just writes a file —
        // when result.passed is true; this is that dispatch, now made
        // observable to the expectation watcher instead of invisible to
        // everything except the filesystem. If Emerge ever gets a real
        // consumer that calls cq.accept()/cq.complete() and emits a
        // matching event, this expectation is exactly what will confirm
        // it actually closed the loop — until then, it's the thing that
        // keeps saying, correctly, that it hasn't.
        if (result.passed && result.contract) {
          try {
            _copilotBus.emit('emerge.contract.dispatched', {
              type: 'emerge.contract.dispatched',
              payload: { contractUuid: result.contract, moduleName: result.plan?.name, requestId: result.requestId },
              ts: Date.now(),
            });
            _copilotBus.emit('*', {
              type: 'emerge.contract.dispatched',
              payload: { contractUuid: result.contract, moduleName: result.plan?.name, requestId: result.requestId },
              ts: Date.now(),
            });
          } catch (e) { console.warn('[copilot] failed to emit emerge.contract.dispatched:', e.message); }
        }
        json(res, 200, result);
      })
      .catch(e => json(res, 500, { ok:false, error: e.message }));
    return;
  }

  // ── §P112: POST /api/prompt/stream — SSE streaming response ─────────────────
  if (method === 'POST' && p === '/api/prompt/stream') {
    const body      = await readBody(req);
    const prompt    = body.prompt || '';
    const channel   = body.channel || 'unknown';
    const sessionId = body.sessionId || req.headers['x-session-id'] || crypto.randomUUID();
    const requestId = crypto.randomUUID();
    let requestGrammar = null;   // §P5 — what the grammar engine resolved this prompt to (if anything)
    const session   = _getSession(sessionId, channel, prompt);
    session.exchanges++;

    if (!prompt) { json(res, 400, { ok:false, error:'prompt required' }); return; }

    sseHeaders(res);
    sseSend(res, 'start', { requestId, sessionId });

    // Fast path — intuition (no model needed)
    const intuition = await _intuition.answer(prompt, session, _stream);
    if (intuition?.text) {
      sseSend(res, 'chunk', { delta: intuition.text, total: intuition.text.length });
      sseSend(res, 'done', { requestId, sessionId, modelUsed: intuition.modelUsed,
        intent: intuition.intent, source: intuition.source });
      res.end();
      await _persist('chat_log', { uuid: crypto.randomUUID(), requestId, sessionId,
        prompt: prompt.slice(0,500), response: intuition.text, modelUsed: intuition.modelUsed,
        intent: intuition.intent, channel, componentId:'copilot.prompt', hookId:'copilot.prompt.reply',
        contextLayers: 1, fromStream: true, ts: Date.now() });
      return;
    }

    // §P73: 7-layer context assembly via copilot-context
    let contextText = '';
    const cc = _getCopilotContext();
    if (cc) {
      try {
        const snap = await cc.assemble({ eventBuffer: _stream, intent: prompt });
        contextText = snap.text;
        sseSend(res, 'context', { layers: Object.keys(snap.layers).length, tokens: snap.tokensUsed });
      } catch(e) {
        contextText = await _analysis.assembleContext(prompt, _stream, session);
      }
    } else {
      contextText = await _analysis.assembleContext(prompt, _stream, session);
    }

    // §P103: inject session history on first exchange
    contextText = _injectUserModel(contextText);   // §UM2 — know the user on every path
    _captureUserSignals(prompt, channel);   // §UM3 — richer capture
    contextText = await _injectSessionHistory(session, contextText);
    // §BUILT 2026-07-13 — chunk_2: associative recall, every exchange (not
    // just session-start), best-effort, never blocks.
    contextText = await _injectRecallContext(prompt, contextText);

    // §ADDED 2026-07-07 — persona support. A `persona` param (defaults to
    // 'default') selects a real personality profile (cortex/personas.js)
    // whose systemPrompt prepends the assembled context, shaping tone,
    // tool bias, and default intent. Never fails the request — an unknown
    // persona name falls back to the built-in default inside get().
    // §SOVEREIGNTY 2026-07-09 — this used to
    // require('../cortex/personas.js') + require('../cortex/memory/jaa-db.js'),
    // reaching straight into another sovereign system's filesystem. I wrote
    // that; it was hardwiring. Copilot now asks cortex over its API through
    // lib/nexus-client, which resolves 'cortex' from config. Cortex is
    // swappable again, and copilot no longer opens cortex's database.
    try {
      const nx = require('../lib/nexus-client');
      const r = await nx.get('cortex', `/api/personas?name=${encodeURIComponent(body.persona || 'default')}`, { timeout: 2500 });
      const persona = r?.persona;
      if (persona?.systemPrompt) {
        contextText = `${persona.systemPrompt}\n\n${contextText}`;
      }
    } catch (_) { /* personas optional — never block a real answer over profile lookup */ }

    // §P110: query Cortex MASTERMIND for causal context before model call
    const mastermind = await _queryCortexMastermind(prompt, contextText.slice(0, 500), sessionId);
    if (mastermind?.analysis) {
      contextText += `\n\n=== CORTEX MASTERMIND ===\n${mastermind.analysis.slice(0, 400)}`;
    }

    // Dispatch to Ollama with stream flag
    try {
      const ollamaResult = await _dispatchToOllama(prompt, contextText, {
        intent: 'ask', requestId, sessionId, stream: true });

      if (ollamaResult?.jobId) {
        const result = await _streamOllamaJob(ollamaResult.jobId, res, sessionId);
        sseSend(res, 'done', { requestId, sessionId, modelUsed: result.modelUsed,
          contextLayers: 7, timedOut: result.timedOut || false });
        res.end();
        await _persist('chat_log', { uuid: crypto.randomUUID(), requestId, sessionId,
          prompt: prompt.slice(0,500), response: result.text.slice(0,2000),
          modelUsed: result.modelUsed, intent: 'ask', channel,
          componentId:'copilot.prompt', hookId:'copilot.prompt.reply',
          contextLayers: 7, fromStream: true, ts: Date.now() });
      } else {
        sseSend(res, 'error', { error: 'Ollama job dispatch failed' });
        res.end();
      }
    } catch(e) {
      sseSend(res, 'error', { error: e.message });
      res.end();
    }
    return;
  }

  // ── §15.1-15.3: POST /api/prompt/fulfill — adaptive iteration ─────────────
  // Built 2026-06-29 against AXIOMS-v3.0.md Group 15. Routes through RAID,
  // classifies failures via the fault taxonomy, scores via reflection,
  // re-routes away from what just failed, learns across requests (RAID's
  // _weights persists between calls). dispatchFn here only knows how to
  // reach ollama — claude/chatgpt via Guardian's NCP is not wired. That
  // boundary is real and stated in the response, not papered over (§1.1).
  if (method === 'POST' && p === '/api/prompt/fulfill') {
    const body      = await readBody(req);
    const prompt    = body.prompt || '';
    const requestId = crypto.randomUUID();
    const events    = [];

    const dispatchFn = async (agent, promptText, ctx) => {
      if (agent === 'ollama') {
        const r = await _dispatchToOllama(promptText, '', { requestId, intent: 'ask' });
        if (!r?.ok) return { ok: false, error: r?.error || 'ollama dispatch failed', errorType: 'ollama_dispatch_failed' };
        const ollamaText = extractDispatchText(r);
        return { ok: true, output: ollamaText ?? `[unstructured ollama response — keys: ${Object.keys(r).join(', ')}]` };
      }
      if (agent === 'claude' || agent === 'chatgpt') {
        const provCheck = await _fetch(`${GD_URL}/providers`, { method: 'GET', timeout: 3000 }).catch(() => null);
        const connected = provCheck?.providers?.[agent]?.connected ?? provCheck?.[agent]?.connected;

        // §Phase-120 2026-06-29 — dual-sided handoff event. One row carrying
        // both sides' variables at the moment of crossing, not two separately-
        // correlated logs. traceToRoot() on a downstream failure now walks a
        // chain where every handoff link shows what RAID assumed vs what
        // guardian actually had — that gap is where bugs live.
        const handoffEvent = {
          type:    'handoff.copilot_to_guardian',
          causedBy: null, // wired by _emitUIEvent's lastEventId chain if called from UI
          from: {
            agent,
            cfrSigmaFloor: ctx?.cfrSigmaFloor ?? 0,
            cfrRegime:     ctx?.cfrRegime     ?? 'stable',
            requestId,
          },
          to: {
            connected:     !!connected,
            providerShape: provCheck ? (provCheck.providers ? 'nested' : 'flat') : 'unreachable',
          },
          ts: Date.now(),
        };
        _fetch(`${GD_URL}/api/guardian/cfr/event`, {
          method: 'POST', body: handoffEvent, timeout: 1000,
        }).catch(() => {}); // fire-and-forget, never block dispatch on telemetry

        if (!connected) {
          return { ok: false, error: `guardian reports '${agent}' not connected via NCP — handshake failed before dispatch`, errorType: 'ncp_not_connected' };
        }
        const dispatchRes = await _post(`${GD_URL}/command`, { provider: agent, prompt: promptText, source: 'copilot.fulfill' }, 10000).catch(e => ({ ok: false, error: e.message }));
        if (!dispatchRes?.ok) return { ok: false, error: dispatchRes?.error || 'guardian dispatch failed', errorType: 'guardian_dispatch_failed' };
        // §BUG FIXED 2026-07-11 — "the co-pilot in the tv-ui is showing json
        // strings." Root cause: `dispatchRes.result || dispatchRes.text ||
        // JSON.stringify(dispatchRes)` picks whichever is truthy first —
        // when guardian's /command returns `result` as an OBJECT (e.g.
        // `{text: "...", modelUsed: "..."}`) rather than a plain string,
        // that object wins the `||` chain and becomes `output` directly,
        // never reaching the JSON.stringify fallback. Every UI consumer
        // downstream (conversations.html, menu.js's CLI, spotlight) treats
        // `output`/`response` as a string — .slice(), template-literal
        // interpolation, textContent assignment. A few of those coerce an
        // object into "[object Object]"; others explicitly fall back to
        // JSON.stringify(x) when `.text` is missing, which is exactly
        // where the visible raw JSON came from. Fixed at the source
        // instead of chasing every consumer: extract the real text here,
        // once, so `output` is a guaranteed string no matter what shape
        // guardian's response takes.
        const resultText = extractDispatchText(dispatchRes);
        if (resultText === null) {
          // No plain-text field found anywhere in the response — this IS
          // worth surfacing as JSON (something is genuinely unstructured),
          // but tagged so it's diagnosable as a fallback, not mistaken for
          // a normal response.
          console.warn(`[copilot] guardian /command response had no string .result/.result.text/.text field — ${JSON.stringify(Object.keys(dispatchRes))}`);
        }
        return { ok: true, output: resultText ?? `[unstructured guardian response — keys: ${Object.keys(dispatchRes).join(', ')}]` };
      }
      return { ok: false, error: `agent '${agent}' has no dispatch path wired in this endpoint yet`, errorType: 'dispatch_not_wired' };
    };

    const { fulfill } = require('./adaptive-fulfillment');
    const outcome = await fulfill(prompt, dispatchFn, {
      maxAttempts: body.maxAttempts || 3,
      context: { cfrSigmaFloor: 0, cfrRegime: 'stable' },
      onAttempt: (rec) => {
        events.push(rec);
        broadcast('copilot.fulfillment.attempt', rec);
      },
    });

    // §WIRED 2026-08-12 (P2 of docs/copilot-full-capability-phasemap.spec) —
    // capability-extend.js is the TRUE last resort, only after fulfill()'s
    // own iteration budget is genuinely exhausted (outcome.ok === false),
    // never on a single attempt failing. shouldExtend() is not used here —
    // outcome.ok already IS that same "nothing worked" signal, one level up
    // (adaptive-fulfillment tried every agent RAID would route to; this is
    // the point past that, not a duplicate check). Never blocks or throws
    // over the response — best-effort, same as every other optional wire.
    if (!outcome.ok) {
      try {
        const { extendCapability } = require('./capability-extend');
        const ext = await extendCapability(prompt, { source: 'copilot.adaptive-fulfillment', reason: outcome.reason, requestId });
        outcome.capabilityGap = ext;
      } catch (e) { console.warn('[copilot] capability-extend not filed:', e.message); }
    }

    json(res, outcome.ok ? 200 : 502, { ...outcome, requestId, events });
    return;
  }

  // ── POST /bridge/deliver — Bridge :9999 routes requests here ────────────────
  // §2026-07-04: tv-shell and Clear Glass both go through Bridge → /bridge/deliver
  // Bridge sends: { request: { uuid, payload: { prompt, channel, sessionId, ... } } }
  if (method === 'POST' && p === '/bridge/deliver') {
    const body      = await readBody(req);
    const payload   = body.request?.payload || body.payload || body;
    const prompt    = payload.prompt || '';
    const channel   = payload.channel || 'bridge';
    const sessionId = payload.sessionId || req.headers['x-bridge-source'] || _newId();
    const requestId = body.request?.uuid || crypto.randomUUID();
    const session   = _getSession(sessionId, channel, prompt);
    session.exchanges++;

    if (!prompt) {
      json(res, 400, { ok:false, error:'payload.prompt required' });
      return;
    }

    broadcast('copilot.prompt.received', { prompt: prompt.slice(0,100), channel, sessionId, via: 'bridge' });

    // Full context assembly — same path as /api/prompt
    let contextText = '';
    try { contextText = await _analysis.assembleContext(prompt, _stream, session); } catch(_) {}
    contextText = _injectUserModel(contextText);   // §UM2 — know the user on every path
    _captureUserSignals(prompt, channel);   // §UM3 — richer capture
    contextText = await _injectSessionHistory(session, contextText);
    // §BUILT 2026-07-13 — chunk_2: associative recall, every exchange (not
    // just session-start), best-effort, never blocks.
    contextText = await _injectRecallContext(prompt, contextText);

    const mastermind = await _queryCortexMastermind(prompt, contextText.slice(0,500), sessionId);
    if (mastermind?.analysis) contextText += `\n\n=== CORTEX MASTERMIND ===\n${mastermind.analysis.slice(0,400)}`;

    // §PHASEMAP CA1 — if the user asks how the system/co-pilot is doing, answer
    // with a REAL status poll (health + gaps + loom wiring) instead of routing to
    // the LLM, which produced the canned "I don't have enough context" reply.
    try {
      const _status = require('./system-status');
      if (_status.isStatusQuery(prompt)) {
        // OB1 — a DEEP diagnostic query ("how is nexus doing", "diagnostics",
        // "what's wrong") gets the full live report; a light "how are you" gets
        // the status line.
        const wantsDeep = /\b(diagnostic|diagnose|what('?s| is) wrong|how is nexus (doing|running)|full status|deep|health check)\b/i.test(prompt);
        if (wantsDeep) {
          const rep = await require('./diagnostics').diagnoseText();
          return json(res, 200, { text: rep.text, model_used: 'nexus-diagnostics', confidence: 1, escalated: false, report: rep.report, requestId });
        }
        const rep = await _status.statusReport();
        return json(res, 200, { text: rep.text, model_used: 'nexus-status', confidence: 1, escalated: false, status: rep.status, requestId });
      }
    } catch (_) { /* status/diagnostic poll unavailable — fall through to the normal path */ }

    // §P5 DYNAMIC GRAMMAR — resolve the prompt through the registry grammar trie
    // FIRST. This understands ALL capabilities (and future ones) via loom's
    // registry, not hand-written regex. High-confidence → we know the exact
    // capability the user means (surfaced for routing/telemetry); low-confidence
    // → fall through to the specific intercepts + LLM below. §1.2 never blocks.
    try {
      const gr = require('./lib/grammar-router');
      const resolved = await gr.route(prompt, {});
      if (resolved && resolved.routed) {
        // Record what the grammar understood; the specific handlers below still
        // produce the answer. This makes co-pilot's understanding legible and is
        // the hook where a future turn dispatches directly to the capability.
        requestGrammar = resolved;
      }
    } catch (_) { /* grammar unavailable — fall through, never block */ }

    // §CONTAINER PANELS — structured queries the tablet's config/user_model/
    // controls panels consume via this same endpoint (decoupling law: the tablet
    // talks to co-pilot, never the modules directly). Non-fatal; fall through.
    try {
      // §P5 who-am-I / §P6 switch-agent — wired from the existing reflection +
      // constitutional-ai + agent-router modules via copilot/lib/self-model.
      if (/\b(who am i|what('?s| is) my name|what do you know about me|who do you think i am)\b/i.test(prompt)) {
        const sm = require('./lib/self-model');
        const who = sm.whoAmI({});
        return json(res, 200, { text: who.text, model_used: 'nexus-identity', confidence: who.known ? 0.8 : 0.3, escalated: false, hypotheses: who.hypotheses, requestId });
      }
      // §BUGFIX 2026-08-14 — found live: "switch agent to claude" (a
      // completely natural phrasing, confirmed the literal trigger for
      // this bug) never matched. The old pattern only recognized "switch
      // to X", "use X", "route to X" — the word "agent"/"model" landing
      // BEFORE "to"/the target broke the match entirely (verified with a
      // direct regex test: 'switch agent to claude'.match(oldPattern) ===
      // null). The message fell through untouched to normal intent
      // classification, which routed it to chatgpt as 'general' intent —
      // exactly what the screenshot showed ("via chatgpt (bridge)",
      // dispatch failed). Now matches BOTH orders: "switch [agent/model]
      // to X" and "switch to X [agent/model]".
      // §BUGFIX 2026-08-14, ROUND 3 — caught mid-flight, again, before
      // shipping: "switch co-pilot to claude" (no URL, no literal
      // "agent"/"model" word anywhere) matched the regex fine but still
      // failed to trigger, because the OLD gate required the word
      // "agent"/"model" to appear SOMEWHERE in the sentence — a
      // requirement that predates this fix and was never actually
      // necessary once the target itself is checked. Replaced with a
      // real three-way gate: trigger when the captured target is a KNOWN
      // agent name (claude/chatgpt/gemini/perplexity/clearglass) OR the
      // sentence says agent/model explicitly (the old safety net,
      // preserved for the \w+ catch-all case) OR a URL is present.
      // Tested against 10 real should-match and 4 real should-NOT-match
      // phrasings before landing this, not just the happy path.
      const urlM = prompt.match(/https?:\/\/[^\s]+/i);
      const switchM = prompt.match(/\b(?:switch\s+(?:\S+\s+)?to|use|route to)\s+(claude|chatgpt|gemini|perplexity|clear[- ]?glass|\w+)\s*(agent|model)?\b/i);
      const KNOWN_AGENTS = ['claude', 'chatgpt', 'gemini', 'perplexity', 'clear glass', 'clear-glass', 'clearglass'];
      const switchTarget = switchM ? switchM[1].toLowerCase() : null;
      const switchIsReal = switchM && (KNOWN_AGENTS.includes(switchTarget) || /\b(agent|model)\b/i.test(prompt) || !!urlM);
      if (switchIsReal) {
        const sm = require('./lib/self-model');
        const r = sm.switchAgent({ intent: 'directed', directed: switchTarget, prompt });
        // §BUILT 2026-08-14 — real request: "switch agent tool needs to use
        // NCP like: job created -> dispatched via NCP -> job.dispatched
        // ack." switchAgent() alone was a pure local decision, never
        // confirming the target's NCP channel was actually alive — a
        // disconnected/crashed/never-opened tab would "succeed" here and
        // then silently fail on the first real prompt. verifyAgentReachable
        // does a real, cheap round trip (checked: polls the NEW 'acked'
        // status, not 'complete' — doesn't wait for or pay for a full AI
        // generation just to confirm the tab is there).
        const reach = r.ok ? await sm.verifyAgentReachable(r.agent) : null;
        if (r.ok && urlM) {
          const nav = await sm.navigateAgentToUrl(r.agent, urlM[0]);
          const reachNote = reach && !reach.reachable ? ` (heads up: ${r.agent}'s tab didn't ack within the timeout — ${reach.error})` : '';
          const text = nav.ok
            ? (nav.needsSignIn
                ? `Routing to ${JSON.stringify(r.agent)} and opened ${urlM[0]}. ${nav.signInPrompt}${reachNote}`
                : `Routing to ${JSON.stringify(r.agent)} and opened ${urlM[0]}.${reachNote}`)
            : `Routing to ${JSON.stringify(r.agent)}, but couldn't open that URL: ${nav.error}${reachNote}`;
          return json(res, 200, { text, model_used: 'nexus-agent-router', confidence: 1, escalated: false, detail: { ...r, navigate: nav, reachability: reach }, requestId });
        }
        const reachNote = reach && !reach.reachable ? ` Heads up: ${r.agent}'s tab didn't ack within the timeout — ${reach.error} — the switch is set, but that agent may not actually be reachable right now.` : '';
        return json(res, 200, { text: r.ok ? `Routing to ${JSON.stringify(r.agent)}.${reachNote}` : `Could not switch: ${r.reason}`, model_used: 'nexus-agent-router', confidence: 1, escalated: false, detail: { ...r, reachability: reach }, requestId });
      }
      // §BUILT 2026-08-14 — real request: "create compartment command".
      // Checked first: no trigger existed at all (grepped copilot/server.js
      // directly), the message fell through to ollama and got refused —
      // same class of gap as switch-agent above, a real backend
      // (cos-compartment.js's create action, real, tested this session)
      // with zero conversational trigger pointing at it.
      const compartM = prompt.match(/\b(?:create|make|start|new)\s+(?:a\s+)?compartment\b(?:\s+(?:named|called)\s+["']?([\w-]+)["']?)?/i);
      if (compartM) {
        const cosCompartment = require('../lib/agent-tools/tools/sandbox/cos-compartment.js');
        const name = compartM[1] || `compartment-${Date.now()}`;
        const r = await cosCompartment.execute({ action: 'create', name, purpose: prompt });
        const text = r.ok
          ? `Created compartment "${name}". Want axioms and an end-state for it, or should I leave it open-ended for now?`
          : `Couldn't create that compartment: ${r.error || 'unknown error'}`;
        return json(res, 200, { text, model_used: 'nexus-compartment', confidence: 1, escalated: false, detail: r, requestId });
      }
      // §ADDED 2026-08-13 — James: "co-pilot should be like a hat, not a
      // static identity" + "how do I change the agent for co-pilot?" — the
      // feature existed (copilot_identity's setAgent/getAgent, wired into
      // lifeline.js's route()) but had no guaranteed plain-chat trigger,
      // only tool-loop invocation, which depends on the model choosing to
      // call it. Distinct phrasing from switchM above on purpose (that one
      // already claims "switch to/use/route to X agent" for a ONE-OFF
      // route) — "always use", "default to", "wear the X hat" mean the
      // PERSISTENT hat, every future message, until changed again.
      // ── §2026-08-13 — MAKE A HAT FROM CHAT ────────────────────────────
      // hat_forge exists as a tool, but reaching it depends on the model
      // choosing to call it, which is not guaranteed from plain chat the way
      // "switch to X" is. These are real regex handlers on the same
      // guaranteed path as the wear/take-off ones below.
      //
      // Grammar (every clause after the name is optional):
      //   make a hat called the_auditor
      //   make a hat called the_auditor using claude
      //   create a hat named x using claude with tools loom_scan, read_file
      //   forge a hat called x using claude that audits every claim it is given
      const mkHat = prompt.match(/\b(?:make|create|forge|build)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:new\s+)?hat\s+(?:called|named)\s+([A-Za-z][A-Za-z0-9_]{2,48})\b([\s\S]*)$/i);
      if (mkHat) {
        const hatForge = require('../lib/hat-forge');
        const agentTools = require('../lib/agent-tools');
        const name = mkHat[1].toLowerCase();
        const rest = mkHat[2] || '';

        // Each clause is pulled independently rather than with one big
        // ordered regex, so clause ORDER doesn't silently change the result.
        const baseM  = rest.match(/\b(?:using|based on|from|on|with)\s+(claude|chatgpt|gemini|ollama|mistral|perplexity)\b/i);
        const toolsM = rest.match(/\bwith\s+tools?\s+([A-Za-z0-9_,\s]+?)(?=\s+that\b|\s*$)/i);
        const persM  = rest.match(/\bthat\s+([\s\S]+)$/i);

        const def = { name, baseAgent: baseM ? baseM[1].toLowerCase() : 'claude' };
        if (toolsM) {
          def.toolScope = toolsM[1].split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
        }
        if (persM) def.personaPrompt = persM[1].trim();

        // §1.1 — a scope naming a tool that isn't registered is refused with
        // the real list, not accepted into a hat that would silently do less
        // than it claims.
        if (def.toolScope) {
          const unknown = def.toolScope.filter(t => !agentTools.TOOLS.has(t));
          if (unknown.length) {
            return json(res, 200, {
              text: `Can't forge "${name}" — these aren't real tools: ${unknown.join(', ')}.\n\n` +
                    `Registered tools (${agentTools.TOOLS.size}): ${[...agentTools.TOOLS.keys()].sort().join(', ')}`,
              model_used: 'nexus-hat-forge', confidence: 1, escalated: false, requestId,
            });
          }
        }

        const r = hatForge.forge(def);
        if (!r || !r.ok) {
          return json(res, 200, {
            text: `Couldn't forge "${name}":\n  ${((r && r.errors) || ['unknown error']).join('\n  ')}`,
            model_used: 'nexus-hat-forge', confidence: 1, escalated: false, detail: r, requestId,
          });
        }
        const scopeTxt = def.toolScope ? `${def.toolScope.length} scoped tools (${def.toolScope.join(', ')})` : `all ${agentTools.TOOLS.size} tools`;
        return json(res, 200, {
          text: `Forged "${name}" — base agent ${def.baseAgent}, ${scopeTxt}` +
                `${def.personaPrompt ? `, persona set` : ''}.\n` +
                `Wear it with: "wear the ${name} hat".`,
          model_used: 'nexus-hat-forge', confidence: 1, escalated: false, detail: r.hat, requestId,
        });
      }

      if (/\b(list (the )?hats|what hats( do you have| are there| exist)?|show (me )?(the )?hats|which hats)\b/i.test(prompt)) {
        const hats = require('../lib/hat-forge').list() || [];
        const txt = hats.length
          ? hats.map(h => `  ${h.name} — ${h.baseAgent}, ${h.toolScope ? h.toolScope.length + ' tools' : 'all tools'}${h.personaPrompt ? ', persona' : ''}`).join('\n')
          : '  (none forged yet — "make a hat called x using claude")';
        return json(res, 200, { text: `Forged hats:\n${txt}`, model_used: 'nexus-hat-forge', confidence: 1, escalated: false, detail: hats, requestId });
      }

      const rmHat = prompt.match(/\b(?:revoke|delete|remove|destroy)\s+(?:the\s+)?([A-Za-z][A-Za-z0-9_]{2,48})\s+hat\b/i)
        || prompt.match(/\b(?:revoke|delete|remove|destroy)\s+(?:the\s+)?hat\s+(?:called|named)\s+([A-Za-z][A-Za-z0-9_]{2,48})\b/i);
      if (rmHat) {
        const nm = rmHat[1].toLowerCase();
        const r = require('../lib/hat-forge').revoke(nm);
        return json(res, 200, { text: r && r.ok ? `Revoked the ${nm} hat.` : `Couldn't revoke "${nm}": ${(r && r.reason) || 'unknown'}`, model_used: 'nexus-hat-forge', confidence: 1, escalated: false, detail: r, requestId });
      }

      // §2026-08-13 — this used to match ONLY the six base agent names, so a
      // forged hat could never be worn from chat even though setCurrentAgent
      // has accepted forged names since P8 (self-model.js:183). The mechanism
      // was there; the only guaranteed path to it wasn't. The candidate name
      // is checked against the real forged-hat store before being accepted,
      // so this stays a closed set and can't swallow arbitrary text.
      const BASE_AGENTS = /claude|chatgpt|gemini|ollama|mistral|perplexity/i;
      let hatM = prompt.match(/\b(always use|default to|wear the)\s+([A-Za-z][A-Za-z0-9_]{2,48})\b/i)
        || prompt.match(/\bwear\s+(?:the\s+)?([A-Za-z][A-Za-z0-9_]{2,48})\s+hat\b/i);
      if (hatM) {
        const candidate = (hatM[2] || hatM[1]).toLowerCase();
        let known = BASE_AGENTS.test(candidate);
        if (!known) {
          try { known = !!require('../lib/hat-forge').get(candidate); } catch (_) {}
        }
        if (!known) hatM = null;   // not a real agent or hat — fall through
      }
      if (hatM) {
        const sm = require('./lib/self-model');
        const agent = (hatM[2] || hatM[1]).toLowerCase();
        const r = sm.setCurrentAgent(agent);
        return json(res, 200, { text: r.ok ? `Wearing the ${r.hatName || r.agent} hat now — every message uses it until you change it again.` : `Couldn't put on that hat: ${r.reason}`, model_used: 'nexus-agent-router', confidence: 1, escalated: false, detail: r, requestId });
      }

      if (/\b(take off (the|your) hat|stop using (that|the current) agent|go back to auto|clear (your |the )?(current )?agent|reset (your |the )?agent)\b/i.test(prompt)) {
        const sm = require('./lib/self-model');
        const r = sm.setCurrentAgent('auto');
        return json(res, 200, { text: r.ok ? `Hat off — back to the normal ollama-first cascade.` : `Couldn't clear it: ${r.reason}`, model_used: 'nexus-agent-router', confidence: 1, escalated: false, detail: r, requestId });
      }
      if (/\b(what agent are you (using|on)|what('?s| is) your (current )?agent|what hat are you wearing|which (agent|model) (are you|is copilot) (using|on))\b/i.test(prompt)) {
        const sm = require('./lib/self-model');
        const r = sm.getCurrentAgent();
        return json(res, 200, { text: r.isCustom ? `Wearing the ${r.agent} hat.` : `No hat on — normal ollama-first cascade with confidence-based escalation.`, model_used: 'nexus-agent-router', confidence: 1, escalated: false, detail: r, requestId });
      }
      if (/\b(what can you do|what can i do|list (your )?(tools|capabilities)|full (list of )?(tools|capabilities)|what (are your|tools do you have))\b/i.test(prompt)) {
        const cap = require('./lib/capabilities');
        const r = cap.whatCanIDo();
        // §2026-08-09 — CA1-CA7 aren't HTTP-routed capabilities, so
        // whatCanIDo()'s route-verified list (correctly) doesn't include
        // them. "What can you do" was silently omitting a real, working
        // part of the answer — this appends it rather than leaving it out.
        const autonomyNote = ' Plus autonomy: I can schedule recurring tasks, react to conditions, change and revert system settings, build my own commands for things I can do, and run a constant background check on open problems — ask me directly, e.g. "schedule X every N minutes" or "make me a command for <system> to <ability>".';
        return json(res, 200, { text: r.text + autonomyNote, model_used: 'nexus-capabilities', confidence: 1, escalated: false, capabilities: r.systems, total: r.total, requestId });
      }
      const perSys = prompt.match(/\bwhat can (\w+) do\b/i);
      if (perSys && !/\byou\b/i.test(perSys[1])) {
        const cap = require('./lib/capabilities');
        const r = cap.capabilitiesForSystem(perSys[1].toLowerCase());
        return json(res, 200, { text: r.text, model_used: 'nexus-capabilities', confidence: 1, escalated: false, capabilities: r.capabilities, requestId });
      }
      // §P4 — NEXUS self-awareness: rundown / what's wrong / versions, from real state.
      try {
        const na = require('./lib/nexus-awareness');
        const ans = await na.answerAbout(prompt, {});
        if (ans) return json(res, 200, { text: ans.text, model_used: 'nexus-awareness', confidence: 1, escalated: false, detail: ans, requestId });
      } catch (_) { /* awareness unavailable — fall through to normal path */ }
      if (/^\s*list accounts\b/i.test(prompt) || /\bshow (my )?accounts\b/i.test(prompt)) {
        const ar = require('../lib/account-registry');
        const accounts = ar.listAccounts ? ar.listAccounts() : [];
        const text = accounts.length ? `${accounts.length} account slot(s): ${accounts.map(a => `${a.provider}/${a.label}${a.active ? '' : ' (inactive)'}`).join(', ')}.` : 'No account slots registered yet.';
        return json(res, 200, { text, model_used: 'nexus-accounts', confidence: 1, escalated: false, accounts, requestId });
      }
      const addAcct = prompt.match(/^\s*add account\s+(\w+)\s+(\S+)/i);
      if (addAcct) {
        const ar = require('../lib/account-registry');
        const row = ar.addAccount ? ar.addAccount(addAcct[1], addAcct[2], {}) : null;
        const text = row && !row.error ? `Registered ${addAcct[1]}/${addAcct[2]} (credentials stored as a reference, not raw).` : `Could not add: ${(row && row.error) || 'registry unavailable'}.`;
        return json(res, 200, { text, model_used: 'nexus-accounts', confidence: 1, escalated: false, account: row, requestId });
      }
      if (/^\s*user[- ]model\b/i.test(prompt) || /\bwhat do you know about me\b/i.test(prompt)) {
        const um = require('./lib/user-model');
        let hyps = [];
        try { hyps = um.getHypotheses ? um.getHypotheses(10) : []; } catch { hyps = []; }
        const text = (hyps && hyps.length) ? `${hyps.length} hypotheses tracked (confidence-weighted).` : 'No user-model hypotheses yet.';
        return json(res, 200, { text, model_used: 'nexus-user-model', confidence: 1, escalated: false, hypotheses: hyps, requestId });
      }
      // §2026-08-09 — CA1-CA7, the autonomous layer built and tested this
      // session, wired into the actual conversation for the first time.
      // Same pattern as every intercept above: a real lib module, called
      // directly, not grammar-engine auto-dispatch (nothing uses that path
      // yet for any capability — see copilot/lib/autonomy-router.js's own
      // header for why). "co-pilot needs to work and have access to all of
      // its tools" (James) — this is that wire.
      try {
        const ar = require('./lib/autonomy-router');
        const auto = await ar.route(prompt, { sessionId, channel });
        if (auto) return json(res, 200, { text: auto.text, model_used: 'nexus-autonomy', confidence: 1, escalated: false, detail: auto.detail, requestId });
      } catch (_) { /* autonomy layer unavailable — fall through, never block */ }
    } catch (_) { /* container-panel query unavailable — fall through */ }

    // Dispatch through lifeline (lib/lifeline → Ollama first, Guardian fallback)
    let text = '', modelUsed = 'none', confidence = null, escalated = false, escalationReason = null;
    try {
      const life = await _lifeline.route(
        `${contextText}\n\nUSER: ${prompt}\nNEXUS CO-PILOT: `,
        { requestId, sessionId, intent: 'ask', channel }
      );
      text      = life?.text || '';
      modelUsed = life?.provider_used || 'none';
      confidence = life?.confidence ?? null;
      escalated  = !!life?.escalated;
      // §BUG FIXED 2026-07-11 — "the confidence score is over-relying on
      // lifeline" is unverifiable without this: lifeline's route() already
      // computes and returns confidence/escalated/ollama_offline on every
      // response, but none of it reached storage — only provider_used did.
      // Every escalation was invisible after the fact; the only place it
      // existed was one console.log line and a fire-and-forget SSE
      // broadcast nothing persisted or displayed. Now on the actual
      // persisted record, so it's answerable from data instead of guessed:
      // was this exchange high-confidence Ollama, or an escalation — and
      // if an escalation, was it because confidence was low, or because
      // Ollama was unreachable entirely (two very different problems that
      // both look identical without this).
      escalationReason = life?.ollama_offline ? 'ollama_unreachable'
        : life?.escalated ? 'low_confidence'
        : null;
      if (life?.escalated) broadcast('copilot.lifeline.escalated', { provider: life.provider_used, confidence, reason: escalationReason });
    } catch(e) { text = `Dispatch failed: ${e.message}`; }

    // Persist (best-effort)
    try {
      await _persist('chat_log', {
        uuid: crypto.randomUUID(), requestId, sessionId,
        prompt: prompt.slice(0,500), response: text.slice(0,2000),
        modelUsed, intent: 'ask', channel,
        confidence, escalated, escalationReason,
        componentId: 'copilot.bridge.deliver', hookId: 'copilot.bridge.in',
        contextLayers: 7, fromStream: false, ts: Date.now()
      });
    } catch(_) {}

    streamIngest({ type: 'copilot.answered', requestId, intent: 'ask', modelUsed });

    // §BUG FIXED 2026-07-05, CORRECTED 2026-07-11: this originally
    // pre-wrapped the answer in {result:{response:{...}}}, and got
    // changed to the flat shape below on the theory that ResultGate
    // already wraps a raw body once, so pre-wrapping here doubled it.
    // That theory was half right and half wrong: pre-wrapping here WAS
    // the wrong move, but ResultGate wasn't actually wrapping anything —
    // it was destructuring the route.result event without ever pulling
    // out `data` (DispatchGate's captured response body) at all, so the
    // resolved value never contained ANY version of this endpoint's
    // response, flat or nested. This fix looked right and WAS right,
    // it just couldn't be verified from this side, since nothing
    // downstream of router.js's ResultGate ever received whatever shape
    // was sent here. Confirmed live, repeatedly, across sessions: the
    // bridge tab kept showing {"ok":true,"uuid":...,"status":"fulfilled"}
    // with no actual answer anywhere in it. The real fix is in
    // bridge/router.js's ResultGate — this endpoint's shape was correct
    // then and is correct now; it was never the actual problem.
    json(res, 200, { ok: true, text, modelUsed, contextLayers: 7, requestId, sessionId });
    return;
  }

  // ── §PHASEMAP P1: POST /api/prompt/tools — agentic tool-loop ───────────────
  // Co-pilot runs the sovereign agent-tools loop (lib/agent-tools) with its OWN
  // ollama dispatch injected as callModel. The model can request tools mid-turn
  // (read_file, diagnose, query-recall, run-command, ...) and the loop executes
  // them for real, feeding results back. Additive: the existing /api/prompt path
  // is untouched. P2 (memory) and P3 (stream) enrich the run via opts without
  // changing this contract.
  if (method === 'POST' && p === '/api/prompt/tools') {
    let body = ''; req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { prompt, sessionId, maxIterations } = JSON.parse(body || '{}');
        if (!prompt) { json(res, 400, { ok: false, error: 'prompt required' }); return; }
        const toolRuntime = require('./tool-runtime');
        const userModel = require('./lib/user-model');
        const requestId = crypto.randomUUID();

        // §PHASEMAP P2 — persistent memory. buildUserContext() reads the
        // confidence-weighted hypotheses from cortex's JAA store (survives
        // restart — §0.3 nothing lost). Injected as `memory` so the co-pilot
        // remembers this user across sessions.
        let memory = '';
        try { memory = userModel.buildUserContext() || ''; } catch (_) {}

        const dispatch = (convo, sysContext, opts) =>
          _dispatchToOllama(convo, sysContext, { ...opts, intent: 'tool-loop', requestId, sessionId });

        // §PHASEMAP P3 — continuous stream. _stream is copilot's live ring
        // buffer, already fed by Cortex + Guardian + Idearium SSE (streamIngest).
        // normalizeStream turns the recent slice into readable text; injected as
        // streamDigest so the co-pilot sees live system events every turn
        // (omniscience — §1.2 the stream is observable). P7 promotes this to a
        // shared subscribable so every system's loop reads the same digest.
        let streamDigest = '';
        try {
          const { normalizeStream } = require('./stream-digest');
          streamDigest = normalizeStream(_stream, 30) || '';
        } catch (_) {}

        // §PHASEMAP OB6 — continuous diagnostic injection. Append a BOUNDED live
        // health + bottleneck summary to the stream digest, so co-pilot's context
        // continuously carries system state + movement (not just raw events).
        // Bounded to one health line + the single worst bottleneck so it enriches
        // rather than drowns the signal (OB6 drift note). Non-fatal.
        try {
          const diag = await require('./diagnostics').diagnose();
          const parts = [];
          if (diag.health) parts.push(`${diag.health.online}/${diag.health.total} systems online`);
          if (diag.gaps && diag.gaps.open) parts.push(`${diag.gaps.open} open gaps`);
          if (diag.regime && diag.regime.state && diag.regime.state !== 'stable') parts.push(`CFR regime ${diag.regime.state}`);
          if (parts.length) streamDigest += `\nLIVE DIAGNOSTICS: ${parts.join(', ')}.`;
          // top bottleneck (OB4) if the movement map has recent flow
          const mm = require('./movement-map');
          const graph = mm.buildMovementGraph((_stream || []).slice(-40));
          const bn = mm.detectBottlenecks(graph, {});
          if (bn.length) streamDigest += ` BOTTLENECK: ${bn[0].why} (score ${bn[0].score}).`;
        } catch (_) { /* diagnostics injection is best-effort */ }

        const result = await toolRuntime.run({
          userPrompt: prompt,
          dispatch,
          pollJob: _pollOllamaJobHeadless,
          maxIterations: maxIterations || 6,
          memory,
          streamDigest,
        });

        // §P2 write-back — record this interaction so the model learns across
        // sessions. recordIntent persists to cortex; the next session's
        // buildUserContext() will reflect it.
        try {
          userModel.recordIntent('tool-loop', String(prompt).slice(0, 300), sessionId || 'copilot');
          if (result.toolCallLog.length) {
            userModel.observe(`uses tools: ${[...new Set(result.toolCallLog.map(t => t.name))].join(', ')}`,
              'behaviour', { via: 'tool-loop' }, 0.55);
          }
        } catch (_) {}

        await _persist('chat_log', { uuid: crypto.randomUUID(), requestId, sessionId,
          prompt: String(prompt).slice(0, 500), response: (result.text || '').slice(0, 2000),
          modelUsed: 'ollama', intent: 'tool-loop', toolsUsed: result.toolCallLog.map(t => t.name),
          iterations: result.iterations, componentId: 'copilot.prompt.tools',
          hookId: 'copilot.prompt.tools.reply', ts: Date.now() });

        json(res, 200, { ok: true, text: result.text, iterations: result.iterations,
          toolCallLog: result.toolCallLog, requestId });
      } catch (e) {
        json(res, 500, { ok: false, error: e.message });
      }
    });
    return;
  }

  // ── POST /api/prompt — standard JSON response ─────────────────────────────
  if (method === 'POST' && p === '/api/prompt') {
    const body      = await readBody(req);
    const prompt    = body.prompt || '';
    const channel   = body.channel || 'unknown';
    const sessionId = body.sessionId || req.headers['x-session-id'] || crypto.randomUUID();
    const requestId = crypto.randomUUID();
    const session   = _getSession(sessionId, channel, prompt);
    session.exchanges++;

    if (!prompt) { json(res, 400, { ok:false, error:'prompt required' }); return; }

    // §GAP CLOSED 2026-07-07 — copilot's own hook registry declares seven
    // intents (ask|build|diagnose|navigate|note|tool|action); `ask` was
    // hardcoded at nine points in this file, and navigate/note/tool/action
    // had no implementation anywhere. copilot/intents.js implements those
    // four. Strictly ADDITIVE: route() returns null for ask/build/diagnose,
    // so every existing request falls through to the exact pipeline below,
    // unchanged. Only a genuinely-matched new intent returns early.
    try {
      const _intents = require('./intents.js');
      const intentResult = await _intents.route(prompt, {
        pushToCortex: (content, tags, tier) => new Promise((resolve, reject) => {
          const b = JSON.stringify({ content, tags, tier });
          const rq = http.request({ hostname: '127.0.0.1', port: 3748, path: '/api/push', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
            r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>{ try { resolve(JSON.parse(d)); } catch(e){ reject(e); } }); });
          rq.on('error', reject);
          rq.write(b); rq.end();
        }),
        runTools: async (userPrompt) => {
          // §SOVEREIGNTY 2026-07-09 — two violations lived here, both mine:
          // a require() into cortex's filesystem, and a hardcoded
          // `port: 3749` for ollama. Both resolved through lib/nexus-client
          // now: a caller that cannot name a port cannot hardwire one, and a
          // caller that asks over HTTP does not care which implementation
          // answers.
          const nx = require('../lib/nexus-client');
          let personaName = 'default';
          try {
            const r = await nx.get('cortex', `/api/personas?name=${encodeURIComponent(body.persona || 'default')}`, { timeout: 2500 });
            personaName = r?.persona?.name || 'default';
          } catch (_) { /* cortex unreachable — proceed with the default profile, never block the tool call */ }
          return nx.post('ollama', '/api/jobs/tools', { prompt: userPrompt, persona: personaName }, { timeout: 90000 });
        },
      });
      if (intentResult) {
        streamIngest({ type: 'copilot.answered', requestId, intent: intentResult.intent, modelUsed: 'copilot.intents' });
        json(res, intentResult.ok ? 200 : 400, { ...intentResult, requestId, sessionId, channel });
        return;
      }
    } catch (e) {
      // §1.2 — an intent-routing failure must never swallow a real request.
      // Log it and fall through to the existing, working ask pipeline.
      console.warn('[copilot] intent routing failed, falling through to ask:', e.message);
    }

    // §2026-08-09 — CA1-CA7, the autonomous layer, wired into the PRIMARY
    // entry point. First attempt landed only in /bridge/deliver (Bridge's
    // relay path) — checked with a real HTTP call against THIS route and
    // found it wasn't reached here at all, /api/prompt has its own separate
    // handler with its own fall-through chain (_intents.route(), then the
    // intuition fast-path below). Same "try, return early on match, else
    // fall through" shape as _intents.route() just above, so this doesn't
    // change what already works.
    try {
      const ar = require('./lib/autonomy-router');
      const auto = await ar.route(prompt, { sessionId, channel });
      if (auto) {
        streamIngest({ type: 'copilot.answered', requestId, modelUsed: 'nexus-autonomy' });
        json(res, 200, { ok: true, text: auto.text, modelUsed: 'nexus-autonomy', intent: 'autonomy', requestId, sessionId, channel, detail: auto.detail });
        return;
      }
    } catch (e) { console.warn('[copilot] autonomy routing failed, falling through:', e.message); }

    broadcast('copilot.prompt.received', { prompt: prompt.slice(0,100), channel, sessionId });

    // INTUITION — fast path (comp_id: nexus.copilot.intuition)
    const intuition = await _intuition.answer(prompt, session, _stream);
    if (intuition?.text) {
      const row = { uuid: crypto.randomUUID(), requestId, sessionId,
        prompt: prompt.slice(0,500), response: intuition.text,
        modelUsed: intuition.modelUsed, intent: intuition.intent,
        channel, componentId:'copilot.prompt', hookId:'copilot.prompt.reply',
        contextLayers: 1, fromStream: true, ts: Date.now() };
      await _persist('chat_log', row);
      const ui = await _buildSpotlightUI(intuition.text);
      json(res, 200, { ok:true, requestId, sessionId, ...intuition, channel, ...(ui ? { ui } : {}) });
      return;
    }

    // §P110: Cortex INTUITION fast path (L2 dual cognition)
    const cortexIntuition = await _queryCortexIntuition(prompt, sessionId);
    if (cortexIntuition?.text && (cortexIntuition?.confidence || 0) > 0.75) {
      const row = { uuid: crypto.randomUUID(), requestId, sessionId,
        prompt: prompt.slice(0,500), response: cortexIntuition.text,
        modelUsed: 'cortex.intuition', intent: cortexIntuition.intent || 'ask',
        channel, componentId:'copilot.prompt', hookId:'copilot.prompt.reply',
        contextLayers: 2, fromStream: true, source: 'cortex.intuition', ts: Date.now() };
      await _persist('chat_log', row);
      const ui = await _buildSpotlightUI(cortexIntuition.text);
      json(res, 200, { ok:true, requestId, sessionId, text: cortexIntuition.text,
        modelUsed: 'cortex.intuition', channel, source: 'cortex.intuition', ...(ui ? { ui } : {}) });
      return;
    }

    // §P73: 7-layer context via copilot-context.js
    let contextText = '';
    const cc = _getCopilotContext();
    if (cc) {
      try {
        const snap = await cc.assemble({ eventBuffer: _stream, intent: prompt });
        contextText = snap.text;
        broadcast('copilot.context.assembled', { layers: Object.keys(snap.layers).length, tokens: snap.tokensUsed });
      } catch(e) {
        contextText = await _analysis.assembleContext(prompt, _stream, session);
        broadcast('copilot.context.assembled', { layers: 7, fallback: true });
      }
    } else {
      contextText = await _analysis.assembleContext(prompt, _stream, session);
      broadcast('copilot.context.assembled', { layers: 7, noCopilotContext: true });
    }

    // §P103: session history injection (first exchange only)
    contextText = _injectUserModel(contextText);   // §UM2 — know the user on every path
    _captureUserSignals(prompt, channel);   // §UM3 — richer capture
    contextText = await _injectSessionHistory(session, contextText);
    // §BUILT 2026-07-13 — chunk_2: associative recall, every exchange (not
    // just session-start), best-effort, never blocks.
    contextText = await _injectRecallContext(prompt, contextText);

    // §P110: Cortex MASTERMIND causal enrichment
    const mastermind = await _queryCortexMastermind(prompt, contextText.slice(0, 500), sessionId);
    if (mastermind?.analysis) {
      contextText += `\n\n=== CORTEX MASTERMIND ===\n${mastermind.analysis.slice(0, 400)}`;
      broadcast('copilot.mastermind.enriched', { sessionId });
    }

    // Route through LIFELINE — Ollama primary, Guardian fallback
    let text = '';
    let modelUsed = 'none';
    try {
      const lifeResult = await _lifeline.route(
        `${contextText}\n\nUSER: ${prompt}\nNEXUS CO-PILOT: `,
        { requestId, sessionId: session.sessionId, intent: 'ask', channel }
      );
      text      = lifeResult?.text || '';
      modelUsed = lifeResult?.provider_used || 'none';
      if (lifeResult?.escalated) broadcast('copilot.lifeline.escalated', { provider: lifeResult.provider_used });
    } catch(e) {
      text = `Analysis failed: ${e.message}`;
      // §ADDED 2026-07-06 — a lifeline failure used to only ever exist as
      // the text of the answer shown to the person asking. Now also lands
      // in data/copilot/failures.jsonl, queryable and correlatable with
      // everything else logged the same way.
      try { require('../lib/ledger-writer').writeFailure('copilot', e, { module: 'lifeline', source: 'api.prompt', prompt: prompt.slice(0,200) }); } catch(_) {}
    }

    const row = { uuid: crypto.randomUUID(), requestId, sessionId,
      prompt: prompt.slice(0,500), response: text.slice(0,2000),
      modelUsed, intent: 'ask', channel,
      componentId:'copilot.prompt', hookId:'copilot.prompt.reply',
      contextLayers: 7, fromStream: true, ts: Date.now() };
    await _persist('chat_log', row);
    streamIngest({ type: 'copilot.answered', requestId, intent: 'ask', modelUsed });

    const ui = await _buildSpotlightUI(text);
    json(res, 200, { ok:true, requestId, sessionId, text, modelUsed, intent:'ask',
      channel, contextLayers: 7, fromStream: true, ...(ui ? { ui } : {}) });
    return;
  }

  if (method === 'POST' && p === '/api/channel') {
    const body = await readBody(req);
    const { channelId, channelName } = body || {};
    if (!channelId) { json(res, 400, { ok:false, error:'channelId required' }); return; }
    for (const s of _sessions.values()) s.channel = channelId;
    broadcast('copilot.channel.changed', { channelId, channelName });
    json(res, 200, { ok:true, channelId, channelName });
    return;
  }

  if (method === 'POST' && p === '/api/observe') {
    const body = await readBody(req);
    const { type, element, channel } = body || {};
    try {
      const um = require('../copilot/lib/user-model');
      if (type === 'confusion' && element && um.recordError) {
        um.recordError(`ui_confusion:${element}`, channel || 'unknown', 'low');
      }
    } catch(_) {}
    json(res, 200, { ok:true });
    return;
  }

  if (method === 'POST' && p === '/api/stream/ingest') {
    const body = await readBody(req);
    if (body.type) streamIngest(body);
    json(res, 200, { ok:true, depth: _stream.length });
    return;
  }

  res.writeHead(404); res.end('Not found');
});

// ── Register with orchestrator ────────────────────────────────────────────────
function register() {
  const components = require('./registry-components');
  const body = JSON.stringify({ systemId:SYSTEM_ID, port:PORT, version:VERSION,
    status:'online', meta:{ label:'COPILOT', color:'#cc44ff' },
    components: components.components || [] });
  const u = new URL(`${OR_URL}/api/register`);
  const r = http.request({ hostname:u.hostname, port:u.port||9000, path:u.pathname,
    method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
    timeout:4000 }, () => {
    console.log('[copilot] registered');
    // §Phase-0 nerve-pulse 2026-07-01 — start recurring heartbeat so this
    // system appears in nexus-bus._sources and Nerve's presence layer can
    // track it. Without this, copilot registered once and was then invisible
    // to the bus's per-source emitCount/lastSeen map that the Nerve read
    // layer reads. startHeartbeat pings /api/heartbeat every 10s, unref'd
    // so it doesn't block process exit. Confirmed absent before this add —
    // grep for 'startHeartbeat\|createPulse' in copilot/server.js returned
    // zero matches per the Phase 0 audit this session.
    try {
      const { startHeartbeat } = require('../nexus-connect');
      startHeartbeat(SYSTEM_ID, PORT);
    } catch (_) { /* nexus-connect optional — never crash the server over a heartbeat */ }
  });
  r.on('error', () => setTimeout(register, 5000));
  r.write(body); r.end();
}

// §BUG FIXED 2026-07-11 — this used to call server.listen() unconditionally
// at module load, meaning any `require('./copilot/server.js')` — including
// from a test wanting only extractDispatchText — started a real HTTP
// server bound to :3750 as a side effect. This is very likely WHY
// tests/modules/copilot-handshake-dispatch.test.js duplicated the dispatch
// logic as an inline mock instead of importing the real functions: doing
// so safely wasn't possible before this guard existed. Standard Node
// pattern — only listen when this file is the actual entrypoint
// (`node copilot/server.js`), not when something else requires it for
// what it exports.
if (require.main === module) {
server.listen(PORT, () => {
  console.log(`[copilot] :${PORT} — v${VERSION} — P73/P103/P110/P112/AX-008 wired`);
  setTimeout(register, 1000);
  setTimeout(_connectCortexStream, 2000);
  setTimeout(_connectGuardianStream, 3000);
  setTimeout(_connectIdeariumStream, 4000);

  // §ADDED 2026-07-07 — continuous stream digest. The _stream buffer is
  // already fed live from Cortex/Guardian SSE and already flows into
  // context assembly; this adds the two missing pieces (normalize to
  // plain text, push a durable digest into Cortex so nothing is lost on
  // restart). Pushes to the real /api/push endpoint built this session.
  try {
    const { StreamDigest } = require('./stream-digest.js');
    const _digest = new StreamDigest({
      getStream: () => _stream,
      pushToCortex: (content, tags, tier) => {
        const body = JSON.stringify({ content, tags, tier });
        const u = new URL(`${CX_URL}/api/push`);
        const req = http.request({ hostname: u.hostname, port: u.port || 3748, path: '/api/push', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, () => {});
        req.on('error', () => {}); // digest is best-effort, never crashes copilot
        req.write(body); req.end();
      },
      intervalMs: 60000,
    });
    _digest.start();
    console.log('[copilot] stream-digest started — activity persists to Cortex every 60s');
  } catch (e) { console.warn('[copilot] stream-digest not started:', e.message); }

  // §WIRED 2026-08-12 — schedule_task/register_trigger (lib/agent-tools) write
  // to lib/scheduler.js and lib/triggers.js, which persist to cortex but only
  // ARM a live timer `if (_running)`. Grepped the whole tree before adding this:
  // nothing outside tests/ ever called .start() on either module, so every
  // task/trigger created through the new tools — and the 6 tasks + 1 trigger
  // already sitting in cortex from before this fix — persisted and then never
  // fired. copilot is the natural owner: both modules' own docblocks are
  // written for it ("co-pilot can schedule tasks, jobs, alarms..."). Each
  // .start() hydrates existing rows from cortex and arms them; same
  // never-crash-the-server guard as stream-digest above.
  try {
    require('../lib/scheduler.js').start();
    console.log('[copilot] scheduler started — persisted tasks hydrated and armed');
  } catch (e) { console.warn('[copilot] scheduler not started:', e.message); }
  try {
    require('../lib/triggers.js').start();
    console.log('[copilot] triggers started — persisted triggers hydrated and armed');
  } catch (e) { console.warn('[copilot] triggers not started:', e.message); }

  // §WIRED 2026-08-13 — R3 (docs/repair-contract-and-loom-hub-phasemap.spec)
  // built lib/autonomous-repair.js, the exact "loom notices and fixes itself"
  // wire James asked for: detected gap -> diagnose -> raid.verify (isolate ->
  // sigma/drift -> compare -> rewind-on-fail) -> apply only on pass. Marked
  // DONE 2026-08-12, 7 tests passing — but wireAutonomousRepair() itself was
  // NEVER CALLED anywhere outside its own test file, confirmed by grepping
  // every real caller of registerTrigger() in the whole tree: only this
  // module's own internals and the manual register_trigger agent-tool. The
  // exact same "declared \u2260 real" gap this phasemap's own R3 entry
  // documents finding and fixing for repair-on-prompt.js one layer down —
  // recurred one layer up, in the thing that was supposed to fix it. Found
  // while wiring loom/intelligence self-healing per James's direct request.
  // triggers.js must be .start()-ed first (immediately above) since this
  // registers a live trigger against it; same never-crash-the-server guard.
  try {
    require('../lib/autonomous-repair.js').wireAutonomousRepair();
    console.log('[copilot] autonomous-repair wired — gap-field.found events for chunk-build exhaustion now trigger real diagnose->raid.verify->apply, not just detection');
  } catch (e) { console.warn('[copilot] autonomous-repair not wired:', e.message); }

  // §WIRED 2026-08-13 — hat-forge has been live since P8 with working
  // forge/get/list/revoke, but list() returned []: the mechanism shipped with
  // nothing in it, which is indistinguishable from a mechanism that doesn't
  // work. lib/hat-seed.js forges four real, scoped hats (auditor,
  // diagnostician, builder, librarian). Idempotent — it skips any hat already
  // present and never overwrites one you edited by hand. Seeds carry NO
  // responsibilities: those create real recurring NCP dispatches, and starting
  // browser jobs against claude/chatgpt unasked at boot is not a default
  // anyone consented to. Same never-crash-the-server guard as above.
  try {
    require('../lib/hat-seed.js').seedHats();
  } catch (e) { console.warn('[copilot] hats not seeded:', e.message); }

  // §WIRED 2026-08-12 — buildNexusModel() (copilot/lib/self-model.js) existed
  // complete but self_model had 0 rows: nothing ever called it, AND its own
  // persist call was miswired against lib/cortex-write.js's real factory
  // contract (fixed same session). Fixed both halves — this is the "never
  // goes stale again" half: a recurring schedule_task, same mechanism P2's
  // never-say-no and every schedule_task-authored task use, so the model in
  // cortex tracks reality instead of being a one-time manual snapshot.
  try {
    const scheduler = require('../lib/scheduler.js');
    const EXISTING_ID = 'self-model-refresh';
    if (!scheduler.get(EXISTING_ID)) {
      scheduler.schedule({
        id: EXISTING_ID, name: 'self-model-refresh', everyMs: 3600000, maxRuns: Infinity,
        target: { kind: 'fn' },
        fn: async () => require('./lib/self-model.js').buildNexusModel({}),
        intent: 'scheduled.self-model-refresh',
      });
      console.log('[copilot] self-model-refresh scheduled — buildNexusModel() every hour, persists to cortex self_model');
    }
  } catch (e) { console.warn('[copilot] self-model-refresh not scheduled:', e.message); }

  // §WIRED 2026-08-12 (P7c, docs/copilot-full-capability-phasemap.spec) —
  // lib/nerve-ollama-bridge.js exists and is correct (live-verified this
  // session, including a route-order bug found and fixed by that same
  // testing) but on its own is only a function someone has to remember to
  // call. This is the "continuous" half: a recurring schedule_task, same
  // mechanism as self-model-refresh above, so Nerve's per-window attention
  // actually flows into ollama's standing context channel on its own.
  // Channel id fixed at 'nexus-live' — the one standing channel this
  // bridge feeds; a caller wanting the live context uses that channel id
  // with ollama's /api/stream routes.
  try {
    const scheduler = require('../lib/scheduler.js');
    const BRIDGE_TASK_ID = 'nerve-ollama-bridge-push';
    if (!scheduler.get(BRIDGE_TASK_ID)) {
      scheduler.schedule({
        id: BRIDGE_TASK_ID, name: 'nerve-ollama-bridge-push', everyMs: 5000, maxRuns: Infinity,
        target: { kind: 'fn' },
        fn: async () => require('../lib/nerve-ollama-bridge.js').pushContext('nexus-live'),
        intent: 'scheduled.nerve-ollama-bridge-push',
      });
      console.log('[copilot] nerve-ollama-bridge-push scheduled — Nerve window activity -> ollama channel "nexus-live" every 5s');
    }
  } catch (e) { console.warn('[copilot] nerve-ollama-bridge-push not scheduled:', e.message); }
});
}

module.exports = { server, streamIngest, _resolveIntuitionResponse, extractDispatchText };
