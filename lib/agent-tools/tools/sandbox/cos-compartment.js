'use strict';
/**
 * lib/agent-tools/tools/cos-compartment.js — copilot's access to COS
 * (Compartment OS) compartment lifecycle.
 * comp_id: nexus.lib.agent-tools.tools.cos-compartment
 * UUID: nexus-tool-cos-compartment-v1-0000-2026-0812-001
 *
 * §WIRED 2026-08-12 (P3 of docs/copilot-full-capability-phasemap.spec,
 * compartmentalization half). cos/ has zero HTTP surface anywhere (checked
 * cos/host/index.js directly — no server, no listen()) — it's CLI-only by
 * design (its own header: "COS-2: CLI first — if it can't be done in CLI it
 * doesn't exist yet. COS-13: Host service is the authority. CLI is a client
 * of the host."). This tool is another client of the same host, reusing the
 * REAL programmatic functions the CLI itself calls (createCompartment,
 * stopCompartment, destroyCompartment, listCompartments, showStatus) rather
 * than reimplementing gate dispatch — §16.5. createHost() is called fresh
 * per execute(), same as the real CLI does per invocation (each `cos <cmd>`
 * process boots its own host reading/writing the same on-disk state file) —
 * matches the real usage pattern, not a shortcut.
 */

function _host() {
  const { createHost } = require('../../../../cos/host/index.js');
  return createHost();
}

const ACTIONS = {
  create: (a) => {
    if (!a.name) return { error: 'create needs name' };
    const { createCompartment } = require('../../../../cos/cli/commands/create.js');
    const host = _host();
    try { return { ok: true, compartment: createCompartment(host, { name: a.name, purpose: a.purpose, runtimeId: a.runtimeId, networkIsolated: a.networkIsolated !== false }) }; }
    catch (e) { return { ok: false, error: e.message }; }
  },
  start: (a) => {
    if (!a.name) return { error: 'start needs name' };
    const { startCompartment } = require('../../../../cos/cli/commands/start.js');
    const logs = [];
    const r = startCompartment(_host(), a.name, { log: (...x) => logs.push(x.join(' ')) });
    return { ok: true, result: r, logs };
  },
  stop: (a) => {
    if (!a.name) return { error: 'stop needs name' };
    const { stopCompartment } = require('../../../../cos/cli/commands/stop.js');
    const logs = [];
    const r = stopCompartment(_host(), a.name, { log: (...x) => logs.push(x.join(' ')) });
    return { ok: true, result: r, logs };
  },
  destroy: (a) => {
    if (!a.name) return { error: 'destroy needs name' };
    const { destroyCompartment } = require('../../../../cos/cli/commands/destroy.js');
    const logs = [];
    const r = destroyCompartment(_host(), a.name, { force: !!a.force, wipe: !!a.wipe, log: (...x) => logs.push(x.join(' ')) });
    return { ok: true, result: r, logs };
  },
  list: (a) => {
    const { listCompartments } = require('../../../../cos/cli/commands/list.js');
    const logs = [];
    listCompartments(_host(), { json: true }, { log: (...x) => logs.push(x.join(' ')) });
    // listCompartments logs JSON rather than returning it (CLI shape) — parse what it logged.
    try { return { ok: true, compartments: JSON.parse(logs.join('')) }; }
    catch (_) { return { ok: true, raw: logs }; }
  },
  status: (a) => {
    if (!a.name) return { error: 'status needs name' };
    const { showStatus } = require('../../../../cos/cli/commands/status.js');
    const logs = [];
    showStatus(_host(), a.name, { json: true }, { log: (...x) => logs.push(x.join(' ')) });
    try { return { ok: true, status: JSON.parse(logs.join('')) }; }
    catch (_) { return { ok: true, raw: logs }; }
  },
};

module.exports = {
  name: 'cos_compartment',
  description:
    'Create, start, stop, destroy, list, or check status of a real COS (Compartment OS) compartment — ' +
    'an isolated sandbox with its own process/network/runtime boundary. Actions: "create" (needs name, ' +
    'optional purpose/runtimeId/networkIsolated), "start"/"stop"/"destroy" (need name; destroy takes ' +
    'optional force/wipe), "list", "status" (needs name). Real, persistent state on disk — not a dry run.',
  parameters: {
    type: 'object',
    properties: {
      action:          { type: 'string', enum: Object.keys(ACTIONS) },
      name:            { type: 'string', description: 'compartment name — required for all actions except list' },
      purpose:         { type: 'string', description: 'for "create" — what this compartment is for' },
      runtimeId:       { type: 'string', description: 'for "create" — runtime override' },
      networkIsolated: { type: 'boolean', description: 'for "create" — default true' },
      force:           { type: 'boolean', description: 'for "destroy"' },
      wipe:            { type: 'boolean', description: 'for "destroy" — also remove data on disk' },
    },
    required: ['action'],
  },
  async execute(args = {}) {
    const fn = ACTIONS[args.action];
    if (!fn) return { error: `unknown action "${args.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    try { return await fn(args); }
    catch (e) { return { error: `cos_compartment ${args.action} failed: ${e.message}` }; }
  },
};
