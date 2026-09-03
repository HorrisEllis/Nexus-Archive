'use strict';
/**
 * lib/schemas/model.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.model entry.
 */
module.exports = {
  status: 'REAL',
  source: 'ollama/config.js — the one real place model tags live (DEFAULT_MODEL/FALLBACK_MODEL)',
  fields: {
    tag:  { type: 'string', required: true,  description: 'a real, verified Ollama model tag, e.g. "mistral:7b-instruct-q4_K_M"' },
    role: { type: 'string', required: false, description: "'default' | 'fallback' — which real config slot this fills" },
    envVar: { type: 'string', required: false, description: 'the real env var that overrides this tag, if any' },
  },
};
