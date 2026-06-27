'use strict';
/**
 * wire/nexus-wire.js — ErosmancerOS ↔ Clear Glass ↔ NEXUS
 * UUID: wire-nexus-v1-0000-0000-000000000011
 *
 * The three systems speak different languages:
 *   ErosmancerOS — TypeScript EventEmitter, CDP primitives, REST :7432
 *   Clear Glass   — CJS SISO bus, Electron IPC, SSE :7701
 *   NEXUS         — HTTP orchestrator :9000, component registry, SEAM
 *
 * This wire:
 *   1. Registers ErosmancerOS as a NEXUS component (matching registry schema)
 *   2. Bridges ClearDriver → ErosmancerOS for CDP-level node resolution
 *   3. Forwards ErosmancerOS events onto the Clear Glass SISO bus
 *   4. Forwards Clear Glass bus events (driver.exec, dom.*) to ErosmancerOS REST
 *   5. Wires HostileDetection → Clear Glass fingerprint switching
 *   6. Wires AdaptiveLayer → RAID routing weight updates
 *
 * Architecture: both systems remain sovereign.
 * The wire is a bridge, not a merger.
 */

const http    = require('http');
const fetch   = require('node-fetch');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const NEXUS_URL   = process.env.NEXUS_BUS_URL    || 'http://localhost:9000';
const EROS_URL    = process.env.EROS_URL          || 'http://localhost:7432';
const CG_IPC_URL  = process.env.CG_IPC_URL        || 'http://localhost:7702';
const CG_SSE_URL  = process.env.CG_SSE_URL        || 'http://localhost:7701';
const WIRE_PORT   = parseInt(process.env.WIRE_PORT || '7704');

const MODULE_UUID = uuidv4();

// ── ErosmancerOS component declaration ────────────────────────────────────
// Matches lib/component-registry.js schema exactly
const EROS_COMPONENTS = [
  _c('eros.status',     'GET',  '/eros/status',          'ErosmancerOS status — bridge state, nodes, queue'),
  _c('eros.start',      'POST', '/eros/start',           'Start ErosmancerOS and connect CDP bridge'),
  _c('eros.shutdown',   'POST', '/eros/shutdown',        'Shutdown ErosmancerOS'),
  _c('eros.tab.open',   'POST', '/eros/tab/open',        'Open new CDP tab'),
  _c('eros.tab.close',  'POST', '/eros/tab/close',       'Close CDP tab by tabId'),
  _c('eros.tab.list',   'GET',  '/eros/tab/list',        'List open CDP tabs'),
  _c('eros.node.register', 'POST', '/eros/node/register','Register DOM node in NodeRegistry'),
  _c('eros.node.get',      'GET',  '/eros/node/:uuid',   'Get node by UUID'),
  _c('eros.node.sweep',    'POST', '/eros/node/sweep',   'Sweep stale nodes'),
  _c('eros.cmd.click',     'POST', '/eros/cmd/click',    'CDP click — 7-strategy node resolution', {
    tags: ['driver', 'cdp'],
    hooks: {
      in:  [{ id: 'eros.cmd.click.receive', intent: ['click'], contract: 'nexus-interaction-contract-v1::eros', tags: ['cdp'] }],
      out: [{ id: 'eros.cmd.result',        wires_to: ['clear-glass.driver.result.emit'], tags: ['result'] }],
    },
  }),
  _c('eros.cmd.type',      'POST', '/eros/cmd/type',     'CDP type into node'),
  _c('eros.cmd.navigate',  'POST', '/eros/cmd/navigate', 'CDP navigate tab to URL'),
  _c('eros.cmd.evaluate',  'POST', '/eros/cmd/evaluate', 'CDP evaluate JS in tab'),
  _c('eros.cmd.screenshot','POST', '/eros/cmd/screenshot','CDP screenshot of tab'),
  _c('eros.behavior.plan', 'POST', '/eros/behavior/plan','Generate behavior execution plan', {
    tags: ['behavior'],
    hooks: {
      out: [{ id: 'eros.behavior.plan.emit', wires_to: ['cortex.intelligence.event'], tags: ['intelligence'] }],
    },
  }),
  _c('eros.hostile.status','GET',  '/eros/hostile/status','HostileDetection threat level + signals', {
    tags: ['hostile', 'security'],
    hooks: {
      out: [{ id: 'eros.hostile.detected', wires_to: ['clear-glass.context.fp.switch', 'cortex.gaps.open'], tags: ['threat'] }],
    },
  }),
  _c('eros.replay.start',  'POST', '/eros/replay/start', 'Start script replay from checkpoint'),
  _c('eros.adaptive.stats','GET',  '/eros/adaptive/stats','PatternMemory + StrategyOptimizer stats'),
];

function _c(id, method, path, desc, opts = {}) {
  return {
    id, namespace: 'eros', name: id.replace('eros.', ''), version: '0.1.0',
    grammar:      [id.replace(/\./g, ' '), id.replace(/\./g, '-')],
    route:        { method, path },
    description:  desc,
    params:       opts.params      || [],
    tags:         ['eros', ...(opts.tags || [])],
    permissions:  opts.permissions || ['system'],
    hooks:        opts.hooks       || {},
    tier:         opts.tier        || 'T2',
    typecode:     opts.typecode    || null,
  };
}

// ── Wire server — thin HTTP proxy + event bridge ──────────────────────────
const app = express();
app.use(express.json({ limit: '4mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ── Health ────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, module: 'nexus-wire', uuid: MODULE_UUID, ts: Date.now() });
});

// ── ErosmancerOS proxy routes ─────────────────────────────────────────────
app.all('/eros/*path', async (req, res) => {
  const erosPath = req.path.replace('/eros', '').replace('/eros', '') || '/';
  try {
    const upstream = await fetch(`${EROS_URL}/api${erosPath}`, {
      method:  req.method,
      headers: { 'Content-Type': 'application/json' },
      body:    ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
      timeout: 10000,
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'ErosmancerOS unreachable', detail: err.message });
  }
});

// ── Clear Glass command proxy ──────────────────────────────────────────────
app.post('/cg/cmd', async (req, res) => {
  try {
    const result = await fetch(`${CG_IPC_URL}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
      timeout: 10000,
    });
    res.status(result.status).json(await result.json());
  } catch (err) {
    res.status(502).json({ error: 'Clear Glass IPC unreachable', detail: err.message });
  }
});

// ── Hostile detection webhook — ErosmancerOS → Clear Glass ───────────────
// ErosmancerOS calls this when a threat is detected
app.post('/hook/hostile', async (req, res) => {
  const { level, type, tabId, recommendation } = req.body;
  console.log(`[Wire] Hostile detected: ${type} (${level}) on tab ${tabId}`);

  // If high/critical → switch fingerprint on the agent context
  if (level === 'high' || level === 'critical') {
    await fetch(`${CG_IPC_URL}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        eventType: 'context.fp.switch',
        data:      { agentId: tabId, mode: 'firefox', reason: `hostile:${type}` },
      }),
      timeout: 5000,
    }).catch(() => {});

    // Also notify Cortex
    await _notifyNexus('eros.hostile.detected', { level, type, tabId, recommendation });
  }

  res.json({ ok: true });
});

// ── Behavior plan webhook — ErosmancerOS → Cortex intelligence ───────────
app.post('/hook/behavior', async (req, res) => {
  const { planId, profile, variant, meta } = req.body;
  await _notifyNexus('eros.behavior.plan', { planId, profile, variant, meta });
  res.json({ ok: true });
});

// ── ClearDriver → ErosmancerOS bridge ────────────────────────────────────
// When Clear Glass driver.exec arrives for CDP-level actions, route to Eros
app.post('/bridge/driver', async (req, res) => {
  const { action, agentId, ...args } = req.body;

  // Map ClearDriver actions to ErosmancerOS REST endpoints
  const erosEndpoints = {
    'click':         '/api/os/click',
    'type':          '/api/os/type',
    'navigate':      '/api/os/navigate',
    'evaluate':      '/api/os/evaluate',
    'screenshot':    '/api/os/screenshot',
    'waitForSelector': '/api/os/wait',
  };

  const endpoint = erosEndpoints[action];
  if (!endpoint) {
    return res.status(400).json({ error: `No Eros mapping for action: ${action}` });
  }

  try {
    const result = await fetch(`${EROS_URL}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tabId: agentId, ...args }),
      timeout: 30000,
    });
    res.status(result.status).json(await result.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ── NEXUS component registration ──────────────────────────────────────────
async function registerWithNexus() {
  const payload = {
    moduleId:    'erosmancer-os',
    uuid:        MODULE_UUID,
    type:        'cdp-engine',
    version:     '0.1.0',
    capabilities: EROS_COMPONENTS.map(c => c.id),
    hooks: EROS_COMPONENTS.flatMap(c => {
      const ins = c.hooks?.in || [];
      return ins.map(h => ({ name: h.id, direction: 'in', schema: 'any' }));
    }),
    wires: [
      { name: 'eros.cmd.result',       direction: 'out', description: 'CDP command results' },
      { name: 'eros.hostile.detected', direction: 'out', description: 'Threat detection signals' },
      { name: 'eros.behavior.plan',    direction: 'out', description: 'Behavior execution plans' },
      { name: 'eros.node.registered',  direction: 'out', description: 'Node registry events' },
    ],
    wireUrl: `http://localhost:${WIRE_PORT}`,
    ts: Date.now(),
  };

  // Register ErosmancerOS components
  for (const comp of EROS_COMPONENTS) {
    try {
      await fetch(`${NEXUS_URL}/api/components/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(comp),
        timeout: 5000,
      });
    } catch {} // Non-fatal — NEXUS may be starting up
  }

  // Register module in SEAM
  try {
    await fetch(`${NEXUS_URL}/api/seam/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      timeout: 5000,
    });
    console.log('[Wire] ErosmancerOS registered with NEXUS');
  } catch (err) {
    console.warn('[Wire] NEXUS registration failed (will retry):', err.message);
  }
}

async function _notifyNexus(type, data) {
  try {
    await fetch(`${NEXUS_URL}/api/event`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, data, source: 'erosmancer-os', ts: Date.now() }),
      timeout: 3000,
    });
  } catch {}
}

// ── Boot ──────────────────────────────────────────────────────────────────
async function start() {
  await new Promise((resolve, reject) => {
    const server = app.listen(WIRE_PORT, '127.0.0.1', () => {
      console.log(`[Wire] nexus-wire :${WIRE_PORT}`);
      resolve(server);
    });
    server.on('error', reject);
  });

  await registerWithNexus();

  // Heartbeat — re-register every 30s
  setInterval(registerWithNexus, 30000);

  console.log(`[Wire] Ready — ErosmancerOS:${EROS_URL} ↔ ClearGlass:${CG_IPC_URL} ↔ NEXUS:${NEXUS_URL}`);
}

if (require.main === module) {
  start().catch(err => { console.error('[Wire] Boot failed:', err); process.exit(1); });
}

module.exports = { start, EROS_COMPONENTS };
