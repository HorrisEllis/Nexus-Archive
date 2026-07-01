'use strict';
/**
 * lib/nerve/index.js — NEXUS Nerve System  (Phase 1: read layer)
 * UUID: nexus-nerve-v1-0000-2026-0701-jamesbrooks-001
 * Spec: docs/nexus-nerve.spec  v0.2.0
 *
 * Nerve is the Attention layer of NEXUS's cognition stack.
 * It does not decide. It does not act. It collapses everything CFR
 * and the bus know into what's locally knowable right now.
 *
 *   CFR (lib/cfr/field.js)     — Truth.     What happened, frozen.
 *   nexus-bus.js               — Motion.    What's happening, in transit.
 *   Nerve (this module)        — Attention. What's locally knowable now.
 *   ui/eravos/runtime/alk-gl.js — Expression. How it feels when it moves.
 *
 * §INVARIANT attention-non-truth (quoted verbatim from nexus-nerve.spec):
 *   "Nerve determines what is shown, not what is true. No system
 *   decision logic may be derived directly from Nerve output. Nerve
 *   is strictly a projection filter."
 *
 * Public surface (read-only — per sense-decide-act-separation invariant):
 *   getSnapshot()  → NerveSnapshot (pull-based)
 *   onChange(fn)   → unsubscribe fn (push-based)
 *   setRadius(r)   → the one mutation Nerve exposes, local only
 *
 * Explicitly absent (see spec §D): emit(), command(), execute(),
 * any write path to CFR, bus, or hooks registry.
 *
 * §Phase-0 gate: copilot and ollama now emit heartbeats (added this
 * session) — _sources will carry real lastSeen for all 10 systems
 * under normal operation. The Phase 0 gate from the spec is satisfied.
 */

const http  = require('http');
const hooks = require('../../hooks/index.js');

// ── Config defaults ────────────────────────────────────────────────────────────
const CFR_URL           = process.env.NEXUS_CFR_URL  || 'http://127.0.0.1:3748';
const BUS_URL           = process.env.NEXUS_ORCH_URL || 'http://127.0.0.1:9000';
const POLL_CFR_MS       = 2000;
const POLL_BUS_MS       = 2000;
const STALE_THRESHOLD_MS = 30000; // > 30s without a heartbeat = stale

// ── State ─────────────────────────────────────────────────────────────────────
let _field = {
  coherence: 0.5, friction: 0.5, resonance: 0.5, entropy: 0.5,
  regime: 'stable', stressCount: 0,
};
let _sources = {};    // systemId → { emitCount, lastSeen } — from bus
let _attention = { x: 0, y: 0 };
let _radius    = 200; // default px, adjustable via setRadius()
let _subscribers = [];
let _started  = false;

// ── HTTP helper ───────────────────────────────────────────────────────────────
function _get(url, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search,
      method: 'GET', timeout,
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); }
        catch (_) { reject(new Error('JSON parse failed')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// ── Presence classification — from the spec's 'live'|'stale'|'unknown' ────────
function _presence(src) {
  if (!src) return { lastSeen: null, emitCount: 0, status: 'unknown' };
  const age = Date.now() - src.lastSeen;
  const status = age < STALE_THRESHOLD_MS ? 'live' : 'stale';
  return { lastSeen: src.lastSeen, emitCount: src.emitCount, status };
}

// ── NerveSnapshot builder ─────────────────────────────────────────────────────
// §INVARIANT shadow-is-render-weight-not-data-presence:
//   Every node from allHooks() is ALWAYS in the snapshot regardless of
//   distance. Distance drives render weight only — never data presence.
// §INVARIANT dimness-and-health-are-orthogonal-channels:
//   distanceFromAttention and health are computed independently, never merged.
function _buildSnapshot() {
  const allH  = hooks.allHooks();
  const seen  = new Map(); // deduplicate by from.surface

  const nodes = [];
  for (const h of allH) {
    const sid = h.from?.surface;
    if (!sid || sid === '*' || sid === 'browser-tab') continue;
    if (seen.has(sid)) continue;
    seen.set(sid, true);

    const src     = _sources[sid];
    const health  = { ..._field }; // every node gets the same field snapshot
                                   // — per-node CFR is a Phase 3+ concern;
                                   // global field is honest for Phase 1.
    const presence = _presence(src);

    // Distance from attention center — render weight input, NOT data gate.
    // Position is set by the Expression layer (alk-gl.js) in Phase 2+;
    // Phase 1 produces NaN-safe zero so callers can still use the data.
    const dx = (_attention.x || 0);
    const dy = (_attention.y || 0);
    const distanceFromAttention = Math.sqrt(dx * dx + dy * dy);

    nodes.push({
      id:                  sid,
      name:                h.name || sid,
      system:              h.from?.surface || sid,
      position:            { x: 0, y: 0 }, // Expression layer fills in Phase 2+
      distanceFromAttention,
      health,
      presence,
    });
  }

  return Object.freeze({
    nodes,
    attention: { center: { ..._attention }, radius: _radius },
    stresses:  _field.stressCount > 0 ? [{ strength: _field.stressCount * 100, life: 1.0 }] : [],
    ts:        Date.now(),
  });
}

// ── Poll CFR field (Truth layer) ──────────────────────────────────────────────
async function _pollCFR() {
  try {
    const d = await _get(`${CFR_URL}/cfr/field`);
    if (d?.ok !== false) {
      _field = {
        coherence:   d.coherence   ?? _field.coherence,
        friction:    d.friction    ?? _field.friction,
        resonance:   d.resonance   ?? _field.resonance,
        entropy:     d.entropy     ?? _field.entropy,
        regime:      d.regime      || _field.regime,
        stressCount: d.stressCount ?? _field.stressCount,
      };
    }
  } catch (_) { /* keep last-known-good field state */ }
}

// ── Poll bus stats (Motion layer — _sources map) ──────────────────────────────
async function _pollBus() {
  try {
    const d = await _get(`${BUS_URL}/api/bus/stats`);
    if (d?.sources) _sources = d.sources;
  } catch (_) { /* keep stale sources rather than null them */ }
}

// ── Notify subscribers ────────────────────────────────────────────────────────
function _notify() {
  if (!_subscribers.length) return;
  const snap = _buildSnapshot();
  for (const fn of _subscribers) {
    try { fn(snap); } catch (_) {}
  }
}

// ── Start polling ─────────────────────────────────────────────────────────────
function _start() {
  if (_started) return;
  _started = true;
  const cfr = setInterval(async () => { await _pollCFR(); _notify(); }, POLL_CFR_MS);
  const bus = setInterval(async () => { await _pollBus(); }, POLL_BUS_MS);
  if (cfr.unref) cfr.unref();
  if (bus.unref) bus.unref();
  // Warm up immediately
  Promise.all([_pollCFR(), _pollBus()]).catch(() => {});
}

// ── Public surface (spec §D) ──────────────────────────────────────────────────
/**
 * getSnapshot() → NerveSnapshot
 * Pull-based read. Starts polling on first call (lazy — doesn't poll
 * if nobody's reading, per §2.3's "all state must be observable" applied
 * to not generating work nobody consumes).
 */
function getSnapshot() {
  _start();
  return _buildSnapshot();
}

/**
 * onChange(fn) → unsubscribeFn
 * Push-based read. fn(NerveSnapshot) called after each CFR poll cycle.
 * Returns an unsubscribe function — callers are responsible for cleaning up.
 */
function onChange(fn) {
  if (typeof fn !== 'function') throw new TypeError('onChange requires a function');
  _start();
  _subscribers.push(fn);
  return () => { _subscribers = _subscribers.filter(s => s !== fn); };
}

/**
 * setRadius(r)
 * The one mutation Nerve exposes. Mutates only Nerve's own local
 * rendering setting (the attention radius), nothing upstream.
 * Per the spec: "settings are first-class — every fluid value has a
 * settings surface" (AXIOMS v3.0 Flexible Principles).
 */
function setRadius(r) {
  if (typeof r !== 'number' || r <= 0) throw new TypeError('setRadius requires a positive number');
  _radius = r;
}

/**
 * setAttentionCenter(x, y)
 * Called by the Expression layer (alk-gl.js pointer-move handler) to
 * update the attention center from mouse coordinates. Not in the spec's
 * primary public surface (that's the three methods above) but needed
 * as the bridge point between the pointer listener (Phase 2) and this
 * data layer. Read-only from outside Nerve's own expression wiring.
 */
function setAttentionCenter(x, y) {
  _attention = { x: +x || 0, y: +y || 0 };
}

module.exports = { getSnapshot, onChange, setRadius, setAttentionCenter };
