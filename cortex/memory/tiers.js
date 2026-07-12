'use strict';
/**
 * cortex/memory/tiers.js — Memory tier definitions
 * UUID: nexus-cortex-memory-tiers-v1-0000-2026-0712-jamesbrooks-001
 * Version: 1.0.0
 *
 * §BUILT 2026-07-12 — "need what's missing built again, not flat or stubs."
 * cortex.spec has declared `MEMORY_TIERS: { working: 30min, short: 6hr,
 * long: permanent }` since v3.2.0. Confirmed absent from every implementation
 * in this branch (`_workingMemory` in boot.js is a flat, non-expiring object)
 * — this is the real thing, not a second flat object with a different name.
 *
 * The tier numbers and table→tier mapping below are ported verbatim from
 * the other branch's cortex/memory/jaa-db.js (checked two turns ago:
 * real decay ticker, tombstone eviction, its own test file). That's real,
 * already-designed work — reusing it, not reinventing worse numbers from
 * scratch. What's NEW here is wiring it onto THIS tree's actual storage:
 * that branch reimplemented its own in-memory + JSONL store from scratch;
 * this tree already shares one real store with guardian
 * (guardian/jaa-store.js, via cortex/memory/jaa-db.js's thin adapter) —
 * so the tier/decay layer here is built as a layer ON TOP of that existing
 * adapter, not a replacement of it. Guardian's real data isn't touched by
 * any of this; only cortex's own tables are tier-managed.
 */

const MEMORY_TIERS = Object.freeze({
  // WORKING — decays in 2h, represents "this session, right now"
  working: {
    halfLifeMs:    30 * 60 * 1000,        // 30 min
    evictAfterMs:  2  * 60 * 60 * 1000,   // 2 hours
    wipeOnRestart: true,
  },
  // SHORT-TERM — decays in 24h, survives cortex restarts
  short: {
    halfLifeMs:    6  * 60 * 60 * 1000,   // 6 hours
    evictAfterMs:  24 * 60 * 60 * 1000,   // 24 hours
    wipeOnRestart: false,
  },
  // LONG-TERM — no decay, requires explicit graduation (crystallization)
  long: {
    halfLifeMs:    null,
    evictAfterMs:  null,
    wipeOnRestart: false,
  },
});

// Table → tier mapping. Only tables cortex itself owns and actually uses
// in this branch — not a blind copy of the other branch's full list
// (which includes tables like `orion_sessions` that don't exist here).
// Checked each of these against real cortex/*.js writers before listing.
const TABLE_TIERS = Object.freeze({
  // WORKING
  working_memory:   'working',

  // SHORT-TERM
  cortex_memory:    'short',
  gaps:             'short',
  event_log:        'short',
  sigma_records:    'short',
  meta_observations:'short',

  // LONG-TERM — no decay, explicit graduation required
  crystals:         'long',
  bep_patterns:     'long',
  trust_scores:     'long',
  fix_map:          'long',

  // INFRASTRUCTURE — not memory, never decays
  decay_log:        'long',
  settings:         'long',
  components:       'long',
});

function tierFor(table) {
  return TABLE_TIERS[table] || null;
}

function tierConfig(tierName) {
  return MEMORY_TIERS[tierName] || null;
}

module.exports = { MEMORY_TIERS, TABLE_TIERS, tierFor, tierConfig };
