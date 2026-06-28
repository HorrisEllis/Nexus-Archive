'use strict';
/**
 * src/copilot/bridge.js — Clear Glass Co-pilot Full Integration v3
 * UUID: cg-copilot-bridge-v3-0000-0000-000000000024
 *
 * Co-pilot is fully hooked in. It can:
 *   - Call every tool in src/copilot/tools.js via the SISO bus
 *   - Dispatch jobs to Guardian (provider dispatch, SEAM, gaps)
 *   - Query Cortex (memory, CFR, RAID, gaps, event log)
 *   - Control the browser (navigate, click, type, screenshot, DOM)
 *   - Manage agents (contexts, fingerprints, mesh, providers)
 *   - Manage session state (bookmarks, rewind, cookies)
 *   - Install/toggle userscripts
 *   - Set options, run diagnostics, add URL listeners
 *
 * Routes:
 *   1. NEXUS copilot :3750/api/prompt — primary, full consciousness stream
 *   2. Direct fallback — only if copilot is down AND fallbackApiKey is set
 *
 * Tool execution:
 *   Co-pilot responses are scanned for ```driver and ```tool blocks.
 *   Each block is dispatched via the SISO bus as events.
 *   Guardian-specific tools are dispatched directly to Guardian :7820.
 *   Cortex tools are dispatched directly to Cortex :3748.
 */

const http   = require('http');
const fetch  = require('node-fetch');
const { randomUUID } = require('crypto');
const { buildToolsPrompt } = require('./tools');

class CoPilotBridge {
  constructor({ sse, apiSettings, postEvent }) {
    this.sse         = sse;
    this.settings    = apiSettings; // ApiSettings instance — has .copilotUrl(), .guardianUrl() etc.
    this.postEvent   = postEvent || (() => {});

    this._busEmit    = null;  // injected by main
    this._domGet     = null;  // injected by main
    this._streamConn = null;
    this._connected  = false;

    // These are injected after bootstrap for tool execution
    this._driver     = null;
    this._bookmarks  = null;
    this._rewind     = null;
    this._vault      = null;
    this._ctxMgr     = null;
    this._userscripts= null;
    this._providerHost = null;
  }

  // ── Wire everything in after bootstrap ──────────────────────────────────
  wire({ busEmit, domGet, driver, bookmarks, rewind, vault, ctxMgr, userscripts, providerHost }) {
    this._busEmit      = busEmit;
    this._domGet       = domGet;
    this._driver       = driver;
    this._bookmarks    = bookmarks;
    this._rewind       = rewind;
    this._vault        = vault;
    this._ctxMgr       = ctxMgr;
    this._userscripts  = userscripts;
    this._providerHost = providerHost;

    this._connectStream();
    this._bridgeBrowserEvents();
  }

  // ── Primary: send message ────────────────────────────────────────────────
  async send({ message, agentId = 'default', domContext, systemExtra, requestId }) {
    const msgId = requestId || randomUUID();
    this.sse.emit('copilot.thinking', { msgId, agentId, ts: Date.now() });

    // Always get live DOM context
    if (!domContext && this._domGet) {
      try { domContext = await this._domGet(agentId); } catch (_) {}
    }

    let result;
    const copilotUrl = this.settings.copilotUrl('/api/prompt');
    try {
      result = await this._callNexusCopilot({ message, agentId, domContext, systemExtra, msgId, copilotUrl });
    } catch (err) {
      console.warn('[CoPilot] NEXUS offline, falling back:', err.message);
      result = await this._callFallback({ message, agentId, domContext, msgId });
    }

    const text     = result.text || '';
    const commands = this._parseCommands(text);

    // Execute all tool calls
    for (const cmd of commands) {
      await this._executeCommand(cmd, agentId).catch(err => {
        console.warn(`[CoPilot] Command failed [${cmd.action}]:`, err.message);
        this.sse.emit('copilot.tool.error', { action: cmd.action, error: err.message, agentId });
      });
    }

    this.sse.emit('copilot.response', {
      msgId, agentId, text, commands,
      modelUsed:  result.modelUsed || 'unknown',
      contextLayers: result.contextLayers || 0,
      ts: Date.now(),
    });

    this._ingestToNexus({ type: 'clear-glass.copilot.exchange',
      agentId, msgId, prompt: message.slice(0, 100), ts: Date.now() });

    return { text, commands, msgId };
  }

  // ── Execute a tool command via bus or direct call ──────────────────────
  async _executeCommand(cmd, agentId) {
    const action = cmd.action;
    const aid    = cmd.agentId || agentId;

    this.sse.emit('copilot.tool.start', { action, agentId: aid, ts: Date.now() });

    // ── Guardian tools — direct to Guardian :7820 ──────────────────────
    if (action === 'guardian.dispatch') {
      return this._guardianDispatch(cmd);
    }
    if (action === 'guardian.providers') {
      return this._guardianFetch('/providers');
    }
    if (action === 'guardian.jobs') {
      return this._guardianFetch('/jobs');
    }
    if (action === 'guardian.seam') {
      return this._guardianFetch('/seam/queues');
    }
    if (action === 'guardian.gaps') {
      return this._guardianFetch('/gaps');
    }
    if (action === 'guardian.health') {
      return this._guardianFetch('/health');
    }

    // ── Cortex tools — direct to Cortex :3748 ─────────────────────────
    if (action === 'cortex.memory') {
      return this._cortexFetch('/api/memory', cmd);
    }
    if (action === 'cortex.gaps') {
      return this._cortexFetch('/api/gaps', cmd);
    }
    if (action === 'cortex.cfr') {
      return this._cortexFetch('/cfr/health', cmd);
    }
    if (action === 'cortex.raid') {
      return this._cortexFetch('/api/raid/health', cmd);
    }
    if (action === 'cortex.event') {
      return this._cortexPost('/api/event', cmd);
    }

    // ── Userscript tools ───────────────────────────────────────────────
    if (action === 'userscript.list') {
      return this._userscripts?.list({ agentId: aid });
    }
    if (action === 'userscript.inject' && cmd.scriptId) {
      return this._userscripts?.inject(aid, cmd.scriptId);
    }
    if (action === 'userscript.toggle' && cmd.scriptId) {
      return this._userscripts?.toggle(cmd.scriptId, cmd.enabled);
    }

    // ── Bookmark tools ─────────────────────────────────────────────────
    if (action === 'bookmarks.add') {
      const url = cmd.url || (await this._driver?.exec({ action: 'getUrl', agentId: aid }))?.url;
      return this._bookmarks?.add({ ...cmd, url, agentId: aid });
    }
    if (action === 'bookmarks.remove') {
      return this._bookmarks?.remove(cmd);
    }
    if (action === 'bookmarks.list') {
      return { bookmarks: this._bookmarks?.list({ agentId: aid, ...cmd }) };
    }
    if (action === 'bookmarks.open') {
      const bks = this._bookmarks?.list({ agentId: aid, query: cmd.query }) || [];
      if (bks.length) this._busEmit?.('driver.exec', { action: 'navigate', agentId: aid, url: bks[0].url });
      return { opened: bks[0]?.url };
    }

    // ── Rewind tools ───────────────────────────────────────────────────
    if (action === 'rewind.snapshot') {
      return this._rewind?.snapshot(aid, cmd);
    }
    if (action === 'rewind.list') {
      return { snapshots: this._rewind?.list(aid, cmd.limit || 10) };
    }
    if (action === 'rewind.restore') {
      return this._rewind?.restore({ agentId: aid, ...cmd });
    }

    // ── Cookie tools ───────────────────────────────────────────────────
    if (action === 'cookies.save') {
      const ses = this._ctxMgr?.getSession(aid);
      return this._vault?.save({ agentId: aid, accountId: cmd.accountId, domain: cmd.domain, cookies: [] });
    }
    if (action === 'cookies.restore') {
      return this._vault?.restore({ agentId: aid, accountId: cmd.accountId });
    }
    if (action === 'cookies.health') {
      const ses = this._ctxMgr?.getSession(aid);
      return this._vault?.checkTokenHealth(aid, ses);
    }

    // ── Provider tools ─────────────────────────────────────────────────
    if (action === 'provider.start' && cmd.providerId) {
      return this._providerHost?.start(cmd.providerId, { show: cmd.show ?? false });
    }
    if (action === 'provider.stop' && cmd.providerId) {
      return this._providerHost?.stop(cmd.providerId);
    }
    if (action === 'provider.list') {
      return { providers: this._providerHost?.list() };
    }

    // ── All other tools — route through SISO bus ───────────────────────
    // driver.exec actions, dom.*, context.*, mesh.*, url.listen, diag.*, options.*, window.*
    if (this._busEmit) {
      // Map action name to bus event type
      const busType = this._actionToBusEvent(action);
      this._busEmit(busType, { ...cmd, agentId: aid });
      return { dispatched: busType };
    }

    // ── Blueprint / component query ────────────────────────────────────────
    if (action === 'blueprint.query' || action === 'components.list') {
      try {
        const bi  = require('../../lib/blueprint-index');
        const idx = bi.load();
        if (!idx) return { error: 'blueprint-index not built' };
        const q = (cmd.query || '').toLowerCase();
        if (cmd.systemId) {
          const sys = idx.systems.find(s => s.systemId === cmd.systemId);
          return sys ? { ok:true, system: sys } : { error: `system ${cmd.systemId} not found` };
        }
        const result = q
          ? idx.allCLI.filter(c => c.command.includes(q) || c.description.toLowerCase().includes(q))
          : { totalComponents: idx.totalComponents, systems: idx.systems.map(s => ({ id:s.systemId, label:s.label, port:s.port, count:s.componentCount })) };
        return { ok: true, result };
      } catch(e) { return { error: e.message }; }
    }
    if (action === 'blueprint.rebuild') {
      try {
        const bi = require('../../lib/blueprint-index');
        const r  = bi.build();
        return { ok: r.ok, totalComponents: r.index?.totalComponents };
      } catch(e) { return { error: e.message }; }
    }

    return { skipped: action, reason: 'no handler' };
  }

  // ── Map action name to SISO bus event ────────────────────────────────
  _actionToBusEvent(action) {
    const map = {
      'navigate':          'driver.exec',
      'click':             'driver.exec',
      'type':              'driver.exec',
      'scroll':            'driver.exec',
      'screenshot':        'driver.exec',
      'eval':              'driver.exec',
      'waitFor':           'driver.exec',
      'back':              'driver.exec',
      'forward':           'driver.exec',
      'reload':            'driver.exec',
      'getUrl':            'driver.exec',
      'getTitle':          'driver.exec',
      'inject':            'driver.exec',
      'picker.enable':     'driver.exec',
      'picker.disable':    'driver.exec',
      'record.start':      'driver.exec',
      'record.stop':       'driver.exec',
      'network.block':     'driver.exec',
      'network.intercept': 'driver.exec',
      'storage.get':       'driver.exec',
      'storage.set':       'driver.exec',
      'dom.query':         'dom.query',
      'dom.mutate':        'dom.mutate',
      'dom.pick':          'dom.pick',
      'dom.tokens':        'dom.tokens',
      'context.create':    'context.create',
      'context.switch':    'context.switch',
      'context.list':      'status.request',
      'context.fp.switch': 'context.fp.switch',
      'mesh.spawn':        'mesh.spawn',
      'mesh.route':        'mesh.route',
      'mesh.send':         'mesh.send',
      'url.listen':        'url.listen',
      'url.listen.remove': 'url.listen.remove',
      'url.listen.list':   'status.request',
      'diag.nexus':        'diag.nexus',
      'diag.page':         'diag.page',
      'diag.run':          'diag.run',
      'window.open':       'window.open',
      'window.close':      'window.close',
      'window.hide':       'window.hide',
      'options.get':       'options.get',
      'options.set':       'options.set',
    };
    return map[action] || 'driver.exec';
  }

  // ── Build system prompt for NEXUS copilot ────────────────────────────
  _buildCgContext(agentId, domContext) {
    const domSection = domContext
      ? `\n\n## Live Browser DOM (Agent: ${agentId})\n\`\`\`json\n${JSON.stringify(domContext, null, 2).slice(0, 3000)}\n\`\`\``
      : '';

    return `## Clear Glass Browser Context
Agent ID: ${agentId}
Browser: Clear Glass — NEXUS sovereign browser (Electron/Chromium)
You are fully in control. Issue tool calls as \`\`\`driver JSON blocks.

${buildToolsPrompt()}${domSection}`;
  }

  // ── Call NEXUS copilot ────────────────────────────────────────────────
  async _callNexusCopilot({ message, agentId, domContext, systemExtra, msgId, copilotUrl }) {
    const cgContext = this._buildCgContext(agentId, domContext);
    const res = await fetch(copilotUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        prompt:      message,
        channel:     'clear-glass',
        sessionId:   agentId,
        requestId:   msgId,
        source:      'clear-glass',
        systemExtra: cgContext + (systemExtra ? '\n\n' + systemExtra : ''),
      }),
      timeout: 60000,
    });
    if (!res.ok) throw new Error(`NEXUS copilot HTTP ${res.status}`);
    const data = await res.json();
    return {
      text:          data.text || data.response || '',
      modelUsed:     data.modelUsed || data.provider_used || 'nexus',
      contextLayers: data.contextLayers || 0,
      fromStream:    data.fromStream || false,
    };
  }

  // ── Fallback: direct API ──────────────────────────────────────────────
  async _callFallback({ message, agentId, domContext, msgId }) {
    const s = this.settings.get();
    if (!s.fallbackApiKey) {
      return { text: 'NEXUS copilot offline. No fallback API key configured — set one in NEXUS Settings.', modelUsed: 'none' };
    }
    const cgContext = this._buildCgContext(agentId, domContext);
    const res = await fetch(s.fallbackEndpoint || 'https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': s.fallbackApiKey, 'anthropic-version': '2023-06-01' },
      body:    JSON.stringify({
        model:      s.fallbackModel || 'claude-sonnet-4-6',
        max_tokens: 4096,
        system:     cgContext,
        messages:   [{ role: 'user', content: message }],
      }),
      timeout: 60000,
    });
    if (!res.ok) throw new Error(`Fallback API error ${res.status}`);
    const data = await res.json();
    return { text: data.content?.[0]?.text || '', modelUsed: 'claude-fallback' };
  }

  // ── Guardian direct calls ─────────────────────────────────────────────
  async _guardianDispatch({ provider, prompt, sessionId }) {
    const url = this.settings.guardianUrl('/command');
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ provider, prompt, sessionId: sessionId || randomUUID(),
        source: 'clear-glass-copilot' }),
      timeout: 30000,
    });
    return res.ok ? res.json() : { error: `Guardian dispatch failed: ${res.status}` };
  }

  async _guardianFetch(path) {
    try {
      const res = await fetch(this.settings.guardianUrl(path), { timeout: 5000 });
      return res.ok ? res.json() : { error: `Guardian ${path} failed: ${res.status}` };
    } catch (err) {
      return { error: err.message };
    }
  }

  // ── Cortex direct calls ───────────────────────────────────────────────
  async _cortexFetch(path, params = {}) {
    try {
      const qs  = Object.keys(params).length
        ? '?' + new URLSearchParams(params).toString() : '';
      const res = await fetch(this.settings.cortexUrl(path) + qs, { timeout: 5000 });
      return res.ok ? res.json() : { error: `Cortex ${path} failed: ${res.status}` };
    } catch (err) {
      return { error: err.message };
    }
  }

  async _cortexPost(path, body) {
    try {
      const res = await fetch(this.settings.cortexUrl(path), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), timeout: 5000,
      });
      return res.ok ? res.json() : { error: `Cortex ${path} failed: ${res.status}` };
    } catch (err) {
      return { error: err.message };
    }
  }

  // ── Other endpoints ───────────────────────────────────────────────────
  async build({ description, sessionId, requestId }) {
    const res = await fetch(this.settings.copilotUrl('/api/build'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, sessionId, requestId: requestId || randomUUID() }),
      timeout: 120000,
    });
    if (!res.ok) throw new Error(`Build HTTP ${res.status}`);
    return res.json();
  }

  async diagnose({ topic, requestId }) {
    const res = await fetch(this.settings.copilotUrl('/api/diagnose'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic || 'system health', requestId: requestId || randomUUID() }),
      timeout: 60000,
    });
    if (!res.ok) throw new Error(`Diagnose HTTP ${res.status}`);
    return res.json();
  }

  async health() {
    try {
      const res = await fetch(this.settings.copilotUrl('/health'), { timeout: 3000 });
      return res.ok ? { ok: true, ...(await res.json()) } : { ok: false, error: `HTTP ${res.status}` };
    } catch (e) { return { ok: false, error: e.message }; }
  }

  async guardianHealth() {
    return this._guardianFetch('/health');
  }

  // ── Parse tool calls from response ────────────────────────────────────
  _parseCommands(text) {
    const commands = [];
    // Parse ```driver blocks
    const driverRe = /```driver\s*\n([\s\S]*?)\n```/g;
    let m;
    while ((m = driverRe.exec(text)) !== null) {
      try { commands.push(JSON.parse(m[1].trim())); } catch (_) {}
    }
    // Parse ```tool blocks (alias)
    const toolRe = /```tool\s*\n([\s\S]*?)\n```/g;
    while ((m = toolRe.exec(text)) !== null) {
      try { commands.push(JSON.parse(m[1].trim())); } catch (_) {}
    }
    return commands;
  }

  // ── NEXUS copilot stream connection ───────────────────────────────────
  _connectStream() {
    const copilotPort = this.settings.get().copilotPort || 3750;
    const connect = () => {
      try {
        const req = http.request({
          hostname: '127.0.0.1', port: copilotPort,
          path: '/events', headers: { Accept: 'text/event-stream' },
        }, res => {
          this._connected = true;
          this.sse.emit('copilot.stream.connected', { port: copilotPort, ts: Date.now() });
          let buf = '';
          res.on('data', chunk => {
            buf += chunk.toString();
            const parts = buf.split('\n\n');
            buf = parts.pop() || '';
            for (const part of parts) {
              const line = part.split('\n').find(l => l.startsWith('data:'));
              if (!line) continue;
              try {
                const ev = JSON.parse(line.slice(5));
                this.sse.emit(`nexus.copilot.${ev.type || 'event'}`, ev.payload || ev);
              } catch (_) {}
            }
          });
          res.on('end', () => { this._connected = false; setTimeout(connect, 3000); });
        });
        req.on('error', () => { this._connected = false; setTimeout(connect, 5000); });
        req.end();
        this._streamConn = req;
      } catch (_) { setTimeout(connect, 5000); }
    };
    setTimeout(connect, 2000);
  }

  // ── Bridge browser events into copilot consciousness ──────────────────
  _bridgeBrowserEvents() {
    try {
      const { on: busOn } = require('../core/bus');
      const forward = (type) => {
        busOn(type, (event) => {
          this._ingestToNexus({ type: `clear-glass.${type}`, ...event.data, ts: Date.now() });
        });
      };
      ['nav.loading', 'nav.loaded', 'driver.result', 'driver.error',
       'dom.tokens.result', 'url.match', 'mesh.task.complete', 'mesh.error',
       'diag.complete', 'context.created', 'provider.host.started',
       'bookmarks.added', 'rewind.snapshotted', 'cookie.health.result'].forEach(forward);
    } catch (_) {}
  }

  _ingestToNexus(event) {
    const copilotPort = this.settings.get().copilotPort || 3750;
    try {
      const body = JSON.stringify(event);
      const req  = http.request({
        hostname: '127.0.0.1', port: copilotPort,
        path: '/api/stream/ingest', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        timeout: 2000,
      });
      req.on('error', () => {});
      req.write(body); req.end();
    } catch (_) {}
  }

  clearHistory(agentId) {
    this._ingestToNexus({ type: 'clear-glass.copilot.history.cleared', agentId, ts: Date.now() });
  }
}

module.exports = CoPilotBridge;
