'use strict';
// lib/node-schemas/cos.js — real schema for the .cos node type.
// UUID: nexus-node-schema-cos-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.
// Content unchanged from the pre-split version — a pure move.

module.exports = {
  status: 'REAL',
  source: 'cos/kernel.js — the real Compartment class constructor',
  fields: {
    id:        { type: 'string', required: true,  description: 'real, unique compartment id' },
    name:      { type: 'string', required: false, description: 'real human-readable name, defaults to id' },
    axioms:    { type: 'array',  required: true,  description: '1-5 real identity-defining invariant strings' },
    llmConfig: { type: 'object', required: false, description: 'real {model, host, port} for Ollama' },
  },
};
