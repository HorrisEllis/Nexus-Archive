'use strict';
// lib/node-schemas/interstitial_space.js — real schema for the
// .interstitial_space node type.
// UUID: nexus-node-schema-interstitial-space-v1-0000-2026-0911-001
// §NEW 2026-09-11 — memory-architecture pass.
// Real, ungrounded until now: the `interstitial_spaces` table is the real
// holding area BEFORE crystallisation — every resonance_crystal is built
// FROM a set of these. hold() writes one per real observation; _crystallise()
// marks the ones that graduated (crystallised: true) rather than deleting
// them, matching §2.1/§0.3 (persistence, nothing lost) — same discipline as
// .crystal/.pat's own raw-vs-derived split, one level earlier in the pipeline.

module.exports = {
  status: 'REAL',
  source: 'intelligence/liminal-space/index.js — hold()\'s real jaaDB.insert(\'interstitial_spaces\', record) shape',
  fields: {
    uuid:        { type: 'string',  required: true,  description: 'real record id' },
    focalPoint:  { type: 'string',  required: true,  description: 'real focal point this observation was held under' },
    source:      { type: 'string',  required: false, description: "who/what produced it, defaults to 'system'" },
    text:        { type: 'string',  required: true,  description: 'real observation text — falls back to item.description, then a truncated JSON.stringify of the whole item' },
    type:        { type: 'string',  required: false, description: "real item type, defaults to 'observation'" },
    confidence:  { type: 'number',  required: false, description: 'real confidence, defaults to 0' },
    count:       { type: 'number',  required: false, description: 'real occurrence count, defaults to 1' },
    causedBy:    { type: 'string',  required: false, description: 'real causal chain reference, if any' },
    resolved:    { type: 'boolean', required: true,  description: 'always false at write time — set true elsewhere when the item is resolved without crystallising' },
    dissolvedAt: { type: 'number',  required: false, description: 'real dissolution timestamp, null until dissolved' },
    velocity:    { type: 'number',  required: true,  description: 'real focal-point velocity at hold time — a property of the space, snapshotted onto the item' },
    ts:          { type: 'number',  required: true,  description: 'real hold timestamp' },
    meta:        { type: 'object',  required: false, description: 'real free-form metadata, defaults to {}' },
    crystallised:   { type: 'boolean', required: false, description: 'set true by _crystallise() when this item graduates into a resonance_crystal' },
    crystallisedAt: { type: 'number',  required: false, description: 'set by _crystallise() at graduation time' },
  },
};
