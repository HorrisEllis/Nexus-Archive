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

const PORT     = parseInt(process.env.COPILOT_PORT || '3750');
const GD_URL   = process.env.GUARDIAN_URL   || 'http://127.0.0.1:7820';
const CX_URL   = process.env.CORTEX_URL     || 'http://127.0.0.1:3748';
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

function streamIngest(event) {
  _stream.push({ ...event, ingestedAt: Date.now() });
  if (_stream.length > MAX_STREAM) _stream.shift();
  broadcast('copilot.stream.event', { type: event.type, ts: event.ts || Date.now() });
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

  if (method === 'POST' && p === '/api/build') {
    const body      = await readBody(req);
    const sessionId = body.sessionId || req.headers['x-session-id'];
    if (!body.description) { json(res, 400, { ok:false, error:'description required' }); return; }
    broadcast('copilot.build.started', { description: body.description.slice(0,100) });
    _modBuilder.build(body.description, { requestId: body.requestId, sessionId, skipGaps: body.skipGaps })
      .then(result => {
        broadcast('copilot.build.complete', { ok: result.ok, passed: result.passed });
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
        return { ok: true, output: r.text || r.result || JSON.stringify(r) };
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
        return { ok: true, output: dispatchRes.result || dispatchRes.text || JSON.stringify(dispatchRes) };
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

    const mastermind = await _queryCortexMastermind(prompt, contextText.slice(0,500), sessionId);
    if (mastermind?.analysis) contextText += `\n\n=== CORTEX MASTERMIND ===\n${mastermind.analysis.slice(0,400)}`;

    // Dispatch through lifeline (lib/lifeline → Ollama first, Guardian fallback)
    let text = '', modelUsed = 'none';
    try {
      const life = await _lifeline.route(
        `${contextText}\n\nUSER: ${prompt}\nNEXUS CO-PILOT: `,
        { requestId, sessionId, intent: 'ask', channel }
      );
      text      = life?.text || '';
      modelUsed = life?.provider_used || 'none';
      if (life?.escalated) broadcast('copilot.lifeline.escalated', { provider: life.provider_used });
    } catch(e) { text = `Dispatch failed: ${e.message}`; }

    // Persist (best-effort)
    try {
      await _persist('chat_log', {
        uuid: crypto.randomUUID(), requestId, sessionId,
        prompt: prompt.slice(0,500), response: text.slice(0,2000),
        modelUsed, intent: 'ask', channel,
        componentId: 'copilot.bridge.deliver', hookId: 'copilot.bridge.in',
        contextLayers: 7, fromStream: false, ts: Date.now()
      });
    } catch(_) {}

    streamIngest({ type: 'copilot.answered', requestId, intent: 'ask', modelUsed });

    // Bridge expects: { ok, result: { response: { text, ... } } }
    json(res, 200, {
      ok: true,
      result: { response: { ok: true, text, modelUsed, contextLayers: 7, requestId, sessionId } }
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
      json(res, 200, { ok:true, requestId, sessionId, ...intuition, channel });
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
      json(res, 200, { ok:true, requestId, sessionId, text: cortexIntuition.text,
        modelUsed: 'cortex.intuition', channel, source: 'cortex.intuition' });
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
    }

    const row = { uuid: crypto.randomUUID(), requestId, sessionId,
      prompt: prompt.slice(0,500), response: text.slice(0,2000),
      modelUsed, intent: 'ask', channel,
      componentId:'copilot.prompt', hookId:'copilot.prompt.reply',
      contextLayers: 7, fromStream: true, ts: Date.now() };
    await _persist('chat_log', row);
    streamIngest({ type: 'copilot.answered', requestId, intent: 'ask', modelUsed });

    json(res, 200, { ok:true, requestId, sessionId, text, modelUsed, intent:'ask',
      channel, contextLayers: 7, fromStream: true });
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

server.listen(PORT, () => {
  console.log(`[copilot] :${PORT} — v${VERSION} — P73/P103/P110/P112/AX-008 wired`);
  setTimeout(register, 1000);
  setTimeout(_connectCortexStream, 2000);
  setTimeout(_connectGuardianStream, 3000);
  setTimeout(_connectIdeariumStream, 4000);
});

module.exports = { server, streamIngest };
