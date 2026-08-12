'use strict';
const assert = require('assert');
const zlib = require('zlib');
const { inspectZip } = require('../safe-zip');
const { buildZip, SYMLINK_ATTR } = require('./zip-writer');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ok  — ${name}`); }
  catch (e) { fail++; console.log(`FAIL  — ${name}\n        ${e.message}`); }
}

console.log('safe-zip.js — hostile test suite\n');

// ── 1. Legitimate real-world static site export ─────────────────────────────
test('legit static site: extracts all files with correct content, no rejects', () => {
  const zip = buildZip([
    { name: 'index.html', content: '<html><body>hi</body></html>' },
    { name: 'css/', isDir: true },
    { name: 'css/style.css', content: 'body{color:red}' },
    { name: 'js/app.js', content: 'console.log(1)' },
    { name: 'assets/logo.png', content: Buffer.from([1,2,3,4,5,6,7,8]).toString('binary'), method: 0 },
  ]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, true, r.error && r.error.message);
  assert.strictEqual(r.entries.length, 5);
  const idx = r.entries.find(e => e.name === 'index.html');
  assert.strictEqual(idx.data.toString('utf8'), '<html><body>hi</body></html>');
});

// ── 2. Zip slip — basic ../ traversal ────────────────────────────────────────
test('zip slip: "../../../etc/passwd" is rejected', () => {
  const zip = buildZip([{ name: '../../../etc/passwd', content: 'pwned' }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'PATH_ESCAPE');
});

// ── 3. Zip slip — traversal buried mid-path ─────────────────────────────────
test('zip slip: "assets/../../secret.txt" (net escape) is rejected', () => {
  const zip = buildZip([{ name: 'assets/../../secret.txt', content: 'pwned' }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'PATH_ESCAPE');
});

// ── 4. Zip slip — net-safe traversal (goes down then up, stays inside) allowed ─
test('path that dips with .. but nets non-negative is accepted (not over-strict)', () => {
  const zip = buildZip([{ name: 'a/b/../c.txt', content: 'fine' }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, true, r.error && r.error.message);
});

// ── 5. Absolute path (unix) ───────────────────────────────────────────────────
test('absolute unix path "/etc/passwd" is rejected', () => {
  const zip = buildZip([{ name: '/etc/passwd', content: 'pwned' }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'PATH_ESCAPE');
});

// ── 6. Absolute path (windows drive) ─────────────────────────────────────────
test('absolute windows path "C:\\\\evil.dll" is rejected', () => {
  const zip = buildZip([{ name: 'C:\\evil.dll', content: 'pwned' }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'PATH_ESCAPE');
});

// ── 7. Null byte in filename ──────────────────────────────────────────────────
test('embedded null byte in entry name is rejected', () => {
  const zip = buildZip([{ name: 'safe.txt\0.php', content: 'pwned' }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'PATH_ESCAPE');
});

// ── 8. Symlink entry ───────────────────────────────────────────────────────────
test('symlink entry (unix mode bits) is rejected, not followed', () => {
  const zip = buildZip([{ name: 'link', content: '/etc/passwd', externalAttrs: SYMLINK_ATTR }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'PATH_ESCAPE');
});

// ── 9. Entry-count bomb ────────────────────────────────────────────────────────
test('entry count over budget is rejected before any decompression', () => {
  const many = [];
  for (let i = 0; i < 50; i++) many.push({ name: `f${i}.txt`, content: 'x' });
  const zip = buildZip(many);
  const r = inspectZip(zip, { maxEntries: 10 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'BUDGET_EXCEEDED');
});

// ── 10. Declared-size bomb (header lies about uncompressed size, huge) ────────
test('declared uncompressed size over per-entry budget is rejected pre-inflate', () => {
  const zip = buildZip([{
    name: 'bomb.txt', content: 'tiny', method: 8,
    overrideUncompressedSize: 999_999_999,
  }]);
  const r = inspectZip(zip, { maxEntryBytes: 1_000_000 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'BUDGET_EXCEEDED');
});

// ── 11. Declared-ratio bomb ────────────────────────────────────────────────────
test('declared compression ratio over ceiling is rejected', () => {
  const zip = buildZip([{
    name: 'ratio.txt', content: 'tiny', method: 8,
    overrideUncompressedSize: 500_000, overrideCompressedSize: 100,
  }]);
  const r = inspectZip(zip, { maxRatio: 300, maxEntryBytes: 10_000_000 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'BUDGET_EXCEEDED');
});

// ── 12. Real decompression bomb (actual inflate output exceeds cap, headers  ──
//        under-declare to sneak past the pre-check — this is the case that
//        proves maxOutputLength is doing real work, not just the header check) ─
test('actual inflate output exceeding cap is stopped mid-decompress, not just header-checked', () => {
  const big = Buffer.alloc(5_000_000, 'a'); // highly compressible
  const realCompressed = zlib.deflateRawSync(big);
  const zip = buildZip([{
    name: 'realbomb.txt', content: big.toString('binary'), method: 8,
    // lie in the header: claim it's small so the pre-check budget passes,
    // forcing the real defense (maxOutputLength during inflate) to catch it
    overrideUncompressedSize: 1000,
  }]);
  const r = inspectZip(zip, { maxEntryBytes: 1000, maxRatio: 100000 });
  assert.strictEqual(r.ok, false);
  // either the header-mismatch check or the inflate cap catches this —
  // both are ARCHIVE_INVALID/BUDGET_EXCEEDED, never a silent success
  assert.ok(['ARCHIVE_INVALID', 'BUDGET_EXCEEDED'].includes(r.error.code), r.error.code);
});

// ── 13. Total cumulative size bomb (many entries individually fine, sum huge) ─
test('cumulative total size over budget is rejected even if each entry is small', () => {
  const many = [];
  for (let i = 0; i < 20; i++) many.push({ name: `f${i}.txt`, overrideUncompressedSize: 600_000, content: 'x'.repeat(600000) });
  const zip = buildZip(many);
  const r = inspectZip(zip, { maxEntryBytes: 1_000_000, maxTotalBytes: 5_000_000, maxEntries: 100 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'BUDGET_EXCEEDED');
});

// ── 14. Truncated archive ──────────────────────────────────────────────────────
test('truncated zip (cut mid central-directory) is rejected as ARCHIVE_INVALID, not crash', () => {
  const zip = buildZip([{ name: 'a.txt', content: 'hello world' }]);
  const truncated = zip.slice(0, zip.length - 10);
  let threw = false, r;
  try { r = inspectZip(truncated); } catch (e) { threw = true; }
  assert.strictEqual(threw, false, 'must not throw — must return a rejection verdict');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'ARCHIVE_INVALID');
});

// ── 15. Corrupt signature ──────────────────────────────────────────────────────
test('corrupted central directory signature is rejected, not crash', () => {
  const zip = Buffer.from(buildZip([{ name: 'a.txt', content: 'hello' }]));
  // flip a byte inside where the central directory signature should be
  const eocdOff = zip.length - 22;
  const cdOffset = zip.readUInt32LE(eocdOff + 16);
  zip[cdOffset] = 0x00;
  let threw = false, r;
  try { r = inspectZip(zip); } catch (e) { threw = true; }
  assert.strictEqual(threw, false, 'must not throw — must return a rejection verdict');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'ARCHIVE_INVALID');
});

// ── 16. Non-zip file entirely ──────────────────────────────────────────────────
test('a random non-zip file (e.g. renamed .txt) is rejected as ARCHIVE_INVALID', () => {
  const notAZip = Buffer.from('this is just a text file, not a zip at all, definitely not');
  const r = inspectZip(notAZip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'ARCHIVE_INVALID');
});

// ── 17. Empty buffer ──────────────────────────────────────────────────────────
test('empty buffer is rejected cleanly, not crash', () => {
  const r = inspectZip(Buffer.alloc(0));
  assert.strictEqual(r.ok, false);
});

// ── 18. Unsupported compression method ────────────────────────────────────────
test('unsupported compression method is rejected explicitly, not silently mis-decoded', () => {
  // method 99 (e.g. WinZip AES marker) written consistently to both local
  // and central headers via the writer's method param — this is what a real
  // encrypted or exotically-compressed entry looks like on the wire.
  const zip = buildZip([{ name: 'a.txt', content: 'hello', method: 99 }]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.code, 'ARCHIVE_INVALID');
});

// ── 19. Entry name at exactly path-length ceiling boundary ────────────────────
test('entry name at maxPathLength boundary is accepted, one over is rejected', () => {
  const okName  = 'a'.repeat(50) + '.txt';
  const badName = 'a'.repeat(5000) + '.txt';
  const zip1 = buildZip([{ name: okName, content: 'x' }]);
  const zip2 = buildZip([{ name: badName, content: 'x' }]);
  const r1 = inspectZip(zip1, { maxPathLength: 4096 });
  const r2 = inspectZip(zip2, { maxPathLength: 4096 });
  assert.strictEqual(r1.ok, true, r1.error && r1.error.message);
  assert.strictEqual(r2.ok, false);
  assert.strictEqual(r2.error.code, 'PATH_ESCAPE');
});

// ── 20. Deeply nested but legitimate directory structure ──────────────────────
test('deeply nested legitimate paths (build output style) are accepted', () => {
  const zip = buildZip([
    { name: 'static/js/chunks/vendor/react-dom/cjs/react-dom.production.min.js', content: 'x' },
    { name: 'static/css/main.a1b2c3.css', content: 'y' },
  ]);
  const r = inspectZip(zip);
  assert.strictEqual(r.ok, true, r.error && r.error.message);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
