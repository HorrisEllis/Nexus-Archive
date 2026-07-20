'use strict';
const assert = require('assert');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

// Mock JAA — in-memory table, mirrors real insert/get/update semantics closely
// enough to prove the logic, not the store (the store itself is guardian/jaa-store.js,
// already covered elsewhere).
let _table = [];
require.cache[require.resolve('../../cortex/memory/jaa-db')] = {
  id: '../memory/jaa-db', filename: '../memory/jaa-db', loaded: true,
  exports: {
    jaaDB: {
      get: (table, where) => {
        if (table !== 'fault_taxonomy') return null;
        return _table.find(r => Object.entries(where).every(([k, v]) => r[k] === v)) || null;
      },
      insert: (table, row) => { if (table === 'fault_taxonomy') _table.push(row); return row; },
      update: (table, where, values) => {
        if (table !== 'fault_taxonomy') return 0;
        let n = 0;
        _table = _table.map(r => {
          if (Object.entries(where).every(([k, v]) => r[k] === v)) { n++; return { ...r, ...values }; }
          return r;
        });
        return n;
      },
      query: () => [],
    },
    uid: () => require('crypto').randomUUID(),
  },
};

const ft = require('../../cortex/self-heal/fault-taxonomy');

function reset() { _table = []; }

test('T-001', 'unknown fault class on first occurrence creates a row at the level-0 delta', () => {
  reset();
  const { row, band } = ft.raiseFriction('timeout', 0);
  assert.strictEqual(row.friction, 0.10);
  assert.strictEqual(row.count, 1);
  assert.strictEqual(band, 'NOMINAL');
});

test('T-002', 'repeated level-1 failures accumulate friction additively', () => {
  reset();
  ft.raiseFriction('api_degraded', 1); // 0.20
  const { row } = ft.raiseFriction('api_degraded', 1); // 0.40
  assert.strictEqual(row.friction, 0.40);
  assert.strictEqual(row.count, 2);
});

test('T-003', 'friction band crosses ELEVATED at exactly 0.4', () => {
  reset();
  ft.raiseFriction('bottleneck', 1); // 0.20
  const { band } = ft.raiseFriction('bottleneck', 1); // 0.40
  assert.strictEqual(band, 'ELEVATED');
});

test('T-004', 'friction is capped at FAILURE_MODE (1.0), never overshoots', () => {
  reset();
  for (let i = 0; i < 5; i++) ft.raiseFriction('memory_pressure', 3); // 0.50 each, would overshoot to 2.5
  const row = ft.getFaultClass('memory_pressure');
  assert.strictEqual(row.friction, 1.0);
});

test('T-005', 'justEnteredFailureMode fires exactly once, on the crossing call', () => {
  reset();
  const r1 = ft.raiseFriction('circuit_breaker', 3); // 0.50
  const r2 = ft.raiseFriction('circuit_breaker', 3); // 1.00 — crosses here
  const r3 = ft.raiseFriction('circuit_breaker', 3); // already at 1.00 — must not re-fire
  assert.strictEqual(r1.justEnteredFailureMode, false);
  assert.strictEqual(r2.justEnteredFailureMode, true);
  assert.strictEqual(r3.justEnteredFailureMode, false);
});

test('T-006', 'unknown ladder level throws loudly (§1.2 — no silent failure)', () => {
  reset();
  assert.throws(() => ft.raiseFriction('timeout', 7), /unknown ladder level/);
});

test('T-007', 'recordSuccess decays friction and raises successRate without resetting to zero', () => {
  reset();
  ft.raiseFriction('import_error', 2); // 0.35
  ft.raiseFriction('import_error', 2); // 0.70
  const result = ft.recordSuccess('import_error', 0.5);
  assert.strictEqual(result.friction, 0.35); // 0.70 * 0.5
  assert.ok(result.successRate > 0);
  assert.notStrictEqual(result.friction, 0); // improving, not amnesia
});

test('T-008', 'raiseFriction with no faultClass throws (missing required input is loud, not silent)', () => {
  reset();
  assert.throws(() => ft.raiseFriction(null, 0), /faultClass is required/);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
