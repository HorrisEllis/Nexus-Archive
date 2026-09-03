'use strict';
/**
 * lib/schemas/crystal.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.crystal entry.
 */
module.exports = {
  status: 'REAL',
  source: 'meta/crystal-lattice.js — _maybeCrystallize()\'s real crystal record',
  fields: {
    uuid:                          { type: 'string', required: true, description: 'real crystal id' },
    kind:                          { type: 'string', required: true, description: "'CREATE_CRYSTAL' | 'CREATE_NEGATIVE_CRYSTAL'" },
    pattern_signature:             { type: 'string', required: true, description: 'the real pattern key this crystallized from' },
    entry_conditions:              { type: 'object', required: true, description: '{domain, verb, risk_ceiling}' },
    exit_conditions:               { type: 'object', required: true, description: '{outcome}' },
    success_probability:           { type: 'number', required: true, description: '1.0 for positive, 0.0 for negative crystals' },
    failure_boundaries:            { type: 'array',  required: true, description: 'real outcome kinds this crystal fails on' },
    support_paths:                 { type: 'array',  required: true, description: 'real compartment ids that support this crystal' },
    usage_count:                   { type: 'number', required: true, description: 'real usage counter' },
    pattern_frequency_at_creation: { type: 'number', required: true, description: 'real frequency count at the moment of crystallization' },
  },
};
