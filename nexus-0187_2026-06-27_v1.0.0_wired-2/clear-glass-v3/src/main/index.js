'use strict';
/**
 * src/main/index.js — Clear Glass v3 SISO-native boot
 * UUID: cg-main-v3-0000-0000-000000000006
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
 *  14. SEAM registration
 *  15. IPC bridge
 *  16. Active NEXUS probe
 *  17. Tray
 *  18. Default window
 *  19. lifecycle.ready → bus
 *
 * Everything that acts does so by emitting Events on the bus.
 * Gates transform them. SSE broadcasts results.
 * No module talks to another module directly.
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path    = require('path');
const fetch   = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// ── SISO bus — must be first ───────────────────────────────────────────────
const { createBus, emit, on, Event } = require('../core/bus');

const MODULE_ID   = 'clear-glass';
const MODULE_UUID = uuidv4();

const NEXUS_BUS_URL = process.env.NEXUS_BUS_URL || 'http://localhost:7700';
const SSE_PORT      = parseInt(process.env.CLEARGL_SSE_PORT  || '7701');
const IPC_PORT      = parseInt(process.env.CLEARGL_IPC_PORT  || '7702');
const TLS_PORT      = parseInt(process.env.CLEARGL_TLS_PORT  || '7703');

// ── Module imports (after bus module so requires don't fail) ───────────────
const SseServer        = require('../sse/server');
const TlsProxy         = require('../tls/proxy');
const FingerprintEngine= require('../fingerprint/engine');
const CookieVault      = require('../cookies/vault');
const ContextMgr       = require('../contexts/manager');
const DomArchaeology   = require('../dom/archaeology');
const ClearDriver      = require('../driver/index');
const UrlListener      = require('../driver/url-listener');
const ApiSettings      = require('../api/settings');
const CoPilotBridge    = require('../copilot/bridge');
const AgentMesh        = require('../mesh/agent-mesh');
const DiagnosticEngine = require('../diagnostic/engine');
const SeamModule       = require('../seam/index');
const IpcBridge        = require('../ipc/bridge');
const { registerAll }  = require('../gates/index');

// ── State ──────────────────────────────────────────────────────────────────
let tray, sse, seam, ipcBridge;
const windows = new Map();

// ── Single instance ────────────────────────────────────────────────────────
app.setName('Clear Glass');
app.disableHardwareAcceleration();
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }
app.on('second-instance', () => { const w = windows.values().next().value; if (w) { w.show(); w.focus(); } });
app.whenReady().then(bootstrap);
app.on('window-all-closed', e => e.preventDefault()); // tray-first
app.on('before-quit', shutdown);

// ── Bootstrap ──────────────────────────────────────────────────────────────
async function bootstrap() {
  console.log(`[ClearGlass v3] Boot — ${MODULE_UUID}`);

  // 0. SISO bus
  const bus = createBus('EVENTS');
  console.log('[ClearGlass] SISO bus created →E→E→');

  // 1. TLS proxy — Firefox JA4
  const tlsProxy = new TlsProxy({ port: TLS_PORT });
  await tlsProxy.start();

  // 2. Fingerprint engine
  const fp = new FingerprintEngine();
  await fp.load();

  // 3. Cookie vault
  const vault = new CookieVault();
  await vault.init();

  // 4. Context manager
  const ctxMgr = new ContextMgr({ fp, vault, sse: { emit: (t,d) => emit(t,d) }, tlsProxyPort: TLS_PORT });
  await ctxMgr.init();

  // 5. DOM archaeology
  const dom = new DomArchaeology({ sse: { emit: (t,d) => emit(t,d) } });

  // 6. ClearDriver
  const driver = new ClearDriver({ ctxMgr, dom, vault, sse: { emit: (t,d) => emit(t,d) } });

  // 7. URL listener
  const urlListener = new UrlListener({ sse: { emit: (t,d) => emit(t,d) }, seam: null, ctxMgr });

  // 8. API settings
  const apiSettings = new ApiSettings();
  await apiSettings.load();

  // 9. Co-pilot
  const copilot = new CoPilotBridge({ sse: { emit: (t,d) => emit(t,d) }, apiSettings, nexusBusUrl: NEXUS_BUS_URL });

  // 10. Agent mesh
  const mesh = new AgentMesh({ ctxMgr, driver, sse: { emit: (t,d) => emit(t,d) }, seam: null });
  await mesh.init();

  // 11. Diagnostic engine
  const diag = new DiagnosticEngine({ driver, dom, sse: { emit: (t,d) => emit(t,d) }, seam: null });
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
    seam:        null, // set after SEAM registers
    openFn:      openAgentWindow,
    closeFn:     closeAgentWindow,
    getStatusFn: getStatus,
  });

  // 13. SSE server — subscribes to bus, broadcasts everything
  sse = new SseServer({ port: SSE_PORT, moduleId: MODULE_ID, moduleUuid: MODULE_UUID });
  await sse.start();

  // 14. SEAM registration
  seam = new SeamModule({
    moduleId: MODULE_ID,
    uuid:     MODULE_UUID,
    nexusBusUrl: NEXUS_BUS_URL,
    sse,
    // SEAM hooks now just emit onto the bus — gates handle the rest
    hooks: Object.fromEntries(
      bus.gates ? [...bus.gates.keys()].map(sig => [sig, (payload) => {
        emit(sig, payload);
        return { emitted: sig };
      }]) : []
    ),
  });
  await seam.register();
  urlListener.seam = seam;
  mesh.seam        = seam;
  diag.seam        = seam;

  // 15. IPC bridge
  ipcBridge = new IpcBridge({ port: IPC_PORT, sse, ctxMgr, vault, apiSettings, urlListener, mesh, diag, fp });
  await ipcBridge.start();

  // 16. Active NEXUS probe — drives status dots via bus events
  _startNexusProbe();

  // 17. Tray
  buildTray(mesh, diag);

  // 18. Default window
  await openAgentWindow({ agentId: 'default', url: 'about:blank' });

  // 19. Ready
  emit('lifecycle.ready', { uuid: MODULE_UUID, ssePort: SSE_PORT, ipcPort: IPC_PORT, tlsPort: TLS_PORT });
  console.log(`[ClearGlass v3] ✓ Ready — SSE:${SSE_PORT} IPC:${IPC_PORT} TLS:${TLS_PORT}`);

  // Helper functions closed over deps
  function getStatus() {
    return {
      uuid:      MODULE_UUID,
      version:   '3.0.0',
      siso:      bus.sampleHere(),
      contexts:  ctxMgr.listIds(),
      agents:    mesh.listAgents(),
      listeners: urlListener.list(),
      tls:       tlsProxy.getStats(),
      ts:        Date.now(),
    };
  }
}

// ── Active NEXUS probe ─────────────────────────────────────────────────────
function _startNexusProbe() {
  const probe = async () => {
    try {
      const res = await fetch(`${NEXUS_BUS_URL}/health`, { timeout: 3000 });
      emit('nexus.status', { connected: res.ok, url: NEXUS_BUS_URL });
    } catch {
      emit('nexus.status', { connected: false, url: NEXUS_BUS_URL });
    }
  };
  probe();
  setInterval(probe, 10000);
}

// ── Tray ───────────────────────────────────────────────────────────────────
function buildTray(mesh, diag) {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Clear Glass v3 — NEXUS Browser →E→E→');
  rebuildTrayMenu(mesh, diag);
  tray.on('double-click', () => { const w = windows.values().next().value; if (w) { w.show(); w.focus(); } });
}

function rebuildTrayMenu(mesh, diag) {
  const agentItems = [...windows.entries()].map(([id, win]) => ({
    label: `⬡ ${id}`, click: () => { win.show(); win.focus(); }
  }));

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Clear Glass v3 →E→E→', enabled: false },
    { type: 'separator' },
    ...agentItems,
    agentItems.length ? { type: 'separator' } : null,
    { label: 'New Agent Context', click: () => openAgentWindow({ agentId: uuidv4() }) },
    { label: 'NEXUS UI Audit',    click: () => emit('diag.nexus', { agentId: 'default' }) },
    { label: 'API Settings',      click: openSettingsWindow },
    { type: 'separator' },
    { label: 'Bus Log',           click: () => { const { getLog } = require('../core/bus'); console.log(getLog()?.sample()); } },
    { label: 'Quit',              click: () => app.quit() },
  ].filter(Boolean)));
}

// ── Window management ──────────────────────────────────────────────────────
async function openAgentWindow({ agentId = uuidv4(), url = 'about:blank' } = {}) {
  if (windows.has(agentId)) { windows.get(agentId).show(); return; }

  // Get session from context manager (lazy create)
  const { session } = require('electron');
  const ctx = await require('../contexts/manager').prototype ? null : null;
  // Context manager is a singleton — access via module
  const ctxModule = require('../contexts/manager');

  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 800, minHeight: 600,
    frame: false, backgroundColor: '#08080d',
    webPreferences: {
      preload:          path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      webviewTag:       true,
    },
    title: `Clear Glass — ${agentId}`,
    show:  false,
  });

  win.loadFile(path.join(__dirname, '../../renderer/browser.html'), {
    query: { agentId, ssePort: SSE_PORT, ipcPort: IPC_PORT },
  });

  win.once('ready-to-show', () => win.show());
  win.on('close', e => { e.preventDefault(); win.hide(); });
  win.on('closed', () => { windows.delete(agentId); });

  windows.set(agentId, win);
  emit('window.opened', { agentId });
  return win;
}

function closeAgentWindow({ agentId }) {
  windows.get(agentId)?.destroy();
  windows.delete(agentId);
}

function openSettingsWindow() {
  const win = new BrowserWindow({
    width: 800, height: 620, backgroundColor: '#08080d',
    webPreferences: { preload: path.join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false },
    title: 'Clear Glass — API Settings',
  });
  win.loadFile(path.join(__dirname, '../../renderer/settings.html'));
}

// ── Shutdown ───────────────────────────────────────────────────────────────
async function shutdown() {
  emit('lifecycle.shutdown', { uuid: MODULE_UUID });
  await Promise.allSettled([
    seam?.deregister(),
    ipcBridge?.stop(),
    sse?.stop(),
  ]);
}

module.exports = { openAgentWindow, closeAgentWindow, windows };
