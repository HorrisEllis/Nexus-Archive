'use strict';
// lib/node-schemas/resonance_crystal.js — real schema for the second, real
// producer into the shared `crystals` table.
// UUID: nexus-node-schema-resonance-crystal-v1-0000-2026-0911-001
// §NEW 2026-09-11 — memory-architecture pass.
//
// §FRAGMENTATION, CONFIRMED NOT ASSUMED — the existing .crystal schema
// (lib/node-schemas/crystal.js) is grounded ONLY in meta/crystal-lattice.js's
// producer (kind: CREATE_CRYSTAL/CREATE_NEGATIVE_CRYSTAL, pattern_signature,
// success_probability). crystal-lattice.js's own header comment says a
// second producer exists at "cortex/liminal-space/index.js" — that exact
// path does NOT exist in this tree; it only survives under
// _archive/unintegrated/2026-07-branch-b-cortex-v2/cortex/liminal-space/.
// The real, live producer is intelligence/liminal-space/index.js's
// _crystallise() — confirmed by direct read, a completely different field
// set (focalPoint, path, itemCount, avgConfidence, summary — no
// pattern_signature, no success_probability, no failure_boundaries).
//
// Both producers write to the SAME `crystals` table under the SAME .crystal
// extension name today — this schema gives the second, real, previously-
// unschema'd shape its own name rather than forcing one schema to describe
// two genuinely different row shapes. Whether the table itself should split
// (two tables) or stay merged (one table, two schemas, reader dispatches on
// which fields are present) is a real open question — not decided here.

module.exports = {
  status: 'REAL',
  source: 'intelligence/liminal-space/index.js — _crystallise()\'s real jaaDB.insert(\'crystals\', crystal) shape',
  fields: {
    uuid:          { type: 'string', required: true,  description: 'real crystal id' },
    focalPoint:    { type: 'string', required: true,  description: 'real focal point this crystallised from (a liminal-space concept, not a domain/verb pair)' },
    type:          { type: 'string', required: true,  description: 'real item type that triggered crystallisation' },
    path:          { type: 'string', required: true,  description: "how it crystallised — 'evidence_threshold' | 'focal_point_confirmation', per _checkCrystallisation()" },
    itemCount:     { type: 'number', required: true,  description: 'real count of interstitial_spaces items that crystallised together' },
    avgConfidence: { type: 'number', required: true,  description: 'real average confidence across those items' },
    summary:       { type: 'string', required: true,  description: 'real text summary — first 3 items\' text, joined' },
    ts:            { type: 'number', required: true,  description: 'real crystallisation timestamp' },
  },
};
