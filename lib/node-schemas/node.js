'use strict';
// lib/node-schemas/node.js — real schema for the generic .node type (a
// loom graph node: component | hook | wire).
// UUID: nexus-node-schema-node-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.

module.exports = {
  status: 'REAL',
  source: 'loom/schema/definitions.js — a generic loom graph node is one of component|hook|wire; this schema is the union',
  fields: {
    kind:         { type: 'string', required: true,  description: "'component' | 'hook' | 'wire' — which real loom declare() this node is" },
    id:           { type: 'string', required: true,  description: 'real id, meaning depends on kind' },
    component_id: { type: 'string', required: false, description: 'present on hook nodes only' },
    from_hook_id: { type: 'string', required: false, description: 'present on wire nodes only' },
    to_hook_id:   { type: 'string', required: false, description: 'present on wire nodes only' },
    direction:    { type: 'string', required: false, description: "hook only — 'in' | 'out' | 'bidirectional'" },
  },
};
