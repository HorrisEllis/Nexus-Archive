'use strict';

/**
 * tests/modules/mco16e-dom-response-node.test.js
 *
 * §MCO16e 2026-09-13 — real, live test for guardian's new POST /dom/event
 * (SSE broadcast + component-ledger write + real .response node creation)
 * and GET /api/responses (the query side). Boots the actual guardian
 * server.js on an ephemeral port — same real technique already
 * established for cortex/boot.js in this session's own mco16-raid-submit-
 * route.test.js.
 */

process.env.GUARDIAN_HTTP_PORT = '0';
process.env.NCP_PORT_OVERRIDE  = '0';

const http = require('http');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const RESPONSE_DIR = path.join(__dirname, '..', '..', 'guardian', 'data', 'nodes', 'response');

function post(port, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port, path: urlPath, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let raw = ''; res.on('data', c => raw += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(payload); req.end();
  });
}
function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path: urlPath }, (res) => {
      let raw = ''; res.on('data', c => raw += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

async function main() {
  // Clean slate for this test's own compartment so total-count assertions are real.
  const testCompartmentUuid = 'test-compartment-' + Date.now();

  const guardian = require('../../guardian/server.js');
  const srv = guardian.server;
  await new Promise((resolve) => {
    if (srv.listening) return resolve();
    srv.once('listening', resolve);
  });
  const port = srv.address().port;

  await test('RESP-001', 'POST /dom/event with a real compartmentUuid creates a real .response node', async () => {
    const r = await post(port, '/dom/event', {
      compartmentUuid: testCompartmentUuid, queueId: 'q-1', type: 'dom.mutation', agentId: 'claude',
      dom: { added: 2 }, ts: Date.now(),
    });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.ok, true);
    assert.ok(r.body.responseUuid, 'a real responseUuid must be returned');
    const filePath = path.join(RESPONSE_DIR, `${r.body.responseUuid}.response`);
    assert.ok(fs.existsSync(filePath), `real .response node file must exist at ${filePath}`);
  });

  await test('RESP-002', 'a /dom/event with no compartmentUuid is honestly reported, no fabricated node', async () => {
    const before = fs.existsSync(RESPONSE_DIR) ? fs.readdirSync(RESPONSE_DIR).length : 0;
    const r = await post(port, '/dom/event', { type: 'dom.snapshot', ts: Date.now() });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.ok, true);
    assert.strictEqual(r.body.responseUuid, null, 'no compartmentUuid means no real node — never fabricated');
    const after = fs.existsSync(RESPONSE_DIR) ? fs.readdirSync(RESPONSE_DIR).length : 0;
    assert.strictEqual(after, before, 'no new file should have been written');
  });

  await test('RESP-003', 'GET /api/responses?compartmentUuid=... returns the real node just created, filtered', async () => {
    // Second real event for the same compartment, so filtering is meaningfully tested.
    await post(port, '/dom/event', {
      compartmentUuid: testCompartmentUuid, queueId: 'q-1', type: 'dom.snapshot', agentId: 'claude',
      dom: { tree: true }, ts: Date.now(),
    });
    const r = await get(port, `/api/responses?compartmentUuid=${encodeURIComponent(testCompartmentUuid)}&n=10`);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.ok, true);
    assert.ok(r.body.responses.length >= 2, 'both real events for this compartment must be returned');
    assert.ok(r.body.responses.every(x => x.compartmentUuid === testCompartmentUuid), 'filter must exclude other compartments\' real nodes');
  });

  await test('RESP-004', 'malformed JSON body never crashes the route — reported, not thrown', async () => {
    const result = await new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port, path: '/dom/event', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let raw = ''; res.on('data', c => raw += c);
        res.on('end', () => resolve({ status: res.statusCode, raw }));
      });
      req.on('error', reject);
      req.write('{not real json');
      req.end();
    });
    assert.strictEqual(result.status, 200); // honest-degrade — never a crashed connection
  });

  // Cleanup this test's own real files so repeated runs stay honest.
  try {
    if (fs.existsSync(RESPONSE_DIR)) {
      for (const f of fs.readdirSync(RESPONSE_DIR)) {
        const full = path.join(RESPONSE_DIR, f);
        try {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes(testCompartmentUuid)) fs.unlinkSync(full);
        } catch (_) {}
      }
    }
  } catch (_) {}

  console.log(`\n  mco16e-dom-response-node: ${passed} passed, ${failed} failed\n`);
  srv.close(() => process.exit(failed ? 1 : 0));
}

main().catch((e) => { console.error(e); process.exit(1); });
