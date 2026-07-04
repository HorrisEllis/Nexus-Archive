'use strict';
/**
 * ollama/server.js — Sovereign Ollama Bridge
 * UUID: nexus-ollama-server-v1-0000-2026-0627-jamesbrooks-001
 * Port: 3749
 *
 * Ollama is a sovereign system. Not inlined in Guardian. Not blocking Guardian.
 * Guardian goes down → Ollama keeps running.
 * RAID routes directly here by component id, not through Guardian.
 * Every job carries contractId, componentId, hookId, requestId for CFR tracking.
 */

const http   = require('http');
const https  = require('https');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const PORT         = parseInt(process.env.OLLAMA_BRIDGE_PORT || '3749');
const _rawOllamaHost = process.env.OLLAMA_HOST || '127.0.0.1:11434';
const OLLAMA_HOST = _rawOllamaHost.startsWith('http') ? _rawOllamaHost : `http://${_rawOllamaHost}`;
const ORCH_URL     = process.env.ORCHESTRATOR_URL || 'http://127.0.0.1:9000';
const CX_URL       = process.env.CORTEX_URL || 'http://127.0.0.1:3748';
const DATA_DIR     = path.join(__dirname, '..', 'data', 'ollama');
const MAX_CONCURRENT = parseInt(process.env.OLLAMA_MAX_CONCURRENT || '3');
// §BUGFIX 2026-07-04: was 'qwen2.5-coder:7b' / 'mistral:7b' — neither tag
// is what's actually installed (confirmed via a screenshot of the real
// Ollama app's model list: mistral:7b-instruct-q4_K_M and
// qwen2.5-coder:1.5b are the two present, nothing else local). Every
// Ollama call this codebase makes was requesting a model that was never
// pulled, silently failing, and falling through to whatever came next —
// this is very likely why co-pilot "never worked once." Aligned to the
// same two tags five other files already independently agreed on:
// guardian/server.js's MISTRAL_MODEL, idearium/agent-suite/index.js,
// loom/agent-suite/index.js, lib/context-builder.js (its own mistral
// default), and cli/nexus-repl.js (which already calls qwen2.5-coder:1.5b
// "the NEXUS reasoning layer"). This file was the one outlier, not them.
const DEFAULT_MODEL  = process.env.OLLAMA_DEFAULT_MODEL || 'qwen2.5-coder:1.5b';
const FALLBACK_MODEL = process.env.OLLAMA_FALLBACK_MODEL || 'mistral:7b-instruct-q4_K_M';

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(_) {}

const _cw = require('../lib/cortex-write')('ollama');
const SYSTEM_ID = 'ollama';
const VERSION   = '1.0.0';

// ── Job queue ─────────────────────────────────────────────────────────────────
const _queue    = [];    // waiting
const _running  = new Map(); // jobId → job
const _complete = [];   // last 100
const _sseClients = new Set();

let _ollamaOnline = false;
let _statsToday   = { completed: 0, failed: 0 };

function broadcast(type, payload) {
  const msg = `data: ${JSON.stringify({ type, payload, ts: Date.now() })}\n\n`;
  for (const c of _sseClients) { try { c.write(msg); } catch(_) { _sseClients.delete(c); } }
}

// ── Ollama health check ───────────────────────────────────────────────────────
async function checkOllama() {
  return new Promise(res => {
    const u = new URL(OLLAMA_HOST);
    http.get({ hostname: u.hostname, port: u.port || 11434, path: '/api/tags', timeout: 3000 },
      r => { _ollamaOnline = r.statusCode === 200; res(_ollamaOnline); }
    ).on('error', () => { _ollamaOnline = false; res(false); });
  });
}
setInterval(async () => {
  const was = _ollamaOnline;
  await checkOllama();
  if (was !== _ollamaOnline) broadcast(_ollamaOnline ? 'ollama.health.ok' : 'ollama.health.degraded', {});
}, 10000);

// ── Job dispatcher ────────────────────────────────────────────────────────────
async function _dispatch(job) {
  _running.set(job.uuid, job);
  job.status = 'running';
  job.startedAt = Date.now();
  broadcast('ollama.job.started', { uuid: job.uuid, model: job.model });

  // §seam-integration 2026-07-02 — SEAM Detector now lives in lib/seam/
  // which makes it accessible to any provider, not just guardian/NCP paths.
  // Ollama uses the Detector directly for response quality scoring without
  // requiring the full state machine (which needs a jaa + ncpPush context).
  let _detector = null;
  try { _detector = require('../lib/seam/detector.js').Detector; } catch(_) {}

  const model = job.model || DEFAULT_MODEL;
  const body  = JSON.stringify({ model, prompt: job.prompt, stream: false,
    options: { num_predict: job.maxTokens || 2048, temperature: 0.2 } });

  return new Promise(res => {
    const u    = new URL(`${OLLAMA_HOST}/api/generate`);
    const req  = http.request({
      hostname: u.hostname, port: u.port || 11434,
      path: u.pathname, method: 'POST',
      headers: { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: job.timeoutMs || 45000,
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try {
          const resp = JSON.parse(d);
          job.result      = resp.response || '';
          job.status      = 'complete';
          job.completedAt = Date.now();
          job.durationMs  = job.completedAt - job.startedAt;

          // SEAM quality check — same Detector used by guardian for NCP responses
          if (_detector && job.result) {
            const profile    = _detector.profile(job.result);
            const truncation = _detector.truncation(job.result, profile);
            const sigma      = _detector.sigma(job.result, profile);
            const delta      = _detector.delta(job.result, job.prompt || '', job.axioms || []);
            job.seamScore    = { truncated: truncation.truncated, composite: sigma.composite, passed: !truncation.truncated && sigma.composite < 0.35 };
            if (!job.seamScore.passed) broadcast('ollama.seam.quality_low', { uuid: job.uuid, score: job.seamScore });
          }

          _statsToday.completed++;
          broadcast('ollama.job.complete', { uuid: job.uuid, durationMs: job.durationMs,
            model, componentId: job.componentId, hookId: job.hookId,
            requestId: job.requestId, intent: job.intent });
          _writeToCortex(job);
        } catch(e) {
          job.status = 'failed'; job.error = e.message; _statsToday.failed++;
          broadcast('ollama.job.failed', { uuid: job.uuid, error: e.message });
        }
        _running.delete(job.uuid);
        _complete.unshift(job);
        if (_complete.length > 100) _complete.pop();
        res(job);
        _pump();
      });
    });
    req.on('error', e => {
      job.status = 'failed'; job.error = e.message; _statsToday.failed++;
      broadcast('ollama.job.failed', { uuid: job.uuid, error: e.message });
      _running.delete(job.uuid);
      _complete.unshift(job);
      res(job);
      _pump();
    });
    req.on('timeout', () => {
      job.status = 'failed'; job.error = 'timeout';
      req.destroy();
    });
    req.write(body); req.end();
  });
}

function _pump() {
  while (_running.size < MAX_CONCURRENT && _queue.length > 0) {
    _dispatch(_queue.shift());
  }
  broadcast('ollama.queue.depth', { depth: _queue.length, running: _running.size });
}

// ── Write outcome to Cortex ───────────────────────────────────────────────────
function _writeToCortex(job) {
  const row = {
    uuid:        crypto.randomUUID(),
    jobId:       job.uuid,
    componentId: job.componentId || 'ollama.jobs.dispatch',
    hookId:      job.hookId      || 'ollama.jobs.dispatch.complete',
    contractId:  job.contractId  || 'nexus-interaction-contract-v1::ollama',
    requestId:   job.requestId,
    sessionId:   job.sessionId,
    intent:      job.intent,
    agent:       'ollama',
    model:       job.model || DEFAULT_MODEL,
    prompt:      (job.prompt || '').slice(0, 500),
    response:    (job.result || '').slice(0, 2000),
    status:      job.status,
    durationMs:  job.durationMs,
    progress:    job.status === 'complete' ? 'complete' : 'failed',
    ts:          Date.now(),
    source:      'ollama',
  };
  const body = JSON.stringify({ table: 'chat_log', row });
  try {
    const u = new URL(`${CX_URL}/api/memory/insert`);
    const r = http.request({
      hostname: u.hostname, port: u.port || 3748, path: u.pathname,
      method: 'POST', headers: { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 3000,
    }); r.on('error', () => {});
    r.write(body); r.end();
  } catch(_) {}
}

// ── HTTP server ───────────────────────────────────────────────────────────────
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type':'application/json',
    'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'*',
    'Access-Control-Allow-Headers':'Content-Type' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  return new Promise((res, rej) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { res(JSON.parse(d)); } catch(_) { res({}); } });
    req.on('error', rej);
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
    res.write(`data: ${JSON.stringify({ type:'ollama.connected', ts:Date.now() })}\n\n`);
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
    json(res, 200, { ok: _ollamaOnline, system: SYSTEM_ID, version: VERSION,
      model: DEFAULT_MODEL, queue_depth: _queue.length, running: _running.size,
      completed_today: _statsToday.completed, failed_today: _statsToday.failed,
      ollama_host: OLLAMA_HOST, ts: Date.now() });
    return;
  }

  // POST /api/jobs — queue a job
  if (method === 'POST' && p === '/api/jobs') {
    const body = await readBody(req);
    if (!body.prompt) { json(res, 400, { ok:false, error:'prompt required' }); return; }
    if (!_ollamaOnline) { json(res, 503, { ok:false, error:'Ollama host unreachable' }); return; }

    const job = {
      uuid:        crypto.randomUUID(),
      prompt:      body.prompt,
      model:       body.model || DEFAULT_MODEL,
      maxTokens:   body.maxTokens || 2048,
      timeoutMs:   body.timeoutMs || 45000,
      // Wire context — required for CFR tracking
      contractId:  body.contractId  || 'nexus-interaction-contract-v1::ollama',
      componentId: body.componentId || 'ollama.jobs.dispatch',
      hookId:      body.hookId      || 'ollama.jobs.dispatch.receive',
      requestId:   body.requestId   || crypto.randomUUID(),
      sessionId:   body.sessionId   || null,
      intent:      body.intent      || 'ask',
      status:      'queued',
      queuedAt:    Date.now(),
    };
    _queue.push(job);
    broadcast('ollama.job.queued', { uuid: job.uuid, intent: job.intent });
    _pump();
    json(res, 200, { ok:true, jobId: job.uuid, status:'queued', position: _queue.length });
    return;
  }

  // GET /api/jobs
  if (method === 'GET' && p === '/api/jobs') {
    const status = url.searchParams.get('status');
    let jobs = [..._running.values(), ..._complete];
    if (status) jobs = jobs.filter(j => j.status === status);
    json(res, 200, { ok:true, jobs: jobs.slice(0, 50) });
    return;
  }

  // GET /api/jobs/:id
  if (method === 'GET' && p.startsWith('/api/jobs/')) {
    const id = p.split('/')[3];
    const job = _running.get(id) || _complete.find(j => j.uuid === id);
    if (!job) { json(res, 404, { ok:false, error:'not found' }); return; }
    json(res, 200, { ok:true, job });
    return;
  }

  // DELETE /api/jobs/:id — cancel queued
  if (method === 'DELETE' && p.startsWith('/api/jobs/')) {
    const id  = p.split('/')[3];
    const idx = _queue.findIndex(j => j.uuid === id);
    if (idx >= 0) { _queue.splice(idx, 1); json(res, 200, { ok:true, cancelled:id }); return; }
    json(res, 404, { ok:false, error:'not in queue (may be running or complete)' });
    return;
  }

  // GET /api/queue
  if (method === 'GET' && p === '/api/queue') {
    json(res, 200, { ok:true, depth: _queue.length, running: _running.size,
      completed_today: _statsToday.completed, failed_today: _statsToday.failed });
    return;
  }

  // GET /api/models
  if (method === 'GET' && p === '/api/models') {
    const u = new URL(`${OLLAMA_HOST}/api/tags`);
    http.get({ hostname: u.hostname, port: u.port || 11434, path: u.pathname, timeout: 3000 },
      r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>{
        try { const t=JSON.parse(d); json(res,200,{ok:true,models:(t.models||[]).map(m=>m.name),active:DEFAULT_MODEL}); }
        catch(_) { json(res,200,{ok:true,models:[DEFAULT_MODEL],active:DEFAULT_MODEL}); }
      }); }
    ).on('error', () => json(res, 200, { ok:false, models:[], active:DEFAULT_MODEL }));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

// ── Register with orchestrator ────────────────────────────────────────────────
function register() {
  const components = require('./registry-components');
  const body = JSON.stringify({
    systemId: SYSTEM_ID, port: PORT, version: VERSION, status: 'online',
    meta: { label:'OLLAMA', color:'#00ff88' },
    components: components.components || [],
  });
  const u = new URL(`${ORCH_URL}/api/register`);
  const r = http.request({
    hostname: u.hostname, port: u.port||9000, path: u.pathname, method:'POST',
    headers: { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) },
    timeout: 4000,
  }, () => {
    console.log('[ollama-bridge] registered');
    // §Phase-0 nerve-pulse 2026-07-01 — same gap as copilot: registered once,
    // then invisible to nexus-bus._sources. Nerve needs recurring presence data.
    try {
      const { startHeartbeat } = require('../nexus-connect');
      startHeartbeat(SYSTEM_ID, PORT);
    } catch (_) {}
  });
  r.on('error', () => setTimeout(register, 5000));
  r.write(body); r.end();
}

server.listen(PORT, async () => {
  await checkOllama();
  console.log(`[ollama-bridge] :${PORT} — ollama ${_ollamaOnline ? 'online' : 'offline'} at ${OLLAMA_HOST}`);
  setTimeout(register, 1000);
  _pump();
});

module.exports = { server };
