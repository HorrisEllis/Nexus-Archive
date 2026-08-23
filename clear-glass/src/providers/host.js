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

    // §ADDED 2026-08-18 — James: real memory pressure on his machine
    // (boot log's own resource-monitor: heap 80%+, then free memory
    // dropping below the 10% halt threshold, cortex/self-heal entering
    // FAILURE_MODE, a crash severe enough to leave a stale flush lock on
    // next boot). Checked first, not assumed: backgroundThrottling is
    // NOT set on these BrowserWindows (confirmed by reading the real
    // webPreferences directly) — Electron's default only throttles JS
    // timers for hidden windows, which helps CPU, not the real cost
    // here, which is 4 full Chromium renderers' own DOM/JS-heap memory,
    // unaffected by throttling. The only real way to free that memory is
    // to actually destroy the window (stop(), already real) and recreate
    // it lazily on next genuine use (start(), already real) — this is a
    // real idle layer on top of both, not a third mechanism.
    this._lastUsed = new Map(); // providerId → timestamp of last real dispatch
    this._pending   = new Map(); // providerId → in-flight ensureStarted() promise, so concurrent callers share one real start() rather than racing two
    this.IDLE_TIMEOUT_MS = parseInt(process.env.CG_PROVIDER_IDLE_MS || '120000', 10); // 2 minutes, matching the person's own stated number
    const idleSweep = setInterval(() => this._sweepIdle(), 15_000);
    if (idleSweep.unref) idleSweep.unref();
  }

  /**
   * touch(providerId) — real last-use marker. Every real dispatch path
   * (agent-chat's ask(), self-model's navigateAgentToUrl/dispatchPromptAndWait,
   * the wake-word listener) should call this on genuine use, not the
   * heartbeat sweep — a provider tab idly holding its NCP connection open
   * with nobody actually asking it anything is exactly the case this
   * exists to catch, and heartbeats alone would never look idle.
   */
  touch(providerId) {
    this._lastUsed.set(providerId, Date.now());
  }

  /**
   * ensureStarted(providerId, opts) — the real queue, sized to what's
   * actually needed. Not a persistent, crash-surviving queue (that's
   * contract-queue.js's real job, for real cross-process work) — this is
   * in-memory, for the real, common case: a dispatch arrives for a
   * provider that idled out, and the caller should wait a few real
   * seconds for a fresh start() rather than fail. Concurrent callers for
   * the same provider share one real start() (via _pending), not one
   * each — the actual "retry logic" the person described is this: a
   * failed start() is still recorded, not silently swallowed, and the
   * NEXT ensureStarted() call tries again for real rather than caching
   * the old failure forever.
   */
  async ensureStarted(providerId, opts = {}) {
    this.touch(providerId);
    if (this.windows.has(providerId) && !this.windows.get(providerId).isDestroyed()) {
      return { ok: true, providerId, alreadyRunning: true };
    }
    if (this._pending.has(providerId)) return this._pending.get(providerId);
    const p = this.start(providerId, { show: false, ...opts })
      .then((r) => { this._pending.delete(providerId); return r; })
      .catch((e) => { this._pending.delete(providerId); throw e; });
    this._pending.set(providerId, p);
    return p;
  }

  /**
   * _sweepIdle() — real, periodic. A provider with no real dispatch for
   * IDLE_TIMEOUT_MS gets a genuine stop() — the actual memory-freeing
   * step, not a connection-only pause (checked and confirmed: pausing
   * just the NCP heartbeat would not free the dominant real cost, the
   * tab's own DOM/JS heap).
   */
  _sweepIdle() {
    const now = Date.now();
    for (const [providerId, win] of this.windows) {
      if (win.isDestroyed()) { this.windows.delete(providerId); continue; }
      const last = this._lastUsed.get(providerId);
      if (last == null) continue; // never touched — a fresh pre-warm, not idle by this definition
      if (now - last < this.IDLE_TIMEOUT_MS) continue;
      _log(`[ProviderHost] ${providerId} idle for ${Math.round((now - last) / 1000)}s — stopping to free real memory (will restart on next genuine use)`);
      this.stop(providerId).catch((e) => _logWarn(`[ProviderHost] idle-stop failed for ${providerId}:`, e.message));
    }
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

  // §NEXUS-WAKE 2026-08-18 — guardian/userscript-nexus-wake.js attaches
  // window.NexusWake and does nothing until a provider script calls
  // .install(). It has to run BEFORE the provider script (which calls
  // install() near its own boot line), so it's loaded the same way gmShim
  // is: a shared prelude, not baked into any one provider file. This keeps
  // the "exact unmodified provider file" invariant above true — the wake
  // module is its own file on disk, just like the GM shim is its own file.
  // Missing/unreadable is non-fatal: providers boot without "hey nexus"
  // rather than not booting at all.
  _loadSharedPrelude() {
    if (!this.guardianDir) return '';
    const p = path.join(this.guardianDir, 'userscript-nexus-wake.js');
    try { return fs.readFileSync(p, 'utf8'); }
    catch (e) { _logWarn(`[ProviderHost] nexus-wake prelude not loaded: ${e.message}`); return ''; }
  }

  // ── Inject GM shim + userscript into a window ───────────────────────────
  async _inject(providerId, win) {
    const gmShim  = buildGmShim();
    const wake    = this._loadSharedPrelude();
    const script  = this.loadUserscript(providerId);
    if (!script) return false;

    // Wrap in IIFE — prevents global leakage, mirrors Tampermonkey sandbox
    const code = `
(function() {
  'use strict';
  try {
    ${gmShim}
    // Shared prelude — window.NexusWake, inert until a provider script
    // calls .install(). Loaded once here rather than four times.
    ${wake}
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

    // §WIRED 2026-08-19 — found built but never called: will-download was
    // hooked nowhere in the tree. James: "guardian to listen for the
    // downloads from your chat and move them to the compartment with the
    // contract or repo/spec." This announces; it applies nothing itself —
    // see lib/intake.js for why arrival must not equal acceptance.
    try {
      const downloadCapture = require('./download-capture.js');
      downloadCapture.attach({ session: ses, providerId, log: _log });
    } catch (e) { _logWarn(`[ProviderHost] download-capture not attached for ${providerId}: ${e.message}`); }

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

  /**
   * injectAnswer(providerId, text) — James: "listens for the co-pilot
   * response and injects it into the corresponding agent chat using
   * clearglass." Real close of the loop: calls a page-side function the
   * userscript itself already exposes (window.__nexusInjectAnswer),
   * which wraps that provider's OWN real injectText()/submit() — this
   * method never assumes DOM structure itself, that lives exactly once,
   * in the userscript, matching §16.5 (one composer driver, not two that
   * can drift).
   */
  async injectAnswer(providerId, text) {
    const win = this.windows.get(providerId);
    if (!win || win.isDestroyed()) return { ok: false, reason: `no live window for ${providerId}` };
    try {
      const result = await win.webContents.executeJavaScript(
        `(typeof window.__nexusInjectAnswer === 'function') ? window.__nexusInjectAnswer(${JSON.stringify(text)}) : { ok: false, reason: 'page has not loaded __nexusInjectAnswer yet' }`
      );
      return result || { ok: false, reason: 'page returned nothing' };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  }

  /**
   * queryDom(providerId, query) — James: "dom archeology tool for the
   * clear-glass toolkit." Same real, proven pattern as injectAnswer():
   * reaches the already-real window.__cgDomMesh object the DOM
   * Archaeology panel itself already calls (confirmed directly in
   * clear-glass/renderer/browser.js before building this — getTree()/
   * query() are real, existing page-side methods, not invented here).
   * A blank query returns the real tree; a real query string searches it.
   */
  async queryDom(providerId, query) {
    const win = this.windows.get(providerId);
    if (!win || win.isDestroyed()) return { ok: false, reason: `no live window for ${providerId}` };
    try {
      const script = query
        ? `window.__cgDomMesh?.query(${JSON.stringify(query)}) ?? { ok: false, reason: 'DOM Archaeology mesh not loaded on this page' }`
        : `window.__cgDomMesh?.getTree(3) ?? { ok: false, reason: 'DOM Archaeology mesh not loaded on this page' }`;
      const result = await win.webContents.executeJavaScript(script);
      return result || { ok: false, reason: 'page returned nothing' };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  }

  /**
   * deploy(providerId) — James, via CLEAR-GLASS-EXPANSION-PLAN-2026-08-23.md
   * item 3: "no way to push/hot-reload a userscript into an already-running
   * provider tab on demand — host.js only reloads a script from disk on its
   * own 60s timer or full start()." Real, narrow fix: force a real
   * injection right now, into the real live window that's already running,
   * without waiting for SCRIPT_RELOAD_INTERVAL_MS or a full stop()/start()
   * round trip (which would drop the tab's own session state mid-task).
   *
   * §1.2 — deploy() means "push what's on disk right now," not "push if it
   * changed since I last looked." Confirmed the real staleness check in
   * loadUserscript() compares mtimeMs and short-circuits on a match — an
   * operator who just saved an edit and immediately deploys could hit the
   * same cached entry if a prior 60s auto-reload already picked up that
   * exact mtime. Real fix: evict this provider's cache entry first, so
   * _inject()'s own loadUserscript() call is forced to genuinely re-read
   * the file from disk, every time, regardless of what was cached before.
   *
   * Honestly fails — no live window, no such provider, or a real injection
   * error — rather than reporting success when nothing was actually pushed.
   */
  async deploy(providerId) {
    let def;
    try { def = getProvider(providerId); }
    catch (e) { return { ok: false, providerId, error: e.message }; }

    const win = this.windows.get(providerId);
    if (!win || win.isDestroyed()) {
      return { ok: false, providerId, error: `no live window for ${providerId} — start it first (providers:start), then deploy` };
    }

    this._scriptCache.delete(providerId); // force a real re-read, not a cache hit
    const injected = await this._inject(providerId, win);
    if (!injected) {
      return { ok: false, providerId, error: `deploy failed for ${providerId} — see [ProviderHost] injection logs for the real reason (missing script file, or a live page error)` };
    }

    _log(`[ProviderHost] ${providerId} — deployed on demand (hot-push, outside the ${SCRIPT_RELOAD_INTERVAL_MS / 1000}s auto-reload timer)`);
    this.sse.emit('provider.host.deployed', { providerId, name: def.name, ts: Date.now() });
    return { ok: true, providerId, deployedAt: Date.now() };
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

  /**
   * stopAll() — found genuinely missing, not assumed: main/index.js's real
   * shutdown path calls `providerHost?.stopAll()`, but this method never
   * existed on the class. Optional chaining protects against providerHost
   * itself being null; it does nothing for a method that's undefined ON a
   * real object, which is exactly what "stopAll is not a function" means.
   * Confirmed live in a real run — this fired on every shutdown under
   * memory pressure, the exact moment a clean, fast teardown matters most.
   *
   * Real, not a stub: stops every real, currently-tracked provider window,
   * reusing stop()'s own exact real per-provider logic rather than a
   * second copy. Runs concurrently (Promise.allSettled) and isolates a
   * single provider's failure — one broken teardown must never block the
   * rest from actually closing under real memory pressure.
   */
  async stopAll() {
    const ids = [...this.windows.keys()];
    const results = await Promise.allSettled(ids.map(id => this.stop(id)));
    const failures = results
      .map((r, i) => ({ r, id: ids[i] }))
      .filter(({ r }) => r.status === 'rejected');
    for (const { r, id } of failures) _logWarn(`[ProviderHost] stopAll: ${id} failed to stop cleanly: ${r.reason?.message || r.reason}`);
    return { ok: failures.length === 0, stopped: ids.length - failures.length, failed: failures.map(f => f.id) };
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

  /**
   * navigateTo(providerId, url) — real, new. Requested directly ("switch
   * co-pilot to claude with this URL... use a URL given as the surface").
   * Checked start()/reload() first: neither does this — start() only ever
   * loads a provider's fixed default URL (getProvider(providerId).url) and,
   * critically, if the window is ALREADY running (true for every provider
   * after autoBootAll — every provider pre-warms), start()'s early return
   * just SHOWS the existing window without navigating it anywhere. reload()
   * only re-loads whatever's already loaded. Neither can point an existing,
   * running provider window at an arbitrary URL — this is genuinely new.
   *
   * Two real things a fresh loadURL() breaks that this method accounts for:
   * (a) the userscript injected via _inject() is a one-time executeJavaScript
   *     call, not persistent — navigating away and the NCP bridge goes dark
   *     until re-injected. Re-injects after the new page settles.
   * (b) a URL that requires auth may redirect (e.g. to a /login path) —
   *     detected here by comparing the REQUESTED url against the ACTUAL
   *     url after navigation settles, not guessed from the requested url
   *     alone (the requested url could look fine and still redirect).
   */
  async navigateTo(providerId, url) {
    if (!url || typeof url !== 'string') return { ok: false, error: 'navigateTo needs a real url string' };
    let win = this.windows.get(providerId);
    if (!win || win.isDestroyed()) {
      // No running window for this provider yet — start one fresh, THEN
      // navigate it, rather than fail outright (a person switching to an
      // agent they haven't used yet should still work).
      const started = await this.start(providerId, { show: false });
      if (!started.ok) return { ok: false, error: `could not start ${providerId} to navigate it: ${started.error || 'unknown'}` };
      win = this.windows.get(providerId);
      if (!win || win.isDestroyed()) return { ok: false, error: `${providerId} window unavailable after start` };
    }

    const loadResult = await new Promise((resolve) => {
      const onFinish = () => { cleanup(); resolve({ ok: true }); };
      const onFail = (_e, code, desc) => { cleanup(); resolve({ ok: false, error: `${desc} (${code})` }); };
      const cleanup = () => {
        win.webContents.removeListener('did-finish-load', onFinish);
        win.webContents.removeListener('did-fail-load', onFail);
      };
      win.webContents.once('did-finish-load', onFinish);
      win.webContents.once('did-fail-load', onFail);
      win.loadURL(url).catch(e => { cleanup(); resolve({ ok: false, error: e.message }); });
    });
    if (!loadResult.ok) {
      this.sse.emit('provider.host.navigate-failed', { providerId, url, error: loadResult.error, ts: Date.now() });
      return { ok: false, providerId, url, error: loadResult.error };
    }

    // Real re-injection — the userscript is gone after a fresh page load.
    await this._inject(providerId, win);

    const actualUrl = win.webContents.getURL();
    // Honest login detection: compare what we asked for against where we
    // actually ended up, not a keyword guess against the requested url —
    // the requested url can look completely unrelated to login and still
    // redirect there for real (session expiry, IP change, etc).
    const loginPatterns = /\/(login|signin|sign-in|auth|authenticate)(\/|$|\?)/i;
    const needsSignIn = loginPatterns.test(actualUrl) && !loginPatterns.test(url);

    this.sse.emit('provider.host.navigated', { providerId, requestedUrl: url, actualUrl, needsSignIn, ts: Date.now() });
    return { ok: true, providerId, requestedUrl: url, actualUrl, needsSignIn };
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
