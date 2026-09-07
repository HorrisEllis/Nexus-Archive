'use strict';
// Real, isolated test for idearium's build-queue poller. James: "it
// needs to start the queue each boot. So the chunks in the repo in
// idearium build."
//
// §ISOLATED — same real IDEARIUM_DATA_DIR/JAA_DATA_DIR convention this
// session already established.
const fs = require('fs');
const os = require('os');
const path = require('path');
const _isolatedData = fs.mkdtempSync(path.join(os.tmpdir(), 'idearium-build-poller-'));
const _isolatedJaa = fs.mkdtempSync(path.join(os.tmpdir(), 'idearium-build-poller-jaa-'));
process.env.IDEARIUM_DATA_DIR = _isolatedData;
process.env.JAA_DATA_DIR = _isolatedJaa;
process.on('exit', () => {
  try { fs.rmSync(_isolatedData, { recursive: true, force: true }); } catch (_) {}
  try { fs.rmSync(_isolatedJaa, { recursive: true, force: true }); } catch (_) {}
});

const assert = require('assert');
const http = require('http');

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

function mockServer(port, handler) {
  const server = http.createServer(handler);
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}
function closeServer(server) {
  return new Promise(resolve => server.close(() => setTimeout(resolve, 50)));
}

async function main() {
  const se = await import('../../idearium/spec-engine/index.js');
  const { _startBuildQueuePoller, _buildingSpecs } = await import('../../idearium/api/index.js');
  const TEST_PORT = 19801;

  await test('T-001', 'a real spec with genuinely pending chunks triggers a real POST to /api/spec-engine/specs/:uuid/build', async () => {
    const manifest = se.createSpec({ name: 'poller-test-1', type: 'component' });
    let received = null;
    const server = await mockServer(TEST_PORT, (req, res) => {
      received = { method: req.method, url: req.url };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, done: true }));
    });
    const timer = _startBuildQueuePoller(TEST_PORT);
    await new Promise(r => setTimeout(r, 300)); // real, immediate first tick fires synchronously-ish — give it a moment
    clearInterval(timer);
    assert.ok(received, 'expected a real POST request for a spec with pending chunks');
    assert.strictEqual(received.method, 'POST');
    assert.strictEqual(received.url, `/api/spec-engine/specs/${manifest.uuid}/build`);
    await closeServer(server);
  });

  await test('T-002', 'the in-flight guard prevents a second build trigger for the same spec while one is still running', async () => {
    _buildingSpecs.clear();
    const manifest = se.createSpec({ name: 'poller-test-2', type: 'component' });
    const hitsByUuid = {};
    let holdResponse = null;
    const server = await mockServer(TEST_PORT + 1, (req, res) => {
      const uuid = req.url.split('/')[4];
      hitsByUuid[uuid] = (hitsByUuid[uuid] || 0) + 1;
      if (uuid === manifest.uuid) holdResponse = res; // deliberately never respond for THIS spec — simulates a real, still-building chunk
      else res.end('{"ok":true,"done":true}'); // any other real, leftover pending spec (e.g. from an earlier test sharing this isolated data dir) — real behavior, not what this test is about
    });
    const timer = _startBuildQueuePoller(TEST_PORT + 1);
    await new Promise(r => setTimeout(r, 200));
    clearInterval(timer);
    assert.strictEqual(hitsByUuid[manifest.uuid], 1, `expected exactly one real trigger for THIS spec while its previous build is still in flight, got: ${JSON.stringify(hitsByUuid)}`);
    assert.ok(_buildingSpecs.has(manifest.uuid), 'the in-flight guard must actually track this spec as building');
    if (holdResponse) holdResponse.end('{"ok":true}');
    await closeServer(server);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main();
