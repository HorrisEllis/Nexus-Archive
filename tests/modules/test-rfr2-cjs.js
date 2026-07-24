'use strict';
const assert = require('assert');
let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

// §2026-07-24 JOB 1 — meta/rfr2's 10 working modules (identity, lazy, time,
// observer, adapter-sandbox, query, delta, enforcement, version-gate, plus
// the index barrel) were real ESM (`export function` / `export const`) with
// zero working consumers via plain require — only lib/rfr2-bridge.js's
// async dynamic import() could load them at all. Converted mechanically to
// CJS (module.exports = { ... }, imports → require()). clip/compress/context
// are Job 2 — deliberately NOT converted here, they import ../kernel/,
// ../sigma/, ../adapter/, none of which exist in the rfr2 tree; converting
// their syntax wouldn't make them load.

const EXPECTED_EXPORTS = {
  'identity':       ['newEventId', 'isValidEventId', 'shortId', 'canonicalize', 'hash64', 'contentHash', 'dedupKey', 'assertUniqueIds'],
  'lazy':           ['eventTsToWindow', 'lazy'],
  'time':           ['createClock', 'wallNow', 'causalOrder', 'seqPrecedes', 'formatWallTs', 'formatEventTs'],
  'observer':       ['createObserverBus', 'OBSERVER_BUS_LIVE', 'OBSERVER_BUS_REPLAY'],
  'adapter-sandbox':['createNullAdapter', 'createAdapterSandbox', 'AdapterRegistrationError', 'POLICY_READ_ONLY', 'POLICY_LOCAL_ONLY', 'POLICY_FULL', 'VALID_POLICIES'],
  'query':          ['parseQuery', 'execQuery', 'createQueryIndex', 'query', 'CQLSyntaxError', 'QueryResult'],
  'enforcement':    ['getInvariant', 'createRuntimeGuard', 'createBoundaryIndex', 'checkKernelInvariants', 'InvariantViolationError', 'INVARIANTS'],
  'version-gate':   ['validate', 'migrate', 'createVersionGate', 'GateValidationError', 'CURRENT_FORMAT_VERSION', 'CURRENT_KERNEL_VERSION', 'SUPPORTED_MAGICS'],
  'delta':          ['computeEventDelta', 'computeDeltaStream', 'detectBottlenecks', 'clusterByAnomaly', 'computeThroughputTimeline', 'compressToL1', 'overlayMacros', 'detectFractals', 'createGraphBranch', 'createBranchRegistry', 'LATENCY_WINDOW', 'THROUGHPUT_WINDOW', 'BOTTLENECK_THRESHOLD', 'FAN_OUT_ALERT_THRESHOLD', 'DEPTH_ALERT_THRESHOLD', 'ZOOM_LEVELS'],
};

(async () => {
  for (const [name, exportNames] of Object.entries(EXPECTED_EXPORTS)) {
    await test(`T-${name}-load`, `meta/rfr2/${name} loads via plain require() — no ESM needed`, () => {
      const mod = require(`../../meta/rfr2/${name}/index.js`);
      for (const key of exportNames) {
        assert.ok(key in mod, `missing export '${key}'`);
      }
      assert.strictEqual(Object.keys(mod).length, exportNames.length,
        `export count drift — expected ${exportNames.length}, got ${Object.keys(mod).length}`);
    });
  }

  await test('T-barrel', 'meta/rfr2/index.js barrel resolves converted modules synchronously', () => {
    const rfr2 = require('../../meta/rfr2/index.js');
    assert.ok(typeof rfr2.query.parseQuery === 'function');
    assert.ok(typeof rfr2.delta.computeDeltaStream === 'function');
    assert.ok(typeof rfr2.identity.newEventId === 'function');
  });

  await test('T-cql-functional', 'CQL actually parses a real query through the converted module', () => {
    const { query } = require('../../meta/rfr2/index.js');
    const ast = query.parseQuery("FIND events WHERE type = 'gap.found'");
    assert.strictEqual(ast.scope, 'events');
    assert.strictEqual(ast.conditions.field, 'type');
    assert.strictEqual(ast.conditions.value, 'gap.found');
  });

  await test('T-delta-cross-import', "delta's converted require() of identity/lazy resolves (not left as broken ESM import)", () => {
    const { computeDeltaStream } = require('../../meta/rfr2/delta/index.js');
    const events = [{ id: '1', ts: 1000, type: 'a' }, { id: '2', ts: 1010, type: 'b', parent: '1' }];
    const findById = (id) => events.find(e => e.id === id);
    const stream = computeDeltaStream(events, findById, () => ({}), (id) => events.filter(e => e.parent === id));
    assert.strictEqual(stream.length, 2);
  });

  await test('T-bridge-still-works', 'the async ESM bridge (lib/rfr2-bridge.js) still loads converted CJS files unchanged for existing consumers', async () => {
    const { loadRFR2Module } = require('../../lib/rfr2-bridge.js');
    const delta = await loadRFR2Module('delta');
    assert.strictEqual(typeof delta.computeDeltaStream, 'function');
  });

  await test('T-job2-untouched', 'clip/compress/context are deliberately left as ESM — Job 2, not yet converted', () => {
    const fs = require('fs');
    for (const name of ['clip', 'compress', 'context']) {
      const src = fs.readFileSync(require.resolve(`../../meta/rfr2/${name}/index.js`), 'utf8');
      assert.ok(/^export /m.test(src), `${name} should still be ESM until Job 2 (kernel/sigma/adapter harvest) lands`);
    }
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();

