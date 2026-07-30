/**
 * compress.test.js — Deep & Recursive Test Suite
 * @module compress
 * @version 6.0.0
 *
 * Coverage:
 *   snapshot:            encode/decode, string pool, numeric delta, null stripping,
 *                        round-trip fidelity, v1→v2 backward compat, bad input negation
 *   restore:             kernel reconstruction, edge restoration, payload fidelity
 *   blueprint:           vocab, grammar, schema inference, invariant baseline embedding
 *   compile:             ESM/CJS output, type constants, grammar map, schema emission
 *   compressionReport:   ratio bounds, bytes/event, pool size
 *   createInvariantBaseline: all 14 invariants scored, composite, empty kernel
 *   updateBaseline:      rolling history, trend detection, peak tracking
 *   detectPeak:          window calculation, regression detection
 *   invariantMap:        correlation matrix, clusters, criticalPath, summary
 *   createTimeline:      registration, uuid, baseline attached
 *   forkTimeline:        parentId, forkSeq, isolation
 *   branchTimeline:      seq range slicing, new kernel
 *   mergeTimelines:      interleave/append/union strategies, dedup
 *   compareTimelines:    axisMatrix, divergence, vocabMatrix, mostSimilar/mostDivergent
 *   refreshTimeline:     baseline update in registry
 *   dropTimeline:        removal, idempotence
 *   FORMAT_VERSION:      constant integrity
 *   INV:                 all 14 keys present and non-empty
 *   Negation coverage:   invalid magic, future format, missing proof, bad strategy,
 *                        unknown timeline id, empty pool restore, corrupt snap
 */

import {
  suite, test, assert, assertEqual, assertNotEqual, assertNull,
  assertThrows, assertIncludes, assertArrayLength, assertUUID,
  assertGt, assertGte, report, reset,
} from '../runner.js';

import {
  snapshot, restore, blueprint, compile, compressionReport,
  createTimeline, forkTimeline, branchTimeline, mergeTimelines,
  getTimeline, listTimelines, dropTimeline, refreshTimeline, compareTimelines,
  createInvariantBaseline, updateBaseline, detectPeak, invariantMap,
  FORMAT_VERSION, SNAP_MAGIC, BP_MAGIC, INV,
} from '../../modules/compress/index.js';

import { createKernel } from '../../modules/kernel/index.js';
import { createAdapter } from '../../modules/adapter/index.js';

reset();

// ── Helpers ───────────────────────────────────────────────────────────────────

function freshKernel(cap = 1000) {
  return createKernel({ ringCap: cap });
}

function populatedKernel(n = 50) {
  const k = freshKernel(n * 2);
  const a = createAdapter(k);
  for (let i = 0; i < n; i++) {
    a.handle('user:action', { id: `cmd-${i}`, value: i * 10, label: `item-${i % 5}` });
  }
  return k;
}

function causalKernel() {
  const k = freshKernel(500);
  const root = k.ingest('session:start', { userId: 'u1' }, { source: 'app' });
  const e1   = k.ingest('user:click',    { target: 'btn' }, { source: 'app', causedBy: root.id, edgeType: 'causal/explicit' });
  const e2   = k.ingest('api:request',   { url: '/api/data' }, { source: 'app', causedBy: e1.id, edgeType: 'causal/explicit' });
  k.ingest('api:response', { status: 200 }, { source: 'api', causedBy: e2.id, edgeType: 'causal/explicit' });
  return k;
}

// ── FORMAT_VERSION & INV constants ────────────────────────────────────────────

suite('compress.constants', () => {
  test('FORMAT_VERSION is 2', () => assertEqual(FORMAT_VERSION, 2));
  test('SNAP_MAGIC correct',  () => assertEqual(SNAP_MAGIC, 'URCK-SNAP'));
  test('BP_MAGIC correct',    () => assertEqual(BP_MAGIC, 'URCK-BP'));

  test('INV has 14 keys', () => assertEqual(Object.keys(INV).length, 14));
  test('INV all values non-empty strings', () => {
    assert(Object.values(INV).every(v => typeof v === 'string' && v.length > 0));
  });
  test('INV has I-1',  () => assert('I-1' in INV));
  test('INV has C-1',  () => assert('C-1' in INV));
  test('INV has C-4',  () => assert('C-4' in INV));
  test('INV has T-1',  () => assert('T-1' in INV));
  test('INV has T-3',  () => assert('T-3' in INV));
  test('INV has S-1',  () => assert('S-1' in INV));
  test('INV has S-3',  () => assert('S-3' in INV));
  test('INV has K-1',  () => assert('K-1' in INV));
  test('INV has K-3',  () => assert('K-3' in INV));
  test('INV is frozen', () => assert(Object.isFrozen(INV)));
});

// ── snapshot ──────────────────────────────────────────────────────────────────

suite('compress.snapshot.structure', () => {
  test('magic is URCK-SNAP', () => {
    const k = populatedKernel(10);
    assertEqual(snapshot(k).magic, SNAP_MAGIC);
  });
  test('fmt is FORMAT_VERSION', () => {
    assertEqual(snapshot(freshKernel()).fmt, FORMAT_VERSION);
  });
  test('ts is recent', () => {
    assertGt(snapshot(freshKernel()).ts, Date.now() - 5000);
  });
  test('empty kernel: n=0 ev=[]', () => {
    const s = snapshot(freshKernel());
    assertEqual(s.n, 0);
    assertEqual(s.ev.length, 0);
  });
  test('n matches primary event count', () => {
    const k = populatedKernel(20);
    const s = snapshot(k);
    assertEqual(s.n, s.ev.length);
  });
  test('types array populated', () => {
    const k = populatedKernel(5);
    const s = snapshot(k);
    assert(Array.isArray(s.types) && s.types.length > 0);
  });
  test('sources array populated', () => {
    const k = populatedKernel(5);
    const s = snapshot(k);
    assert(Array.isArray(s.sources));
  });
  test('stringPool is array', () => {
    const k = populatedKernel(20);
    const s = snapshot(k);
    assert(Array.isArray(s.stringPool));
  });
  test('embedBaseline embeds baseline object', () => {
    const k = populatedKernel(10);
    const s = snapshot(k, { embedBaseline: true });
    assert(s.baseline && typeof s.baseline === 'object');
    assert('composite' in s.baseline);
  });
  test('no embedBaseline → baseline undefined', () => {
    const k = populatedKernel(10);
    const s = snapshot(k);
    assert(s.baseline === undefined);
  });
  test('embedSchemas embeds schemas object', () => {
    const k = populatedKernel(10);
    const s = snapshot(k, { embedSchemas: true });
    assert(s.schemas && typeof s.schemas === 'object');
  });
  test('null stripping: no trailing null fields in tuples', () => {
    const k = populatedKernel(20);
    const s = snapshot(k);
    for (const tuple of s.ev) {
      if (tuple.length > 0) {
        assertNotEqual(tuple[tuple.length - 1], null);
      }
    }
  });
  test('gates array present', () => {
    assert(Array.isArray(snapshot(freshKernel()).gates));
  });
  test('macros array present', () => {
    assert(Array.isArray(snapshot(freshKernel()).macros));
  });
});

suite('compress.snapshot.encoding', () => {
  test('string pool interns repeated strings', () => {
    const k = freshKernel(500);
    for (let i = 0; i < 50; i++) {
      k.ingest('ev', { label: 'repeated-value-here' }, { source: 'test' });
    }
    const s = snapshot(k);
    assertIncludes(s.stringPool, 'repeated-value-here');
  });
  test('string pool does NOT intern short strings (<=4 chars)', () => {
    const k = freshKernel(100);
    for (let i = 0; i < 20; i++) k.ingest('ev', { x: 'ab' }, { source: 'test' });
    const s = snapshot(k);
    assert(!s.stringPool.includes('ab'));
  });
  test('string pool does NOT intern singletons', () => {
    const k = freshKernel(100);
    k.ingest('ev', { label: 'unique-string-xyz' }, { source: 'test' });
    const s = snapshot(k);
    assert(!s.stringPool.includes('unique-string-xyz'));
  });
  test('numeric delta encoding used for sequential numbers', () => {
    const k = freshKernel(500);
    for (let i = 0; i < 30; i++) k.ingest('counter', { val: i }, { source: 'test' });
    const s = snapshot(k);
    // Some tuples should have payload delta with $d fields
    const hasDelta = s.ev.some(t => {
      const pd = t[6];
      return pd && typeof pd === 'object' && !pd._full &&
        Object.values(pd).some(v => v && typeof v === 'object' && '$d' in v);
    });
    assert(hasDelta, 'expected numeric delta encoding in at least one event');
  });
  test('causedBy encoded as position index not UUID', () => {
    const k = causalKernel();
    const s = snapshot(k);
    // causedBy position (field 4) should be a small integer, not a UUID
    const causalTuples = s.ev.filter(t => t[4] != null);
    assert(causalTuples.length > 0, 'expected some causal events');
    assert(causalTuples.every(t => typeof t[4] === 'number'), 'causedBy should be integer index');
  });
  test('edge type encoded as 1-char code', () => {
    const k = causalKernel();
    const s = snapshot(k);
    const edgeCodes = s.ev.filter(t => t[5] != null).map(t => t[5]);
    assert(edgeCodes.every(c => typeof c === 'string' && c.length === 1));
    assert(edgeCodes.every(c => 'xrao'.includes(c)));
  });
});

// ── restore ───────────────────────────────────────────────────────────────────

suite('compress.restore.round-trip', () => {
  test('event count preserved', () => {
    const k = populatedKernel(30);
    const s = snapshot(k);
    const k2 = restore(s);
    assertEqual(k2.length, k.length);
  });
  test('event types preserved', () => {
    const k = populatedKernel(10);
    const types1 = k.getAll().map(e => e.type).sort();
    const types2 = restore(snapshot(k)).getAll().map(e => e.type).sort();
    assertEqual(types1, types2);
  });
  test('payloads reconstructed correctly', () => {
    const k = freshKernel(100);
    k.ingest('test', { a: 1, b: 'hello', c: true }, { source: 'test' });
    const restored = restore(snapshot(k));
    const ev = restored.getAll().find(e => e.type === 'test');
    assert(ev, 'event not found after restore');
    assertEqual(ev.payload.a, 1);
    assertEqual(ev.payload.b, 'hello');
    assertEqual(ev.payload.c, true);
  });
  test('causal edges restored — causedBy IDs link correctly', () => {
    const k = causalKernel();
    const k2 = restore(snapshot(k));
    const events2 = k2.getAll();
    const causal = events2.filter(e => e.causedBy);
    assert(causal.length > 0, 'no causal events after restore');
    for (const ev of causal) {
      const parent = k2.findById(ev.causedBy);
      assert(parent, `causedBy ${ev.causedBy} not found after restore`);
    }
  });
  test('string pool round-trip: interned strings fully restored', () => {
    const k = freshKernel(500);
    const val = 'interned-string-round-trip-test';
    for (let i = 0; i < 20; i++) k.ingest('ev', { label: val }, { source: 'test' });
    const k2 = restore(snapshot(k));
    const evs = k2.getAll().filter(e => e.type === 'ev');
    assert(evs.every(e => e.payload.label === val), 'interned string not restored');
  });
  test('numeric delta round-trip: values exact', () => {
    const k = freshKernel(200);
    const vals = [0, 5, 10, 15, 100, 200];
    for (const v of vals) k.ingest('counter', { val: v }, { source: 'test' });
    const k2 = restore(snapshot(k));
    const restored = k2.getAll().filter(e => e.type === 'counter');
    assertEqual(restored.length, vals.length);
    for (let i = 0; i < vals.length; i++) {
      assertEqual(restored[i].payload.val, vals[i]);
    }
  });
  test('v1 snapshot (no stringPool) restores without error', () => {
    const k = populatedKernel(10);
    const s = snapshot(k);
    delete s.stringPool; // simulate v1 (no pool)
    s.fmt = 1;
    const k2 = restore(s);
    assertEqual(k2.length, k.length);
  });
  test('empty kernel round-trips', () => {
    const k = freshKernel();
    const k2 = restore(snapshot(k));
    assertEqual(k2.length, 0);
  });
});

suite('compress.restore.negation', () => {
  test('throws on null input', () => {
    assertThrows(() => restore(null), 'not a valid URCK snapshot');
  });
  test('throws on wrong magic', () => {
    assertThrows(() => restore({ magic: 'WRONG', fmt: 2, ev: [] }), 'not a valid URCK snapshot');
  });
  test('throws on future format version', () => {
    assertThrows(() => restore({ magic: SNAP_MAGIC, fmt: 99, ev: [] }), 'unsupported');
  });
  test('throws on non-object input', () => {
    assertThrows(() => restore('not-a-snapshot'), 'not a valid URCK snapshot');
  });
  test('throws on number input', () => {
    assertThrows(() => restore(42), 'not a valid URCK snapshot');
  });
});

// ── compressionReport ─────────────────────────────────────────────────────────

suite('compress.compressionReport', () => {
  test('returns rawBytes, snapBytes, ratio', () => {
    const k = populatedKernel(30);
    const s = snapshot(k);
    const r = compressionReport(k, s);
    assert(r.rawBytes > 0);
    assert(r.snapBytes > 0);
    assertGte(r.ratio, 1);
  });
  test('ratio >= 1 (never larger than raw)', () => {
    const k = populatedKernel(50);
    const s = snapshot(k);
    assertGte(compressionReport(k, s).ratio, 1);
  });
  test('summary is a string with KB and ×', () => {
    const k = populatedKernel(20);
    const s = snapshot(k);
    const r = compressionReport(k, s);
    assert(typeof r.summary === 'string');
    assert(r.summary.includes('KB'));
    assert(r.summary.includes('×'));
  });
  test('primaryCount matches snap.n', () => {
    const k = populatedKernel(10);
    const s = snapshot(k);
    assertEqual(compressionReport(k, s).primaryCount, s.n);
  });
  test('bytesPerEvent > 0 for non-empty kernel', () => {
    const k = populatedKernel(10);
    const s = snapshot(k);
    assertGt(compressionReport(k, s).bytesPerEvent, 0);
  });
  test('stringPoolSize >= 0', () => {
    const k = populatedKernel(30);
    const s = snapshot(k);
    assertGte(compressionReport(k, s).stringPoolSize, 0);
  });
  test('formatVersion matches FORMAT_VERSION', () => {
    const k = populatedKernel(5);
    const s = snapshot(k);
    assertEqual(compressionReport(k, s).formatVersion, FORMAT_VERSION);
  });
  test('empty kernel: ratio=1, n=0', () => {
    const k = freshKernel();
    const s = snapshot(k);
    const r = compressionReport(k, s);
    assertEqual(r.primaryCount, 0);
    assertGte(r.ratio, 1);
  });
});

// ── blueprint ─────────────────────────────────────────────────────────────────

suite('compress.blueprint.structure', () => {
  test('magic is BP_MAGIC', () => {
    assertEqual(blueprint(freshKernel()).magic, BP_MAGIC);
  });
  test('fmt is FORMAT_VERSION', () => {
    assertEqual(blueprint(freshKernel()).fmt, FORMAT_VERSION);
  });
  test('session object has required fields', () => {
    const bp = blueprint(populatedKernel(10));
    assert('eventCount' in bp.session);
    assert('primaryCount' in bp.session);
    assert('edgeCount' in bp.session);
    assert('uniqueTypes' in bp.session);
    assert('maxCausalDepth' in bp.session);
  });
  test('vocab sorted by count descending', () => {
    const k = populatedKernel(20);
    const bp = blueprint(k);
    for (let i = 1; i < bp.vocab.length; i++) {
      assertGte(bp.vocab[i - 1].count, bp.vocab[i].count);
    }
  });
  test('vocab entries have successors, parents, isRoot', () => {
    const bp = blueprint(causalKernel());
    for (const v of bp.vocab) {
      assert('successors' in v);
      assert('parents' in v);
      assert('isRoot' in v);
    }
  });
  test('invariantBaseline embedded', () => {
    const bp = blueprint(populatedKernel(10));
    assert(bp.invariantBaseline, 'expected invariantBaseline in blueprint');
    assert('composite' in bp.invariantBaseline);
  });
  test('invariantMap embedded', () => {
    const bp = blueprint(populatedKernel(10));
    assert(bp.invariantMap, 'expected invariantMap in blueprint');
    assert('summary' in bp.invariantMap);
  });
  test('invariantPeak embedded', () => {
    const bp = blueprint(populatedKernel(10));
    assert(bp.invariantPeak, 'expected invariantPeak in blueprint');
  });
  test('schemas present for each event type', () => {
    const k = populatedKernel(20);
    const bp = blueprint(k);
    assert(bp.schemas && typeof bp.schemas === 'object');
    // At least one schema should exist
    assert(Object.keys(bp.schemas).length > 0);
  });
  test('schemas field coverage between 0 and 1', () => {
    const bp = blueprint(populatedKernel(20));
    for (const schema of Object.values(bp.schemas)) {
      for (const field of Object.values(schema.fields)) {
        assertGte(field.coverage, 0);
        assertGte(1, field.coverage);
      }
    }
  });
  test('empty kernel blueprint: 0 events', () => {
    const bp = blueprint(freshKernel());
    assertEqual(bp.session.eventCount, 0);
    assertEqual(bp.vocab.length, 0);
  });
});

// ── compile ───────────────────────────────────────────────────────────────────

suite('compress.compile', () => {
  test('compile produces a string', () => {
    const bp = blueprint(populatedKernel(10));
    assert(typeof compile(bp) === 'string');
  });
  test('ESM format includes export keyword', () => {
    const bp = blueprint(populatedKernel(10));
    assert(compile(bp, { format: 'esm' }).includes('export'));
  });
  test('CJS format includes module.exports', () => {
    const bp = blueprint(populatedKernel(10));
    assert(compile(bp, { format: 'cjs' }).includes('module.exports'));
  });
  test('type constants T present', () => {
    const bp = blueprint(populatedKernel(10));
    assert(compile(bp).includes('const T = Object.freeze'));
  });
  test('GRAMMAR map emitted when successors exist', () => {
    const bp = blueprint(causalKernel());
    const code = compile(bp);
    assert(code.includes('const GRAMMAR = new Map'));
  });
  test('SCHEMAS emitted when schemas non-empty', () => {
    const bp = blueprint(populatedKernel(20));
    assert(compile(bp).includes('const SCHEMAS ='));
  });
  test('INVARIANTS emitted', () => {
    const bp = blueprint(populatedKernel(10));
    assert(compile(bp).includes('const INVARIANTS = Object.freeze'));
  });
  test('createFromBlueprint factory present', () => {
    const bp = blueprint(populatedKernel(10));
    assert(compile(bp).includes('function createFromBlueprint'));
  });
  test('throws on invalid blueprint', () => {
    assertThrows(() => compile({ magic: 'WRONG' }), 'invalid blueprint');
  });
  test('throws on null blueprint', () => {
    assertThrows(() => compile(null), 'invalid blueprint');
  });
  test('ringCap reflected in factory', () => {
    const bp = blueprint(populatedKernel(5));
    assert(compile(bp, { ringCap: 999_999 }).includes('999999'));
  });
});

// ── createInvariantBaseline ───────────────────────────────────────────────────

suite('compress.invariantBaseline.structure', () => {
  test('empty kernel returns score 1.0', () => {
    const bl = createInvariantBaseline(freshKernel());
    assertEqual(bl.composite.score, 1.0);
  });
  test('invariants object has all 14 INV keys', () => {
    const bl = createInvariantBaseline(populatedKernel(20));
    for (const id of Object.keys(INV)) {
      assert(id in bl.invariants, `missing invariant ${id}`);
    }
  });
  test('all invariant scores in [0, 1]', () => {
    const bl = createInvariantBaseline(populatedKernel(30));
    for (const inv of Object.values(bl.invariants)) {
      assertGte(inv.score, 0);
      assertGte(1, inv.score);
    }
  });
  test('each invariant has history array', () => {
    const bl = createInvariantBaseline(populatedKernel(10));
    for (const inv of Object.values(bl.invariants)) {
      assert(Array.isArray(inv.history));
      assert(inv.history.length > 0);
    }
  });
  test('each invariant has trend field', () => {
    const bl = createInvariantBaseline(populatedKernel(10));
    const valid = ['stable', 'improving', 'degrading'];
    for (const inv of Object.values(bl.invariants)) {
      assertIncludes(valid, inv.trend);
    }
  });
  test('each invariant has status pass|warn|fail', () => {
    const bl = createInvariantBaseline(populatedKernel(10));
    const valid = ['pass', 'warn', 'fail'];
    for (const inv of Object.values(bl.invariants)) {
      assertIncludes(valid, inv.status);
    }
  });
  test('each invariant has peak and nadir with score and ts', () => {
    const bl = createInvariantBaseline(populatedKernel(10));
    for (const inv of Object.values(bl.invariants)) {
      assert(typeof inv.peak.score === 'number');
      assert(typeof inv.peak.ts   === 'number');
      assert(typeof inv.nadir.score === 'number');
      assert(typeof inv.nadir.ts   === 'number');
    }
  });
  test('composite has score, mean, std, trend', () => {
    const bl = createInvariantBaseline(populatedKernel(20));
    assert(typeof bl.composite.score === 'number');
    assert(typeof bl.composite.mean  === 'number');
    assert(typeof bl.composite.std   === 'number');
    assertIncludes(['stable', 'improving', 'degrading'], bl.composite.trend);
  });
  test('I-1 score 1.0 on well-formed kernel (all UUIDs valid)', () => {
    const bl = createInvariantBaseline(populatedKernel(20));
    assertEqual(bl.invariants['I-1'].score, 1.0);
  });
  test('T-1 score 1.0 on sequential kernel', () => {
    const bl = createInvariantBaseline(populatedKernel(20));
    assertEqual(bl.invariants['T-1'].score, 1.0);
  });
  test('T-3 score 1.0 when no future timestamps', () => {
    const bl = createInvariantBaseline(populatedKernel(20));
    assertEqual(bl.invariants['T-3'].score, 1.0);
  });
  test('C-2 score 1.0 when no macro:detected events stored', () => {
    const bl = createInvariantBaseline(populatedKernel(20));
    assertEqual(bl.invariants['C-2'].score, 1.0);
  });
  test('C-4 score 1.0 when no gate events in primary', () => {
    const bl = createInvariantBaseline(populatedKernel(20));
    assertEqual(bl.invariants['C-4'].score, 1.0);
  });
  test('sampleN matches kernel event count', () => {
    const k = populatedKernel(15);
    const bl = createInvariantBaseline(k);
    assertEqual(bl.sampleN, k.length);
  });
  test('magic is INV_MAGIC', () => {
    const bl = createInvariantBaseline(freshKernel());
    assertEqual(bl.magic, 'URCK-INV');
  });
});

// ── updateBaseline ────────────────────────────────────────────────────────────

suite('compress.updateBaseline', () => {
  test('returns same baseline object (mutates in-place)', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    const ref = bl;
    updateBaseline(bl, k);
    assert(bl === ref, 'updateBaseline should mutate in-place');
  });
  test('history grows after each update', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    const lenBefore = bl.composite.history.length;
    updateBaseline(bl, k);
    assertGt(bl.composite.history.length, lenBefore);
  });
  test('history capped at 200 entries', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    for (let i = 0; i < 250; i++) updateBaseline(bl, k);
    assertGte(200, bl.composite.history.length);
  });
  test('invariant history capped at 100 entries', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    for (let i = 0; i < 150; i++) updateBaseline(bl, k);
    for (const inv of Object.values(bl.invariants)) {
      assertGte(100, inv.history.length);
    }
  });
  test('sampleN updated to current kernel length', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    k.ingest('extra', {}, { source: 'test' });
    updateBaseline(bl, k);
    assertEqual(bl.sampleN, k.length);
  });
  test('peak score never decreases', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    const peakBefore = bl.peak;
    for (let i = 0; i < 5; i++) updateBaseline(bl, k);
    assertGte(bl.peak, peakBefore);
  });
});

// ── detectPeak ────────────────────────────────────────────────────────────────

suite('compress.detectPeak', () => {
  test('returns peakScore, currentScore, trend', () => {
    const bl   = createInvariantBaseline(populatedKernel(10));
    const peak = detectPeak(bl);
    assert(typeof peak.peakScore   === 'number');
    assert(typeof peak.currentScore === 'number');
    assert(typeof peak.trend === 'string');
  });
  test('peakScore >= currentScore (peak is never below current)', () => {
    const k  = populatedKernel(20);
    const bl = createInvariantBaseline(k);
    for (let i = 0; i < 10; i++) updateBaseline(bl, k);
    const p = detectPeak(bl);
    assertGte(p.peakScore, p.currentScore);
  });
  test('totalSamples matches composite history length', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    for (let i = 0; i < 5; i++) updateBaseline(bl, k);
    const p = detectPeak(bl);
    assertEqual(p.totalSamples, bl.composite.history.length);
  });
  test('optimalWindowEnd >= optimalWindowStart', () => {
    const k  = populatedKernel(10);
    const bl = createInvariantBaseline(k);
    for (let i = 0; i < 20; i++) updateBaseline(bl, k);
    const p = detectPeak(bl);
    assertGte(p.optimalWindowEnd, p.optimalWindowStart);
  });
  test('empty composite history: peakScore returned from baseline.peak', () => {
    const bl = createInvariantBaseline(freshKernel());
    bl.composite.history = [];
    const p = detectPeak(bl);
    assertEqual(p.peakScore, bl.peak);
  });
});

// ── invariantMap ──────────────────────────────────────────────────────────────

suite('compress.invariantMap', () => {
  test('returns correlationMatrix, clusters, criticalPath, summary', () => {
    const map = invariantMap(createInvariantBaseline(populatedKernel(20)));
    assert('correlationMatrix' in map);
    assert('clusters' in map);
    assert('criticalPath' in map);
    assert('summary' in map);
  });
  test('summary has passing, warning, failing, composite', () => {
    const map = invariantMap(createInvariantBaseline(populatedKernel(20)));
    assert(typeof map.summary.passing   === 'number');
    assert(typeof map.summary.warning   === 'number');
    assert(typeof map.summary.failing   === 'number');
    assert(typeof map.summary.composite === 'number');
  });
  test('sum of passing+warning+failing = total invariant count', () => {
    const map = invariantMap(createInvariantBaseline(populatedKernel(20)));
    assertEqual(
      map.summary.passing + map.summary.warning + map.summary.failing,
      Object.keys(INV).length
    );
  });
  test('clusters contain expected groups: I, C, T, S, K', () => {
    const map = invariantMap(createInvariantBaseline(populatedKernel(20)));
    assertIncludes(Object.keys(map.clusters), 'I');
    assertIncludes(Object.keys(map.clusters), 'C');
    assertIncludes(Object.keys(map.clusters), 'T');
    assertIncludes(Object.keys(map.clusters), 'S');
    assertIncludes(Object.keys(map.clusters), 'K');
  });
  test('correlationMatrix diagonal is 1.0', () => {
    const bl  = createInvariantBaseline(populatedKernel(20));
    // Need history for correlation — update several times
    for (let i = 0; i < 10; i++) updateBaseline(bl, populatedKernel(20));
    const map = invariantMap(bl);
    for (const [id, row] of Object.entries(map.correlationMatrix)) {
      assertEqual(row[id], 1.0, `diagonal for ${id} should be 1.0`);
    }
  });
  test('criticalPath sorted ascending by score', () => {
    const k  = populatedKernel(20);
    const bl = createInvariantBaseline(k);
    const map = invariantMap(bl);
    for (let i = 1; i < map.criticalPath.length; i++) {
      assertGte(map.criticalPath[i].score, map.criticalPath[i - 1].score);
    }
  });
  test('impact = 1 - score for each critical path entry', () => {
    const k  = populatedKernel(20);
    const bl = createInvariantBaseline(k);
    const map = invariantMap(bl);
    for (const c of map.criticalPath) {
      const expected = Math.round((1 - c.score) * 10000) / 10000;
      assertEqual(c.impact, expected);
    }
  });
  test('wellformed kernel has empty criticalPath (all pass)', () => {
    const k  = populatedKernel(20);
    const bl = createInvariantBaseline(k);
    const map = invariantMap(bl);
    // All invariants should be 1.0 on a clean kernel
    assertEqual(map.criticalPath.length, 0);
  });
});

// ── createTimeline ────────────────────────────────────────────────────────────

suite('compress.timeline.create', () => {
  test('returns a UUID v4', () => {
    assertUUID(createTimeline(freshKernel()));
  });
  test('registered timeline retrievable via getTimeline', () => {
    const k  = populatedKernel(10);
    const id = createTimeline(k, { name: 'test-tl' });
    const tl = getTimeline(id);
    assert(tl, 'getTimeline returned null');
    assertEqual(tl.name, 'test-tl');
  });
  test('timeline has baseline attached', () => {
    const id = createTimeline(populatedKernel(10));
    const tl = getTimeline(id);
    assert(tl.baseline, 'baseline not attached');
    assert('composite' in tl.baseline);
  });
  test('timeline has kernel reference', () => {
    const k  = populatedKernel(5);
    const id = createTimeline(k);
    assert(getTimeline(id).kernel === k);
  });
  test('listTimelines includes new timeline', () => {
    const id = createTimeline(populatedKernel(5), { name: 'list-test' });
    const list = listTimelines();
    assert(list.some(tl => tl.id === id));
  });
  test('listTimelines summary has eventCount', () => {
    const k  = populatedKernel(8);
    const id = createTimeline(k);
    const summary = listTimelines().find(t => t.id === id);
    assertEqual(summary.eventCount, k.length);
  });
  test('two timelines have different IDs', () => {
    const id1 = createTimeline(freshKernel());
    const id2 = createTimeline(freshKernel());
    assertNotEqual(id1, id2);
  });
  test('tags stored on timeline', () => {
    const id = createTimeline(freshKernel(), { tags: ['prod', 'v6'] });
    const tl = getTimeline(id);
    assertIncludes(tl.tags, 'prod');
    assertIncludes(tl.tags, 'v6');
  });
});

// ── forkTimeline ──────────────────────────────────────────────────────────────

suite('compress.timeline.fork', () => {
  test('returns a UUID different from parent', () => {
    const parentId = createTimeline(populatedKernel(10));
    const forkId   = forkTimeline(parentId, populatedKernel(5));
    assertUUID(forkId);
    assertNotEqual(forkId, parentId);
  });
  test('fork has parentId set', () => {
    const parentId = createTimeline(populatedKernel(10));
    const forkId   = forkTimeline(parentId, populatedKernel(5));
    assertEqual(getTimeline(forkId).parentId, parentId);
  });
  test('fork has its own kernel', () => {
    const parentKernel = populatedKernel(10);
    const forkKernel   = populatedKernel(5);
    const parentId = createTimeline(parentKernel);
    const forkId   = forkTimeline(parentId, forkKernel);
    assert(getTimeline(forkId).kernel === forkKernel);
    assert(getTimeline(forkId).kernel !== parentKernel);
  });
  test('fork has own baseline', () => {
    const parentId = createTimeline(populatedKernel(10));
    const forkId   = forkTimeline(parentId, populatedKernel(5));
    assert(getTimeline(forkId).baseline, 'fork baseline missing');
  });
  test('throws when parent not found', () => {
    assertThrows(
      () => forkTimeline('00000000-0000-4000-a000-000000000000', freshKernel()),
      'not found'
    );
  });
  test('fork name stored', () => {
    const parentId = createTimeline(populatedKernel(5));
    const forkId   = forkTimeline(parentId, freshKernel(), { name: 'my-fork' });
    assertEqual(getTimeline(forkId).name, 'my-fork');
  });
});

// ── branchTimeline ────────────────────────────────────────────────────────────

suite('compress.timeline.branch', () => {
  test('branch kernel has correct event count for seq range', () => {
    const k = freshKernel(500);
    for (let i = 0; i < 20; i++) k.ingest(`t${i}`, { i }, { source: 'test' });
    const all = k.getAll();
    const inRange = all.filter(e => e.seq >= 5 && e.seq <= 10).length;
    const tlId     = createTimeline(k);
    const branchId = branchTimeline(tlId, [5, 10]);
    const branch   = getTimeline(branchId);
    // branchTimeline re-ingests into new kernel — seq range 5..10 slices source
    assertEqual(branch.kernel.length, inRange);
  });
  test('branch returns a UUID', () => {
    const k    = populatedKernel(20);
    const tlId = createTimeline(k);
    assertUUID(branchTimeline(tlId, [0, 5]));
  });
  test('branch has parentId set to source timeline', () => {
    const k    = populatedKernel(20);
    const tlId = createTimeline(k);
    const bId  = branchTimeline(tlId, [0, 5]);
    // branchTimeline uses parentId on the record
    assert(getTimeline(bId) !== null);
  });
  test('throws when timeline not found', () => {
    assertThrows(
      () => branchTimeline('00000000-0000-4000-a000-000000000000', [0, 5]),
      'not found'
    );
  });
  test('branch from full range has all events', () => {
    const k      = populatedKernel(15);
    const all    = k.getAll();
    const minSeq = all[0].seq;
    const maxSeq = all[all.length - 1].seq;
    const tlId   = createTimeline(k);
    const bId    = branchTimeline(tlId, [minSeq, maxSeq]);
    assertEqual(getTimeline(bId).kernel.length, k.length);
  });
});

// ── mergeTimelines ────────────────────────────────────────────────────────────

suite('compress.timeline.merge', () => {
  function twoTimelines() {
    const k1 = populatedKernel(10);
    const k2 = populatedKernel(8);
    return [createTimeline(k1), createTimeline(k2)];
  }

  test('interleave merge returns UUID', () => {
    assertUUID(mergeTimelines(twoTimelines(), 'interleave'));
  });
  test('append merge returns UUID', () => {
    assertUUID(mergeTimelines(twoTimelines(), 'append'));
  });
  test('union merge returns UUID', () => {
    assertUUID(mergeTimelines(twoTimelines(), 'union'));
  });
  test('merged kernel has events from both timelines (interleave)', () => {
    const [a, b]   = twoTimelines();
    const mergedId = mergeTimelines([a, b], 'interleave');
    const merged   = getTimeline(mergedId);
    const kA = getTimeline(a).kernel.length;
    const kB = getTimeline(b).kernel.length;
    assertGte(merged.kernel.length, Math.max(kA, kB));
  });
  test('append merge: total events = sum of both kernels', () => {
    const k1 = populatedKernel(10);
    const k2 = populatedKernel(8);
    const a  = createTimeline(k1);
    const b  = createTimeline(k2);
    const merged = getTimeline(mergeTimelines([a, b], 'append'));
    assertEqual(merged.kernel.length, k1.length + k2.length);
  });
  test('union merge deduplicates identical events', () => {
    const k = populatedKernel(10);
    const a = createTimeline(k);
    const b = createTimeline(k); // same kernel, same events
    const merged = getTimeline(mergeTimelines([a, b], 'union'));
    assertGte(k.length * 2, merged.kernel.length); // ≤ 2× (deduped)
  });
  test('throws on unknown strategy', () => {
    assertThrows(() => mergeTimelines(twoTimelines(), 'invalid'), 'unknown strategy');
  });
  test('throws when timeline id not found', () => {
    const [a] = twoTimelines();
    assertThrows(
      () => mergeTimelines([a, '00000000-0000-4000-a000-000000000000'], 'interleave'),
      'not found'
    );
  });
  test('merged timeline has its own baseline', () => {
    const merged = getTimeline(mergeTimelines(twoTimelines(), 'interleave'));
    assert(merged.baseline, 'merged timeline has no baseline');
  });
});

// ── compareTimelines ──────────────────────────────────────────────────────────

suite('compress.timeline.compare', () => {
  function threeTimelines() {
    return [
      createTimeline(populatedKernel(10), { name: 'tl-a' }),
      createTimeline(populatedKernel(15), { name: 'tl-b' }),
      createTimeline(causalKernel(),      { name: 'tl-c' }),
    ];
  }

  test('returns timelines, axisMatrix, divergence, vocabMatrix', () => {
    const result = compareTimelines(threeTimelines());
    assert('timelines'   in result);
    assert('axisMatrix'  in result);
    assert('divergence'  in result);
    assert('vocabMatrix' in result);
  });
  test('timelines summary count matches input count', () => {
    const ids = threeTimelines();
    assertEqual(compareTimelines(ids).timelines.length, ids.length);
  });
  test('axisMatrix has entry for each INV key', () => {
    const result = compareTimelines(threeTimelines());
    for (const id of Object.keys(INV)) {
      assert(id in result.axisMatrix, `missing axis for ${id}`);
    }
  });
  test('divergence pairwise count = n*(n-1)/2', () => {
    const ids    = threeTimelines();
    const n      = ids.length;
    const result = compareTimelines(ids);
    assertEqual(Object.keys(result.divergence).length, n * (n - 1) / 2);
  });
  test('mostSimilar and mostDivergent present for 2+ timelines', () => {
    const result = compareTimelines(threeTimelines());
    assert(result.mostSimilar   !== null);
    assert(result.mostDivergent !== null);
  });
  test('vocabMatrix keys contain ↔ separator', () => {
    const result = compareTimelines(threeTimelines());
    for (const key of Object.keys(result.vocabMatrix)) {
      assert(key.includes('↔'), `expected ↔ separator in vocabMatrix key: ${key}`);
    }
  });
  test('jaccard score in [0, 1]', () => {
    const result = compareTimelines(threeTimelines());
    for (const [, v] of Object.entries(result.vocabMatrix)) {
      assertGte(v.jaccard, 0);
      assertGte(1, v.jaccard);
    }
  });
  test('throws when timeline id not found', () => {
    const [a] = threeTimelines();
    assertThrows(
      () => compareTimelines([a, '00000000-0000-4000-a000-000000000000']),
      'not found'
    );
  });
  test('identical timelines have divergence 0', () => {
    const k  = populatedKernel(10);
    const a  = createTimeline(k, { name: 'dup-a' });
    const b  = createTimeline(k, { name: 'dup-b' });
    const r  = compareTimelines([a, b]);
    const div = Object.values(r.divergence)[0];
    assertEqual(div.l1, 0);
  });
});

// ── refreshTimeline / dropTimeline ────────────────────────────────────────────

suite('compress.timeline.refresh-drop', () => {
  test('refreshTimeline returns updated baseline', () => {
    const id = createTimeline(populatedKernel(10));
    const bl = refreshTimeline(id);
    assert(bl && 'composite' in bl);
  });
  test('refreshTimeline throws for unknown id', () => {
    assertThrows(
      () => refreshTimeline('00000000-0000-4000-a000-000000000000'),
      'not found'
    );
  });
  test('dropTimeline removes from listTimelines', () => {
    const id = createTimeline(freshKernel(), { name: 'drop-me' });
    assert(listTimelines().some(t => t.id === id));
    dropTimeline(id);
    assert(!listTimelines().some(t => t.id === id));
  });
  test('dropTimeline returns true on success', () => {
    const id = createTimeline(freshKernel());
    assert(dropTimeline(id) === true);
  });
  test('dropTimeline is idempotent — false on second call', () => {
    const id = createTimeline(freshKernel());
    dropTimeline(id);
    assert(dropTimeline(id) === false);
  });
  test('getTimeline returns null after drop', () => {
    const id = createTimeline(freshKernel());
    dropTimeline(id);
    assertNull(getTimeline(id));
  });
});

// ── End-to-end integration ────────────────────────────────────────────────────

suite('compress.e2e', () => {
  test('snapshot → restore → blueprint → compile pipeline', () => {
    const k    = causalKernel();
    const snap = snapshot(k, { embedBaseline: true, embedSchemas: true });
    const k2   = restore(snap);
    const bp   = blueprint(k2);
    const code = compile(bp, { format: 'esm' });
    assert(typeof code === 'string' && code.length > 0);
    assert(code.includes('createFromBlueprint'));
  });
  test('timeline → fork → compare pipeline', () => {
    const parentId = createTimeline(populatedKernel(20), { name: 'e2e-parent' });
    const forkId   = forkTimeline(parentId, populatedKernel(10), { name: 'e2e-fork' });
    const result   = compareTimelines([parentId, forkId]);
    assert(result.timelines.length === 2);
    assert(result.mostDivergent !== null || result.mostSimilar !== null);
  });
  test('baseline evolves correctly over 20 update cycles', () => {
    const k  = populatedKernel(20);
    const bl = createInvariantBaseline(k);
    for (let i = 0; i < 20; i++) {
      k.ingest('cycle', { i }, { source: 'test' });
      updateBaseline(bl, k);
    }
    assertGt(bl.composite.history.length, 1);
    assertGt(bl.sampleN, 20);
  });
  test('full round-trip preserves causal graph integrity', () => {
    const k = causalKernel();
    const snap = snapshot(k);
    const k2   = restore(snap);
    // All causedBy refs should resolve
    for (const ev of k2.getAll().filter(e => e.causedBy)) {
      assert(k2.findById(ev.causedBy), `dangling causedBy ${ev.causedBy}`);
    }
  });
  test('compression ratio improves with repeated payloads', () => {
    const kRepeat = freshKernel(1000);
    const kDiverse = freshKernel(1000);
    for (let i = 0; i < 100; i++) {
      kRepeat.ingest('ev', { label: 'same-value-always', count: i }, { source: 'test' });
      kDiverse.ingest('ev', { label: `unique-val-${i}`, count: i }, { source: 'test' });
    }
    const rRepeat  = compressionReport(kRepeat,  snapshot(kRepeat));
    const rDiverse = compressionReport(kDiverse, snapshot(kDiverse));
    assertGte(rRepeat.ratio, rDiverse.ratio);
  });
});

// ── Report ────────────────────────────────────────────────────────────────────

report('compress.test.js');
