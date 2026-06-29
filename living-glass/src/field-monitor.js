'use strict';
/**
 * living-glass/src/field-monitor.js
 * UUID: living-glass-field-v1-0000-0000-000000000002
 *
 * Watches every NEXUS system simultaneously:
 *   - Polls /health (or /status) every 10s → tracks online/offline, uptime, friction
 *   - Subscribes to each system's SSE stream → live event ingestion
 *   - Reads component registry (orchestrator /api/components) → builds component map
 *   - Reads gaps from diagnostic :7825/gaps + each system's gap endpoint
 *   - Builds the relational field: components × systems × gaps × sigma
 *
 * The field is the source of truth for Living Glass.
 * Nothing is hardcoded. The field is what systems report.
 */

const http = require('http');
const { randomUUID } = require('crypto');

const SYSTEMS = {
  orchestrator: { port: 9000, healthPath: '/health',  ssePath: '/sse',     gapsPath: null,       label: 'Orchestrator' },
  cortex:       { port: 3748, healthPath: '/health',  ssePath: '/events',  gapsPath: '/api/gaps',label: 'Cortex' },
  guardian:     { port: 7820, healthPath: '/health',  ssePath: '/events',  gapsPath: '/gaps',    label: 'Guardian' },
  idearium:     { port: 4800, healthPath: '/health',  ssePath: '/sse',     gapsPath: '/api/gaps',label: 'Idearium' },
  bridge:       { port: 9999, healthPath: '/health',  ssePath: '/bridge/sse', gapsPath: null,    label: 'Bridge' },
  architect:    { port: 3747, healthPath: '/health',  ssePath: '/sse',     gapsPath: null,       label: 'Architect' },
  emerge:       { port: 4242, healthPath: '/status',  ssePath: '/sse',     gapsPath: null,       label: 'Emerge', optional: true },
  diagnostic:   { port: 7825, healthPath: '/status',  ssePath: '/events',  gapsPath: '/gaps',    label: 'Diagnostic' },
  'clear-glass':{ port: 7701, healthPath: '/health',  ssePath: '/events',  gapsPath: null,       label: 'Clear Glass', optional: true },
  copilot:      { port: 3750, healthPath: '/health',  ssePath: null,       gapsPath: null,       label: 'Co-pilot', optional: true },
  eravos:       { port: 3751, healthPath: '/health',  ssePath: null,       gapsPath: null,       label: 'ERAVOS', optional: true },
};

const COMPONENT_REGISTRY_URL = { port: 9000, path: '/api/components?limit=500' };
const CAUSAL_TRACE_URL       = { port: 9999, path: '/bridge/trace' };

const HEALTH_INTERVAL   = 10_000;  // 10s
const COMPONENT_REFRESH = 30_000;  // 30s

class FieldMonitor {
  constructor({ dataDir, onEvent, onGapOpen, onOffline }) {
    this._dataDir   = dataDir;
    this._onEvent   = onEvent   || (() => {});
    this._onGapOpen = onGapOpen || (() => {});
    this._onOffline = onOffline || (() => {});

    // Field state
    this._systemState  = new Map(); // systemName → { online, uptime, friction, lastSeen, health }
    this._components   = new Map(); // componentId → component descriptor + live status
    this._gaps         = new Map(); // gapId → gap
    this._sigma        = new Map(); // componentId → causal sigma score
    this._sseConns     = new Map(); // systemName → http.ClientRequest
    this._reconnTimers = new Map();
    this._healthTimer  = null;
    this._componentTimer = null;

    // Init all systems as unknown
    for (const name of Object.keys(SYSTEMS)) {
      this._systemState.set(name, {
        online: false, uptime: 0, friction: 0,
        lastSeen: null, health: null, label: SYSTEMS[name].label,
        optional: SYSTEMS[name].optional || false,
      });
    }
  }

  async start() {
    // Subscribe to all system SSE streams
    for (const [name, cfg] of Object.entries(SYSTEMS)) {
      if (cfg.ssePath) this._subscribeSSE(name, cfg);
    }

    // Poll health for all systems
    this._healthTimer = setInterval(() => this._pollAllHealth(), HEALTH_INTERVAL);
    await this._pollAllHealth(); // immediate first poll

    // Load component registry
    this._componentTimer = setInterval(() => this._refreshComponents(), COMPONENT_REFRESH);
    await this._refreshComponents();

    // Load all gaps
    await this._refreshGaps();

    console.log(`[LivingGlass/Field] started — watching ${Object.keys(SYSTEMS).length} systems`);
  }

  stop() {
    clearInterval(this._healthTimer);
    clearInterval(this._componentTimer);
    for (const req of this._sseConns.values()) { try { req.destroy(); } catch (_) {} }
    for (const t of this._reconnTimers.values()) clearTimeout(t);
  }

  // ── Public query API ──────────────────────────────────────────────────────
  summary() {
    const online  = [...this._systemState.entries()].filter(([, s]) => s.online).map(([n]) => n);
    const offline = [...this._systemState.entries()].filter(([, s]) => !s.online && !s.optional).map(([n]) => n);
    return {
      systems:    { total: this._systemState.size, online: online.length, offline: offline.length, online_list: online, offline_list: offline },
      components: { total: this._components.size, available: [...this._components.values()].filter(c => c._available !== false).length },
      gaps:       { total: this._gaps.size, critical: [...this._gaps.values()].filter(g => g.severity === 'critical').length },
      ts:         Date.now(),
    };
  }

  snapshot() {
    return {
      systems:    Object.fromEntries(this._systemState),
      components: [...this._components.values()].slice(0, 200), // cap for JSON size
      gaps:       [...this._gaps.values()],
      sigma:      Object.fromEntries(this._sigma),
      ts:         Date.now(),
    };
  }

  allComponents({ namespace, system, tags } = {}) {
    let comps = [...this._components.values()];
    if (namespace) comps = comps.filter(c => c.namespace === namespace);
    if (system)    comps = comps.filter(c => c._system === system || c.namespace === system);
    if (tags?.length) comps = comps.filter(c => tags.some(t => c.tags?.includes(t)));
    return comps;
  }

  getComponent(id) {
    return this._components.get(id) || null;
  }

  allGaps({ severity, system } = {}) {
    let gaps = [...this._gaps.values()];
    if (severity) gaps = gaps.filter(g => g.severity === severity);
    if (system)   gaps = gaps.filter(g => g.system === system || g.source === system);
    return gaps.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  async traceGap(gapId) {
    const gap = this._gaps.get(gapId);
    if (!gap) return null;
    // Pull causal trace from Bridge
    if (gap.causalEventId) {
      const trace = await _httpGet(CAUSAL_TRACE_URL.port, `/bridge/trace/${gap.causalEventId}`).catch(() => null);
      return { gap, causalTrace: trace };
    }
    return { gap, causalTrace: null };
  }

  sigmaField() {
    return Object.fromEntries(this._sigma);
  }

  getSystemState(name) {
    return this._systemState.get(name) || null;
  }

  // ── Health polling ────────────────────────────────────────────────────────
  async _pollAllHealth() {
    await Promise.allSettled(
      Object.entries(SYSTEMS).map(([name, cfg]) => this._pollHealth(name, cfg))
    );
  }

  async _pollHealth(name, cfg) {
    try {
      const res = await _httpGet(cfg.port, cfg.healthPath, 2500);
      const was = this._systemState.get(name);
      const now = {
        ...was,
        online:   true,
        uptime:   res.uptime || res.data?.uptime || 0,
        friction: res.friction || 0,
        lastSeen: Date.now(),
        health:   res,
      };
      this._systemState.set(name, now);

      if (was && !was.online) {
        // System came back online
        this._onEvent({ type: `living-glass.system.online`, data: { system: name, ts: Date.now() } });
        await this._refreshComponents(); // re-read components — system may have new ones
      }

      // Ingest sigma from health if available
      if (res.sigma !== undefined) this._sigma.set(name, res.sigma);

    } catch (_) {
      const was = this._systemState.get(name);
      this._systemState.set(name, { ...was, online: false, lastSeen: was?.lastSeen || null });

      if (was?.online && !SYSTEMS[name]?.optional) {
        this._onEvent({ type: 'living-glass.system.offline', data: { system: name, ts: Date.now() } });
        this._onOffline(name);
      }
    }
  }

  // ── Component registry ────────────────────────────────────────────────────
  async _refreshComponents() {
    try {
      const data = await _httpGet(COMPONENT_REGISTRY_URL.port, COMPONENT_REGISTRY_URL.path, 5000);
      if (!data?.components?.length) return;

      for (const comp of data.components) {
        if (!comp.id) continue;
        // Annotate with live system status
        const sysName = comp.namespace || comp.id.split('.')[0];
        const sysState = this._systemState.get(sysName);
        const enriched = {
          ...comp,
          _system:    sysName,
          _available: sysState?.online ?? false,
          _sigma:     this._sigma.get(comp.id) || this._sigma.get(sysName) || null,
        };
        this._components.set(comp.id, enriched);
      }
    } catch (_) {
      // Orchestrator offline — keep stale component map
    }
  }

  // ── Gaps ──────────────────────────────────────────────────────────────────
  async _refreshGaps() {
    for (const [name, cfg] of Object.entries(SYSTEMS)) {
      if (!cfg.gapsPath) continue;
      try {
        const data = await _httpGet(cfg.port, cfg.gapsPath, 3000);
        const gaps = data.gaps || data.items || [];
        for (const gap of gaps) {
          if (!gap.id && !gap.uuid) continue;
          const id = gap.id || gap.uuid;
          if (!this._gaps.has(id)) {
            // New gap
            const enriched = { ...gap, id, _system: name, _seenBy: MODULE_ID, _seenAt: Date.now() };
            this._gaps.set(id, enriched);
            this._onGapOpen(enriched);
            this._onEvent({ type: 'living-glass.gap.opened', data: enriched });
          }
        }
      } catch (_) {}
    }
  }

  ingestGap(gap, sourceSystem) {
    const id = gap.id || gap.uuid || randomUUID();
    if (!this._gaps.has(id)) {
      const enriched = { ...gap, id, _system: sourceSystem, _seenAt: Date.now() };
      this._gaps.set(id, enriched);
      this._onGapOpen(enriched);
    }
  }

  // ── SSE subscriptions ─────────────────────────────────────────────────────
  _subscribeSSE(name, cfg) {
    const reconnect = (delay = 5000) => {
      const key = name;
      const t   = this._reconnTimers.get(key);
      if (t) clearTimeout(t);
      this._reconnTimers.set(key, setTimeout(() => this._subscribeSSE(name, cfg), delay));
    };

    // Stagger connections
    const stagger = Object.keys(SYSTEMS).indexOf(name) * 600;
    setTimeout(() => {
      try {
        const req = http.request({
          hostname: '127.0.0.1', port: cfg.port,
          path: cfg.ssePath,
          headers: { Accept: 'text/event-stream', Connection: 'keep-alive' },
        }, (res) => {
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
                this._ingestSSEEvent(name, ev);
              } catch (_) {}
            }
          });
          res.on('end', () => reconnect(5000));
          this._sseConns.set(name, req);
        });
        req.on('error', () => reconnect(8000));
        req.end();
      } catch (_) { reconnect(10000); }
    }, stagger);
  }

  _ingestSSEEvent(systemName, ev) {
    const type    = ev.type || ev.event || '';
    const payload = ev.payload || ev.data || ev;

    // Skip noise
    if (!type || SKIP_TYPES.has(type)) return;

    // Ingest gaps from event stream
    if (type.includes('gap') && (payload?.id || payload?.uuid)) {
      this.ingestGap(payload, systemName);
    }

    // Update sigma from causal events
    if (type === 'cfr.sigma.updated' && payload?.componentId) {
      this._sigma.set(payload.componentId, payload.sigma);
    }

    // Forward everything to field consumers
    this._onEvent({
      type:    `${systemName}.${type}`,
      data:    payload,
      _source: systemName,
      ts:      ev.ts || Date.now(),
    });
  }
}

const MODULE_ID = 'living-glass';

const SKIP_TYPES = new Set([
  'heartbeat', 'ping', 'pong', 'keep-alive', '', 'connected',
  'orchestrator.heartbeat', 'bridge.heartbeat',
]);

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function _httpGet(port, path, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port, path, method: 'GET',
      headers: { Connection: 'keep-alive' },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error(`timeout: ${port}${path}`)); });
    req.on('error', reject);
    req.end();
  });
}

module.exports = { FieldMonitor, SYSTEMS };
