'use strict';
// lib/node-schemas/macro.js — real schema for the .macro node type.
// UUID: nexus-node-schema-macro-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.
// Content unchanged from the pre-split version — a pure move.

module.exports = {
  status: 'REAL',
  source: 'lib/agent-tools/tools/clear-glass/macro.js — the real macro record (create action), James: "clear-glass: .macro" pointed here directly',
  fields: {
    uuid:        { type: 'string', required: true,  description: 'real macro id' },
    name:        { type: 'string', required: true,  description: 'real macro name' },
    urlPattern:  { type: 'string', required: false, description: 'real glob ("*") pattern the current page must match before running' },
    steps:       { type: 'array',  required: true,  description: 'real [{action, data}] or [{engine:"erosmancer", action, targetUuid, data}] — each a real, valid browser_action name' },
    params:      { type: 'array',  required: false, description: 'real named parameters a caller fills in per run' },
    profile:     { type: 'string', required: false, description: "one of 'precise'|'cautious'|'exploratory'|'turbo' — erosmancer behavior profile, or null for its own adaptive pick" },
    description: { type: 'string', required: false, description: 'real, optional human description' },
    createdAt:   { type: 'number', required: true,  description: 'real creation timestamp' },
    runCount:    { type: 'number', required: true,  description: 'real run counter, starts at 0' },
    lastRunAt:   { type: 'any',    required: false, description: 'real timestamp of last run, null until first run' },
  },
};
