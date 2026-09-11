'use strict';
// lib/node-schemas/lattice_edge.js — real schema for the .lattice_edge
// node type.
// UUID: nexus-node-schema-lattice-edge-v1-0000-2026-0911-001
// §NEW 2026-09-11 — memory-architecture pass ("associative node-based
// lattice" category). Real, ungrounded until now.
//
// §FRAGMENTATION, CONFIRMED — this is ONE of three real, non-unified
// edge/relationship producers found this pass:
//   1. lattice_edges (this schema)            — meta/crystal-lattice.js
//   2. relationship_lattice (.relationship_edge) — meta/lattice/associative-lattice.js
//   3. crystals (.crystal + .resonance_crystal)  — node-level, not edge-level,
//      but the same fragmentation pattern (two producers, one table)
// No unification attempted here — each gets its own real schema, matching
// its own real producer, rather than one schema pretending three things
// are the same shape.

module.exports = {
  status: 'REAL',
  source: 'meta/crystal-lattice.js — _getOrCreateEdge()\'s real jaa.insert(\'lattice_edges\', fresh) shape',
  fields: {
    uuid:                    { type: 'string', required: true,  description: 'real edge id' },
    edgeKey:                 { type: 'string', required: true,  description: "real dedup key, '<from>-><to>'" },
    from:                    { type: 'string', required: true,  description: 'real source node identity — domain/verb only, Concept/CompartmentType-ish, not outcome-specific' },
    to:                      { type: 'string', required: true,  description: 'real target node identity, same convention as from' },
    weight:                  { type: 'number', required: true,  description: 'real edge weight, starts at 0.5' },
    success_rate:            { type: 'number', required: true,  description: 'real running success rate, starts at 0' },
    failure_rate:            { type: 'number', required: true,  description: 'real running failure rate, starts at 0' },
    successCount:            { type: 'number', required: true,  description: 'real raw success count, starts at 0' },
    failureCount:            { type: 'number', required: true,  description: 'real raw failure count, starts at 0' },
    totalCount:              { type: 'number', required: true,  description: 'real raw total count, starts at 0' },
    decay_rate:              { type: 'number', required: true,  description: 'real decay rate applied per tick, from CRYSTAL_FREQUENCY_THRESHOLD-adjacent env config' },
    lastTransitionAt:        { type: 'number', required: false, description: 'real timestamp of the last transition across this edge, null until one occurs' },
    lastTransitionOutcome:   { type: 'string', required: false, description: 'real outcome of the last transition, null until one occurs' },
    createdAt:                { type: 'number', required: true,  description: 'real creation timestamp' },
    updatedAt:                { type: 'number', required: true,  description: 'real last-update timestamp' },
  },
};
