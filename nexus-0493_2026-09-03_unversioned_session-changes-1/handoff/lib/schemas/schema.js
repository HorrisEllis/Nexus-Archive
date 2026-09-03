'use strict';
/**
 * lib/schemas/schema.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.schema entry (the meta-schema describing what
 * shape every file in this directory itself takes).
 */
module.exports = {
  status: 'REAL',
  source: 'this file\'s own convention, and hat-forge.js\'s HAT_SCHEMA / loom\'s definitions.js — the real, established shape a NEXUS schema object already takes',
  fields: {
    status: { type: 'string', required: true, description: "'REAL' | 'OPEN'" },
    source: { type: 'string', required: true, description: 'the real file/construction-site this schema is grounded in' },
    fields: { type: 'object', required: true, description: 'field name -> {type, required, description}' },
  },
};
