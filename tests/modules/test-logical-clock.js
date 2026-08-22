'use strict';
// tests/modules/test-logical-clock.js — versionium.spec step 0 (§BLOCKER-E1)
// The load-bearing cases: LC-004 (no reissue after restart) and LC-009
// (unordered rows are never silently ts-sorted into an ordered result).
const assert = require('assert');
const fs = require('fs'), os = require('os'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}
function fresh() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-'));
  process.env.NEXUS_CLOCK_DIR = d;
  delete require.cache[require.resolve(path.join(ROOT, 'lib', 'logical-clock'))];
  return { dir: d, lc: require(path.join(ROOT, 'lib', 'logical-clock')) };
}

console.log('\n\u2550\u2550 LOGICAL CLOCK \u2014 \u00a73.2 the ordering axis \u2550\u2550\n');

test('LC-001', '\u00a71.1 an unattributed clock is refused', () => {
  const { lc } = fresh();
  assert.throws(() => lc.clockFor(), /requires a system name/);
  assert.throws(() => lc.clockFor(''), /requires a system name/);
});

test('LC-002', 'ticks are monotonic', () => {
  const { lc } = fresh();
  const c = lc.clockFor('s');
  const t = [c.nextTick(), c.nextTick(), c.nextTick()];
  assert.deepStrictEqual(t, [1, 2, 3]);
});

test('LC-003', 'each system has its OWN sequence \u2014 no fabricated global order', () => {
  const { lc } = fresh();
  const a = lc.clockFor('cortex'), b = lc.clockFor('guardian');
  a.nextTick(); a.nextTick();
  assert.strictEqual(b.nextTick(), 1,
    'guardian inherited cortex\u2019s count \u2014 that asserts an ordering between systems that never happened');
});

test('LC-004', 'RESTART NEVER REISSUES A USED TICK', () => {
  const { dir, lc } = fresh();
  const c = lc.clockFor('s');
  const used = [c.nextTick(), c.nextTick(), c.nextTick()];
  // simulate process restart against the same clock dir
  delete require.cache[require.resolve(path.join(ROOT, 'lib', 'logical-clock'))];
  process.env.NEXUS_CLOCK_DIR = dir;
  const lc2 = require(path.join(ROOT, 'lib', 'logical-clock'));
  const after = lc2.clockFor('s').nextTick();
  assert.ok(after > Math.max(...used),
    `reissued ${after} after ${used} \u2014 two events sharing an eventTs make replay order undefined`);
});

test('LC-005', 'a restored clock SAYS it was restored', () => {
  const { dir, lc } = fresh();
  lc.clockFor('s').nextTick();
  delete require.cache[require.resolve(path.join(ROOT, 'lib', 'logical-clock'))];
  process.env.NEXUS_CLOCK_DIR = dir;
  const c2 = require(path.join(ROOT, 'lib', 'logical-clock')).clockFor('s');
  assert.strictEqual(c2.restored, true);
  assert.strictEqual(c2.health().note, null, 'a restored clock should carry no "starting at 0" caveat');
});

test('LC-006', 'a FRESH clock warns that prior eventTs may be unrecoverable', () => {
  const { lc } = fresh();
  const h = lc.clockFor('never-seen').health();
  assert.strictEqual(h.restoredFromDisk, false);
  assert.ok(/UNORDERED/.test(h.note),
    'a fresh clock and a clock that lost its file look identical unless it says so');
});

test('LC-007', 'eventTs is NEVER derived from wall clock', () => {
  const { lc } = fresh();
  const t = lc.clockFor('s').nextTick();
  assert.ok(t < 1000, `tick ${t} looks like a timestamp \u2014 clocks go backwards and collide within a ms`);
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'logical-clock.js'), 'utf8');
  const code = src.replace(/(?<!:)\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/eventTs\s*[:=]\s*Date\.now/.test(code));
});

test('LC-008', 'isOrdered() is false for a legacy row \u2014 the correct answer', () => {
  const { lc } = fresh();
  assert.strictEqual(lc.isOrdered({ ts: Date.now() }), false,
    'a pre-2026-08-22 row has genuinely unrecoverable causal order');
  assert.strictEqual(lc.isOrdered({ eventTs: 5 }), true);
});

test('LC-009', 'order() NEVER interleaves unordered rows into the sorted result', () => {
  const { lc } = fresh();
  const rows = [{ eventTs: 3 }, { ts: 111 }, { eventTs: 1 }, { ts: 222 }, { eventTs: 2 }];
  const r = lc.order(rows);
  assert.deepStrictEqual(r.ordered.map(x => x.eventTs), [1, 2, 3]);
  assert.strictEqual(r.unordered.length, 2);
  assert.strictEqual(r.complete, false);
  assert.ok(/would diverge from the live run/.test(r.note),
    'a list that looks sorted and is not is the exact shape a replay breaks on');
});

test('LC-010', 'order() reports complete when every row can be ordered', () => {
  const { lc } = fresh();
  const r = lc.order([{ eventTs: 2 }, { eventTs: 1 }]);
  assert.strictEqual(r.complete, true);
  assert.strictEqual(r.note, null);
});

test('LC-011', 'stamp() mutates in place \u2014 ledger writers build rows inline', () => {
  const { lc } = fresh();
  const row = { system: 'x' };
  const out = lc.stamp(row, 'x');
  assert.strictEqual(out, row, 'a copy would be silently discarded by the caller');
  assert.strictEqual(typeof row.eventTs, 'number');
  assert.strictEqual(typeof row.seq, 'number');
});

test('LC-012', 'it WRAPS rfr2\u2019s clock rather than adding a second implementation', () => {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'logical-clock.js'), 'utf8');
  assert.ok(/rfr2\/time/.test(src), '\u00a716.5 the existing clock must be reused');
  assert.ok(/refusing to substitute a second clock/.test(src),
    '\u00a710.3 \u2014 if rfr2 is missing it must fail loudly, not fall back to different semantics');
});

test('LC-013', 'WIRED: component-ledger stamps every row', () => {
  const { lc } = fresh();
  delete require.cache[require.resolve(path.join(ROOT, 'lib', 'component-ledger'))];
  const cl = require(path.join(ROOT, 'lib', 'component-ledger'));
  const a = cl.write({ system: 'lctest', component: 'lc.c', action: 'ran', status: 'info', hook: 'h', wire: 'w' });
  const b = cl.write({ system: 'lctest', component: 'lc.c', action: 'ran', status: 'info', hook: 'h', wire: 'w' });
  assert.ok(lc.isOrdered(a), 'ledger rows must be orderable \u2014 this is the whole point of step 0');
  assert.ok(b.eventTs > a.eventTs);
  assert.ok(typeof a.ts === 'number', '\u00a73.2 ts stays, as display metadata');
});

test('LC-014', 'WIRED: pressure-window no longer falls back to ts for ordering', () => {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'pressure-window.js'), 'utf8');
  const code = src.replace(/(?<!:)\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/row\.eventTs != null \? row\.eventTs : row\.ts/.test(code),
    'the silent fallback is back \u2014 it makes the \u00a73.2 violation invisible');
  assert.ok(/_orderKey/.test(code) && /_displayTs/.test(code),
    'ordering and display must be separate functions, named so mixing them is visible');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
