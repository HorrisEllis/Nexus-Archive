'use strict';
/**
 * src/main/index.js — Clear Glass v3 SISO-native boot
 * UUID: cg-main-v3-0000-0000-000000000006
 * Version: 3.1.0 — NEXUS protocol fix
 *
 * Boot order (law — §3.1 bottom-up only):
 *   0. SISO bus created
 *   1. TLS proxy
 *   2. Fingerprint engine
 *   3. Cookie vault
 *   4. Context manager
 *   5. DOM archaeology
 *   6. ClearDriver
 *   7. URL listener
 *   8. API settings
 *   9. Co-pilot
 *  10. Agent mesh
 *  11. Diagnostic engine
 *  12. Gates registered on bus
 *  13. SSE server (subscribes to bus)
 *  14. NEXUS registration — POST /api/register to orchestrator :9000
 *  15. IPC bridge
 *  16. Active NEXUS probe — probes orchestrator + cortex + guardian
 *  17. Heartbeat — POST /api/heartbeat to orchestrator every 10s
 *  18. Tray
 *  19. Default window
 *  20. lifecycle.ready → bus
 *
 * NEXUS protocol (matches nexus-connect.js exactly):
 *   Register:  POST :9000/api/register   { systemId, port, meta, components[] }
 *   Heartbeat: POST :9000/api/heartbeat  { systemId, port, status }
 *   Event:     POST :9000/api/ledger     { system, type, payload }
 *              POST :3748/api/event      { type, payload, source, ts }
 *
 * Clear Glass sits alongside NEXUS systems as a peer — not nested inside.
 * It does not depend on nexus-wired or ErosmancerOS to boot.
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path   = require('path');
const http   = require('http');
const { randomUUID } = require('crypto');

// ── SISO bus — must be first ───────────────────────────────────────────────
const { createBus, emit, on, Event } = require('../core/bus');

const MODULE_ID   = 'clear-glass';
const MODULE_UUID = randomUUID();
const CG_VERSION  = '3.1.0';

// ── Headless / tray-only mode ─────────────────────────────────────────────
// CG_HEADLESS=1  OR  --headless in argv → no BrowserWindow, tray only.
// Co-pilot, NEXUS bridge, SSE server all boot normally.
// Useful for: background NCP provider, always-on orchestrator SSE listener.
// ── Strip our custom flags from argv BEFORE Electron passes them to Chromium ──
// '--headless' and '--tray-only' are ours, not Chromium's. If Chromium sees
// '--headless' it enables headless rendering mode — which sites can detect.
// We read them first, then remove them so they never reach Chromium.
const _CG_FLAGS = ['--headless', '--tray-only'];
const HEADLESS = (
  process.env.CG_HEADLESS === '1' ||
  _CG_FLAGS.some(f => process.argv.includes(f))
);
// Strip from argv immediately — before app is created
process.argv = process.argv.filter(a => !_CG_FLAGS.includes(a));
if (HEADLESS) console.log('[ClearGlass] tray-only mode (no window, no headless Chromium)');


// ── NEXUS port map — matches nexus-connect.js PORTS exactly ───────────────
const NEXUS_PORTS = {
  orchestrator: parseInt(process.env.ORCHESTRATOR_PORT  || '9000'),
  cortex:       parseInt(process.env.NEXUS_PORT         || '3748'),
  guardian:     parseInt(process.env.GUARDIAN_HTTP_PORT || '7820'),
  bridge:       parseInt(process.env.BRIDGE_PORT        || '9999'),
};

const SSE_PORT = parseInt(process.env.CLEARGL_SSE_PORT || '7701');
const IPC_PORT = parseInt(process.env.CLEARGL_IPC_PORT || '7702');
const TLS_PORT = parseInt(process.env.CLEARGL_TLS_PORT || '7703');

// ── Module imports ─────────────────────────────────────────────────────────
const SseServer         = require('../sse/server');
const TlsProxy          = require('../tls/proxy');
const FingerprintEngine = require('../fingerprint/engine');
const CookieVault       = require('../cookies/vault');
const ContextMgr        = require('../contexts/manager');
const DomArchaeology    = require('../dom/archaeology');
const ClearDriver       = require('../driver/index');
const UrlListener       = require('../driver/url-listener');
const ApiSettings       = require('../api/settings');
const CoPilotBridge     = require('../copilot/bridge');
const AgentMesh         = require('../mesh/agent-mesh');
const DiagnosticEngine  = require('../diagnostic/engine');
const IpcBridge         = require('../ipc/bridge');
const NexusOptions      = require('../options/store');
const BookmarkStore     = require('../bookmarks/store');
const RewindEngine      = require('../rewind/engine');
const ProviderHost      = require('../providers/host');
const UserscriptManager = require('../userscripts/manager');
const { registerAll }   = require('../gates/index');
const COMPONENTS        = require('../../seam/registry-components');
const CONTRACT          = require('../../registry-components');   // flat contract shape for orchestrator
const EROS_COMPONENTS   = require('../../wire/eros-registry-components');

// ── Wire config ───────────────────────────────────────────────────────────
const EROS_PORT = parseInt(process.env.EROS_PORT || '7432');
const WIRE_PORT = parseInt(process.env.WIRE_PORT || '7704');

// ── State ──────────────────────────────────────────────────────────────────
let tray, sse, ipcBridge, nexusOptions, bookmarks, rewind, providerHost, userscripts, errorCapture;
let fp          = null;   // FingerprintEngine  — set in bootstrap()
let ctxMgr      = null;   // ContextMgr         — set in bootstrap()
let driver      = null;   // ClearDriver        — set in bootstrap()
let urlListener = null;   // UrlListener        — set in bootstrap()
let apiSettings = null;   // ApiSettings        — set in bootstrap()
let _heartbeatInterval = null;
const windows        = new Map(); // agentId → BrowserWindow (visible)
const bgTabs         = new Map(); // agentId → BrowserWindow (hidden service tabs)

// ── Single instance ────────────────────────────────────────────────────────
app.setName('Clear Glass');
app.disableHardwareAcceleration();
// §CRITICAL fix 2026-06-30 — this was the actual cause of the 6-crash
// circuit-breaker trip. requestSingleInstanceLock() failing produces a
// CLEAN exit (code 0, no signal, zero log output) — indistinguishable from
// a real crash in autopilot's log, except there's no error anywhere because
// there isn't one: Electron is doing exactly what this line told it to do.
// Root cause: autopilot's restart backoff (1s/2s/4s/8s/16s) was firing new
// launches faster than Windows fully releases the previous instance's lock
// file after process exit — a real OS-level race, not a logic bug. Every
// restart attempt was self-terminating against its own predecessor's
// not-yet-released lock, which is why faster backoff intervals failed
// faster and the circuit breaker tripped on schedule.
// Fix: (1) make this loud — autopilot's own log will show exactly why an
// instance exited next time, instead of a silent, info-free exit code 0.
// (2) brief delay + retry-once before giving up, in case it's genuinely a
// transient lock-release race rather than a real second instance running.
if (!app.requestSingleInstanceLock()) {
  console.error(`[${new Date().toISOString()}] [clear-glass/src/main/index.js] [ClearGlass] FATAL: requestSingleInstanceLock() failed — another instance holds the lock (or its lock file hasn't released yet). Exiting. If this fires on every restart attempt, the real fix is autopilot's restart backoff outracing Windows' lock-file cleanup, not this process itself.`);
  app.quit();
  process.exit(1); // §fix — was exit(0), which is indistinguishable from a clean shutdown in any log or monitoring tool. A lock failure is a real failure; code 1 says so.
}
app.on('second-instance', () => { const w = windows.values().next().value; if (w) { w.show(); w.focus(); } });
app.whenReady().then(bootstrap);
app.on('window-all-closed', e => e.preventDefault()); // tray-first — never quit on last window close
app.on('before-quit', shutdown);

// ── NEXUS HTTP helper — matches nexus-connect._req exactly ────────────────
// Returns { ok, data, error, ms } — never throws
function _ncReq(port, method, urlPath, body, timeout = 4000) {
  return new Promise(resolve => {
    const t0      = Date.now();
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: '127.0.0.1', port, path: urlPath, method,
      headers: {
        'Content-Type':      'application/json',
        'X-Nexus-Source':    MODULE_ID,
        'X-Nexus-Call-UUID': randomUUID(),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const ms = Date.now() - t0;
        try { resolve({ ok: res.statusCode < 400, data: JSON.parse(d), ms }); }
        catch { resolve({ ok: res.statusCode < 400, data: d, ms }); }
      });
    });
    req.setTimeout(timeout, () => { req.destroy(); resolve({ ok: false, error: 'timeout', ms: timeout }); });
    req.on('error', e => resolve({ ok: false, error: e.message, ms: Date.now() - t0 }));
    if (payload) req.write(payload);
    req.end();
  });
}

// ── NEXUS registration — POST /api/register with components[] ─────────────
// Matches bridge/index.js → nc.registerWithOrchestrator() call exactly
async function _registerWithNexus() {
  const r = await _ncReq(
    NEXUS_PORTS.orchestrator,
    'POST',
    '/api/register',
    {
      systemId:   MODULE_ID,
      port:       SSE_PORT,
      meta:       { role: 'browser', version: CG_VERSION, ipcPort: IPC_PORT, tlsPort: TLS_PORT },
      ts:         Date.now(),
      components: COMPONENTS,
    },
    5000,
  );

  if (r.ok) {
    console.log(`[ClearGlass §AXIOM] registered with orchestrator :${NEXUS_PORTS.orchestrator}`);
    // Also post to orchestrator ledger — matches nc.postLedger()
    _ncReq(NEXUS_PORTS.orchestrator, 'POST', '/api/ledger', {
      system: MODULE_ID,
      type:   'clear-glass.registered',
      payload: { port: SSE_PORT, ipcPort: IPC_PORT, tlsPort: TLS_PORT, version: CG_VERSION },
    }, 2000).catch(() => {});
  } else {
    console.log(`[ClearGlass §AXIOM] orchestrator offline — running standalone`);
  }
  return r;
}

// ── NEXUS event emit — matches nc.postEvent() exactly ─────────────────────
// Fire-and-forget. Never blocks caller.
function _postEvent(type, payload) {
  _ncReq(NEXUS_PORTS.orchestrator, 'POST', '/api/ledger',
    { system: MODULE_ID, type, payload }, 1200).catch(() => {});
  _ncReq(NEXUS_PORTS.cortex, 'POST', '/api/event',
    { type, payload, source: MODULE_ID, ts: Date.now() }, 1200).catch(() => {});
}

// ── Heartbeat — matches nc.startHeartbeat() exactly ───────────────────────
function _startHeartbeat() {
  const ping = () => _ncReq(
    NEXUS_PORTS.orchestrator, 'POST', '/api/heartbeat',
    { systemId: MODULE_ID, port: SSE_PORT, status: 'online' }, 2000,
  ).catch(() => {});
  ping();
  _heartbeatInterval = setInterval(ping, 10000);
  if (_heartbeatInterval.unref) _heartbeatInterval.unref();
}

// ── Bootstrap ──────────────────────────────────────────────────────────────
// ── Wire — inline nexus-wire.js ───────────────────────────────────────────
// Registers clear-glass AND ErosmancerOS with the orchestrator. Opens a thin
// HTTP server on WIRE_PORT (:7704) that:
//   GET  /contract        — contract-handshake endpoint for the orchestrator
//   GET  /health          — liveness probe
//   GET  /wire/health     — alias
//   POST /eros/*          — proxy to ErosmancerOS REST API
//   POST /bridge/driver   — ClearDriver → ErosmancerOS action mapping
//   POST /hook/hostile    — hostile detection → SISO bus fp.switch
//   POST /hook/behavior   — behavior plan → Cortex intelligence event
//
// Non-fatal: errors here are logged and swallowed — CG boot continues.

let _wireServer = null;

async function _startWire() {
  // ── Register ErosmancerOS with orchestrator ──────────────────────────────
  const erosReg = await _ncReq(NEXUS_PORTS.orchestrator, 'POST', '/api/register', {
    systemId:   'erosmancer-os',
    port:       EROS_PORT,
    meta:       { role: 'cdp-engine', version: '2.0.0', wirePort: WIRE_PORT },
    ts:         Date.now(),
    components: EROS_COMPONENTS,
  }, 5000);
  console.log(erosReg.ok
    ? `[ClearGlass/Wire §AXIOM] ErosmancerOS registered with orchestrator :${NEXUS_PORTS.orchestrator}`
    : '[ClearGlass/Wire §AXIOM] orchestrator offline — ErosmancerOS standalone');

  // ── Register nexus-wire itself ───────────────────────────────────────────
  await _ncReq(NEXUS_PORTS.orchestrator, 'POST', '/api/register', {
    systemId:   'nexus-wire',
    port:       WIRE_PORT,
    meta:       { role: 'integration-bridge', version: '1.1.0', hostedBy: 'clear-glass' },
    ts:         Date.now(),
    components: [],
  }, 5000);

  // ── Dual heartbeat ───────────────────────────────────────────────────────
  const wirePing = () => {
    _ncReq(NEXUS_PORTS.orchestrator, 'POST', '/api/heartbeat',
      { systemId: 'nexus-wire',    port: WIRE_PORT, status: 'online' }, 2000).catch(() => {});
    _ncReq(NEXUS_PORTS.orchestrator, 'POST', '/api/heartbeat',
      { systemId: 'erosmancer-os', port: EROS_PORT, status: 'online' }, 2000).catch(() => {});
  };
  wirePing();
  const _wireHb = setInterval(wirePing, 10000);
  if (_wireHb.unref) _wireHb.unref();

  // ── ErosmancerOS proxy helper ────────────────────────────────────────────
  function _proxyEros(method, urlPath, body, timeout = 15000) {
    return new Promise(resolve => {
      const payload = (body && method !== 'GET') ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: '127.0.0.1', port: EROS_PORT, path: urlPath, method,
        headers: { 'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}) },
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
          catch { resolve({ status: res.statusCode, body: d }); }
        });
      });
      req.setTimeout(timeout, () => { req.destroy(); resolve({ status: 504, body: { error: 'upstream timeout' } }); });
      req.on('error', e => resolve({ status: 502, body: { error: e.message } }));
      if (payload) req.write(payload);
      req.end();
    });
  }

  const ACTION_MAP = {
    click: '/api/os/click', type: '/api/os/type', hover: '/api/os/hover',
    scroll: '/api/os/scroll', navigate: '/api/os/navigate', evaluate: '/api/os/evaluate',
    screenshot: '/api/os/screenshot', waitForSelector: '/api/os/wait', attribute: '/api/os/attribute',
  };

  // ── HTTP server ──────────────────────────────────────────────────────────
  // ── Wire API — routes extracted to clear-glass/src/api/wire.js ──────────────
  const { createWireHandler, startWireServer } = require('../api/wire');
  const wireHandler = createWireHandler({
    CONTRACT, WIRE_PORT, EROS_PORT, ACTION_MAP, emit, _postEvent, _proxyEros,
  });
  _wireServer = await startWireServer({ port: WIRE_PORT, handler: wireHandler });

  console.log(`[ClearGlass/Wire] :${WIRE_PORT} ready — Eros:${EROS_PORT} ↔ NEXUS:${NEXUS_PORTS.orchestrator}`);
}

async function bootstrap() {
  console.log(`[ClearGlass v${CG_VERSION}] Boot — ${MODULE_UUID}`);

  // 0. SISO bus
  const bus = createBus('EVENTS');
  console.log('[ClearGlass] SISO bus →E→E→');

  // 1. TLS proxy — Firefox JA4 rewrite
  const tlsProxy = new TlsProxy({ port: TLS_PORT });
  await tlsProxy.start();
  console.log(`[ClearGlass] TLS proxy :${TLS_PORT}`);

  // 2. Fingerprint engine
  fp = new FingerprintEngine();
  await fp.load();

  // 3. Cookie vault
  const vault = new CookieVault();
  await vault.init();

  // 3.5. Global session CSP — allow NCP userscripts to connect to localhost
  // Guardian NCP uses http://127.0.0.1 from https:// pages (Private Network Access)
  // We need to allow this in the Electron session
  const { session: electronSession } = require('electron');
  const { applyCspBypass } = require('../contexts/session-headers');
  applyCspBypass(electronSession.defaultSession);

  // Scrub Electron/Node identifiers from the default session UA
  // This is a safety net — agent windows should use their own partitions,
  // but the default session must never advertise 'Electron' to any site.
  (() => {
    const rawUA = electronSession.defaultSession.getUserAgent();
    // Strip ' Electron/X.Y.Z' and ' Node.js/X.Y.Z' tokens
    const cleanUA = rawUA
      .replace(/\s+Electron\/[\d.]+/gi, '')
      .replace(/\s+Node\.js\/[\d.]+/gi, '')
      .replace(/\s+node\.js\/[\d.]+/gi, '')
      .replace(/\s+node\/[\d.]+/gi, '')
      .trim();
    electronSession.defaultSession.setUserAgent(cleanUA);
    // Also override via app.userAgentFallback (belt + suspenders)
    app.userAgentFallback = cleanUA;
  })();

  // 4. Context manager — one Chromium partition per agent
  ctxMgr = new ContextMgr({ fp, vault, sse: { emit: (t, d) => emit(t, d) }, tlsProxyPort: TLS_PORT });
  await ctxMgr.init();

  // 5. DOM archaeology — live DOM mesh via MutationObserver IPC
  const dom = new DomArchaeology({ sse: { emit: (t, d) => emit(t, d) } });

  // 6. ClearDriver — sovereign automation, no Playwright
  driver = new ClearDriver({ ctxMgr, dom, vault, sse: { emit: (t, d) => emit(t, d) } });

  // 7. URL listener — glob/regex per-agent request hooks
  urlListener = new UrlListener({ sse: { emit: (t, d) => emit(t, d) }, ctxMgr });

  // 8. API settings — sovereign config store
  apiSettings = new ApiSettings();
  await apiSettings.load();

  // 8.5. Nexus options — window behavior + defaults, bus + UI controllable
  nexusOptions = new NexusOptions();
  await nexusOptions.load();

  // 8.6. Bookmark store
  bookmarks = new BookmarkStore();
  await bookmarks.load();

  // 8.7. Rewind engine — wired to bus nav events
  rewind = new RewindEngine({
    vault,
    driver,
    ctxMgr,
    sse: { emit: (t, d) => emit(t, d) },
    busOn: (type, fn) => on(type, fn),
  });
  await rewind.init();

  // 8.8. Provider host — NCP auto-host (Guardian userscripts in CG webviews)
  // §fix 2026-06-30 — "strip it of the userscripts, not supposed to be
  // baked in." Was: `process.env.GUARDIAN_DIR || path.join(__dirname,
  // '../../../guardian')` — a second, independent copy of the same
  // hardcoded sibling-folder assumption removed from providers/host.js
  // above. No fallback now; GUARDIAN_DIR must be set explicitly.
  providerHost = new ProviderHost({
    guardianDir: process.env.GUARDIAN_DIR || null,
    sse:         { emit: (t, d) => emit(t, d) },
    postEvent:   (type, data) => _postEvent(type, data),
  });
  // §P-CG-01: auto-boot all NCP provider tabs as hidden background windows.
  // Each provider (claude, chatgpt, gemini, perplexity) gets its own
  // persistent session partition + Guardian userscript injected via
  // executeJavaScript — replacing Tampermonkey + manual tab management.
  // Staggered 1.5s apart to avoid fingerprint/auth collisions.
  // Do NOT await — we boot async in the background so the rest of the app
  // continues without waiting for the provider pages to fully load.
  providerHost.autoBootAll({ show: false }).then(results => {
    const ok  = results.filter(r => r.ok).length;
    const bad = results.filter(r => !r.ok).map(r => r.providerId);
    console.log(`[ClearGlass] NCP auto-boot: ${ok}/${results.length} providers started${bad.length ? ` (failed: ${bad.join(', ')})` : ''}`);
    _postEvent('clear-glass.providers.booted', { ok, total: results.length, failed: bad });
  }).catch(e => {
    console.warn('[ClearGlass] NCP auto-boot failed:', e.message);
  });

  // 8.9. Userscript manager
  // §fix 2026-06-30 — third real instance of the same hardcoded path,
  // independent from ProviderHost's. No fallback now.
  userscripts = new UserscriptManager({
    guardianDir: process.env.GUARDIAN_DIR || null,
    driver,
    sse: { emit: (t, d) => emit(t, d) },
  });
  await userscripts.init();

  // 9. Co-pilot — Cortex-wired, CFR-logged, DOM-aware
  const copilot = new CoPilotBridge({
    sse:         { emit: (t, d) => emit(t, d) },
    apiSettings,
    postEvent:   _postEvent,
  });

  // 10. Agent mesh — Claude, ChatGPT, Gemini, Perplexity, Mistral, Grok
  const mesh = new AgentMesh({ ctxMgr, driver, sse: { emit: (t, d) => emit(t, d) } });
  await mesh.init();

  // 11. Diagnostic engine — Playwright-equivalent on ClearDriver
  const diag = new DiagnosticEngine({ driver, dom, sse: { emit: (t, d) => emit(t, d) } });
  await diag.init();

  // 12. Register all gates on bus
  registerAll(bus, {
    driver,
    dom,
    ctxMgr,
    vault,
    copilot,
    mesh,
    diag,
    urlListener,
    openFn:      openAgentWindow,
    closeFn:     closeAgentWindow,
    minimizeFn:  minimizeAgentWindow,
    hideFn:      hideAgentWindow,
    maximizeFn:  maximizeAgentWindow,
    getStatusFn: getStatus,
    postEvent:   _postEvent,
    options:     nexusOptions,
    bookmarks,
    rewind,
    providerHost,
    userscripts,
  });

  // Wire copilot to bus + dom after gates are registered
  if (copilot?.wire) {
    copilot.wire({
      busEmit:     (type, data) => emit(type, data),
      domGet:      async (agentId) => { try { return await dom.handleQuery({ agentId, tree: true }); } catch (_) { return null; } },
      driver,
      bookmarks,
      rewind,
      vault,
      ctxMgr,
      userscripts,
      providerHost,
    });
  }

  // Auto-inject matching userscripts on navigation
  on('nav.loaded', async (event) => {
    const { agentId, url } = event.data;
    if (agentId && url && userscripts) {
      const count = await userscripts.autoInject(agentId, url).catch(() => 0);
      if (count > 0) emit('userscript.auto-injected', { agentId, url, count });
    }
  });

  // 13. SSE server — subscribes to bus, broadcasts all events
  sse = new SseServer({ port: SSE_PORT, moduleId: MODULE_ID, moduleUuid: MODULE_UUID });
  await sse.start();

  // 13.5. Error capture — was MISSING entirely. diagnostic/engine.js is a
  // test runner, not an error monitor; lib/error-log.js (referenced in an
  // earlier session's notes) doesn't exist anywhere in this tree. Every
  // error this session — bridge handshake failures, the crash loop — only
  // ever existed as scattered console.error calls nobody could see live.
  const { ErrorCapture } = require('../diagnostic/error-capture');
  errorCapture = new ErrorCapture({ sse });
  errorCapture.init();
  errorCapture.installMainProcessHandlers();

  // The orchestrator's contract-handshake polls /contract on the *registered*
  // port (SSE_PORT — see _registerWithNexus below), not the IPC port. /contract
  // only existed on the IPC server until now, so every verification attempt
  // hit Express's default 404 HTML page and failed to parse as JSON
  // (observed: "contract.unreachable — clear-glass (invalid JSON: ...
  // <!DOCTYPE...")).
  sse.app.get('/contract', (req, res) => res.json(CONTRACT));
  console.log(`[ClearGlass] SSE server :${SSE_PORT}`);

  // 14. NEXUS registration
  await _registerWithNexus();
  _startHeartbeat();

  // 14.5. Wire — ErosmancerOS registration + :7704 HTTP server (non-fatal)
  _startWire().catch(err => console.warn(`[ClearGlass/Wire] start failed (non-fatal): ${err.message}`));

  // 15. IPC bridge — HTTP command endpoint :IPC_PORT + ipcMain handlers
  ipcBridge = new IpcBridge({
    port:        IPC_PORT,
    sse,
    errorCapture,
    ctxMgr,
    vault,
    apiSettings,
    urlListener,
    mesh,
    diag,
    fp,
    postEvent:   _postEvent,
    options:     nexusOptions,
    minimizeFn:  minimizeAgentWindow,
    hideFn:      hideAgentWindow,
    openFn:      openAgentWindow,
    maximizeFn:  maximizeAgentWindow,
    openSettingsFn: openSettingsWindow,
    closeSettingsFn: closeSettingsWindow,
    bookmarks,
    rewind,
    providerHost,
    userscripts,
  });
  await ipcBridge.start();
  // §5.2 Contract IS the bridge — serve /contract so orchestrator can verify us
  if (ipcBridge.app) {
    ipcBridge.app.get('/contract', (req, res) => res.json(CONTRACT));
    ipcBridge.app.get('/health', (req, res) => res.json({
      ok: true, system: MODULE_ID, version: CG_VERSION,
      ssePort: SSE_PORT, ipcPort: IPC_PORT, tlsPort: TLS_PORT, ts: Date.now(),
    }));
    ipcBridge.app.get('/options', (req, res) => res.json(nexusOptions?.get() || {}));
    ipcBridge.app.get('/status', (req, res) => res.json(getStatus ? getStatus() : { ok: true }));
  }
  console.log(`[ClearGlass] IPC bridge :${IPC_PORT}`);

  // 16. Active NEXUS probe — drives status dots in renderer via SSE
  _startNexusProbe();

  // ── Subscribe to orchestrator SSE — pick up clear-glass.open + system events ─
  _startOrchestratorSSE(copilot, emit);


  // 17. Tray
  buildTray(mesh);

  // 18. Default window (skipped in headless/tray-only mode)
  if (!HEADLESS) {
    await openAgentWindow({ agentId: 'default', url: nexusOptions.get().defaultStartUrl });
  } else {
    console.log('[ClearGlass] tray-only — no window opened. Use tray menu or co-pilot to open windows.');
  }

  // 19. Ready
  emit('lifecycle.ready', {
    uuid:       MODULE_UUID,
    version:    CG_VERSION,
    ssePort:    SSE_PORT,
    ipcPort:    IPC_PORT,
    tlsPort:    TLS_PORT,
    components: COMPONENTS.length,
  });
  _postEvent('clear-glass.boot.complete', { uuid: MODULE_UUID, version: CG_VERSION, ssePort: SSE_PORT });
  console.log(`[ClearGlass v${CG_VERSION}] ✓ Ready — SSE:${SSE_PORT} IPC:${IPC_PORT} TLS:${TLS_PORT} | ${COMPONENTS.length} components registered`);

  // ── Helpers closed over deps ──────────────────────────────────────────
  function getStatus() {
    return {
      uuid:      MODULE_UUID,
      version:   CG_VERSION,
      siso:      bus.sampleHere ? bus.sampleHere() : {},
      contexts:  ctxMgr.listIds ? ctxMgr.listIds() : [],
      agents:    mesh.listAgents ? mesh.listAgents() : [],
      listeners: urlListener.list ? urlListener.list() : [],
      tls:       tlsProxy.getStats ? tlsProxy.getStats() : {},
      nexusPorts: NEXUS_PORTS,
      ts:        Date.now(),
    };
  }
}

// ── Orchestrator SSE subscriber ──────────────────────────────────────────────
// Listens to orchestrator :9000/sse for:
//   clear-glass.open  → open a new agent window at the given URL
//   system.registered → rebuild blueprint-index awareness
//   copilot.*         → forward to co-pilot bridge (surfaces in tray)
//
// This is the mechanism by which openClearGlass() in the home UI
// actually opens a window — the UI calls POST /api/clear-glass/open on
// orchestrator, orchestrator broadcasts via SSE, Clear Glass picks it up here.
function _startOrchestratorSSE(copilot, busEmit) {
  const ORCH_PORT = NEXUS_PORTS.orchestrator;
  const connect = () => {
    try {
      const req = http.request({
        hostname: '127.0.0.1', port: ORCH_PORT,
        path: '/sse', headers: { Accept: 'text/event-stream' },
      }, res => {
        console.log('[ClearGlass] orchestrator SSE connected');
        let buf = '';
        res.on('data', chunk => {
          buf += chunk.toString();
          const parts = buf.split('\n\n'); buf = parts.pop() || '';
          for (const part of parts) {
            const line = part.split('\n').find(l => l.startsWith('data:'));
            if (!line) continue;
            try {
              const ev = JSON.parse(line.slice(5));
              _handleOrchestratorEvent(ev, copilot, busEmit);
            } catch(_) {}
          }
        });
        res.on('end', () => {
          console.log('[ClearGlass] orchestrator SSE disconnected — reconnecting in 3s');
          setTimeout(connect, 3000);
        });
      });
      req.on('error', () => setTimeout(connect, 5000));
      req.end();
    } catch(_) { setTimeout(connect, 5000); }
  };
  // Delay start to allow orchestrator to be up
  setTimeout(connect, 2500);
}

function _handleOrchestratorEvent(ev, copilot, busEmit) {
  const type = ev.type || '';

  // clear-glass.open — UI asked to open a URL in Clear Glass
  if (type === 'clear-glass.open' && ev.url) {
    console.log(`[ClearGlass] open request from orchestrator SSE: ${ev.url}`);
    openAgentWindow({ agentId: randomUUID(), url: ev.url })
      .catch(e => console.warn('[ClearGlass] open failed:', e.message));
    return;
  }

  // blueprint-index rebuilt — ingest into co-pilot stream
  if (type === 'nexus.blueprint.index.built') {
    if (busEmit) busEmit('nexus.blueprint.rebuilt', ev);
    return;
  }

  // system online/offline — update tray status (future: dynamic tray menu)
  if (type.startsWith('orchestrator.system.')) {
    if (busEmit) busEmit('nexus.system.status', ev);
    return;
  }

  // All other events → forward into co-pilot consciousness stream
  if (copilot?._ingestToNexus && type && !type.startsWith('heartbeat')) {
    copilot._ingestToNexus({ ...ev, source: 'orchestrator-sse' });
  }
}

// ── Active NEXUS probe — SSE-driven status, no hardcoded dots ─────────────
function _startNexusProbe() {
  const probe = async () => {
    const checks = await Promise.allSettled([
      _ncReq(NEXUS_PORTS.orchestrator, 'GET', '/health', null, 2500),
      _ncReq(NEXUS_PORTS.cortex,       'GET', '/health', null, 2500),
      _ncReq(NEXUS_PORTS.guardian,     'GET', '/health', null, 2500),
      _ncReq(NEXUS_PORTS.bridge,       'GET', '/health', null, 2500),
    ]);

    const [orch, cortex, guardian, bridge] = checks.map(c =>
      c.status === 'fulfilled' && c.value.ok
    );

    emit('nexus.status', {
      orchestrator: orch,
      cortex,
      guardian,
      bridge,
      all: orch && cortex,
      ts: Date.now(),
    });
  };
  probe();
  setInterval(probe, 10000);
}

// ── Tray ───────────────────────────────────────────────────────────────────
function buildTray(mesh) {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip(`Clear Glass v${CG_VERSION} — NEXUS Browser →E→E→`);
  _rebuildTrayMenu(mesh);
  tray.on('double-click', () => {
    const w = windows.values().next().value;
    if (w) { w.show(); w.focus(); }
  });
}

function _rebuildTrayMenu(mesh) {
  const agentItems = [...windows.entries()].map(([id, win]) => ({
    label: `⬡ ${id}`,
    click: () => { win.show(); win.focus(); },
  }));

  // Dynamic NEXUS status for tray label
  const modeLabel = HEADLESS ? ' [HEADLESS]' : '';
  const menuTemplate = [
    { label: `Clear Glass v${CG_VERSION}${modeLabel}`, enabled: false },
    { label: `NEXUS :9000 · Guardian :7820 · Copilot :3750`, enabled: false },
    { type: 'separator' },
    ...agentItems,
    ...(agentItems.length ? [{ type: 'separator' }] : []),
    { label: '⬡ New Agent Window',   click: () => openAgentWindow({ agentId: randomUUID() }) },
    { label: '⬡ Open claude.ai',     click: () => openAgentWindow({ agentId: randomUUID(), url: 'https://claude.ai/new' }) },
    { label: '⬡ Open Mistral Chat',  click: () => openAgentWindow({ agentId: randomUUID(), url: 'https://chat.mistral.ai' }) },
    { label: '⬡ Open ChatGPT',       click: () => openAgentWindow({ agentId: randomUUID(), url: 'https://chatgpt.com' }) },
    { label: '⬡ NEXUS Home UI',      click: () => openAgentWindow({ agentId: 'nexus-home', url: 'http://127.0.0.1:9000' }) },
    { type: 'separator' },
    { label: 'NEXUS UI Audit',        click: () => emit('diag.nexus', { agentId: 'default' }) },
    { label: 'API Settings',          click: openSettingsWindow },
    { type: 'separator' },
    {
      label: 'Bus Log',
      click: () => {
        const { getLog } = require('../core/bus');
        console.log('[ClearGlass Bus]', JSON.stringify(getLog()?.sample(), null, 2));
      },
    },
    { label: 'Quit Clear Glass', click: () => app.quit() },
  ].filter(Boolean);

  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
}

// ── Window management ──────────────────────────────────────────────────────
async function openAgentWindow({ agentId = randomUUID(), url = 'about:blank' } = {}) {
  if (windows.has(agentId)) {
    windows.get(agentId).show();
    return windows.get(agentId);
  }

  // ── Fingerprinted partition ───────────────────────────────────────────
  // Every agent window gets its own isolated Chromium session with a
  // realistic Firefox UA — never 'Electron', never the default session.
  // ctxMgr.create() sets the UA + accept headers on the partition session.
  let partition = `persist:agent-${agentId}`;
  let spoofScript = '';
  if (ctxMgr) {
    try {
      await ctxMgr.create({ agentId, url });
      spoofScript = fp?.generateSpoofScript?.(agentId) || '';
    } catch(e) {
      console.warn(`[ClearGlass] context create failed for ${agentId}:`, e.message);
    }
  }

  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 800, minHeight: 600,
    frame: false, backgroundColor: '#08080d',
    webPreferences: {
      preload:          path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      webviewTag:       true,
      partition,          // ← fingerprinted session; UA set by ctxMgr.create()
    },
    title: `Clear Glass — ${agentId}`,
    show:  false,
  });

  // Inject spoof script on every page load (canvas noise, WebGL, navigator)
  // Must run BEFORE page JS — use did-finish-load as a safety net too
  if (spoofScript) {
    win.webContents.on('did-finish-load', () => {
      win.webContents.executeJavaScript(spoofScript).catch(() => {});
    });
    // Also on navigation (SPA route changes don't fire did-finish-load)
    win.webContents.on('did-navigate-in-page', () => {
      win.webContents.executeJavaScript(spoofScript).catch(() => {});
    });
  }

  win.loadFile(path.join(__dirname, '../../renderer/browser.html'), {
    query: { agentId, ssePort: SSE_PORT, ipcPort: IPC_PORT, url: url || '' },
  });

  win.on('maximize',   () => emit('window.maximized', { agentId, maximized: true }));
  win.on('unmaximize', () => emit('window.maximized', { agentId, maximized: false }));

  win.once('ready-to-show', () => {
    win.show();
    // Force-open renderer DevTools in detached window for debugging
    win.webContents.openDevTools({ mode: 'detach' });
  });

  // F12 / Ctrl+Shift+I toggles renderer DevTools
  win.webContents.on('before-input-event', (event, input) => {
    const devToolsKey =
      input.key === 'F12' ||
      (input.control && input.shift && ['i','j'].includes(input.key.toLowerCase()));
    if (devToolsKey) {
      win.webContents.isDevToolsOpened()
        ? win.webContents.closeDevTools()
        : win.webContents.openDevTools({ mode: 'detach' });
      event.preventDefault();
    }
  });
  win.on('close', e => {
    // §axiom: tray-first — but now genuinely controllable via Nexus options
    // instead of hardcoded. If the option is off, this is a real close.
    if (nexusOptions?.get().hideToTrayOnClose ?? true) {
      e.preventDefault();
      win.hide();
    }
  });
  win.on('closed', () => windows.delete(agentId));

  windows.set(agentId, win);
  emit('window.opened', { agentId });
  _postEvent('clear-glass.window.opened', { agentId });
  return win;
}

function closeAgentWindow({ agentId }) {
  windows.get(agentId)?.destroy();
  windows.delete(agentId);
}

function minimizeAgentWindow({ agentId }) {
  // Minimize to tray — hide from taskbar completely, not just minimize
  // This is what "minimize to tray" means — app still runs, no taskbar button
  const win = windows.get(agentId);
  if (win) win.hide(); // hide() removes from taskbar; minimize() keeps it there
}

function hideAgentWindow({ agentId }) {
  windows.get(agentId)?.hide();
}

function maximizeAgentWindow({ agentId }) {
  const win = windows.get(agentId);
  if (!win) return;
  if (win.isMaximized()) win.unmaximize(); else win.maximize();
}

function focusAgentWindow({ agentId }) {
  const win = windows.get(agentId) || bgTabs.get(agentId);
  if (!win) return { focused: false };
  win.show();
  win.focus();
  return { focused: true };
}

function listOpenAgents() {
  return {
    windows: [...windows.keys()],
    bgTabs:  [...bgTabs.keys()],
  };
}

// Hide the entire app to tray (called when all windows hidden)
function hideAppToTray() {
  for (const win of windows.values()) { try { win.hide(); } catch(_) {} }
  // app itself stays running — tray icon remains
}

// ── Background tabs — same chrome as an agent window, never shown ─────────
// "Move to background tab" carries a URL into a hidden window under a new
// agentId, freeing the visible window to navigate elsewhere while the
// background context keeps running (mesh/automation use).
async function openBackgroundTab({ agentId, url = 'about:blank' } = {}) {
  agentId = agentId || randomUUID();
  if (bgTabs.has(agentId)) { bgTabs.get(agentId).focus?.(); return { agentId, url, reused: true }; }

  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 800, minHeight: 600,
    frame: false, backgroundColor: '#08080d',
    webPreferences: {
      preload:          path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      webviewTag:       true,
    },
    title: `Clear Glass — ${agentId} (background)`,
    show: false,
  });

  win.loadFile(path.join(__dirname, '../../renderer/browser.html'), {
    query: { agentId, ssePort: SSE_PORT, ipcPort: IPC_PORT, url: url || '' },
  });

  win.on('closed', () => bgTabs.delete(agentId));
  bgTabs.set(agentId, win);
  emit('bgtab.opened', { agentId, url });
  _postEvent('clear-glass.bgtab.opened', { agentId, url });
  return { agentId, url };
}

function closeBackgroundTab(agentId) {
  const win = bgTabs.get(agentId);
  if (win) { win.destroy(); bgTabs.delete(agentId); }
  emit('bgtab.closed', { agentId });
  return { agentId, closed: !!win };
}

function listBackgroundTabs() {
  return [...bgTabs.keys()].map(agentId => ({ agentId }));
}

// ── Settings window — single instance, reused/focused rather than
//    re-created, with a real close path the renderer can call ────────────
let settingsWin = null;

function openSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) { settingsWin.show(); settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 800, height: 620, backgroundColor: '#08080d',
    frame: false,
    webPreferences: {
      preload:          path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
    title: 'Clear Glass — API Settings',
  });
  settingsWin.loadFile(path.join(__dirname, '../../renderer/settings.html'));
  settingsWin.on('closed', () => { settingsWin = null; });
}

function closeSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) settingsWin.close();
}

// ── Shutdown ───────────────────────────────────────────────────────────────
async function shutdown() {
  emit('lifecycle.shutdown', { uuid: MODULE_UUID });
  _postEvent('clear-glass.shutdown', { uuid: MODULE_UUID });

  if (_heartbeatInterval) clearInterval(_heartbeatInterval);

  await Promise.allSettled([
    providerHost?.stopAll(),
    ipcBridge?.stop(),
    sse?.stop(),
    _wireServer ? new Promise(r => _wireServer.close(r)) : Promise.resolve(),
  ]);
}

module.exports = {
  openAgentWindow, closeAgentWindow, minimizeAgentWindow, hideAgentWindow, maximizeAgentWindow,
  focusAgentWindow, listOpenAgents,
  openBackgroundTab, closeBackgroundTab, listBackgroundTabs,
  closeSettingsWindow, windows, bgTabs,
};
