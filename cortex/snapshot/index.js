'use strict';
/**
 * cortex/snapshot/index.js — R2: the real snapshot/rollback API
 * UUID: nexus-cortex-snapshot-v1-0000-2026-0812-001
 *
 * docs/repair-contract-and-loom-hub-phasemap.spec R2 — "the one genuine
 * gap." Three real tests (snapshot-integrity, compartment-engine,
 * autonomous-loop) already specced this exact contract before this file
 * existed; ui/tv-shell/index.html's real SYSTEM REWIND panel has been
 * showing honest '?' for months waiting for it. Built to THAT contract,
 * not guessed — every field name, every function signature here is what
 * the tests already required.
 *
 * §2.1 disk before anything — a snapshot is a real .nex file on disk
 * (NEXUS_SNAP_DIR, default cortex/data/snapshots), not just a database
 * row. checkChainIntegrity() reads the FILES, not the index — corrupting
 * a file on disk (not just the DB record) is what tamper detection is
 * actually for.
 *
 * §16.5 reuse checked first — lib/replay-engine.js exists with an
 * ADJACENT but different API (snapshot/logDecision/replay, capturing
 * request-level decision state for the autonomous loop, not a hash-
 * chained integrity system). Different job. Not reused here because the
 * shapes don't actually fit, not because it wasn't checked.
 *
 * Format: every .nex file is JSON, `{format: "NEX-SNAP/1.0", tables,
 * cortex_state_hash, prev_snapshot_hash, ...}`. cortex_state_hash is a
 * real sha256 of the tables content; prev_snapshot_hash chains to the
 * immediately prior snapshot's hash (null for the first ever).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FORMAT = 'NEX-SNAP/1.0';
const TABLE = 'backup_records';

function _dir() {
  const d = process.env.NEXUS_SNAP_DIR || path.join(__dirname, '..', 'data', 'snapshots');
  try { fs.mkdirSync(d, { recursive: true }); } catch (_) {}
  return d;
}

function _jaa() { return require('../memory/jaa-db').jaaDB; }

// §BUGFIX 2026-08-25 — found while extending this file for system-state
// snapshots, not something introduced by that work: JSON.stringify's
// array-replacer form (used below) filters property names at EVERY
// level of nesting, not just the top level. Object.keys(tables).sort()
// only ever contained table NAMES ('gaps', 'patterns', ...) — never any
// real row field (uuid, severity, ts, ...) — so every row in every
// table serialized to an empty object, {}, regardless of its real
// content. Confirmed directly: two tables with genuinely different row
// data produced byte-identical hash input. The real, existing test
// suite's own T-006 "tampered content is detected" only ever added a
// whole NEW table (changing the top-level key set, which this bug
// still caught) — it never modified a row's own field, so this was
// never exercised. cortex_state_hash's whole stated purpose — "nothing
// is trusted, everything is recomputed and checked" — was silently not
// true for row-level tampering since this file was written.
//
// §BACKWARD-COMPAT — every .nex file already on disk was hashed under
// the old, broken formula. Retroactively can't know intent; the only
// honest rule is a real, explicit version marker: snapshots without
// hashVersion:2 verify under the OLD formula (so they don't spuriously
// fail integrity now), new snapshots get hashVersion:2 and the real,
// content-complete formula. Never silently reinterpret an old
// snapshot's hash under a different rule than the one that made it.
function _stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(_stableStringify).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${_stableStringify(obj[k])}`).join(',')}}`;
}

function _hashTables(tables) {
  const h = crypto.createHash('sha256');
  h.update(JSON.stringify(tables, Object.keys(tables).sort()));
  return h.digest('hex');
}

/** _hashTablesV2(tables) — the real, content-complete replacement. */
function _hashTablesV2(tables) {
  const h = crypto.createHash('sha256');
  h.update(_stableStringify(tables));
  return h.digest('hex');
}

// §UPGRADE 2026-08-25 — James: "upgrade .nex with state snapshots? like
// clear-glass?" Real precedent checked before building: ClearGlass's own
// rewind engine (clear-glass/src/rewind/engine.js) already snapshots
// real, domain-specific state (cookies, storage, scroll) that isn't
// jaaDB table rows at all — a genuinely different kind of "state" than
// this file's own _hashTables ever covered. This is the same real idea,
// generalized: any real NEXUS system can register what "its own state"
// even means (its config, its data files, whatever it defines), the
// same way ClearGlass defines cookies+storage+scroll as browser state.
//
// §BACKWARD-COMPAT — every existing .nex file on disk was hashed via
// _hashTables(tables) alone; there is no way to retroactively know
// whether a system-state provider existed when they were created, so
// the ONLY safe rule is: no real systemStates present -> hash exactly
// as before (byte-identical to every prior snapshot, old files still
// verify correctly). systemStates present -> a real, new combined hash
// that covers both. Never silently reinterpret an old snapshot's hash
// under a new formula.
const _stateProviders = new Map(); // systemId -> { capture: () => real state, restore: (state) => real result }

/**
 * registerStateProvider(systemId, {capture, restore}) — a real system
 * opts into being included in a system-state-aware snapshot. capture()
 * returns whatever real, JSON-serializable data that system considers
 * "its own state" (matching this session's own decoupled-systems
 * principle — cortex doesn't know or care what's IN a system's state,
 * only that the system itself knows). restore(state) applies it back.
 */
function registerStateProvider(systemId, { capture, restore }) {
  if (typeof capture !== 'function' || typeof restore !== 'function') {
    throw new Error(`registerStateProvider(${systemId}): both capture and restore must be real functions`);
  }
  _stateProviders.set(systemId, { capture, restore });
}

function _captureSystemStates(systemIds) {
  const out = {};
  for (const id of systemIds || []) {
    const provider = _stateProviders.get(id);
    if (!provider) { out[id] = { error: `no real state provider registered for "${id}"` }; continue; }
    try { out[id] = { ok: true, state: provider.capture() }; }
    catch (e) { out[id] = { ok: false, error: e.message }; } // §1.2 — a failed capture is recorded, not silently skipped
  }
  return out;
}

// §BUGFIX 2026-08-25 — this originally used the same broken array-
// replacer pattern _hashTables had, which would have made systemStates
// content-blind in exactly the same way tables content was (see the
// real bug documented above _stableStringify). Uses the real, correct
// helper instead — content-complete at every level, not just top-level
// key presence.
function _hashCombined(tables, systemStates) {
  const h = crypto.createHash('sha256');
  h.update(_stableStringify({ tables, systemStates }));
  return h.digest('hex');
}

/** _snapshotTables() — read every REAL table's current content via the
 * real, live jaaDB.query() method — not a private _tables property, which
 * the actual exported jaaDB is a thin wrapper object and does NOT expose
 * (confirmed: `const jaaDB = { insert, query, update, ... }` at jaa-db.js:105
 * is a plain object, not the JaaDB class instance). §BUGFIX 2026-08-12,
 * found by directly testing create() against the REAL store, not just the
 * test's mock: the mock happened to provide a convenience `_tables`
 * property the real jaaDB doesn't have, so every test passed while
 * create() silently captured `{}` in actual production. Caught by James
 * asking "did you cut corners" and checking rather than reassuring. */
function _snapshotTables(opts = {}) {
  const jaa = _jaa();
  const tables = {};
  const names = opts.tables || require('../memory/jaa-db').ALL_TABLES || [];
  for (const name of names) {
    try { tables[name] = jaa.query(name, () => true, 1000000) || []; }
    catch (_) { tables[name] = []; }
  }
  return tables;
}

function _lastRecord() {
  const jaa = _jaa();
  const rows = jaa.query(TABLE, () => true, 1000000) || [];
  return rows.length ? rows[rows.length - 1] : null;
}

/**
 * create(opts) — write a real, hash-chained snapshot to disk.
 * @returns { snapId, cortex_state_hash }
 */
function create(opts = {}) {
  const jaa = _jaa();
  const uid = () => { try { return require('crypto').randomUUID(); } catch (_) { return 'snap-' + Date.now(); } };
  const snapId = uid();
  const tables = _snapshotTables();
  const prior = _lastRecord();

  // §UPGRADE 2026-08-25 — real, optional per-system state capture. Empty
  // when opts.systemIds is absent — matches the exact prior behavior and
  // hash formula for every caller that doesn't ask for this, byte for
  // byte, not just "close enough".
  const systemStates = (opts.systemIds && opts.systemIds.length) ? _captureSystemStates(opts.systemIds) : {};
  const hasSystemStates = Object.keys(systemStates).length > 0;

  // §BUGFIX 2026-08-25 — hashVersion 2 uses the real, content-complete
  // _stableStringify-based hash (see that fix's own comment above); a
  // snapshot with no real systemStates still gets the V2, content-
  // complete table hash, not the old, broken one — no reason to keep
  // creating NEW snapshots with a known-broken formula just because
  // this particular call has no system states.
  const cortex_state_hash = hasSystemStates ? _hashCombined(tables, systemStates) : _hashTablesV2(tables);
  const prev_snapshot_hash = prior ? prior.cortex_state_hash : null;

  const nex = {
    format: FORMAT,
    snapId,
    type: opts.type || 'manual',
    tables,
    hashVersion: 2,
    ...(hasSystemStates ? { systemStates } : {}),
    cortex_state_hash,
    prev_snapshot_hash,
    createdAt: Date.now(),
  };

  const snapPath = path.join(_dir(), `${snapId}.nex`);
  // §2.1 — disk first, the DB record only exists to help find the file.
  fs.writeFileSync(snapPath, JSON.stringify(nex, null, 2));

  try { jaa.insert(TABLE, { snapId, snapPath, cortex_state_hash, prev_snapshot_hash, createdAt: nex.createdAt, type: nex.type }); }
  catch (e) { console.warn(`[cortex/snapshot] index write failed (file is still real on disk): ${e.message}`); }

  return { snapId, cortex_state_hash, systemStates: hasSystemStates ? Object.keys(systemStates) : [] };
}

/** load(snapId) — read the real .nex file back off disk. */
function load(snapId) {
  const jaa = _jaa();
  const rows = jaa.query(TABLE, r => r.snapId === snapId, 1) || [];
  if (!rows.length) return null;
  try { return JSON.parse(fs.readFileSync(rows[0].snapPath, 'utf8')); }
  catch (e) { return null; }
}

/**
 * verifySnapshotIntegrity(nex) — recompute the hash from the snapshot's
 * own real content and compare. §1.1 — nothing is trusted, everything
 * is recomputed and checked.
 *
 * §BUGFIX 2026-08-25 — now real, genuinely content-complete for both the
 * old and new hash formulas (see _stableStringify's own comment for the
 * real bug this closes). §BACKWARD-COMPAT — a snapshot with no real
 * hashVersion field is verified under the exact OLD formula it was
 * created with, not the corrected one — an old, honestly-made snapshot
 * must not start failing integrity just because the formula improved
 * after it existed.
 */
function verifySnapshotIntegrity(nex) {
  if (!nex || !nex.cortex_state_hash) return { valid: false, reason: 'missing cortex_state_hash — not a real snapshot record' };
  const recomputed = nex.hashVersion === 2
    ? (nex.systemStates ? _hashCombined(nex.tables || {}, nex.systemStates) : _hashTablesV2(nex.tables || {}))
    : _hashTables(nex.tables || {});
  if (recomputed !== nex.cortex_state_hash) return { valid: false, reason: `hash mismatch: recomputed ${recomputed.slice(0, 12)}... vs stored ${nex.cortex_state_hash.slice(0, 12)}...` };
  return { valid: true, reason: null };
}

/**
 * checkChainIntegrity() — walk every real snapshot on disk, verify each,
 * and check the chain links between them. Never throws — a missing or
 * corrupt file is a REPORTED finding, not an uncaught crash (§1.2).
 */
function checkChainIntegrity() {
  const jaa = _jaa();
  const records = jaa.query(TABLE, () => true, 1000000) || [];
  const report = { totalChecked: records.length, valid: 0, corrupt: [], missingFiles: [], chainBreaks: [] };

  let prevHash = null;
  for (const rec of records) {
    let nex;
    try { nex = JSON.parse(fs.readFileSync(rec.snapPath, 'utf8')); }
    catch (e) { report.missingFiles.push({ snapId: rec.snapId, reason: e.message }); prevHash = rec.cortex_state_hash; continue; }

    const result = verifySnapshotIntegrity(nex);
    if (!result.valid) { report.corrupt.push({ snapId: rec.snapId, reason: result.reason }); prevHash = rec.cortex_state_hash; continue; }

    if (nex.prev_snapshot_hash !== prevHash) {
      report.chainBreaks.push({ snapId: rec.snapId, expected: prevHash, found: nex.prev_snapshot_hash });
    }
    report.valid++;
    prevHash = nex.cortex_state_hash;
  }
  return report;
}

/**
 * rollback(snapId, opts) — restore jaaDB's real tables to a real prior
 * snapshot. §1.1 — verified before applied, never blind.
 *
 * §CORRECTED 2026-08-12 — an earlier pass here refused to implement bulk
 * restore, believing jaaDB.delete() might not be safely callable under
 * time pressure. Checked properly instead of leaving that guess standing:
 * jaaDB.delete(table, predicateFn) is real, tested directly against a
 * real disposable row (insert -> delete -> confirm gone), same predicate-
 * function convention as query(). The earlier caution was itself a
 * corner — an unverified assumption treated as a reason to stop, instead
 * of five more minutes of checking. Fixed for real below.
 */
function rollback(snapId, opts = {}) {
  const nex = load(snapId);
  if (!nex) return { ok: false, reason: `no snapshot found for ${snapId}` };
  const check = verifySnapshotIntegrity(nex);
  if (!check.valid) return { ok: false, reason: `refusing to rollback to a snapshot that fails integrity check: ${check.reason}` };

  const jaa = _jaa();
  const restored = {};
  try {
    for (const [table, rows] of Object.entries(nex.tables)) {
      jaa.delete(table, () => true);                    // clear current content
      for (const row of rows) jaa.insert(table, row);    // restore snapshotted content
      restored[table] = rows.length;
    }
  } catch (e) {
    return { ok: false, reason: `rollback failed partway through: ${e.message}`, partiallyRestored: restored };
  }

  // §UPGRADE 2026-08-25 — real system-state restore, only when this
  // snapshot actually has any (older snapshots, and new ones taken
  // without opts.systemIds, simply have none — nothing to restore,
  // unaffected). §1.2 — a real restore failure for one system is
  // recorded per-system, not allowed to silently mask whether the
  // (already-completed, real) table rollback above succeeded.
  const restoredSystems = {};
  if (nex.systemStates && !opts.skipSystemState) {
    for (const [systemId, captured] of Object.entries(nex.systemStates)) {
      const provider = _stateProviders.get(systemId);
      if (!provider) { restoredSystems[systemId] = { ok: false, error: 'no real state provider registered for this system in THIS process' }; continue; }
      if (captured.ok === false) { restoredSystems[systemId] = { ok: false, error: `capture itself had failed at snapshot time: ${captured.error}` }; continue; }
      try { restoredSystems[systemId] = { ok: true, result: provider.restore(captured.state) }; }
      catch (e) { restoredSystems[systemId] = { ok: false, error: e.message }; }
    }
  }

  return { ok: true, snapId, restoredTables: Object.keys(nex.tables), rowCounts: restored, restoredSystems };
}

module.exports = {
  create, load, verifySnapshotIntegrity, checkChainIntegrity, rollback,
  registerStateProvider, FORMAT, MODULE_ID: 'cortex-snapshot', VERSION: '1.1.0',
};
