'use strict';
/**
 * intelligence/config.js — real, distinct config, not inline constants
 * scattered across server.js/consumer.js/index.js. Matches the shape
 * already declared for this system in lib/uid/component-map.js's
 * nexus-in.config.
 *
 * §GAP CLOSED 2026-08-23 — found while doing BL16 for cortex/boot.js:
 * this file only ever covered server.js/consumer.js's own constants.
 * intelligence/index.js (the real, original phase-1-moved core) still
 * had 6 real timing constants and 2 maturity thresholds genuinely
 * inline, never centralized. Also found lib/uid/component-map.js's
 * nexus-cx.config block was stale — still listing POLL_MS/
 * SIGMA_THRESHOLD/FAILURE_SCAN_MS/REUSE_INDEX_MS as if they belonged
 * to cortex, when they've lived here since the phase-1 extraction.
 */
const path = require('path');

module.exports = {
  PORT: parseInt(process.env.INTELLIGENCE_PORT || '3753', 10),
  DATA_DIR: path.join(__dirname, '..', 'data', 'intelligence'),
  POLL_MS: parseInt(process.env.INTELLIGENCE_POLL_MS || '5000', 10),
  MAX_LEDGER_HISTORY: 500,
  RING_CAP: 500,

  // ── intelligence/index.js's own real timing (§GAP CLOSED above) ──────────
  PATTERN_SCAN_MS:  60_000,   // scan for patterns every 60s
  FAILURE_SCAN_MS:  30_000,   // scan failure taxonomy every 30s
  REUSE_INDEX_MS:   120_000,  // rebuild reuse index every 2 min
  CROSS_LEDGER_MS:  90_000,   // cross-ledger analysis every 90s
  META_SCAN_MS:     180_000,  // meta-pattern pass every 3 min — needs a populated bep_patterns table to have anything to reflect on, so it trails the others
  LOOM_MAP_SYNC_MS: 120_000,  // refresh the cached loom system/component map

  // ── Pattern maturity thresholds ───────────────────────────────────────
  MATURE_MIN_COUNT:  50,    // real, high bar — this isn't "crystallised" (which can trigger at 5-10), it's "long since settled"
  MATURE_CONFIDENCE: 0.95,  // near-max; still allows a genuine late confidence recovery to register
};
