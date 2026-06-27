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
const { ipcMain } = require('electron');
const { emit, on, Event, getBus } = require('../core/bus');
const { v4: uuidv4 } = require('uuid');

class IpcBridge {
  constructor({ port, sse, ctxMgr, vault, apiSettings, urlListener, mesh, diag, fp }) {
    this.port        = port;
    this.sse         = sse;
    this.ctxMgr      = ctxMgr;
    this.vault       = vault;
    this.apiSettings = apiSettings;
    this.urlListener = urlListener;
    this.mesh        = mesh;
    this.diag        = diag;
    this.fp          = fp;
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
    ipcMain.handle('copilot:send',   async (e, d) => rendererEmit('copilot.message', d));
    ipcMain.handle('context:switch', async (e, d) => rendererEmit('context.switch', d));
    ipcMain.handle('api:get',        async ()    => this.apiSettings?.getPublic());
    ipcMain.handle('api:set',        async (e, d) => this.apiSettings?.set(d));
    ipcMain.handle('sse:port',       async ()    => this.sse?.port);
    ipcMain.handle('url:listen',     async (e, d) => rendererEmit('url.listen', d));
    ipcMain.handle('mesh:spawn',     async (e, d) => rendererEmit('mesh.spawn', d));
    ipcMain.handle('mesh:route',     async (e, d) => rendererEmit('mesh.route', d));
    ipcMain.handle('diag:run',       async (e, d) => rendererEmit('diag.run', d));
    ipcMain.handle('diag:nexus',     async (e, d) => rendererEmit('diag.nexus', d));
    ipcMain.handle('status',         async ()    => { rendererEmit('status.request', {}); return { ok: true }; });

    // DOM events from page scripts
    ipcMain.on('dom:event',       (e, d) => emit('dom.mutations', d));
    ipcMain.on('dom:pick-result', (e, d) => emit('dom.pick.registered', d));
  }

  async stop() {
    return new Promise(r => { if (this.server) this.server.close(r); else r(); });
  }
}

module.exports = IpcBridge;
