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
    this._bridgeHandshake();  // establish trust token with Bridge :9999
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
    try {
      result = await this._callNexusCopilot({ message, agentId, domContext, systemExtra, msgId });
    } catch (err) {
      console.warn(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot] NEXUS offline, falling back:`, err.message);
      result = await this._callFallback({ message, agentId, domContext, msgId });
    }

    const text     = result.text || '';
    const commands = this._parseCommands(text);

    // Execute all tool calls
    for (const cmd of commands) {
      await this._executeCommand(cmd, agentId).catch(err => {
        console.warn(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot] Command failed [${cmd.action}]:`, err.message);
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
        const bi  = require('../../../lib/blueprint-index');
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
        const bi = require('../../../lib/blueprint-index');
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

  // ── Call NEXUS copilot — routed through Bridge :9999 ─────────────────
  async _callNexusCopilot({ message, agentId, domContext, systemExtra, msgId }) {
    const cgContext = this._buildCgContext(agentId, domContext);
    const result = await this._bridgeDispatch('copilot', 'copilot.prompt', {
      prompt:      message,
      channel:     'clear-glass',
      sessionId:   agentId,
      requestId:   msgId,
      source:      'clear-glass',
      systemExtra: cgContext + (systemExtra ? '\n\n' + systemExtra : ''),
    }, 60000);
    const data = result?.response || result || {};
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

  // ── Guardian — routed through Bridge :9999 ───────────────────────────
  async _guardianDispatch({ provider, prompt, sessionId }) {
    return this._bridgeDispatch('guardian', 'guardian.command', {
      provider, prompt,
      sessionId: sessionId || randomUUID(),
      source: 'clear-glass-copilot',
    }, 30000);
  }

  async _guardianFetch(path) {
    try {
      return await this._bridgeDispatch('guardian', 'guardian.fetch', { path }, 5000);
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
    return this._bridgeDispatch('copilot', 'copilot.build', {
      description, sessionId, requestId: requestId || randomUUID(),
    }, 120000);
  }

  async diagnose({ topic, requestId }) {
    return this._bridgeDispatch('copilot', 'copilot.diagnose', {
      topic: topic || 'system health', requestId: requestId || randomUUID(),
    }, 60000);
  }

  async health() {
    try {
      return await this._bridgeDispatch('copilot', 'copilot.health', {}, 3000);
    } catch (e) { return { ok: false, error: e.message }; }
  }

  async guardianHealth() {
    return this._guardianFetch('/health');
  }

  // ── Ollama — routed through Bridge :9999 ──────────────────────────────
  async ollamaGenerate({ model, prompt, sessionId }) {
    return this._bridgeDispatch('ollama', 'ollama.generate', {
      model: model || 'llama3', prompt, sessionId: sessionId || randomUUID(),
    }, 120000);
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

  // ── Bridge handshake — establish trust token with Bridge :9999 ─────────
  async _bridgeHandshake() {
    const bridgeUrl = this.settings.bridgeUrl('/bridge/handshake');
    const secret    = process.env.BRIDGE_SECRET_COPILOT || 'nexus-copilot-internal-v1';
    const port      = this.settings.get().copilotPort || 3750;

    // §fix 2026-06-30 — `timeout: 5000` below was dead code. The global
    // fetch() (Node's native fetch, same one Electron uses) does NOT
    // support a `timeout` option — it's silently ignored, not an error.
    // Direct testing confirmed bridge/identity.js's handshake logic is
    // correct (verified both in-process and via real HTTP against a live
    // bridge instance — resolves cleanly, 200 OK, valid token, no hang).
    // The "Premature close" errors are a transport-layer symptom: most
    // likely autopilot restarting bridge mid-request during its own
    // backoff/crash cycle (visible in the same log dump as repeated
    // "[bridge] stable for 60s — backoff reset" lines, meaning bridge
    // WAS unstable before that point). A real AbortController timeout
    // at least bounds how long a hung/dying connection blocks retries,
    // and distinguishes "nothing listening" from "connection died
    // mid-response" in the log, which the prior single catch-all
    // err.message did not.
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(bridgeUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ systemId: 'copilot', secret, port }),
        signal:  controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        console.warn(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot/Bridge] Handshake HTTP ${res.status} — will retry`);
        setTimeout(() => this._bridgeHandshake(), 10000);
        return;
      }
      const { token } = await res.json();
      this._bridgeToken = token;
      await this.settings.setBridgeToken(token);
      console.log(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot/Bridge] Bridge handshake OK — token issued`);
      this.sse.emit('copilot.bridge.connected', { ts: Date.now() });
    } catch (err) {
      clearTimeout(timeoutId);
      // §fix 2026-06-30, round 3 — the "bridge may be restarting" theory
      // in the prior comment here is DISPROVEN. Tested this session: (1)
      // identity.handshake() in isolation — clean. (2) curl against a real
      // booted bridge — clean. (3) Node's global fetch (same API Electron
      // uses) against a real booted bridge — clean. (4) 9 CONCURRENT
      // handshakes at once, simulating real multi-system boot — all 9
      // resolved clean. The actual log this is debugging shows bridge
      // "stable for 60s" — not restarting — while handshake fails every
      // single retry, forever. Every layer I can test from this sandbox
      // checks out; something specific to the real Windows/Electron
      // runtime is the remaining candidate (firewall/AV intercepting
      // loopback, or an Electron network-stack quirk I have no way to
      // reproduce without a real Electron process). Logged honestly
      // instead of re-guessing a cause I can't verify.
      //
      // Real, useful change: full error diagnostics (code/name/cause/stack)
      // dumped once per failure type, so the NEXT occurrence is conclusive
      // rather than another generic line — and a raw http.request fallback
      // attempt, to rule out (or confirm) that this is specific to fetch()'s
      // implementation rather than the network path itself.
      console.error(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot/Bridge] Handshake error detail — code:${err.code} name:${err.name} cause:${err.cause?.code || err.cause?.message || 'none'} message:"${err.message}"`);
      // §fix 2026-06-30 — this specific failure (the one this round's fix
      // is in direct response to) now reaches the error-capture system,
      // not just console. Emitted on the same 'error.captured' event type
      // ErrorCapture uses, so it shows in the same UI surface as every
      // other captured error — no separate, second error channel.
      if (this.sse) {
        try {
          this.sse.emit('error.captured', {
            id: `err-${Date.now()}-bridge-handshake`, ts: Date.now(), isoTime: new Date().toISOString(),
            source: 'main-process', type: 'bridgeHandshakeFailure',
            message: err.message, stack: err.stack, code: err.code, name: err.name,
            extra: { cause: err.cause?.code || err.cause?.message || null },
          });
        } catch (_) {}
      }

      let httpFallbackResult = null;
      try {
        httpFallbackResult = await new Promise((resolve, reject) => {
          const http = require('http');
          const payload = JSON.stringify({ systemId: 'copilot', secret, port });
          const u = new URL(bridgeUrl);
          const req = http.request({
            hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
            timeout: 5000,
          }, r => {
            let buf = ''; r.on('data', c => buf += c);
            r.on('end', () => resolve({ status: r.statusCode, body: buf }));
          });
          req.on('error', reject);
          req.on('timeout', () => { req.destroy(); reject(new Error('http.request timeout')); });
          req.write(payload); req.end();
        });
        console.log(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot/Bridge] http.request FALLBACK succeeded where fetch() failed — status ${httpFallbackResult.status}. This means the bug is specific to fetch()'s implementation, not the network path. Real fix: switch this function to http.request permanently.`);
        const parsed = JSON.parse(httpFallbackResult.body);
        if (parsed.token) {
          this._bridgeToken = parsed.token;
          await this.settings.setBridgeToken(parsed.token);
          this.sse.emit('copilot.bridge.connected', { ts: Date.now() });
          return; // recovered via fallback — skip the retry below
        }
      } catch (fallbackErr) {
        console.error(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot/Bridge] http.request fallback ALSO failed: ${fallbackErr.message} — confirms this is a real network-path issue, not fetch()-specific.`);
      }

      const cause = err.code === 'ECONNREFUSED' ? 'bridge not listening yet'
        : err.name === 'AbortError' ? 'no response within 5s'
        : `connection closed mid-response (${err.message}) — see error detail line above for diagnosis`;
      console.warn(`[${new Date().toISOString()}] [clear-glass/src/copilot/bridge.js] [CoPilot/Bridge] Handshake failed: ${cause} — retry in 10s`);
      setTimeout(() => this._bridgeHandshake(), 10000);
    }
  }

  // ── Bridge dispatch — route a request through Bridge :9999 ────────────
  async _bridgeDispatch(target, type, payload, timeout = 30000) {
    const token = this._bridgeToken || this.settings.getBridgeToken();
    if (!token) {
      // Not handshaked yet — attempt handshake then retry once
      await this._bridgeHandshake();
      if (!this._bridgeToken) throw new Error('[CoPilot/Bridge] No bridge token — handshake pending');
    }
    const res = await fetch(this.settings.bridgeUrl('/bridge/request'), {
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-bridge-token': this._bridgeToken,
      },
      body: JSON.stringify({
        type,
        source:  'clear-glass',
        target,
        payload,
        tags:    ['clear-glass', target],
      }),
      timeout,
    });
    if (!res.ok) throw new Error(`[Bridge] ${target} dispatch HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(`[Bridge] ${target} error: ${data.error || 'unknown'}`);
    return data.result?.response ?? data.result ?? data;
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
