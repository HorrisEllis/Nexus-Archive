/**
 * ledger.test.js — Deep & Recursive Test Suite
 * @module ledger
 * @version 6.0.0
 *
 * Coverage:
 *   createUpgradeLedger:  commit, replay, findById, findByTag, findByType, tail
 *   createIdeaLedger:     record, close (REJECTED/ABANDONED), findById, unresolved, flowMetrics
 *   promoteIdea:          gate validation, proof requirement, status transitions, error cases
 *   validateSeparation: type checks, id uniqueness
 *   LedgerError: fields, message format, invariant ID
 *   Negation coverage:    L-1 mixing, L-2 type confusion, L-3 runtime effect, L-4 gate skip,
 *                         double-close, promote already-closed, missing proof, missing fields
 */

import {
  suite, test, assert, assertEqual, assertNotEqual, assertNull,
  assertThrows, assertIncludes, assertUUID, assertGte, report, reset,
} from '../runner.js';

import {
  createUpgradeLedger,
  createIdeaLedger,
  promoteIdea,
  validateSeparation,
  LedgerError,
  IDEA_STATUS,
  UPGRADE_TYPE,
} from '../../modules/ledger/index.js';

reset();

// ── Helpers ───────────────────────────────────────────────────────────────────

function freshUpgrade() { return createUpgradeLedger(); }
function freshIdea()    { return createIdeaLedger(); }

function validUpgradeEntry(overrides = {}) {
  return {
    type:        UPGRADE_TYPE.PASSING_TEST,
    description: 'All 89 tests pass on compress.test.js',
    proof:       { testFile: 'test/unit/compress.test.js' },
    version:     '6.0.0',
    ...overrides,
  };
}

function validIdeaEntry(overrides = {}) {
  return {
    description: 'Consider adding a streaming snapshot mode',
    hypothesis:  'Streaming would reduce peak memory for large kernels',
    tags:        ['performance', 'streaming'],
    ...overrides,
  };
}

// ── LedgerError ──────────────────────────────────────────────────────

suite('ledger.LedgerError', () => {
  test('is an instance of Error', () => {
    const e = new LedgerError('L-1', 'test message');
    assert(e instanceof Error);
  });
  test('name is LedgerError', () => {
    assertEqual(new LedgerError('L-2', 'msg').name, 'LedgerError');
  });
  test('message includes invariant ID and message', () => {
    const e = new LedgerError('L-4', 'gate skipped');
    assert(e.message.includes('L-4'));
    assert(e.message.includes('gate skipped'));
  });
  test('invariantId field set correctly', () => {
    assertEqual(new LedgerError('L-3', 'x').invariantId, 'L-3');
  });
  test('context field stored', () => {
    const ctx = { id: 'abc', detail: 42 };
    assertEqual(new LedgerError('L-1', 'msg', ctx).context, ctx);
  });
  test('ts is a recent timestamp', () => {
    assertGte(new LedgerError('L-1', 'x').ts, Date.now() - 1000);
  });
});

// ── IDEA_STATUS & UPGRADE_TYPE constants ──────────────────────────────────────

suite('ledger.constants', () => {
  test('IDEA_STATUS has UNRESOLVED, PROMOTED, REJECTED, ABANDONED', () => {
    assert('UNRESOLVED' in IDEA_STATUS);
    assert('PROMOTED'   in IDEA_STATUS);
    assert('REJECTED'   in IDEA_STATUS);
    assert('ABANDONED'  in IDEA_STATUS);
  });
  test('IDEA_STATUS is frozen', () => {
    assert(Object.isFrozen(IDEA_STATUS));
  });
  test('UPGRADE_TYPE has at least 6 types', () => {
    assert(Object.keys(UPGRADE_TYPE).length >= 6);
  });
  test('UPGRADE_TYPE is frozen', () => {
    assert(Object.isFrozen(UPGRADE_TYPE));
  });
  test('UPGRADE_TYPE includes PASSING_TEST', () => {
    assert('PASSING_TEST' in UPGRADE_TYPE);
  });
  test('UPGRADE_TYPE includes BUG_FIX', () => {
    assert('BUG_FIX' in UPGRADE_TYPE);
  });
  test('UPGRADE_TYPE includes PHASE_COMPLETE', () => {
    assert('PHASE_COMPLETE' in UPGRADE_TYPE);
  });
});

// ── UpgradeLedger ─────────────────────────────────────────────────────────────

suite('ledger.UpgradeLedger.creation', () => {
  test('type is "upgrade"', () => {
    assertEqual(freshUpgrade().type, 'upgrade');
  });
  test('id is a UUID v4', () => {
    assertUUID(freshUpgrade().id);
  });
  test('length starts at 0', () => {
    assertEqual(freshUpgrade().length, 0);
  });
  test('two ledgers have different IDs', () => {
    assertNotEqual(freshUpgrade().id, freshUpgrade().id);
  });
  test('createdTs is recent', () => {
    assertGte(freshUpgrade().createdTs, Date.now() - 1000);
  });
});

suite('ledger.UpgradeLedger.commit', () => {
  test('commit returns a record with id', () => {
    const ul = freshUpgrade();
    const r  = ul.commit(validUpgradeEntry());
    assertUUID(r.id);
  });
  test('commit increments length', () => {
    const ul = freshUpgrade();
    ul.commit(validUpgradeEntry());
    assertEqual(ul.length, 1);
    ul.commit(validUpgradeEntry());
    assertEqual(ul.length, 2);
  });
  test('record is frozen after commit', () => {
    const ul = freshUpgrade();
    const r  = ul.commit(validUpgradeEntry());
    assert(Object.isFrozen(r));
  });
  test('record ledgerType is "upgrade"', () => {
    const r = freshUpgrade().commit(validUpgradeEntry());
    assertEqual(r.ledgerType, 'upgrade');
  });
  test('record fields preserved', () => {
    const ul = freshUpgrade();
    const entry = validUpgradeEntry({ version: '6.0.1', tags: ['phase-7'] });
    const r = ul.commit(entry);
    assertEqual(r.version, '6.0.1');
    assertIncludes(r.tags, 'phase-7');
  });
  test('proof stored on record', () => {
    const r = freshUpgrade().commit(validUpgradeEntry());
    assert(r.proof.testFile === 'test/unit/compress.test.js');
  });
  test('tags are frozen on record', () => {
    const r = freshUpgrade().commit(validUpgradeEntry({ tags: ['x'] }));
    assert(Object.isFrozen(r.tags));
  });
  test('ts is a recent number', () => {
    const r = freshUpgrade().commit(validUpgradeEntry());
    assertGte(r.ts, Date.now() - 1000);
  });
});

suite('ledger.UpgradeLedger.commit.negation', () => {
  test('throws without proof field', () => {
    assertThrows(
      () => freshUpgrade().commit({ type: UPGRADE_TYPE.BUG_FIX, description: 'x' }),
      'proof'
    );
  });
  test('throws with empty proof object (no evidence)', () => {
    assertThrows(
      () => freshUpgrade().commit({ ...validUpgradeEntry(), proof: {} }),
      'proof'
    );
  });
  test('throws when proof has none of testFile, diffLink, metric', () => {
    assertThrows(
      () => freshUpgrade().commit({ ...validUpgradeEntry(), proof: { note: 'no evidence here' } }),
      'proof'
    );
  });
  test('accepts proof with diffLink', () => {
    const r = freshUpgrade().commit(validUpgradeEntry({ proof: { diffLink: 'github.com/x/y/diff/abc' } }));
    assert(r.id);
  });
  test('accepts proof with metric', () => {
    const r = freshUpgrade().commit(validUpgradeEntry({ proof: { metric: { before: 56, after: 89 } } }));
    assert(r.id);
  });
  test('throws when ledgerType=idea entry passed to commit (L-1)', () => {
    assertThrows(
      () => freshUpgrade().commit({ ledgerType: 'idea', proof: { testFile: 'x' } }),
      'L-1'
    );
  });
});

suite('ledger.UpgradeLedger.query', () => {
  function populated() {
    const ul = freshUpgrade();
    ul.commit(validUpgradeEntry({ type: UPGRADE_TYPE.BUG_FIX,       tags: ['core'], version: '6.0.1' }));
    ul.commit(validUpgradeEntry({ type: UPGRADE_TYPE.PASSING_TEST,   tags: ['ci'],   version: '6.0.2' }));
    ul.commit(validUpgradeEntry({ type: UPGRADE_TYPE.PHASE_COMPLETE, tags: ['core'], version: '6.1.0' }));
    return ul;
  }

  test('replay returns all entries in order', () => {
    const ul = populated();
    assertEqual(ul.replay().length, 3);
  });
  test('replay returns defensive copies', () => {
    const ul = populated();
    const entries = ul.replay();
    entries[0].description = 'mutated';
    assertNotEqual(ul.replay()[0].description, 'mutated');
  });
  test('findById returns correct entry', () => {
    const ul = freshUpgrade();
    const r  = ul.commit(validUpgradeEntry());
    assertEqual(ul.findById(r.id).id, r.id);
  });
  test('findById returns null for unknown id', () => {
    assertNull(freshUpgrade().findById('no-such-id'));
  });
  test('findByTag returns matching entries', () => {
    const ul = populated();
    const results = ul.findByTag('core');
    assertEqual(results.length, 2);
  });
  test('findByTag returns empty for unknown tag', () => {
    assertEqual(populated().findByTag('nonexistent').length, 0);
  });
  test('findByType returns matching entries', () => {
    const ul = populated();
    assertEqual(ul.findByType(UPGRADE_TYPE.BUG_FIX).length, 1);
    assertEqual(ul.findByType(UPGRADE_TYPE.PASSING_TEST).length, 1);
  });
  test('tail returns last N entries', () => {
    const ul = populated();
    const t  = ul.tail(2);
    assertEqual(t.length, 2);
    assertEqual(t[1].entryType, UPGRADE_TYPE.PHASE_COMPLETE);
  });
  test('tail(1) returns the most recent entry', () => {
    const ul = populated();
    assertEqual(ul.tail(1)[0].entryType, UPGRADE_TYPE.PHASE_COMPLETE);
  });
  test('assertSeparation passes for clean ledger', () => {
    const ul = populated();
    // Should not throw
    ul.assertSeparation();
    assert(true);
  });
});

// ── IdeaLedger ────────────────────────────────────────────────────────────────

suite('ledger.IdeaLedger.creation', () => {
  test('type is "idea"', () => {
    assertEqual(freshIdea().type, 'idea');
  });
  test('id is UUID v4', () => {
    assertUUID(freshIdea().id);
  });
  test('length starts at 0', () => {
    assertEqual(freshIdea().length, 0);
  });
  test('unresolved starts empty', () => {
    assertEqual(freshIdea().unresolved.length, 0);
  });
});

suite('ledger.IdeaLedger.record', () => {
  test('returns idea with id', () => {
    const idea = freshIdea().record(validIdeaEntry());
    assertUUID(idea.id);
  });
  test('status starts as UNRESOLVED', () => {
    const idea = freshIdea().record(validIdeaEntry());
    assertEqual(idea.status, IDEA_STATUS.UNRESOLVED);
  });
  test('description preserved', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry({ description: 'unique desc here' }));
    assertEqual(idea.description, 'unique desc here');
  });
  test('hypothesis stored', () => {
    const idea = freshIdea().record(validIdeaEntry({ hypothesis: 'might work' }));
    assertEqual(idea.hypothesis, 'might work');
  });
  test('tags stored', () => {
    const idea = freshIdea().record(validIdeaEntry({ tags: ['perf', 'v7'] }));
    assertIncludes(idea.tags, 'perf');
  });
  test('length increments per record', () => {
    const il = freshIdea();
    il.record(validIdeaEntry());
    il.record(validIdeaEntry());
    assertEqual(il.length, 2);
  });
  test('unresolved grows with new records', () => {
    const il = freshIdea();
    il.record(validIdeaEntry());
    il.record(validIdeaEntry());
    assertEqual(il.unresolved.length, 2);
  });
  test('findById retrieves the idea', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    assertEqual(il.findById(idea.id).id, idea.id);
  });
  test('findById returns null for unknown id', () => {
    assertNull(freshIdea().findById('bogus'));
  });
  test('ledgerType is "idea"', () => {
    assertEqual(freshIdea().record(validIdeaEntry()).ledgerType, 'idea');
  });
});

suite('ledger.IdeaLedger.record.negation.L3', () => {
  test('throws (L-3) when entry has enforces=true', () => {
    assertThrows(
      () => freshIdea().record({ ...validIdeaEntry(), enforces: true }),
      'L-3'
    );
  });
  test('throws (L-3) when entry has affectsRuntime=true', () => {
    assertThrows(
      () => freshIdea().record({ ...validIdeaEntry(), affectsRuntime: true }),
      'L-3'
    );
  });
  test('does not throw when enforces is false', () => {
    freshIdea().record({ ...validIdeaEntry(), enforces: false });
    assert(true);
  });
  test('does not throw when affectsRuntime is false', () => {
    freshIdea().record({ ...validIdeaEntry(), affectsRuntime: false });
    assert(true);
  });
});

suite('ledger.IdeaLedger.close', () => {
  test('close REJECTED sets status', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    il.close(idea.id, IDEA_STATUS.REJECTED, 'did not improve perf');
    assertEqual(il.findById(idea.id).status, IDEA_STATUS.REJECTED);
  });
  test('close ABANDONED sets status', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    il.close(idea.id, IDEA_STATUS.ABANDONED);
    assertEqual(il.findById(idea.id).status, IDEA_STATUS.ABANDONED);
  });
  test('close REJECTED stores failureMode', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    il.close(idea.id, IDEA_STATUS.REJECTED, 'not feasible');
    assertEqual(il.findById(idea.id).failureMode, 'not feasible');
  });
  test('close removes from unresolved', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    assertEqual(il.unresolved.length, 1);
    il.close(idea.id, IDEA_STATUS.REJECTED);
    assertEqual(il.unresolved.length, 0);
  });
  test('updatedTs updated after close', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    const before = idea.updatedTs;
    il.close(idea.id, IDEA_STATUS.ABANDONED);
    assertGte(il.findById(idea.id).updatedTs, before);
  });
  test('findByStatus returns REJECTED ideas', () => {
    const il = freshIdea();
    const a  = il.record(validIdeaEntry());
    const b  = il.record(validIdeaEntry());
    il.close(a.id, IDEA_STATUS.REJECTED);
    const rejected = il.findByStatus(IDEA_STATUS.REJECTED);
    assertEqual(rejected.length, 1);
    assertEqual(rejected[0].id, a.id);
  });
});

suite('ledger.IdeaLedger.close.negation', () => {
  test('throws (L-4) when closing with PROMOTED status directly', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    assertThrows(() => il.close(idea.id, IDEA_STATUS.PROMOTED), 'L-4');
  });
  test('throws (L-4) on double-close', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    il.close(idea.id, IDEA_STATUS.REJECTED);
    assertThrows(() => il.close(idea.id, IDEA_STATUS.ABANDONED), 'L-4');
  });
  test('throws (L-4) for unknown idea id', () => {
    assertThrows(() => freshIdea().close('no-such-id', IDEA_STATUS.REJECTED), 'L-4');
  });
  test('throws (L-4) for invalid status string', () => {
    const il   = freshIdea();
    const idea = il.record(validIdeaEntry());
    assertThrows(() => il.close(idea.id, 'not-a-real-status'), 'L-4');
  });
});

// ── flowMetrics ───────────────────────────────────────────────────────────────

suite('ledger.IdeaLedger.flowMetrics', () => {
  test('all zeros for empty ledger', () => {
    const m = freshIdea().flowMetrics();
    assertEqual(m.total, 0);
    assertEqual(m.promoted, 0);
    assertEqual(m.conversionRate, 0);
  });
  test('conversionRate = promoted / total', () => {
    const il   = freshIdea();
    const ul   = freshUpgrade();
    const a = il.record(validIdeaEntry());
    const b = il.record(validIdeaEntry());
    const c = il.record(validIdeaEntry());
    promoteIdea(il, ul, a.id, validUpgradeEntry());
    const m = il.flowMetrics();
    assertEqual(m.total,    3);
    assertEqual(m.promoted, 1);
    assertEqual(m.conversionRate, Math.round((1/3) * 10000) / 10000);
  });
  test('bottleneckSignal true when > 5 unresolved', () => {
    const il = freshIdea();
    for (let i = 0; i < 6; i++) il.record(validIdeaEntry());
    assert(il.flowMetrics().bottleneckSignal);
  });
  test('bottleneckSignal false when <= 5 unresolved', () => {
    const il = freshIdea();
    for (let i = 0; i < 3; i++) il.record(validIdeaEntry());
    assert(!il.flowMetrics().bottleneckSignal);
  });
  test('pending count matches unresolved length', () => {
    const il = freshIdea();
    il.record(validIdeaEntry());
    il.record(validIdeaEntry());
    const m = il.flowMetrics();
    assertEqual(m.pending, il.unresolved.length);
  });
});

// ── promoteIdea ───────────────────────────────────────────────────────────────

suite('ledger.promoteIdea', () => {
  test('returns idea and upgrade records', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    const { idea, upgrade } = promoteIdea(il, ul, a.id, validUpgradeEntry());
    assert(idea    && 'id' in idea);
    assert(upgrade && 'id' in upgrade);
  });
  test('idea status set to PROMOTED', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    promoteIdea(il, ul, a.id, validUpgradeEntry());
    assertEqual(il.findById(a.id).status, IDEA_STATUS.PROMOTED);
  });
  test('upgrade committed to UpgradeLedger', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    promoteIdea(il, ul, a.id, validUpgradeEntry());
    assertEqual(ul.length, 1);
  });
  test('upgrade entry has ideaId traceability', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    const { upgrade } = promoteIdea(il, ul, a.id, validUpgradeEntry());
    assertEqual(upgrade.ideaId, a.id);
  });
  test('promoted idea removed from unresolved', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    assertEqual(il.unresolved.length, 1);
    promoteIdea(il, ul, a.id, validUpgradeEntry());
    assertEqual(il.unresolved.length, 0);
  });
  test('upgrade committed even when ideaId not in entry (it is injected)', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    const { upgrade } = promoteIdea(il, ul, a.id, { ...validUpgradeEntry(), ideaId: undefined });
    assertEqual(upgrade.ideaId, a.id); // injected by promoteIdea
  });
});

suite('ledger.promoteIdea.negation', () => {
  test('throws (L-2) if first arg is not IdeaLedger', () => {
    const ul = freshUpgrade();
    const il = freshIdea();
    const a  = il.record(validIdeaEntry());
    assertThrows(() => promoteIdea(ul, ul, a.id, validUpgradeEntry()), 'L-2');
  });
  test('throws (L-2) if second arg is not UpgradeLedger', () => {
    const il = freshIdea();
    const a  = il.record(validIdeaEntry());
    assertThrows(() => promoteIdea(il, il, a.id, validUpgradeEntry()), 'L-2');
  });
  test('throws (L-4) when idea not found', () => {
    assertThrows(
      () => promoteIdea(freshIdea(), freshUpgrade(), 'no-such-id', validUpgradeEntry()),
      'L-4'
    );
  });
  test('throws (L-4) when idea already PROMOTED', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    promoteIdea(il, ul, a.id, validUpgradeEntry());
    assertThrows(
      () => promoteIdea(il, ul, a.id, validUpgradeEntry()),
      'L-4'
    );
  });
  test('throws (L-4) when idea already REJECTED', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    il.close(a.id, IDEA_STATUS.REJECTED);
    assertThrows(
      () => promoteIdea(il, ul, a.id, validUpgradeEntry()),
      'L-4'
    );
  });
  test('throws (L-4) when idea already ABANDONED', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    il.close(a.id, IDEA_STATUS.ABANDONED);
    assertThrows(
      () => promoteIdea(il, ul, a.id, validUpgradeEntry()),
      'L-4'
    );
  });
  test('throws (L-4) when upgradeEntry has no proof', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    assertThrows(
      () => promoteIdea(il, ul, a.id, { type: UPGRADE_TYPE.BUG_FIX, description: 'no proof' }),
      'L-4'
    );
  });
  test('throws (L-4) when proof has no valid evidence fields', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    assertThrows(
      () => promoteIdea(il, ul, a.id, { ...validUpgradeEntry(), proof: { comment: 'trust me' } }),
      'L-4'
    );
  });
  test('idea stays UNRESOLVED if upgrade commit fails', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    const a  = il.record(validIdeaEntry());
    try {
      promoteIdea(il, ul, a.id, { type: UPGRADE_TYPE.BUG_FIX, description: 'no proof' });
    } catch (_) {}
    assertEqual(il.findById(a.id).status, IDEA_STATUS.UNRESOLVED);
  });
});

// ── validateSeparation ──────────────────────────────────────────────────

suite('ledger.validateSeparation', () => {
  test('returns true for valid pair', () => {
    assertEqual(validateSeparation(freshIdea(), freshUpgrade()), true);
  });
  test('throws (L-2) when first arg is UpgradeLedger', () => {
    assertThrows(() => validateSeparation(freshUpgrade(), freshUpgrade()), 'L-2');
  });
  test('throws (L-2) when second arg is IdeaLedger', () => {
    assertThrows(() => validateSeparation(freshIdea(), freshIdea()), 'L-2');
  });
  test('throws (L-2) when first arg is null', () => {
    assertThrows(() => validateSeparation(null, freshUpgrade()), 'L-2');
  });
  test('throws (L-2) when second arg is null', () => {
    assertThrows(() => validateSeparation(freshIdea(), null), 'L-2');
  });
  test('throws (L-2) when args swapped', () => {
    assertThrows(() => validateSeparation(freshUpgrade(), freshIdea()), 'L-2');
  });
  test('throws (L-1) when both ledgers share same ID', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    // Manually corrupt IDs to be equal — structural test
    const fakeUl = { ...ul, id: il.id, type: 'upgrade', assertSeparation: () => {} };
    assertThrows(() => validateSeparation(il, fakeUl), 'L-1');
  });
});

// ── End-to-end lifecycle ──────────────────────────────────────────────────────

suite('ledger.e2e', () => {
  test('full idea lifecycle: record → hostile review → reject', () => {
    const il = freshIdea();
    const a  = il.record({ description: 'Add async snapshot mode', hypothesis: 'Reduces memory' });
    assertEqual(a.status, IDEA_STATUS.UNRESOLVED);
    // Hostile review finds flaw — reject
    il.close(a.id, IDEA_STATUS.REJECTED, 'Breaks §3.1 bottom-up — async complicates layer order');
    assertEqual(il.findById(a.id).status, IDEA_STATUS.REJECTED);
    assertEqual(il.findById(a.id).failureMode, 'Breaks §3.1 bottom-up — async complicates layer order');
    assertEqual(il.unresolved.length, 0);
  });

  test('full idea lifecycle: record → prove → promote → upgrade committed', () => {
    const il = freshIdea();
    const ul = freshUpgrade();

    const idea = il.record({
      description: 'Add string pool interning to compress',
      hypothesis:  'Will improve ratio by 20-40% on verbose payloads',
      tags:        ['compress', 'v6'],
    });

    // Build proves it
    const { upgrade } = promoteIdea(il, ul, idea.id, {
      type:        UPGRADE_TYPE.PASSING_TEST,
      description: 'String pool implemented, 89/89 tests passing',
      proof:       { testFile: 'test/unit/compress.test.js', metric: { ratioBefore: 4.2, ratioAfter: 9.1 } },
      version:     '6.0.0',
    });

    assertEqual(idea.status, IDEA_STATUS.PROMOTED);
    assertEqual(ul.length, 1);
    assertEqual(upgrade.ideaId, idea.id);
    assertIncludes(il.findByStatus(IDEA_STATUS.PROMOTED).map(i => i.id), idea.id);
    assertEqual(il.unresolved.length, 0);
  });

  test('multiple ideas in parallel — only one promoted', () => {
    const il = freshIdea();
    const ul = freshUpgrade();

    const a = il.record(validIdeaEntry({ description: 'Idea A' }));
    const b = il.record(validIdeaEntry({ description: 'Idea B' }));
    const c = il.record(validIdeaEntry({ description: 'Idea C' }));

    promoteIdea(il, ul, b.id, validUpgradeEntry());
    il.close(a.id, IDEA_STATUS.REJECTED, 'failed review');

    const m = il.flowMetrics();
    assertEqual(m.total,    3);
    assertEqual(m.promoted, 1);
    assertEqual(m.rejected, 1);
    assertEqual(m.pending,  1);  // C still unresolved
    assert(il.flowMetrics().bottleneckSignal === false); // only 1 unresolved
  });

  test('replay from UpgradeLedger reconstructs full history', () => {
    const il = freshIdea();
    const ul = freshUpgrade();

    const a = il.record(validIdeaEntry());
    const b = il.record(validIdeaEntry());

    promoteIdea(il, ul, a.id, validUpgradeEntry({ version: '6.0.1', tags: ['core'] }));
    promoteIdea(il, ul, b.id, validUpgradeEntry({ version: '6.0.2', tags: ['ui'] }));

    const history = ul.replay();
    assertEqual(history.length, 2);
    assertEqual(history[0].version, '6.0.1');
    assertEqual(history[1].version, '6.0.2');
    // Verify order is stable
    assertGte(history[1].ts, history[0].ts);
  });

  test('validateSeparation passes on clean e2e pair', () => {
    const il = freshIdea();
    const ul = freshUpgrade();
    il.record(validIdeaEntry());
    ul.commit(validUpgradeEntry());
    assert(validateSeparation(il, ul));
  });
});

// ── Report ────────────────────────────────────────────────────────────────────

report('ledger.test.js');

// ── Bridge adapter (causal-nexus only) ───────────────────────────────────────

import { createKernel } from '../../modules/kernel/index.js';
import { bridgeLedger, createBridgedLedger } from '../../modules/ledger/index.js';

suite('ledger.bridge', () => {
  test('bridgeLedger returns an unsub function', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    const unsub = bridgeLedger(l, k);
    assert(typeof unsub === 'function');
    unsub();
  });

  test('idea:recorded emits ledger:idea:recorded into kernel', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    bridgeLedger(l, k);
    l.record(validIdeaEntry({ description: 'bridge test idea', domain: 'test' }));
    const ev = k.getAll().find(e => e.type === 'ledger:idea:recorded');
    assert(ev, 'ledger:idea:recorded not found in kernel');
    assertEqual(ev.payload.description, 'bridge test idea');
    assertEqual(ev.payload.domain, 'test');
  });

  test('ledger:idea:recorded source is ledger module UUID', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    bridgeLedger(l, k);
    l.record(validIdeaEntry());
    const ev = k.getAll().find(e => e.type === 'ledger:idea:recorded');
    assert(ev.source.startsWith('ledger:'), `unexpected source: ${ev.source}`);
  });

  test('ledger:idea:recorded edgeType is observational (L-3)', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    bridgeLedger(l, k);
    l.record(validIdeaEntry());
    const ev = k.getAll().find(e => e.type === 'ledger:idea:recorded');
    assertEqual(ev.edgeType, 'observational');
  });

  test('idea:closed emits ledger:idea:closed into kernel', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    bridgeLedger(l, k);
    const idea = l.record(validIdeaEntry());
    l.close(idea.id, IDEA_STATUS.REJECTED, 'did not survive review');
    const ev = k.getAll().find(e => e.type === 'ledger:idea:closed');
    assert(ev, 'ledger:idea:closed not found in kernel');
    assertEqual(ev.payload.status, IDEA_STATUS.REJECTED);
    assertEqual(ev.payload.failureMode, 'did not survive review');
  });

  test('upgrade:committed emits ledger:upgrade:committed into kernel', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    bridgeLedger(l, k);
    l.commit(validUpgradeEntry({ version: '1.0.0', domain: 'test' }));
    const ev = k.getAll().find(e => e.type === 'ledger:upgrade:committed');
    assert(ev, 'ledger:upgrade:committed not found in kernel');
    assertEqual(ev.payload.version, '1.0.0');
    assertEqual(ev.payload.domain, 'test');
  });

  test('idea:promoted emits ledger:idea:promoted into kernel', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    bridgeLedger(l, k);
    const idea = l.record(validIdeaEntry());
    l.promote(idea.id, validUpgradeEntry({ version: '2.0.0' }));
    const ev = k.getAll().find(e => e.type === 'ledger:idea:promoted');
    assert(ev, 'ledger:idea:promoted not found in kernel');
    assertEqual(ev.payload.ideaId, idea.id);
    assertEqual(ev.payload.version, '2.0.0');
  });

  test('bottleneck emits ledger:bottleneck into kernel when > 5 unresolved', () => {
    const l = createLedger();
    const k = createKernel({ ringCap: 1000 });
    bridgeLedger(l, k);
    for (let i = 0; i < 6; i++) l.record(validIdeaEntry());
    const ev = k.getAll().find(e => e.type === 'ledger:bottleneck');
    assert(ev, 'ledger:bottleneck not found in kernel');
    assert(ev.payload.bottleneckSignal === true);
    assertGt(ev.payload.pending, 5);
  });

  test('unbridgeLedger stops kernel events', () => {
    const l    = createLedger();
    const k    = createKernel({ ringCap: 1000 });
    const unsub = bridgeLedger(l, k);
    l.record(validIdeaEntry()); // fires into kernel
    unsub();
    l.record(validIdeaEntry()); // should NOT fire into kernel
    const events = k.getAll().filter(e => e.type === 'ledger:idea:recorded');
    assertEqual(events.length, 1); // only the first one
  });

  test('ledger still works after unbridgeLedger (core unaffected)', () => {
    const l    = createLedger();
    const k    = createKernel({ ringCap: 1000 });
    const unsub = bridgeLedger(l, k);
    unsub();
    // Core API still works
    const idea = l.record(validIdeaEntry());
    assertEqual(idea.status, IDEA_STATUS.UNRESOLVED);
    l.close(idea.id, IDEA_STATUS.REJECTED);
    assertEqual(l.idea.findById(idea.id).status, IDEA_STATUS.REJECTED);
  });

  test('createBridgedLedger returns ledger and unbridgeLedger', () => {
    const k = createKernel({ ringCap: 1000 });
    const { ledger, unbridgeLedger } = createBridgedLedger(k, { project: 'NEXUS' });
    assert(ledger && ledger.idea && ledger.upgrade);
    assert(typeof unbridgeLedger === 'function');
    unbridgeLedger();
  });

  test('createBridgedLedger project stored on ledger', () => {
    const k = createKernel({ ringCap: 1000 });
    const { ledger } = createBridgedLedger(k, { project: 'SENTINEL' });
    assertEqual(ledger.project, 'SENTINEL');
  });

  test('createBridgedLedger events flow into kernel immediately', () => {
    const k = createKernel({ ringCap: 1000 });
    const { ledger } = createBridgedLedger(k, { project: 'ALK' });
    ledger.commit(validUpgradeEntry());
    const ev = k.getAll().find(e => e.type === 'ledger:upgrade:committed');
    assert(ev, 'upgrade event not in kernel after createBridgedLedger');
  });

  test('bridgeLedger throws on non-kernel second arg', () => {
    assertThrows(() => bridgeLedger(createLedger(), {}), 'L-2');
  });

  test('bridgeLedger throws on null kernel', () => {
    assertThrows(() => bridgeLedger(createLedger(), null), 'L-2');
  });

  test('multiple ledgers can bridge to same kernel independently', () => {
    const k  = createKernel({ ringCap: 5000 });
    const l1 = createLedger({ project: 'NEXUS' });
    const l2 = createLedger({ project: 'SENTINEL' });
    bridgeLedger(l1, k);
    bridgeLedger(l2, k);
    l1.record(validIdeaEntry());
    l2.record(validIdeaEntry());
    const events = k.getAll().filter(e => e.type === 'ledger:idea:recorded');
    assertEqual(events.length, 2);
  });

  test('all bridged events have valid UUID v4 kernel IDs (I-1)', () => {
    const k = createKernel({ ringCap: 1000 });
    const { ledger } = createBridgedLedger(k);
    const idea = ledger.record(validIdeaEntry());
    ledger.promote(idea.id, validUpgradeEntry());
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const ev of k.getAll()) {
      assert(uuidRe.test(ev.id), `event ${ev.type} has non-UUID id: ${ev.id}`);
    }
  });
});
