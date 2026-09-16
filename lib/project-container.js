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
 *
 * §MIGRATED TO COMPARTMENT OS 2026-09-15 — James: "make sure that
 * idearium is using compartmentos" / "migrate to cos."
 *
 * The honest statement of what was wrong: this file called itself a
 * compartment flow and wasn't one. compartment-engine.js is real, but
 * it is an in-process constraint frame — an intent, a budget, a
 * boundary description, and a spawn/execute/resolve lifecycle. It has
 * no filesystem, no manifest, no system map, no destroy. Meanwhile
 * cos/ — the actual COMPARTMENT OS, 28-phase spec, real gates, real
 * state store — sat right there with a complete programmatic surface
 * that nothing in idearium ever called. The word was being used
 * without the thing.
 *
 * §HOW THE TWO NOW DIVIDE, and why both are still here:
 *   COS (via lib/cos-bridge.js) owns the COMPARTMENT — its identity, its
 *   real directory, its .cos-manifest.json, its entry in the state store
 *   and system map, its create/destroy lifecycle, and the mount record
 *   pointing at the imported repo.
 *   compartment-engine owns the RESOLUTION — evaluating the declared
 *   end-state against real artifacts and resolving to a real PASS or
 *   FAIL. COS has no equivalent of that and pretending otherwise would
 *   mean inventing one.
 * These are two different jobs. Folding either into the other would
 * have meant faking half of it, so neither is faked: a project import
 * now produces a real COS compartment AND a real, honestly-evaluated
 * end-state, and the container row carries both ids.
 *
 * §REVERSIBLE ON PURPOSE — idearium.config's compartment.use_cos gates
 * the COS half. Set it false and this file runs exactly the prior
 * compartment-engine-only path. That is what makes this a migration
 * that can be checked against the thing it replaced rather than a
 * rewrite that has to be trusted.
 *
 * §DEGRADE, DON'T CRASH — if COS cannot be loaded at all (partial
 * checkout, test harness), cos-bridge reports that honestly and this
 * file records `cosError` on the container and continues with the
 * end-state half. An import must not fail because a compartment
 * substrate is missing; but it must never silently claim a compartment
 * it does not have either, which is why the error is recorded and
 * returned rather than logged and dropped.
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const cfg              = require('./project-import.config.js');
const compartmentEngine = require('./compartment-engine.js');
const endState          = require('./end-state.js');
const intentClassifier  = require('./intent-classifier.js');
const cos               = require('./cos-bridge.js');

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
      // §MIGRATED 2026-09-15 — a real condition on the COS half, so the
      // migration is verified by the same end-state machinery as
      // everything else rather than assumed to have worked. §1.1 in
      // lib/end-state.js: "a condition nothing can check is
      // decoration" — this one reads the real mount result produced by
      // cos.mountPath() against the real compartment record.
      //
      // Honest about the disabled case: when compartment.use_cos is
      // false there is no COS compartment to mount anything on, and the
      // condition reports met with that as its reason rather than
      // failing an import that was never asked to use COS. It fails
      // only when COS was asked for and genuinely did not deliver.
      {
        id: 'compartment-mounted',
        describe: 'the repo directory is recorded as a real mount on a real COS compartment',
        evaluate: (artifact) => {
          if (!cfg.COMPARTMENT.useCos) {
            return { met: true, progress: 1, detail: 'compartment.use_cos is off — COS not required for this import' };
          }
          if (!artifact?.cosCompartmentId) {
            return { met: false, progress: 0, detail: 'no COS compartment was created for this container' };
          }
          const mounted = !!(artifact.cosMount && artifact.cosMount.ok);
          return {
            met: mounted, progress: mounted ? 1 : 0,
            detail: mounted ? `${artifact.cosCompartmentId} <- ${artifact.repoDir}`
                            : `mount failed: ${artifact.cosMount?.error || 'not attempted'}`,
          };
        },
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

  // ── the real COS compartment ───────────────────────────────────────
  // §MIGRATED 2026-09-15 — this is the compartment in the sense COS
  // means it: a real directory, a real manifest, a real entry in the
  // state store and system map, a real destroy path. Created BEFORE the
  // file is ever dropped, per James's own ordering ("creates a temporary
  // compartment (just in case the user cancels)... THEN a dropzone") —
  // which is also what makes cancelContainer() able to destroy and wipe
  // something real rather than just marking a row CANCELLED.
  let cosCompartment = null;
  let cosError = null;
  if (cfg.COMPARTMENT.useCos) {
    // COS rejects a duplicate name outright (its create gate checks
    // getCompartmentByName). Container names come from user input and
    // will genuinely collide — "my project" twice — so the name is
    // de-duplicated against the real store rather than left to throw on
    // a case that is normal, not exceptional.
    const cosName = cos.uniqueName(`idearium-import-${String(name).trim()}`);
    const created = cos.createCompartment({
      name: cosName,
      purpose: String(goal).slice(0, 2000),
      runtimeId: cfg.COMPARTMENT.runtimeId,
      networkIsolated: cfg.COMPARTMENT.networkIsolated,
    });
    if (created.ok) {
      cosCompartment = created.compartment;
    } else {
      // Recorded, returned, and carried on the container row — never
      // logged and dropped. An import that proceeded while quietly
      // failing to create the compartment it claims to have would be
      // exactly the "orphaned module" pattern this codebase keeps
      // closing, reintroduced at a new site.
      cosError = created.error;
      console.error(`[${MODULE_ID}] §1.2 COS compartment not created for "${name}": ${created.error} — continuing with end-state evaluation only; this container has NO real compartment`);
    }
  }

  const containerUuid = crypto.randomUUID();
  const row = {
    uuid: containerUuid,
    name: String(name).slice(0, 200),
    goal: String(goal).slice(0, 2000),
    intentUuid: intent.uuid,
    compartmentId: compartment.id,          // compartment-engine frame (end-state resolution)
    cosCompartmentId: cosCompartment ? cosCompartment.id : null,   // real COS compartment
    cosCompartmentName: cosCompartment ? cosCompartment.name : null,
    cosRoot: cosCompartment ? cosCompartment.fs.root : null,
    cosError,
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
    // The real COS compartment, reported alongside — null (with
    // cosError set) is a truthful answer the caller can act on, which a
    // silently absent field would not be.
    cosCompartmentId: row.cosCompartmentId,
    cosCompartmentName: row.cosCompartmentName,
    cosRoot: row.cosRoot,
    cosError,
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

  // §MIGRATED 2026-09-15 — the real COS compartment is destroyed, and by
  // default its filesystem is wiped. That default is the correct one and
  // not a shortcut: nothing in a cancelled import was ever accepted, so
  // there is nothing in that directory worth keeping, and leaving real
  // directories behind for every abandoned upload is how a compartment
  // root fills with garbage nobody can later identify. Configurable via
  // idearium.config's compartment.wipe_on_cancel for anyone who wants to
  // inspect a cancelled import's remains.
  let cosDestroyed = null;
  if (live.row.cosCompartmentId) {
    const r = cos.destroyCompartment(live.row.cosCompartmentId, {
      wipe: cfg.COMPARTMENT.wipeOnCancel,
      force: true, // a container being cancelled is being torn down regardless of state
    });
    cosDestroyed = r.ok ? { ok: true, wiped: !!(r.result && r.result.wiped) } : { ok: false, error: r.error };
    if (!r.ok) console.error(`[${MODULE_ID}] §1.2 COS compartment ${live.row.cosCompartmentId} not destroyed on cancel: ${r.error} — it is now orphaned and will need a manual 'cos destroy'`);
  }

  live.row.status = 'CANCELLED';
  live.row.updatedAt = Date.now();
  const jaa = _getJAA();
  if (jaa) { try { jaa.update(TABLE, containerUuid, { status: 'CANCELLED', updatedAt: live.row.updatedAt }); } catch (_) {} }
  _live.delete(containerUuid);

  return { ok: true, containerUuid, compartmentStatus: live.compartment.status, cosDestroyed };
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
async function finalizeContainer({ containerUuid, repoUuid, repoDir, fileCount, chunkCount = 0 } = {}) {
  const live = _live.get(containerUuid);
  if (!live) return { ok: false, error: `no live container "${containerUuid}" (already finalized, cancelled, or from a prior process)` };
  if (live.row.status !== 'AWAITING_UPLOAD') return { ok: false, error: `container is ${live.row.status}, not AWAITING_UPLOAD` };
  if (!repoUuid || !repoDir) return { ok: false, error: 'repoUuid and repoDir are required — call RepoLayer.ingest()/materialize() first' };
  if (!fs.existsSync(repoDir)) return { ok: false, error: `repoDir does not exist on disk: ${repoDir}` };

  // §MIGRATED 2026-09-15 — record the repo as a real mount on the COS
  // compartment, BEFORE the end-state is evaluated, because the
  // 'compartment-mounted' condition below checks the result.
  //
  // §WHY A MOUNT AND NOT THE COMPARTMENT'S OWN ROOT — COS puts every
  // compartment under COS_COMP_DIR (cos/foundation/constants.js, marked
  // IMMUTABLE after v1.0.0), while an imported repo lives at
  // idearium/repo/repos/<repoUuid> per James's own instruction that the
  // compartment be created in idearium's repo folder. Rather than bend
  // COS's path constants — which would change where every COS
  // compartment lives, for one subsystem's benefit — the compartment
  // stays where COS puts it and the repo directory is recorded on it as
  // a real mount. fs.mounts existed on every compartment record and had
  // never been written to by anything; this is its first real use.
  let cosMount = null;
  if (live.row.cosCompartmentId) {
    const m = cos.mountPath(live.row.cosCompartmentId, { path: repoDir, role: 'repo', writable: true });
    cosMount = m.ok ? { ok: true, path: repoDir } : { ok: false, error: m.error };
    if (!m.ok) console.error(`[${MODULE_ID}] §1.2 could not mount ${repoDir} on COS compartment ${live.row.cosCompartmentId}: ${m.error}`);
  }

  const manifest = _writeManifest({ repoDir, repoUuid, containerUuid, live });
  const projectJson = _writeProjectJson({ repoDir, repoUuid, live, fileCount });
  const git = _gitInit({ repoDir, name: live.row.name });

  const artifact = {
    fileCount: fileCount || 0,
    chunkCount: chunkCount || 0,
    manifestPath: manifest.path,
    projectJsonPath: projectJson.path,
    git,
    repoUuid, repoDir,
    cosCompartmentId: live.row.cosCompartmentId,
    cosMount,
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

  // §NOT DESTROYED ON SUCCESS — deliberate, and the opposite of cancel.
  // A finalized import's compartment is the durable record of what was
  // imported and under what boundary; it is the thing the repo now lives
  // under, not scaffolding. Only a cancelled import destroys and wipes.
  return {
    ok: evaluation.reached,
    error: evaluation.reached ? null : `end-state not reached: ${evaluation.unmet.map(u => u.id).join(', ')}`,
    manifest: manifest.content, projectJson: projectJson.content, git,
    endState: evaluation, compartmentStatus,
    cos: {
      compartmentId: live.row.cosCompartmentId,
      compartmentName: live.row.cosCompartmentName,
      root: live.row.cosRoot,
      mount: cosMount,
      error: live.row.cosError || null,
    },
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
    // §MIGRATED 2026-09-15 — both ids recorded, because they are two
    // different real things (see this file's §HOW THE TWO NOW DIVIDE).
    // A manifest that named only one would leave the other
    // untraceable from the repo it governs.
    cosCompartmentId: live.row.cosCompartmentId,
    cosCompartmentName: live.row.cosCompartmentName,
    cosRoot: live.row.cosRoot,
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
