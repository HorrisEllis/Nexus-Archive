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

function _hashTables(tables) {
  const h = crypto.createHash('sha256');
  h.update(JSON.stringify(tables, Object.keys(tables).sort()));
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
  const cortex_state_hash = _hashTables(tables);
  const prior = _lastRecord();
  const prev_snapshot_hash = prior ? prior.cortex_state_hash : null;

  const nex = {
    format: FORMAT,
    snapId,
    type: opts.type || 'manual',
    tables,
    cortex_state_hash,
    prev_snapshot_hash,
    createdAt: Date.now(),
  };

  const snapPath = path.join(_dir(), `${snapId}.nex`);
  // §2.1 — disk first, the DB record only exists to help find the file.
  fs.writeFileSync(snapPath, JSON.stringify(nex, null, 2));

  try { jaa.insert(TABLE, { snapId, snapPath, cortex_state_hash, prev_snapshot_hash, createdAt: nex.createdAt, type: nex.type }); }
  catch (e) { console.warn(`[cortex/snapshot] index write failed (file is still real on disk): ${e.message}`); }

  return { snapId, cortex_state_hash };
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
 * own tables content and compare. §1.1 — nothing is trusted, everything
 * is recomputed and checked.
 */
function verifySnapshotIntegrity(nex) {
  if (!nex || !nex.cortex_state_hash) return { valid: false, reason: 'missing cortex_state_hash — not a real snapshot record' };
  const recomputed = _hashTables(nex.tables || {});
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

  return { ok: true, snapId, restoredTables: Object.keys(nex.tables), rowCounts: restored };
}

module.exports = { create, load, verifySnapshotIntegrity, checkChainIntegrity, rollback, FORMAT, MODULE_ID: 'cortex-snapshot', VERSION: '1.0.0' };
