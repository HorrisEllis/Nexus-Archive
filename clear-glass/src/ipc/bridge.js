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
const { v4: uuidv4 } = require('uuid');

class IpcBridge {
  constructor({ port, sse, ctxMgr, vault, apiSettings, urlListener, mesh, diag, fp, options, minimizeFn, hideFn, openFn, maximizeFn, openSettingsFn, closeSettingsFn, bookmarks, rewind, providerHost, userscripts, errorCapture, copilot }) {
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
    ipcMain.handle('context:switch', async (e, d) => rendererEmit('context.switch', d));
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

    // Background tabs
    ipcMain.handle('bgtab:open',  async (e, d) => require('../main/index').openBackgroundTab(d));
    ipcMain.handle('bgtab:close', async (e, d) => require('../main/index').closeBackgroundTab(d.agentId));
    ipcMain.handle('bgtab:list',  async ()    => require('../main/index').listBackgroundTabs());
    ipcMain.handle('providers:start', async (e, d) => this.providerHost?.start(d.providerId, d));
    ipcMain.handle('providers:stop',  async (e, d) => this.providerHost?.stop(d.providerId));
    ipcMain.handle('providers:show',  async (e, d) => this.providerHost?.show(d.providerId));

    // Copilot extended
    ipcMain.handle('copilot:build',    async (e, d) => rendererEmit('copilot.build', d));
    ipcMain.handle('copilot:diagnose', async (e, d) => rendererEmit('copilot.diagnose', d));
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

    // DOM events from page scripts
    ipcMain.on('dom:event',       (e, d) => emit('dom.mutations', d));
    ipcMain.on('dom:pick-result', (e, d) => emit('dom.pick.registered', d));
  }

  // ── Bookmarks ────────────────────────────────────────────────────────────
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
