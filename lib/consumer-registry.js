'use strict';
/**
 * lib/consumer-registry.js — the consumer side of the registry (§8.5)
 * UUID: nexus-lib-consumer-registry-v1-0000-2026-0724-001
 * Version: 1.0.0
 *
 * §8.5 mandates "using the hook and wire registry with CONSUMERS and context
 * to map the system completely." The registry has always recorded what
 * PROVIDES. Nothing recorded who CONSUMES. That asymmetry is why "what's
 * actually wired?" has been re-grepped by hand every session instead of being
 * a question the system can answer about itself.
 *
 * §8.4 SCAN BEFORE BUILD — what the scan actually found, measured not assumed:
 *   - hook_bindings: EMPTY. wire() exists and works, but is reachable ONLY
 *     from loom's HTTP route (loom/server.js:239). Nothing calls it
 *     automatically. Live boot 2026-07-24: 230 hooks, 0 bindings.
 *   - component.events: the field exists on all 217 components and is
 *     populated on ZERO of them. The schema has the slot; nothing fills it.
 *   - event_log: 738 real events across 15 distinct sources. REAL DATA.
 *   - nexus-bus on(type, fn): subscribers are observable at runtime.
 *
 * So relationships are NOT declared anywhere — but they ARE observable.
 * This registry therefore DERIVES the consumer graph from what the system
 * actually did, rather than from declarations that would immediately drift
 * (§13.4 — the map must match the territory; a hand-maintained wiring list
 * is a second truth layer waiting to diverge, §10.3).
 *
 * Two sources, both real:
 *   PRODUCERS — mined from event_log (source → event type it emitted)
 *   CONSUMERS — read from the live bus (event type → subscriber count)
 *
 * §1.2 — where a relationship cannot be observed, this says so. It never
 * infers a wire it did not see. An empty result means "not observed yet,"
 * which is reported as exactly that, never as "nothing consumes this."
 */

const MODULE_ID = 'lib/consumer-registry';
const VERSION = '1.0.0';

let _jaa = null;
let _bus = null;

function init(cfg = {}) {
  _jaa = cfg.jaa || null;
  _bus = cfg.bus || null;
  return { ok: true, module: MODULE_ID, version: VERSION };
}

/**
 * producers(limit) — who emits what, mined from the real event log.
 * Returns Map-shaped array: [{ source, eventTypes:[{type,count}], total }]
 */
function producers(limit = 5000) {
  if (!_jaa) return [];
  let rows;
  try { rows = _jaa.query('event_log', () => true, limit) || []; }
  catch (e) { console.warn(`[${MODULE_ID}] event_log unreadable: ${e.message}`); return []; }

  const bySource = new Map();
  for (const r of rows) {
    const src = r.source || 'unknown';
    const type = r.type || 'unknown';
    if (!bySource.has(src)) bySource.set(src, new Map());
    const types = bySource.get(src);
    types.set(type, (types.get(type) || 0) + 1);
  }
  return [...bySource.entries()].map(([source, types]) => ({
    source,
    eventTypes: [...types.entries()].map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    total: [...types.values()].reduce((s, n) => s + n, 0),
  })).sort((a, b) => b.total - a.total);
}

/**
 * consumers(eventType) — how many live subscribers a type has, from the real
 * bus. Returns null (not 0) when the bus isn't available, because "unknown"
 * and "nobody" are different answers and conflating them is how a dormant
 * module gets mistaken for a healthy one (§1.2).
 */
function consumers(eventType) {
  if (!_bus || typeof _bus.listenerCount !== 'function') return null;
  try { return _bus.listenerCount(eventType); }
  catch (_) { return null; }
}

/**
 * unconsumed() — event types that are PRODUCED but have no live subscriber.
 * This is the real "emitted into the void" list: work the system does whose
 * result nothing receives. Distinct from an unregistered hook — this is
 * observed behaviour, not a declaration gap.
 * Returns [] with observed:false when the bus is unavailable, rather than
 * claiming everything is unconsumed.
 */
function unconsumed(limit = 5000) {
  const canObserve = !!(_bus && typeof _bus.listenerCount === 'function');
  if (!canObserve) return { observed: false, reason: 'no live bus — subscriber counts unobservable', types: [] };

  const seen = new Set();
  for (const p of producers(limit)) for (const t of p.eventTypes) seen.add(t.type);

  const types = [];
  for (const type of seen) {
    const n = consumers(type);
    if (n === 0) types.push(type);
  }
  return { observed: true, producedTypes: seen.size, types: types.sort() };
}

/**
 * graph() — the bidirectional map §8.5 asks for, from observed data only.
 */
function graph(limit = 5000) {
  const prod = producers(limit);
  const edges = [];
  for (const p of prod) {
    for (const t of p.eventTypes) {
      edges.push({ from: p.source, eventType: t.type, count: t.count, subscribers: consumers(t.type) });
    }
  }
  return {
    sources: prod.length,
    edges,
    unconsumed: unconsumed(limit),
    note: 'Derived from observed runtime behaviour (event_log + live bus), not from declarations. Absence of an edge means "not observed", never "does not exist".',
  };
}

function health() {
  return {
    ok: true, module: MODULE_ID, version: VERSION,
    jaaWired: !!_jaa,
    busWired: !!_bus,
    canObserveConsumers: !!(_bus && typeof _bus.listenerCount === 'function'),
  };
}

module.exports = { MODULE_ID, VERSION, init, producers, consumers, unconsumed, graph, health };
