#!/usr/bin/env node
'use strict';
/**
 * scripts/post-commit-history-writer.js — real git post-commit hook.
 * Install as a git hook:
 *   ln -sf ../../scripts/post-commit-history-writer.js .git/hooks/post-commit
 * (or run manually: node scripts/post-commit-history-writer.js [sha])
 *
 * §BUILT 2026-09-03 — James: "Versionium is supposed to track changes
 * and update the history. Right? Living models, loom, component
 * registries, and versionium — it's all supposed to update and track
 * itself." This is the real, automatic trigger for versionium/lib/
 * history-writer.js's own pipeline — every real commit now updates the
 * affected systems' own living-model history, records a real versionium
 * commit with git-SHA causedBy linkage, and flags (never silently
 * auto-registers) any newly-touched file loom's own maps don't know
 * about yet.
 *
 * §FAIL-SOFT, DELIBERATELY — a hook that can block or corrupt a real
 * commit already in the user's own history is worse than one that does
 * nothing. Every real failure here is caught, logged, and this process
 * still exits 0 — the commit itself is already done by the time this
 * hook runs (post-commit, not pre-commit); nothing about this script
 * can or should un-do it.
 */
const { execSync } = require('child_process');

function main() {
  const shaArg = process.argv[2];
  let sha;
  try {
    sha = shaArg || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn(`[post-commit-history-writer] could not resolve HEAD (non-fatal): ${e.message}`);
    return;
  }

  let hw;
  try {
    hw = require('../versionium/lib/history-writer.js');
  } catch (e) {
    console.warn(`[post-commit-history-writer] history-writer.js unavailable (non-fatal): ${e.message}`);
    return;
  }

  let result;
  try {
    result = hw.processCommit(sha);
  } catch (e) {
    console.warn(`[post-commit-history-writer] processCommit failed for ${sha.slice(0, 8)} (non-fatal, commit itself is unaffected): ${e.message}`);
    return;
  }

  if (result.systemsUpdated.length) {
    console.log(`[post-commit-history-writer] living-model history updated: ${result.systemsUpdated.join(', ')}`);
  }
  if (result.systemsSkipped.length) {
    for (const s of result.systemsSkipped) {
      console.log(`[post-commit-history-writer] ${s.system}: ${s.reason}`);
    }
  }
  if (result.orphans.length) {
    console.log(`[post-commit-history-writer] real, unregistered files this commit touched (flagged, not auto-registered): ${result.orphans.join(', ')}`);
  }
  if (result.versioniumCommitId) {
    console.log(`[post-commit-history-writer] versionium commit ${result.versioniumCommitId} recorded, causedBy ${sha.slice(0, 8)}`);
  } else if (result.versioniumCommitError) {
    console.warn(`[post-commit-history-writer] versionium commit failed (non-fatal): ${result.versioniumCommitError}`);
  }
}

main();
