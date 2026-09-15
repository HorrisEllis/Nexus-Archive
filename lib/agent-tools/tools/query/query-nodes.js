'use strict';
/**
 * lib/agent-tools/tools/query/query-nodes.js — query_nodes tool
 * UUID: nexus-tool-query-nodes-v1-0000-2026-0914-jamesbrooks-001
 * spec: docs/nexus-node-index.spec v0.1.0
 *
 * §MCO17 2026-09-14 — James: "querable with an .tool."
 *
 * §3.4 RAW EXECUTION BEFORE INTERFACES — this is the fourth layer of that
 * stack, not the first. lib/node-index.js is the raw code, lib/system-db.js is
 * the library, node-export's exportToFile() is the write API, and this is the
 * agent-facing surface over all three. It was built last on purpose: every
 * layer below it is exercisable and tested without it.
 *
 * §WHAT AN AGENT CAN ACTUALLY ASK, and why these four and not more — each one
 * maps to a real question this codebase has already had to answer the slow way:
 *   - systems   → "which systems have written any nodes at all"
 *   - describe  → "what does <system>'s database contain" (the `.database` node)
 *   - query     → "every <type> node <system> has written"  (replaces a readdir
 *                  + full YAML parse of every file of that type)
 *   - history   → "everything that has happened to node <id>" — the question
 *                  that is NOT answerable from the filesystem at all, because a
 *                  re-export overwrites the node file in place
 *
 * §16.4 — no filtering, ranking, or aggregation beyond this. Those can be
 * added when a real caller needs them; adding them now would be building for an
 * imagined requirement.
 */

const MODULE_ID = 'query_nodes';

function _db() { return require('../../../system-db.js'); }

module.exports = {
  name: 'query_nodes',
  description:
    "Query NEXUS's per-system node databases — the index of every .node ever written, with history. " +
    'Each sovereign system (guardian, cortex, clear-glass, idearium, copilot...) owns one database holding one table per node type it has written, plus an append-only ledger per type. ' +
    'Params: action (required: systems|describe|query|history), system (required for describe/query/history), type (node type, required for query/history — e.g. response, event, dom, command, tool, contract), id (node id, required for history), limit (default 50). ' +
    'Use `history` for questions the filesystem cannot answer — a re-export overwrites a node file in place, so first-seen/last-seen/change-count only exist in the index. ' +
    'Returns real indexed rows. A node written before this index existed is not in it; `indexedSince` on describe tells you that boundary.',
  parameters: {
    type: 'object',
    properties: {
      action: { type: 'string', description: 'systems | describe | query | history' },
      system: { type: 'string', description: 'owning system, e.g. guardian | cortex | clear-glass' },
      type:   { type: 'string', description: 'node type, e.g. response | event | dom | command | contract' },
      id:     { type: 'string', description: 'node id (history only)' },
      limit:  { type: 'number', description: 'max rows returned, default 50' },
    },
    required: ['action'],
  },

  execute: async ({ action, system = null, type = null, id = null, limit = 50 } = {}) => {
    try {
      const db = _db();

      if (action === 'systems') {
        const systems = db.listSystems();
        // §1.2 — an empty result is reported as a real, explained empty rather
        // than as a bare [], because "no system has written a node yet" and
        // "the lookup failed" look identical otherwise.
        return {
          systems,
          count: systems.length,
          note: systems.length ? undefined : 'no system has a node database on disk yet — nothing has been indexed',
        };
      }

      // §1.2 — an unknown action is reported as an unknown action. Checking
      // `system` first (the original order) made `action:"nonsense"` come back
      // as "requires a system", which sends a caller off to fix the wrong
      // thing. Found by a test, not by reading.
      const ACTIONS = ['systems', 'describe', 'query', 'history'];
      if (!ACTIONS.includes(action)) {
        return { error: `unknown action "${action}" — expected ${ACTIONS.join(' | ')}` };
      }
      if (!system) return { error: `action "${action}" requires a system — try action:"systems" first to see which exist` };

      if (action === 'describe') {
        const d = db.forSystem(system).describe();
        return {
          ...d,
          note: d.nodeTypes.length
            ? undefined
            : `${system} has a database but has not written any node type into it yet`,
        };
      }

      if (action === 'query') {
        if (!type) return { error: 'action "query" requires a type — use action:"describe" to see which types this system has written' };
        const rows = db.forSystem(system).queryNodes(type) || [];
        rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        return {
          system, type,
          total: rows.length,
          // The full payload of every row would blow an agent's context on a
          // type with thousands of entries. The index fields are what the
          // index is for; a caller that wants the node itself has the filePath.
          nodes: rows.slice(0, limit).map(r => ({
            id: r.id, uuid: r.uuid, filePath: r.filePath,
            summary: r.summary, tags: r.tags, system: r.system,
            exportedAt: r.exportedAt, updatedAt: r.updatedAt,
          })),
        };
      }

      if (action === 'history') {
        if (!type || !id) return { error: 'action "history" requires both type and id' };
        const entries = db.forSystem(system).history(type, id) || [];
        entries.sort((a, b) => (a.ts || 0) - (b.ts || 0)); // chronological — §3.2, ts is the ordering axis
        return {
          system, type, id,
          entries: entries.slice(-limit),
          total: entries.length,
          note: entries.length
            ? undefined
            : `no ledger entries for ${type}/${id} — either it does not exist, or it was written before this index did (check describe.indexedSince)`,
        };
      }

      // Unreachable — the ACTIONS guard above already rejected anything else.
      // Kept as a real belt-and-braces return rather than removed, so a future
      // action added to ACTIONS but not handled fails loudly here instead of
      // returning undefined (§1.2).
      return { error: `action "${action}" is listed but not implemented` };
    } catch (e) {
      // §1.2 — specific, with the module, the operation and the inputs present.
      return { error: `[${MODULE_ID}] ${action} failed for system=${system} type=${type} id=${id}: ${e.message}` };
    }
  },
};
