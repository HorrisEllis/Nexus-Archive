/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Idearium HTTP API — idearium/api/index.js                             ║
 * ║  UUID:    idearium-api-v1-0000-4000-0000-000000000002                  ║
 * ║  Version: pre-release  ·  Port: 4800                                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Every endpoint declared in interaction-contract.json is implemented here.
 * The UI talks ONLY to this layer. Never to core directly.
 * SSE on /sse — broadcasts all IdeaOS events.
 *
 * §1.2  Every error is loud, specific, traceable.
 * §5.2  Everything implements the bridge.
 */

import http         from 'http';
import os           from 'os';
import crypto       from 'crypto';
import { createRequire } from 'module';
import { spawnSync, spawn as spawnProc } from 'child_process';
// §WIRED — real, distinct config, not inline constants. See
// idearium/config.js's own header. Matches the established pattern.
import config from '../config.js';
const _require = createRequire(import.meta.url);

// §AX-010 2026-07-10 — idearium hardcoded 127.0.0.1:9000 in four places
// (ledger x2, register, heartbeat). Resolve the orchestrator from
// orchestrator.config.json's `ports` block (AX-010 single source of truth) so
// idearium stops being the last system that hardwires the port. Falls back to
// :9000 with a warning only if the config is unreadable.
const _nexusClient = _require('../../lib/nexus-client.js');
function _orchestrator() {
  try { return _nexusClient.resolve('orchestrator'); }
  catch (e) { console.warn('[idearium/api] orchestrator resolve failed, defaulting :9000:', e.message); return { host: '127.0.0.1', port: 9000 }; }
}

// ── Meta: Spatial Lattice — resonance-weighted idea/spec/gap graph ────────────
let _latticeEng = null;
function _getLattice() {
  if (_latticeEng) return _latticeEng;
  try {
    const { LatticeEngine } = _require('../../intelligence/spatial/lattice.js');
    _latticeEng = new LatticeEngine({ threshold: 0.3 });
  } catch(_) {}
  return _latticeEng;
}
function _latticeAdd(id, label, tags=[]) {
  try { const l=_getLattice(); if(l) l.add({id,label:label.slice(0,80),tags}); } catch(_) {}
}
function _latticeLink(a, b, w=0.7, t='associated') {
  try { const l=_getLattice(); if(l) { _latticeAdd(a,a); _latticeAdd(b,b); l.connect(a,b,w,t); } } catch(_) {}
}
import { getIdeaOS, VERSION } from '../core/index.js';
// ── Spec Engine + Agent Suite (Phase 40) ──────────────────────────────────────
let _specEngine = null;
let _agentSuite = null;
let _specEngineFailedAt = 0;
const SPEC_ENGINE_RETRY_COOLDOWN_MS = 60000; // §FOUND & FIXED 2026-09-06 — James, live: "idearium still keeps crashing." getSpecEngine() retried a fresh dynamic import() on EVERY call while failing — the new build-queue poller calls this every 15s, forever, with zero cooldown once it started failing. A real, compounding resource drain, not just noisy logs.
function getSpecEngine() {
  if (!_specEngine && (Date.now() - _specEngineFailedAt > SPEC_ENGINE_RETRY_COOLDOWN_MS)) {
    import('../spec-engine/index.js').then(m => { _specEngine = m.default || m; }).catch(e => {
      _specEngineFailedAt = Date.now();
      console.warn('[idearium/api] spec-engine load failed:', e.message);
    });
  }
  return _specEngine;
}
let _copilotAdapter = null;
let _copilotAdapterFailedAt = 0;
function getCopilotAdapter() {
  if (!_copilotAdapter && (Date.now() - _copilotAdapterFailedAt > SPEC_ENGINE_RETRY_COOLDOWN_MS)) {
    import('../copilot-adapter/index.js').then(m => { _copilotAdapter = m.default || m; }).catch(e => {
      _copilotAdapterFailedAt = Date.now();
      console.warn('[idearium/api] copilot-adapter load failed:', e.message);
    });
  }
  return _copilotAdapter;
}
let _agentSuiteFailedAt = 0;
function getAgentSuite() {
  if (!_agentSuite && (Date.now() - _agentSuiteFailedAt > SPEC_ENGINE_RETRY_COOLDOWN_MS)) {
    import('../agent-suite/index.js').then(m => { _agentSuite = m.default || m; }).catch(e => {
      _agentSuiteFailedAt = Date.now();
      console.warn('[idearium/api] agent-suite load failed:', e.message);
    });
  }
  return _agentSuite;
}

// §PHASE 2 WIRE 2026-07-09 — idearium/spec-engine/warp-build-dispatch.js had
// ZERO consumers. The production build path called as.buildChunkWithAgent()
// directly, so WARP's exact cache was never in it: every chunk paid full
// tokens, every time, forever. That is the whole of the "WARP doesn't
// compound" complaint — the cache was not slow, it was not there.
//
// createWarpChunkDispatch(as) returns a function with the SAME
// (prompt, opts) -> {ok, text} shape as as.buildChunkWithAgent, so it is a
// drop-in for dispatchChunkWithVerification's dispatchFn. It adds: exact-cache
// lookup, population seed, provider cascade, and axiom-gate validation.
//
// Fails soft. If WARP cannot load, builds continue on the direct agent path
// rather than breaking — a caching layer must never be a single point of
// failure for the thing it caches.
let _warpChunkDispatch = null;
let _warpLoadAttempted = false;
let _warpLoadPromise   = null;
let _warpLoadError     = null;

/**
 * §PHASE 2 FIXED 2026-07-09 — two faults, both hidden by "fails soft".
 *
 * (1) This fired the dynamic import and returned null IMMEDIATELY. The import
 *     resolves a tick later, so the FIRST build always took the direct agent
 *     path — the one build most likely to be a cache miss anyway, but also the
 *     one that must WRITE the cache for anything to compound. Now awaitable.
 *
 * (2) warp-build-dispatch.js could not be imported at all: it does
 *     `import { pollGuardianJob }` and chunk-dispatch.js exported no such name
 *     (it had `_pollGuardianJob`, private). Every call rejected, the catch
 *     logged a warning, and every build silently used the direct agent path —
 *     while the comment above speceng.build stated dispatch went through WARP.
 *     Fixed at the source (chunk-dispatch now exports the real poller).
 *
 * Still fails soft: a caching layer must never be a single point of failure for
 * the thing it caches. But the failure is now RECORDED (§1.2) and reported by
 * `warpStatus()`, so "WARP is in the build path" is a checkable claim rather
 * than a comment.
 */
async function getWarpChunkDispatch() {
  const as = getAgentSuite();
  if (!as) return null;
  if (_warpChunkDispatch) return _warpChunkDispatch;
  if (_warpLoadAttempted && !_warpLoadPromise) return null;

  if (!_warpLoadAttempted) {
    _warpLoadAttempted = true;
    _warpLoadPromise = import('../spec-engine/warp-build-dispatch.js')
      .then(m => {
        _warpChunkDispatch = m.createWarpChunkDispatch(as, {});
        console.log('[idearium/api] WARP chunk dispatch active — exact cache in the build path');
        return _warpChunkDispatch;
      })
      .catch(e => {
        _warpLoadError = e.message;
        console.warn('[idearium/api] WARP dispatch unavailable, using direct agent path:', e.message);
        return null;
      })
      .finally(() => { _warpLoadPromise = null; });
  }
  return _warpLoadPromise ? await _warpLoadPromise : _warpChunkDispatch;
}

/** warpStatus() — makes "WARP is in the build path" observable (§2.3). */
function warpStatus() {
  return { active: !!_warpChunkDispatch, attempted: _warpLoadAttempted, error: _warpLoadError };
}
// Pre-warm on startup
// §FIXED 2026-07-09 — getWarpChunkDispatch() returns null until its dynamic
// import resolves, so without pre-warming the FIRST speceng.build always
// bypasses WARP. That is precisely the build whose output most needs to enter
// the cache. Pre-warm after agent-suite, since the dispatch needs it.
getSpecEngine(); getAgentSuite(); getCopilotAdapter();
setTimeout(() => { getWarpChunkDispatch().catch(() => {}); }, 100);  // pre-warm; failure already recorded by warpStatus()
import { RepoLayer } from '../repo/index.js';
import { compileIdeariumSpec } from '../compiler-bridge.js';
import { extractModulesViaGuardian } from '../spec-engine/guardian-extract.js';
import { fileURLToPath as _fileURLToPath, pathToFileURL as _pathToFileURL } from 'url';

// §BUG CAUGHT 2026-07-15 — the legacy spec.build route (below) reads
// `os.dataDir`, but IdeaOS (idearium/index.js) never sets `this.dataDir`
// anywhere — it's always undefined, silently falling back to
// path.join(process.cwd(), 'data'), which only happens to be right if the
// process was launched from inside idearium/. Computed here the same way
// spec-engine/index.js derives SPECS_ROOT — file-relative, not cwd-relative —
// so compileIdeariumSpec's output actually lands next to data/specs/ instead
// of wherever the launcher's cwd happened to be.
// §FIXED 2026-09-06 — James: "need to clear out test data from idearium."
// Real, confirmed cause: this path was hardcoded with no override, so
// every real test file this whole session (idearium-phase-sync,
// idearium-reuse, idearium-warp-cache, idearium-loop, and idearium/
// test/e2e-pipeline.test.js itself) wrote directly into the same real
// data directory that ships in every zip — 63 test-generated specs
// found and removed from idearium/data/specs/ this same pass, alongside
// the 3 genuinely real ones (brainos-real-import x3). IDEARIUM_DATA_DIR
// env var lets a test point this somewhere real-but-disposable instead.
const IDEARIUM_DATA_DIR = process.env.IDEARIUM_DATA_DIR || path.join(path.dirname(_fileURLToPath(import.meta.url)), '..', 'data');
import { dispatchChunkWithVerification } from '../spec-engine/chunk-dispatch.js';
import { COMPONENTS as IDEARIUM_COMPONENTS } from '../registry-components.js';
import path from 'path';
import fs from 'fs';
import { loadTable, appendRow, deleteRow, syncTable } from '../lib/db.js';

// §PROJECTS 2026-07-19 — "a place to store projects, easily." A flat
// binary shelf for whole project archives (zips built elsewhere — MASTERMIND
// builds, eravos snapshots, clear-glass-lite, whatever lands in Downloads),
// deliberately NOT run through RepoLayer/spec-engine. Repos are for specs
// with idea/lineage tracking; this is just "keep this zip somewhere I can
// find it again" — one row per file (uuid, name, filename, diskName, size,
// uploadedAt) in idearium_projects, raw bytes on disk under data/projects/.
const PROJECTS_DIR = path.join(IDEARIUM_DATA_DIR, 'projects');
try { fs.mkdirSync(PROJECTS_DIR, { recursive: true }); } catch (e) { console.warn('[idearium/api] could not create projects dir:', e.message); }

// §HISTORY 2026-07-15 — chunk retry trail + build-artifact list, read back
// out of the append-only tables lib/cortex-listeners.js writes on
// 'idearium.spec-engine.chunk.complete' / 'idearium.spec.build.completed'.
// Attached to speceng.show rather than a new route — the UI already fetches
// this endpoint to render the builder panel, and history belongs to the
// same spec-detail request rather than a second round trip (decided on
// review before wiring the UI). Each table read is independently guarded —
// a jaa-db read failure on one must not blank the manifest the rest of the
// response depends on (§1.2): a broken history comes back empty with a
// loud console warning, never a 500 on the whole endpoint.
const CHUNK_EVENTS_LIMIT = config.CHUNK_EVENTS_LIMIT; // most-recent-first cap — a 58-chunk spec with retries can generate hundreds of rows; the UI needs a trail, not the full audit log on every request
function _specHistory(specUuid) {
  let chunkEvents = [];
  try {
    chunkEvents = loadTable('idearium_spec_chunk_events')
      .filter(r => r.specUuid === specUuid)
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
      .slice(0, CHUNK_EVENTS_LIMIT);
  } catch (e) { console.warn('[idearium/api] history: chunk_events read failed:', e.message); }

  let buildArtifacts = [];
  try {
    buildArtifacts = loadTable('idearium_build_artifacts')
      .filter(r => r.specUuid === specUuid)
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0)); // [0] = most recent, matches db.js's own "snapshots[0] is most recent" convention
  } catch (e) { console.warn('[idearium/api] history: build_artifacts read failed:', e.message); }

  return { chunkEvents, buildArtifacts };
}

// ── Repo layer singleton — each idea-as-repo lives here, not in a single
//    hardcoded "Nexus folder". Wired in (previously dead code, zero routes
//    called it).
let _repoLayer = null;
function getRepoLayer() {
  if (!_repoLayer) _repoLayer = new RepoLayer({ ideaOS: getIdeaOS(), specEngine: getSpecEngine });
  return _repoLayer;
}

// §SHARED 2026-07-10 — the deterministic chunks-to-repo-files assembly that
// spec.promote does. Pulled out so spec.import can call it directly and
// create the repo as part of import ("repository created automatically"),
// instead of requiring a second manual promote call for a spec that's
// already complete the moment it's imported. Same rules apply: mode:'emerge'
// refuses to promote an unfinished spec rather than shipping a repo that
// claims completeness it doesn't have.
// §SIMPLIFIED 2026-07-11 — RepoLayer no longer needs a rebuilt files[] +
// specText bundle handed to it; it indexes the manifest that already
// exists by specUuid directly (see repo/index.js's redesign — "the spec
// is the metadata, the repo is a thin index over it"). This function's
// job shrinks to exactly one check: is the spec actually complete enough
// to promote. Everything past that is one line.
// §GUARDIAN-COMPILE 2026-07-15 — closes the second half of the gap the
// 2026-07-10 comment above named: "idea -> spec -> chunk -> dispatch ->
// ARTIFACT -> repo" ended at a markdown archive, never at real code.
// repo.ingest() below is UNCHANGED — the archive still always happens when
// chunks are complete, independent of whether compile succeeds. Compile is
// a second, separate outcome recorded on the result, not a precondition
// for the repo existing.
//
// ideaOS is now a required first argument (was previously free-standing —
// this function had no way to os.emit()). Every call site already has an
// IdeaOS instance in scope (both call sites are inside api/index.js's
// `handle()`, which does `const os = getIdeaOS()` at its top).
async function _promoteSpecToRepo(ideaOS, se, specUuid, mode = 'emerge') {
  let manifest;
  try { manifest = se.loadSpec(specUuid); }
  catch (e) { return { error: `spec not found: ${specUuid}` }; }

  const pending = manifest.chunks.filter(c => c.status !== 'complete');
  if (mode === 'emerge' && pending.length > 0) {
    return { error: `cannot auto-promote: ${pending.length} of ${manifest.chunks.length} chunks not built ` +
      `(${pending.map(c => c.sectionId).join(', ')}). Build them, or promote with mode:'manual' to finish in the spec builder.` };
  }

  const result = getRepoLayer().ingest({
    name: manifest.name,
    specUuid: manifest.uuid,
    source: `promote:${mode}`,
    parent: manifest.ideaUuid || null,
    promotedFromSpec: specUuid,
  });
  if (result.error) return { error: result.error };

  const repoUuid = result.repo?.uuid || null;
  if (!repoUuid) return { error: 'ingest returned no repo — promotion did not create a repository' };

  // ── Real code, not just archived prose ──────────────────────────────────
  // Only attempted on 'emerge' (fully-built specs) — 'manual' promotions can
  // have TODO-marked pending sections, and extracting/compiling from an
  // admittedly-incomplete spec would be worse than not trying: a compile
  // "succeeding" against placeholder content is a false signal.
  let compiled = { ok: false, attempted: false };
  if (mode === 'emerge') {
    let extraction;
    try {
      extraction = await extractModulesViaGuardian(manifest, { specUuid: manifest.uuid });
    } catch (e) {
      extraction = { ok: false, error: `extraction threw: ${e.message}` };
    }

    if (extraction.ok) {
      const translatedSpec = {
        uuid: manifest.uuid,
        name: manifest.name,
        sections: [
          { id: 'intent', content: manifest.chunks.find(c => c.sectionId === 'purpose')?.content || '' },
          { id: 'module_hooks', content: extraction.yaml },
        ],
      };
      const outputDir = path.join(IDEARIUM_DATA_DIR, 'compiled', manifest.uuid);
      let compileResult;
      try {
        compileResult = await compileIdeariumSpec(translatedSpec, outputDir, { tier: 1 });
      } catch (e) {
        compileResult = { ok: false, error: e.message, step: 'compile-exception' };
      }
      compiled = {
        ok: !!compileResult.ok, attempted: true, outputDir,
        t0: compileResult.t0?.emitted?.length ?? 0,
        t1: compileResult.t1?.emitted?.length ?? 0,
        // Honest provenance label — distinct from compiler-bridge's own
        // 'structured'/'fallback' so a caller can tell "Guardian extracted
        // real modules and they compiled" apart from either of those paths.
        extraction: 'guardian-extracted',
        agent: extraction.agent,
        error: compileResult.ok ? null : (compileResult.error || 'compile did not report ok'),
      };
    } else {
      // §1.2 — no silent fallback into compiler-bridge's placeholder module.
      // A failed extraction is reported as a failed compile, not papered over.
      compiled = { ok: false, attempted: true, extraction: 'guardian-failed', error: extraction.error };
    }

    // Bus event — the ONLY thing that makes cortex-listeners.js persist this
    // into idearium_build_artifacts. Fire regardless of ok/error so failed
    // attempts are queryable too, not just successes. Named as a domain
    // event (build completed), not the implementation (compileIdeariumSpec's
    // internal compile() call) — same name the legacy spec.build route below
    // now emits too, so one listener covers both entry points.
    ideaOS.emit('idearium.spec.build.completed', {
      specUuid: manifest.uuid, outputDir: compiled.outputDir || null,
      t0: compiled.t0 ?? null, t1: compiled.t1 ?? null,
      extraction: compiled.extraction || null, agent: compiled.agent || null,
      ok: compiled.ok, error: compiled.error || null,
    });
  }

  return {
    repoUuid, ideaUuid: result.ideaUuid, specUuid: result.specUuid,
    // §MERGED 2026-07-11 — result.ideaUuid above is RepoLayer.ingest()'s
    // own SYNTHETIC "Repo: <name>" idea it always creates to track the
    // repo — not the idea that originated this spec. manifest.ideaUuid is
    // the real one; exposed separately so callers advancing the
    // ORIGINATING idea's phase don't silently advance the wrong idea.
    originIdeaUuid: manifest.ideaUuid || null,
    mode, chunksBuilt: manifest.chunks.length - pending.length, chunksTotal: manifest.chunks.length,
    compiled, // { ok, attempted, outputDir, t0, t1, extraction, agent, error } — archive vs real code, distinguishable
  };
}

const PORT    = config.PORT;
const BINDING = config.BINDING;
// §MIGRATED 2026-08-29 — real pulse handle, module scope (not local to
// the phase closure) so a real shutdown path has something real to call
// — same naming convention as cortex/boot.js's own real migration
// (_pulseClient), not a third, differently-named variable for the exact
// same real concept.
let _pulseClient = null;

// §CRASH FIX 2026-07-15 — last-resort net. The /sse and static-file branches
// above had their own uncaught-throw paths fixed directly (see their own
// comments for the actual mechanism and why it matters — Node 22 crashes
// the WHOLE process on an unhandled promise rejection by default, not just
// the one request). This is the belt-and-suspenders version: if some other
// branch nobody's found yet does the same thing, log it loudly and keep the
// server alive rather than silently going dark to every poller and the UI.
// §1.2 nothing silently fails — a caught-and-logged error is recoverable;
// an unannounced process death that leaves ':4800 unreachable' with no
// trace of why is exactly the failure mode this exists to prevent.
process.on('unhandledRejection', (reason) => {
  console.error('[API][FATAL-AVOIDED] unhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[API][FATAL-AVOIDED] uncaughtException:', err.stack || err.message);
});

// Idearium is internal-only — no LAN discovery, no remote tunnel.
// All access goes through the orchestrator (:9000) proxy.

// ─── Body parser ─────────────────────────────────────────────────────────────

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// ─── Response helpers ─────────────────────────────────────────────────────────

function ok(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify({ ok: true, ...data }));
}

function err(res, code, message, detail = null) {
  // §1.2 — specific, not generic
  res.writeHead(code, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify({ ok: false, error: message, detail }));
}

// §FIX 2026-09-03 — James, from a real production boot log + UI screenshot:
// an idea ("Daw") and its linked spec both permanently stuck showing phase
// "building" with 0% tension, long after the real build had finished.
// Traced to a real gap: idearium/spec-engine/index.js's completeChunk()
// correctly flips manifest.status to 'complete' once every real chunk is
// done (confirmed by reading that function directly), but NOTHING in this
// file ever read that real status back and told the idea/spec phase
// tracker about it. The exact same class of bug was already found and
// fixed once, in the OLDER legacy `spec.build` -> compileIdeariumSpec()
// path (search this file for "phase was parked at 'building' above and
// nothing ever moved it forward") — but the newer WARP chunk-dispatch path
// (the one the real boot log confirms is actually active: "[idearium/api]
// WARP chunk dispatch active") never got the same fix. This is that fix,
// as one real, shared helper instead of four separate copies (this file
// has four real completeChunk() call sites) so the two paths can't drift
// apart from each other again.
function _syncPhaseFromManifest(os, manifest) {
  if (!manifest) return;
  if (manifest.status === 'complete') {
    os.emit('idearium.spec.update', { uuid: manifest.uuid, fields: { phase: 'complete' } });
    if (manifest.ideaUuid) {
      os.emit('idearium.idea.phase', { uuid: manifest.ideaUuid, phase: 'complete', source: 'spec-engine' });
    }
  }
}

const CORS = config.CORS;

// ── Capability model ──────────────────────────────────────────────────────────
// Every route maps to exactly one capability.
// A key must have that capability to call it.
// §1.2: wrong capability = 403 with the required capability named.
// §5.1: every key has a UUID and an audit trail.

const CAPS = {
  READ_IDEAS:   'read_ideas',    // GET ideas, specs, gaps, snapshots, stats, health
  WRITE_IDEAS:  'write_ideas',   // POST/PATCH ideas, create specs, open gaps
  SEARCH_IDEAS: 'search_ideas',  // GET /api/ideas?search= (subset of read)
  ADMIN:        'admin',         // key management, tunnel control, snapshots, cli.exec
};

// Route → required capability
const ROUTE_CAP = {
  'health':           null,              // public — no auth required
  'contract.get':     null,              // public — contract is always readable
  'stats.get':        null,              // public — non-sensitive, required by boot verify (§1.2 HALT fix)
  'snr.current':      CAPS.READ_IDEAS,
  'snr.history':      CAPS.READ_IDEAS,
  'events.log':       CAPS.READ_IDEAS,
  'idea.list':        CAPS.READ_IDEAS,
  'idea.show':        CAPS.READ_IDEAS,
  'idea.create':      CAPS.WRITE_IDEAS,
  'brainstorm.list':    CAPS.READ_IDEAS,
  'brainstorm.create':  CAPS.WRITE_IDEAS,
  'brainstorm.delete':  CAPS.WRITE_IDEAS,
  'brainstorm.promote': CAPS.WRITE_IDEAS,
  'idea.update':      CAPS.WRITE_IDEAS,
  'idea.tension':     CAPS.WRITE_IDEAS,
  'idea.link':        CAPS.WRITE_IDEAS,
  'idea.spec':        CAPS.WRITE_IDEAS,
  'idea.phase':       CAPS.WRITE_IDEAS,
  'idea.archive':     CAPS.WRITE_IDEAS,
  'idea.progress':    CAPS.WRITE_IDEAS,
  'spec.list':        CAPS.READ_IDEAS,
  'spec.show':        CAPS.READ_IDEAS,
  'spec.update':      CAPS.WRITE_IDEAS,
  'spec.check':       CAPS.WRITE_IDEAS,
  'spec.build':       CAPS.WRITE_IDEAS,
  'spec.export':      CAPS.READ_IDEAS,
  'spec.archive':     CAPS.WRITE_IDEAS,
  'gap.list':         CAPS.READ_IDEAS,
  'gap.show':         CAPS.READ_IDEAS,
  'gap.open':         CAPS.WRITE_IDEAS,
  'gap.resolve':      CAPS.WRITE_IDEAS,
  'gap.ignore':       CAPS.WRITE_IDEAS,
  'snapshot.list':    CAPS.READ_IDEAS,
  'snapshot.show':    CAPS.READ_IDEAS,
  'snapshot.diff':    CAPS.READ_IDEAS,
  'snapshot.push':    CAPS.ADMIN,
  'queue.show':       CAPS.READ_IDEAS,
  'queue.progress':   CAPS.WRITE_IDEAS,
  'speceng.setWarpPrimitives': CAPS.WRITE_IDEAS,
  'cli.exec':         CAPS.ADMIN,
};

// Key-based auth removed — Idearium is internal-only, reached solely
// through the orchestrator's proxy. No per-system credentials needed.

// ─── Router ──────────────────────────────────────────────────────────────────

function matchRoute(method, url) {
  const clean = url.split('?')[0].replace(/\/+$/, '') || '/';
  const segs  = clean.split('/').filter(Boolean);

  // Static routes first
  const routes = [
    ['GET',    [],                        'health'],
    ['GET',    ['health'],                 'health'],     // alias: GET /health → same as GET /
    ['GET',    ['api','contract'],        'contract.get'],
    ['GET',    ['api','contract','live'], 'contract.live'],
    ['GET',    ['api','stats'],           'stats.get'],
    ['GET',    ['api','snr'],             'snr.current'],
    ['GET',    ['api','snr','history'],   'snr.history'],
    ['GET',    ['api','events'],          'events.log'],
    ['GET',    ['api','ideas'],           'idea.list'],
    ['POST',   ['api','ideas'],           'idea.create'],
    // §BUILT 2026-09-03 — James: "idearium needs to use data folder. no
    // DOM storage." Was localStorage('idearium.brainstorms') in the
    // browser, ui/js/app.js — genuinely the one place in idearium that
    // held real user data outside the JAA-backed data/ folder every other
    // feature already goes through. Same table pattern as everything
    // else (loadTable/appendRow/deleteRow, lib/db.js).
    ['GET',    ['api','brainstorms'],           'brainstorm.list'],
    ['POST',   ['api','brainstorms'],           'brainstorm.create'],
    ['DELETE', ['api','brainstorms',':uuid'],   'brainstorm.delete'],
    ['POST',   ['api','brainstorms',':uuid','promote'], 'brainstorm.promote'],
    ['GET',    ['api','specs'],           'spec.list'],
    ['POST',   ['api','specs'],           'spec.create'],
    ['GET',    ['api','gaps'],            'gap.list'],
    ['POST',   ['api','gaps'],            'gap.open'],
    ['GET',    ['api','snapshots'],       'snapshot.list'],
    ['POST',   ['api','snapshots'],       'snapshot.push'],
    ['POST',   ['api','cli','exec'],      'cli.exec'],      // unified CLI axiom
    ['GET',    ['api','repos'],           'repo.list'],
    ['POST',   ['api','repos'],           'repo.ingest'],
    // §IMPORT-PROJECT 2026-09-03 — the Import Project screen's zip path.
    // Distinct from POST /api/repos (flat text-file drops, no archive
    // handling) and from POST /api/projects (opaque zip shelf, no
    // RepoLayer/spec-engine — "store this zip, list it, get it back").
    // This one produces a real repo compartment FROM a zip, synchronously,
    // in one request — see handler for why the existing zip-ingest code
    // (idearium/repo/watcher.js) isn't called as-is.
    ['POST',   ['api','repos','import'],  'repo.import-archive'],
    // ── Projects (§PROJECTS 2026-07-19) — flat zip shelf, separate from repos ──
    ['GET',    ['api','projects'],                    'project.list'],
    ['POST',   ['api','projects'],                    'project.upload'],
    ['GET',    ['api','projects', ':uuid','download'],'project.download'],
    ['DELETE', ['api','projects', ':uuid'],            'project.delete'],
    // ── Spec Engine (Phase 40) ─────────────────────────────────────────────
    // §ROUTED 2026-07-09 — the action alone is unreachable; idearium dispatches
    // by (method, segments) -> action. A handler with no route is an orphan.
    ['GET',    ['api','spec-engine','warp-status'],          'speceng.warp.status'],
    ['GET',    ['api','spec-engine','templates'],            'speceng.templates'],
    ['GET',    ['api','spec-engine','specs'],               'speceng.list'],
    ['POST',   ['api','spec-engine','specs'],               'speceng.create'],
    // §ROUTED 2026-07-10 — the promote action that bridges a built spec to a repo.
    ['POST',   ['api','spec-engine','import'],              'spec.import'],
    ['POST',   ['api','spec-engine','specs',':uuid','promote'], 'spec.promote'],
    ['POST',   ['api','spec-engine','wizard'],              'speceng.wizard'],
    ['GET',    ['api','spec-engine','context'],             'speceng.context'],
    // §GATE 2026-07-11 — copilot adapter boundary. See copilot-adapter/index.js.
    ['POST',   ['api','copilot','suggest'],                 'copilot.suggest'],
    ['GET',    ['sse'],                   'sse'],
  ];

  for (const [m, pattern, action] of routes) {
    if (m !== method) continue;
    if (pattern.length !== segs.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i].startsWith(':')) params[pattern[i].slice(1)] = segs[i];
      else if (pattern[i] !== segs[i]) { match = false; break; }
    }
    if (match) return { action, params };
  }

  // Bridge routes

  // Dynamic routes
  const dynRoutes = [
    ['GET',    ['api','ideas',    ':uuid'],               'idea.show'],
    ['PATCH',  ['api','ideas',    ':uuid'],               'idea.update'],
    ['DELETE', ['api','ideas',    ':uuid'],               'idea.archive'],
    ['POST',   ['api','ideas',    ':uuid','tension'],     'idea.tension'],
    ['POST',   ['api','ideas',    ':uuid','link'],        'idea.link'],
    ['POST',   ['api','ideas',    ':uuid','spec'],        'idea.spec'],
    ['POST',   ['api','ideas',    ':uuid','phase'],       'idea.phase'],
    ['GET',    ['api','specs',    ':uuid'],               'spec.show'],
    ['PATCH',  ['api','specs',    ':uuid'],               'spec.update'],
    ['POST',   ['api','specs',    ':uuid','check'],       'spec.check'],
    ['POST',   ['api','ideas',    ':uuid','progress'],  'idea.progress'],
    ['POST',   ['api','queue',    ':queueId','progress'],'queue.progress'],
    ['GET',    ['api','queue',    ':queueId'],           'queue.show'],
    ['POST',   ['api','specs',    ':uuid','build'],       'spec.build'],
    ['GET',    ['api','specs',    ':uuid','export'],      'spec.export'],
    ['DELETE', ['api','specs',    ':uuid'],               'spec.archive'],
    ['GET',    ['api','gaps',     ':uuid'],               'gap.show'],
    ['POST',   ['api','gaps',     ':uuid','resolve'],     'gap.resolve'],
    ['POST',   ['api','gaps',     ':uuid','ignore'],      'gap.ignore'],
    ['GET',    ['api','snapshots',':uuid'],               'snapshot.show'],
    ['GET',    ['api','snapshots',':a','diff',':b'],      'snapshot.diff'],
    ['POST',   ['api','snapshots',':uuid','restore'],     'snapshot.restore'],
    ['GET',    ['api','repos',    ':uuid'],               'repo.show'],
    // ── Spec Engine dynamic routes ──────────────────────────────────────────
    ['GET',    ['api','spec-engine','specs',':uuid'],              'speceng.show'],
    ['POST',   ['api','spec-engine','specs',':uuid','build'],      'speceng.build'],
    ['POST',   ['api','spec-engine','specs',':uuid','chunk',':chunkUuid','complete'], 'speceng.chunk.complete'],
    ['POST',   ['api','spec-engine','specs',':uuid','chunk',':chunkUuid','fail'],     'speceng.chunk.fail'],
    // §BUILT 2026-09-03 — per-chunk agent reassignment, PENDING chunks only
    // (spec-engine/index.js's setChunkAgent enforces this, not this route).
    ['POST',   ['api','spec-engine','specs',':uuid','chunk',':chunkUuid','agent'],    'speceng.chunk.setAgent'],
    // §BUILT 2026-09-03 — WARP primitives, spec-level (not chunk-level,
    // no PENDING guard — this is declared metadata about the component,
    // editable any time).
    ['POST',   ['api','spec-engine','specs',':uuid','warp-primitives'],   'speceng.setWarpPrimitives'],
    ['POST',   ['api','spec-engine','specs',':uuid','archive'],    'speceng.archive'],
    ['DELETE', ['api','spec-engine','specs',':uuid'],              'speceng.delete'],
    ['POST',   ['api','spec-engine','specs',':uuid','restore'],    'speceng.restore'],
    ['POST',   ['api','spec-engine','specs',':uuid','expand'],     'speceng.expand'],
    ['POST',   ['api','repos',    ':uuid','fork'],        'repo.fork'],
    ['DELETE', ['api','repos',    ':uuid'],               'repo.archive'],
    ['GET',    ['api','repos',    ':uuid','lineage'],     'repo.lineage'],
    // §MERGED 2026-07-11 — file read/write/delete against a repo's
    // content, resolved through spec-engine chunks (v2 has no content
    // store of its own — see repo/index.js's file CRUD methods).
    ['GET',    ['api','repos',    ':uuid','file'],         'repo.file.read'],
    ['POST',   ['api','repos',    ':uuid','file'],         'repo.file.write'],
    ['DELETE', ['api','repos',    ':uuid','file'],         'repo.file.delete'],
    ['GET',    ['api','repos',    ':uuid','export'],       'repo.export'],
  ];

  for (const [m, pattern, action] of dynRoutes) {
    if (m !== method) continue;
    if (pattern.length !== segs.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i].startsWith(':')) params[pattern[i].slice(1)] = segs[i];
      else if (pattern[i] !== segs[i]) { match = false; break; }
    }
    if (match) return { action, params };
  }

  return null;
}

function parseQuery(url) {
  const qs = url.split('?')[1] || '';
  const out = {};
  for (const p of qs.split('&')) { const [k,v] = p.split('='); if(k) out[decodeURIComponent(k)] = decodeURIComponent(v||''); }
  return out;
}

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handle(req, res, route, query, body) {
  const os = getIdeaOS();
  const { action, params } = route;

  // ── Auth gate — disabled ──────────────────────────────────────────────────
  // Idearium has no remote/direct access path. The orchestrator (:9000) is the
  // sole entry point to NEXUS; all subsystem traffic is proxied through it.
  // Key-based auth was for a per-system access model that no longer applies here.

  switch (action) {

    case 'health':
      return ok(res, { version: VERSION, snr: os.snr, uptime: process.uptime() });

    case 'contract.get':
      try { return ok(res, { contract: os.contract() }); }
      catch (e) { return err(res, 500, e.message); }

    // §PHASE 3 2026-07-10 — the interaction contract, projected from the REAL
    // route table instead of a static file. The hand-maintained
    // schemas/interaction-contract.json declared 30 endpoints while the router
    // had 55, and named none of the new actions (speceng.templates,
    // spec.promote, ...). A UI reading the static file is blind to half the API
    // and to everything built this session. This reads the route tuples out of
    // this module's own source — the same discipline the hook generator uses:
    // the contract is a projection of the code, so it cannot drift from it.
    case 'contract.live': {
      try {
        const src = _require('fs').readFileSync(_require('url').fileURLToPath(import.meta.url), 'utf8');
        const routes = [];
        // Match: ['GET', ['api','spec-engine','specs',':uuid','promote'], 'spec.promote'],
        const re = /\[\s*'(GET|POST|PUT|DELETE|PATCH)'\s*,\s*\[([^\]]*)\]\s*,\s*'([a-z][a-z0-9.]*)'\s*\]/gi;
        let m;
        while ((m = re.exec(src)) !== null) {
          const method = m[1];
          const segs = m[2].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
          const path = '/' + segs.join('/');
          const action = m[3];
          // dedup: same method+path can appear as an alias
          if (!routes.some(r => r.method === method && r.path === path)) {
            routes.push({ method, path, action });
          }
        }
        return ok(res, {
          system: 'idearium',
          version: VERSION,
          generatedFrom: 'idearium/api/index.js route table (projection, not a static file)',
          endpointCount: routes.length,
          endpoints: routes.sort((a, b) => a.path.localeCompare(b.path)),
        });
      } catch (e) { return err(res, 500, `contract projection failed: ${e.message}`); }
    }

    case 'stats.get':
      return ok(res, { stats: os.stats() });

    case 'snr.current':
      return ok(res, { snr: os.snr });

    case 'snr.history':
      return ok(res, { samples: os.snrHistory(parseInt(query.n)||50) });

    case 'events.log':
      return ok(res, { events: os.eventLog(parseInt(query.n)||100) });

    // ── Ideas ──────────────────────────────────────────────────────────────

    case 'idea.list':
      return ok(res, { ideas: os.ideas(query) });

    case 'idea.create': {
      const { text, tags, compartment } = body;
      if (!text) return err(res, 400, 'text required');
      const ev = os.emit('idearium.idea.create', { text, tags: tags||[], compartment: compartment||null, source: 'api' });
      const idea = os.db.ideas[os.db.ideas.length - 1];
      // Mirror to orchestrator ledger (fire-and-forget)
      import('http').then(({ default: http }) => {
        const body2 = JSON.stringify({ system:'idearium', type:'idearium.idea.created', payload:{ uuid:idea?.uuid, text:(text||'').slice(0,80), tags } });
        const _o = _orchestrator();
        const r = http.request({ hostname:_o.host, port:_o.port, path:'/api/ledger', method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body2)} }, ()=>{});
        r.on('error',()=>{}); r.write(body2); r.end();
      }).catch(()=>{});
      return ok(res, { idea, eventId: ev.uuid });
    }

    // ── Brainstorms (real, data/-backed — see route comment above) ──────────

    case 'brainstorm.list':
      return ok(res, { brainstorms: loadTable('idearium_brainstorms').sort((a, b) => b.ts - a.ts) });

    case 'brainstorm.create': {
      const { text, tags } = body;
      if (!text || !text.trim()) return err(res, 400, 'text required');
      const row = { uuid: `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`, text: text.trim(), tags: tags || [], ts: Date.now(), promoted: false };
      appendRow('idearium_brainstorms', row);
      return ok(res, { brainstorm: row });
    }

    case 'brainstorm.delete': {
      deleteRow('idearium_brainstorms', params.uuid);
      return ok(res, { deleted: true, uuid: params.uuid });
    }

    case 'brainstorm.promote': {
      // §CONVENTION — syncTable, not delete+reinsert, matching how every
      // other real update in this codebase touches a JAA table (repo/
      // index.js's _save, spec-engine's saveSpec) — one row mutated
      // in-memory, whole table synced back, not a delete/insert pair.
      const rows = loadTable('idearium_brainstorms');
      const b = rows.find(r => r.uuid === params.uuid);
      if (!b) return err(res, 404, `brainstorm not found: ${params.uuid}`);
      const ev = os.emit('idearium.idea.create', { text: b.text, tags: b.tags || [], compartment: null, source: 'brainstorm' });
      b.promoted = true;
      syncTable('idearium_brainstorms', rows, 'uuid');
      return ok(res, { promoted: true, idea: os.db.ideas[os.db.ideas.length - 1], eventId: ev.uuid });
    }

    case 'idea.show': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      const links = os.db.links.filter(l=>l.fromUuid===idea.uuid||l.toUuid===idea.uuid);
      const gaps  = os.gaps({ status:'open' }).filter(g=>(g.between||[]).includes(idea.uuid)||g.ideaUuid===idea.uuid);
      return ok(res, { idea, links, openGaps: gaps });
    }

    case 'idea.update': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      os.emit('idearium.idea.update', { uuid: params.uuid, fields: body, source: 'api' });
      return ok(res, { idea: os.idea(params.uuid) });
    }

    case 'idea.phase': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      if (!body.phase) return err(res, 400, 'phase required');
      os.emit('idearium.idea.phase', { uuid: params.uuid, phase: body.phase, source: 'api' });

      // §FIX 2026-09-03 — James: "clicking on idearium phase to building
      // does nothing, needs to change for the compartment... we need a
      // compartment specifically made for idearium." Checked directly:
      // IdeaPhaseGate.transform() (idearium/index.js) really does flip
      // idea.phase and persist it — the UI's click was never a no-op at
      // the data layer. But nothing beyond that field flip ever happened:
      // no real compartment gets created, so "building" was cosmetic.
      // §WHY THIS LIVES HERE, NOT IN THE GATE — same real constraint this
      // file's own SnapshotGate removal already documented: siso's
      // Stream.emit() calls gate.transform() synchronously with no await,
      // so an async spawn() call inside IdeaPhaseGate would have its
      // promise silently dropped. This route handler is already async and
      // already awaited by its caller — the same precedent SnapshotGate's
      // removal established (commitSnapshot/restoreSnapshot as direct
      // async methods the API awaits, not async Gates).
      //
      // Real chain, nothing invented: lib/intent-classifier.js's real
      // classify()+freeze() turns the idea's own real text into a real,
      // frozen intent (the exact shape lib/compartment-engine.js's spawn()
      // requires — "a frozen intent with a uuid"); spawn() creates a real
      // compartment (real pre-forge snapshot, real constraint frame, real
      // JAA row); the idea's own real `compartment` field (already an
      // IdeaUpdateGate-allowed field — checked, was never populated by
      // anything) gets set to that real compartment id via the same
      // idea.update path the UI's other fields already use.
      let compartmentId = null;
      if (body.phase === 'building' && !idea.compartment) {
        try {
          // §FIX 2026-09-03 — real handoff-branch fix, reconciled in
          // during the merge revert-recovery: James's own real boot log
          // caught this — "compartment spawn failed... require is not
          // defined." idearium/package.json sets "type":"module", this
          // whole file is a real ES module, raw require() doesn't exist
          // in this scope. The correct pattern this exact file already
          // uses at its own top (`const _require = createRequire(...)`)
          // just wasn't used at this specific call site when it was
          // first written.
          const { classify, freeze } = _require('../../lib/intent-classifier.js');
          const { spawn } = _require('../../lib/compartment-engine.js');
          const { intent } = classify({ text: idea.text, source: 'idearium-idea-phase' });
          const compartment = await spawn({ intent: freeze(intent) });
          compartmentId = compartment.id;
          os.emit('idearium.idea.update', { uuid: params.uuid, fields: { compartment: compartmentId }, source: 'idea.phase' });
        } catch (e) {
          console.warn(`[idearium/api] idea.phase → building: compartment spawn failed for ${params.uuid}: ${e.message}`);
        }
      }

      return ok(res, { idea: os.idea(params.uuid), compartmentId });
    }

    case 'idea.tension': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      os.emit('idearium.idea.tension', { uuid: params.uuid });
      return ok(res, { idea: os.idea(params.uuid), tension: { score: os.idea(params.uuid).tension } });
    }

    case 'idea.link': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      if (!body.toUuid) return err(res, 400, 'toUuid required');
      os.emit('idearium.idea.link', { fromUuid: params.uuid, toUuid: body.toUuid, linkType: body.linkType||'resonance', source:'api' });
      return ok(res, { linked: true });
    }

    case 'idea.spec': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      os.emit('idearium.spec.create', { name: body.name || `Spec: ${idea.text.slice(0,40)}`, ideaUuid: params.uuid, source:'api' });
      const spec = os.db.specs[os.db.specs.length - 1];
      // §MERGED 2026-07-11 — SpecCreateGate links idea.linkedSpec but never
      // advances idea.phase; only advances forward, never regresses an
      // idea already further along.
      if (['seed','expanding','tensioned'].includes(idea.phase)) {
        os.emit('idearium.idea.phase', { uuid: params.uuid, phase: 'specced', source: 'api' });
      }
      return ok(res, { spec });
    }

    case 'idea.archive': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      if (!body.reason) return err(res, 400, 'reason required (§M1 — nothing deleted)');
      os.emit('idearium.idea.archive', { uuid: params.uuid, reason: body.reason, source:'api' });
      return ok(res, { archived: true });
    }

    case 'spec.archive': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      if (!body.reason) return err(res, 400, 'reason required (§M1 — nothing deleted)');
      os.emit('idearium.spec.archive', { uuid: params.uuid, reason: body.reason, source:'api' });
      return ok(res, { archived: true });
    }

    // ── Specs ──────────────────────────────────────────────────────────────

    // §BUG FIXED 2026-07-10 — "the idearium ui has no specs." The Spec Library
    // panel calls /api/specs (spec.list), which returned ONLY os.specs() — the
    // legacy OS db.specs, which is empty. Meanwhile 16 real specs live in the
    // spec-engine (/api/spec-engine/specs). Two spec stores, and the UI read the
    // empty one. Merge both here so /api/specs shows every spec regardless of
    // which subsystem created it. Legacy first (unchanged for existing readers),
    // then spec-engine manifests, deduped by uuid. A spec-engine failure must
    // not blank the legacy list (§1.2).
    case 'spec.list': {
      // §NEW 2026-07-16 — same reasoning as spec-engine's `deleted` filter
      // in listSpecs(): os.specs(query) never excluded phase:'archived' on
      // its own (specs() only filters by phase when explicitly asked), so
      // archiving a legacy spec via the new SpecArchiveGate did nothing to
      // this list without this. query.includeArchived=1 opts back in.
      let legacy = os.specs(query) || [];
      if (!query.includeArchived) legacy = legacy.filter(s => s.phase !== 'archived');
      let engine = [];
      try {
        const se = getSpecEngine();
        if (se) {
          // Normalize spec-engine manifests to the shape the UI's renderSpecList
          // expects: it reads .sections (chunks), .phase (status), .version. The
          // engine names them chunks/status/version, so without this map specs
          // render with blank section chips and no status. One shape for every
          // consumer; the UI needs no change.
          engine = (se.listSpecs() || []).map(s => ({
            ...s,
            phase: s.status,
            sections: (s.chunks || []).map(c => ({
              id: c.sectionId || c.chunkIdx, title: c.sectionTitle || c.sectionId,
              // The UI marks a chip 'done' when .content is truthy. The list is
              // deliberately content-free (loaded on demand in the detail view),
              // so a complete section gets a non-empty marker keyed on STATUS —
              // the chip lights without shipping the section body into the list.
              content: c.status === 'complete' ? '\u2713' : '', required: true,
            })),
          }));
        }
      } catch (e) { console.warn('[idearium/api] spec-engine list failed, legacy only:', e.message); }
      const seen = new Set(legacy.map(s => s.uuid));
      const merged = [...legacy, ...engine.filter(s => !seen.has(s.uuid))];
      return ok(res, { specs: merged, sources: { legacy: legacy.length, engine: engine.length } });
    }

    case 'spec.create': {
      if (!body.name) return err(res, 400, 'name required');
      os.emit('idearium.spec.create', { name: body.name, ideaUuid: body.ideaUuid || null, source: 'api' });
      const spec = os.db.specs[os.db.specs.length - 1];
      return ok(res, { spec });
    }

    case 'spec.show': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      return ok(res, { spec });
    }

    case 'spec.update': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      os.emit('idearium.spec.update', { uuid: params.uuid, fields: body });
      return ok(res, { spec: os.spec(params.uuid) });
    }

    case 'spec.check': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      os.emit('idearium.spec.check', { uuid: params.uuid });
      return ok(res, { spec: os.spec(params.uuid) });
    }

    case 'spec.build': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);

      // Run spec check first
      os.emit('idearium.spec.check', { uuid: params.uuid });
      const checked = os.spec(params.uuid);

      // Collect all sections with content
      const built = [], missing = [];
      for (const s of checked.sections) {
        if (s.required && !s.complete && !s.content) missing.push(s.id);
        else if (s.content) built.push(s.id);
      }

      if (missing.length > 0 && checked.phase !== 'specced') {
        return ok(res, {
          status: 'incomplete', spec: checked,
          missing, built,
          message: `${missing.length} required sections missing content before build`,
        });
      }

      // Advance phase to building
      os.emit('idearium.spec.update', { uuid: params.uuid, fields: { phase: 'building' } });

      // Fire build event to bus — orchestrator + bridge pick this up
      os.emit('idearium.spec.built', {
        specUuid: params.uuid, name: spec.name,
        sections: built.length, ts: Date.now(),
      });

      // §MCO8 2026-09-13 — track_d (axiom §5.2 compliance, docs/2026-09-13-
      // axiom-5-2-raid-routing-phasemap.spec). This is the LEGACY
      // spec.build route — real, heavy write work (drives
      // compileIdeariumSpec() below) that had zero RAID observability,
      // unlike the newer spec-engine chunk path a few hundred lines
      // above in this same file, which already submits+reports via RAID
      // (§RAID-SOURCE 2026-08-29). Reusing that exact proven, additive
      // pattern and the already-registered 'idearium:build' boundary
      // (cortex/core/raid/contract-boundary.js) rather than inventing a
      // second one for the same real system doing the same kind of
      // work. Never blocks: a submission failure here must not stop a
      // real spec build (§HONEST LIMIT, same as the chunk path's own).
      let _raidQueueId = null;
      try {
        _raidQueueId = _require('../../cortex/core/raid/contract-intake.js').submitContract(
          { content: `spec.build:${params.uuid}`, file: null, title: spec.name || params.uuid },
          { source: 'idearium', intention: 'build' }
        ).queueId;
      } catch (e) {
        console.warn('[idearium/api] could not submit real RAID observability contract for spec.build (build proceeds regardless):', e.message);
      }

      // ── Actually compile — this used to be the gap: spec.build only
      // flipped a phase field and never touched emerge/compiler, which is
      // a real, separate, working Tier 0/1 compiler. compileIdeariumSpec()
      // converts the section-shaped spec into what that compiler expects,
      // runs it (Cortex preflight → T0 structure → T1 scaffold → writeback),
      // and also drops a ui-map.json stub for Architect (Phase 43 isn't
      // built yet — the stub is labeled as such, not presented as real).
      const outputDir = path.join(os.dataDir || path.join(process.cwd(), 'data'), 'compiled', params.uuid);
      let compileResult;
      try {
        compileResult = await compileIdeariumSpec(checked, outputDir, { tier: 1 });
      } catch (e) {
        compileResult = { ok: false, error: e.message, step: 'bridge-call' };
      }

      if (compileResult.ok) {
        // §RENAMED 2026-07-15 — was 'idearium.spec.compiled' (named after the
        // implementation call, compileIdeariumSpec). Renamed to the domain
        // event so this legacy route and the newer guardian-promote path
        // (api/index.js's _promoteSpecToRepo) feed the same cortex listener
        // (lib/cortex-listeners.js) instead of two differently-named events.
        os.emit('idearium.spec.build.completed', {
          specUuid: params.uuid, outputDir,
          t0: compileResult.t0?.emitted?.length ?? 0,
          t1: compileResult.t1?.emitted?.length ?? 0,
          topology: compileResult.topology || null,
          extraction: 'legacy-sections', // honest provenance — this route parses os.spec()'s section shape, not a chunk-manifest
          ok: true,
        });
        // Compile actually finished — phase was parked at 'building' above
        // and nothing ever moved it forward. Advance it now so the UI
        // stops showing "building" for a build that's already done.
        os.emit('idearium.spec.update', { uuid: params.uuid, fields: { phase: 'complete' } });
        // §MCO8 2026-09-13 — report the already-known, real outcome back
        // to RAID (see submission above), same best-effort pattern as
        // the chunk-dispatch path's own reportExternalOutcome call.
        if (_raidQueueId) {
          try {
            const _intake = _require('../../cortex/core/raid/contract-intake.js');
            _intake.reportExternalOutcome(_raidQueueId, { status: _intake.STATUS.PASS });
          } catch (_) { /* best-effort, see above */ }
        }
      } else {
        os.emit('idearium.error', { op: 'spec.build.compile', reason: compileResult.error });
        // Compile failed — don't leave the spec parked on 'building' forever
        // (that reads as "actively building" when it's actually dead).
        // Fall back to 'specced' so the UI reflects reality and a rebuild
        // can be re-attempted.
        os.emit('idearium.spec.update', { uuid: params.uuid, fields: { phase: 'specced' } });
        if (_raidQueueId) {
          try {
            const _intake = _require('../../cortex/core/raid/contract-intake.js');
            _intake.reportExternalOutcome(_raidQueueId, { status: _intake.STATUS.FAIL, verdict: compileResult.error || null });
          } catch (_) { /* best-effort, see above */ }
        }
      }

      // Notify orchestrator
      import('http').then(({ default: http }) => {
        const payload = JSON.stringify({
          system: 'idearium', type: 'idearium.spec.built',
          payload: { specUuid: params.uuid, name: spec.name, sections: built.length, compiled: !!compileResult.ok },
        });
        const _o = _orchestrator();
        const r = http.request({ hostname:_o.host, port:_o.port, path:'/api/ledger',
          method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)} }, ()=>{});
        r.on('error',()=>{}); r.write(payload); r.end();
      }).catch(()=>{});

      return ok(res, {
        status: compileResult.ok ? 'built' : 'build_failed', spec: os.spec(params.uuid),
        built, missing,
        message: compileResult.ok
          ? `spec ${params.uuid.slice(0,8)} → complete`
          : `spec ${params.uuid.slice(0,8)} → build failed: ${compileResult.error || 'unknown error'}`,
        compiler: compileResult,
      });
    }

    case 'spec.export': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      const md = specToMarkdown(spec);
      res.writeHead(200, { 'Content-Type': 'text/markdown', ...CORS });
      return res.end(md);
    }

    // ── Gaps ───────────────────────────────────────────────────────────────

    case 'gap.list':
      return ok(res, { gaps: os.gaps(query) });

    case 'gap.open': {
      if (!body.description) return err(res, 400, 'description required');
      const ev = os.emit('idearium.gap.open', { ...body, source:'api' });
      const gap = os.db.gaps[os.db.gaps.length - 1];
      return ok(res, { gap, eventId: ev.uuid });
    }

    case 'gap.show': {
      const gap = os.gap(params.uuid);
      if (!gap) return err(res, 404, `gap not found: ${params.uuid}`);
      return ok(res, { gap });
    }

    case 'gap.resolve': {
      const gap = os.gap(params.uuid);
      if (!gap) return err(res, 404, `gap not found: ${params.uuid}`);
      os.emit('idearium.gap.resolve', { uuid: params.uuid, resolution: body.resolution||'' });
      return ok(res, { gap: os.gap(params.uuid) });
    }

    case 'gap.ignore': {
      const gap = os.gap(params.uuid);
      if (!gap) return err(res, 404, `gap not found: ${params.uuid}`);
      os.emit('idearium.gap.ignore', { uuid: params.uuid, reason: body.reason||'' });
      return ok(res, { gap: os.gap(params.uuid) });
    }

    // ── Snapshots ──────────────────────────────────────────────────────────

    // §SNAPSHOTGATE MERGE 2026-09-01 — all four now real network calls to
    // cortex/versionium via idearium's commitSnapshot()/snapshots()/
    // snapshot()/diffSnapshots()/restoreSnapshot() (see idearium/index.js).
    // Errors are real now (cortex unreachable, etc.) — reported as 502, not
    // swallowed into an empty result.
    case 'snapshot.list': {
      const snaps = await os.snapshots(50);
      if (snaps?.error) return err(res, 502, snaps.error);
      return ok(res, { snapshots: snaps });
    }

    case 'snapshot.push': {
      const snap = await os.commitSnapshot({ message: body.message||'snapshot', branch: body.branch||'main', author: body.author||'api', causedBy: body.causedBy || null });
      if (snap?.error) return err(res, 502, snap.error);
      return ok(res, { snapshot: snap });
    }

    case 'snapshot.show': {
      const snap = await os.snapshot(params.uuid);
      if (!snap) return err(res, 404, `snapshot not found: ${params.uuid}`);
      return ok(res, { snapshot: snap });
    }

    case 'snapshot.diff': {
      const diff = await os.diffSnapshots(params.a, params.b);
      if (diff?.error) return err(res, 404, diff.error);
      return ok(res, { diff });
    }

    case 'snapshot.restore': {
      const result = await os.restoreSnapshot(params.uuid, { author: 'api' });
      if (result?.error) return err(res, 400, result.error);
      return ok(res, { restored: result.commitId, stashCommitId: result.stashCommitId, ideas: result.ideas, specs: result.specs, gaps: result.gaps });
    }

    // ── Repos ──────────────────────────────────────────────────────────────
    // Each idea is a repo, not a single hardcoded "Nexus folder". Nexus
    // itself is just the first ingested repo, not a special case.

    case 'repo.list':
      return ok(res, { repos: getRepoLayer().list(query) });

    case 'repo.show': {
      const repo = getRepoLayer().get(params.uuid);
      if (!repo) return err(res, 404, `repo not found: ${params.uuid}`);
      return ok(res, { repo });
    }

    // §GAP CLOSED 2026-07-10 — "Idearium isn't importing ideas into the
    // repository library. When you click promote idea to a repository, it needs
    // two options, automatic using emerge or manual using the spec builder."
    //
    // Root cause: repo.ingest requires files[] (a drag-and-drop payload). There
    // was NO path from a built SPEC to a repo — promoting an idea produced a
    // spec, and nothing turned that spec into a repo artifact. This is the last
    // link before the loop turns: idea → spec → chunk → dispatch → ARTIFACT → repo.
    //
    // mode:
    //   'emerge' (automatic) — deterministic assembly of the spec's completed
    //       chunks into a single .spec artifact. No agent. Zero tokens. Fails
    //       loudly if chunks are still pending rather than shipping a partial
    //       repo that looks complete.
    //   'manual' (spec builder) — same assembly, but pending chunks are allowed
    //       and marked as TODO sections, so a human finishes them in the builder.
    // §IMPORT 2026-07-10 — "import zip or .spec to build a repo." Accepts raw
    // .spec text, parses its blocks into a manifest with authored sections
    // pre-filled (zero tokens), and returns a spec that is immediately
    // promotable to a repo via spec.promote. The zip path lands the same way:
    // extract, feed each .spec here.
    case 'spec.import': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      const { specText, name } = body;
      if (!specText) return err(res, 400, 'specText required (raw .spec file contents)');
      try {
        const result = se.importSpec({ name, specText });
        os.emit('idearium.spec.imported', {
          specUuid: result.manifest.uuid, name: result.manifest.name,
          blocksFound: result.blocksFound, sectionsFilled: result.sectionsFilled.length,
        });

        // §AUTO-REPO 2026-07-10 — "repository created automatically." Every
        // block the boundary engine found now has a completed chunk (import
        // no longer leaves anything pending — see spec-engine's importSpec),
        // so the spec is promotable the instant it lands. Do it here instead
        // of waiting for a second manual call. Still non-fatal if it fails —
        // the import itself already succeeded and is on disk either way —
        // but the failure is reported, not swallowed.
        let promote = null;
        if (result.manifest.status === 'complete') {
          promote = await _promoteSpecToRepo(os, se, result.manifest.uuid, 'emerge');
          if (promote.error) {
            console.warn(`[idearium/api] auto-promote after import failed: ${promote.error}`);
          } else {
            os.emit('idearium.spec.promoted', {
              specUuid: result.manifest.uuid, repoUuid: promote.repoUuid,
              mode: 'emerge', chunksBuilt: promote.chunksBuilt, chunksTotal: promote.chunksTotal,
              source: 'auto-import',
            });
          }
        }

        return ok(res, {
          manifest: result.manifest,
          blocksFound: result.blocksFound,
          sectionsFilled: result.sectionsFilled,
          unmatched: result.unmatched,
          byteFidelity: result.byteFidelity,
          repoUuid: promote && !promote.error ? promote.repoUuid : null,
          repoError: promote && promote.error ? promote.error : null,
          compiled: promote && !promote.error ? (promote.compiled || { ok: false, attempted: false }) : null,
          promoteUrl: `/api/spec-engine/specs/${result.manifest.uuid}/promote`,
        });
      } catch (e) { return err(res, 400, `import failed: ${e.message}`); }
    }

    case 'spec.promote': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      const specUuid = params.uuid || body.specUuid;
      const mode = body.mode || 'emerge';
      if (!specUuid) return err(res, 400, 'specUuid required');
      if (mode !== 'emerge' && mode !== 'manual') {
        return err(res, 400, `unknown promote mode '${mode}' — use 'emerge' (automatic) or 'manual' (spec builder)`);
      }
      const result = await _promoteSpecToRepo(os, se, specUuid, mode);
      if (result.error) {
        const status = /not found/.test(result.error) ? 404 : /cannot auto-promote/.test(result.error) ? 409 : 400;
        return err(res, status, result.error);
      }

      os.emit('idearium.spec.promoted', {
        specUuid, repoUuid: result.repoUuid,
        mode, chunksBuilt: result.chunksBuilt, chunksTotal: result.chunksTotal,
      });

      // §MERGED 2026-07-11 — advance the ORIGINATING idea's phase (not
      // RepoLayer's synthetic tracking idea) to reflect real end-state:
      // 'complete' for a fully-built promotion, 'building' for a partial
      // one. Never regresses 'archived'.
      if (result.originIdeaUuid) {
        const idea = os.idea(result.originIdeaUuid);
        if (idea && idea.phase !== 'archived') {
          const donePhase = result.chunksBuilt === result.chunksTotal ? 'complete' : 'building';
          os.emit('idearium.idea.phase', { uuid: result.originIdeaUuid, phase: donePhase, source: 'api' });
        }
      }

      return ok(res, {
        repoUuid: result.repoUuid, ideaUuid: result.ideaUuid, specUuid: result.specUuid,
        mode, promotedFrom: specUuid,
        chunksBuilt: result.chunksBuilt, chunksTotal: result.chunksTotal,
        compiled: result.compiled || { ok: false, attempted: false },
      });
    }

    // §GATE 2026-07-11 — the adapter boundary itself. No intelligence lives
    // here — see copilot-adapter/index.js's header for why that's deliberate.
    // Callable today (the wizard's "ask copilot" button hits this), honestly
    // reports connected:false until a real backend is registered.
    case 'copilot.suggest': {
      const ca = getCopilotAdapter();
      if (!ca) return err(res, 503, 'copilot-adapter not ready');
      const { context, goal, current_gate } = body;
      const result = await ca.suggest({ context: context || {}, goal: goal || '', current_gate: current_gate || '' });
      return ok(res, result);
    }

    case 'repo.ingest': {
      // §EXTENDED 2026-09-03 — James: "create a repository, then send each
      // chunk to the respective agent." Was drag-and-drop files[] only.
      // RepoLayer.ingest() itself already had a specUuid path (an existing
      // spec-engine manifest, no new content created) — this endpoint just
      // never exposed it. Now a caller can create the repo the moment a
      // spec exists, before any chunk is built, and the same repo record
      // (resolved live off specUuid every read — RepoLayer._enrich) shows
      // chunks landing as each one completes. files[] path unchanged for
      // every existing drag-and-drop caller.
      // §MCO11 2026-09-13 — James: "raid creates a compartment for the
      // contract to use as a repo." Traced first: RepoLayer.ingest()
      // (idearium/repo/index.js) already accepts and stores compartmentId
      // — SBP1's own real, designed link between a repo and a real COS
      // compartment — but this HTTP layer never forwarded it. Not a naming
      // collision after all; a real, designed connection that was one
      // destructured field short of working end to end.
      const { name, files, source, ideaUuid, specUuid, compartmentId } = body;
      if (!name) return err(res, 400, 'name required');
      if (!specUuid && (!Array.isArray(files) || files.length === 0)) {
        return err(res, 400, 'specUuid or files[] required');
      }
      const result = getRepoLayer().ingest({
        name, specUuid: specUuid || undefined, files: files || [],
        source: source || (specUuid ? 'repo-first' : 'drop'),
        ideaUuid: ideaUuid || null,
        compartmentId: compartmentId || null,
      });
      if (result.error) return err(res, 400, result.error);
      return ok(res, result);
    }

    // §IMPORT-PROJECT 2026-09-03 — zip -> real repo compartment, synchronous.
    //
    // Why not just call idearium/repo/watcher.js's RepoWatcher:
    //   1. It's never instantiated anywhere in this codebase — no live
    //      caller, confirmed by grep before writing this (only referenced
    //      in a test-name string and a comment). Its dropDir
    //      (idearium/data/drop/) doesn't exist on disk either.
    //   2. Its _extractFileList() only reads file CONTENT for .spec files
    //      — every other file gets {path, bytes} with content:undefined.
    //      Calling it as-is would create a repo with a correct file
    //      LISTING and empty files, which defeats the point of importing
    //      a project to build/edit/debug against.
    //   3. Even fixed, fs.watch's queue model (drop a file, wait, hope it
    //      got picked up) is the wrong UX for a screen that should return
    //      the created repo in the same request.
    // So: reuse adm-zip the same way watcher.js does (same library, same
    // fallback-to-system-unzip, same last-resort-opaque-entry safety net —
    // not a second unzip strategy), but read bounded content for every
    // real text file, matching lib/project-compartment.js's already-
    // established, already-reasoned bounds (MAX_FILES/MAX_BYTES_PER_FILE/
    // MAX_TOTAL_BYTES — imported directly, not re-derived; SKIP_DIRS/
    // TEXT_EXT aren't exported by that module, so matched here by value,
    // called out explicitly rather than silently duplicated).
    case 'repo.import-archive': {
      const { name, filename, contentBase64, ideaUuid } = body;
      if (!filename)       return err(res, 400, 'filename required');
      if (!contentBase64)  return err(res, 400, 'contentBase64 required (base64-encoded zip contents)');
      let buf;
      try { buf = Buffer.from(contentBase64, 'base64'); }
      catch (e) { return err(res, 400, 'invalid base64 content'); }
      if (!buf.length) return err(res, 400, 'empty file');
      if (!/\.zip$/i.test(filename)) return err(res, 400, 'only .zip archives are handled by this endpoint — use POST /api/repos for flat file drops');

      const pc = _require('../../lib/project-compartment.js'); // MAX_FILES etc. — real, shared bounds
      const MAX_FILES          = pc.MAX_FILES;
      const MAX_BYTES_PER_FILE = pc.MAX_BYTES_PER_FILE;
      const MAX_TOTAL_BYTES    = pc.MAX_TOTAL_BYTES;
      // §MATCHED, NOT IMPORTED — project-compartment.js keeps these two
      // private (not in its module.exports); values copied here on purpose
      // so both places stay in sync by inspection, not coupled by a
      // private-member import.
      const SKIP_DIRS = new Set(['node_modules', '.git', '.svn', 'dist', 'build', '__pycache__', '.next']);
      const TEXT_EXT  = new Set(['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.html', '.css', '.yml', '.yaml', '.spec', '.sh']);

      // §FIX 2026-09-03 — found by actually running this against a live
      // server, not by review: `os` here is the local IdeaOS instance
      // (`const os = getIdeaOS();` at the top of handle()), shadowing the
      // module-level `import os from 'os'` for this entire function. Every
      // other Node builtin this file needs mid-function goes through
      // _require() for exactly this reason (see contract.live's own
      // _require('fs')/_require('url')) — matched here, not a new pattern.
      const tmpZip = path.join(_require('os').tmpdir(), `idearium-import-${crypto.randomUUID()}.zip`);
      try { fs.writeFileSync(tmpZip, buf); }
      catch (e) { return err(res, 500, `write temp zip failed: ${e.message}`); }

      let entries;
      try {
        const AdmZip = _require('adm-zip');
        const zip = new AdmZip(tmpZip);
        entries = zip.getEntries().filter(e => !e.isDirectory).map(e => ({ entry: e, zip }));
      } catch (e) {
        try { fs.unlinkSync(tmpZip); } catch (_) {}
        return err(res, 400, `could not read zip (adm-zip): ${e.message}`);
      }

      const included = [];
      const omitted  = [];
      let totalBytes = 0;
      for (const { entry, zip } of entries) {
        const rel = entry.entryName;
        if (SKIP_DIRS.has(rel.split('/')[0]) || rel.split('/').some(seg => SKIP_DIRS.has(seg))) {
          omitted.push({ path: rel, why: 'skipped dir (node_modules/.git/etc.)' }); continue;
        }
        if (included.length >= MAX_FILES) { omitted.push({ path: rel, why: 'maxFiles reached' }); continue; }
        const ext = path.extname(rel).toLowerCase();
        if (!TEXT_EXT.has(ext)) { omitted.push({ path: rel, why: `binary/unlisted extension (${ext || 'none'})` }); continue; }
        if (totalBytes >= MAX_TOTAL_BYTES) { omitted.push({ path: rel, why: 'maxTotalBytes reached' }); continue; }
        let text;
        try { text = zip.readAsText(entry); }
        catch (e) { omitted.push({ path: rel, why: `read failed: ${e.message}` }); continue; }
        const truncated = text.length > MAX_BYTES_PER_FILE;
        const slice = truncated ? text.slice(0, MAX_BYTES_PER_FILE) : text;
        totalBytes += slice.length;
        included.push({ path: rel, bytes: entry.header.size, content: slice, truncated });
      }
      try { fs.unlinkSync(tmpZip); } catch (_) {}

      if (!included.length) return err(res, 400, 'no text files matched the bounds — nothing to import (see omitted reasons for what was skipped)');

      const repoName = (name || filename.replace(/\.zip$/i, '')).slice(0, 200);
      const result = getRepoLayer().ingest({ name: repoName, files: included, source: 'import', ideaUuid: ideaUuid || null });
      if (result.error) return err(res, 400, result.error);
      return ok(res, { ...result, fileCount: included.length, omittedCount: omitted.length, omitted: omitted.slice(0, 50) });
    }

    case 'repo.fork': {
      const repo = getRepoLayer().get(params.uuid);
      if (!repo) return err(res, 404, `repo not found: ${params.uuid}`);
      const result = getRepoLayer().fork(params.uuid, body.name);
      if (result.error) return err(res, 400, result.error);
      return ok(res, result);
    }

    case 'repo.archive': {
      const result = getRepoLayer().archive(params.uuid);
      if (result.error) return err(res, 404, result.error);
      return ok(res, result);
    }

    case 'repo.lineage':
      return ok(res, { lineage: getRepoLayer().lineage(params.uuid) });

    // §MERGED 2026-07-11 — path travels as a query param (GET/DELETE) or
    // body field (POST), never a URL segment, so nested paths need no
    // wildcard routing.
    case 'repo.file.read': {
      const filePath = query.path;
      if (!filePath) return err(res, 400, 'path required (?path=...)');
      const result = getRepoLayer().readFile(params.uuid, filePath);
      if (result.error) {
        const status = /repo not found/.test(result.error) ? 404
                      : /not found in repo/.test(result.error) ? 404 : 400;
        return err(res, status, result.error);
      }
      return ok(res, result);
    }

    case 'repo.file.write': {
      const filePath = body.path;
      if (!filePath) return err(res, 400, 'path required');
      if (typeof body.content !== 'string') return err(res, 400, 'content (string) required');
      const result = getRepoLayer().writeFile(params.uuid, filePath, body.content);
      if (result.error) {
        const status = /repo not found/.test(result.error) ? 404 : 400;
        return err(res, status, result.error);
      }
      os.emit('idearium.repo.file.write', { repoUuid: params.uuid, path: result.path, created: result.created });
      return ok(res, result);
    }

    case 'repo.file.delete': {
      const filePath = query.path || body.path;
      if (!filePath) return err(res, 400, 'path required');
      const result = getRepoLayer().deleteFile(params.uuid, filePath);
      if (result.error) {
        const status = /repo not found/.test(result.error) ? 404 : /not found in repo/.test(result.error) ? 404 : 400;
        return err(res, status, result.error);
      }
      os.emit('idearium.repo.file.delete', { repoUuid: params.uuid, path: result.path });
      return ok(res, result);
    }

    // §EXPORT 2026-07-18 — "the export, needs to be the .spec file
    // compressed repo." Two things bundled into one real download: the
    // reconstructed .spec (byte-exact for imported specs — see
    // reconstructSpecText's own header for how) at the archive root, and
    // every real repo file underneath a folder named for the repo. One
    // zip, both formats, not a choice you have to make.
    case 'repo.export': {
      const repoLayer = getRepoLayer();
      const repo = repoLayer.get(params.uuid);
      if (!repo) return err(res, 404, `repo not found: ${params.uuid}`);
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');

      const safeName = (repo.name || 'repo').replace(/[^a-z0-9-_]+/gi, '_');
      const entries = [];

      try {
        const specText = se.reconstructSpecText(repo.specUuid);
        entries.push({ path: `${safeName}.spec`, content: specText });
      } catch (e) {
        console.error(`[API] repo.export: spec reconstruction failed for ${params.uuid}: ${e.message}`);
        // Non-fatal — still ship the repo files even if the .spec side failed.
      }

      let readErrors = 0;
      for (const f of repo.files) {
        const rf = repoLayer.readFile(params.uuid, f.path);
        if (rf.error) { readErrors++; continue; }
        entries.push({ path: `${safeName}/${f.path}`, content: rf.content });
      }
      if (!entries.length) return err(res, 500, 'export produced no files — repo may be empty or unreadable');

      const { createZip } = _require('../../lib/zip-writer.js');
      const zipBuf = createZip(entries);

      console.log(`[API] repo.export: ${params.uuid} -> ${entries.length} entries (${readErrors} read errors), ${zipBuf.length}b`);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeName}.zip"`,
        'Content-Length': zipBuf.length,
        ...CORS,
      });
      return res.end(zipBuf);
    }

    // ── Projects: flat zip shelf (§PROJECTS 2026-07-19) ────────────────────────
    // No RepoLayer, no spec-engine, no idea/lineage tracking — just "store this
    // zip, list it, get it back." One row in idearium_projects per file, raw
    // bytes on disk at data/projects/<uuid>-<safeName>. Content travels over
    // this JSON API as base64 (this router has no multipart parser); fine at
    // local, internal-only scale.
    case 'project.list': {
      const rows = loadTable('idearium_projects').slice().sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
      return ok(res, { projects: rows });
    }

    case 'project.upload': {
      const { name, filename, contentBase64 } = body;
      if (!filename) return err(res, 400, 'filename required');
      if (!contentBase64) return err(res, 400, 'contentBase64 required (base64-encoded file contents)');
      let buf;
      try { buf = Buffer.from(contentBase64, 'base64'); } catch (e) { return err(res, 400, 'invalid base64 content'); }
      if (!buf.length) return err(res, 400, 'empty file');
      const uuid = crypto.randomUUID();
      const safeName = filename.replace(/[^a-z0-9-_.]+/gi, '_');
      const diskName = `${uuid}-${safeName}`;
      try { fs.writeFileSync(path.join(PROJECTS_DIR, diskName), buf); }
      catch (e) { return err(res, 500, `write failed: ${e.message}`); }
      const row = {
        uuid, name: (name || filename.replace(/\.[^/.]+$/, '')).slice(0, 200),
        filename: safeName, diskName, size: buf.length, uploadedAt: Date.now(),
      };
      appendRow('idearium_projects', row);
      os.emit('idearium.project.uploaded', { uuid, name: row.name, size: row.size });
      return ok(res, { project: row });
    }

    case 'project.download': {
      const row = loadTable('idearium_projects').find(r => r.uuid === params.uuid);
      if (!row) return err(res, 404, `project not found: ${params.uuid}`);
      const filePath = path.join(PROJECTS_DIR, row.diskName);
      if (!fs.existsSync(filePath)) return err(res, 404, 'project file missing on disk');
      const buf = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${row.filename}"`,
        'Content-Length': buf.length,
        ...CORS,
      });
      return res.end(buf);
    }

    case 'project.delete': {
      const row = loadTable('idearium_projects').find(r => r.uuid === params.uuid);
      if (!row) return err(res, 404, `project not found: ${params.uuid}`);
      try { fs.unlinkSync(path.join(PROJECTS_DIR, row.diskName)); } catch (e) { /* non-fatal — row cleanup still proceeds */ }
      deleteRow('idearium_projects', params.uuid);
      os.emit('idearium.project.deleted', { uuid: params.uuid, name: row.name });
      return ok(res, { deleted: true, uuid: params.uuid });
    }

    // ── Spec Engine handlers (Phase 40) ────────────────────────────────────────

    case 'speceng.list': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      return ok(res, { specs: se.listSpecs() });
    }

    // §CONTRACT BEFORE UI 2026-07-09 — the first-page template picker needs a
    // real list to render from. Backend and contract first; the UI reads this,
    // never a hardcoded dropdown that drifts from the registry.
    // §OBSERVABLE 2026-07-09 — until now, "dispatch goes through WARP" was a
    // comment. It was false for months: the import always rejected and the
    // soft-fallback hid it. This makes the claim checkable from outside.
    case 'speceng.warp.status':
      return ok(res, warpStatus());

    case 'speceng.templates': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try { return ok(res, { templates: se.listTemplates() }); }
      catch (e) { return err(res, 500, e.message); }
    }

    case 'speceng.create': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      const { name, type, description, agent, sectionAgents, warpPrimitives, templateId, templateIds, buildEngine, ideaUuid, compartmentTemplateName } = body;
      if (!name) return err(res, 400, 'name required');
      if (ideaUuid && !os.idea(ideaUuid)) return err(res, 404, `idea not found: ${ideaUuid}`);
      try {
        // §BUILT 2026-08-17 — GA6. James: "architecture template with
        // maybe a compartment of the template files." Resolved HERE,
        // not inside _buildManifest — this route is already async, and
        // keeping _buildManifest itself synchronous avoids widening an
        // established code path with multiple real callers to async for
        // one new feature. Real compartment content merged additively
        // into the schema section below, not silently discarded if a
        // compartment name is given but not found (honest null, logged).
        let compartmentSeed = null;
        if (compartmentTemplateName) {
          const { readCompartmentTemplate } = await import('../spec-engine/templates.js');
          compartmentSeed = await readCompartmentTemplate(compartmentTemplateName);
        }
        // An unknown templateId/templateIds (or buildEngine) throws inside
        // createSpec (§1.2) and surfaces as a 400 here rather than silently
        // creating an unseeded / mis-configured spec.
        const manifest = se.createSpec({ name, type, description, agent, sectionAgents: sectionAgents || {}, warpPrimitives: warpPrimitives || [], templateId, templateIds, buildEngine: buildEngine || 'auto', ideaUuid: ideaUuid || null });
        if (compartmentSeed) {
          const schemaChunk = (manifest.chunks || []).find(c => c.sectionId === 'schema');
          if (schemaChunk && schemaChunk.status === 'pending') {
            schemaChunk.content = `## Real architecture template: ${compartmentSeed.compartmentName} (${compartmentSeed.fileCount} real files)\n\n${compartmentSeed.content}`;
            schemaChunk.status = 'complete';
            manifest.doneChunks = (manifest.doneChunks || 0) + 1;
            // §FIXED, found by testing before shipping: _buildManifest
            // already wrote manifest.json to disk before this mutation
            // ever runs (fs.writeFileSync happens inside it, confirmed by
            // reading the code directly) — without this real re-save, the
            // schema content only ever existed in the HTTP response, never
            // actually persisted. Same real path convention this whole
            // file already uses elsewhere.
            const { default: fsMod } = await import('fs');
            const { default: pathMod } = await import('path');
            const specDir = pathMod.join(IDEARIUM_DATA_DIR, 'specs', manifest.uuid);
            try { fsMod.writeFileSync(pathMod.join(specDir, 'manifest.json'), JSON.stringify(manifest, null, 2)); }
            catch (e) { console.warn(`[speceng.create] compartment-seed re-save failed: ${e.message}`); }
          }
        }
        os.emit('idearium.spec-engine.created', { specUuid: manifest.uuid, name, type, templateIds: manifest.templateIds, buildEngine: manifest.buildEngine, ideaUuid: manifest.ideaUuid });

        // §FOUND & FIXED 2026-09-06 — James, direct, repeated: "the
        // moment a spec is made the compartment and repo are made...
        // specs build compartments, which are repositories. it is not
        // creating repositories." Confirmed by reading createSpec()'s
        // full body first: it never touched RepoLayer at all — a repo
        // only ever got created later, through the separate, explicit
        // promote path (idearium.spec.promote), gated on chunks being
        // complete. That's backwards from what's wanted: a repo should
        // exist the moment the spec does, chunks pending or not, so
        // there's always a real, physical place for them to build into
        // as they complete — not a repo that only appears once
        // everything is already finished. Calling the same real
        // getRepoLayer().ingest() the explicit promote path already
        // uses, not a second mechanism — this repo starts as an empty
        // shell (0 chunks complete yet) and the same writeFile()/
        // completeChunk() path that already exists fills it in as
        // chunks build, exactly like a promoted repo would.
        let autoRepoUuid = null;
        try {
          const repoResult = getRepoLayer().ingest({
            name: manifest.name,
            specUuid: manifest.uuid,
            source: 'spec.create.auto',
            parent: manifest.ideaUuid || null,
            promotedFromSpec: null,
          });
          if (repoResult.error) {
            console.warn(`[speceng.create] auto-repo creation failed, spec still created: ${repoResult.error}`);
          } else {
            autoRepoUuid = repoResult.repo?.uuid || null;
          }
        } catch (e) {
          // §1.2 — a failed auto-repo creation must never block the
          // spec itself from being created; the spec is the real,
          // already-persisted thing here, the repo is additive.
          console.warn(`[speceng.create] auto-repo creation threw, spec still created: ${e.message}`);
        }

        // §MERGED 2026-07-11 — same phase-linkage fix as the legacy
        // idea.spec path above, for spec-engine specs.
        if (ideaUuid) {
          const idea = os.idea(ideaUuid);
          if (idea) {
            os.emit('idearium.idea.update', { uuid: ideaUuid, fields: { linkedSpec: manifest.uuid } });
            if (['seed','expanding','tensioned'].includes(idea.phase)) {
              os.emit('idearium.idea.phase', { uuid: ideaUuid, phase: 'specced', source: 'api' });
            }
          }
        }
        return ok(res, { manifest, repoUuid: autoRepoUuid });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.show': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const manifest = se.loadSpec(params.uuid);
        return ok(res, { manifest, history: _specHistory(params.uuid) });
      } catch(e) { return err(res, 404, e.message); }
    }

    case 'speceng.build': {
      // Trigger building the next pending chunk via agent suite
      const se = getSpecEngine();
      const as = getAgentSuite();
      if (!se) return err(res, 503, 'spec-engine not ready');
      if (!as) return err(res, 503, 'agent-suite not ready');
      try {
        const manifest = se.loadSpec(params.uuid);
        const chunk = se.nextPendingChunk(params.uuid);
        if (!chunk) return ok(res, { done: true, message: 'all chunks complete or building' });

        // §PHASE 6 2026-07-10 — cross-spec chunk reuse, before spending a token.
        // The WARP exact cache only hits when the whole PROMPT matches, and the
        // prompt embeds the spec name — so the identical "purpose" section in
        // two differently-named specs never reused. This asks the spec-engine
        // whether this exact section (sectionId + sectionDesc) was already built
        // in some other spec; if so, complete this chunk from that content and
        // never dispatch. Content-addressed on the section contract, not the
        // spec identity. Opt-out via body.noReuse for a deliberate fresh build.
        if (!body.noReuse) {
          try {
            const prior = se.findPriorSection(chunk.sectionId, chunk.sectionDesc, params.uuid);
            if (prior && prior.content) {
              se.completeChunk(params.uuid, chunk.uuid, prior.content);
              const um = se.loadSpec(params.uuid);
              _syncPhaseFromManifest(os, um);
              os.emit('idearium.spec-engine.chunk.complete', {
                specUuid: params.uuid, chunkUuid: chunk.uuid, sectionId: chunk.sectionId,
                progress: um.progress, source: 'reuse', reusedFrom: prior.specUuid, cost: 0, cacheHit: true,
              });
              return ok(res, { reused: true, from: prior.specUuid, sectionId: chunk.sectionId,
                progress: um.progress, message: `reused '${chunk.sectionId}' from prior spec — 0 tokens` });
            }
          } catch (e) { console.warn('[idearium/api] prior-section reuse check failed, dispatching:', e.message); }
        }

        // Get system context for the agent
        const systemContext = await as.getSystemContext().catch(() => '');
        const chunkPrompt   = se.buildChunkPrompt(manifest, chunk, systemContext);
        // §BUILT 2026-09-03 — James: "send each chunk to the respectable
        // agent." Was `body.agent || manifest.agent || 'ollama'` — one
        // agent for every chunk in the spec, `chunk.agent` never read here
        // at all despite being a real per-chunk field (spec-engine/index.js
        // sets it per block from blocks.yaml at creation, or per-chunk via
        // setChunkAgent()). body.agent stays the highest-priority override
        // for a genuine one-off manual dispatch; chunk.agent (this chunk's
        // real, assigned agent) now wins over the spec-wide manifest.agent
        // fallback, which only still matters for a pre-existing spec built
        // before this change (manifest.agent was a real per-spec value
        // then) or a spec built via importSpec/ingestFilesAsSpec (no
        // per-block agent to read — falls through the same as before).
        // §CHANGED 2026-09-03 — tail default 'ollama' → 'chatgpt' (James:
        // "set default to chatgpt"). Real fallback-on-failure to gemini
        // is wired via fallbackAgent below, not here.
        const preferAgent   = body.agent || chunk.agent || manifest.agent || 'chatgpt';
        const fallbackAgent = body.fallbackAgent || (preferAgent === 'chatgpt' ? 'gemini' : null);

        se.markChunkBuilding(params.uuid, chunk.uuid, { agent: preferAgent });

        // §RAID-SOURCE 2026-08-29 — James: "hook idearium... into raid."
        // Real, deliberately SAFE wire, matching self-heal's own pattern
        // (submitted for real observability, alongside the existing,
        // proven dispatch — not replacing it). idearium's own
        // dispatchChunkWithVerification below remains the REAL
        // dispatcher (cache reuse, WARP exact-cache, verification
        // retries — sophisticated, proven, not touched). This just gives
        // RAID's queue a real, visible record of the work, with the
        // real, already-known outcome reported back once idearium's own
        // verification decides it — not left permanently 'queued' with
        // nothing ever calling processNext() on it.
        //
        // §HONEST LIMIT — if this specific submitContract() call throws
        // (e.g., RAID's process isn't reachable), the whole build must
        // not be blocked over an observability call — caught, logged,
        // and raidQueueId stays null, which the completion callback
        // below checks before trying to report anything back.
        let raidQueueId = null;
        try {
          const submitted = _require('../../cortex/core/raid/contract-intake.js').submitContract(
            { content: chunkPrompt, file: null, title: chunk.title || chunk.sectionId, forAgent: preferAgent },
            { source: 'idearium', intention: 'build' }
          );
          raidQueueId = submitted.queueId;
        } catch (e) {
          console.warn('[idearium/api] could not submit real RAID observability contract (build proceeds regardless):', e.message);
        }

        // §GAP CLOSED 2026-07-06 — this used to be a single, unverified
        // call to as.buildChunkWithAgent(): one attempt, no retry, no
        // quality check. A truncated or off-topic response was
        // indistinguishable from a good one until a human noticed.
        // dispatchChunkWithVerification wraps the same dispatch function
        // in a real QueueCompartment (lib/seam/queue.js) — the identical
        // multi-strategy retry ladder and Detector-based verification
        // Guardian already uses for its own chunks. Same promise-based
        // contract as before; the .then/.catch below is unchanged.
        // §PHASE 2 2026-07-09 — dispatch through WARP when it is loaded, so the
        // exact cache sits in the real build path. Same shape, so
        // dispatchChunkWithVerification's retry ladder and Detector
        // verification are unchanged; WARP simply answers instantly when this
        // exact prompt has been built before. Falls back to the direct agent
        // path when WARP is not (yet) loaded — never a hard dependency.
        const warpFn = await getWarpChunkDispatch();   // §awaited: the FIRST build must also populate the cache
        const dispatchFn = warpFn
          ? (prompt, dispatchOpts) => warpFn(prompt, { ...dispatchOpts, chunkTitle: chunk.title || chunk.sectionId })
          : (prompt, dispatchOpts) => as.buildChunkWithAgent(prompt, dispatchOpts);

        dispatchChunkWithVerification(chunkPrompt, chunk, dispatchFn,
          {
            preferAgent,
            fallbackAgent,
            // §BUILT 2026-09-03 — fires the instant a queued job is
            // confirmed on guardian's side, before the (up to 5-minute)
            // poll for a browser-automated NCP provider — see
            // chunk-dispatch.js's own comment at this call site. Writes
            // the chunk's real return address (this spec's own
            // directory — "the start dir," no RAID compartment spawned)
            // to disk immediately, not after the fact.
            onQueued: (info) => {
              try { se.recordDispatchJob(params.uuid, chunk.uuid, info); }
              catch (e) { console.warn(`[idearium/api] recordDispatchJob failed (dispatch proceeds regardless): ${e.message}`); }
            },
          }
        ).then(async result => {
          // §RAID-SOURCE 2026-08-29 — report idearium's own real,
          // already-decided outcome back to RAID's queue, whichever
          // branch below actually runs. Best-effort — a failure here
          // never affects the real chunk-completion logic that follows.
          //
          // §HONEST LIMIT, found by this wiring's own test before
          // shipping it — result.queued===true means ChatGPT/Claude's
          // real completion arrives LATER via a genuinely separate
          // guardian-job-callback code path, not this .then(). Reporting
          // FAIL here would be a false negative on a contract that may
          // well PASS once that real callback fires — worse than simply
          // not reporting yet. Only PASS/FAIL are reported when this
          // callback actually knows the real, final outcome; the queued
          // case is left genuinely pending (still 'running' in RAID),
          // named honestly rather than silently guessed at.
          if (raidQueueId && !result.queued) {
            try {
              const intake = _require('../../cortex/core/raid/contract-intake.js');
              intake.reportExternalOutcome(raidQueueId, {
                status: result.ok ? intake.STATUS.PASS : intake.STATUS.FAIL,
              });
            } catch (_) { /* best-effort, see above */ }
          }
          if (result.ok && !result.queued && result.text) {
            se.completeChunk(params.uuid, chunk.uuid, result.text);
            const updatedManifest = se.loadSpec(params.uuid);
            _syncPhaseFromManifest(os, updatedManifest);
            os.emit('idearium.spec-engine.chunk.complete', {
              specUuid: params.uuid, chunkUuid: chunk.uuid,
              sectionId: chunk.sectionId, progress: updatedManifest.progress,
              // §MEASURABLE — a zero-token cache hit must be distinguishable
              // from a full generation in the ledger, or the saving is a claim.
              source: result.source || 'agent',
              cacheHit: result.cacheHit === true,
              cost: result.cost ?? null,
              verifiedAttempts: result.attempts, detectionComposite: result.detection?.composite,
            });
          } else if (result.queued) {
            // ChatGPT/Claude — chunk will complete via guardian job callback
            os.emit('idearium.spec-engine.chunk.queued', {
              specUuid: params.uuid, chunkUuid: chunk.uuid, jobId: result.jobId, agent: result.agent,
            });
          } else {
            se.failChunk(params.uuid, chunk.uuid, result.error || 'agent dispatch failed after verification retries');
          }
        }).catch(e => se.failChunk(params.uuid, chunk.uuid, e.message));

        return ok(res, {
          chunkUuid: chunk.uuid, sectionId: chunk.sectionId, sectionTitle: chunk.sectionTitle,
          agent: preferAgent, status: 'building',
        });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.chunk.complete': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      const { content } = body;
      if (!content) return err(res, 400, 'content required');
      try {
        const chunk = se.completeChunk(params.uuid, params.chunkUuid, content);
        const manifest = se.loadSpec(params.uuid);
        _syncPhaseFromManifest(os, manifest);
        os.emit('idearium.spec-engine.chunk.complete', {
          specUuid: params.uuid, chunkUuid: params.chunkUuid,
          sectionId: chunk.sectionId, progress: manifest.progress,
        });
        return ok(res, { chunk, progress: manifest.progress });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.chunk.fail': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const chunk = se.failChunk(params.uuid, params.chunkUuid, body.reason || 'manual fail');
        return ok(res, { chunk });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.setWarpPrimitives': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      if (!Array.isArray(body.warpPrimitives)) return err(res, 400, 'warpPrimitives must be an array');
      try {
        const manifest = se.setWarpPrimitives(params.uuid, body.warpPrimitives);
        return ok(res, { warpPrimitives: manifest.warpPrimitives });
      } catch (e) {
        return err(res, /not real WARP primitives/.test(e.message) ? 400 : 500, e.message);
      }
    }

    case 'speceng.chunk.setAgent': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      if (!body.agent) return err(res, 400, 'agent required');
      try {
        const chunk = se.setChunkAgent(params.uuid, params.chunkUuid, body.agent);
        os.emit('idearium.spec-engine.chunk.agent_set', {
          specUuid: params.uuid, chunkUuid: params.chunkUuid, sectionId: chunk.sectionId, agent: chunk.agent,
        });
        return ok(res, { chunk });
      } catch(e) {
        const status = /not found/.test(e.message) ? 404 : /cannot reassign/.test(e.message) ? 409 : 400;
        return err(res, status, e.message);
      }
    }

    case 'speceng.archive': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const archivePath = await se.archiveSpec(params.uuid);
        return ok(res, { archivePath });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.delete': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const manifest = se.deleteSpec(params.uuid);
        os.emit('idearium.spec.deleted', { specUuid: params.uuid, name: manifest.name });
        return ok(res, { deleted: true, uuid: params.uuid, name: manifest.name });
      } catch(e) { return err(res, 404, e.message); }
    }

    case 'speceng.restore': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const manifest = se.restoreSpec(params.uuid);
        os.emit('idearium.spec.restored', { specUuid: params.uuid, name: manifest.name });
        return ok(res, { manifest });
      } catch(e) { return err(res, 404, e.message); }
    }

    case 'speceng.expand': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const manifest = await se.expandSpec(params.uuid);
        return ok(res, { manifest });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.wizard': {
      // Qwen drives the next wizard question
      const as = getAgentSuite();
      if (!as) return err(res, 503, 'agent-suite not ready');
      try {
        const { specMeta = {}, answeredSections = {} } = body;
        const next = await as.getNextWizardQuestion(specMeta, answeredSections);
        return ok(res, { next, done: next === null });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.context': {
      const as = getAgentSuite();
      if (!as) return err(res, 503, 'agent-suite not ready');
      try {
        const context = await as.getSystemContext();
        return ok(res, { context });
      } catch(e) { return err(res, 500, e.message); }
    }

    // ── Queue / progress push (from forge queue) ──────────────────────────
    case 'idea.progress': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      // Update idea phase based on progress if provided
      if (body.state === 'VERIFIED') {
        os.emit('idearium.idea.phase', { uuid: params.uuid, phase: 'building', source:'queue' });
      }
      if (body.state === 'COMPLETE' && body.pct === 100) {
        os.emit('idearium.idea.phase', { uuid: params.uuid, phase: 'complete', source:'queue' });
      }
      const record = { ...body, ideaUuid: params.uuid, ts: Date.now() };
      if (!os.db.tensions) os.db.tensions = [];
      // Store as a tension record for timeline
      os.db.tensions.push({ uuid: require('crypto').randomUUID(), ideaUuid: params.uuid,
        score: (body.pct||0)/100, components: { queue_progress: body.pct||0 }, ts: Date.now() });
      return ok(res, { ok: true, progress: record });
    }

    case 'queue.progress': {
      // Forge queue progress — store in idearium event log
      const ev = os.emit('idearium.queue.progress', body);
      return ok(res, { ok: true, eventId: ev.uuid });
    }

    case 'queue.show': {
      const events = os.db.events.filter(e => e.payload?.queueId === params.queueId);
      return ok(res, { ok: true, queueId: params.queueId, events });
    }

    default:
      return err(res, 404, `no handler for: ${action}`);
  }
}

// ─── Spec → Markdown ─────────────────────────────────────────────────────────

function specToMarkdown(spec) {
  let md = `# ${spec.name}\n\n**Version:** ${spec.version}  **Phase:** ${spec.phase}\n\n`;
  for (const s of spec.sections) {
    md += `## ${s.title}\n\n`;
    if (s.content) md += `${s.content}\n\n`;
    else md += `_not yet written_\n\n`;
  }
  return md;
}

// ─── Server ───────────────────────────────────────────────────────────────────

// §BUILT 2026-09-06 — James: "it needs to start the queue each boot."
// Real, self-contained periodic drainer, not a one-time boot kick — a
// spec with 5 pending chunks needs 5 real build cycles, and nothing
// else in this file auto-chains from one chunk's completion to the
// next (checked, not assumed — see this function's real call site's
// own comment). Calls the exact same real, already-tested HTTP route
// (POST /api/spec-engine/specs/:uuid/build) a real client would —
// self-request, not a second dispatch mechanism, so it goes through
// dispatchChunkWithVerification's real retry ladder, WARP cache, and
// RAID observability exactly like every other real build does.
const BUILD_QUEUE_POLL_MS = 15000; // matches RAID's own real worker.js drain cadence
const _buildingSpecs = new Set(); // real, in-memory guard — never trigger a second build for a spec that's already mid-build

function _startBuildQueuePoller(port) {
  // §FIXED 2026-09-11 — James: "the problem is idearium doesn't retry,
  // if nexus restarts it wont try to build the chunks again." Real root
  // cause traced in spec-engine/index.js's recoverOrphanedChunks() own
  // header: a chunk left BUILDING by a process that died mid-dispatch is
  // invisible to nextPendingChunk() (not PENDING) AND to this poller's
  // own doneChunks-vs-totalChunks skip (not COMPLETE either) —
  // permanently stuck either way, not a retry-cadence problem at all.
  //
  // Recovery runs inside tick() itself, gated by _recoveryDone, rather
  // than as a separate one-shot call before the poller starts: getSpecEngine()
  // can still be mid-import at that exact moment (its own real, honest
  // "not ready yet" case — checked, this is a real, live risk, not
  // theoretical), which would have silently skipped recovery for the
  // whole boot with nothing to retry it. tick() already runs every
  // BUILD_QUEUE_POLL_MS and already has the same honest "if (!se) return"
  // skip — riding that same, already-proven retry mechanism instead of
  // building a second, less robust one.
  let _recoveryDone = false;
  async function tick() {
    const se = getSpecEngine();
    if (!se) return; // spec-engine not ready yet this tick — real, honest skip, not a crash
    if (!_recoveryDone) {
      try {
        const recovered = se.recoverOrphanedChunks();
        if (recovered.length) console.log(`[idearium/build-queue] boot recovery: ${recovered.length} orphaned chunk(s) reset BUILDING -> PENDING`);
      } catch (e) { console.warn(`[idearium/build-queue] orphaned-chunk recovery failed (non-fatal): ${e.message}`); }
      _recoveryDone = true; // once per real process lifetime — recovering an already-recovered (or genuinely, currently building) chunk on tick 2 would be wrong
    }
    let specs;
    try { specs = se.listSpecs(); }
    catch (e) { console.warn(`[idearium/build-queue] listSpecs() failed, will retry next tick: ${e.message}`); return; }

    for (const s of specs) {
      if (s.deleted || s.status === 'archived') continue;
      if (s.doneChunks >= s.totalChunks) continue; // real, genuine "nothing pending" — not guessed from a stale flag
      if (_buildingSpecs.has(s.uuid)) continue; // already mid-build from a previous tick — avoid a real, racing double-dispatch

      _buildingSpecs.add(s.uuid);
      const body = JSON.stringify({});
      const req = http.request({
        hostname: '127.0.0.1', port, method: 'POST',
        path: `/api/spec-engine/specs/${s.uuid}/build`,
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        timeout: 10000,
      }, (res) => {
        res.on('data', () => {});
        res.on('end', () => { _buildingSpecs.delete(s.uuid); }); // real completion (or a real, honest "done:true") frees this spec for the next tick to check again
      });
      // §1.2 — a failed self-request must never crash the poller or
      // silently wedge this spec out of future ticks forever.
      req.on('error', (e) => { _buildingSpecs.delete(s.uuid); console.warn(`[idearium/build-queue] build trigger for ${s.uuid} failed: ${e.message}`); });
      req.on('timeout', () => { req.destroy(); _buildingSpecs.delete(s.uuid); });
      req.write(body);
      req.end();
    }
  }
  const timer = setInterval(tick, BUILD_QUEUE_POLL_MS);
  if (timer.unref) timer.unref(); // never keeps the process alive on its own
  tick(); // real, immediate first pass — don't wait a full interval before resuming work that was already pending when this boot started
  console.log(`[idearium/build-queue] real, periodic queue drain started — every ${BUILD_QUEUE_POLL_MS}ms`);
  return timer; // real handle — lets a caller (or a test) stop this poller; startAPI() itself never needs to
}

export { _startBuildQueuePoller, _buildingSpecs };

export function startAPI() {
  const os = getIdeaOS();

  const server = http.createServer(async (req, res) => {
    // Preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS);
      return res.end();
    }

    // SSE
    // §CRASH FIX 2026-07-15 — this branch, and the two static-file branches
    // below it, sat OUTSIDE the try/catch that wraps matchRoute's dispatch —
    // the only safety net this file has. Since the whole handler is
    // `async (req,res) => {...}`, any synchronous throw here (e.g. res.write()
    // on a connection the client already tore down) becomes an unhandled
    // promise rejection, and Node 22's default behavior for that is to crash
    // the ENTIRE process, not just fail the one request. That takes every
    // other in-flight connection down with it — indistinguishable from the
    // outside from "the server vanished," which is exactly what a poller
    // sees as a socket hang up. Caught here the same way the main route
    // dispatch already is.
    if (req.url === '/sse') {
      try {
        res.writeHead(200, {
          'Content-Type':  'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection':    'keep-alive',
          ...CORS,
        });
        res.write(': connected\n\n');
        os.addSSEClient(res);
        // Send current state immediately on connect
        res.write(`data: ${JSON.stringify({ type:'idearium.ready', payload: os.stats(), ts: Date.now() })}\n\n`);
      } catch (e) {
        console.error('[API] /sse handler error (non-fatal, connection dropped):', e.message);
        try { res.destroy(); } catch (_) {}
      }
      return;
    }

    // Serve UI
    const cleanUrl = req.url.split('?')[0];
    // §STACK SPLIT 2026-07-10 — serve UI static assets. The UI was broken out
    // of a 2,335-line monolith into index.html + js/*.js (loaded via
    // <script src>). Without serving js/ those files 404 and the whole UI goes
    // blank. Path-traversal guarded: only files under ui/ are served.
    //
    // §CRASH FIX 2026-07-15 — both this branch and the one below were
    // outside the file's only try/catch (see the /sse fix above for the
    // full mechanism: an uncaught throw here crashes the whole process on
    // Node 22, not just this one request). existsSync-then-readFileSync is
    // also a TOCTOU race on its own (file can vanish between the two calls,
    // e.g. mid-deploy) — another real way this could throw uncaught.
    if (req.method === 'GET' && (cleanUrl.startsWith('/js/') || cleanUrl.startsWith('/css/'))) {
      try {
        const { readFileSync, existsSync } = await import('fs');
        const { join, dirname, normalize } = await import('path');
        const { fileURLToPath } = await import('url');
        const __d = dirname(fileURLToPath(import.meta.url));
        const uiRoot = join(__d, '..', 'ui');
        const asset = normalize(join(uiRoot, cleanUrl));
        if (!asset.startsWith(uiRoot)) { res.writeHead(403); res.end('forbidden'); return; }
        if (existsSync(asset)) {
          const type = asset.endsWith('.js') ? 'application/javascript'
                     : asset.endsWith('.css') ? 'text/css' : 'text/plain';
          res.writeHead(200, { 'Content-Type': type });
          res.end(readFileSync(asset, 'utf8'));
        } else { res.writeHead(404); res.end('not found'); }
      } catch (e) {
        console.error('[API] static asset handler error (non-fatal):', e.message);
        try { res.writeHead(500); res.end('internal error'); } catch (_) {}
      }
      return;
    }

    if (req.method === 'GET' && (cleanUrl === '/' || cleanUrl === '/idearium' || cleanUrl === '/ui')) {
      try {
        const { readFileSync, existsSync } = await import('fs');
        const { join, dirname } = await import('path');
        const { fileURLToPath } = await import('url');
        const __d = dirname(fileURLToPath(import.meta.url));
        // §DUPLICATE RESOLVED 2026-07-09 — idearium/ui/index.html and
        // ui/idearium/index.html were BYTE-IDENTICAL 2,327-line files. Two
        // copies of one UI drift the moment either is edited. The sovereign
        // location wins: a system owns its own UI. orchestrator already serves
        // the URL /ui/idearium from idearium/ui (orchestrator.js static map),
        // so the second copy was a fallback nobody reached. Removed.
        const uiPath = join(__d, '..', 'ui', 'index.html');
        const uiPath2 = uiPath;
        const finalPath = existsSync(uiPath) ? uiPath : uiPath2;
        if (existsSync(finalPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(readFileSync(finalPath, 'utf8'));
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><body style="background:#0a0a0c;color:#e2e2ea;font-family:monospace;padding:40px"><h2>◈ IDEARIUM</h2><p>UI not built yet</p></body></html>');
        }
      } catch (e) {
        console.error('[API] UI-serve handler error (non-fatal):', e.message);
        try { res.writeHead(500); res.end('internal error'); } catch (_) {}
      }
      return;
    }

    const route = matchRoute(req.method, req.url);
    if (!route) {
      // ── CFR-Ω routes — same handleCFRRoute() contract as the other kernels ──
      // §CFR-WIRE-05: checked here, not before matchRoute, so existing
      // idearium routes keep priority and /cfr never shadows anything real.
      if (req.url.startsWith('/cfr')) {
        const ledger = os._evLedger;
        if (ledger && ledger.handleCFRRoute) {
          const cfrUrl = new URL(req.url, `http://localhost:${PORT}`);
          if (ledger.handleCFRRoute(req, res, cfrUrl)) return;
        }
      }
      return err(res, 404, `${req.method} ${req.url.split('?')[0]} not found`);
    }

    const query = parseQuery(req.url);
    let body = {};
    if (['POST','PATCH','PUT','DELETE'].includes(req.method)) {
      try { body = await readBody(req); }
      catch (e) { return err(res, 400, 'body parse failed', e.message); }
    }

    try {
      await handle(req, res, route, query, body);
    } catch (e) {
      console.error('[API] Unhandled error:', e);
      err(res, 500, 'internal error', e.message);
    }
  });

  server.listen(PORT, BINDING, async () => {
    // ESM: use createRequire for CJS modules
    const _require = createRequire(import.meta.url);

    const { BootSequence } = _require('../../lib/boot-sequence');

    const seq = new BootSequence({
      systemId: 'idearium', port: PORT, version: VERSION,
      label: 'Idearium', maxRetries: 1,
    });

    // Phase 0 HARD: server bound
    seq.phase({ name:'server.bound', type:'HARD',
      label:'HTTP API bound :' + PORT,
      fn: async () => { /* in listen callback = bound */ },
    });

    // Phase 1 HARD: IdeaOS runtime verify — use the actual API
    seq.phase({ name:'ideaos.verify', type:'HARD',
      label:'IdeaOS runtime verify via /api/stats',
      fn: async () => {
        await new Promise((resolve, reject) => {
          let d = '';
          const r = _require('http').get(
            'http://127.0.0.1:' + PORT + '/api/stats',
            res => {
              res.on('data', c => { d += c; });
              res.on('end', () => {
                try {
                  const j = JSON.parse(d);
                  if (j.ok !== false) resolve();
                  else reject(new Error('stats returned ok=false'));
                } catch(e) { reject(e); }
              });
            }
          );
          r.setTimeout(2000, () => { r.destroy(); reject(new Error('stats timeout')); });
          r.on('error', reject);
        });
      },
    });

    // Phase 2 HARD: health endpoint verify
    seq.phase({ name:'health.verify', type:'HARD',
      label:'Verify /health returns ok=true',
      fn: async () => {
        await new Promise((resolve, reject) => {
          const r = _require('http').get(
            'http://127.0.0.1:' + PORT + '/health',
            res => { res.statusCode === 200 ? resolve()
              : reject(new Error('health ' + res.statusCode)); }
          );
          r.setTimeout(2000, () => { r.destroy(); reject(new Error('timeout')); });
          r.on('error', reject);
        });
      },
    });

    // Phase 3 HARD: contract verify
    seq.phase({ name:'contract.verify', type:'HARD',
      label:'Verify /api/contract returns id=idearium-v1',
      fn: async () => {
        await new Promise((resolve, reject) => {
          let body = '';
          const r = _require('http').get(
            'http://127.0.0.1:' + PORT + '/api/contract',
            res => {
              res.on('data', c => { body += c; });
              res.on('end', () => {
                try {
                  const j = JSON.parse(body);
                  if (j.contract?.id === 'idearium-v1') resolve();
                  else reject(new Error('contract id=' + j.contract?.id));
                } catch(e) { reject(e); }
              });
            }
          );
          r.setTimeout(2000, () => { r.destroy(); reject(new Error('timeout')); });
          r.on('error', reject);
        });
      },
    });

    // Phase 4 SOFT: orchestrator registration (§AXIOM)
    seq.phase({ name:'orchestrator.register', type:'SOFT',
      label:'Register with orchestrator (§AXIOM)',
      fn: async () => {
        const body = JSON.stringify({ systemId:'idearium', port:PORT,
          meta:{ role:'idea-os', version:VERSION },
          components: IDEARIUM_COMPONENTS });
        const r = _require('http').request({
          hostname:_orchestrator().host, port:_orchestrator().port, path:'/api/register', method:'POST',
          headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
        });
        r.setTimeout(2000, () => r.destroy()); r.on('error', () => {});
        r.write(body); r.end();
        // §MIGRATED 2026-08-29 — real, shared orchestrator/lib/pulse.js's
        // createPulse(), replacing the hand-rolled setInterval+raw
        // http.request this was before. Same class of duplicate this
        // session already found and removed twice (clear-glass, cortex):
        // a hand-rolled copy of the exact same idea, carrying none of
        // pulse.js's real latency tracking, online/offline transition
        // detection, or missed-beat logging. orchestrator's own real
        // /api/heartbeat handler (confirmed by reading it directly) was
        // ALREADY built to accept pulse.js's richer payload (meta, seq,
        // pulseId) — this was never a compatibility risk, just an unused
        // capability on the receiving end. _pulse stored on module scope
        // (not local to this closure) so a real shutdown path — cortex's
        // own migration found it has none either, a separate, pre-
        // existing gap, not fixed here — has something real to call.
        _pulseClient = _require('../../orchestrator/lib/pulse.js').createPulse({
          systemId: 'idearium', port: PORT,
          onOffline: () => console.warn('[idearium] orchestrator unreachable — pulse will keep retrying'),
          onOnline:  ({ latency }) => console.log(`[idearium] orchestrator back online, latency=${latency}ms`),
        });
      },
    });

    // Phase 5 SOFT: bridge handshake (§5.2)
    seq.phase({ name:'bridge.handshake', type:'SOFT',
      label:'Bridge handshake with orchestrator',
      fn: async () => {
        // §FIX 2026-08-27 — this POST hits the same /api/register route Phase 4
        // uses, and orchestrator's registryUpdate() does {...existing, ...data}:
        // an explicit `port: undefined` key here overwrites Phase 4's correct
        // port (4800) with undefined. Node's http.request then defaults the
        // next contract-verification call to port 80 → ECONNREFUSED, logged as
        // 'contract.unreachable — idearium'. It self-heals within ~10s (the
        // heartbeat interval below re-sends the correct port), but the registry
        // is wrong in the window between. Sending the real port here closes it.
        const bBody = JSON.stringify({ systemId:'idearium', port:PORT, appId:'idearium', secret:'nexus-idearium-internal-v1' });
        const r = _require('http').request({
          hostname:_orchestrator().host, port:_orchestrator().port, path:'/api/register', method:'POST',
          headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(bBody)},
        }, res => {
          let d = ''; res.on('data', c => { d += c; });
          res.on('end', () => {
            try { JSON.parse(d); } catch(_) {}
          });
        });
        r.on('error', () => {}); r.write(bBody); r.end();
        // Also post booted to ledger
        const lb = JSON.stringify({ system:'idearium', type:'idearium.booted',
          payload:{ version:VERSION, port:PORT } });
        const _o2 = _orchestrator();
        const r2 = _require('http').request({
          hostname:_o2.host, port:_o2.port, path:'/api/ledger', method:'POST',
          headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(lb)},
        });
        r2.on('error', () => {}); r2.write(lb); r2.end();
      },
    });

    // Phase 6 SOFT: SSE stream verify
    seq.phase({ name:'sse.verify', type:'SOFT',
      label:'Verify /sse stream opens',
      fn: async () => {
        await new Promise((resolve, reject) => {
          const r = _require('http').request({
            hostname:'127.0.0.1', port:PORT, path:'/sse',
            headers:{ Accept:'text/event-stream' },
          }, res => {
            if (res.statusCode === 200) { r.destroy(); resolve(); }
            else { r.destroy(); reject(new Error('SSE ' + res.statusCode)); }
          });
          r.setTimeout(2000, () => { r.destroy(); resolve(); }); // resolve on timeout = SSE streaming
          r.on('error', reject); r.end();
        });
      },
    });

    // Phase 7 SOFT: boot announce — Idearium is local/internal-only
    seq.phase({ name:'boot.announce', type:'SOFT',
      label:'Announce bind — internal API, no auth, no remote surface',
      fn: async () => {
        console.log(`[idearium] bound :${PORT} on ${BINDING}`);
        console.log('[idearium] auth  — disabled (internal-only, reached via orchestrator)');
        if (BINDING !== '127.0.0.1') {
          console.warn(`[idearium] binding=${BINDING} — this system has no auth. Use 127.0.0.1 unless you know what you are doing.`);
        }
      },
    });

    // Phase 7.5 SOFT: guardian job-completion — reconcile any chunks left
    // 'building' by a prior process's restart, then subscribe live.
    // §BUILT 2026-09-03 — see lib/guardian-stream.cjs's own header for the
    // full reasoning (real /events, not copilot's buggy /bus; no new
    // queue table, chunk.jobId/dispatchDir already IS the durable record).
    // SOFT — guardian being down at idearium's own boot must never block
    // idearium itself from coming up; the connector keeps retrying.
    seq.phase({ name:'guardian.reconcile', type:'SOFT',
      label:'Reconcile in-flight chunks + connect guardian job stream',
      fn: async () => {
        const se = getSpecEngine();
        if (!se) { console.warn('[idearium] guardian.reconcile: spec-engine not ready, skipping'); return; }
        const { reconcileInFlightChunks, connectGuardianStream } = _require('../lib/guardian-stream.cjs');
        await reconcileInFlightChunks(se);
        connectGuardianStream(se);
      },
    });

    // Phase 8 removed: Idearium no longer opens its own remote tunnel.
    // Idearium is API-internal only — the orchestrator (:9000) is the sole
    // remote/external surface for NEXUS. Reaching Idearium from outside the
    // host should go through the orchestrator's proxy, not a direct tunnel.

    await seq.run();
    // Idearium never hard-exits — degrades gracefully

    // §BUILT 2026-09-06 — James: "it needs to start the queue each
    // boot. So the chunks in the repo in idearium build." Checked
    // first, not assumed: speceng.build's own real dispatch (above)
    // starts exactly one chunk building and returns — nothing in this
    // whole file auto-chains to the next pending chunk once one
    // completes. Without a real, periodic drainer, a spec created
    // (and, since the auto-repo-creation fix, its real repo) just sits
    // with pending chunks forever unless a human manually triggers
    // each one. This closes that loop: a real, self-contained poller,
    // started once idearium's own boot sequence completes, checking
    // every real spec for pending work and (re)triggering a build the
    // exact same way a real client would — the same
    // dispatchChunkWithVerification path, same WARP cache, same RAID
    // observability contract, same Detector verification. Not a
    // separate build mechanism; the same one, just self-triggered
    // instead of waiting for someone to click a button.
    _startBuildQueuePoller(PORT);
  });

  server.on('error', e => {
    if (e.code === 'EADDRINUSE') {
      console.error(`[Idearium API] Port ${PORT} already in use. Is Idearium already running?`);
      process.exit(1);
    }
    throw e;
  });

  return server;
}

// ── Auto-start when run directly ────────────────────────────────────────────
// §FOUND & FIXED 2026-09-06 — this comment already said "when run
// directly," but the actual code below was unconditional: importing
// this module for its exports (as a real test now needs to, to reach
// _startBuildQueuePoller/_buildingSpecs) ALSO booted a real, live
// idearium server on :4800 as an unavoidable side effect — including,
// after this same session's own build-queue-poller fix, a REAL second
// poller instance that found and tried to dispatch the SAME real specs
// a test had just created, causing real, confusing cross-talk (a test
// mock server seeing more hits than it triggered itself). Checked
// first that nothing else in the codebase imports this file directly
// (only the new test does) before adding this guard — safe.
//
// §FOUND & FIXED 2026-09-11 — real Windows bug in the guard itself:
// `file://${process.argv[1]}` hand-builds the URL by string-pasting a
// raw OS path onto a scheme. On Windows process.argv[1] is a drive
// path like `C:\Users\James\...\index.js` — backslashes, no leading
// slash before the drive letter, unescaped. That produces
// `file://C:\Users\James\...`, which is not a well-formed file: URL
// and can never equal the real import.meta.url Node itself generates
// for this same file (`file:///C:/Users/James/...`, forward slashes,
// triple slash, percent-encoded). So on Windows this guard was always
// false — `node idearium/api/index.js` directly would silently never
// call startAPI(), no error, no log, just a process that loads and
// exits having done nothing. Fixed by letting Node's own
// pathToFileURL() build both sides the same way it built
// import.meta.url, instead of reimplementing URL construction by hand.
if (import.meta.url === _pathToFileURL(process.argv[1]).href) {
  startAPI();
}
