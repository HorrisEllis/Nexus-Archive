'use strict';
// lib/node-schemas/relationship_edge.js — real schema for the
// .relationship_edge node type.
// UUID: nexus-node-schema-relationship-edge-v1-0000-2026-0911-001
// §NEW 2026-09-11 — memory-architecture pass. The third of the real,
// non-unified lattice/edge producers found this pass (see lattice_edge.js's
// header for the other two). Deliberately kept as its own schema, not
// merged with .lattice_edge — this one is held state (one row per directed
// pair, upserted) where lattice_edge is running counters; the nodes here
// are systems/users/sessions, not concepts. Different producer, different
// update discipline, different node identity — a real, not superficial,
// difference.
//
// §PATH NOTE — this file's own header comment (as of this pass) says
// "meta/lattice/associative-lattice.js", but it physically lives at
// intelligence/lattice/associative-lattice.js. Flagging, not fixing here —
// out of scope for a schema pass, real enough to note so it doesn't get
// re-discovered as new.

module.exports = {
  status: 'REAL',
  source: 'intelligence/lattice/associative-lattice.js — updateEdge()\'s real cortexWrite.insert(TABLE, row) shape, TABLE = \'relationship_lattice\'',
  fields: {
    id:         { type: 'string', required: true,  description: 'real dedup key, "<from>::<to>" — one row per directed pair, upserted on update' },
    from:       { type: 'string', required: true,  description: 'real source identity — system name today (e.g. "guardian"); spec extends to users/sessions later, not yet restricted in code' },
    to:         { type: 'string', required: true,  description: 'real target identity, same convention as from' },
    field:      { type: 'object', required: true,  description: 'real CFR field snapshot: {coherence, friction, resonance, entropy}' },
    sigma:      { type: 'number', required: true,  description: 'real derived stress-vs-calm score, (friction+entropy)/2 minus 0.3*(coherence+resonance)/2 + 0.3, clamped 0-1' },
    regime:     { type: 'string', required: true,  description: 'real regime label from the field snapshot' },
    updated_at: { type: 'number', required: true,  description: 'real last-update timestamp' },
    fractal:    { type: 'object', required: true,  description: 'real, currently always {detected: false, period_ms: null, occurrences: 0} — fractal detection needs per-edge delta history not yet wired (§NOT BUILT YET in source)' },
  },
};
