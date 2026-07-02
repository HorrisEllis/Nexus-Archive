'use strict';
/**
 * loom/server.js — Sovereign LOOM system
 * comp_id: nexus.loom.server
 * UUID: nexus-loom-server-v1-0000-2026-0702-jamesbrooks-001
 * Port: 3752
 *
 * §GAP CLOSED 2026-07-02: LOOM (component/hook/wire/seam registry +
 * contracts) has existed since phase 121 as a pure library — LoomDriver
 * and LoomContracts, required in-process by whatever needed the
 * registry. loom/schema/index.js's own header comment names this
 * explicitly: "this is CLI/API's future entry point (Phase 132/133)" —
 * the API layer was planned, never built. Every other real system in
 * NEXUS follows nexus-system-foundation.spec's L0-L5 shape and has a
 * process, a port, and a handshake with the orchestrator. LOOM had L0
 * (schema/registry) and an L2-adjacent CLI, nothing else. This file is
 * L3 (API) + L4 (handshake) — the same boot pattern copilot/server.js
 * and eravos/server.js already use, not a new pattern invented here.
 *
 * Read-only surface wraps LoomDriver.registry directly (has/get/all/
 * graph — already disk-first, already re-reads before every read per
 * the phase-157 staleness fix). Write surface wraps declare() and the
 * three LoomContracts lifecycle calls. Nothing here reimplements gate/
 * axiom logic — this is transport only, same as every other system's
 * server.js is transport in front of its own lib/.
 */

const http = require('http');
const { LoomDriver } = require('./schema/index');
const { LoomContracts } = require('./contracts/index');

const SYSTEM_ID = 'loom';
const PORT      = parseInt(process.env.LOOM_PORT || '3752');
const OR_URL    = process.env.ORCH_URL || 'http://127.0.0.1:9000';
const VERSION   = '1.0.0';

const driver    = new LoomDriver();
const contracts = new LoomContracts();

function json(res, code, body) {
  const s = JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(s) });
  res.end(s);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 2_000_000) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const p = url.pathname;
  const method = req.method;

  try {
    if (method === 'GET' && p === '/health') {
      return json(res, 200, { ok: true, systemId: SYSTEM_ID, version: VERSION });
    }

    // Same shape as every other sovereign system's /contract (phase 137
    // audit — cortex/bridge/architect all needed this added this session).
    if (method === 'GET' && p === '/contract') {
      return json(res, 200, {
        id: 'loom-v1', systemId: SYSTEM_ID, version: VERSION,
        routes: ['GET /health', 'GET /contract', 'GET /api/registry/:kind',
          'GET /api/registry/:kind/:id', 'POST /api/registry/:kind', 'GET /api/graph',
          'POST /api/contracts', 'POST /api/contracts/:id/handoff', 'POST /api/contracts/:id/close'],
      });
    }

    // ── Registry (LoomDriver) ────────────────────────────────────────────
    if (method === 'GET' && p.startsWith('/api/registry/')) {
      const parts = p.split('/').filter(Boolean); // ['api','registry',kind,id?]
      const kind = parts[2];
      const id = parts[3];
      if (id) {
        const rec = driver.registry.get(kind, decodeURIComponent(id));
        return rec ? json(res, 200, { ok: true, record: rec }) : json(res, 404, { ok: false, error: 'not found' });
      }
      return json(res, 200, { ok: true, kind, records: driver.registry.all(kind) });
    }

    if (method === 'POST' && p.startsWith('/api/registry/')) {
      const kind = p.split('/')[3];
      const payload = await readBody(req);
      const result = driver.declare(kind, payload);
      return json(res, result.ok === false ? 409 : 200, result);
    }

    if (method === 'GET' && p === '/api/graph') {
      return json(res, 200, { ok: true, graph: driver.registry.graph() });
    }

    // ── Contracts (LoomContracts) ────────────────────────────────────────
    if (method === 'POST' && p === '/api/contracts') {
      const body = await readBody(req);
      try { return json(res, 200, { ok: true, contract: contracts.openContract(body) }); }
      catch (e) { return json(res, 400, { ok: false, error: e.message }); }
    }

    if (method === 'POST' && /^\/api\/contracts\/[^/]+\/handoff$/.test(p)) {
      const id = p.split('/')[3];
      const body = await readBody(req);
      try { return json(res, 200, { ok: true, contract: contracts.recordHandoff(id, body) }); }
      catch (e) { return json(res, 400, { ok: false, error: e.message }); }
    }

    if (method === 'POST' && /^\/api\/contracts\/[^/]+\/close$/.test(p)) {
      const id = p.split('/')[3];
      const body = await readBody(req);
      try { return json(res, 200, { ok: true, contract: contracts.closeContract(id, body) }); }
      catch (e) { return json(res, 400, { ok: false, error: e.message }); }
    }

    json(res, 404, { ok: false, error: 'not found' });
  } catch (e) {
    json(res, 500, { ok: false, error: e.message });
  }
});

// ── Register with orchestrator — same pattern every sovereign system uses ──
function register() {
  const body = JSON.stringify({
    systemId: SYSTEM_ID, port: PORT, version: VERSION, status: 'online',
    meta: { label: 'LOOM', color: '#33bb88' }, components: [],
  });
  const u = new URL(`${OR_URL}/api/register`);
  const r = http.request({ hostname: u.hostname, port: u.port || 9000, path: u.pathname,
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    timeout: 4000 }, () => {
    console.log('[loom] registered');
    try {
      const { startHeartbeat } = require('../nexus-connect');
      startHeartbeat(SYSTEM_ID, PORT);
    } catch (_) { /* nexus-connect optional — never crash the server over a heartbeat */ }
  });
  r.on('error', () => setTimeout(register, 5000));
  r.write(body); r.end();
}

server.listen(PORT, () => {
  console.log(`[loom] :${PORT} — v${VERSION} — component/hook/wire/seam registry + contracts`);
  setTimeout(register, 1000);
});

module.exports = { server, driver, contracts };
