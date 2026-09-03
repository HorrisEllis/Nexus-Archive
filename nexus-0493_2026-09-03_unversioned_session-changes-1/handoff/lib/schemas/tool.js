'use strict';
/**
 * lib/schemas/tool.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.tool entry.
 */
module.exports = {
  status: 'REAL',
  source: 'lib/agent-tools/tools/**/*.js — the real, universal tool export shape (checked against read-file.js)',
  fields: {
    name:        { type: 'string', required: true, description: 'real, unique tool name agents call by' },
    description: { type: 'string', required: true, description: 'real, model-facing description' },
    parameters:  { type: 'object', required: true, description: 'real JSON-schema-shaped {type, properties, required}' },
    execute:     { type: 'any',    required: true, description: 'the real async function — not serializable, present only in-process' },
  },
};
