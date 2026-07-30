'use strict';
/**
 * eravos/server.js — ERAVOS Sovereign System
 * UUID: nexus-eravos-server-v1-0000-2026-0627-jamesbrooks-001
 * Port: 3751
 *
 * ERAVOS is a sovereign system. Not a UI folder. A peer.
 * It has a kernel, runtime, organism registry, wire system,
 * audio engine, catalog, pack loader, and nexus bridge.
 * It registers with orchestrator. RAID routes compose/visualize/sequence
 * intents here. Guardian delivers built organisms here.
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const PORT    = parseInt(process.env.ERAVOS_PORT || '3751');
const ROOT    = __dirname;
const UI_DIR  = path.join(ROOT, 'ui');
const DATA_DIR = path.join(ROOT, '..', 'data', 'eravos');
const ORCH_URL = process.env.ORCHESTRATOR_URL || 'http://127.0.0.1:9000';

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(_) {}

const _cw = require('../lib/cortex-write')('eravos');
const SYSTEM_ID = 'eravos';
const VERSION   = '3.0.0';

// ── In-memory organism state ──────────────────────────────────────────────────
const _mounted    = new Map();   // id → organism descriptor
const _wires      = new Map();   // wireId → { from, to }
const _queue      = [];          // organism packs waiting for browser to install
const _sseClients = new Set();

// ── SSE broadcast ─────────────────────────────────────────────────────────────
function broadcast(type, payload) {
  const msg = `data: ${JSON.stringify({ type, payload, ts: Date.now() })}\n\n`;
  for (const res of _sseClients) {
    try { res.write(msg); } catch(_) { _sseClients.delete(res); }
  }
}

// ── Static file server ────────────────────────────────────────────────────────
const MIME = {
  '.html':'text/html', '.js':'application/javascript',
  '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.svg':'image/svg+xml',
  '.mp3':'audio/mpeg', '.wav':'audio/wav',
};

function serveStatic(res, filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const ext  = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch(_) {
    res.writeHead(404); res.end('Not found');
  }
}

// ── HTTP handler ──────────────────────────────────────────────────────────────
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

  // CORS preflight
  if (method === 'OPTIONS') { json(res, 200, {}); return; }

  // SSE — all eravos events
  if (p === '/events') {
    res.writeHead(200, {
      'Content-Type':'text/event-stream', 'Cache-Control':'no-cache',
      'Connection':'keep-alive', 'Access-Control-Allow-Origin':'*',
    });
    res.write(`data: ${JSON.stringify({ type:'eravos.connected', ts:Date.now() })}\n\n`);
    _sseClients.add(res);
    req.on('close', () => _sseClients.delete(res));
    return;
  }

  // Health
  if (p === '/health') {
    json(res, 200, {
      ok: true, system: SYSTEM_ID, version: VERSION, port: PORT,
      organisms: _mounted.size, wires: _wires.size, queue: _queue.length,
      ts: Date.now(),
    });
    return;
  }

  // Contract
  if (p === '/contract') {
    json(res, 200, require('./registry-components'));
    return;
  }

  // Static UI files
  if (p === '/' || p.startsWith('/ui/') || p === '/index.html') {
    const rel  = p === '/' || p === '/index.html' ? 'index.html'
               : p.replace(/^\/ui\//, '');
    serveStatic(res, path.join(UI_DIR, rel));
    return;
  }

  // ── API routes ────────────────────────────────────────────────────────────

  // GET /api/organisms
  if (method === 'GET' && p === '/api/organisms') {
    json(res, 200, { ok:true, organisms: [..._mounted.values()] });
    return;
  }

  // POST /api/organisms — spawn
  if (method === 'POST' && p === '/api/organisms') {
    const body = await readBody(req);
    if (!body.id) { json(res, 400, { ok:false, error:'id required' }); return; }
    const org = {
      uuid:      crypto.randomUUID(),
      id:        body.id,
      name:      body.name || body.id,
      category:  body.category || 'general',
      spawnedAt: Date.now(),
      config:    body.config || {},
    };
    _mounted.set(org.uuid, org);
    broadcast('eravos.organism.spawned', org);
    json(res, 200, { ok:true, organism: org });
    return;
  }

  // DELETE /api/organisms/:uuid
  if (method === 'DELETE' && p.startsWith('/api/organisms/')) {
    const uuid = p.split('/')[3];
    const org  = _mounted.get(uuid);
    if (!org) { json(res, 404, { ok:false, error:'not found' }); return; }
    _mounted.delete(uuid);
    broadcast('eravos.organism.removed', { uuid, id: org.id });
    json(res, 200, { ok:true, removed: uuid });
    return;
  }

  // GET /api/wires
  if (method === 'GET' && p === '/api/wires') {
    json(res, 200, { ok:true, wires: [..._wires.values()] });
    return;
  }

  // POST /api/wires — connect hookId → hookId
  if (method === 'POST' && p === '/api/wires') {
    const body = await readBody(req);
    if (!body.from || !body.to) {
      json(res, 400, { ok:false, error:'from and to hookIds required' }); return;
    }
    const wire = { uuid: crypto.randomUUID(), from: body.from, to: body.to, ts: Date.now() };
    _wires.set(wire.uuid, wire);
    broadcast('eravos.wire.connected', wire);
    json(res, 200, { ok:true, wire });
    return;
  }

  // DELETE /api/wires/:uuid
  if (method === 'DELETE' && p.startsWith('/api/wires/')) {
    const uuid = p.split('/')[3];
    _wires.delete(uuid);
    broadcast('eravos.wire.disconnected', { uuid });
    json(res, 200, { ok:true, removed: uuid });
    return;
  }

  // GET /api/catalog
  if (method === 'GET' && p === '/api/catalog') {
    // Read organism manifests from ui/organisms/
    const orgsDir = path.join(UI_DIR, 'organisms');
    let organisms = [];
    try {
      organisms = fs.readdirSync(orgsDir)
        .filter(d => fs.statSync(path.join(orgsDir, d)).isDirectory())
        .map(id => {
          try {
            const s = fs.readFileSync(path.join(orgsDir, id, 'schema', 'manifest.json'), 'utf8');
            return { id, ...JSON.parse(s) };
          } catch(_) { return { id, name: id }; }
        });
    } catch(_) {}
    json(res, 200, { ok:true, organisms });
    return;
  }

  // POST /api/pack/install — receive organism zip from Guardian/NEXUS build
  if (method === 'POST' && p === '/api/pack/install') {
    const body = await readBody(req);
    _queue.push({ uuid: crypto.randomUUID(), ...body, ts: Date.now() });
    broadcast('eravos.pack.queued', body);
    json(res, 200, { ok:true, queued: _queue.length });
    return;
  }

  // GET /api/organism-queue — browser polls this to pick up built organisms
  if (method === 'GET' && p === '/api/organism-queue') {
    const item = _queue.shift() || null;
    json(res, 200, { ok:true, item, remaining: _queue.length });
    return;
  }

  // Transport
  if (p.startsWith('/api/transport')) {
    if (method === 'GET') {
      json(res, 200, { ok:true, playing:false, bpm:120 }); return;
    }
    if (method === 'POST') {
      const action = p.split('/')[3];
      broadcast(`eravos.transport.${action}`, {});
      json(res, 200, { ok:true, action }); return;
    }
  }

  res.writeHead(404); res.end('Not found');
});

// ── Register with orchestrator ────────────────────────────────────────────────
function register() {
  const components = require('../lib/component-registry').normalizeDeclarations(require('./registry-components'));
  const body = JSON.stringify({
    systemId: SYSTEM_ID, port: PORT, version: VERSION,
    status: 'online', meta: { label:'ERAVOS', color:'#a78bfa' },
    components,
  });
  const u = new URL(`${ORCH_URL}/api/register`);
  const req = http.request({
    hostname: u.hostname, port: u.port || 9000,
    path: u.pathname, method: 'POST',
    headers: { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) },
    timeout: 4000,
  }, r => {
    let d = ''; r.on('data', c => d += c);
    r.on('end', () => console.log(`[eravos] registered with orchestrator`));
  });
  req.on('error', () => setTimeout(register, 5000));
  req.write(body); req.end();
}

server.listen(PORT, () => {
  console.log(`[eravos] :${PORT} — sovereign canvas system`);
  broadcast('eravos.booted', { version: VERSION, port: PORT });
  setTimeout(register, 1000);
});

module.exports = { server };
