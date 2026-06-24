'use strict';
/**
 * tests/modules/local-vector-index.test.js
 * UUID: test-local-vector-index-v1-0000-0000-0000-000000000001
 *
 * Real disk, real cosine similarity math, no mocking. This is the
 * vectra replacement — if the math here is wrong, every search result
 * in vector-memory.js would silently be wrong too, so every assertion
 * here is on an actual computed number, not a shape check.
 */
const assert = require('assert');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const { LocalIndex } = require('../../lib/local-vector-index');

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'lvi-test-'));
}

async function run() {
  await test('LVI-01', 'isIndexCreated() is false before createIndex()', async () => {
    const idx = new LocalIndex(tmpDir());
    assert.strictEqual(await idx.isIndexCreated(), false);
  });

  await test('LVI-02', 'createIndex() makes isIndexCreated() true, persists to a real file on disk', async () => {
    const dir = tmpDir();
    const idx = new LocalIndex(dir);
    await idx.createIndex({ version: 1 });
    assert.strictEqual(await idx.isIndexCreated(), true);
    assert.ok(fs.existsSync(path.join(dir, 'index.json')), 'index.json must actually exist on disk');
  });

  await test('LVI-03', 'insertItem then getItem returns the exact same item back', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'a1', vector: [1, 0, 0], metadata: { type: 'gap', table: 'gaps' } });
    const got = await idx.getItem('a1');
    assert.deepStrictEqual(got.vector, [1, 0, 0]);
    assert.strictEqual(got.metadata.type, 'gap');
  });

  await test('LVI-04', 'getItem returns undefined (falsy) for a missing id — matches vector-memory.js\'s `if (existing) return true` contract', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    const got = await idx.getItem('does-not-exist');
    assert.ok(!got);
  });

  await test('LVI-05', 'insertItem rejects a duplicate id rather than silently overwriting', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'dup', vector: [1, 0], metadata: {} });
    let threw = null;
    try { await idx.insertItem({ id: 'dup', vector: [0, 1], metadata: {} }); }
    catch (e) { threw = e; }
    assert.ok(threw, 'inserting a duplicate id must throw, not overwrite silently');
  });

  await test('LVI-06', 'queryItems computes REAL cosine similarity — identical vector scores 1.0', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'same', vector: [1, 2, 3], metadata: {} });
    const results = await idx.queryItems([1, 2, 3], 5);
    assert.strictEqual(results.length, 1);
    assert.ok(Math.abs(results[0].score - 1.0) < 1e-9, `expected score ~1.0, got ${results[0].score}`);
  });

  await test('LVI-07', 'queryItems computes REAL cosine similarity — orthogonal vectors score 0.0', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'ortho', vector: [1, 0], metadata: {} });
    const results = await idx.queryItems([0, 1], 5);
    assert.ok(Math.abs(results[0].score - 0.0) < 1e-9, `expected score ~0.0, got ${results[0].score}`);
  });

  await test('LVI-08', 'queryItems ranks by similarity, closest first — verified against hand-computed scores', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'close',  vector: [1, 1, 0], metadata: {} });   // cos with [1,0,0] = 1/sqrt(2) ≈ 0.707
    await idx.insertItem({ id: 'far',    vector: [0, 1, 1], metadata: {} });   // cos with [1,0,0] = 0
    await idx.insertItem({ id: 'exact',  vector: [1, 0, 0], metadata: {} });   // cos with [1,0,0] = 1
    const results = await idx.queryItems([1, 0, 0], 5);
    assert.strictEqual(results[0].item.id, 'exact');
    assert.strictEqual(results[1].item.id, 'close');
    assert.strictEqual(results[2].item.id, 'far');
    assert.ok(Math.abs(results[1].score - (1/Math.sqrt(2))) < 1e-9);
  });

  await test('LVI-09', 'queryItems respects topK — returns at most k results even with more candidates', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    for (let i = 0; i < 10; i++) await idx.insertItem({ id: `v${i}`, vector: [i, 1, 0], metadata: {} });
    const results = await idx.queryItems([1, 1, 0], 3);
    assert.strictEqual(results.length, 3);
  });

  await test('LVI-10', 'queryItems applies a metadata filter exactly like vector-memory.js\'s {table: x} usage', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'g1', vector: [1, 0], metadata: { table: 'gaps' } });
    await idx.insertItem({ id: 'i1', vector: [1, 0], metadata: { table: 'ideas' } });
    const results = await idx.queryItems([1, 0], 10, { table: 'gaps' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].item.id, 'g1');
  });

  await test('LVI-11', 'getIndexStats returns {items: N} — the exact shape vector-memory.js reads (stats.items), not a guessed shape', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'x', vector: [1], metadata: {} });
    await idx.insertItem({ id: 'y', vector: [1], metadata: {} });
    const stats = await idx.getIndexStats();
    assert.strictEqual(stats.items, 2);
  });

  await test('LVI-12', 'index survives a fresh LocalIndex instance pointed at the same dir — real persistence, not in-memory-only', async () => {
    const dir = tmpDir();
    const idx1 = new LocalIndex(dir);
    await idx1.createIndex({ version: 1 });
    await idx1.insertItem({ id: 'persisted', vector: [3, 4], metadata: { note: 'survives restart' } });

    const idx2 = new LocalIndex(dir); // brand new instance, same dir, no shared memory
    const got = await idx2.getItem('persisted');
    assert.ok(got, 'a fresh instance must read what an earlier instance wrote');
    assert.strictEqual(got.metadata.note, 'survives restart');
  });

  await test('LVI-13', 'a write never leaves a partial index.json on disk — temp-file-then-rename confirmed by checking no .tmp files survive', async () => {
    const dir = tmpDir();
    const idx = new LocalIndex(dir);
    await idx.createIndex({ version: 1 });
    for (let i = 0; i < 20; i++) await idx.insertItem({ id: `w${i}`, vector: [i], metadata: {} });
    const leftoverTmp = fs.readdirSync(dir).filter(f => f.endsWith('.tmp'));
    assert.strictEqual(leftoverTmp.length, 0, `temp files should never survive a completed write: ${leftoverTmp}`);
  });

  await test('LVI-14', 'mismatched query vector dimension is skipped, not thrown, mid-scan', async () => {
    const idx = new LocalIndex(tmpDir());
    await idx.createIndex({ version: 1 });
    await idx.insertItem({ id: 'dim2', vector: [1, 0], metadata: {} });
    await idx.insertItem({ id: 'dim3', vector: [1, 0, 0], metadata: {} });
    const results = await idx.queryItems([1, 0], 5); // 2-dim query
    assert.strictEqual(results.length, 1, 'the 3-dim item should be skipped, not crash the whole query');
    assert.strictEqual(results[0].item.id, 'dim2');
  });

  console.log(`\n  local-vector-index: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run();
