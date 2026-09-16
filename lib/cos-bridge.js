'use strict';
/**
 * lib/cos-bridge.js — the single real entry point from any NEXUS
 * subsystem into COMPARTMENT OS.
 *
 * §BUILT 2026-09-15 — James: "make sure that idearium is using
 * compartmentos" ... "migrate to cos."
 *
 * §THE REAL GAP THIS CLOSES — idearium's "Upload Project" flow called
 * itself a compartment flow and was not one. lib/project-container.js
 * required lib/compartment-engine.js: a real module, but a different
 * concept — an in-process constraint frame (budget/boundary/intent) with
 * a spawn/execute/resolve lifecycle and no filesystem, no manifest, no
 * process, no system map. COS (cos/) is the real compartmentalized
 * execution environment: a created compartment gets a real directory
 * (fs.root), a real .cos-manifest.json, a real entry in the state store
 * and system map, and a real destroy path that can wipe it. Idearium was
 * using the word without the thing.
 *
 * §WHAT MIGRATED, AND WHAT DID NOT — COS now owns the compartment: its
 * identity, its directory, its lifecycle, its manifest. compartment-
 * engine stays for what it alone does, which COS has no equivalent of:
 * evaluating a declared end-state and resolving honestly to PASS or FAIL
 * (lib/end-state.js). Those are two different jobs and this bridge does
 * not pretend otherwise — see project-container.js's own §MIGRATED note
 * for how the two now sit together. Nothing about compartment-engine's
 * other callers is touched.
 *
 * §WHERE COMPARTMENTS LIVE — COS_COMP_DIR (cos/foundation/constants.js:
 * %APPDATA%/CompartmentOS/compartments/<id> on Windows,
 * ~/.compartment-os/compartments/<id> otherwise). That file is marked
 * IMMUTABLE after v1.0.0 (COS-5) and this bridge does not override it.
 * A caller that needs a compartment to know about a directory outside
 * that root — idearium's repo dir is exactly that case — registers it as
 * a real mount via mountPath() below, which is what fs.mounts on the
 * compartment record is for. The compartment stays where COS puts it;
 * what it can see is recorded on the compartment itself.
 *
 * §HOST SINGLETON — createHost() loads the state store, opens the event
 * bus, builds the system map and registers every gate. That is process-
 * level setup, not per-call: doing it twice in one process would give two
 * StateStore instances writing the same state.json, which is a real
 * corruption path, not a theoretical one. So the host is created once,
 * lazily, and reused. `available()` answers honestly whether COS could
 * be loaded at all, so a caller can degrade rather than crash when COS
 * isn't present (a partial checkout, a test harness).
 */

const fs   = require('fs');
const path = require('path');

const MODULE_ID = 'cos-bridge';
const VERSION   = '1.0.0';

let _host = null;
let _loadError = null;

// ── host ─────────────────────────────────────────────────────────────────
/**
 * getHost() — the process-wide COS host, created on first use.
 * Returns null (never throws) when COS can't be loaded; _loadError holds
 * the real reason, surfaced through lastError() below.
 */
function getHost() {
  if (_host) return _host;
  if (_loadError) return null; // already tried and genuinely failed — don't retry-loop on every call
  try {
    const { createHost } = require('../cos/host/index.js');
    _host = createHost({});
    console.log(`[${MODULE_ID}] COS host up — version ${_host.version}, ${_host.store.listCompartments().length} existing compartment(s)`);
    return _host;
  } catch (e) {
    _loadError = e.message;
    console.error(`[${MODULE_ID}] §1.2 COS host unavailable: ${e.message}`);
    return null;
  }
}

/** available() -> boolean. Real, not a guess — actually boots the host. */
function available() { return !!getHost(); }

/** lastError() -> the real load failure reason, or null. */
function lastError() { return _loadError; }

// ── create ───────────────────────────────────────────────────────────────
/**
 * createCompartment({ name, purpose, runtimeId, networkIsolated }) ->
 * { ok:true, compartment } | { ok:false, error }.
 *
 * Dispatches through COS's own real gate pipeline (cos/cli/commands/
 * create.js -> 'host:compartment:create' -> CreateCompartmentGate), NOT
 * by constructing a compartment object here. That matters: the gate is
 * what writes the manifest, enforces COS-7, updates the system map and
 * emits host:compartment:created — a compartment built any other way
 * would be invisible to every one of those. This is a thin call into the
 * real mechanism, never a second copy of it (§10.3).
 *
 * §NAME UNIQUENESS — COS refuses a duplicate name outright (the gate
 * checks getCompartmentByName). Callers that generate names from user
 * input must expect that real error rather than assume success; see
 * uniqueName() below for the helper project-container uses.
 */
function createCompartment({ name, purpose = '', runtimeId = null, networkIsolated = true } = {}) {
  const host = getHost();
  if (!host) return { ok: false, error: `COS unavailable: ${_loadError}` };
  if (!name) return { ok: false, error: 'name is required' };

  try {
    const { createCompartment: create } = require('../cos/cli/commands/create.js');
    const compartment = create(host, { name, purpose, runtimeId, networkIsolated });
    console.log(`[${MODULE_ID}] created compartment "${compartment.name}" [${compartment.id}] at ${compartment.fs.root}`);
    return { ok: true, compartment };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * uniqueName(base) — a name COS will actually accept, derived from a real
 * base rather than randomly generated. Checks the real store; only
 * appends a suffix when a genuine collision exists. Returns the base
 * unchanged when it's already free, so the common case reads as itself.
 */
function uniqueName(base) {
  const host = getHost();
  const clean = String(base || 'compartment').trim().slice(0, 120);
  if (!host) return clean;
  if (!host.store.getCompartmentByName(clean)) return clean;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${clean}-${n}`;
    if (!host.store.getCompartmentByName(candidate)) return candidate;
  }
  // 998 collisions on one base name is not a case to paper over silently.
  return `${clean}-${Date.now().toString(36)}`;
}

// ── destroy ──────────────────────────────────────────────────────────────
/**
 * destroyCompartment(nameOrId, { wipe, force }) -> { ok, result } |
 * { ok:false, error }. wipe:true removes the compartment's real
 * directory — correct for a cancelled import (nothing in it was ever
 * accepted), wrong for anything that completed.
 */
function destroyCompartment(nameOrId, { wipe = false, force = false } = {}) {
  const host = getHost();
  if (!host) return { ok: false, error: `COS unavailable: ${_loadError}` };
  try {
    const { destroyCompartment: destroy } = require('../cos/cli/commands/destroy.js');
    // The gate resolves by name first, then by id (checked directly in
    // DestroyCompartmentGate) — but destroyCompartment()'s own result
    // matcher only compares ev.payload.name, so an id must be turned
    // into its real name before dispatch or the call would throw "gate
    // did not produce a result" on an operation that actually succeeded.
    const comp = host.store.getCompartmentByName(nameOrId) || host.store.getCompartment(nameOrId);
    if (!comp) return { ok: false, error: `compartment "${nameOrId}" not found` };
    const result = destroy(host, comp.name, { wipe, force });
    console.log(`[${MODULE_ID}] destroyed compartment "${result.name}" [${result.compartmentId}]${result.wiped ? ' (filesystem wiped)' : ''}`);
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── mounts ───────────────────────────────────────────────────────────────
/**
 * mountPath(compartmentId, { path: target, role, writable }) — records a
 * real directory outside the compartment's own root on the compartment
 * record, in fs.mounts, and persists it to both the state store and the
 * on-disk .cos-manifest.json.
 *
 * §WHY THIS EXISTS — COS's create gate seeds fs.mounts as [] and nothing
 * anywhere ever wrote to it; the field was real and permanently empty.
 * Idearium's imported repo lives at idearium/repo/repos/<repoUuid> (its
 * own REPO_STORAGE.dir), outside COS_COMP_DIR, and a compartment that
 * governs a project it cannot name is governance in name only. This
 * writes the real relationship down.
 *
 * §HONEST LIMIT — this is a RECORD, not an enforcement. COS does not
 * currently sandbox filesystem access by fs.writable/fs.mounts (there is
 * no live enforcement point; process-runner.js sets cwd and nothing
 * more). Recording a mount does not restrict anything today. It is
 * written so the compartment's real scope is inspectable and so the
 * enforcement point, when it exists, has real data to enforce against —
 * not so a caller can believe it is already isolated.
 */
function mountPath(compartmentId, { path: target, role = 'project', writable = true } = {}) {
  const host = getHost();
  if (!host) return { ok: false, error: `COS unavailable: ${_loadError}` };
  if (!target) return { ok: false, error: 'path is required' };

  const comp = host.store.getCompartment(compartmentId) || host.store.getCompartmentByName(compartmentId);
  if (!comp) return { ok: false, error: `compartment "${compartmentId}" not found` };

  const mount = { path: target, role, writable, mountedAt: Date.now() };
  comp.fs = comp.fs || { root: null, writable: [], readonly: [], mounts: [], watchEnabled: true };
  comp.fs.mounts = Array.isArray(comp.fs.mounts) ? comp.fs.mounts : [];
  // Idempotent — remounting the same path for the same role updates it
  // rather than appending a duplicate every finalize retry.
  const existing = comp.fs.mounts.findIndex(m => m.path === target && m.role === role);
  if (existing >= 0) comp.fs.mounts[existing] = mount;
  else comp.fs.mounts.push(mount);

  if (writable && !comp.fs.writable.includes(target)) comp.fs.writable.push(target);
  comp.updatedAt = Date.now();

  try {
    host.store.setCompartment(comp);
    host.store.flushSync();
    host.sysmap.upsertCompartment(comp);
  } catch (e) {
    return { ok: false, error: `mount persist failed: ${e.message}` };
  }

  // Keep the on-disk manifest truthful too — the state store and the
  // manifest are two real readers of the same fact, and a manifest that
  // disagrees with the store is exactly the kind of quiet drift COS-7
  // exists to prevent.
  const manifestPath = comp.fs.root ? path.join(comp.fs.root, '.cos-manifest.json') : null;
  if (manifestPath) {
    try { fs.writeFileSync(manifestPath, JSON.stringify(comp, null, 2), 'utf8'); }
    catch (e) { console.warn(`[${MODULE_ID}] mount recorded in store but manifest rewrite failed (${manifestPath}): ${e.message}`); }
  }

  return { ok: true, compartmentId: comp.id, mounts: comp.fs.mounts };
}

// ── read ─────────────────────────────────────────────────────────────────
/** getCompartment(nameOrId) -> the real compartment record, or null. */
function getCompartment(nameOrId) {
  const host = getHost();
  if (!host) return null;
  return host.store.getCompartment(nameOrId) || host.store.getCompartmentByName(nameOrId) || null;
}

/** listCompartments() -> every real compartment COS knows about. */
function listCompartments() {
  const host = getHost();
  return host ? host.store.listCompartments() : [];
}

module.exports = {
  getHost, available, lastError,
  createCompartment, destroyCompartment, uniqueName,
  mountPath, getCompartment, listCompartments,
  MODULE_ID, VERSION,
};
