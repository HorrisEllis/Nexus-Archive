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
  constructor({ port, sse, ctxMgr, vault, apiSettings, urlListener, mesh, diag, fp, options, minimizeFn, hideFn, openFn, maximizeFn, openSettingsFn, closeSettingsFn, bookmarks, rewind, providerHost, userscripts, siteSettings, downloads, errorCapture, copilot, postEvent, pluginHost }) {
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
    this.app.get('/listeners',(req, res) => res.json({ listeners: this.urlListener?.list() || [] }));
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
    ipcMain.handle('site-settings:clear',  async (e, d) => this.siteSettings?.clear(d.url));
    ipcMain.handle('site-settings:listOrigins', async () => this.siteSettings?.listOrigins());

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
        } else if (d.type === 'guardian.listener.event' && d.listenerId) {
          this._routeGuardianListenerEvent(d.listenerId, d.eventData);
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

    if (target.type === 'ledger') {
      this.postEvent('guardian.listener.match', { listenerId, ...eventData });
    } else if (target.type === 'compartment') {
      this.postEvent('guardian.listener.match', { listenerId, compartment: target.system, ...eventData });
    } else if (target.type === 'sse-system') {
      this.sse.emit(`system.${target.system}.guardian-event`, { listenerId, ...eventData });
    } else if (target.type === 'ollama-stream') {
      this._postToApiChannel(`http://127.0.0.1:${process.env.OLLAMA_BRIDGE_PORT || 3749}/api/generate`,
        { prompt: eventData?.text || eventData?.value || '', listenerId, stream: false }
      ).catch(err => this.sse.emit('guardian.listener.route.error', { listenerId, target: 'ollama-stream', error: err.message }));
    }
    // §HONEST LIMIT, unchanged from this same port's earlier note —
    // bridge/callto/url/nexus targets have real UI and are captured in
    // config, but nothing executes them yet, here or client-side. Only
    // ledger/compartment/sse-system/ollama-stream (added this pass) are
    // genuinely wired end to end.
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
