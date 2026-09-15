'use strict';

/**
 * lib/system-db.js — one real database per sovereign system, wrapping the
 * index that already exists.
 * comp_id: nexus.lib.system-db
 * uuid: nexus-lib-system-db-v1-0000-2026-0914-jamesbrooks-001
 * spec: docs/nexus-node-index.spec v0.1.0
 *
 * §MCO17 2026-09-14 — James: "we need a database for each system which then
 * has tables for each node type as an index for history. querable with an
 * .tool. then each database can be a .node also to connect to the associative
 * lattice?"
 *
 * §8.6 REUSE BEFORE BUILD — the recursive read changed what this file is.
 * The first draft of this work was going to be a new per-system index with
 * per-type tables. It was not written, because lib/node-index.js ALREADY IS
 * that, and has been since 2026-09-12: real `nodes_<type>` index tables, real
 * append-only `nodes_<type>_ledger` history tables, indexNode/removeNode/
 * queryNodes/history, and — this is the part that matters — an already-
 * generalized optional trailing `jaa` handle, added under James's own "in each
 * data folder we use a jaa database for each node type," with its header
 * spelling out exactly how a per-system caller is meant to pass its own store:
 *
 *     new (require('../guardian/jaa-store').JaaStore)(
 *       path.join(systemDir, 'data', 'node-index'))
 *
 * Nothing had ever done that. This module is that missing caller, and nothing
 * more. Writing a second index alongside the real one would have been the
 * redundancy §8.6 and §16.5 exist to prevent.
 *
 * §THE REAL BUG THIS CLOSES — not a feature request, a live sovereignty
 * violation. `_jaa()` in node-index.js falls back to cortex's shared singleton
 * when no handle is passed. guardian/lib/node-registry.js is its only
 * production caller and passes no handle. So every guardian node indexed today
 * is written into CORTEX's database. §10.1 gives each data type exactly one
 * write authority and §5.9 says no system reaches inside another's internals —
 * guardian's node history living in cortex's store is both, in production,
 * right now. Confirmed by direct read of both call sites, not inferred.
 *
 * §5.14 — node-index.js is the contract; which store backs it is the
 * implementation. Nothing in node-index.js changes for this, and its existing
 * caller keeps working byte-for-byte until it opts in.
 */

const path = require('path');
const fs   = require('fs');

const MODULE_ID = 'nexus.lib.system-db';
const VERSION   = '1.0.0';

const nodeIndex = require('./node-index.js');

/** One store per system per process. A second JaaStore over the same directory
 *  is a second writer — the precise condition guardian/jaa-store.js's own
 *  §CORRECTED header warns is already real elsewhere in this codebase. */
const _dbs = new Map();

/**
 * Every sovereign system already owns a `<system>/data/` directory in this
 * repo (checked: guardian, cortex, clear-glass, idearium, copilot, architect,
 * emerge, eravos, cg). The database goes inside it — §5.9, a system's history
 * is its own property, not something centralised away from it.
 */
function dirFor(system) {
  const repoRoot = path.join(__dirname, '..');
  if (process.env.NODE_INDEX_DIR) return path.join(process.env.NODE_INDEX_DIR, system);
  return path.join(repoRoot, system, 'data', 'node-index');
}

class SystemDB {
  constructor(system, opts = {}) {
    if (!system || typeof system !== 'string') {
      // §17.1 — every artifact has exactly one owner. A database with no
      // owning system has no write authority, and defaulting one here would
      // manufacture an orphan rather than reveal a caller's missing metadata.
      throw new Error('system-db: system is required — a database with no owning system has no write authority (§17.1, §10.1)');
    }
    this.system = system;
    this.dir    = opts.dir || dirFor(system);
    // tablePrefix is belt-and-braces: each system already has its own
    // directory, so a prefix is not strictly required today. It is set anyway
    // because §0.4 says a change should increase optionality — with it, two
    // systems can later share one directory (a real possibility for small
    // satellite systems) without a migration.
    this.prefix = opts.tablePrefix !== undefined ? opts.tablePrefix : '';
    this._store = null;
  }

  /** Lazily opened — constructing a handle must not touch the disk, so
   *  listSystems() can enumerate without instantiating every store. */
  jaa() {
    if (this._store) return this._store;
    const { JaaStore } = require('../guardian/jaa-store.js');
    fs.mkdirSync(this.dir, { recursive: true });
    this._store = new JaaStore(this.dir, this.prefix ? { tablePrefix: this.prefix } : {});
    return this._store;
  }

  // ── The node-index contract, bound to THIS system's store ────────────────
  // Thin on purpose. Every one of these is node-index.js's real function with
  // this system's handle supplied — not a reimplementation, and not a place
  // where behaviour is allowed to drift from the shared contract (§5.6).
  indexNode(type, doc, filePath) { return nodeIndex.indexNode(type, doc, filePath, this.jaa()); }
  removeNode(type, id)           { return nodeIndex.removeNode(type, id, this.jaa()); }
  queryNodes(type, predicate)    { return nodeIndex.queryNodes(type, predicate, this.jaa()); }
  history(type, id)              { return nodeIndex.history(type, id, this.jaa()); }

  /**
   * Node types this system has ACTUALLY written. A type the system is
   * permitted to write but never has does not appear, because it hasn't (§1.1).
   *
   * §BUGFIX 2026-09-14, found by DB-001 rather than by reading — this read the
   * directory only, and a table written moments ago is not in the directory
   * yet: JaaStore flushes on a 1500ms debounce (_schedule), so a freshly
   * written table lives in `_tables` and nowhere else until it lands. Reading
   * disk alone made a system that had just written its first node of a type
   * report that it had written nothing — the index disagreeing with itself,
   * which is the §10.3 shape of failure at the smallest possible scale.
   *
   * Both sources are real and neither is sufficient alone: the in-memory Map
   * is authoritative for this process right now, and the directory is
   * authoritative for everything a PRIOR process flushed and this one has not
   * lazily loaded yet. The union is the honest answer.
   */
  nodeTypes() {
    const want = `${this.prefix}nodes_`;
    const out = new Set();

    // Live, this process — includes anything not yet flushed.
    try {
      for (const name of this._store ? this._store._tables.keys() : []) {
        if (name.startsWith('nodes_') && !name.endsWith('_ledger')) out.add(name.slice('nodes_'.length));
      }
    } catch (_) { /* a store not yet opened has no live tables — not an error */ }

    // Flushed, possibly by a previous process.
    try {
      for (const f of fs.readdirSync(this.dir)) {
        if (!f.endsWith('.json') || !f.startsWith(want) || f.endsWith('_ledger.json')) continue;
        const t = f.slice(want.length, -'.json'.length);
        if (t) out.add(t);
      }
    } catch (_) { /* no directory yet is a real, honest empty */ }

    return [...out].sort();
  }

  /**
   * describe() -> the real `.database` node payload. Every field is read from
   * the live store; nothing is declared.
   *
   * §17.5 provenance — `indexedSince` is the honest boundary. Node files
   * written before this database existed were never indexed and are not
   * retro-indexed (see the spec's not_built_yet). Reporting it lets a reader
   * tell "no such node" apart from "written before the index existed", which
   * is the difference between an answer and a wrong answer.
   */
  describe() {
    const tables = [];
    let totalRows = 0;
    let earliest = null;
    for (const type of this.nodeTypes()) {
      let rows = [];
      try { rows = this.queryNodes(type) || []; } catch (_) { continue; }
      let ledger = [];
      try { ledger = this.jaa().query(`nodes_${type}_ledger`) || []; } catch (_) {}
      totalRows += rows.length;
      const stamps = ledger.map(r => r.ts || 0).filter(Boolean);
      const first = stamps.length ? Math.min(...stamps) : null;
      if (first && (!earliest || first < earliest)) earliest = first;
      tables.push({
        type,
        table: `nodes_${type}`,
        ledgerTable: `nodes_${type}_ledger`,
        rows: rows.length,
        ledgerEntries: ledger.length,
        firstSeenAt: first,
        lastSeenAt: stamps.length ? Math.max(...stamps) : null,
      });
    }
    return {
      system: this.system,
      dir: this.dir,
      tablePrefix: this.prefix || null,
      tables,
      nodeTypes: tables.map(t => t.type),
      totalRows,
      indexedSince: earliest,
      ts: Date.now(),
    };
  }

  /**
   * publish() -> { ok, path } — writes this system's `.database` node.
   *
   * §5.6 structural self-similarity: the database is described in the exact
   * same envelope every other node type uses, through the same exportToFile().
   * A reader who understands one node understands this one, with no new
   * conceptual model.
   */
  publish() {
    try {
      const { exportToFile } = require('./node-export.js');
      const payload = this.describe();
      const p = exportToFile('database', `${this.system}-node-index`, payload, {
        system: this.system,
        tags: ['database', 'node-index'],
        context: `${this.system}'s own node index — one table per node type it has actually written`,
        source: MODULE_ID,
      }, path.join(this.dir, 'nodes', 'database'));
      return { ok: true, path: p, payload };
    } catch (e) {
      console.warn(`[${MODULE_ID}] .database publish failed for ${this.system} (non-fatal): ${e.message}`);
      return { ok: false, reason: e.message };
    }
  }
}

/** forSystem(system) -> SystemDB, memoized per process. */
function forSystem(system, opts = {}) {
  const key = `${system}::${opts.dir || ''}`;
  if (!_dbs.has(key)) _dbs.set(key, new SystemDB(system, opts));
  return _dbs.get(key);
}

/**
 * index(system, type, doc, filePath) — the entry point node-export's
 * exportToFile() uses.
 *
 * §1.2 applies to this module's own failures, not only to the ones it records:
 * an index write must never fail the node write it describes. The node file is
 * the source of truth (§2.2) and the index is a projection of it (§10.2) —
 * losing the projection is recoverable, losing the node is not. So this
 * returns an honest {indexed:false, reason} and never throws.
 */
function index(system, type, doc, filePath) {
  if (!system) return { indexed: false, reason: 'no owning system on this node — not indexed (§17.1)' };
  try {
    const r = forSystem(system).indexNode(type, doc, filePath);
    return r && r.ok ? { indexed: true, isNew: r.isNew } : { indexed: false, reason: (r && r.error) || 'unknown' };
  } catch (e) {
    console.warn(`[${MODULE_ID}] index write failed for ${system}/${type}/${doc && doc.id} (non-fatal — the node file is unaffected): ${e.message}`);
    return { indexed: false, reason: e.message };
  }
}

/**
 * linkLattice(fromSystem, toSystem, eventType) — the associative lattice edge.
 *
 * §THE FIRST REAL PRODUCTION CALLER, and worth being precise about why that
 * claim is safe to make. intelligence/lattice/associative-lattice.js's own NOT
 * BUILT YET footer, read directly before this was written, says of step 8:
 * "Event-triggered recompute (piggyback on real system events) — NOT WIRED.
 * Nothing in guardian/cortex/idearium/etc calls updateEdge() yet. This module
 * is real and callable; nothing calls it in production." Grep agreed. This is
 * step 8: a node written by one system that names another system is a real,
 * observed relationship between two real endpoints, which is what a lattice
 * edge is.
 *
 * §HONEST SCOPE — this supplies step 8 only. Steps 9-13 of that module's own
 * build order (background sweep, traversal API, what-if composition, dwell/
 * decay ranking, briefing hook) remain unbuilt and are not implied by this.
 *
 * Fire-and-forget, never awaited by the write path: the lattice is a consumer
 * of this data, never a gate on it (spec: LATTICE_UNREACHABLE).
 */
function linkLattice(fromSystem, toSystem, eventType = 'node.written') {
  if (!fromSystem || !toSystem || fromSystem === toSystem) {
    return { linked: false, reason: 'an edge needs two distinct real endpoints' };
  }
  try {
    const lattice = require('../intelligence/lattice/associative-lattice.js');
    Promise.resolve(lattice.updateEdge(fromSystem, toSystem, eventType, 0)).catch(() => {});
    return { linked: true };
  } catch (e) {
    return { linked: false, reason: e.message };
  }
}

/** listSystems() -> every system with a real database on disk. Read from the
 *  filesystem, not from a declared list of systems — a system that has never
 *  written a node has no database, and saying otherwise would be §1.1. */
function listSystems() {
  const repoRoot = path.join(__dirname, '..');
  const base = process.env.NODE_INDEX_DIR;
  const out = [];
  if (base) {
    try { for (const d of fs.readdirSync(base)) out.push(d); } catch (_) {}
    return out.sort();
  }
  let entries;
  try { entries = fs.readdirSync(repoRoot, { withFileTypes: true }); } catch (_) { return []; }
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue;
    if (fs.existsSync(path.join(repoRoot, e.name, 'data', 'node-index'))) out.push(e.name);
  }
  return out.sort();
}

function _resetForTest() { _dbs.clear(); }

module.exports = {
  SystemDB, forSystem, index, linkLattice, listSystems, dirFor, _resetForTest,
  MODULE_ID, VERSION,
};
