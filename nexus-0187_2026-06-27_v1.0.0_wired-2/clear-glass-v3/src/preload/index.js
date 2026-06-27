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
  },

  // ── Co-pilot ─────────────────────────────────────────────────────────
  copilot: {
    send: (payload) => ipcRenderer.invoke('copilot:send', payload),
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

  // ── SSE port ─────────────────────────────────────────────────────────
  getSsePort: () => ipcRenderer.invoke('sse:port'),

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
