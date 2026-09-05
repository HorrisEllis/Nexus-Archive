'use strict';
/**
 * tests/modules/test-versionium-history-writer.js — real, fully
 * isolated end-to-end tests for versionium/lib/history-writer.js.
 *
 * James: "Versionium is supposed to track changes and update the
 * history. Right? Living models, loom, component registries, and
 * versionium — it's all supposed to update and track itself." Correct
 * — and already a real, named gap (versionium.spec's own V1). This is
 * that gap's real, first implementation: a git-commit-driven writer
 * that appends a real history entry to every affected system's own
 * living-model spec automatically, records a real versionium commit
 * with git-SHA causedBy linkage, and flags (never silently auto-
 * registers) any changed file loom's own maps don't yet know about.
 *
 * §REAL, NOT SIMULATED — a genuine temp git repo is created, real
 * files committed to it, real git commands run against it
 * (HISTORY_WRITER_ROOT points there) — not a mocked git command, since
 * the whole point of this module is real git data.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, execFileSync } = require('child_process');

const REAL_ROOT = path.join(__dirname, '../..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'history-writer-test-'));

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

function sh(cmd, cwd) { execSync(cmd, { cwd, stdio: 'pipe' }); }

sh(`git init -q`, TMP);
sh(`git config user.email "test@test.com"`, TMP);
sh(`git config user.name "Test"`, TMP);

fs.mkdirSync(path.join(TMP, 'cortex/spec'), { recursive: true });
const TESTSYS_SPEC = `spec:
  meta:
    name: cortex

  history:
    - date: 2026-01-01
      summary: "Original entry."

  gaps:
    as_of: 2026-01-01
    entries: []

  version_history:
    - version: 1.0.0
      date: 2026-01-01
      summary: "Original."
      versioniumCommitId: null
`;
function CORTEX_SPEC_TEMPLATE() { return TESTSYS_SPEC; }
fs.writeFileSync(path.join(TMP, 'cortex/spec/cortex.spec'), TESTSYS_SPEC);

fs.mkdirSync(path.join(TMP, 'orchestrator'), { recursive: true });
fs.writeFileSync(path.join(TMP, 'orchestrator/orchestrator.config.json'), JSON.stringify({ ports: { cortex: 9999 } }));

fs.mkdirSync(path.join(TMP, 'loom/maps'), { recursive: true });

fs.mkdirSync(path.join(TMP, 'cortex'), { recursive: true });
fs.writeFileSync(path.join(TMP, 'cortex/index.js'), '// a real, new file, never registered anywhere\n');

sh(`git add -A`, TMP);
sh(`git commit -q -m "test: add cortex/index.js, a real new capability"`, TMP);
const SHA = execSync(`git log -1 --format=%H`, { cwd: TMP, encoding: 'utf8' }).trim();

process.env.HISTORY_WRITER_ROOT = TMP;
const hw = require(path.join(REAL_ROOT, 'versionium/lib/history-writer.js'));

// §HONEST LIMIT, FOUND WRITING THIS TEST — lib/loom-map.js's own real
// _isRealSystem() reads orchestrator.config.json relative to ITS OWN
// __dirname, not HISTORY_WRITER_ROOT — so a genuinely fake system name
// (this test originally used 'testsys') can never validate as real
// here, only a name that's ALSO real in the actual repo's own config.
// Using 'cortex' below is deliberate: it's a real, already-valid system
// name, but every FILE this test creates and every SPEC it writes to
// lives entirely under TMP (via appendHistoryEntry's own ROOT-aware
// _specPathFor) — the real cortex/spec/cortex.spec is never touched.
// A real, separate follow-up: give lib/loom-map.js's own config lookup
// the same env-var override this session has now added to several
// other real files (JAA_DATA_DIR, NEXUS_INTAKE_DIR, HISTORY_WRITER_ROOT).

(async () => {

await test('HW-001', 'getCommitInfo() reads real, correct data from an isolated git repo', () => {
  const info = hw.getCommitInfo(SHA);
  assert.strictEqual(info.sha, SHA);
  assert.strictEqual(info.message, 'test: add cortex/index.js, a real new capability');
  assert.ok(info.files.includes('cortex/index.js'));
});

await test('HW-002', 'appendHistoryEntry() safely inserts a real, new entry without disturbing the rest of the file', () => {
  const r = hw.appendHistoryEntry('cortex', '2026-09-05', 'a real, automated test entry');
  assert.strictEqual(r.ok, true);
  const updated = fs.readFileSync(path.join(TMP, 'cortex/spec/cortex.spec'), 'utf8');
  assert.ok(updated.includes('a real, automated test entry'));
  assert.ok(updated.includes('Original entry.'), 'the real, pre-existing entry must survive untouched');
  execFileSync('python3', ['-c', `import yaml; yaml.safe_load(open(${JSON.stringify(path.join(TMP, 'cortex/spec/cortex.spec'))}, encoding='utf-8'))`], { stdio: 'pipe' });
});

await test('HW-003', 'appendHistoryEntry() refuses a system with no real living-model schema, does not force-add one', () => {
  fs.mkdirSync(path.join(TMP, 'noschema/spec'), { recursive: true });
  fs.writeFileSync(path.join(TMP, 'noschema/spec/noschema.spec'), 'spec:\n  meta:\n    name: noschema\n');
  const r = hw.appendHistoryEntry('noschema', '2026-09-05', 'should not be written');
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('no real living-model schema'));
});

await test('HW-004', 'runOrphanCheck() correctly flags a real, unregistered file — never silently auto-registers it', () => {
  const orphans = hw.runOrphanCheck(['cortex/index.js']);
  assert.ok(orphans.includes('cortex/index.js'));
});

await test('HW-005', 'runOrphanCheck() does not flag a file that IS registered in a real loom map', () => {
  fs.writeFileSync(path.join(TMP, 'loom/maps/cortex-map.js'), `module.exports = [['cortex/index.js', 'nexus.cortex.index', []]];\n`);
  const orphans = hw.runOrphanCheck(['cortex/index.js']);
  assert.ok(!orphans.includes('cortex/index.js'));
});

await test('HW-006', 'processCommit() runs the full real pipeline: classifies by system, appends history, flags orphans, skips versionium commit when asked', () => {
  fs.writeFileSync(path.join(TMP, 'cortex/spec/cortex.spec'), TESTSYS_SPEC);
  fs.rmSync(path.join(TMP, 'loom/maps/cortex-map.js'), { force: true });

  const result = hw.processCommit(SHA, { skipVersioniumCommit: true });
  assert.ok(result.systemsUpdated.includes('cortex'));
  assert.ok(result.orphans.includes('cortex/index.js'));
  assert.strictEqual(result.versioniumCommitId, undefined, 'skipVersioniumCommit:true must genuinely skip it, not silently run it anyway');

  const updated = fs.readFileSync(path.join(TMP, 'cortex/spec/cortex.spec'), 'utf8');
  assert.ok(updated.includes('test: add cortex/index.js'));
});

await test('HW-007', 'a real git merge of two parallel sessions\' independent appends is safe — both real entries survive a normal conflict resolution, not silently collapsed', () => {
  // §THE REAL BUG THIS TEST EXISTS TO CATCH — found by an actual git
  // merge, not theorized: two parallel branches appending an entry to
  // the SAME system on the SAME date used to conflict in a way that
  // could silently DROP one entry (git's diff matched the shared
  // "- date: ..." line as common context, conflicting only on the
  // summary: line beneath it — a careless "pick one side" resolution
  // would lose the other real entry entirely). Fixed: sha (always
  // unique per real commit) is now each entry's own first line, giving
  // git's merge algorithm a genuinely distinct anchor for each
  // insertion. A conflict can still occur (git's own line-based diff
  // has no real way to auto-order two independent insertions at the
  // same point) — but it must now be an HONEST one, both full entries
  // visible, never a collapsed, ambiguous one.
  const gitTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-merge-test-'));
  const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'pipe' });
  sh('git init -q', gitTmp);
  sh('git config user.email t@t.com', gitTmp);
  sh('git config user.name Test', gitTmp);
  fs.mkdirSync(path.join(gitTmp, 'testsys/spec'), { recursive: true });
  fs.mkdirSync(path.join(gitTmp, 'orchestrator'), { recursive: true });
  fs.writeFileSync(path.join(gitTmp, 'orchestrator/orchestrator.config.json'), JSON.stringify({ ports: { testsys: 1 } }));
  fs.writeFileSync(path.join(gitTmp, 'testsys/spec/testsys.spec'), CORTEX_SPEC_TEMPLATE());
  sh('git add -A', gitTmp); sh('git commit -q -m base', gitTmp);
  const base = execSync('git rev-parse HEAD', { cwd: gitTmp, encoding: 'utf8' }).trim();

  sh('git checkout -q -b session-a', gitTmp);
  fs.writeFileSync(path.join(gitTmp, 'testsys/a.js'), '// a\n');
  sh('git add -A', gitTmp); sh('git commit -q -m "session A feature"', gitTmp);
  const shaA = execSync('git rev-parse HEAD', { cwd: gitTmp, encoding: 'utf8' }).trim();
  const prevRoot = process.env.HISTORY_WRITER_ROOT;
  process.env.HISTORY_WRITER_ROOT = gitTmp;
  delete require.cache[require.resolve(path.join(REAL_ROOT, 'versionium/lib/history-writer.js'))];
  const hwLocal = require(path.join(REAL_ROOT, 'versionium/lib/history-writer.js'));
  hwLocal.appendHistoryEntry('testsys', '2026-09-05', 'session A append', shaA);
  sh('git add -A', gitTmp); sh('git commit -q -m "session A history"', gitTmp);

  sh(`git checkout -q ${base}`, gitTmp); sh('git checkout -q -b session-b', gitTmp);
  fs.writeFileSync(path.join(gitTmp, 'testsys/b.js'), '// b\n');
  sh('git add -A', gitTmp); sh('git commit -q -m "session B feature"', gitTmp);
  const shaB = execSync('git rev-parse HEAD', { cwd: gitTmp, encoding: 'utf8' }).trim();
  hwLocal.appendHistoryEntry('testsys', '2026-09-05', 'session B append', shaB);
  sh('git add -A', gitTmp); sh('git commit -q -m "session B history"', gitTmp);

  sh('git checkout -q session-a', gitTmp);
  let mergeOutput = '';
  try { sh('git merge session-b -m merge', gitTmp); }
  catch (e) { mergeOutput = (e.stdout || '').toString() + (e.stderr || '').toString(); }

  const finalContent = fs.readFileSync(path.join(gitTmp, 'testsys/spec/testsys.spec'), 'utf8');
  // Whether git auto-merged cleanly or conflicted, BOTH real shas must
  // be genuinely present in the file on disk — the real property this
  // test verifies, not "no conflict occurred."
  assert.ok(finalContent.includes(shaA), 'session A\'s real entry must survive');
  assert.ok(finalContent.includes(shaB), 'session B\'s real entry must survive');

  process.env.HISTORY_WRITER_ROOT = prevRoot;
  fs.rmSync(gitTmp, { recursive: true, force: true });
});

await test('HW-008', 'appendHistoryEntry() is idempotent — the same real commit\'s sha is never appended twice', () => {
  fs.writeFileSync(path.join(TMP, 'cortex/spec/cortex.spec'), TESTSYS_SPEC);
  const first = hw.appendHistoryEntry('cortex', '2026-09-05', 'first real append', 'deadbeef1234567890');
  assert.strictEqual(first.ok, true);
  assert.ok(!first.skipped);
  const second = hw.appendHistoryEntry('cortex', '2026-09-05', 'a different summary for the SAME sha', 'deadbeef1234567890');
  assert.strictEqual(second.ok, true);
  assert.strictEqual(second.skipped, true, 'a duplicate sha must be a real, honest no-op, not a second entry');
  const content = fs.readFileSync(path.join(TMP, 'cortex/spec/cortex.spec'), 'utf8');
  const occurrences = (content.match(/deadbeef1234567890/g) || []).length;
  assert.strictEqual(occurrences, 1, 'the sha must appear exactly once, not duplicated');
});

console.log(`\n${passed} passed, ${failed} failed`);
delete process.env.HISTORY_WRITER_ROOT;
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
process.exitCode = failed ? 1 : 0;
})();
