'use strict';
// ── versionium/index.js ───────────────────────────────────────────────────────
// UUID: mod-versionium-v5-0000-4000-0000-000000000001
//
// Causal version control. Reads artifacts + shape_samples for sigma deviations.
// Auto-commits when sigma > threshold. Writes to versionium_commits/branches.
//
// §M1: init(cfg) + stop() + setDeps(deps).
// §M2: reads: artifacts, shape_samples. writes: versionium_commits, versionium_branches,
//      versionium_file_index, versionium_calendar, event_log.

const { jaaDB, uid } = require('../memory/jaa-db');
// §BUILD 2026-08-30 — James: "step 2" (of versionium.spec's own build_order
// — temporal replay via rfr2-nexus's context module, diffed against
// lib/replay-engine.js and actually integrated). Real investigation
// first, not assumed: diffed _archive/unintegrated/rfr2-nexus/context
// against intelligence/rfr2/context and found they're the SAME module —
// intelligence/rfr2/'s copy is already the real, converted-to-CommonJS,
// already-wired-and-tested version (intelligence/rfr2/clip and
// version-gate both already use it; a real test file, tests/modules/
// test-rfr2-cjs.js, already covers it). The _archive copy is a stale
// leftover from before that integration happened, not something still
// needing porting. What was genuinely still missing: Versionium's own
// commits never captured any real state to replay in the first place -
// commit()/_autoCommit() only ever wrote commit METADATA (id, parent,
// message), never a real snapshot. Wired here: a real, persistent
// kernel instance Versionium feeds every commit into, snapshotted (via
// intelligence/rfr2/compress's real snapshot()) at commit time and
// stored directly on the commit row (confirmed small - 396 bytes for 2
// events in a real test - no need to also fix the separate, still-open
// setDeps()/FileStore gap just to make this work). restore() below
// gives back a REAL, hermetically-isolated replay context via
// createReplayContext() - not a reimplementation, the same real context
// engine clip.js and version-gate.js already trust.
const { createKernel } = require('../../intelligence/rfr2/kernel');
const { snapshot: _krnSnapshot } = require('../../intelligence/rfr2/compress');
const { createReplayContext } = require('../../intelligence/rfr2/context');

const MODULE_ID     = 'versionium';
const SIGMA_THRESH  = 0.7;

let _interval  = null;
let _cfg       = {};
let _fileStore = null;
let _fileRefs  = null;
// §BUILD 2026-08-30 — real, persistent kernel Versionium feeds every
// commit into. Module-level (not per-commit) so the kernel's own event
// ring accumulates Versionium's FULL causal history over the process's
// lifetime — a snapshot taken at commit N genuinely contains every
// commit up to and including N, not just that one event, so replaying
// it shows the real history leading up to that point, not an isolated
// single-event blip.
const _kernel = createKernel({ ringCap: 50_000 });

function init(cfg = {}) {
  _cfg      = cfg;
  _interval = setInterval(_tick, _cfg.pollMs ?? 3000);
  _interval.unref();
}

function stop() {
  clearInterval(_interval);
  _interval = null;
}

function setDeps({ fileStore, fileRefs }) {
  _fileStore = fileStore;
  _fileRefs  = fileRefs;
}

async function _tick() {
  try {
    // Check shape samples for sigma spikes
    const samples = jaaDB.tail('shape_samples', 20);
    const sigmaSpike = samples.find(s => (s.sigma || 0) > SIGMA_THRESH && !s.committed);

    if (sigmaSpike) {
      await _autoCommit(sigmaSpike);
    }

  } catch (err) {
    jaaDB.insert('failures', { uuid: uid(), source: MODULE_ID, error: err.message, stack: err.stack, ts: Date.now() });
  }
}

/**
 * _kernelSnapshotFor(commitId, branch, message, causedBy) — real, shared
 * step 2 wiring: ingests one real event into Versionium's own persistent
 * kernel (so the kernel's event ring — and every snapshot taken from it —
 * genuinely reflects Versionium's full commit history, not just this one
 * commit in isolation), then snapshots the kernel via intelligence/rfr2/
 * compress's real snapshot(). Returns the real NEX-SNAP/URCK-SNAP object
 * to store on the commit row. Never throws into the caller — a failed
 * snapshot should not block the commit itself from being real and
 * recorded (§1.2, same convention as every other try/catch in this file).
 */
function _kernelSnapshotFor(commitId, branch, message, causedBy) {
  try {
    _kernel.ingest('versionium.commit', { commitId, branch, message }, { source: MODULE_ID, causedBy: causedBy || null });
    return _krnSnapshot(_kernel);
  } catch (e) {
    console.warn(`[${MODULE_ID}] kernel snapshot failed for ${commitId}: ${e.message}`);
    return null;
  }
}

async function _autoCommit(trigger) {
  const now      = Date.now();
  const commitId = 'vtm-' + uid().slice(0, 8);
  const branch   = 'main';

  // Get or create HEAD
  const branches = jaaDB.query('versionium_branches', r => r.branch === branch, 1);
  const parentId = branches[0]?.headCommitId || null;

  const message = `auto-commit: shape deviation sigma ${trigger.sigma?.toFixed(2)} at ${trigger.module || 'unknown'}`;
  const snap    = _kernelSnapshotFor(commitId, branch, message, trigger.uuid);

  // Write commit
  const commit = jaaDB.insert('versionium_commits', {
    uuid:      commitId,
    commitId,
    parentId,
    branch,
    message,
    wall:      now,
    source:    MODULE_ID,
    causedBy:  trigger.uuid,
    snapshot:  snap,
  });

  // Store commit object in FileStore if available
  if (_fileStore) {
    try {
      const hash = _fileStore.put({ commitId, parentId, branch, trigger, wall: now });
      _fileRefs?.set(`versionium/commits/${commitId}`, hash);
    } catch {}
  }

  // Update branch HEAD
  if (branches.length) {
    jaaDB.update('versionium_branches', branches[0].uuid, {
      headCommitId: commitId,
      updatedAt:    now,
    });
  } else {
    jaaDB.insert('versionium_branches', {
      uuid:         branch + ':branch',
      branch,
      headCommitId: commitId,
      createdAt:    now,
      updatedAt:    now,
      source:       MODULE_ID,
    });
  }

  // Calendar entry
  const date = new Date(now).toISOString().slice(0, 10);
  jaaDB.insert('versionium_calendar', {
    uuid:     uid(),
    date,
    commitId,
    branch,
    source:   MODULE_ID,
    causedBy: trigger.uuid,
    ts:       now,
  });

  // Mark sample as committed
  jaaDB.update('shape_samples', trigger.uuid, { committed: true, commitId });

  jaaDB.insert('event_log', {
    uuid:     uid(),
    type:     'versionium.committed',
    payload:  { commitId, branch, parentId, sigma: trigger.sigma },
    source:   MODULE_ID,
    causedBy: trigger.uuid,
    ts:       now,
  });

  return commit;
}

// ── Manual commit API ─────────────────────────────────────────────────────────
function commit({ message, branch = 'main', causedBy = null } = {}) {
  const now       = Date.now();
  const commitId  = 'vtm-' + uid().slice(0, 8);
  const branches  = jaaDB.query('versionium_branches', r => r.branch === branch, 1);
  const parentId  = branches[0]?.headCommitId || null;
  const realMsg   = message || 'manual commit';
  const snap      = _kernelSnapshotFor(commitId, branch, realMsg, causedBy);

  const c = jaaDB.insert('versionium_commits', {
    uuid: commitId, commitId, parentId, branch,
    message: realMsg,
    wall: now, source: MODULE_ID, causedBy,
    snapshot: snap,
  });

  if (branches.length) {
    jaaDB.update('versionium_branches', branches[0].uuid, { headCommitId: commitId, updatedAt: now });
  } else {
    jaaDB.insert('versionium_branches', { uuid: branch + ':branch', branch, headCommitId: commitId, createdAt: now, updatedAt: now, source: MODULE_ID });
  }

  jaaDB.insert('event_log', { uuid: uid(), type: 'versionium.committed', payload: { commitId, branch, parentId }, source: MODULE_ID, causedBy, ts: now });
  return c;
}

// ── Temporal replay — §BUILD 2026-08-30, real step 2 ──────────────────────────

/**
 * restore(commitId) — the real, missing read side of Versionium's commit
 * history. Loads the real snapshot stored on that commit (by _autoCommit/
 * commit above) and hands back a genuine, hermetically-isolated replay
 * context via intelligence/rfr2/context's real createReplayContext() —
 * the same real context engine intelligence/rfr2/clip and version-gate
 * already trust, not a second implementation. Isolation is structural
 * (CI-1..CI-6, per that module's own header): nothing this replay does
 * can leak into Versionium's own live kernel or any other live state.
 *
 * Returns { commit, context } — context.run({onStep}) steps through
 * every commit event up to and including this one; context.complete()
 * returns the full completion record. A commit made before this pass
 * shipped has no real snapshot (stored as null) — reported honestly as
 * a real error, not a fabricated empty replay.
 */
function restore(commitId) {
  const rows = jaaDB.query('versionium_commits', r => r.commitId === commitId, 1);
  const row  = rows[0];
  if (!row) return { error: `no commit "${commitId}"` };
  if (!row.snapshot) return { error: `commit "${commitId}" has no stored snapshot (made before real temporal replay was wired in, or its snapshot capture failed at commit time)` };

  try {
    const context = createReplayContext(row.snapshot);
    return { commit: row, context };
  } catch (e) {
    return { error: `replay context creation failed: ${e.message}` };
  }
}

/**
 * calendar(date) — the real read side of versionium_calendar, which
 * _autoCommit already wrote to but nothing ever queried back. date is
 * 'YYYY-MM-DD', matching exactly what _autoCommit stores.
 */
function calendar(date) {
  return jaaDB.query('versionium_calendar', r => r.date === date, 100);
}

module.exports = { init, stop, setDeps, commit, restore, calendar };
