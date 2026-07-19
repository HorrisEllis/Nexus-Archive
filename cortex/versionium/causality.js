'use strict';
// ── versionium/causality.js ───────────────────────────────────────────────────
// UUID: mod-versionium-causality-v5-0000-4000-0000-000000000001
//
// §REFACTORED 2026-07-13 — this used to reimplement its own causedBy-chain
// walk (ancestors/descendants) directly against JAA tables. Per direction:
// causal tracing is supposed to use the real causal graph
// (meta/cfr/graph.js's CausalGraph), not a second, standalone
// implementation of the same walk. Checked before refactoring: CausalGraph
// is generic over any table (ingest(entry) only needs entry.uuid/causedBy,
// doesn't care which JAA table a row came from), so it works unchanged for
// versionium_commits the same way it already works for event_log.
//
// §WHAT STAYS SEPARATE — versionium_commits also has a `parentId` field,
// distinct from `causedBy`: `causedBy` links a commit to the shape_samples
// row that triggered it (why this version exists), `parentId` links it to
// the previous commit in the same branch (what version came before it).
// Those are two different questions with two different real answers — a
// commit's causal ancestor (why) is not the same node as its version
// parent (what came before). CausalGraph answers the first; branch/commit
// walking by parentId (in index.js) answers the second. Not merged into
// one, because they're not the same relationship.
//
// §M1: init(cfg) + stop().
// §M2: reads: event_log, versionium_commits. writes: poll_log.

const { jaaDB, uid } = require('../memory/jaa-db');
const { CausalGraph } = require('../../meta/cfr/graph.js');

const MODULE_ID  = 'versionium/causality';
const MAX_DEPTH  = 20; // prevent runaway cycles

let _interval = null;
let _cfg      = {};

function init(cfg = {}) {
  _cfg      = cfg;
  _interval = setInterval(_tick, _cfg.pollMs ?? 5000);
  _interval.unref();
}

function stop() {
  clearInterval(_interval);
  _interval = null;
}

async function _tick() {
  // Causality walks are on-demand — nothing to poll proactively
  // Tick just writes a heartbeat to poll_log for observability
  try {
    jaaDB.insert('poll_log', {
      uuid:   uid(),
      module: MODULE_ID,
      ts:     Date.now(),
      source: MODULE_ID,
    });
  } catch {}
}

// §CACHED, SHORT-LIVED — same reasoning as cortex/memory/causal-lookup.js's
// _buildRecentGraph: rebuilding from every table row on every single call
// would be wasteful; a few seconds of staleness is fine for causal tracing,
// which is inherently a "recent history" question, not a live-tick one.
let _cachedGraph  = null;
let _cachedKey    = null;
let _cachedAt     = 0;
const GRAPH_CACHE_MS = 5000;

// §FIXED 2026-07-13 — found by testing, not assumed: a versionium_commit's
// causedBy usually points at the shape_samples/event_log row that triggered
// it, a DIFFERENT table than the commit itself. A graph built from only
// 'versionium_commits' can't see that row at all, so tracing "why did this
// commit happen" silently stopped at the commit itself — technically not
// wrong (nothing crashed), but not useful, and versionium's whole point is
// tracing that exact link. Accepts one table or an array of tables to
// merge into one graph.
function _buildGraph(tables) {
  const tableList = Array.isArray(tables) ? tables : [tables];
  const key = tableList.slice().sort().join(',');
  const now = Date.now();
  if (_cachedGraph && _cachedKey === key && (now - _cachedAt) < GRAPH_CACHE_MS) {
    return _cachedGraph;
  }
  const graph = new CausalGraph();
  for (const table of tableList) {
    const rows = jaaDB.query(table, () => true, 5000);
    for (const row of rows) graph.ingest(row);
  }
  _cachedGraph = graph;
  _cachedKey = key;
  _cachedAt = now;
  return graph;
}

// ── ancestors(uuid) — walk up causedBy chain, via the real causal graph ───────
// `table` may be a single table name or an array — versionium's real calls
// pass ['versionium_commits', 'event_log'] so a commit's chain can trace
// back through the event that triggered it, not just other commits.
function ancestors(startUuid, table = 'event_log') {
  const graph = _buildGraph(table);
  // CausalGraph.ancestors() already returns oldest-first (root → target) —
  // checked its real implementation (it unshifts each node as it walks
  // backward) before assuming, since versionium's original contract was
  // also oldest-first and getting this backward would silently corrupt
  // every caller's idea of "which end is the root."
  return graph.ancestors(startUuid, MAX_DEPTH);
}

// ── descendants(uuid) — everything downstream, via the real causal graph ──────
function descendants(startUuid, table = 'event_log') {
  const graph = _buildGraph(table);
  return graph.descendants(startUuid, MAX_DEPTH);
}

// ── causalChain(uuid) — full formatted trace ──────────────────────────────────
// Defaults to spanning both real tables versionium cares about, so a
// commit's causal origin (an event_log row) and its downstream effects
// (other commits) are both reachable from one call.
function causalChain(startUuid, table = ['versionium_commits', 'event_log']) {
  const anc  = ancestors(startUuid, table);
  const desc = descendants(startUuid, table);

  return {
    root:        anc[0]   || null,
    target:      anc[anc.length - 1] || null,
    ancestors:   anc,
    descendants: desc,
    depth:       anc.length,
    spread:      desc.length,
  };
}

module.exports = { init, stop, ancestors, descendants, causalChain };
