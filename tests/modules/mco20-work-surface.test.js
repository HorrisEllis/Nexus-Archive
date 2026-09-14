'use strict';

/**
 * tests/modules/mco20-work-surface.test.js
 *
 * §MCO20 2026-09-13 — real tests for lib/work-surface.js: the real
 * operating table for a large file, built to close project-compartment.js's
 * truncation gap for massive repos.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { parseFile, chunkLineRanges, createWorkSurface, getChunkContent, exportWorkSurface } = require('../../lib/work-surface.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

function makeFile(lines) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'worksurface-test-')), 'file.txt');
  fs.writeFileSync(p, lines.join('\n'));
  return p;
}

test('WS-001: parseFile refuses a missing file, not throws', () => {
  const r = parseFile('/tmp/definitely-does-not-exist-12345.txt');
  assert.strictEqual(r.ok, false);
});

test('WS-002: parseFile counts real lines correctly, no trailing-newline off-by-one', () => {
  const p = makeFile(['a', 'b', 'c']);
  const r = parseFile(p);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.lineCount, 3);
});

test('WS-003: chunkLineRanges covers the WHOLE range with no gaps and no overlaps', () => {
  const r = chunkLineRanges(500, { chunkLines: 150 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.ranges.length, 4);
  assert.strictEqual(r.ranges[0].startLine, 1);
  assert.strictEqual(r.ranges[r.ranges.length - 1].endLine, 500);
  for (let i = 1; i < r.ranges.length; i++) {
    assert.strictEqual(r.ranges[i].startLine, r.ranges[i - 1].endLine + 1, 'no gap or overlap between consecutive chunks');
  }
});

test('WS-004: chunkLineRanges on a zero-line file returns zero real chunks, not a fabricated one', () => {
  const r = chunkLineRanges(0);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.ranges.length, 0);
});

test('WS-005: chunkLineRanges refuses an invalid chunkLines, not silently defaulting', () => {
  const r = chunkLineRanges(100, { chunkLines: 0 });
  assert.strictEqual(r.ok, false);
});

test('WS-006: createWorkSurface produces real chunk metadata covering a real 500-line file', () => {
  const lines = Array.from({ length: 500 }, (_, i) => `line ${i + 1}`);
  const p = makeFile(lines);
  const ws = createWorkSurface(p, { chunkLines: 200 });
  assert.strictEqual(ws.ok, true);
  assert.strictEqual(ws.lineCount, 500);
  assert.strictEqual(ws.chunkCount, 3);
  assert.ok(ws.chunks.every(c => typeof c.contentHash === 'string' && c.contentHash.length === 16));
});

test('WS-007: getChunkContent re-derives the exact real content for a given chunk index', () => {
  const lines = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`);
  const p = makeFile(lines);
  const chunk = getChunkContent(p, 0, { chunkLines: 5 });
  assert.strictEqual(chunk.ok, true);
  assert.strictEqual(chunk.startLine, 1);
  assert.strictEqual(chunk.endLine, 5);
  assert.strictEqual(chunk.content, 'line 1\nline 2\nline 3\nline 4\nline 5');
});

test('WS-008: getChunkContent refuses an out-of-range chunkIndex with a real, specific reason', () => {
  const p = makeFile(['a', 'b']);
  const chunk = getChunkContent(p, 99, { chunkLines: 150 });
  assert.strictEqual(chunk.ok, false);
  assert.ok(chunk.reason.includes('out of range'));
});

test('WS-009: a work surface\'s own chunk hash matches getChunkContent\'s re-derived content for the same chunk', () => {
  const lines = Array.from({ length: 20 }, (_, i) => `x${i}`);
  const p = makeFile(lines);
  const ws = createWorkSurface(p, { chunkLines: 7 });
  const crypto = require('crypto');
  for (const c of ws.chunks) {
    const real = getChunkContent(p, c.index, { chunkLines: 7 });
    const realHash = crypto.createHash('sha256').update(real.content).digest('hex').slice(0, 16);
    assert.strictEqual(c.contentHash, realHash, `chunk ${c.index} hash must match its own real re-derived content`);
  }
});

test('WS-010: exportWorkSurface writes a real .worksurface node that round-trips', () => {
  const p = makeFile(['one', 'two', 'three']);
  const ws = createWorkSurface(p, { chunkLines: 2 });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'worksurface-node-'));
  const filePath = exportWorkSurface(ws, dir, { system: 'test' });
  assert.ok(fs.existsSync(filePath));
  const { importFromFile } = require('../../lib/node-export.js');
  const doc = importFromFile(filePath);
  assert.strictEqual(doc.type, 'worksurface');
  assert.strictEqual(doc.payload.lineCount, 3);
  assert.strictEqual(doc.payload.chunkCount, ws.chunkCount);
  assert.ok(doc.payload.chunks.every(c => !('content' in c)));
});

console.log(`\n  mco20-work-surface: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
