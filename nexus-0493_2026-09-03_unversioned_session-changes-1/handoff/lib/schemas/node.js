'use strict';
/**
 * lib/schemas/node.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.node entry.
 */
module.exports = {
  status: 'REAL',
  source: 'loom/schema/definitions.js — a generic loom graph node is one of component|hook|wire; this schema is the union',
  fields: {
    kind:            { type: 'string', required: true, description: "'component' | 'hook' | 'wire' — which real loom declare() this node is" },
    id:              { type: 'string', required: true, description: 'real id, meaning depends on kind' },
    component_id:    { type: 'string', required: false, description: 'present on hook nodes only' },
    from_hook_id:    { type: 'string', required: false, description: 'present on wire nodes only' },
    to_hook_id:      { type: 'string', required: false, description: 'present on wire nodes only' },
    direction:       { type: 'string', required: false, description: "hook only — 'in' | 'out' | 'bidirectional'" },
  },
};
