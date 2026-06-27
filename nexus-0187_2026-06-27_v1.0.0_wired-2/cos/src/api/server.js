'use strict';
/**
 * cos/src/api/server.js — COS Host API
 * UUID: cos-api-v1-0000-0000-000000000016
 * Phase: 3 — Host API (wraps all CLI commands)
 *
 * REST + SSE. The CLI reads this. The UI floats on this.
 * NEXUS registers COS as a component through this server.
 *
 * §COS-3.1: This layer exists AFTER kernel + CLI. API wraps CLI, not kernel directly.
 */

const express  = require('express');
const http     = require('http');
const fetch    = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { Event } = require('../../../clear-glass-v3/siso/index');

const CosKernel            = require('../kernel/index');
const { BrowserDriver, CdpDriver, NodeDriver } = require('../compartments/drivers');
const { COMPARTMENT_TYPES, COMPARTMENT_STATES } = require('../foundation/index');

const PORT       = parseInt(process.env.COS_PORT    || '7705');
const NEXUS_URL  = process.env.NEXUS_BUS_URL        || 'http://localhost:9000';
const MODULE_UUID = uuidv4();

// ── SSE clients ────────────────────────────────────────────────────────────
const sseClients = new Set();

function sseEmit(type, data) {
  const line = `event: ${type}\ndata: ${JSON.stringify({ ...data, _cos: true, ts: Date.now() })}\n\n`;
  const dead = [];
  for (const res of sseClients) {
    try { res.write(line); }
    catch { dead.push(res); }
  }
  dead.forEach(r => sseClients.delete(r));
}

// ── Kernel ─────────────────────────────────────────────────────────────────
const kernel = new CosKernel({ nexusBusUrl: NEXUS_URL, sseEmit });

// Register drivers
const nodeDriver    = new NodeDriver({ onOutput: sseEmit });
const browserDriver = new BrowserDriver();
const cdpDriver     = new CdpDriver();

kernel.registerDriver('browser',  browserDriver);
kernel.registerDriver('cdp',      cdpDriver);
kernel.registerDriver('node',     nodeDriver);
kernel.registerDriver('python',   new NodeDriver({ onOutput: sseEmit })); // same interface, different cmd
kernel.registerDriver('shell',    new NodeDriver({ onOutput: sseEmit }));

// Forward kernel bus events to SSE
kernel.on('*', (event) => {
  sseEmit(event.type, event.data);
});

// ── Express app ────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

app.use(express.json({ limit: '4mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── SSE stream ─────────────────────────────────────────────────────────────
app.get('/events', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  sseEmit.call(null, 'cos.identity', { moduleId: 'cos', uuid: MODULE_UUID, port: PORT });

  sseClients.add(res);
  const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch { clearInterval(ping); } }, 20000);
  req.on('close', () => { clearInterval(ping); sseClients.delete(res); });
});

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, module: 'cos', uuid: MODULE_UUID, port: PORT, ts: Date.now() });
});

// ── Compartment API ────────────────────────────────────────────────────────

// Create compartment
app.post('/api/compartments', (req, res) => {
  const { type, name, url, config = {} } = req.body;
  const requestId = uuidv4();

  // Listen for created response
  const unsub = kernel.on('compartment.created', (event) => {
    if (event.data.requestId === requestId) {
      unsub();
      res.json({ ok: true, compartmentId: event.data.compartmentId, type, name });
    }
  });
  const errUnsub = kernel.on('compartment.error', (event) => {
    if (event.data.requestId === requestId) {
      errUnsub();
      res.status(400).json({ error: event.data.error });
    }
  });

  kernel.emit('compartment.create', { type, config: { name, url, ...config }, requestId });

  setTimeout(() => { unsub(); errUnsub(); if (!res.headersSent) res.status(504).json({ error: 'timeout' }); }, 5000);
});

// Start compartment
app.post('/api/compartments/:id/start', (req, res) => {
  const { id } = req.params;
  const record  = kernel.getCompartment(id);
  if (!record) return res.status(404).json({ error: 'Not found' });

  const unsub    = kernel.on('compartment.started', (e) => { if (e.data.compartmentId === id) { unsub(); errUnsub(); res.json({ ok: true, ...e.data }); } });
  const errUnsub = kernel.on('compartment.error',   (e) => { if (e.data.compartmentId === id) { unsub(); errUnsub(); res.status(500).json({ error: e.data.error }); } });

  kernel.emit('compartment.start', { compartmentId: id });
  setTimeout(() => { unsub(); errUnsub(); if (!res.headersSent) res.status(504).json({ error: 'start timeout' }); }, 30000);
});

// Stop compartment
app.post('/api/compartments/:id/stop', (req, res) => {
  kernel.emit('compartment.stop', { compartmentId: req.params.id });
  res.json({ ok: true });
});

// Destroy compartment
app.delete('/api/compartments/:id', (req, res) => {
  kernel.emit('compartment.destroy', { compartmentId: req.params.id });
  res.json({ ok: true });
});

// List compartments
app.get('/api/compartments', (req, res) => {
  res.json({ compartments: kernel.listCompartments() });
});

// Get single compartment
app.get('/api/compartments/:id', (req, res) => {
  const record = kernel.getCompartment(req.params.id);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
});

// Snapshot
app.post('/api/compartments/:id/snapshot', (req, res) => {
  const unsub = kernel.on('compartment.snapshotted', (e) => {
    if (e.data.compartmentId === req.params.id) { unsub(); res.json(e.data); }
  });
  kernel.emit('compartment.snapshot', { compartmentId: req.params.id });
  setTimeout(() => { unsub(); if (!res.headersSent) res.status(504).json({ error: 'timeout' }); }, 10000);
});

// Hot-swap
app.post('/api/compartments/swap', (req, res) => {
  const { fromId, toId } = req.body;
  kernel.emit('compartment.swap', { fromId, toId });
  res.json({ ok: true });
});

// Send command to compartment
app.post('/api/compartments/:id/cmd', (req, res) => {
  const { id }    = req.params;
  const { event: eventType, data = {} } = req.body;

  if (!eventType) return res.status(400).json({ error: 'event required' });

  kernel.emit(eventType, { compartmentId: id, ...data });
  res.json({ ok: true, emitted: eventType });
});

// ── Host system map ────────────────────────────────────────────────────────
app.get('/api/system-map', (req, res) => {
  res.json({
    compartments: kernel.listCompartments(),
    drivers:      ['browser', 'cdp', 'node', 'python', 'shell'],
    busLog:       kernel.busLog(),
    ts:           Date.now(),
  });
});

app.get('/api/bus/log', (req, res) => {
  res.json(kernel.busLog());
});

// ── NEXUS registration ─────────────────────────────────────────────────────
const COS_COMPONENTS = [
  _c('cos.health',         'GET',  '/health',                     'COS health check'),
  _c('cos.events',         'GET',  '/events',                     'COS SSE event stream', { tags: ['stream'] }),
  _c('cos.system-map',     'GET',  '/api/system-map',             'Live graph of all compartments'),
  _c('cos.compartment.create','POST','/api/compartments',         'Create a new compartment', { typecode: 'COS-CMP-001' }),
  _c('cos.compartment.start', 'POST','/api/compartments/:id/start','Start a compartment', { typecode: 'COS-CMP-002' }),
  _c('cos.compartment.stop',  'POST','/api/compartments/:id/stop', 'Stop a compartment' }),
  _c('cos.compartment.destroy','DELETE','/api/compartments/:id',  'Destroy compartment' }),
  _c('cos.compartment.list',  'GET', '/api/compartments',         'List all compartments' }),
  _c('cos.compartment.get',   'GET', '/api/compartments/:id',     'Get compartment detail' }),
  _c('cos.compartment.snapshot','POST','/api/compartments/:id/snapshot','Snapshot compartment state' }),
  _c('cos.compartment.swap',  'POST','/api/compartments/swap',    'Hot-swap two compartments (§COS-7.1)' }),
  _c('cos.compartment.cmd',   'POST','/api/compartments/:id/cmd', 'Send event to compartment' }),
  _c('cos.bus.log',        'GET',  '/api/bus/log',                'COS SISO host bus log' }),
];

function _c(id, method, path, desc, opts = {}) {
  return { id, namespace: 'cos', name: id.replace('cos.',''), version: '1.0.0',
    grammar: [id.replace(/\./g,' ')], route: { method, path }, description: desc,
    params: [], tags: ['cos', ...(opts.tags||[])], permissions: ['system'],
    hooks: opts.hooks||{}, typecode: opts.typecode||null };
}

async function registerWithNexus() {
  for (const comp of COS_COMPONENTS) {
    try {
      await fetch(`${NEXUS_URL}/api/components/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comp), timeout: 5000,
      });
    } catch {}
  }
  try {
    await fetch(`${NEXUS_URL}/api/seam/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId: 'cos', uuid: MODULE_UUID, type: 'host-os', version: '1.0.0',
        capabilities: COS_COMPONENTS.map(c => c.id),
        sse: { port: PORT, path: '/events' },
        ts: Date.now(),
      }),
      timeout: 5000,
    });
    console.log('[COS] Registered with NEXUS');
  } catch (err) {
    console.warn('[COS] NEXUS registration failed:', err.message);
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────
async function start() {
  await new Promise((resolve, reject) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[COS] Host API :${PORT}`);
      resolve();
    });
    server.on('error', reject);
  });

  await registerWithNexus();
  setInterval(registerWithNexus, 30000);

  kernel.emit('host.status', {});
  console.log('[COS] Ready ✓');
}

if (require.main === module) {
  start().catch(err => { console.error('[COS] Boot failed:', err); process.exit(1); });
}

module.exports = { start, kernel, app };
