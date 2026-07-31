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

function _getSession(sessionId, channel) {
  if (!sessionId) sessionId = crypto.randomUUID();
  if (!_sessions.has(sessionId)) {
    _sessions.set(sessionId, { sessionId, channel, exchanges: 0,
      startedAt: Date.now(), lastActive: Date.now() });
  }
  const s = _sessions.get(sessionId);
  s.lastActive = Date.now();
  s.channel = channel || s.channel;
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
    const session   = _getSession(sessionId, channel);
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
    const session   = _getSession(sessionId, channel);
    session.exchanges++;

    if (!prompt) {
      json(res, 400, { ok:false, error:'payload.prompt required' });
      return;
    }

    broadcast('copilot.prompt.received', { prompt: prompt.slice(0,100), channel, sessionId, via: 'bridge' });

    // Full context assembly — same path as /api/prompt
    let contextText = '';
    try { contextText = await _analysis.assembleContext(prompt, _stream, session); } catch(_) {}
    contextText = await _injectSessionHistory(session, contextText);
    // §BUILT 2026-07-13 — chunk_2: associative recall, every exchange (not
    // just session-start), best-effort, never blocks.
    contextText = await _injectRecallContext(prompt, contextText);

    const mastermind = await _queryCortexMastermind(prompt, contextText.slice(0,500), sessionId);
    if (mastermind?.analysis) contextText += `\n\n=== CORTEX MASTERMIND ===\n${mastermind.analysis.slice(0,400)}`;

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
        const requestId = crypto.randomUUID();

        const dispatch = (convo, sysContext, opts) =>
          _dispatchToOllama(convo, sysContext, { ...opts, intent: 'tool-loop', requestId, sessionId });

        const result = await toolRuntime.run({
          userPrompt: prompt,
          dispatch,
          pollJob: _pollOllamaJobHeadless,
          maxIterations: maxIterations || 6,
          // P2/P3 injected here once wired: memory: <user-model digest>, streamDigest: <live stream>
        });

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
    const session   = _getSession(sessionId, channel);
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
});
}

module.exports = { server, streamIngest, _resolveIntuitionResponse, extractDispatchText };
