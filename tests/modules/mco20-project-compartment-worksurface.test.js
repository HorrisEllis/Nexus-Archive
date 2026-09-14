'use strict';

/**
 * tests/modules/mco20-project-compartment-worksurface.test.js
 *
 * §MCO20 2026-09-13 — real tests: lib/project-compartment.js's
 * buildSeedFromPayload() truncation behavior is UNCHANGED for every
 * existing caller, AND a truncated file now also gets a real
 * workSurface reference covering the whole file.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { buildSeedFromPayload } = require('../../lib/project-compartment.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

function makeProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-compartment-test-'));
  for (const [rel, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

test('PC-001: a small file is included whole, unchanged behavior, no workSurface field', () => {
  const dir = makeProject({ 'small.js': 'a small real file' });
  const seed = buildSeedFromPayload(dir, { maxBytesPerFile: 4000 });
  assert.strictEqual(seed.ok, true);
  assert.strictEqual(seed.files['small.js'].truncated, false);
  assert.strictEqual(seed.files['small.js'].content, 'a small real file');
  assert.strictEqual('workSurface' in seed.files['small.js'], false);
});

test('PC-002: a large file is still truncated exactly as before (byte-for-byte unchanged)', () => {
  const bigContent = Array.from({ length: 500 }, (_, i) => `line ${i}`).join('\n');
  const dir = makeProject({ 'big.js': bigContent });
  const seed = buildSeedFromPayload(dir, { maxBytesPerFile: 100 });
  assert.strictEqual(seed.ok, true);
  assert.strictEqual(seed.files['big.js'].truncated, true);
  assert.strictEqual(seed.files['big.js'].content, bigContent.slice(0, 100));
});

test('PC-003: a truncated file now ALSO gets a real workSurface covering the whole file, not just the truncated slice', () => {
  const lines = Array.from({ length: 500 }, (_, i) => `line ${i}`);
  const bigContent = lines.join('\n');
  const dir = makeProject({ 'big.js': bigContent });
  const seed = buildSeedFromPayload(dir, { maxBytesPerFile: 100, workSurfaceOpts: { chunkLines: 150 } });
  const entry = seed.files['big.js'];
  assert.ok(entry.workSurface, 'a real workSurface reference must be attached to a truncated file');
  assert.strictEqual(entry.workSurface.lineCount, 500);
  assert.ok(entry.workSurface.chunkCount >= 1);
  const lastChunk = entry.workSurface.chunks[entry.workSurface.chunks.length - 1];
  assert.strictEqual(lastChunk.endLine, 500, 'the work surface must cover the WHOLE file, not just the truncated slice');
});

console.log(`\n  mco20-project-compartment-worksurface: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
