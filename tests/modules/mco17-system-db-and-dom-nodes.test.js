'use strict';

/**
 * tests/modules/mco17-system-db-and-dom-nodes.test.js
 *
 * §12.1/§12.2 — every assertion runs against a real JaaStore in a real temp
 * directory, through the real exportToFile path. Nothing is mocked, because
 * the claims under test are "is this on disk", "is this in the right system's
 * database", and "does history survive a re-export" — all three of which a
 * mock would answer yes to regardless of the truth.
 *
 * §12.3 — each test names its expected state in its own title.
 */

const assert = require('assert');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');

// §SANDBOX — redirect BOTH stores before anything requires them. JAA_DATA_DIR
// isolates cortex's shared singleton (the fallback path node-index.js uses when
// no handle is passed); NODE_INDEX_DIR isolates the per-system databases. A
// test that believes it is isolated and is not is worse than no isolation,
// because it is trusted — jaa-store.js's own §SANDBOX note records that exact
// failure happening here before.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mco17-'));
process.env.NODE_INDEX_DIR = path.join(TMP, 'systems');
process.env.JAA_DATA_DIR   = path.join(TMP, 'cortex-store');
fs.mkdirSync(process.env.NODE_INDEX_DIR, { recursive: true });
fs.mkdirSync(process.env.JAA_DATA_DIR,   { recursive: true });

const nodeExport = require('../../lib/node-export.js');
const systemDb   = require('../../lib/system-db.js');

let pass = 0, fail = 0;
async function test(id, name, fn) {
  try { await fn(); pass++; console.log(`  ✓ ${id} ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${id} ${name}\n      ${e.message}`); }
}

const NODES = path.join(TMP, 'nodes');

(async () => {
  console.log('\nMCO17 — per-system node databases, .dom, .database, query_nodes\n');

  await test('TYPE-001', '.dom and .database are accepted by KNOWN_TYPES', async () => {
    // wrap() throws on an unknown type — the cheapest real proof of registration.
    assert.doesNotThrow(() => nodeExport.wrap('dom', 'x', { pickId: 'x', name: 'x', pickedAt: 1 }, {}));
    assert.doesNotThrow(() => nodeExport.wrap('database', 'x', { system: 'x', dir: '/x', tables: [], ts: 1 }, {}));
  });

  await test('IDX-001', 'exporting a node indexes it into its OWNING system, with no call-site change', async () => {
    nodeExport.exportToFile('command', 'demo-cmd', { method: 'GET', path: '/demo' },
      { system: 'guardian', tags: ['demo'] }, path.join(NODES, 'command'));
    const rows = systemDb.forSystem('guardian').queryNodes('command');
    assert.strictEqual(rows.length, 1, `expected 1 indexed row, got ${rows.length}`);
    assert.strictEqual(rows[0].id, 'demo-cmd');
    assert.strictEqual(rows[0].system, 'guardian');
  });

  await test('IDX-002', "one system's nodes never land in another system's database (§10.1, §5.9)", async () => {
    nodeExport.exportToFile('command', 'cg-cmd', { method: 'GET', path: '/cg' },
      { system: 'clear-glass' }, path.join(NODES, 'command'));
    const guardianRows = systemDb.forSystem('guardian').queryNodes('command').map(r => r.id);
    const cgRows       = systemDb.forSystem('clear-glass').queryNodes('command').map(r => r.id);
    assert.ok(!guardianRows.includes('cg-cmd'), "clear-glass's node leaked into guardian's database");
    assert.ok(cgRows.includes('cg-cmd'));
    assert.ok(!cgRows.includes('demo-cmd'), "guardian's node leaked into clear-glass's database");
  });

  await test('IDX-003', 'a node with no owning system is not indexed, and is not assigned one (§17.1)', async () => {
    nodeExport.exportToFile('command', 'orphan-cmd', { method: 'GET', path: '/o' }, {}, path.join(NODES, 'command'));
    for (const s of systemDb.listSystems()) {
      const ids = systemDb.forSystem(s).queryNodes('command').map(r => r.id);
      assert.ok(!ids.includes('orphan-cmd'), `orphan was silently filed under "${s}"`);
    }
  });

  await test('IDX-004', 'a re-export appends history rather than overwriting it (§0.3)', async () => {
    const dir = path.join(NODES, 'command');
    nodeExport.exportToFile('command', 'demo-cmd', { method: 'POST', path: '/demo' }, { system: 'guardian' }, dir);
    const hist = systemDb.forSystem('guardian').history('command', 'demo-cmd');
    assert.ok(hist.length >= 2, `expected >= 2 ledger entries, got ${hist.length}`);
    assert.strictEqual(hist[0].action, 'added');
    assert.strictEqual(hist[hist.length - 1].action, 'changed');
    // The index row still resolves to ONE live node — history accumulates, the
    // index does not duplicate.
    const rows = systemDb.forSystem('guardian').queryNodes('command').filter(r => r.id === 'demo-cmd');
    assert.strictEqual(rows.length, 1);
  });

  await test('IDX-005', 'history is the question the filesystem genuinely cannot answer', async () => {
    // The node file was overwritten in place by IDX-004. The directory can only
    // ever show the latest state; the ledger is the only place the earlier one
    // survives. This is the capability claim from the spec, tested directly.
    const files = fs.readdirSync(path.join(NODES, 'command')).filter(f => f.startsWith('demo-cmd'));
    assert.strictEqual(files.length, 1, 'the filesystem kept more than one version — premise of the test is wrong');
    const hist = systemDb.forSystem('guardian').history('command', 'demo-cmd');
    assert.ok(hist.length > files.length, 'the index knows no more than the filesystem does');
  });

  await test('DB-001', 'describe() reports only node types actually written (§1.1)', async () => {
    const d = systemDb.forSystem('guardian').describe();
    assert.ok(d.nodeTypes.includes('command'));
    assert.ok(!d.nodeTypes.includes('contract'), 'reported a type guardian has never written here');
    assert.strictEqual(d.system, 'guardian');
    assert.ok(d.totalRows >= 1);
    assert.ok(typeof d.indexedSince === 'number', 'indexedSince missing — the honest boundary is required');
  });

  await test('DB-002', 'publish() writes a real .database node for the system', async () => {
    const r = systemDb.forSystem('guardian').publish();
    assert.strictEqual(r.ok, true, r.reason);
    assert.ok(fs.existsSync(r.path));
    const back = nodeExport.importFromFile(r.path);
    assert.strictEqual(back.type, 'database');
    assert.strictEqual(back.payload.system, 'guardian');
  });

  await test('DB-003', 'listSystems reads the disk, never a declared list', async () => {
    const systems = systemDb.listSystems();
    assert.ok(systems.includes('guardian'));
    assert.ok(systems.includes('clear-glass'));
    assert.ok(!systems.includes('idearium'), 'reported a system that has written nothing');
  });

  await test('DOM-001', 'a clear-glass pick becomes a durable .dom node', async () => {
    const domNodes = require('../../clear-glass/lib/dom-nodes.js');
    const r = domNodes.writePick({
      pickId: 'pick-abc', name: 'submit-button', agentId: 'chatgpt',
      nodeId: 'cg-42', meta: { selector: '#submit', url: 'https://example.test/x' },
      pickedAt: Date.now(),
    });
    assert.strictEqual(r.ok, true, r.reason);
    assert.ok(fs.existsSync(r.path));
  });

  await test('DOM-002', 'a pick survives a process restart — the §2.1 violation is closed', async () => {
    // loadPicks() reads from disk with no in-memory state involved, which is
    // exactly what archaeology.js's constructor does at boot.
    const domNodes = require('../../clear-glass/lib/dom-nodes.js');
    const picks = domNodes.loadPicks();
    const found = picks.find(p => p.name === 'submit-button');
    assert.ok(found, 'the pick did not survive');
    assert.strictEqual(found.selector, '#submit');
  });

  await test('DOM-003', 'an unnamed pick is refused — a handle with no name cannot be addressed', async () => {
    const domNodes = require('../../clear-glass/lib/dom-nodes.js');
    const r = domNodes.writePick({ pickId: 'pick-xyz' });
    assert.strictEqual(r.ok, false);
    assert.match(r.reason, /name required/);
  });

  await test('DOM-004', '.dom is filed under clear-glass, not guardian (§10.1)', async () => {
    const cg = systemDb.forSystem('clear-glass').queryNodes('dom').map(r => r.id);
    assert.ok(cg.includes('pick-abc'));
    const g = systemDb.forSystem('guardian').queryNodes('dom').map(r => r.id);
    assert.ok(!g.includes('pick-abc'));
  });

  // ── the .tool (§3.4 — the top of the stack, over layers already proven) ──
  const tool = require('../../lib/agent-tools/tools/query/query-nodes.js');

  await test('TOOL-001', 'query_nodes exposes the real agent-tool contract', async () => {
    assert.strictEqual(tool.name, 'query_nodes');
    assert.strictEqual(typeof tool.execute, 'function');
    assert.ok(tool.parameters && tool.parameters.required.includes('action'));
  });

  await test('TOOL-002', 'action:systems lists real systems', async () => {
    const r = await tool.execute({ action: 'systems' });
    assert.ok(r.systems.includes('guardian'), JSON.stringify(r));
  });

  await test('TOOL-003', 'action:query returns real indexed rows', async () => {
    const r = await tool.execute({ action: 'query', system: 'guardian', type: 'command' });
    assert.ok(r.total >= 1);
    assert.ok(r.nodes.some(n => n.id === 'demo-cmd'));
  });

  await test('TOOL-004', 'action:history returns the chronological ledger', async () => {
    const r = await tool.execute({ action: 'history', system: 'guardian', type: 'command', id: 'demo-cmd' });
    assert.ok(r.entries.length >= 2, JSON.stringify(r));
    assert.ok(r.entries[0].ts <= r.entries[r.entries.length - 1].ts, 'not in chronological order (§3.2)');
  });

  await test('TOOL-005', 'a missing required param is a specific error, never a silent empty (§1.2)', async () => {
    const a = await tool.execute({ action: 'query', system: 'guardian' });
    assert.match(a.error, /requires a type/);
    const b = await tool.execute({ action: 'describe' });
    assert.match(b.error, /requires a system/);
    const c = await tool.execute({ action: 'nonsense' });
    assert.match(c.error, /unknown action/);
  });

  await test('LAT-001', 'linkLattice refuses a self-edge and accepts two distinct endpoints', async () => {
    assert.strictEqual(systemDb.linkLattice('guardian', 'guardian').linked, false);
    assert.strictEqual(systemDb.linkLattice('guardian', null).linked, false);
    // The lattice is fire-and-forget and must never throw into the write path,
    // whatever state it is in.
    assert.doesNotThrow(() => systemDb.linkLattice('guardian', 'clear-glass', 'node.test'));
  });

  await test('ADV-001', 'an index failure never fails the node write it describes (§1.2)', async () => {
    // Hostile: a system name that cannot be a directory on any platform. The
    // node file must still land — the file is truth, the index is a projection.
    const dir = path.join(NODES, 'command');
    const p = nodeExport.exportToFile('command', 'hostile', { method: 'GET', path: '/h' },
      { system: '\u0000/bad\u0000name' }, dir);
    assert.ok(fs.existsSync(p), 'the node write was lost because indexing failed');
  });

  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
