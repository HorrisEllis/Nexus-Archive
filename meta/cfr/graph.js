'use strict';
/**
 * lib/cfr/graph.js — Causal graph builder
 * UUID: nexus-cfr-graph-v1-0000-4000-0000-000000000001
 *
 * Every ledger entry is also a node in the causal graph.
 * Edges come from:
 *   causedBy    — explicit parent link in the event
 *   sessionId   — all events in a session cluster together
 *   jobId       — all events in a job chain
 *   temporal    — events within 2s of each other on same system
 *
 * The graph enables:
 *   - Replay: traverse forward from any node
 *   - Root cause: traverse backward from failure to origin
 *   - Sigma clustering: find high-sigma chains
 */

'use strict';

class CausalGraph {
  constructor() {
    this.nodes = new Map();   // id → LedgerEntry
    this.edges = [];          // { from, to, type, weight }
    this._bySession  = new Map();  // sessionId → id[]
    this._byJob      = new Map();  // jobId      → id[]
    this._bySystem   = new Map();  // system     → id[] (last 100)
    this._byType     = new Map();  // type       → id[] (last 50)
    // §ADDED 2026-07-06 — the exact edge type RAID's own code names as
    // its missing dependency: `topologicalProximity = 1.0; // stub —
    // needs CFR _byComponent edge, not built (docs/cfr.spec)`. That
    // spec already calls this "the fifth edge type... zero new CFR API
    // surface, same ring-buffer pattern, automatic" — this follows that
    // exact pattern, matching _bySystem/_byType above.
    this._byComponent = new Map();  // componentId → id[] (last 100)
    this._adj        = new Map();  // undirected adjacency, id → Set(id) — built lazily by componentDistance()
    this._adjEdgeCount = 0;        // detects staleness against this.edges without a full rebuild every call
  }

  /**
   * ingest — add a ledger entry to the graph.
   * Resolves all applicable edges automatically.
   */
  ingest(entry) {
    const id = entry.uuid || entry.id;
    if (!id) return;

    this.nodes.set(id, entry);

    // ── Explicit causality ─────────────────────────────────────────────────
    if (entry.causedBy) {
      this.edges.push({ from: entry.causedBy, to: id, type: 'causal', weight: 1.0 });
    }

    // ── Session cluster ────────────────────────────────────────────────────
    const sid = entry.sessionId || entry.trace?.sessionId;
    if (sid) {
      if (!this._bySession.has(sid)) this._bySession.set(sid, []);
      const prev = this._bySession.get(sid);
      if (prev.length > 0) {
        this.edges.push({
          from:   prev[prev.length - 1],
          to:     id,
          type:   'session',
          weight: 0.7,
        });
      }
      prev.push(id);
    }

    // ── Job chain ──────────────────────────────────────────────────────────
    const jobId = entry.payload?.jobId || entry.trace?.jobId;
    if (jobId) {
      if (!this._byJob.has(jobId)) this._byJob.set(jobId, []);
      const chain = this._byJob.get(jobId);
      if (chain.length > 0) {
        this.edges.push({
          from:   chain[chain.length - 1],
          to:     id,
          type:   'job',
          weight: 0.9,
        });
      }
      chain.push(id);
    }

    // ── Temporal adjacency (same system, within 2s) ────────────────────────
    const sys = entry.system || entry._system || entry.source;
    if (sys) {
      if (!this._bySystem.has(sys)) this._bySystem.set(sys, []);
      const ring = this._bySystem.get(sys);
      if (ring.length > 0) {
        const prevEntry = this.nodes.get(ring[ring.length - 1]);
        if (prevEntry && Math.abs((entry.ts || 0) - (prevEntry.ts || 0)) < 2000) {
          this.edges.push({
            from:   ring[ring.length - 1],
            to:     id,
            type:   'temporal',
            weight: 0.3,
          });
        }
      }
      ring.push(id);
      if (ring.length > 100) ring.shift();
    }

    // ── Type sequence (same type, successive) ─────────────────────────────
    const type = entry.type;
    if (type) {
      if (!this._byType.has(type)) this._byType.set(type, []);
      const tring = this._byType.get(type);
      if (tring.length > 0) {
        this.edges.push({
          from:   tring[tring.length - 1],
          to:     id,
          type:   'type-sequence',
          weight: 0.4,
        });
      }
      tring.push(id);
      if (tring.length > 50) tring.shift();
    }

    // ── Component adjacency (successive events from the same component) ────
    // §ADDED 2026-07-06 — see constructor comment. componentId comes from
    // the entry directly, or from payload.componentId — matching the same
    // fallback shape already used for jobId a few lines up.
    const compId = entry.componentId || entry.payload?.componentId;
    if (compId) {
      if (!this._byComponent.has(compId)) this._byComponent.set(compId, []);
      const cring = this._byComponent.get(compId);
      if (cring.length > 0) {
        this.edges.push({
          from:   cring[cring.length - 1],
          to:     id,
          type:   'component',
          weight: 0.8,
        });
      }
      cring.push(id);
      if (cring.length > 100) cring.shift();
    }
  }

  /**
   * componentProximity(a, b) — 0..1 real proximity between two
   * component IDs, derived from the actual edge graph rather than a
   * hardcoded constant. This is exactly what RAID's topologicalProximity
   * stub has been waiting for. Returns 0 if either component has never
   * been seen, or 1.0 if they're the same component (trivially adjacent
   * to itself) — otherwise walks each component's most recent node and
   * checks real graph distance between them via existing edges (any
   * type, not just 'component'), capped at a small hop limit since this
   * needs to stay cheap enough to call inline during routing.
   */
  componentProximity(a, b, maxHops = 3) {
    if (a === b) return 1.0;
    const aIds = this._byComponent.get(a);
    const bIds = this._byComponent.get(b);
    if (!aIds?.length || !bIds?.length) return 0;

    const start = aIds[aIds.length - 1];
    const targetSet = new Set(bIds);
    let frontier = [start];
    const seen = new Set(frontier);
    for (let hop = 1; hop <= maxHops; hop++) {
      const next = [];
      for (const nodeId of frontier) {
        for (const e of this.edges) {
          const neighbor = e.from === nodeId ? e.to : (e.to === nodeId ? e.from : null);
          if (neighbor && !seen.has(neighbor)) {
            if (targetSet.has(neighbor)) return Math.max(0, 1 - (hop - 1) / maxHops);
            seen.add(neighbor);
            next.push(neighbor);
          }
        }
      }
      frontier = next;
      if (!frontier.length) break;
    }
    return 0; // no path found within maxHops — real distance, not a guess
  }

  /**
   * ancestors — walk backward from a node ID, following causal edges.
   * Returns array of entries from root to node.
   */
  ancestors(id, maxDepth = 20) {
    const result = [];
    const visited = new Set();
    let current = id;
    let depth   = 0;

    while (current && depth < maxDepth && !visited.has(current)) {
      visited.add(current);
      const entry = this.nodes.get(current);
      if (entry) result.unshift(entry);
      const parentEdge = this.edges.find(e => e.to === current && e.type === 'causal');
      current = parentEdge?.from;
      depth++;
    }

    return result;
  }

  /**
   * descendants — walk forward from a node.
   */
  descendants(id, maxDepth = 20) {
    const result = [];
    const queue  = [id];
    const visited = new Set();
    let depth = 0;

    while (queue.length && depth < maxDepth) {
      const curr = queue.shift();
      if (visited.has(curr)) continue;
      visited.add(curr);
      const entry = this.nodes.get(curr);
      if (entry && curr !== id) result.push(entry);
      const children = this.edges
        .filter(e => e.from === curr && (e.type === 'causal' || e.type === 'job'))
        .map(e => e.to);
      queue.push(...children);
      depth++;
    }

    return result;
  }

  /**
   * jobChain — all entries for a given jobId, in order.
   */
  jobChain(jobId) {
    const ids = this._byJob.get(jobId) || [];
    return ids.map(id => this.nodes.get(id)).filter(Boolean);
  }

  /**
   * highSigmaNodes — entries where sigma > threshold, for debugger.
   */
  highSigmaNodes(threshold = 0.6) {
    const result = [];
    for (const entry of this.nodes.values()) {
      if ((entry.sigma?.score ?? entry.sigma ?? 0) >= threshold) {
        result.push(entry);
      }
    }
    return result.sort((a, b) =>
      ((b.sigma?.score ?? b.sigma ?? 0) - (a.sigma?.score ?? a.sigma ?? 0)));
  }

  stats() {
    return {
      nodes:    this.nodes.size,
      edges:    this.edges.length,
      sessions: this._bySession.size,
      jobs:     this._byJob.size,
    };
  }

  // §RESTORED IN MERGE 2026-07-09 — componentDistance (mine, BFS hop count)
  // and componentProximity (parallel session's, 0..1 score) are different
  // real methods that collided in the merge because the parallel branch's
  // graph.js dropped componentDistance. Both kept — hop count and proximity
  // score answer different questions; RAID's fitness uses the distance,
  // pinned tests cfr-graph-component-distance.test.js verify it.
  _rebuildComponentAdjacency() {
    if (this._adjEdgeCount === this.edges.length) return;
    this._adj = new Map();
    const compOf = (id) => {
      const n = this.nodes.get(id);
      return n ? (n.componentId || n.comp_id || n.payload?.componentId || null) : null;
    };
    for (const e of this.edges) {
      const ca = compOf(e.from), cb = compOf(e.to);
      if (!ca || !cb || ca === cb) continue;
      if (!this._adj.has(ca)) this._adj.set(ca, new Set());
      if (!this._adj.has(cb)) this._adj.set(cb, new Set());
      this._adj.get(ca).add(cb);
      this._adj.get(cb).add(ca);
    }
    this._adjEdgeCount = this.edges.length;
  }

  componentDistance(componentA, componentB, maxDepth = 12) {
    if (!componentA || !componentB) return null;
    if (componentA === componentB) return 0;
    this._rebuildComponentAdjacency();
    if (!this._adj.has(componentA) || !this._adj.has(componentB)) return null;
    const visited = new Set([componentA]);
    let frontier = [componentA];
    let depth = 0;
    while (frontier.length && depth < maxDepth) {
      depth++;
      const next = [];
      for (const node of frontier) {
        for (const neighbor of (this._adj.get(node) || [])) {
          if (neighbor === componentB) return depth;
          if (!visited.has(neighbor)) { visited.add(neighbor); next.push(neighbor); }
        }
      }
      frontier = next;
    }
    return null;
  }
}

module.exports = { CausalGraph };
