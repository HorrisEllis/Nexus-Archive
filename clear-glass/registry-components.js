'use strict';
/**
 * clear-glass/registry-components.js — Clear Glass System Contract
 * UUID: cg-registry-v1-0000-0000-000000000001
 * Version: 3.1.0
 *
 * Served at GET /contract from the IPC server (:7702).
 * Verified by orchestrator contract-handshake on boot.
 * Mirrors seam/registry-components.js but in the flat shape
 * the contract-handshake verifier expects (same as copilot/eravos).
 *
 * Contract shape: { systemId, version, port, label, purpose, components[], events{} }
 */

const NS = 'cg';
const V  = '3.1.0';

function _c(id, method, path, desc, opts = {}) {
  return {
    id:          `${NS}.${id}`,
    namespace:   NS,
    name:        id,
    version:     V,
    grammar:     opts.grammar || [id.replace(/\./g, ' ')],
    route:       { method, path },
    description: desc,
    params:      opts.params      || [],
    tags:        [NS, ...(opts.tags || [])],
    permissions: opts.permissions || ['system'],
    hooks:       opts.hooks       || {},
    tier:        opts.tier        || 'T2',
    typecode:    opts.typecode    || null,
  };
}

const components = [
  // ── Health / status ──────────────────────────────────────────────────────
  _c('health',  'GET', '/health',  'Clear Glass health, context count, bus stats'),
  _c('status',  'GET', '/status',  'Full system status — bus sample, agents, listeners, TLS'),
  _c('contract','GET', '/contract','Clear Glass interaction contract'),
  _c('events',  'GET', '/events',  'SSE — all SISO bus events', { tags: ['stream'] }),

  // ── Driver ───────────────────────────────────────────────────────────────
  _c('driver.exec', 'POST', '/cmd', 'Execute ClearDriver browser action', {
    tags: ['driver', 'automation'], typecode: 'CG-DRV-001',
  }),

  // ── DOM ──────────────────────────────────────────────────────────────────
  _c('dom.query',  'POST', '/cmd', 'Query live DOM tree',             { tags: ['dom'], typecode: 'CG-DOM-001' }),
  _c('dom.mutate', 'POST', '/cmd', 'Mutate DOM node',                 { tags: ['dom'], typecode: 'CG-DOM-002' }),
  _c('dom.pick',   'POST', '/cmd', 'Register element picker result',  { tags: ['dom', 'seam'], typecode: 'CG-DOM-003' }),
  _c('dom.tokens', 'POST', '/cmd', 'Token archaeology — detect LLM API patterns', { tags: ['dom', 'archaeology'] }),

  // ── Contexts ─────────────────────────────────────────────────────────────
  _c('context.create',    'POST', '/cmd',      'Create isolated Chromium partition', { tags: ['context'], typecode: 'CG-CTX-001' }),
  _c('context.switch',    'POST', '/cmd',      'Switch active agent context',        { tags: ['context'], typecode: 'CG-CTX-001' }),
  _c('context.list',      'GET',  '/contexts', 'List agent contexts',                { tags: ['context'] }),
  _c('context.fp.switch', 'POST', '/cmd',      'Switch fingerprint mode',            { tags: ['context', 'fingerprint'], typecode: 'CG-CTX-002' }),

  // ── Cookie vault ─────────────────────────────────────────────────────────
  _c('cookie.save',    'POST', '/cmd', 'Save per-account cookies',    { tags: ['cookie'], typecode: 'CG-CKI-001' }),
  _c('cookie.restore', 'POST', '/cmd', 'Restore cookies from vault',  { tags: ['cookie'], typecode: 'CG-CKI-002' }),

  // ── Co-pilot ─────────────────────────────────────────────────────────────
  _c('copilot.message', 'POST', '/cmd', 'Route to Clear Glass co-pilot', {
    tags: ['copilot'], typecode: 'CG-CPL-001',
  }),

  // ── Agent mesh ───────────────────────────────────────────────────────────
  _c('mesh.spawn',   'POST', '/cmd',    'Spawn free AI agent',           { tags: ['mesh'], typecode: 'CG-MSH-001' }),
  _c('mesh.send',    'POST', '/cmd',    'Send prompt to mesh agent',     { tags: ['mesh'], typecode: 'CG-MSH-002' }),
  _c('mesh.route',   'POST', '/cmd',    'RAID-route to healthiest agent',{ tags: ['mesh', 'raid'], typecode: 'CG-MSH-003' }),
  _c('mesh.list',    'GET',  '/agents', 'List mesh agents',              { tags: ['mesh'] }),

  // ── URL listeners ────────────────────────────────────────────────────────
  _c('url.listen',      'POST', '/cmd',       'Add URL pattern listener', { tags: ['listener'], typecode: 'CG-URL-001' }),
  _c('url.listen.list', 'GET',  '/listeners', 'List active listeners',    { tags: ['listener'] }),

  // ── Diagnostics ──────────────────────────────────────────────────────────
  _c('diag.run',  'POST', '/cmd', 'Run diagnostic suite', { tags: ['diagnostic'], typecode: 'CG-DGN-001' }),
  _c('diag.nexus','POST', '/cmd', 'NEXUS home UI audit',  { tags: ['diagnostic'], typecode: 'CG-DGN-002' }),

  // ── Windows ──────────────────────────────────────────────────────────────
  _c('window.open',  'POST', '/cmd', 'Open agent browser window', { tags: ['window'], typecode: 'CG-WIN-001' }),
  _c('window.close', 'POST', '/cmd', 'Close agent window to tray',{ tags: ['window'], typecode: 'CG-WIN-002' }),

  // ── Wire / ErosmancerOS bridge ───────────────────────────────────────────
  _c('wire.health',       'GET',  '/wire/health',   'Wire bridge health',                 { tags: ['wire'] }),
  _c('wire.eros.proxy',   'POST', '/eros/*',        'Proxy command to ErosmancerOS',      { tags: ['wire', 'eros'] }),
  _c('wire.driver.bridge','POST', '/bridge/driver', 'ClearDriver → ErosmancerOS actions', { tags: ['wire', 'driver'] }),
  _c('wire.hostile',      'POST', '/hook/hostile',  'Hostile detection → fp switch',      { tags: ['wire', 'security'] }),
  _c('wire.behavior',     'POST', '/hook/behavior', 'Behavior plan → Cortex intelligence',{ tags: ['wire', 'intelligence'] }),
];

module.exports = {
  systemId:   'clear-glass',
  namespace:  NS,
  version:    V,
  port:       7702,   // IPC server — where orchestrator polls /contract
  ssePort:    7701,
  tlsPort:    7703,
  wirePort:   7704,
  label:      'CLEAR-GLASS',
  purpose:    'Sovereign NEXUS browser. SISO-native →E→E→. Electron + Chromium + Firefox fingerprint + TLS JA4 + ErosmancerOS wire.',
  components,
  events: {
    emits: [
      'clear-glass.boot.complete',
      'clear-glass.window.opened',
      'clear-glass.registered',
      'clear-glass.shutdown',
      'eros.hostile.detected',
      'eros.behavior.plan',
      'lifecycle.ready',
      'nexus.status',
    ],
    handles: [
      'orchestrator.shutdown',
      'cortex.raid.decide',
      'guardian.job.dispatch.receive',
    ],
  },
};
