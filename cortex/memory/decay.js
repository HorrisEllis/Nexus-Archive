'use strict';
/**
 * cortex/memory/decay.js — Tier-based decay/eviction
 * UUID: nexus-cortex-memory-decay-v1-0000-2026-0712-jamesbrooks-001
 * Version: 1.0.0
 *
 * §BUILT 2026-07-12 — the real MEMORY_TIERS behavior cortex.spec has
 * declared since v3.2.0. `/api/memory/working` was a flat object —
 * `{...working, ...body}` — with no expiry at all. This is what actually
 * ages working/short-tier rows out, on a real schedule, against the real
 * shared store (guardian/jaa-store.js via cortex/memory/jaa-db.js), not a
 * second in-memory structure competing with it.
 *
 * Tombstone, not delete — matches this codebase's own §7.4 (nothing
 * discarded, archived instead). An evicted row gets `_evicted: true` +
 * `_evictedAt`, and stays queryable via jaaDB.query(table, {_evicted:true})
 * for anyone doing forensics later; it's excluded from normal reads by
 * every caller that filters on `_evicted` not being true (query call sites
 * updated where relevant — see boot.js's memory routes).
 *
 * Every eviction cycle writes one summary row to `decay_log` (tier: long,
 * per tiers.js — the log of decay must never itself decay) — same
 * observability principle as everything else in this codebase: memory
 * pressure and eviction volume should be visible, not inferred.
 */

const { jaaDB } = require('./jaa-db.js');
const { TABLE_TIERS, tierConfig } = require('./tiers.js');

const MODULE_ID = 'cortex.memory.decay';

/**
 * runDecaySweep() — one pass over every table that has a finite
 * evictAfterMs. Synchronous, cheap (in-memory store, no real I/O beyond
 * the store's own JSONL append), safe to call on a timer or on demand
 * (tests call it directly rather than waiting on a real interval).
 *
 * @returns {{ cycleId: string, ts: number, evicted: Record<string, number>, totalEvicted: number }}
 */
function runDecaySweep() {
  const cycleId = require('crypto').randomUUID();
  const now = Date.now();
  const evicted = {};
  let totalEvicted = 0;

  for (const [table, tierName] of Object.entries(TABLE_TIERS)) {
    const config = tierConfig(tierName);
    if (!config || config.evictAfterMs == null) continue; // long-term: no eviction

    let rows;
    try { rows = jaaDB.query(table, {}); }
    catch (e) {
      // A table that doesn't exist yet (nothing has written to it) is not
      // an error — it just has nothing to evict.
      continue;
    }

    let evictedCount = 0;
    for (const row of rows) {
      if (row._evicted) continue; // already tombstoned
      const rowTs = row.ts || row.crystallisedAt || row.createdAt;
      if (rowTs == null) continue; // no age signal — leave it, don't guess
      const age = now - rowTs;
      if (age < config.evictAfterMs) continue;

      try {
        jaaDB.update(table, { id: row.id }, { _evicted: true, _evictedAt: now });
        evictedCount++;
      } catch (e) {
        console.warn(`[${MODULE_ID}] eviction write failed for ${table}/${row.id}: ${e.message}`);
      }
    }

    if (evictedCount > 0) {
      evicted[table] = evictedCount;
      totalEvicted += evictedCount;
    }
  }

  const summary = { cycleId, ts: now, evicted, totalEvicted };

  // §1.2 — the sweep itself is logged even when it evicts nothing, so a
  // gap in decay_log is distinguishable from "the ticker stopped running"
  // versus "nothing happened to be old enough."
  try {
    jaaDB.insert('decay_log', { ...summary, uuid: cycleId });
  } catch (e) {
    console.warn(`[${MODULE_ID}] decay_log write failed: ${e.message}`);
  }

  return summary;
}

let _timer = null;

/**
 * startDecayTicker(intervalMs) — begins the real periodic sweep. unref()'d
 * so it never keeps the process alive on its own, matching the pattern
 * this codebase already uses elsewhere for background tickers. Idempotent
 * — calling it twice doesn't double the ticker.
 */
function startDecayTicker(intervalMs = 5 * 60 * 1000) {
  if (_timer) return _timer;
  _timer = setInterval(runDecaySweep, intervalMs);
  _timer.unref();
  return _timer;
}

function stopDecayTicker() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

module.exports = { runDecaySweep, startDecayTicker, stopDecayTicker };
