'use strict';

/**
 * clear-glass/lib/dom-nodes.js — durable `.dom` nodes for picked elements.
 * comp_id: nexus.clear-glass.dom-nodes
 * uuid: nexus-clearglass-dom-nodes-v1-0000-2026-0914-jamesbrooks-001
 * spec: docs/nexus-node-index.spec v0.1.0
 *
 * §MCO17 2026-09-14 — James: "maybe we can make a .dom node type for
 * clearglass?"
 *
 * §THE TAXONOMY WAS HALF WRONG, and the wrong half was load-bearing.
 * NODE-TAXONOMY.md has carried this since the original 32:
 *
 *   ".jaa, .dom — checked, neither built. JAA is the storage substrate under
 *    other node types, not a node itself. DOM queries (clear-glass/
 *    dom-archaeology.js) are live and ephemeral, never persisted."
 *
 * Re-checked directly rather than trusted. The `.jaa` half stands and is not
 * revisited — JAA genuinely is substrate. The `.dom` half conflated two
 * different things that live in the same file:
 *
 *   - handleQuery() — selector/tree reads against a live page. Genuinely
 *     transient, genuinely not node-worthy, and still not persisted here.
 *   - handlePick()  — a NAMED, addressable handle onto a specific element,
 *     which that file's own header describes as "registered as named hooks",
 *     held in a `this.picks` Map.
 *
 * A pick is not ephemeral by nature. It is ephemeral because the Map dies
 * with the process. That is an implementation detail being mistaken for an
 * architectural property, which §0.2 exists to catch: architecture is
 * permanent, implementations are temporary, and "the current code drops it"
 * is never evidence that it should be dropped. A named hook that cannot
 * survive a restart is a live §2.1/§2.2 violation — "state that is not
 * persisted does not exist between sessions", "a system that holds state only
 * in memory is a prototype".
 *
 * §WHY NOT `.response` — asked before building, because two DOM-shaped node
 * types is exactly the redundancy §16.5 warns about. They are different on
 * every axis that matters: a `.response` is one moment in a guardian job's
 * answer arriving (guardian owns it, guardian/lib/response-nodes.js writes
 * it, it is consumed by a retry gate); a `.dom` is a durable clear-glass-owned
 * address for an element (clear-glass owns it, it is consumed by anything that
 * wants to act on that element again later). Collapsing them would put two
 * write authorities on one type — §10.1.
 *
 * §5.9 SOVEREIGNTY — this module lives in clear-glass and writes to
 * clear-glass's own database. Guardian does not write `.dom`; clear-glass does
 * not write `.response`.
 *
 * §5.12 — archaeology.js's existing SSE emit and in-memory Map are untouched.
 * The UI keeps working identically whether or not this module is present; this
 * is the durable record beneath it, not a replacement for it.
 */

const path = require('path');

const MODULE_ID = 'nexus.clear-glass.dom-nodes';
const SYSTEM    = 'clear-glass';

const NODES_DIR = path.join(__dirname, '..', 'data', 'nodes', 'dom');

/**
 * writePick(pick) -> { ok, path } | { ok:false, reason }
 *
 * @param {object} pick — archaeology.js's own handlePick() record, passed
 *   through unchanged: { pickId, agentId, nodeId, name, meta, pickedAt }.
 *   `selector` and `url` are read from it when the renderer supplied them.
 *
 * §1.2 — never throws. A pick that fails to persist must not break the live
 * pick that the user just made and can see highlighted on the page.
 */
function writePick(pick = {}) {
  if (!pick.pickId) return { ok: false, reason: 'pickId required — archaeology.js generates it, a pick without one did not come from a real pick' };
  if (!pick.name)   return { ok: false, reason: 'name required — an unnamed pick has no handle to address it by, which is the whole point of the type' };

  try {
    const { exportToFile } = require('../../lib/node-export.js');
    const p = exportToFile('dom', pick.pickId, {
      pickId:   pick.pickId,
      name:     pick.name,
      agentId:  pick.agentId || null,
      nodeId:   pick.nodeId || null,
      // Read from meta as a fallback because the renderer's dom:pick-result
      // payload carries these at different depths depending on how the pick
      // was initiated. Checked both shapes rather than assuming one.
      selector: pick.selector || (pick.meta && pick.meta.selector) || null,
      url:      pick.url || (pick.meta && pick.meta.url) || null,
      meta:     pick.meta || null,
      pickedAt: pick.pickedAt || Date.now(),
      // Deliberately absent, not defaulted to pickedAt: "never re-checked" and
      // "checked and still valid" are different facts, and collapsing them
      // would make a stale selector look verified (§0.1).
      lastSeenAt: pick.lastSeenAt || null,
    }, {
      system: SYSTEM,
      tags: ['dom', 'pick', ...(pick.agentId ? [`agent:${pick.agentId}`] : [])],
      context: `clear-glass DOM pick "${pick.name}"${pick.url ? ` on ${pick.url}` : ''}`,
      source: MODULE_ID,
    }, NODES_DIR);
    return { ok: true, path: p };
  } catch (e) {
    console.warn(`[${MODULE_ID}] .dom node write failed for pick "${pick.name}" (non-fatal — the live pick is unaffected): ${e.message}`);
    return { ok: false, reason: e.message };
  }
}

/**
 * loadPicks() -> [pick, ...] — every durable pick, for rehydrating
 * archaeology.js's Map at boot. This is the half that makes persistence worth
 * anything: writing state that is never read back is not persistence, it is
 * logging.
 */
function loadPicks() {
  try {
    const { queryDir } = require('../../lib/node-export.js');
    return queryDir(NODES_DIR, { type: 'dom' })
      .map(env => env.payload)
      .filter(Boolean)
      .sort((a, b) => (a.pickedAt || 0) - (b.pickedAt || 0));
  } catch (e) {
    console.warn(`[${MODULE_ID}] loadPicks failed (non-fatal — starts empty): ${e.message}`);
    return [];
  }
}

/**
 * touchPick(pickId) — record that this pick's selector still resolved on the
 * live page. Separate from writePick because "seen again" is a different fact
 * from "picked", and the index's own occurrence counter is what accumulates it
 * (lib/node-index.js bumps the ledger on every re-export).
 */
function touchPick(pickId, patch = {}) {
  const existing = loadPicks().find(p => p.pickId === pickId);
  if (!existing) return { ok: false, reason: `no durable pick "${pickId}"` };
  return writePick({ ...existing, ...patch, lastSeenAt: Date.now() });
}

module.exports = { writePick, loadPicks, touchPick, NODES_DIR, SYSTEM, MODULE_ID };
