'use strict';
/**
 * cortex/gap-finder/index.js — Gap-Finder Organ
 * UUID: nexus-cortex-gap-finder-v1-0000-2026-0720-001
 * Version: 1.0.0
 *
 * Turns real signal into real gaps. Two inputs, both already live in the
 * codebase before this organ existed:
 *
 *   anomaly.detected (meta/causal/anomaly.js) — { anomalyUuid, type, severity, sessionId }
 *   sigma.event.halt_risk / sigma.event.warning (orchestrator/lib/sigma-writer.js) —
 *     { sigma, type, axes, reason, uuid, ts }
 *
 * Emits cortex.gap.found with the exact { gap: row } shape cortex/boot.js's
 * own emitter already uses (confirmed, not guessed — liminal-space's
 * _onGapFound reads `event.payload?.gap || event.payload`, matching this).
 *
 * Dedup: before creating a gap, checks the real `gaps` table for an open,
 * unresolved gap with the same dedup_key (type+source), matching the
 * pattern already used in service/nexus-diagnostic.js rather than
 * inventing a second dedup convention.
 *
 * §14.2 — pure per event: same anomaly/sigma event in, same gap decision out.
 * §14.4 — this organ does not re-emit anomaly.detected or sigma.event.*, so
 *   there's no cycle for a wasProcessedBy() guard to prevent (same reasoning
 *   already applied to escalation.js).
 */

const { jaaDB, uid } = require('../memory/jaa-db');

const MODULE_ID = 'cortex/gap-finder';
const VERSION = '1.0.0';

// severity/sigma → gap severity, named before use (§13.3)
const SEVERITY_MAP = Object.freeze({ low: 'low', medium: 'medium', high: 'high', critical: 'high' });

let _bus = null;

function _dedupKey(type, source) {
  return `${type}::${source || 'unknown'}`;
}

function _existingOpenGap(dedupKey) {
  const rows = jaaDB.query('gaps', r => r.dedup_key === dedupKey && r.status === 'open', 1);
  return rows[0] || null;
}

function _createGap(gapType, body, source, meta = {}) {
  const dedup_key = _dedupKey(gapType, source);
  const existing = _existingOpenGap(dedup_key);
  if (existing) {
    // Already open — bump occurrence count rather than duplicate (§0.3 — nothing lost, the recurrence is data)
    try { jaaDB.update('gaps', { id: existing.id }, { occurrences: (existing.occurrences || 1) + 1, lastSeenAt: Date.now() }); }
    catch (e) { console.warn(`[${MODULE_ID}] gap occurrence bump failed: ${e.message}`); }
    return { created: false, gap: existing };
  }

  const gap = {
    uuid: uid(), type: gapType, body, source, status: 'open',
    dedup_key, occurrences: 1, detectedAt: Date.now(), lastSeenAt: Date.now(),
    meta,
  };
  try { jaaDB.insert('gaps', gap); }
  catch (e) { console.warn(`[${MODULE_ID}] gap write failed: ${e.message}`); return { created: false, gap: null }; }

  if (_bus) _bus.emit('cortex.gap.found', { gap }, { source: MODULE_ID });
  return { created: true, gap };
}

function _onAnomalyDetected(event) {
  const { anomalyUuid, type, severity, sessionId } = event?.payload || {};
  if (!type) return;
  // Only high/critical anomalies become gaps — low/medium are signal, not yet a gap
  // (matches service/nexus-diagnostic.js's own high-severity-only gap-write rule).
  if (severity !== 'high' && severity !== 'critical') return;
  _createGap(type, `Anomaly detected: ${type} (severity ${severity})`, 'gap-finder.anomaly',
    { anomalyUuid, sessionId, severity: SEVERITY_MAP[severity] || 'medium' });
}

function _onSigmaHaltRisk(event) {
  const { sigma, type, reason, uuid: sigmaUuid } = event?.payload || {};
  if (!type) return;
  _createGap(type, reason || `Sigma halt-risk breach (${sigma}) for ${type}`, 'gap-finder.sigma',
    { sigma, sigmaUuid, severity: 'high' });
}

function _onSigmaWarning(event) {
  // Warnings alone don't open a gap — they're the earlier of two thresholds
  // sigma-writer already distinguishes; opening a gap on every warning would
  // flood the gaps table with noise below the halt-risk line. Tracked for
  // visibility (§0.3) via console only, not silently dropped.
  const { sigma, type } = event?.payload || {};
  if (type) console.log(`[${MODULE_ID}] sigma warning (${sigma}) for ${type} — below halt-risk, not yet a gap`);
}

function health() {
  return { ok: true, module: MODULE_ID, version: VERSION, busWired: !!_bus };
}

function init(cfg = {}) {
  _bus = cfg.bus || null;
  if (_bus) {
    _bus.on('anomaly.detected', _onAnomalyDetected);
    _bus.on('sigma.event.halt_risk', _onSigmaHaltRisk);
    _bus.on('sigma.event.warning', _onSigmaWarning);
  }
  console.log(`[${MODULE_ID}] v${VERSION} — active${_bus ? ' (bus-wired)' : ' (no bus — test mode)'}`);
  return { ok: true };
}

function stop() {
  if (_bus) {
    _bus.off('anomaly.detected', _onAnomalyDetected);
    _bus.off('sigma.event.halt_risk', _onSigmaHaltRisk);
    _bus.off('sigma.event.warning', _onSigmaWarning);
  }
  _bus = null;
}

module.exports = { MODULE_ID, VERSION, init, stop, health, _createGap, _dedupKey };
