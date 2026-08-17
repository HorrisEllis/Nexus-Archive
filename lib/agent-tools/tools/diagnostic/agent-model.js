'use strict';
/**
 * lib/agent-tools/tools/diagnostic/agent-model.js — agent_model tool
 * UUID: nexus-tool-agent-model-v1-0000-2026-0815-jamesbrooks-001
 * §WIRED 2026-08-15 — wraps lib/agent-model.js (AM1). See that module's
 * own header for the real signals it composes.
 */
const am = require('../../../agent-model.js');

const ACTIONS = {
  sync: (a) => { if (!a.agentId) return { error: 'sync needs agentId' }; return am.sync(a.agentId); },
  fitness: (a) => { if (!a.agentId || !a.actionType) return { error: 'fitness needs agentId and actionType' }; return am.getFitness(a.agentId, a.actionType); },
};

module.exports = {
  name: 'agent_model',
  description:
    'A real, per-agent learned model from actual RAID verdict history and tool-usage data. Actions: ' +
    '"sync" (needs agentId — recomputes from real submission history and tool_index), "fitness" (needs ' +
    'agentId + actionType — honest cold-start warning if there\'s no real history yet, never a fabricated number).',
  parameters: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: Object.keys(ACTIONS) },
      agentId: { type: 'string' },
      actionType: { type: 'string' },
    },
    required: ['action'],
  },
  async execute(args = {}) {
    const fn = ACTIONS[args.action];
    if (!fn) return { error: `unknown action "${args.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    try { return await fn(args); }
    catch (e) { return { error: `agent_model ${args.action} failed: ${e.message}` }; }
  },
};
