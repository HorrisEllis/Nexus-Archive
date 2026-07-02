'use strict';
/**
 * loom/schema/gates.js — Warp Gates for LOOM's four declaration types.
 * comp_id: nexus.loom.gates
 * UUID: nexus-loom-gates-v1-0000-2026-0701-jamesbrooks-001
 *
 * Each Gate is pure per Warp's design law: matches(event) -> bool,
 * transform(event) -> Event[]. No disk I/O, no registry mutation here —
 * that happens in driver.js, after a Gate's output is known. A Gate
 * only ever answers "is this declaration structurally valid," never
 * "does this collide with something already registered" (that needs
 * registry state, which is what the Axioms in axioms.js are for —
 * Axiom.check explicitly receives streamState, Gate.transform does not).
 */
const { Gate, Event } = require('../../warp/core');
const {
  COMPONENT_SCHEMA, SEAM_SCHEMA, HOOK_SCHEMA, WIRE_SCHEMA, KNOWN_HOOK_TYPES,
} = require('./definitions');

function _rejectEvent(kind, event, validation, extraReason) {
  return new Event(`loom.${kind}.rejected`, {
    input: event.data,
    missing: validation.missing,
    wrongType: validation.wrongType,
    reason: extraReason || 'schema validation failed',
  });
}

// ── component.declare ───────────────────────────────────────────────────────
const componentDeclareGate = new Gate('loom.component.declare', {
  schema: COMPONENT_SCHEMA,
  transform(event) {
    const v = componentDeclareGate.validateOutput(event.data);
    if (!v.ok) return [_rejectEvent('component', event, v)];
    return [new Event('loom.component.registered', { ...event.data })];
  },
});

// ── seam.declare ─────────────────────────────────────────────────────────────
const VALID_SEAM_KINDS = Object.freeze(['ingress', 'egress', 'bidirectional']);
const seamDeclareGate = new Gate('loom.seam.declare', {
  schema: SEAM_SCHEMA,
  transform(event) {
    const v = seamDeclareGate.validateOutput(event.data);
    if (!v.ok) return [_rejectEvent('seam', event, v)];
    if (!VALID_SEAM_KINDS.includes(event.data.kind)) {
      return [_rejectEvent('seam', event, { missing: [], wrongType: [] },
        `kind must be one of ${VALID_SEAM_KINDS.join('|')}, got '${event.data.kind}'`)];
    }
    return [new Event('loom.seam.registered', { ...event.data })];
  },
});

// ── hook.declare ─────────────────────────────────────────────────────────────
const VALID_DIRECTIONS = Object.freeze(['in', 'out', 'bidirectional']);
const hookDeclareGate = new Gate('loom.hook.declare', {
  schema: HOOK_SCHEMA,
  transform(event) {
    const v = hookDeclareGate.validateOutput(event.data);
    if (!v.ok) return [_rejectEvent('hook', event, v)];
    if (!VALID_DIRECTIONS.includes(event.data.direction)) {
      return [_rejectEvent('hook', event, { missing: [], wrongType: [] },
        `direction must be one of ${VALID_DIRECTIONS.join('|')}, got '${event.data.direction}'`)];
    }
    // type is open-ended (KNOWN_HOOK_TYPES is a seed list) — a type
    // outside the seed list is not rejected, it's flagged for the
    // caller to consciously register as new, per the Architect spec's
    // "any invention you can think of" clause.
    const novel = !KNOWN_HOOK_TYPES.includes(event.data.type);
    return [new Event('loom.hook.registered', { ...event.data, novelType: novel })];
  },
});

// ── wire.declare ─────────────────────────────────────────────────────────────
const wireDeclareGate = new Gate('loom.wire.declare', {
  schema: WIRE_SCHEMA,
  transform(event) {
    const v = wireDeclareGate.validateOutput(event.data);
    if (!v.ok) return [_rejectEvent('wire', event, v)];
    if (event.data.from_hook_id === event.data.to_hook_id) {
      return [_rejectEvent('wire', event, { missing: [], wrongType: [] },
        'from_hook_id and to_hook_id must differ (no self-wire)')];
    }
    return [new Event('loom.wire.registered', { ...event.data })];
  },
});

module.exports = {
  componentDeclareGate, seamDeclareGate, hookDeclareGate, wireDeclareGate,
};
