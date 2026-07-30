'use strict';
// T7 (tablet rewind) — the SYSTEM REWIND UI showed "No snapshots" because
// replay-engine was orphaned: complete API, nothing ever called snapshot().
// This pins the wire (2026-07-25): snapshot() writes a scored state row, and
// cortex boot triggers it on boot / periodically / on gap+sigma events. The
// OBSERVE half only — restore stays blocked on the rfr2 kernel.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const replay = require(path.join(ROOT, 'lib/replay-engine'));

test('T-001', 'snapshot() returns a snapshotId and timestamp', () => {
  const r = replay.snapshot({ trigger: 'test' });
  assert.ok(r.snapshotId, 'must return a snapshotId');
  assert.ok(r.ts, 'must return a ts');
});

test('T-002', 'snapshot captures all six scored state dimensions (the rewind legend reads these)', () => {
  const { jaaDB } = require(path.join(ROOT, 'cortex/memory/jaa-db'));
  replay.snapshot({ trigger: 'test-dims' });
  const snaps = jaaDB.query('snapshots', () => true, 20) || [];
  const latest = snaps.sort((a, b) => b.ts - a.ts)[0];
  assert.ok(latest, 'a snapshot row must exist');
  const s = latest.state || latest;
  for (const field of ['openGaps', 'highFriction', 'liminalActive', 'crystallisedPatterns', 'recentEvents', 'activeFaultClasses']) {
    assert.ok(field in s, `snapshot must capture ${field}`);
  }
});

test('T-003', 'cortex boot WIRES snapshot triggers (boot + periodic + gap + sigma)', () => {
  const boot = fs.readFileSync(path.join(ROOT, 'cortex/boot.js'), 'utf8');
  assert.ok(/replay\.snapshot\(\{ trigger: 'boot' \}\)/.test(boot), 'boot snapshot');
  assert.ok(/setInterval\([\s\S]*?replay\.snapshot\(\{ trigger: 'periodic' \}\)/.test(boot), 'periodic snapshot');
  assert.ok(/cortex\.gap\.found'[\s\S]*?replay\.snapshot\(\{ trigger: 'gap\.found' \}\)/.test(boot), 'gap-triggered snapshot');
  assert.ok(/sigma\.event\.halt_risk'[\s\S]*?replay\.snapshot\(\{ trigger: 'sigma\.halt_risk' \}\)/.test(boot), 'sigma-triggered snapshot');
});

test('T-004', 'the wire is HONEST — it claims observe only, not restore', () => {
  const boot = fs.readFileSync(path.join(ROOT, 'cortex/boot.js'), 'utf8');
  assert.ok(/observe only|restore blocked|RESTORE stays blocked/i.test(boot),
    'the wire must not claim to restore — that is blocked on the rfr2 kernel');
});

test('T-005', 'the periodic interval is unref\'d so it never keeps the process alive', () => {
  const boot = fs.readFileSync(path.join(ROOT, 'cortex/boot.js'), 'utf8');
  assert.ok(/_snapInterval\.unref/.test(boot), 'periodic snapshot interval must be unref-guarded');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
