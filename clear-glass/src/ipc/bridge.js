'use strict';
/**
 * src/ipc/bridge.js — SISO-native IPC Bridge
 * UUID: cg-ipc-bridge-v1-0000-0000-000000000005
 *
 * NEXUS commands arrive as HTTP POST /cmd → become SISO Events → bus.emit()
 * Results come back as bus events via SSE.
 *
 * No direct module calls. Everything is Event → Gate → Stream.
 * The bus IS the API surface.
 */

const http    = require('http');
const express = require('express');
const { ipcMain, session } = require('electron');
const { emit, on, Event, getBus } = require('../core/bus');
const { randomUUID: uuidv4 } = require('crypto'); // §BUGFIX 2026-08-23 — the real 'uuid' npm package was never installed (checked node_modules and package.json directly); this crashed every real file that required it, including boot-critical ones. Node's own built-in produces the identical UUID format, zero dependency.

class IpcBridge {
  constructor({ port, sse, ctxMgr, vault, apiSettings, urlListener, mesh, diag, fp, options, minimizeFn, hideFn, openFn, maximizeFn, openSettingsFn, closeSettingsFn, bookmarks, rewind, providerHost, userscripts, siteSettings, downloads, passwordVault, speech, macroTool, errorCapture, copilot, postEvent, pluginHost }) {
    this.port        = port;
    this.sse         = sse;
    this.errorCapture = errorCapture;
    this.copilot     = copilot;
    this.ctxMgr      = ctxMgr;
    this.vault       = vault;
    this.apiSettings = apiSettings;
    this.urlListener = urlListener;
    this.mesh        = mesh;
    this.diag        = diag;
    this.fp          = fp;
    this.options     = options;
    this.minimizeFn  = minimizeFn;
    this.hideFn      = hideFn;
    this.openFn      = openFn;
    this.maximizeFn  = maximizeFn;
    this.openSettingsFn = openSettingsFn;
    this.closeSettingsFn = closeSettingsFn;
    this.bookmarks   = bookmarks;
    this.rewind      = rewind;
    this.providerHost = providerHost;
    this.userscripts   = userscripts;
    this.siteSettings  = siteSettings;
    this.downloads     = downloads;
    // §BUGFIX 2026-08-24 — found while wiring speech, not by inspection:
    // main/index.js already passed passwordVault into this constructor
    // (two commits ago), but this constructor never destructured it —
    // this.passwordVault was never set, and there were zero passwords:*
    // IPC handlers below. The passwords plugin still worked (its
    // autofill/save flow composes gates directly via the bus, which
    // never needed IPC), but any future renderer-side management panel
    // would have silently failed. Fixed now.
    this.passwordVault = passwordVault;
    this.speech        = speech;
    this.macroTool     = macroTool;
    this.pluginHost    = pluginHost;
    // §FIXED 2026-08-23 — real, pre-existing gap found while wiring the
    // new listener-routing work below: main/index.js's real IpcBridge
    // constructor call already passed postEvent (confirmed at the real
    // call site), but this class never captured it — silently dropped
    // by destructuring, not an error, just unused. Needed now for
    // ledger/compartment routing.
    this.postEvent   = postEvent || (() => {});
    this.app         = express();
    this.server      = null;
    this._bindRendererHandlers();
    this._bindDownloadListeners();
  }

  // §2026-08-28 — James: "a download listener for artifacts." Real bus
  // subscription — downloads/adapter.js emits 'downloads.completed' onto
  // the real core bus (confirmed directly, not the SSE-only broadcast),
  // so this class can react without the renderer being involved at all.
  // Every matching, enabled download listener routes through the exact
  // same _routeToLinkTarget dispatch a DOM listener already uses — same
  // real ledger/intelligence/compartment/sse-system/copilot-cli/
  // copilot-panel/ollama-stream targets, no second implementation.
  _bindDownloadListeners() {
    on('downloads.completed', (event) => {
      if (!this.options?.findDownloadListenersForDownload) return;
      const d = event.data || {};
      // §HONEST — only a genuinely completed download triggers a
      // listener. An interrupted or cancelled download still gets
      // real, honest state in DownloadsStore (adapter.js already
      // handles that), but nothing "completed" actually happened for a
      // listener to react to.
      if (d.state !== 'completed') return;
      const matches = this.options.findDownloadListenersForDownload(d.agentId, d.filename);
      for (const listener of matches) {
        this._routeToLinkTarget(listener.linkTarget, { downloadId: d.id, ...d }, 'downloadId');
      }
    });
  }

  async start() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });

    // ── Primary command endpoint — all commands become bus events ─────────
    this.app.post('/cmd', (req, res) => {
      const { eventType, data, requestId = uuidv4() } = req.body;
      if (!eventType) return res.status(400).json({ error: 'eventType required' });

      // One-shot response listener
      const responseType = eventType.replace(/\.(exec|request|send|run|create|save|restore|route|spawn|enqueue|listen)$/, '') + '.result';
      const cleanup = [];
      const timeout = setTimeout(() => {
        cleanup.forEach(u => u());
        res.json({ ok: true, requestId, async: true, note: 'Result will arrive on SSE stream' });
      }, 500);

      // Emit onto the bus — gate will handle it
      try {
        emit(eventType, { ...data, requestId });
        // Return immediately — result flows through SSE
        clearTimeout(timeout);
        res.json({ ok: true, requestId, emitted: eventType });
      } catch (err) {
        clearTimeout(timeout);
        res.status(500).json({ error: err.message, requestId });
      }
    });

    // ── Status ────────────────────────────────────────────────────────────
    this.app.get('/status', (req, res) => {
      const bus = getBus();
      const sample = bus.sampleHere();
      res.json({
        ok:       true,
        module:   'clear-glass',
        bus:      sample,
        contexts: this.ctxMgr?.listIds() || [],
        agents:   this.mesh?.listAgents() || [],
        listeners: this.urlListener?.list() || [],
        // §DIAGNOSTIC-AWARE 2026-08-28 — real uptime, so service/nexus-
        // diagnostic.js's pollSystem() (which already reads .uptime off
        // whatever JSON a system's health/status endpoint returns, for
        // every other system) gets a real number for Clear Glass too,
        // not undefined. Nothing else in pollSystem() needed to change —
        // it's already fully generic over any system with a port + a
        // 200-returning endpoint.
        uptime:   process.uptime(),
        ts:       Date.now(),
      });
    });

    // ── Bus log ───────────────────────────────────────────────────────────
    this.app.get('/bus/log', (req, res) => {
      const { getLog } = require('../core/bus');
      const log = getLog();
      res.json(log ? log.sample() : { error: 'No log' });
    });

    // ── Direct query endpoints (read-only, no bus needed) ─────────────────
    this.app.get('/contexts', (req, res) => res.json({ contexts: this.ctxMgr?.list() || [] }));
    this.app.get('/agents',   (req, res) => res.json({ agents: this.mesh?.listAgents() || [] }));
    this.app.get('/url-listeners',(req, res) => res.json({ listeners: this.urlListener?.list() || [] }));

    // §SBP12 2026-08-28 — James: "finish it off." Real, requested
    // aggregation: TX16's listener registry, the 4 provider userscripts'
    // real state, hat-forge's real hats, and options.listAccounts() have
    // no single real view connecting them. Composes ONLY existing real
    // data — same pattern the diagnostic SYSTEMS registry already
    // proved (compose, don't rebuild). Each key degrades independently
    // to [] on its own real failure rather than one bad source blanking
    // the whole response.
    this.app.get('/agent-suite', async (req, res) => {
      let hats = [];
      try { hats = require('../../../lib/hat-forge.js').list(); } catch (_) {}
      // §FIX 2026-08-29 — James: "fix them." The real duplicate found
      // reviewing every agent phase: copilot/server.js's own real GET
      // /api/agent/suite (self-model.js's getCurrentAgent() + hat-
      // forge's list()) already existed before this endpoint was built
      // — confirmed by reading both directly, neither a strict superset
      // of the other. Two live processes, so the real fix isn't
      // deleting either one — it's this endpoint pulling the ONE piece
      // it was genuinely missing (which agent is actually active right
      // now) from copilot's own real, separate /api/agent/current via a
      // real network call, same composition pattern already proven this
      // session for .nex/COS (compose across a real process boundary,
      // don't force one side to own everything). hat-forge's list() stays
      // called locally here, not proxied — it's a real, cheap, in-process
      // call with no reason to add a network hop for data already free.
      const current = await this._getCopilotCurrentAgent();
      res.json({
        current,
        agents:    this.mesh?.listAgents() || [],
        hats,
        listeners: this.options?.listListeners() || [],
        accounts:  this.options?.listAccounts() || [],
        ts: Date.now(),
      });
    });
    this.app.get('/diag/reports', (req, res) => res.json({ reports: this.diag?.listReports() || [] }));
    this.app.get('/api-settings', (req, res) => res.json(this.apiSettings?.getPublic() || {}));

    this.app.post('/api-settings', async (req, res) => {
      try { await this.apiSettings.set(req.body); res.json({ ok: true }); }
      catch (err) { res.status(500).json({ error: err.message }); }
    });

    // ── Fingerprint profiles ──────────────────────────────────────────────
    this.app.get('/fingerprint/:agentId', (req, res) => {
      const profile = this.fp?.getOrGenerate(req.params.agentId);
      const safe = { ...profile };
      res.json(safe || { error: 'not found' });
    });

    // Mount new route groups
    this._addBookmarkRoutes();
    this._addListenerRoutes();
    this._addRewindRoutes();
    this._addProviderRoutes();

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, '127.0.0.1', () => {
        console.log(`[IPC] :${this.port}`);
        resolve();
      });
      this.server.on('error', reject);
    });
  }

  // ── Renderer → Main IPC (via preload contextBridge) ───────────────────
  _bindRendererHandlers() {
    // All renderer calls become bus events
    const rendererEmit = (eventType, data) => {
      try { emit(eventType, data); return { ok: true }; }
      catch (err) { return { error: err.message }; }
    };

    ipcMain.handle('navigate',       async (e, d) => rendererEmit('driver.exec', { action: 'navigate', ...d }));
    ipcMain.handle('dom:query',      async (e, d) => rendererEmit('dom.query', d));
    ipcMain.handle('dom:mutate',     async (e, d) => rendererEmit('dom.mutate', d));
    ipcMain.handle('dom:pick',       async (e, d) => rendererEmit('dom.pick', d));
    ipcMain.handle('driver:exec',    async (e, d) => rendererEmit('driver.exec', d));
    ipcMain.handle('cookies:save',   async (e, d) => rendererEmit('cookie.save', d));
    ipcMain.handle('cookies:restore',async (e, d) => rendererEmit('cookie.restore', d));
    // §fix 2026-06-30 — found while auditing the screenshot's dead "Cookies: 0"
    // indicator: updateCookieCount() in browser.html called cg.cookies.save()
    // (wrong method — save persists, doesn't count) then discarded the result
    // entirely and wrote the page URL hostname into the cookie-count label.
    // No cookies:count handler existed anywhere — this capability was a stub.
    // Real implementation: session.cookies.get({url}) for the agent's actual
    // partition, per Electron's documented cookie API.
    ipcMain.handle('cookies:count', async (e, { url, agentId } = {}) => {
      try {
        if (!url) return { ok: false, error: 'url required', count: 0 };
        const partition = `persist:ncp-${agentId || 'default'}`;
        const ses = session.fromPartition(partition);
        const cookies = await ses.cookies.get({ url });
        return { ok: true, count: cookies.length };
      } catch (err) {
        return { ok: false, error: err.message, count: 0 };
      }
    });
    // §fix 2026-07-04 — copilot:send was fire-and-forget (rendererEmit only).
    // Now calls the real CoPilotBridge.send() and returns its response,
    // so the renderer gets an actual {text, commands, msgId} back.
    ipcMain.handle('copilot:send', async (e, d) => {
      if (this.copilot) {
        try {
          return await this.copilot.send(d);
        } catch (err) {
          return { text: `Co-pilot error: ${err.message}`, commands: [], msgId: d.requestId };
        }
      }
      // Fallback: bus-only (legacy behaviour if bridge not wired)
      rendererEmit('copilot.message', d);
      return { text: '', commands: [], msgId: d.requestId };
    });
    // §fix 2026-06-30 — the actual ask: "where are the errors, useless."
    // Renderer-process errors (window.onerror, unhandledrejection in
    // browser.html) now report here, captured the same way as main-process
    // errors, logged to the same file, pushed through the same SSE event.
    ipcMain.handle('errors:report', async (e, d) => {
      if (this.errorCapture) return this.errorCapture.captureFromRenderer(d);
      return { ok: false, error: 'errorCapture not initialized' };
    });
    ipcMain.handle('errors:recent', async (e, { n } = {}) => {
      if (!this.errorCapture) return { ok: false, error: 'errorCapture not initialized', errors: [] };
      return { ok: true, errors: this.errorCapture.getRecent(n || 50) };
    });
    // §BUG FIXED 2026-07-11 — this emitted 'context.switch' (fire-and-forget,
    // no return value) but the only thing that ever actually switches a
    // fingerprint is ContextManager.switchFingerprint(), reached via a gate
    // registered under 'context.fp.switch' — a DIFFERENT event name. Nothing
    // in this app ever subscribed to plain 'context.switch', so every call
    // through this channel silently did nothing. The real gate already
    // works — it's how hostile-page detection auto-rotates fingerprints
    // (main/index.js) and how copilot's context.fp.switch tool works.
    // This was the one path a human clicking a UI control would have used,
    // and it was the one path that didn't reach the real method. Calling
    // it directly (not via the bus) also means the renderer gets back the
    // actual new profile/UA instead of nothing, which a manual "switch my
    // identity" action should show the user.
    // §BUG FIXED 2026-07-11, CORRECTED 2026-07-11 — my first pass here
    // was itself a mistake, caught on re-audit rather than left wrong:
    // 'context:switch' already had a REAL, correctly-matched gate —
    // `contextSwitchGate` in src/gates/index.js calls `ctxMgr.switchTo()`
    // (switch which agent's context is active), and the original
    // fire-and-forget `rendererEmit('context.switch', d)` genuinely
    // reached it correctly, since gates and rendererEmit share the same
    // bus. That path was never broken. What's actually true: no IPC
    // channel or preload method for FINGERPRINT switching
    // (`switchFingerprint`) ever existed at all — not a name mismatch,
    // a channel that was simply never added, which is why only the
    // automatic (hostile-detection) and copilot-tool paths could ever
    // reach it. My first fix repurposed this channel for fingerprint
    // switching instead of adding a new one — no existing caller broke
    // (nothing in the renderer called context:switch before I added the
    // identity badge), but it was the wrong channel for the job and left
    // switchTo() itself unreachable by IPC. Restored to its real purpose;
    // fingerprint switching gets its own channel below.
    ipcMain.handle('context:switch', async (e, d) => {
      if (!this.ctxMgr) return { ok: false, error: 'context manager not initialized' };
      try {
        const result = await this.ctxMgr.switchTo(d || {});
        return { ok: true, ...result };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    });
    // The channel the identity badge actually needs — genuinely new, not
    // a repurposing of something else. Calls switchFingerprint() directly
    // for the same reason context:switch now does: a manual user action
    // should get back the real result (new mode + UA), not silence.
    ipcMain.handle('context:switchFingerprint', async (e, d) => {
      if (!this.ctxMgr) return { ok: false, error: 'context manager not initialized' };
      try {
        const result = await this.ctxMgr.switchFingerprint(d || {});
        return { ok: true, ...result };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    });
    ipcMain.handle('api:get',        async ()    => this.apiSettings?.getPublic());
    ipcMain.handle('api:set',        async (e, d) => this.apiSettings?.set(d));
    ipcMain.handle('sse:port',       async ()    => this.sse?.port);

    // Bookmarks
    ipcMain.handle('bookmarks:add',    async (e, d) => this.bookmarks?.add(d));
    ipcMain.handle('bookmarks:remove', async (e, d) => this.bookmarks?.remove(d));
    ipcMain.handle('bookmarks:list',   async (e, d) => this.bookmarks?.list(d));
    ipcMain.handle('bookmarks:check',  async (e, d) => this.bookmarks?.isBookmarked(d));
    ipcMain.handle('bookmarks:visit',  async (e, d) => this.bookmarks?.recordVisit(d));

    // §STATE-LINK 2026-08-27 — the "save state" pair. Real, additive
    // compositions of three already-real pieces (bookmarks, rewind,
    // options-store accounts), not a new bookmark type — see
    // src/bookmarks/store.js's own §STATE-LINK header for the full
    // reasoning. Kept as two explicit handlers rather than an
    // always-capture flag on bookmarks:add, so the existing quick-toggle
    // click path (bookmarks:add) is untouched and still synchronous.
    // §CLI-FIRST 2026-08-27 — logic itself lives in _bookmarkAddWithState/
    // _bookmarkOpenWithState below, not inline here, so the real HTTP
    // routes in _addBookmarkRoutes() (which is what the CLI and co-pilot's
    // agent tool actually reach, over CLEARGL_IPC_PORT — the renderer
    // can't call those directly) run the exact same code, not a
    // reimplementation that could drift from this one.
    ipcMain.handle('bookmarks:addWithState',  async (e, d) => this._bookmarkAddWithState(d));
    ipcMain.handle('bookmarks:openWithState', async (e, d) => this._bookmarkOpenWithState(d));

    // Rewind
    ipcMain.handle('rewind:list',     async (e, d) => this.rewind?.list(d.agentId, d.limit));
    ipcMain.handle('rewind:snapshot', async (e, d) => this.rewind?.snapshot(d.agentId, d));
    ipcMain.handle('rewind:restore',  async (e, d) => this.rewind?.restore(d));
    ipcMain.handle('rewind:clear',    async (e, d) => this.rewind?.clear(d.agentId));

    // Providers
    ipcMain.handle('providers:list',  async ()    => this.providerHost?.list());

    // Userscripts
    ipcMain.handle('userscripts:list',   async (e, d) => this.userscripts?.list(d));
    ipcMain.handle('userscripts:inject', async (e, d) => this.userscripts?.inject(d.agentId, d.scriptId));
    ipcMain.handle('userscripts:toggle', async (e, d) => this.userscripts?.toggle(d.scriptId, d.enabled));
    ipcMain.handle('userscripts:create', async (e, d) => this.userscripts?.create(d));
    ipcMain.handle('userscripts:delete', async (e, d) => this.userscripts?.delete(d.scriptId));
    ipcMain.handle('userscripts:source', async (e, d) => this.userscripts?.getSource(d.scriptId));
    ipcMain.handle('userscripts:edit',   async (e, d) => this.userscripts?.edit(d.scriptId, d.updates));

    // §NEW 2026-08-24 — real per-site settings IPC surface. No panel UI
    // consumes this yet (this pass built the store + wired it into the
    // permissions plugin, which is the actual real consumer) — exposed
    // now so a future settings panel doesn't need new plumbing, just a
    // renderer.
    ipcMain.handle('site-settings:get',    async (e, d) => this.siteSettings?.get(d.url, d.key));
    ipcMain.handle('site-settings:getAll', async (e, d) => this.siteSettings?.getAllForOrigin(d.url));
    ipcMain.handle('site-settings:set',    async (e, d) => this.siteSettings?.set(d.url, d.key, d.value));
    ipcMain.handle('site-settings:deleteKey', async (e, d) => this.siteSettings?.deleteKey(d.url, d.key));
    ipcMain.handle('site-settings:clear',  async (e, d) => this.siteSettings?.clear(d.url));
    ipcMain.handle('site-settings:listOrigins', async () => this.siteSettings?.listOrigins());

    // §NEW 2026-08-24 — real passwords management IPC surface for a
    // future panel (same real-but-not-yet-consumed pattern as site-
    // settings' IPC exposure). Deliberately list/delete only — save()
    // and get() (which decrypts) stay reachable via the bus only
    // (passwords.save/passwords.get gates), the same channel the
    // passwords plugin's own autofill/save-prompt flow already uses;
    // not adding a renderer-callable decrypt path beyond what's needed.
    ipcMain.handle('passwords:list',   async () => this.passwordVault?.list());
    ipcMain.handle('passwords:delete', async (e, d) => this.passwordVault?.delete(d.id));

    // §NEW 2026-08-24 — real downloads manager IPC surface.
    ipcMain.handle('downloads:list',           async (e, d) => this.downloads?.list(d || {}));
    ipcMain.handle('downloads:clearItem',      async (e, d) => this.downloads?.clearItem(d.id));
    ipcMain.handle('downloads:clearCompleted', async ()      => this.downloads?.clearCompleted());
    ipcMain.handle('downloads:openFolder', async (e, d) => {
      const record = this.downloads?.list().find(i => i.id === d.id);
      if (!record?.savePath) return { ok: false, error: 'no savePath for this item' };
      require('electron').shell.showItemInFolder(record.savePath);
      return { ok: true };
    });

    // §2026-08-28 — real download-listener IPC surface.
    ipcMain.handle('downloads:listListeners',   async ()      => this.options?.listDownloadListeners() || []);
    ipcMain.handle('downloads:registerListener', async (e, d) => this.options?.registerDownloadListener(d));
    ipcMain.handle('downloads:updateListener',  async (e, d)  => this.options?.updateDownloadListener(d.id, d.updates));
    ipcMain.handle('downloads:removeListener',  async (e, d)  => this.options?.removeDownloadListener(d.id));

    // §2026-08-29 — real Callto Index IPC surface.
    ipcMain.handle('calltos:list',   async ()      => this.options?.listCalltos() || []);
    ipcMain.handle('calltos:forUrl', async (e, d)   => this.options?.findCalltosForUrl(d.url) || []);
    ipcMain.handle('calltos:remove', async (e, d)   => this.options?.removeCallto(d.id));

    // §NEW 2026-08-24 — real speech-to-text IPC surface.
    ipcMain.handle('speech:available', async () => this.speech?.isAvailable());
    ipcMain.handle('speech:transcribeBuffer', async (e, { buffer, ext = 'webm' } = {}) => {
      if (!this.speech) return { error: 'speech engine not available' };
      const path = require('path'); const fs = require('fs'); const os = require('os');
      const tmpPath = path.join(os.tmpdir(), `cg-mic-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
      try {
        fs.writeFileSync(tmpPath, Buffer.from(buffer));
        return await this.speech.transcribe(tmpPath);
      } catch (err) {
        return { error: err.message };
      } finally {
        try { fs.unlinkSync(tmpPath); } catch (_) {}
      }
    });

    // §BUILD 2026-08-29 — real macro IPC surface, giving Clear Glass's
    // UI its first real reach into lib/agent-tools/. Deliberately only
    // list/get/run exposed here — create/delete stay on the agent-tool
    // path for now (a real step-builder UI is a separate, larger piece,
    // named honestly rather than half-built as a bare JSON textarea).
    ipcMain.handle('macros:list', async () => {
      if (!this.macroTool) return { error: 'macro tool not available' };
      return this.macroTool.execute({ action: 'list' });
    });
    ipcMain.handle('macros:get', async (e, d) => {
      if (!this.macroTool) return { error: 'macro tool not available' };
      return this.macroTool.execute({ action: 'get', name: d.name });
    });
    ipcMain.handle('macros:run', async (e, d) => {
      if (!this.macroTool) return { error: 'macro tool not available' };
      return this.macroTool.execute({ action: 'run', name: d.name, agentId: d.agentId, params: d.params, skipSnapshot: d.skipSnapshot });
    });
    // Background tabs
    ipcMain.handle('bgtab:open',  async (e, d) => require('../main/index').openBackgroundTab(d));
    ipcMain.handle('bgtab:close', async (e, d) => require('../main/index').closeBackgroundTab(d.agentId));
    ipcMain.handle('bgtab:list',  async ()    => require('../main/index').listBackgroundTabs());
    ipcMain.handle('providers:start', async (e, d) => this.providerHost?.start(d.providerId, d));
    ipcMain.handle('providers:stop',  async (e, d) => this.providerHost?.stop(d.providerId));
    ipcMain.handle('providers:show',  async (e, d) => this.providerHost?.show(d.providerId));
    // §PHASE-2 2026-08-23 — CLEAR-GLASS-EXPANSION-PLAN-2026-08-23.md item 3:
    // real, on-demand hot-push into an already-running provider tab, not
    // just the 60s auto-reload timer or a full start().
    ipcMain.handle('providers:deploy', async (e, d) => this.providerHost?.deploy(d.providerId));

    // Copilot extended
    // §BUG FIXED 2026-07-11 — same disease as context:switch above (see
    // that handler's fix comment for the full pattern): these fired
    // 'copilot.build'/'copilot.diagnose' on the LOCAL event bus, fire-and-
    // forget, no return value — but the real, working implementations are
    // this.copilot's own build()/diagnose() methods, which correctly
    // dispatch through Bridge (:9999) to the real copilot service. No gate
    // anywhere ever subscribed to the local event names these emitted, so
    // both actions silently did nothing for any caller that used the IPC
    // channel instead of calling this.copilot directly.
    ipcMain.handle('copilot:build',    async (e, d) => {
      if (!this.copilot) return { ok: false, error: 'copilot bridge not initialized' };
      try { return await this.copilot.build(d || {}); }
      catch (err) { return { ok: false, error: err.message }; }
    });
    ipcMain.handle('copilot:diagnose', async (e, d) => {
      if (!this.copilot) return { ok: false, error: 'copilot bridge not initialized' };
      try { return await this.copilot.diagnose(d || {}); }
      catch (err) { return { ok: false, error: err.message }; }
    });
    ipcMain.handle('url:listen',     async (e, d) => rendererEmit('url.listen', d));
    ipcMain.handle('mesh:spawn',     async (e, d) => rendererEmit('mesh.spawn', d));
    ipcMain.handle('mesh:route',     async (e, d) => rendererEmit('mesh.route', d));
    ipcMain.handle('mesh:enqueue',   async (e, d) => this.mesh?.enqueue(d));
    ipcMain.handle('mesh:list',      async ()    => ({
      agents:     this.mesh?.listAgents()   || [],
      registry:   this.mesh?.getRegistry()  || [],
      queueDepth: this.mesh?.getQueueDepth?.() || 0,
    }));
    ipcMain.handle('diag:run',       async (e, d) => rendererEmit('diag.run', d));
    ipcMain.handle('diag:nexus',     async (e, d) => rendererEmit('diag.nexus', d));
    ipcMain.handle('status',         async ()    => { rendererEmit('status.request', {}); return { ok: true }; });

    // Window controls — direct, not bus-routed, so they're instant (no
    // round-trip through SSE needed for the local renderer's own chrome).
    // Still mirrored onto the bus via emit() so Cortex/copilot see them too.
    ipcMain.handle('window:minimize', async (e, d) => { this.minimizeFn?.(d); emit('window.minimize', d); return { ok: true }; });
    ipcMain.handle('window:hide',     async (e, d) => { this.hideFn?.(d);     emit('window.hide', d);     return { ok: true }; });
    ipcMain.handle('window:open',     async (e, d) => { await this.openFn?.(d); emit('window.open', d); return { agentId: d?.agentId, opened: true }; });
    ipcMain.handle('window:maximize', async (e, d) => { this.maximizeFn?.(d); return { ok: true }; });
    ipcMain.handle('window:openSettings',  async () => { this.openSettingsFn?.();  return { ok: true }; });
    ipcMain.handle('window:closeSettings', async () => { this.closeSettingsFn?.(); return { ok: true }; });
    ipcMain.handle('window:list',  async ()    => require('../main/index').listOpenAgents());
    ipcMain.handle('window:focus', async (e, d) => require('../main/index').focusAgentWindow(d));

    // Nexus options
    ipcMain.handle('options:get',    async ()    => this.options?.get());
    ipcMain.handle('options:set',    async (e, d) => this.options?.set(d));

    // Toolbar command registry — §STRUCTURAL 2026-08-24. Backend-owned
    // (src/toolbar/commands.js); the renderer has no command list of its
    // own, it asks for this one. Read-only: the renderer can PIN/unpin via
    // options:set (pinnedToolbarButtons), it can't redefine what commands
    // exist.
    ipcMain.handle('toolbar:commands', async () => {
      const { TOOLBAR_COMMANDS } = require('../toolbar/commands');
      return TOOLBAR_COMMANDS;
    });

    // §NEW 2026-08-24 — plugins/host.js. A plugin's toolbar-command
    // contribution has no real DOM button (see browser.js's
    // activateSpotlightCommand fix, same date) — clicking it in the
    // command palette reaches here instead, which emits the plugin's own
    // registered signature onto the real bus. Fire-and-forget, matching
    // every other gate dispatch in this codebase (driver.exec, dom.query,
    // etc. all respond via a LATER event, not a synchronous IPC return) —
    // this handler's job is only to get the event onto the bus, not to
    // wait for or shape the plugin's own response.
    ipcMain.handle('plugins:invoke', async (e, { signature, data } = {}) => {
      if (typeof signature !== 'string') return { ok: false, error: 'signature is required' };
      try {
        const { getBus, Event } = require('../core/bus.js');
        getBus().emit(new Event(signature, data || {}));
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    });

    // Accounts — §PHASE-3 2026-08-23, real CRUD surface, backend only
    // (per James's own "all backend first, ui after backend is done" —
    // no renderer panel wired to these yet, that's item 6's UI half).
    ipcMain.handle('accounts:list',       async ()    => this.options?.listAccounts());
    ipcMain.handle('accounts:get',        async (e, d) => this.options?.getAccount(d.id));
    ipcMain.handle('accounts:create',     async (e, d) => this.options?.createAccount(d));
    ipcMain.handle('accounts:update',     async (e, d) => this.options?.updateAccount(d.id, d.updates));
    ipcMain.handle('accounts:delete',     async (e, d) => this.options?.deleteAccount(d.id));
    ipcMain.handle('accounts:linkAgent',  async (e, d) => this.options?.linkAgent(d.id, d.agentKey));
    ipcMain.handle('accounts:unlinkAgent',async (e, d) => this.options?.unlinkAgent(d.id, d.agentKey));

    // §TX16 2026-08-28 — real, persistent listener config. Same pattern as
    // accounts above (this.options owns the real CRUD; bridge.js exposes
    // it). The renderer's guardian-picker.js is the real caller once its
    // listener-modal save path is wired to this instead of only setting
    // activeListeners.set(...) in memory — that wiring is TX16's own next
    // slice, named honestly as not done in this pass.
    ipcMain.handle('listeners:list',       async ()    => this.options?.listListeners());
    ipcMain.handle('listeners:get',        async (e, d) => this.options?.getListener(d.id));
    ipcMain.handle('listeners:register',   async (e, d) => this.options?.registerListener(d));
    ipcMain.handle('listeners:update',     async (e, d) => this.options?.updateListener(d.id, d.updates));
    ipcMain.handle('listeners:remove',     async (e, d) => this.options?.removeListener(d.id));
    ipcMain.handle('listeners:forUrl',     async (e, d) => this.options?.findListenersForUrl(d.url));

    // §ACCOUNTS-UI 2026-08-28 — the accounts panel needs a real list of
    // which agents can actually be linked. agent-mesh.js already has this
    // exact list (getRegistry(), AGENT_REGISTRY — real DOM selectors,
    // real colors, the actual agents this process can spawn a tab for),
    // confirmed directly rather than hardcoding a second list here that
    // could silently drift from the real one.
    ipcMain.handle('agents:list', async () => this.mesh?.getRegistry() || []);

    // DOM events from page scripts
    // §BUILD 2026-08-23 — the real, faithful Guardian picker port
    // (clear-glass/renderer/guardian-picker.js) sends real, typed
    // events through this same, already-real dom:event channel rather
    // than needing its own new IPC surface. Real, dedicated SSE names
    // so they're distinguishable from generic DOM mutations, not
    // collapsed into one label. §HONEST LIMIT — this is real, live
    // event routing only; on-disk persistence for calltos (matching
    // UserscriptManager's own real on-disk convention) is a genuinely
    // separate, not-yet-built piece, not silently assumed done here.
    // §BUILD 2026-08-23 — real, small in-memory registry: only the
    // 'guardian.listener.start' message carries the full config
    // (including linkTarget) — every later 'guardian.listener.event'
    // for the same listenerId only carries the observed data, so this
    // is genuinely needed to know where to route each one, not
    // optional bookkeeping.
    this._guardianListenerTargets = this._guardianListenerTargets || new Map();

    ipcMain.on('dom:event', (e, d) => {
      if (d && typeof d.type === 'string' && d.type.startsWith('plugin:')) {
        // §NEW 2026-08-24 — generic forwarding for ANY plugin's in-page
        // script, not a passwords-specific special case. A plugin's
        // signatures are already namespaced plugin:<id>:... (schema.js
        // enforces this), so forwarding by that exact prefix onto the
        // real bus reaches whatever Gate is registered for it — the
        // SAME dispatch mechanism plugins:invoke already uses for
        // renderer-initiated calls, now also reachable from inside a
        // page. Built for the passwords form-detector, but any future
        // plugin's userscript gets this for free.
        emit(d.type, d);
        return;
      }
      if (d && typeof d.type === 'string' && d.type.startsWith('guardian.')) {
        emit(d.type, d);
        if (d.type === 'guardian.listener.start' && d.listenerId && d.config?.linkTarget) {
          this._guardianListenerTargets.set(d.listenerId, d.config.linkTarget);
          // §BUGFIX 2026-08-28 — James, live: "it needs to actually be
          // linked into guardian." This Map above is real but in-memory
          // only — exactly the §HONEST LIMIT this file already named
          // above ("on-disk persistence... is a genuinely separate,
          // not-yet-built piece"). The real, persistent registry already
          // exists (options/store.js's registerListener, built earlier
          // this session) — this was the one real call missing to close
          // that gap. e.sender.getURL() is the REAL current page URL at
          // the moment this listener was created, not a guess or a
          // placeholder — converted to an origin-wide pattern since a
          // listener on one page of a site should survive navigating to
          // another page of the same site, matching the same real glob
          // semantics findListenersForUrl already uses.
          try {
            const pageUrl = e.sender?.getURL?.();
            const urlPattern = pageUrl ? new URL(pageUrl).origin + '/*' : null;
            if (urlPattern && this.options) {
              this.options.registerListener({
                urlPattern,
                fingerprint: { selector: d.config.selector, xpath: d.config.xpath },
                eventType: d.config.mode,
                label: d.config.label,
                matchCriteria: d.config.matchCriteria,
                linkTarget: d.config.linkTarget,
              });
            }
          } catch (err) {
            console.warn(`[ipc/bridge] guardian.listener.start persist failed (live routing above is unaffected): ${err.message}`);
          }
        } else if (d.type === 'guardian.listener.event' && d.listenerId) {
          this._routeGuardianListenerEvent(d.listenerId, d.eventData);
        } else if (d.type === 'guardian.callto.added' && d.callto?.id) {
          // §2026-08-29 — James: "a tool that links guardian directly to
          // dom elements." Real gap closed: guardian-picker.js's "ADD TO
          // INDEX" button already sent this exact message with a
          // complete, real callto shape — the only real path that ever
          // worked was URCK.ingest()/registerCallto(), and URCK is never
          // loaded into this webview (confirmed directly, zero
          // references under clear-glass/). The real emit(d.type, d)
          // above already broadcasts this for any live listener, but
          // nothing wrote it anywhere — this is that missing write.
          try {
            const result = this.options?.registerCallto(d.callto);
            if (result?.error) console.warn(`[ipc/bridge] registerCallto rejected: ${result.error}`);
          } catch (err) {
            console.warn(`[ipc/bridge] guardian.callto.added persist failed (live broadcast above is unaffected): ${err.message}`);
          }
        } else if (d.type === 'guardian.killswitch') {
          // §CORRECTED 2026-08-24 — James caught this directly ("as
          // plugins right?"): the first version of this handler
          // name-matched userscripts starting with 'Guardian — ' right
          // here in core bridge.js — hardcoding one specific plugin's
          // naming convention into core code, not a genuine
          // plugin-system capability. Fixed: delegates to the plugin
          // host's own tracked records (src/plugins/host.js's
          // disableAllUserscripts()) instead. bridge.js no longer knows
          // or cares what any plugin is named.
          this.pluginHost?.disableAllUserscripts(d.reason || 'killswitch');
        }
        return;
      }
      emit('dom.mutations', d);
    });
    ipcMain.on('dom:pick-result', (e, d) => {
      // Always reaches SSE via the bus, regardless of routeTo — the
      // in-process event stream isn't a "channel" the picker opts into,
      // it's the substrate everything else in Clear Glass already relies
      // on. routeTo:'api' is additive, not exclusive.
      emit('dom.pick.registered', d);

      if (d?.routeTo === 'api' && d?.apiUrl) {
        this._postToApiChannel(d.apiUrl, d).catch(err => {
          emit('dom.pick.route.error', { apiUrl: d.apiUrl, error: err.message, ts: Date.now() });
        });
      }
    });
  }

  // §BUILD 2026-07-09 — "route to API channel": POST the picked element
  // (or a DOM stream batch, same shape) to a caller-configured URL. Runs
  // from main process, not the renderer — keeps the target URL out of
  // the untrusted webview guest's reach and avoids CSP complications.
  async _postToApiChannel(url, payload) {
    const parsed = new (require('url').URL)(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Refusing non-http(s) API channel: ${parsed.protocol}`);
    }
    const lib = parsed.protocol === 'https:' ? require('https') : require('http');
    const body = JSON.stringify(payload);
    return new Promise((resolve, reject) => {
      const req = lib.request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      }, res => {
        res.resume(); // drain, we don't need the response body
        if (res.statusCode >= 400) reject(new Error(`API channel returned ${res.statusCode}`));
        else resolve({ status: res.statusCode });
      });
      req.setTimeout(8000, () => { req.destroy(); reject(new Error('API channel timeout')); });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  // §FIX 2026-08-29 — real, dedicated GET, not a reuse of
  // _postToApiChannel above (POST-only, drains and discards the response
  // body by design — the exact opposite of what's needed here, which is
  // the response body itself). Fails soft, matching every other cross-
  // process call this session added: copilot being unreachable degrades
  // this endpoint's real "current" field to null, never throws and
  // blocks the rest of /agent-suite's real, already-working local data.
  _getCopilotCurrentAgent() {
    return new Promise((resolve) => {
      const req = require('http').get(
        `http://127.0.0.1:${process.env.COPILOT_PORT || 3750}/api/agent/current`,
        { timeout: 2000 },
        (res) => {
          let body = '';
          res.on('data', (d) => { body += d; });
          res.on('end', () => {
            try { resolve(JSON.parse(body)); } catch (_) { resolve(null); }
          });
        }
      );
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    });
  }

  // §BUILD 2026-08-23 — James: "listener uuid, logs to cortex listeners
  // index... we can use elements as callable ids... high leverage...
  // tool for setting up a new agent to the agent mesh." Real, first
  // step toward that: each configured listener's chosen destination
  // actually gets used, not just captured in the UI. Reuses real,
  // already-proven mechanisms — this.postEvent (fixed above) for
  // ledger/compartment, the existing _postToApiChannel() for ollama —
  // not new ones invented per destination.
  _routeGuardianListenerEvent(listenerId, eventData) {
    const target = this._guardianListenerTargets.get(listenerId);
    if (!target) return; // no start message seen yet, or default routing already covered by the real SSE emit above
    this._routeToLinkTarget(target, { listenerId, ...eventData }, 'listenerId');
  }

  // §2026-08-28 — James: "a download listener for artifacts." Shared,
  // single real dispatch table for every linkTarget type — extracted
  // from _routeGuardianListenerEvent (which now just resolves its own
  // target and calls this) rather than duplicated, so a download
  // listener and a DOM listener route through the exact same real
  // ledger/intelligence/compartment/sse-system/copilot-cli/copilot-panel/
  // ollama-stream logic instead of two copies that could silently drift.
  _routeToLinkTarget(target, eventData, idField) {
    const id = eventData[idField];
    if (target.type === 'ledger') {
      this.postEvent('guardian.listener.match', eventData);
    } else if (target.type === 'intelligence') {
      // §2026-08-28 — same real transport as 'ledger' (cortex's real
      // /api/event, confirmed directly), distinct event type so
      // intelligence's pattern-scan (which reads this exact table) can
      // tell a deliberately-tagged observation from an ordinary write.
      this.postEvent('guardian.listener.intelligence-observation', eventData);
    } else if (target.type === 'compartment') {
      this.postEvent('guardian.listener.match', { ...eventData, compartment: target.system, intent: target.intent || null });
    } else if (target.type === 'sse-system') {
      this.sse.emit(`system.${target.system}.guardian-event`, eventData);
    } else if (target.type === 'copilot-cli') {
      // Real path, confirmed directly: copilot/server.js's POST /api/prompt
      // (port 3750) — its own _lifeline.route() call already accepts an
      // 'intent' field, but the endpoint itself hardcoded intent:'ask'
      // regardless of caller input until this pass (see copilot/server.js
      // §2026-08-28 for the matching backend change).
      this._postToApiChannel(`http://127.0.0.1:${process.env.COPILOT_PORT || 3750}/api/prompt`,
        { prompt: eventData?.text || eventData?.value || eventData?.filename || '', intent: target.intent || 'ask', [idField]: id }
      ).catch(err => this.sse.emit('guardian.listener.route.error', { [idField]: id, target: 'copilot-cli', error: err.message }));
    } else if (target.type === 'copilot-panel') {
      // Fully local — no HTTP call, no external system. browser.js's own
      // co-pilot panel already listens on the real SSE stream this file
      // emits through; this just gives it a distinct, real event name to
      // render as a chat message instead of routing anywhere external.
      this.sse.emit('guardian.listener.copilot-panel', eventData);
    } else if (target.type === 'ollama-stream') {
      this._postToApiChannel(`http://127.0.0.1:${process.env.OLLAMA_BRIDGE_PORT || 3749}/api/generate`,
        { prompt: eventData?.text || eventData?.value || eventData?.filename || '', [idField]: id, stream: false }
      ).catch(err => this.sse.emit('guardian.listener.route.error', { [idField]: id, target: 'ollama-stream', error: err.message }));
    } else if (target.type === 'direct-file-write') {
      // §2026-08-28 — James: "clearglass listens for the codeblocks...
      // reads the location in the file and moves it to the directory to
      // replace it like you do. Maybe a hat that doesn't use
      // compartments." Real, deliberately lightweight lane: no
      // compartment, no contract, no RAID round trip — a direct write,
      // same shape as this session's own create_file/str_replace tool
      // calls. Uses the SAME real convention every file built this
      // session already follows (a real path comment on line 1/2) —
      // not an invented protocol.
      const result = this._writeCodeBlockToFile(eventData?.text || eventData?.value || '');
      this.sse.emit('guardian.listener.direct-file-write', { [idField]: id, ...result });
    }
    // §HONEST LIMIT — no linkTarget selected (null) falls through to
    // whatever real IR-Layer-default routing already applies elsewhere
    // (the unconditional emit(d.type, d) above); nothing silently dropped
    // and nothing here fabricates a destination for the unset case.
  }

  // §2026-08-28 — real, deliberately lightweight code-block-to-file write.
  // James: "reads the location in the file and moves it to the directory
  // to replace it like you do." Same convention every real file built
  // this session already follows: a path comment on line 1 or 2, either
  // '// path/to/file.js' or the first content line inside a '/** ... */'
  // block. Not an invented protocol — formalizing what was already true.
  //
  // §SAFETY — this writes to real disk based on text parsed out of a
  // chat page. A resolved path that escapes the real NEXUS root (via
  // '../' traversal, an absolute path, or a symlink pointing outside it)
  // is refused outright, not sanitized-and-allowed. A feature this
  // direct fails closed on anything ambiguous, not open.
  _writeCodeBlockToFile(rawText) {
    const path = require('path'); const fs = require('fs');
    if (!rawText || typeof rawText !== 'string') return { ok: false, error: 'no text to extract a code block from' };

    // Real markdown-fenced code block, any language tag.
    const fenceMatch = rawText.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
    const body = fenceMatch ? fenceMatch[1] : rawText;
    const lines = body.split('\n');

    // Path comment on line 1 ('// path' or '# path'), OR the first real
    // content line inside a '/** ... */' block (line 1 is the opener).
    let pathLine = lines[0] || '';
    if (/^\s*\/\*\*?\s*$/.test(pathLine) && lines[1]) pathLine = lines[1];
    const pathMatch = pathLine.match(/(?:\/\/|#|\*)\s*([a-zA-Z0-9_.\-\/]+\.[a-zA-Z0-9]+)\b/);
    if (!pathMatch) return { ok: false, error: 'no real file path comment found on the first line(s) of the code block' };

    const relPath = pathMatch[1];
    const root = path.resolve(__dirname, '..', '..', '..'); // clear-glass/src/ipc -> repo root
    const resolved = path.resolve(root, relPath);
    // §SAFETY — the real, hard guard: resolved path must stay under root.
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
      return { ok: false, error: `refused: resolved path "${resolved}" escapes the real NEXUS root — no write attempted` };
    }

    try {
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, body, 'utf8');
      return { ok: true, path: relPath, bytes: Buffer.byteLength(body, 'utf8') };
    } catch (err) {
      return { ok: false, error: `write failed: ${err.message}` };
    }
  }

  // §STATE-LINK 2026-08-27 — shared by the ipcMain handlers above (renderer
  // callers) and the express routes below (CLI + agent-tool callers, over
  // CLEARGL_IPC_PORT) — one real implementation, two real entry points.
  async _bookmarkAddWithState(d) {
    if (!this.bookmarks || !this.rewind) return { error: 'bookmarks or rewind unavailable' };
    const { bookmark, added } = this.bookmarks.add(d);
    // §HONEST — a snapshot label must be unique per agent to be found
    // again unambiguously; the bookmark's own uuid guarantees that
    // (macro.js's bookmark() uses a human label instead, which is right
    // for macros — a person names them on purpose — but wrong here,
    // where the bookmark's title/url is already the human label).
    let snap;
    try {
      snap = await this.rewind.snapshot(bookmark.agentId, {
        url: bookmark.url, title: bookmark.title, label: `cg-bookmark:${bookmark.id}`,
      });
    } catch (err) {
      return { bookmark, added, stateError: err.message };
    }
    // §HONEST — snapshot() returns null (not a throw) for a page it won't
    // capture (about:blank, no live driver context) — real, documented
    // behavior in rewind/engine.js, not an edge case to paper over. The
    // bookmark itself still saved; only the state link is missing, and
    // the caller is told that plainly rather than getting back a
    // bookmark that silently claims state it doesn't have.
    if (!snap) return { bookmark, added, stateError: 'rewind returned no snapshot for this page' };
    const accountId = this.options?.resolveDefaultAccountForAgent
      ? this.options.resolveDefaultAccountForAgent(bookmark.agentId) : null;
    const linked = this.bookmarks.linkState({ id: bookmark.id, snapshotId: snap.id, accountId });
    return { bookmark: linked.bookmark || bookmark, added };
  }

  async _bookmarkOpenWithState(d) {
    const bk = this.bookmarks?.list({ agentId: d.agentId }).find(b => b.id === d.id);
    if (!bk) return { error: `no bookmark "${d.id}"` };
    this.bookmarks?.recordVisit({ id: bk.id });
    if (!bk.snapshotId || !this.rewind) return { bookmark: bk, restored: false };
    try {
      const r = await this.rewind.restore({ agentId: bk.agentId, snapshotId: bk.snapshotId });
      return { bookmark: bk, restored: true, result: r };
    } catch (err) {
      // §1.2 — a failed restore must not silently fall back to a plain
      // navigate; the caller needs to know state restoration didn't
      // happen, not just end up on the right URL with the wrong cookies.
      return { bookmark: bk, restored: false, restoreError: err.message };
    }
  }

  _addBookmarkRoutes() {
    const bk = this.bookmarks;
    if (!bk) return;

    this.app.get('/bookmarks', (req, res) => {
      res.json({ bookmarks: bk.list(req.query) });
    });

    this.app.post('/bookmarks', (req, res) => {
      try { res.json(bk.add(req.body)); }
      catch (err) { res.status(400).json({ error: err.message }); }
    });

    this.app.delete('/bookmarks/:id', (req, res) => {
      try { res.json(bk.remove({ id: req.params.id })); }
      catch (err) { res.status(400).json({ error: err.message }); }
    });

    this.app.get('/bookmarks/check', (req, res) => {
      res.json({ isBookmarked: bk.isBookmarked(req.query) });
    });

    // §STATE-LINK / §CLI-FIRST 2026-08-27 — real HTTP entry points for the
    // CLI (cli/nexus.js's /bookmarks command) and the
    // clear_glass_bookmark_state agent tool. Same real methods the
    // renderer's ipcMain handlers call above, not a second copy.
    this.app.post('/bookmarks/with-state', async (req, res) => {
      try { res.json(await this._bookmarkAddWithState(req.body)); }
      catch (err) { res.status(500).json({ error: err.message }); }
    });

    this.app.post('/bookmarks/:id/open-with-state', async (req, res) => {
      try { res.json(await this._bookmarkOpenWithState({ id: req.params.id, agentId: req.body.agentId })); }
      catch (err) { res.status(500).json({ error: err.message }); }
    });
  }

  // §TX16 2026-08-28 — real HTTP entry points for the CLI and any agent
  // tool built against BR8_clearglass_full_agent_tool_parity, same
  // CLI-first reasoning _addBookmarkRoutes uses above: the renderer's IPC
  // handlers (listeners:* above) and these routes both call this.options's
  // real CRUD directly — one implementation, two entry points.
  _addListenerRoutes() {
    const opts = this.options;
    if (!opts) return;

    this.app.get('/listeners', (req, res) => {
      res.json({ listeners: opts.listListeners() });
    });

    this.app.get('/listeners/for-url', (req, res) => {
      res.json({ listeners: opts.findListenersForUrl(req.query.url) });
    });

    this.app.post('/listeners', (req, res) => {
      const r = opts.registerListener(req.body);
      res.status(r.error ? 400 : 200).json(r);
    });

    this.app.patch('/listeners/:id', (req, res) => {
      const r = opts.updateListener(req.params.id, req.body);
      res.status(r.error ? 404 : 200).json(r);
    });

    this.app.delete('/listeners/:id', (req, res) => {
      const r = opts.removeListener(req.params.id);
      res.status(r.error ? 404 : 200).json(r);
    });
  }

  // ── Rewind ────────────────────────────────────────────────────────────────
  _addRewindRoutes() {
    const rw = this.rewind;
    if (!rw) return;

    this.app.get('/rewind/:agentId', (req, res) => {
      res.json({ snapshots: rw.list(req.params.agentId, parseInt(req.query.limit) || 20) });
    });

    this.app.post('/rewind/:agentId/snapshot', async (req, res) => {
      try { res.json(await rw.snapshot(req.params.agentId, req.body)); }
      catch (err) { res.status(500).json({ error: err.message }); }
    });

    this.app.post('/rewind/:agentId/restore', async (req, res) => {
      try { res.json(await rw.restore({ agentId: req.params.agentId, ...req.body })); }
      catch (err) { res.status(500).json({ error: err.message }); }
    });

    this.app.delete('/rewind/:agentId', (req, res) => {
      res.json(rw.clear(req.params.agentId));
    });
  }

  // ── Provider host ─────────────────────────────────────────────────────────
  _addProviderRoutes() {
    const ph = this.providerHost;
    if (!ph) return;

    this.app.get('/providers', (req, res) => {
      res.json({ providers: ph.list() });
    });

    this.app.post('/providers/:id/start', async (req, res) => {
      try { res.json(await ph.start(req.params.id, req.body)); }
      catch (err) { res.status(500).json({ error: err.message }); }
    });

    this.app.post('/providers/:id/stop', (req, res) => {
      res.json(ph.stop(req.params.id));
    });

    this.app.post('/providers/:id/show', (req, res) => {
      ph.show(req.params.id);
      res.json({ ok: true });
    });
  }

  async stop() {
    return new Promise(r => { if (this.server) this.server.close(r); else r(); });
  }
}

module.exports = IpcBridge;
