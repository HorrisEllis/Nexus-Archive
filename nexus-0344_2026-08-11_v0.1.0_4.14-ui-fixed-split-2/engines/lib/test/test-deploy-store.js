'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const store = require('../deploy-store');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ok  — ${name}`); }
  catch (e) { fail++; console.log(`FAIL  — ${name}\n        ${e.stack}`); }
}

function tmpRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-deploy-test-'));
}

function entries(files) {
  // files: { 'path/to/file.txt': 'content' }
  return Object.entries(files).map(([name, content]) => ({
    name, isDir: false, size: Buffer.byteLength(content), data: Buffer.from(content),
  }));
}

function readPublic(root, host, rel) {
  return fs.readFileSync(path.join(store.publicLink(root, host), rel), 'utf8');
}

console.log('deploy-store.js — staging / atomic swap / rollback tests\n');

test('fresh site, no legacy public: first deploy creates public as a symlink to the release', () => {
  const root = tmpRoot();
  const { deployId } = store.stageRelease(root, 'a.test', entries({ 'index.html': 'v1' }), 'replace');
  store.promote(root, 'a.test', deployId);
  const lst = fs.lstatSync(store.publicLink(root, 'a.test'));
  assert.strictEqual(lst.isSymbolicLink(), true);
  assert.strictEqual(readPublic(root, 'a.test', 'index.html'), 'v1');
});

test('legacy real-directory public is migrated into releases/ and preserved, not deleted', () => {
  const root = tmpRoot();
  const pub = store.publicLink(root, 'b.test');
  fs.mkdirSync(pub, { recursive: true });
  fs.writeFileSync(path.join(pub, 'index.html'), 'legacy content');

  const legacyId = store.migrateLegacyPublic(root, 'b.test');
  assert.ok(legacyId);
  const lst = fs.lstatSync(pub);
  assert.strictEqual(lst.isSymbolicLink(), true);
  // legacy content still reachable through the new symlink
  assert.strictEqual(readPublic(root, 'b.test', 'index.html'), 'legacy content');
  // and it's a real, listed release — nothing was thrown away
  const releases = store.listReleases(root, 'b.test');
  assert.ok(releases.find(r => r.deployId === legacyId));
});

test('second deploy (replace) fully replaces content — old file gone, new file present', () => {
  const root = tmpRoot();
  const d1 = store.stageRelease(root, 'c.test', entries({ 'index.html': 'v1', 'old.txt': 'stale' }), 'replace');
  store.promote(root, 'c.test', d1.deployId);
  const d2 = store.stageRelease(root, 'c.test', entries({ 'index.html': 'v2' }), 'replace');
  store.promote(root, 'c.test', d2.deployId);
  assert.strictEqual(readPublic(root, 'c.test', 'index.html'), 'v2');
  assert.strictEqual(fs.existsSync(path.join(store.publicLink(root, 'c.test'), 'old.txt')), false);
});

test('merge mode overlays new files onto old, keeping both', () => {
  const root = tmpRoot();
  const d1 = store.stageRelease(root, 'd.test', entries({ 'index.html': 'v1', 'keep.txt': 'stays' }), 'replace');
  store.promote(root, 'd.test', d1.deployId);
  const d2 = store.stageRelease(root, 'd.test', entries({ 'index.html': 'v2' }), 'merge');
  store.promote(root, 'd.test', d2.deployId);
  assert.strictEqual(readPublic(root, 'd.test', 'index.html'), 'v2');       // overwritten
  assert.strictEqual(readPublic(root, 'd.test', 'keep.txt'), 'stays');       // preserved
});

test('subfolder mode namespaces new content, leaves existing root content untouched', () => {
  const root = tmpRoot();
  const d1 = store.stageRelease(root, 'e.test', entries({ 'index.html': 'v1' }), 'replace');
  store.promote(root, 'e.test', d1.deployId);
  const d2 = store.stageRelease(root, 'e.test', entries({ 'app.js': 'code' }), 'subfolder', 'widget');
  store.promote(root, 'e.test', d2.deployId);
  assert.strictEqual(readPublic(root, 'e.test', 'index.html'), 'v1');
  assert.strictEqual(readPublic(root, 'e.test', 'widget/app.js'), 'code');
});

test('rollback restores prior release exactly, and is itself just another promote (no rebuild)', () => {
  const root = tmpRoot();
  const d1 = store.stageRelease(root, 'f.test', entries({ 'index.html': 'v1' }), 'replace');
  store.promote(root, 'f.test', d1.deployId);
  const d2 = store.stageRelease(root, 'f.test', entries({ 'index.html': 'v2' }), 'replace');
  store.promote(root, 'f.test', d2.deployId);
  assert.strictEqual(readPublic(root, 'f.test', 'index.html'), 'v2');

  store.rollback(root, 'f.test', d1.deployId);
  assert.strictEqual(readPublic(root, 'f.test', 'index.html'), 'v1');

  // roll forward again — d2's directory was never deleted (§0.3)
  store.rollback(root, 'f.test', d2.deployId);
  assert.strictEqual(readPublic(root, 'f.test', 'index.html'), 'v2');
});

test('a failure during staging never touches public — public stays on the last good release', () => {
  const root = tmpRoot();
  const d1 = store.stageRelease(root, 'g.test', entries({ 'index.html': 'good' }), 'replace');
  store.promote(root, 'g.test', d1.deployId);

  // simulate a failure mid-write: entries array with a data value that will
  // throw when fs.writeFileSync tries to write it
  const badEntries = [{ name: 'bad.txt', isDir: false, data: null }]; // null -> writeFileSync throws
  let threw = false;
  try {
    store.stageRelease(root, 'g.test', badEntries, 'replace');
  } catch (e) { threw = true; }
  assert.strictEqual(threw, true, 'stageRelease must propagate the failure, not swallow it');
  assert.strictEqual(readPublic(root, 'g.test', 'index.html'), 'good', 'public must be untouched by the failed deploy');
});

test('promote refuses to point at a release that does not exist', () => {
  const root = tmpRoot();
  let threw = false;
  try { store.promote(root, 'h.test', 'nonexistent-deploy-id'); } catch (e) { threw = true; }
  assert.strictEqual(threw, true);
});

test('listReleases correctly flags the current release and sorts newest first', () => {
  const root = tmpRoot();
  const d1 = store.stageRelease(root, 'i.test', entries({ 'a': '1' }), 'replace');
  store.promote(root, 'i.test', d1.deployId);
  const d2 = store.stageRelease(root, 'i.test', entries({ 'a': '2' }), 'replace');
  store.promote(root, 'i.test', d2.deployId);
  const releases = store.listReleases(root, 'i.test');
  assert.strictEqual(releases[0].deployId, d2.deployId);
  assert.strictEqual(releases[0].current, true);
  assert.strictEqual(releases.find(r => r.deployId === d1.deployId).current, false);
});

test('pruneReleases only removes non-current releases beyond the keep count, current always survives', () => {
  const root = tmpRoot();
  let last;
  for (let i = 0; i < 5; i++) {
    const d = store.stageRelease(root, 'j.test', entries({ 'a': String(i) }), 'replace');
    store.promote(root, 'j.test', d.deployId);
    last = d.deployId;
  }
  const deleted = store.pruneReleases(root, 'j.test', 2);
  const remaining = store.listReleases(root, 'j.test');
  assert.ok(remaining.find(r => r.deployId === last), 'current release must survive prune');
  assert.strictEqual(remaining.length, 3); // 2 kept + current (current excluded from the "keep" pool, always kept)
  assert.strictEqual(deleted.length, 2);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
