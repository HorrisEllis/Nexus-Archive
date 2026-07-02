'use strict';
/**
 * loom/schema/registry.js — disk-first store for declared components,
 * seams, hooks, and wires.
 * comp_id: nexus.loom.registry
 * UUID: nexus-loom-registry-v1-0000-2026-0701-jamesbrooks-001
 *
 * AXIOMS §2.1 (Persistence Is the Golden Rule) / §2.2 (The Storage Device
 * Is the Source of Truth): every write goes to disk before this object's
 * in-memory state is considered authoritative. Load-on-construct,
 * write-on-every-mutation, matching idearium/repo/index.js's own
 * "old repos archived, not deleted" pattern — nothing here deletes,
 * it only appends and marks superseded.
 *
 * This is intentionally NOT a Warp Gate. Gates are pure per Warp's own
 * design law ("no side effects beyond emitting events"). Disk I/O is a
 * side effect. This class is the thing Gates' output gets handed to,
 * living in the driver layer, not inside core dispatch.
 */
const fs = require('fs');
const path = require('path');

const KINDS = ['component', 'seam', 'hook', 'wire'];

class LoomRegistry {
  constructor({ dataDir = null } = {}) {
    this.dataDir = dataDir || path.join(__dirname, '..', 'data');
    this.file = path.join(this.dataDir, 'registry.json');
    this._state = this._load();
  }

  _load() {
    try {
      const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      const state = {};
      for (const k of KINDS) state[k] = raw[k] || {};
      return state;
    } catch (_) {
      const empty = {};
      for (const k of KINDS) empty[k] = {};
      return empty;
    }
  }

  _persist() {
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this._state, null, 2));
  }

  has(kind, id) {
    if (!KINDS.includes(kind)) throw new Error(`[loom/registry] unknown kind: ${kind}`);
    return Object.prototype.hasOwnProperty.call(this._state[kind], id);
  }

  get(kind, id) {
    return this._state[kind][id] || null;
  }

  all(kind) {
    return { ...this._state[kind] };
  }

  /**
   * add — disk-first write. Returns the stored record. Throws if the
   * id already exists (callers should axiom-check has() first — this
   * is the enforcement backstop, not the primary gate).
   */
  add(kind, record) {
    if (!KINDS.includes(kind)) throw new Error(`[loom/registry] unknown kind: ${kind}`);
    if (this.has(kind, record.id)) {
      throw new Error(`[loom/registry] duplicate ${kind} id: ${record.id}`);
    }
    this._state[kind][record.id] = { ...record, registeredAt: Date.now() };
    this._persist();
    return this._state[kind][record.id];
  }

  /** graph() — hook/wire adjacency, for Lattice L3's stated source
   *  (Architect's GET /api/hooks/graph does the same job for its own
   *  hooks; this is LOOM's equivalent once wires exist). */
  graph() {
    const nodes = Object.values(this._state.hook).map(h => ({
      id: h.id, component_id: h.component_id, type: h.type, direction: h.direction,
    }));
    const edges = Object.values(this._state.wire).map(w => ({
      from: w.from_hook_id, to: w.to_hook_id, id: w.id,
    }));
    return { nodes, edges };
  }
}

module.exports = { LoomRegistry, KINDS };
