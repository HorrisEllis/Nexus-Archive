'use strict';
/**
 * loom/schema/definitions.js — LOOM Phase 131: component/seam/hook/wire schema
 * comp_id: nexus.loom.schema
 * UUID: nexus-loom-schema-v1-0000-2026-0701-jamesbrooks-001
 * Spec source: NEXUS-LATTICE-COGNITION-ROADMAP-v0.2.md, phase-map entry 131
 * Status: schema/config layer — step 1 of 5 in the stated build order
 *         (schema/config -> CLI -> API -> interaction contract -> UI).
 *         Nothing past step 1 exists yet. This file IS step 1.
 *
 * Four primitives, matching the four nouns you named. Each mirrors the
 * shape architect/registry-components.js already uses for its own
 * per-component declarations (id, namespace, version, tags) so LOOM
 * doesn't invent a fifth convention next to Architect's existing one.
 *
 * Wire "type" is intentionally an open string, not a closed enum — per
 * the Architect spec's own authorial intent: "type (api, event bus,
 * callto, direct and any invention you can think of, like webserver.)"
 * KNOWN_HOOK_TYPES below is a *seed list*, not a ceiling. New types are
 * added by registering them, not by editing an enum.
 */

// ── Known hook/wire types — seed list, extensible, never closed ────────────
const KNOWN_HOOK_TYPES = Object.freeze([
  'api',        // REST/HTTP surface
  'event_bus',  // pub/sub, SSE fanout
  'callto',     // direct function/method invocation across a boundary
  'direct',     // in-process direct reference, no boundary crossing
  'webserver',  // a hook that itself serves, not just calls
  'cli',        // command-line surface
]);

// ── Component — a named, versioned unit of the system ──────────────────────
// Mirrors architect/registry-components.js's _c() shape.
const COMPONENT_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'namespace', 'name', 'version'],
  types: {
    id: 'string', namespace: 'string', name: 'string', version: 'string',
  },
  // uuid is required too, but enforced by the loom.uuid-present Axiom,
  // not duplicated here — see axioms.js. Two mechanisms guarding one
  // field means the first one to run silently decides the reason code;
  // the Axiom runs first in driver.js, so it's the single authority.
});

// ── Seam — a named boundary a component exposes or crosses ─────────────────
// "Seam" here means what it means across the rest of NEXUS's own docs
// (grep hits in cortex/guardian/bridge hook files, per phase 61's note
// on backfilling seam.componentIds) — a declared crossing point, not a
// synonym for hook. A hook is *how* you cross it; a seam is *that* a
// crossing point exists and which component owns it.
const SEAM_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'component_id', 'name', 'kind'],
  types: {
    id: 'string', component_id: 'string', name: 'string', kind: 'string',
  },
  // kind: 'ingress' | 'egress' | 'bidirectional' — checked by axiom,
  // not baked into the type table (Gate.schema only checks JS typeof).
  // uuid enforced by loom.uuid-present Axiom, same reasoning as above.
});

// ── Hook — a named, typed wire endpoint on one component ───────────────────
// Directly the Architect spec's own primitive: "a named, typed wire
// between two system surfaces." A hook is one end of that; a wire (below)
// is the pairing of two hooks.
const HOOK_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'component_id', 'name', 'type', 'direction'],
  types: {
    id: 'string', component_id: 'string', name: 'string',
    type: 'string', direction: 'string',
  },
  // direction: 'in' | 'out' | 'bidirectional'. uuid — see note above.
});

// ── Wire — the connection between exactly two hooks ─────────────────────────
const WIRE_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'from_hook_id', 'to_hook_id'],
  types: {
    id: 'string', from_hook_id: 'string', to_hook_id: 'string',
  },
  // uuid — see note above.
});

module.exports = {
  KNOWN_HOOK_TYPES,
  COMPONENT_SCHEMA,
  SEAM_SCHEMA,
  HOOK_SCHEMA,
  WIRE_SCHEMA,
};
