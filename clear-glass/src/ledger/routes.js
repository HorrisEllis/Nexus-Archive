'use strict';
/**
 * src/ledger/routes.js — Clear Glass Ledger HTTP routes
 * UUID: cg-ledger-routes-v1-0000-0000-000000000032
 *
 * Mounts onto the IpcBridge Express app.
 * All routes are under /ledger/*.
 *
 * GET  /ledger/tail?n=50          — last N entries (all types)
 * GET  /ledger/errors?n=50        — last N error entries
 * GET  /ledger/query?type=&since= — filtered query
 * GET  /ledger/stats              — counts, uptime, file paths
 * GET  /ledger/cfr?n=50          — co-pilot function results only
 * GET  /ledger/disk?type=        — scan today's NDJSON on disk
 * POST /ledger/flush              — force write pending entries to disk
 * POST /ledger/error              — manually log an error (renderer → main)
 *   body: { message, file, stack, context }
 *
 * Each system (SSE server, copilot, driver, etc.) can POST /ledger/error
 * directly — no bus round-trip needed for error recording.
 */

const { getLedger, ENTRY_TYPE } = require('./engine');

function mountLedgerRoutes(app) {
  // ── Tail — last N entries ─────────────────────────────────────────────
  app.get('/ledger/tail', (req, res) => {
    try {
      const n = Math.min(parseInt(req.query.n || '50', 10), 1000);
      res.json({ ok: true, entries: getLedger().tail(n), n });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── Errors only ───────────────────────────────────────────────────────
  app.get('/ledger/errors', (req, res) => {
    try {
      const n = Math.min(parseInt(req.query.n || '50', 10), 500);
      res.json({ ok: true, entries: getLedger().errors(n), n });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── Filtered query ────────────────────────────────────────────────────
  app.get('/ledger/query', (req, res) => {
    try {
      const { type, entryType, system, since, until, limit, errorsOnly } = req.query;
      const entries = getLedger().query({
        type,
        entryType,
        system,
        since:      since      ? parseInt(since, 10)  : undefined,
        until:      until      ? parseInt(until, 10)  : undefined,
        limit:      limit      ? parseInt(limit, 10)  : 200,
        errorsOnly: errorsOnly === 'true',
      });
      res.json({ ok: true, entries, count: entries.length });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── Stats ─────────────────────────────────────────────────────────────
  app.get('/ledger/stats', (req, res) => {
    try {
      res.json({ ok: true, stats: getLedger().stats() });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── CFR entries (co-pilot function results) ────────────────────────────
  app.get('/ledger/cfr', (req, res) => {
    try {
      const n = Math.min(parseInt(req.query.n || '50', 10), 500);
      const entries = getLedger().query({ entryType: ENTRY_TYPE.CFR, limit: n });
      res.json({ ok: true, entries, n });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── Disk scan — today's full NDJSON ──────────────────────────────────
  app.get('/ledger/disk', async (req, res) => {
    try {
      const { type, entryType, errorsOnly, limit } = req.query;
      const entries = await getLedger().queryDisk({
        type,
        entryType,
        errorsOnly: errorsOnly === 'true',
        limit:      limit ? parseInt(limit, 10) : 500,
      });
      res.json({ ok: true, entries, count: entries.length });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── Force flush ───────────────────────────────────────────────────────
  app.post('/ledger/flush', (req, res) => {
    try {
      getLedger().flush();
      res.json({ ok: true, flushed: true, ts: Date.now() });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── Causal trace proxy — GET /ledger/causal/trace/:eventId ───────────
  // Proxies to Bridge :9999/bridge/trace/:eventId so the co-pilot and UI
  // can do root cause analysis without knowing the Bridge port.
  app.get('/ledger/causal/trace/:eventId', async (req, res) => {
    const BRIDGE_PORT = parseInt(process.env.BRIDGE_PORT || '9999');
    try {
      const data = await _bridgeGet(BRIDGE_PORT, `/bridge/trace/${req.params.eventId}`);
      res.json(data);
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // GET /ledger/causal/query?source=clear-glass&action=driver.error&limit=50
  app.get('/ledger/causal/query', async (req, res) => {
    const BRIDGE_PORT = parseInt(process.env.BRIDGE_PORT || '9999');
    const qs = new URLSearchParams(req.query).toString();
    try {
      const data = await _bridgeGet(BRIDGE_PORT, `/bridge/trace?${qs}`);
      res.json(data);
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // GET /ledger/causal/forensics/:sessionId — full session forensics report
  app.get('/ledger/causal/forensics/:sessionId', async (req, res) => {
    const BRIDGE_PORT = parseInt(process.env.BRIDGE_PORT || '9999');
    try {
      const data = await _bridgeGet(BRIDGE_PORT, `/bridge/trace/session/${req.params.sessionId}?mode=forensics`);
      res.json(data);
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  console.log('[Ledger] Routes mounted: /ledger/{tail,errors,query,stats,cfr,disk,flush,error} + /ledger/causal/{trace,query,forensics}');

  // ── Manual error record (renderer process, renderer console.error) ────
  app.post('/ledger/error', (req, res) => {
    try {
      const { message, file, stack, context, sourceEventId } = req.body || {};
      if (!message) return res.status(400).json({ ok: false, error: 'message required' });

      const err = Object.assign(new Error(message), { stack, code: context?.code });
      const id  = getLedger().recordError(err, {
        file:          file || 'renderer',
        sourceEventId: sourceEventId || null,
        context:       context || {},
      });
      res.json({ ok: true, id });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });
}

// ── Bridge proxy helper ────────────────────────────────────────────────────
function _bridgeGet(port, path) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port, path, method: 'GET',
      headers: { Connection: 'keep-alive' },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ ok: false, raw: d }); } });
    });
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('bridge timeout')); });
    req.on('error', reject);
    req.end();
  });
}

module.exports = { mountLedgerRoutes };
