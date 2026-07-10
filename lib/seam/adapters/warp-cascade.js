'use strict';
/**
 * lib/seam/adapters/warp-cascade.js — WARP as one possible CascadeGate backend
 * UUID: nexus-seam-adapter-warp-v1-0000-2026-0705-jamesbrooks-001
 * Version: 1.1.0  // +exactCacheOnFirstSuccess pass-through (warp-devkit-addendum-v1.4.1.spec)
 *
 * Not required by lib/seam/gates.js, lib/seam/stream.js, lib/seam/axioms.js,
 * or lib/seam/kg-seam-bridge.js — none of those import this file or WARP.
 * This is what a caller pulls in if it *wants* WARP's cache/population/
 * axiom-gate machinery specifically. A caller that wants a bare ollama
 * call with no caching writes its own five-line dispatch() function
 * instead and never touches this file.
 *
 * Usage:
 *   const { createWarpDispatch } = require('lib/seam/adapters/warp-cascade');
 *   const dispatch = createWarpDispatch({ generate, crystallizer, population, raid });
 *   stream.register(new CascadeGate({ dispatch }));
 */
const { unifiedDispatch }  = require('../../../warp/dispatch/index');
const { runCascade }       = require('../../../warp/dispatch/cascade');
const { Axiom }             = require('../../../warp/core/Axiom');

function providersFor(seamRecord, raid) {
  if (!raid) return ['ollama', 'chatgpt', 'claude']; // spec default: LAW_I then LAW_III
  const { agent: first } = raid._decide(
    { intent: 'build', prompt: seamRecord.description || seamRecord.seam_id },
    raid._health,
  );
  return [first, ...['ollama', 'chatgpt', 'claude'].filter(p => p !== first)];
}

/**
 * createWarpDispatch — returns a dispatch(record, plainAxioms) function
 * matching CascadeGate's expected interface. `generate(provider, record,
 * lastFailure)` is the caller's actual network call — this adapter never
 * touches a network itself, same separation warp/dispatch/index.js keeps.
 */
// §COMPOUNDING 2026-07-09 — exactCacheOnFirstSuccess is forwarded to
// unifiedDispatch. Without this pass-through the option exists in WARP but
// no caller can reach it: an opt-in nobody can opt into.
function createWarpDispatch({ generate, crystallizer, population, raid = null, scorer = null, log = null, maxAttempts = 3, exactCacheOnFirstSuccess = false }) {
  if (typeof generate !== 'function') {
    throw new Error('[seam/adapters/warp-cascade] generate(provider, record, lastFailure) is required');
  }
  return async function dispatch(record, plainAxioms) {
    // wrap plain {id, severity, check} into warp's Axiom class — the only
    // place that class is required, so a non-WARP caller never needs it.
    const axioms = plainAxioms.map(a => new Axiom(a.id, { severity: a.severity, check: a.check }));
    const providers = providersFor(record, raid);

    const cascade = ({ event }) => runCascade({
      providers, maxAttempts,
      generate: (provider, lastFailure) => generate(provider, record, lastFailure),
      validate: (output) => {
        const failed = axioms.filter(a => a.severity === 'hard' && !a.check({ data: { output } }));
        return { ok: failed.length === 0, failures: failed.map(a => a.id) };
      },
    }).then(result => ({ ok: result.ok, output: result.output, attempts: result.attempts }));

    return unifiedDispatch({
      gateSignature: record.seam_uuid,
      gateClass:     record.seam_id,
      event:         { data: { seam: record.seam_id } },
      axioms, crystallizer, population, cascade,
      scorer: scorer || (({ axiomFailures }) => 1 - axiomFailures.length * 0.1),
      expectedShapeKeys: record.contract.exports,
      log,
      exactCacheOnFirstSuccess,
    });
  };
}

module.exports = { createWarpDispatch, providersFor };
