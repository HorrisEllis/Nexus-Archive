'use strict';
// tests/modules/test-intelligence-patterns.js
// §MIGRATION 2026-08-22 — _buildPatterns / _buildRCA extracted from cortex/boot.js.
// The load-bearing cases: IP-004 (unknown sigma is null, never 0) and IP-006
// (unreadable is never reported as empty).
const assert = require('assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { createPatterns } = require(path.join(ROOT, 'intelligence', 'patterns'));

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}
const store = (crystals = [], gaps = []) => ({ tail: () => crystals, query: () => gaps });

console.log('\n\u2550\u2550 INTELLIGENCE / PATTERNS \u2014 extracted from cortex/boot.js \u2550\u2550\n');

test('IP-001', '\u00a71.1 refuses without a store \u2014 cannot report an honest empty', () => {
  assert.throws(() => createPatterns({}), /requires jaaDB/);
  assert.throws(() => createPatterns(), /requires jaaDB/);
});

test('IP-002', 'the SHAPE intuition.js reads is preserved exactly', () => {
  // The whole reason this function reads `crystals` and not event_log:
  // copilot/intuition.js reads p.precursor / p.outcome / p.confidence. The
  // original boot.js version returned {type,count,lastSeen}, so every one of
  // those was undefined and the UI rendered "undefined -> undefined (NaN%)".
  const p = createPatterns({ jaaDB: store([{
    entry_conditions: { domain: 'build', verb: 'compile' },
    exit_conditions:  { outcome: 'success' },
    usage_count: 7, success_probability: 0.83, kind: 'k', ts: 1,
  }]) });
  const [row] = p.buildPatterns().patterns;
  for (const f of ['precursor', 'outcome', 'count', 'confidence', 'kind', 'ts']) {
    assert.ok(row[f] !== undefined, `field '${f}' undefined \u2014 the exact bug this shape exists to prevent`);
  }
  assert.strictEqual(row.precursor, 'build:compile');
  assert.strictEqual(row.outcome, 'success');
  assert.strictEqual(row.confidence, 0.83);
});

test('IP-003', 'missing entry_conditions degrade to "?" rather than undefined', () => {
  const p = createPatterns({ jaaDB: store([{ usage_count: 1 }]) });
  assert.strictEqual(p.buildPatterns().patterns[0].precursor, '?:?');
  assert.strictEqual(p.buildPatterns().patterns[0].outcome, 'unknown');
});

test('IP-004', 'NO FIELD \u2192 sigma is NULL, not 0', () => {
  const p = createPatterns({ jaaDB: store([], [{ id: 'g1', ts: 1 }]) });
  const r = p.buildRCA();
  assert.strictEqual(r.rca[0].sigma, null,
    'sigma 0 means MEASURED and stable; null means NOT MEASURED. Collapsing them hides a dead field.');
  assert.strictEqual(r.sigmaAvailable, false);
  assert.ok(/NOT MEASURED/.test(r.note));
});

test('IP-005', 'an injected field supplies real sigma', () => {
  const p = createPatterns({ jaaDB: store([], [{ id: 'g1', ts: 1 }]), getField: () => ({ entropy: 0.42 }) });
  const r = p.buildRCA();
  assert.strictEqual(r.rca[0].sigma, 0.42);
  assert.strictEqual(r.sigmaAvailable, true);
  assert.strictEqual(r.note, null);
});

test('IP-006', 'UNREADABLE is reported, never returned as empty', () => {
  const broken = { tail: () => { throw new Error('EIO'); }, query: () => { throw new Error('EIO'); } };
  const p = createPatterns({ jaaDB: broken });
  const bp = p.buildPatterns();
  assert.strictEqual(bp.ok, false);
  assert.ok(/NOT the same as no patterns/.test(bp.note),
    'the original returned [] on failure \u2014 indistinguishable from "nothing crystallised yet"');
  assert.strictEqual(p.buildRCA().ok, false);
});

test('IP-007', 'an empty store is an HONEST empty, flagged as such', () => {
  const bp = createPatterns({ jaaDB: store() }).buildPatterns();
  assert.strictEqual(bp.ok, true);
  assert.strictEqual(bp.empty, true);
  assert.deepStrictEqual(bp.patterns, []);
  assert.ok(/not a fabricated fallback/.test(bp.note));
});

test('IP-008', 'a throwing getField leaves sigma null \u2014 not 0', () => {
  const p = createPatterns({ jaaDB: store([], [{ id: 'g', ts: 1 }]),
    getField: () => { throw new Error('field down'); } });
  const r = p.buildRCA();
  assert.strictEqual(r.rca[0].sigma, null);
  assert.strictEqual(r.sigmaAvailable, false, 'a failed read is not a zero reading');
});

test('IP-009', 'patterns sort by usage_count and respect limit', () => {
  const c = n => ({ entry_conditions: {}, exit_conditions: {}, usage_count: n });
  const p = createPatterns({ jaaDB: store([c(1), c(9), c(5)]) });
  assert.deepStrictEqual(p.buildPatterns(2).patterns.map(x => x.count), [9, 5]);
});

test('IP-010', 'WIRED: boot.js delegates and preserves the ARRAY contract', () => {
  const src = fs.readFileSync(path.join(ROOT, 'cortex', 'boot.js'), 'utf8');
  const code = src.replace(/(?<!:)\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(/require\('\.\.\/intelligence\/patterns'\)/.test(code), 'boot.js must delegate');
  assert.ok(/_patterns\.buildPatterns\(limit\)\.patterns/.test(code),
    'the wrapper must unwrap to a bare array \u2014 every existing caller expects one, not the envelope');
  assert.ok(/_patterns\.buildRCA\(limit\)\.rca/.test(code));
  assert.ok(!/const crystals = jaaDB\.tail\('crystals'/.test(code),
    'the original logic must be GONE from boot.js, not duplicated beside the delegate (\u00a710.3)');
});

test('IP-011', 'dependencies are INJECTED \u2014 intelligence never requires cortex', () => {
  const src = fs.readFileSync(path.join(ROOT, 'intelligence', 'patterns.js'), 'utf8');
  const code = src.replace(/(?<!:)\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/require\(['"]\.\.\/cortex/.test(code),
    'intelligence requiring cortex inverts the direction every faculty runs in');
  assert.ok(/getField/.test(code) && /jaaDB/.test(code), 'both must arrive by injection');
});

test('IP-012', 'no intelligence module reaches back into meta/ (code, not comments)', () => {
  const bad = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.js')) continue;
      const code = fs.readFileSync(p, 'utf8')
        .replace(/(?<!:)\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
      if (/require\(['"][^'"]*meta\//.test(code)) bad.push(p);
    }
  })(path.join(ROOT, 'intelligence'));
  assert.deepStrictEqual(bad, [], `intelligence/ still reaches into meta/: ${bad.join(', ')}`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
