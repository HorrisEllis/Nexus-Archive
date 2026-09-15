'use strict';
// tests/modules/test-component-chunker.js — §NEW 2026-09-13
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chunkSource, chunkFile, getChunk, _hash } = require('../../lib/component-chunker.js');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.log(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

test('CHUNK-001', 'chunking a small synthetic file: chunk text concatenated in order reconstructs the source exactly', () => {
  const src = `// header comment\nconst x = 1;\n\nfunction foo() {\n  return 1;\n}\n\nclass Bar {\n  method() {}\n}\n`;
  const result = chunkSource('test.component', src);
  const reconstructed = result.chunks.map(c => c.text).join('\n');
  assert.strictEqual(reconstructed, src);
});

test('CHUNK-002', 'totalBytes matches the real source byte length exactly', () => {
  const src = 'a'.repeat(500) + '\nfunction f() {}\n';
  const result = chunkSource('t', src);
  assert.strictEqual(result.totalBytes, Buffer.byteLength(src, 'utf8'));
});

test('CHUNK-003', 'chunk ids are stable across two independent runs on identical content', () => {
  const src = 'function alpha() { return 1; }\nfunction beta() { return 2; }\n';
  const r1 = chunkSource('c1', src);
  const r2 = chunkSource('c1', src);
  assert.deepStrictEqual(r1.chunks.map(c => c.id), r2.chunks.map(c => c.id));
});

test('CHUNK-004', 'a single-character change produces a DIFFERENT chunk id for the changed chunk only', () => {
  const src1 = 'function alpha() { return 1; }\nfunction beta() { return 2; }\n';
  const src2 = 'function alpha() { return 1; }\nfunction beta() { return 3; }\n'; // beta changed
  const r1 = chunkSource('c1', src1);
  const r2 = chunkSource('c1', src2);
  assert.strictEqual(r1.chunks[0].id, r2.chunks[0].id, 'alpha unchanged — same id');
  assert.notStrictEqual(r1.chunks[1].id, r2.chunks[1].id, 'beta changed — different id');
});

test('CHUNK-005', 'getChunk() finds a real chunk by its real id', () => {
  const src = 'function only() { return 42; }\n';
  const result = chunkSource('solo', src);
  const found = getChunk(result, result.chunks[0].id);
  assert.ok(found);
  assert.ok(found.text.includes('return 42'));
});

test('CHUNK-006', 'getChunk() returns null (never throws) for an unknown id', () => {
  const result = chunkSource('c', 'function x(){}\n');
  assert.strictEqual(getChunk(result, 'c:doesnotexist'), null);
});

test('CHUNK-007', 'real, current codebase file (self-heal/index.js) — no data loss on a genuine, non-synthetic file', () => {
  const realPath = path.join(__dirname, '../../cortex/self-heal/index.js');
  const result = chunkFile('cortex.self-heal', realPath);
  const originalText = fs.readFileSync(realPath, 'utf8');
  const reconstructed = result.chunks.map(c => c.text).join('\n');
  assert.strictEqual(reconstructed, originalText, 'chunking a real, current file must not lose or duplicate a single byte');
  assert.ok(result.chunks.length > 1, 'a real 300+ line file should split into more than one chunk');
  console.log(`    (real file: ${result.chunks.length} chunks, ${result.totalBytes} bytes, avg ${Math.round(result.totalBytes/result.chunks.length)} bytes/chunk)`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
