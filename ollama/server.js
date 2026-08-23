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

// §CONFIG 2026-08-23 — real, centralized config, not scattered inline
// constants. See ollama/config.js's own header for the full real reason
// this exists (§HISTORY: the 2026-07-04 model-mismatch outage that needed
// five files to independently agree, then had to be re-discovered by hand
// on 2026-08-23 for the next model change).
const config = require('./config.js');

const PORT         = config.PORT;
const OLLAMA_HOST  = config.OLLAMA_HOST;
const ORCH_URL      = config.ORCH_URL;
const CX_URL        = config.CX_URL;
const DATA_DIR      = config.DATA_DIR;
// §SERIALISED 2026-08-19 / §BUGFIX 2026-07-04 / §CHANGED 2026-08-23 — the
// real history behind MAX_CONCURRENT/DEFAULT_MODEL/FALLBACK_MODEL now
// lives in ollama/config.js's own header, in one place instead of
// duplicated across every file that reads these values. Read it there —
// this comment used to be 25 lines of history that drifted out of sync
// with itself every time one of these values changed again.
const MAX_CONCURRENT  = config.MAX_CONCURRENT;
const DEFAULT_MODEL   = config.DEFAULT_MODEL;
const FALLBACK_MODEL  = config.FALLBACK_MODEL;

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(_) {}

const _cw = require('../lib/cortex-write')('ollama');
const SYSTEM_ID = config.SYSTEM_ID;
const VERSION   = config.VERSION;

// §GAP CLOSED 2026-07-05: WARP (warp/dispatch/) had zero production
// callers anywhere in this codebase — built, 64/64 tests passing, never
// actually invoked outside its own test suite. This is its first real
// caller. NEXUS importing WARP is the allowed direction per WARP's own
// spec ("NEXUS imports WARP, WARP never imports NEXUS") — nothing in
// warp/ changes or knows about ollama; this file adapts ollama's job
// shape to WARP's five-primitive interface, the same way
// lib/seam/adapters/warp-cascade.js adapts a seam record's shape.
// Concrete, measurable effect: an identical prompt+model dispatched
// twice now costs one real model call instead of two — WARP's own
// stated purpose ("gets faster and cheaper the longer it runs"), not
// previously true anywhere in this codebase because nothing called it.
const { unifiedDispatch }      = require('../warp/dispatch/index');
const { runCascade }           = require('../warp/dispatch/cascade');
const { FlatFileCrystallizer } = require('../warp/plugins/crystallizer-flatfile');
const { PopulationStore }      = require('../warp/dispatch/population');

const _crystallizer = new FlatFileCrystallizer({ path: path.join(DATA_DIR, 'warp-crystals.json') });
const _population    = new PopulationStore({ maxPerClass: 8 });

// ── Job queue ─────────────────────────────────────────────────────────────────
const _queue    = [];    // waiting
const _running  = new Map(); // jobId → job
const _complete = [];   // last 100
const _channels = new Map(); // channelId → { history: [{role,content,ts}], lastActivity } — P7 standing streams

// Prune channels idle past 1 hour — a standing channel is not meant to
// outlive its actual use forever; unref'd so it never blocks process exit.
const _channelSweep = setInterval(() => {
  const now = Date.now();
  for (const [id, ch] of _channels) if (now - ch.lastActivity > 3600000) _channels.delete(id);
}, 300000);
if (_channelSweep.unref) _channelSweep.unref();
const _uploads  = new Map(); // uploadId → {text, filename, uploadedAt} — bounded to 200 in the handler
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
    http.get({ hostname: u.hostname, port: u.port || 11434, path: '/api/tags', timeout: config.HEALTH_CHECK_TIMEOUT_MS },
      r => { _ollamaOnline = r.statusCode === 200; res(_ollamaOnline); }
    ).on('error', () => { _ollamaOnline = false; res(false); });
  });
}
setInterval(async () => {
  const was = _ollamaOnline;
  await checkOllama();
  if (was !== _ollamaOnline) broadcast(_ollamaOnline ? 'ollama.health.ok' : 'ollama.health.degraded', {});
}, 10000);

// ── Raw Ollama call — unchanged mechanics, now WARP's `generate` fn ────────
// §GAP CLOSED 2026-07-07 — lib/agent-tools/'s runToolLoop() needed a real
// callModel(messages, toolSchemas) implementation; this is it. Uses
// Ollama's real /api/chat (not /api/generate — that endpoint has no
// tools param) with tools declared. qwen2.5-coder (DEFAULT_MODEL)
// confirmed to support Ollama's native tool-calling before this was
// built, not assumed.
function _callOllamaChatWithTools(model, messages, toolSchemas, timeoutMs) {
  const body = JSON.stringify({ model, messages, tools: toolSchemas, stream: false });
  return new Promise((resolve, reject) => {
    const u = new URL(`${OLLAMA_HOST}/api/chat`);
    const req = http.request({
      hostname: u.hostname, port: u.port || 11434, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: timeoutMs || config.CHAT_TOOLS_TIMEOUT_MS,
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          const msg = parsed.message || {};
          resolve({
            text: msg.content || '',
            toolCalls: (msg.tool_calls || []).map(tc => ({
              id: tc.id, name: tc.function?.name, arguments: tc.function?.arguments,
            })),
          });
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('ollama chat request timeout')); });
    req.write(body);
    req.end();
  });
}

// POST /api/jobs/tools — same job shape as /api/jobs, but runs through
// the real agent-tools loop (lib/agent-tools/index.js) instead of a
// single raw call. Separate endpoint, not a silent mode-switch on the
// existing one — a tool-enabled request has a different real cost and
// latency profile (multiple model round-trips possible), a caller
// should opt into that explicitly.
async function _dispatchWithTools(prompt, model, maxIterations) {
  const { runToolLoop } = require('../lib/agent-tools/index.js');
  const systemPrompt = 'You are a coding assistant with access to a read_file tool for reading real files in this project. Use it when you need to see a file\'s actual content before answering.';
  return runToolLoop(
    (messages, toolSchemas) => _callOllamaChatWithTools(model, messages, toolSchemas),
    systemPrompt, prompt, { maxIterations: maxIterations || 6 }
  );
}
function _callOllamaRaw(model, prompt, maxTokens, timeoutMs) {
  const body = JSON.stringify({ model, prompt, stream: false,
    options: { num_predict: maxTokens || 2048, temperature: 0.2 } });
  return new Promise((resolve, reject) => {
    const u   = new URL(`${OLLAMA_HOST}/api/generate`);
    const req = http.request({
      hostname: u.hostname, port: u.port || 11434,
      path: u.pathname, method: 'POST',
      headers: { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: timeoutMs || config.RAW_GENERATE_TIMEOUT_MS,
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve(JSON.parse(d).response || ''); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('ollama request timeout')); });
    req.end(body);
  });
}

// ── Job dispatcher — now runs through WARP's unifiedDispatch ───────────────
async function _dispatch(job) {
  _running.set(job.uuid, job);
  job.status = 'running';
  job.startedAt = Date.now();
  broadcast('ollama.job.started', { uuid: job.uuid, model: job.model });

  // §seam-integration 2026-07-02 — SEAM Detector now lives in lib/seam/
  // which makes it accessible to any provider, not just guardian/NCP paths.
  let _detector = null;
  try { _detector = require('../lib/seam/detector.js').Detector; } catch(_) {}

  const model = job.model || DEFAULT_MODEL;
  const { Axiom } = require('../warp/core/Axiom');
  const axioms = (job.axioms || []).map(a =>
    a instanceof Axiom ? a : new Axiom(a.id || `job.axiom.${Math.random()}`, { severity: a.severity || 'soft', check: a.check || (() => true) }));

  const cascade = ({ event }) => runCascade({
    providers: ['ollama'],
    maxAttempts: 1,
    generate: () => _callOllamaRaw(model, event.data.prompt, job.maxTokens, job.timeoutMs),
    validate: (output) => ({ ok: true, output }), // hard-axiom filtering happens in unifiedDispatch itself
  }).then(r => ({ ok: r.ok, output: r.output, attempts: r.attempts }));

  try {
    const result = await unifiedDispatch({
      gateSignature: `ollama.${model}`,
      gateClass:     `ollama.${model}`,
      event:         { data: { prompt: job.prompt } },
      axioms, cascade,
      crystallizer:  _crystallizer,
      population:    _population,
      scorer:        ({ axiomFailures }) => 1 - axiomFailures.length * 0.1,
      log: null,
    });

    if (!result.ok) {
      job.status = 'failed'; job.error = 'axiom rejection: ' + JSON.stringify(result.failures || []);
      _statsToday.failed++;
      broadcast('ollama.job.failed', { uuid: job.uuid, error: job.error });
      _running.delete(job.uuid); _complete.unshift(job);
      if (_complete.length > 100) _complete.pop();
      _pump();
      return job;
    }

    job.result      = result.output || '';
    job.warpSource   = result.source; // 'crystal' (cache hit) | 'generated' | 'pre-generation-reuse'
    job.status      = 'complete';
    job.completedAt = Date.now();
    job.durationMs  = job.completedAt - job.startedAt;

    // SEAM quality check — same Detector used by guardian for NCP responses.
    // Unchanged by the WARP wiring above — orthogonal concern (WARP decides
    // whether to regenerate; Detector decides whether what came back, cached
    // or fresh, is actually good).
    if (_detector && job.result) {
      const profile    = _detector.profile(job.result);
      const truncation = _detector.truncation(job.result, profile);
      const sigma      = _detector.sigma(job.result, profile);
      job.seamScore    = { truncated: truncation.truncated, composite: sigma.composite, passed: !truncation.truncated && sigma.composite < 0.35 };
      if (!job.seamScore.passed) broadcast('ollama.seam.quality_low', { uuid: job.uuid, score: job.seamScore });
    }

    _statsToday.completed++;
    broadcast('ollama.job.complete', { uuid: job.uuid, durationMs: job.durationMs,
      model, componentId: job.componentId, hookId: job.hookId,
      requestId: job.requestId, intent: job.intent, warpSource: job.warpSource });
    _writeToCortex(job);
  } catch (e) {
    job.status = 'failed'; job.error = e.message; _statsToday.failed++;
    broadcast('ollama.job.failed', { uuid: job.uuid, error: e.message });
  }
  _running.delete(job.uuid);
  _complete.unshift(job);
  if (_complete.length > 100) _complete.pop();
  _pump();
  return job;
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

// §ADDED 2026-07-06 — "ollama needs to completely nexus adapt, can read
// any file like an upload as plaintext." readBody above JSON.parses its
// input, which corrupts any binary content — no use for a real file
// upload. This reads the raw bytes, decodes as UTF-8 (explicitly
// "plaintext" per the request, not an attempt to handle every binary
// format), capped generously since a dropped file could be a whole
// source file or log dump, not just a short prompt.
function readRawBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > maxBytes) { req.destroy(); reject(new Error(`upload exceeds ${maxBytes} byte limit`)); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;
  const p      = url.pathname;

  // POST /api/upload — real file upload, decoded as plaintext, stored
  // against an id a subsequent /api/jobs call can reference via
  // {uploadId}. Filename comes via X-Filename header (URL-encoded), same
  // no-multipart convention loom/server.js's upload endpoint already
  // uses — one real pattern, not a second one invented here.
  if (method === 'POST' && p === '/api/upload') {
    const rawName = req.headers['x-filename'];
    let buf;
    try { buf = await readRawBody(req); }
    catch (e) { json(res, 413, { ok: false, error: e.message }); return; }
    if (!buf.length) { json(res, 400, { ok: false, error: 'empty upload' }); return; }

    const text = buf.toString('utf8');
    const uploadId = crypto.randomUUID();
    _uploads.set(uploadId, { text, filename: rawName ? decodeURIComponent(rawName) : 'upload.txt', uploadedAt: Date.now() });
    // Bounded — an upload store that only ever grows is its own slow leak.
    if (_uploads.size > 200) {
      const oldest = [..._uploads.entries()].sort((a,b) => a[1].uploadedAt - b[1].uploadedAt)[0][0];
      _uploads.delete(oldest);
    }
    json(res, 200, { ok: true, uploadId, filename: rawName ? decodeURIComponent(rawName) : 'upload.txt', chars: text.length });
    return;
  }

  if (method === 'GET' && p.startsWith('/api/upload/')) {
    const id = p.split('/')[3];
    const up = _uploads.get(id);
    if (!up) { json(res, 404, { ok: false, error: 'upload not found — may have expired' }); return; }
    json(res, 200, { ok: true, ...up });
    return;
  }

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

  // ── Standing streaming context channel (P7, docs/copilot-full-capability-
  // phasemap.spec) — deliberately SEPARATE from the job queue/_dispatch above.
  // §WHY NOT unifiedDispatch — that pipeline (WARP crystallizer, population,
  // axiom scoring, SEAM Detector) is built for discrete completed outputs: it
  // scores/crystallizes ONE finished string per job. A standing channel is
  // the opposite shape on purpose — an open conversation accumulating
  // incremental context over many turns, not one job to grade. Threading
  // streaming through machinery designed to score a finished answer would
  // mean scoring partial chunks as if they were complete, which is simply
  // wrong, not a missing feature. This is real stream:true against ollama's
  // own /api/generate (the actually-unused path this phasemap named),
  // forwarded live, chunk by chunk, as they arrive.
  //
  // §ROUTE ORDER — the context-PUT route below MUST be checked before this
  // generic '/api/stream/' prefix match, or it never gets reached (it also
  // starts with '/api/stream/'). Found by live-testing the bridge end to
  // end, not assumed: the first version had this reversed and every PUT
  // context call fell into this block's 405 instead.
  if (method === 'PUT' && p.startsWith('/api/stream/') && p.endsWith('/context')) {
    const channelId = decodeURIComponent(p.slice('/api/stream/'.length, -'/context'.length));
    if (!channelId) { json(res, 400, { ok: false, error: 'channel id required' }); return; }
    readBody(req).then(body => {
      if (!body.context) { json(res, 400, { ok: false, error: 'context required' }); return; }
      let ch = _channels.get(channelId);
      if (!ch) { ch = { history: [], lastActivity: Date.now() }; _channels.set(channelId, ch); }
      ch.history.push({ role: 'context', content: String(body.context), ts: Date.now() });
      ch.lastActivity = Date.now();
      json(res, 200, { ok: true, channelId, turns: ch.history.length });
    }).catch(e => { json(res, 500, { ok: false, error: e.message }); });
    return;
  }

  if (p.startsWith('/api/stream/')) {
    const channelId = decodeURIComponent(p.slice('/api/stream/'.length));
    if (!channelId) { json(res, 400, { ok: false, error: 'channel id required — POST/GET /api/stream/:channelId' }); return; }

    if (method === 'GET') {
      const ch = _channels.get(channelId);
      json(res, 200, { ok: true, channelId, exists: !!ch, history: ch ? ch.history : [], lastActivity: ch ? ch.lastActivity : null });
      return;
    }

    if (method === 'POST') {
      readBody(req).then(body => {
        const prompt = body.prompt;
        if (!prompt) { json(res, 400, { ok: false, error: 'prompt required' }); return; }
        const model = body.model || DEFAULT_MODEL;

        let ch = _channels.get(channelId);
        if (!ch) { ch = { history: [], lastActivity: Date.now() }; _channels.set(channelId, ch); }
        ch.history.push({ role: 'user', content: prompt, ts: Date.now() });
        ch.lastActivity = Date.now();

        // Build ollama's own context param from prior turns, same shape
        // /api/generate itself uses for multi-turn continuity — the channel
        // IS the context, not a new context format invented here.
        const fullPrompt = ch.history.map(h => {
          if (h.role === 'context') return `[CONTEXT] ${h.content}`;
          return `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`;
        }).join('\n') + '\nAssistant:';

        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache',
          'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });

        const reqBody = JSON.stringify({ model, prompt: fullPrompt, stream: true });
        const u = new URL(`${OLLAMA_HOST}/api/generate`);
        let assembled = '';
        const upstream = http.request({
          hostname: u.hostname, port: u.port || 11434, path: u.pathname, method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reqBody) },
        }, upstreamRes => {
          let buf = '';
          upstreamRes.on('data', chunk => {
            buf += chunk.toString();
            const lines = buf.split('\n');
            buf = lines.pop(); // last (possibly incomplete) line stays in buf
            for (const line of lines) {
              if (!line.trim()) continue;
              let parsed;
              try { parsed = JSON.parse(line); } catch (_) { continue; }
              if (parsed.response) assembled += parsed.response;
              res.write(`data: ${JSON.stringify({ channelId, chunk: parsed.response || '', done: !!parsed.done, ts: Date.now() })}\n\n`);
              if (parsed.done) {
                ch.history.push({ role: 'assistant', content: assembled, ts: Date.now() });
                ch.lastActivity = Date.now();
                res.end();
              }
            }
          });
          upstreamRes.on('end', () => { try { res.end(); } catch (_) {} });
        });
        upstream.on('error', e => {
          res.write(`data: ${JSON.stringify({ channelId, error: `ollama unreachable: ${e.message}`, done: true, ts: Date.now() })}\n\n`);
          res.end();
        });
        upstream.write(reqBody);
        upstream.end();
        req.on('close', () => { try { upstream.destroy(); } catch (_) {} });
      }).catch(e => { json(res, 500, { ok: false, error: e.message }); });
      return;
    }

    json(res, 405, { ok: false, error: 'method not allowed — GET or POST' });
    return;
  }

  if (p === '/api/streams') {
    json(res, 200, { ok: true, channels: [..._channels.entries()].map(([id, ch]) => ({ channelId: id, turns: ch.history.length, lastActivity: ch.lastActivity })) });
    return;
  }

  // POST /api/jobs — queue a job
  // POST /api/jobs/tools — real agent-tools loop, separate from /api/jobs
  // since a tool-enabled request has a genuinely different cost/latency
  // profile (multiple model round-trips possible) — a caller opts in,
  // not a silent mode-switch on the plain endpoint.
  if (method === 'POST' && p === '/api/jobs/tools') {
    const body = await readBody(req);
    if (!body.prompt) { json(res, 400, { ok:false, error:'prompt required' }); return; }
    try {
      const result = await _dispatchWithTools(body.prompt, body.model || DEFAULT_MODEL, body.maxIterations);
      json(res, 200, { ok: true, text: result.text, iterations: result.iterations, toolCallLog: result.toolCallLog });
    } catch (e) {
      json(res, 500, { ok: false, error: e.message });
    }
    return;
  }

  if (method === 'POST' && p === '/api/jobs') {
    const body = await readBody(req);
    if (!body.prompt) { json(res, 400, { ok:false, error:'prompt required' }); return; }
    if (!_ollamaOnline) { json(res, 503, { ok:false, error:'Ollama host unreachable' }); return; }

    // §ADDED 2026-07-06 — a job can reference an uploadId from POST
    // /api/upload; the file's plaintext is prepended as real context, not
    // silently dropped if the upload has expired (400, not a job that
    // quietly runs without the file the caller thought it attached).
    let prompt = body.prompt;
    if (body.uploadId) {
      const up = _uploads.get(body.uploadId);
      if (!up) { json(res, 400, { ok:false, error:`uploadId '${body.uploadId}' not found — may have expired` }); return; }
      prompt = `[Uploaded file: ${up.filename}]\n${up.text}\n\n${body.prompt}`;
    }

    const job = {
      uuid:        crypto.randomUUID(),
      prompt,
      model:       body.model || DEFAULT_MODEL,
      maxTokens:   body.maxTokens || config.DEFAULT_MAX_TOKENS,
      timeoutMs:   body.timeoutMs || config.DEFAULT_JOB_TIMEOUT_MS,
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
    // §BUILT 2026-08-18 — James: "highest priority." The real queue was
    // a plain FIFO with zero priority support before this (grepped,
    // confirmed). A genuinely elevated request (e.g. copilot's real "hey
    // nexus" handshake) jumps to the front instead of waiting its turn —
    // real, honest priority, not a label with no effect.
    if (body.priority === 'highest') _queue.unshift(job); else _queue.push(job);
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
    http.get({ hostname: u.hostname, port: u.port || 11434, path: u.pathname, timeout: config.HEALTH_CHECK_TIMEOUT_MS },
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
