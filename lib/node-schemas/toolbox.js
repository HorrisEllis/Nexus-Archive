'use strict';
// lib/node-schemas/toolbox.js — real schema for the .toolbox node type.
// UUID: nexus-node-schema-toolbox-v1-0000-2026-0907-001
//
// §RESTORED 2026-09-08 — lost in an earlier tree-switch this session,
// James re-requested this exact feature directly. Grounded in
// lib/agent-tools/index.js's real TOOLS registry (85 real tools at
// generation time) — all 4 real agents currently share ONE universal
// registry, no per-agent split exists yet, so each real .toolbox node
// lists the same real tool set today. A real, genuine, separate index
// per agent regardless.

module.exports = {
  status: 'REAL',
  source: 'lib/agent-tools/generate-tool-nodes.js — real, live TOOLS registry (lib/agent-tools/index.js) at generation time',
  fields: {
    agent:     { type: 'string', required: true, description: 'real agent or system this toolbox belongs to (claude/chatgpt/gemini/perplexity today)' },
    tools:     { type: 'array',  required: true, description: 'real array of {name, uuid} — uuid points at that tool\'s own real .tool node file' },
    toolCount: { type: 'number', required: true, description: 'real count, matches tools.length' },
  },
};
