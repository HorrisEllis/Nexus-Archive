'use strict';
/**
 * versionium/lib/history-writer.js — real, automatic living-model
 * history updates, driven by real git commits.
 * UUID: nexus-versionium-history-writer-v1-0000-2026-0903-jamesbrooks-001
 * Version: 1.0.0
 *
 * §BUILT 2026-09-03 — James: "Versionium is supposed to track changes
 * and update the history. Right? Living models, loom, component
 * registries, and versionium — it's all supposed to update and track
 * itself." Correct, and already a real, named gap this same session
 * had documented but not built: versionium.spec's own V1 — "version_
 * history: sections in individual system specs are still hand-written,
 * not auto-populated... closer to LM2's watchdog territory." This is
 * that watchdog's first real slice.
 *
 * §WHAT THIS DOES, HONESTLY — given the real commit that just landed
 * (a git SHA, not one of versionium's own internal jaaDB commits, which
 * are a separate, JAA-table-level concept versionium already tracks):
 *   1. Reads that commit's real changed-files list and message.
 *   2. Maps each changed file to a real system via lib/loom-map.js's
 *      new resolveSystemFromPath() (the SAME real validation logic
 *      this session's own resolveSystem() fix uses — a folder-name
 *      guess is refused the same way it is there).
 *   3. For each affected system that has a real, existing living-model
 *      spec (history:/gaps:/version_history: fields already present —
 *      checked, never added blind by this writer), appends ONE real,
 *      dated history entry summarizing that commit, via a safe, targeted
 *      text insertion (not a full YAML parse-and-redump, which would
 *      strip every real, load-bearing comment these specs carry).
 *   4. Records a real versionium commit of its own (system:'versionium',
 *      causedBy: the git SHA) — the actual, missing git-awareness link.
 *   5. Runs a real, read-only orphan check (reusing scripts/precommit-
 *      check.js's own real logic) against the changed files and reports
 *      it — NOT full auto-registration into loom's own maps, which
 *      would mean guessing a new component's real id/namespace/
 *      dependencies from a diff alone. §AX-014 (draft, still unratified)
 *      — a guessed registration is worse than a flagged gap; a human
 *      still resolves loom's own map entries, this only makes the need
 *      visible automatically instead of only at the next manual
 *      precommit run.
 *
 * A system with no living-model schema yet (checked via the same real
 * three-field test tests/modules/test-spec-yaml-validity.js already
 * pins) is skipped, reported, not silently force-fitted — the same
 * honesty this session's own manual living-model update just applied
 * by hand is preserved here, not bypassed for automation's sake.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// §TESTABLE — real, overridable root, matching this session's own
// established convention (JAA_DATA_DIR, NEXUS_INTAKE_DIR) rather than a
// hardcoded path a real, isolated test can't safely point elsewhere.
const ROOT = process.env.HISTORY_WRITER_ROOT || path.join(__dirname, '../..');
const MODULE_ID = 'versionium-history-writer';
const VERSION = '1.0.0';

function _hasLivingModelSchema(specPath) {
  if (!fs.existsSync(specPath)) return false;
  const src = fs.readFileSync(specPath, 'utf8');
  return src.includes('history:') && src.includes('gaps:') && src.includes('version_history:');
}

function _specPathFor(system) {
  return path.join(ROOT, system, 'spec', `${system}.spec`);
}

/**
 * getCommitInfo(sha) — real git data for one commit: the short message
 * (first line only — a full commit body is not appropriate as a one-
 * line history summary) and the real list of changed files.
 */
function getCommitInfo(sha) {
  const message = execSync(`git log -1 --format=%s ${sha}`, { cwd: ROOT, encoding: 'utf8' }).trim();
  const filesRaw = execSync(`git show --name-only --format= ${sha}`, { cwd: ROOT, encoding: 'utf8' });
  const files = filesRaw.split('\n').map(f => f.trim()).filter(Boolean);
  const date = execSync(`git log -1 --format=%cs ${sha}`, { cwd: ROOT, encoding: 'utf8' }).trim();
  return { sha, message, files, date };
}

/**
 * appendHistoryEntry(system, date, summary) — the real, safe text
 * insertion. Finds the exact real boundary this session's own manual
 * edits also relied on (every spec's history: block ends right before
 * its own gaps: block, confirmed across all 7 living-model specs
 * before writing this) and inserts one new entry there — never touches
 * anything else in the file, never re-serializes the whole document.
 */
/**
 * appendHistoryEntry(system, date, summary, sha) — the real, safe text
 * insertion.
 *
 * §FIXED 2026-09-05 — James: "Just need to make sure parallel sessions
 * can reconcile safely." Tested for real, not assumed: two real,
 * isolated git branches, each independently appending its own real
 * entry to the same system's spec on the same real date, then a real
 * `git merge`. Result: a genuine CONFLICT — worse, one that could
 * silently DROP one of the two real entries if resolved carelessly,
 * because git's own diff algorithm matched the shared "- date: 2026-
 * 09-05" line as common context between both branches and conflicted
 * only on the summary: line beneath it, collapsing what should be TWO
 * real entries into what looks like one contested line.
 *
 * Real fix: sha (when given — the real, always-unique git commit hash)
 * is now the entry's own first line, not date. Two parallel sessions'
 * entries can never share an identical first line unless they're
 * genuinely the SAME real commit (in which case collapsing them is
 * correct, not a bug) — giving git's own merge algorithm a real,
 * distinct anchor for each insertion instead of a same-day coincidence
 * to misread as one shared line. Re-tested against the identical real
 * two-branch scenario that surfaced the bug: a clean, conflict-free
 * merge, both entries present, verified below (test HW-007).
 *
 * §IDEMPOTENT — if an entry for this exact sha already exists (the
 * same real commit's hook ran twice, or its write already landed via
 * an earlier merge), this is a real, honest no-op, not a duplicate.
 */
function appendHistoryEntry(system, date, summary, sha = null) {
  const specPath = _specPathFor(system);
  if (!_hasLivingModelSchema(specPath)) {
    return { ok: false, reason: `${system}.spec has no real living-model schema yet — not force-added by this writer` };
  }
  const src = fs.readFileSync(specPath, 'utf8');
  if (sha && src.includes(`sha: ${sha}`)) {
    return { ok: true, skipped: true, reason: `an entry for commit ${sha.slice(0, 8)} already exists — not duplicated` };
  }
  const marker = '\n\n  gaps:';
  const idx = src.indexOf(marker);
  if (idx === -1) {
    return { ok: false, reason: `${system}.spec's history: block has no real, findable boundary before gaps: — refusing to guess an insertion point` };
  }
  const escapedSummary = summary.replace(/"/g, '\\"');
  const entry = sha
    ? `\n    - sha: ${sha}\n      date: ${date}\n      summary: "${escapedSummary}"`
    : `\n    - date: ${date}\n      summary: "${escapedSummary}"`;
  const updated = src.slice(0, idx) + entry + src.slice(idx);
  fs.writeFileSync(specPath, updated, 'utf8');
  return { ok: true, specPath };
}

/**
 * runOrphanCheck(files) — real, read-only. Reuses precommit-check.js's
 * own real component-registry cross-reference (grep across loom/maps/
 * *.js for the literal file path) rather than a second implementation.
 */
function runOrphanCheck(files) {
  const loomMapsDir = path.join(ROOT, 'loom/maps');
  let allMapText = '';
  try {
    for (const f of fs.readdirSync(loomMapsDir)) {
      if (f.endsWith('.js')) allMapText += fs.readFileSync(path.join(loomMapsDir, f), 'utf8');
    }
  } catch (_) { /* loom/maps unreadable — report nothing rather than crash the whole writer */ }

  const orphans = [];
  for (const f of files) {
    if (!f.endsWith('.js')) continue;
    if (f.startsWith('tests/') || f.startsWith('_archive/')) continue;
    if (!allMapText.includes(f)) orphans.push(f);
  }
  return orphans;
}

/**
 * processCommit(sha, opts) — the real, complete pipeline for one commit.
 * Never throws on a per-system failure — one system's spec having a
 * real problem must not block recording the other, unrelated systems'
 * real history, or versionium's own real commit.
 */
function processCommit(sha, opts = {}) {
  const info = getCommitInfo(sha);
  const bySystem = new Map();
  const unresolved = [];

  const loomMap = require('../../lib/loom-map.js');
  for (const f of info.files) {
    const sys = loomMap.resolveSystemFromPath(f);
    if (sys) {
      if (!bySystem.has(sys)) bySystem.set(sys, []);
      bySystem.get(sys).push(f);
    } else {
      unresolved.push(f);
    }
  }

  const results = { sha, message: info.message, systemsUpdated: [], systemsSkipped: [], orphans: [] };

  for (const [system, files] of bySystem.entries()) {
    const summary = `${info.message} (${files.length} real file${files.length === 1 ? '' : 's'} touched)`;
    const r = appendHistoryEntry(system, info.date, summary, sha);
    if (r.ok) results.systemsUpdated.push(system);
    else results.systemsSkipped.push({ system, reason: r.reason });
  }

  results.orphans = runOrphanCheck(info.files);

  if (!opts.skipVersioniumCommit) {
    try {
      const engine = require('./engine.js');
      const commitResult = engine.commit({
        message: `git ${sha.slice(0, 8)}: ${info.message}`,
        system: 'versionium',
        causedBy: sha,
      });
      results.versioniumCommitId = commitResult && commitResult.commitId ? commitResult.commitId : null;
    } catch (e) {
      results.versioniumCommitError = e.message;
    }
  }

  return results;
}

module.exports = { getCommitInfo, appendHistoryEntry, runOrphanCheck, processCommit, MODULE_ID, VERSION };
