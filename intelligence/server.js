'use strict';
/**
 * intelligence/server.js — NEXUS Intelligence Service v1.0.0
 * UUID: nexus-intelligence-server-v1-0000-2026-0822-jamesbrooks-001
 * Port: 3753
 *
 * The intelligence system is NEXUS's cognition + system-health layer,
 * extracted from cortex/lib/meta across 4 real phases this session (see
 * intelligence/spec/intelligence.spec for the full record). This is the
 * first time it runs as its own real, standalone process — every real
 * function it exposes already existed and was already tested; this file
 * is the wiring, not new logic.
 *
 * Routes (matches intelligence/registry-components.js exactly):
 *   GET  /health                        — liveness
 *   GET  /api/intelligence/patterns     — crystallised behavioral patterns
 *   GET  /api/intelligence/context      — assembled intelligence context
 *   GET  /api/intelligence/status       — intelligence subsystem health
 *   GET  /api/intelligence/failures     — failure mode index
 *   GET  /api/intelligence/reuse        — reuse index
 *   GET  /api/intelligence/map          — real, live loom map
 *   POST /api/adversarial               — inner-critic reconciliation
 *   GET  /cfr/field                     — CFR field state
 *   GET  /cfr/health                    — CFR ledger health
 *   GET  /cfr/events                    — CFR event ledger tail
 *   GET  /cfr/sse                       — CFR real-time stream (ledger's own, built-in)
 *   POST /api/framework/create          — generate a real WARP framework skeleton
 *   GET  /sse                           — general intelligence event stream
 *   GET  /api/meta/status               — relocated meta faculties (§MIGRATION 2026-08-22)
 *   GET  /api/gaps/tension              — measured strain per gap (rate/accel/recency)
 *   POST /api/gaps/friction             — compare two gap surveys
 *   GET  /api/liminal-space/status      — liminal-space status (§MIGRATION 2026-08-22)
 *   GET  /api/liminal-space/list        — liminal-space list (§MIGRATION 2026-08-22)
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const config = require('./config.js');
const PORT = config.PORT;
const DATA_DIR = config.DATA_DIR;
const CORTEX_PORT = parseInt(process.env.NEXUS_PORT || '3748', 10);

const intelligence = require('./index.js');
const { createCFRLedger } = require('./cfr');
const frameworkBuilder = require('./framework-builder.js');
const liminalSpace = require('./liminal-space');

// §DEDUP 2026-08-22 — replaces the getField this used to receive only when
// cortex/boot.js ran a second copy of this whole module in-process (see
// cortex/boot.js's removed init() call for the full account). This process
// is now the only one that scans, so field enrichment has to reach across
// the wire to cortex, the real owner of _field. intelligence/index.js's
// _enrichCrystallisation calls _cfg.getField() SYNCHRONOUSLY and reads
// .regime/.friction straight off the result — confirmed by reading that
// function before wiring this, not assumed — so getField itself must stay
// sync. The real network fetch runs on its own interval below; getField
// just returns whatever it last found. A stale-but-known field beats
// blocking the scan loop on a network round trip, and an unreachable
// cortex degrades to the last known value (or null, reported honestly by
// _enrichCrystallisation's own existing catch) rather than a fabricated one.
let _fieldCache = null;
function _refreshCortexField() {
  const req = http.get({ hostname: '127.0.0.1', port: CORTEX_PORT, path: '/cfr/field', timeout: 1500 }, (r) => {
    let d = ''; r.on('data', c => d += c);
    r.on('end', () => { try { _fieldCache = JSON.parse(d); } catch (_) { /* keep last known */ } });
  });
  req.on('error', () => { /* keep last known — cortex unreachable this tick */ });
  req.on('timeout', () => req.destroy());
}
function _getCortexField() { return _fieldCache; }

const { Stream, Event } = require('../warp/core');

// ── Real event ledger — reused directly, not rebuilt (§8.6). onGap is a
// real, already-existing extension point (confirmed by reading ledger.js
// directly — fires for real sigma spikes and delta-tension conditions);
// relayed into systemStream so the SSE genuinely reflects real CFR
// activity, not just framework creation. ───────────────────────────────────
const ledger = createCFRLedger({
  ledgerDir: DATA_DIR, systemId: 'intelligence', maxHistory: config.MAX_LEDGER_HISTORY,
  onGap: (gap) => systemStream.emit(new Event('intelligence.cfr.gap', gap)),
});

// Real pattern-crystallisation events, relayed from the shared nexus-bus
// (intelligence/index.js's own real bus.emit — confirmed the only one
// that exists) into the system stream, same reasoning as onGap above.
try {
  require('../nexus-bus').on('cortex.intelligence.pattern_crystallised', (data) => {
    systemStream.emit(new Event('intelligence.pattern.crystallised', data));
  });
} catch (e) { console.warn(`[intelligence] pattern-crystallisation relay unavailable: ${e.message}`); }

// ── Real, general system-event stream — James: "ring buffer." WARP's own
// Stream already has one (tail()/since()), plus real SSE subscription —
// reused whole, not hand-rolled. Every real system-level event (framework
// created, etc.) emits here, so a late-connecting SSE client gets real
// recent history via tail(), not just whatever happens after it connects.
const systemStream = new Stream({ ringCap: config.RING_CAP });

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch (_) { resolve({}); } });
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const u = url.parse(req.url, true);
  const pathname = u.pathname;

  if (pathname === '/api/commands/history') {
    const rows = require('../cortex/memory/jaa-db.js').jaaDB.query('event_log', r => r.type === 'intelligence.command.invoked', 200);
    json(res, 200, { ok: true, history: rows.sort((a, b) => b.ts - a.ts), total: rows.length });
    return;
  }

  if (pathname === '/api/commands') { json(res, 200, { ok: true, commands: require('./registry-components.js') }); return; }

  // §WIRED 2026-08-22 — James named this gap directly: the static
  // registry is WHAT'S possible, not a real, queryable history of what
  // actually happened. Logging every real request into the same real
  // event_log every other real event this session already uses — a
  // genuine command index, not just documentation.
  try {
    require('../cortex/memory/jaa-db.js').jaaDB.insert('event_log', {
      type: 'intelligence.command.invoked', method: req.method, path: pathname, ts: Date.now(),
    });
  } catch (_) { /* logging failure never blocks the real request */ }

  if (pathname === '/health') { json(res, 200, { ok: true, system: 'intelligence', port: PORT, ts: Date.now() }); return; }

  if (pathname === '/sse') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });
    // Real ring-buffer history first, so a late-connecting client isn't
    // starting blind — genuinely different from a bare 'connected' ping.
    for (const stamped of systemStream.tail(50)) res.write(`data: ${JSON.stringify(stamped)}\n\n`);
    const unsubscribe = systemStream.subscribeSSE(res);
    req.on('close', unsubscribe);
    return;
  }

  // Real CFR routes, including its own built-in /cfr/sse — reused whole.
  if (pathname.startsWith('/cfr')) {
    if (ledger.handleCFRRoute(req, res, u)) return;
  }

  if (pathname === '/api/framework/create' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body.name) { json(res, 400, { ok: false, error: 'name required' }); return; }
    try {
      const result = frameworkBuilder.drop(body.name, { agent: body.agent, description: body.description, tags: body.tags });
      systemStream.emit(new Event('intelligence.framework.created', result));
      json(res, 200, result);
    } catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  if (pathname === '/api/adversarial' && req.method === 'POST') {
    const body = await readBody(req);
    try { json(res, 200, { ok: true, ...require('./adversarial.js').compare(body) }); }
    catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  // §MIGRATION 2026-08-22 — the module (intelligence/liminal-space) has
  // been real since MIGRATION-CHUNKS-1-3.md chunk 3; this is just its
  // first HTTP door, matching cortex's now-retired copy exactly.
  if (pathname === '/api/liminal-space/status' && req.method === 'GET') {
    json(res, 200, liminalSpace.status());
    return;
  }
  if (pathname === '/api/liminal-space/list' && req.method === 'GET') {
    const fp = u.query.focalPoint || undefined;
    json(res, 200, { ok: true, items: liminalSpace.list(fp) });
    return;
  }

  // The rest of the real routes already exist as intelligence/index.js's
  // own handleRequest() — reused directly, not reimplemented.
  const body = (req.method === 'POST') ? await readBody(req) : null;
  const handled = intelligence.handleRequest(
    req.method, pathname, u.query ? new URLSearchParams(u.query) : null, body,
    (status, data) => json(res, status, data)
  );
  if (handled) return;

  json(res, 404, { ok: false, error: `no route for ${req.method} ${pathname}` });
});

let _fieldRefreshInterval = null;
function start() {
  ledger.open();
  _refreshCortexField(); // don't wait a full interval for the first real value
  _fieldRefreshInterval = setInterval(_refreshCortexField, 4000);
  intelligence.init({ getField: _getCortexField });
  server.listen(PORT, () => {
    console.log(`[intelligence] :${PORT} — v1.0.0 — cognition + system-health layer online`);
  });
  return server;
}

function stop() {
  try { ledger.close && ledger.close(); } catch (_) {}
  try { intelligence.stop && intelligence.stop(); } catch (_) {}
  if (_fieldRefreshInterval) clearInterval(_fieldRefreshInterval);
  server.close();
}

if (require.main === module) start();

module.exports = { start, stop, server, systemStream, MODULE_ID: 'intelligence.server', VERSION: '1.0.0' };
