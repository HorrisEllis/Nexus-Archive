'use strict';
// lib/node-schemas/model.js — real schema for the .model node type.
// UUID: nexus-node-schema-model-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.
// Content unchanged from the pre-split version — a pure move.

module.exports = {
  status: 'REAL',
  source: 'ollama/config.js — the one real place model tags live (DEFAULT_MODEL/FALLBACK_MODEL)',
  fields: {
    tag:    { type: 'string', required: true,  description: 'a real, verified Ollama model tag, e.g. "mistral:7b-instruct-q4_K_M"' },
    role:   { type: 'string', required: false, description: "'default' | 'fallback' — which real config slot this fills" },
    envVar: { type: 'string', required: false, description: 'the real env var that overrides this tag, if any' },
  },
};
