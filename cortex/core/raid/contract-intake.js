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

const MODULE_ID = 'cortex/core/raid/contract-intake';
const VERSION = '1.0.0';
const TABLE = 'raid_contract_queue';

const STATUS = Object.freeze({
  QUEUED: 'queued', RUNNING: 'running', PASS: 'pass', FAIL: 'fail',
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
 */
function submitContract(contract, opts = {}) {
  if (!contract || typeof contract.content !== 'string') {
    throw new Error(`[${MODULE_ID}] submitContract requires a real contract with .content`);
  }
  const queueId = uid();
  const row = {
    uuid: queueId,
    status: STATUS.QUEUED,
    source: opts.source || 'unknown',      // 'spec-parser' | 'loom' | 'idearium' | 'copilot' | 'self-heal'
    file: contract.file || null,
    title: contract.title || null,
    forAgent: contract.forAgent || opts.forAgent || null,
    contract,                              // the real, full contract object — the end-state lives inside it
    compartmentId: null,
    verdict: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  try { jaaDB.insert(TABLE, row); } catch (e) {
    console.warn(`[${MODULE_ID}] queue insert failed, proceeding without persistence: ${e.message}`);
  }
  return { queueId, status: STATUS.QUEUED };
}

/** listQueue(filter) — real, current queue state. */
function listQueue(filter = {}) {
  try {
    return jaaDB.query(TABLE, r => !filter.status || r.status === filter.status);
  } catch (_) { return []; }
}

/**
 * processNext(executor) — dequeues the oldest QUEUED row, spawns a real
 * compartment per contract (compartmentEngine.spawn), runs it through
 * the real execute()/resolve() lifecycle with the contract's own
 * seam-verdict wired as the end-state check (registered above), and
 * persists the real outcome. Returns null if the queue is empty —
 * a real, honest "nothing to do," not an error.
 *
 * executor(workingMemory, constraintFrame) — the real dispatch call
 * (e.g. lib/agent-router.js's routeAgent() result, actually sent to the
 * chosen provider) a caller supplies. Not built here — this module owns
 * the queue and the compartment lifecycle, not agent dispatch itself,
 * same separation of concerns agent-router/lifeline already keep.
 */
async function processNext(executor) {
  const queued = listQueue({ status: STATUS.QUEUED })
    .sort((a, b) => a.createdAt - b.createdAt)[0];
  if (!queued) return null;

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
    : await compartmentEngine.resolve(compartment, null);

  const finalStatus = resolved.status === 'PASS' ? STATUS.PASS : STATUS.FAIL;
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

module.exports = { submitContract, submitIdeariumChunk, listQueue, processNext, MODULE_ID, VERSION, STATUS };
