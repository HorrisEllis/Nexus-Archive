'use strict';

/**
 * Preload — contextIsolation bridge
 * Exposes a minimal, typed API to the renderer.
 * All calls go through ipcRenderer. No Node in renderer.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ClearGlass', {
  // ── Navigation ────────────────────────────────────────────────────────
  navigate:   (agentId, url) => ipcRenderer.invoke('navigate', { agentId, url }),

  // ── DOM ───────────────────────────────────────────────────────────────
  dom: {
    query:   (payload) => ipcRenderer.invoke('dom:query', payload),
    mutate:  (payload) => ipcRenderer.invoke('dom:mutate', payload),
    pick:    (payload) => ipcRenderer.invoke('dom:pick', payload),
  },

  // ── Driver ────────────────────────────────────────────────────────────
  driver: {
    exec: (payload) => ipcRenderer.invoke('driver:exec', payload),
  },

  // ── Cookies ───────────────────────────────────────────────────────────
  cookies: {
    save:    (payload) => ipcRenderer.invoke('cookies:save', payload),
    restore: (payload) => ipcRenderer.invoke('cookies:restore', payload),
    count:   (payload) => ipcRenderer.invoke('cookies:count', payload),
  },

  // ── Co-pilot ─────────────────────────────────────────────────────────
  copilot: {
    send:     (payload) => ipcRenderer.invoke('copilot:send', payload),
    build:    (payload) => ipcRenderer.invoke('copilot:build', payload),
    diagnose: (payload) => ipcRenderer.invoke('copilot:diagnose', payload),
  },

  // ── WebExtensions — §NEW 2026-07-02 ─────────────────────────────────────
  extensions: {
    list:        ()     => ipcRenderer.invoke('extensions:list'),
    unload:      (id)   => ipcRenderer.invoke('extensions:unload', { id }),
    pickAndLoad: ()     => ipcRenderer.invoke('extensions:pickAndLoad'),
  },

  // ── Context ───────────────────────────────────────────────────────────
  context: {
    switch: (payload) => ipcRenderer.invoke('context:switch', payload),
  },

  // ── API Settings ──────────────────────────────────────────────────────
  api: {
    get: ()        => ipcRenderer.invoke('api:get'),
    set: (payload) => ipcRenderer.invoke('api:set', payload),
  },

  // ── Errors — was missing entirely, the actual gap behind "where are
  //    the errors" ──────────────────────────────────────────────────────
  errors: {
    report: (payload) => ipcRenderer.invoke('errors:report', payload),
    recent: (n)       => ipcRenderer.invoke('errors:recent', { n }),
  },
  // browser.html calls cg.window.* — these handlers exist in ipc/bridge.js
  // but were never exposed through the preload. Root cause of every window
  // control button being a silent no-op.
  window: {
    minimize:     (agentId)  => ipcRenderer.invoke('window:minimize', { agentId }),
    maximize:     (agentId)  => ipcRenderer.invoke('window:maximize', { agentId }),
    hide:         (agentId)  => ipcRenderer.invoke('window:hide', { agentId }),
    open:         (payload)  => ipcRenderer.invoke('window:open', payload),
    openSettings: ()         => ipcRenderer.invoke('window:openSettings'),
    closeSettings:()         => ipcRenderer.invoke('window:closeSettings'),
    list:         ()         => ipcRenderer.invoke('window:list'),
    focus:        (agentId)  => ipcRenderer.invoke('window:focus', { agentId }),
  },

  // ── Providers (NCP hosted tabs) ───────────────────────────────────────
  // ipc/bridge.js has providers:list/start/stop/show but preload never
  // exposed them. Every provider button in browser.html was broken.
  providers: {
    list:  ()              => ipcRenderer.invoke('providers:list'),
    start: (providerId, opts) => ipcRenderer.invoke('providers:start', { providerId, ...opts }),
    stop:  (providerId)   => ipcRenderer.invoke('providers:stop', { providerId }),
    show:  (providerId)   => ipcRenderer.invoke('providers:show', { providerId }),
  },

  // ── Bookmarks ─────────────────────────────────────────────────────────
  bookmarks: {
    add:    (payload) => ipcRenderer.invoke('bookmarks:add', payload),
    remove: (payload) => ipcRenderer.invoke('bookmarks:remove', payload),
    list:   (payload) => ipcRenderer.invoke('bookmarks:list', payload),
    check:  (payload) => ipcRenderer.invoke('bookmarks:check', payload),
    visit:  (payload) => ipcRenderer.invoke('bookmarks:visit', payload),
  },

  // ── Rewind (session snapshots) ────────────────────────────────────────
  rewind: {
    list:     (agentId, limit) => ipcRenderer.invoke('rewind:list', { agentId, limit }),
    snapshot: (agentId, opts)  => ipcRenderer.invoke('rewind:snapshot', { agentId, ...opts }),
    restore:  (payload)        => ipcRenderer.invoke('rewind:restore', payload),
    clear:    (agentId)        => ipcRenderer.invoke('rewind:clear', { agentId }),
  },

  // ── Options ───────────────────────────────────────────────────────────
  options: {
    get: ()        => ipcRenderer.invoke('options:get'),
    set: (payload) => ipcRenderer.invoke('options:set', payload),
  },

  // ── Diagnostics ──────────────────────────────────────────────────────────
  diag: {
    run:   (payload) => ipcRenderer.invoke('diag:run', payload),
    nexus: (payload) => ipcRenderer.invoke('diag:nexus', payload),
  },

  // ── Host window controls ────────────────────────────────────────────────
  window: {
    minimize:     (agentId) => ipcRenderer.invoke('window:minimize', { agentId }),
    hide:         (agentId) => ipcRenderer.invoke('window:hide',     { agentId }),
    maximize:     (agentId) => ipcRenderer.invoke('window:maximize', { agentId }),
    open:         (payload) => ipcRenderer.invoke('window:open',     payload),
    openSettings: ()        => ipcRenderer.invoke('window:openSettings'),
    closeSettings:()        => ipcRenderer.invoke('window:closeSettings'),
    list:         ()        => ipcRenderer.invoke('window:list'),
    focus:        (agentId) => ipcRenderer.invoke('window:focus', { agentId }),
  },

  // ── SSE port ─────────────────────────────────────────────────────────
  getSsePort: () => ipcRenderer.invoke('sse:port'),

  // ── Bookmarks ─────────────────────────────────────────────────────────
  bookmarks: {
    add:    (payload) => ipcRenderer.invoke('bookmarks:add',    payload),
    remove: (payload) => ipcRenderer.invoke('bookmarks:remove', payload),
    list:   (filter)  => ipcRenderer.invoke('bookmarks:list',   filter || {}),
    check:  (payload) => ipcRenderer.invoke('bookmarks:check',  payload),
    visit:  (payload) => ipcRenderer.invoke('bookmarks:visit',  payload),
  },

  // ── Rewind ────────────────────────────────────────────────────────────
  rewind: {
    list:     (agentId, limit) => ipcRenderer.invoke('rewind:list',     { agentId, limit }),
    snapshot: (agentId, opts)  => ipcRenderer.invoke('rewind:snapshot', { agentId, ...opts }),
    restore:  (payload)        => ipcRenderer.invoke('rewind:restore',  payload),
    clear:    (agentId)        => ipcRenderer.invoke('rewind:clear',    { agentId }),
  },

  // ── Provider host ─────────────────────────────────────────────────────
  providers: {
    list:  ()                  => ipcRenderer.invoke('providers:list'),
    start: (providerId, opts)  => ipcRenderer.invoke('providers:start', { providerId, ...opts }),
    stop:  (providerId)        => ipcRenderer.invoke('providers:stop',  { providerId }),
    show:  (providerId)        => ipcRenderer.invoke('providers:show',  { providerId }),
  },

  // ── Userscripts ──────────────────────────────────────────────────────
  userscripts: {
    list:    (filter)           => ipcRenderer.invoke('userscripts:list',   filter || {}),
    inject:  (agentId, scriptId)=> ipcRenderer.invoke('userscripts:inject', { agentId, scriptId }),
    toggle:  (scriptId, enabled)=> ipcRenderer.invoke('userscripts:toggle', { scriptId, enabled }),
    create:  (payload)          => ipcRenderer.invoke('userscripts:create', payload),
    delete:  (scriptId)         => ipcRenderer.invoke('userscripts:delete', { scriptId }),
    source:  (scriptId)         => ipcRenderer.invoke('userscripts:source', { scriptId }),
    edit:    (scriptId, updates)=> ipcRenderer.invoke('userscripts:edit',   { scriptId, updates }),
  },

  // ── Agent mesh ────────────────────────────────────────────────────────
  mesh: {
    spawn:   (payload) => ipcRenderer.invoke('mesh:spawn',   payload),
    route:   (payload) => ipcRenderer.invoke('mesh:route',   payload),
    enqueue: (payload) => ipcRenderer.invoke('mesh:enqueue', payload),
    list:    ()        => ipcRenderer.invoke('mesh:list'),
  },

  // ── Background tabs ───────────────────────────────────────────────────
  bgTabs: {
    open:  (payload)  => ipcRenderer.invoke('bgtab:open',  payload),
    close: (agentId)  => ipcRenderer.invoke('bgtab:close', { agentId }),
    list:  ()         => ipcRenderer.invoke('bgtab:list'),
  },

  // ── Event listener ───────────────────────────────────────────────────
  on:  (channel, fn) => ipcRenderer.on(channel, (e, data) => fn(data)),
  off: (channel, fn) => ipcRenderer.removeListener(channel, fn),
  once:(channel, fn) => ipcRenderer.once(channel, (e, data) => fn(data)),

  // ── DOM event bridge (called from injected page scripts) ──────────────
  _sendDomEvent: (data) => ipcRenderer.send('dom:event', data),
  _sendPickResult: (data) => ipcRenderer.send('dom:pick-result', data),
});

// Inject IPC shim into the page world so injected scripts can emit events
// This runs in the isolated world but we bridge via window postMessage
window.addEventListener('message', (e) => {
  if (e.data?.__cgBridge === true) {
    ipcRenderer.send(e.data.channel, e.data.payload);
  }
});
