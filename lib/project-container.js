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
