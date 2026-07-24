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

// §EXPANSION 2026-07-07 — ErosmancerOS is a CDP client. Without this,
// Clear Glass's webContents were never a CDP target at all — the whole
// eros-registry-components.js / wire/nexus-wire.js bridge layer had
// nothing to attach to regardless of which routes it called. Must be
// set before app is ready; cannot be toggled at runtime.
// Port is intentionally distinct from ERAVOS/NEXUS/eros-os's own ports.
const CG_CDP_PORT = parseInt(process.env.CG_CDP_PORT || '9333', 10);
app.commandLine.appendSwitch('remote-debugging-port', String(CG_CDP_PORT));

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
let tray, sse, ipcBridge, nexusOptions, bookmarks, rewind, providerHost, userscripts, errorCapture, processMetrics;
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
// §BUG FIXED 2026-07-11, REVISED 2026-07-11 — the first version of this
// fix (app.commandLine.appendSwitch('disable-gpu') + disable-gpu-compositing
// + disable-software-rasterizer) stopped the fatal crash-loop but broke
// something worse: every window in this app is frame:false with
// webviewTag:true (see the win = new BrowserWindow({...}) calls below) —
// frameless windows AND <webview> tags both depend on the GPU process for
// compositing, and fully removing that process is a known, documented
// Electron/Chromium combination that renders a black window instead of
// content. Confirmed live: the browser chrome painted fine (plain HTML/
// CSS in the main renderer), the actual page content — loaded via
// <webview>, which runs its own guest renderer with its own compositing
// path — did not, on a real machine, via the process-monitor tool built
// specifically to catch exactly this kind of "did the fix actually work"
// question.
//
// error_code=18 on Windows is very commonly a SANDBOX initialization
// failure specifically, not a GPU-capability failure in general —
// --disable-gpu-sandbox targets that directly (removes the sandbox
// restriction the process was failing to initialize under) while leaving
// the GPU process itself, and therefore compositing for frameless windows
// and webviews, intact. This is the standard, narrower fix for this
// specific failure mode; the blanket --disable-gpu three-switch version
// is what you reach for when a process shouldn't exist at all, which
// wasn't true here — this app needs it to exist, just not to need the
// sandbox it couldn't initialize.
app.commandLine.appendSwitch('disable-gpu-sandbox');
// Defensive companion, not the primary fix: even with the sandbox issue
// addressed above, if the GPU process still crashes occasionally on this
// machine, Chromium has its OWN internal crash-count circuit breaker that
// permanently disables GPU usage after enough failures — which is a
// second, independent circuit breaker stacked on top of autopilot's own
// (the "crashes in window: 1/6" one). This doesn't prevent a crash; it
// prevents Chromium's response to a crash from becoming the fatal
// "GPU process isn't usable. Goodbye." app-kill, so a transient GPU
// hiccup degrades to a slower frame instead of taking the whole app down.
app.commandLine.appendSwitch('disable-gpu-process-crash-limit');
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
// §fix 2026-07-15 — the retry described in the comment above was never
// actually implemented; requestSingleInstanceLock() only tried once and
// quit immediately on failure, which is the exact behavior that tripped
// the circuit breaker (6 clean exit(1)s in under a minute, autopilot's
// 1s/2s/4s/8s/16s backoff outracing Windows' lock-file release). This
// does one delayed retry before giving up for real.
const LOCK_RETRY_DELAY_MS = 1500;
const _sleep = ms => new Promise(r => setTimeout(r, ms));

async function acquireSingleInstanceLockOrExit() {
  if (app.requestSingleInstanceLock()) return true;

  console.error(`[${new Date().toISOString()}] [clear-glass/src/main/index.js] [ClearGlass] requestSingleInstanceLock() failed on first attempt — another instance holds the lock (or its lock file hasn't released yet). Retrying once in ${LOCK_RETRY_DELAY_MS}ms in case this is a transient release race.`);
  await _sleep(LOCK_RETRY_DELAY_MS);

  if (app.requestSingleInstanceLock()) {
    console.error(`[${new Date().toISOString()}] [clear-glass/src/main/index.js] [ClearGlass] requestSingleInstanceLock() succeeded on retry — proceeding with boot.`);
    return true;
  }

  console.error(`[${new Date().toISOString()}] [clear-glass/src/main/index.js] [ClearGlass] requestSingleInstanceLock() failed again after retry — another instance is genuinely already running (Electron's requestSingleInstanceLock() only returns false when a live instance holds it right now — not an ambiguous "maybe a stale file" state). That instance's own 'second-instance' handler will show/focus its window. This launch has done its job just by acquiring-then-losing the lock race — exiting cleanly, not as an error. If you expected a NEW window instead, the running instance is what you're seeing (or should be — check its tray icon if tray-first hiding is on).`);
  app.quit();
  // §FIX 2026-07-24 — was exit(1) with "FATAL" wording. That was correct for
  // the 2026-06-30 case this function was originally built for (a genuine
  // crash-loop, autopilot's own respawn outracing lock release — see the
  // comment block above), but wrong for the much more common, completely
  // benign case: a user (or a stray script) launches clear-glass while a
  // legitimate instance is already running, e.g. tray-resident from an
  // earlier session (see the idle-vs-open fix, same day — the whole POINT
  // of that fix is clear-glass staying alive while in genuine use, which
  // means a second launch attempt hitting this path is not just possible,
  // it's the EXPECTED outcome of that fix working). Exiting 1/"FATAL" here
  // misreports a working singleton handoff as a crash — to a human reading
  // the log, and to anything that checks this process's exit code.
  process.exit(0);
  return false;
}

acquireSingleInstanceLockOrExit().then(acquired => {
  if (!acquired) return; // already exited inside acquireSingleInstanceLockOrExit
  app.on('second-instance', () => { const w = windows.values().next().value; if (w) { w.show(); w.focus(); } });
  app.whenReady().then(bootstrap);
  app.on('window-all-closed', e => e.preventDefault()); // tray-first — never quit on last window close
  app.on('before-quit', shutdown);
});

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

// ── Idle-vs-open: tell autopilot this instance is genuinely in use ────────
// §FIX 2026-07-24 (James) — "when the electron instance is open, it
// shouldn't be considered idle." autopilot.js's idle reaper despawns an
// on-demand kernel 10 minutes after its lastActivity timestamp — but
// lastActivity was only ever set once, at requestSpawn() time (see
// autopilot.js's requestSpawn/_startIdleReaper). Nothing in clear-glass
// ever called autopilot's POST /touch/:name to reset that clock, so a
// window left open and actively used for >10 minutes still got despawned
// as idle — the process would vanish out from under an active user.
//
// Fix: while at least one real window is visible, ping autopilot's touch
// endpoint periodically. Background tabs (bgTabs) deliberately do NOT
// count — those are hidden-by-design automation contexts, not "someone is
// looking at this," and counting them would defeat idle-despawn entirely
// for any session that ever opened one.
//
// AUTOPILOT_STATUS_PORT is set on this process's env by autopilot itself
// at spawn time (see autopilot.js's ALL_KERNELS clear-glass entry, added
// alongside this fix — it can't be assumed to be the 7799 default, since
// --status-port= or AUTOPILOT_STATUS_PORT could have overridden it in the
// parent). Unset or 0 means the status server is disabled — nothing to
// call, so this becomes a no-op rather than retrying against a server
// that was never started.
const AUTOPILOT_STATUS_PORT = parseInt(process.env.AUTOPILOT_STATUS_PORT || '0', 10);
let _autopilotTouchTimer = null;

function _anyWindowVisible() {
  for (const w of windows.values()) {
    try { if (!w.isDestroyed() && w.isVisible()) return true; } catch (_) {}
  }
  try { if (settingsWin && !settingsWin.isDestroyed() && settingsWin.isVisible()) return true; } catch (_) {}
  return false;
}

function _touchAutopilotIfOpen() {
  if (!AUTOPILOT_STATUS_PORT || !_anyWindowVisible()) return;
  // Fire-and-forget, same convention as _postEvent — autopilot being
  // unreachable isn't something a visibility ping should surface to the
  // user. Worst case this cycle's touch is missed and the next one
  // (60s later, well inside the 10-minute idle window) catches it.
  _ncReq(AUTOPILOT_STATUS_PORT, 'POST', `/touch/${MODULE_ID}`, null, 2000);
}

function _startAutopilotActivityHeartbeat() {
  if (_autopilotTouchTimer) return;
  _touchAutopilotIfOpen(); // immediate — don't wait a full interval after the window that just opened
  _autopilotTouchTimer = setInterval(_touchAutopilotIfOpen, 60000);
  if (_autopilotTouchTimer.unref) _autopilotTouchTimer.unref();
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
  // ── ErosmancerOS proxy helper — defined first, needed for /api/connect ──
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
          try { resolve({ status: res.statusCode, ok: res.statusCode < 400, body: JSON.parse(d) }); }
          catch { resolve({ status: res.statusCode, ok: res.statusCode < 400, body: d }); }
        });
      });
      req.setTimeout(timeout, () => { req.destroy(); resolve({ status: 504, ok: false, error: 'upstream timeout', body: { error: 'upstream timeout' } }); });
      req.on('error', e => resolve({ status: 502, ok: false, error: e.message, body: { error: e.message } }));
      if (payload) req.write(payload);
      req.end();
    });
  }

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

  // §EXPANSION 2026-07-07 — nothing anywhere in the codebase ever called
  // POST /api/connect on ErosmancerOS. It could register with the
  // orchestrator and accept /api/execute calls, but had no CDP session at
  // all — every downstream call would 503 "Not connected." Point it at
  // Clear Glass's own remote-debugging-port (opened above via
  // app.commandLine.appendSwitch) so its Target.setDiscoverTargets call
  // actually sees Clear Glass's webContents.
  const erosConnect = await _proxyEros('POST', '/api/connect', {
    target: { type: 'local', port: CG_CDP_PORT, host: 'localhost' },
  }, 8000);
  console.log(erosConnect.ok
    ? `[ClearGlass/Wire] ErosmancerOS connected to CDP :${CG_CDP_PORT}`
    : `[ClearGlass/Wire] ErosmancerOS connect failed (will retry on first driver call): ${erosConnect.error || erosConnect.status}`);

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

  // §FIX 2026-07-07 — see wire/nexus-wire.js for the full explanation: the
  // old ACTION_MAP pointed at /api/os/* routes that never existed in
  // erosmancer-os/src/api/server.ts. Real contract is /api/execute with a
  // registered node uuid, gated behind an attached CDP session. This inline
  // copy now does the same tab-resolution + node-registration flow.
  const _agentTabCache = new Map(); // agentId → { tabId, attached }

  async function _resolveErosTab(agentId, currentUrl) {
    const cached = _agentTabCache.get(agentId);
    if (cached) return cached;

    const tabsResp = await _proxyEros('GET', '/api/tabs', null, 5000);
    const tabs = (tabsResp.body && tabsResp.body.tabs) || [];
    let match = currentUrl ? tabs.find(t => t.url === currentUrl) : null;
    if (!match && tabs.length) match = tabs[0];
    if (!match) return null;

    const attachResp = await _proxyEros('POST', `/api/tabs/${match.targetId}/attach`, { role: 'primary' }, 8000);
    if (attachResp.status >= 400) return null;

    const entry = { tabId: match.targetId, attached: true };
    _agentTabCache.set(agentId, entry);
    return entry;
  }

  // ── HTTP server ──────────────────────────────────────────────────────────
  _wireServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      let parsed = {};
      try { parsed = body ? JSON.parse(body) : {}; } catch {}

      const u = req.url;

      // Contract endpoint — what the orchestrator verifies on boot
      if (u === '/contract' && req.method === 'GET') {
        return res.end(JSON.stringify(CONTRACT));
      }

      if ((u === '/health' || u === '/wire/health') && req.method === 'GET') {
        return res.end(JSON.stringify({ ok: true, module: 'nexus-wire', port: WIRE_PORT, ts: Date.now() }));
      }

      // ErosmancerOS proxy
      if (u.startsWith('/eros/')) {
        const erosPath = '/api' + u.replace(/^\/eros/, '');
        const up = await _proxyEros(req.method, erosPath, parsed);
        res.writeHead(up.status);
        return res.end(JSON.stringify(up.body));
      }

      // ClearDriver → ErosmancerOS action bridge (see _resolveErosTab above)
      if (u === '/bridge/driver' && req.method === 'POST') {
        const { action, agentId, selector, tag = 'div', text, url, code, currentUrl, ...args } = parsed;

        if (action === 'navigate') {
          const tab = await _resolveErosTab(agentId, currentUrl);
          if (!tab?.tabId) { res.writeHead(502); return res.end(JSON.stringify({ ok: false, error: 'No matching Eros CDP target — is remote-debugging-port open and is Eros connected to it?' })); }
          const up = await _proxyEros('POST', '/api/execute', { action: 'navigate', tabId: tab.tabId, payload: url }, 30000);
          res.writeHead(up.status);
          return res.end(JSON.stringify(up.body));
        }

        const tab = await _resolveErosTab(agentId, currentUrl);
        if (!tab) { res.writeHead(502); return res.end(JSON.stringify({ ok: false, error: 'No matching Eros CDP target for this agent' })); }

        if (action === 'register') {
          const reg = await _proxyEros('POST', '/api/nodes', { tag, tabId: tab.tabId, selector }, 8000);
          res.writeHead(reg.status);
          return res.end(JSON.stringify(reg.body));
        }

        let uuid = args.uuid || args.nodeUuid;
        if (!uuid && selector) {
          const reg = await _proxyEros('POST', '/api/nodes', { tag, tabId: tab.tabId, selector }, 8000);
          if (reg.status >= 400) { res.writeHead(reg.status); return res.end(JSON.stringify(reg.body)); }
          uuid = reg.body?.node?.uuid;
        }
        if (!uuid) { res.writeHead(400); return res.end(JSON.stringify({ ok: false, error: 'uuid or selector required' })); }

        const payload = action === 'type' ? text : (action === 'evaluate' ? code : undefined);
        const up = await _proxyEros('POST', '/api/execute', { action, uuid, tabId: tab.tabId, payload }, 30000);
        res.writeHead(up.status);
        return res.end(JSON.stringify(up.body));
      }

      // Hostile detection → SISO bus (direct emit, no HTTP round-trip)
      if (u === '/hook/hostile' && req.method === 'POST') {
        const { level, type, tabId, recommendation } = parsed;
        console.log(`[ClearGlass/Wire] Hostile: ${type} (${level}) tab=${tabId}`);
        if (level === 'high' || level === 'critical') {
          emit('context.fp.switch', { agentId: tabId, mode: 'firefox', reason: `hostile:${type}` });
        }
        _postEvent('eros.hostile.detected', { level, type, tabId, recommendation });
        return res.end(JSON.stringify({ ok: true }));
      }

      // Behavior plan → Cortex intelligence
      if (u === '/hook/behavior' && req.method === 'POST') {
        const { planId, profile, variant, meta } = parsed;
        _postEvent('eros.behavior.plan', { planId, profile, variant, meta });
        return res.end(JSON.stringify({ ok: true }));
      }

      // Open URL in Clear Glass — orchestrator calls this instead of default browser
      // POST /open { url: 'http://...', agentId: optional }
      //
      // §BUGFIX 2026-07-04: this used to default agentId to a fresh
      // `nexus-${Date.now()}` every time, with no check for whether a
      // window already showed the same URL — so the default boot window
      // (agentId:'default', opened at startup) and the orchestrator's
      // wire-triggered "open NEXUS UI" call (hitting this same /open
      // endpoint moments later) each got their own window, both showing
      // the same NEXUS UI. openAgentWindow()'s dedup-by-agentId couldn't
      // help since the two calls never shared an agentId — and reusing
      // 'default' blindly isn't safe either: its existing-window branch
      // only calls .show(), it never navigates, so a reused-but-blank
      // window would just stay blank instead of loading the requested URL.
      // Real fix: check whether *any* open window already shows this
      // origin before creating a new one, and focus that one instead.
      if (u === '/open' && req.method === 'POST') {
        const { url: openUrl, agentId: openAgent } = parsed;
        if (!openUrl) { res.writeHead(400); return res.end(JSON.stringify({ error: 'url required' })); }
        try {
          // §BUGFIX 2026-07-04 (round 2): the previous fix here only ran
          // when NO agentId was passed — but orchestrator's real boot call
          // always sends agentId:'nexus-home' explicitly (checked the
          // actual caller this time, not assumed). That guard meant this
          // entire origin-check/reuse block was dead code for the one
          // call that actually mattered — the boot-time open always fell
          // straight through to openAgentWindow() with a brand-new
          // agentId, creating a second real window every single time.
          // Removed the guard: check for an existing window on this
          // origin FIRST, always, regardless of what agentId (if any)
          // the caller asked for.
          let targetOrigin = null;
          try { targetOrigin = new URL(openUrl).origin; } catch (_) {}
          if (targetOrigin) {
            for (const [wid, win] of windows) {
              if (win.isDestroyed()) continue;
              let currentOrigin = null;
              try { currentOrigin = new URL(win.webContents.getURL()).origin; } catch (_) {}
              if (currentOrigin === targetOrigin) {
                win.show(); win.focus();
                return res.end(JSON.stringify({ ok: true, agentId: wid, url: openUrl, reused: true }));
              }
            }
          }
          // Boot race: the default window opens at about:blank (or
          // whatever defaultStartUrl is) before this wire call ever
          // arrives, so the origin check above can't match it yet.
          // Navigate it in place instead of opening a second window —
          // regardless of what agentId this specific /open call asked
          // for, 'default' is the one real window that already exists.
          const defaultWin = windows.get('default');
          if (defaultWin && !defaultWin.isDestroyed()) {
            defaultWin.webContents.send('cg:navigate', openUrl);
            defaultWin.show(); defaultWin.focus();
            return res.end(JSON.stringify({ ok: true, agentId: 'default', url: openUrl, navigated: true }));
          }
          const aid = openAgent || `nexus-${Date.now()}`;
          openAgentWindow({ agentId: aid, url: openUrl }).catch(() => {});
          return res.end(JSON.stringify({ ok: true, agentId: aid, url: openUrl }));
        } catch(e) {
          res.writeHead(500);
          return res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'not found' }));
    });
  });

  await new Promise((resolve, reject) => {
    _wireServer.listen(WIRE_PORT, '127.0.0.1', resolve);
    _wireServer.on('error', reject);
  });

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
  // §P-CG-01 — NCP provider tabs (claude, chatgpt, gemini, perplexity),
  // each its own persistent session partition + Guardian userscript
  // injected via executeJavaScript, replacing Tampermonkey + manual tab
  // management. Boot is lazy by default now — see the fix note below.
  // §BUG FIXED 2026-07-11 — this was unconditional: every boot spawned 4
  // hidden full Chromium renderer windows (claude/chatgpt/gemini/
  // perplexity), whether or not any of them were about to be used.
  // src/gates/index.js already supports booting a provider on-demand the
  // moment something actually needs it (`ph.start(providerId, ...)`) —
  // auto-boot-all was pure eager duplication of a lazy path that already
  // works. Default is now lazy-only (no pre-warm at all); set
  // CG_AUTOBOOT_PROVIDERS to a comma-list ('claude,chatgpt') to pre-warm
  // specific ones, or 'all' for the old behavior back.
  // §fix 2026-07-15 — lazy-only was the wrong default for this setup:
  // Guardian's whole point is these four userscripts actually running and
  // holding an NCP connection, which can't happen if nothing ever boots
  // them until some other code path happens to call ph.start(). Default
  // now pre-warms the four Guardian-supported providers hidden in the
  // background on every boot. Still fully overridable — set
  // CG_AUTOBOOT_PROVIDERS=none to go back to lazy-only, or a specific
  // comma-list / 'all' to change which ones boot.
  const autoBootSetting = (process.env.CG_AUTOBOOT_PROVIDERS || 'claude,chatgpt,gemini,perplexity').trim();
  if (autoBootSetting === 'none' || autoBootSetting === '') {
    console.log('[ClearGlass] NCP auto-boot: skipped (lazy-only — providers start on first real use). Set CG_AUTOBOOT_PROVIDERS to pre-warm specific providers.');
  } else {
    const only = autoBootSetting === 'all' ? null : autoBootSetting.split(',').map(s => s.trim()).filter(Boolean);
    providerHost.autoBootAll({ show: false, only }).then(results => {
      const ok  = results.filter(r => r.ok).length;
      const bad = results.filter(r => !r.ok).map(r => r.providerId);
      console.log(`[ClearGlass] NCP auto-boot: ${ok}/${results.length} providers started${bad.length ? ` (failed: ${bad.join(', ')})` : ''}`);
      _postEvent('clear-glass.providers.booted', { ok, total: results.length, failed: bad });
    }).catch(e => {
      console.warn('[ClearGlass] NCP auto-boot failed:', e.message);
    });
  }

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
  const mesh = new AgentMesh({ ctxMgr, driver, vault, sse: { emit: (t, d) => emit(t, d) } });
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

  // 13.6. Process metrics — real answer to "what is actually running,"
  // not an assertion about it. See process-metrics.js's header for why
  // this exists now specifically.
  const { ProcessMetrics } = require('../diagnostic/process-metrics');
  processMetrics = new ProcessMetrics({ app, sse, providerHost });
  sse.app.get('/api/metrics', (req, res) => res.json(processMetrics.snapshot()));
  processMetrics.startPolling(5000);
  console.log('[ClearGlass] Process metrics live — GET /api/metrics or watch process.metrics on the SSE stream');

  // 14. NEXUS registration
  await _registerWithNexus();
  _startHeartbeat();
  _startAutopilotActivityHeartbeat();

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
    copilot,
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
  //
  // §BUGFIX 2026-07-04: same bug class as the /open HTTP handler fixed
  // earlier — this always minted a fresh randomUUID() agentId, so it never
  // matched an existing window and always spawned a new one, even for a
  // URL already open somewhere. Repeated clicks (or any UI path that fires
  // this more than once) pile up windows/navigations competing for the
  // same origin — the real cause behind ERR_ABORTED (-3) bursts on
  // http://127.0.0.1:9000/ showing up well after boot, not a boot-time race.
  if (type === 'clear-glass.open' && ev.url) {
    console.log(`[ClearGlass] open request from orchestrator SSE: ${ev.url}`);
    let targetOrigin = null;
    try { targetOrigin = new URL(ev.url).origin; } catch (_) {}
    if (targetOrigin) {
      for (const [wid, win] of windows) {
        if (win.isDestroyed()) continue;
        let currentOrigin = null;
        try { currentOrigin = new URL(win.webContents.getURL()).origin; } catch (_) {}
        if (currentOrigin === targetOrigin) { win.show(); win.focus(); return; }
      }
    }
    // §BUGFIX 2026-07-04 (round 2): this was missing the same
    // default-window-navigate tier the /open HTTP handler needed — the
    // origin check above can't match the default window while it's still
    // showing about:blank, so this always fell through to creating a
    // genuinely new window. Same fix as /open, applied here too.
    const defaultWin = windows.get('default');
    if (defaultWin && !defaultWin.isDestroyed()) {
      defaultWin.webContents.send('cg:navigate', ev.url);
      defaultWin.show(); defaultWin.focus();
      return;
    }
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
    { label: '⬡ NEXUS Home UI',      click: () => openAgentWindow({ agentId: 'nexus-home', url: 'http://127.0.0.1:9000/ui/home/index.html' }) },
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
    query: {
      agentId, ssePort: SSE_PORT, ipcPort: IPC_PORT, url: url || '',
      wvPreload: 'file://' + path.join(__dirname, '../preload/webview-bridge.js'),
    },
  });

  win.on('maximize',   () => emit('window.maximized', { agentId, maximized: true }));
  win.on('unmaximize', () => emit('window.maximized', { agentId, maximized: false }));

  win.once('ready-to-show', () => {
    win.show();
    // DevTools: F12 / Ctrl+Shift+I only — never auto-open
  });
  win.on('show', () => _touchAutopilotIfOpen());

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
    query: {
      agentId, ssePort: SSE_PORT, ipcPort: IPC_PORT, url: url || '',
      wvPreload: 'file://' + path.join(__dirname, '../preload/webview-bridge.js'),
    },
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
  settingsWin.on('show', () => _touchAutopilotIfOpen());
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
