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

const KINDS = ['component', 'seam', 'hook', 'wire', 'concern'];

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
    // §FIX 2026-07-02 — found by building loom/contracts/index.js: two
    // separate LoomDriver instances pointed at the same dataDir (exactly
    // what a real CLI process and a real API process are) could not see
    // each other's writes, because _state was loaded once at construct
    // time and never refreshed. That directly violates this file's own
    // header comment (§2.2 the storage device IS the source of truth —
    // not "was, at construction time"). Reread before every read op.
    // Writes still go through add() -> _persist() -> disk immediately,
    // unchanged; this only fixes the read side.
    this._state = this._load();
    return Object.prototype.hasOwnProperty.call(this._state[kind], id);
  }

  get(kind, id) {
    this._state = this._load();
    return this._state[kind][id] || null;
  }

  all(kind) {
    this._state = this._load();
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
   *  hooks; this is LOOM's equivalent once wires exist).
   *  §part_2 2026-07-10 — now carries the SEMANTIC layer: a wire's intent
   *  (WHY A connects to B) and a component's consumes/produces (what it
   *  depends on / offers). These pass through add() unchanged; graph()
   *  used to strip them. Without them the graph is topology only ("A->B");
   *  with them it answers context+intent ("A->B in order to persist state").
   */
  graph() {
    this._state = this._load();
    const nodes = Object.values(this._state.hook).map(h => ({
      id: h.id, component_id: h.component_id, type: h.type, direction: h.direction,
    }));
    const edges = Object.values(this._state.wire).map(w => ({
      from: w.from_hook_id, to: w.to_hook_id, id: w.id,
      intent: w.intent || null, // the WHY — was silently dropped before
    }));
    const components = Object.values(this._state.component).map(c => ({
      id: c.id, name: c.name || c.id,
      consumes: c.consumes || [], // what this component depends on
      produces: c.produces || [], // what it offers others
    }));
    return { nodes, edges, components };
  }

  /** contextGraph() — the queryable context+intent view. Resolves wires to
   *  the components on each end (via each hook's component_id) so a relation
   *  reads "component A -> component B: <intent>", not just "hook -> hook".
   *  This is the non-linear system map: declared structure + why. */
  contextGraph() {
    this._state = this._load();
    const hookComp = {};
    for (const h of Object.values(this._state.hook)) hookComp[h.id] = h.component_id;
    const relations = Object.values(this._state.wire).map(w => ({
      from: hookComp[w.from_hook_id] || w.from_hook_id,
      to:   hookComp[w.to_hook_id]   || w.to_hook_id,
      fromHook: w.from_hook_id, toHook: w.to_hook_id,
      intent: w.intent || null,
      wireId: w.id,
    }));
    return {
      components: Object.values(this._state.component).map(c => ({
        id: c.id, name: c.name || c.id, consumes: c.consumes || [], produces: c.produces || [],
      })),
      relations,
    };
  }

  /** impactOf(componentId) — real impact analysis. "If this component's SEAM
   *  breaks, what depends on it and what intents fail downstream?" Walks the
   *  relation graph transitively from componentId, collecting every dependent
   *  and the intent of each broken link. This is what makes the registry a
   *  nervous system instead of a filing cabinet. */
  impactOf(componentId, maxDepth = 8) {
    const { relations } = this.contextGraph();
    // A wire from A's out-hook to B's in-hook means B DEPENDS ON A (A produces,
    // B consumes). So the dependents of componentId are the `to` ends of wires
    // whose `from` is componentId — i.e. who breaks if componentId stops.
    const dependents = new Map(); // componentId -> [{ dependsOn, intent, via }]
    const visited = new Set([componentId]);
    let frontier = [componentId];
    let depth = 0;
    while (frontier.length && depth < maxDepth) {
      depth++;
      const next = [];
      for (const source of frontier) {
        for (const r of relations) {
          if (r.from === source && !visited.has(r.to)) {
            if (!dependents.has(r.to)) dependents.set(r.to, []);
            dependents.get(r.to).push({ dependsOn: source, intent: r.intent, via: r.wireId });
            visited.add(r.to);
            next.push(r.to);
          }
        }
      }
      frontier = next;
    }
    return {
      component: componentId,
      directDependents: relations.filter(r => r.from === componentId).map(r => ({ component: r.to, intent: r.intent })),
      transitiveDependents: [...dependents.entries()].map(([id, links]) => ({ component: id, links })),
      brokenIntents: [...dependents.values()].flat().map(l => l.intent).filter(Boolean),
    };
  }
}

module.exports = { LoomRegistry, KINDS };
