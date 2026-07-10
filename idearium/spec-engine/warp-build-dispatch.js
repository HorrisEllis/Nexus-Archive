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
    const record = {
      prompt,
      seam_uuid: opts.specUuid ? `${opts.specUuid}:${opts.chunkIdx ?? 'chunk'}` : `idearium-chunk-${Date.now()}`,
      seam_id: opts.chunkTitle || opts.sectionTitle || 'idearium-chunk',
      description: opts.chunkTitle || prompt.slice(0, 80),
      contract: { exports: [] }, // honest — idearium chunks are free-text, no fixed shape to check
    };
    try {
      const result = await warpDispatch(record, opts.axioms || axioms);
      if (!result.ok) {
        return { ok: false, error: `axiom/cascade failure after ${result.attempts} attempt(s)` };
      }
      return { ok: true, text: result.output, agent: 'warp' };
    } catch (e) {
      // Real dispatch/network-layer failure, not a content-quality one —
      // let dispatchChunkWithVerification's own watchdogRetry() classify
      // it, same distinction the direct-Guardian path already draws.
      return { ok: false, error: e.message };
    }
  };
}
