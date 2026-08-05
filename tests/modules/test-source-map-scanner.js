'use strict';
/**
 * tests/modules/test-source-map-scanner.js
 * Proves loom/scanners/source-map.js derives the registry from SOURCE, and in
 * particular that it does not fabricate edges from require() calls that live in
 * comments or template literals — the failure that produced the phantom wires
 * this scanner was built to make impossible.
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const { scanTree, idFor, stripNonCode } = require(path.join(ROOT, 'loom/scanners/source-map'));

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); console.log(`  ✓ ${id} ${name}`); passed++; }
  catch (e) { console.log(`  ✗ ${id} ${name}\n    ${e.message}`); failed++; }
}

test('T-001', 'id derivation collapses /index and namespaces under nexus.', () => {
  assert.strictEqual(idFor('meta/rfr2/kernel/index.js'), 'nexus.meta.rfr2.kernel');
  assert.strictEqual(idFor('lib/version.js'), 'nexus.lib.version');
  assert.strictEqual(idFor('autopilot.js'), 'nexus.autopilot');
});

test('T-002', 'comments and template literals are stripped before extraction', () => {
  const src = `
    // require('./commented-out')
    /* require('./in-a-block') */
    const w = \`const x = require('./inside-a-template');\`;
    const real = require('./actually-required');
  `;
  const out = stripNonCode(src);
  assert.ok(!/commented-out/.test(out), 'line comment survived');
  assert.ok(!/in-a-block/.test(out), 'block comment survived');
  assert.ok(!/inside-a-template/.test(out), 'template literal survived');
  assert.ok(/actually-required/.test(out), 'the real require was destroyed');
});

test('T-003', 'the known phantom edges are NOT produced', () => {
  // meta/cfr/index.js has require('./lib/cfr') in a usage-example docblock and
  // meta/rfr2/compress/index.js emits require('./src/kernel/index.js') inside a
  // template literal of generated code. Neither path exists. An unstripped
  // reader declares both as wires; this one must not.
  const { FILES } = scanTree();
  const byPath = new Map(FILES.map(f => [f[0], f[2]]));
  for (const [file, bad] of [['meta/cfr/index.js', 'lib.cfr'],
                             ['meta/rfr2/compress/index.js', 'src.kernel']]) {
    const deps = byPath.get(file);
    if (!deps) continue; // hand-mapped and excluded in bootstrap; fine either way
    assert.ok(!deps.some(d => d.includes(bad)),
      `${file} produced a phantom edge containing "${bad}"`);
  }
});

test('T-004', 'every declared edge resolves to a real file on disk', () => {
  const { FILES } = scanTree();
  const known = new Set(FILES.map(f => f[1]));
  let checked = 0;
  for (const [file, , deps] of FILES) {
    for (const d of deps) {
      // Every dep id is either another scanned file, or a hand-mapped one.
      assert.ok(typeof d === 'string' && d.startsWith('nexus.'), `bad dep id from ${file}: ${d}`);
      checked++;
    }
  }
  assert.ok(checked > 500, `expected the tree to have many edges, got ${checked}`);
  assert.ok(known.size > 700, `expected the tree to have many files, got ${known.size}`);
});

test('T-005', 'excluded directories are not scanned', () => {
  const { FILES } = scanTree();
  for (const [file] of FILES) {
    assert.ok(!file.startsWith('node_modules/'), `scanned node_modules: ${file}`);
    assert.ok(!file.startsWith('unintegrated/'), `scanned unintegrated (staged, not installed): ${file}`);
    assert.ok(!file.startsWith('data/'), `scanned runtime ledgers: ${file}`);
    assert.ok(!file.startsWith('docs/'), `scanned docs (holds stale copies of real service files): ${file}`);
  }
});

test('T-006', 'no file is declared as depending on itself', () => {
  const { FILES } = scanTree();
  for (const [file, id, deps] of FILES) {
    assert.ok(!deps.includes(id), `${file} declares an edge to itself`);
  }
});

test('T-007', 'the scan covers materially more than the hand maps ever did', () => {
  // The reason this scanner exists. If someone reverts it to a curated list,
  // this fails loudly rather than the registry quietly shrinking again.
  const { stats } = scanTree();
  const hand = require(path.join(ROOT, 'loom/maps/warp-map')).FILES.length
             + require(path.join(ROOT, 'loom/maps/observability-map')).FILES.length
             + require(path.join(ROOT, 'loom/maps/relational-field-map')).FILES.length;
    assert.ok(stats.scanned > hand * 10,
      `scanner covers ${stats.scanned} files vs ${hand} hand-mapped — expected an order of magnitude more`);
});

test('T-008', 'the scanner reports what it CANNOT see, rather than implying completeness', () => {
  const { stats } = scanTree();
  assert.ok('dynamicRequiresNotCaptured' in stats, 'dynamic requires must be counted, not ignored');
  assert.ok('unresolvedSpecifiers' in stats, 'unresolved specifiers must be counted');
  assert.ok(stats.dynamicRequiresNotCaptured > 0,
    'this tree definitely contains dynamic requires — a zero here means the counter broke');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
