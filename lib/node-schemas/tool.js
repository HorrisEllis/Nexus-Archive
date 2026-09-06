'use strict';
// lib/node-schemas/tool.js — real schema for the .tool node type.
// UUID: nexus-node-schema-tool-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.
// Content unchanged from the pre-split version — a pure move.

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
