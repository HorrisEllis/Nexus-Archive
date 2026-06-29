'use strict';
/**
 * tests/modules/bridge-handshake.test.js — Bridge Handshake / "Premature Close" Suite
 * UUID: test-bridge-handshake-v1-0000-4000-0000-000000000001
 *
 * §ROOT CAUSE this guards against (2026-06-29):
 *   bridge/server.js's route table did `return handleHandshake(req, res, deps)`
 *   inside a try/catch, without `await`. In an async function, a `return`
 *   of a promise is NOT the same as awaiting it — the try/catch only
 *   catches synchronous throws during the try block's own execution. If
 *   the returned promise rejected later (malformed body, identity layer
 *   throwing, anything async), nothing ever wrote a response and nothing
 *   ever called res.end() — the socket just sat there until the client's
 *   timeout fired, surfacing as "Invalid response body... Premature close."
 *
 *   Fix: every `return handleX(...)` became `return await handleX(...)`,
 *   and handleHandshake's own _readBody() call got its own try/catch so a
 *   bad JSON body returns 400 instead of an uncaught rejection.
 *
 * These tests boot a REAL bridge server on an ephemeral port and hit it
 * over the actual network stack — this class of bug doesn't reproduce
 * with mocked req/res objects, only with a real client that can observe
 * a socket actually closing early.
 */

const assert = require('assert');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');

const { createBridgeServer }   = require(path.join(__dirname, '../../bridge/server'));
const { createBridgeIdentity } = require(path.join(__dirname, '../../bridge/identity'));
const { createBridgeRegistry } = require(path.join(__dirname, '../../bridge/registry'));
const { createBridgeRouter }   = require(path.join(__dirname, '../../bridge/router'));
const { createBridgeLedger }   = require(path.join(__dirname, '../../bridge/ledger'));
const { createErrorLog }       = require(path.join(__dirname, '../../lib/error-log'));

let passed = 0, failed = 0;
const pending = [];
function t(label, fn) {
  try {
    const r = fn();
    if (r && typeof r.then === 'function') {
      pending.push(r.then(() => passed++).catch(e => { failed++; console.log(`  FAIL [${label}]: ${e.stack || e.message}`); }));
    } else passed++;
  } catch (e) { failed++; console.log(`  FAIL [${label}]: ${e.message}`); }
}

function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-bridge-test-')); }

function rawPost(port, urlPath, bodyBuf, { headers = {}, timeoutMs = 4000 } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port, path: urlPath, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyBuf), ...headers },
      timeout: timeoutMs,
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('client timeout — this is what "Premature close" looked like')); });
    req.end(bodyBuf);
  });
}

(async () => {
  process.env.BRIDGE_PORT = String(9990 + Math.floor(Math.random() * 500));
  // Re-require with the env var set — Node caches by resolved path, but
  // BRIDGE_PORT is read at module-load time in server.js, so this only
  // works if this is the first require in the process. Run this file
  // standalone (node tests/modules/bridge-handshake.test.js), not bundled
  // after another file that already required bridge/server.js.
  delete require.cache[require.resolve(path.join(__dirname, '../../bridge/server'))];
  const { createBridgeServer, BRIDGE_PORT } = require(path.join(__dirname, '../../bridge/server'));

  const ledgerDir = tmpDir();
  const ledger    = createBridgeLedger({ ledgerDir });
  ledger.open();
  const identity  = createBridgeIdentity({ ledgerDir });
  const registry  = createBridgeRegistry({});
  registry.init();
  const router    = createBridgeRouter({ registry, ledger });
  const errorLog  = createErrorLog({ logDir: path.join(ledgerDir, 'errors'), systemId: 'bridge-test' });
  errorLog.open();

  const server = createBridgeServer({ identity, registry, router, ledger, errorLog });
  await server.start();
  const PORT = BRIDGE_PORT;

  // ── §A: well-formed handshake still works ──────────────────────────────────
  t('valid handshake returns 200 with a token', async () => {
    const res = await rawPost(PORT, '/bridge/handshake', Buffer.from(JSON.stringify({
      systemId: 'copilot', secret: 'nexus-copilot-internal-v1', port: 3750,
    })));
    assert.strictEqual(res.status, 200);
    const json = JSON.parse(res.body);
    assert.ok(json.token, 'expected a token in the handshake response');
  });

  // ── §B: the actual regression — malformed JSON must NOT hang the socket ──────
  t('malformed JSON body returns a clean 400, not a hang/premature-close', async () => {
    const res = await rawPost(PORT, '/bridge/handshake', Buffer.from('{not valid json'));
    assert.strictEqual(res.status, 400, `expected 400, the old bug would have hung until client timeout (got ${res.status})`);
    const json = JSON.parse(res.body);
    assert.strictEqual(json.ok, false);
  });

  // ── §C: missing systemId — still a clean 400 ─────────────────────────────────
  t('handshake without systemId returns 400', async () => {
    const res = await rawPost(PORT, '/bridge/handshake', Buffer.from(JSON.stringify({ secret: 'x' })));
    assert.strictEqual(res.status, 400);
  });

  // ── §D: bad secret — clean 401, response actually completes ─────────────────
  t('handshake with wrong secret returns 401 (response completes, no hang)', async () => {
    const res = await rawPost(PORT, '/bridge/handshake', Buffer.from(JSON.stringify({
      systemId: 'copilot', secret: 'wrong-secret',
    })));
    assert.strictEqual(res.status, 401);
  });

  // ── §E: unknown route still gets a fast, clean 404 (await fix applies everywhere) ──
  t('unknown route returns 404 promptly, not a hang', async () => {
    const start = Date.now();
    const res = await rawPost(PORT, '/bridge/not-a-real-route', Buffer.from('{}'));
    assert.ok(Date.now() - start < 1000, 'unknown route took too long — looks like a hang');
    assert.strictEqual(res.status, 404);
  });

  // ── §F: every malformed-body route returns promptly, not just /handshake ────
  // /bridge/handshake has its own try/catch around _readBody → clean 400.
  // /bridge/request, /bridge/event, /bridge/tags don't have that same inner
  // guard, so a malformed body still throws — but now it's caught by the
  // outer per-request try/catch (since handlers are awaited) and answered
  // with a fast 500, instead of escaping as an unhandled rejection and
  // hanging the socket. That's the regression this guards against: not
  // "which status code," but "does the connection ever resolve."
  for (const route of ['/bridge/request', '/bridge/event', '/bridge/tags']) {
    t(`malformed JSON on ${route} returns a prompt response (no hang)`, async () => {
      const start = Date.now();
      const res = await rawPost(PORT, route, Buffer.from('{not valid'));
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 1000, `${route} took ${elapsed}ms — looks like it hung instead of failing fast`);
      assert.ok([400, 401, 500].includes(res.status), `${route} expected a clean error status, got ${res.status}`);
      assert.strictEqual(JSON.parse(res.body).ok, false);
    });
  }

  // ── §G: concurrent handshakes don't starve each other (no shared-state hang) ──
  t('10 concurrent handshakes all resolve', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => rawPost(PORT, '/bridge/handshake', Buffer.from(JSON.stringify({
        systemId: 'copilot', secret: 'nexus-copilot-internal-v1', port: 3750,
      }))))
    );
    assert.strictEqual(results.length, 10);
    results.forEach(r => assert.strictEqual(r.status, 200));
  });

  await Promise.all(pending);
  await server.stop();
  console.log(`\nbridge-handshake.test.js: ${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
})();
