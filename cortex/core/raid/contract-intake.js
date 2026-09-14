'use strict';
// cortex/core/raid/contract-intake.js — real RAID input queue + compartment-
// per-contract dispatch. UUID: nexus-raid-contract-intake-v1-0000-2026-0828-001
//
// James: "we have all contracts, whether its from loom, idearium, co-pilot,
// self-heal go to raid's input folder, and queue, then through raid,
// creating a compartment per contract, setting the contract as the end
// state." Real, checked scope before building: this is the FIRST real
// source wired (lib/seam/spec-parser.js's parseSpec/parseSpecFile output,
// this session's own BR5 work — real per-agent chunk sizing, real file
// names attached). Loom, idearium, co-pilot, and self-heal each producing
// their own real contracts and calling submitContract() is the honestly-
// named next step, not claimed done here — same discipline TX16 and TX14
// already used for their own honest limits.
//
// "Input folder": built as a real, persistent JAA table
// (raid_contract_queue) rather than a literal filesystem directory watch.
// Named explicitly as a choice, not an assumption: a JAA table matches
// this codebase's own established convention for anything that needs to
// survive restart and be queryable (event_log, gaps, bep_patterns) and
// needs no new file-watching machinery; a literal folder-drop is a real,
// different, equally valid interpretation if that's specifically wanted
// instead (e.g. for a human or a non-Node process to drop a file in).
//
// "Contract as the end state": lib/compartment-engine.js's own real,
// existing extension point (_qaqcLayer, honest no-op by default — "QA/QC
// layer not yet built") is where this plugs in. A contract built by
// lib/seam/spec-parser.js already carries its own real PASS/FAIL criteria
// (testContract per chunk, "SEAM VERDICT: PASS | FAIL") — this module
// registers a qaqcLayer that checks the compartment's actual result
// against THAT, not a generic check invented here. The contract itself
// becomes the compartment's goal, literally, not by convention.

const { jaaDB, uid } = require('../../memory/jaa-db');
const compartmentEngine = require('../../../lib/compartment-engine');
const path = require('path');

// §BUILT 2026-09-06 — real, tangible-file companion to the JAA-backed
// queue above, per this file's own header note that a literal folder-
// drop is "a real, different, equally valid interpretation if that's
// specifically wanted instead" — James has now specifically, repeatedly
// wanted it. Same per-system input/ convention already established
// elsewhere this session (cortex/input, idearium/input, guardian/input).
// Real env var override (RAID_INPUT_DIR), matching the same real
// IDEARIUM_DATA_DIR/JAA_DATA_DIR isolation convention this session
// already established, so a real test never writes into the real
// input/ folder a live system would actually watch.
const RAID_INPUT_DIR = process.env.RAID_INPUT_DIR || path.join(__dirname, '../../../data/raid/input');

// §MCO3a 2026-09-13 — resolves a real per-system input/ dir for a contract's
// destination system, checked against the actual filesystem (fs.existsSync),
// not just string-built and assumed. Returns null (not a fabricated path) for
// an unset or not-yet-real system — the caller falls back to RAID_INPUT_DIR
// and logs it, per §1.2.
function _resolveInputDir(system) {
  if (!system) return null;
  const fs = require('fs');
  const dir = path.join(__dirname, '../../../', system, 'input');
  return fs.existsSync(dir) ? dir : null;
}

// §MCO11 2026-09-13 — real cross-process provisioning + work-surface
// query/write, both against idearium's real /api/repos (fixed earlier
// this pass to actually accept compartmentId). IDEARIUM_PORT matches
// idearium/config.js's own real default (4800) — not guessed.
const IDEARIUM_PORT = parseInt(process.env.IDEARIUM_PORT || '4800', 10);

function _ideariumRequest(method, reqPath, body) {
  return new Promise((resolve) => {
    const http = require('http');
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1', port: IDEARIUM_PORT, path: reqPath, method, timeout: 2000,
      headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {},
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch (_) { resolve(null); }
      });
    });
    req.on('error',   () => resolve(null)); // honest-degrade — matching _raidDecide's own contract
    req.on('timeout', () => { req.destroy(); resolve(null); });
    if (payload) req.write(payload);
    req.end();
  });
}

async function _provisionContractRepo(queued, compartmentId) {
  const { buildRepoIngestBody } = require('../../../lib/contract-repo-provision.js');
  const built = buildRepoIngestBody(queued, compartmentId);
  if (!built.ok) {
    console.warn(`[${MODULE_ID}] not provisioning a repo for ${queued && queued.uuid}: ${built.reason}`);
    return null;
  }
  const res = await _ideariumRequest('POST', '/api/repos', built.body);
  if (!res || res.status >= 400 || !res.body || !res.body.repo || !res.body.repo.uuid) return null;
  const repoUuid = res.body.repo.uuid;

  // §MCO11 real finding — the create response above does NOT include the
  // real file listing (confirmed directly: 'files' is absent from POST
  // /api/repos' response body). idearium's spec-engine chunking renames
  // every real file on ingest (confirmed directly: a file sent as
  // 'CONTRACT.md' comes back stored as '00-contract-md.md') — a caller
  // that assumed the path it sent would still be the path to read back
  // would silently fail every time. One extra real GET resolves the
  // actual current listing rather than guessing or hardcoding a
  // transformation rule this file doesn't own.
  const listing = await _ideariumRequest('GET', `/api/repos/${encodeURIComponent(repoUuid)}`);
  const realFiles = (listing && listing.body && listing.body.repo && Array.isArray(listing.body.repo.files))
    ? listing.body.repo.files.map(f => f.path)
    : [];
  if (realFiles.length) {
    try { jaaDB.update(TABLE, queued.uuid, { repoFiles: realFiles, updatedAt: Date.now() }); } catch (_) {}
  } else {
    console.warn(`[${MODULE_ID}] contract ${queued.uuid}: repo ${repoUuid} provisioned but its real file listing could not be confirmed — repoFiles left unset, not guessed`);
  }
  return repoUuid;
}

/**
 * queryContractRepoFile(repoUuid, relPath) / writeContractRepoFile(...) —
 * the real "work surface query" James asked for: read/write a file inside
 * a contract's real, provisioned repo, over idearium's already-real
 * GET/POST /api/repos/:uuid/file. Honest-degrade — resolves {ok:false}
 * rather than throwing, same contract as every other cross-process call
 * in this file.
 */
async function queryContractRepoFile(repoUuid, relPath) {
  if (!repoUuid || !relPath) return { ok: false, reason: 'repoUuid and relPath required' };
  const res = await _ideariumRequest('GET', `/api/repos/${encodeURIComponent(repoUuid)}/file?path=${encodeURIComponent(relPath)}`);
  if (!res) return { ok: false, reason: 'idearium unreachable' };
  if (res.status >= 400) return { ok: false, reason: (res.body && res.body.error) || `HTTP ${res.status}` };
  return { ok: true, ...res.body };
}

async function writeContractRepoFile(repoUuid, relPath, content) {
  if (!repoUuid || !relPath || typeof content !== 'string') {
    return { ok: false, reason: 'repoUuid, relPath, and string content required' };
  }
  const res = await _ideariumRequest('POST', `/api/repos/${encodeURIComponent(repoUuid)}/file`, { path: relPath, content });
  if (!res) return { ok: false, reason: 'idearium unreachable' };
  if (res.status >= 400) return { ok: false, reason: (res.body && res.body.error) || `HTTP ${res.status}` };
  return { ok: true, ...res.body };
}


// §MCO4 2026-09-13 — output-side twin of _resolveInputDir(), same
// fs.existsSync-checked real-directory-or-null contract, same shared
// fallback pattern. Real per-system output/ dirs created alongside this
// change for the same 9 systems that already have real input/ dirs
// (cortex, guardian, idearium, ollama, intelligence, eravos, emerge,
// architect, copilot) — MCO3a wired the read side of this convention;
// nothing had ever created the write side until now.
const RAID_OUTPUT_DIR = process.env.RAID_OUTPUT_DIR || path.join(__dirname, '../../../data/raid/output');
function _resolveOutputDir(system) {
  if (!system) return null;
  const fs = require('fs');
  const dir = path.join(__dirname, '../../../', system, 'output');
  return fs.existsSync(dir) ? dir : null;
}

const { createCFRLedger } = require('../../../intelligence/cfr/ledger');
// §MCO4 2026-09-13 DRIFT FIX — `const EVENTS = require('./event-taxonomy')`
// removed from here: flagged in MCO3's commit as a dead import, confirmed
// again before touching this file — zero references to `EVENTS.` anywhere
// in this module. event-taxonomy.js itself is real (RAID's own ET1-pattern
// event *descriptions*, matching guardian/clear-glass/orchestrator's own
// event-taxonomy.js convention) — not deleted, just never actually wired to
// anything in this file, so the import was pure noise. Every real event this
// module emits is still a raw string literal, same as before this fix;
// closing the dead-import drift is not the same as closing that gap.

const MODULE_ID = 'cortex/core/raid/contract-intake';
const VERSION = '1.0.0';
const TABLE = 'raid_contract_queue';

// §BUILT 2026-08-31, James live: "raid needs events" — real, own ledger
// instance matching guardian's exact pattern (guardian/server.js's own
// _evLedger, same createCFRLedger call). RAID had zero real event
// emissions before this — no bus.emit, no ledger writes — invisible to
// the causal graph and to intelligence's pattern-scanning regardless of
// how many real contracts moved through it. record() self-opens on first
// call (checked directly in intelligence/cfr/ledger.js), so no explicit
// open() needed here.
const _raidLedger = createCFRLedger({
  ledgerDir: require('path').join(__dirname, '..', '..', '..', 'data', 'raid', 'ledger', 'cfr'),
  systemId:  'raid',
});

const STATUS = Object.freeze({
  QUEUED: 'queued', RUNNING: 'running', PASS: 'pass', FAIL: 'fail', BLOCKED: 'blocked',
});

// §MCO16 2026-09-13 — James, explicit gate: "Routing signal: explicit
// executionSurface: 'browser'." A contract's real dispatch destination is
// declared by its submitter, not inferred from forAgent or intention — a
// caller who wants ClearGlass says so. Two real values only: BROWSER routes
// through _clearGlassExecutor below (real ClearGlass wire-server dispatch,
// real compartment tagging); INTERNAL (the default — every contract that
// existed before this landed) keeps today's exact behavior, zero change.
// Real validation + request-shape decisions live in the pure, unit-tested
// lib/clearglass-dispatch.js (§8.6 — same division of labor MCO11's
// lib/contract-repo-provision.js already established), not duplicated here.
const { EXECUTION_SURFACE, validateExecutionSurface, buildSetActiveBody, buildRouteBody, extractRouteText, validateDomStep, buildDomStepRequest, domStepResultFailed } = require('../../../lib/clearglass-dispatch.js');

// §RR4 2026-08-30 — real, physical lifecycle-position tracker, separate
// from STATUS (the dependency-graph state). Confirmed genuinely missing
// by this session's own direct question ("what tracks the contract file
// through the system, the dag?"): STATUS answers "did it pass," this
// answers "where is it right now." Only QUEUED and HANDSHAKE_VERIFIED
// are real, tagged today (acknowledge(), below) — the remaining stages
// (INPUT_FOLDER, SYSTEM_QUEUE, PROCESSING, OUTPUT_FOLDER, QC_PENDING)
// are named here as the real, intended sequence for IC5's future event
// gates to tag forward, not yet reachable — a contract cannot currently
// advance past HANDSHAKE_VERIFIED via any real code path.
const STAGE = Object.freeze({
  QUEUED: 'queued',
  HANDSHAKE_VERIFIED: 'handshake_verified',
  INPUT_FOLDER: 'input_folder',
  SYSTEM_QUEUE: 'system_queue',
  PROCESSING: 'processing',
  OUTPUT_FOLDER: 'output_folder',
  QC_PENDING: 'qc_pending',
});

let _qaqcRegistered = false;

/**
 * _registerContractQaQc() — wires compartment-engine's real qaqcLayer
 * extension point to ALSO check a compartment's result against the
 * ORIGINAL contract's own seam-verdict, on top of the real, already-built
 * adversary-suite QA/QC (meta/adversary-suite.js's runQAQC — syntax,
 * schema, type, invariant, deterministic_replay), not instead of it.
 *
 * §BUGFIX (found while verifying this module, before shipping it) — two
 * real bugs, not one: (1) compartment-engine.js's spawn() calls its own
 * _autoRegisterExtensions() exactly once, which wires the real
 * adversary-suite's runQAQC as the qaqcLayer if this function's caller
 * registered BEFORE spawn() ran — silently overwriting a registration
 * made earlier in the same process. Fixed by calling this AFTER spawn(),
 * inside processNext() below, never before. (2) runQAQC's own real
 * schema check requires the compartment's result to be null/undefined/an
 * object — confirmed directly by reading it, not assumed — so a bare
 * string result (the natural shape of an agent's raw text response)
 * fails that check regardless of anything this module adds. Real
 * callers must return a real object result ({text, ...}), not a bare
 * string — this extension reads .text (falling back to the whole result
 * if it's already a string, for a caller that hasn't made that switch
 * yet) rather than silently accepting a shape the real QA/QC layer
 * would reject anyway.
 */
function _registerContractQaQc() {
  if (_qaqcRegistered) return;
  _qaqcRegistered = true;
  let realQaQc = null;
  try { realQaQc = require('../../../meta/adversary-suite').runQAQC; } catch (_) { /* stays null — real checks just won't run */ }

  compartmentEngine._registerExtensions({
    qaqcLayer: async (compartment) => {
      const base = realQaQc ? await realQaQc(compartment) : { ran: false, reason: 'adversary-suite unreachable', checks: {} };

      const contract = compartment._contract;
      if (!contract) {
        // Not one of ours — a compartment spawned by some other real
        // caller with no contract attached. Return the real base checks
        // unchanged, add nothing — this extension never judges a
        // compartment it has no business judging.
        return base;
      }
      const result = compartment.result;
      const resultText = typeof result === 'string' ? result : (result && typeof result.text === 'string' ? result.text : JSON.stringify(result ?? ''));

      // §GENERALIZED 2026-08-28 — found while wiring idearium's real
      // chunks (idearium/spec-engine/index.js) as a second real contract
      // source: idearium's chunks succeed by producing real, non-empty
      // content — there is no self-reported "SEAM VERDICT" convention in
      // idearium's own buildChunkPrompt(), and there never should be; that
      // convention is specific to lib/seam/spec-parser.js's own prompts.
      // Hardcoding the seam-verdict scrape as the ONLY end-state check
      // would have made every real idearium chunk fail its RAID
      // compartment regardless of real success — a contract source this
      // module didn't know about yet would have looked broken through no
      // fault of its own. contract.checkEndState, when the contract
      // provides one, is now the real per-source judgment; the seam-
      // verdict scrape is kept as the DEFAULT for contracts that don't
      // (BR5's spec-parser output, unchanged from before this fix).
      const endState = typeof contract.checkEndState === 'function'
        ? contract.checkEndState(resultText, contract)
        : (() => {
            const verdictMatch = resultText.match(/SEAM VERDICT:\s*(PASS|FAIL)/i);
            const verdict = verdictMatch ? verdictMatch[1].toUpperCase() : null;
            return { pass: verdict === 'PASS', verdictPresent: verdict !== null, verdict };
          })();

      return {
        ran: true,
        checks: {
          ...(base.checks || {}),
          contract_end_state_pass: !!endState.pass,
        },
        verdict: endState.verdict ?? (endState.pass ? 'PASS' : 'FAIL'),
        contractFile: contract.file,
        contractChunkIdx: contract.idx,
      };
    },
  });
}

/**
 * submitContract(contract, opts) — the one real entry point ANY source
 * (spec-parser output today; loom/idearium/co-pilot/self-heal as their
 * own real contracts land) calls to enqueue a contract. Returns
 * immediately with { queueId, status: 'queued' } — this does NOT execute
 * the contract itself; see processNext() below for that, kept separate
 * on purpose so a queue can genuinely back up under load instead of
 * every submit blocking on a full agent round trip.
 *
 * contract — the real shape lib/seam/spec-parser.js's chunks[] already
 * produce (content, testContract, builtPrompt, file, forAgent, idx,
 * title) — but genuinely agnostic to origin: any object with content +
 * a real testable end-state works, since only file/title/forAgent are
 * read here and everything else rides through to the compartment
 * untouched for the eventual executor to use.
 *
 * §GRAPH 2026-08-28 — James: "highest leverage thing... turn RAID's
 * contract queue into a real dependency graph." The gap named directly:
 * LangGraph's actual core strength is nodes with conditional edges and
 * checkpointed state, not agents or tools — this queue was flat FIFO,
 * no contract could depend on another's outcome, no branching. Two new,
 * fully backward-compatible opts:
 *
 * opts.dependsOn — array of real queueIds this contract requires to have
 * PASSed before it's eligible to run. Defaults to [] (always eligible),
 * so every existing real caller (submitIdeariumChunk, BR5's own
 * spec-parser submissions) is completely unaffected.
 *
 * opts.onFail — {action:'retry', maxRetries} | {action:'fallbackAgent',
 * agent} | {action:'halt'} | null (default). null means exactly today's
 * behavior: one attempt, FAIL is terminal. 'retry' re-queues the SAME
 * contract (up to maxRetries) rather than re-invoking the executor
 * inline within processNext — keeps processNext's real contract intact
 * ("one unit of queue work per call"), a retry is just next call's work.
 * 'fallbackAgent' re-queues with a different forAgent after the first
 * real failure. 'halt' (or exhausting retry/fallback) leaves the row at
 * a real, terminal FAIL — which the NEXT processNext() call's blocking
 * pass (below) then propagates to BLOCK anything real that depends on it.
 */
function submitContract(contract, opts = {}) {
  if (!contract || typeof contract.content !== 'string') {
    throw new Error(`[${MODULE_ID}] submitContract requires a real contract with .content`);
  }
  // §MCO16 2026-09-13 — refused, not silently accepted: an unrecognized
  // executionSurface would otherwise fall through to INTERNAL below and
  // misroute a contract its own submitter explicitly meant for the browser
  // — a typo that would look like ordinary internal processing (§1.2, loud
  // not silent failure for something that changes real dispatch behavior).
  const executionSurfaceCheck = validateExecutionSurface(opts.executionSurface);
  if (!executionSurfaceCheck.ok) {
    throw new Error(`[${MODULE_ID}] submitContract: ${executionSurfaceCheck.reason}`);
  }
  const queueId = uid();
  // §MERGED 2026-09-02 — real boundary resolution from a parallel
  // session's own real work (cortex/core/raid/contract-boundary.js,
  // reconciled into this tree). Resolved from (source, intention) —
  // NOT (system, intention); system is never set at any real call
  // site (see that module's own header for the grep evidence). Never
  // blocks: a null boundary is honest ("no registered boundary for
  // this pair yet"), not a reason to refuse a real contract.
  const boundary = require('./contract-boundary.js').resolveBoundary(opts.source, opts.intention);
  const row = {
    uuid: queueId,
    status: STATUS.QUEUED,
    // §RR4 2026-08-30 — real, additive schema fields from this session's
    // own architectural review (docs/raid-routing-fidelity-phasemap.spec's
    // RR4). intention/dir/language are new; source/forAgent/compartmentId
    // already existed and are unchanged. `stage` is the real, separate
    // physical-lifecycle tracker this review found genuinely missing —
    // status answers "did it pass," stage answers "where is it right
    // now." Starts at STAGE.QUEUED; every later real event gate (IC5,
    // not built yet) tags it forward as the file physically moves.
    intention: opts.intention || null,   // what this contract is FOR (feeds IC3's taxonomy once real data exists)
    dir: opts.dir || null,               // real working directory/file scope this contract touches
    language: opts.language || null,     // only when applicable — a code contract vs a prose contract
    stage: STAGE.QUEUED,
    // §MCO16 2026-09-13 — real, explicit dispatch-destination declaration,
    // read by processNext()'s default-executor choice below. Defaults to
    // INTERNAL — every existing real caller (submitIdeariumChunk,
    // submitBuildPhaseContract, synthesizeContract, spec-parser's own
    // submissions) is completely unaffected unless it opts in.
    executionSurface: executionSurfaceCheck.value,
    system: opts.system || null,         // which SYSTEM originated this contract (distinct from source, which names the subsystem/mechanism)
    source: opts.source || 'unknown',      // 'spec-parser' | 'loom' | 'idearium' | 'copilot' | 'self-heal'
    // §ADDED 2026-09-02 — cortex/core/raid/officiator.js's own real
    // need: a contract synthesized FROM a staged artifact must be able
    // to trace back to it, both for a human auditing "why does this
    // contract exist" and for officiator.js's own persisted dedup
    // (lib/intake.js's markOfficiated()). null for every other real
    // source (spec-parser, idearium, self-heal, a manual submit) —
    // this isn't a new requirement on them. Kept alongside `boundary`
    // below (a parallel session's real, separate addition) — these are
    // two different real facts about the same contract, not
    // alternatives; one traces back to an artifact, the other explains
    // which axioms/principles govern this (source, intention) pair.
    sourceDropId: opts.sourceDropId || null,
    boundary,                              // { key, primitive, invariants, principles } | null — docs/contracts/synthesis-contract.spec#boundary
    file: contract.file || null,
    title: contract.title || null,
    forAgent: contract.forAgent || opts.forAgent || null,
    contract,                              // the real, full contract object — the end-state lives inside it
    dependsOn: Array.isArray(opts.dependsOn) ? opts.dependsOn.slice() : [],
    onFail: opts.onFail || {
      // §FIX 2026-09-03 — James: "we need all files in raids drainer with
      // a retry logic if it fails." Checked directly first: onFail was
      // only ever consulted when a submitter explicitly declared one
      // (contract-intake.js's own real retry/fallback branches below,
      // already built and tested) — a contract submitted with no onFail
      // at all got exactly one attempt and went straight to terminal
      // FAIL. This default gives every real contract genuine retry
      // behavior without every one of RAID's real submitters (self-heal,
      // co-pilot, idearium, spec-parser, loom) needing to remember to
      // declare it themselves. 2 retries — 3 total real attempts spread
      // across raid-worker.js's real 15s drain cadence (~30-45s of real
      // wall-clock retry) — matches that file's own documented reasoning
      // for its interval, not a separate guessed number.
      action: 'retry', maxRetries: 2,
    },
    retryCount: 0,
    compartmentId: null,
    verdict: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  try { jaaDB.insert(TABLE, row); } catch (e) {
    console.warn(`[${MODULE_ID}] queue insert failed, proceeding without persistence: ${e.message}`);
  }
  // §BUILT 2026-09-06 — James, repeated, explicit, across this whole
  // session: "all of the contracts are supposed to be tangible files
  // that move in the file system with the actual contract... each
  // system has a input folder." Real gap, checked directly before
  // building: this queue's own real persistence is jaaDB.insert() above
  // — real, already survives a restart, but a row inside a shared JAA
  // table is not "a tangible file," it's a row nothing outside JAA can
  // see, drop into, or watch. Purely additive, not a replacement — the
  // existing JAA-backed drain/retry/dependency logic already works and
  // is already tested; this doesn't touch any of it. Reuses
  // lib/node-export.js's own real .contract type (already real, built
  // earlier this session, grounded in this exact BUILD_CONTRACT_SCHEMA)
  // rather than inventing a second file format for the same real data.
  //
  // §MCO3a 2026-09-13 — real per-system routing. This always wrote to
  // RAID_INPUT_DIR alone despite the comment above (line ~42) already
  // claiming to follow "the same per-system input/ convention" — checked
  // directly: 9 real per-system input/ dirs exist on disk today (cortex,
  // guardian, idearium, ollama, intelligence, eravos, emerge, architect,
  // copilot) and this never wrote to any of them. _resolveInputDir()
  // below checks the real filesystem rather than trusting row.system
  // blindly — a typo'd or not-yet-real system name falls back to the
  // shared dir, logged, not silently misdirected into a folder nothing
  // will ever watch (§1.2).
  try {
    const { exportToFile } = require('../../../lib/node-export.js');
    const perSystemDir = _resolveInputDir(row.system);
    if (row.system && !perSystemDir) {
      console.warn(`[${MODULE_ID}] contract ${queueId}: system '${row.system}' has no real input/ directory — using shared ${RAID_INPUT_DIR} instead (§1.2)`);
    }
    const inputArtifactPath = exportToFile('contract', queueId, row, { system: row.system, intent: row.intention, source: row.source }, perSystemDir || RAID_INPUT_DIR);
    // §MCO4 2026-09-13 — the real path this file actually landed at,
    // persisted onto the row so the later INPUT_FOLDER stage transition
    // can verify THIS artifact still exists, rather than re-deriving a
    // path and hoping it matches (§1.1).
    try { jaaDB.update(TABLE, queueId, { inputArtifactPath }); } catch (_) {}
  } catch (e) {
    // §1.2 — a failed tangible-file write must never block the real,
    // already-working JAA-backed queue this contract still lives in.
    console.warn(`[${MODULE_ID}] tangible .contract file write failed (queue itself is unaffected): ${e.message}`);
  }
  if (!boundary) {
    // §1.2 — never silently dropped. A missing boundary is real,
    // inspectable information, not a swallowed gap.
    console.log(`[${MODULE_ID}] no registered boundary for ${row.source}:${row.intention || 'null'} (queueId ${queueId}) — contract-boundary.js REGISTRY has ${Object.keys(require('./contract-boundary.js').REGISTRY).length} real row(s) today`);
  }
  _raidLedger.record('raid.contract.submitted', {
    queueId, source: row.source, system: row.system, forAgent: row.forAgent, intention: row.intention, boundaryKey: boundary?.key || null,
  }, { source: 'raid', causedBy: null });
  return { queueId, status: STATUS.QUEUED, boundary };
}

/**
 * acknowledge(queueId, {system}) — RR4's real handshake ACK. A
 * receiving system calls this to confirm it genuinely received a
 * contract and understands its constraints BEFORE work starts — the
 * actual, minimal mechanism RR4 names ("the receiving system
 * acknowledges the contract + its constraints before work starts").
 * Advances stage from QUEUED to HANDSHAKE_VERIFIED. Real, honest
 * validation: refuses to ACK a contract that's already past this
 * stage (a stale or duplicate ACK is a real signal something's wrong,
 * not something to silently accept twice).
 *
 * §AM1 2026-09-02 — this is also now the real intent-contract GATE
 * (lib/agent-intent-contract.js). A contract naming a real forAgent AND
 * a real intent gets checked here, before HANDSHAKE_VERIFIED, not just
 * routed to hopefully — the exact "agent aware and specific for each
 * intent" enforcement point RAID's own real handshake already existed
 * to be. A contract with no forAgent or no intent (most contracts
 * before this session) skips the check entirely — this is additive,
 * not a new requirement on every existing caller.
 */
function acknowledge(queueId, { system } = {}) {
  const rows = jaaDB.query(TABLE, r => r.uuid === queueId, 1);
  const row = rows[0];
  if (!row) return { ok: false, error: `no real contract with queueId "${queueId}"` };
  if (row.stage !== STAGE.QUEUED) {
    return { ok: false, error: `contract is already at stage "${row.stage}" — cannot acknowledge a contract that's past QUEUED` };
  }
  if (row.forAgent && row.intention) {
    try {
      const { checkAgentIntentContract } = require('../../../lib/agent-intent-contract.js');
      const check = checkAgentIntentContract(row.forAgent, row.intention);
      if (!check.ok) {
        jaaDB.update(TABLE, queueId, { status: STATUS.BLOCKED, updatedAt: Date.now(), blockReason: `intent contract refused: ${check.reason}` });
        _raidLedger.record('raid.contract.rejected', { queueId, forAgent: row.forAgent, intention: row.intention, reason: check.reason }, { source: 'raid', causedBy: queueId });
        return { ok: false, error: `intent contract refused: ${check.reason}` };
      }
    } catch (e) {
      // §HONEST DEGRADATION — a contract-check failure (module load
      // error, etc.) must never silently block real work that has
      // nothing to do with it. Logged, not swallowed; the handshake
      // proceeds as it did before AM1 existed.
      console.warn(`[${MODULE_ID}] intent contract check failed (non-fatal, proceeding): ${e.message}`);
    }
  }
  jaaDB.update(TABLE, queueId, { stage: STAGE.HANDSHAKE_VERIFIED, updatedAt: Date.now(), acknowledgedBy: system || null });
  _raidLedger.record('raid.contract.acknowledged', { queueId, acknowledgedBy: system || null }, { source: 'raid', causedBy: queueId });

  // §MCO4 2026-09-13 — real, immediate next step: verify the tangible
  // .contract file submitContract() wrote is still really there, and only
  // then advance past HANDSHAKE_VERIFIED. A failed verification leaves the
  // row honestly at HANDSHAKE_VERIFIED rather than reporting INPUT_FOLDER
  // for a file that isn't real.
  const inputAdv = _advanceToInputFolder(queueId, row);

  return { ok: true, stage: inputAdv.ok ? STAGE.INPUT_FOLDER : STAGE.HANDSHAKE_VERIFIED };
}

// §MCO4 2026-09-13 — wiring STAGE's five remaining dead values. Per this
// phasemap's own gate: each transition is a real jaaDB write + a real
// _raidLedger event, always; a NEW physical artifact ONLY where something
// genuinely changes location on disk (INPUT_FOLDER, OUTPUT_FOLDER). No
// artifact is fabricated for SYSTEM_QUEUE or PROCESSING — nothing physical
// happens at either, so neither gets one (§1.1).

/**
 * _advanceToInputFolder(queueId, row) — verifies the SAME real artifact
 * submitContract() already wrote (row.inputArtifactPath) still exists on
 * disk, and only then tags stage HANDSHAKE_VERIFIED -> INPUT_FOLDER. This
 * is proof the tangible file genuinely landed and is still there by the
 * time handshake clears — not a second write, and not skipped just
 * because the write already happened earlier in real time.
 */
function _advanceToInputFolder(queueId, row) {
  const fs = require('fs');
  if (!row.inputArtifactPath || !fs.existsSync(row.inputArtifactPath)) {
    console.warn(`[${MODULE_ID}] contract ${queueId}: no real input artifact found at "${row.inputArtifactPath || '(none recorded)'}" — staying at HANDSHAKE_VERIFIED, not fabricating INPUT_FOLDER`);
    return { ok: false, error: 'input artifact missing or never recorded' };
  }
  jaaDB.update(TABLE, queueId, { stage: STAGE.INPUT_FOLDER, updatedAt: Date.now() });
  _raidLedger.record('raid.contract.stage.input_folder', { queueId, inputArtifactPath: row.inputArtifactPath }, { source: 'raid', causedBy: queueId });
  return { ok: true, stage: STAGE.INPUT_FOLDER };
}

/**
 * _advanceToSystemQueue(queueId) — state+event only, no artifact (§1.1).
 * James, confirmed 2026-09-13: this stage names RAID's OWN dequeue — the
 * moment processNext() below selects a row as the one real unit of work
 * it's about to run — not a report-back from the destination system's own
 * internal queue, which no system anywhere in this tree does today. That
 * cross-system reporting is real future scope (IC5's pilot destination
 * work), not something to fabricate here to make this stage feel more real
 * than it is.
 */
function _advanceToSystemQueue(queueId) {
  jaaDB.update(TABLE, queueId, { stage: STAGE.SYSTEM_QUEUE, updatedAt: Date.now() });
  _raidLedger.record('raid.contract.stage.system_queue', { queueId }, { source: 'raid', causedBy: queueId });
  return { ok: true, stage: STAGE.SYSTEM_QUEUE };
}

/** _advanceToProcessing(queueId) — state+event only, no artifact (§1.1). */
function _advanceToProcessing(queueId) {
  jaaDB.update(TABLE, queueId, { stage: STAGE.PROCESSING, updatedAt: Date.now() });
  _raidLedger.record('raid.contract.stage.processing', { queueId }, { source: 'raid', causedBy: queueId });
  return { ok: true, stage: STAGE.PROCESSING };
}

/**
 * _advanceToOutputFolder(queueId, row, resultPayload) — writes the real
 * result artifact to the destination system's real output/ dir (or the
 * shared RAID_OUTPUT_DIR fallback, logged, same §1.2 pattern as the input
 * side), then folds PROCESSING -> OUTPUT_FOLDER -> QC_PENDING into one
 * function, per this phasemap's own text: "idempotency check ... built
 * into this last transition, not separate." The idempotency check itself
 * — does a real output for this uuid already exist — is read from disk
 * BEFORE the write below, so `alreadyHadOutput` reflects a PRIOR run of
 * this same contract, never the file this call is about to produce
 * itself.
 */
async function _advanceToOutputFolder(queueId, row, resultPayload) {
  const fs = require('fs');
  const perSystemDir = _resolveOutputDir(row.system);
  if (row.system && !perSystemDir) {
    console.warn(`[${MODULE_ID}] contract ${queueId}: system '${row.system}' has no real output/ directory — using shared ${RAID_OUTPUT_DIR} instead (§1.2)`);
  }
  const outputDir = perSystemDir || RAID_OUTPUT_DIR;
  const expectedPath = path.join(outputDir, `${queueId}.contract`);
  const alreadyHadOutput = fs.existsSync(expectedPath);

  let outputArtifactPath;
  let viaFallback = false;
  try {
    const { exportToFile } = require('../../../lib/node-export.js');
    outputArtifactPath = exportToFile('contract', queueId, resultPayload, { system: row.system, intent: row.intention, source: row.source }, outputDir);
  } catch (e) {
    // §MCO13 2026-09-13 — "create a compartment as a fallback so nothing
    // gets lost" (James). Real fallback, not a design placeholder: if the
    // primary output-dir write fails, try the contract's own real repo
    // (MCO11's already-provisioned compartment-as-repo, row.repoUuid) —
    // reuses writeContractRepoFile() as-is, no new mechanism. Still
    // honest either way: no repoUuid, or the fallback write itself
    // fails, and the row stays at PROCESSING with the real failure
    // visible, never fabricated into OUTPUT_FOLDER/QC_PENDING.
    console.warn(`[${MODULE_ID}] primary output artifact write failed for ${queueId}: ${e.message} — trying compartment fallback`);
    if (!row.repoUuid) {
      console.warn(`[${MODULE_ID}] no real repoUuid on this contract — no compartment to fall back to`);
      return { ok: false, error: e.message };
    }
    const fallback = await writeContractRepoFile(row.repoUuid, `output/${queueId}.json`, JSON.stringify(resultPayload));
    if (!fallback.ok) {
      console.warn(`[${MODULE_ID}] compartment fallback also failed for ${queueId}: ${fallback.reason} — stage stays at PROCESSING, not fabricated`);
      return { ok: false, error: e.message, fallbackError: fallback.reason };
    }
    outputArtifactPath = `repo:${row.repoUuid}/${fallback.path}`;
    viaFallback = true;
  }

  jaaDB.update(TABLE, queueId, { stage: STAGE.OUTPUT_FOLDER, outputArtifactPath, outputViaFallback: viaFallback, updatedAt: Date.now() });
  _raidLedger.record(viaFallback ? 'raid.contract.stage.output_folder_fallback' : 'raid.contract.stage.output_folder', { queueId, outputArtifactPath }, { source: 'raid', causedBy: queueId });

  jaaDB.update(TABLE, queueId, { stage: STAGE.QC_PENDING, alreadyHadOutput, updatedAt: Date.now() });
  _raidLedger.record('raid.contract.stage.qc_pending', { queueId, alreadyHadOutput }, { source: 'raid', causedBy: queueId });

  return { ok: true, stage: STAGE.QC_PENDING, outputArtifactPath, alreadyHadOutput, viaFallback };
}

/** listQueue(filter) — real, current queue state. */
function listQueue(filter = {}) {
  try {
    return jaaDB.query(TABLE, r => !filter.status || r.status === filter.status);
  } catch (_) { return []; }
}

// §GRAPH — real dependency-graph helpers, both operating on the SAME real
// queue rows (no separate graph structure invented — the queue IS the
// graph, dependsOn arrays are the edges).
function _dependenciesSatisfied(row, allRows) {
  if (!row.dependsOn || !row.dependsOn.length) return true;
  return row.dependsOn.every((depId) => {
    const dep = allRows.find((r) => r.uuid === depId);
    return dep && dep.status === STATUS.PASS;
  });
}
function _dependencyPermanentlyFailed(row, allRows) {
  if (!row.dependsOn || !row.dependsOn.length) return false;
  // §REAL DESIGN NOTE — a row's status is only ever FAIL once retry/
  // fallback (if any) is exhausted; a still-retriable failure gets
  // re-queued back to QUEUED by processNext() below rather than settling
  // at FAIL. So FAIL and BLOCKED are the only two real, permanent
  // failure states a dependent needs to check for — no separate
  // "is this dep still retriable" lookup needed here.
  return row.dependsOn.some((depId) => {
    const dep = allRows.find((r) => r.uuid === depId);
    return dep && (dep.status === STATUS.FAIL || dep.status === STATUS.BLOCKED);
  });
}

/**
 * processNext(executor) — dequeues the oldest QUEUED row whose real
 * dependencies (opts.dependsOn) have all PASSed, spawns a real
 * compartment per contract (compartmentEngine.spawn), runs it through
 * the real execute()/resolve() lifecycle with the contract's own
 * seam-verdict wired as the end-state check (registered above), and
 * persists the real outcome. Returns null if the queue is genuinely
 * empty, or {blocked:true, waitingCount} if queued contracts exist but
 * none have satisfied dependencies yet — a real, distinct signal from
 * "nothing to do," not conflated with it.
 *
 * §GRAPH 2026-08-28 — before picking a contract to run, every QUEUED row
 * is checked against the real graph: if any of its dependencies has
 * permanently FAILed or is BLOCKED, this row is marked BLOCKED too (not
 * left sitting in the queue looking pending forever) — and that check
 * runs for every real queued row on every call, so a failure blocks its
 * whole downstream chain within one processNext() call, not just the
 * immediate child.
 *
 * executor(workingMemory, constraintFrame) — the real dispatch call
 * (e.g. lib/agent-router.js's routeAgent() result, actually sent to the
 * chosen provider) a caller supplies. Not built here — this module owns
 * the queue and the compartment lifecycle, not agent dispatch itself,
 * same separation of concerns agent-router/lifeline already keep.
 */
async function processNext(executor) {
  const allRows   = listQueue();
  const queuedRows = allRows.filter((r) => r.status === STATUS.QUEUED).sort((a, b) => a.createdAt - b.createdAt);

  // Real blocking pass — every queued row, not just whichever one we're
  // about to run, so a failure's whole downstream chain gets marked in
  // one pass rather than one BLOCKED discovered per future call.
  for (const row of queuedRows) {
    if (_dependencyPermanentlyFailed(row, allRows)) {
      try { jaaDB.update(TABLE, row.uuid, { status: STATUS.BLOCKED, updatedAt: Date.now(), blockReason: 'a real dependency permanently failed or was itself blocked' }); } catch (_) {}
      row.status = STATUS.BLOCKED; // reflect locally so the eligibility filter below excludes it too
    }
  }

  const ready = queuedRows.filter((r) => r.status === STATUS.QUEUED && _dependenciesSatisfied(r, allRows));
  if (!ready.length) {
    const stillWaiting = queuedRows.filter((r) => r.status === STATUS.QUEUED);
    if (stillWaiting.length) return { blocked: true, reason: 'queued contracts exist but none have all dependencies satisfied yet', waitingCount: stillWaiting.length };
    return null; // genuinely nothing left — real, honest "nothing to do"
  }
  const queued = ready[0];

  // §AM6-CLOSED 2026-09-02 — James confirmed: "yes. sure." (to fixing
  // this). Real gap found while explaining how to test the agent mesh:
  // this function dequeued and dispatched purely on status===QUEUED,
  // never checking stage — meaning AM1's real intent-contract gate
  // (acknowledge(), which only runs when a caller happens to call it
  // explicitly) was bypassable simply by never calling it. The auto-
  // drain worker (cortex/core/raid/worker.js, ticking every 15s) never
  // called it either — so in the real, automatic path, AM1's gate never
  // ran at all. Fixed at the one real choke point every dispatch passes
  // through, rather than requiring every caller (submitBuildPhaseContract,
  // submitIdeariumChunk, self-heal, co-pilot, the raid-worker) to
  // remember to call acknowledge() themselves. A contract already past
  // QUEUED stage (a caller that DID call acknowledge() explicitly, e.g.
  // this session's own manual-test flow) is left alone — acknowledge()
  // itself already refuses to re-run past QUEUED, so this is a safe,
  // idempotent call, not a second gate stacked on top of a first.
  if (queued.stage === STAGE.QUEUED) {
    const ack = acknowledge(queued.uuid, { system: 'raid-processNext-auto' });
    if (!ack.ok) {
      // acknowledge() itself already moved this row to BLOCKED with a
      // real blockReason — nothing further to do here except report it
      // honestly and let the caller (raid-worker's tick(), or a direct
      // caller) see a real, specific reason, not a generic "blocked".
      return { queueId: queued.uuid, status: 'blocked_at_handshake', reason: ack.error };
    }
  }

  // §MCO4 2026-09-13 — real stage progression up to PROCESSING. Read the
  // row's CURRENT real stage fresh rather than trusting `queued` (captured
  // before the auto-ack above may have just moved it) — a contract already
  // past HANDSHAKE_VERIFIED/INPUT_FOLDER via its own earlier explicit
  // caller only advances from wherever it genuinely already is, never
  // backward, never skipped.
  const freshRow = jaaDB.query(TABLE, r => r.uuid === queued.uuid, 1)[0] || queued;
  if (freshRow.stage === STAGE.INPUT_FOLDER) _advanceToSystemQueue(queued.uuid);

  const intent = {
    uuid: uid(),
    verb: 'implement',
    domain: queued.file ? require('path').basename(queued.file) : (queued.title || 'contract'),
  };

  // §BUGFIX — must spawn() BEFORE registering our qaqcLayer, not after.
  // spawn() is the only caller of compartment-engine's own
  // _autoRegisterExtensions(), which runs exactly once per process and
  // wires the real adversary-suite as the qaqcLayer — registering ours
  // first, then calling spawn(), let that auto-wiring silently overwrite
  // it back to the (real, but contract-blind) default. Confirmed directly
  // by tracing the actual overwrite before fixing, not assumed.
  const compartment = await compartmentEngine.spawn({ intent, budget: null, boundary: null, injectedFrameworks: [] });
  _registerContractQaQc();
  // The one real link between a generic compartment and THIS contract's
  // own end-state — read by the qaqcLayer extension above, nowhere else.
  compartment._contract = queued.contract;

  // §MCO16 2026-09-13 — James, explicit gate: "persist compartmentUuid on
  // the queue row." Same value as compartmentId above (compartment.id IS
  // the real compartment uuid) — recorded under the field name
  // lib/compartment-dom-ledger.js's own compartment_dom_ledger table
  // already uses, so a human (or a future join query) can go
  // raid_contract_queue.compartmentUuid -> compartment_dom_ledger.compartmentUuid
  // directly, without knowing the two tables happen to mean the same
  // thing by two different field names.
  try { jaaDB.update(TABLE, queued.uuid, { status: STATUS.RUNNING, compartmentId: compartment.id, compartmentUuid: compartment.id, updatedAt: Date.now() }); } catch (_) {}
  _advanceToProcessing(queued.uuid);

  // §MCO11 2026-09-13 — "raid creates a compartment for the contract to
  // use as a repo." Real cross-process call to idearium's real /api/repos
  // (the fix earlier this pass made compartmentId actually reach
  // RepoLayer.ingest()) — same honest-degrade http pattern already
  // proven by agent-mesh.js's _raidDecide() and this session's own
  // compartment-dom-ledger reporter: never throws, resolves null on any
  // failure, so an unreachable idearium degrades this to exactly "no
  // repo/work-surface for this contract," never a blocked or failed
  // PROCESSING stage over a repo-provisioning problem.
  const repoUuid = await _provisionContractRepo(queued, compartment.id);
  if (repoUuid) {
    try { jaaDB.update(TABLE, queued.uuid, { repoUuid, updatedAt: Date.now() }); } catch (_) {}
  } else {
    console.warn(`[${MODULE_ID}] contract ${queued.uuid}: no real repo provisioned (idearium unreachable or refused) — PROCESSING continues without a work surface`);
  }

  // §MCO16 2026-09-13 — real destination branch. A caller-supplied executor
  // always wins, unchanged from before (an explicit caller decision is
  // never overridden — same principle decideForContract's own header
  // already documents for guardian/server.js's explicit provider choice).
  // Only the DEFAULT (no explicit executor) now branches on the contract's
  // own declared executionSurface — every contract that predates this
  // field reads INTERNAL and gets exactly _realAgentExecutor, byte-for-byte
  // the prior behavior.
  const defaultExecutor = queued.executionSurface === EXECUTION_SURFACE.BROWSER
    ? () => _clearGlassExecutor(queued, compartment)
    : () => _realAgentExecutor(queued);
  const resolved = executor
    ? await compartmentEngine.execute(compartment, executor)
    : await compartmentEngine.execute(compartment, defaultExecutor);

  const finalStatus = resolved.status === 'PASS' ? STATUS.PASS : STATUS.FAIL;

  // §GRAPH — real onFail policy, only consulted on a real failure.
  if (finalStatus === STATUS.FAIL && queued.onFail) {
    if (queued.onFail.action === 'retry' && (queued.retryCount || 0) < (queued.onFail.maxRetries || 1)) {
      const nextAttempt = (queued.retryCount || 0) + 1;
      try { jaaDB.update(TABLE, queued.uuid, { status: STATUS.QUEUED, retryCount: nextAttempt, updatedAt: Date.now() }); } catch (_) {}
      return { queueId: queued.uuid, compartmentId: compartment.id, status: 'retrying', attempt: nextAttempt, maxRetries: queued.onFail.maxRetries || 1, compartment: resolved };
    }
    if (queued.onFail.action === 'fallbackAgent' && queued.onFail.agent && queued.forAgent !== queued.onFail.agent) {
      try {
        jaaDB.update(TABLE, queued.uuid, {
          status: STATUS.QUEUED, forAgent: queued.onFail.agent, updatedAt: Date.now(),
          contract: { ...queued.contract, forAgent: queued.onFail.agent },
        });
      } catch (_) {}
      return { queueId: queued.uuid, compartmentId: compartment.id, status: 'retrying_with_fallback_agent', fallbackAgent: queued.onFail.agent, compartment: resolved };
    }
    // action==='halt', or retry/fallback exhausted: falls through to the
    // real, terminal FAIL below — the NEXT processNext() call's blocking
    // pass (top of this function) is what propagates that to anything
    // real that depends on this contract.
  }

  try {
    jaaDB.update(TABLE, queued.uuid, {
      status: finalStatus, updatedAt: Date.now(),
      verdict: resolved.trace_log?.find(t => t.event === 'QA_QC')?.data?.verdict ?? null,
    });
  } catch (_) {}

  // §MCO4 2026-09-13 — real terminal stage progression. Reached only for
  // an actual terminal outcome (both retry/fallback branches above already
  // returned early) — a genuinely real result exists to write, not a
  // placeholder. queued.system/intention/source are read from the row
  // captured at dequeue; unlike stage, these never change mid-run.
  await _advanceToOutputFolder(queued.uuid, queued, {
    queueId: queued.uuid,
    status: finalStatus,
    verdict: resolved.trace_log?.find(t => t.event === 'QA_QC')?.data?.verdict ?? null,
    trace_log: resolved.trace_log || null,
  });

  // §FIX 2026-09-03 — James: "runs an escalation strategy using
  // diagnostic system, over and over until it either proceeds or fails
  // completely... failure mode from escalation strategy is logged to
  // the data folder." A contract reaching this line has genuinely
  // exhausted every real option above (no onFail, or retry/fallback
  // already used up, or an explicit halt) — this is real, terminal
  // failure, not a case already handled by an early return higher up.
  // Real self-heal escalation ladder already exists and is already
  // bus-wired (cortex/self-heal/index.js, 5 real levels ending in
  // _enterFailureMode's real failure_modes JAA row — a real data-folder
  // record, not a new logging mechanism invented here) — this contract's
  // own terminal failure now feeds that SAME real ladder instead of
  // dead-ending silently.
  //
  // §LOOP GUARD — checked directly before wiring this: self-heal's own
  // level-4 _enterFailureMode() submits its OWN new RAID contract with
  // onFail:'halt' when every automated level fails. Without this guard,
  // THAT contract's own eventual terminal failure would re-emit
  // HEAL_REQUESTED for the same gapType, which _levelFor() would then
  // read back at an already-elevated count/level — a real infinite
  // loop. source==='self-heal' contracts are self-heal's own terminal
  // human-action items by design (they already wrote failure_modes);
  // they do not re-enter the ladder.
  if (finalStatus === STATUS.FAIL && queued.source !== 'self-heal') {
    try {
      require('../../../nexus/nexus-bus.js').emit('HEAL_REQUESTED', {
        gapType: 'raid_contract_exhausted',
        gapUuid: queued.uuid,
        body: `RAID contract "${queued.title || queued.uuid}" (source: ${queued.source}) failed with no further retry/fallback available. verdict: ${resolved.trace_log?.find(t => t.event === 'QA_QC')?.data?.verdict ?? 'none'}`,
      }, { source: 'raid-contract-intake' });
    } catch (e) {
      console.warn(`[${MODULE_ID}] could not emit HEAL_REQUESTED for exhausted contract ${queued.uuid}: ${e.message}`);
    }
  }

  return { queueId: queued.uuid, compartmentId: compartment.id, status: finalStatus, compartment: resolved };
}

/**
 * submitIdeariumChunk(manifest, chunk) — the second real contract source,
 * alongside lib/seam/spec-parser.js's own. idearium/spec-engine/index.js
 * already builds a real, complete chunk object (contract_id, fileName,
 * filePath, agent, buildChunkPrompt()) — this reads that real shape
 * directly rather than inventing a parallel one. checkEndState is real,
 * not a stub: idearium's own completeChunk() accepts whatever non-empty
 * content an agent returns as success (confirmed by reading it — no
 * verdict convention, no PASS/FAIL self-report), so that IS this
 * contract's real end state, not a placeholder awaiting a better check.
 *
 * async + dynamic import(), not require() — idearium/spec-engine/index.js
 * uses real ESM syntax (export function), confirmed directly (unlike this
 * file, which has no import/export and so Node's own syntax detection
 * treats it as CommonJS regardless of the repo root's "type":"module").
 * idearium/api/index.js already loads it the same way for the same
 * reason — matched, not invented.
 */
async function submitIdeariumChunk(manifest, chunk) {
  const se = await import('../../../idearium/spec-engine/index.js');
  const specEngine = se.default || se;
  const content = specEngine.buildChunkPrompt(manifest, chunk);
  return submitContract({
    content,
    file: chunk.filePath,
    title: chunk.sectionTitle,
    forAgent: chunk.agent,
    idx: chunk.chunkIdx,
    checkEndState: (resultText) => ({ pass: !!resultText && resultText.trim().length > 0 }),
  }, { source: 'idearium', forAgent: chunk.agent, intention: 'build' });
}

/**
 * submitBuildPhaseContract(phase, opts) — "a contract for building
 * phases" (James, 2026-09-02). The real third contract source, alongside
 * spec-parser's and idearium's own: a real phasemap PHASE — the same
 * shape every docs/*.spec phasemap in this repo already writes (name,
 * status, does, depends_on) — becomes a real RAID contract an agent can
 * be dispatched against, end to end, tonight.
 *
 * §REAL, NOT INVENTED SHAPE — `phase` matches exactly what a phasemap's
 * own `phases:` entries already look like (checked against this
 * session's own docs/2026-09-02-agent-mesh-full-map-phasemap.spec):
 *   { name, status, does, depends_on, forAgent }
 * `does` becomes the real prompt content; `forAgent` is required (a
 * build-phase contract with no target agent is meaningless — refused
 * here, not defaulted to 'auto' and silently routed nowhere in
 * particular). intention is set to 'build' — a real verb from intent-
 * classifier's own VERB_PATTERNS — so AM1's intent-contract gate
 * (acknowledge(), above) actually checks it against the target agent's
 * real hats, not skipped for lack of an intention.
 *
 * checkEndState is intentionally the same honest bar submitIdeariumChunk
 * uses (non-empty response = pass) — a stronger, phase-specific
 * acceptance check is real, future work (this phasemap's own AM6 already
 * names "RAID checks... before the NCP push," not after), not invented
 * here to look more finished than it is.
 */
function submitBuildPhaseContract(phase, opts = {}) {
  if (!phase || typeof phase.does !== 'string' || !phase.does.trim()) {
    throw new Error(`[${MODULE_ID}] submitBuildPhaseContract requires phase.does — a real, non-empty description of the work`);
  }
  if (!phase.forAgent) {
    throw new Error(`[${MODULE_ID}] submitBuildPhaseContract requires phase.forAgent — a build-phase contract must name a real target agent`);
  }
  const content = phase.name
    ? `[Phase: ${phase.name}]\n\n${phase.does}`
    : phase.does;
  return submitContract({
    content,
    title: phase.name || null,
    forAgent: phase.forAgent,
    dependsOn: Array.isArray(phase.depends_on) ? phase.depends_on : [],
    checkEndState: (resultText) => ({ pass: !!resultText && resultText.trim().length > 0 }),
  }, {
    source: 'agent-mesh',
    intention: 'build',
    forAgent: phase.forAgent,
    dependsOn: Array.isArray(phase.depends_on) ? phase.depends_on : [],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// §B1 2026-09-03 — the full build-contract schema. James, complete real
// field list: "end-state, conditions, intent, context, warp primitives,
// axioms, relevant agent tools for the request, compartment uuid, file
// directory, file name. need to synthesize contracts for each request."
//
// submitBuildPhaseContract() above is real but narrower (hardcodes
// intention:'build', no conditions/warpPrimitives/axioms/compartmentUuid/
// fileDirectory/fileName). This does not replace it — synthesizeContract()
// below composes with the same real submitContract() both already call
// (§10.3 — one real intake path, not two).
//
// Every referenced-but-not-invented real system, checked this session:
//   - intent: validated against lib/intent-classifier.js's real
//     VALID_VERBS (build/write/forge/officiate/heal/diagnose/analyze/
//     query/recall/snapshot/validate/explain/dispatch/delete/rollback/
//     overwrite) — a made-up verb is refused, not silently accepted.
//   - warpPrimitives: validated against warp/core/index.js's real,
//     exact 5 exports (Event, Gate, Axiom, Stream, StreamLog) — the
//     only 5 that exist, per warp/spec/warp.spec.
//   - axioms: validated against docs/AXIOMS-v3.1.md's own real §N.N
//     section headers, parsed live from the file (100 real refs found
//     2026-09-03) — not a hardcoded, driftable copy of the list.
//   - tools: defaults to the real hat-scoped toolScope AM1 already
//     computes (lib/hat-forge.js's forged hat, resolved via
//     lib/intent-hat-router.js's suggestHat() when forAgent names a
//     live hat) — a caller can still override with an explicit list.
// ═══════════════════════════════════════════════════════════════════════════

const BUILD_CONTRACT_SCHEMA = Object.freeze({
  uuid:           'string, assigned — the real queue id, same as every other contract',
  forAgent:       'string, required — the real target agent or hat name',
  intent:         'string, required — a real verb from intent-classifier.js\'s VALID_VERBS',
  system:         'string, optional — which real SYSTEM this contract concerns',
  endState:       'string, required — the real target condition this contract must reach, not a task description',
  conditions:     'object, optional — { pre: string[], post: string[] } structured pre/post conditions',
  context:        'string, optional — real context, pulled on demand via toolScope, not force-fed',
  warpPrimitives: 'string[], optional — subset of the real 5: Event, Gate, Axiom, Stream, StreamLog',
  axioms:         'string[], optional — real §N.N refs from docs/AXIOMS-v3.1.md, validated against the live file',
  tools:          'string[], optional — real toolScope; defaults from forAgent\'s hat when omitted',
  compartmentUuid:'string, optional — a real, specific existing compartment to target, not always freshly spawned',
  fileDirectory:  'string, optional — the real target directory this contract\'s work lands in',
  fileName:       'string, optional — the real target file name',
  executionSurface: 'string, optional — "internal" (default) or "browser". §MCO16 2026-09-13: BROWSER routes this contract through _clearGlassExecutor (real ClearGlass dispatch + real compartment DOM tagging) instead of the default agent executor.',
  domSteps: 'array, optional — §MCO16c 2026-09-13. Real page-interaction steps for a BROWSER contract: [{action:"query"|"mutate", providerId?, selector?, query?, cgId?, mutation?}], run in order against ClearGlass\'s real /dom/query and /dom/mutate. When present, these steps ARE the contract\'s work — no chat prompt is dispatched. Ignored for executionSurface INTERNAL.',
});

let _axiomRefsCache = null;
function _realAxiomRefs() {
  if (_axiomRefsCache) return _axiomRefsCache;
  try {
    const fs = require('fs');
    const path = require('path');
    const text = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'docs', 'AXIOMS-v3.1.md'), 'utf8');
    _axiomRefsCache = new Set((text.match(/§\d+\.\d+/g) || []));
  } catch (_) {
    _axiomRefsCache = new Set(); // real file missing — every axiom ref is then honestly refused, not silently trusted
  }
  return _axiomRefsCache;
}

const WARP_PRIMITIVES = new Set(Object.keys(require('../../../warp/core')).filter(k => ['Event', 'Gate', 'Axiom', 'Stream', 'StreamLog'].includes(k)));

/**
 * synthesizeContract(req) -> submitContract()'s own real result, or
 * {ok:false, errors} if req fails real validation before ever reaching
 * the queue. "Synthesize" (James's own word) — this is the automated
 * builder for the B1 schema, not just the schema definition.
 */
function synthesizeContract(req = {}) {
  const errors = [];
  if (!req.forAgent) errors.push('forAgent: required — a build contract must name a real target agent');
  if (!req.intent) errors.push('intent: required');
  else {
    const validVerbs = require('../../../lib/intent-classifier.js').VALID_VERBS;
    if (!validVerbs.includes(req.intent)) errors.push(`intent: "${req.intent}" is not a real verb — one of: ${validVerbs.join(', ')}`);
  }
  if (!req.endState || typeof req.endState !== 'string' || !req.endState.trim()) {
    errors.push('endState: required — the real target condition, not a task description');
  }
  if (req.warpPrimitives) {
    const bad = req.warpPrimitives.filter(p => !WARP_PRIMITIVES.has(p));
    if (bad.length) errors.push(`warpPrimitives: not real WARP primitives — ${bad.join(', ')} (only ${[...WARP_PRIMITIVES].join(', ')} exist)`);
  }
  if (req.axioms) {
    const refs = _realAxiomRefs();
    const bad = req.axioms.filter(a => !refs.has(a));
    if (bad.length) errors.push(`axioms: not real refs in docs/AXIOMS-v3.1.md — ${bad.join(', ')}`);
  }
  if (req.conditions && (typeof req.conditions !== 'object' || Array.isArray(req.conditions))) {
    errors.push('conditions: must be an object, e.g. { pre: [...], post: [...] }');
  }
  if (errors.length) return { ok: false, errors };

  // tools: real default from forAgent's hat when not explicitly given —
  // composes with hat-forge/intent-hat-router rather than re-deriving
  // toolScope logic a second time (§10.3).
  let tools = req.tools || null;
  if (!tools) {
    try {
      const hatForge = require('../../../lib/hat-forge.js');
      const hat = hatForge.byName(req.forAgent) || hatForge.get(req.forAgent);
      if (hat && hat.toolScope) tools = hat.toolScope;
    } catch (_) { /* hat-forge unavailable — tools stays null, honest, not guessed */ }
  }

  const content = [
    req.system ? `[System: ${req.system}]` : null,
    `[End state] ${req.endState}`,
    req.context ? `[Context]\n${req.context}` : null,
    req.conditions ? `[Conditions] ${JSON.stringify(req.conditions)}` : null,
  ].filter(Boolean).join('\n\n');

  const result = submitContract({
    content,
    title: req.fileName || null,
    forAgent: req.forAgent,
    dependsOn: Array.isArray(req.dependsOn) ? req.dependsOn : [],
  }, {
    source: req.source || 'b1-synthesize',
    intention: req.intent,
    forAgent: req.forAgent,
    system: req.system || null,
    dir: req.fileDirectory || null,
    language: req.language || null,
    dependsOn: Array.isArray(req.dependsOn) ? req.dependsOn : [],
    // §MCO16 2026-09-13 — B1 schema had no executionSurface field before
    // this; synthesizeContract() is the one real caller-facing API surface
    // this schema already exposes (fileDirectory/fileName/axioms/tools all
    // pass through the same way) — undefined here is real and correct for
    // every existing real caller, who never set this and gets exactly
    // today's INTERNAL default (submitContract's own real validation).
    executionSurface: req.executionSurface || undefined,
  });

  // §REAL, ADDITIVE — the B1-specific fields (endState/conditions/
  // warpPrimitives/axioms/tools/compartmentUuid/fileName) don't fit
  // submitContract()'s existing param shape; recorded onto the real
  // queue row via a real update rather than duplicating submitContract's
  // own insert logic a second time.
  if (result.queueId) {
    try {
      jaaDB.update(TABLE, { uuid: result.queueId }, {
        endState: req.endState, conditions: req.conditions || null,
        warpPrimitives: req.warpPrimitives || null, axioms: req.axioms || null,
        tools, compartmentUuid: req.compartmentUuid || null, fileName: req.fileName || null,
      });
    } catch (e) { console.warn(`[${MODULE_ID}] synthesizeContract: B1 field update failed: ${e.message}`); }
  }

  return { ok: true, ...result, tools };
}

// §HIGHEST LEVERAGE 2026-08-29 — James: "highest leverage... to get the
// system coding." Real, honest finding checked before building anything:
// RAID's contract queue (real dependency graph, real qaqcLayer, real
// retry/fallback/halt) has ONLY ever been run against fake test-string
// executors — never a real, live agent. That's the actual reason "has
// nexus generated any code?" was still 'no' as of this session's own
// earlier honest answer. This is the one real wire that closes it.
//
// dispatchToNcpAgent (copilot/lifeline.js's real, exported _tryGuardian)
// is a proven, real, complete dispatch chain — POST guardian's real
// /api/copilot/prompt (confirmed real: guardian/ask.js's real askSync,
// with real createJob/dispatchJob/isProviderConnected/resolveProvider
// genuinely wired, not stubbed — a STALE comment in lifeline.js claimed
// this endpoint didn't exist; checked directly, fixed the comment
// separately). This IS the real path from a contract to a real, live
// provider tab's real response.
//
// §HONEST LIMIT — this is the default used only when processNext() is
// called with NO explicit executor (every existing real caller that
// passes one, including every test this session wrote, is completely
// unaffected). Requires a live guardian process with at least one real,
// connected provider tab to produce a real result; without one, this
// correctly fails soft (dispatchToNcpAgent returns null on no real
// evidence of connection) and the contract's own real onFail policy
// (retry/fallbackAgent/halt) takes over exactly as designed.
async function _realAgentExecutor(queueRow) {
  const { dispatchToNcpAgent } = require('../../../copilot/lifeline.js');
  // §BUGFIX — found by this executor's own first real test run: reading
  // .forAgent off the raw contract object (queueRow.contract) silently
  // returned 'auto' even when a real forAgent was submitted, because
  // submitContract() resolves forAgent onto the QUEUE ROW itself
  // (contract.forAgent || opts.forAgent), never writing it back onto the
  // raw contract object. queueRow.forAgent is the real, resolved value.
  const result = await dispatchToNcpAgent(queueRow.contract.content, { provider: queueRow.forAgent || 'auto' });
  if (!result || !result.ok) {
    throw new Error(`no real agent response available (forAgent=${queueRow.forAgent || 'auto'}) — guardian unreachable, no connected provider, or an empty response`);
  }
  // §AGENT-MESH-ARTIFACTS 2026-09-02 — James: "hook it into agent mesh."
  // dispatchToNcpAgent (lifeline.js's own _tryGuardian) now carries the
  // real guardian jobId it created (askSync always returns one — this
  // was just never threaded through). Recorded on the queue row here so
  // a download captured later (clear-glass's download-capture ->
  // guardian's /api/intake) can be correlated back to the exact RAID
  // contract that caused it, not just guessed at from timing. A missing
  // jobId (result.jobId falsy — e.g. a provider path that doesn't create
  // a guardian job) is recorded as null, not silently omitted, so a
  // later reader can tell "no correlation possible" from "not checked".
  if (result.jobId) {
    try { jaaDB.update(TABLE, queueRow.uuid, { dispatchedJobId: result.jobId, updatedAt: Date.now() }); } catch (_) {}
  }
  return { text: result.text };
}

// §MCO16 2026-09-13 — real RAID → ClearGlass boundary. CLEAR_GLASS_WIRE_PORT
// matches clear-glass/src/main/index.js's own real WIRE_PORT default (7704)
// exactly — not guessed independently.
const CLEAR_GLASS_WIRE_PORT = parseInt(process.env.CLEAR_GLASS_WIRE_PORT || '7704', 10);

// §MCO16 2026-09-13 — James, explicit gate: "Browser unavailable: retry/
// fail/escalate, never silently fall back." Deliberately NOT the same
// honest-degrade-to-null shape _ideariumRequest()/_erosRequest()-style
// helpers elsewhere in this file use — those are for optional, additive
// side effects (a repo provision, a DOM ledger tag) where "it didn't work"
// is a fine outcome to continue past. A browser-destined contract's WHOLE
// execution lives on this call; "it didn't work" here must become a real
// thrown error, so it reaches execute()'s own catch (lib/compartment-
// engine.js), becomes a real FAIL, and lets THIS contract's own onFail
// policy (retry/fallbackAgent/halt — already built, unchanged) decide what
// happens next. Silently degrading to _realAgentExecutor instead would be
// exactly the "silent fallback" this gate explicitly refused.
function _clearGlassRequest(reqPath, body) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const payload = JSON.stringify(body || {});
    const req = http.request({
      hostname: '127.0.0.1', port: CLEAR_GLASS_WIRE_PORT, path: reqPath, method: 'POST', timeout: 15000,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (_) { /* handled below via parsed===null */ }
        if (res.statusCode >= 400 || !parsed) {
          return reject(new Error(`ClearGlass ${reqPath} returned HTTP ${res.statusCode}${parsed ? '' : ' (unparseable body)'}: ${raw.slice(0, 300)}`));
        }
        if (parsed.ok === false) return reject(new Error(`ClearGlass ${reqPath} refused: ${parsed.error || 'no reason given'}`));
        resolve(parsed);
      });
    });
    req.on('error',   (e) => reject(new Error(`ClearGlass unreachable on :${CLEAR_GLASS_WIRE_PORT}${reqPath}: ${e.code || e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`ClearGlass ${reqPath} timed out on :${CLEAR_GLASS_WIRE_PORT}`)); });
    req.write(payload);
    req.end();
  });
}

/**
 * _clearGlassExecutor(queueRow, compartment) — the real executionSurface:
 * 'browser' destination. Always begins with the same real set-active call
 * (below). What happens next now genuinely branches on the contract's own
 * shape:
 *
 *   - queueRow.contract.domSteps present (real, non-empty array): §MCO16c
 *     2026-09-13, James: "finish the rest of it." Each step dispatches to
 *     ClearGlass's /dom/query or /dom/mutate (main/index.js, backed by
 *     ProviderHost.queryDom()/mutateDom() — real page-side
 *     window.__cgDomMesh calls, not invented here) IN ORDER, one at a
 *     time — a later step may depend on an earlier mutation having
 *     already landed, so these are never parallelized. The first REAL
 *     step-level failure (domStepResultFailed — a genuine
 *     "no live window"/"element not found"/mesh-not-loaded result, not an
 *     HTTP failure, which already throws separately) stops the sequence
 *     immediately and throws with the failing step's index and reason —
 *     it does NOT continue mutating on top of a step that didn't really
 *     happen. domSteps contracts do NOT also dispatch a chat prompt via
 *     /agent-mesh/route — the steps ARE the work; contract.content stays
 *     required (submitContract's own existing invariant) but is not sent
 *     anywhere as a prompt when domSteps drives execution.
 *   - No real domSteps: unchanged from the first MCO16 pass — a single
 *     /agent-mesh/route prompt dispatch.
 *
 * Returns {text} — same shape _realAgentExecutor returns either way.
 */
async function _clearGlassExecutor(queueRow, compartment) {
  const setActive = buildSetActiveBody(compartment, queueRow);
  if (!setActive.ok) throw new Error(`[${MODULE_ID}] _clearGlassExecutor: ${setActive.reason}`);
  await _clearGlassRequest('/compartment/set-active', setActive.body);

  const domSteps = Array.isArray(queueRow.contract && queueRow.contract.domSteps) ? queueRow.contract.domSteps : null;
  if (domSteps && domSteps.length) {
    const results = [];
    for (let i = 0; i < domSteps.length; i++) {
      const step = domSteps[i];
      const built = buildDomStepRequest(step, queueRow.forAgent);
      if (!built.ok) {
        throw new Error(`[${MODULE_ID}] _clearGlassExecutor: domStep[${i}] refused: ${built.reason}`);
      }
      // §HONEST — an HTTP-level failure here (ClearGlass unreachable, a
      // non-2xx/refused response) already throws inside _clearGlassRequest
      // itself (same "never silently fall back" contract as set-active/
      // route above) — nothing extra needed here for that case.
      const result = await _clearGlassRequest(built.path, built.body);
      if (domStepResultFailed(result)) {
        throw new Error(`[${MODULE_ID}] _clearGlassExecutor: domStep[${i}] (${step.action} on ${built.body.providerId}) failed: ${result.reason || result.error || 'no reason given'}`);
      }
      results.push({ step: i, action: step.action, result });
    }
    return { text: JSON.stringify({ domSteps: results }) };
  }

  const route = buildRouteBody(queueRow);
  if (!route.ok) throw new Error(`[${MODULE_ID}] _clearGlassExecutor: ${route.reason}`);
  const routed = await _clearGlassRequest('/agent-mesh/route', route.body);

  const text = extractRouteText(routed);
  if (!text) {
    throw new Error(`ClearGlass /agent-mesh/route returned no real text (compartment ${compartment.id}, queue ${queueRow.uuid})`);
  }
  return { text };
}

/**
 * reportExternalOutcome(queueId, {status, verdict}) — for a real system
 * (idearium, this session's own wiring) that dispatches its own
 * contracts through ITS OWN proven mechanism (not RAID's processNext) —
 * a real way to report the already-known, real outcome back, so RAID's
 * queue stays an accurate observability layer instead of every idearium-
 * sourced contract sitting at 'queued' forever with nothing ever calling
 * processNext() on it. status must be STATUS.PASS or STATUS.FAIL — not
 * a generic passthrough, so a caller can't write an arbitrary string
 * into a real, shared table.
 */
function reportExternalOutcome(queueId, { status, verdict } = {}) {
  if (status !== STATUS.PASS && status !== STATUS.FAIL) {
    throw new Error(`[${MODULE_ID}] reportExternalOutcome requires status to be '${STATUS.PASS}' or '${STATUS.FAIL}', got ${JSON.stringify(status)}`);
  }
  try {
    jaaDB.update(TABLE, queueId, { status, verdict: verdict || null, updatedAt: Date.now() });
    _raidLedger.record(status === STATUS.PASS ? 'raid.contract.pass' : 'raid.contract.fail',
      { queueId, verdict: verdict || null }, { source: 'raid', causedBy: queueId });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * reconcileOnBoot() — §MCO6/IC9 2026-09-13 — a real boot-time
 * reconciliation pass. Queries JAA's already-durable raid_contract_queue
 * for every real row that hasn't genuinely reached QC_PENDING, cross-
 * references the real physical output artifact, and decides resume /
 * retry / escalate — never trusting anything that only ever lived in
 * the prior process's memory (§1.1).
 *
 * §CORRECTED WHILE BUILDING — first version of this function only
 * scanned status===RUNNING. Traced the real write order in processNext()
 * before shipping that: the status write (PASS/FAIL) happens BEFORE
 * _advanceToOutputFolder's real artifact write, not after — so a crash
 * in that real window leaves a row with a TERMINAL status but a stage
 * still stuck at PROCESSING/OUTPUT_FOLDER and no real output artifact.
 * status===RUNNING alone would never find that row at all. The real
 * orphan condition is stage !== QC_PENDING, regardless of status —
 * status only changes which disposition is honest for a given row.
 *
 * Resume: a real output artifact already exists for this uuid — the
 * work genuinely finished; only the stage bookkeeping never reached
 * QC_PENDING. Reads the real artifact's own verdict rather than
 * trusting whatever status the row happened to have when the prior
 * process died, and finishes the real transition.
 *
 * Retry: status===RUNNING (still genuinely mid-flight, never resolved),
 * no real output artifact, and onFail allows another attempt — re-queued
 * exactly like processNext()'s own existing retry branch, same real
 * retryCount bookkeeping, no second boot-time-only path.
 *
 * Escalate: everything else that isn't real progress — RUNNING with no
 * retry left, OR a row that CLAIMS PASS/FAIL but has no real output
 * artifact to back that claim (an inconsistency that must not be
 * trusted silently, §1.1, regardless of which status it claims). Routed
 * to self-heal via the SAME HEAL_REQUESTED emission processNext()'s own
 * exhausted-failure path already uses (§10.3 — one real escalation
 * ladder, not a second one for boot-time orphans).
 *
 * @returns {{resumed:Array, retried:Array, escalated:Array, checked:number}}
 */
function reconcileOnBoot() {
  const fs = require('fs');
  const allRows = listQueue();
  const orphaned = allRows.filter((r) => r.stage !== STAGE.QC_PENDING && r.status !== STATUS.QUEUED && r.status !== STATUS.BLOCKED);

  const resumed = [], retried = [], escalated = [];

  for (const row of orphaned) {
    const hasRealOutput = row.outputArtifactPath && fs.existsSync(row.outputArtifactPath);

    if (hasRealOutput) {
      let outcome = null;
      try {
        const { importFromFile } = require('../../../lib/node-export.js');
        outcome = importFromFile(row.outputArtifactPath).payload;
      } catch (_) { /* real read failure — falls through to the honest escalate below */ }
      if (outcome) {
        const finalStatus = outcome.status === STATUS.PASS ? STATUS.PASS : STATUS.FAIL;
        jaaDB.update(TABLE, row.uuid, { status: finalStatus, stage: STAGE.QC_PENDING, verdict: outcome.verdict ?? null, updatedAt: Date.now() });
        _raidLedger.record('raid.contract.reconciled.resumed', { queueId: row.uuid, outputArtifactPath: row.outputArtifactPath, status: finalStatus }, { source: 'raid', causedBy: row.uuid });
        resumed.push({ queueId: row.uuid, status: finalStatus });
        continue;
      }
      // a real file exists at the recorded path but couldn't be read as
      // a real envelope — do NOT trust it; falls through to escalate.
    }

    if (row.status === STATUS.RUNNING && row.onFail && row.onFail.action === 'retry' && (row.retryCount || 0) < (row.onFail.maxRetries || 1)) {
      const nextAttempt = (row.retryCount || 0) + 1;
      jaaDB.update(TABLE, row.uuid, { status: STATUS.QUEUED, stage: STAGE.QUEUED, retryCount: nextAttempt, updatedAt: Date.now() });
      _raidLedger.record('raid.contract.reconciled.retried', { queueId: row.uuid, attempt: nextAttempt }, { source: 'raid', causedBy: row.uuid });
      retried.push({ queueId: row.uuid, attempt: nextAttempt });
      continue;
    }

    jaaDB.update(TABLE, row.uuid, { status: STATUS.FAIL, updatedAt: Date.now(), blockReason: `found at stage "${row.stage}" (status "${row.status}") at boot with no real output artifact to back it — orphaned by a prior process death` });
    _raidLedger.record('raid.contract.reconciled.escalated', { queueId: row.uuid, stage: row.stage, priorStatus: row.status }, { source: 'raid', causedBy: row.uuid });
    if (row.source !== 'self-heal') {
      try {
        require('../../../nexus/nexus-bus.js').emit('HEAL_REQUESTED', {
          gapType: 'raid_contract_orphaned_at_boot',
          gapUuid: row.uuid,
          body: `RAID contract "${row.title || row.uuid}" (source: ${row.source}) was found at stage "${row.stage}" at boot with no real output — a prior process died mid-job.`,
        }, { source: 'raid-contract-intake-reconcile' });
      } catch (e) {
        console.warn(`[${MODULE_ID}] could not emit HEAL_REQUESTED for orphaned contract ${row.uuid}: ${e.message}`);
      }
    }
    escalated.push({ queueId: row.uuid });
  }

  return { resumed, retried, escalated, checked: orphaned.length };
}

module.exports = { submitContract, submitIdeariumChunk, submitBuildPhaseContract, synthesizeContract, BUILD_CONTRACT_SCHEMA, reportExternalOutcome, acknowledge, listQueue, processNext, reconcileOnBoot, MODULE_ID, VERSION, STATUS, STAGE, EXECUTION_SURFACE, queryContractRepoFile, writeContractRepoFile, _clearGlassExecutor };
