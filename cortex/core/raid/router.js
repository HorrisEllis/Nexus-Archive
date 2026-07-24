'use strict';
/**
 * cortex/core/raid/router.js — RAID as the universal entry point
 * UUID: nexus-raid-router-v1-0000-2026-0721-001
 * Version: 1.0.0
 *
 * "The start point doesn't matter, as long as it goes to RAID." (James)
 *
 * Any surface — Co-pilot, a UI, the CLI, an SSE flow — emits ONE event:
 *   raid.route.request  { envelope }
 * The router resolves which system fulfills it (via the live capability-
 * registry, Phase B — so targets are hot-swappable: swap the provider, the
 * registry re-announces, RAID routes to the new one, no surface changes),
 * stamps the envelope, and emits:
 *   raid.route.decided  { envelope }   ← target system subscribes to this
 * The target fulfills and emits:
 *   raid.route.fulfilled { envelope }  ← surface hears the answer over SSE
 * or raid.route.failed / raid.route.no_route.
 *
 * Nothing holds a hard pointer to a fulfilling system. RAID resolves the
 * target dynamically at route time. Cortex logs every event (wildcard bus
 * subscriber), so the envelope's trail + the event log together are the
 * "input → tagged → output, every hop logged" ledger.
 *
 * This is a NEW decision path — it does not touch _decide()'s existing
 * provider selection (ollama/claude/etc). RAID now decides two things:
 * which AI agent (existing) and which SYSTEM fulfills a request (this).
 *
 * §14.4 — no loop: the router consumes raid.route.request and emits
 * raid.route.decided; it does NOT consume its own emissions. Fulfilled/failed
 * come from the target, not the router.
 */

const envelopeLib = require('./envelope');

const MODULE_ID = 'cortex/core/raid/router';
const VERSION = '1.0.0';
const { STATUS } = envelopeLib;

let _bus = null;
let _capabilityRegistry = null;

/**
 * _resolveTarget(envelope) — which system fulfills this? Pure given the
 * registry state. Explicit capability wins; otherwise match intent against
 * the live registry (grammar/description/id). Returns { system, capability }
 * or null. The namespace of a capability id IS its owning system
 * (e.g. 'idearium.spec.create' → idearium), matching component-registry's
 * own convention — no separate system-mapping table (§10.1).
 */
function _resolveTarget(envelope) {
  if (!_capabilityRegistry) return null;

  if (envelope.capability) {
    const hit = _capabilityRegistry.capabilities().find(c => c.name === envelope.capability);
    if (hit) return { system: hit.namespace, capability: hit.name };
    return null;
  }

  const resolved = _capabilityRegistry.resolve(envelope.intent);
  if (!resolved.found || !resolved.capabilities.length) return null;
  const top = resolved.capabilities[0];
  return { system: top.namespace, capability: top.name };
}

function _onRouteRequest(event) {
  const envelope = event?.payload?.envelope;
  if (!envelopeLib.isValid(envelope)) {
    console.warn(`[${MODULE_ID}] raid.route.request with invalid envelope — ignored (§1.2: named, not silently dropped)`);
    return;
  }

  const target = _resolveTarget(envelope);
  if (!target) {
    const dead = envelopeLib.stamp(envelope, MODULE_ID, STATUS.NO_ROUTE,
      { note: `no system provides "${envelope.intent}"` });
    if (_bus) _bus.emit('raid.route.no_route', { envelope: dead }, { source: MODULE_ID, causedBy: envelope.envelopeId });
    return;
  }

  const routed = envelopeLib.stamp(envelope, MODULE_ID, STATUS.ROUTED,
    { target: target.system, note: `→ ${target.system} via ${target.capability}` });
  // The target system subscribes to raid.route.decided and checks
  // envelope.target === its own system id. Fully decoupled: RAID names the
  // target, it doesn't call it.
  if (_bus) _bus.emit('raid.route.decided', { envelope: routed, capability: target.capability },
    { source: MODULE_ID, causedBy: envelope.envelopeId });
}

/**
 * fulfill(envelope, result, opts) — helper a target system calls to report
 * completion. Stamps FULFILLED (or FAILED) and emits, so the surface hears
 * the answer. Exported so any system can use it without reimplementing the
 * envelope/emit dance (§5.6 structural self-similarity).
 */
function fulfill(envelope, result, opts = {}) {
  const failed = opts.failed === true;
  const done = envelopeLib.stamp(envelope, opts.system || envelope.target || 'unknown',
    failed ? STATUS.FAILED : STATUS.FULFILLED,
    { result, note: opts.note });
  if (_bus) _bus.emit(failed ? 'raid.route.failed' : 'raid.route.fulfilled',
    { envelope: done }, { source: opts.system || 'unknown', causedBy: envelope.envelopeId });
  return done;
}

/**
 * route(intent, opts) — convenience for a surface: build an envelope and
 * fire it at RAID in one call. Returns the envelope (its id lets the surface
 * correlate the eventual raid.route.fulfilled over SSE).
 */
function route(intent, opts = {}) {
  const envelope = envelopeLib.make(intent, opts);
  if (_bus) _bus.emit('raid.route.request', { envelope }, { source: opts.from || 'surface' });
  return envelope;
}

function health() {
  return {
    ok: true, module: MODULE_ID, version: VERSION,
    busWired: !!_bus, registryWired: !!_capabilityRegistry,
  };
}

function init(cfg = {}) {
  _bus = cfg.bus || null;
  _capabilityRegistry = cfg.capabilityRegistry || null;
  if (_bus) _bus.on('raid.route.request', _onRouteRequest);
  console.log(`[${MODULE_ID}] v${VERSION} — universal entry point active${_bus ? ' (bus-wired)' : ' (no bus — test mode)'}`);
  return { ok: true };
}

function stop() {
  if (_bus) _bus.off('raid.route.request', _onRouteRequest);
  _bus = null;
}

module.exports = { MODULE_ID, VERSION, init, stop, health, route, fulfill, _resolveTarget, _onRouteRequest };
