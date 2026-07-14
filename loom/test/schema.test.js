'use strict';
/**
 * loom/test/schema.test.js — Phase 131 verification.
 * AXIOMS §12.1 (every runtime file has a brutal, recursive test suite),
 * §12.2 (tests are verification, not coverage) — every axiom below is
 * chosen because it's a real failure mode (duplicate id, dangling wire,
 * seam with no owning component), not because it pads a percentage.
 *
 * Run: node loom/test/schema.test.js
 * Uses a throwaway data dir so this never touches the real registry.json.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { LoomDriver } = require('../schema/index');

let pass = 0, fail = 0;
function check(label, fn) {
  try {
    fn();
    pass++;
    console.log(`  PASS  ${label}`);
  } catch (e) {
    fail++;
    console.log(`  FAIL  ${label} — ${e.message}`);
  }
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loom-test-'));
const driver = new LoomDriver({ dataDir: tmpDir });

console.log(`\nLOOM Phase 131 — schema layer test\ndata dir: ${tmpDir}\n`);

// ── 1. Valid component registers and persists to disk ──────────────────────
check('valid component declaration registers', () => {
  const r = driver.declare('component', {
    id: 'nexus.loom', namespace: 'loom', name: 'LOOM', version: '0.1.0',
    uuid: 'nexus-loom-v1-0000-2026-0701-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
  assert.strictEqual(r.stored.id, 'nexus.loom');
});

check('component persisted to disk, not just memory', () => {
  const onDisk = JSON.parse(fs.readFileSync(path.join(tmpDir, 'registry.json'), 'utf8'));
  assert.ok(onDisk.component['nexus.loom'], 'component missing from registry.json on disk');
});

// ── 2. Duplicate id — hard axiom rejection ──────────────────────────────────
check('duplicate component id is hard-rejected', () => {
  const r = driver.declare('component', {
    id: 'nexus.loom', namespace: 'loom', name: 'LOOM again', version: '0.2.0',
    uuid: 'nexus-loom-v1-0000-2026-0701-jamesbrooks-002',
  });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.reason, 'axiom-rejected');
  assert.ok(r.failures.some(f => f.axiomId === 'loom.unique-id'));
});

// ── 3. Missing required field — schema rejection, not a crash ──────────────
check('component missing required field is schema-rejected, no throw', () => {
  const r = driver.declare('component', {
    id: 'nexus.loom.broken', namespace: 'loom',
    uuid: 'nexus-loom-broken-v1-0000-2026-0701-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.reason, 'schema-rejected');
  assert.ok(r.detail.missing.includes('name'));
  assert.ok(r.detail.missing.includes('version'));
});

check('component missing uuid is axiom-rejected (uuid enforced only by the Axiom now)', () => {
  const r = driver.declare('component', {
    id: 'nexus.loom.no-uuid', namespace: 'loom', name: 'No UUID', version: '0.1.0',
  });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.reason, 'axiom-rejected');
  assert.ok(r.failures.some(f => f.axiomId === 'loom.uuid-present'));
});

// ── 4. Hook needs a real component ──────────────────────────────────────────
check('hook referencing unknown component is hard-rejected', () => {
  const r = driver.declare('hook', {
    id: 'loom.hook.declare.in', component_id: 'nexus.does-not-exist', name: 'declare-in',
    type: 'api', direction: 'in', uuid: 'nexus-loom-hook-v1-0000-2026-0701-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some(f => f.axiomId === 'loom.hook-component-exists'));
});

check('hook on a real component registers', () => {
  const r = driver.declare('hook', {
    id: 'loom.hook.declare.in', component_id: 'nexus.loom', name: 'declare-in',
    type: 'api', direction: 'in', uuid: 'nexus-loom-hook-v1-0000-2026-0701-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
  assert.strictEqual(r.stored.novelType, false); // 'api' is in KNOWN_HOOK_TYPES
});

check('hook with a novel (unregistered) type still registers, flagged not rejected', () => {
  const r = driver.declare('hook', {
    id: 'loom.hook.declare.telepathy', component_id: 'nexus.loom', name: 'declare-telepathy',
    type: 'quantum_entanglement', direction: 'in',
    uuid: 'nexus-loom-hook-v1-0000-2026-0701-jamesbrooks-002',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
  assert.strictEqual(r.stored.novelType, true);
});

// ── 5. Second component + hook for a real wire ──────────────────────────────
check('second component registers', () => {
  const r = driver.declare('component', {
    id: 'nexus.architect', namespace: 'architect', name: 'The Architect', version: '1.1.0',
    uuid: 'nexus-architect-registry-v1-0000-2026-0627-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
});

check('hook on second component registers', () => {
  const r = driver.declare('hook', {
    id: 'architect.hooks.list', component_id: 'nexus.architect', name: 'hooks-list',
    type: 'api', direction: 'out', uuid: 'nexus-architect-hook-v1-0000-2026-0701-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
});

// ── 6. Wire between two real hooks ──────────────────────────────────────────
check('wire between two real hooks registers', () => {
  const r = driver.declare('wire', {
    id: 'wire.loom-hears-architect', from_hook_id: 'architect.hooks.list',
    to_hook_id: 'loom.hook.declare.in', uuid: 'nexus-loom-wire-v1-0000-2026-0701-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
});

// ── 7. Dangling wire — hard axiom rejection ─────────────────────────────────
check('wire to a nonexistent hook is hard-rejected', () => {
  const r = driver.declare('wire', {
    id: 'wire.dangling', from_hook_id: 'loom.hook.declare.in',
    to_hook_id: 'nexus.does-not-exist.hook', uuid: 'nexus-loom-wire-v1-0000-2026-0701-jamesbrooks-002',
  });
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some(f => f.axiomId === 'loom.wire-endpoints-exist'));
});

// ── 8. Self-wire — Gate-level rejection (not an axiom, structural) ─────────
check('self-wire is schema-rejected', () => {
  const r = driver.declare('wire', {
    id: 'wire.self', from_hook_id: 'loom.hook.declare.in',
    to_hook_id: 'loom.hook.declare.in', uuid: 'nexus-loom-wire-v1-0000-2026-0701-jamesbrooks-003',
  });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.reason, 'schema-rejected');
});

// ── 9. Seam needs a real component ──────────────────────────────────────────
check('seam on unknown component is hard-rejected', () => {
  const r = driver.declare('seam', {
    id: 'seam.ghost', component_id: 'nexus.does-not-exist', name: 'ghost-seam',
    kind: 'ingress', uuid: 'nexus-loom-seam-v1-0000-2026-0701-jamesbrooks-001',
  });
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some(f => f.axiomId === 'loom.seam-component-exists'));
});

check('seam on real component with invalid kind is schema-rejected', () => {
  const r = driver.declare('seam', {
    id: 'seam.loom.declare', component_id: 'nexus.loom', name: 'declare-surface',
    kind: 'sideways', uuid: 'nexus-loom-seam-v1-0000-2026-0701-jamesbrooks-002',
  });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.reason, 'schema-rejected');
});

check('seam on real component with valid kind registers', () => {
  const r = driver.declare('seam', {
    id: 'seam.loom.declare', component_id: 'nexus.loom', name: 'declare-surface',
    kind: 'ingress', uuid: 'nexus-loom-seam-v1-0000-2026-0701-jamesbrooks-003',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
});

// ── 10. graph() reflects real wire adjacency ────────────────────────────────
check('graph() returns real hook/wire adjacency', () => {
  const g = driver.graph();
  assert.strictEqual(g.nodes.length, 3); // 2 known-type hooks + 1 novel-type hook
  assert.strictEqual(g.edges.length, 1);
  assert.strictEqual(g.edges[0].from, 'architect.hooks.list');
  assert.strictEqual(g.edges[0].to, 'loom.hook.declare.in');
});

// ── 11. Audit trail — every declaration logged, per §12.1 ───────────────────
// StreamLog records every event Stream.emit() sees, including the events
// a Gate's transform() produces and Stream then recurses into (the
// '*.registered' / '*.rejected' follow-on). So total entries > declare()
// call count is correct Warp behavior, not a bug — this test asserts the
// thing that actually matters: exactly one '.declare' entry per call.
check('every declaration attempt has exactly one .declare entry in the StreamLog', () => {
  const trail = driver.auditTrail();
  const declareEntries = trail.filter(e => e.eventType.endsWith('.declare'));
  assert.strictEqual(declareEntries.length, 15, `expected 15 .declare entries, got ${declareEntries.length}`);
  assert.ok(trail.length > declareEntries.length,
    'expected follow-on registered/rejected events to also be logged (recursive audit)');
});

// ── 12. concern — §BUILT 2026-07-14, the roadmap primitive ─────────────────
// Positioned after the audit-trail count check above (not before) so these
// new declare() calls don't shift that test's hardcoded expected count.
check('a real concern registers with its full real shape, including optional relatesTo/detail', () => {
  const r = driver.declare('concern', {
    id: 'concern-test-001', kind: 'closed-door', title: 'a real detected concern',
    severity: 'medium', source: 'test', relatesTo: ['nexus.some-component'],
    detail: { file: 'somewhere.js', consumers: 0 },
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
  assert.deepStrictEqual(r.stored.relatesTo, ['nexus.some-component']);
});

check('a concern with an invalid severity is schema-rejected, not silently accepted', () => {
  const r = driver.declare('concern', {
    id: 'concern-test-002', kind: 'closed-door', title: 'bad severity',
    severity: 'catastrophic', source: 'test',
  });
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('rejected') || r.detail?.reason?.includes('severity'), JSON.stringify(r));
});

check('a concern missing required fields is schema-rejected with the real missing list, not a generic error', () => {
  const r = driver.declare('concern', { id: 'concern-test-003', kind: 'closed-door' });
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(r.detail.missing.sort(), ['severity', 'source', 'title']);
});

check('a real concern persists and is queryable back by id', () => {
  const fetched = driver.registry.get('concern', 'concern-test-001');
  assert.strictEqual(fetched.title, 'a real detected concern');
});

check('kind is open-ended (not a closed enum) — an unseen concern kind still registers, same philosophy as hook type', () => {
  const r = driver.declare('concern', {
    id: 'concern-test-004', kind: 'a-brand-new-kind-nobody-has-used-yet',
    title: 'novel kind', severity: 'low', source: 'test',
  });
  assert.strictEqual(r.ok, true, JSON.stringify(r));
});

console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);
