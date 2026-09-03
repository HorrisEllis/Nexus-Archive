'use strict';
/**
 * lib/schemas/agent.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale. Content unchanged
 * from the original SCHEMAS.agent entry.
 */
module.exports = {
  status: 'REAL',
  source: 'cortex/core/raid/index.js — _agentAvailable()\'s real per-agent health snapshot fields',
  fields: {
    dispatchName:     { type: 'string',  required: true,  description: 'real provider/hat dispatch name' },
    online:           { type: 'boolean', required: true,  description: 'real live reachability' },
    consecutiveFails: { type: 'number',  required: false, description: 'real streak, gates availability at >=3 (or 1 under CFR stress)' },
    callCount:        { type: 'number',  required: false, description: 'real total calls, used to gate successRate at >=5' },
    successRate:      { type: 'number',  required: false, description: 'real 0-1 rate, refuses dispatch below 0.2 once callCount>=5' },
    role:             { type: 'string',  required: false, description: "real role tag — dispatch refused if 'violated'" },
  },
};
