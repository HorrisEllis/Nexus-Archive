'use strict';
/**
 * orchestrator/registry-components.js
 * UUID: nexus-orchestrator-registry-v1-0000-2026-0702-jamesbrooks-001
 *
 * Component declarations for the orchestrator system.
 * Includes the /api/system/* routes moved from guardian this session.
 */

function _c(id, method, path, desc, opts = {}) {
  return { id, systemId:'orchestrator', method, route:{ method, path }, description:desc,
           tags:opts.tags||[], hooks:opts.hooks||{} };
}

module.exports = [
  // ── Core ─────────────────────────────────────────────────────────────────
  _c('health',              'GET',  '/health',                   'Orchestrator health'),
  _c('contract',            'GET',  '/contract',                 'Orchestrator interaction contract'),
  _c('status',              'GET',  '/api/status',               'Full system status snapshot'),
  _c('bus.stats',           'GET',  '/api/bus/stats',            'Nexus bus stats + per-source emitCount/lastSeen'),
  // ── Ledger ───────────────────────────────────────────────────────────────
  _c('ledger.write',        'POST', '/api/ledger',               'Write event to system ledger', { tags:['ledger'] }),
  _c('ledger.read',         'GET',  '/api/ledger/:system',       'Read system ledger tail', { tags:['ledger'] }),
  // ── Registry ─────────────────────────────────────────────────────────────
  _c('register',            'POST', '/api/register',             'Register a sovereign system'),
  _c('systems',             'GET',  '/api/systems',              'Registered systems'),
  _c('components',          'GET',  '/api/components',           'Blueprint component index'),
  // ── Contract ─────────────────────────────────────────────────────────────
  _c('contract.verify',     'POST', '/api/contract/verify',      'Verify a system contract'),
  _c('contracts.all',       'GET',  '/api/contracts',            'All interaction contracts'),
  // ── System routes — moved from guardian 2026-07-02 ───────────────────────
  // Previously guardian served these; orchestrator now owns them directly
  // (routes in orchestrator.js at /api/system/*)
  _c('system.hot-load',     'POST', '/api/system/hot-load',      'Live-patch a module without restart', { tags:['system','hot'] }),
  _c('system.hot-load.status','GET','/api/system/hot-load/status','Hot-load monitor status', { tags:['system','hot'] }),
  _c('system.autonomous',   'POST', '/api/system/autonomous',    'Run an autonomous goal loop', { tags:['system','autonomous'] }),
  _c('system.autonomous.status','GET','/api/system/autonomous/status','Autonomous loop status', { tags:['system','autonomous'] }),
  _c('system.mcp',          'GET',  '/api/system/mcp',           'MCP server status', { tags:['system','mcp'] }),
  _c('system.mcp.tools',    'GET',  '/api/system/mcp/tools',     'MCP available tools', { tags:['system','mcp'] }),
  // ── Pulse / heartbeat ─────────────────────────────────────────────────────
  _c('heartbeat',           'POST', '/api/heartbeat',            'System heartbeat — keeps lastSeen live', { tags:['pulse'] }),
  _c('pulse',               'POST', '/api/pulse',                'System pulse event', { tags:['pulse'] }),
  // ── Spec drift ────────────────────────────────────────────────────────────
  _c('spec-drift',          'GET',  '/api/spec-drift',           'Current spec/code divergence'),
  // ── UI ────────────────────────────────────────────────────────────────────
  _c('ui.list',             'GET',  '/api/ui',                   'Available UI systems'),
  _c('ui.hotswap',          'POST', '/api/ui/hotswap',           'Hot-swap a UI file'),
  // §2026-07-02 — wired at boot this session (bus-level, not HTTP routes)
  _c('cos.enforcement',     'BUS',  'cos.invariant.*',           'COS BoundaryIndex monitors every nexus-bus event — I-1 UUID, C-1 causal edges. Violations → ledger as cos.invariant.* events.', { tags:['cos','enforcement','bus'] }),
  _c('rfr2.bus.bridge',     'BUS',  'rfr2.delta.*',              'RFR2 delta+enforcement wired to nexus-bus wildcard. Feeds computeEventDelta (S/C fields) and invariant checks. Emits rfr2.delta.signal, rfr2.enforcement.violation, rfr2.delta.fractal.', { tags:['rfr2','delta','bus'] }),
];
