'use strict';
/**
 * cortex/self-heal/escalation.js — Escalation Organ
 * UUID: nexus-cortex-self-heal-escalation-v1-0000-2026-0720-001
 * Version: 1.0.0
 *
 * The friction ledger's reactive half. cortex/self-heal/fault-taxonomy.js
 * (Phase 1) is the data layer — schema, thresholds, raiseFriction/recordSuccess.
 * This file is the organ: it listens to the real bus and calls that layer.
 *
 * Two independent inputs, per the evidence found wiring this (not invented):
 *
 *   1. anomaly.detected (meta/causal/anomaly.js) — { anomalyUuid, type, severity,
 *      sessionId }. `wireAnomalyTrigger(bus)` is the pre-existing contract this
 *      file is required to satisfy — tests/nexus-full-audit.js already checks
 *      for both this exact function name and this exact subscription (Phase 71.4,
 *      "closes the loop"). A real, detected anomaly raises friction for its
 *      fault class directly — this is the organ's primary trigger.
 *
 *   2. HEAL_REQUESTED (service/nexus-diagnostic.js, guardian userscripts, CLI —
 *      all real, all already emitting this today) — a request that a fix be
 *      attempted. This organ does not run fixes (that's self-heal/index.js,
 *      Phase 3, not yet built). What it does here: refuse the request outright
 *      if the fault class is already in FAILURE_MODE, per docs/self-heal.spec
 *      level 4 ("no more auto-attempts"). It does not raise friction on a bare
 *      request — only a real anomaly or a reported failed attempt does that.
 *
 * recordAttemptOutcome() is exported for Phase 3 (self-heal's ladder) to call
 * after each attempt — raw code before interface (§3.4): this organ's actual
 * friction logic is provable and tested here, before anything above it exists.
 *
 * Emits:
 *   escalation.friction.increased — exact event name liminal-space already
 *     subscribes to (cortex/liminal-space/index.js) — this closes that dead
 *     listener from the earlier audit.
 *   escalation.failure_mode — no existing listener pins this name down yet;
 *     chosen to match the same dot-separated, no-cortex-prefix convention as
 *     the confirmed one above. Flagged as inferred, not confirmed, per §0.1.
 *
 * §14.2 Gates are pure functions, no side effects except emitting events —
 *   the one exception, matching every other organ in this codebase
 *   (liminal-space, intelligence): JAA write happens first (§9.2), via
 *   fault-taxonomy's raiseFriction/recordSuccess, then the event is emitted.
 * §14.4 Infinite loop prevention — neither anomaly.detected nor HEAL_REQUESTED
 *   is re-emitted by this organ, so there is no cycle to guard against here
 *   (unlike liminal-space's crystallisation gate, which re-emitted its own
 *   trigger condition). Noted rather than bolted on unearned (§0.5).
 */

const faultTaxonomy = require('./fault-taxonomy');

const MODULE_ID = 'cortex/self-heal/escalation';
const VERSION = '1.0.0';

let _bus = null;

// Anomaly severity → self-heal ladder level. Not spec'd numerically anywhere
// found; a defensible, documented mapping — high severity costs more friction
// per occurrence than low, matching the ladder's own 0.10→0.50 progression.
const SEVERITY_TO_LEVEL = Object.freeze({
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
});

function _levelForSeverity(severity) {
  return SEVERITY_TO_LEVEL[severity] ?? 1; // unrecognised severity → level 1, not a silent 0
}

// ── anomaly.detected → raise friction directly ─────────────────────────────────
function _onAnomalyDetected(event) {
  const { anomalyUuid, type, severity, sessionId } = event?.payload || {};
  if (!type) {
    console.warn(`[${MODULE_ID}] anomaly.detected with no type — ${anomalyUuid || 'no uuid'}, ignoring (§1.2: named, not silently dropped)`);
    return;
  }

  const level = _levelForSeverity(severity);
  let result;
  try {
    result = faultTaxonomy.raiseFriction(type, level, { example: { anomalyUuid, sessionId, ts: Date.now() } });
  } catch (e) {
    console.warn(`[${MODULE_ID}] raiseFriction failed for '${type}': ${e.message}`);
    return;
  }

  _emitFrictionChange(type, result, { cause: 'anomaly.detected', anomalyUuid, sessionId });
}

// ── HEAL_REQUESTED → refuse if already in FAILURE_MODE, otherwise no-op ────────
// (this organ tracks friction; self-heal, Phase 3, is what actually attempts fixes)
function _onHealRequested(event) {
  const faultClass = event?.payload?.gapType;
  if (!faultClass) return; // no fault class to check against — nothing this organ can do

  const existing = faultTaxonomy.getFaultClass(faultClass);
  if (existing && faultTaxonomy.bandFor(existing.friction) === 'FAILURE_MODE') {
    if (_bus) _bus.emit('escalation.failure_mode', {
      faultClass,
      friction: existing.friction,
      cause: 'HEAL_REQUESTED refused',
      gapUuid: event.payload.gapUuid,
      message: `'${faultClass}' is in FAILURE_MODE (friction ${existing.friction}) — no more auto-attempts (docs/self-heal.spec level 4)`,
    });
    console.warn(`[${MODULE_ID}] refused HEAL_REQUESTED for '${faultClass}' — already in FAILURE_MODE`);
  }
}

function _emitFrictionChange(faultClass, result, meta = {}) {
  if (!_bus) return;
  _bus.emit('escalation.friction.increased', {
    faultClass,
    newFric: result.row.friction,
    band: result.band,
    count: result.row.count,
    ...meta,
  });
  if (result.justEnteredFailureMode) {
    _bus.emit('escalation.failure_mode', {
      faultClass,
      friction: result.row.friction,
      cause: meta.cause || 'friction_accumulation',
      message: `'${faultClass}' crossed into FAILURE_MODE (friction ${result.row.friction}) — no more auto-attempts (docs/self-heal.spec level 4)`,
    });
    console.warn(`[${MODULE_ID}] '${faultClass}' entered FAILURE_MODE`);
  }
}

// ── Exported for Phase 3 (self-heal ladder) to call after each attempt ─────────
// §3.4 — raw code, callable and tested independently of any bus or interface.
function recordAttemptOutcome(faultClass, level, succeeded, meta = {}) {
  if (succeeded) {
    const result = faultTaxonomy.recordSuccess(faultClass);
    if (_bus && result) {
      _bus.emit('escalation.friction.increased', {
        faultClass, newFric: result.friction, band: result.band,
        cause: 'attempt_succeeded', ...meta,
      });
    }
    return result;
  }
  const result = faultTaxonomy.raiseFriction(faultClass, level, meta);
  _emitFrictionChange(faultClass, result, { cause: 'attempt_failed', level, ...meta });
  return result;
}

// ── wireAnomalyTrigger — the exact contract tests/nexus-full-audit.js checks for
function wireAnomalyTrigger(bus) {
  _bus = bus; // §1.2 — without this, raiseFriction still runs but the resulting
              // event silently never emits when this is called standalone.
  bus.on('anomaly.detected', _onAnomalyDetected);
}

// ── §12.6 diagnostic engine — health right now, not just a test that passed once
function health() {
  return {
    ok: true,
    module: MODULE_ID,
    version: VERSION,
    busWired: !!_bus,
    thresholds: faultTaxonomy.FRICTION_THRESHOLDS,
  };
}

function init(cfg = {}) {
  if (cfg.bus) {
    wireAnomalyTrigger(cfg.bus);
    cfg.bus.on('HEAL_REQUESTED', _onHealRequested);
  }
  console.log(`[${MODULE_ID}] v${VERSION} — friction ledger active${_bus ? ' (bus-wired)' : ' (no bus — test mode)'}`);
  return { ok: true };
}

function stop() {
  if (_bus) {
    _bus.off('anomaly.detected', _onAnomalyDetected);
    _bus.off('HEAL_REQUESTED', _onHealRequested);
  }
  _bus = null; // avoid a stale reference outliving the listeners that used it
}

module.exports = {
  MODULE_ID, VERSION,
  init, stop, health,
  wireAnomalyTrigger,
  recordAttemptOutcome,
  SEVERITY_TO_LEVEL,
};
