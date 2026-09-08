'use strict';
// lib/node-schemas/framework.js — real schema for the .framework node type.
// UUID: nexus-node-schema-framework-v1-0000-2026-0907-001
//
// §RESTORED 2026-09-08 — this file (and toolbox.js, generate-tool-nodes.js,
// the 85 real .tool files) was lost when this session adopted a newer,
// further-advanced parallel-session tree — the framework/toolbox work
// branched before that tree existed. James re-requested this exact
// feature directly, confirming it wasn't speculative. Grounded in
// intelligence/framework-builder.js's own real drop() — which already
// wrote a metadata sidecar (uuid, name, description, agent, tags,
// createdAt) next to the generated .js skeleton, just as a plain
// `.tags.json` file instead of the same real node-export convention
// every other node type already uses.

module.exports = {
  status: 'REAL',
  source: 'intelligence/framework-builder.js\'s drop() — real metadata already written per generated framework, reshaped into the real node-export convention',
  fields: {
    uuid:        { type: 'string', required: true,  description: 'real uuid, matches the generated .js skeleton\'s own filename suffix' },
    name:        { type: 'string', required: true,  description: 'real framework name — the safeName used for both the .js file and the createXxx() function' },
    description: { type: 'string', required: false, description: 'real, user/agent-supplied description' },
    agent:       { type: 'string', required: false, description: 'which real agent asked for this framework to be built' },
    tags:        { type: 'array',  required: false, description: 'real tags — always includes framework/warp/generated plus any caller-supplied ones' },
    codePath:    { type: 'string', required: true,  description: 'real, relative path to the generated .js skeleton this node describes' },
    createdAt:   { type: 'number', required: true,  description: 'real timestamp' },
  },
};
