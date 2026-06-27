'use strict';
// ── lib/t2-compartment-bridge.js ────────────────────────────────────────────
// Phase 73 — T2 Compartment Bridge
// UUID: nexus-t2-compartment-bridge-v1-0000-2026-0627-jamesbrooks-001
// Version: 1.0.0
//
// THE GAP THIS CLOSES (confirmed by reading both sides before writing this):
//   emerge/compiler/t2-gate.js dispatches every T2 chunk straight to
//   guardian's /command route. It never becomes a `compartment`. Case
//   Library (Phase 46) only ever indexes a `compartment` object, and only
//   on a clean PASS via compartment-engine's _pass() extension point —
//   confirmed wired (lib/compartment-engine.js line ~134, caseLibraryIndex
//   registered for real, not aspirational). Because T2 chunks never become
//   compartments, every chunk a build produces is gone the moment that one
//   build finishes — even though the exact machinery to keep it, hash it,
//   and hand it back to a *different* project already exists and already
//   runs. This module is the wire, not a new mechanism.
//
// WHAT IT DOES:
//   1. classify()  — Phase 45 intent-classifier turns a T2 node's declared
//      `intent` string into a real {domain, verb, ...} INTENT object.
//      Reused, not reinvented — same classifier every other entry point
//      in NEXUS uses (§5.6 fractal law: one structural pattern, every layer).
//   2. query()     — Phase 46 case-library checked BEFORE any Ollama call.
//        tier 'full'     → real prior result exists, reused verbatim, zero
//                          dispatch cost. This is the torrent "already have
//                          this piece" case.
//        tier 'skeleton' → past pattern exists but no surviving trace —
//                          seeded into working_memory, still dispatches.
//        tier 'cold'     → never seen. Builds fresh, same as today.
//        tier 'blocked'  → negative crystal hit. Does not retry a chunk
//                          that's already proven not to work (§1.2 — not
//                          a silent skip, the caller gets a real reason).
//   3. spawn/execute/resolve — the real compartment lifecycle (Phase 25).
//      PASS auto-indexes into case-library via the existing extension
//      point. Nothing new to wire there — it already fires.
//
// §1.1  Nothing exists until proven — a 'full' tier hit only reuses content
//       that genuinely passed before; never fabricates a result.
// §1.2  Nothing silently fails — every tier decision and every executor
//       error is returned to the caller, not swallowed.
// §5.7  Low coupling — this module is the only thing that imports both
//       compartment-engine and case-library on T2's behalf; t2-gate.js
//       itself stays unaware of either.
// §10.3 — this is deliberately NOT a sixth competing "is this the same
//       thing" mechanism (see the Comparator Engine spec, NEXUS-SPEC.md).
//       It calls the one that already exists.

const intentClassifier   = require('./intent-classifier');
const caseLibrary         = require('./case-library');
const compartmentEngine   = require('./compartment-engine');

const MODULE_ID = 't2-compartment-bridge';
const VERSION   = '1.0.0';

/**
 * Build (or reuse) one T2 chunk through the real compartment lifecycle.
 *
 * @param {object} node            - the T2 execution-plan node (has .name/.id, .intent)
 * @param {object} parsedSpec      - the full parsed spec (for intent text + module lookup)
 * @param {function} dispatchFn    - async (node, parsedSpec) => { ok, response, error }
 *                                    the REAL work — same SEAM dispatch + wait
 *                                    t2-gate.js already does today. This bridge
 *                                    does not reimplement dispatch; it decides
 *                                    whether dispatch needs to happen at all.
 * @param {object} opts            - { outputDir, boundaryPaths }
 * @returns {object} { ok, tier, reused, result, compartment, error }
 */
async function buildChunk(node, parsedSpec, dispatchFn, opts = {}) {
  const modName = node.name || node.id;
  const moduleDecl = (parsedSpec?.modules || []).find(m => m.name === modName);
  const intentText = moduleDecl?.intent
    ? `${moduleDecl.intent} (implement ${modName} per spec)`
    : `implement ${modName} per spec`;

  // ── 1. Classify — Phase 45, reused not reinvented ───────────────────────
  const { intent, lowConfidence } = intentClassifier.classify({ text: intentText, source: 'GUARDIAN' });

  // ── 2. Query case-library BEFORE any dispatch ───────────────────────────
  const caseResult = caseLibrary.query(intent);

  if (caseResult.blocked) {
    return {
      ok: false, tier: 'blocked', reused: false, result: null, compartment: null,
      error: `chunk "${modName}" matches a known-failing pattern (${caseResult.reason}) — not retried`,
    };
  }

  // ── 3. Spawn the real compartment (Phase 25) ────────────────────────────
  const compartment = await compartmentEngine.spawn({
    intent,
    budget:   { tokens: null, timeMs: null, irreversibleOpsAllowed: false },
    boundary: {
      description: `T2 chunk implementation for ${modName} — write access limited to output directory`,
      paths: opts.outputDir ? [opts.outputDir] : [],
      systems: ['emerge', 'ollama'],
    },
    workingMemorySeed: caseResult.workingMemorySeed,
  });

  // ── 4. Executor — reuse a 'full' tier hit verbatim; otherwise dispatch ──
  const executor = async (workingMemory) => {
    if (workingMemory?.tier === 'full' && workingMemory.result) {
      // A genuine prior PASS exists for this exact domain+verb signature.
      // §1.1 — only reused because it already passed once; not assumed safe.
      return { ...workingMemory.result, _reusedFrom: workingMemory.source_compartment_uuid };
    }
    // tier 'skeleton', 'cold', or no seed — real dispatch, same as t2-gate
    // has always done. dispatchFn is t2-gate's own SEAM-dispatch-and-wait
    // logic, passed in so this bridge never reimplements it (§5.6/§5.7).
    const dispatchResult = await dispatchFn(node, parsedSpec);
    if (!dispatchResult.ok) throw new Error(dispatchResult.error || 'dispatch failed');
    // §schema (adversary-suite's real QA/QC check, confirmed by running it,
    // not assumed): compartment.result must be an object, null, or
    // undefined — never a bare string. Wrapping here, once, so every
    // caller of this bridge gets a result shape that survives QA/QC.
    return { response: dispatchResult.response };
  };

  let executeError = null;
  try {
    await compartmentEngine.execute(compartment, executor);
  } catch (e) {
    executeError = e.message;
  }

  const reused = caseResult.tier === 'full' && compartment.status === compartmentEngine.STATUS.PASS;

  return {
    ok:          compartment.status === compartmentEngine.STATUS.PASS,
    tier:        caseResult.tier,
    reused,
    result:      compartment.result,
    compartment,
    error:       executeError || compartment._executionError || (compartment.status !== compartmentEngine.STATUS.PASS ? `compartment ${compartment.status}` : null),
    lowConfidence,
  };
}

module.exports = { buildChunk, MODULE_ID, VERSION };
