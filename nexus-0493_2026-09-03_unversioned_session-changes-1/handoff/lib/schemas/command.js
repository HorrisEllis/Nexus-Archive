'use strict';
/**
 * lib/schemas/command.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.command entry.
 */
module.exports = {
  status: 'REAL',
  source: 'clear-glass/src/ipc/bridge.js — _buildCommandIndex()\'s real, live-introspected route entries',
  fields: {
    method: { type: 'string', required: true, description: "real HTTP method, e.g. 'GET'" },
    path:   { type: 'string', required: true, description: 'real route path, introspected from Express\'s own route table, never hand-maintained' },
  },
};
