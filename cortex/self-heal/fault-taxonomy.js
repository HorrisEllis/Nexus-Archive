'use strict';
// cortex/self-heal/fault-taxonomy.js — Phase 1: schema + sole write authority for `fault_taxonomy`
// UUID: nexus-cortex-escalation-fault-taxonomy-v1-0000-2026-0720-001
//
// §10.1 Each data type has exactly one write authority.
//   Six modules already read `fault_taxonomy` (raid/snr-filter, intelligence,
//   orchestrator/request-handler, lib/constitutional-ai, lib/replay-engine,
//   plus their tests). None of them write to it. This module is the writer —
//   everything else stays a reader.
//
// §13.3 Every fault class is named before it occurs.
//   Levels 0-3 and their friction deltas, and the four friction bands, come
//   verbatim from docs/self-heal.spec and docs/escalation.spec — not invented
//   here, not magic numbers at a call site.
//
// Row shape (confirmed against every existing reader):
//   { uuid, faultClass, friction, ts, count, lastSeen, precursors, examples, successRate }

const { jaaDB, uid } = require('../memory/jaa-db');

const MODULE_ID = 'cortex/escalation/fault-taxonomy';
const TABLE = 'fault_taxonomy';

// ── §13.3 named constants — docs/escalation.spec ───────────────────────────────
const FRICTION_THRESHOLDS = Object.freeze({
  NOMINAL: 0.0,
  ELEVATED: 0.4,
  HIGH: 0.7,
  FAILURE_MODE: 1.0,
});

// Friction added per self-heal ladder level on a failed attempt (docs/escalation.spec)
const FRICTION_DELTA_BY_LEVEL = Object.freeze({
  0: 0.10,
  1: 0.20,
  2: 0.35,
  3: 0.50,
});

// Level-0/1 known fault classes (docs/self-heal.spec)
const KNOWN_FAULT_CLASSES = Object.freeze([
  'stale_module', 'timeout', 'api_degraded', 'queue_saturated',
  'memory_pressure', 'bottleneck', 'circuit_breaker', 'import_error',
]);

function bandFor(friction) {
  if (friction >= FRICTION_THRESHOLDS.FAILURE_MODE) return 'FAILURE_MODE';
  if (friction >= FRICTION_THRESHOLDS.HIGH) return 'HIGH';
  if (friction >= FRICTION_THRESHOLDS.ELEVATED) return 'ELEVATED';
  return 'NOMINAL';
}

// ── Reads (thin — most real reads already happen directly via jaaDB.query in
//    the six existing consumers; this is for callers inside this organ) ───────
function getFaultClass(faultClass) {
  return jaaDB.get(TABLE, { faultClass }) || null;
}

// ── Sole write path ────────────────────────────────────────────────────────────
// Raises friction for a fault class by the delta for the given ladder level.
// Creates the row on first occurrence (§2.1 — state that matters is persisted,
// not held only in memory). Never called directly by anything outside this
// organ once Phase 2 (the escalation organ proper) subscribes to
// cortex.heal.requested — exposed here only so Phase 1 is independently testable.
function raiseFriction(faultClass, level, meta = {}) {
  if (!faultClass) throw new Error(`[${MODULE_ID}] raiseFriction: faultClass is required`);
  const delta = FRICTION_DELTA_BY_LEVEL[level];
  if (delta === undefined) {
    throw new Error(`[${MODULE_ID}] raiseFriction: unknown ladder level '${level}' — must be one of ${Object.keys(FRICTION_DELTA_BY_LEVEL).join(', ')}`);
  }

  const now = Date.now();
  const existing = getFaultClass(faultClass);

  if (!existing) {
    const row = {
      uuid: uid(),
      faultClass,
      friction: Math.min(delta, FRICTION_THRESHOLDS.FAILURE_MODE),
      ts: now,
      count: 1,
      lastSeen: now,
      precursors: [],
      examples: meta.example ? [meta.example] : [],
      successRate: 0,
    };
    jaaDB.insert(TABLE, row);
    return { row, band: bandFor(row.friction), justEnteredFailureMode: row.friction >= FRICTION_THRESHOLDS.FAILURE_MODE };
  }

  const prevBand = bandFor(existing.friction);
  const newFriction = Math.min(existing.friction + delta, FRICTION_THRESHOLDS.FAILURE_MODE);
  const newBand = bandFor(newFriction);
  const values = {
    friction: newFriction,
    ts: now,
    count: (existing.count || 0) + 1,
    lastSeen: now,
    examples: meta.example ? [...(existing.examples || []).slice(-9), meta.example] : (existing.examples || []),
  };
  jaaDB.update(TABLE, { faultClass }, values);
  const row = { ...existing, ...values };
  return {
    row,
    band: newBand,
    justEnteredFailureMode: prevBand !== 'FAILURE_MODE' && newBand === 'FAILURE_MODE',
  };
}

// Successful fix — friction decays rather than resets outright (a class that
// failed 9 times and succeeded once is not "healthy," it's improving).
function recordSuccess(faultClass, decayFactor = 0.5) {
  const existing = getFaultClass(faultClass);
  if (!existing) return null;
  const newFriction = Math.max(0, existing.friction * decayFactor);
  const newSuccessRate = ((existing.successRate || 0) * (existing.count || 1) + 1) / ((existing.count || 1) + 1);
  const values = { friction: newFriction, successRate: newSuccessRate, ts: Date.now() };
  jaaDB.update(TABLE, { faultClass }, values);
  return { ...existing, ...values, band: bandFor(newFriction) };
}

module.exports = {
  MODULE_ID,
  TABLE,
  FRICTION_THRESHOLDS,
  FRICTION_DELTA_BY_LEVEL,
  KNOWN_FAULT_CLASSES,
  bandFor,
  getFaultClass,
  raiseFriction,
  recordSuccess,
};
