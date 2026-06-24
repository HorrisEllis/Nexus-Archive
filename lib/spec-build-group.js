'use strict';
// ── lib/spec-build-group.js — parent/child compartment layer for chunked spec builds
// UUID: nexus-spec-build-group-v1-0000-0000-0000-000000000001
// Version: 1.0.0
// Phase: UNASSIGNED — agreed-on follow-up to Phase 40's descriptor foundation,
// not itself a numbered roadmap phase yet. Not inventing one (same reason
// stated in lib/component-descriptor.js and raid-integration.spec).
//
// ── WHAT THIS IS ────────────────────────────────────────────────────────────
// One spec = one build group. Each chunk in that spec is one capability on
// a component-descriptor (lib/component-descriptor.js), spawned as its own
// real compartment (lib/compartment-engine.js) via toCompartmentIntent().
// A bad chunk fails its own compartment — PASS/FAIL/REWOUND/DELETED, exactly
// compartment-engine's existing semantics — without touching the others.
// That's the torrent-piece behavior; compartment-engine already had it,
// this file is the layer that owns N of them under one spec instead of one.
//
// Storage: Idearium is genuinely flat-file (checked directly —
// idearium/index.js reads/writes idearium.json via readFileSync/
// writeFileSync, no JAA call anywhere in it). Putting chunk tracking in
// JAA and chunk content in idearium.json would be two sources of truth for
// one spec. Instead: each chunk gets its own real file on disk —
// data/idearium/specs/<build-uuid>/<chunk-uuid>.md — and the build-group
// record (data/idearium/specs/<build-uuid>/build-group.json) holds the
// path, not the content. The file browser this is built for reads that
// directory directly. No new sync layer needed (§3.1 — don't build
// infrastructure a simpler option already avoids needing).
//
// Compress/decompress is explicit, not automatic-on-idle — agreed
// reasoning carried over: auto-compression on idle can corrupt a
// mid-write file if the process dies between "idle detected" and "zip
// finished." Explicit compressBuildGroup()/expandBuildGroup() calls only.
//
// §1.2  Every chunk failure is loud and recorded in build-group.json with
//       its real reason — never silently dropped from the group.
// §2.1  Disk before behavior — build-group.json is written before any
//       chunk status is reported back to a caller.

const fs   = require('fs');
const path = require('path');

const descriptor         = require('./component-descriptor');
const compartmentEngine   = require('./compartment-engine');

const DATA_DIR  = path.join(__dirname, '../data/idearium/specs');
const MODULE_ID = 'spec-build-group';
const VERSION   = '1.0.0';

function _ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function _groupDir(buildGroupUuid) {
  return path.join(DATA_DIR, buildGroupUuid);
}

function _groupFile(buildGroupUuid) {
  return path.join(_groupDir(buildGroupUuid), 'build-group.json');
}

function _readGroup(buildGroupUuid) {
  const f = _groupFile(buildGroupUuid);
  if (!fs.existsSync(f)) {
    throw new Error(`[${MODULE_ID}] no build group at ${buildGroupUuid}`);
  }
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function _writeGroup(buildGroupUuid, group) {
  _ensureDir(_groupDir(buildGroupUuid));
  // §2.1 — disk before behavior. Write happens before any caller sees the result.
  fs.writeFileSync(_groupFile(buildGroupUuid), JSON.stringify(group, null, 2), 'utf8');
  return group;
}

// ── createBuildGroup — one descriptor, N capabilities, N compartments ───────
// Spawns a real compartment per capability via compartment-engine.spawn(),
// bridged through descriptor.toCompartmentIntent() — not a parallel intent
// system, the same one compartment-engine already requires.
async function createBuildGroup(specDescriptor) {
  const { ok, errors } = descriptor.validateDescriptor(specDescriptor);
  if (!ok) {
    throw new Error(`[${MODULE_ID}] descriptor invalid, refusing to spawn anything: ${errors.join('; ')}`);
  }

  const buildGroupUuid = `bg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  _ensureDir(_groupDir(buildGroupUuid));

  const chunks = [];
  for (let i = 0; i < specDescriptor.capabilities.length; i++) {
    const cap = specDescriptor.capabilities[i];
    const intent = descriptor.toCompartmentIntent(specDescriptor, i);
    const compartment = await compartmentEngine.spawn({ intent });
    _cacheCompartment(buildGroupUuid, intent.uuid, compartment);
    chunks.push({
      chunkUuid:      intent.uuid,
      compartmentId:  compartment.id,
      capabilityIndex: i,
      verb:           cap.verb,
      noun:           cap.noun,
      intent:         cap.intent,
      hook_ids:       (cap.endpoints || []).map(e => e.hook_id),
      wire_ids:       (cap.wires     || []).map(w => w.wire_id),
      tags:           [specDescriptor.tier, specDescriptor.type].filter(Boolean),
      status:         compartment.status, // RUNNING at this point
      filePath:       null,               // set on PASS
      failureReason:  null,                // set on FAIL/REWOUND/DELETED
      createdAt:      Date.now(),
      updatedAt:      Date.now(),
    });
  }

  const group = {
    buildGroupUuid,
    specUuid:    specDescriptor.uuid,
    componentId: specDescriptor.componentId,
    createdAt:   Date.now(),
    chunks,
  };

  return _writeGroup(buildGroupUuid, group);
}

// ── In-memory live-compartment cache, scoped to this process's lifetime ────
// compartment-engine has no resume-by-id API (checked — it doesn't), so the
// live compartment object from spawn() can't be reconstructed from just an
// id read back off disk. This cache is the honest middle ground: it works
// for exactly as long as the process that called createBuildGroup() is
// still running, which covers the real, common case (a server handling
// create-then-build-chunk requests in the same lifetime) without claiming
// durability it doesn't have. A restart between create and build genuinely
// loses this — that's still true, still stated, not hidden by this cache
// existing. WeakMap would lose entries before chunks finish; a plain Map
// is correct here, cleared per build group once every chunk resolves.
const _liveCompartments = new Map(); // buildGroupUuid -> { chunkUuid -> compartment }

function _cacheCompartment(buildGroupUuid, chunkUuid, compartment) {
  if (!_liveCompartments.has(buildGroupUuid)) _liveCompartments.set(buildGroupUuid, new Map());
  _liveCompartments.get(buildGroupUuid).set(chunkUuid, compartment);
}

// ── buildChunk — the real, working path within this process's lifetime ─────
// Looks up the live compartment this exact process spawned for this chunk.
// Throws a clear, specific error (§1.2) if it's not there — either a typo'd
// id, or genuinely a different process (restart, separate worker) in which
// case the documented limitation above is the real answer, not a bug here.
async function buildChunk(buildGroupUuid, chunkUuid, contentBuilder) {
  const group = _readGroup(buildGroupUuid);
  const chunk = group.chunks.find(c => c.chunkUuid === chunkUuid);
  if (!chunk) {
    throw new Error(`[${MODULE_ID}] no chunk ${chunkUuid} in build group ${buildGroupUuid}`);
  }
  const compartment = _liveCompartments.get(buildGroupUuid)?.get(chunkUuid);
  if (!compartment) {
    throw new Error(
      `[${MODULE_ID}] no live compartment cached for chunk ${chunkUuid} in this process. ` +
      `compartment-engine has no resume-by-id API — this chunk's compartment was either ` +
      `already resolved, or this is a different process than the one that called ` +
      `createBuildGroup() (e.g. after a restart). Not silently worked around.`
    );
  }
  const tracked = await buildChunkWithCompartment(buildGroupUuid, chunk, compartment, contentBuilder);
  _liveCompartments.get(buildGroupUuid)?.delete(chunkUuid);
  return tracked;
}

// ── buildChunkWithCompartment — the real, working path for THIS pass ───────
// Caller already has the live compartment object (e.g. straight out of
// createBuildGroupAndBuildAll below). Executes it for real, writes the
// chunk file on PASS, updates build-group.json either way.
async function buildChunkWithCompartment(buildGroupUuid, chunk, compartment, contentBuilder) {
  const result = await compartmentEngine.execute(compartment, async (workingMemory, constraintFrame) => {
    return contentBuilder(workingMemory, constraintFrame);
  });

  const group = _readGroup(buildGroupUuid);
  // §FIX — look up by capabilityIndex, not chunkUuid. chunkUuid can
  // legitimately differ from what's on disk when a caller substitutes a
  // freshly-spawned compartment for the resume-by-id limitation documented
  // above in buildChunk() — capabilityIndex is the one field that's stable
  // across that substitution, since it's tied to the descriptor, not to
  // any particular compartment instance.
  const tracked = group.chunks.find(c => c.capabilityIndex === chunk.capabilityIndex);
  if (!tracked) {
    throw new Error(`[${MODULE_ID}] no chunk at capabilityIndex ${chunk.capabilityIndex} in build group ${buildGroupUuid}`);
  }
  tracked.chunkUuid     = chunk.chunkUuid;
  tracked.compartmentId = compartment.id;
  tracked.status        = result.status;
  tracked.updatedAt     = Date.now();

  if (result.status === 'PASS') {
    const dir = _groupDir(buildGroupUuid);
    _ensureDir(dir);
    const filePath = path.join(dir, `${chunk.chunkUuid}.md`);
    fs.writeFileSync(filePath, typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2), 'utf8');
    tracked.filePath = filePath;
  } else {
    tracked.failureReason = result._executionError || result.trace_log?.slice(-1)?.[0]?.data?.reason || `compartment ended ${result.status}`;
  }

  _writeGroup(buildGroupUuid, group);
  return tracked;
}

// ── getBuildGroupStatus — what the file browser actually reads ──────────────
function getBuildGroupStatus(buildGroupUuid) {
  return _readGroup(buildGroupUuid);
}

// ── compressBuildGroup / expandBuildGroup — explicit, never automatic ──────
// Real zip via the `archiver`/`adm-zip`-free path: shell out to `zip`,
// already a dependency idearium/repo/watcher.js relies on as a fallback —
// consistent with what's already proven available rather than adding a new
// npm dependency for something the system can already do.
function compressBuildGroup(buildGroupUuid) {
  const { execSync } = require('child_process');
  const dir = _groupDir(buildGroupUuid);
  if (!fs.existsSync(dir)) throw new Error(`[${MODULE_ID}] no build group directory at ${dir}`);
  const zipPath = `${dir}.zip`;
  execSync(`cd "${dir}" && zip -rq "${zipPath}" .`, { stdio: 'pipe' });
  return zipPath;
}

function expandBuildGroup(zipPath, buildGroupUuid) {
  const { execSync } = require('child_process');
  const dir = _groupDir(buildGroupUuid);
  _ensureDir(dir);
  execSync(`unzip -oq "${zipPath}" -d "${dir}"`, { stdio: 'pipe' });
  return dir;
}

module.exports = {
  createBuildGroup,
  buildChunk,
  buildChunkWithCompartment,
  getBuildGroupStatus,
  compressBuildGroup,
  expandBuildGroup,
  MODULE_ID, VERSION,
};
