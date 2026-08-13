'use strict';
/**
 * lib/agent-tools/tools/copilot-identity.js — copilot's own settable name.
 * comp_id: nexus.lib.agent-tools.tools.copilot-identity
 * UUID: nexus-tool-copilot-identity-v1-0000-2026-0812-001
 *
 * §WIRED 2026-08-12 (P6 of docs/copilot-full-capability-phasemap.spec).
 * copilot/lib/self-model.js's getIdentityName/setIdentityName — new this
 * session, same commit — kept deliberately separate from whoAmI() (which
 * answers "what does NEXUS know about the USER," a different axis). Thin
 * wrapper only; all persistence/default-handling logic lives in self-model.js.
 */

const sm = require('../../../copilot/lib/self-model.js');

const ACTIONS = {
  get: () => ({ ok: true, ...sm.getIdentityName() }),
  set: (a) => {
    if (typeof a.name !== 'string') return { error: 'set needs name (string) — pass an empty string to clear back to default' };
    return sm.setIdentityName(a.name);
  },
};

module.exports = {
  name: 'copilot_identity',
  description:
    'Get or set co-pilot\'s own display name. "get" returns the current name (default "co-pilot" if ' +
    'never set) and whether it\'s custom. "set" needs name — pass an empty string to clear back to the ' +
    'default. Persisted to cortex, survives a restart. This is co-pilot\'s own identity, not what NEXUS ' +
    'knows about the user (that\'s a separate axis, unaffected by this).',
  parameters: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: Object.keys(ACTIONS) },
      name:   { type: 'string', description: 'for "set" — the new name, or "" to clear' },
    },
    required: ['action'],
  },
  async execute(args = {}) {
    const fn = ACTIONS[args.action];
    if (!fn) return { error: `unknown action "${args.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    try { return await fn(args); }
    catch (e) { return { error: `copilot_identity ${args.action} failed: ${e.message}` }; }
  },
};
