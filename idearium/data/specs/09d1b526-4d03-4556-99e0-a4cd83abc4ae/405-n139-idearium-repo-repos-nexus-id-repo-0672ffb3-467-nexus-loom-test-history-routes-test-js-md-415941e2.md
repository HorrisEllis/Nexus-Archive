---
chunk_uuid: 415941e2-f635-4d88-99a2-b5e68e1fc15b
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-467-nexus-loom-test-history-routes-test-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/467-nexus-loom-test-history-routes-test-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-467-nexus-loom-test-history-routes-test-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-467-nexus-loom-test-history-routes-test-js-md:415941e2
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:24:21.259Z
---

'use strict';
// §loom history routes (R4) — real component-ledger data, surfaced through a real booted loom server.
const assert = require('assert');
const path = require('path');
let passed = 0, failed = 0;
async function test(id, desc, fn) { try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; } catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; } }

process.env.LOOM_PORT = '13801';

(async () => {
  const componentLedger = require(path.join(__dirname, '../..', 'lib/component-ledger'));
  const { purgeTestRows } = require(path.join(__dirname, '../..', 'tests/modules/_purge-test-rows'));
  const TEST_SYSTEM = `r4-loom-history-test-${Date.now()}`;

  let loomModule;
  try {
    componentLedger.write({ system: TEST_SYSTEM, component: `${TEST_SYSTEM}.probe`, action: 'test-write', status: 'info' });
    loomModule = require(path.join(__dirname, '../..', 'loom/server.js'));
    await new Promise(r => setTimeout(r, 400));

    await test('T-001', '/api/history returns real recent entries, not an empty/fake list', async () => {
      const res = await fetch('http://127.0.0.1:13801/api/history');
      const body = await res.json();
      assert.strictEqual(body.ok, true);
      assert.ok(body.count > 0, 'the real ledger has real rows — an empty result here would mean loom is not actually reading it');
    });

    await test('T-002', '/api/history/system/:system surfaces a REAL row this test just wrote, live', async () => {
      const res = await fetch(`http://127.0.0.1:13801/api/history/system/${TEST_SYSTEM}`);
      const body = await res.json();
      assert.strictEqual(body.ok, true);
      assert.ok(body.history.some(r => r.component === `${TEST_SYSTEM}.probe`), 'loom must surface the exact real row just written through component-ledger, not stale or fabricated data');
    });

    await test('T-003', '/api/history/system/:system for a nonexistent system returns a real empty result, not an error', async () => {
      const res = await fetch('http://127.0.0.1:13801/api/history/system/definitely-not-a-real-system-xyz');
      const body = await res.json();
      assert.strictEqual(body.ok, true);
      assert.strictEqual(body.count, 0);
    });

    await test('T-004', '/api/history/component/:component filters correctly', async () => {
      const res = await fetch(`http://127.0.0.1:13801/api/history/component/${TEST_SYSTEM}.probe`);
      const body = await res.json();
      assert.ok(body.history.every(r => r.component === `${TEST_SYSTEM}.probe`), 'must only return rows for the exact requested component');
    });

    await test('T-005', 'missing path segment returns a real 400, not a silent empty success', async () => {
      const res = await fetch('http://127.0.0.1:13801/api/history/system/');
      assert.ok(res.status === 400 || res.status === 404);
    });
  } finally {
    purgeTestRows(TEST_SYSTEM);
    if (loomModule && loomModule.server) await new Promise(r => loomModule.server.close(r));
  }

  console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
})();