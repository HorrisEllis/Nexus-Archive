'use strict';
/**
 * lib/schemas/ledger.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.ledger entry.
 */
module.exports = {
  status: 'REAL',
  source: 'lib/component-ledger.js — write()\'s real parameters/row shape',
  fields: {
    system:       { type: 'string', required: true,  description: 'real system name — refused if missing (§1.1)' },
    component:    { type: 'string', required: true,  description: 'real component name — refused if missing' },
    action:       { type: 'string', required: true,  description: 'real action taken — refused if missing' },
    status:       { type: 'string', required: false, description: "defaults to 'info'" },
    tags:         { type: 'array',  required: false, description: 'real tags, defaults to []' },
    detail:       { type: 'any',    required: false, description: 'real free-form detail' },
    causedBy:     { type: 'string', required: false, description: 'real causal chain reference' },
    contractUuid: { type: 'string', required: false, description: 'real RAID contract this ledger entry traces to' },
    session:      { type: 'string', required: false, description: 'real session id' },
  },
};
