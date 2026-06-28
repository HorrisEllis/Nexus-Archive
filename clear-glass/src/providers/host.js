'use strict';
/**
 * src/providers/host.js — NCP Provider Auto-Host
 * UUID: cg-provider-host-v1-0000-0000-000000000014
 *
 * What this replaces: today, Guardian dispatches jobs over NCP to a
 * browser tab that James opens by hand, with Tampermonkey running the
 * matching userscript (userscript-claude.js etc). This class makes Clear
 * Glass spawn and own that tab itself — a real BrowserWindow, navigated
 * to the provider URL, with the *exact same unmodified userscript* (read
 * straight off disk from Guardian's own folder) injected via
 * executeJavaScript instead of via Tampermonkey. The userscript's NCP
 * connection, DOM automation, and completion detection are untouched —
 * only the hosting environment changes.
 *
 * Deliberately separate from src/mesh/agent-mesh.js, which drives
 * provider pages directly via ClearDriver/selectors for mesh.route — a
 * different mechanism for a different purpose. This module exists only
 * to host Guardian's NCP tabs.
 *
 * Deliberately NOT wired through ContextMgr's per-agent fingerprint
 * partitions — those exist for spoofed *browsing* contexts. Hosted
 * provider windows use one persistent Electron session partition per
 * provider (`persist:ncp-<id>`) purely so login/cookies survive restarts.
 */

const path = require('path');
const fs   = require('fs');
const { BrowserWindow, session } = require('electron');
const { getProvider, listProviders } = require('./registry');
const { buildGmShim } = require('./gm-shim');

class ProviderHost {
  constructor({ guardianDir, sse, postEvent } = {}) {
    // Clear Glass and Guardian are siblings under the same NEXUS root —
    // src/providers/host.js → ../../../guardian (clear-glass/../guardian)
    this.guardianDir = guardianDir
      || process.env.GUARDIAN_DIR
      || path.join(__dirname, '../../../guardian');

    this.sse       = sse || { emit: () => {} };
    this.postEvent = postEvent || (() => {});

    this._scriptCache = new Map(); // providerId → { source, mtimeMs }
    this.windows      = new Map(); // providerId → BrowserWindow
  }

  // ── Script loading ──────────────────────────────────────────────────────
  _scriptPath(providerId) {
    const def = getProvider(providerId);
    return path.join(this.guardianDir, def.userscriptFile);
  }

  loadUserscript(providerId) {
    const filePath = this._scriptPath(providerId);
    const stat = fs.statSync(filePath); // throws clearly if missing — no silent fallback
    const cached = this._scriptCache.get(providerId);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.source;

    const source = fs.readFileSync(filePath, 'utf8');
    this._scriptCache.set(providerId, { source, mtimeMs: stat.mtimeMs });
    return source;
  }

  buildInjectable(providerId) {
    const source = this.loadUserscript(providerId);
    // Idempotency guard — dom-ready can fire more than once across a
    // window's life (reload, navigation back into the SPA's own domain);
    // never run two NCP/EventSource connections in the same page.
    return `
(function() {
  if (window.__cgHostedProvider === ${JSON.stringify(providerId)}) return;
  window.__cgHostedProvider = ${JSON.stringify(providerId)};
  window.__cgHostedAt = Date.now();
  ${buildGmShim()}
  ${source}
})();
`;
  }

  // ── Window lifecycle ────────────────────────────────────────────────────
  isHosted(providerId) { return this.windows.has(providerId); }

  list() {
    return listProviders().map(p => ({
      id:     p.id,
      name:   p.name,
      hosted: this.windows.has(p.id),
    }));
  }

  async start(providerId, { show = false } = {}) {
    const def = getProvider(providerId);
    if (this.windows.has(providerId)) {
      const win = this.windows.get(providerId);
      if (show) { win.show(); win.focus(); }
      return { ok: true, providerId, already: true };
    }

    // Verify the userscript exists *before* opening a window — fail loud,
    // not with a blank/broken hosted tab.
    try {
      this.loadUserscript(providerId);
    } catch (err) {
      throw new Error(`Cannot host ${providerId}: ${err.message} (looked in ${this.guardianDir})`);
    }

    const win = new BrowserWindow({
      width: 1100, height: 800,
      title: `Clear Glass — ${def.name} (hosted)`,
      show,
      webPreferences: {
        partition:        `persist:ncp-${providerId}`,
        contextIsolation: true,
        nodeIntegration:  false,
      },
    });

    const inject = () => {
      win.webContents.executeJavaScript(this.buildInjectable(providerId)).catch(err => {
        console.error(`[ProviderHost] Injection failed for ${providerId}:`, err.message);
        this.sse.emit('provider.host.error', { providerId, error: err.message, ts: Date.now() });
      });
    };

    win.webContents.on('dom-ready', inject);
    win.on('closed', () => this.windows.delete(providerId));

    await win.loadURL(def.url);

    this.windows.set(providerId, win);
    this.sse.emit('provider.host.started', { providerId, url: def.url, ts: Date.now() });
    this.postEvent('clear-glass.provider.hosted', { providerId, url: def.url });
    return { ok: true, providerId };
  }

  stop(providerId) {
    const win = this.windows.get(providerId);
    if (!win) return { ok: true, providerId, already: false };
    win.destroy();
    this.windows.delete(providerId);
    this.sse.emit('provider.host.stopped', { providerId, ts: Date.now() });
    return { ok: true, providerId };
  }

  show(providerId) {
    const win = this.windows.get(providerId);
    if (win) { win.show(); win.focus(); }
  }

  async stopAll() {
    for (const id of [...this.windows.keys()]) this.stop(id);
  }
}

module.exports = ProviderHost;
