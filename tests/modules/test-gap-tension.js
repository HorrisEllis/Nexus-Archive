'use strict';
// tests/modules/test-gap-tension.js
// The load-bearing case is GT-002: unmeasurable must never read as zero.
const assert = require('assert');
const path = require('path');
const GT = require(path.join(__dirname, '..', '..', 'intelligence', 'gap-tension'));

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}
const DAY = 86400000, NOW = 1700000000000;
const gap = (o) => ({ uuid: o.id || 'g', type: o.type || 't', status: 'open',
  occurrences: o.occ, detectedAt: NOW - (o.ageDays || 1) * DAY,
  lastSeenAt: NOW - (o.idleH || 0) * 3600000, severity: o.sev || null });

console.log('\n\u2550\u2550 GAP TENSION \u2014 measured strain, not declared severity \u2550\u2550\n');

test('GT-001', 'rate is occurrences per day, with its method stated', () => {
  const m = GT.measure(gap({ occ: 20, ageDays: 10 }), NOW);
  assert.strictEqual(m.measurable, true);
  assert.ok(Math.abs(m.components.rate.value - 2) < 0.01, `rate ${m.components.rate.value}`);
  assert.ok(/occurrences \u00f7/.test(m.components.rate.method), '\u00a717.11 \u2014 a number without its method is unverifiable');
});

test('GT-002', 'UNMEASURABLE is never zero \u2014 they mean opposite things', () => {
  const m = GT.measure(gap({ occ: 1, ageDays: 5 }), NOW);
  assert.strictEqual(m.measurable, false);
  assert.strictEqual(m.tension, null, 'a young gap reported as 0 tension would sort to the bottom and vanish');
  assert.ok(/not zero/.test(m.note));
  assert.ok(m.reason);
});

test('GT-003', '\u00a717.11 the three components are NOT bundled into one number', () => {
  const m = GT.measure(gap({ occ: 50, ageDays: 5 }), NOW);
  for (const k of ['rate', 'acceleration', 'recency']) {
    assert.ok(m.components[k], `missing component ${k}`);
    assert.ok(m.components[k].unit, `${k} has no unit \u2014 non-comparable axes must stay separable`);
  }
  assert.ok(m.rankCaveat && /NOT bundled/.test(m.rankCaveat),
    'the rank must disclaim itself, or it becomes the number everyone reads');
});

test('GT-004', 'THE REAL CASE: 45 occurrences declared "low" is flagged', () => {
  const m = GT.measure(gap({ occ: 45, ageDays: 0.5, sev: 'low' }), NOW);
  assert.ok(m.severityMismatch, 'the live store has exactly this row and it must not pass silently');
  assert.ok(/label predates the evidence/.test(m.severityMismatch));
});

test('GT-005', 'an over-weighted severity is flagged in the other direction too', () => {
  const m = GT.measure(gap({ occ: 2, ageDays: 60, sev: 'critical' }), NOW);
  assert.ok(m.severityMismatch && /over-weighted/.test(m.severityMismatch),
    'tension must be able to argue DOWN, not only up \u2014 otherwise it is just an escalator');
});

test('GT-006', 'dormant is distinguished from resolved', () => {
  const m = GT.measure(gap({ occ: 30, ageDays: 30, idleH: 200 }), NOW);
  assert.strictEqual(m.state, 'dormant');
  assert.notStrictEqual(m.state, 'closed', 'quiet is not fixed');
});

test('GT-007', 'acceleration detects worsening \u2014 the part severity cannot express', () => {
  const recent = GT.measure(gap({ occ: 40, ageDays: 20, idleH: 0 }), NOW);
  assert.ok(recent.components.acceleration.value >= 1);
});

test('GT-008', 'survey lists unmeasurable SEPARATELY, never ranked as zero', () => {
  const s = GT.survey([gap({ id: 'a', occ: 30, ageDays: 3 }), gap({ id: 'b', occ: 1, ageDays: 1 })], NOW);
  assert.strictEqual(s.measured, 1);
  assert.strictEqual(s.unmeasurable, 1);
  assert.ok(!s.nearest.some(m => m.id === 'b'), 'an unmeasurable gap was ranked');
  assert.ok(s.unmeasurableIds.some(u => u.id === 'b'), 'and must still be listed');
});

test('GT-009', 'closed gaps are excluded from the field', () => {
  const closed = { ...gap({ id: 'c', occ: 99, ageDays: 1 }), status: 'closed' };
  assert.strictEqual(GT.survey([closed], NOW).openGaps, 0);
});

test('GT-010', 'frictionDelta names what got WORSE, not just a verdict', () => {
  const before = GT.survey([gap({ id: 'x', occ: 40, ageDays: 4 }), gap({ id: 'y', occ: 10, ageDays: 4 })], NOW);
  const after  = GT.survey([gap({ id: 'y', occ: 60, ageDays: 4 }), gap({ id: 'z', occ: 30, ageDays: 4 })], NOW);
  const d = GT.frictionDelta(before, after);
  assert.ok(d.introduced.some(i => i.id === 'z'), 'a newly strained gap must be named');
  assert.ok(d.relieved.length >= 1);
  assert.ok(/still "passes" a boolean gate/.test(d.caveat),
    'the reason a delta beats pass/fail must ride on the payload');
});

test('GT-011', 'a missing survey is UNKNOWN friction, not zero friction', () => {
  const r = GT.frictionDelta(null, { ok: true });
  assert.strictEqual(r.ok, false);
  assert.ok(/not zero friction/.test(r.note));
});

test('GT-012', 'REAL: the live gap field measures and finds the known mismatch', () => {
  const r = GT.fromStore();
  if (!r.ok) { console.log('    (store unreadable \u2014 skipped)'); return; }
  assert.ok(r.openGaps > 0);
  assert.strictEqual(r.measured + r.unmeasurable, r.openGaps, 'every open gap must be accounted for');
  console.log(`    ${r.openGaps} open \u00b7 ${r.measured} measured \u00b7 ${r.worsening.length} worsening \u00b7 ${r.mismatches.length} severity mismatch(es)`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
