'use strict';
/**
 * src/preload/webview-bridge.js
 *
 * §BUILD 2026-07-09 — the injected PICKER_SCRIPT in renderer/browser.html
 * called `require('electron').ipcRenderer.sendToHost(...)` directly from
 * inside the <webview> guest page. The webview is declared with
 * `contextIsolation=yes` and no `nodeIntegration` attribute (default off),
 * so the guest page has no Node access at all — that call almost
 * certainly throws, and the surrounding try/catch in the picker swallows
 * it silently. Every pick that made it this far was still being dropped
 * on the floor.
 *
 * This is the standard, supported way to give an isolated guest page a
 * narrow channel back to its host: a preload script on the <webview> tag
 * itself, exposed via contextBridge. No Node in the page, no `require`,
 * just one function.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('__cg', {
  send: (channel, data) => {
    // Allowlist — this is a bridge out of an arbitrary, untrusted guest
    // page (could be any site an agent navigates to). Don't let injected
    // page code send anything but the channels we actually handle.
    if (channel !== 'dom:pick-result' && channel !== 'dom:event') return;
    ipcRenderer.sendToHost(channel, data);
  },
});
