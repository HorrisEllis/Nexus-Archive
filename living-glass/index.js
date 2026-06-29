'use strict';
/**
 * living-glass/index.js — Living Glass Meta-System
 * UUID: living-glass-v1-0000-0000-000000000001
 * Port: :7800
 *
 * Living Glass sits above every NEXUS system.
 * It does not replace them — it watches them, maps them, and fires when they break.
 *
 * Three sovereign roles:
 *
 *   1. FIELD MONITOR — subscribes to every system's SSE, polls health, reads
 *      component registry. Builds a live relational field: which components exist,
 *      which are online, which have open gaps, what their causal sigma is.
 *
 *   2. DIAGNOSTIC FIRE ENGINE — when a gap opens or a system degrades, the
 *      diagnostic engine suite (12 engines) runs immediately. Root cause is
 *      traced through the causal graph. A repair contract is created in JAA.
 *      The heal loop is engaged. All of this is automatic and logged.
 *
 *   3. AUTOPILOT FEED — every event from every system, correlated and
 *      annotated, feeds into the co-pilot consciousness stream. The co-pilot
 *      always knows the full system state.
 *
 * HTTP :7800:
 *   GET  /health                     — liveness
 *   GET  /field                      — full relational field snapshot
 *   GET  /components                 — all registered components across all systems
 *   GET  /components/:id             — single component detail + live status
 *   GET  /gaps                       — all open gaps, annotated with causal trace
 *   GET  /gaps/:id/trace             — causal trace for a specific gap
 *   GET  /fires                      — active diagnostic contracts (fires being fought)
 *   GET  /fires/:id                  — single fire detail: contract + diagnosis + repair
 *   POST /fires/:id/dispatch         — manually trigger repair dispatch
 *   GET  /sigma                      — causal sigma per component (health field)
 *   GET  /sse                        — live event stream (all systems, correlated)
 *   GET  /contract                   — NEXUS interaction contract for this system
 *
 * §AXIOM §1.2: nothing silently fails
 * §AXIOM §3.1: bottom-up boot — field before UI, data before routes
 * §AXIOM §2.3: all state observable
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const { FieldMonitor }       = require('./src/field-monitor');
const { DiagnosticFireEngine } = require('./src/diagnostic-fire-engine');
const { AutopilotBroadcast } = require('./src/autopilot-broadcast');
const { EventLedger }        = require('./src/event-ledger');
const COMPONENTS             = require('./registry/components');
const nc                     = require('../nexus-connect');

const PORT       = parseInt(process.env.LIVING_GLASS_PORT || '7800');
const MODULE_ID  = 'living-glass';
const VERSION    = '1.0.0';
const ROOT       = path.join(__dirname, '..');
const DATA_DIR   = path.join(ROOT, 'data', 'living-glass');

// ── SSE clients ───────────────────────────────────────────────────────────────
const _sseClients = new Set();
function _pushSSE(type, data) {
  const line = `data: ${JSON.stringify({ type, data, ts: Date.now() })}\n\n`;
  for (const res of _sseClients) {
    try { res.write(line); } catch (_) { _sseClients.delete(res); }
  }
}

// ── Singletons ────────────────────────────────────────────────────────────────
let _field    = null;
let _fire     = null;
let _autopilot= null;
let _ledger   = null;

// ── Boot ───────────────────────────────────────────────────────────────────────
async function boot() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`[LivingGlass v${VERSION}] booting…`);

  // 0. Event ledger — first so nothing is missed
  _ledger = new EventLedger({ dir: path.join(DATA_DIR, 'ledger'), moduleId: MODULE_ID });
  _ledger.init();

  // 1. Field monitor — subscribes to all system SSE, polls health
  _field = new FieldMonitor({
    dataDir:   DATA_DIR,
    onEvent:   (ev) => { _ledger.record(ev); _pushSSE(ev.type, ev.data); },
    onGapOpen: (gap) => _fire?.onGapOpen(gap),
    onOffline: (sys) => _fire?.onSystemOffline(sys),
  });
  await _field.start();

  // 2. Diagnostic fire engine — watches gaps, fires 12-engine diagnosis, engages heal loop
  _fire = new DiagnosticFireEngine({
    dataDir:   DATA_DIR,
    field:     _field,
    ledger:    _ledger,
    onFire:    (fire) => { _pushSSE('living-glass.fire.opened', fire); },
    onResolved:(fire) => { _pushSSE('living-glass.fire.resolved', fire); },
  });
  await _fire.start();

  // 3. Autopilot broadcast — aggregates all field events → SSE
  _autopilot = new AutopilotBroadcast({
    field:     _field,
    fire:      _fire,
    pushSSE:   _pushSSE,
    ledger:    _ledger,
  });
  _autopilot.start();

  // 4. Register with orchestrator
  const reg = await nc.registerWithOrchestrator(MODULE_ID, PORT, {
    role: 'meta-monitor', version: VERSION,
  }, COMPONENTS).catch(() => ({ ok: false }));
  if (reg.ok) {
    nc.startHeartbeat(MODULE_ID, PORT);
    console.log(`[LivingGlass] registered with orchestrator :9000`);
  } else {
    console.log(`[LivingGlass] orchestrator offline — running standalone`);
  }

  // 5. HTTP server
  await _startServer();

  _ledger.record({ type: 'living-glass.boot.complete', data: { version: VERSION, port: PORT } });
  console.log(`[LivingGlass v${VERSION}] ✓ ready :${PORT}`);
}

// ── HTTP server ───────────────────────────────────────────────────────────────
function _startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(_handler);
    server.listen(PORT, '127.0.0.1', resolve);
    server.on('error', reject);
  });
}

async function _handler(req, res) {
  const u      = new URL(req.url, `http://localhost:${PORT}`);
  const M      = req.method;
  const p      = u.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (M === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  function json(code, data) {
    if (res.headersSent) return;
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  try {
    // ── Health ───────────────────────────────────────────────────────────
    if (p === '/health' && M === 'GET') {
      return json(200, {
        ok: true, system: MODULE_ID, version: VERSION,
        port: PORT, uptime: process.uptime(),
        field: _field?.summary() || null,
        fires: _fire?.activeFires().length || 0,
        ts: Date.now(),
      });
    }

    // ── Contract ─────────────────────────────────────────────────────────
    if (p === '/contract' && M === 'GET') {
      return json(200, { ok: true, system: MODULE_ID, version: VERSION, routes: COMPONENTS.map(c => ({
        method: c.route.method, path: c.route.path, id: c.id, description: c.description
      }))});
    }

    // ── Relational field snapshot ─────────────────────────────────────────
    if (p === '/field' && M === 'GET') {
      return json(200, { ok: true, field: _field?.snapshot() || {} });
    }

    // ── Components ────────────────────────────────────────────────────────
    if (p === '/components' && M === 'GET') {
      const ns   = u.searchParams.get('namespace');
      const sys  = u.searchParams.get('system');
      const tags = u.searchParams.get('tags');
      return json(200, {
        ok: true,
        components: _field?.allComponents({ namespace: ns, system: sys, tags: tags?.split(',') }) || [],
      });
    }

    const compMatch = p.match(/^\/components\/(.+)$/);
    if (compMatch && M === 'GET') {
      const id = decodeURIComponent(compMatch[1]);
      const comp = _field?.getComponent(id);
      if (!comp) return json(404, { ok: false, error: `component not found: ${id}` });
      return json(200, { ok: true, component: comp });
    }

    // ── Gaps ──────────────────────────────────────────────────────────────
    if (p === '/gaps' && M === 'GET') {
      const severity = u.searchParams.get('severity');
      const system   = u.searchParams.get('system');
      return json(200, {
        ok: true,
        gaps: _field?.allGaps({ severity, system }) || [],
        count: _field?.allGaps({ severity, system }).length || 0,
      });
    }

    const gapTraceMatch = p.match(/^\/gaps\/([^/]+)\/trace$/);
    if (gapTraceMatch && M === 'GET') {
      const gapId = gapTraceMatch[1];
      const trace = await _field?.traceGap(gapId) || null;
      return json(200, { ok: true, gapId, trace });
    }

    // ── Fires (active diagnostic contracts) ───────────────────────────────
    if (p === '/fires' && M === 'GET') {
      return json(200, { ok: true, fires: _fire?.activeFires() || [] });
    }

    const fireMatch = p.match(/^\/fires\/([^/]+)$/);
    if (fireMatch && M === 'GET') {
      const id   = fireMatch[1];
      const fire = _fire?.getFire(id);
      if (!fire) return json(404, { ok: false, error: `fire not found: ${id}` });
      return json(200, { ok: true, fire });
    }

    const dispatchMatch = p.match(/^\/fires\/([^/]+)\/dispatch$/);
    if (dispatchMatch && M === 'POST') {
      const id   = dispatchMatch[1];
      const body = await _readBody(req);
      const result = await _fire?.dispatchRepair(id, body?.provider || 'claude');
      return json(200, { ok: true, result });
    }

    // ── Sigma field (causal health per component) ─────────────────────────
    if (p === '/sigma' && M === 'GET') {
      return json(200, { ok: true, sigma: _field?.sigmaField() || {} });
    }

    // ── Ledger tail ───────────────────────────────────────────────────────
    if (p === '/ledger' && M === 'GET') {
      const n = parseInt(u.searchParams.get('n') || '50');
      return json(200, { ok: true, entries: _ledger?.tail(n) || [] });
    }

    // ── SSE stream ────────────────────────────────────────────────────────
    if (p === '/sse' && M === 'GET') {
      res.writeHead(200, {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(':ok\n\n');
      _sseClients.add(res);
      req.on('close', () => _sseClients.delete(res));
      // Immediately push current field snapshot
      res.write(`data: ${JSON.stringify({ type: 'living-glass.field.snapshot', data: _field?.summary(), ts: Date.now() })}\n\n`);
      return;
    }

    json(404, { ok: false, error: `no route: ${M} ${p}` });
  } catch (e) {
    console.error(`[LivingGlass §1.2] ${M} ${p}:`, e.message);
    _ledger?.recordError(e, { file: 'living-glass/index.js', context: { method: M, path: p } });
    json(500, { ok: false, error: e.message });
  }
}

function _readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ── CLI ───────────────────────────────────────────────────────────────────────
if (require.main === module) {
  boot().catch(e => {
    console.error('[LivingGlass FATAL]', e.message);
    process.exit(1);
  });
}

module.exports = { boot, PORT, MODULE_ID };
