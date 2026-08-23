'use strict';
/**
 * guardian/config.js — real, distinct config, not inline constants
 * scattered across guardian/server.js. Matches the pattern established
 * by intelligence/config.js and ollama/config.js earlier this session —
 * same shape, same reasoning: a single, real file to change, not a value
 * to grep for across 4000+ lines and hope none were missed.
 *
 * §SCOPE — this captures the 9 real, already-NAMED top-level constants
 * this file had (checked directly, not guessed). It deliberately does
 * NOT extract the many scattered INLINE timeout literals throughout
 * guardian/server.js's own route handlers (several real, repeated
 * `timeout: 3000` calls to cortex specifically, several other one-off
 * intervals) — that's real, separate, larger work (more like BL15's
 * scope than this pass's), named here explicitly rather than silently
 * left undiscoverable: grep guardian/server.js for `timeout:\s*[0-9]`
 * to find them when that pass happens.
 */

module.exports = {
  // ── Network ────────────────────────────────────────────────────────────
  HTTP_PORT:     parseInt(process.env.GUARDIAN_HTTP_PORT || '7820', 10),
  ORCH_PORT:     parseInt(process.env.ORCHESTRATOR_PORT  || '9000', 10),
  DROPZONE_PORT: parseInt(process.env.GUARDIAN_DROPZONE_PORT || '7822', 10),
  NEXUS_URL:     process.env.NEXUS_URL || 'http://127.0.0.1:3748',

  // ── Storage ────────────────────────────────────────────────────────────
  CORTEX_STORE_DIR: process.env.MEMORY_STORE_DIR ||
    require('path').join(__dirname, '..', 'data', 'cortex', 'memory'),

  // ── In-memory buffer caps — real, distinct purposes, kept explicitly
  // separate and clearly named (the original code had both `_LOG_MAX`
  // and `LOG_MAX` as two different constants for two different real
  // buffers — checked directly before consolidating, not assumed to be
  // the same value duplicated by accident) ────────────────────────────
  SISO_LOG_MAX:     parseInt(process.env.GUARDIAN_SISO_LOG_MAX || '2000', 10), // real cap on the internal SISO stream event log (§2.3 StreamLog)
  RESPONSE_LOG_MAX: parseInt(process.env.GUARDIAN_RESPONSE_LOG_MAX || '200', 10), // real cap on the job/response history log

  // ── Real, tuned thresholds ────────────────────────────────────────────
  CHUNK_ENFORCE_THRESHOLD: parseInt(process.env.GUARDIAN_CHUNK_ENFORCE_THRESHOLD || '3000', 10),
  // Builds can legitimately run long — 1 hour of no update is a real,
  // generous bar before calling a queue entry stalled (original inline
  // comment preserved here, the reasoning behind the number matters).
  QUEUE_STALE_MS: parseInt(process.env.GUARDIAN_QUEUE_STALE_MS || String(60 * 60 * 1000), 10),
};
