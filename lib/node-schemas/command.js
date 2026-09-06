'use strict';
// lib/node-schemas/command.js — real schema for the .command node type.
// UUID: nexus-node-schema-command-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.
// Content unchanged from the pre-split version — a pure move.

module.exports = {
  status: 'REAL',
  source: 'clear-glass/src/ipc/bridge.js — _buildCommandIndex()\'s real, live-introspected route entries',
  fields: {
    method: { type: 'string', required: true, description: "real HTTP method, e.g. 'GET'" },
    path:   { type: 'string', required: true, description: 'real route path, introspected from Express\'s own route table, never hand-maintained' },
  },
};
