'use strict';
const assert = require('assert');
let passed = 0, failed = 0;
const _t = [];
function test(id, desc, fn) { _t.push({ id, desc, fn }); }

const ap = require('../../autopilot.js');

// requestSpawn reads _state[name].status and, for alive/spawning states, must
// return alreadyRunning WITHOUT calling _spawnKernel. We can't launch a real
// Electron in-sandbox, so we drive the guard directly through the exported
// _state and assert the short-circuit — the exact logic that failed live.

function findOnDemand() {
  return ap.KERNELS.find(k => k.onDemand);
}

test('T-001', 'an on-demand kernel exists to guard (clear-glass)', () => {
  const k = findOnDemand();
  assert.ok(k, 'expected at least one onDemand kernel');
});

for (const state of ['starting', 'online', 'running', 'stable']) {
  test(`T-${state}`, `requestSpawn short-circuits when status='${state}' — no second spawn`, async () => {
    const k = findOnDemand();
    ap._state[k.name] = { ...(ap._state[k.name] || {}), status: state, lastActivity: 0 };
    const r = await ap.requestSpawn(k.name);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.alreadyRunning, true, `status='${state}' must be treated as already running`);
    assert.strictEqual(r.state, state);
  });
}

test('T-002', 'a non-onDemand kernel is rejected (not spawnable on request)', async () => {
  const always = ap.KERNELS.find(k => !k.onDemand);
  const r = await ap.requestSpawn(always.name);
  assert.strictEqual(r.ok, false);
  assert.ok(/not an on-demand/.test(r.error));
});

test('T-003', 'unknown kernel is rejected cleanly', async () => {
  const r = await ap.requestSpawn('no-such-kernel-xyz');
  assert.strictEqual(r.ok, false);
});

(async () => {
  for (const { id, desc, fn } of _t) {
    try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
    catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
