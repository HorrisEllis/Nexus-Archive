'use strict';
/**
 * src/ledger/causal.js — Living Glass Causal Integration
 * UUID: cg-ledger-causal-v1-0000-0000-000000000034
 *
 * Every Clear Glass system emits causal events to Bridge :9999/bridge/causal/emit.
 * The causal graph maps cause → effect with gap detection, root cause analysis,
 * and condition reconstruction for every error, bug, or open loop.
 *
 * What this does:
 *   1. CausalEmitter  — thin wrapper around POST /bridge/causal/emit
 *                       Used by every component (driver, copilot, dom, gates, etc.)
 *   2. busToCansal()  — subscribes to SISO bus, converts events → causal events
 *                       automatically — every system emits to causal graph for free
 *   3. AutopilotFeed — SSE subscriber that aggregates events from all NEXUS systems
 *                       and pushes them to Clear Glass co-pilot for situational awareness
 *                       (the "self-aware browser" consciousness layer)
 *
 * Causal event shape:
 *   source:      'clear-glass'                    — which system
 *   action:      'nav.loaded' / 'driver.error'    — verb.noun (event type)
 *   sessionId:   agentId                           — which browsing context
 *   causalEdges: [{ type: 'triggered_by', eventId }] — what caused this
 *   input:       { url, selector, ... }            — what came in
 *   output:      { ok, error, ... }               — what went out
 *   stateDiff:   { errors: +1 }                   — what changed
 *   tags:        ['clear-glass', 'driver']         — for filtering
 *
 * CAUSAL_SOURCES must include 'clear-glass' — if Bridge rejects it,
 * see bridge/causal/schema.js CAUSAL_SOURCES set.
 */

const http = require('http');
const { randomUUID } = require('crypto');

// ── Port config — matches NEXUS port map ──────────────────────────────────────
const BRIDGE_PORT     = parseInt(process.env.BRIDGE_PORT     || '9999');
const ORCHESTRATOR_PORT = parseInt(process.env.ORCHESTRATOR_PORT || '9000');
const CORTEX_PORT     = parseInt(process.env.NEXUS_PORT      || '3748');

// ── Event type → causal action mapping ────────────────────────────────────────
// Bus event types → causal verb.noun actions.
// Only meaningful state transitions become causal events (not heartbeats/ack).
const BUS_TO_CAUSAL = {
  'lifecycle.boot':          { action: 'system.booted',          tags: ['clear-glass', 'lifecycle'] },
  'lifecycle.ready':         { action: 'system.ready',           tags: ['clear-glass', 'lifecycle'] },
  'lifecycle.shutdown':      { action: 'system.shutdown',        tags: ['clear-glass', 'lifecycle'] },
  'nav.loaded':              { action: 'page.loaded',            tags: ['clear-glass', 'navigation'] },
  'nav.failed':              { action: 'page.load-failed',       tags: ['clear-glass', 'navigation', 'error'] },
  'context.fp.switch':       { action: 'fingerprint.switched',   tags: ['clear-glass', 'context'] },
  'context.fp.switched':     { action: 'fingerprint.applied',    tags: ['clear-glass', 'context'] },
  'context.rate-limited':    { action: 'context.rate-limited',   tags: ['clear-glass', 'context', 'error'] },
  'driver.error':            { action: 'driver.error',           tags: ['clear-glass', 'driver', 'error'] },
  'driver.action.complete':  { action: 'driver.action-complete', tags: ['clear-glass', 'driver'] },
  'copilot.thinking':        { action: 'copilot.thinking',       tags: ['clear-glass', 'copilot'] },
  'copilot.response':        { action: 'copilot.responded',      tags: ['clear-glass', 'copilot'] },
  'copilot.tool.error':      { action: 'copilot.tool-failed',    tags: ['clear-glass', 'copilot', 'error'] },
  'copilot.bridge.connected':{ action: 'copilot.bridge-connected',tags: ['clear-glass', 'copilot'] },
  'copilot.send':            { action: 'copilot.message-sent',   tags: ['clear-glass', 'copilot'] },
  'mesh.task.complete':      { action: 'mesh.task-complete',     tags: ['clear-glass', 'mesh'] },
  'mesh.task.error':         { action: 'mesh.task-failed',       tags: ['clear-glass', 'mesh', 'error'] },
  'dom.picked':              { action: 'dom.element-picked',     tags: ['clear-glass', 'dom'] },
  'dom.archaeology.complete':{ action: 'dom.tree-captured',      tags: ['clear-glass', 'dom'] },
  'diag.run.complete':       { action: 'diagnostic.completed',   tags: ['clear-glass', 'diagnostic'] },
  'diag.step.fail':          { action: 'diagnostic.step-failed', tags: ['clear-glass', 'diagnostic', 'error'] },
  'window.opened':           { action: 'window.opened',          tags: ['clear-glass', 'window'] },
  'clear-glass.boot.complete':{ action: 'system.boot-complete',  tags: ['clear-glass', 'lifecycle'] },
  'ledger.error':            { action: 'system.error-recorded',  tags: ['clear-glass', 'ledger', 'error'] },
  'url.match':               { action: 'url.listener-matched',   tags: ['clear-glass', 'url-listener'] },
  'userscript.auto-injected':{ action: 'userscript.injected',   tags: ['clear-glass', 'userscripts'] },
  'bgtab.opened':            { action: 'bgtab.opened',           tags: ['clear-glass', 'window'] },
};

// ── CausalEmitter ─────────────────────────────────────────────────────────────
class CausalEmitter {
  constructor({ moduleId = 'clear-glass', bridgePort = BRIDGE_PORT } = {}) {
    this.moduleId   = moduleId;
    this.bridgePort = bridgePort;
    this._queue     = [];       // fire-and-forget queue
    this._draining  = false;
  }

  /**
   * emit — queue a causal event for async delivery to Bridge.
   * Never throws. Never blocks the caller.
   *
   * @param {string} action       - verb.noun e.g. 'page.loaded'
   * @param {object} opts
   * @param {string}   opts.sessionId    - agentId / browsing context
   * @param {string}   opts.parentEventId - uuid of the event that caused this
   * @param {string}   opts.parentEdgeType- 'triggered_by' | 'fallback_from' | 'caused_failure' | 'resolved_by'
   * @param {object}   opts.input        - sanitized input snapshot
   * @param {object}   opts.output       - output/result snapshot
   * @param {object}   opts.stateDiff    - numeric deltas only: { errors: +1 }
   * @param {string[]} opts.tags
   */
  emit(action, {
    sessionId     = null,
    parentEventId = null,
    parentEdgeType= 'triggered_by',
    input         = {},
    output        = {},
    stateDiff     = {},
    tags          = [],
  } = {}) {
    const event = {
      uuid:        randomUUID(),
      source:      this.moduleId,
      action,
      sessionId,
      causalEdges: parentEventId
        ? [{ type: parentEdgeType, eventId: parentEventId }]
        : [],
      input:       _trimInput(input),
      output,
      stateDiff,
      tags:        [this.moduleId, ...tags],
      ts:          Date.now(),
    };

    this._queue.push(event);
    if (!this._draining) this._drain();
    return event.uuid;
  }

  /**
   * emitError — convenience: emit a causal error event with error shape.
   */
  emitError(action, err, { sessionId, parentEventId, file, context = {} } = {}) {
    return this.emit(action, {
      sessionId,
      parentEventId,
      parentEdgeType: 'caused_failure',
      input:  { file, context },
      output: {
        error:   err?.message || String(err),
        stack:   err?.stack?.split('\n').slice(0, 4).join(' | ') || null,
        code:    err?.code || null,
      },
      stateDiff: { errors: 1 },
      tags:      ['error'],
    });
  }

  /**
   * trace — get the causal trace for an event from Bridge.
   * Returns the full ancestor/descendant tree (for root cause analysis).
   */
  async trace(eventId) {
    return _httpGet(this.bridgePort, `/bridge/trace/${eventId}`);
  }

  /**
   * rootCause — walk back to the originating cause of a failure.
   */
  async rootCause(failureEventId) {
    const trace = await this.trace(failureEventId);
    if (!trace.ok) return null;
    // ancestors array is already ordered oldest-first by the graph
    return trace.ancestors?.[0] || trace.event;
  }

  // ── Internal drain loop ───────────────────────────────────────────────
  async _drain() {
    if (this._draining) return;
    this._draining = true;
    while (this._queue.length > 0) {
      const event = this._queue.shift();
      await _postCausal(this.bridgePort, event).catch(() => {
        // Bridge offline — drop silently. Ledger has the record.
        // Do not re-queue — causal graph is best-effort.
      });
    }
    this._draining = false;
  }
}

// ── Bus → Causal bridge ───────────────────────────────────────────────────────
// Wire to the SISO bus singleton. Every meaningful bus event automatically
// becomes a causal event in the Bridge graph — no per-component wiring needed.
function busToCansal(busOnFn, emitter) {
  let _lastEventId = null; // thread causality through sequential events

  for (const [busType, mapping] of Object.entries(BUS_TO_CAUSAL)) {
    busOnFn(busType, (event) => {
      const { action, tags } = mapping;
      const data  = event.data || {};

      const causalId = emitter.emit(action, {
        sessionId:     data.agentId || null,
        parentEventId: _lastEventId,   // sequential causal chain
        input:         _busInputSlice(data),
        output:        _busOutputSlice(data),
        stateDiff:     _isErrorAction(action) ? { errors: 1 } : {},
        tags,
      });

      _lastEventId = causalId; // next event in this context points back here
    });
  }

  console.log(`[LivingGlass/Causal] Wired ${Object.keys(BUS_TO_CAUSAL).length} bus → causal mappings`);
}

// ── Autopilot Feed ────────────────────────────────────────────────────────────
// Listens to NEXUS orchestrator SSE and all NEXUS system SSE endpoints.
// Aggregates events and injects them into the co-pilot consciousness stream,
// so the co-pilot panel in Clear Glass has live awareness of the full system.
//
// This is what makes it "self-aware" — the co-pilot doesn't just see browser
// events; it sees Guardian NCP state, Cortex memory updates, Bridge trust
// events, Orchestrator system health — everything at once.
class AutopilotFeed {
  constructor({ emitter, postEvent, busEmit, copilotIngest }) {
    this.emitter       = emitter;
    this.postEvent     = postEvent || (() => {});
    this.busEmit       = busEmit   || (() => {});
    this.copilotIngest = copilotIngest || null; // copilot._ingestToNexus
    this._sources      = new Map(); // url → http.ClientRequest
    this._reconnTimers = new Map(); // url → timeout
  }

  // Start subscribing to all NEXUS system SSE endpoints
  start() {
    const sources = [
      { name: 'orchestrator', port: ORCHESTRATOR_PORT, path: '/sse' },
      { name: 'cortex',       port: CORTEX_PORT,       path: '/events' },
      { name: 'bridge',       port: BRIDGE_PORT,       path: '/bridge/sse' },
    ];

    for (const src of sources) {
      this._subscribe(src);
    }

    console.log('[LivingGlass/Autopilot] Feed started — watching orchestrator, cortex, bridge');
  }

  stop() {
    for (const [url, req] of this._sources.entries()) {
      try { req.destroy(); } catch (_) {}
    }
    for (const t of this._reconnTimers.values()) clearTimeout(t);
    this._sources.clear();
    this._reconnTimers.clear();
  }

  _subscribe({ name, port, path }) {
    const url = `http://127.0.0.1:${port}${path}`;
    const connect = () => {
      try {
        const req = http.request({
          hostname: '127.0.0.1', port,
          path, headers: { Accept: 'text/event-stream', Connection: 'keep-alive' },
        }, (res) => {
          console.log(`[LivingGlass/Autopilot] Connected: ${name} (${url})`);
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
                this._ingest(name, ev);
              } catch (_) {}
            }
          });
          res.on('end', () => {
            console.log(`[LivingGlass/Autopilot] ${name} SSE disconnected — reconnecting in 5s`);
            this._scheduleReconnect(name, port, path, connect, 5000);
          });
          this._sources.set(url, req);
        });
        req.on('error', () => this._scheduleReconnect(name, port, path, connect, 8000));
        req.end();
      } catch (_) {
        this._scheduleReconnect(name, port, path, connect, 10000);
      }
    };

    // Stagger connection to avoid thundering herd at boot
    const delay = { orchestrator: 3000, cortex: 4000, bridge: 5000 }[name] || 3000;
    setTimeout(connect, delay);
  }

  _scheduleReconnect(name, port, path, connectFn, delay) {
    const key = `${name}:${port}${path}`;
    const existing = this._reconnTimers.get(key);
    if (existing) clearTimeout(existing);
    this._reconnTimers.set(key, setTimeout(connectFn, delay));
  }

  // Ingest an event from any NEXUS system and surface it appropriately
  _ingest(sourceName, ev) {
    const type    = ev.type || ev.event || '';
    const payload = ev.payload || ev.data || ev;

    // Skip heartbeats and low-value noise
    if (AUTOPILOT_SKIP.has(type)) return;

    // Emit causal event for system-level events
    const causalAction = _toCausalAction(sourceName, type);
    if (causalAction) {
      this.emitter.emit(causalAction, {
        input:     { source: sourceName, type },
        output:    payload,
        stateDiff: _eventStateDiff(type, payload),
        tags:      [sourceName, 'autopilot'],
      });
    }

    // Feed into co-pilot consciousness stream (renders in co-pilot panel)
    if (this.copilotIngest && _isCopilotWorthy(type)) {
      this.copilotIngest({
        type:    `${sourceName}.${type}`,
        payload,
        source:  `autopilot-feed:${sourceName}`,
        ts:      Date.now(),
      });
    }

    // Propagate significant events onto the local SISO bus
    if (_isBusWorthy(type)) {
      this.busEmit(`nexus.feed.${sourceName}`, { type, payload, source: sourceName, ts: Date.now() });
    }
  }
}

// ── Event filter sets ──────────────────────────────────────────────────────────
const AUTOPILOT_SKIP = new Set([
  'heartbeat', 'ping', 'pong', 'keep-alive', '', 'connected',
  'orchestrator.heartbeat', 'bridge.heartbeat',
]);

// Co-pilot worthy events — worth surfacing in the chat panel
function _isCopilotWorthy(type) {
  return (
    type.includes('error') ||
    type.includes('fail') ||
    type.includes('gap') ||
    type.includes('flapping') ||
    type.includes('registered') ||
    type.includes('offline') ||
    type.includes('disconnected') ||
    type.includes('handshake')
  );
}

// Bus-worthy events — broadcast on internal bus
function _isBusWorthy(type) {
  return (
    type.startsWith('system.') ||
    type.startsWith('orchestrator.system.') ||
    type.includes('registered') ||
    type.includes('offline')
  );
}

// Convert NEXUS event type to causal action
function _toCausalAction(source, type) {
  if (!type || type.length < 3) return null;
  // 'orchestrator.system.registered' → already verb-noun style
  // 'ncp.connected' → 'ncp.connected'
  const clean = type.replace(/^[a-z]+-/, ''); // strip leading system prefix
  if (/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/.test(type)) return type;
  if (/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/.test(clean)) return clean;
  return null; // not a valid causal action — skip
}

function _eventStateDiff(type, payload) {
  if (type.includes('error') || type.includes('fail')) return { errors: 1 };
  if (type.includes('disconnect'))                      return { connections: -1 };
  if (type.includes('connect') || type.includes('registered')) return { connections: 1 };
  return {};
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function _busInputSlice(data) {
  // Extract safe, small input fields — avoid prompt bleed (§4.3)
  const { agentId, url, selector, action, type } = data;
  return Object.fromEntries(
    Object.entries({ agentId, url: url?.slice(0, 100), selector, action, type })
          .filter(([, v]) => v != null)
  );
}

function _busOutputSlice(data) {
  const { ok, error, result, count } = data;
  return Object.fromEntries(
    Object.entries({ ok, error: error?.slice?.(0, 200) || error, result, count })
          .filter(([, v]) => v != null)
  );
}

function _isErrorAction(action) {
  return action.includes('error') || action.includes('fail') || action.includes('failed');
}

function _trimInput(input) {
  // Enforce §4.3 — no prompt bleed. Trim strings to 200 chars.
  if (!input || typeof input !== 'object') return {};
  return Object.fromEntries(
    Object.entries(input).map(([k, v]) => [
      k,
      typeof v === 'string' ? v.slice(0, 200) : v,
    ])
  );
}

async function _postCausal(port, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port,
      path: '/bridge/causal/emit', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Connection': 'keep-alive',
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve({ ok: false }); }
      });
    });
    req.setTimeout(3000, () => { req.destroy(); reject(new Error('causal emit timeout')); });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function _httpGet(port, path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1', port, path, method: 'GET',
      headers: { 'Connection': 'keep-alive' },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ ok: false }); } });
    });
    req.setTimeout(5000, () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.on('error', () => resolve({ ok: false, error: 'unreachable' }));
    req.end();
  });
}

module.exports = { CausalEmitter, busToCansal, AutopilotFeed, BUS_TO_CAUSAL };
