'use strict';
/**
 * lib/rfr2-bus-bridge.js — RFR2 Delta + Enforcement → Nexus Bus Bridge
 * UUID: nexus-rfr2-bus-bridge-v1-0000-2026-0702-jamesbrooks-001
 *
 * §nexus-intelligence-system.spec Gap 1:
 *   "RFR2 delta and enforcement are not receiving live events.
 *    The modules exist but no producer feeds them."
 *
 * This module subscribes to the nexus-bus wildcard '*' and feeds every
 * event through RFR2's computeEventDelta() (measurement, no judgment)
 * and the inline enforcement invariant checks. Results are emitted back
 * onto the bus as rfr2.delta.* and rfr2.enforcement.* events — read by
 * the intelligence layer's L1 measurement path.
 *
 * RFR2 delta/index.js is ESM — this bridge uses the inline CJS-compatible
 * versions of its core math (same formulas, same outputs) until the ESM
 * import path is resolved in Phase 6.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ── Rolling state for delta computation ───────────────────────────────────────
const _state = {
  recent:      [],  // last 200 events for baseline computation
  recentGaps:  [],  // inter-event latency gaps (for S-field)
  recentDepths:[],  // causal depths (for C-field)
  recentRate:  0,   // events/sec in last window
  prevRate:    0,
  windowStart: Date.now(),
  windowCount: 0,
  MAX_RECENT:  200,
  WINDOW_MS:   10000,
};

// ── CJS-compatible delta computation (mirrors meta/rfr2/delta/index.js) ──────
function _computeDelta(ev, parent) {
  const { recentGaps, recentDepths, recentRate, prevRate } = _state;

  const gap = parent ? Math.max(0, (ev.ts || Date.now()) - (parent.ts || 0)) : 0;

  // S-field: latency z-score
  let latencyImpact = 0;
  if (recentGaps.length >= 3) {
    const mean = recentGaps.reduce((a,b) => a+b, 0) / recentGaps.length;
    const std  = Math.sqrt(recentGaps.reduce((s,g) => s + (g-mean)**2, 0) / recentGaps.length) || 1;
    latencyImpact = Math.max(0, (gap - mean) / std);
  }

  // Causal depth
  const parentDepth = parent?._depth || 0;
  const ownDepth    = parentDepth + (parent ? 1 : 0);

  // C-field: structural deviation z-score
  let structuralDeviation = 0;
  if (recentDepths.length >= 3) {
    const mean = recentDepths.reduce((a,b) => a+b, 0) / recentDepths.length;
    const std  = Math.sqrt(recentDepths.reduce((s,d) => s + (d-mean)**2, 0) / recentDepths.length) || 1;
    structuralDeviation = (ownDepth - mean) / std;
  }

  // Throughput change
  const throughputChange = prevRate > 0 ? (recentRate - prevRate) / prevRate : 0;

  return {
    eventId:          ev.id,
    eventType:        ev.type,
    sField:           +latencyImpact.toFixed(4),
    cField:           +Math.abs(structuralDeviation).toFixed(4),
    gap,
    ownDepth,
    throughputChange: +throughputChange.toFixed(4),
    deviating:        latencyImpact > 1.5 || Math.abs(structuralDeviation) > 1.5,
  };
}

// ── CJS-compatible enforcement check (critical invariants only) ───────────────
function _checkInvariants(ev) {
  const violations = [];

  if (ev.id && !UUID_RE.test(ev.id))
    violations.push({ id: 'I-1', detail: `non-UUID id: ${ev.id}` });

  if (ev.causedBy && !ev.edgeType)
    violations.push({ id: 'C-1', detail: `causedBy without edgeType on ${ev.type}` });

  const now = Date.now();
  if (ev.ts && (ev.ts > now + 5000 || ev.ts < now - 300000))
    violations.push({ id: 'T-1', detail: `ts out of range: ${ev.ts}` });

  if (!ev.source)
    violations.push({ id: 'H-1', detail: `source missing on ${ev.type}` });

  return { ok: violations.length === 0, violations };
}

// ── State update ─────────────────────────────────────────────────────────────
function _updateState(ev) {
  const now = Date.now();

  // Sliding window rate
  _state.windowCount++;
  if (now - _state.windowStart > _state.WINDOW_MS) {
    _state.prevRate    = _state.windowCount / (_state.WINDOW_MS / 1000);
    _state.windowCount = 0;
    _state.windowStart = now;
    _state.recentRate  = _state.prevRate;
  }

  // Gap from previous event
  const prev = _state.recent[_state.recent.length - 1];
  if (prev) {
    const gap = Math.max(0, (ev.ts || now) - (prev.ts || now));
    _state.recentGaps.push(gap);
    if (_state.recentGaps.length > _state.MAX_RECENT) _state.recentGaps.shift();
  }

  // Depth tracking
  const depth = (ev.causedBy ? 1 : 0);
  _state.recentDepths.push(depth);
  if (_state.recentDepths.length > _state.MAX_RECENT) _state.recentDepths.shift();

  // Keep recent for parent lookup
  _state.recent.push({ ...ev, _depth: depth });
  if (_state.recent.length > _state.MAX_RECENT) _state.recent.shift();

  return prev;
}

// ── Main subscription handler ──────────────────────────────────────────────────
function _onBusEvent(ev, bus) {
  if (!ev || !ev.type) return;

  // Skip RFR2's own events — don't feed back on ourselves
  if (ev.type.startsWith('rfr2.') || ev.source === 'rfr2-bus-bridge') return;

  const parent = _updateState(ev);

  // Delta measurement (L1 — pure measurement, no judgment)
  const delta = _computeDelta(ev, parent);
  if (delta.deviating || delta.sField > 0.5 || delta.cField > 0.5) {
    bus.emit('rfr2.delta.signal', {
      ...delta,
      source: 'rfr2-bus-bridge',
      ts: Date.now(),
    }, { source: 'rfr2-bus-bridge' });
  }

  // Enforcement invariant check (L7)
  const { ok, violations } = _checkInvariants(ev);
  if (!ok) {
    bus.emit('rfr2.enforcement.violation', {
      eventType: ev.type,
      eventId:   ev.id,
      violations,
      source:    'rfr2-bus-bridge',
      ts:        Date.now(),
    }, { source: 'rfr2-bus-bridge' });
  }
}

// ── Fractal detection — run every 60s over recent deltas ─────────────────────
const _deltaHistory = [];
const MAX_DELTA_HISTORY = 500;

function _detectFractals(bus) {
  if (_deltaHistory.length < 20) return;

  // Look for repeating high-deviation periods
  const highS = _deltaHistory.filter(d => d.sField > 1.5);
  if (highS.length < 3) return;

  // Simple period detection: check if spikes cluster at regular intervals
  const gaps = [];
  for (let i = 1; i < highS.length; i++) {
    gaps.push(highS[i].ts - highS[i-1].ts);
  }
  const avgGap = gaps.reduce((a,b) => a+b, 0) / gaps.length;
  const stdGap = Math.sqrt(gaps.reduce((s,g) => s + (g - avgGap)**2, 0) / gaps.length);
  const cv     = stdGap / avgGap; // coefficient of variation — low = regular pattern

  if (cv < 0.3 && avgGap > 0) {
    bus.emit('rfr2.delta.fractal', {
      detected:       true,
      periodMs:       Math.round(avgGap),
      occurrences:    highS.length,
      regularity:     +(1 - cv).toFixed(3),
      sampleSize:     _deltaHistory.length,
      source:         'rfr2-bus-bridge',
      ts:             Date.now(),
    }, { source: 'rfr2-bus-bridge' });
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
let _attached = false;

/**
 * attach(bus) — subscribe to nexus-bus and start feeding events to RFR2.
 * Idempotent — safe to call multiple times.
 */
function attach(bus) {
  if (_attached || !bus) return;
  _attached = true;

  bus.on('*', (ev) => {
    try { _onBusEvent(ev, bus); } catch(_) {}
  });

  // Bus-level delta event also feeds history for fractal detection
  bus.on('rfr2.delta.signal', (ev) => {
    _deltaHistory.push({ ...ev, ts: Date.now() });
    if (_deltaHistory.length > MAX_DELTA_HISTORY) _deltaHistory.shift();
  });

  // Fractal scan every 60s
  const t = setInterval(() => {
    try { _detectFractals(bus); } catch(_) {}
  }, 60000);
  if (t.unref) t.unref();

  console.log(`[${new Date().toISOString()}] [lib/rfr2-bus-bridge.js] RFR2 delta+enforcement wired to nexus-bus`);
}

/**
 * getState() — snapshot of rolling measurement state (for diagnostics)
 */
function getState() {
  return {
    recentEvents:  _state.recent.length,
    recentGaps:    _state.recentGaps.slice(-5),
    recentRate:    _state.recentRate,
    deltaHistory:  _deltaHistory.length,
    attached:      _attached,
  };
}

module.exports = { attach, getState };
