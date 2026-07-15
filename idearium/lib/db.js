/**
 * idearium/lib/db.js — idearium's connection to cortex's shared database
 * UUID: idearium-lib-db-v1-0000-4000-0000-000000000001
 *
 * §DB-MIGRATION 2026-07-14 — "idearium needs to use a database, in cortex."
 *
 * idearium was the one subsystem in NEXUS still on ad-hoc flat-file JSON
 * (idearium.json rewritten whole on every single mutation, idearium-repos.json
 * likewise) while every other module — orchestrator, guardian, cos, copilot,
 * meta, cortex itself — already shares one real store: guardian/jaa-store.js
 * (tables-as-Maps, per-table debounced disk flush), fronted by cortex's
 * cortex/memory/jaa-db.js adapter. That adapter is a thin, deliberate seam
 * ("all modules that require it get the same live store — single writer,
 * multiple readers, zero duplication") — this file plugs idearium into that
 * exact same seam rather than inventing a second database.
 *
 * idearium is an ESM-only tree (its own package.json declares type:module);
 * jaa-db.js is CJS, same as the rest of NEXUS's un-typed root. createRequire
 * is the existing, already-used bridge for that boundary in this codebase
 * (see index.js's own cfr-ledger require) — reused here, not reinvented.
 *
 * Table naming: idearium_<key>, kept out of cortex's own table namespace
 * (artifacts/gaps/ledger_entries/settings/...) so nothing collides. Cortex's
 * own gap-detection tables are a DIFFERENT thing from idearium's idea-gaps —
 * same word, two owners, hence the prefix rather than sharing 'gaps'.
 *
 * Row identity: every idearium row already carries a stable `.uuid` — reused
 * directly as the store's `id` (jaa-store's actual primary key) rather than
 * minting a second identifier.
 *
 * Ordering: jaa-store rows live in a Map — insertion order, not array
 * position. idearium relies on array position for real semantics in a few
 * places (snapshots[0] is "most recent", via unshift). `_ord` is written on
 * every sync and read back to resort on load, so position survives a
 * process restart intact.
 *
 * §1.2 nothing silently fails — a jaa-db load failure here throws, it does
 * not fall back to a silently-empty table.
 * §7.4 nothing discarded — see migrateOnce() below: the pre-existing flat
 * files are read once, folded into the DB, and then left on disk untouched
 * (archive, not delete).
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);

// idearium/lib -> .. -> idearium -> .. -> nexus -> cortex/memory/jaa-db
const { jaaDB } = _require('../../cortex/memory/jaa-db');

/** Read a whole table back out, ordered by the position it was last synced at. */
export function loadTable(table) {
  const rows = jaaDB.query(table);
  return rows
    .slice()
    .sort((a, b) => (a._ord ?? 0) - (b._ord ?? 0))
    // `id` and `_ord` are store bookkeeping (id duplicates `.uuid`, _ord is
    // position) — strip both so callers get back exactly the row shape they
    // put in, not a superset with jaa-store's fingerprints on it.
    .map(({ id, _ord, ...rest }) => rest);
}

function _rowsEqual(a, b) {
  // Cheap but sufficient: both sides are always built through the same
  // spread pattern below, so key order — and therefore JSON.stringify
  // output — is stable across saves for genuinely-unchanged rows. Worst
  // case on a false mismatch is one redundant write, never a missed one.
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Make `table` in the DB exactly mirror `rows` (keyed by row[idField]).
 * Deletes rows no longer present, upserts everything else, skips upserts
 * that would be no-ops so unrelated tables don't get marked dirty on every
 * unrelated mutation.
 */
export function syncTable(table, rows, idField = 'uuid') {
  if (!Array.isArray(rows)) throw new Error(`[idearium/db] syncTable(${table}): rows must be an array`);
  const existing = jaaDB.query(table);
  const existingById = new Map(existing.map(r => [r.id, r]));
  const currentIds = new Set(rows.map(r => r[idField]));

  for (const id of existingById.keys()) {
    if (!currentIds.has(id)) jaaDB.delete(table, { id });
  }
  rows.forEach((row, i) => {
    const id = row[idField];
    if (id == null) throw new Error(`[idearium/db] syncTable(${table}): row missing ${idField}`);
    const candidate = { ...row, id, _ord: i };
    const prev = existingById.get(id);
    if (prev && _rowsEqual(prev, candidate)) return;
    jaaDB.upsert(table, candidate, 'id');
  });
}

/**
 * One-time, non-destructive fold of pre-existing flat-file rows into a DB
 * table — only runs while the table is still empty (i.e. first boot after
 * this migration on a machine that already had data). Never overwrites rows
 * that already made it into the DB, never touches the source flat file.
 */
export function migrateOnce(table, legacyRows, idField = 'uuid') {
  if (jaaDB.count(table) > 0) return { migrated: false, reason: 'table already populated' };
  if (!Array.isArray(legacyRows) || !legacyRows.length) return { migrated: false, reason: 'no legacy rows' };
  syncTable(table, legacyRows, idField);
  return { migrated: true, count: legacyRows.length };
}

export { jaaDB };
