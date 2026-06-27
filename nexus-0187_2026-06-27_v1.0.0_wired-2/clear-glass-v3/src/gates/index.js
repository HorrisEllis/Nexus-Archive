'use strict';
/**
 * src/gates/index.js — Clear Glass Gate Registry
 * UUID: cg-gates-v1-0000-0000-000000000003
 *
 * Every system behavior is a Gate registered on the central bus.
 * Gates are pure: they receive an Event, emit zero or more Events, done.
 * No side-effects outside of stream.emit().
 *
 * Gate inventory:
 *   driver.*       — browser automation execution
 *   nav.*          — navigation lifecycle
 *   dom.*          — DOM archaeology and mutation
 *   context.*      — agent context lifecycle
 *   cookie.*       — vault operations
 *   fingerprint.*  — profile management
 *   copilot.*      — co-pilot message routing
 *   mesh.*         — agent mesh routing
 *   diag.*         — diagnostic execution
 *   url.listen     — URL pattern match dispatch
 *   seam.*         — NEXUS bus registration
 *   sse.*          — SSE broadcast
 *   tls.*          — TLS proxy events
 *   lifecycle.*    — boot/shutdown
 */

const { Gate, Event } = require('../../siso/index');

// ── Gate factory — cleaner than subclassing for simple transforms ──────────
function gate(signature, transformFn) {
  const g = new Gate(signature);
  g.transform = transformFn;
  return g;
}

// ── Driver gates ──────────────────────────────────────────────────────────
const driverExecGate = (driver) => gate('driver.exec', (event, stream) => {
  const { action, agentId = 'default', requestId, ...args } = event.data;
  driver.exec({ action, agentId, requestId, ...args })
    .then(result => stream.emit(new Event('driver.result', { action, agentId, requestId, result })))
    .catch(err  => stream.emit(new Event('driver.error',  { action, agentId, requestId, error: err.message })));
});

// ── Navigation gates ──────────────────────────────────────────────────────
const navStartGate = () => gate('nav.start', (event, stream) => {
  stream.emit(new Event('nav.loading', { agentId: event.data.agentId, url: event.data.url }));
});

// ── DOM gates ─────────────────────────────────────────────────────────────
const domQueryGate = (dom) => gate('dom.query', (event, stream) => {
  dom.handleQuery(event.data)
    .then(result => stream.emit(new Event('dom.query.result', { ...event.data, result })))
    .catch(err   => stream.emit(new Event('dom.error', { op: 'query', error: err.message })));
});

const domMutateGate = (dom) => gate('dom.mutate', (event, stream) => {
  dom.handleMutate(event.data)
    .then(result => stream.emit(new Event('dom.mutate.result', { ...event.data, result })))
    .catch(err   => stream.emit(new Event('dom.error', { op: 'mutate', error: err.message })));
});

const domPickGate = (dom) => gate('dom.pick', (event, stream) => {
  dom.handlePick(event.data)
    .then(pick => stream.emit(new Event('dom.pick.registered', pick)))
    .catch(err  => stream.emit(new Event('dom.error', { op: 'pick', error: err.message })));
});

const domTokenScanGate = (dom) => gate('dom.tokens', (event, stream) => {
  dom.scanTokens(event.data.agentId)
    .then(result => stream.emit(new Event('dom.tokens.result', { agentId: event.data.agentId, result })))
    .catch(err   => stream.emit(new Event('dom.error', { op: 'tokens', error: err.message })));
});

// ── Context gates ─────────────────────────────────────────────────────────
const contextCreateGate = (ctxMgr) => gate('context.create', (event, stream) => {
  ctxMgr.create(event.data)
    .then(ctx => stream.emit(new Event('context.created', { agentId: ctx.id, uuid: ctx.uuid })))
    .catch(err => stream.emit(new Event('context.error', { op: 'create', error: err.message })));
});

const contextSwitchGate = (ctxMgr) => gate('context.switch', (event, stream) => {
  ctxMgr.switchTo(event.data)
    .then(r => stream.emit(new Event('context.switched', r)))
    .catch(err => stream.emit(new Event('context.error', { op: 'switch', error: err.message })));
});

const contextFpSwitchGate = (ctxMgr) => gate('context.fp.switch', (event, stream) => {
  ctxMgr.switchFingerprint(event.data)
    .then(r => stream.emit(new Event('context.fp.switched', r)))
    .catch(err => stream.emit(new Event('context.error', { op: 'fp.switch', error: err.message })));
});

// ── Cookie gates ──────────────────────────────────────────────────────────
const cookieSaveGate = (vault) => gate('cookie.save', (event, stream) => {
  vault.save(event.data)
    .then(r  => stream.emit(new Event('cookie.saved', r)))
    .catch(err => stream.emit(new Event('cookie.error', { op: 'save', error: err.message })));
});

const cookieRestoreGate = (vault) => gate('cookie.restore', (event, stream) => {
  vault.restore(event.data)
    .then(r  => stream.emit(new Event('cookie.restored', r)))
    .catch(err => stream.emit(new Event('cookie.error', { op: 'restore', error: err.message })));
});

const cookieSnapshotGate = (vault, ctxMgr) => gate('cookie.snapshot', (event, stream) => {
  const ses = ctxMgr.getSession(event.data.agentId);
  vault.snapshot(event.data.agentId, ses)
    .then(r  => stream.emit(new Event('cookie.snapshotted', r)))
    .catch(err => stream.emit(new Event('cookie.error', { op: 'snapshot', error: err.message })));
});

const cookieHealthGate = (vault, ctxMgr) => gate('cookie.health', (event, stream) => {
  const ses = ctxMgr.getSession(event.data.agentId);
  vault.checkTokenHealth(event.data.agentId, ses)
    .then(r  => stream.emit(new Event('cookie.health.result', { agentId: event.data.agentId, ...r })))
    .catch(err => stream.emit(new Event('cookie.error', { op: 'health', error: err.message })));
});

// ── Copilot gates ─────────────────────────────────────────────────────────
const copilotMessageGate = (copilot) => gate('copilot.message', (event, stream) => {
  copilot.send(event.data)
    .then(r  => stream.emit(new Event('copilot.response', r)))
    .catch(err => stream.emit(new Event('copilot.error', { error: err.message })));
});

const copilotClearGate = (copilot) => gate('copilot.clear', (event, stream) => {
  copilot.clearHistory(event.data?.agentId);
  stream.emit(new Event('copilot.cleared', { agentId: event.data?.agentId }));
});

// ── Mesh gates ─────────────────────────────────────────────────────────────
const meshSpawnGate = (mesh) => gate('mesh.spawn', (event, stream) => {
  mesh.spawn(event.data.agentKey, event.data)
    .then(s  => stream.emit(new Event('mesh.agent.spawned', { key: s.key, contextId: s.contextId })))
    .catch(err => stream.emit(new Event('mesh.error', { op: 'spawn', error: err.message })));
});

const meshSendGate = (mesh) => gate('mesh.send', (event, stream) => {
  mesh.send(event.data)
    .then(r  => stream.emit(new Event('mesh.task.complete', r)))
    .catch(err => stream.emit(new Event('mesh.error', { op: 'send', error: err.message })));
});

const meshRouteGate = (mesh) => gate('mesh.route', (event, stream) => {
  mesh.route(event.data)
    .then(r  => stream.emit(new Event('mesh.task.complete', r)))
    .catch(err => stream.emit(new Event('mesh.error', { op: 'route', error: err.message })));
});

const meshEnqueueGate = (mesh) => gate('mesh.enqueue', (event, stream) => {
  const result = mesh.enqueue(event.data);
  stream.emit(new Event('mesh.queued', result));
});

// ── Diagnostic gates ──────────────────────────────────────────────────────
const diagRunGate = (diag) => gate('diag.run', (event, stream) => {
  diag.run(event.data)
    .then(r  => stream.emit(new Event('diag.complete', r)))
    .catch(err => stream.emit(new Event('diag.error', { error: err.message })));
});

const diagNexusGate = (diag) => gate('diag.nexus', (event, stream) => {
  diag.runNexusUiAudit(event.data)
    .then(r  => stream.emit(new Event('diag.complete', r)))
    .catch(err => stream.emit(new Event('diag.error', { error: err.message })));
});

const diagPageGate = (diag) => gate('diag.page', (event, stream) => {
  diag.runPageAudit(event.data)
    .then(r  => stream.emit(new Event('diag.complete', r)))
    .catch(err => stream.emit(new Event('diag.error', { error: err.message })));
});

// ── URL Listener gate ─────────────────────────────────────────────────────
const urlListenGate = (urlListener) => gate('url.listen', (event, stream) => {
  const result = urlListener.add(event.data);
  stream.emit(new Event('url.listener.added', result));
});

const urlListenRemoveGate = (urlListener) => gate('url.listen.remove', (event, stream) => {
  const result = urlListener.remove(event.data.listenerId);
  stream.emit(new Event('url.listener.removed', result));
});

// ── Window gates ──────────────────────────────────────────────────────────
const windowOpenGate  = (openFn)  => gate('window.open',  (event, stream) => { openFn(event.data);  });
const windowCloseGate = (closeFn) => gate('window.close', (event, stream) => { closeFn(event.data); });

// ── SEAM gates ────────────────────────────────────────────────────────────
const seamRegisterGate = (seam) => gate('seam.register', (event, stream) => {
  seam.register()
    .then(() => stream.emit(new Event('seam.registered', { moduleId: seam.moduleId, uuid: seam.uuid })))
    .catch(err => stream.emit(new Event('seam.error', { error: err.message })));
});

// ── Status gate ───────────────────────────────────────────────────────────
const statusGate = (getStatusFn) => gate('status.request', (event, stream) => {
  stream.emit(new Event('status.response', getStatusFn()));
});

// ── Lifecycle gates ───────────────────────────────────────────────────────
const lifecycleReadyGate  = () => gate('lifecycle.ready',    (event, stream) => {
  console.log('[ClearGlass] →E→ lifecycle.ready');
});
const lifecycleShutdownGate = () => gate('lifecycle.shutdown', (event, stream) => {
  console.log('[ClearGlass] →E→ lifecycle.shutdown');
});

// ── Registry — register all gates on the bus ──────────────────────────────
function registerAll(bus, deps) {
  const { driver, dom, ctxMgr, vault, copilot, mesh, diag, urlListener, seam, openFn, closeFn, getStatusFn } = deps;

  const gates = [
    // Driver
    driver     && driverExecGate(driver),
    // Nav
    navStartGate(),
    // DOM
    dom        && domQueryGate(dom),
    dom        && domMutateGate(dom),
    dom        && domPickGate(dom),
    dom        && domTokenScanGate(dom),
    // Context
    ctxMgr     && contextCreateGate(ctxMgr),
    ctxMgr     && contextSwitchGate(ctxMgr),
    ctxMgr     && contextFpSwitchGate(ctxMgr),
    // Cookies
    vault      && cookieSaveGate(vault),
    vault      && cookieRestoreGate(vault),
    vault      && cookieSnapshotGate(vault, ctxMgr),
    vault      && cookieHealthGate(vault, ctxMgr),
    // Copilot
    copilot    && copilotMessageGate(copilot),
    copilot    && copilotClearGate(copilot),
    // Mesh
    mesh       && meshSpawnGate(mesh),
    mesh       && meshSendGate(mesh),
    mesh       && meshRouteGate(mesh),
    mesh       && meshEnqueueGate(mesh),
    // Diagnostics
    diag       && diagRunGate(diag),
    diag       && diagNexusGate(diag),
    diag       && diagPageGate(diag),
    // URL Listener
    urlListener && urlListenGate(urlListener),
    urlListener && urlListenRemoveGate(urlListener),
    // Windows
    openFn     && windowOpenGate(openFn),
    closeFn    && windowCloseGate(closeFn),
    // SEAM
    seam       && seamRegisterGate(seam),
    // Status
    getStatusFn && statusGate(getStatusFn),
    // Lifecycle
    lifecycleReadyGate(),
    lifecycleShutdownGate(),
  ].filter(Boolean);

  for (const g of gates) {
    try { bus.register(g); }
    catch (err) { console.error(`[Gates] Failed to register '${g.signature}':`, err.message); }
  }

  console.log(`[Gates] Registered ${gates.length} gates on bus`);
  return gates.length;
}

module.exports = {
  registerAll,
  gate,
  // Export individual factories for testing
  driverExecGate, domQueryGate, domMutateGate, domPickGate,
  contextCreateGate, contextSwitchGate, cookieSaveGate, cookieRestoreGate,
  copilotMessageGate, meshSpawnGate, meshRouteGate, diagRunGate,
  urlListenGate, windowOpenGate, statusGate,
};
