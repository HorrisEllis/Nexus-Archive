'use strict';
/**
 * copilot/server.js — Sovereign Co-pilot System
 * UUID: nexus-copilot-server-v2-0000-2026-0627-jamesbrooks-001
 * Port: 3750
 *
 * Co-pilot is separate from Guardian.
 * It receives intent, assembles context, routes to RAID, returns response.
 * It runs a CONTINUOUS STREAM — every event in the system feeds into it.
 * Every bus event, every ledger entry, every gap, every pattern,
 * every autopilot action — streams in as consciousness.
 * The co-pilot synthesizes from this stream, not from one-shot queries.
 *
 * Dual cognition (S7):
 *   INTUITION  — Pattern engine (Phase 47) + crystal lattice + user model
 *                Fast, associative, gut-sense. Fires before any model.
 *   ANALYSIS   — CFR causal kernel (Phase 71) + vector memory + compound engine
 *                Slow, derivation-based. Fires for complex reasoning.
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

const _cw          = require('../lib/cortex-write')('copilot');
const _lifeline    = require('./lifeline');
const _axiomMgr    = require('./axiom-manager');
const _modBuilder  = require('./module-builder');
const _rDiagnose   = require('./recursive-diagnose');
const SYSTEM_ID = 'copilot';
const VERSION   = '2.0.0';

// ── CONTINUOUS STREAM — the co-pilot's consciousness ─────────────────────────
// Every event that arrives here is added to a rolling 500-event buffer.
// When the co-pilot answers a question, it reads from this buffer.
// The stream IS the context. Not a query. A living feed.
const _stream = [];
const MAX_STREAM = 500;

function streamIngest(event) {
  _stream.push({ ...event, ingestedAt: Date.now() });
  if (_stream.length > MAX_STREAM) _stream.shift();
  // Broadcast to connected UIs
  broadcast('copilot.stream.event', { type: event.type, ts: event.ts || Date.now() });
}

// Subscribe to Cortex SSE for live events
let _cortexSSE = null;
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
    _cortexSSE = req;
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

async function _post(url, body) {
  return _fetch(url, { method: 'POST', body });
}

// ── Dual Cognition — loaded as sovereign modules ─────────────────────────────
// comp_id: nexus.copilot.routing / copilot/server.js
const _intuition   = require('./intuition');
const _analysis    = require('./analysis');
const _adversarial = require('./adversarial');

// Start adversarial probing (pings intuition + analysis every 60s)
_adversarial.start(() => _stream.slice(-30));


// ── ANALYSIS — 7-layer context + model ───────────────────────────────────────
async function _assemble7Layer(prompt, session) {
  const layers = [];

  // L0 stream — recent events from consciousness
  const streamSummary = _stream.slice(-30).map(e => `${e.type}`).join(', ');
  layers.push(`[STREAM] Recent: ${streamSummary.slice(0, 300)}`);

  // L1 telemetry
  try {
    const h = await _fetch(`${OR_URL}/health`);
    layers.push(`[HEALTH] online:${h.online}/${h.total}`);
  } catch(_) {}

  // L2 provider health
  try {
    const p = await _fetch(`${GD_URL}/providers`);
    layers.push(`[PROVIDERS] ${JSON.stringify(p.providers || []).slice(0, 100)}`);
  } catch(_) {}

  // L3 gaps
  try {
    const g = await _fetch(`${CX_URL}/api/gaps?status=open&severity=high&limit=5`);
    const gaps = g.gaps || g.rows || [];
    if (gaps.length) layers.push(`[GAPS] ${gaps.length} high: ${gaps.map(g=>g.type||'?').join(', ')}`);
  } catch(_) {}

  // L4 CFR field
  try {
    const cfr = await _fetch(`${CX_URL}/cfr/health`);
    layers.push(`[CFR] sigma:${cfr.cfr?.sigma?.toFixed(2)} regime:${cfr.cfr?.regime}`);
  } catch(_) {}

  // L5 session chat history from Cortex
  if (session?.sessionId) {
    try {
      const mem = await _fetch(`${CX_URL}/api/memory?table=chat_log&n=5`);
      const rows = mem.rows || [];
      if (rows.length) layers.push(`[MEMORY] ${rows.length} recent exchanges`);
    } catch(_) {}
  }

  // L6 patterns
  try {
    const pat = await _fetch(`${CX_URL}/api/intelligence/patterns?limit=3`);
    const patterns = pat.patterns || [];
    if (patterns.length) layers.push(`[PATTERNS] ${patterns.map(p=>p.precursor+'('+p.count+'×)').join(', ').slice(0,150)}`);
  } catch(_) {}

  return layers.join('\n');
}

// ── Dispatch to Ollama sovereign system ───────────────────────────────────────
async function _dispatchToOllama(prompt, context, opts = {}) {
  return _post(`${OL_URL}/api/jobs`, {
    prompt:      `${context}\n\nUSER: ${prompt}`,
    model:       opts.model || 'mistral:7b',
    intent:      opts.intent || 'ask',
    componentId: 'copilot.prompt',
    hookId:      'copilot.prompt.to-ollama',
    requestId:   opts.requestId,
    sessionId:   opts.sessionId,
    contractId:  'nexus-interaction-contract-v1::copilot',
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

// ── HTTP server ───────────────────────────────────────────────────────────────
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

const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;
  const p      = url.pathname;

  if (method === 'OPTIONS') { json(res, 200, {}); return; }

  // SSE
  if (p === '/events') {
    res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache',
      'Connection':'keep-alive', 'Access-Control-Allow-Origin':'*' });
    res.write(`data: ${JSON.stringify({ type:'copilot.connected', streamDepth: _stream.length })}\n\n`);
    _sseClients.add(res);
    req.on('close', () => _sseClients.delete(res));
    return;
  }

  // Contract — required for orchestrator verification
  if (p === '/contract') {
    json(res, 200, require('./registry-components'));
    return;
  }

  // Health
  if (p === '/health') {
    json(res, 200, { ok:true, system:SYSTEM_ID, version:VERSION, port:PORT,
      streamDepth: _stream.length, sessions: _sessions.size, ts:Date.now() });
    return;
  }

  // Stream snapshot
  if (method === 'GET' && p === '/api/stream') {
    const n = parseInt(url.searchParams.get('n') || '50');
    json(res, 200, { ok:true, events: _stream.slice(-n), total: _stream.length });
    return;
  }

  // Sessions
  if (method === 'GET' && p === '/api/sessions') {
    json(res, 200, { ok:true, sessions: [..._sessions.values()] });
    return;
  }

  // GET /api/axioms
  if (method === 'GET' && p === '/api/axioms') {
    const tier = url.searchParams.get('tier');
    json(res, 200, { ok:true, axioms: _axiomMgr.list({ tier }), summary: _axiomMgr.summary() });
    return;
  }

  // POST /api/axioms/add
  if (method === 'POST' && p === '/api/axioms/add') {
    const body = await readBody(req);
    try {
      const axiom = _axiomMgr.add(body.id, body.text, { reason: body.reason });
      json(res, 200, { ok:true, axiom });
    } catch(e) { json(res, 400, { ok:false, error: e.message }); }
    return;
  }

  // POST /api/axioms/remove
  if (method === 'POST' && p === '/api/axioms/remove') {
    const body = await readBody(req);
    try {
      const result = _axiomMgr.remove(body.id, { confirm: body.confirm });
      json(res, 200, { ok:true, ...result });
    } catch(e) { json(res, 400, { ok:false, error: e.message }); }
    return;
  }

  // POST /api/diagnose — start recursive fractal diagnosis
  if (method === 'POST' && p === '/api/diagnose') {
    const body = await readBody(req);
    const topic = body.topic || 'system health';
    const result = await _rDiagnose.start(topic, { requestId: body.requestId });
    json(res, 200, result);
    return;
  }

  // GET /api/diagnose/list — list past diagnosis sessions
  if (method === 'GET' && p === '/api/diagnose/list') {
    json(res, 200, { ok:true, sessions: _rDiagnose.list() });
    return;
  }

  // GET /api/lifeline/health
  if (method === 'GET' && p === '/api/lifeline/health') {
    const h = await _lifeline.health();
    json(res, 200, { ok:true, ...h });
    return;
  }

  // POST /api/build — user asks co-pilot to build a module
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

  // POST /api/prompt — the main entry point
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

    // ANALYSIS — 7-layer context + LIFELINE (Ollama primary, Guardian fallback)
    // comp_id: nexus.copilot.analysis / copilot/server.js
    let text = '';
    let modelUsed = 'none';
    try {
      // Assemble context first
      const context = await _analysis.assembleContext(prompt, _stream, session);
      broadcast('copilot.context.assembled', { layers: context.split('\n').length });

      // Route through LIFELINE — not directly to Ollama
      const lifeResult = await _lifeline.route(
        `${context}\n\nUSER: ${prompt}\nNEXUS CO-PILOT: `,
        { requestId, sessionId: session.sessionId, intent: 'ask', channel }
      );
      text      = lifeResult?.text || '';
      modelUsed = lifeResult?.provider_used || 'none';
      if (lifeResult?.escalated) {
        broadcast('copilot.lifeline.escalated', { provider: lifeResult.provider_used });
      }
      const aResult = { contextLayers: context.split('\n').length, source: 'lifeline' };

      // Dispatch to Ollama sovereign system
      const ollamaResult = await _dispatchToOllama(prompt, context, {
        intent: 'ask', requestId, sessionId });

      if (ollamaResult?.ok && ollamaResult?.jobId) {
        // Poll for result (Ollama is async)
        let attempts = 0;
        while (attempts < 30) {
          await new Promise(r => setTimeout(r, 1000));
          try {
            const job = await _fetch(`${OL_URL}/api/jobs/${ollamaResult.jobId}`);
            if (job.job?.status === 'complete') {
              text = job.job.result || '';
              modelUsed = job.job.model || 'ollama';
              break;
            }
            if (job.job?.status === 'failed') {
              text = `Model failed: ${job.job.error || 'unknown'}`;
              break;
            }
          } catch(_) {}
          attempts++;
        }
        if (!text) text = 'Model timed out.';
      } else {
        text = ollamaResult?.error || 'Ollama bridge unavailable.';
      }
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

  // POST /api/channel — notify co-pilot of UI channel change (user model tracking)
  if (method === 'POST' && p === '/api/channel') {
    const body = await readBody(req);
    const { channelId, channelName } = body || {};
    if (!channelId) { json(res, 400, { ok:false, error:'channelId required' }); return; }
    // Update any active sessions to the new channel
    for (const s of _sessions.values()) s.channel = channelId;
    broadcast('copilot.channel.changed', { channelId, channelName });
    json(res, 200, { ok:true, channelId, channelName });
    return;
  }

  // POST /api/observe — UI confusion/interaction signals (fire-and-forget)
  if (method === 'POST' && p === '/api/observe') {
    const body = await readBody(req);
    const { type, element, channel } = body || {};
    try {
      const um = require('../lib/user-model');
      if (type === 'confusion' && element && um.recordError) {
        um.recordError(`ui_confusion:${element}`, channel || 'unknown', 'low');
      }
    } catch(_) {}
    json(res, 200, { ok:true });
    return;
  }

  // POST /api/stream/ingest — other systems push events here
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
    timeout:4000 }, () => console.log('[copilot] registered'));
  r.on('error', () => setTimeout(register, 5000));
  r.write(body); r.end();
}

server.listen(PORT, () => {
  console.log(`[copilot] :${PORT} — sovereign co-pilot, stream-of-consciousness`);
  setTimeout(register, 1000);
  // Connect to live event streams
  setTimeout(_connectCortexStream, 2000);
  setTimeout(_connectGuardianStream, 3000);
});

module.exports = { server, streamIngest };
