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

  // §BUILD 2026-08-30 — BL30_registry_components_drift_audit. Real,
  // confirmed gap closed: this file had 32 components and zero mention
  // of an entire session's worth of real, committed, tested capability
  // — invisible to co-pilot's own real "list your tools" feature, which
  // reads directly from this same file. Every real IPC channel below is
  // copied verbatim from clear-glass/src/ipc/bridge.js's actual
  // ipcMain.handle() calls, not guessed at or re-derived.

  // ── Callto Index — real, persistent DOM-element-to-action registry ────────
  _c('calltos.list',   'IPC', 'calltos:list',   'List every registered callto',                 { tags: ['guardian', 'callto'] }),
  _c('calltos.forUrl', 'IPC', 'calltos:forUrl', 'Find calltos registered for a given origin',   { tags: ['guardian', 'callto'] }),
  _c('calltos.remove', 'IPC', 'calltos:remove', 'Remove a registered callto',                   { tags: ['guardian', 'callto'] }),

  // ── Download listeners — real, event-gated per-download automation ────────
  _c('downloads.listListeners',   'IPC', 'downloads:listListeners',   'List configured download listeners',        { tags: ['downloads', 'listener'] }),
  _c('downloads.registerListener','IPC', 'downloads:registerListener','Register a real download listener',         { tags: ['downloads', 'listener'] }),
  _c('downloads.updateListener',  'IPC', 'downloads:updateListener', 'Update a download listener',                { tags: ['downloads', 'listener'] }),
  _c('downloads.removeListener',  'IPC', 'downloads:removeListener', 'Remove a download listener',                { tags: ['downloads', 'listener'] }),

  // ── Site settings — real per-origin permission storage ────────────────────
  _c('siteSettings.get',          'IPC', 'site-settings:get',          'Get one real per-origin setting',       { tags: ['site-settings'] }),
  _c('siteSettings.getAll',       'IPC', 'site-settings:getAll',       'Get all real settings for an origin',   { tags: ['site-settings'] }),
  _c('siteSettings.set',          'IPC', 'site-settings:set',          'Set a real per-origin setting',         { tags: ['site-settings'] }),
  _c('siteSettings.deleteKey',    'IPC', 'site-settings:deleteKey',    'Delete one real setting key',           { tags: ['site-settings'] }),
  _c('siteSettings.clear',        'IPC', 'site-settings:clear',        'Clear all real settings for an origin', { tags: ['site-settings'] }),
  _c('siteSettings.listOrigins',  'IPC', 'site-settings:listOrigins',  'List every real origin with settings',  { tags: ['site-settings'] }),

  // ── Real browsing history ──────────────────────────────────────────────────
  _c('history.list',   'IPC', 'history:list',   'Real browsing history search/list',     { tags: ['history'] }),
  _c('history.delete', 'IPC', 'history:delete',  'Delete a real history entry',           { tags: ['history'] }),
  _c('history.clear',  'IPC', 'history:clear',   'Clear real history',                    { tags: ['history'] }),

  // ── Chrome extension loading — real session.extensions.loadExtension ──────
  _c('extensions.list',          'IPC', 'extensions:list',          'List real loaded Chrome extensions',      { tags: ['extensions'] }),
  _c('extensions.load',          'IPC', 'extensions:load',         'Load a real unpacked extension',          { tags: ['extensions'] }),
  _c('extensions.unload',        'IPC', 'extensions:unload',       'Unload a real extension',                 { tags: ['extensions'] }),
  _c('extensions.pickDirectory', 'IPC', 'extensions:pickDirectory','Real OS directory picker for extensions', { tags: ['extensions'] }),

  // ── Bookmarks-with-state — real full-page state save/restore ──────────────
  _c('bookmarks.addWithState',  'IPC', 'bookmarks:addWithState',  'Bookmark + save real full page state', { tags: ['bookmarks', 'rewind'] }),
  _c('bookmarks.openWithState', 'IPC', 'bookmarks:openWithState', 'Open a bookmark and restore its real saved state', { tags: ['bookmarks', 'rewind'] }),

  // ── Rewind — real state snapshot/restore, event-driven from bookmarks ─────
  _c('rewind.list',     'IPC', 'rewind:list',     'List real rewind snapshots',   { tags: ['rewind'] }),
  _c('rewind.snapshot', 'IPC', 'rewind:snapshot', 'Take a real rewind snapshot',  { tags: ['rewind'] }),
  _c('rewind.restore',  'IPC', 'rewind:restore',  'Restore a real rewind snapshot',{ tags: ['rewind'] }),
  _c('rewind.clear',    'IPC', 'rewind:clear',    'Clear real rewind snapshots',  { tags: ['rewind'] }),

  // ── Passwords — real AES-256-GCM vault ─────────────────────────────────────
  _c('passwords.list',   'IPC', 'passwords:list',   'List real saved passwords (metadata only)', { tags: ['passwords', 'security'] }),
  _c('passwords.delete', 'IPC', 'passwords:delete', 'Delete a real saved password',              { tags: ['passwords', 'security'] }),

  // ── Speech-to-text — real offline transcription via PocketSphinx ──────────
  _c('speech.available',        'IPC', 'speech:available',        'Real offline speech engine availability', { tags: ['speech'] }),
  _c('speech.transcribeBuffer', 'IPC', 'speech:transcribeBuffer', 'Real offline audio-buffer transcription',  { tags: ['speech'] }),

  // ── Macros — real, first UI reach into lib/agent-tools/, erosmancer-aware ─
  _c('macros.list', 'IPC', 'macros:list', 'List real stored macros (real erosmancer integration where used)', { tags: ['macros'] }),
  _c('macros.get',  'IPC', 'macros:get',  'Get one real macro',                                                { tags: ['macros'] }),
  _c('macros.run',  'IPC', 'macros:run',  'Run a real macro against a real agent',                             { tags: ['macros'] }),

  // ── Background tabs — real, service-tab management ─────────────────────────
  _c('bgtab.open',  'IPC', 'bgtab:open',  'Open a real background service tab',  { tags: ['bgtab'] }),
  _c('bgtab.close', 'IPC', 'bgtab:close', 'Close a real background tab',         { tags: ['bgtab'] }),
  _c('bgtab.list',  'IPC', 'bgtab:list',  'List real open background tabs',      { tags: ['bgtab'] }),
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
