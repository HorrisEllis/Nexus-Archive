'use strict';

/**
 * tests/modules/mco16-raid-submit-route.test.js
 *
 * §MCO16 2026-09-13 — real, live test for the new POST /api/raid/submit
 * route (cortex/boot.js). Same real technique cortex-sse-broadcast.test.js
 * already established: boot.js's real exported .server, listen(0) on an
 * ephemeral port, real HTTP calls against it — not a mock of boot.js's
 * routing, the actual route.
 */

process.env.NEXUS_PORT      = '0';
process.env.CORTEX_PORT     = '0';
process.env.JAA_DATA_DIR    = '/tmp/mco16-raid-submit-jaa-' + Date.now();
process.env.RAID_INPUT_DIR  = '/tmp/mco16-raid-submit-input-' + Date.now();
process.env.RAID_OUTPUT_DIR = '/tmp/mco16-raid-submit-output-' + Date.now();

const http = require('http');
const assert = require('assert');
const boot = require('../../cortex/boot.js');

let passed = 0, failed = 0;
function post(port, path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  const srv = boot.server;
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;

  try {
    const r1 = await post(port, '/api/raid/submit', {
      content: 'real test contract content', source: 'test', executionSurface: 'browser',
    });
    if (r1.status === 200 && r1.body.ok === true && r1.body.queueId) {
      console.log('  ✓ MCO16-ROUTE-001: POST /api/raid/submit with executionSurface:"browser" succeeds and returns a real queueId');
      passed++;
    } else {
      console.log(`  ✗ MCO16-ROUTE-001: unexpected response ${JSON.stringify(r1)}`);
      failed++;
    }
  } catch (e) { console.log(`  ✗ MCO16-ROUTE-001: ${e.message}`); failed++; }

  try {
    const r2 = await post(port, '/api/raid/submit', { content: 'plain contract, no executionSurface' });
    if (r2.status === 200 && r2.body.ok === true) {
      console.log('  ✓ MCO16-ROUTE-002: POST /api/raid/submit with no executionSurface still succeeds (defaults to internal)');
      passed++;
    } else {
      console.log(`  ✗ MCO16-ROUTE-002: unexpected response ${JSON.stringify(r2)}`);
      failed++;
    }
  } catch (e) { console.log(`  ✗ MCO16-ROUTE-002: ${e.message}`); failed++; }

  try {
    const r3 = await post(port, '/api/raid/submit', { content: 'bad contract', executionSurface: 'not-a-real-surface' });
    if (r3.status === 400 && r3.body.ok === false && /executionSurface/.test(r3.body.error || '')) {
      console.log('  ✓ MCO16-ROUTE-003: an invalid executionSurface is refused with a real 400, not silently accepted');
      passed++;
    } else {
      console.log(`  ✗ MCO16-ROUTE-003: unexpected response ${JSON.stringify(r3)}`);
      failed++;
    }
  } catch (e) { console.log(`  ✗ MCO16-ROUTE-003: ${e.message}`); failed++; }

  try {
    const r4 = await post(port, '/api/raid/submit', {});
    if (r4.status === 400 && r4.body.ok === false) {
      console.log('  ✓ MCO16-ROUTE-004: no real content is refused with a real 400, not a fabricated contract');
      passed++;
    } else {
      console.log(`  ✗ MCO16-ROUTE-004: unexpected response ${JSON.stringify(r4)}`);
      failed++;
    }
  } catch (e) { console.log(`  ✗ MCO16-ROUTE-004: ${e.message}`); failed++; }

  srv.close();
  console.log(`\n  mco16-raid-submit-route: ${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})();
