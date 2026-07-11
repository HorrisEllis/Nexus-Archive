'use strict';
/**
 * src/providers/host.js — NCP Provider Auto-Host v2
 * UUID: cg-provider-host-v2-0000-2026-0628-001
 *
 * Spawns one hidden BrowserWindow per NCP provider on boot.
 * Each window:
 *   1. Gets its own persistent session partition (`persist:ncp-<id>`)
 *      so login cookies survive restarts.
 *   2. Navigates to the provider URL.
 *   3. Has the GM shim injected first (Tampermonkey compat layer).
 *   4. Has the matching Guardian userscript injected via executeJavaScript
 *      — the *exact unmodified* file from guardian/userscript-<id>.js.
 *   5. Re-injects the script after every navigation (SPA-safe).
 *   6. The userscript opens its NCP EventSource connection back to
 *      Guardian :7820/channel?provider=<id> — Guardian sees it as a
 *      normal NCP tab and dispatches jobs to it exactly as Tampermonkey would.
 *
 * Windows are HIDDEN (show: false) — they run in the background.
 * Co-pilot or the user can call .show(id) to surface any tab.
 * HEADLESS mode: if CG_HEADLESS=1, windows are created but never shown.
 *
 * Architecture note: this replaces Tampermonkey + manual tab management.
 * Guardian, Orchestrator, and Cortex are unmodified — they still talk
 * NCP over :7820. Clear Glass just owns the tabs.
 */

const path = require('path');
const fs   = require('fs');
const { BrowserWindow, session, app } = require('electron');
const { getProvider, listProviders } = require('./registry');
const { buildGmShim } = require('./gm-shim');

// §timestamping fix 2026-06-30 — file-scoped, not a global console mutation.
// Mutating console.log globally here would re-prefix every OTHER module's
// logs in the same Electron process too (main/index.js, registry.js,
// everything) — caught that before shipping it. Instead: a local _log()
// this file's 11 call sites are mechanically rewritten to use, via sed,
// not hand-edited one at a time (same risk as the cg.* fix history).
const _SRC = 'clear-glass/src/providers/host.js';
function _log(...args)   { console.log(`[${new Date().toISOString()}] [${_SRC}]`, ...args); }
function _logError(...args) { console.error(`[${new Date().toISOString()}] [${_SRC}]`, ...args); }
function _logWarn(...args)  { console.warn(`[${new Date().toISOString()}] [${_SRC}]`, ...args); }

// §fix 2026-06-30 — "strip it of the userscripts, not supposed to be baked
// in." This relative path (`../../../../guardian`) hardcoded an assumption
// that clear-glass and guardian are checked out as sibling folders inside
// the same parent repo, in this exact nesting — clear-glass reaching across
// into another system's internal source layout by relative path. That's
// real coupling, not a config default. Removed the silent fallback;
// guardianDir is now required, either explicitly passed in or via
// GUARDIAN_DIR env var. No assumed sibling-folder structure.
const SCRIPT_RELOAD_INTERVAL_MS = 60_000; // reload script from disk every 60s

class ProviderHost {
  constructor({ guardianDir, sse, postEvent } = {}) {
    this.guardianDir = guardianDir || process.env.GUARDIAN_DIR || null;
    if (!this.guardianDir) {
      _logWarn('[ProviderHost] no guardianDir configured (pass guardianDir or set GUARDIAN_DIR env var) — userscript loading will fail until configured. This is intentional: clear-glass no longer assumes guardian lives at a hardcoded relative path.');
    }

    this.sse       = sse       || { emit: () => {} };
    this.postEvent = postEvent || (() => {});

    this._scriptCache = new Map(); // providerId → { source, mtimeMs }
    this.windows      = new Map(); // providerId → BrowserWindow
    this._status      = new Map(); // providerId → { status, url, injectedAt, health }
  }

  // ── Script loading ──────────────────────────────────────────────────────
  _scriptPath(providerId) {
    if (!this.guardianDir) return null; // §fix — null guardianDir produces null path, not a crash
    const def = getProvider(providerId);
    return path.join(this.guardianDir, def.userscriptFile);
  }

  loadUserscript(providerId) {
    const filePath = this._scriptPath(providerId);
    if (!filePath) return null; // no guardianDir configured — silent, already warned at boot
    let stat;
    try { stat = fs.statSync(filePath); }
    catch (e) {
      _logWarn(`[ProviderHost] userscript not found for ${providerId}: ${filePath}`);
      return null;
    }
    const cached = this._scriptCache.get(providerId);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.source;
    const source = fs.readFileSync(filePath, 'utf8');
    this._scriptCache.set(providerId, { source, mtimeMs: stat.mtimeMs });
    _log(`[ProviderHost] loaded userscript for ${providerId} (${Math.round(source.length / 1024)}KB)`);
    return source;
  }

  // ── Inject GM shim + userscript into a window ───────────────────────────
  async _inject(providerId, win) {
    const gmShim  = buildGmShim();
    const script  = this.loadUserscript(providerId);
    if (!script) return false;

    // Wrap in IIFE — prevents global leakage, mirrors Tampermonkey sandbox
    const code = `
(function() {
  'use strict';
  try {
    ${gmShim}
    // Userscript begins
    ${script}
    // Userscript ends
    console.log('[ClearGlass] NCP userscript injected');
  } catch(e) {
    console.error('[ClearGlass] userscript injection error:', e.message);
  }
})();
`;
    try {
      await win.webContents.executeJavaScript(code);
      const st = this._status.get(providerId) || {};
      this._status.set(providerId, { ...st, status: 'injected', injectedAt: Date.now() });
      this.sse.emit('provider.host.injected', { providerId, ts: Date.now() });
      return true;
    } catch (e) {
      _logWarn(`[ProviderHost] injection failed for ${providerId}:`, e.message);
      return false;
    }
  }

  // ── Spawn one provider window ────────────────────────────────────────────
  async start(providerId, opts = {}) {
    if (this.windows.has(providerId)) {
      const existing = this.windows.get(providerId);
      if (!existing.isDestroyed()) {
        if (opts.show) existing.show();
        return { ok: true, providerId, status: 'already-running' };
      }
    }

    const def = getProvider(providerId);
    const partition = `persist:ncp-${providerId}`;

    // Intercept WebSocket upgrades — allow NCP SSE but strip CSP on provider pages
    const ses = session.fromPartition(partition);
    ses.webRequest.onHeadersReceived((details, callback) => {
      const headers = { ...details.responseHeaders };
      // Remove CSP that would block our script injection
      delete headers['content-security-policy'];
      delete headers['content-security-policy-report-only'];
      callback({ responseHeaders: headers });
    });

    const win = new BrowserWindow({
      width:  1280,
      height: 800,
      show:   opts.show === true && process.env.CG_HEADLESS !== '1',
      webPreferences: {
        partition,
        nodeIntegration:             false,
        contextIsolation:            true,
        webSecurity:                 true,
        allowRunningInsecureContent: false,
        // preload is NOT used here — we inject via executeJavaScript after load
      },
      title: `NEXUS NCP — ${def.name}`,
    });

    this.windows.set(providerId, win);
    this._status.set(providerId, {
      status: 'loading', url: def.url,
      providerId, name: def.name, color: def.color,
      startedAt: Date.now(), injectedAt: null, health: 100,
    });

    // Inject on every navigation (SPA route changes included)
    win.webContents.on('did-finish-load', async () => {
      const url = win.webContents.getURL();
      const st  = this._status.get(providerId) || {};

      // Only inject on the provider's own pages
      const isProviderPage = def.hosts.some(h => url.includes(h));
      if (!isProviderPage) {
        _log(`[ProviderHost] ${providerId} — skipping injection on ${url}`);
        return;
      }

      this._status.set(providerId, { ...st, status: 'loaded', url, loadedAt: Date.now() });
      _log(`[ProviderHost] ${providerId} — loaded ${url}, injecting userscript…`);

      // Small delay — let SPA frameworks settle
      await new Promise(r => setTimeout(r, 800));
      await this._inject(providerId, win);
    });

    // Track navigation for health monitoring
    win.webContents.on('did-navigate', (e, navUrl) => {
      const st = this._status.get(providerId) || {};
      this._status.set(providerId, { ...st, url: navUrl });
      this.sse.emit('provider.host.navigate', { providerId, url: navUrl, ts: Date.now() });
    });

    // Detect crash / unresponsive
    win.webContents.on('render-process-gone', (e, { reason }) => {
      _logWarn(`[ProviderHost] ${providerId} renderer gone: ${reason}`);
      const st = this._status.get(providerId) || {};
      const crashCount = (st.crashCount || 0) + 1;
      this._status.set(providerId, { ...st, status: 'crashed', health: 0, crashCount, lastCrashAt: Date.now() });
      this.sse.emit('provider.host.crashed', { providerId, reason, ts: Date.now() });
      // Auto-restart after 5s
      setTimeout(() => this.start(providerId), 5000);
    });

    win.on('closed', () => {
      if (this.windows.get(providerId) === win) {
        this.windows.delete(providerId);
        this._status.delete(providerId);
      }
    });

    // Periodic script re-injection (catches disk changes + SPA unmounts)
    const reloadTimer = setInterval(async () => {
      if (win.isDestroyed()) { clearInterval(reloadTimer); return; }
      const url = win.webContents.getURL();
      const isProviderPage = def.hosts.some(h => url.includes(h));
      if (isProviderPage) {
        // Only re-inject if script on disk has changed
        const filePath = this._scriptPath(providerId);
        try {
          const mtime = fs.statSync(filePath).mtimeMs;
          const cached = this._scriptCache.get(providerId);
          if (!cached || cached.mtimeMs !== mtime) {
            _log(`[ProviderHost] ${providerId} — script changed on disk, re-injecting…`);
            await this._inject(providerId, win);
          }
        } catch (_) {}
      }
    }, SCRIPT_RELOAD_INTERVAL_MS);

    this.postEvent('provider.host.starting', { providerId, url: def.url });

    // Navigate to provider
    await win.loadURL(def.url).catch(e => {
      _logWarn(`[ProviderHost] ${providerId} loadURL failed:`, e.message);
    });

    _log(`[ProviderHost] ${providerId} window spawned → ${def.url}`);
    this.sse.emit('provider.host.started', { providerId, url: def.url, ts: Date.now() });

    return { ok: true, providerId, url: def.url, status: 'started' };
  }

  // ── Auto-boot providers (called from main/index.js after app ready,
  //    only when CG_AUTOBOOT_PROVIDERS opts in — lazy-only by default) ──
  async autoBootAll(opts = {}) {
    const { only = null, ...startOpts } = opts;
    let providers = listProviders();
    if (Array.isArray(only)) {
      providers = providers.filter(p => only.includes(p.id));
    }
    _log(`[ProviderHost] pre-warming ${providers.length} provider tab(s) (hidden)…`);
    const results = [];
    for (const def of providers) {
      try {
        const r = await this.start(def.id, { show: false, ...startOpts });
        results.push(r);
      } catch (e) {
        _logWarn(`[ProviderHost] failed to boot ${def.id}:`, e.message);
        results.push({ ok: false, providerId: def.id, error: e.message });
      }
      // Stagger boot to avoid auth/fingerprint collision
      await new Promise(r => setTimeout(r, 1500));
    }
    this.sse.emit('provider.host.all-booted', { count: results.length, ts: Date.now() });
    return results;
  }

  // ── Control ──────────────────────────────────────────────────────────────
  show(providerId) {
    const win = this.windows.get(providerId);
    if (win && !win.isDestroyed()) { win.show(); win.focus(); return true; }
    return false;
  }

  hide(providerId) {
    const win = this.windows.get(providerId);
    if (win && !win.isDestroyed()) { win.hide(); return true; }
    return false;
  }

  async stop(providerId) {
    const win = this.windows.get(providerId);
    if (win && !win.isDestroyed()) { win.destroy(); }
    this.windows.delete(providerId);
    this._status.delete(providerId);
    this.sse.emit('provider.host.stopped', { providerId, ts: Date.now() });
    return { ok: true, providerId };
  }

  async reload(providerId) {
    const win = this.windows.get(providerId);
    if (!win || win.isDestroyed()) return this.start(providerId);
    win.webContents.reload();
    return { ok: true, providerId, status: 'reloading' };
  }

  list() {
    return listProviders().map(def => ({
      ...def,
      running: this.windows.has(def.id) && !this.windows.get(def.id).isDestroyed(),
      ...(this._status.get(def.id) || {}),
    }));
  }

  getStatus(providerId) {
    return this._status.get(providerId) || { status: 'not-started', providerId };
  }

  // Update health score (called from diagnostic engine or heartbeat)
  setHealth(providerId, score) {
    const st = this._status.get(providerId) || {};
    this._status.set(providerId, { ...st, health: score });
  }

  // §pressure-system 2026-06-29 — same field shape as spotlight.js's
  // updateTensionField(): a crashed tab is high pressure regardless of
  // recorded health (same as an offline system in the tile tension model),
  // repeated crashes escalate it further (crashCount, 5min decay window —
  // same "3 in 10s" escalation idea as spotlight's confusion detector,
  // different timescale because tab crashes are rarer than clicks), a
  // loaded tab's pressure tracks the inverse of its health score.
  getPressure(providerId) {
    const st = this._status.get(providerId);
    if (!st) return { pressure: 0, status: 'not-started' };
    const recentCrash = st.lastCrashAt && (Date.now() - st.lastCrashAt) < 300_000;
    const crashEscalation = recentCrash ? Math.min(0.3, (st.crashCount || 0) * 0.1) : 0;
    let pressure;
    if (st.status === 'crashed') pressure = Math.min(1, 0.7 + crashEscalation);
    else if (st.status === 'loaded') pressure = Math.min(1, (1 - (st.health ?? 1)) * 0.6 + crashEscalation);
    else pressure = 0.1 + crashEscalation; // injected/not-started — mild ambient pressure
    return { pressure: Number(pressure.toFixed(3)), status: st.status, crashCount: st.crashCount || 0 };
  }

  getAllPressure() {
    const out = {};
    for (const def of listProviders()) out[def.id] = this.getPressure(def.id);
    return out;
  }
}

module.exports = ProviderHost;
