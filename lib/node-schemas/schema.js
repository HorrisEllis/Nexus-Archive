'use strict';
// lib/node-schemas/schema.js — real schema for the .schema node type
// (a schema describing schemas — this file's own convention).
// UUID: nexus-node-schema-schema-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.
// Content unchanged from the pre-split version — a pure move.

module.exports = {
  status: 'REAL',
  source: 'this file\'s own convention, and hat-forge.js\'s HAT_SCHEMA / loom\'s definitions.js — the real, established shape a NEXUS schema object already takes',
  fields: {
    status: { type: 'string', required: true, description: "'REAL' | 'OPEN'" },
    source: { type: 'string', required: true, description: 'the real file/construction-site this schema is grounded in' },
    fields: { type: 'object', required: true, description: 'field name -> {type, required, description}' },
  },
};
