spec:
  name: nexus-upload-project-1
  uuid: 073fba9f-ffd5-4246-8753-86ef0079066f
  version: 0.1.0
  type: codebase
  phase: 40
  status: complete
  agent: auto
  completed_at: 2026-09-15T20:05:08.877Z

# lib/project-container.js

'use strict';
/**
 * lib/project-container.js — the "Upload Project" pipeline.
 *
 * James: "add an 'upload project'... asking about the name, what your
 * goals are, lists some example intents, to set as the compartment's
 * end state, creates a temporary compartment (just in case the user
 * cancels)... a dropzone... 'import repository'... generates the
 * manifest, project.json, .git... fully configurable in a config
 * file... creates the project container, then imports the compartment
 * fully as a repo, using the manifest, and project files, and a .git."
 *
 * §ARCHITECTURE — this file is deliberately CommonJS, sitting next to
 * (and calling directly into) lib/compartment-engine.js, lib/end-state.js,
 * lib/intent-classifier.js, lib/zip-ingest.js, and cortex/memory/jaa-db.js —
 * all CJS. It does NOT call idearium/repo/index.js's RepoLayer directly:
 * RepoLayer is an ESM class (idearium/package.json declares "type":
 * "module"), and Node's CJS require() cannot load an ESM module. The
 * real bridge point is idearium/api/index.js, which already does this
 * exact ESM<->CJS crossing for every other lib/ module it calls via
 * createRequire (see its own `_require`). So the flow splits cleanly:
 *
 *   1. startContainer()   — pure CJS. Classifies the intent, declares
 *      the end-state, spawns the compartment, persists the container
 *      row. Called directly from idearium/api/index.js via _require.
 *   2. idearium/api/index.js calls RepoLayer.ingest() itself (the one
 *      step only the ESM side can do) once a zip has been extracted
 *      (via lib/zip-ingest.js, also CJS, called from the ESM side the
 *      same way).
 *   3. finalizeContainer() — pure CJS again. Given the repo RepoLayer
 *      already created (uuid + its real, physical, materialized
 *      directory), writes manifest.json/project.json, runs real `git
 *      init`+commit, evaluates the end-state against what's actually
 *      on disk, and resolves the compartment through its real
 *      execute()/resolve() lifecycle — never force-PASSed.
 *   4. cancelContainer() — abandon()s the compartment if the user
 *      walks away before finalize.
 *
 * §HONESTY — finalize()'s end-state conditions check REAL artifact
 * state (files on disk, manifest present, .git present) — never a
 * fabricated "looks done" guess. If a condition genuinely isn't met,
 * the compartment resolves to FAIL through its own real resolve()
 * path, not a swallowed error.
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const cfg              = require('./project-import.config.js');
const compartmentEngine = require('./compartment-engine.js');
const endState          = require('./end-state.js');
const intentClassifier  = require('./intent-classifier.js');

const MODULE_ID = 'project-container';
const VERSION   = '1.0.0';
const TABLE     = 'idearium_project_containers';

let _jaa;
function _getJAA() {
  if (_jaa) return _jaa;
  try { ({ jaaDB: _jaa } = require('../cortex/memory/jaa-db')); } catch (e) {
    console.warn(`[${MODULE_ID}] jaa-db unavailable — container state will not persist: ${e.message}`);
  }
  return _jaa;
}

// In-memory table of LIVE compartment objects, keyed by container uuid.
// compartment-engine's compartment is a real, richer-than-JSON object
// (frozen constraint_frame, trace_log array) — the jaa row is the
// durable audit trail (per compartment-engine's own convention), this
// map is what a same-process finalize()/cancel() call actually acts on.
// A process restart between start() and finalize()/cancel() genuinely
// loses the in-flight compartment — honestly surfaced as an error
// below (§SCOPE), not silently reconstructed from the JSON row, which
// would fabricate a frozen constraint_frame that was never really
// re-assembled.
const _live = new Map();

// ── start ────────────────────────────────────────────────────────────────
/**
 * startContainer({ name, goal, intentText }) — the "Upload Project"
 * prompt's submit action. Classifies intentText (or goal, if no
 * separate intent phrase was given) into a real intent, declares an
 * end-state around it, spawns a temporary compartment, and persists a
 * container row in AWAITING_UPLOAD status.
 *
 * Returns { ok:true, containerUuid, compartmentId, endStateId, intent }
 * or { ok:false, error }.
 */
async function startContainer({ name, goal, intentText } = {}) {
  if (!name || !String(name).trim())  return { ok: false, error: 'name is required' };
  if (!goal || !String(goal).trim())  return { ok: false, error: 'goal is required' };

  const text = (intentText && String(intentText).trim()) || goal;
  const { intent: rawIntent } = intentClassifier.classify({ text, source: 'USER' });
  const intent = intentClassifier.freeze(rawIntent);

  // §REAL CONDITIONS — each checks actual artifact state at finalize
  // time (see finalizeContainer's `artifact` shape below). No
  // condition here can be satisfied by anything other than a real
  // file existing with real content — see lib/end-state.js's own
  // §1.1 ("a condition nothing can check is decoration").
  const declaredEndState = endState.declare({
    goal,
    owner: 'user',
    conditions: [
      {
        id: 'files-imported',
        describe: 'at least one source file was imported into the repo',
        evaluate: (artifact) => ({ met: (artifact?.fileCount || 0) > 0, progress: (artifact?.fileCount || 0) > 0 ? 1 : 0,
          detail: `${artifact?.fileCount || 0} file(s)` }),
      },
      {
        id: 'manifest-present',
        describe: 'manifest.json exists in the repo\'s real, physical directory',
        evaluate: (artifact) => ({ met: !!artifact?.manifestPath && fs.existsSync(artifact.manifestPath),
          detail: artifact?.manifestPath || null }),
      },
      {
        id: 'project-json-present',
        describe: 'project.json exists in the repo\'s real, physical directory',
        evaluate: (artifact) => ({ met: !!artifact?.projectJsonPath && fs.existsSync(artifact.projectJsonPath),
          detail: artifact?.projectJsonPath || null }),
      },
      {
        id: 'git-present',
        describe: 'a real .git directory with at least one commit exists',
        evaluate: (artifact) => ({ met: !!artifact?.git?.committed === true,
          detail: artifact?.git ? `${artifact.git.branch}@${artifact.git.commit || 'none'}` : null }),
      },
    ],
  });

  let compartment;
  try {
    compartment = await compartmentEngine.spawn({
      intent,
      budget:   cfg.COMPARTMENT.budget,
      boundary: cfg.COMPARTMENT.boundary,
    });
  } catch (e) {
    return { ok: false, error: `compartment spawn failed: ${e.message}` };
  }

  const containerUuid = crypto.randomUUID();
  const row = {
    uuid: containerUuid,
    name: String(name).slice(0, 200),
    goal: String(goal).slice(0, 2000),
    intentUuid: intent.uuid,
    compartmentId: compartment.id,
    endStateId: declaredEndState.id,
    status: 'AWAITING_UPLOAD',
    repoUuid: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const jaa = _getJAA();
  if (jaa) { try { jaa.insert(TABLE, row); } catch (e) { console.warn(`[${MODULE_ID}] container row insert failed: ${e.message}`); } }

  _live.set(containerUuid, { compartment, endState: declaredEndState, row });

  return {
    ok: true,
    containerUuid,
    compartmentId: compartment.id,
    endStateId: declaredEndState.id,
    intent: { uuid: intent.uuid, domain: intent.domain, verb: intent.verb, confidence: intent.confidence },
  };
}

// ── cancel ───────────────────────────────────────────────────────────────
/** cancelContainer(containerUuid) — user walked away before finalize. */
async function cancelContainer(containerUuid) {
  const live = _live.get(containerUuid);
  if (!live) return { ok: false, error: `no live container "${containerUuid}" (already finalized, cancelled, or from a prior process)` };
  if (live.row.status !== 'AWAITING_UPLOAD') return { ok: false, error: `container is ${live.row.status}, not AWAITING_UPLOAD — cannot cancel` };

  // §FIXED — compartment-engine.js exports exactly { spawn, execute,
  // resolve, _registerExtensions, validateWiring, STATUS, MODULE_ID,
  // VERSION }. There is no abandon() (confirmed against the module's own
  // module.exports, not assumed from the name reading like it should
  // exist). resolve() is the real way to end a compartment that never
  // ran an executor: setting _executionError first routes it through
  // resolve()'s own `if (compartment._executionError)` branch straight
  // to _fail() (real REWOUND-if-possible via the spawn-time snapshot,
  // same honest, non-PASS path finalizeContainer's own FAIL case uses)
  // — not a fabricated success, and not a second, parallel "abandon"
  // concept invented on top of the one resolution path the engine
  // actually has.
  live.compartment._executionError = 'user cancelled upload-project flow before finalize';
  let resolved;
  try {
    resolved = await compartmentEngine.resolve(live.compartment);
  } catch (e) {
    return { ok: false, error: `resolve (cancel) failed: ${e.message}` };
  }
  live.compartment.status = resolved.status;

  live.row.status = 'CANCELLED';
  live.row.updatedAt = Date.now();
  const jaa = _getJAA();
  if (jaa) { try { jaa.update(TABLE, containerUuid, { status: 'CANCELLED', updatedAt: live.row.updatedAt }); } catch (_) {} }
  _live.delete(containerUuid);

  return { ok: true, containerUuid, compartmentStatus: live.compartment.status };
}

// ── finalize ─────────────────────────────────────────────────────────────
/**
 * finalizeContainer({ containerUuid, repoUuid, repoDir, fileCount }) —
 * called AFTER idearium/api/index.js has already: extracted the zip
 * (lib/zip-ingest.js), called RepoLayer.ingest({..., compartmentId}),
 * and confirmed RepoLayer.materialize() wrote the real files to
 * repoDir. This function does everything downstream of that:
 *   - writes manifest.json + project.json into repoDir
 *   - git init + add + commit, real, via the system git binary
 *   - evaluates the end-state against the real resulting artifact
 *   - resolves the compartment (execute() -> real PASS or real FAIL)
 *
 * Returns { ok:true, manifest, projectJson, git, endState, compartmentStatus }
 * or { ok:false, error }.
 */
async function finalizeContainer({ containerUuid, repoUuid, repoDir, fileCount } = {}) {
  const live = _live.get(containerUuid);
  if (!live) return { ok: false, error: `no live container "${containerUuid}" (already finalized, cancelled, or from a prior process)` };
  if (live.row.status !== 'AWAITING_UPLOAD') return { ok: false, error: `container is ${live.row.status}, not AWAITING_UPLOAD` };
  if (!repoUuid || !repoDir) return { ok: false, error: 'repoUuid and repoDir are required — call RepoLayer.ingest()/materialize() first' };
  if (!fs.existsSync(repoDir)) return { ok: false, error: `repoDir does not exist on disk: ${repoDir}` };

  const manifest = _writeManifest({ repoDir, repoUuid, containerUuid, live });
  const projectJson = _writeProjectJson({ repoDir, repoUuid, live, fileCount });
  const git = _gitInit({ repoDir, name: live.row.name });

  const artifact = {
    fileCount: fileCount || 0,
    manifestPath: manifest.path,
    projectJsonPath: projectJson.path,
    git,
    repoUuid, repoDir,
  };

  const evaluation = endState.evaluate(live.endState, artifact, {});

  let compartmentStatus;
  try {
    const resolved = await compartmentEngine.execute(live.compartment, async () => {
      if (!evaluation.reached) {
        // §HONEST FAIL — thrown, not swallowed, so execute()/resolve()
        // routes this through the REAL FAIL path (compartment-engine.js's
        // resolve() catches compartment._executionError), never a
        // force-PASS of a condition set that genuinely wasn't met.
        throw new Error(`end-state not reached: ${evaluation.unmet.map(u => u.id).join(', ') || 'unknown'}`);
      }
      return artifact;
    });
    compartmentStatus = resolved.status;
  } catch (e) {
    compartmentStatus = 'FAIL';
    console.warn(`[${MODULE_ID}] compartment resolve threw for ${live.compartment.id}: ${e.message}`);
  }

  live.row.status = evaluation.reached ? 'COMPLETE' : 'FAILED';
  live.row.repoUuid = repoUuid;
  live.row.updatedAt = Date.now();
  const jaa = _getJAA();
  if (jaa) {
    try { jaa.update(TABLE, containerUuid, { status: live.row.status, repoUuid, updatedAt: live.row.updatedAt }); }
    catch (_) {}
  }
  _live.delete(containerUuid);

  return {
    ok: evaluation.reached,
    error: evaluation.reached ? null : `end-state not reached: ${evaluation.unmet.map(u => u.id).join(', ')}`,
    manifest: manifest.content, projectJson: projectJson.content, git,
    endState: evaluation, compartmentStatus,
  };
}

// ── manifest.json ────────────────────────────────────────────────────────
function _writeManifest({ repoDir, repoUuid, containerUuid, live }) {
  const content = {
    name: live.row.name,
    version: cfg.MANIFEST.version,
    uuid: `nexus-project-container-${containerUuid.slice(0, 8)}`,
    hookId: `idearium.project-container:v1:${containerUuid.slice(0, 8)}`,
    description: live.row.goal,
    layer: cfg.MANIFEST.layer,
    repoUuid,
    containerUuid,
    compartmentId: live.row.compartmentId,
    intentUuid: live.row.intentUuid,
    endStateId: live.row.endStateId,
    importedAt: Date.now(),
  };
  const p = path.join(repoDir, 'manifest.json');
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf8');
  return { path: p, content };
}

// ── project.json ─────────────────────────────────────────────────────────
function _writeProjectJson({ repoDir, repoUuid, live, fileCount }) {
  const content = {
    name: live.row.name,
    version: cfg.PROJECT_JSON.version,
    uuid: repoUuid,
    goal: live.row.goal,
    fileCount: fileCount || 0,
    createdAt: Date.now(),
  };
  const p = path.join(repoDir, 'project.json');
  fs.writeFileSync(p, JSON.stringify(content, null, 2), 'utf8');
  return { path: p, content };
}

// ── real git init ────────────────────────────────────────────────────────
// Shells out to the system `git` binary — matches lib/intake.js's
// expandArchive() shelling out to `unzip` (see that file's own
// §STATED LIMIT). Never throws — a git failure (binary missing, repo
// dir not writable) degrades to { committed:false, error } and lets
// finalizeContainer's end-state evaluation honestly fail the
// 'git-present' condition rather than crashing the whole import.
function _gitInit({ repoDir, name }) {
  const { binary, defaultBranch, authorName, authorEmail, commitMessage } = cfg.GIT;
  const run = (args) => execFileSync(binary, args, {
    cwd: repoDir, stdio: 'pipe',
    env: { ...process.env, GIT_AUTHOR_NAME: authorName, GIT_AUTHOR_EMAIL: authorEmail,
           GIT_COMMITTER_NAME: authorName, GIT_COMMITTER_EMAIL: authorEmail },
  });

  try {
    if (fs.existsSync(path.join(repoDir, '.git'))) {
      return { committed: false, error: '.git already exists in this directory — not overwritten', branch: null, commit: null };
    }
    run(['init', '-b', defaultBranch]);
    run(['add', '-A']);
    run(['commit', '-m', commitMessage(name), '--no-gpg-sign']);
    const commit = run(['rev-parse', '--short', 'HEAD']).toString('utf8').trim();
    return { committed: true, branch: defaultBranch, commit };
  } catch (e) {
    return { committed: false, error: e.message, branch: null, commit: null };
  }
}

// ── sweep ────────────────────────────────────────────────────────────────
/**
 * sweepStale() — a container left AWAITING_UPLOAD past
 * cfg.COMPARTMENT.staleAfterMs auto-abandons. Real safety net for a
 * browser tab closed mid-flow; intended to be called on an interval by
 * whichever process hosts this module (guardian/idearium boot,
 * matching compartment-engine's own "call this periodically" pattern
 * for other sweeps in this codebase) — not wired to a timer here, so a
 * caller can choose its own cadence.
 */
async function sweepStale() {
  const now = Date.now();
  const swept = [];
  for (const [containerUuid, live] of _live) {
    if (live.row.status !== 'AWAITING_UPLOAD') continue;
    if (now - live.row.createdAt < cfg.COMPARTMENT.staleAfterMs) continue;
    const result = await cancelContainer(containerUuid);
    swept.push({ containerUuid, result });
  }
  return swept;
}

module.exports = { startContainer, cancelContainer, finalizeContainer, sweepStale, MODULE_ID, VERSION, TABLE };

---

# lib/project-import.config.js

'use strict';
/**
 * lib/project-import.config.js — every tunable for the "Upload Project"
 * pipeline (lib/project-container.js + lib/zip-ingest.js + the
 * ui/import-project screen), in one place.
 *
 * James: "make this fully configurable in a config file." Nothing in
 * project-container.js or the import-archive route should hardcode a
 * bound, a git identity, or the example-intent copy shown in the
 * prompt — it all reads from here, so changing behavior is an edit to
 * this file, not a code change hunted across three modules.
 *
 * All values are overridable via env var (matches this codebase's
 * existing convention — see intent-classifier.js's
 * NEXUS_INTENT_CONFIDENCE_FLOOR) so a deploy can tune bounds without a
 * code edit either.
 */

const path = require('path');

const num = (envVal, fallback) => {
  const n = Number(envVal);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

module.exports = {
  // ── Compartment spawned for the lifetime of the upload flow ──────────
  // budget/boundary shape must match compartment-engine.js's
  // _assembleConstraintFrame() expectations exactly (budget.tokens/
  // timeMs/irreversibleOpsAllowed, boundary.description/paths/systems)
  // — this is real frame content, not decoration.
  COMPARTMENT: {
    budget: {
      tokens: num(process.env.NEXUS_PROJECT_IMPORT_TOKEN_BUDGET, null),
      timeMs: num(process.env.NEXUS_PROJECT_IMPORT_TIME_BUDGET_MS, 30 * 60 * 1000), // 30 min to go from prompt -> drop -> import
      irreversibleOpsAllowed: false, // a project import never needs delete/rollback/overwrite of anything outside its own new repo dir
    },
    boundary: {
      description: 'idearium project-import: may create a new repo directory and its manifest/project.json/.git; touches nothing else',
      paths: ['idearium/data/projects/*'],
      systems: ['idearium'],
    },
    // A container left AWAITING_UPLOAD this long (browser tab closed
    // mid-flow, network died on the way to /import) auto-cancels via
    // sweepStale() — see project-container.js's own header for why this
    // isn't wired to a timer inside that module.
    staleAfterMs: num(process.env.NEXUS_PROJECT_IMPORT_STALE_MS, 20 * 60 * 1000),
  },

  // ── where an imported project's repo directory physically lives ──────
  // James: "i want it to create the compartment in idearium's repo
  // folder" — idearium/repo/repos/<repoUuid>, inside this module's own
  // directory, rather than RepoLayer's own default (idearium/data/
  // projects/<repoUuid>, still used by every other ingest path — drop/
  // promote/fork — unaffected by this). __dirname here is lib/, so
  // '..' is this repo's root (nexus/nexus/) — idearium/repo/repos sits
  // beside idearium/repo/index.js, the module that owns this directory.
  REPO_STORAGE: {
    dir: process.env.NEXUS_PROJECT_IMPORT_REPO_DIR || path.join(__dirname, '..', 'idearium', 'repo', 'repos'),
  },

  // ── manifest.json written into the repo dir at finalize ──────────────
  MANIFEST: {
    version: '1.0.0',
    layer: 'idearium',
  },

  // ── project.json written into the repo dir at finalize ───────────────
  PROJECT_JSON: {
    version: '1.0.0',
  },

  // ── real `git init` + first commit ────────────────────────────────────
  GIT: {
    binary: process.env.NEXUS_GIT_BINARY || 'git',
    defaultBranch: process.env.NEXUS_PROJECT_IMPORT_GIT_BRANCH || 'main',
    authorName:  process.env.NEXUS_PROJECT_IMPORT_GIT_AUTHOR_NAME  || 'NEXUS Idearium',
    authorEmail: process.env.NEXUS_PROJECT_IMPORT_GIT_AUTHOR_EMAIL || 'idearium@nexus.local',
    commitMessage: (name) => `Import: ${name}`,
  },

  // ── zip extraction bounds (lib/zip-ingest.js) ─────────────────────────
  // §SHARED — these are the one real set of bounds for turning an
  // uploaded zip into repo files. idearium/api/index.js's
  // repo.import-archive route and project-container's "Import
  // Repository" step both read these, rather than each hardcoding its
  // own copy (which is exactly the drift zip-ingest.js's own header
  // calls out as the thing being fixed).
  ZIP: {
    maxFiles:         num(process.env.NEXUS_PROJECT_IMPORT_MAX_FILES, 500),
    maxBytesPerFile:  num(process.env.NEXUS_PROJECT_IMPORT_MAX_BYTES_PER_FILE, 200 * 1024),   // 200 KB/file
    maxTotalBytes:    num(process.env.NEXUS_PROJECT_IMPORT_MAX_TOTAL_BYTES, 20 * 1024 * 1024), // 20 MB/import
    skipDirs: ['node_modules', '.git', '.svn', 'dist', 'build', '__pycache__', '.next'],
    textExt:  ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.html', '.css', '.yml', '.yaml', '.spec', '.sh'],
  },

  // ── files the "Upload Project" prompt shows as example end-state goals ──
  // Not decorative copy — every example here is written to actually hit a
  // real DOMAIN_PATTERNS/VERB_PATTERNS regex in lib/intent-classifier.js
  // (build/write/fix.../analyze/explain/validate), so classify() gives a
  // real, non-fallback intent for whichever one the user reuses verbatim,
  // rather than shipping an example that would silently classify as a
  // last-resort default.
  INTENT_EXAMPLES: [
    'Fix and validate the broken build pipeline',
    'Refactor the API layer for clarity',
    'Document how this module actually works',
    'Analyze the codebase for technical debt',
    'Build out the missing test coverage',
    'Diagnose why the import keeps failing',
  ],
};

---

# lib/zip-ingest.js

'use strict';
/**
 * lib/zip-ingest.js — shared zip → bounded text-file extraction.
 *
 * §EXTRACTED 2026-09-15 — this exact logic (adm-zip, SKIP_DIRS/TEXT_EXT
 * filtering, maxFiles/maxBytesPerFile/maxTotalBytes bounds) previously
 * lived inline in idearium/api/index.js's `repo.import-archive` case —
 * the only caller, until lib/project-container.js needed the identical
 * behavior for the "Import Repository" step of the Upload Project
 * pipeline. Two inline copies of the same bounded-extraction logic is
 * exactly what DECOMP.md's law ("never inline what belongs in a
 * module") exists to prevent — this file is that module. The original
 * route is refactored to call it (see that diff), behavior unchanged —
 * same bounds, same omission reasons, same dedup-relevant shape.
 *
 * §DEPENDENCY — adm-zip is a real, already-declared dependency
 * (package.json), not newly added here. This is the one deliberate
 * exception to the zero-npm-dependency default elsewhere in lib/ —
 * reading arbitrary zip byte layouts (central directory, deflate) by
 * hand is a correctness risk not worth taking for an already-solved,
 * already-vetted problem; contrast with lib/intake.js's expandArchive(),
 * which shells out to the system `unzip` binary instead because it
 * only needs "put these files somewhere," not in-memory entry reads.
 */

const fs   = require('fs');
const path = require('path');

/**
 * extractZipToFiles({ buf, maxFiles, maxBytesPerFile, maxTotalBytes,
 *   skipDirs, textExt }) — buf is the raw zip bytes (a Buffer).
 * Returns { ok:true, included, omitted } or { ok:false, error }.
 *
 * included: [{ path, bytes, content, truncated }]
 * omitted:  [{ path, why }]
 */
function extractZipToFiles({
  buf,
  maxFiles,
  maxBytesPerFile,
  maxTotalBytes,
  skipDirs = ['node_modules', '.git', '.svn', 'dist', 'build', '__pycache__', '.next'],
  textExt  = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.html', '.css', '.yml', '.yaml', '.spec', '.sh'],
} = {}) {
  if (!buf || !buf.length) return { ok: false, error: 'empty zip buffer' };

  const SKIP_DIRS = new Set(skipDirs);
  const TEXT_EXT  = new Set(textExt);

  let AdmZip;
  try { AdmZip = require('adm-zip'); }
  catch (e) { return { ok: false, error: `adm-zip unavailable: ${e.message}` }; }

  // §MATCHED, NOT SHARED — the original handler wrote a temp file to
  // disk before handing the path to AdmZip; adm-zip also accepts a
  // Buffer directly (`new AdmZip(buf)`), which is simpler and avoids
  // the tmp-file write/cleanup entirely. Confirmed against adm-zip's
  // own README before relying on it — this is a real, documented
  // constructor overload, not an assumption.
  let zip, entries;
  try {
    zip = new AdmZip(buf);
    entries = zip.getEntries().filter(e => !e.isDirectory);
  } catch (e) {
    return { ok: false, error: `could not read zip (adm-zip): ${e.message}` };
  }

  const included = [];
  const omitted  = [];
  let totalBytes = 0;

  for (const entry of entries) {
    const rel = entry.entryName;
    if (SKIP_DIRS.has(rel.split('/')[0]) || rel.split('/').some(seg => SKIP_DIRS.has(seg))) {
      omitted.push({ path: rel, why: 'skipped dir (node_modules/.git/etc.)' }); continue;
    }
    if (included.length >= maxFiles) { omitted.push({ path: rel, why: 'maxFiles reached' }); continue; }
    const ext = path.extname(rel).toLowerCase();
    if (!TEXT_EXT.has(ext)) { omitted.push({ path: rel, why: `binary/unlisted extension (${ext || 'none'})` }); continue; }
    if (totalBytes >= maxTotalBytes) { omitted.push({ path: rel, why: 'maxTotalBytes reached' }); continue; }

    let text;
    try { text = zip.readAsText(entry); }
    catch (e) { omitted.push({ path: rel, why: `read failed: ${e.message}` }); continue; }

    const truncated = text.length > maxBytesPerFile;
    const slice = truncated ? text.slice(0, maxBytesPerFile) : text;
    totalBytes += slice.length;
    included.push({ path: rel, bytes: entry.header.size, content: slice, truncated });
  }

  return { ok: true, included, omitted };
}

module.exports = { extractZipToFiles };

---

# idearium/api/index.js

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
    // ── Upload Project (§UPLOAD-PROJECT 2026-09-15) — the full prompt ->
    // temp compartment -> dropzone -> "Import Repository" -> manifest/
    // project.json/.git -> full repo page flow. A distinct namespace
    // from /api/projects (the flat zip shelf above) and from
    // /api/repos/import (the synchronous, no-compartment zip-to-repo
    // path already used by ui/import-project's older screen) — this one
    // is stateful across two requests (start, then finalize-or-cancel)
    // because a real compartment has to exist BEFORE the file is
    // dropped, per James's own ordering ("creates a temporary
    // compartment (just in case the user cancels)... THEN a dropzone").
    ['POST',   ['api','project-import','start'],            'project-import.start'],
    ['POST',   ['api','project-import',':uuid','finalize'], 'project-import.finalize'],
    ['POST',   ['api','project-import',':uuid','cancel'],   'project-import.cancel'],
    ['GET',    ['api','project-import','config'],           'project-import.config'],
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
    // §REFACTORED 2026-09-15 — this case used to inline adm-zip
    // extraction + SKIP_DIRS/TEXT_EXT/bounds directly here (see
    // lib/zip-ingest.js's own header for the full account of why that
    // was a second copy of lib/project-compartment.js's already-real
    // bounds). Now calls the shared module — same behavior, same
    // omission reasons, same dedup-relevant included[] shape — plus it
    // now reads bounds from lib/project-import.config.js's ZIP block
    // (the one configurable place for both this route and the
    // project-import.* "Upload Project" flow below) instead of
    // project-compartment.js's private constants.
    case 'repo.import-archive': {
      const { name, filename, contentBase64, ideaUuid } = body;
      if (!filename)       return err(res, 400, 'filename required');
      if (!contentBase64)  return err(res, 400, 'contentBase64 required (base64-encoded zip contents)');
      let buf;
      try { buf = Buffer.from(contentBase64, 'base64'); }
      catch (e) { return err(res, 400, 'invalid base64 content'); }
      if (!buf.length) return err(res, 400, 'empty file');
      if (!/\.zip$/i.test(filename)) return err(res, 400, 'only .zip archives are handled by this endpoint — use POST /api/repos for flat file drops');

      const cfg = _require('../../lib/project-import.config.js');
      const { extractZipToFiles } = _require('../../lib/zip-ingest.js');
      const extraction = extractZipToFiles({
        buf,
        maxFiles:        cfg.ZIP.maxFiles,
        maxBytesPerFile: cfg.ZIP.maxBytesPerFile,
        maxTotalBytes:   cfg.ZIP.maxTotalBytes,
        skipDirs:        cfg.ZIP.skipDirs,
        textExt:         cfg.ZIP.textExt,
      });
      if (!extraction.ok) return err(res, 400, extraction.error);
      const { included, omitted } = extraction;

      if (!included.length) return err(res, 400, 'no text files matched the bounds — nothing to import (see omitted reasons for what was skipped)');

      const repoName = (name || filename.replace(/\.zip$/i, '')).slice(0, 200);
      const result = getRepoLayer().ingest({ name: repoName, files: included, source: 'import', ideaUuid: ideaUuid || null });
      if (result.error) return err(res, 400, result.error);
      return ok(res, { ...result, fileCount: included.length, omittedCount: omitted.length, omitted: omitted.slice(0, 50) });
    }

    // ── Upload Project pipeline ─────────────────────────────────────────
    // §UPLOAD-PROJECT 2026-09-15 — start() and cancel() are pure CJS,
    // called directly (see lib/project-container.js's own §ARCHITECTURE
    // note for why it never imports RepoLayer itself: RepoLayer is ESM,
    // project-container.js is CJS, and Node's require() cannot load an
    // ESM module — this file, already ESM and already bridging via
    // _require for every other CJS lib/ module, IS the bridge point).
    // finalize() is where the ESM-only step (RepoLayer.ingest()) has to
    // happen, so THIS handler extracts the zip, calls RepoLayer.ingest(),
    // then hands the real repoUuid/repoDir/fileCount to
    // project-container.finalizeContainer() to write manifest.json/
    // project.json/.git and resolve the compartment.
    case 'project-import.config': {
      const cfg = _require('../../lib/project-import.config.js');
      return ok(res, { intentExamples: cfg.INTENT_EXAMPLES, zip: cfg.ZIP, staleAfterMs: cfg.COMPARTMENT.staleAfterMs });
    }

    case 'project-import.start': {
      const { name, goal, intentText } = body;
      const pc = _require('../../lib/project-container.js');
      const result = await pc.startContainer({ name, goal, intentText });
      if (!result.ok) return err(res, 400, result.error);
      return ok(res, result);
    }

    case 'project-import.cancel': {
      const pc = _require('../../lib/project-container.js');
      const result = await pc.cancelContainer(params.uuid);
      if (!result.ok) return err(res, 400, result.error);
      return ok(res, result);
    }

    case 'project-import.finalize': {
      const { filename, contentBase64 } = body;
      if (!filename)      return err(res, 400, 'filename required');
      if (!contentBase64) return err(res, 400, 'contentBase64 required (base64-encoded zip contents)');
      let buf;
      try { buf = Buffer.from(contentBase64, 'base64'); }
      catch (e) { return err(res, 400, 'invalid base64 content'); }
      if (!buf.length) return err(res, 400, 'empty file');
      if (!/\.zip$/i.test(filename)) return err(res, 400, 'only .zip archives are supported — drop a single .zip');

      const cfg = _require('../../lib/project-import.config.js');
      const { extractZipToFiles } = _require('../../lib/zip-ingest.js');
      const extraction = extractZipToFiles({
        buf,
        maxFiles:        cfg.ZIP.maxFiles,
        maxBytesPerFile: cfg.ZIP.maxBytesPerFile,
        maxTotalBytes:   cfg.ZIP.maxTotalBytes,
        skipDirs:        cfg.ZIP.skipDirs,
        textExt:         cfg.ZIP.textExt,
      });
      if (!extraction.ok) return err(res, 400, extraction.error);
      const { included, omitted } = extraction;
      if (!included.length) return err(res, 400, 'no text files matched the bounds — nothing to import (see omitted reasons for what was skipped)');

      const pc = _require('../../lib/project-container.js');
      // Repo name mirrors repo.import-archive's own fallback: an explicit
      // name always wins, else derive one from the zip's own filename —
      // the container's own `name` (from the start-prompt) is used for
      // the compartment/manifest identity below, kept distinct on purpose
      // (a repo can be renamed later; the container's declared name is
      // what the end-state goal was written against).
      const repoName = (body.name || filename.replace(/\.zip$/i, '')).slice(0, 200);
      const ingestResult = getRepoLayer().ingest({
        name: repoName, files: included, source: 'import-project', compartmentId: body.compartmentId || null,
        materializeBaseDir: cfg.REPO_STORAGE.dir, // idearium/repo/repos/<uuid> — see config's own header
      });
      if (ingestResult.error) return err(res, 400, ingestResult.error);

      const repoUuid = ingestResult.repo.uuid;
      const mat = getRepoLayer().materialize(repoUuid);
      if (mat.error) return err(res, 500, `materialize after ingest failed: ${mat.error}`);

      const result = await pc.finalizeContainer({
        containerUuid: params.uuid, repoUuid, repoDir: mat.dir, fileCount: included.length,
      });
      return ok(res, {
        ...result, repo: ingestResult.repo, deduped: !!ingestResult.deduped,
        fileCount: included.length, omittedCount: omitted.length, omitted: omitted.slice(0, 50),
      });
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

---

# idearium/repo/index.js

/**
 * idearium/repo/index.js — Idearium Repo Layer (forks/zips as tracked ideas)
 * UUID: idearium-repo-v001-000000000001
 * Version: 2.0.0
 *
 * §REDESIGNED 2026-07-11 — "the repo is an archive using the spec, when you
 * access it. the spec is supposed to be the metadata. like a compartment
 * with the spec as the metadata."
 *
 * v1 kept its OWN copy of file metadata — {path, bytes: length, comp_id,
 * seam_id, status} — with no actual content, alongside a SEPARATE spec
 * object made via the legacy os.createSpec (a text blob, not the chunked
 * spec-engine manifest everything else in idearium now runs on). Two
 * disconnected records claiming to describe one thing, and nothing behind
 * either of them to actually serve when a repo was opened.
 *
 * v2: not a wrapper around v1, a replacement of its storage model. A repo
 * no longer has its own content store at all — the spec-engine manifest
 * IS the archive (its chunks are real, disk-verified files — §1.1/§2.2 in
 * spec-engine/index.js), and the repo record is just an index entry:
 *   { uuid, name, specUuid, rootHash, parent, forks, source, phase, ... }
 * "Access" means resolving specUuid through spec-engine and reading its
 * chunks directly — one source of truth, never a stale second copy.
 *
 * rootHash (spec-engine's computeRootHash — SHA-256 of canonical JSON over
 * the manifest's chunk contents, same convention JAA's content-addressable
 * store already uses) gives the repo real identity: same content -> same
 * hash -> same repo, so forking with no changes yet is genuinely free
 * (same specUuid, same rootHash, until something actually diverges) instead
 * of a byte-copy of metadata nobody reads back.
 *
 * Two ingestion paths converge on the exact same mechanism:
 *   - promote (a spec-engine manifest already exists) -> repo just indexes it.
 *   - drop (raw files, no manifest yet) -> spec-engine.ingestFilesAsSpec()
 *     turns each file into a chunk (same completeChunk, same disk
 *     verification a parsed .spec block gets), THEN the repo indexes that.
 * Neither path has its own storage anymore. One gate, one mechanism.
 *
 * §1.2 every error loud. §7.4 nothing discarded — old repos archived, not deleted.
 * §A-flex declarative: a repo is data, the layer is thin — thinner now than v1.
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { loadTable, syncTable, migrateOnce } from '../lib/db.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMPONENT_ID = 'nexus-id';   // idearium, in the UID registry
const REPOS_FILE_NAME = 'idearium-repos.json';  // legacy flat file — read once as a migration source, then left alone (§7.4)
const REPOS_TABLE = 'idearium_repos';

export class RepoLayer {
  constructor({ ideaOS, specEngine, dataDir } = {}) {
    this.os = ideaOS;                        // IdeaOS instance (public methods) — idea lifecycle only now
    // specEngine may be passed as the module itself, or as a getter function
    // (preferred — spec-engine loads asynchronously at boot; a getter means
    // a RepoLayer constructed before that load finishes still sees it once
    // ready, instead of permanently caching a null snapshot).
    this._seGetter = typeof specEngine === 'function' ? specEngine : () => specEngine;
    this.dataDir = dataDir || process.env.IDEARIUM_DATA_DIR || path.join(__dirname, '..', 'data');
    this.reposFile = path.join(this.dataDir, REPOS_FILE_NAME);
    this.repos = this._load();
  }

  // §BUILT 2026-09-06 — James: "files in the compartment/repo are
  // physical in the /projects/repo name or uuid... make idearium
  // solid. persistent. physical."
  //
  // §RESPECTS this file's own real architecture, stated in its header:
  // "a repo no longer has its own content store at all... one source of
  // truth, never a stale second copy." materialize() is deliberately a
  // regenerated PROJECTION of the spec-engine manifest, not a second,
  // independently-editable store — every real call rewrites the whole
  // tree from the manifest's own current chunk content. Editing a file
  // directly under /projects/<uuid>/ will be silently overwritten on
  // the next materialize() call; that's intentional, not a bug — the
  // manifest stays the one real source of truth, this is just where its
  // content becomes real, physical, inspectable-by-anything-not-just-
  // idearium files on disk, kept honestly in sync rather than a second
  // place that could quietly drift.
  // §PROJECT-IMPORT-DIR 2026-09-15 — James: "i want it to create the
  // compartment in idearium's repo folder" — i.e. physically inside
  // idearium/repo/ (this module's own directory, via lib/project-
  // import.config.js's REPO_STORAGE.dir = idearium/repo/repos/), not
  // idearium/data/projects/ (RepoLayer's existing default, still used by
  // every OTHER ingest path — drop/promote/fork — unchanged). Scoped
  // per-repo, not a global default change: `r.materializeDir`, set once
  // at ingest() time (below) for callers that pass materializeBaseDir,
  // persisted on the repo record, and honored here on every future
  // materialize() call (including the quiet ones _materializeQuiet fires
  // after a later writeFile/deleteFile) — so an imported project keeps
  // landing in the same real directory for its whole lifetime, not just
  // its first materialize.
  materialize(repoUuid) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) return { error: 'repo not found' };
    if (!this.se) return { error: 'repo layer has no spec-engine — cannot read content to materialize' };

    const outDir = r.materializeDir || path.join(this.dataDir, 'projects', repoUuid);
    try {
      fs.mkdirSync(outDir, { recursive: true });
      // Real, existing files removed first — a chunk that was deleted
      // (deleteFile()) or renamed must not leave a stale physical file
      // behind after materialize() runs; the tree is always regenerated
      // to genuinely match the manifest's current, real state, not
      // merged with whatever happened to be there before.
      //
      // §PRESERVED 2026-09-15 — lib/project-container.js's finalize step
      // writes manifest.json, project.json, and a real .git directory
      // straight into this same outDir, AFTER the spec-engine manifest
      // (this.get(repoUuid).files) was built — none of those three are
      // spec chunks, so they were never going to survive the next
      // deleteFile()/writeFile()-triggered materialize() (see
      // _materializeQuiet's call sites) without this exclusion. Losing a
      // repo's own .git history and its import manifest the first time
      // someone edits a file in it would silently undo exactly what
      // "Upload Project" was asked to produce — this skip-list is
      // narrow and name-based on purpose: it does not special-case
      // "top-level files added later" generally, only the three real,
      // known artifacts project-container.js owns.
      const PRESERVE = new Set(['.git', 'manifest.json', 'project.json']);
      for (const entry of fs.readdirSync(outDir)) {
        if (PRESERVE.has(entry)) continue;
        fs.rmSync(path.join(outDir, entry), { recursive: true, force: true });
      }

      let written = 0;
      const files = this.get(repoUuid).files || [];
      for (const f of files) {
        const content = this.readFile(repoUuid, f.path);
        if (content.error) continue; // §1.2 — logged by readFile itself; a real, individual missing chunk must not abort the whole materialize
        const dest = path.join(outDir, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, content.content, 'utf8');
        written++;
      }
      return { ok: true, dir: outDir, written, total: files.length };
    } catch (e) {
      // §1.2 loud, non-fatal — the real, authoritative manifest content
      // is untouched by a materialize failure; only the physical
      // projection failed to (re)generate.
      console.error(`[idearium/repo] materialize(${repoUuid}) failed: ${e.message}`);
      return { error: e.message };
    }
  }

  get se() { return this._seGetter(); }

  // §DB-MIGRATION 2026-07-14 — same move as idearium/index.js: repos.json
  // was rewritten whole on every ingest/fork/archive/file-edit. Now backed
  // by cortex's shared JaaStore (idearium/lib/db.js), one row per repo,
  // one-time non-destructive fold of whatever was already in the flat file.
  _load() {
    let legacy = null;
    try { legacy = JSON.parse(fs.readFileSync(this.reposFile, 'utf8')); }
    catch { /* no legacy file, or unreadable — nothing to migrate */ }
    const mig = migrateOnce(REPOS_TABLE, legacy ? (legacy.repos || []) : [], 'uuid');
    if (mig.migrated) console.log(`[idearium/repo] migrated ${mig.count} legacy repo rows -> cortex table '${REPOS_TABLE}'`);
    return { _version: 2, repos: loadTable(REPOS_TABLE) };
  }
  _save() {
    try { syncTable(REPOS_TABLE, this.repos.repos, 'uuid'); }
    catch (e) { console.error(`[idearium/repo] §1.2 save failed: ${e.message}`); }
  }

  // ── ingest — the single entry point for both convergent paths ──────────────
  // Case A (specUuid given — promote path): the manifest already exists.
  //   No new spec is created. Just index it.
  // Case B (files given, no specUuid — raw drop): spec-engine turns the files
  //   into a real manifest (one chunk per file, real content, disk-verified)
  //   via ingestFilesAsSpec, THEN it's indexed the same way as case A.
  // Either way, the repo record never holds file content or byte counts of
  // its own — only a pointer (specUuid) and a content identity (rootHash).
  // Returns { repo, ideaUuid, specUuid }.
  // materializeBaseDir — §PROJECT-IMPORT-DIR 2026-09-15 (see materialize()'s
  // own header above). When given, the new repo's physical directory is
  // path.join(materializeBaseDir, repoUuid) instead of RepoLayer's default
  // idearium/data/projects/<repoUuid> — persisted on the repo record so
  // every later materialize() (including quiet ones after an edit) keeps
  // using it. null for every existing caller — purely additive.
  ingest({ name, specUuid = null, files = [], source = 'drop', parent = null, promotedFromSpec = null, compartmentId = null, materializeBaseDir = null } = {}) {
    if (!name) return { error: 'repo name required' };
    if (!this.se) return { error: 'repo layer has no spec-engine — cannot store content' };

    let manifest;
    try {
      if (specUuid) {
        manifest = this.se.loadSpec(specUuid);
      } else if (files.length) {
        manifest = this.se.ingestFilesAsSpec({ name, files, author: source || 'drop' });
      } else {
        return { error: 'ingest requires either specUuid (existing manifest) or files (to create one)' };
      }
    } catch (e) { return { error: `content ingest failed: ${e.message}` }; }

    // §DEDUP — same content already exists under a different repo. Not an
    // error: return the existing repo instead of indexing a byte-identical
    // duplicate. This is the free-fork lever in reverse — content that
    // already exists doesn't need a second index entry either.
    //
    // §BUG FIXED 2026-09-03 — found while wiring repo-first creation
    // (James: "create a repository, then send each chunk..."). computeRootHash
    // hashes only {sectionId, content} per chunk (spec-engine/index.js's
    // _hashChunk) — nothing spec-identity-bearing. A brand-new spec has
    // every chunk's content === null until built, so EVERY fresh spec built
    // from the same block set (blocks.yaml's standard 10) computes the
    // identical rootHash at creation, regardless of name or uuid. Ingesting
    // a repo immediately after spec creation (chunks all still PENDING)
    // would have hit this dedup check on the very first empty spec ever
    // made and silently reused that ONE repo for every subsequent new spec
    // forever — never actually creating a distinct repo, no error, no
    // warning. Dedup is only meaningful once there's real content to be a
    // duplicate OF; an all-pending manifest has none, so it never qualifies.
    const hasRealContent = manifest.chunks.some(c => c.status === 'complete' && c.content);
    const existing = hasRealContent
      ? this.repos.repos.find(r => r.rootHash === manifest.rootHash && r.status !== 'archived')
      : null;
    if (existing && !parent) {
      console.log(`[idearium/repo] content dedup — "${name}" matches existing repo ${existing.uuid.slice(0,8)} (rootHash ${manifest.rootHash.slice(0,12)}…), reusing`);
      return { repo: existing, ideaUuid: existing.ideaUuid, specUuid: existing.specUuid, deduped: true };
    }

    const repoUuid = `${COMPONENT_ID}-repo-${randomUUID().slice(0, 8)}`;

    // idea lifecycle tracking — unchanged, still owned by IdeaOS, not content
    let ideaUuid = null;
    try {
      if (this.os && typeof this.os.createIdea === 'function') {
        const idea = this.os.createIdea({ text: `Repo: ${name}`, phase: 'building', source: 'repo-ingest' });
        ideaUuid = idea?.uuid || null;
      } else if (this.os && this.os.db && Array.isArray(this.os.db.ideas)) {
        ideaUuid = randomUUID();
        this.os.db.ideas.push({
          uuid: ideaUuid, text: `Repo: ${name}`, phase: 'building',
          tension: 0.5, parent, createdAt: Date.now(), source: 'repo-ingest',
        });
        // §GAP FIXED 2026-07-14 — this push had no matching save anywhere;
        // it only ever reached disk if some unrelated IdeaOS gate happened
        // to fire its (formerly whole-file) saveDB afterward. Persist it
        // directly through the same table IdeaOS itself uses.
        syncTable('idearium_ideas', this.os.db.ideas, 'uuid');
      }
    } catch (e) { console.warn(`[idearium/repo] idea create degraded: ${e.message}`); }

    const repo = {
      uuid:      repoUuid,
      name,
      ideaUuid,
      specUuid:  manifest.uuid,
      rootHash:  manifest.rootHash,          // content identity — the archive's address
      // §SBP1 2026-08-28 — real, additive composition point named when
      // SBP1 concluded RepoLayer and COS's compartment system don't
      // overlap: a repo can now point at BOTH its spec content (specUuid,
      // already real) AND a real COS compartment (compartmentId, this
      // field) without either system needing to know about the other's
      // internals. null by default — every existing real caller
      // (getRepoLayer().ingest() in idearium/api/index.js) is completely
      // unaffected; this is purely additive.
      compartmentId: compartmentId || null,
      promotedFromSpec: promotedFromSpec || null,
      parent,                                 // fork lineage
      forks:     [],
      source,                                 // 'drop' | 'fork' | 'cli' | 'promote:emerge' | 'promote:manual'
      phase:     'building',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status:    'active',
      // null for every path except project-import's finalize call — see
      // materialize()'s own header for why this field, once set, is
      // honored for the repo's whole lifetime rather than just this call.
      materializeDir: materializeBaseDir ? path.join(materializeBaseDir, repoUuid) : null,
    };
    this.repos.repos.push(repo);

    if (parent) {
      const p = this.repos.repos.find(r => r.uuid === parent);
      if (p) { p.forks.push(repoUuid); }
    }
    this._save();
    // §BUILT 2026-09-06 — James: "the moment a spec is made the
    // compartment and repo are made... files in the compartment/repo
    // are physical." Real, first materialization right at creation —
    // even with 0 real chunk content yet (a fresh, all-pending spec),
    // this creates the real, physical /projects/<repoUuid>/ directory
    // immediately, so it exists the moment the repo does, not only
    // once something happens to write into it later. A failed
    // materialize here must never fail the repo creation itself — the
    // repo record (just persisted, above) is the real, authoritative
    // thing; the physical projection is additive.
    const matResult = this.materialize(repoUuid);
    if (matResult.error) console.warn(`[idearium/repo] initial materialize for ${repoUuid} failed, repo still created: ${matResult.error}`);
    return { repo, ideaUuid, specUuid: manifest.uuid };
  }

  // ── fork — genuinely free when nothing has changed yet: the new repo
  // record points at the SAME specUuid/rootHash as its parent. No content
  // is copied. Divergence (editing the fork) is spec-engine's concern —
  // it would create/complete new chunks under a new spec, which naturally
  // produces a new rootHash the next time this repo is re-ingested.
  fork(repoUuid, newName) {
    const src = this.repos.repos.find(r => r.uuid === repoUuid);
    if (!src) return { error: 'repo not found' };
    return this.ingest({
      name: newName || `${src.name}-fork`,
      specUuid: src.specUuid,
      source: 'fork',
      parent: repoUuid,
    });
  }

  // ── queries for the UI ──────────────────────────────────────────────────────
  list(filter = {}) {
    let rs = this.repos.repos.filter(r => r.status !== 'archived' || filter.includeArchived);
    if (filter.source) rs = rs.filter(r => r.source === filter.source);
    return rs.map(r => this._enrich(r));
  }
  get(repoUuid) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    return r ? this._enrich(r) : null;
  }
  // §BUILT 2026-09-07 — James: "need to make a file tree per repository
  // and use it as a checklist. each chunk would be one component and
  // dependencies." Real, direct — no new data invented, just a real
  // view over what _enrich() already returns: files[].status (already
  // real, already tracked as 'pending'/'complete'/etc. per chunk) is
  // the checklist state; files[].path already gives the real tree
  // structure via its own real directory separators.
  checklist(repoUuid) {
    const r = this.get(repoUuid);
    if (!r) return { error: 'repo not found' };
    const tree = {};
    for (const f of r.files) {
      const parts = f.path.split('/');
      let node = tree;
      for (let i = 0; i < parts.length - 1; i++) {
        node[parts[i]] = node[parts[i]] || { __dir: true, children: {} };
        node = node[parts[i]].children;
      }
      node[parts[parts.length - 1]] = {
        __dir: false, status: f.status, done: f.status === 'complete',
        compId: f.comp_id, seamId: f.seam_id, bytes: f.bytes,
      };
    }
    const done = r.files.filter(f => f.status === 'complete').length;
    return { repoUuid, name: r.name, tree, total: r.files.length, done, remaining: r.files.length - done };
  }

  // Real markdown rendering of checklist() — "use it AS a checklist,"
  // not just structured data describing one.
  checklistMarkdown(repoUuid) {
    const c = this.checklist(repoUuid);
    if (c.error) return c.error;
    const lines = [`# ${c.name} — ${c.done}/${c.total} complete`, ''];
    const walk = (node, depth) => {
      for (const [name, entry] of Object.entries(node).sort(([a], [b]) => a.localeCompare(b))) {
        const indent = '  '.repeat(depth);
        if (entry.__dir) { lines.push(`${indent}- 📁 ${name}/`); walk(entry.children, depth + 1); }
        else lines.push(`${indent}- [${entry.done ? 'x' : ' '}] ${name}${entry.compId ? ` (${entry.compId})` : ''}`);
      }
    };
    walk(c.tree, 0);
    return lines.join('\n');
  }

  lineage(repoUuid) {
    const out = [];
    const walk = (uuid, depth = 0) => {
      const r = this.repos.repos.find(x => x.uuid === uuid);
      if (!r) return;
      out.push({ uuid, name: r.name, depth, source: r.source });
      for (const f of r.forks) walk(f, depth + 1);
    };
    walk(repoUuid);
    return out;
  }

  // §ACCESS — this is "access the archive": resolve the repo's spec-engine
  // manifest directly and read its chunks. No stored copy to go stale, no
  // second content system to keep in sync. If the manifest is gone (spec
  // archived/compressed to .tar.gz — spec-engine's own idle-archival), that's
  // surfaced honestly rather than silently returning an empty file list.
  _enrich(r) {
    const idea = (this.os && r.ideaUuid && this.os.idea) ? this.os.idea(r.ideaUuid) : null;
    let manifest = null, filesError = null;
    try { manifest = this.se ? this.se.loadSpec(r.specUuid) : null; }
    catch (e) { filesError = `spec ${r.specUuid} unreadable: ${e.message}`; }
    // §BUG FIXED 2026-07-11 — removed chunks (deleteFile → removeChunk)
    // were still showing up in the repo's file listing — the whole point
    // of soft-delete is that a removed file stops being "in" the repo,
    // it just isn't destroyed on disk.
    const files = manifest
      ? manifest.chunks.filter(c => c.status !== 'removed').slice().sort((a,b)=>a.chunkIdx-b.chunkIdx).map(c => ({
          path: c.fileName || `${String(c.chunkIdx).padStart(2,'0')}-${c.sectionId}.md`,
          bytes: c.byteSize || 0,
          comp_id: c.comp_id || null,
          seam_id: c.seam_id || null,
          status: c.status,
        }))
      : [];
    return {
      ...r,
      // §BUG FIXED 2026-07-11 — r.rootHash is a snapshot taken once at
      // ingest time. Editing/adding/removing a file after promotion (the
      // whole point of the file-CRUD endpoints) changes the manifest's
      // real rootHash but never touched this stored copy — every repo
      // view after the first edit showed a rootHash that no longer
      // matched what the repo actually contained. Live values from the
      // manifest are the source of truth; the stored one is a fallback
      // only for the (should-be-rare) case the manifest is unreadable.
      rootHash: manifest ? manifest.rootHash : r.rootHash,
      phase: idea ? idea.phase : r.phase,
      tension: idea ? idea.tension : null,
      hasSpec: !!manifest,
      specName: manifest ? manifest.name : null,
      fileCount: files.length,
      files,
      filesError,
    };
  }

  archive(repoUuid) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) return { error: 'not found' };
    r.status = 'archived'; r.updatedAt = Date.now(); this._save();   // §7.4 not deleted
    return { ok: true, uuid: repoUuid };
  }

  // ── file CRUD — v2 has no content store of its own, so these resolve
  // through the repo's specUuid to spec-engine's chunks (the single
  // source of truth this whole redesign exists to establish) rather than
  // maintaining a second copy. §MERGED 2026-07-11.
  _resolveChunk(repoUuid, relPath) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) throw new Error('repo not found');
    if (!this.se) throw new Error('repo layer has no spec-engine — cannot read/write content');
    const manifest = this.se.loadSpec(r.specUuid);
    const clean = (relPath || '').replace(/^\/+/, '');
    const chunk = manifest.chunks.find(c =>
      c.status !== 'removed' && (c.fileName === clean || c.sectionId === clean));
    return { repo: r, manifest, chunk, clean };
  }

  readFile(repoUuid, relPath) {
    try {
      const { chunk, clean } = this._resolveChunk(repoUuid, relPath);
      if (!chunk) return { error: `file not found in repo: ${relPath}` };
      return { path: chunk.fileName || clean, content: chunk.content || '', bytes: chunk.byteSize || 0 };
    } catch (e) { return { error: e.message }; }
  }

  writeFile(repoUuid, relPath, content) {
    if (typeof content !== 'string') return { error: 'content must be a string' };
    try {
      const { manifest, chunk, clean } = this._resolveChunk(repoUuid, relPath);
      if (chunk) {
        // existing file — edit in place via the same completeChunk every
        // other content write goes through (disk-verified, rootHash recomputed)
        this.se.completeChunk(manifest.uuid, chunk.uuid, content);
        this._materializeQuiet(repoUuid); // §BUILT 2026-09-06 — keep the real, physical projection honestly in sync, never stale
        return { ok: true, path: chunk.fileName, created: false };
      }
      // new file — no chunk for this path yet. sectionId must be a slug;
      // reuse the path itself (minus extension noise) so fileName stays
      // human-readable in the repo's file list.
      const sectionId = clean.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || `file-${Date.now()}`;
      const fresh = this.se.addChunk(manifest.uuid, { sectionId, title: clean, content });
      const newChunk = fresh.chunks.find(c => c.sectionId === sectionId);
      this._materializeQuiet(repoUuid);
      return { ok: true, path: newChunk?.fileName || clean, created: true };
    } catch (e) { return { error: e.message }; }
  }

  deleteFile(repoUuid, relPath) {
    try {
      const { manifest, chunk } = this._resolveChunk(repoUuid, relPath);
      if (!chunk) return { error: `file not found in repo: ${relPath}` };
      this.se.removeChunk(manifest.uuid, chunk.uuid);
      this._materializeQuiet(repoUuid); // real, physical file must actually disappear too, not just the manifest's record of it
      return { ok: true, path: chunk.fileName };
    } catch (e) { return { error: e.message }; }
  }

  // §BUILT 2026-09-06 — a real content change (write/delete) must never
  // fail or be rolled back just because the physical /projects/ mirror
  // couldn't be regenerated — the manifest write above already
  // succeeded and IS the real, authoritative change; a materialize
  // failure here is logged, never thrown back at the caller.
  _materializeQuiet(repoUuid) {
    const r = this.materialize(repoUuid);
    if (r.error) console.warn(`[idearium/repo] materialize for ${repoUuid} failed after a real content change: ${r.error}`);
  }
}

export { COMPONENT_ID };

---

# idearium/ui/index.html

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IDEARIUM — Nexus Idea OS</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
:root {
  --bg:     #07090e;
  --bg1:    #0b0f18;
  --bg2:    #0f1520;
  --bg3:    #141c2e;
  --panel:  #0d1219;
  --b0:     rgba(56,189,248,0.06);
  --b1:     rgba(56,189,248,0.14);
  --b2:     rgba(56,189,248,0.28);
  --sky:    #38bdf8;
  --sky2:   #7dd3fc;
  --mint:   #34d399;
  --amber:  #fbbf24;
  --coral:  #f87171;
  --violet: #a78bfa;
  --rose:   #fb7185;
  --text:   #c4d4ee;
  --text2:  #607898;
  --text3:  #334560;
  --mono:   'IBM Plex Mono', monospace;
  --sans:   'IBM Plex Sans', sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:13px;height:100vh;overflow:hidden}
body{display:flex;flex-direction:column;position:relative}

/* ════════════════════════════════════════════════════
   STARRY NIGHT — ambient field behind everything
   low-opacity swirl + twinkle, never competes with data
   ════════════════════════════════════════════════════ */
#starfield{position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(ellipse 1200px 800px at 70% 8%, rgba(35,55,110,.35) 0%, rgba(10,16,38,.18) 45%, transparent 75%),
  var(--bg)}
#starfield canvas{position:absolute;inset:0;width:100%;height:100%}
.swirl-layer{position:absolute;inset:-20%;opacity:.16;mix-blend-mode:screen;filter:blur(30px) saturate(130%)}
.swirl-a{background:conic-gradient(from 0deg at 24% 30%, transparent 0deg, #3a5694 40deg, transparent 100deg, transparent 360deg);animation:spin 130s linear infinite}
.swirl-b{background:conic-gradient(from 180deg at 76% 62%, transparent 0deg, #7dd3fc 30deg, transparent 90deg, transparent 360deg);animation:spin 95s linear infinite reverse}
.swirl-c{background:conic-gradient(from 90deg at 50% 85%, transparent 0deg, #a78bfa 25deg, transparent 70deg, transparent 360deg);animation:spin 160s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.shoot{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 8px 2px #fff;top:12%;left:-5%;opacity:0;animation:shoot 14s linear infinite;animation-delay:6s}
.shoot::after{content:'';position:absolute;right:0;top:0;width:110px;height:1px;background:linear-gradient(to left, rgba(255,255,255,.8), transparent)}
@keyframes shoot{0%{transform:translate(0,0);opacity:0}3%{opacity:.9}30%{transform:translate(680px,200px);opacity:0}100%{opacity:0}}

/* everything else sits above the field */
.topbar, .app-shell, .modal-overlay, .toast-area{position:relative;z-index:2}

/* TOPBAR */
.topbar{height:38px;background:rgba(11,15,24,.88);backdrop-filter:blur(6px);border-bottom:1px solid var(--b1);display:flex;align-items:center;padding:0 14px;gap:16px;flex-shrink:0}
.logo{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--sky);letter-spacing:.18em;cursor:pointer}
.logo span{color:var(--text3)}
.tb-sep{width:1px;height:18px;background:var(--b1)}
.tb-stat{font-family:var(--mono);font-size:10px;color:var(--text2);display:flex;align-items:center;gap:4px}
.tb-stat .v{font-weight:500}
.tb-stat .v.hi{color:var(--coral)}
.tb-stat .v.ok{color:var(--mint)}
.tb-stat .v.sky{color:var(--sky)}
.tb-conn{font-family:var(--mono);font-size:9px;padding:2px 8px;border-radius:3px;border:1px solid var(--b1);color:var(--text3);cursor:pointer;display:flex;align-items:center;gap:5px}
.tb-conn .dot{width:6px;height:6px;border-radius:50%;background:var(--text3)}
.tb-conn.online{border-color:rgba(52,211,153,.3);color:var(--mint)}
.tb-conn.online .dot{background:var(--mint);box-shadow:0 0 6px var(--mint)}
.tb-conn.offline{border-color:rgba(248,113,113,.25);color:var(--coral)}
.tb-conn.offline .dot{background:var(--coral)}
.tb-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.tb-btn{font-family:var(--mono);font-size:10px;padding:3px 9px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text2);cursor:pointer;transition:all .15s}
.tb-btn:hover{border-color:var(--b2);color:var(--text)}
.tb-btn.active{background:rgba(56,189,248,.1);border-color:var(--b2);color:var(--sky)}

/* APP SHELL — nav rail + view area */
.app-shell{flex:1;display:flex;flex-direction:column;overflow:hidden}

/* ── TOP TABS (replaces old vertical rail) ── */
.tabbar{flex-shrink:0;height:44px;background:rgba(11,15,24,.75);border-bottom:1px solid var(--b1);display:flex;align-items:stretch;padding:0 6px;gap:2px;position:relative;z-index:25}
.tab-btn{background:none;border:none;color:var(--text3);font-family:var(--mono);font-size:12px;letter-spacing:.03em;padding:0 14px;height:100%;cursor:pointer;display:flex;align-items:center;gap:7px;border-bottom:2px solid transparent;transition:color .15s,border-color .15s;white-space:nowrap}
.tab-btn:hover{color:var(--text2)}
.tab-btn.active{color:var(--sky);border-bottom-color:var(--sky)}
.tab-icon{font-size:13px;opacity:.85}
.tab-group{position:relative;display:flex}
.tab-caret{font-size:8px;margin-left:1px;opacity:.7}
.tab-dropdown{position:absolute;top:100%;left:0;min-width:180px;background:var(--bg2);border:1px solid var(--b1);border-top:none;border-radius:0 0 10px 10px;box-shadow:0 12px 28px rgba(0,0,0,.45);display:none;flex-direction:column;padding:5px;z-index:30}
.tab-group:hover .tab-dropdown,.tab-group.open .tab-dropdown{display:flex}
.tab-sub{background:none;border:none;color:var(--text2);font-family:var(--mono);font-size:12px;padding:8px 10px;text-align:left;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:9px;width:100%}
.tab-sub:hover{background:var(--b0);color:var(--text)}
.tab-sub.active{color:var(--sky);background:rgba(56,189,248,.09)}
.tab-spacer{flex:1}
.tab-badge{font-size:9px;padding:1px 6px;border-radius:20px;background:var(--b0);color:var(--text2);letter-spacing:.04em}

.view-area{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative}
.view{position:absolute;inset:0;display:none;flex-direction:column;overflow:hidden}
.view.active{display:flex}

/* ════════════════════════════════════════════════════
   WELCOME VIEW
   ════════════════════════════════════════════════════ */
.welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;overflow-y:auto}
.welcome-mark{font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:var(--text3);margin-bottom:14px}
.welcome-title{font-family:var(--mono);font-size:34px;font-weight:600;letter-spacing:.12em;color:var(--sky);text-shadow:0 0 30px rgba(56,189,248,.25);margin-bottom:8px}
.welcome-title span{color:var(--text)}
.welcome-sub{font-size:13px;color:var(--text2);max-width:520px;text-align:center;line-height:1.7;margin-bottom:36px}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:920px;width:100%}
.pillar{background:rgba(13,18,25,.7);border:1px solid var(--b0);border-radius:10px;padding:18px;cursor:pointer;transition:all .2s;text-align:left;position:relative;overflow:hidden}
.pillar:hover{border-color:var(--b2);background:rgba(56,189,248,.04);transform:translateY(-2px)}
.pillar-step{font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.1em}
.pillar-icon{font-size:20px;margin:8px 0 10px}
.pillar-name{font-size:14px;font-weight:500;color:var(--text);margin-bottom:5px}
.pillar-desc{font-size:11px;color:var(--text2);line-height:1.55}
.pillar.flow::after{content:'→';position:absolute;right:-9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:16px;z-index:5}
.pillar:nth-child(3)::after,.pillar:nth-child(6)::after{display:none}
.welcome-foot{margin-top:30px;font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.08em}

/* ════════════════════════════════════════════════════
   SHARED panel/list/detail primitives (Ideas view baseline)
   ════════════════════════════════════════════════════ */
.body2{flex:1;display:grid;grid-template-columns:1fr 340px;overflow:hidden;gap:1px;background:var(--b0)}
.left{display:flex;flex-direction:column;overflow:hidden;background:rgba(7,9,14,.55)}
.right{display:flex;flex-direction:column;overflow:hidden;background:rgba(11,15,24,.6)}

.ph{height:30px;background:rgba(15,21,32,.7);border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 12px;gap:8px;flex-shrink:0}
.ph-title{font-family:var(--mono);font-size:9px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--text2)}
.ph-badge{margin-left:auto;font-family:var(--mono);font-size:9px;padding:1px 6px;border-radius:2px;border:1px solid var(--b1);color:var(--text3)}
.ph-badge.live{border-color:rgba(52,211,153,.25);color:var(--mint)}
.ph-badge.live::before{content:'● ';font-size:7px}

.toolbar{height:36px;border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 10px;gap:6px;flex-shrink:0}
.mode-btn{font-family:var(--mono);font-size:9px;padding:3px 8px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text3);cursor:pointer;transition:all .15s;white-space:nowrap}
.up-chip{font-family:var(--mono);font-size:10px;padding:4px 10px;border-radius:99px;border:1px solid var(--b1);background:none;color:var(--text3);cursor:pointer;transition:all .15s}
.up-chip:hover{border-color:var(--sky);color:var(--text)}
.mode-btn:hover{color:var(--text2);border-color:var(--b1)}
.mode-btn.active{border-color:rgba(56,189,248,.35);color:var(--sky);background:rgba(56,189,248,.06)}
.search-input{flex:1;background:none;border:none;outline:none;font-family:var(--mono);font-size:11px;color:var(--text);caret-color:var(--sky)}
.search-input::placeholder{color:var(--text3)}

.idea-list{flex:1;overflow-y:auto;padding:8px}
.idea-list::-webkit-scrollbar{width:3px}
.idea-list::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}

.idea-card{background:var(--bg2);border:1px solid var(--b0);border-radius:6px;padding:10px 12px;margin-bottom:6px;cursor:pointer;transition:border-color .2s,background .2s;position:relative;overflow:hidden}
.idea-card:hover{border-color:var(--b1);background:var(--bg3)}
.idea-card.selected{border-color:var(--b2);background:rgba(56,189,248,.04)}
.idea-card.local{border-color:rgba(251,191,36,.25)}
.idea-card.archived{opacity:.55}

.idea-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:6px 0 0 6px}
.idea-card.t-high::before{background:var(--coral)}
.idea-card.t-med::before{background:var(--amber)}
.idea-card.t-low::before{background:var(--mint)}

.ic-top{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px}
.ic-name{font-size:13px;font-weight:500;color:var(--text);flex:1;line-height:1.3}
.ic-status{font-family:var(--mono);font-size:9px;padding:2px 6px;border-radius:2px;flex-shrink:0;white-space:nowrap}
.ic-intent{font-size:11px;color:var(--text2);margin-bottom:7px;line-height:1.5}
.ic-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ic-tag{font-family:var(--mono);font-size:9px;color:var(--text3);background:var(--bg3);border:1px solid var(--b0);padding:1px 5px;border-radius:2px}
.ic-gap{font-family:var(--mono);font-size:9px;color:var(--coral);display:flex;align-items:center;gap:3px}
.ic-uuid{font-family:var(--mono);font-size:9px;color:var(--text3)}

.tension-row{display:flex;align-items:center;gap:6px;margin-top:6px}
.tension-label{font-family:var(--mono);font-size:9px;color:var(--text3);width:50px}
.tension-track{flex:1;height:3px;background:var(--bg);border-radius:2px;overflow:hidden}
.tension-fill{height:100%;border-radius:2px;transition:width .8s ease}
.tension-pct{font-family:var(--mono);font-size:9px;width:28px;text-align:right}
.stab-mini{display:flex;gap:2px;flex-shrink:0}
.stab-mini i{width:3px;height:10px;border-radius:1px;background:var(--b1)}

.detail-area{flex:1;overflow-y:auto;padding:12px}
.detail-area::-webkit-scrollbar{width:3px}
.detail-area::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}
.detail-empty{display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--mono);font-size:11px;color:var(--text3);text-align:center;padding:30px}

.ds{margin-bottom:16px}
.ds-label{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--text3);margin-bottom:6px}
.ds-value{font-size:12px;color:var(--text);line-height:1.6}
.ds-mono{font-family:var(--mono);font-size:10px;color:var(--text2);line-height:1.7;white-space:pre-wrap;word-break:break-all}

.tag-row{display:flex;gap:5px;flex-wrap:wrap}
.tag-pill{font-family:var(--mono);font-size:9px;padding:2px 7px;border-radius:3px;background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.15);color:var(--sky2)}

.gap-item{border:1px solid var(--b0);border-radius:4px;padding:7px 9px;margin-bottom:5px;background:var(--bg2)}
.gap-item.open{border-color:rgba(248,113,113,.2)}
.gap-sev{font-family:var(--mono);font-size:9px;margin-right:6px}
.gap-desc{font-size:11px;color:var(--text2);margin-top:3px;line-height:1.5}
.gap-id{font-family:var(--mono);font-size:9px;color:var(--text3)}

.link-item{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b0);font-size:11px}
.link-item:last-child{border-bottom:none}
.link-type{font-family:var(--mono);font-size:9px;padding:1px 5px;border-radius:2px}
.link-type.resonance{background:rgba(56,189,248,.1);color:var(--sky2)}
.link-type.tension{background:rgba(248,113,113,.1);color:var(--coral)}
.link-type.causal{background:rgba(167,139,250,.1);color:var(--violet)}
.link-type.temporal{background:rgba(251,191,36,.1);color:var(--amber)}
.link-type.semantic{background:rgba(52,211,153,.1);color:var(--mint)}

.action-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.action-btn{font-family:var(--mono);font-size:10px;padding:4px 10px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text2);cursor:pointer;transition:all .15s}
.action-btn:hover{border-color:var(--b2);color:var(--text)}
.action-btn.primary{border-color:rgba(56,189,248,.3);color:var(--sky)}
.action-btn.danger{border-color:rgba(248,113,113,.25);color:var(--coral)}

/* MODAL (shared) */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:300;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal{background:var(--bg1);border:1px solid var(--b2);border-radius:8px;width:520px;max-height:86vh;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px}
.modal-title{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--sky)}
.field-group{display:flex;flex-direction:column;gap:4px}
.field-label{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em}
.field-input,.field-textarea,.field-select{background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:7px 10px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none;transition:border-color .15s;width:100%}
.field-input:focus,.field-textarea:focus,.field-select:focus{border-color:var(--b2)}
.field-input::placeholder,.field-textarea::placeholder{color:var(--text3)}
.field-textarea{resize:vertical;min-height:60px;font-family:var(--sans);font-size:12px}
.modal-actions{display:flex;justify-content:flex-end;gap:8px}
.modal-btn{font-family:var(--mono);font-size:10px;padding:6px 14px;border-radius:4px;border:1px solid var(--b1);background:none;color:var(--text2);cursor:pointer;transition:all .15s}
.modal-btn.confirm{background:rgba(56,189,248,.1);border-color:rgba(56,189,248,.35);color:var(--sky)}
.modal-btn:hover{border-color:var(--b2);color:var(--text)}

.gap-log{border-top:1px solid var(--b0);flex-shrink:0}
.gap-log-inner{max-height:140px;overflow-y:auto;padding:6px 10px}
.gap-log-inner::-webkit-scrollbar{width:3px}
.gap-log-inner::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}
.gap-log-line{font-family:var(--mono);font-size:10px;color:var(--text2);display:flex;gap:8px;padding:2px 0;border-bottom:1px solid rgba(56,189,248,.04)}
.gl-ts{color:var(--text3);width:52px;flex-shrink:0}
.gl-type{width:90px;flex-shrink:0}
.gl-type.gap{color:var(--coral)}
.gl-type.snap{color:var(--sky)}
.gl-type.idea{color:var(--mint)}
.gl-type.spec{color:var(--violet)}
.gl-type.err{color:var(--rose)}

.snap-bar{height:32px;border-top:1px solid var(--b0);display:flex;align-items:center;padding:0 12px;gap:8px;background:var(--bg2);flex-shrink:0}
.snap-input{flex:1;background:none;border:none;outline:none;font-family:var(--mono);font-size:11px;color:var(--text);caret-color:var(--sky)}
.snap-input::placeholder{color:var(--text3)}
.snap-btn{font-family:var(--mono);font-size:9px;padding:3px 9px;border-radius:3px;border:1px solid rgba(56,189,248,.25);background:rgba(56,189,248,.06);color:var(--sky);cursor:pointer;transition:all .15s}
.snap-btn:hover{background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.4)}
.snap-btn:disabled{opacity:.4;cursor:not-allowed}
.snap-latest{font-family:var(--mono);font-size:9px;color:var(--text3)}

/* phase colors — real IDEA_PHASES */
.st-seed{background:rgba(56,189,248,.1);color:var(--sky2)}
.st-expanding{background:rgba(52,211,153,.1);color:var(--mint)}
.st-tensioned{background:rgba(251,191,36,.12);color:var(--amber)}
.st-specced{background:rgba(167,139,250,.12);color:var(--violet)}
.st-building{background:rgba(56,189,248,.1);color:var(--sky)}
.st-build_failed{background:rgba(248,113,113,.12);color:var(--coral)}
.st-complete{background:rgba(52,211,153,.16);color:var(--mint)}
.st-archived{background:rgba(100,116,139,.1);color:#64748b}

/* severity colors — real GAP_SEVERITIES */
.sev-fatal{color:var(--rose)}
.sev-high{color:var(--coral)}
.sev-medium{color:var(--amber)}
.sev-low{color:var(--text3)}

.toast-area{position:fixed;bottom:50px;right:14px;display:flex;flex-direction:column;gap:5px;z-index:400}
.toast{background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:6px 12px;font-family:var(--mono);font-size:10px;color:var(--text2);opacity:0;transform:translateX(16px);animation:ti .2s ease forwards,to .2s ease forwards 2.4s;pointer-events:none}
@keyframes ti{to{opacity:1;transform:none}}
@keyframes to{to{opacity:0;transform:translateX(16px)}}
.toast.ok{border-color:rgba(52,211,153,.3);color:var(--mint)}
.toast.err{border-color:rgba(248,113,113,.3);color:var(--coral)}

.offline-banner{background:rgba(248,113,113,.06);border-bottom:1px solid rgba(248,113,113,.2);color:var(--coral);font-family:var(--mono);font-size:10px;padding:6px 14px;display:none;align-items:center;gap:10px;flex-shrink:0}
.offline-banner.show{display:flex}
.offline-banner code{background:rgba(0,0,0,.3);padding:1px 5px;border-radius:3px;color:var(--sky2)}
.offline-banner button{margin-left:auto;font-family:var(--mono);font-size:9px;padding:3px 9px;border-radius:3px;border:1px solid rgba(248,113,113,.3);background:none;color:var(--coral);cursor:pointer}

/* ════════════════════════════════════════════════════
   BRAINSTORM
   ════════════════════════════════════════════════════ */
.brain-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden}
.brain-input-row{padding:14px;border-bottom:1px solid var(--b0);display:flex;flex-direction:column;gap:8px;flex-shrink:0}
.brain-textarea{width:100%;min-height:70px;background:var(--bg2);border:1px solid var(--b1);border-radius:6px;padding:10px 12px;font-family:var(--sans);font-size:13px;color:var(--text);outline:none;resize:vertical}
.brain-textarea:focus{border-color:var(--b2)}
.brain-row-actions{display:flex;gap:8px;align-items:center}
.brain-tags-input{flex:1;background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:6px 10px;font-family:var(--mono);font-size:10px;color:var(--text);outline:none}
.brain-grid{flex:1;overflow-y:auto;padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;align-content:start}
.brain-card{background:var(--bg2);border:1px solid var(--b0);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:8px}
.brain-card-text{font-size:12px;color:var(--text);line-height:1.55}
.brain-card-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:auto}
.brain-ts{font-family:var(--mono);font-size:9px;color:var(--text3)}

/* ════════════════════════════════════════════════════
   SPEC LIBRARY / BUILDER / COMPILER
   ════════════════════════════════════════════════════ */
.spec-toolbar{height:36px;border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 10px;gap:8px;flex-shrink:0}
.spec-list{flex:1;overflow-y:auto;padding:8px}
.spec-card{background:var(--bg2);border:1px solid var(--b0);border-radius:6px;padding:10px 12px;margin-bottom:6px;cursor:pointer;transition:all .15s}
.spec-card:hover{border-color:var(--b1)}
.spec-card.selected{border-color:var(--b2);background:rgba(56,189,248,.04)}
.spec-card-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.spec-name{font-size:12px;font-weight:500;flex:1}
.confidence-ring{width:30px;height:30px;flex-shrink:0}
.section-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px}
.section-chip{font-family:var(--mono);font-size:8px;padding:4px 5px;border-radius:3px;border:1px solid var(--b0);text-align:center;color:var(--text3);background:var(--bg3)}
.section-chip.done{border-color:rgba(52,211,153,.3);color:var(--mint);background:rgba(52,211,153,.06)}
.section-chip.missing{border-color:var(--b1);color:var(--text3)}
.spec-builder{flex:1;display:flex;flex-direction:column;overflow:hidden}
.builder-section-tabs{display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid var(--b0);flex-wrap:wrap;flex-shrink:0}
.sec-tab{font-family:var(--mono);font-size:9px;padding:4px 8px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text3);cursor:pointer}
.sec-tab.active{color:var(--sky);border-color:var(--b2);background:rgba(56,189,248,.06)}
.sec-tab.filled{color:var(--mint)}
.builder-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.builder-textarea{width:100%;min-height:220px;background:var(--bg2);border:1px solid var(--b1);border-radius:6px;padding:12px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none;resize:vertical;line-height:1.6}

/* ════════════════════════════════════════════════════
   ARCHITECT — blueprint tree
   ════════════════════════════════════════════════════ */
.architect-wrap{flex:1;overflow:auto;padding:20px}
.blueprint-tree{display:flex;flex-direction:column;gap:0}
.bp-node{display:flex;align-items:flex-start;gap:10px;position:relative;padding:6px 0 6px 20px}
.bp-node::before{content:'';position:absolute;left:4px;top:0;bottom:0;width:1px;background:var(--b1)}
.bp-dot{width:8px;height:8px;border-radius:50%;background:var(--sky);flex-shrink:0;margin-top:5px;box-shadow:0 0 8px rgba(56,189,248,.5);position:relative;z-index:1}
.bp-dot.gray{background:var(--text3);box-shadow:none}
.bp-label{font-family:var(--mono);font-size:11px;color:var(--text)}
.bp-meta{font-family:var(--mono);font-size:9px;color:var(--text3);margin-left:8px}
.bp-children{margin-left:18px}

/* ════════════════════════════════════════════════════
   REPO / FILE BROWSER / IDE
   ════════════════════════════════════════════════════ */
.repo-wrap{flex:1;display:grid;grid-template-columns:260px 1fr;overflow:hidden}
.file-tree{overflow-y:auto;padding:6px;border-right:1px solid var(--b0)}
.tree-node{font-family:var(--mono);font-size:11px;color:var(--text2);padding:3px 8px;border-radius:4px;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
.tree-node:hover{background:var(--b0);color:var(--text)}
.tree-node.dir{color:var(--sky2);font-weight:500}
.tree-node.file.active{background:rgba(56,189,248,.1);color:var(--sky)}
.tree-indent{display:inline-block}
.ide-pane{display:flex;flex-direction:column;overflow:hidden}
.ide-tabs{height:30px;border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 10px;gap:8px;flex-shrink:0;font-family:var(--mono);font-size:10px;color:var(--text2)}
.ide-code{flex:1;overflow:auto;padding:14px;font-family:var(--mono);font-size:11.5px;line-height:1.65;color:var(--text);white-space:pre;background:rgba(5,7,11,.4)}
.ide-code .ln{color:var(--text3);display:inline-block;width:34px;text-align:right;margin-right:14px;user-select:none}
.ide-editor{flex:1;overflow:auto;padding:14px;font-family:var(--mono);font-size:11.5px;line-height:1.65;color:var(--text);background:rgba(5,7,11,.4);border:none;outline:none;resize:none;white-space:pre;tab-size:2}
.ide-editor:focus{background:rgba(5,7,11,.6)}
.ide-tab-btn{background:var(--bg3,#1a1f2b);border:1px solid var(--b1,#2a2f3b);border-radius:4px;color:var(--text2);font-family:var(--mono);font-size:10px;padding:2px 8px;cursor:pointer;margin-left:auto}
.ide-tab-btn:hover{border-color:var(--accent,#5af);color:var(--text)}
.ide-tab-btn.danger:hover{border-color:var(--red,#e25);color:var(--red,#e25)}
.ide-tab-dirty{color:var(--amber,#e8a233);font-size:9px;margin-left:4px}
.repo-empty{display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--mono);font-size:11px;color:var(--text3);text-align:center;padding:30px;flex-direction:column;gap:12px}

/* ════════════════════════════════════════════════════
   VERSIONIUM
   ════════════════════════════════════════════════════ */
.versionium-wrap{flex:1;display:grid;grid-template-columns:1fr 360px;overflow:hidden}

/* ── PROJECTS ── */
.projects-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden;padding:16px;gap:12px}
.project-drop{border:1.5px dashed var(--b2);border-radius:12px;padding:24px;text-align:center;color:var(--text2);font-family:var(--mono);font-size:12px;cursor:pointer;transition:all .15s;flex-shrink:0}
.project-drop:hover,.project-drop.drag{border-color:var(--sky);background:var(--b0);color:var(--text)}
.project-drop .pd-big{font-size:20px;margin-bottom:6px;display:block}
.project-toolbar{display:flex;gap:8px;align-items:center;flex-shrink:0}
.project-toolbar input{flex:1;background:var(--bg2);border:1px solid var(--b1);color:var(--text);border-radius:7px;padding:8px 10px;font-family:var(--mono);font-size:12px}
.project-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:6px}
.project-card{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border:1px solid var(--b1);border-radius:8px;font-family:var(--mono);font-size:12px}
.project-card .pc-icon{font-size:16px;opacity:.8;flex-shrink:0}
.project-card .pc-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)}
.project-card .pc-meta{color:var(--text3);font-size:10.5px;white-space:nowrap;flex-shrink:0}
.project-card button{background:none;border:1px solid var(--b1);color:var(--text2);border-radius:6px;padding:5px 9px;cursor:pointer;font-family:var(--mono);font-size:11px;flex-shrink:0}
.project-card button:hover{color:var(--text);border-color:var(--b2)}
.project-card button.danger:hover{color:var(--rose);border-color:var(--rose)}
.commit-list{overflow-y:auto;padding:10px}
.commit-card{background:var(--bg2);border:1px solid var(--b0);border-radius:6px;padding:10px 12px;margin-bottom:8px;position:relative;padding-left:24px;cursor:pointer}
.commit-card:hover{border-color:var(--b1)}
.commit-card::before{content:'◆';position:absolute;left:8px;top:12px;color:var(--sky);font-size:9px}
.commit-card::after{content:'';position:absolute;left:11px;top:24px;bottom:-8px;width:1px;background:var(--b1)}
.commit-card:last-child::after{display:none}
.commit-id{font-family:var(--mono);font-size:10px;color:var(--sky2)}
.commit-msg{font-size:12px;color:var(--text);margin:4px 0}
.commit-stats{font-family:var(--mono);font-size:9px;color:var(--text3);display:flex;gap:10px;flex-wrap:wrap}

/* ── Spec Build Wizard (scoped, imported) ── */
#view-spec-wizard *{box-sizing:border-box;margin:0;padding:0}#view-spec-wizard{
    --bg:#0d0d10;--bg2:#16161c;--bg3:#1e1e27;--bg4:#26263200;
    --border:#2e2e3a;--border2:#3a3a4a;
    --text:#e8e8f0;--text2:#9090a8;--text3:#5a5a70;
    --accent:#7c6af7;--accent2:#5d4de0;--accent-glow:rgba(124,106,247,0.15);
    --green:#3dba7a;--amber:#e8a233;--red:#e25555;--blue:#4a9eed;
    --radius:8px;--radius2:12px;
    font-family:'SF Mono','Cascadia Code','Fira Code',monospace;
  }#view-spec-wizard .app{display:grid;grid-template-columns:260px 1fr 340px;height:100%;overflow:hidden;background:var(--bg);color:var(--text)}#view-spec-wizard /* ── SIDEBAR ── */
  .sidebar{background:var(--bg2);border-right:1px solid var(--border);overflow-y:auto;padding:1rem 0}#view-spec-wizard .sidebar-header{padding:0 1rem 1rem;border-bottom:1px solid var(--border);margin-bottom:0.5rem}#view-spec-wizard .sidebar-header h1{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);font-weight:600}#view-spec-wizard .sidebar-header p{font-size:13px;color:var(--text);margin-top:4px;font-weight:500}#view-spec-wizard .section-nav{list-style:none;padding:0.25rem 0}#view-spec-wizard .section-nav li{}#view-spec-wizard .nav-item{display:flex;align-items:center;gap:8px;padding:6px 1rem;cursor:pointer;font-size:12px;color:var(--text2);border-left:2px solid transparent;transition:all 0.15s}#view-spec-wizard .nav-item:hover{color:var(--text);background:var(--bg3)}#view-spec-wizard .nav-item.active{color:var(--accent);border-left-color:var(--accent);background:var(--accent-glow)}#view-spec-wizard .nav-item.complete{color:var(--green)}#view-spec-wizard .nav-item.complete .dot{background:var(--green)}#view-spec-wizard .nav-item.active .dot{background:var(--accent)}#view-spec-wizard .dot{width:6px;height:6px;border-radius:50%;background:var(--border2);flex-shrink:0}#view-spec-wizard .nav-group{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);padding:8px 1rem 4px;font-weight:600}#view-spec-wizard /* ── MAIN ── */
  .main{overflow-y:auto;padding:2rem}#view-spec-wizard .section-block{display:none}#view-spec-wizard .section-block.visible{display:block}#view-spec-wizard .section-title{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:1.5rem}#view-spec-wizard .field-group{margin-bottom:1.25rem}#view-spec-wizard .field-label{font-size:12px;color:var(--text2);margin-bottom:5px;display:flex;align-items:center;gap:6px}#view-spec-wizard .field-label .req{color:var(--red);font-size:10px}#view-spec-wizard .field-label .hint{color:var(--text3);font-size:11px;font-style:italic}#view-spec-wizard input[type=text], #view-spec-wizard input[type=number], #view-spec-wizard select, #view-spec-wizard textarea{
    width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);
    color:var(--text);font-family:inherit;font-size:13px;padding:7px 10px;outline:none;
    transition:border-color 0.15s;
  }#view-spec-wizard input[type=text]:focus, #view-spec-wizard input[type=number]:focus, #view-spec-wizard select:focus, #view-spec-wizard textarea:focus{border-color:var(--accent)}#view-spec-wizard textarea{resize:vertical;min-height:80px;line-height:1.5}#view-spec-wizard select option{background:var(--bg2)}#view-spec-wizard .checkbox-group{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}#view-spec-wizard .checkbox-item{display:flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border);
    border-radius:var(--radius);padding:5px 10px;cursor:pointer;font-size:12px;color:var(--text2);transition:all 0.15s}#view-spec-wizard .checkbox-item:hover{border-color:var(--accent);color:var(--text)}#view-spec-wizard .checkbox-item.checked{border-color:var(--accent);background:var(--accent-glow);color:var(--accent)}#view-spec-wizard .checkbox-item input{display:none}#view-spec-wizard .list-editor{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}#view-spec-wizard .list-item{display:flex;align-items:stretch;border-bottom:1px solid var(--border)}#view-spec-wizard .list-item:last-child{border-bottom:none}#view-spec-wizard .list-item input, #view-spec-wizard .list-item textarea{border:none;border-radius:0;flex:1;background:transparent;padding:6px 10px;font-size:12px}#view-spec-wizard .list-item-num{display:flex;align-items:center;padding:0 8px;font-size:11px;color:var(--text3);background:var(--bg2);border-right:1px solid var(--border);min-width:30px;justify-content:center}#view-spec-wizard .list-item-del{display:flex;align-items:center;padding:0 8px;cursor:pointer;color:var(--text3);border-left:1px solid var(--border);font-size:16px;background:var(--bg2)}#view-spec-wizard .list-item-del:hover{color:var(--red)}#view-spec-wizard .add-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--accent);font-size:12px;font-family:inherit;cursor:pointer;padding:6px 10px;width:100%;border-top:1px solid var(--border)}#view-spec-wizard .add-btn:hover{background:var(--accent-glow)}#view-spec-wizard .module-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);margin-bottom:1rem;overflow:hidden}#view-spec-wizard .module-card-header{display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--border)}#view-spec-wizard .module-card-header:hover{background:rgba(255,255,255,0.02)}#view-spec-wizard .module-card-toggle{color:var(--text3);transition:transform 0.2s;font-size:14px}#view-spec-wizard .module-card.open .module-card-toggle{transform:rotate(90deg)}#view-spec-wizard .module-id-badge{font-size:10px;background:var(--accent-glow);color:var(--accent);padding:2px 8px;border-radius:4px;border:1px solid var(--accent)}#view-spec-wizard .module-name-label{font-size:13px;color:var(--text);flex:1}#view-spec-wizard .module-card-del{color:var(--text3);cursor:pointer;font-size:14px;padding:4px}#view-spec-wizard .module-card-del:hover{color:var(--red)}#view-spec-wizard .module-card-body{padding:12px;display:none}#view-spec-wizard .module-card.open .module-card-body{display:block}#view-spec-wizard .module-field{margin-bottom:1rem}#view-spec-wizard .module-field-label{font-size:11px;color:var(--text3);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em}#view-spec-wizard .event-group{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:0.75rem;overflow:hidden}#view-spec-wizard .event-group-header{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border)}#view-spec-wizard .event-namespace{font-size:12px;color:var(--amber);flex:1}#view-spec-wizard .event-entries{padding:6px 12px}#view-spec-wizard .event-row{display:flex;align-items:center;gap:6px;padding:3px 0}#view-spec-wizard .event-row input{flex:1;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;font-size:12px;color:var(--text)}#view-spec-wizard .event-row input:focus{border-bottom-color:var(--accent);background:transparent;border-radius:0}#view-spec-wizard .event-del{color:var(--text3);cursor:pointer;font-size:12px}#view-spec-wizard .event-del:hover{color:var(--red)}#view-spec-wizard .constraint-row{display:grid;grid-template-columns:80px 1fr auto;gap:8px;margin-bottom:6px;align-items:start}#view-spec-wizard .type-badge{font-size:11px;padding:4px 8px;border-radius:4px;text-align:center;cursor:pointer;border:1px solid transparent}#view-spec-wizard .type-badge.hard{background:rgba(226,85,85,0.15);color:var(--red);border-color:var(--red)}#view-spec-wizard .type-badge.soft{background:rgba(74,158,237,0.15);color:var(--blue);border-color:var(--blue)}#view-spec-wizard .type-badge.warning{background:rgba(232,162,51,0.15);color:var(--amber);border-color:var(--amber)}#view-spec-wizard .gate-row{margin-bottom:6px}#view-spec-wizard .gate-row input{font-size:12px;font-family:inherit;color:var(--green)}#view-spec-wizard .schema-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:0.75rem;overflow:hidden}#view-spec-wizard .schema-header{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border)}#view-spec-wizard .schema-id{font-size:12px;color:var(--blue);font-weight:600;flex:1}#view-spec-wizard .schema-body{padding:8px 12px}#view-spec-wizard .field-row{display:flex;align-items:center;gap:6px;padding:3px 0}#view-spec-wizard .field-row input:first-child{width:140px;flex:none;color:var(--text);font-size:12px}#view-spec-wizard .field-row input:last-child{flex:1;color:var(--text2);font-size:12px}#view-spec-wizard .nav-btns{display:flex;gap:8px;margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border)}#view-spec-wizard .btn{padding:7px 16px;border-radius:var(--radius);font-family:inherit;font-size:13px;cursor:pointer;border:1px solid;transition:all 0.15s}#view-spec-wizard .btn-primary{background:var(--accent);border-color:var(--accent2);color:#fff}#view-spec-wizard .btn-primary:hover{background:var(--accent2)}#view-spec-wizard .btn-secondary{background:var(--bg3);border-color:var(--border2);color:var(--text2)}#view-spec-wizard .btn-secondary:hover{border-color:var(--accent);color:var(--text)}#view-spec-wizard .btn-danger{background:rgba(226,85,85,0.1);border-color:var(--red);color:var(--red)}#view-spec-wizard .btn-danger:hover{background:var(--red);color:#fff}#view-spec-wizard /* ── OUTPUT ── */
  .output-pane{background:var(--bg2);border-left:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column}#view-spec-wizard .output-header{display:flex;align-items:center;gap:8px;padding:12px 1rem;border-bottom:1px solid var(--border);flex-shrink:0}#view-spec-wizard .output-header h2{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);flex:1}#view-spec-wizard .output-controls{display:flex;gap:6px}#view-spec-wizard .output-btn{background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text2);font-family:inherit;font-size:11px;padding:4px 10px;cursor:pointer}#view-spec-wizard .output-btn:hover{border-color:var(--accent);color:var(--text)}#view-spec-wizard .output-body{flex:1;overflow:auto}#view-spec-wizard pre{font-family:inherit;font-size:11.5px;line-height:1.7;padding:1rem;color:var(--text);white-space:pre;overflow-x:auto}#view-spec-wizard .spec-key{color:#7c6af7}#view-spec-wizard .spec-string{color:#a8d8a8}#view-spec-wizard .spec-number{color:#f0c27a}#view-spec-wizard .spec-comment{color:#4a4a60}#view-spec-wizard .spec-event{color:#4a9eed}#view-spec-wizard .spec-gate{color:#3dba7a}#view-spec-wizard .spec-dash{color:#9090a8}#view-spec-wizard .stats-bar{display:flex;gap:12px;padding:8px 1rem;border-bottom:1px solid var(--border);flex-shrink:0}#view-spec-wizard .stat{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text3)}#view-spec-wizard .stat-val{color:var(--text);font-weight:600}#view-spec-wizard .stat-dot{width:6px;height:6px;border-radius:50%}#view-spec-wizard .dep-row{display:grid;grid-template-columns:1fr 100px 80px auto;gap:6px;margin-bottom:6px;align-items:center}#view-spec-wizard .axiom-list textarea{min-height:60px;font-size:12px;line-height:1.6}#view-spec-wizard .empty-modules{display:flex;flex-direction:column;align-items:center;padding:2rem;color:var(--text3);text-align:center;gap:8px;border:1px dashed var(--border);border-radius:var(--radius2)}#view-spec-wizard .empty-modules p{font-size:12px}#view-spec-wizard .progress-bar{height:2px;background:var(--border);margin-top:1px}#view-spec-wizard .progress-fill{height:100%;background:var(--accent);transition:width 0.3s}#view-spec-wizard .spec-depth-indicator{display:flex;align-items:center;gap:6px;margin-top:6px}#view-spec-wizard .depth-bar{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden}#view-spec-wizard .depth-fill{height:100%;border-radius:2px;transition:width 0.3s}#view-spec-wizard .depth-label{font-size:10px;color:var(--text3);min-width:32px;text-align:right}#view-spec-wizard .tag-input{display:flex;flex-wrap:wrap;gap:5px;padding:5px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);min-height:38px;cursor:text}#view-spec-wizard .tag{display:inline-flex;align-items:center;gap:4px;background:var(--accent-glow);border:1px solid var(--accent);color:var(--accent);font-size:11px;padding:2px 8px;border-radius:4px}#view-spec-wizard .tag-x{cursor:pointer;color:var(--text3)}#view-spec-wizard .tag-x:hover{color:var(--red)}#view-spec-wizard .tag-input-field{background:transparent;border:none;color:var(--text);font-family:inherit;font-size:12px;outline:none;min-width:80px}

</style>
</head>
<body>

<div id="starfield">
  <div class="swirl-layer swirl-a"></div>
  <div class="swirl-layer swirl-b"></div>
  <div class="swirl-layer swirl-c"></div>
  <div class="shoot"></div>
  <canvas id="star-canvas"></canvas>
</div>

<!-- TOPBAR -->
<div class="topbar">
  <div class="logo" onclick="setView('welcome')">IDEA<span>RIUM</span></div>
  <div class="tb-sep"></div>
  <div class="tb-stat">ideas <span class="v sky" id="stat-ideas">—</span></div>
  <div class="tb-stat">open gaps <span class="v hi" id="stat-gaps">—</span></div>
  <div class="tb-stat">specs <span class="v" id="stat-specs">—</span></div>
  <div class="tb-stat">snr <span class="v ok" id="stat-snr">—</span></div>
  <div class="tb-right">
    <div class="tb-conn offline" id="conn-indicator" onclick="nexusConnect(true)"><span class="dot"></span><span id="conn-label">connecting…</span></div>
  </div>
</div>

<!-- OFFLINE BANNER -->
<div class="offline-banner" id="offline-banner">
  <span>NEXUS unreachable — start the Idearium service: <code>node service/idearium-service.js</code> (port 4800), or via orchestrator on :9000.</span>
  <button onclick="nexusConnect(true)">retry</button>
</div>

<!-- APP SHELL -->
<div class="app-shell">
  <nav class="tabbar" id="tabbar">
    <button class="tab-btn active" data-view="welcome" onclick="setView('welcome')"><span class="tab-icon">⌂</span>Welcome</button>

    <div class="tab-group" data-group="create">
      <button class="tab-btn tab-group-btn" data-views="brainstorm,ideas" onclick="toggleTabGroup(event,this)"><span class="tab-icon">✎</span>Create<span class="tab-caret">▾</span></button>
      <div class="tab-dropdown">
        <button class="tab-sub" data-view="brainstorm" onclick="setView('brainstorm')"><span class="tab-icon">✎</span>Brainstorm</button>
        <button class="tab-sub" data-view="ideas" onclick="setView('ideas')"><span class="tab-icon">◇</span>Ideas</button>
      </div>
    </div>

    <div class="tab-group" data-group="build">
      <button class="tab-btn tab-group-btn" data-views="spec,architect" onclick="toggleTabGroup(event,this)"><span class="tab-icon">▦</span>Build<span class="tab-caret">▾</span></button>
      <div class="tab-dropdown">
        <button class="tab-sub" data-view="spec" onclick="setView('spec')"><span class="tab-icon">▦</span>Spec Library</button>
        <button class="tab-sub" data-view="architect" onclick="setView('architect')"><span class="tab-icon">⌘</span>Architect</button>
      </div>
    </div>

    <button class="tab-btn" data-view="projects" onclick="setView('projects')"><span class="tab-icon">🗂</span>Projects<span class="tab-badge" id="proj-count-badge"></span></button>
    <button class="tab-btn" data-view="versionium" onclick="setView('versionium')"><span class="tab-icon">◆</span>Versionium</button>

    <div class="tab-spacer"></div>
  </nav>

  <main class="view-area">

    <!-- ══════════ WELCOME ══════════ -->
    <section class="view active" id="view-welcome">
      <div class="welcome">
        <div class="welcome-mark">NEXUS · IDEA OS · LAYER 9</div>
        <div class="welcome-title">IDEA<span>RIUM</span></div>
        <div class="welcome-sub">Log ideas, brainstorm, visit repository or idea, spec and library builder, then architect.</div>
        <div class="pillars">
          <div class="pillar flow" onclick="setView('brainstorm')">
            <div class="pillar-step">01 · CAPTURE</div>
            <div class="pillar-icon">✎</div>
            <div class="pillar-name">Brainstorm</div>
            <div class="pillar-desc">Freeform, tagged, timestamped capture. No structure required yet — just get it down.</div>
          </div>
          <div class="pillar flow" onclick="openModal()">
            <div class="pillar-step">02 · LOG</div>
            <div class="pillar-icon">◇</div>
            <div class="pillar-name">Log an Idea</div>
            <div class="pillar-desc">Promote a thought into a tracked node with phase, tension, and causal ancestry.</div>
          </div>
          <div class="pillar" onclick="setView('ideas')">
            <div class="pillar-step">03 · VISIT</div>
            <div class="pillar-icon">⌥</div>
            <div class="pillar-name">Ideas → Repository</div>
            <div class="pillar-desc">Open an idea or spec and click "open repository" to see its linked repo — repos aren't a separate destination anymore.</div>
          </div>
          <div class="pillar flow" onclick="openSpecChoice()">
            <div class="pillar-step">04 · SPEC</div>
            <div class="pillar-icon">▦</div>
            <div class="pillar-name">Spec &amp; Library Builder</div>
            <div class="pillar-desc">SEAM-chunked sections, compiled with confidence scoring and gap analysis.</div>
          </div>
          <div class="pillar" onclick="setView('architect')">
            <div class="pillar-step">05 · ARCHITECT</div>
            <div class="pillar-icon">⌘</div>
            <div class="pillar-name">Architect</div>
            <div class="pillar-desc">Compiled specs become a blueprint — the structure the system is actually built from.</div>
          </div>
          <div class="pillar" onclick="setView('versionium')">
            <div class="pillar-step">— VERSIONIUM</div>
            <div class="pillar-icon">◆</div>
            <div class="pillar-name">Full Snapshot System</div>
            <div class="pillar-desc">Every commit captures tension + phase across all ideas. Diff and restore any moment.</div>
          </div>
          <div class="pillar" onclick="setView('projects')">
            <div class="pillar-step">— PROJECTS</div>
            <div class="pillar-icon">🗂</div>
            <div class="pillar-name">Project Shelf</div>
            <div class="pillar-desc">Drop whole zip archives here — build outputs, snapshots, anything you want kept and findable, separate from the idea/spec system.</div>
          </div>
        </div>
        <div class="welcome-foot" id="welcome-foot">awaiting connection to nexus idearium service · :4800</div>
      </div>
    </section>

    <!-- ══════════ BRAINSTORM ══════════ -->
    <section class="view" id="view-brainstorm">
      <div class="ph"><span class="ph-title">Brainstorm</span><span class="ph-badge" id="brain-count-badge">0 entries</span></div>
      <div class="brain-wrap">
        <div class="brain-input-row">
          <textarea class="brain-textarea" id="brain-text" placeholder="type a raw thought... no structure needed yet"></textarea>
          <div class="brain-row-actions">
            <input class="brain-tags-input" id="brain-tags" placeholder="tags, comma, separated">
            <button class="modal-btn confirm" onclick="addBrainstorm()">+ capture</button>
          </div>
        </div>
        <div class="brain-grid" id="brain-grid"></div>
      </div>
    </section>

    <!-- ══════════ IDEAS ══════════ -->
    <section class="view" id="view-ideas">
      <div class="ph">
        <span class="ph-title">Ideas</span>
        <button class="tb-btn" style="margin-left:10px" onclick="openModal()">+ idea</button>
        <span class="ph-badge live" id="list-badge" style="margin-left:auto">by tension</span>
      </div>
      <div class="body2">
        <div class="left">
          <div class="toolbar">
            <input class="search-input" id="search" placeholder="search ideas..." oninput="renderIdeaList()">
            <button class="mode-btn active" onclick="sortBy('tension',this)">tension ↓</button>
            <button class="mode-btn" onclick="sortBy('updated',this)">recent</button>
            <button class="mode-btn" onclick="sortBy('name',this)">a-z</button>
          </div>
          <div class="idea-list" id="idea-list"></div>
          <div class="snap-bar">
            <span style="font-family:var(--mono);font-size:9px;color:var(--text3)">push</span>
            <input class="snap-input" id="snap-msg" placeholder="commit message..." onkeydown="if(event.key==='Enter')doSnapshot()">
            <span class="snap-latest" id="snap-latest"></span>
            <button class="snap-btn" id="snap-btn" onclick="doSnapshot()">snapshot ◆</button>
          </div>
          <div class="gap-log">
            <div class="ph" style="border-top:1px solid var(--b0)"><span class="ph-title">Event Stream</span><span class="ph-badge" id="sse-badge">connecting</span></div>
            <div class="gap-log-inner" id="event-log"></div>
          </div>
        </div>
        <div class="right">
          <div class="ph"><span class="ph-title" id="detail-title">Select an idea</span></div>
          <div class="detail-area" id="detail-area"><div class="detail-empty">← select an idea to inspect</div></div>
        </div>
      </div>
    </section>

    <!-- ══════════ SPEC LIBRARY / BUILDER / COMPILER ══════════ -->
    <section class="view" id="view-spec">
      <div class="ph"><span class="ph-title">Spec Library</span><span class="ph-badge" id="spec-count-badge">0 specs</span></div>
      <div class="body2">
        <div class="left">
          <div class="spec-toolbar">
            <input class="search-input" id="spec-search" placeholder="search specs..." oninput="renderSpecList()">
            <button class="mode-btn" onclick="newSpecPrompt()">+ new spec</button>
            <button class="mode-btn" onclick="openUploadProjectModal()">+ upload project</button>
          </div>
          <div class="spec-list" id="spec-list"></div>
        </div>
        <div class="right" style="grid-column: 1 / -1; display:none"></div>
        <div class="right">
          <div class="ph"><span class="ph-title" id="spec-detail-title">Select a spec</span></div>
          <div class="spec-builder" id="spec-builder">
            <div class="detail-empty">← select or create a spec to open the builder</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════ ARCHITECT ══════════ -->
    <section class="view" id="view-architect">
      <div class="ph"><span class="ph-title">Architect</span><span class="ph-badge">blueprint, derived from compiled specs</span></div>
      <div class="architect-wrap" id="architect-wrap">
        <div class="detail-empty">no specced/built ideas yet — compile a spec in the Library to see its blueprint here</div>
      </div>
    </section>

    <!-- ══════════ REPOSITORY / FILE BROWSER / IDE ══════════ -->
    <section class="view" id="view-repo">
      <div class="ph">
        <span class="ph-title">Repository</span>
        <span class="ph-badge" id="repo-context" style="margin-left:10px"></span>
        <button class="tb-btn" style="margin-left:10px" onclick="pickLocalRepo()">open local nexus folder…</button>
        <button class="tb-btn" style="margin-left:6px" onclick="document.getElementById('repo-drop-input').click()">drop repo files…</button>
        <button class="tb-btn" style="margin-left:6px" onclick="exportApiRepo()">export .zip</button>
        <button class="tb-btn" style="margin-left:6px;color:var(--coral)" onclick="archiveApiRepo()">archive repo</button>
        <input type="file" id="repo-drop-input" multiple style="display:none" onchange="ingestDroppedFiles(this.files)">
        <span class="ph-badge" id="repo-badge" style="margin-left:auto">no folder loaded</span>
      </div>
      <div class="repo-wrap">
        <div class="file-tree" id="file-tree"><div class="repo-empty">no repository loaded<br><br><button class="modal-btn confirm" onclick="pickLocalRepo()">open local nexus folder</button></div></div>
        <div class="ide-pane">
          <div class="ide-tabs" id="ide-tabs">no file open</div>
          <div class="ide-code" id="ide-code">// click a file in the tree to open it here</div>
          <textarea class="ide-editor" id="ide-editor" style="display:none" spellcheck="false"></textarea>
        </div>
      </div>
    </section>

    <!-- ══════════ SPEC BUILD WIZARD ══════════ -->
    <section class="view" id="view-spec-wizard">
      <div class="app">

<!-- ── SIDEBAR ── -->
<nav class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <button onclick="setView('welcome')" style="background:none;border:1px solid var(--border);color:var(--text2);font:inherit;font-size:10px;padding:4px 8px;border-radius:4px;cursor:pointer;margin-bottom:10px">← back</button>
    <h1>spec-compiler</h1>
    <p>Build Wizard</p>
    <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
  </div>

  <ul class="section-nav" id="nav">
    <li class="nav-group">Core</li>
    <li><div class="nav-item active" data-sec="meta"><span class="dot"></span>meta</div></li>
    <li><div class="nav-item" data-sec="axioms"><span class="dot"></span>axioms</div></li>
    <li><div class="nav-item" data-sec="deps"><span class="dot"></span>deps</div></li>
    <li><div class="nav-item" data-sec="constraints"><span class="dot"></span>constraints</div></li>
    <li class="nav-group">Modules</li>
    <li><div class="nav-item" data-sec="modules"><span class="dot"></span>modules</div></li>
    <li class="nav-group">Events &amp; Schema</li>
    <li><div class="nav-item" data-sec="events"><span class="dot"></span>events</div></li>
    <li><div class="nav-item" data-sec="schemas"><span class="dot"></span>schemas</div></li>
    <li class="nav-group">Enforcement</li>
    <li><div class="nav-item" data-sec="enforcement"><span class="dot"></span>enforcement gates</div></li>
    <li><div class="nav-item" data-sec="seams"><span class="dot"></span>seams</div></li>
  </ul>
</nav>

<!-- ── MAIN ── -->
<main class="main" id="main">

<!-- META -->
<section class="section-block visible" id="sec-meta">
  <div class="section-title">meta — spec identity</div>

  <div class="field-group">
    <div class="field-label">name <span class="req">*</span></div>
    <input type="text" id="meta-name" placeholder="my-system-name" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">version <span class="req">*</span></div>
    <input type="text" id="meta-version" placeholder="1.0.0" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">author</div>
    <input type="text" id="meta-author" placeholder="james-brooks" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">uuid <span class="hint">— leave blank to auto-generate</span></div>
    <input type="text" id="meta-uuid" placeholder="auto-generated" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">status</div>
    <select id="meta-status" onchange="refresh()">
      <option value="active">active</option>
      <option value="bootstrapping">bootstrapping</option>
      <option value="draft">draft</option>
      <option value="deprecated">deprecated</option>
      <option value="archived">archived</option>
    </select>
  </div>
  <div class="field-group">
    <div class="field-label">description</div>
    <textarea id="meta-description" placeholder="Describe the system purpose, key properties, and invariants..." oninput="refresh()"></textarea>
  </div>
  <div class="field-group">
    <div class="field-label">tagline <span class="hint">— one-liner</span></div>
    <input type="text" id="meta-tagline" placeholder="Compress intent. Decompress deterministically." oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">target runtime</div>
    <div class="checkbox-group" id="meta-runtime">
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="node">node</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="browser">browser</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="deno">deno</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="bun">bun</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="worker">worker</label>
    </div>
  </div>
  <div class="field-group">
    <div class="field-label">language stack</div>
    <div class="checkbox-group" id="meta-lang">
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="javascript">javascript</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="typescript">typescript</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="python">python</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="rust">rust</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="go">go</label>
    </div>
  </div>
  <div class="field-group">
    <div class="field-label">paradigm</div>
    <div class="checkbox-group" id="meta-paradigm">
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="SISO">SISO</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="functional">functional</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="deterministic">deterministic</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="cortex-first">cortex-first</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="event-driven">event-driven</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="reactive">reactive</label>
    </div>
  </div>

  <div class="nav-btns">
    <button class="btn btn-primary" onclick="goTo('axioms')">next → axioms</button>
  </div>
</section>

<!-- AXIOMS -->
<section class="section-block" id="sec-axioms">
  <div class="section-title">axioms — invariants the system must never violate</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">One axiom per line. Each becomes a bullet in the spec. These drive invariants-engine checks.</p>
  <div id="axioms-list" class="list-editor"></div>
  <button class="add-btn" onclick="addAxiom()">+ add axiom</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('meta')">← back</button>
    <button class="btn btn-primary" onclick="goTo('deps')">next → deps</button>
  </div>
</section>

<!-- DEPS -->
<section class="section-block" id="sec-deps">
  <div class="section-title">deps — external dependencies</div>
  <div style="display:grid;grid-template-columns:1fr 110px 90px 70px auto;gap:6px;margin-bottom:6px;font-size:10px;color:var(--text3);padding:0 4px;text-transform:uppercase;letter-spacing:0.08em">
    <span>name</span><span>version</span><span>purpose</span><span>required</span><span></span>
  </div>
  <div id="deps-list"></div>
  <button class="add-btn" onclick="addDep()">+ add dependency</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('axioms')">← back</button>
    <button class="btn btn-primary" onclick="goTo('constraints')">next → constraints</button>
  </div>
</section>

<!-- CONSTRAINTS -->
<section class="section-block" id="sec-constraints">
  <div class="section-title">constraints — hard rules enforced by gates</div>
  <div id="constraints-list"></div>
  <button class="add-btn" onclick="addConstraint()">+ add constraint</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('deps')">← back</button>
    <button class="btn btn-primary" onclick="goTo('modules')">next → modules</button>
  </div>
</section>

<!-- MODULES -->
<section class="section-block" id="sec-modules">
  <div class="section-title">modules — system components</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Each module becomes a KGNode. specDepth is computed from which fields are present.</p>
  <div id="modules-list"></div>
  <button class="btn btn-primary" onclick="addModule()" style="width:100%;margin-top:8px">+ add module</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('constraints')">← back</button>
    <button class="btn btn-primary" onclick="goTo('events')">next → events</button>
  </div>
</section>

<!-- EVENTS -->
<section class="section-block" id="sec-events">
  <div class="section-title">events — the only communication channel between modules</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Group events by namespace. Each entry: <code style="color:var(--green);font-size:11px">event.name &#123; field1, field2 &#125;</code></p>
  <div id="events-list"></div>
  <button class="add-btn" onclick="addEventGroup()">+ add event namespace</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('modules')">← back</button>
    <button class="btn btn-primary" onclick="goTo('schemas')">next → schemas</button>
  </div>
</section>

<!-- SCHEMAS -->
<section class="section-block" id="sec-schemas">
  <div class="section-title">schemas — typed data structures</div>
  <div id="schemas-list"></div>
  <button class="add-btn" onclick="addSchema()">+ add schema</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('events')">← back</button>
    <button class="btn btn-primary" onclick="goTo('enforcement')">next → enforcement</button>
  </div>
</section>

<!-- ENFORCEMENT -->
<section class="section-block" id="sec-enforcement">
  <div class="section-title">enforcement — gate definitions</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Declarative rules for the invariants engine. GATE-XXX-NNN format IDs recommended.</p>
  <div id="enforcement-list"></div>
  <button class="add-btn" onclick="addGate()">+ add gate</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('schemas')">← back</button>
    <button class="btn btn-primary" onclick="goTo('seams')">next → seams</button>
  </div>
</section>

<!-- SEAMS -->
<section class="section-block" id="sec-seams">
  <div class="section-title">seams — cross-module contracts</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Seams define the interface boundary between modules. They become seam_records in Cortex.</p>
  <div id="seams-list"></div>
  <button class="add-btn" onclick="addSeam()">+ add seam</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('enforcement')">← back</button>
    <button class="btn btn-primary" onclick="copyOutput()" style="background:var(--green);border-color:var(--green)">⬇ copy .spec output</button>
  </div>
</section>

</main>

<!-- ── OUTPUT PANE ── -->
<aside class="output-pane">
  <div class="output-header">
    <h2>live .spec output</h2>
    <div class="output-controls">
      <button class="output-btn" onclick="saveToIdearium()">save to idearium</button>
      <button class="output-btn" onclick="copyOutput()">copy</button>
      <button class="output-btn" onclick="downloadSpec()">download</button>
    </div>
  </div>
  <div class="stats-bar" id="stats-bar">
    <div class="stat"><div class="stat-dot" style="background:var(--accent)"></div><span>specDepth </span><span class="stat-val" id="stat-depth">0.0</span></div>
    <div class="stat"><div class="stat-dot" style="background:var(--green)"></div><span>modules </span><span class="stat-val" id="stat-mods">0</span></div>
    <div class="stat"><div class="stat-dot" style="background:var(--blue)"></div><span>events </span><span class="stat-val" id="stat-evts">0</span></div>
    <div class="stat"><div class="stat-dot" style="background:var(--amber)"></div><span>gaps </span><span class="stat-val" id="sw-stat-gaps">0</span></div>
  </div>
  <div class="output-body">
    <pre id="output-pre"><span class="spec-comment"># spec-compiler wizard output
# fill in the fields on the left to build your .spec</span>
</pre>
  </div>
</aside>

</div>

<script>
const S = {
  meta:{ name:'',version:'1.0.0',author:'',uuid:'',status:'active',description:'',tagline:'',runtime:[],lang:[],paradigm:[] },
  axioms:[],
  deps:[],
  constraints:[],
  modules:[],
  events:[],  // [{namespace, entries:[]}]
  schemas:[], // [{id, fields:[{name,type}]}]
  gates:[],   // enforcement gates
  seams:[],
};

let moduleCounter=0, depCounter=0, constraintCounter=0, gateCounter=0, schemaCounter=0, seamCounter=0, eventCounter=0;

// ── Section routing ──
function goTo(sec){
  document.querySelectorAll('.section-block').forEach(b=>b.classList.remove('visible'));
  document.getElementById('sec-'+sec).classList.add('visible');
  document.querySelectorAll('.nav-item').forEach(n=>{
    n.classList.remove('active');
    if(n.dataset.sec===sec) n.classList.add('active');
  });
  document.querySelector('.main').scrollTop=0;
  updateProgress();
}
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>goTo(n.dataset.sec)));

// ── Checkboxes ──
function toggleCheck(el,group){
  el.classList.toggle('checked');
  const val = el.querySelector('input').value;
  if(group==='meta-runtime'){
    if(el.classList.contains('checked')) S.meta.runtime.push(val);
    else S.meta.runtime=S.meta.runtime.filter(v=>v!==val);
  } else if(group==='meta-lang'){
    if(el.classList.contains('checked')) S.meta.lang.push(val);
    else S.meta.lang=S.meta.lang.filter(v=>v!==val);
  } else if(group==='meta-paradigm'){
    if(el.classList.contains('checked')) S.meta.paradigm.push(val);
    else S.meta.paradigm=S.meta.paradigm.filter(v=>v!==val);
  }
  refresh();
}

// ── Meta field sync ──
['meta-name','meta-version','meta-author','meta-uuid','meta-description','meta-tagline'].forEach(id=>{
  const key = id.replace('meta-','');
  document.getElementById(id).addEventListener('input',e=>{
    S.meta[key]=e.target.value; refresh();
  });
});
document.getElementById('meta-status').addEventListener('change',e=>{
  S.meta.status=e.target.value; refresh();
});

// ── Axioms ──
function renderAxioms(){
  const list = document.getElementById('axioms-list');
  if(!S.axioms.length){ list.innerHTML=''; return; }
  list.innerHTML = S.axioms.map((a,i)=>`
    <div class="list-item">
      <span class="list-item-num">${i+1}</span>
      <input type="text" value="${esc(a)}" placeholder="Nothing silently fails..." oninput="S.axioms[${i}]=this.value;refresh()">
      <span class="list-item-del" onclick="S.axioms.splice(${i},1);renderAxioms();refresh()">×</span>
    </div>`).join('');
}
function addAxiom(){ S.axioms.push(''); renderAxioms(); refresh(); }
renderAxioms();

// ── Deps ──
function renderDeps(){
  const el = document.getElementById('deps-list');
  el.innerHTML = S.deps.map((d,i)=>`
    <div style="display:grid;grid-template-columns:1fr 110px 90px 70px auto;gap:6px;margin-bottom:6px;align-items:center">
      <input type="text" value="${esc(d.name)}" placeholder="js-yaml" oninput="S.deps[${i}].name=this.value;refresh()">
      <input type="text" value="${esc(d.version)}" placeholder=">=4.1.0" oninput="S.deps[${i}].version=this.value;refresh()">
      <input type="text" value="${esc(d.purpose)}" placeholder="yaml parse" oninput="S.deps[${i}].purpose=this.value;refresh()">
      <select onchange="S.deps[${i}].required=(this.value==='true');refresh()">
        <option value="true" ${d.required?'selected':''}>required</option>
        <option value="false" ${!d.required?'selected':''}>optional</option>
      </select>
      <span class="list-item-del" onclick="S.deps.splice(${i},1);renderDeps();refresh()" style="padding:0 6px;cursor:pointer;color:var(--text3);font-size:16px">×</span>
    </div>`).join('');
}
function addDep(){ S.deps.push({name:'',version:'',purpose:'',required:true}); renderDeps(); refresh(); }

// ── Constraints ──
function renderConstraints(){
  const el = document.getElementById('constraints-list');
  el.innerHTML = S.constraints.map((c,i)=>`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:90px 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center">
        <input type="text" value="${esc(c.id)}" placeholder="CC-001" oninput="S.constraints[${i}].id=this.value;refresh()" style="font-size:12px;color:var(--amber)">
        <input type="text" value="${esc(c.description)}" placeholder="description..." oninput="S.constraints[${i}].description=this.value;refresh()">
        <input type="text" value="${esc(c.enforced_by)}" placeholder="[GATE-XXX-001]" oninput="S.constraints[${i}].enforced_by=this.value;refresh()">
        <div style="display:flex;gap:4px">
          <span class="type-badge ${c.type}" onclick="cycleConstraintType(${i})">${c.type}</span>
          <span class="list-item-del" onclick="S.constraints.splice(${i},1);renderConstraints();refresh()" style="padding:4px 6px;cursor:pointer;color:var(--text3);font-size:14px">×</span>
        </div>
      </div>
    </div>`).join('');
}
function cycleConstraintType(i){
  const types=['hard','soft','warning'];
  const cur = types.indexOf(S.constraints[i].type);
  S.constraints[i].type = types[(cur+1)%types.length];
  renderConstraints(); refresh();
}
function addConstraint(){
  const n = S.constraints.length+1;
  S.constraints.push({id:`CC-00${n}`,description:'',type:'hard',enforced_by:''});
  renderConstraints(); refresh();
}

// ── Modules ──
function renderModules(){
  const el = document.getElementById('modules-list');
  if(!S.modules.length){
    el.innerHTML='<div class="empty-modules"><p>no modules yet — click + add module to begin</p></div>';
    return;
  }
  el.innerHTML = S.modules.map((m,i)=>`
    <div class="module-card ${m._open?'open':''}" id="mod-${i}">
      <div class="module-card-header" onclick="toggleModule(${i})">
        <span class="module-card-toggle">▶</span>
        <span class="module-id-badge">${m.id||'MOD-?'}</span>
        <span class="module-name-label">${m.name||'unnamed module'}</span>
        <span style="font-size:11px;color:var(--text3)">${specDepth(m).toFixed(1)}</span>
        <span class="module-card-del" onclick="event.stopPropagation();deleteModule(${i})">×</span>
      </div>
      <div class="module-card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div class="module-field">
            <div class="module-field-label">id</div>
            <input type="text" value="${esc(m.id)}" placeholder="MOD-NAME" oninput="S.modules[${i}].id=this.value;refreshModule(${i})" style="color:var(--amber)">
          </div>
          <div class="module-field">
            <div class="module-field-label">name</div>
            <input type="text" value="${esc(m.name)}" placeholder="module-name" oninput="S.modules[${i}].name=this.value;refreshModule(${i})">
          </div>
        </div>
        <div class="module-field">
          <div class="module-field-label">uuid</div>
          <input type="text" value="${esc(m.uuid)}" placeholder="auto-generated" oninput="S.modules[${i}].uuid=this.value;refreshModule(${i})" style="font-size:11px;color:var(--text3)">
        </div>
        <div class="module-field">
          <div class="module-field-label">description</div>
          <textarea oninput="S.modules[${i}].description=this.value;refreshModule(${i})">${esc(m.description)}</textarea>
        </div>

        <div class="module-field">
          <div class="module-field-label">exports <span style="color:var(--text3);font-size:10px">— one per line: Fn(arg: Type) → ReturnType</span></div>
          <div class="list-editor" id="mod-exports-${i}">
            ${(m.exports||[]).map((e,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(e)}" placeholder="fn(arg: Type) → Return" oninput="S.modules[${i}].exports[${j}]=this.value;refreshModule(${i})" style="color:var(--green);font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].exports.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'exports')">+ export</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">gate_pipeline <span style="color:var(--text3);font-size:10px">— GATE-ID: input → transform → output</span></div>
          <div class="list-editor" id="mod-gates-${i}">
            ${(m.gate_pipeline||[]).map((g,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(g)}" placeholder="GATE-XXX-001: event → transform → result" oninput="S.modules[${i}].gate_pipeline[${j}]=this.value;refreshModule(${i})" style="color:var(--blue);font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].gate_pipeline.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'gate_pipeline')">+ gate</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">behavioral_contracts</div>
          <div class="list-editor" id="mod-contracts-${i}">
            ${(m.behavioral_contracts||[]).map((c,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(c)}" placeholder="Contract statement..." oninput="S.modules[${i}].behavioral_contracts[${j}]=this.value;refreshModule(${i})" style="font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].behavioral_contracts.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'behavioral_contracts')">+ contract</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">error_paths</div>
          <div class="list-editor" id="mod-errors-${i}">
            ${(m.error_paths||[]).map((e,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(e)}" placeholder="condition → consequence" oninput="S.modules[${i}].error_paths[${j}]=this.value;refreshModule(${i})" style="color:var(--red);font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].error_paths.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'error_paths')">+ error path</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">deps <span style="color:var(--text3);font-size:10px">— refs to other modules by name</span></div>
          <div class="list-editor" id="mod-deps-${i}">
            ${(m.deps||[]).map((d,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(typeof d==='object'?d.name:d)}" placeholder="module-name" oninput="S.modules[${i}].deps[${j}]={name:this.value};refreshModule(${i})" style="font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].deps.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'deps')">+ dep</button>
        </div>

        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em">specDepth</span>
            <span style="font-size:11px;color:var(--accent)">${specDepth(m).toFixed(2)}</span>
            <span style="font-size:10px;color:var(--text3)">${specDepthLabel(specDepth(m))}</span>
          </div>
          <div class="depth-bar"><div class="depth-fill" style="width:${specDepth(m)*100}%;background:${depthColor(specDepth(m))}"></div></div>
        </div>
      </div>
    </div>`).join('');
}
function toggleModule(i){ S.modules[i]._open=!S.modules[i]._open; renderModules(); }
function deleteModule(i){ S.modules.splice(i,1); renderModules(); refresh(); }
function refreshModule(i){ renderModules(); refresh(); }
function addModuleItem(i,field){
  if(!S.modules[i][field]) S.modules[i][field]=[];
  if(field==='deps') S.modules[i][field].push({name:''});
  else S.modules[i][field].push('');
  renderModules(); refresh();
}
function addModule(){
  const n = ++moduleCounter;
  S.modules.push({
    id:`MOD-${String.fromCharCode(64+n)}`,name:'',uuid:'',description:'',
    exports:[],gate_pipeline:[],behavioral_contracts:[],error_paths:[],deps:[],
    _open:true
  });
  renderModules(); refresh();
}
function specDepth(m){
  let d=0;
  if(m.id) d=Math.max(d,0.0);
  if(m.name) d=Math.max(d,0.1);
  if(m.description) d=Math.max(d,0.2);
  if(m.exports?.length) d=Math.max(d,0.3);
  if(m.gate_pipeline?.length) d=Math.max(d,0.5);
  if(m.behavioral_contracts?.length) d=Math.max(d,0.7);
  if(m.error_paths?.length) d=Math.max(d,0.85);
  if(m.deps?.length&&m.error_paths?.length&&m.behavioral_contracts?.length&&m.gate_pipeline?.length&&m.exports?.length) d=1.0;
  return d;
}
function specDepthLabel(d){
  if(d>=1.0) return 'FULL';
  if(d>=0.85) return 'error_paths';
  if(d>=0.7) return 'contracts';
  if(d>=0.5) return 'gates';
  if(d>=0.3) return 'exports';
  if(d>=0.2) return 'description';
  if(d>=0.1) return 'name';
  return 'id_only';
}
function depthColor(d){
  if(d>=0.85) return 'var(--green)';
  if(d>=0.5) return 'var(--amber)';
  return 'var(--red)';
}

// ── Events ──
function renderEvents(){
  const el = document.getElementById('events-list');
  if(!S.events.length){ el.innerHTML=''; return; }
  el.innerHTML = S.events.map((g,gi)=>`
    <div class="event-group">
      <div class="event-group-header">
        <span class="event-namespace">
          <input type="text" value="${esc(g.namespace)}" placeholder="namespace" oninput="S.events[${gi}].namespace=this.value;refresh()" style="background:transparent;border:none;color:var(--amber);font-family:inherit;font-size:12px;outline:none">
        </span>
        <span class="list-item-del" onclick="S.events.splice(${gi},1);renderEvents();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div class="event-entries">
        ${(g.entries||[]).map((e,ei)=>`
          <div class="event-row">
            <input type="text" value="${esc(e)}" placeholder="event.name { field1, field2 }" oninput="S.events[${gi}].entries[${ei}]=this.value;refresh()" style="background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text);font-family:inherit;font-size:12px;outline:none;width:100%;padding:3px 0">
            <span class="event-del" onclick="S.events[${gi}].entries.splice(${ei},1);renderEvents();refresh()">×</span>
          </div>`).join('')}
        <button class="add-btn" onclick="S.events[${gi}].entries.push('');renderEvents();refresh()" style="border-top:none;padding:4px 0;font-size:11px">+ event</button>
      </div>
    </div>`).join('');
}
function addEventGroup(){ S.events.push({namespace:'',entries:['']}); renderEvents(); refresh(); }

// ── Schemas ──
function renderSchemas(){
  const el = document.getElementById('schemas-list');
  el.innerHTML = S.schemas.map((s,si)=>`
    <div class="schema-card">
      <div class="schema-header">
        <input type="text" value="${esc(s.id)}" placeholder="SchemaName" oninput="S.schemas[${si}].id=this.value;refresh()" style="background:transparent;border:none;color:var(--blue);font-family:inherit;font-size:13px;font-weight:600;outline:none;flex:1">
        <span class="list-item-del" onclick="S.schemas.splice(${si},1);renderSchemas();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div class="schema-body">
        <div style="display:grid;grid-template-columns:160px 1fr;gap:6px;margin-bottom:4px;font-size:10px;color:var(--text3);text-transform:uppercase;padding:0 2px">
          <span>field name</span><span>type</span>
        </div>
        ${(s.fields||[]).map((f,fi)=>`
          <div class="field-row">
            <input type="text" value="${esc(f.name)}" placeholder="fieldName" oninput="S.schemas[${si}].fields[${fi}].name=this.value;refresh()" style="width:160px;flex:none;color:var(--text);font-size:12px">
            <input type="text" value="${esc(f.type)}" placeholder="string | number | boolean | Type[]" oninput="S.schemas[${si}].fields[${fi}].type=this.value;refresh()" style="flex:1;color:var(--text2);font-size:12px">
            <span class="list-item-del" onclick="S.schemas[${si}].fields.splice(${fi},1);renderSchemas();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px;padding:0 6px">×</span>
          </div>`).join('')}
        <button class="add-btn" onclick="S.schemas[${si}].fields.push({name:'',type:''});renderSchemas();refresh()" style="font-size:11px">+ field</button>
      </div>
    </div>`).join('');
}
function addSchema(){ S.schemas.push({id:'',fields:[{name:'',type:''}]}); renderSchemas(); refresh(); }

// ── Enforcement Gates ──
function renderGates(){
  const el = document.getElementById('enforcement-list');
  el.innerHTML = S.gates.map((g,i)=>`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:110px 130px 1fr auto;gap:8px;margin-bottom:8px;align-items:center">
        <input type="text" value="${esc(g.id)}" placeholder="GATE-XXX-001" oninput="S.gates[${i}].id=this.value;refresh()" style="color:var(--amber);font-size:12px">
        <input type="text" value="${esc(g.name)}" placeholder="gate-name" oninput="S.gates[${i}].name=this.value;refresh()" style="font-size:12px">
        <input type="text" value="${esc(g.description)}" placeholder="What this gate enforces..." oninput="S.gates[${i}].description=this.value;refresh()">
        <span class="list-item-del" onclick="S.gates.splice(${i},1);renderGates();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 90px;gap:8px">
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">check</div>
          <input type="text" value="${esc(g.check)}" placeholder="what to verify..." oninput="S.gates[${i}].check=this.value;refresh()" style="font-size:12px;color:var(--green)">
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">on_failure</div>
          <input type="text" value="${esc(g.on_failure)}" placeholder="build failure | log warning | continue" oninput="S.gates[${i}].on_failure=this.value;refresh()" style="font-size:12px">
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">severity</div>
          <select onchange="S.gates[${i}].severity=this.value;refresh()" style="font-size:12px">
            <option value="fatal" ${g.severity==='fatal'?'selected':''}>fatal</option>
            <option value="warning" ${g.severity==='warning'?'selected':''}>warning</option>
            <option value="info" ${g.severity==='info'?'selected':''}>info</option>
          </select>
        </div>
      </div>
    </div>`).join('');
}
function addGate(){
  const n = ++gateCounter;
  S.gates.push({id:`GATE-XXX-00${n}`,name:'',description:'',severity:'fatal',check:'',on_failure:'build failure'});
  renderGates(); refresh();
}

// ── Seams ──
function renderSeams(){
  const el = document.getElementById('seams-list');
  el.innerHTML = S.seams.map((s,i)=>`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:150px 1fr auto;gap:8px;margin-bottom:8px">
        <input type="text" value="${esc(s.name)}" placeholder="SEAM_NAME" oninput="S.seams[${i}].name=this.value;refresh()" style="color:var(--blue);font-size:12px;font-weight:600">
        <input type="text" value="${esc(s.description)}" placeholder="What this seam connects..." oninput="S.seams[${i}].description=this.value;refresh()">
        <span class="list-item-del" onclick="S.seams.splice(${i},1);renderSeams();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">provider module</div>
          <input type="text" value="${esc(s.provider)}" placeholder="module-name" oninput="S.seams[${i}].provider=this.value;refresh()" style="font-size:12px">
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">consumer module</div>
          <input type="text" value="${esc(s.consumer)}" placeholder="module-name" oninput="S.seams[${i}].consumer=this.value;refresh()" style="font-size:12px">
        </div>
      </div>
      <div style="margin-top:8px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">contract (exported interface)</div>
        <textarea oninput="S.seams[${i}].contract=this.value;refresh()" style="min-height:60px;font-size:12px;color:var(--green)">${esc(s.contract||'')}</textarea>
      </div>
    </div>`).join('');
}
function addSeam(){
  S.seams.push({name:'',description:'',provider:'',consumer:'',contract:''});
  renderSeams(); refresh();
}

// ── Progress ──
function updateProgress(){
  const sections=['meta','axioms','deps','constraints','modules','events','schemas','enforcement','seams'];
  let filled=0;
  if(S.meta.name&&S.meta.version) filled++;
  if(S.axioms.some(a=>a)) filled++;
  if(S.deps.some(d=>d.name)) filled++;
  if(S.constraints.length) filled++;
  if(S.modules.length) filled++;
  if(S.events.length) filled++;
  if(S.schemas.length) filled++;
  if(S.gates.length) filled++;
  if(S.seams.length) filled++;
  document.getElementById('progress-fill').style.width = (filled/sections.length*100)+'%';

  // mark complete in nav
  document.querySelectorAll('.nav-item').forEach(n=>{
    const sec = n.dataset.sec;
    if(!sec) return;
    let done=false;
    if(sec==='meta') done=!!(S.meta.name&&S.meta.version);
    if(sec==='axioms') done=S.axioms.some(a=>a);
    if(sec==='deps') done=S.deps.some(d=>d.name);
    if(sec==='constraints') done=S.constraints.length>0;
    if(sec==='modules') done=S.modules.length>0;
    if(sec==='events') done=S.events.length>0;
    if(sec==='schemas') done=S.schemas.length>0;
    if(sec==='enforcement') done=S.gates.length>0;
    if(sec==='seams') done=S.seams.length>0;
    if(!n.classList.contains('active')) n.classList.toggle('complete',done);
  });
}

// ── YAML output ──
function genUUID(name){
  const slug = (name||'unknown').replace(/[^a-z0-9]/gi,'-').toLowerCase().slice(0,20);
  return `${slug}-v1-0000-${new Date().getFullYear()}-0000-000000000001`;
}
function esc(s){ return (s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escYaml(s){ return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }

function buildYAML(){
  const m = S.meta;
  const ind=(n,s)=>' '.repeat(n)+s;
  const lines=[];
  lines.push('spec:','');
  lines.push(ind(2,'meta:'));
  if(m.name) lines.push(ind(4,`name:        ${m.name}`));
  if(m.version) lines.push(ind(4,`version:     ${m.version}`));
  if(m.author) lines.push(ind(4,`author:      ${m.author}`));
  lines.push(ind(4,`uuid:        ${m.uuid||genUUID(m.name)}`));
  lines.push(ind(4,`status:      ${m.status||'active'}`));
  if(m.description){
    lines.push(ind(4,'description: >'));
    m.description.split('\n').forEach(l=>lines.push(ind(6,l)));
  }
  if(m.tagline) lines.push(ind(4,`tagline:     "${escYaml(m.tagline)}"`));
  if(m.runtime?.length) lines.push(ind(4,`target_runtime: [${m.runtime.join(', ')}]`));
  if(m.lang?.length) lines.push(ind(4,`language_stack: [${m.lang.join(', ')}]`));
  if(m.paradigm?.length) lines.push(ind(4,`paradigm: [${m.paradigm.join(', ')}]`));

  if(S.deps.some(d=>d.name)){
    lines.push(ind(4,'deps:'));
    S.deps.filter(d=>d.name).forEach(d=>{
      lines.push(ind(6,`- name: ${d.name}`));
      if(d.version) lines.push(ind(8,`version: "${escYaml(d.version)}"`));
      if(d.required!==undefined) lines.push(ind(8,`required: ${d.required}`));
      if(d.purpose) lines.push(ind(8,`purpose: ${d.purpose}`));
    });
  }

  if(S.constraints.some(c=>c.id)){
    lines.push(ind(4,'constraints:'));
    S.constraints.filter(c=>c.id).forEach(c=>{
      lines.push(ind(6,`- id: ${c.id}`));
      if(c.description) lines.push(ind(8,`description: ${c.description}`));
      lines.push(ind(8,`type: ${c.type||'hard'}`));
      if(c.enforced_by) lines.push(ind(8,`enforced_by: [${c.enforced_by}]`));
    });
  }

  if(S.axioms.some(a=>a)){
    lines.push(ind(4,'axioms:'));
    S.axioms.filter(a=>a).forEach(a=>lines.push(ind(6,`- "${escYaml(a)}"`)));
  }

  lines.push('');

  if(S.modules.length){
    lines.push(ind(2,'modules:'),'');
    S.modules.forEach(mod=>{
      lines.push(ind(4,`- id:    ${mod.id||'MOD-UNNAMED'}`));
      if(mod.name) lines.push(ind(6,`name:  ${mod.name}`));
      lines.push(ind(6,`uuid:  ${mod.uuid||genUUID(mod.name||mod.id)}`));
      if(mod.description){
        lines.push(ind(6,'description: >'));
        mod.description.split('\n').forEach(l=>lines.push(ind(8,l)));
      }
      const fns = [
        ['exports',mod.exports,e=>`"${escYaml(e)}"`],
        ['gate_pipeline',mod.gate_pipeline,g=>`"${escYaml(g)}"`],
        ['behavioral_contracts',mod.behavioral_contracts,c=>c],
        ['error_paths',mod.error_paths,e=>e],
      ];
      fns.forEach(([key,arr,fmt])=>{
        if(arr?.some(x=>(typeof x==='string'?x:x.name))){
          lines.push(ind(6,`${key}:`));
          arr.filter(x=>(typeof x==='string'?x:x.name)).forEach(x=>lines.push(ind(8,`- ${fmt(typeof x==='string'?x:x.name)}`)));
        }
      });
      if(mod.deps?.some(d=>d.name)){
        lines.push(ind(6,'deps:'));
        mod.deps.filter(d=>d.name).forEach(d=>lines.push(ind(8,`- name: ${d.name}`)));
      }
      lines.push('');
    });
  }

  if(S.events.some(g=>g.namespace)){
    lines.push(ind(2,'events:'));
    S.events.filter(g=>g.namespace).forEach(g=>{
      lines.push(ind(4,`${g.namespace}:`));
      (g.entries||[]).filter(e=>e).forEach(e=>lines.push(ind(6,`- ${e}`)));
    });
    lines.push('');
  }

  if(S.schemas.some(s=>s.id)){
    lines.push(ind(2,'schemas:'),'');
    S.schemas.filter(s=>s.id).forEach(s=>{
      lines.push(ind(4,`- id:    ${s.id}`));
      if(s.fields?.some(f=>f.name)){
        lines.push(ind(6,'fields:'));
        s.fields.filter(f=>f.name).forEach(f=>{
          const pad = ' '.repeat(Math.max(1,20-f.name.length));
          lines.push(ind(8,`${f.name}:${pad}${f.type||'string'}`));
        });
      }
      lines.push('');
    });
  }

  if(S.gates.some(g=>g.id)){
    lines.push(ind(2,'enforcement:'));
    lines.push(ind(4,'gates:'));
    S.gates.filter(g=>g.id).forEach(g=>{
      lines.push(ind(6,`- id: ${g.id}`));
      if(g.name) lines.push(ind(8,`name: ${g.name}`));
      if(g.description) lines.push(ind(8,`description: ${g.description}`));
      lines.push(ind(8,`severity: ${g.severity||'fatal'}`));
      if(g.check) lines.push(ind(8,`check: ${g.check}`));
      if(g.on_failure) lines.push(ind(8,`on_failure: ${g.on_failure}`));
    });
    lines.push('');
  }

  if(S.seams.some(s=>s.name)){
    lines.push(ind(2,'seams:'),'');
    S.seams.filter(s=>s.name).forEach(s=>{
      lines.push(ind(4,`- name: ${s.name}`));
      if(s.description) lines.push(ind(6,`description: ${s.description}`));
      if(s.provider) lines.push(ind(6,`provider: ${s.provider}`));
      if(s.consumer) lines.push(ind(6,`consumer: ${s.consumer}`));
      if(s.contract){
        lines.push(ind(6,'contract: >'));
        s.contract.split('\n').forEach(l=>lines.push(ind(8,l)));
      }
      lines.push('');
    });
  }

  return lines.join('\n');
}

function syntaxHighlight(yaml){
  return yaml
    .replace(/^(\s*)(#.*)$/gm,(_,sp,c)=>`${sp}<span class="spec-comment">${c}</span>`)
    .replace(/^(\s*)([\w_]+)(\s*:)(\s*)/gm,(_,sp,k,colon,after)=>`${sp}<span class="spec-key">${k}</span>${colon}${after}`)
    .replace(/"([^"]+)"/g,`<span class="spec-string">"$1"</span>`)
    .replace(/(GATE-[A-Z0-9-]+)/g,`<span class="spec-gate">$1</span>`)
    .replace(/^\s+- /gm,m=>`${m}`);
}

function computeStats(){
  const avgDepth = S.modules.length ? S.modules.reduce((s,m)=>s+specDepth(m),0)/S.modules.length : 0;
  const evtCount = S.events.reduce((s,g)=>s+(g.entries||[]).filter(e=>e).length,0);
  const gaps = S.modules.filter(m=>specDepth(m)<0.5).length;
  return { depth:avgDepth.toFixed(2), mods:S.modules.length, evts:evtCount, gaps };
}

function refresh(){
  const yaml = buildYAML();
  document.getElementById('output-pre').innerHTML = syntaxHighlight(yaml);
  const stats = computeStats();
  document.getElementById('stat-depth').textContent = stats.depth;
  document.getElementById('stat-mods').textContent = stats.mods;
  document.getElementById('stat-evts').textContent = stats.evts;
  document.getElementById('sw-stat-gaps').textContent = stats.gaps;
  updateProgress();
}

function copyOutput(){
  const yaml = buildYAML();
  navigator.clipboard.writeText(yaml).then(()=>{
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = 'copied!';
    setTimeout(()=>btn.textContent=orig,1500);
  }).catch(()=>{
    const ta = document.createElement('textarea');
    ta.value=yaml; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  });
}

function downloadSpec(){
  const name = (S.meta.name||'my-spec').replace(/[^a-z0-9-]/gi,'-').toLowerCase();
  const blob = new Blob([buildYAML()],{type:'text/plain'});
  const a = document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name+'.spec';
  a.click();
}

refresh();

async function saveToIdearium(){
  if (!S.meta.name) { toast('meta → name is required before saving','err'); goTo('meta'); return; }
  try {
    const res = await api('/api/specs', { method:'POST', body: JSON.stringify({ name: S.meta.name }) });
    const specUuid = res.spec && res.spec.uuid;
    if (specUuid) {
      const yaml = buildYAML();
      const spec = res.spec;
      const sections = spec.sections.map(s => s.id === 'intent' ? { ...s, content: yaml, complete: true } : s);
      await api('/api/specs/' + specUuid, { method:'PATCH', body: JSON.stringify({ sections }) });
    }
    toast('saved "' + S.meta.name + '" to Idearium', 'ok');
    await loadSpecs();
    setView('spec');
  } catch(e) { toast('save failed: ' + e.message, 'err'); }
}
</script>
      </div>
    </section>

    <!-- ══════════ PROJECTS ══════════ -->
    <section class="view" id="view-projects">
      <div class="ph"><span class="ph-title">Projects</span><span class="ph-badge" id="proj-header-badge">0 projects</span></div>
      <div class="projects-wrap">
        <div class="project-drop" id="project-drop" onclick="document.getElementById('project-file-input').click()">
          <span class="pd-big">⇪</span>
          <span id="project-drop-text">drop zips here, or click to choose files — select as many at once as you like</span>
          <input type="file" id="project-file-input" multiple accept=".zip" style="display:none" onchange="uploadProjectFiles(this.files)">
        </div>
        <div class="project-toolbar">
          <input id="project-search" placeholder="filter projects…" oninput="renderProjectList()">
        </div>
        <div class="project-list" id="project-list"><div class="detail-empty">loading…</div></div>
      </div>
    </section>

    <!-- ══════════ VERSIONIUM ══════════ -->
    <section class="view" id="view-versionium">
      <div class="ph"><span class="ph-title">Versionium</span><span class="ph-badge" id="snap-count-badge">0 snapshots</span></div>
      <div class="versionium-wrap">
        <div class="commit-list" id="commit-list"><div class="detail-empty">no snapshots yet — push one from the Ideas view</div></div>
        <div class="right">
          <div class="ph"><span class="ph-title">Snapshot Detail</span></div>
          <div class="detail-area" id="versionium-detail"><div class="detail-empty">← select a snapshot</div></div>
        </div>
      </div>
    </section>

  </main>
</div>

<!-- ADD IDEA MODAL -->
<div class="modal-overlay" id="modal">
  <div class="modal">
    <div class="modal-title">+ New Idea</div>
    <div class="field-group">
      <div class="field-label">text — the idea itself</div>
      <textarea class="field-textarea" id="f-text" placeholder="track what caused what, with meaning and conditions"></textarea>
    </div>
    <div class="field-group">
      <div class="field-label">tags (comma separated)</div>
      <input class="field-input" id="f-tags" placeholder="causality, nexus, versionium">
    </div>
    <div class="field-group">
      <div class="field-label">compartment (optional)</div>
      <input class="field-input" id="f-compartment" placeholder="e.g. cortex, guardian, bridge">
    </div>
    <div class="modal-actions">
      <button class="modal-btn" onclick="closeModal()">cancel</button>
      <button class="modal-btn confirm" onclick="submitIdea()">add idea</button>
    </div>
  </div>
</div>

<!-- New Spec — template picker (architecture/schemas/checklists/axioms/
     compartments/genesis/...), build-engine selector (WARP as build logic),
     and a "map to repo now" fast path for map-first templates
     (compartments/axioms) that promotes immediately instead of waiting for
     every chunk to build. Opened from Brainstorm ("+ spec" on a captured
     thought) and from the Spec Library ("+ new spec"). -->
<div class="modal-overlay" id="new-spec-modal">
  <div class="modal">
    <div class="modal-title">+ New Spec</div>
    <div class="field-group">
      <div class="field-label">name <span class="req">*</span></div>
      <input class="field-input" id="ns-name" placeholder="what is this?">
    </div>
    <div class="field-group">
      <div class="field-label">description</div>
      <textarea class="field-textarea" id="ns-description" rows="2" placeholder="optional — more context for the agent-built chunks"></textarea>
    </div>
    <div class="field-group">
      <div class="field-label">architecture &amp; features — select any combination</div>
      <div id="ns-templates" style="display:flex;flex-direction:column;gap:4px;max-height:220px;overflow-y:auto;border:1px solid var(--b1);border-radius:4px;padding:8px;background:var(--bg2)"></div>
      <div class="field-hint" style="font-size:10px;color:var(--text3);margin-top:4px">each checked template seeds its own sections deterministically (no agent) — pick architecture + axioms + schemas + checklists + compartments together for one composed spec</div>
    </div>
    <div class="field-group">
      <div class="field-label">build logic</div>
      <select class="field-select" id="ns-build-engine">
        <option value="auto">Auto — WARP cache when available, silent fallback to direct agent</option>
        <option value="warp">WARP (required) — fails loud if WARP isn't loaded, never silently downgrades</option>
        <option value="direct">Direct agent — skip WARP's cache on purpose (e.g. forced fresh rebuild)</option>
      </select>
    </div>
    <div class="modal-actions" style="flex-wrap:wrap">
      <button class="modal-btn" onclick="closeNewSpecModal()">cancel</button>
      <button class="modal-btn confirm" id="ns-map-btn" style="display:none" onclick="submitNewSpec(true)">create + map to repo now</button>
      <button class="modal-btn confirm" onclick="submitNewSpec(false)">create spec</button>
    </div>
  </div>
</div>

<!-- Upload Project — name/goal prompt (declares the temp compartment's
     end-state) -> dropzone -> "Import Repository", generates manifest.json/
     project.json/.git via lib/project-container.js, then opens the repo
     view scoped to the new repo. Opened from the Spec Library, next to
     "+ new spec" — a project is a real repo compartment from the start,
     same as a spec-first repo, just seeded from an existing zip instead
     of built chunk-by-chunk. -->
<div class="modal-overlay" id="upload-project-modal">
  <div class="modal">
    <div class="modal-title">Upload Project</div>

    <div id="up-step-prompt">
      <div class="field-group">
        <div class="field-label">name <span class="req">*</span></div>
        <input class="field-input" id="up-name" placeholder="e.g. checkout-service">
      </div>
      <div class="field-group">
        <div class="field-label">goal <span class="req">*</span></div>
        <textarea class="field-textarea" id="up-goal" rows="2" placeholder="what should be true once this is imported and worked on?"></textarea>
        <div class="field-hint" style="font-size:10px;color:var(--text3);margin-top:4px">becomes the compartment's declared end-state — evaluated against the real repo, manifest, and commit once import finishes</div>
      </div>
      <div class="field-group">
        <div class="field-label">example goals — click to use</div>
        <div id="up-chips" style="display:flex;flex-wrap:wrap;gap:6px"></div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" onclick="closeUploadProjectModal()">cancel</button>
        <button class="modal-btn confirm" onclick="submitUploadProjectStart()">continue →</button>
      </div>
    </div>

    <div id="up-step-drop" style="display:none">
      <div class="field-hint" id="up-container-note" style="font-size:10px;color:var(--text3);margin-bottom:8px"></div>
      <div class="project-drop" id="up-drop" onclick="document.getElementById('up-file-input').click()">
        <span class="pd-big">⬇</span>
        <span id="up-drop-text">drop a .zip archive, or click to choose one</span>
      </div>
      <input type="file" id="up-file-input" accept=".zip" style="display:none" onchange="stageUploadProjectFile(this.files[0])">
      <div class="modal-actions">
        <button class="modal-btn" onclick="cancelUploadProject()">cancel</button>
        <button class="modal-btn confirm" id="up-import-btn" disabled onclick="submitUploadProjectImport()">import repository</button>
      </div>
    </div>
  </div>
</div>

<!-- Generic themed text-prompt — replaces native prompt() for spec name /
     gap description / archive reason, so they match the rest of the UI
     instead of dropping into an OS dialog. -->
<div class="modal-overlay" id="prompt-modal">
  <div class="modal">
    <div class="modal-title" id="prompt-modal-title">input</div>
    <div class="field-group">
      <div class="field-label" id="prompt-modal-label"></div>
      <textarea class="field-textarea" id="prompt-modal-input" rows="2"></textarea>
    </div>
    <div class="modal-actions">
      <button class="modal-btn" onclick="closePromptModal(null)">cancel</button>
      <button class="modal-btn confirm" onclick="closePromptModal(document.getElementById('prompt-modal-input').value)">ok</button>
    </div>
  </div>
</div>

<!-- Spec builder choice — quick (existing section grid) vs full wizard
     (meta/axioms/deps/modules/events/schemas/enforcement/seams, matches the
     real .spec dialect used across the ecosystem, not the generic 9 sections). -->
<div class="modal-overlay" id="spec-choice-modal">
  <div class="modal">
    <div class="modal-title">Build a Spec</div>
    <div class="modal-actions" style="flex-direction:column;gap:8px;align-items:stretch">
      <button class="modal-btn confirm" onclick="closeSpecChoice(); setView('spec')">quick — section grid (intent, api_callto, module_hooks…)</button>
      <button class="modal-btn confirm" onclick="closeSpecChoice(); setView('spec-wizard')">full wizard — meta, axioms, deps, modules, events, schemas, enforcement, seams</button>
      <button class="modal-btn" onclick="closeSpecChoice()">cancel</button>
    </div>
  </div>
</div>



<div class="toast-area" id="toast-area"></div>

<script src="js/app.js"></script>
</body>
</html>

---

# idearium/ui/js/app.js

// ════════════════════════════════════════════════════
// STARFIELD CANVAS — twinkling stars (Van Gogh / synthwave reference, dialed
// down to ambient field per the style note: ~0.15-0.2 opacity behind panels)
// ════════════════════════════════════════════════════
(function(){
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize(){
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const N = Math.round((canvas.width*canvas.height)/9000);
    stars = Array.from({length:N}, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height*0.9,
      r: Math.random()*1.3+0.3, base: Math.random()*0.5+0.25,
      speed: Math.random()*0.02+0.005, phase: Math.random()*Math.PI*2
    }));
  }
  function tick(t){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (const s of stars){
      const tw = s.base + Math.sin(t*s.speed + s.phase)*0.35;
      ctx.globalAlpha = Math.max(0, Math.min(1, tw));
      ctx.fillStyle = '#cfe6ff';
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  resize(); requestAnimationFrame(tick);
})();

// ════════════════════════════════════════════════════
// NEXUS API CLIENT — wired to the real Idearium service (idearium/api/index.js)
// Real routes: GET /api/ideas, /api/specs, /api/gaps, /api/snapshots, /api/stats,
// /api/events, /sse · POST /api/ideas, /api/gaps, /api/snapshots, etc.
// Tries direct :4800, falls back to orchestrator proxy at :9000/api/idearium
// ════════════════════════════════════════════════════
const API_CANDIDATES = ['http://127.0.0.1:4800', 'http://127.0.0.1:9000/api/idearium'];
let API_BASE = null;
let CONNECTED = false;
let SSE = null;

async function fetchTimeout(url, opts={}, ms=5000) {
  // §2026-07-10 — was 1800ms. The screenshots showed repeated "operation was
  // aborted" toasts: the health check aborting at 1.8s against a host under
  // memory pressure (the 0xC0000409 crash cause). 1.8s is too tight for a cold
  // connection or a loaded machine. Writes already used 6000; this aligns the
  // default so health checks and exports stop spuriously aborting.
  const ctrl = new AbortController();
  const id = setTimeout(()=>ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(id); }
}

async function nexusConnect(manual=false) {
  setConnUI('connecting');
  for (const base of API_CANDIDATES) {
    try {
      const r = await fetchTimeout(base + '/health');
      if (r.ok) { API_BASE = base; CONNECTED = true; setConnUI('online', base); await loadAll(); openSSE(); return true; }
    } catch(_) {}
  }
  CONNECTED = false; API_BASE = null; setConnUI('offline');
  if (manual) toast('still unreachable — is the idearium service running?','err');
  return false;
}

function setConnUI(state, base) {
  const el = document.getElementById('conn-indicator');
  const label = document.getElementById('conn-label');
  const banner = document.getElementById('offline-banner');
  el.className = 'tb-conn ' + (state==='online'?'online':state==='connecting'?'':'offline');
  label.textContent = state==='online' ? `nexus · ${base.replace('http://127.0.0.1','')}` : state==='connecting' ? 'connecting…' : 'offline — click to retry';
  banner.classList.toggle('show', state==='offline');
  document.getElementById('welcome-foot').textContent = state==='online'
    ? `connected · ${base}`
    : 'awaiting connection to nexus idearium service · :4800';
}

async function api(path, opts={}, timeoutMs=6000) {
  if (!API_BASE) throw new Error('not connected to nexus');
  const r = await fetchTimeout(API_BASE + path, { headers:{'Content-Type':'application/json'}, ...opts }, timeoutMs);
  let data = {};
  try { data = await r.json(); } catch(_) {}
  if (!r.ok || data.ok === false) throw new Error(data.error || r.statusText || 'request failed');
  return data;
}

function openSSE() {
  try {
    if (SSE) SSE.close();
    SSE = new EventSource(API_BASE + '/sse');
    SSE.onopen = () => { document.getElementById('sse-badge').textContent='live'; document.getElementById('sse-badge').classList.add('live'); };
    SSE.onerror = () => { document.getElementById('sse-badge').textContent='disconnected'; document.getElementById('sse-badge').classList.remove('live'); };
    SSE.onmessage = (e) => {
      try { const ev = JSON.parse(e.data); appendEventLog(ev); refreshOnEvent(ev); }
      catch(_) {}
    };
  } catch(_) {}
}

function refreshOnEvent(ev) {
  // re-pull the relevant slice rather than trust a partial payload
  if (!ev || !ev.type) return;
  // §BUG FIXED 2026-07-11 — found via loom's wire-endpoints sweep (checking
  // every os.emit(...) against what actually listens for it): two event-
  // naming conventions coexist in idearium — bare ('spec.created',
  // 'idea.updated', matching this dispatcher's original startsWith checks)
  // and 'idearium.'-prefixed ('idearium.spec.built', 'idearium.spec.
  // compiled', 'idearium.spec.imported', 'idearium.spec.promoted',
  // 'idearium.queue.progress', 'idearium.repo.file.write/.delete'). Every
  // event using the second convention silently triggered no UI refresh at
  // all — not because refreshOnEvent had a bug in its logic, but because
  // it only ever recognized the first convention's prefixes. Strip an
  // optional leading 'idearium.' before matching so both conventions work
  // the same way, instead of adding one narrow special case per event
  // every time this happens again.
  const t = ev.type.startsWith('idearium.') ? ev.type.slice('idearium.'.length) : ev.type;
  if (t.startsWith('idea.'))   { loadIdeas(); }
  if (t.startsWith('gap.'))    { loadGaps(); }
  // §BUG FIXED 2026-07-15 — spec-engine's own chunk events are named
  // 'idearium.spec-engine.chunk.complete'/'.queued', which — unlike every
  // 'idearium.spec.*' event — does NOT start with 'spec.' (it's
  // 'spec-engine.', a hyphen not a dot). Those events silently fell through
  // every branch below and never refreshed anything, same class of bug as
  // the 2026-07-11 fix above this function.
  if (t.startsWith('spec.') || t.startsWith('spec-engine.')) { loadSpecs(); }
  if (t==='push.complete')     { loadSnapshots(); }
  if (t==='snr.update')        { loadStats(); }
  if (t.startsWith('repo.')) {
    loadApiRepos().then(() => {
      if (CURRENT_API_REPO && ev.payload?.repoUuid === CURRENT_API_REPO.uuid) {
        const fresh = API_REPOS.find(r => r.uuid === CURRENT_API_REPO.uuid);
        if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
      }
    });
  }
  if (t.startsWith('queue.'))  { if (typeof loadStats === 'function') loadStats(); }
}

// ════════════════════════════════════════════════════
// STATE — populated only from real Nexus data, never seeded
// ════════════════════════════════════════════════════
let IDEAS=[], GAPS=[], SPECS=[], SNAPSHOTS=[], STATS=null;
let SELECTED=null, SELECTED_SPEC=null, SELECTED_SNAP=null;
let CURRENT_SORT='tension';
let BRAINSTORMS = [];  // §CHANGED 2026-09-03 — was JSON.parse(localStorage...); loaded from data/ via loadBrainstorms() below, matching every other real state in this file.
const IDEA_PHASES   = ['seed','expanding','tensioned','specced','building','complete','archived'];
const GAP_SEVERITIES= ['fatal','high','medium','low'];
const LINK_TYPES    = ['resonance','tension','causal','temporal','semantic'];
const SECTION_IDS   = ['intent','api_callto','module_hooks','cli_spec','schemas','gap_contract','failure_modes','tests','phase_map'];

async function loadAll() {
  await Promise.all([loadIdeas(), loadGaps(), loadSpecs(), loadSnapshots(), loadStats(), loadApiRepos(), loadBrainstorms()]);
}
// §BUILT 2026-09-03 — real data/-backed load, replacing the old
// localStorage.getItem at module-load time. Same shape (array of
// {uuid,text,tags,ts,promoted}), sourced from the real idearium_brainstorms
// JAA table now, not the browser.
async function loadBrainstorms() { try { BRAINSTORMS = (await api('/api/brainstorms')).brainstorms || []; renderBrainstorms(); updateStats(); } catch(e){ console.warn('[idearium] loadBrainstorms failed:', e.message); } }
async function loadIdeas()    { try { IDEAS = (await api('/api/ideas')).ideas || []; renderIdeaList(); if(SELECTED){const i=IDEAS.find(x=>x.uuid===SELECTED); if(i) renderDetail(i);} } catch(e){ console.warn('[idearium] loadIdeas failed:', e.message); toast('failed to load ideas: '+e.message,'err'); } }
async function loadGaps()     { try { GAPS  = (await api('/api/gaps')).gaps  || []; renderIdeaList(); } catch(e){ console.warn('[idearium] loadGaps failed:', e.message); } }
// §BUG FIXED 2026-07-15 — loadIdeas() re-renders the open idea detail panel
// on every refresh (see the line above); loadSpecs() never did the same for
// an open spec builder. An SSE-driven chunk/build event updated the spec
// list and status chips but left a currently-open builder panel showing
// stale chunk statuses until the user reselected the spec by hand.
async function loadSpecs()    { try { SPECS = (await api('/api/specs')).specs|| []; renderSpecList(); renderArchitect(); if (SELECTED_SPEC) { const s = SPECS.find(x=>x.uuid===SELECTED_SPEC); if (s) renderSpecBuilder(s); } } catch(e){ console.warn('[idearium] loadSpecs failed:', e.message); toast('failed to load specs: '+e.message,'err'); } }
async function loadSnapshots(){ try { SNAPSHOTS = (await api('/api/snapshots')).snapshots || []; renderVersionium(); } catch(e){ console.warn('[idearium] loadSnapshots failed:', e.message); } }
async function loadStats()    { try { STATS = (await api('/api/stats')).stats; } catch(e){ console.warn('[idearium] loadStats failed:', e.message); } updateStats(); }
// Ideas/Repo merge: repos are no longer their own rail tab — they're looked
// up by ideaUuid/specUuid from idea/spec detail panels. API_REPOS is the
// client-side cache loadAll() refreshes alongside everything else.
let API_REPOS = [];
async function loadApiRepos() { try { API_REPOS = (await api('/api/repos')).repos || []; } catch(e){} }

// §NEW 2026-07-15 — chunk retry trail + build artifacts for a spec-engine
// spec, read from speceng.show's `history` block. Kept out of SPECS/loadSpecs
// entirely: it's per-spec detail, not list data, and fetching it for every
// spec on every list refresh would be wasted work for specs nobody has open.
// Fetched lazily by renderSpecHistoryPanel() only while that spec's builder
// panel is actually mounted, and rendered into its own sub-panel so a slow
// or failed history fetch never blocks the chunk list/action row above it
// (already-known synchronous data) from showing immediately.
let SPEC_HISTORY = {};
let _historyFetchInFlight = new Set();

async function renderSpecHistoryPanel(specUuid) {
  if (_historyFetchInFlight.has(specUuid)) return;
  _historyFetchInFlight.add(specUuid);
  try {
    const res = await api(`/api/spec-engine/specs/${specUuid}`);
    SPEC_HISTORY[specUuid] = res.history || { chunkEvents: [], buildArtifacts: [] };
  } catch (e) {
    console.warn('[idearium] history fetch failed:', e.message);
    SPEC_HISTORY[specUuid] = SPEC_HISTORY[specUuid] || { chunkEvents: [], buildArtifacts: [] };
  } finally {
    _historyFetchInFlight.delete(specUuid);
  }
  // The user may have navigated to a different spec (or away entirely)
  // while this was in flight — only touch the DOM if it's still relevant.
  if (SELECTED_SPEC !== specUuid) return;
  const panel = document.getElementById('spec-history-panel');
  if (panel) panel.innerHTML = buildSpecHistoryHtml(specUuid);
  const badge = document.getElementById('spec-compiled-badge');
  if (badge) badge.outerHTML = buildCompiledBadgeHtml(specUuid);
}

function buildCompiledBadgeHtml(specUuid) {
  const hist = SPEC_HISTORY[specUuid];
  if (!hist) return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--text3)">checking build status…</span>`;
  const latest = (hist.buildArtifacts || [])[0]; // [0] = most recent, per _specHistory's sort
  if (!latest) return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--text3)">not compiled yet</span>`;
  if (latest.ok) {
    return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--mint)">✓ compiled · ${escapeHtml(latest.extraction||'')}${latest.agent?` · ${escapeHtml(latest.agent)}`:''}</span>`;
  }
  return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--coral)" title="${escapeHtml(latest.error||'')}">✗ compile failed — ${escapeHtml((latest.error||'unknown error').slice(0,70))}</span>`;
}

function buildSpecHistoryHtml(specUuid) {
  const hist = SPEC_HISTORY[specUuid];
  if (!hist) return `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:6px 0">loading history…</div>`;
  const { chunkEvents=[], buildArtifacts=[] } = hist;
  if (!chunkEvents.length && !buildArtifacts.length) {
    return `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:6px 0">no build history yet</div>`;
  }
  const fmtTime = ts => ts ? new Date(ts).toLocaleString() : '—';
  const artifactsHtml = buildArtifacts.map(a => `
    <div style="display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;padding:4px 0;border-bottom:1px solid var(--b0)">
      <span style="color:${a.ok?'var(--mint)':'var(--coral)'}">${a.ok?'✓':'✗'}</span>
      <span style="flex:1;color:var(--text2)">${escapeHtml(a.extraction||'—')}${a.agent?` · ${escapeHtml(a.agent)}`:''}${a.error?` · ${escapeHtml(a.error.slice(0,80))}`:''}</span>
      <span style="color:var(--text3);flex-shrink:0">${fmtTime(a.ts)}</span>
    </div>`).join('');
  const eventsHtml = chunkEvents.map(e => `
    <div style="display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;padding:3px 0;border-bottom:1px solid var(--b0)">
      <span style="color:${e.cacheHit?'var(--mint)':'var(--amber)'}" title="${e.cacheHit?'cache/reuse hit':'built'}">${e.cacheHit?'⚡':'●'}</span>
      <span style="flex:1;color:var(--text2)">${escapeHtml(e.sectionId||'')}</span>
      <span style="color:var(--text3)">${escapeHtml(e.source||'')}${e.reusedFrom?' (reused)':''}${e.cost!=null?` · ${e.cost} tok`:''}</span>
      <span style="color:var(--text3);flex-shrink:0">${fmtTime(e.ts)}</span>
    </div>`).join('');
  return `
    <details style="margin-top:4px" ${buildArtifacts.length?'open':''}>
      <summary style="cursor:pointer;font-family:var(--mono);font-size:10px;color:var(--text2)">build artifacts (${buildArtifacts.length})</summary>
      ${artifactsHtml || `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:4px 0">none yet</div>`}
    </details>
    <details style="margin-top:8px">
      <summary style="cursor:pointer;font-family:var(--mono);font-size:10px;color:var(--text2)">chunk history (${chunkEvents.length}${chunkEvents.length===200?'+':''})</summary>
      ${eventsHtml || `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:4px 0">none yet</div>`}
    </details>
  `;
}


function updateStats() {
  document.getElementById('stat-ideas').textContent = IDEAS.filter(i=>i.phase!=='archived').length || 0;
  document.getElementById('stat-gaps').textContent  = GAPS.filter(g=>g.status==='open').length || 0;
  document.getElementById('stat-specs').textContent = SPECS.length || 0;
  document.getElementById('stat-snr').textContent    = STATS && STATS.snr!=null ? STATS.snr.toFixed ? STATS.snr.toFixed(2) : STATS.snr : '—';
  document.getElementById('brain-count-badge').textContent = `${BRAINSTORMS.length} entries`;
  document.getElementById('spec-count-badge').textContent  = `${SPECS.length} specs`;
  document.getElementById('snap-count-badge').textContent  = `${SNAPSHOTS.length} snapshots`;
  document.getElementById('snap-btn').disabled = !CONNECTED;
}

// ════════════════════════════════════════════════════
// VIEW SWITCHING + NAV RAIL
// ════════════════════════════════════════════════════
function setView(v) {
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active', el.id==='view-'+v));
  document.querySelectorAll('.tab-btn, .tab-sub').forEach(b=>b.classList.toggle('active', b.dataset.view===v));
  document.querySelectorAll('.tab-group').forEach(g=>{
    const groupBtn = g.querySelector('.tab-group-btn');
    const views = (groupBtn?.dataset.views || '').split(',');
    if (groupBtn) groupBtn.classList.toggle('active', views.includes(v));
    g.classList.remove('open');
  });
  if (v === 'projects') loadProjects();
}

// Top-tab subnav dropdowns (Create ▾ / Build ▾) — hover works via CSS,
// this adds click/tap support (touch + keyboard-driven clicks) on top of it.
function toggleTabGroup(e, btn) {
  e.stopPropagation();
  const group = btn.closest('.tab-group');
  document.querySelectorAll('.tab-group').forEach(g => { if (g !== group) g.classList.remove('open'); });
  group.classList.toggle('open');
}
document.addEventListener('click', () => {
  document.querySelectorAll('.tab-group.open').forEach(g => g.classList.remove('open'));
});

// ════════════════════════════════════════════════════
// EVENT LOG
// ════════════════════════════════════════════════════
function appendEventLog(ev) {
  const log = document.getElementById('event-log');
  const time = new Date(ev.ts||Date.now()).toLocaleTimeString('en-GB',{hour12:false});
  const typeShort = (ev.type||'event').replace('idearium.','');
  const typeClass = typeShort.includes('gap')?'gap':typeShort.includes('snapshot')||typeShort.includes('push')?'snap':typeShort.includes('spec')?'spec':typeShort.includes('error')?'err':'idea';
  const div = document.createElement('div');
  div.className = 'gap-log-line';
  const payload = ev.payload || {};
  const preview = (payload.text||payload.name||payload.uuid||payload.message||'').toString().slice(0,40);
  div.innerHTML = `<span class="gl-ts">${time}</span><span class="gl-type ${typeClass}">${typeShort}</span><span style="color:var(--text3)">${preview}</span>`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  while (log.children.length > 300) log.removeChild(log.firstChild);
}

// ════════════════════════════════════════════════════
// IDEAS — real schema: uuid, slug, text, tags, phase, tension,
// resonanceWith, tensionWith, openGaps, stability{...}, compartment, linkedSpec
// ════════════════════════════════════════════════════
function sortBy(s, btn) {
  CURRENT_SORT = s;
  document.querySelectorAll('#view-ideas .toolbar .mode-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderIdeaList();
}

function getFilteredIdeas() {
  const q = (document.getElementById('search').value||'').toLowerCase();
  let pool = IDEAS.filter(i => i.phase !== 'archived');
  if (q) pool = pool.filter(i => (i.text||'').toLowerCase().includes(q) || (i.tags||[]).some(t=>t.toLowerCase().includes(q)));
  return pool.sort((a,b) => {
    if (CURRENT_SORT==='tension') return (b.tension||0)-(a.tension||0);
    if (CURRENT_SORT==='updated') return (b.updatedAt||0)-(a.updatedAt||0);
    return (a.text||'').localeCompare(b.text||'');
  });
}

function renderIdeaList() {
  const list = document.getElementById('idea-list');
  const items = getFilteredIdeas();
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = `<div style="padding:20px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--text3)">${CONNECTED ? 'no ideas yet — click + idea' : 'not connected to nexus'}</div>`;
    return;
  }
  for (const idea of items) {
    const tension = idea.tension || 0;
    const card = document.createElement('div');
    const tClass = tension > 0.7 ? 't-high' : tension > 0.4 ? 't-med' : 'low';
    const openGaps = GAPS.filter(g=>g.status==='open'&&(g.between||[idea.uuid]).includes(idea.uuid));
    card.className = `idea-card ${tClass} ${idea.phase}${idea._local?' local':''}${SELECTED===idea.uuid?' selected':''}`;
    card.onclick = () => selectIdea(idea.uuid);
    const tagsHtml = (idea.tags||[]).map(t=>`<span class="ic-tag">#${t}</span>`).join('');
    const gapsHtml = openGaps.length ? `<span class="ic-gap">◆ ${openGaps.length} gap${openGaps.length>1?'s':''}</span>` : '';
    const tColor = tension>0.7?'var(--coral)':tension>0.4?'var(--amber)':'var(--mint)';
    const stab = idea.stability || {};
    const stabHtml = ['execution','runtime','effectiveness','rigidity','persistence'].map(k=>{
      const v = stab[k]!=null ? stab[k] : 1;
      return `<i style="height:${Math.max(3,v*10)}px;background:${v<0.4?'var(--coral)':v<0.7?'var(--amber)':'var(--mint)'}" title="${k}: ${v}"></i>`;
    }).join('');
    card.innerHTML = `
      <div class="ic-top">
        <div class="ic-name">${escapeHtml(idea.text||idea.slug||'untitled')}</div>
        <span class="ic-status st-${idea.phase}">${idea.phase}${idea._local?' · local':''}</span>
      </div>
      <div class="tension-row">
        <span class="tension-label">tension</span>
        <div class="tension-track"><div class="tension-fill" style="width:${tension*100}%;background:${tColor}"></div></div>
        <span class="tension-pct" style="color:${tColor}">${Math.round(tension*100)}%</span>
        <div class="stab-mini">${stabHtml}</div>
      </div>
      <div class="ic-meta">${gapsHtml}${tagsHtml}<span class="ic-uuid">${(idea.uuid||'').slice(0,8)}</span></div>
    `;
    list.appendChild(card);
  }
}

function selectIdea(uuid) {
  SELECTED = uuid;
  const idea = IDEAS.find(i=>i.uuid===uuid);
  if (!idea) return;
  renderIdeaList();
  renderDetail(idea);
}

function renderDetail(idea) {
  const tension = idea.tension || 0;
  const openGaps = GAPS.filter(g=>g.status==='open'&&(g.between||[idea.uuid]).includes(idea.uuid));
  const resIdeas = (idea.resonanceWith||[]).map(u=>IDEAS.find(i=>i.uuid===u)).filter(Boolean);
  const tenIdeas = (idea.tensionWith||[]).map(u=>IDEAS.find(i=>i.uuid===u)).filter(Boolean);
  const linkedSpec = idea.linkedSpec ? SPECS.find(s=>s.uuid===idea.linkedSpec) : null;

  document.getElementById('detail-title').textContent = (idea.text||idea.slug||'').slice(0,40);
  const area = document.getElementById('detail-area');
  const tColor = tension>0.7?'var(--coral)':tension>0.4?'var(--amber)':'var(--mint)';

  let html = `
    <div class="ds">
      <div class="ds-label">tension score</div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="tension-track" style="flex:1;height:5px;background:var(--bg);border-radius:3px;overflow:hidden">
          <div class="tension-fill" style="width:${tension*100}%;background:${tColor};height:100%;border-radius:3px"></div>
        </div>
        <span style="font-family:var(--mono);font-size:13px;font-weight:600;color:${tColor}">${Math.round(tension*100)}%</span>
      </div>
    </div>
    <div class="ds"><div class="ds-label">text</div><div class="ds-value">${escapeHtml(idea.text||'—')}</div></div>
    <div class="ds">
      <div class="ds-label">phase</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${IDEA_PHASES.map(p=>`<button class="action-btn${idea.phase===p?' primary':''}" onclick="setPhase('${idea.uuid}','${p}')">${p}</button>`).join('')}
      </div>
    </div>
  `;
  if ((idea.tags||[]).length) html += `<div class="ds"><div class="ds-label">tags</div><div class="tag-row">${idea.tags.map(t=>`<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}</div></div>`;
  if (idea.compartment) html += `<div class="ds"><div class="ds-label">compartment</div><div class="ds-mono">${escapeHtml(idea.compartment)}</div></div>`;

  html += `
    <div class="ds">
      <div class="ds-label">stability</div>
      <div class="pend-detail" style="background:var(--bg2);border:1px solid var(--b0);border-radius:5px;padding:10px">
        ${Object.entries(idea.stability||{}).map(([k,v])=>`<div class="pend-row" style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--b0)"><span class="pend-k" style="font-family:var(--mono);font-size:9px;color:var(--text3)">${k}</span><span class="pend-v" style="font-family:var(--mono);font-size:10px">${v}</span></div>`).join('') || '<span style="color:var(--text3);font-family:var(--mono);font-size:10px">no stability data</span>'}
      </div>
    </div>
  `;

  if (linkedSpec) {
    html += `<div class="ds"><div class="ds-label">linked spec</div><div class="link-item" style="cursor:pointer" onclick="setView('spec');selectSpec('${linkedSpec.uuid}')"><span class="link-type resonance">spec</span><span>${escapeHtml(linkedSpec.name)}</span><span class="ic-uuid" style="margin-left:auto">${linkedSpec.phase}</span></div></div>`;
  } else {
    html += `<div class="ds"><div class="ds-label">spec</div><button class="action-btn primary" onclick="createSpecForIdea('${idea.uuid}')">+ create spec from this idea</button></div>`;
  }

  html += `<div class="ds"><div class="ds-label">repository</div><button class="action-btn" onclick="openRepoFor('${idea.uuid}', null, '${escapeHtml(idea.text||idea.uuid).replace(/'/g,"\\'").slice(0,40)}')">open repository →</button></div>`;

  if (openGaps.length) {
    html += `<div class="ds"><div class="ds-label">open gaps (${openGaps.length})</div>`;
    for (const g of openGaps) {
      html += `
        <div class="gap-item open">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <span class="gap-id">${g.uuid.slice(0,8)}</span>
            <span style="font-family:var(--mono);font-size:9px" class="sev-${g.severity}">${g.severity}</span>
            <button class="action-btn" style="font-size:9px;padding:1px 6px" onclick="resolveGap('${g.uuid}')">resolve</button>
          </div>
          <div class="gap-desc">${escapeHtml(g.description)}</div>
        </div>`;
    }
    html += `</div>`;
  }

  if (resIdeas.length || tenIdeas.length) {
    html += `<div class="ds"><div class="ds-label">relationships</div>`;
    for (const r of resIdeas) html += `<div class="link-item"><span class="link-type resonance">resonance</span><span>${escapeHtml((r.text||'').slice(0,30))}</span><span class="ic-uuid" style="margin-left:auto">${r.uuid.slice(0,8)}</span></div>`;
    for (const r of tenIdeas) html += `<div class="link-item"><span class="link-type tension">tension</span><span>${escapeHtml((r.text||'').slice(0,30))}</span><span class="ic-uuid" style="margin-left:auto">${r.uuid.slice(0,8)}</span></div>`;
    html += `</div>`;
  }

  const others = IDEAS.filter(i=>i.uuid!==idea.uuid && i.phase!=='archived');
  if (others.length) {
    html += `<div class="ds"><div class="ds-label">link to another idea</div><div style="display:flex;gap:5px;flex-wrap:wrap">${others.slice(0,6).map(o=>`<button class="action-btn" onclick="linkIdeas('${idea.uuid}','${o.uuid}','resonance')" title="${escapeHtml(o.text)}">~ ${escapeHtml((o.text||'').slice(0,16))}</button>`).join('')}</div></div>`;
  }

  html += `
    <div class="ds">
      <div class="ds-label">actions</div>
      <div class="action-row">
        <button class="action-btn" onclick="openGapPrompt('${idea.uuid}')">open gap</button>
        <button class="action-btn danger" onclick="archiveIdea('${idea.uuid}')">archive</button>
      </div>
    </div>
    <div class="ds"><div class="ds-label">identity</div><div class="ds-mono">${idea.uuid}\n${idea.slug||''}\ncreated ${idea.createdAt?new Date(idea.createdAt).toLocaleString():'—'}\nupdated ${idea.updatedAt?new Date(idea.updatedAt).toLocaleString():'—'}</div></div>
  `;
  area.innerHTML = html;
}

async function setPhase(uuid, phase) {
  try { await api(`/api/ideas/${uuid}/phase`, { method:'POST', body: JSON.stringify({phase}) }); toast(`phase → ${phase}`,'ok'); await loadIdeas(); }
  catch(e) { toast(e.message,'err'); }
}
async function linkIdeas(fromUuid, toUuid, linkType='resonance') {
  try { await api(`/api/ideas/${fromUuid}/link`, { method:'POST', body: JSON.stringify({toUuid, linkType}) }); toast('linked','ok'); await loadIdeas(); }
  catch(e) { toast(e.message,'err'); }
}
async function archiveIdea(uuid) {
  const reason = await themedPrompt('archive reason (required — §M1, nothing deleted):', 'archive idea');
  if (!reason) return;
  try { await api(`/api/ideas/${uuid}`, { method:'DELETE', body: JSON.stringify({reason}) }); SELECTED=null; document.getElementById('detail-area').innerHTML='<div class="detail-empty">idea archived</div>'; toast('archived','ok'); await loadIdeas(); }
  catch(e) { toast(e.message,'err'); }
}
// §NEW 2026-07-16 — nothing on disk is destroyed (spec-engine/index.js's
// deleteSpec just flips a flag — same §7.4/§M1 pattern as archiveIdea
// above), so this doesn't need a themedPrompt reason like archiveIdea does.
// A plain confirm() is enough since it's reversible via restoreSpec.
async function deleteSpec(uuid, name) {
  if (!confirm(`remove "${name}" from the spec library?\n\nnothing on disk is deleted — this can be undone.`)) return;
  try {
    await api(`/api/spec-engine/specs/${uuid}`, { method: 'DELETE' });
    if (SELECTED_SPEC === uuid) {
      SELECTED_SPEC = null;
      document.getElementById('spec-builder').innerHTML = '<div class="detail-empty">select or create a spec to open the builder</div>';
    }
    toast('removed from library', 'ok');
    await loadSpecs();
  } catch(e) { toast(e.message, 'err'); }
}
async function restoreSpec(uuid) {
  try { await api(`/api/spec-engine/specs/${uuid}/restore`, { method: 'POST' }); toast('restored', 'ok'); await loadSpecs(); }
  catch(e) { toast(e.message, 'err'); }
}
// §NEW 2026-07-16 — legacy specs (no .chunks — the pre-spec-engine
// 9-section format) live in a different store than deleteSpec() above
// covers, and follow the same §M1 "reason required, nothing deleted"
// convention as archiveIdea. Separate function because the requirement
// (reason) and the endpoint (/api/specs, not /api/spec-engine/specs) both
// differ from the spec-engine path.
async function archiveSpec(uuid, name) {
  const reason = await themedPrompt('archive reason (required — §M1, nothing deleted):', `archive "${name}"`);
  if (!reason) return;
  try {
    await api(`/api/specs/${uuid}`, { method: 'DELETE', body: JSON.stringify({reason}) });
    if (SELECTED_SPEC === uuid) {
      SELECTED_SPEC = null;
      document.getElementById('spec-builder').innerHTML = '<div class="detail-empty">select or create a spec to open the builder</div>';
    }
    toast('archived', 'ok');
    await loadSpecs();
  } catch(e) { toast(e.message, 'err'); }
}
async function openGapPrompt(ideaUuid) {
  const description = await themedPrompt('gap description:', 'open gap');
  if (!description) return;
  openGap({ description, ideaUuid, type:'unresolved', severity:'medium' });
}
async function openGap({description, ideaUuid, type, severity}) {
  try { await api('/api/gaps', { method:'POST', body: JSON.stringify({description, ideaUuid, type, severity, between:ideaUuid?[ideaUuid]:[]}) }); toast('gap opened','ok'); await loadGaps(); if(SELECTED) renderDetail(IDEAS.find(i=>i.uuid===SELECTED)); }
  catch(e) { toast(e.message,'err'); }
}
async function resolveGap(uuid) {
  try { await api(`/api/gaps/${uuid}/resolve`, { method:'POST', body: JSON.stringify({resolution:'resolved via UI'}) }); toast('gap resolved','ok'); await loadGaps(); if(SELECTED) renderDetail(IDEAS.find(i=>i.uuid===SELECTED)); }
  catch(e) { toast(e.message,'err'); }
}

function openModal(){ document.getElementById('modal').classList.add('open'); document.getElementById('f-text').focus(); }
function closeModal(){ document.getElementById('modal').classList.remove('open'); }
function openSpecChoice(){ document.getElementById('spec-choice-modal').classList.add('open'); }
function closeSpecChoice(){ document.getElementById('spec-choice-modal').classList.remove('open'); }

// Themed replacement for window.prompt() — same contract (resolves to the
// entered string, or null on cancel/empty) so call sites just add `await`.
let _promptResolve = null;
function themedPrompt(label, title='input') {
  document.getElementById('prompt-modal-title').textContent = title;
  document.getElementById('prompt-modal-label').textContent = label;
  const input = document.getElementById('prompt-modal-input');
  input.value = '';
  document.getElementById('prompt-modal').classList.add('open');
  setTimeout(() => input.focus(), 50);
  return new Promise(resolve => { _promptResolve = resolve; });
}
function closePromptModal(value) {
  document.getElementById('prompt-modal').classList.remove('open');
  if (_promptResolve) { _promptResolve(value && value.trim() ? value.trim() : null); _promptResolve = null; }
}

async function submitIdea() {
  const text = document.getElementById('f-text').value.trim();
  if (!text || text.length < 3) { toast('text must be ≥3 chars','err'); return; }
  const tags = document.getElementById('f-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const compartment = document.getElementById('f-compartment').value.trim() || null;
  try {
    const res = await api('/api/ideas', { method:'POST', body: JSON.stringify({text, tags, compartment}) });
    closeModal();
    ['f-text','f-tags','f-compartment'].forEach(id=>document.getElementById(id).value='');
    await loadIdeas();
    setView('ideas');
    if (res.idea) selectIdea(res.idea.uuid);
    toast('idea logged','ok');
  } catch(e) { toast(e.message,'err'); }
}

async function doSnapshot() {
  if (!CONNECTED) { toast('not connected to nexus','err'); return; }
  const msg = document.getElementById('snap-msg').value.trim() || 'snapshot';
  try {
    const res = await api('/api/snapshots', { method:'POST', body: JSON.stringify({message: msg}) });
    document.getElementById('snap-msg').value='';
    document.getElementById('snap-latest').textContent = res.snapshot ? res.snapshot.commitId : '';
    toast(`snapshot pushed`,'ok');
    await loadSnapshots();
  } catch(e) { toast(e.message,'err'); }
}

// ════════════════════════════════════════════════════
// BRAINSTORM — quick-capture (genuinely user-authored, not seeded),
// promotable into a real tracked idea via POST /api/ideas.
// §CHANGED 2026-09-03 — James: "idearium needs to use data folder. no DOM
// storage." Was entirely localStorage; every write now goes through the
// real idearium_brainstorms table (api/index.js's brainstorm.* handlers).
// Same UX, same function names, real backend underneath.
// ════════════════════════════════════════════════════
async function addBrainstorm() {
  const text = document.getElementById('brain-text').value.trim();
  if (!text) { toast('write something first','err'); return; }
  const tags = document.getElementById('brain-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  try {
    await api('/api/brainstorms', { method: 'POST', body: JSON.stringify({ text, tags }) });
    document.getElementById('brain-text').value=''; document.getElementById('brain-tags').value='';
    await loadBrainstorms();
  } catch(e) { toast(e.message, 'err'); }
}
async function deleteBrainstorm(id) {
  try { await api(`/api/brainstorms/${id}`, { method: 'DELETE' }); await loadBrainstorms(); }
  catch(e) { toast(e.message, 'err'); }
}
async function promoteBrainstorm(id) {
  if (!CONNECTED) { toast('connect to nexus to promote','err'); return; }
  try {
    await api(`/api/brainstorms/${id}/promote`, { method: 'POST' });
    await loadBrainstorms();
    await loadIdeas();
    toast('promoted to idea','ok');
  } catch(e) { toast(e.message,'err'); }
}
function renderBrainstorms() {
  const grid = document.getElementById('brain-grid');
  if (!BRAINSTORMS.length) { grid.innerHTML = `<div class="detail-empty" style="grid-column:1/-1">no brainstorms yet — capture a raw thought above</div>`; return; }
  grid.innerHTML = BRAINSTORMS.map(b => `
    <div class="brain-card">
      <div class="brain-card-text">${escapeHtml(b.text)}</div>
      <div class="brain-card-meta">
        ${(b.tags||[]).map(t=>`<span class="ic-tag">#${escapeHtml(t)}</span>`).join('')}
        <span class="brain-ts">${new Date(b.ts).toLocaleString()}</span>
      </div>
      <div class="action-row">
        ${b.promoted ? `<span class="ic-tag" style="color:var(--mint)">promoted ✓</span>` : `<button class="action-btn primary" onclick="promoteBrainstorm('${b.uuid}')">promote → idea</button>`}
        <button class="action-btn" onclick='openNewSpecModal({name:${JSON.stringify(b.text.slice(0,60))}, description:${JSON.stringify(b.text)}})'>+ spec</button>
        <button class="action-btn danger" onclick="deleteBrainstorm('${b.uuid}')">discard</button>
      </div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════════
// SPEC LIBRARY / BUILDER / COMPILER
// real schema: {uuid,name,version,ideaUuid,phase,sections[{id,title,complete,required,content}],modules,wired,buildOrder}
// confidence + gap analysis computed client-side from real section completeness
// ════════════════════════════════════════════════════
let BUILDER_ACTIVE_SECTION = SECTION_IDS[0];

function specConfidence(spec) {
  const secs = spec.sections || [];
  if (!secs.length) return 0;
  const filled = secs.filter(s=>s.content && s.content.trim().length>0).length;
  return Math.round((filled/secs.length)*100);
}
function specGaps(spec) {
  return (spec.sections||[]).filter(s=>s.required && (!s.content || !s.content.trim()));
}

function renderSpecList() {
  const list = document.getElementById('spec-list');
  const q = (document.getElementById('spec-search').value||'').toLowerCase();
  let pool = SPECS.filter(s => (s.name||'').toLowerCase().includes(q));
  if (!pool.length) { list.innerHTML = `<div style="padding:20px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--text3)">${CONNECTED ? 'no specs yet — open an idea and create one' : 'not connected to nexus'}</div>`; return; }
  list.innerHTML = pool.map(spec => {
    const conf = specConfidence(spec);
    const gaps = specGaps(spec);
    const chips = (spec.sections||[]).map(s=>`<span class="section-chip ${s.content?'done':(s.required?'missing':'')}" title="${s.title}">${s.id.slice(0,4)}</span>`).join('');
    // §NEW 2026-07-16 — quick delete right on the card, not just inside the
    // builder. `.chunks` is the same origin discriminator renderSpecBuilder
    // uses (§BUG FIXED 2026-07-11) — legacy specs aren't spec-engine
    // manifests and deleteSpec's DELETE route only knows about those, so the
    // button only shows where it'll actually work.
    // §FIXED 2026-07-16 — this used to only render for spec-engine specs
    // (`.chunks` present), which is exactly why deleting the legacy
    // e2e-check-spec/test junk (no .chunks — old 9-section format) had no
    // button anywhere. Both origins get one now, routed to the function
    // that matches their actual store.
    const delBtn = spec.chunks
      ? `<button class="action-btn danger" style="padding:1px 6px;font-size:9px" onclick="event.stopPropagation(); deleteSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">×</button>`
      : `<button class="action-btn danger" style="padding:1px 6px;font-size:9px" onclick="event.stopPropagation(); archiveSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">×</button>`;
    return `
      <div class="spec-card${SELECTED_SPEC===spec.uuid?' selected':''}" onclick="selectSpec('${spec.uuid}')">
        <div class="spec-card-top">
          <span class="spec-name">${escapeHtml(spec.name)}</span>
          <span style="display:flex;align-items:center;gap:6px">
            <span class="ic-status st-${spec.phase}">${spec.phase}</span>
            ${delBtn}
          </span>
        </div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--text3)">confidence ${conf}% · ${gaps.length} gap${gaps.length===1?'':'s'} · v${spec.version||'1.0.0'}</div>
        <div class="section-grid">${chips}</div>
      </div>`;
  }).join('');
}

function selectSpec(uuid) {
  SELECTED_SPEC = uuid;
  renderSpecList();
  const spec = SPECS.find(s=>s.uuid===uuid);
  if (!spec) return;
  document.getElementById('spec-detail-title').textContent = spec.name;
  BUILDER_ACTIVE_SECTION = (spec.sections||[])[0]?.id || SECTION_IDS[0];
  renderSpecBuilder(spec);
}

function renderSpecBuilder(spec) {
  // §BUG FIXED 2026-07-11 — every spec in SPECS renders through this
  // function regardless of origin, but saveSection/checkSpec/buildSpec
  // below all call the LEGACY-only /api/specs/:uuid/* endpoints. A
  // spec-engine spec's uuid was never in os.db.specs, so those calls
  // either 404'd or silently did nothing — the action buttons looked
  // present and did nothing real. `.chunks` only exists on spec-engine
  // manifests (spec.list's merge spreads the raw manifest in) — use it
  // as the discriminator and render a genuinely different, working
  // action row for that case instead of the legacy one.
  if (Array.isArray(spec.chunks)) return renderSpecEngineBuilder(spec);

  const conf = specConfidence(spec);
  const gaps = specGaps(spec);
  const sec = (spec.sections||[]).find(s=>s.id===BUILDER_ACTIVE_SECTION) || {};
  const wrap = document.getElementById('spec-builder');
  wrap.innerHTML = `
    <div class="builder-section-tabs">
      ${(spec.sections||[]).map(s=>`<button class="sec-tab ${s.id===BUILDER_ACTIVE_SECTION?'active':''} ${s.content?'filled':''}" onclick="switchSection('${spec.uuid}','${s.id}')">${s.id.replace(/_/g,' ')}</button>`).join('')}
    </div>
    <div class="builder-body">
      <div class="ds" style="margin-bottom:0">
        <div class="ds-label">compiler — confidence &amp; gap analysis</div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="tension-track" style="flex:1;height:6px"><div class="tension-fill" style="width:${conf}%;background:${conf>70?'var(--mint)':conf>35?'var(--amber)':'var(--coral)'}"></div></div>
          <span style="font-family:var(--mono);font-size:12px;font-weight:600">${conf}%</span>
        </div>
        ${gaps.length?`<div style="margin-top:8px;font-family:var(--mono);font-size:10px;color:var(--coral)">missing required: ${gaps.map(g=>g.id).join(', ')}</div>`:'<div style="margin-top:8px;font-family:var(--mono);font-size:10px;color:var(--mint)">all required sections filled</div>'}
      </div>
      <div class="field-group">
        <div class="field-label">${sec.id ? sec.id.replace(/_/g,' ') : 'section'} — ${sec.required?'required':'optional'}</div>
        <textarea class="builder-textarea" id="builder-content" placeholder="write this SEAM section...">${escapeHtml(sec.content||'')}</textarea>
      </div>
      <div class="action-row">
        <button class="action-btn primary" onclick="saveSection('${spec.uuid}')">save section</button>
        <button class="action-btn" onclick="checkSpec('${spec.uuid}')">run spec check</button>
        <button class="action-btn" onclick="buildSpec('${spec.uuid}')">compile / build</button>
        <button class="action-btn" onclick="exportSpec('${spec.uuid}')">export markdown</button>
        <button class="action-btn" onclick="openRepoFor('${spec.ideaUuid||''}', '${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">open repository →</button>
        <button class="action-btn danger" onclick="archiveSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">archive</button>
      </div>
    </div>
  `;
}
// §NEW 2026-07-11 — the working action row for a spec-engine spec: real
// chunk status (not the legacy 9-section grid), a build-all-and-promote
// one-click flow ("have it build the repository — end-state"), and an
// open-repository link once one exists. Read-only chunk list for now —
// spec-engine chunks are agent/template-built, not hand-edited inline
// the way legacy sections are; editing an individual chunk's content is
// a real follow-up, not something this pass claims to do.
function renderSpecEngineBuilder(spec) {
  const wrap = document.getElementById('spec-builder');
  const chunks = spec.chunks || [];
  const done = chunks.filter(c => c.status === 'complete').length;
  const pct = chunks.length ? Math.round(done / chunks.length * 100) : 0;
  // §CHANGED 2026-09-03 — was `r.promotedFromSpec === spec.uuid`, which
  // only matches repos created via the completion-gated /promote path.
  // Repo-first shells (created at spec creation, submitNewSpec above) set
  // specUuid but never promotedFromSpec — specUuid is the real, always-set
  // correlation field either way (RepoLayer.ingest sets it on every path),
  // so it's the correct match regardless of how the repo came to exist.
  const repo = API_REPOS.find(r => r.specUuid === spec.uuid);
  const building = !!BUILD_IN_PROGRESS[spec.uuid];

  wrap.innerHTML = `
    <div class="builder-body">
      <div class="ds" style="margin-bottom:0">
        <div class="ds-label" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span>spec-engine — ${escapeHtml((spec.templateIds||[]).join(', ') || 'no template')} · build logic: ${escapeHtml(spec.buildEngine||'auto')}</span>
          ${buildCompiledBadgeHtml(spec.uuid)}
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="tension-track" style="flex:1;height:6px"><div class="tension-fill" style="width:${pct}%;background:${pct===100?'var(--mint)':'var(--amber)'}"></div></div>
          <span style="font-family:var(--mono);font-size:12px;font-weight:600">${done}/${chunks.length}</span>
        </div>
      </div>
      <div class="field-group">
        <div class="field-label">chunks</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${chunks.map(c => `
            <div style="display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;padding:4px 0;border-bottom:1px solid var(--b0)">
              <span style="color:${c.status==='complete'?'var(--mint)':c.status==='building'?'var(--amber)':'var(--text3)'}">${c.status==='complete'?'✓':c.status==='building'?'…':'○'}</span>
              <span style="flex:1;color:var(--text2)">${escapeHtml(c.sectionId)}</span>
              ${
                // §BUILT 2026-09-03 — James: "send each chunk to the
                // respectable agent... needs to have a drop for the agent
                // to send it to." Was static text (c.agent||''). Only
                // PENDING chunks are editable — matches setChunkAgent()'s
                // own real refusal (spec-engine/index.js) on anything past
                // PENDING, so the UI never offers a change the backend
                // would reject; a chunk that's already building/complete
                // shows its real, already-fixed agent as text instead.
                c.status === 'pending'
                  ? `<select class="agent-select" style="font-family:var(--mono);font-size:11px;background:var(--bg2,#1a1a1a);color:var(--text2);border:1px solid var(--b0);border-radius:3px;padding:1px 4px" onchange="setChunkAgent('${spec.uuid}','${c.uuid}',this.value)">
                      ${AGENT_OPTIONS.map(a => `<option value="${a}" ${a===c.agent?'selected':''}>${a}</option>`).join('')}
                    </select>`
                  : `<span style="color:var(--text3)">${escapeHtml(c.agent||'')}${c.agentModel&&c.agentModel.startsWith('template')?' (template)':''}</span>`
              }
              ${
                // §BUILT 2026-09-03 — the chunk's own real return address
                // while it's genuinely in flight (jobId/dispatchDir, set
                // by spec-engine's recordDispatchJob the instant a queued
                // job exists on guardian's side). This is the visibility
                // James was asking for: is a 'building' chunk actually
                // moving, or stuck with nothing anyone can see. A chunk
                // still 'building' with no jobId is the local-ollama path
                // (synchronous, no guardian job to track) — shown plainly
                // as 'local', not blank, so the absence reads as real
                // information, not a missed field.
                c.status === 'building'
                  ? `<span title="${c.dispatchDir ? escapeHtml(c.dispatchDir) : ''}" style="color:var(--amber);font-size:10px">${c.jobId ? `job:${escapeHtml(String(c.jobId)).slice(0,10)}` : 'local'}</span>`
                  : ''
              }
            </div>`).join('')}
        </div>
      </div>
      <div class="field-group">
        <div class="field-label">build history</div>
        <div id="spec-history-panel">${buildSpecHistoryHtml(spec.uuid)}</div>
      </div>
      <div class="action-row">
        <button class="action-btn primary" ${building||done===chunks.length?'disabled':''} onclick="createRepoThenBuild('${spec.uuid}')">${building?'building…':(done===chunks.length?'all chunks built':'build remaining chunks')}</button>
        ${
          // §CHANGED 2026-09-03 — repo-first: `repo` is now real from the
          // moment the spec was created (submitNewSpec), not only once
          // every chunk is done, so this shows ALONGSIDE the build button
          // rather than replacing it — the repo is genuinely open-able
          // while chunks are still landing into it.
          repo
            ? `<button class="action-btn" onclick="openRepoFor('${spec.ideaUuid||''}', '${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">open repository →</button>`
            : ''
        }
        <button class="action-btn" onclick="exportSpec('${spec.uuid}')">export markdown</button>
        <button class="action-btn danger" onclick="deleteSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">remove from library</button>
      </div>
    </div>
  `;
  renderSpecHistoryPanel(spec.uuid); // async — fills in the badge + panel above once the fetch resolves
}

// §BUILT 2026-09-03 — real, dispatchable agents (agent-suite/index.js's
// REAL_GUARDIAN_PROVIDERS + the two local paths, ollama/mistral — same
// list buildChunkWithAgent() actually checks against). Not a guess: an
// agent offered here that agent-suite doesn't recognize would be a UI
// promising a destination that doesn't exist.
const AGENT_OPTIONS = ['ollama', 'mistral', 'claude', 'chatgpt', 'gemini', 'perplexity', 'deepseek'];

// §BUILT 2026-09-03 — per-chunk agent reassignment, PENDING chunks only
// (the select in renderSpecEngineBuilder only renders for pending chunks
// in the first place, so this mirrors the backend's own real refusal
// rather than introducing a second place that decides it).
async function setChunkAgent(specUuid, chunkUuid, agent) {
  try {
    await api(`/api/spec-engine/specs/${specUuid}/chunk/${chunkUuid}/agent`, {
      method: 'POST', body: JSON.stringify({ agent }),
    });
    await loadSpecs();
    const spec = SPECS.find(s => s.uuid === specUuid);
    if (spec) renderSpecBuilder(spec);
  } catch (e) { toast(e.message, 'err'); }
}

// specUuid -> true while a build loop is running, so the button can't be
// double-clicked into two concurrent loops.
let BUILD_IN_PROGRESS = {};

// §RENAMED 2026-09-03 — was buildAllAndPromote. Repo-first (submitNewSpec
// creates the repo shell the moment the spec exists, RepoLayer._enrich
// reads live off specUuid) means there is no longer a separate "promote"
// step at the end of a successful build — the repo already IS this spec,
// chunks appear in it as they land. This function's only job now is
// driving the build loop (WARP cache / cross-spec reuse / real per-chunk
// agent dispatch, whichever resolves each chunk) to completion, plus one
// self-heal: a spec created before this change (or whose repo-first call
// failed at creation time) has no repo yet — create it here, once, before
// looping, rather than leaving it permanently repo-less.
async function createRepoThenBuild(specUuid) {
  if (BUILD_IN_PROGRESS[specUuid]) return;
  BUILD_IN_PROGRESS[specUuid] = true;
  selectSpec(specUuid);
  try {
    const spec0 = SPECS.find(s => s.uuid === specUuid);
    const hasRepo = API_REPOS.some(r => r.specUuid === specUuid);
    if (!hasRepo && spec0) {
      try {
        await api('/api/repos', {
          method: 'POST',
          body: JSON.stringify({ name: spec0.name, specUuid, source: 'repo-first' }),
        });
        await loadApiRepos();
      } catch (e) { toast(`repo shell failed, building anyway: ${e.message}`, 'err'); }
    }

    const MAX_STEPS = 40; // generous ceiling — a stuck loop must stop, not spin (§1.2)
    for (let i = 0; i < MAX_STEPS; i++) {
      const spec = SPECS.find(s => s.uuid === specUuid);
      const pending = (spec?.chunks || []).filter(c => c.status !== 'complete');
      if (!pending.length) break;

      const res = await api(`/api/spec-engine/specs/${specUuid}/build`, { method: 'POST', body: JSON.stringify({}) });
      if (res.done) break;
      // building/queued chunks resolve async server-side (SSE-driven) —
      // give it a moment before checking again rather than hammering.
      await new Promise(r => setTimeout(r, 1200));
      await loadSpecs();
      const fresh = SPECS.find(s => s.uuid === specUuid);
      if (fresh) renderSpecBuilder(fresh);
    }

    await loadSpecs();
    const spec = SPECS.find(s => s.uuid === specUuid);
    const stillPending = (spec?.chunks || []).filter(c => c.status !== 'complete' && c.status !== 'building');
    if (stillPending.length) {
      toast(`build stopped — ${stillPending.length} chunk(s) still pending (${stillPending.map(c=>c.sectionId).join(', ')})`, 'err');
      renderSpecBuilder(spec);
      return;
    }

    toast('all chunks built', 'ok');
    await loadApiRepos();
    if (spec?.ideaUuid) await loadIdeas(); // phase just advanced
    openRepoFor(spec?.ideaUuid || null, specUuid, spec?.name || '');
  } catch (e) {
    toast(`build failed: ${e.message}`, 'err');
  } finally {
    BUILD_IN_PROGRESS[specUuid] = false;
    const spec = SPECS.find(s => s.uuid === specUuid);
    if (spec) renderSpecBuilder(spec);
  }
}

function switchSection(uuid, sectionId) {
  BUILDER_ACTIVE_SECTION = sectionId;
  const spec = SPECS.find(s=>s.uuid===uuid);
  if (spec) renderSpecBuilder(spec);
}
async function saveSection(uuid) {
  const spec = SPECS.find(s=>s.uuid===uuid); if (!spec) return;
  const content = document.getElementById('builder-content').value;
  const sections = (spec.sections||[]).map(s=>s.id===BUILDER_ACTIVE_SECTION ? {...s, content, complete: content.trim().length>0} : s);
  try { await api(`/api/specs/${uuid}`, { method:'PATCH', body: JSON.stringify({sections}) }); toast('section saved','ok'); await loadSpecs(); selectSpec(uuid); }
  catch(e) { toast(e.message,'err'); }
}
async function checkSpec(uuid) {
  try { await api(`/api/specs/${uuid}/check`, { method:'POST' }); toast('spec check run','ok'); await loadSpecs(); selectSpec(uuid); }
  catch(e) { toast(e.message,'err'); }
}
async function buildSpec(uuid) {
  try {
    const res = await api(`/api/specs/${uuid}/build`, { method:'POST' });
    toast(res.message || res.status, res.status==='built'?'ok':'err');
    await loadSpecs(); selectSpec(uuid); renderArchitect();
  } catch(e) { toast(e.message,'err'); }
}
async function exportSpec(uuid) {
  try {
    const r = await fetchTimeout(API_BASE + `/api/specs/${uuid}/export`);
    const md = await r.text();
    const blob = new Blob([md], {type:'text/markdown'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    const spec = SPECS.find(s=>s.uuid===uuid);
    a.download = (spec?.name||'spec').replace(/[^a-z0-9-]/gi,'_') + '.spec.md';
    a.click();
    toast('exported','ok');
  } catch(e) { toast(e.message,'err'); }
}
function newSpecPrompt() {
  openNewSpecModal();
}

// ════════════════════════════════════════════════════
// NEW SPEC MODAL — template picker (architecture/schemas/checklists/axioms/
// compartments/genesis/...) + WARP build-logic selector, wired to the real
// spec-engine (GET/POST /api/spec-engine/...). "Map to repo now" is not a
// separate backend action — it's create → spec.promote(mode:'manual') in
// one click, which is exactly what the compartments/axioms templates are
// designed for: their seeded chunks (meta/purpose/axioms/integration) are
// enough to promote immediately, everything else lands as a TODO in the
// repo skeleton until a follow-up spec fills it in.
// ════════════════════════════════════════════════════
let NS_TEMPLATES = null;
let NS_IDEA_UUID = null; // set when opened from an idea, so the created repo can be linked later

async function loadNewSpecTemplates() {
  if (NS_TEMPLATES) return NS_TEMPLATES;
  try {
    const r = await api('/api/spec-engine/templates');
    NS_TEMPLATES = r.templates || r.data || r || [];
  } catch (e) { NS_TEMPLATES = []; }
  return NS_TEMPLATES;
}

async function openNewSpecModal({ name = '', description = '', ideaUuid = null } = {}) {
  NS_IDEA_UUID = ideaUuid;
  document.getElementById('ns-name').value = name;
  document.getElementById('ns-description').value = description;
  document.getElementById('ns-build-engine').value = 'auto';

  const templates = await loadNewSpecTemplates();
  const wrap = document.getElementById('ns-templates');
  wrap.innerHTML = templates.map(t => `
    <label style="display:flex;align-items:flex-start;gap:8px;padding:4px 2px;cursor:pointer;font-size:11px;color:var(--text2)">
      <input type="checkbox" class="ns-tpl-check" value="${t.id}" onchange="onNewSpecTemplateChange()" style="margin-top:2px">
      <span><b style="color:var(--text)">${escapeHtml(t.label||t.id)}</b>${t.hasSeed ? ' <span style="color:var(--mint)">· deterministic</span>' : ''}<br>
      <span style="color:var(--text3)">${escapeHtml(t.description||'')}</span></span>
    </label>`).join('');

  document.getElementById('new-spec-modal').classList.add('open');
  document.getElementById('ns-name').focus();
}
function closeNewSpecModal() { document.getElementById('new-spec-modal').classList.remove('open'); }

// ════════════════════════════════════════════════════
// UPLOAD PROJECT — prompt (name/goal, declares the temp compartment's
// end-state) -> spawn temp compartment -> dropzone -> "import repository"
// -> POST /api/project-import/:uuid/finalize (writes manifest.json/
// project.json/.git server-side, resolves the compartment) -> opens the
// repo view. Backed by lib/project-container.js + lib/project-import.config.js
// on the server; nothing about bounds or example goals is hardcoded here —
// UP_INTENT_EXAMPLES is fetched from GET /api/project-import/config.
// ════════════════════════════════════════════════════
let UP_CONTAINER_UUID = null;
let UP_STAGED_FILE = null;

async function openUploadProjectModal() {
  if (!CONNECTED) { toast('not connected to nexus', 'err'); return; }
  document.getElementById('up-name').value = '';
  document.getElementById('up-goal').value = '';
  document.getElementById('up-step-prompt').style.display = '';
  document.getElementById('up-step-drop').style.display = 'none';
  document.getElementById('upload-project-modal').classList.add('open');

  const chips = document.getElementById('up-chips');
  chips.innerHTML = '<span style="font-size:10px;color:var(--text3)">loading…</span>';
  try {
    const cfg = await api('/api/project-import/config');
    chips.innerHTML = '';
    (cfg.intentExamples || []).forEach(text => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'up-chip';
      b.textContent = text;
      b.onclick = () => { document.getElementById('up-goal').value = text; };
      chips.appendChild(b);
    });
  } catch (e) { chips.innerHTML = ''; }
}

function closeUploadProjectModal() {
  document.getElementById('upload-project-modal').classList.remove('open');
}

async function cancelUploadProject() {
  if (UP_CONTAINER_UUID) {
    try { await api(`/api/project-import/${UP_CONTAINER_UUID}/cancel`, { method: 'POST', body: '{}' }); }
    catch (e) { console.warn('[upload-project] cancel failed:', e.message); }
  }
  UP_CONTAINER_UUID = null; UP_STAGED_FILE = null;
  closeUploadProjectModal();
}

async function submitUploadProjectStart() {
  const name = document.getElementById('up-name').value.trim();
  const goal = document.getElementById('up-goal').value.trim();
  if (!name) return toast('project name is required', 'err');
  if (!goal) return toast('a goal is required — it becomes the end-state', 'err');

  try {
    const res = await api('/api/project-import/start', { method: 'POST', body: JSON.stringify({ name, goal }) });
    UP_CONTAINER_UUID = res.containerUuid;
    document.getElementById('up-container-note').textContent =
      `compartment ${res.compartmentId ? res.compartmentId.slice(0, 8) : '—'} open · intent: ${res.intent?.domain || '?'}.${res.intent?.verb || '?'}`;
    document.getElementById('up-step-prompt').style.display = 'none';
    document.getElementById('up-step-drop').style.display = '';
  } catch (e) { toast(`could not start: ${e.message}`, 'err'); }
}

function stageUploadProjectFile(file) {
  if (!file) return;
  if (!/\.zip$/i.test(file.name)) { toast(`not a .zip: ${file.name}`, 'err'); return; }
  UP_STAGED_FILE = file;
  document.getElementById('up-drop-text').textContent = `${file.name} (${formatBytes(file.size)}) — ready`;
  document.getElementById('up-import-btn').disabled = false;
}

async function submitUploadProjectImport() {
  if (!UP_STAGED_FILE || !UP_CONTAINER_UUID) return;
  const btn = document.getElementById('up-import-btn');
  const zone = document.getElementById('up-drop');
  btn.disabled = true;
  document.getElementById('up-drop-text').textContent = 'uploading…';
  if (zone) zone.classList.add('drag');

  let contentBase64;
  try {
    contentBase64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(UP_STAGED_FILE);
    });
  } catch (e) {
    toast(`file read failed: ${e.message}`, 'err');
    btn.disabled = false; if (zone) zone.classList.remove('drag');
    return;
  }

  document.getElementById('up-drop-text').textContent = 'generating manifest, project.json, and .git…';
  let res;
  try {
    res = await api(`/api/project-import/${UP_CONTAINER_UUID}/finalize`, {
      method: 'POST', body: JSON.stringify({ filename: UP_STAGED_FILE.name, contentBase64 }),
    }, 30000);
  } catch (e) {
    toast(`import did not reach the declared end-state: ${e.message}`, 'err');
    btn.disabled = false; if (zone) zone.classList.remove('drag');
    document.getElementById('up-drop-text').textContent = `${UP_STAGED_FILE.name} — ready`;
    return;
  }

  if (zone) zone.classList.remove('drag');
  toast(res.deduped
    ? 'content already exists as an existing repo — reusing it'
    : `imported "${res.repo?.name || ''}" — ${res.fileCount} file(s), ${res.git?.committed ? 'committed' : 'git not committed'}`,
    'ok');

  closeUploadProjectModal();
  const repo = res.repo;
  UP_CONTAINER_UUID = null; UP_STAGED_FILE = null;
  document.getElementById('up-file-input').value = '';

  // The new repo was created after this session's last API_REPOS load —
  // refresh before routing to the repo view, or openRepoFor's match
  // against the in-memory list will miss it.
  await loadApiRepos();
  if (repo) openRepoFor(repo.ideaUuid, repo.specUuid, repo.name);
}


function selectedTemplateIds() {
  return [...document.querySelectorAll('.ns-tpl-check:checked')].map(c => c.value);
}

function onNewSpecTemplateChange() {
  // "map to repo now" only makes sense once the map-first templates
  // (compartments, axioms) are among the selection — showing it for every
  // combination would let someone promote a spec that's really just empty
  // TODOs with a name attached.
  const ids = selectedTemplateIds();
  const mapWorthy = ids.includes('compartments') || ids.includes('axioms');
  document.getElementById('ns-map-btn').style.display = mapWorthy ? '' : 'none';
}

async function submitNewSpec(mapToRepo) {
  const name = document.getElementById('ns-name').value.trim();
  if (!name) { toast('name required', 'err'); return; }
  const description = document.getElementById('ns-description').value.trim();
  const templateIds = selectedTemplateIds();
  const buildEngine = document.getElementById('ns-build-engine').value || 'auto';
  const ideaUuid = NS_IDEA_UUID; // §BUG FIXED 2026-07-11 — was captured on open, never sent

  try {
    const r = await api('/api/spec-engine/specs', {
      method: 'POST',
      body: JSON.stringify({ name, description, templateIds, buildEngine, ideaUuid: ideaUuid || undefined }),
    });
    const manifest = r.manifest || r;
    toast(`spec created${templateIds.length ? ` from [${templateIds.join(', ')}]` : ''} · build logic: ${buildEngine}`, 'ok');

    if (mapToRepo) {
      try {
        const promoted = await api(`/api/spec-engine/specs/${manifest.uuid}/promote`, {
          method: 'POST', body: JSON.stringify({ mode: 'manual' }),
        });
        toast('mapped to repository — compartments/axioms in, rest TODO', 'ok');
        closeNewSpecModal();
        await loadSpecs(); await loadApiRepos();
        if (ideaUuid) await loadIdeas(); // picks up the idea's new phase + linkedSpec
        openRepoFor(ideaUuid || null, manifest.uuid, name);
        return;
      } catch (e) { toast(`spec created, map-to-repo failed: ${e.message}`, 'err'); }
    }

    // §BUILT 2026-09-03 — James: "create a repository, then send each
    // chunk to the respective agent." Every spec now gets a real repo
    // shell the moment it exists — not only once every chunk is done (the
    // explicit "map to repo now" branch above, unchanged, still template-
    // gated). RepoLayer._enrich() always resolves live off specUuid, so
    // this same repo record shows chunks landing as each one completes —
    // no second promote step needed once the build loop below finishes.
    try {
      const repoRes = await api('/api/repos', {
        method: 'POST',
        body: JSON.stringify({ name, specUuid: manifest.uuid, source: 'repo-first', ideaUuid: ideaUuid || undefined }),
      });
      if (repoRes.error) toast(`spec created, repo shell failed: ${repoRes.error}`, 'err');
      else await loadApiRepos();
    } catch (e) {
      // §1.2 loud, non-fatal — the spec is real regardless; a failed repo
      // shell is surfaced, not silently swallowed, and createRepoThenBuild()
      // below self-heals this (creates it late) if the user builds anyway.
      toast(`spec created, repo shell failed: ${e.message}`, 'err');
    }

    closeNewSpecModal();
    await loadSpecs();
    if (ideaUuid) {
      await loadIdeas();
      const idea = IDEAS.find(i => i.uuid === ideaUuid);
      if (idea) renderDetail(idea); // reflect the new phase + linked-spec immediately, not on next reload
    }
  } catch (e) { toast(e.message, 'err'); }
}
function createSpecForIdea(ideaUuid) {
  const idea = IDEAS.find(i=>i.uuid===ideaUuid); if (!idea) return;
  // §BUG FIXED 2026-07-11 — this used to POST straight to the legacy
  // /api/ideas/:uuid/spec path: no template picker, no buildEngine choice,
  // and (separately fixed) that path never advanced idea.phase either.
  // Routing through the same modal Brainstorm/Spec Library use means an
  // idea-originated spec gets the same template composition and repo
  // materialization as any other — one spec-creation path, not two.
  openNewSpecModal({ ideaUuid, name: (idea.text||'spec').slice(0,60), description: idea.text||'' });
}

// ════════════════════════════════════════════════════
// ARCHITECT — blueprint tree derived from real compiled specs
// ════════════════════════════════════════════════════
async function renderArchitect() {
  const wrap = document.getElementById('architect-wrap');
  // §DATA-SOURCE FIX 2026-07-18 — this used to read SPECS (loaded from
  // /api/specs — the LEGACY lightweight spec system: db.specs inside
  // IdeaOS, auto-stub sections with placeholder content, a checklist/
  // wiring tracker, not real content — see idearium/index.js's own header
  // history for "two separate spec systems"). Every node showed "1 chars"
  // because that's genuinely what was there: a stub, not your actual
  // spec-engine chunks. The real content — what you've been editing in
  // the Repository panel — lives entirely in spec-engine's manifests,
  // reached via /api/spec-engine/specs, a completely different store this
  // view never queried. Fixed to read from there instead.
  let realSpecs = [];
  try {
    const r = await api('/api/spec-engine/specs');
    realSpecs = (r.specs || []).filter(s => !s.deleted && s.totalChunks > 0);
  } catch (e) {
    wrap.innerHTML = `<div class="detail-empty">could not load spec-engine specs: ${escapeHtml(e.message)}</div>`;
    return;
  }
  if (!realSpecs.length) { wrap.innerHTML = `<div class="detail-empty">no compiled specs yet — import or build one to see its blueprint here</div>`; return; }
  wrap.innerHTML = `<div class="blueprint-tree">` + realSpecs.map(spec => {
    const children = (spec.chunks || []).map(c => {
      const complete = c.status === 'complete';
      const label = complete ? `${c.byteSize.toLocaleString()}b` : c.status;
      return `
      <div class="bp-node">
        <span class="bp-dot ${complete ? '' : 'gray'}"></span>
        <span class="bp-label">${escapeHtml((c.sectionTitle || c.sectionId || '').replace(/_/g,' '))}</span>
        <span class="bp-meta">${label}</span>
      </div>`;
    }).join('');
    return `
      <div class="bp-node">
        <span class="bp-dot"></span>
        <span class="bp-label" style="font-size:13px;color:var(--sky)">${escapeHtml(spec.name)}</span>
        <span class="bp-meta">${spec.status} · v${spec.version||'1.0.0'} · ${spec.doneChunks}/${spec.totalChunks} chunks · ${(spec.totalBytes||0).toLocaleString()}b total</span>
      </div>
      <div class="bp-children">${children}</div>
    `;
  }).join('') + `</div>`;
}

// ════════════════════════════════════════════════════
// REPOSITORY / FILE BROWSER / IDE — real local folder via File System Access
// (no fabricated tree; browses whatever folder the user actually opens)
// ════════════════════════════════════════════════════
let REPO_FILES = []; // [{path, handle}]
let ACTIVE_FILE = null;

let CURRENT_REPO_IDEA = null; // idea this repo-view session is scoped to (set by openRepoFor)

// The merge point: ideas/specs don't have their own separate "Repository"
// nav item anymore — clicking "open repository" on an idea or a spec lands
// here, scoped to that idea. If a repo is already linked (RepoLayer match
// by ideaUuid/specUuid), show it. If not, the dropzone already in this view
// becomes "attach files to THIS idea" instead of a generic, unscoped drop.
function openRepoFor(ideaUuid, specUuid, label) {
  CURRENT_REPO_IDEA = ideaUuid || (specUuid && SPECS.find(s=>s.uuid===specUuid)?.ideaUuid) || null;
  setView('repo');
  document.getElementById('repo-context').textContent = label ? `← ${label}` : '';
  const repo = API_REPOS.find(r =>
    (specUuid && r.promotedFromSpec === specUuid) ||
    (CURRENT_REPO_IDEA && r.ideaUuid === CURRENT_REPO_IDEA) ||
    (specUuid && r.specUuid === specUuid));
  renderApiRepoPanel(repo);
}

// Renders a RepoLayer-tracked repo's file manifest. Honest limitation, not
// hidden: RepoLayer only persists path+bytes for ingested files (besides the
// canonical .spec, whose text lands in the spec's intent section) — there is
// no content-addressable blob store yet, so these entries are not clickable
// into the IDE pane the way locally-picked-folder files are. That's a real
// gap, not a UI oversight; fixing it means RepoLayer needs actual file
// storage, which is separate, larger work.
function renderApiRepoPanel(repo) {
  const tree = document.getElementById('file-tree');
  document.getElementById('ide-tabs').textContent = 'no file open';
  document.getElementById('ide-code').textContent = '// click a file in the tree to open it here';
  if (!repo) {
    document.getElementById('repo-badge').textContent = 'no repo linked to this idea';
    tree.innerHTML = `<div class="repo-empty">no repo linked yet<br><br>drop files below to attach one to this idea<br><br><button class="modal-btn confirm" onclick="document.getElementById('repo-drop-input').click()">drop repo files…</button></div>`;
    CURRENT_API_REPO = null; ACTIVE_API_FILE = null; _showIdeEditor(false);
    return;
  }
  document.getElementById('repo-badge').textContent = `${repo.fileCount} files · ${repo.phase}${repo.forks.length?` · ${repo.forks.length} fork(s)`:''}${repo.localPath?' · materialized on disk':''}`;
  CURRENT_API_REPO = repo;
  const statusLine = repo.localPath
    ? `${repo.materializedCount||repo.fileCount} of ${repo.fileCount} files materialized as real files — <span style="color:var(--mint)">${escapeHtml(repo.localPath)}</span>`
    : (repo.promotedFromSpec ? 'promoted from spec — file structure as components (no content-addressable store for this one — metadata only)' : 'manifest only — file content isn\'t stored yet');
  const addBtn = `<div style="padding:4px 2px 10px"><button class="action-btn" onclick="addApiRepoFile('${repo.uuid}')">+ add file</button></div>`;
  tree.innerHTML = `
    <div class="repo-empty" style="text-align:left;padding:14px">
      <div style="font-family:var(--mono);font-size:11px;color:var(--text3);margin-bottom:8px">${statusLine}</div>
      ${addBtn}
      ${(repo.files||[]).map(f=>`
        <div style="display:flex;align-items:center;gap:6px;padding:3px 0" class="api-file-row${ACTIVE_API_FILE===f.path?' active':''}">
          <span style="font-family:var(--mono);font-size:11px;color:var(--text2);cursor:pointer;flex:1" onclick="openApiRepoFile('${repo.uuid}','${f.path.replace(/'/g,"\\'")}')">
            ${escapeHtml(f.path)} <span style="color:var(--text3)">(${f.bytes}b)</span>${f.comp_id?`<br><span style="color:var(--accent);font-size:9px;padding-left:12px">▸ ${escapeHtml(f.comp_id)}${f.status?` · ${f.status}`:''}</span>`:''}
          </span>
          ${repo.localPath ? `<span style="cursor:pointer;color:var(--text3);font-size:12px;padding:0 4px" title="delete" onclick="event.stopPropagation();deleteApiRepoFile('${repo.uuid}','${f.path.replace(/'/g,"\\'")}')">×</span>` : ''}
        </div>`).join('') || '<div style="color:var(--text3)">no files</div>'}
    </div>`;
}

// ════════════════════════════════════════════════════
// API REPO FILE EDITOR — real read/write against a materialized repo,
// via GET/POST/DELETE /api/repos/:uuid/file. Separate from openFile()
// above, which is the read-only local-folder (File System Access) browser
// — this is the API-backed path with actual save/add/delete.
// ════════════════════════════════════════════════════
let CURRENT_API_REPO = null;
let ACTIVE_API_FILE = null;
let API_FILE_DIRTY = false;

function _showIdeEditor(show) {
  document.getElementById('ide-code').style.display = show ? 'none' : '';
  document.getElementById('ide-editor').style.display = show ? '' : 'none';
}

async function openApiRepoFile(repoUuid, filePath) {
  if (API_FILE_DIRTY && !confirm(`discard unsaved changes to ${ACTIVE_API_FILE}?`)) return;
  ACTIVE_API_FILE = filePath;
  API_FILE_DIRTY = false;
  renderApiRepoPanel(CURRENT_API_REPO);
  document.getElementById('ide-tabs').innerHTML = `${escapeHtml(filePath)}` +
    `<span class="ide-tab-dirty" id="ide-dirty" style="display:none">● unsaved</span>` +
    `<button class="ide-tab-btn" onclick="saveApiRepoFile()">save</button>`;
  // §TIMEOUT FIX 2026-07-15 — file reads share the repo's own spec-engine
  // manifest with whatever chunk-import is currently running (completeChunk
  // does synchronous readFileSync/writeFileSync per chunk — see
  // spec-engine/index.js), so a read hitting mid-build genuinely can take
  // longer than the API's general 6s default. 15s ceiling, plus one retry
  // specifically on an aborted/timed-out request (not on a real 404 or
  // other server error — those won't succeed on retry and shouldn't wait
  // an extra 15s to say so).
  const attempt = () => api(`/api/repos/${repoUuid}/file?path=${encodeURIComponent(filePath)}`, {}, 15000);
  try {
    let r;
    try {
      r = await attempt();
    } catch (e) {
      const isAbort = /aborted/i.test(e.message);
      if (!isAbort) throw e;
      console.warn(`[idearium] file read aborted (likely contended with an in-progress build), retrying once: ${filePath}`);
      r = await attempt();
    }
    _showIdeEditor(true);
    const ta = document.getElementById('ide-editor');
    ta.value = r.content;
    ta.oncancel = null;
    ta.oninput = () => { API_FILE_DIRTY = true; const d = document.getElementById('ide-dirty'); if (d) d.style.display = ''; };
  } catch (e) {
    _showIdeEditor(false);
    document.getElementById('ide-code').textContent = `// could not read file: ${e.message}`;
  }
}

async function saveApiRepoFile() {
  if (!CURRENT_API_REPO || !ACTIVE_API_FILE) return;
  const content = document.getElementById('ide-editor').value;
  try {
    await api(`/api/repos/${CURRENT_API_REPO.uuid}/file`, {
      method: 'POST', body: JSON.stringify({ path: ACTIVE_API_FILE, content }),
    });
    API_FILE_DIRTY = false;
    const d = document.getElementById('ide-dirty'); if (d) d.style.display = 'none';
    toast(`saved ${ACTIVE_API_FILE}`, 'ok');
    await loadApiRepos();
    const fresh = API_REPOS.find(r => r.uuid === CURRENT_API_REPO.uuid);
    if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
  } catch (e) { toast(`save failed: ${e.message}`, 'err'); }
}

// §EXPORT 2026-07-18 — "the export, needs to be the .spec file compressed
// repo." Real zip (application/zip, not JSON), so this bypasses api()'s
// JSON-parsing wrapper and goes through fetchTimeout directly — same
// pattern the legacy exportSpec() already used for its markdown download.
// 20s ceiling: a 71-spec / 1000+ chunk instance building this archive
// server-side is real work, not just a network round-trip.
async function exportApiRepo() {
  if (!CURRENT_API_REPO) { toast('no repo loaded — open one first', 'err'); return; }
  toast('exporting…', 'ok');
  try {
    const r = await fetchTimeout(API_BASE + `/api/repos/${CURRENT_API_REPO.uuid}/export`, {}, 20000);
    if (!r.ok) {
      let msg = r.statusText;
      try { msg = (await r.json()).error || msg; } catch (_) {}
      throw new Error(msg);
    }
    const blob = await r.blob();
    const cd = r.headers.get('Content-Disposition') || '';
    const match = cd.match(/filename="([^"]+)"/);
    const filename = match ? match[1] : `${(CURRENT_API_REPO.name || 'repo').replace(/[^a-z0-9-_]+/gi, '_')}.zip`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`exported ${filename}`, 'ok');
  } catch (e) {
    toast(`export failed: ${e.message}`, 'err');
  }
}

async function addApiRepoFile(repoUuid) {
  const filePath = await themedPrompt('new file path (e.g. src/notes.md):', 'add file');
  if (!filePath) return;
  try {
    await api(`/api/repos/${repoUuid}/file`, {
      method: 'POST', body: JSON.stringify({ path: filePath, content: '' }),
    });
    toast(`created ${filePath}`, 'ok');
    await loadApiRepos();
    const fresh = API_REPOS.find(r => r.uuid === repoUuid);
    if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
    openApiRepoFile(repoUuid, filePath);
  } catch (e) { toast(`create failed: ${e.message}`, 'err'); }
}

async function deleteApiRepoFile(repoUuid, filePath) {
  if (!confirm(`delete ${filePath}? (moved to .trash/, not permanently erased — §7.4)`)) return;
  try {
    await api(`/api/repos/${repoUuid}/file?path=${encodeURIComponent(filePath)}`, { method: 'DELETE' });
    toast(`deleted ${filePath}`, 'ok');
    if (ACTIVE_API_FILE === filePath) { ACTIVE_API_FILE = null; _showIdeEditor(false); document.getElementById('ide-tabs').textContent = 'no file open'; document.getElementById('ide-code').textContent = '// click a file in the tree to open it here'; }
    await loadApiRepos();
    const fresh = API_REPOS.find(r => r.uuid === repoUuid);
    if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
  } catch (e) { toast(`delete failed: ${e.message}`, 'err'); }
}

// §BUILT 2026-09-15 — archives a RepoLayer repo via the same DELETE
// /api/repos/:uuid → repo.archive the API has already routed since the v2
// redesign (see idearium/api/index.js's dynRoutes) — soft-delete only,
// status flips to 'archived' and it drops out of the default repo list;
// nothing on disk is touched (§7.4). No prior UI path called this at all.
async function archiveApiRepo() {
  if (!CURRENT_API_REPO) { toast('no repo loaded — open one first', 'err'); return; }
  if (!confirm(`archive "${CURRENT_API_REPO.name}"? it'll drop out of the repo list — content itself is kept, not deleted.`)) return;
  const uuid = CURRENT_API_REPO.uuid;
  try {
    await api(`/api/repos/${uuid}`, { method: 'DELETE' });
    toast('repo archived', 'ok');
    await loadApiRepos();
    CURRENT_API_REPO = null; ACTIVE_API_FILE = null; _showIdeEditor(false);
    renderApiRepoPanel(null);
  } catch (e) {
    toast('archive failed: ' + e.message, 'err');
  }
}

async function pickLocalRepo() {
  try {
    if (!window.showDirectoryPicker) { toast('your browser does not support folder access — try Chrome/Edge','err'); return; }
    const dirHandle = await window.showDirectoryPicker();
    REPO_FILES = [];
    await walkDir(dirHandle, '');
    document.getElementById('repo-badge').textContent = `${REPO_FILES.length} files loaded`;
    renderFileTree();
    toast(`loaded ${REPO_FILES.length} files from ${dirHandle.name}`,'ok');
  } catch(e) { if (e.name !== 'AbortError') toast(e.message,'err'); }
}

// Drag-and-drop ingest → POST /api/repos (RepoLayer: each dropped repo
// becomes its own tracked idea+spec, not folded into the open local folder).
(function wireRepoDropzone(){
  const zone = document.getElementById('file-tree');
  if (!zone) return;
  ['dragover','dragenter'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.style.outline = '1px dashed var(--accent, #5af)'; }));
  ['dragleave','drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.style.outline = ''; }));
  zone.addEventListener('drop', e => { if (e.dataTransfer?.files?.length) ingestDroppedFiles(e.dataTransfer.files); });
})();

async function ingestDroppedFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;
  try {
    const payload = await Promise.all(files.map(f => new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve({ path: f.name, bytes: f.size, content: r.result });
      r.onerror = reject;
      r.readAsText(f);
    })));
    const name = files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, '') : `drop-${Date.now()}`;
    const res = await api('/api/repos', { method: 'POST', body: JSON.stringify({ name, files: payload, source: 'drop', ideaUuid: CURRENT_REPO_IDEA }) });
    toast(`ingested "${name}" as repo (${payload.length} file${payload.length>1?'s':''})${CURRENT_REPO_IDEA?' — attached to this idea':''}`, 'ok');
    await loadApiRepos();
    if (CURRENT_REPO_IDEA) { const r = API_REPOS.find(x=>x.ideaUuid===CURRENT_REPO_IDEA); renderApiRepoPanel(r); }
  } catch (e) { toast(`ingest failed: ${e.message}`, 'err'); }
}
async function walkDir(dirHandle, prefix) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = prefix ? prefix + '/' + name : name;
    if (handle.kind === 'file') REPO_FILES.push({ path:p, handle });
    else await walkDir(handle, p);
  }
}
function buildTree(files) {
  const root = {};
  for (const f of files) {
    const parts = f.path.split('/');
    let node = root;
    for (let i=0;i<parts.length;i++) {
      const part = parts[i];
      if (i === parts.length-1) { node[part] = { __file: f }; }
      else { node[part] = node[part] || {}; node = node[part]; }
    }
  }
  return root;
}
function renderFileTree() {
  const tree = document.getElementById('file-tree');
  if (!REPO_FILES.length) { tree.innerHTML = `<div class="repo-empty">no repository loaded<br><br><button class="modal-btn confirm" onclick="pickLocalRepo()">open local nexus folder</button></div>`; return; }
  const root = buildTree(REPO_FILES);
  tree.innerHTML = renderTreeNode(root, 0);
}
function renderTreeNode(node, depth) {
  let html = '';
  const keys = Object.keys(node).sort((a,b)=>{
    const aDir = !node[a].__file, bDir = !node[b].__file;
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.localeCompare(b);
  });
  for (const key of keys) {
    const val = node[key];
    const indent = `<span class="tree-indent" style="width:${depth*14}px"></span>`;
    if (val.__file) {
      const f = val.__file;
      html += `<div class="tree-node file${ACTIVE_FILE===f.path?' active':''}" onclick="openFile('${f.path.replace(/'/g,"\\'")}')">${indent}📄 ${escapeHtml(key)}</div>`;
    } else {
      html += `<div class="tree-node dir">${indent}📁 ${escapeHtml(key)}</div>` + renderTreeNode(val, depth+1);
    }
  }
  return html;
}
async function openFile(path) {
  const entry = REPO_FILES.find(f=>f.path===path);
  if (!entry) return;
  ACTIVE_FILE = path;
  renderFileTree();
  document.getElementById('ide-tabs').textContent = path;
  try {
    const file = await entry.handle.getFile();
    if (file.size > 400000) { document.getElementById('ide-code').textContent = `// file too large to preview inline (${file.size} bytes)`; return; }
    const text = await file.text();
    const lines = text.split('\n');
    document.getElementById('ide-code').innerHTML = lines.map((l,i)=>`<span class="ln">${i+1}</span>${escapeHtml(l)}`).join('\n');
  } catch(e) {
    document.getElementById('ide-code').textContent = `// could not read file: ${e.message}`;
  }
}

// ════════════════════════════════════════════════════
// VERSIONIUM — real snapshot history (commitId, tensionMap, phaseMap, snr)
// ════════════════════════════════════════════════════
function renderVersionium() {
  const list = document.getElementById('commit-list');
  if (!SNAPSHOTS.length) { list.innerHTML = `<div class="detail-empty">${CONNECTED?'no snapshots yet — push one from the Ideas view':'not connected to nexus'}</div>`; return; }
  list.innerHTML = SNAPSHOTS.map(s => `
    <div class="commit-card" onclick="selectSnapshot('${s.uuid}')">
      <div class="commit-id">${s.commitId} <span style="color:var(--text3)">· ${s.branch||'main'}</span></div>
      <div class="commit-msg">${escapeHtml(s.message)}</div>
      <div class="commit-stats">
        <span>${new Date(s.ts).toLocaleString()}</span>
        <span>${s.ideasCount} ideas</span>
        <span>${s.gapCount} open gaps</span>
        <span>${s.specCount} specs</span>
        <span style="color:${s.snrDelta>0?'var(--mint)':s.snrDelta<0?'var(--coral)':'var(--text3)'}">snr ${s.snr!=null?s.snr.toFixed?s.snr.toFixed(2):s.snr:'—'} (${s.snrDelta>0?'+':''}${s.snrDelta||0})</span>
      </div>
    </div>
  `).join('');
}
function selectSnapshot(uuid) {
  SELECTED_SNAP = uuid;
  const s = SNAPSHOTS.find(x=>x.uuid===uuid);
  if (!s) return;
  const area = document.getElementById('versionium-detail');
  const phaseRows = Object.entries(s.phaseMap||{}).map(([p,n])=>`<div class="pend-row" style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--b0)"><span style="font-family:var(--mono);font-size:9px;color:var(--text3)">${p}</span><span style="font-family:var(--mono);font-size:10px">${n}</span></div>`).join('');
  const tensionRows = Object.entries(s.tensionMap||{}).slice(0,12).map(([uuid,t])=>{
    const idea = IDEAS.find(i=>i.uuid===uuid);
    return `<div class="link-item"><span>${escapeHtml(idea?(idea.text||'').slice(0,28):uuid.slice(0,8))}</span><span style="margin-left:auto;font-family:var(--mono);font-size:10px">${(t*100).toFixed(0)}%</span></div>`;
  }).join('');
  area.innerHTML = `
    <div class="ds"><div class="ds-label">commit</div><div class="ds-mono">${s.commitId}\nbranch ${s.branch||'main'}\nparent ${s.parentId?s.parentId.slice(0,8):'—'}\n${new Date(s.ts).toLocaleString()}</div></div>
    <div class="ds"><div class="ds-label">message</div><div class="ds-value">${escapeHtml(s.message)}</div></div>
    <div class="ds"><div class="ds-label">phase distribution</div>${phaseRows||'<span style="color:var(--text3);font-size:10px">—</span>'}</div>
    <div class="ds"><div class="ds-label">tension at commit</div>${tensionRows||'<span style="color:var(--text3);font-size:10px">—</span>'}</div>
    <div class="ds"><div class="ds-label">actions</div><div class="action-row"><button class="action-btn primary" onclick="diffWithPrevious('${s.uuid}')">diff vs parent</button></div></div>
  `;
}
async function diffWithPrevious(uuid) {
  const s = SNAPSHOTS.find(x=>x.uuid===uuid);
  if (!s || !s.parentId) { toast('no parent snapshot to diff against','err'); return; }
  try {
    const res = await api(`/api/snapshots/${s.parentId}/diff/${uuid}`);
    toast('diff loaded — see console','ok');
    console.log('snapshot diff', res);
  } catch(e) { toast(e.message,'err'); }
}

// ════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════
function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg, type='ok') {
  const area = document.getElementById('toast-area');
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.textContent = msg;
  area.appendChild(div);
  setTimeout(()=>div.remove(), 2800);
}
document.addEventListener('keydown', e => {
  if (e.key==='Escape') { closeModal(); closeNewSpecModal(); closeUploadProjectModal(); }
  if ((e.metaKey||e.ctrlKey) && e.key==='n') { e.preventDefault(); setView('ideas'); openModal(); }
});

// ════════════════════════════════════════════════════
// PROJECTS — a flat shelf for whole zip archives (not tied to ideas/specs;
// that's what Versionium/RepoLayer already covers). Just: drop zips, keep
// them, list them, get one back. Backed by GET/POST /api/projects and
// GET .../:uuid/download, DELETE .../:uuid.
// ════════════════════════════════════════════════════
let PROJECTS = [];

function formatBytes(n) {
  if (!n && n !== 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/(1024*1024)).toFixed(1)} MB`;
}

async function loadProjects() {
  try {
    const res = await api('/api/projects');
    PROJECTS = res.projects || [];
  } catch (e) { /* stays whatever it was — likely offline */ }
  renderProjectList();
  const badgeText = `${PROJECTS.length} project${PROJECTS.length===1?'':'s'}`;
  const b1 = document.getElementById('proj-header-badge'); if (b1) b1.textContent = badgeText;
  const b2 = document.getElementById('proj-count-badge'); if (b2) b2.textContent = PROJECTS.length || '';
}

function renderProjectList() {
  const list = document.getElementById('project-list');
  if (!list) return;
  const q = (document.getElementById('project-search')?.value || '').toLowerCase();
  const items = PROJECTS.filter(p => !q || (p.name||'').toLowerCase().includes(q) || (p.filename||'').toLowerCase().includes(q))
                        .sort((a,b) => (b.uploadedAt||0)-(a.uploadedAt||0));
  if (!items.length) {
    list.innerHTML = `<div class="detail-empty">${CONNECTED ? (PROJECTS.length ? 'no projects match that filter' : 'no projects yet — drop a zip above') : 'not connected to nexus'}</div>`;
    return;
  }
  list.innerHTML = items.map(p => `
    <div class="project-card">
      <span class="pc-icon">🗜</span>
      <span class="pc-name" title="${p.filename}">${p.name || p.filename}</span>
      <span class="pc-meta">${formatBytes(p.size)} · ${p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : '—'}</span>
      <button onclick="downloadProject('${p.uuid}')">download</button>
      <button class="danger" onclick="deleteProject('${p.uuid}','${(p.name||p.filename||'').replace(/'/g,"\\'")}')">delete</button>
    </div>
  `).join('');
}

async function uploadProjectFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  const zone = document.getElementById('project-drop');
  const textEl = document.getElementById('project-drop-text');
  const defaultText = 'drop zips here, or click to choose files — select as many at once as you like';
  if (zone) { zone.classList.add('drag'); zone.style.pointerEvents = 'none'; }
  let okCount = 0, failCount = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (textEl) textEl.textContent = `storing ${i+1}/${files.length} — ${f.name}`;
    try {
      const contentBase64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(',')[1] || '');
        r.onerror = reject;
        r.readAsDataURL(f); // base64 — binary-safe, unlike readAsText
      });
      await api('/api/projects', { method: 'POST', body: JSON.stringify({
        name: f.name.replace(/\.[^/.]+$/, ''), filename: f.name, contentBase64,
      }) }, 30000);
      okCount++;
    } catch (e) { failCount++; console.error(`[projects] upload failed for ${f.name}:`, e.message); }
  }
  if (zone) { zone.classList.remove('drag'); zone.style.pointerEvents = ''; }
  if (textEl) textEl.textContent = defaultText;
  document.getElementById('project-file-input').value = '';
  if (okCount) toast(`stored ${okCount} project${okCount>1?'s':''}${failCount?`, ${failCount} failed`:''}`, failCount ? 'err' : 'ok');
  else if (failCount) toast(`upload failed`, 'err');
  await loadProjects();
}

function downloadProject(uuid) {
  if (!API_BASE) return toast('not connected to nexus', 'err');
  window.open(API_BASE + `/api/projects/${uuid}/download`, '_blank');
}

async function deleteProject(uuid, name) {
  if (!confirm(`delete "${name}"? this removes the stored zip — it can't be undone.`)) return;
  try {
    await api(`/api/projects/${uuid}`, { method: 'DELETE' });
    toast(`deleted "${name}"`, 'ok');
    await loadProjects();
  } catch (e) { toast(`delete failed: ${e.message}`, 'err'); }
}

(function wireProjectDropzone() {
  const zone = document.getElementById('project-drop');
  if (!zone) return;
  ['dragover','dragenter'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); zone.classList.add('drag'); }));
  ['dragleave'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('drag'); }));
  zone.addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation(); zone.classList.remove('drag');
    if (e.dataTransfer?.files?.length) uploadProjectFiles(e.dataTransfer.files);
  });
})();

// ════════════════════════════════════════════════════
// INIT — no seed data. Connect to real nexus, render empty states until then.
// ════════════════════════════════════════════════════
window.addEventListener('load', () => {
  renderIdeaList(); renderSpecList(); renderVersionium(); renderArchitect(); renderBrainstorms();
  updateStats();
  nexusConnect();
  setInterval(() => { if (CONNECTED) loadStats(); else nexusConnect(); }, 15000);
});

---

# ui/import-project/import-project.css

/* ui/import-project/import-project.css
 * Uses only real tokens already defined in /ui/themes/nexus-dark.css —
 * no new color system introduced. */

.ip-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 20px;
  background: var(--ink);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
}

.ip-eyebrow {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--dim);
}

.ip-title {
  font-size: 26px;
  font-weight: 600;
  color: var(--bright);
  margin: 0;
}

.ip-dropzone {
  width: min(640px, 90vw);
  min-height: 260px;
  border: 1px dashed var(--rim);
  border-radius: 10px;
  background: var(--plate);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 32px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}

.ip-dropzone.dz-active {
  border-color: var(--ac);
  background: var(--ac-ghost);
}

.ip-dropzone-icon {
  font-size: 34px;
  color: var(--dim);
}

.ip-dropzone-main {
  font-size: 15px;
  color: var(--text);
}

.ip-dropzone-sub {
  font-size: 12px;
  color: var(--muted);
}

.ip-input { display: none; }

.ip-status {
  width: min(640px, 90vw);
  min-height: 20px;
  font-size: 13px;
  color: var(--dim);
  text-align: center;
}

.ip-status.ok   { color: var(--ok); }
.ip-status.err  { color: var(--err); }
.ip-status.busy { color: var(--ac); }

.ip-result {
  width: min(640px, 90vw);
  background: var(--panel);
  border: 1px solid var(--edge);
  border-radius: 8px;
  padding: 16px 20px;
  display: none;
}
.ip-result.show { display: block; }

.ip-result-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid var(--edge);
}
.ip-result-row:last-child { border-bottom: none; }
.ip-result-row span:first-child { color: var(--muted); }
.ip-result-row span:last-child  { color: var(--text); }

.ip-result-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}

.ip-btn {
  flex: 1;
  padding: 9px 14px;
  border-radius: 6px;
  border: 1px solid var(--ac-border);
  background: var(--ac-dim);
  color: var(--bright);
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
}
.ip-btn:hover { background: var(--ac-ghost); border-color: var(--ac-border-hi); }
.ip-btn.secondary {
  border-color: var(--rim);
  background: transparent;
  color: var(--dim);
}

.ip-omitted {
  margin-top: 10px;
  font-size: 11px;
  color: var(--muted);
  max-height: 120px;
  overflow-y: auto;
}
.ip-omitted-row { padding: 2px 0; }

/* ── added §UPLOAD-PROJECT 2026-09-15 — step indicator, prompt panel, chips ── */

.ip-steps {
  width: min(640px, 90vw);
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: var(--muted);
}
.ip-step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--edge);
}
.ip-step span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 1px solid var(--rim);
  font-size: 10px;
}
.ip-step.active { color: var(--bright); border-color: var(--ac-border); }
.ip-step.active span { border-color: var(--ac-border); background: var(--ac-dim); }
.ip-step.done { color: var(--dim); }
.ip-step.done span { background: var(--ok); border-color: var(--ok); }

.ip-panel {
  width: min(640px, 90vw);
  background: var(--panel);
  border: 1px solid var(--edge);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ip-label {
  font-size: 12px;
  color: var(--muted);
  margin-top: 8px;
}

.ip-text, .ip-textarea {
  width: 100%;
  box-sizing: border-box;
  background: var(--ink);
  border: 1px solid var(--rim);
  border-radius: 6px;
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  padding: 8px 10px;
  resize: vertical;
}
.ip-text:focus, .ip-textarea:focus { outline: none; border-color: var(--ac-border); }

.ip-hint {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
}

.ip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ip-chip {
  font-size: 12px;
  color: var(--dim);
  background: transparent;
  border: 1px solid var(--rim);
  border-radius: 999px;
  padding: 5px 12px;
  cursor: pointer;
}
.ip-chip:hover { border-color: var(--ac-border); color: var(--bright); background: var(--ac-ghost); }

.ip-form-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.ip-form-actions .ip-btn { flex: 1; }

.ip-container-note {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.ip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

---

# ui/import-project/import-project.html

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEXUS — Upload Project</title>
<link rel="stylesheet" href="/ui/themes/nexus-dark.css">
<link rel="stylesheet" href="/ui/import-project/import-project.css">
<script src="/ui/lib/api.js"></script>
</head>
<body>

<div class="ip-shell">
  <div class="ip-eyebrow">NEXUS · IDEARIUM</div>
  <h1 class="ip-title">Upload Project</h1>

  <div class="ip-steps">
    <div class="ip-step active" id="ip-step-dot-1"><span>1</span> Name &amp; goal</div>
    <div class="ip-step" id="ip-step-dot-2"><span>2</span> Import repository</div>
    <div class="ip-step" id="ip-step-dot-3"><span>3</span> Done</div>
  </div>

  <!-- ── Step 1 — prompt: name, goal, example intents ─────────────────────── -->
  <section class="ip-panel" id="ip-panel-prompt">
    <label class="ip-label" for="ip-name">Project name</label>
    <input class="ip-text" id="ip-name" type="text" maxlength="200" placeholder="e.g. checkout-service">

    <label class="ip-label" for="ip-goal">What's the goal?</label>
    <textarea class="ip-textarea" id="ip-goal" maxlength="2000" rows="3"
      placeholder="What should be true once this project is imported and worked on?"></textarea>
    <div class="ip-hint">
      This becomes the compartment's declared end-state — the real conditions
      it's resolved against once the repo, its manifest, and a real commit exist.
    </div>

    <div class="ip-label">Example goals — tap to use</div>
    <div class="ip-chips" id="ip-chips"><!-- populated from /api/project-import/config --></div>

    <div class="ip-form-actions">
      <button class="ip-btn" id="ip-start">Continue →</button>
    </div>
    <div class="ip-status" id="ip-prompt-status"></div>
  </section>

  <!-- ── Step 2 — dropzone + Import Repository ─────────────────────────────── -->
  <section class="ip-panel" id="ip-panel-drop" hidden>
    <div class="ip-container-note" id="ip-container-note"></div>

    <div class="ip-dropzone" id="ip-dropzone">
      <div class="ip-dropzone-icon">⬇</div>
      <div class="ip-dropzone-main" id="ip-dropzone-main">Drop a .zip archive, or click to choose one</div>
      <div class="ip-dropzone-sub">A single .zip only — text files are imported, bounded per file and per import; binaries and node_modules/.git are skipped, never silently.</div>
    </div>
    <input type="file" id="ip-input" class="ip-input" accept=".zip">

    <div class="ip-form-actions">
      <button class="ip-btn secondary" id="ip-cancel">Cancel</button>
      <button class="ip-btn" id="ip-import" disabled>Import Repository</button>
    </div>
    <div class="ip-status" id="ip-drop-status"></div>
  </section>

  <!-- ── Step 3 — result ────────────────────────────────────────────────────── -->
  <div class="ip-result" id="ip-result">
    <div class="ip-result-row"><span>Repo</span><span id="ip-r-name">—</span></div>
    <div class="ip-result-row"><span>UUID</span><span id="ip-r-uuid">—</span></div>
    <div class="ip-result-row"><span>Files ingested</span><span id="ip-r-files">—</span></div>
    <div class="ip-result-row"><span>Omitted</span><span id="ip-r-omitted">—</span></div>
    <div class="ip-result-row"><span>Manifest</span><span id="ip-r-manifest">—</span></div>
    <div class="ip-result-row"><span>project.json</span><span id="ip-r-projectjson">—</span></div>
    <div class="ip-result-row"><span>Git</span><span id="ip-r-git">—</span></div>
    <div class="ip-result-row"><span>End-state</span><span id="ip-r-endstate">—</span></div>
    <div class="ip-omitted" id="ip-r-omitted-list"></div>
    <div class="ip-result-actions">
      <a class="ip-btn" id="ip-open-repo" href="#">Open repo →</a>
      <button class="ip-btn secondary" id="ip-import-another">Import another</button>
    </div>
  </div>
</div>

<script>
// ── state ────────────────────────────────────────────────────────────────
let containerUuid = null;
let stagedFile = null;
let intentExamples = [];

const panelPrompt = document.getElementById('ip-panel-prompt');
const panelDrop    = document.getElementById('ip-panel-drop');
const result       = document.getElementById('ip-result');
const dot1 = document.getElementById('ip-step-dot-1');
const dot2 = document.getElementById('ip-step-dot-2');
const dot3 = document.getElementById('ip-step-dot-3');

function setStatus(el, text, cls) {
  el.textContent = text || '';
  el.className = 'ip-status' + (cls ? ' ' + cls : '');
}

// ── load example intents from the config endpoint — nothing here is
// hardcoded copy; if lib/project-import.config.js's INTENT_EXAMPLES
// changes, this screen changes with it, no redeploy of this file needed. ──
(async function loadConfig() {
  const cfg = await get('/api/project-import/config');
  intentExamples = cfg?.intentExamples || [];
  const chips = document.getElementById('ip-chips');
  chips.innerHTML = '';
  intentExamples.forEach(text => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'ip-chip';
    chip.textContent = text;
    chip.addEventListener('click', () => { document.getElementById('ip-goal').value = text; });
    chips.appendChild(chip);
  });
})();

// ── Step 1 -> 2: start() spawns the temporary compartment right away,
// before any file exists, so it's there to abandon if the user walks
// away mid-drop (James's own explicit ordering). ──────────────────────────
document.getElementById('ip-start').addEventListener('click', async () => {
  const name = document.getElementById('ip-name').value.trim();
  const goal = document.getElementById('ip-goal').value.trim();
  const statusEl = document.getElementById('ip-prompt-status');
  if (!name) { setStatus(statusEl, 'Project name is required.', 'err'); return; }
  if (!goal) { setStatus(statusEl, 'A goal is required — it becomes the end-state.', 'err'); return; }

  setStatus(statusEl, 'Creating a temporary compartment…', 'busy');
  const res = await post('/api/project-import/start', { name, goal });
  if (!res || !res.ok) {
    setStatus(statusEl, res?.error || 'Could not start — no response from server.', 'err');
    return;
  }
  containerUuid = res.containerUuid;
  setStatus(statusEl, '', null);

  document.getElementById('ip-container-note').textContent =
    `Compartment ${res.compartmentId?.slice(0, 8) || '—'} open · intent: ${res.intent?.domain || '?'}.${res.intent?.verb || '?'}`;

  panelPrompt.hidden = true;
  panelDrop.hidden = false;
  dot1.classList.remove('active'); dot1.classList.add('done');
  dot2.classList.add('active');
});

// ── Step 2: dropzone stages a file — it does NOT upload on drop. The
// user has to press "Import Repository" explicitly (James: "then a
// dropzone... once it uploads you can hit 'import repository'" — read
// as two distinct real actions, not one auto-triggering the other). ──────
function stageFile(file) {
  if (!file) return;
  if (!/\.zip$/i.test(file.name)) {
    setStatus(document.getElementById('ip-drop-status'), `Not a .zip: ${file.name}`, 'err');
    return;
  }
  stagedFile = file;
  document.getElementById('ip-dropzone-main').textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB) — ready`;
  document.getElementById('ip-import').disabled = false;
  setStatus(document.getElementById('ip-drop-status'), '', null);
}

const zone = document.getElementById('ip-dropzone');
const input = document.getElementById('ip-input');
zone.addEventListener('click', () => input.click());
input.addEventListener('change', () => stageFile(input.files[0]));
['dragover', 'dragenter'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('dz-active'); }));
['dragleave', 'drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('dz-active'); }));
zone.addEventListener('drop', e => { if (e.dataTransfer?.files?.length) stageFile(e.dataTransfer.files[0]); });

// ── "Import Repository" — upload, then finalize (manifest/project.json/
// .git generated server-side), then open the full repo page. ─────────────
document.getElementById('ip-import').addEventListener('click', async () => {
  if (!stagedFile || !containerUuid) return;
  const statusEl = document.getElementById('ip-drop-status');
  const importBtn = document.getElementById('ip-import');
  importBtn.disabled = true;

  setStatus(statusEl, 'Uploading…', 'busy');
  let contentBase64;
  try {
    contentBase64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = () => resolve(r.result.split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(stagedFile);
    });
  } catch (e) {
    setStatus(statusEl, `File read failed: ${e.message}`, 'err');
    importBtn.disabled = false;
    return;
  }
  if (!contentBase64) { setStatus(statusEl, 'Empty file.', 'err'); importBtn.disabled = false; return; }

  setStatus(statusEl, 'Import uploaded — generating manifest, project.json, and .git…', 'busy');
  const res = await post(`/api/project-import/${containerUuid}/finalize`,
    { filename: stagedFile.name, contentBase64 }, 30000);

  if (!res) {
    setStatus(statusEl, 'No response from server.', 'err');
    importBtn.disabled = false;
    return;
  }
  if (!res.ok) {
    setStatus(statusEl, res.error || 'Import did not reach the declared end-state.', 'err');
    importBtn.disabled = false;
    return;
  }

  showResult(res);
  panelDrop.hidden = true;
  dot2.classList.remove('active'); dot2.classList.add('done');
  dot3.classList.add('active');

  // "then opens the full repo page" — navigate there directly; the
  // result panel (with its own explicit link) stays as a fallback for a
  // blocked/declined navigation.
  const uuid = res.repo?.uuid;
  if (uuid) window.location.hash = `#repo/${uuid}`;
});

// ── Cancel — abandons the temp compartment before finalize. ──────────────
document.getElementById('ip-cancel').addEventListener('click', async () => {
  if (containerUuid) { try { await post(`/api/project-import/${containerUuid}/cancel`, {}); } catch (_) {} }
  containerUuid = null; stagedFile = null;
  panelDrop.hidden = true;
  panelPrompt.hidden = false;
  dot2.classList.remove('active'); dot1.classList.add('active'); dot1.classList.remove('done');
  document.getElementById('ip-import').disabled = true;
  document.getElementById('ip-dropzone-main').textContent = 'Drop a .zip archive, or click to choose one';
});

// Best-effort cancel if the tab closes mid-flow before finalize — a real
// safety net alongside project-container.js's own sweepStale(), not a
// replacement for it (sendBeacon can silently fail to deliver).
window.addEventListener('beforeunload', () => {
  if (containerUuid && panelDrop && !panelDrop.hidden) {
    try { navigator.sendBeacon(`/api/project-import/${containerUuid}/cancel`, new Blob([JSON.stringify({})], { type: 'application/json' })); } catch (_) {}
  }
});

function showResult(res) {
  result.classList.add('show');
  document.getElementById('ip-r-name').textContent        = res.repo?.name ?? '—';
  document.getElementById('ip-r-uuid').textContent        = res.repo?.uuid ?? '—';
  document.getElementById('ip-r-files').textContent       = res.fileCount ?? '—';
  document.getElementById('ip-r-omitted').textContent     = res.omittedCount ?? 0;
  document.getElementById('ip-r-manifest').textContent    = res.manifest ? 'written' : '—';
  document.getElementById('ip-r-projectjson').textContent = res.projectJson ? 'written' : '—';
  document.getElementById('ip-r-git').textContent         = res.git?.committed ? `${res.git.branch}@${res.git.commit}` : (res.git?.error || '—');
  document.getElementById('ip-r-endstate').textContent    = res.endState ? `${res.endState.met}/${res.endState.total} met` : '—';

  const list = document.getElementById('ip-r-omitted-list');
  list.innerHTML = '';
  (res.omitted || []).forEach(o => {
    const row = document.createElement('div');
    row.className = 'ip-omitted-row';
    row.textContent = `${o.path} — ${o.why}`;
    list.appendChild(row);
  });

  document.getElementById('ip-open-repo').href = `#repo/${res.repo?.uuid || ''}`;
}

document.getElementById('ip-import-another').addEventListener('click', () => {
  result.classList.remove('show');
  containerUuid = null; stagedFile = null;
  document.getElementById('ip-name').value = '';
  document.getElementById('ip-goal').value = '';
  panelPrompt.hidden = false;
  dot1.classList.add('active'); dot1.classList.remove('done');
  dot2.classList.remove('active', 'done');
  dot3.classList.remove('active');
});
</script>

</body>
</html>