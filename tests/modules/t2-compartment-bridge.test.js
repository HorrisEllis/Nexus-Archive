'use strict';
/**
 * tests/modules/t2-compartment-bridge.test.js — Phase 73 T2 Compartment Bridge
 * UUID: test-t2-compartment-bridge-v1-0000-2026-0627-jamesbrooks-001
 *
 * Proves the actual thing this phase claims, end to end, not just that the
 * file loads: a chunk built once becomes a real case-library entry, and a
 * second build of the *same signature* reuses it without calling dispatch
 * again. If this test passes by mocking away the reuse decision, it proves
 * nothing (§12.2 — tests are verification, not coverage).
 */

const assert = require('assert');
let passed = 0, failed = 0;

async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

// ── Mock JAA — same pattern as compartment-engine.test.js (§5.6) ───────────
let _store = {};
function resetStore() {
  _store = { compartments: [], event_log: [], gaps: [], case_index: [], crystals: [], lattice_edges: [], intent_log: [] };
}
resetStore();

require.cache[require.resolve('../../cortex/memory/jaa-db')] = {
  id: '../memory/jaa-db', filename: '../memory/jaa-db', loaded: true,
  exports: {
    jaaDB: {
      _tables: { foo: [], bar: [] },
      query:  (t, fn, n) => (_store[t] || []).filter(fn).slice(0, n || 999),
      insert: (t, r) => { (_store[t] = _store[t] || []).push(r); return r; },
      update: (t, id, patch) => { const row = (_store[t] || []).find(r => r.uuid === id); if (row) Object.assign(row, patch); },
      tail:   (t, n) => (_store[t] || []).slice(0, n),
    },
    uid: () => require('crypto').randomUUID(),
  },
};

// crystal-lattice's _edgeKey + lattice_edges read — case-library needs this
// for confidence. Mock it to report a high success_rate on the SECOND query
// only, simulating "this signature has now succeeded before."
let _queriesForSignature = 0;
require.cache[require.resolve('../../lib/crystal-lattice')] = {
  id: '../lib/crystal-lattice', filename: '../lib/crystal-lattice', loaded: true,
  exports: {
    _edgeKey: (a, b) => `${a}::${b}`,
    updateOnExecution: async () => ({ updated: true }),
  },
};

const t2Bridge          = require('../../lib/t2-compartment-bridge');
const compartmentEngine = require('../../lib/compartment-engine');
const caseLibrary       = require('../../lib/case-library');

const node = { name: 'auth-middleware', id: 'auth-middleware' };
const parsedSpec = { modules: [{ name: 'auth-middleware', intent: 'implement JWT auth middleware' }] };

(async () => {
  console.log('\n── Phase 73: T2 Compartment Bridge ──\n');

  let dispatchCallCount = 0;
  const realDispatch = async () => {
    dispatchCallCount++;
    return { ok: true, response: 'export function authMiddleware() { /* real impl */ }' };
  };

  // ── 1. Cold build — no prior trace, must actually dispatch ──────────────
  resetStore();
  dispatchCallCount = 0;
  await test('T2B-01', 'cold signature dispatches at least once', async () => {
    const r = await t2Bridge.buildChunk(node, parsedSpec, realDispatch, { outputDir: '/tmp/t2-test' });
    assert.strictEqual(r.tier, 'cold', `expected cold tier, got ${r.tier}`);
    assert.strictEqual(r.ok, true, `expected ok build, got error: ${r.error}`);
    // The real adversary suite legitimately re-invokes the executor for
    // stress/determinism checks on higher-risk intents (INTENSITY_BY_RISK,
    // adversary-suite.js) — a cold build must dispatch at least once, the
    // exact count depends on the real risk_level classification, not a
    // fixed number this test should hardcode.
    assert.ok(dispatchCallCount >= 1, 'cold build must call dispatch at least once');
    assert.strictEqual(r.reused, false, 'a cold build is never "reused"');
  });

  await test('T2B-02', 'a PASS compartment actually got indexed into case_index', async () => {
    assert.ok(_store.case_index.length === 1, `expected 1 case_index row, got ${_store.case_index.length}`);
    assert.ok(typeof _store.case_index[0].domain === 'string' && _store.case_index[0].domain.length > 0,
      'indexed entry must carry a real classified domain, not a placeholder');
    assert.ok(typeof _store.case_index[0].verb === 'string' && _store.case_index[0].verb.length > 0,
      'indexed entry must carry a real classified verb, not a placeholder');
  });

  // ── 2. Manually seed a high lattice success_rate for this exact signature
  //      (this is what a real PASS history would produce over time — we
  //      fast-forward it here rather than running 20 builds in a test) ────
  const signature = `${_store.case_index[0].domain}:${_store.case_index[0].verb}`;
  const domainVerb = `${_store.case_index[0].domain}.${_store.case_index[0].verb}`;
  _store.lattice_edges.push({
    edgeKey: `CompartmentType:${domainVerb}::State:Resolution`,
    success_rate: 0.95,
  });

  // ── 3. Same signature again — must hit 'full' tier and NOT dispatch ─────
  dispatchCallCount = 0;
  await test('T2B-03', 'repeat signature reuses the stored result without dispatching', async () => {
    const r = await t2Bridge.buildChunk(node, parsedSpec, realDispatch, { outputDir: '/tmp/t2-test' });
    assert.strictEqual(r.tier, 'full', `expected full tier on repeat, got ${r.tier}`);
    assert.strictEqual(r.reused, true, 'expected reused:true on a full-tier hit');
    assert.strictEqual(dispatchCallCount, 0, 'a full-tier reuse must NOT call dispatch — that is the whole point');
    assert.strictEqual(r.ok, true);
  });

  // ── 4. Negative crystal — must refuse to retry, never silently skip ─────
  await test('T2B-04', 'a negative crystal hit is reported, not silently dropped', async () => {
    _store.crystals.push({
      uuid: 'neg-1', kind: 'CREATE_NEGATIVE_CRYSTAL',
      pattern_signature: `${signature}:always-fails`,
    });
    const r = await t2Bridge.buildChunk(node, parsedSpec, realDispatch, { outputDir: '/tmp/t2-test' });
    assert.strictEqual(r.tier, 'blocked');
    assert.strictEqual(r.ok, false);
    assert.ok(r.error && r.error.length > 0, '§1.2 — a blocked build must carry a real, non-empty reason');
  });

  console.log(`\n  ${passed}/${passed + failed} passed\n`);
  if (failed > 0) process.exit(1);
})();
