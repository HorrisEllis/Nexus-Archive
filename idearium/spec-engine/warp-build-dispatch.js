'use strict';
/**
 * idearium/spec-engine/warp-build-dispatch.js — WARP as idearium's build logic
 * UUID: nexus-idearium-warp-dispatch-v1-0000-2026-0706-jamesbrooks-001
 *
 * §LAW 2026-07-06 — "js first, warp as build logic." Checked before writing
 * a line: idearium/spec-engine/chunk-dispatch.js never touched WARP at all
 * — straight to Guardian's agentSuite.buildChunkWithAgent(). This adapter
 * is what makes that not true anymore.
 *
 * §THE REAL GAP THIS CLOSES — lib/seam/adapters/warp-cascade.js's own
 * header says plainly: "not required by lib/seam/gates.js, stream.js,
 * axioms.js, or kg-seam-bridge.js — none of those import this file or
 * WARP." createWarpDispatch() existed, tested, real, and had zero callers
 * anywhere in the codebase. This is its first real one.
 *
 * §WHAT THIS ACTUALLY BUYS — createWarpDispatch()'s dispatch() runs
 * unifiedDispatch(): checks a crystallizer cache first, then a
 * population seed, then falls through to a real cascade across
 * providers with axiom-gate validation (hard constraints checked before
 * Detector's heuristic pass ever runs). Correction caught while testing,
 * not assumed from the header comment alone: the exact-cache isn't
 * populated after one success — checked warp/dispatch/population.js
 * directly, DEFAULT_PROMOTE_THRESHOLD is 3. An identical chunk has to
 * be independently re-generated and retained 3 times, clearing a
 * fitness floor each time, before it crystallizes into an instant
 * cache hit. That's the real evolutionary-retention model (AlphaEvolve
 * pattern), not a simple memoization — worth stating precisely since
 * "identical chunk built before returns instantly" would be wrong.
 *
 * §TWO REAL INTERFACE MISMATCHES, RESOLVED HERE, NOT PAPERED OVER —
 * (1) createWarpDispatch expects a seam-record shape (seam_uuid, seam_id,
 *     contract.exports) — idearium chunks have none of that. Built the
 *     minimal real mapping below; contract.exports stays empty rather
 *     than fabricating expected shape keys idearium chunks were never
 *     going to have (free-text code/prose, not structured exports).
 * (2) WARP's cascade expects generate() to return a resolved output or
 *     throw — it has no concept of Guardian's "queued, poll later"
 *     chatgpt/claude path. generate() below polls to real resolution
 *     internally (reusing chunk-dispatch.js's own poller, not a second
 *     copy of it) before ever returning to the cascade.
 */

import { createWarpDispatch } from '../../lib/seam/adapters/warp-cascade.js';
import { FlatFileCrystallizer } from '../../warp/plugins/crystallizer-flatfile.js';
import { PopulationStore } from '../../warp/dispatch/population.js';
import { pollGuardianJob } from './chunk-dispatch.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import fs from 'fs';
import crypto from 'crypto';

let _crystallizer = null;
let _population = null;
function _getCache() {
  // Same real classes ollama/server.js already runs in production —
  // not a reimplementation, one cache file scoped to idearium's own builds.
  if (!_crystallizer) {
    const dataDir = path.join(__dirname, '..', 'data');
    // §BUG CAUGHT BEFORE IT SHIPPED — FlatFileCrystallizer.set() calls
    // fs.writeFileSync(this._path, ...) directly, no parent-directory
    // creation. idearium/data/ didn't exist. The first successful chunk
    // build would have thrown ENOENT on its first cache write.
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    _crystallizer = new FlatFileCrystallizer({ path: path.join(dataDir, 'warp-crystals.json') });
  }
  if (!_population) _population = new PopulationStore({ maxPerClass: 8 });
  return { crystallizer: _crystallizer, population: _population };
}

/**
 * createWarpChunkDispatch — builds a dispatchFn compatible with
 * dispatchChunkWithVerification's contract: (prompt, opts) =>
 * Promise<{ok, text, error, queued, jobId, agent}>. `as` is Idearium's
 * real agentSuite (same object buildChunkWithAgent already lived on).
 */
export function createWarpChunkDispatch(as, { raid = null, axioms = [], pollTimeoutMs, pollIntervalMs } = {}) {
  const { crystallizer, population } = _getCache();

  const warpDispatch = createWarpDispatch({
    raid,
    crystallizer,
    population,
    // §OPT-IN 2026-07-09 — WARP's exact cache is written only on promotion
    // (3 independent regenerations + fitness floor), which is correct for
    // GENERALIZING a gateClass across similar inputs but wrong for identical
    // ones. seam_uuid above is now a sha256 of the exact prompt, so a digest
    // hit means the input is byte-identical and already hard-axiom-validated.
    // Caching it on first success is deterministic reuse, and it is what makes
    // each build cheaper than the last instead of costing the same forever.
    exactCacheOnFirstSuccess: true,
    // generate() is the real network call WARP's cascade invokes per
    // provider attempt — this is where Guardian's queued/async chatgpt
    // and claude path gets resolved to a real value before returning,
    // since WARP's cascade has no concept of "queued, check back later."
    generate: async (provider, record, lastFailure) => {
      const dispatchOpts = { preferAgent: provider, retryContext: lastFailure || null };
      const result = await as.buildChunkWithAgent(record.prompt, dispatchOpts);
      if (!result?.ok) throw new Error(result?.error || `${provider} dispatch failed`);
      if (result.queued) {
        const pollOpts = {};
        if (pollTimeoutMs != null) pollOpts.timeoutMs = pollTimeoutMs;
        if (pollIntervalMs != null) pollOpts.intervalMs = pollIntervalMs;
        const polled = await pollGuardianJob(result.jobId, pollOpts);
        if (!polled.ok) throw new Error(polled.error || `${provider} job ${result.jobId} did not resolve`);
        return polled.text;
      }
      if (!result.text) throw new Error(`${provider} returned no text`);
      return result.text;
    },
  });

  return async function dispatch(prompt, opts = {}) {
    // §COMPOUNDING BUG FIXED 2026-07-09 — two faults, and together they made
    // the exact cache simultaneously useless and unsafe.
    //
    // (1) seam_uuid was `${specUuid}:${chunkIdx}`, and the digest is
    //     hash(gateSignature=seam_uuid + axioms + event content). specUuid is
    //     unique per spec, so an IDENTICAL chunk built in a second spec
    //     produced a different digest and could never hit the cache. WARP
    //     could not compound across specs no matter how many builds ran. The
    //     fallback was worse: `idearium-chunk-${Date.now()}` gave every single
    //     call a unique key, so nothing could ever hit, even within one spec.
    //
    // (2) warp-cascade builds `event: { data: { seam: record.seam_id } }`, and
    //     seam_id here is the section TITLE. The prompt was nowhere in the
    //     digest. Two different chunks both titled "Purpose" would hash the
    //     same and could return each other's output — a wrong cache hit, which
    //     is worse than a miss.
    //
    // Both are fixed by the same move: key on the CONTENT. seam_uuid becomes a
    // sha256 of the exact prompt, so identical prompts (across specs, across
    // runs, across machines) share one key, and different prompts never do.
    // That is what makes the cache content-addressed, and content-addressing is
    // what makes it compound.
    const promptDigest = crypto.createHash('sha256').update(String(prompt)).digest('hex').slice(0, 32);

    const record = {
      prompt,
      seam_uuid: `idearium-chunk-sha256:${promptDigest}`,
      seam_id: opts.chunkTitle || opts.sectionTitle || 'idearium-chunk',
      description: opts.chunkTitle || prompt.slice(0, 80),
      contract: { exports: [] }, // honest — idearium chunks are free-text, no fixed shape to check
    };
    try {
      const result = await warpDispatch(record, opts.axioms || axioms);
      if (!result.ok) {
        return { ok: false, error: `axiom/cascade failure after ${result.attempts} attempt(s)` };
      }
      // §OBSERVABILITY 2026-07-09 — surface WARP's own provenance. Without
      // this the caller cannot distinguish a zero-token exact-cache hit
      // (source:'crystal', cost:0) from a full LLM generation, and the
      // compounding this file enables would be invisible in the ledger.
      // An optimisation nobody can measure is an optimisation nobody can prove.
      return {
        ok: true,
        text: result.output,
        agent: 'warp',
        source: result.source,      // 'crystal' | 'generated' | 'pre-generation-reuse'
        cost: result.cost ?? null,  // 0 on an exact-cache hit
        digest: result.digest,
        cacheHit: result.source === 'crystal',
      };
    } catch (e) {
      // Real dispatch/network-layer failure, not a content-quality one —
      // let dispatchChunkWithVerification's own watchdogRetry() classify
      // it, same distinction the direct-Guardian path already draws.
      return { ok: false, error: e.message };
    }
  };
}
