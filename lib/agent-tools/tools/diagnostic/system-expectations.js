'use strict';
/**
 * lib/agent-tools/tools/diagnostic/system-expectations.js — system_expectations tool
 * UUID: nexus-tool-system-expectations-v1-0000-2026-0815-jamesbrooks-001
 *
 * §WIRED 2026-08-15 — LS2, docs/diagnostic-engine-system.spec. Wraps
 * lib/system-expectations.js, built after that spec's own required
 * "dedicated design pass" (open_questions resolved with real evidence,
 * not guessed at — see that module's own header for the full record).
 */
const se = require('../../../system-expectations.js');

const ACTIONS = {
  sync: () => se.sync(),
  list: (a) => ({ ok: true, expectations: se.list({ system: a.system, kind: a.kind }) }),
  record_outcome: (a) => {
    if (!a.uuid || !a.outcome) return { error: 'record_outcome needs uuid and outcome ("confirmed" or "violated")' };
    return se.recordOutcome(a.uuid, a.outcome, a.detail || {});
  },
};

module.exports = {
  name: 'system_expectations',
  description:
    'A living, per-system model of what each real system is supposed to do, generated from loom\'s real ' +
    'hooks/wires — not hand-authored. Actions: "sync" (regenerates from loom\'s current graph, idempotent — ' +
    're-running only adds genuinely new expectations), "list" (optional system/kind filter), ' +
    '"record_outcome" (needs uuid + outcome:"confirmed"|"violated" — updates confidence with the same ' +
    'proven math user-model.js uses; a violation also writes a real row to fault_log).',
  parameters: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: Object.keys(ACTIONS) },
      system: { type: 'string', description: 'for "list"' },
      kind:   { type: 'string', enum: ['produces', 'consumes'], description: 'for "list"' },
      uuid:   { type: 'string', description: 'for "record_outcome" — the expectation\'s uuid (its hook id)' },
      outcome:{ type: 'string', enum: ['confirmed', 'violated'], description: 'for "record_outcome"' },
      detail: { type: 'object', description: 'for "record_outcome" — extra context for a violation' },
    },
    required: ['action'],
  },
  async execute(args = {}) {
    const fn = ACTIONS[args.action];
    if (!fn) return { error: `unknown action "${args.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    try { return await fn(args); }
    catch (e) { return { error: `system_expectations ${args.action} failed: ${e.message}` }; }
  },
};
