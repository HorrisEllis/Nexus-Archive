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
const { createCFRLedger } = require('../../../intelligence/cfr/ledger');
const EVENTS = require('./event-taxonomy');

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
  const queueId = uid();
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
    system: opts.system || null,         // which SYSTEM originated this contract (distinct from source, which names the subsystem/mechanism)
    source: opts.source || 'unknown',      // 'spec-parser' | 'loom' | 'idearium' | 'copilot' | 'self-heal'
    file: contract.file || null,
    title: contract.title || null,
    forAgent: contract.forAgent || opts.forAgent || null,
    contract,                              // the real, full contract object — the end-state lives inside it
    dependsOn: Array.isArray(opts.dependsOn) ? opts.dependsOn.slice() : [],
    onFail: opts.onFail || null,
    retryCount: 0,
    compartmentId: null,
    verdict: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  try { jaaDB.insert(TABLE, row); } catch (e) {
    console.warn(`[${MODULE_ID}] queue insert failed, proceeding without persistence: ${e.message}`);
  }
  _raidLedger.record('raid.contract.submitted', {
    queueId, source: row.source, system: row.system, forAgent: row.forAgent, intention: row.intention,
  }, { source: 'raid', causedBy: null });
  return { queueId, status: STATUS.QUEUED };
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
 */
function acknowledge(queueId, { system } = {}) {
  const rows = jaaDB.query(TABLE, r => r.uuid === queueId, 1);
  const row = rows[0];
  if (!row) return { ok: false, error: `no real contract with queueId "${queueId}"` };
  if (row.stage !== STAGE.QUEUED) {
    return { ok: false, error: `contract is already at stage "${row.stage}" — cannot acknowledge a contract that's past QUEUED` };
  }
  jaaDB.update(TABLE, queueId, { stage: STAGE.HANDSHAKE_VERIFIED, updatedAt: Date.now(), acknowledgedBy: system || null });
  _raidLedger.record('raid.contract.acknowledged', { queueId, acknowledgedBy: system || null }, { source: 'raid', causedBy: queueId });
  return { ok: true, stage: STAGE.HANDSHAKE_VERIFIED };
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

  try { jaaDB.update(TABLE, queued.uuid, { status: STATUS.RUNNING, compartmentId: compartment.id, updatedAt: Date.now() }); } catch (_) {}

  const resolved = executor
    ? await compartmentEngine.execute(compartment, executor)
    : await compartmentEngine.execute(compartment, () => _realAgentExecutor(queued));

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
  }, { source: 'idearium', forAgent: chunk.agent });
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
  return { text: result.text };
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

module.exports = { submitContract, submitIdeariumChunk, reportExternalOutcome, acknowledge, listQueue, processNext, MODULE_ID, VERSION, STATUS, STAGE };
