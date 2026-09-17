'use strict';
// ── versionium/index.js ───────────────────────────────────────────────────────
// UUID: mod-versionium-v5-0000-4000-0000-000000000001
//
// Causal version control. Auto-commits when cortex's own live field
// entropy (_fieldReader, injected via setDeps — see cortex/boot.js's
// versionium.setDeps() call) crosses SIGMA_THRESH. Writes to
// versionium_commits/branches.
//
// §VERSIONIUM MIGRATION 2026-09-01 — this module's own header used to say
// "reads shape_samples for sigma deviations." Checked directly, tree-wide:
// nothing ever wrote to shape_samples — that table has been permanent
// silence since this module was built. Corrected here, not left stale.
//
// §M1: init(cfg) + stop() + setDeps(deps).
// §M2: reads: cortex's live _field (via fieldReader). writes: versionium_commits,
//      versionium_branches, versionium_file_index, versionium_calendar, event_log.

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
// §VERSIONIUM MIGRATION 2026-09-01 — real cooldown for the live-field
// trigger below, same 5-minute value and same commit-spam rationale
// already proven correct in orchestrator/lib/versionium-auto-commit.js
// (a sustained-high-entropy episode should produce one commit per
// window, not one every pollMs while the condition holds).
const AUTOCOMMIT_COOLDOWN_MS = 5 * 60 * 1000;

let _interval  = null;
let _cfg       = {};
let _fileStore = null;
let _fileRefs  = null;
// §VERSIONIUM MIGRATION 2026-09-01 — real replacement for the dead
// shape_samples poll below. jaaDB.tail('shape_samples', 20) was checked
// directly, tree-wide: NOTHING in this codebase ever inserts into
// shape_samples — this trigger has been polling permanent silence since
// it was built, the same "listening to a bus nothing emits on" failure
// class this codebase's own AX-011 finding already named once (self-heal
// / nexus-heal-loop). cortex/boot.js already maintains a real, live,
// continuously-updated field (_field.entropy/_field.regime), fed
// cross-process from orchestrator via the already-real, already-working
// POST /cfr/field — the exact sovereign-transport pattern AX-010
// prescribes. _fieldReader is that live read, injected via setDeps() so
// this module doesn't reach into cortex/boot.js directly (would be
// circular — boot.js requires this module already).
let _fieldReader = null;
let _lastAutoCommitAt = 0;
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

function setDeps({ fileStore, fileRefs, fieldReader } = {}) {
  _fileStore  = fileStore;
  _fileRefs   = fileRefs;
  if (fieldReader) _fieldReader = fieldReader;
}

async function _tick() {
  try {
    // §VERSIONIUM MIGRATION 2026-09-01 — replaced the dead shape_samples
    // poll (see _fieldReader comment above) with cortex's own real,
    // live field state. No fieldReader wired (setDeps never called with
    // one) means honestly no trigger fires — never a fabricated one.
    if (_fieldReader) {
      const field = _fieldReader();
      const sigma = field?.entropy ?? 0;
      const now   = Date.now();
      if (sigma > SIGMA_THRESH && (now - _lastAutoCommitAt) >= AUTOCOMMIT_COOLDOWN_MS) {
        _lastAutoCommitAt = now;
        await _autoCommit({
          sigma, module: field?.regime || 'cortex-field',
          uuid: null, system: 'cortex',
        });
      }
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

  const message = `auto-commit: sigma deviation ${trigger.sigma?.toFixed(2)} at ${trigger.module || 'unknown'}`;
  const snap    = _kernelSnapshotFor(commitId, branch, message, trigger.uuid);

  // Write commit — §VERSIONIUM MIGRATION 2026-09-01: carries trigger.system
  // through (e.g. 'cortex' for the live-field trigger above) so auto-commits
  // are attributable the same way manual commits now are.
  const commit = jaaDB.insert('versionium_commits', {
    uuid:      commitId,
    commitId,
    parentId,
    branch,
    system:    trigger.system || null,
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

  // Calendar entry — shared helper, see _writeCalendarEntry's own comment
  _writeCalendarEntry({ commitId, branch, causedBy: trigger.uuid, ts: now });

  // §VERSIONIUM MIGRATION 2026-09-01 — removed: `jaaDB.update('shape_samples',
  // trigger.uuid, {committed:true, commitId})`. That table is dead (nothing
  // ever writes to it — see the header comment on _tick above) and the new
  // live-field trigger passes uuid: null, so this update was a guaranteed
  // silent no-op even before the table's deadness was fixed. Removed rather
  // than left as inert code calling a real jaaDB method against a
  // nonexistent row.

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

// §VERSIONIUM MIGRATION 2026-09-01 — real bug found while writing the
// migration's own smoke test (V-006): manual commit() never wrote to
// versionium_calendar — only _autoCommit() did. "Calendar playback" is
// one of the three real capabilities docs/versionium.spec's own purpose
// section names for Versionium; a calendar that's silently blind to
// every manually-triggered commit (which, via the agent tool, is most of
// them) isn't real calendar playback. Shared here so both paths write
// identically, not two near-duplicate inserts that could drift.
function _writeCalendarEntry({ commitId, branch, causedBy, ts }) {
  const date = new Date(ts).toISOString().slice(0, 10);
  jaaDB.insert('versionium_calendar', {
    uuid: uid(), date, commitId, branch, source: MODULE_ID, causedBy, ts,
  });
}

// ── Manual commit API ─────────────────────────────────────────────────────────
// §VERSIONIUM MIGRATION 2026-09-01 — added `system` (optional, default null).
// Needed so /api/versionium/history?system=X (cortex/boot.js) and, later,
// LM1's per-system version_history: section can trace a commit back to the
// system it was made for — this field genuinely did not exist before.
//
// §SNAPSHOTGATE MERGE 2026-09-01 — added `state` (optional, default null).
// idearium's SnapshotGate stored the caller's actual restorable working
// state (ideas/specs/gaps/links, deep-cloned) directly on the commit row —
// a capability this module never had; `snapshot` above is the rfr2 KERNEL's
// causal event-ring snapshot (replay material), not a raw state blob, and
// the two are not interchangeable. Stored as its own field so a caller that
// wants direct state back (getState, below) doesn't have to reconstruct it
// from replay context, and a caller that never passes state (the existing
// cortex live-field auto-commit, the agent tool) is unaffected — state
// stays null, exactly as before this change.
function commit({ message, branch = 'main', causedBy = null, system = null, state = null } = {}) {
  const now       = Date.now();
  const commitId  = 'vtm-' + uid().slice(0, 8);
  const branches  = jaaDB.query('versionium_branches', r => r.branch === branch, 1);
  const parentId  = branches[0]?.headCommitId || null;
  const realMsg   = message || 'manual commit';
  const snap      = _kernelSnapshotFor(commitId, branch, realMsg, causedBy);
  // Deep-cloned so a caller mutating its live state after commit can never
  // corrupt history — same convention idearium's own SnapshotGate used.
  const rawState  = state !== null ? JSON.parse(JSON.stringify(state)) : null;

  const c = jaaDB.insert('versionium_commits', {
    uuid: commitId, commitId, parentId, branch, system,
    message: realMsg,
    wall: now, source: MODULE_ID, causedBy,
    snapshot: snap,
    state: rawState,
  });

  if (branches.length) {
    jaaDB.update('versionium_branches', branches[0].uuid, { headCommitId: commitId, updatedAt: now });
  } else {
    jaaDB.insert('versionium_branches', { uuid: branch + ':branch', branch, headCommitId: commitId, createdAt: now, updatedAt: now, source: MODULE_ID });
  }

  jaaDB.insert('event_log', { uuid: uid(), type: 'versionium.committed', payload: { commitId, branch, parentId, system }, source: MODULE_ID, causedBy, ts: now });
  _writeCalendarEntry({ commitId, branch, causedBy, ts: now });
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

/**
 * getState(commitId) — §SNAPSHOTGATE MERGE 2026-09-01. Direct-restore read:
 * hands back the raw `state` stored on a commit (see commit() above), not a
 * replay context. This is the capability idearium's SnapshotRestoreGate
 * actually needs — "give me back exactly what was there," not "let me step
 * through the causal events leading up to it" (that's what restore() above
 * is still for, unchanged). A commit made without a state payload (every
 * commit before this pass, and every future commit from a caller that
 * doesn't pass one) honestly has none — reported as an error, not a
 * fabricated empty object.
 */
function getState(commitId) {
  const rows = jaaDB.query('versionium_commits', r => r.commitId === commitId, 1);
  const row  = rows[0];
  if (!row) return { error: `no commit "${commitId}"` };
  if (row.state === null || row.state === undefined) {
    return { error: `commit "${commitId}" has no stored state (committed without one, or predates the SnapshotGate merge)` };
  }
  return { commit: row, state: row.state };
}

module.exports = { init, stop, setDeps, commit, restore, calendar, getState };