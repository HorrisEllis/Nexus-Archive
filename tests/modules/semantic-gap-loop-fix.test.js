'use strict';
/**
 * tests/modules/semantic-gap-loop-fix.test.js — 2026-06-27 urgent fix
 *
 * Proves the actual claim: a batch of gaps containing the exact types seen
 * looping forever in a real boot log (obligation, assumption, logical,
 * evidential, hierarchy) gets those types removed before dispatch, while
 * real infra gaps pass through untouched. Uses the real lib/semantic-gap-types.js,
 * not a mock — that module IS the thing being verified.
 */

const assert = require('assert');
const { isSemanticGap, SEMANTIC_GAP_TYPES } = require('../../lib/semantic-gap-types');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

console.log('\n── Urgent fix: semantic-gap infinite redispatch loop ──\n');

// The exact gap types observed cycling forever in the real 2026-06-27 boot log.
const observedLoopingTypes = ['obligation', 'assumption', 'logical', 'evidential', 'hierarchy'];

test('SGL-01', 'every type observed looping in the real boot log is classified as semantic', () => {
  for (const t of observedLoopingTypes) {
    assert.ok(isSemanticGap({ type: t }), `${t} must be classified semantic — this is the exact type that looped`);
  }
});

test('SGL-02', 'a real infra gap type is NOT classified semantic', () => {
  for (const t of ['stale_module', 'api_degraded', 'timeout', 'circuit_breaker']) {
    assert.ok(!isSemanticGap({ type: t }), `${t} must NOT be classified semantic — these are real, forge-fixable gaps`);
  }
});

test('SGL-03', 'mixed batch — the exact filter inserted into nexus-diagnostic.js — keeps infra, drops semantic', () => {
  const gaps = [
    { type: 'obligation', uuid: '1' },
    { type: 'stale_module', uuid: '2' },
    { type: 'hierarchy', uuid: '3' },
    { type: 'api_degraded', uuid: '4' },
    { type: 'logical', uuid: '5' },
  ];
  const filtered = gaps.filter(g => !isSemanticGap(g));
  assert.strictEqual(filtered.length, 2, 'exactly the 2 infra gaps should survive the filter');
  assert.deepStrictEqual(filtered.map(g => g.uuid).sort(), ['2', '4'], 'the surviving gaps must be the infra ones, not arbitrary survivors');
});

test('SGL-04', 'self-heal and nexus-diagnostic now read the same set — no second copy to drift', () => {
  const selfHealSrc = require('fs').readFileSync(require('path').join(__dirname, '../../cortex/self-heal/index.js'), 'utf8');
  const diagSrc = require('fs').readFileSync(require('path').join(__dirname, '../../service/nexus-diagnostic.js'), 'utf8');
  assert.ok(selfHealSrc.includes("require('../../lib/semantic-gap-types')"), 'self-heal must require the shared module, not redefine the list');
  assert.ok(diagSrc.includes("require('../lib/semantic-gap-types')"), 'nexus-diagnostic must require the shared module, not redefine the list');
  assert.ok(!selfHealSrc.includes("const SEMANTIC_GAP_TYPES = new Set(["), 'self-heal must no longer define its own local SEMANTIC_GAP_TYPES Set');
});

console.log(`\n  ${passed}/${passed + failed} passed\n`);
if (failed > 0) process.exit(1);
