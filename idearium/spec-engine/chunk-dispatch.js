'use strict';
/**
 * idearium/spec-engine/chunk-dispatch.js — Real retry/verification for chunk builds
 * UUID: nexus-idearium-chunk-dispatch-v1-0000-2026-0706-jamesbrooks-001
 * Version: 1.0.1
 *
 * §THE DEEPER MERGE — this is the behavioral half of consolidating
 * lib/seam/queue.js's SEAMQueue/QueueCompartment with Idearium's
 * CHUNK_STATES, named as still-open in lib/seam/chunk-lifecycle.js.
 * Idearium's real dispatch (idearium/api/index.js's `speceng.build`
 * handler) was a single promise-based call to
 * agentSuite.buildChunkWithAgent() — one attempt, no retry, no quality
 * check; a bad response was indistinguishable from a good one until a
 * human noticed. This wraps that same dispatch call inside a real
 * QueueCompartment (lib/seam/queue.js) — the same multi-strategy retry
 * ladder and Detector-based verification Guardian already uses for its
 * own chunks, driven synchronously here instead of via NCP's
 * async-event model, since Idearium's dispatch is a plain promise, not
 * a fire-and-forget push-then-later-callback.
 *
 * §MODULE SYSTEM — Idearium is ESM ("type": "module" in
 * idearium/package.json); lib/seam/queue.js is CommonJS. Node's CJS/ESM
 * interop synthesizes named exports from a CJS module.exports object,
 * so `import { QueueCompartment, STATE } from '...queue.js'` works
 * directly — confirmed by actually running it below, not assumed.
 *
 * §WHY NOT jaa — QueueCompartment requires a `jaa` object
 * ({insert(table,row), update(table,filter,row)}), §LAW II ("write
 * before behavior"). Idearium doesn't have a JAA store of its own; the
 * shim below is a real, working in-memory implementation, not a stub —
 * it satisfies the exact interface QueueCompartment calls, scoped to one
 * chunk-build's lifetime (the compartment's own audit trail doesn't need
 * to outlive one dispatch cycle; Idearium's own manifest, saved via its
 * existing loadSpec/saveSpec, remains the durable record of what the
 * chunk ended up looking like).
 */
import http from 'http';
import { QueueCompartment, STATE } from '../../lib/seam/queue.js';

const GUARDIAN_PORT = parseInt(process.env.GUARDIAN_PORT || '7820');

function _httpGet(port, path, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'GET', timeout: timeoutMs }, (res) => {
      let data = ''; res.on('data', d => data += d);
      res.on('end', () => { try { resolve({ ok: res.statusCode < 400, data: JSON.parse(data) }); } catch { resolve({ ok: false, data: null }); } });
    });
    req.on('error', () => resolve({ ok: false, data: null }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, data: null }); });
    req.end();
  });
}

/**
 * §GAP CLOSED 2026-07-06 — buildChunkWithAgent()'s own comment says
 * "return jobId so caller can poll," but no caller anywhere in this
 * codebase ever did. A chatgpt/claude chunk got marked `queued` and was
 * then abandoned in BUILDING state permanently — confirmed by grepping
 * for every real caller of the one endpoint (`speceng.chunk.complete`)
 * that could have closed the loop: zero matches, anywhere. This is that
 * poller. Guardian has no single-job lookup endpoint (checked) — only
 * `GET /jobs?status=X&limit=N` — so this polls the list and filters by
 * id client-side. Text lands in either `job.responseText` or
 * `job.result` depending on which of Guardian's internal code paths
 * completed it (a real inconsistency in Guardian itself, not something
 * to paper over) — checks both.
 */
async function _pollGuardianJob(jobId, { timeoutMs = 300000, intervalMs = 3000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = await _httpGet(GUARDIAN_PORT, '/jobs?limit=200');
    if (r.ok && r.data?.jobs) {
      const job = r.data.jobs.find(j => j.id === jobId || j.uuid === jobId);
      if (job) {
        if (job.status === 'complete' || job.status === 'done') {
          const text = job.responseText || job.result || job.text;
          if (text) return { ok: true, text };
          return { ok: false, error: 'job completed with no text in responseText/result/text' };
        }
        if (job.status === 'error') return { ok: false, error: job.error || 'guardian job failed' };
        // else still running — keep polling
      }
    }
    await new Promise(r2 => setTimeout(r2, intervalMs));
  }
  return { ok: false, error: `guardian job ${jobId} did not complete within ${timeoutMs}ms` };
}

function _memoryJaa() {
  const rows = new Map();
  return {
    insert: (table, row) => { rows.set(`${table}:${row.uuid}`, { ...row }); return row; },
    update: (table, filter, row) => {
      const key = `${table}:${filter.uuid}`;
      if (!rows.has(key)) throw new Error('row not found'); // triggers QueueCompartment's own insert-fallback, matches real jaa semantics
      rows.set(key, { ...row });
      return row;
    },
    _dump: () => [...rows.values()], // exposed for the caller to persist a summary if it wants one
  };
}

/**
 * dispatchChunkWithVerification — drop-in replacement for the bare
 * `agentSuite.buildChunkWithAgent(prompt, opts)` call in
 * idearium/api/index.js's `speceng.build` handler. Same promise-based
 * contract in (`prompt`, options), but internally retries against the
 * real strategy ladder and verifies each response with the same
 * Detector Guardian uses, instead of trusting the first response
 * unconditionally.
 *
 * @param {string} chunkPrompt   — the built prompt for this chunk (same as before)
 * @param {object} chunk         — Idearium's chunk object (chunkIdx, chunkTitle used for the compartment's identity)
 * @param {function} dispatchFn  — (prompt, opts) => Promise<{ok, text, error, queued, jobId, agent}> — this IS agentSuite.buildChunkWithAgent, unchanged
 * @param {object} opts          — { preferAgent, axioms, specUuid, busEmit }
 * @returns {Promise<{ok, text, escalated, detection, attempts, queued, jobId, agent}>}
 */
export async function dispatchChunkWithVerification(chunkPrompt, chunk, dispatchFn, opts = {}) {
  const jaa = _memoryJaa();
  const comp = new QueueCompartment({
    queueId:      opts.specUuid || 'idearium-spec',
    chunkIdx:     chunk.chunkIdx,
    chunkTitle:   chunk.chunkTitle || chunk.sectionTitle,
    chunkContent: chunkPrompt,     // the "expected content" Detector profiles against — the prompt itself, same role SEAMQueue gives it
    builtPrompt:  chunkPrompt,
    provider:     opts.preferAgent || 'ollama',
    axioms:       opts.axioms || [],
    total:        opts.total || 1,
    jaa,
    busEmit:      opts.busEmit || (() => {}),
  });

  const maxWallClockAttempts = 6; // strategy ladder + watchdog ceilings already bound this internally; this is an outer safety cap, not the real limit
  let attempts = 0;

  while (attempts < maxWallClockAttempts) {
    attempts++;
    const prompt = comp.state === STATE.RETRYING ? comp.buildRetryPrompt() : comp.builtPrompt;

    comp.inject(`idearium-${comp.uuid}-${attempts}`);
    comp.generating();

    let dispatchResult;
    try {
      dispatchResult = await dispatchFn(prompt, opts);
    } catch (e) {
      // A real dispatch-layer failure (network, provider down) — not a
      // content-quality failure Detector should judge. Treat as a
      // connectivity retry, same distinction QueueCompartment's own
      // watchdogRetry() draws for stalls vs. content failures.
      const { escalated } = comp.watchdogRetry(e.message);
      if (escalated) return { ok: false, escalated: true, detection: null, attempts, error: e.message };
      continue;
    }

    // §GAP CLOSED 2026-07-06 — used to return dispatchResult (queued,
    // unresolved) straight to the caller here, which is exactly the dead
    // end traced above: nothing downstream ever polled it. Now polls to
    // real resolution and feeds the result through the same
    // detecting()/evaluate() verification every direct response gets —
    // a chatgpt/claude chunk is no longer a second-class, unverified path.
    if (dispatchResult.queued) {
      const polled = await _pollGuardianJob(dispatchResult.jobId);
      if (!polled.ok) {
        const { escalated } = comp.watchdogRetry(polled.error);
        if (escalated) return { ok: false, escalated: true, detection: null, attempts, error: polled.error };
        continue;
      }
      dispatchResult = { ok: true, text: polled.text, agent: dispatchResult.agent };
      // falls through to the same detecting()/evaluate() block below
    }

    if (!dispatchResult.ok || !dispatchResult.text) {
      const { escalated } = comp.watchdogRetry(dispatchResult.error || 'no text in response');
      if (escalated) return { ok: false, escalated: true, detection: null, attempts, error: dispatchResult.error };
      continue;
    }

    comp.detecting(dispatchResult.text);
    const { passed, detection } = comp.evaluate();

    if (passed) {
      // §PASS-THROUGH 2026-07-09 — this returned a fixed field set, silently
      // dropping anything the dispatchFn reported beyond {ok, text, agent}.
      // With WARP in the build path that means source/cost/cacheHit vanish
      // here, and a zero-token exact-cache hit becomes indistinguishable from
      // a full LLM generation in every downstream event and ledger row.
      // Verification owns quality, not provenance — forward what it did not
      // produce rather than erasing it.
      return {
        ok: true, escalated: false, text: dispatchResult.text, detection, attempts,
        agent: dispatchResult.agent,
        source:   dispatchResult.source,
        cost:     dispatchResult.cost,
        cacheHit: dispatchResult.cacheHit,
        digest:   dispatchResult.digest,
      };
    }
    if (comp.state === STATE.ESCALATED) {
      return { ok: false, escalated: true, detection, attempts, text: dispatchResult.text };
    }
    // else state === RETRYING — loop continues, buildRetryPrompt() picks it up next iteration
  }

  return { ok: false, escalated: true, detection: comp.detection, attempts, error: 'exceeded outer wall-clock attempt cap' };
}

// §BROKEN IMPORT FIXED 2026-07-09 — warp-build-dispatch.js does
// `import { pollGuardianJob } from './chunk-dispatch.js'`, but this module
// only ever defined `_pollGuardianJob` privately and exported
// `dispatchChunkWithVerification`. The named import failed, so
// warp-build-dispatch.js could NEVER be imported — an ESM SyntaxError at load.
// It also has zero consumers, so nothing ever tried, and the failure stayed
// invisible. Its header describes test results that cannot have come from
// importing this file. Export the real poller under the name its one consumer
// expects, rather than duplicating a second poller.
export { _pollGuardianJob as pollGuardianJob };
