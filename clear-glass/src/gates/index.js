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
 *   window.*       — host window lifecycle (open/close/minimize/hide)
 *   options.*      — Nexus options store (get/set, bus + UI controllable)
 *   lifecycle.*    — boot/shutdown
 *   bookmarks.*   — add/remove/list/open/check
 *   rewind.*       — snapshot/list/restore/clear
 *   provider.*     — NCP provider host (start/stop/list/show)
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
const windowOpenGate     = (openFn)     => gate('window.open',     (event, stream) => { openFn(event.data);     });
const windowCloseGate    = (closeFn)    => gate('window.close',    (event, stream) => { closeFn(event.data);    });
const windowMinimizeGate = (minimizeFn) => gate('window.minimize', (event, stream) => { minimizeFn(event.data); });
const windowHideGate     = (hideFn)     => gate('window.hide',     (event, stream) => { hideFn(event.data);     });
const windowMaximizeGate = (maximizeFn) => gate('window.maximize', (event, stream) => { maximizeFn(event.data); });


// ── Bookmark gates ─────────────────────────────────────────────────────────
const bookmarkAddGate    = (bk) => gate('bookmarks.add', (event, stream) => {
  try {
    const result = bk.add(event.data);
    stream.emit(new Event('bookmarks.added', result));
  } catch (err) { stream.emit(new Event('bookmarks.error', { error: err.message })); }
});

const bookmarkRemoveGate = (bk) => gate('bookmarks.remove', (event, stream) => {
  try {
    const result = bk.remove(event.data);
    stream.emit(new Event('bookmarks.removed', result));
  } catch (err) { stream.emit(new Event('bookmarks.error', { error: err.message })); }
});

const bookmarkListGate   = (bk) => gate('bookmarks.list', (event, stream) => {
  stream.emit(new Event('bookmarks.listed', { bookmarks: bk.list(event.data) }));
});

const bookmarkOpenGate   = (bk, driver) => gate('bookmarks.open', (event, stream) => {
  const { id, agentId = 'default' } = event.data;
  const bookmark = bk.list().find(b => b.id === id);
  if (!bookmark) { stream.emit(new Event('bookmarks.error', { error: 'Not found' })); return; }
  bk.recordVisit({ id });
  driver.exec({ action: 'navigate', agentId, url: bookmark.url })
    .then(r => stream.emit(new Event('bookmarks.opened', { bookmark, result: r })))
    .catch(err => stream.emit(new Event('bookmarks.error', { error: err.message })));
});

const bookmarkVisitGate  = (bk) => gate('bookmarks.visit', (event, stream) => {
  bk.recordVisit(event.data);
  stream.emit(new Event('bookmarks.visited', event.data));
});

const bookmarkCheckGate  = (bk) => gate('bookmarks.check', (event, stream) => {
  const isBookmarked = bk.isBookmarked(event.data);
  stream.emit(new Event('bookmarks.check.result', { ...event.data, isBookmarked }));
});

// ── Rewind gates ──────────────────────────────────────────────────────────
const rewindSnapshotGate = (rewind) => gate('rewind.snapshot', (event, stream) => {
  const { agentId, label } = event.data;
  rewind.snapshot(agentId, { label })
    .then(entry => stream.emit(new Event('rewind.snapshotted', { entry })))
    .catch(err  => stream.emit(new Event('rewind.error', { error: err.message })));
});

const rewindListGate     = (rewind) => gate('rewind.list', (event, stream) => {
  const { agentId, limit } = event.data;
  stream.emit(new Event('rewind.listed', { agentId, snapshots: rewind.list(agentId, limit) }));
});

const rewindRestoreGate  = (rewind) => gate('rewind.restore', (event, stream) => {
  rewind.restore(event.data)
    .then(r   => stream.emit(new Event('rewind.restored', r)))
    .catch(err => stream.emit(new Event('rewind.error', { error: err.message })));
});

const rewindClearGate    = (rewind) => gate('rewind.clear', (event, stream) => {
  const result = rewind.clear(event.data.agentId);
  stream.emit(new Event('rewind.cleared', { agentId: event.data.agentId, ...result }));
});

// ── Provider host gates ───────────────────────────────────────────────────
const providerStartGate  = (ph) => gate('provider.start', (event, stream) => {
  const { providerId, show } = event.data;
  ph.start(providerId, { show: show ?? false })
    .then(r   => stream.emit(new Event('provider.started', r)))
    .catch(err => stream.emit(new Event('provider.error', { providerId, error: err.message })));
});

const providerStopGate   = (ph) => gate('provider.stop', (event, stream) => {
  const result = ph.stop(event.data.providerId);
  stream.emit(new Event('provider.stopped', result));
});

const providerListGate   = (ph) => gate('provider.list', (event, stream) => {
  stream.emit(new Event('provider.listed', { providers: ph.list() }));
});

const providerShowGate   = (ph) => gate('provider.show', (event, stream) => {
  ph.show(event.data.providerId);
  stream.emit(new Event('provider.shown', { providerId: event.data.providerId }));
});

// ── Options gates ──────────────────────────────────────────────────────────
const optionsGetGate = (options) => gate('options.get', (event, stream) => {
  stream.emit(new Event('options.result', options.get()));
});

const optionsSetGate = (options) => gate('options.set', (event, stream) => {
  options.set(event.data)
    .then(data => stream.emit(new Event('options.result', data)))
    .catch(err  => stream.emit(new Event('options.error', { error: err.message })));
});

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

// ── Userscript gates ─────────────────────────────────────────────────────
const userscriptListGate   = (us) => gate('userscript.list',   (event, stream) => {
  stream.emit(new Event('userscript.listed', { scripts: us.list(event.data) }));
});
const userscriptInjectGate = (us) => gate('userscript.inject', (event, stream) => {
  const { agentId, scriptId } = event.data;
  us.inject(agentId, scriptId)
    .then(r   => stream.emit(new Event('userscript.injected', r)))
    .catch(err => stream.emit(new Event('userscript.error', { error: err.message })));
});
const userscriptToggleGate = (us) => gate('userscript.toggle', (event, stream) => {
  try {
    const r = us.toggle(event.data.scriptId, event.data.enabled);
    stream.emit(new Event('userscript.toggled', r));
  } catch (err) { stream.emit(new Event('userscript.error', { error: err.message })); }
});
const userscriptCreateGate = (us) => gate('userscript.create', (event, stream) => {
  try {
    const s = us.create(event.data);
    stream.emit(new Event('userscript.created', { id: s.id, name: s.name }));
  } catch (err) { stream.emit(new Event('userscript.error', { error: err.message })); }
});
const userscriptDeleteGate = (us) => gate('userscript.delete', (event, stream) => {
  try {
    const r = us.delete(event.data.scriptId);
    stream.emit(new Event('userscript.deleted', r));
  } catch (err) { stream.emit(new Event('userscript.error', { error: err.message })); }
});

// ── Registry — register all gates on the bus ──────────────────────────────
function registerAll(bus, deps) {
  const {
    driver, dom, ctxMgr, vault, copilot, mesh, diag, urlListener, seam,
    openFn, closeFn, minimizeFn, hideFn, maximizeFn, getStatusFn, options,
    bookmarks, rewind, providerHost, userscripts,
  } = deps;

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
    minimizeFn && windowMinimizeGate(minimizeFn),
    hideFn     && windowHideGate(hideFn),
    maximizeFn && windowMaximizeGate(maximizeFn),
    // Options
    options    && optionsGetGate(options),
    options    && optionsSetGate(options),
    // Bookmarks
    bookmarks  && bookmarkAddGate(bookmarks),
    bookmarks  && bookmarkRemoveGate(bookmarks),
    bookmarks  && bookmarkListGate(bookmarks),
    bookmarks  && driver && bookmarkOpenGate(bookmarks, driver),
    bookmarks  && bookmarkVisitGate(bookmarks),
    bookmarks  && bookmarkCheckGate(bookmarks),
    // Rewind
    rewind     && rewindSnapshotGate(rewind),
    rewind     && rewindListGate(rewind),
    rewind     && rewindRestoreGate(rewind),
    rewind     && rewindClearGate(rewind),
    // Provider host
    providerHost && providerStartGate(providerHost),
    providerHost && providerStopGate(providerHost),
    providerHost && providerListGate(providerHost),
    providerHost && providerShowGate(providerHost),
    // Userscripts
    userscripts  && userscriptListGate(userscripts),
    userscripts  && userscriptInjectGate(userscripts),
    userscripts  && userscriptToggleGate(userscripts),
    userscripts  && userscriptCreateGate(userscripts),
    userscripts  && userscriptDeleteGate(userscripts),
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
  urlListenGate, windowOpenGate, windowCloseGate, windowMinimizeGate, windowHideGate,
  optionsGetGate, optionsSetGate, statusGate,
  bookmarkAddGate, bookmarkRemoveGate, bookmarkListGate, bookmarkOpenGate,
  rewindSnapshotGate, rewindListGate, rewindRestoreGate,
  providerStartGate, providerStopGate, providerListGate,
  userscriptListGate, userscriptInjectGate, userscriptToggleGate,
};
