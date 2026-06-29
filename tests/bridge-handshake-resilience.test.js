#!/usr/bin/env node
'use strict';
/**
 * tests/bridge-handshake-resilience.test.js
 * UUID: nexus-bridge-handshake-resilience-test-v1-0000-4000-000000000001
 *
 * Regression test for the §2026-06-29 "Premature close" handshake bug.
 *
 * Root cause: every route in bridge/server.js's createServer callback did
 * `return handleXxx(req, res, deps);` WITHOUT awaiting it, inside an async
 * function. `try { return somePromise } catch {}` only catches *synchronous*
 * throws during the try block — a later rejection of the returned promise
 * is never caught there. If identity.handshake() (or _readBody, or anything
 * downstream) rejected asynchronously, the response was never written and
 * the socket just died — which is exactly what `Invalid response body ...
 * Premature close` looks like from the client (clear-glass) side.
 *
 * This test forces that exact failure mode — an identity layer that
 * rejects — and asserts the client still gets a clean response instead of
 * a hung/reset connection.
 *
 * Run: node tests/bridge-handshake-resilience.test.js
 */

const http   = require('http');
const assert = require('assert');

// bridge/server.js reads BRIDGE_PORT as a module-level const at require time
// — must be set before the require, not after.
process.env.BRIDGE_PORT = String(19999 + Math.floor(Math.random() * 1000));
const { createBridgeServer, BRIDGE_PORT } = require('../bridge/server');

const C = { reset:'\x1b[0m', green:'\x1b[32m', red:'\x1b[31m', dim:'\x1b[90m' };
const ok   = s => console.log(`${C.green}✓${C.reset} ${s}`);
const fail = (s, e) => { console.log(`${C.red}✗ ${s}${C.reset}\n${C.dim}${e?.stack || e}${C.reset}`); process.exitCode = 1; };

function postJson(port, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 4000,
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('client timeout — looks like the old premature-close bug')));
    req.write(data); req.end();
  });
}

async function run() {
  // ── A deliberately hostile identity layer — rejects asynchronously,
  // exactly the shape of failure that used to produce "Premature close".
  const flakyIdentity = {
    handshake: async () => { await new Promise(r => setTimeout(r, 20)); throw new Error('simulated identity failure'); },
    verify:    async () => ({ ok: false, reason: 'unused in this test' }),
  };
  const noopRegistry = { register: async () => {}, get: () => null, all: () => ({}) };
  const noopLedger   = { write: async () => {}, get: () => null, update: async () => {} };
  const noopRouter   = {};

  const errors = [];
  const errorLog = { record: (e, opts) => { errors.push({ message: e.message, opts }); } };

  const { start, stop } = createBridgeServer({
    identity: flakyIdentity, registry: noopRegistry, router: noopRouter,
    ledger: noopLedger, cfrLedger: null, errorLog,
  });

  await start();

  try {
    // 1. A handshake whose identity layer rejects must still return a
    //    clean HTTP response (401/500), not hang or reset the connection.
    const res = await postJson(BRIDGE_PORT, '/bridge/handshake',
      { systemId: 'copilot', secret: 'nexus-copilot-internal-v1', port: 3750 });
    assert.ok(res.status === 401 || res.status === 500, `expected clean error status, got ${res.status}`);
    const parsed = JSON.parse(res.body);
    assert.strictEqual(parsed.ok, false);
    ok('handshake with a rejecting identity layer returns a clean response (no premature close)');
  } catch (e) { fail('handshake with a rejecting identity layer returns a clean response', e); }

  try {
    // 2. Malformed JSON body must return 400, not hang.
    const res = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1', port: BRIDGE_PORT,
        path: '/bridge/handshake', method: 'POST',
        headers: { 'Content-Type': 'application/json' }, timeout: 4000,
      }, r => { let d=''; r.on('data', c=>d+=c); r.on('end', () => resolve({ status: r.statusCode, body: d })); });
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('client timeout on malformed body')));
      req.write('{not valid json'); req.end();
    });
    assert.strictEqual(res.status, 400);
    ok('malformed JSON body returns 400 instead of hanging');
  } catch (e) { fail('malformed JSON body returns 400 instead of hanging', e); }

  await stop();

  if (process.exitCode) console.log(`${C.red}FAILED${C.reset}`);
  else console.log(`${C.green}All bridge handshake resilience tests passed${C.reset}`);
}

run().catch(e => { console.error(e); process.exit(1); });
