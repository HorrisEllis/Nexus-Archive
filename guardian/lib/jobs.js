'use strict';
/**
 * guardian/lib/jobs.js — the job lifecycle, decompiled out of
 * guardian/server.js.
 * comp_id: nexus.guardian.jobs
 * UUID: nexus-guardian-jobs-v1-0000-2026-0902-001
 *
 * WHY: guardian/lib/dispatcher.js (extracted earlier this session) takes
 * `updateJob` as an injected dependency but that function — along with
 * `createJob`, `_suggestJobHat`, `_findActiveJobForProvider`, and the
 * `jobs` Map they all share — still lived inline in server.js. This
 * closes that loop: dispatcher.js's real dependency now has a real,
 * standalone home instead of staying a closure server.js hands out.
 *
 * Moved verbatim, not reimplemented — including the real comments that
 * explain *why* each piece works the way it does, because those explain
 * decisions (e.g. hat computed once at creation, not per-retry) that
 * aren't visible from the code shape alone:
 *
 *   §ACK-INJECTION-FIX 2026-09-02 — _suggestJobHat never throws; no hat
 *   is a legitimate, common result, not an error.
 *   §AGENT-MESH-ARTIFACTS 2026-09-02 — _findActiveJobForProvider exists
 *   because clear-glass's download-capture.js runs in a different
 *   process with zero knowledge of guardian's job objects; this is a
 *   best-effort correlation (most recent 'dispatched' job for that
 *   provider), honestly not a guaranteed match — this is the same
 *   agent-mesh territory this session's Clear Glass / AgentMesh
 *   investigation covered; a caller that needs certainty should pass
 *   jobId explicitly instead of relying on this.
 */

const { randomUUID } = require('crypto');
const intentHatRouter = require('../../lib/intent-hat-router.js');
const hatForge = require('../../lib/hat-forge.js');

/**
 * createJobStore() — one call per server.js process (matches the
 * original single module-scope `jobs = new Map()`). Does not take
 * injected deps beyond intentHatRouter/hatForge, which are required
 * directly here exactly as server.js required them — these are stable
 * infrastructure modules, not per-call context like dispatcher.js's
 * bus/ncp/pendingQueue were.
 */
function createJobStore() {
  const jobs = new Map();

  // §ACK-INJECTION-FIX 2026-09-02 — real, read-only hat lookup. Never
  // throws (suggestHat() itself is pure — classify + a map lookup, no
  // I/O — but this still guards it: a job must never fail to create
  // because a persona suggestion had a problem). No hat is a legitimate,
  // common result (most prompts don't map to a seeded hat's verb) —
  // returns null, not a fabricated default persona.
  function _suggestJobHat(prompt) {
    try {
      const suggestion = intentHatRouter.suggestHat(prompt || '');
      if (!suggestion.suggested) return null;
      const hat = hatForge.get(suggestion.hatName);
      if (!hat) return null;
      return {
        name: hat.name,
        personaPrompt: hat.personaPrompt || '',
        toolScope: Array.isArray(hat.toolScope) ? hat.toolScope : [],
        verb: suggestion.verb,
        confidence: suggestion.confidence,
      };
    } catch (e) {
      console.warn(`[guardian] hat suggestion failed for job (non-fatal): ${e.message}`);
      return null;
    }
  }

  function createJob({ command, provider, prompt, content, source, tools }) {
    const id = randomUUID();
    // §ACK-INJECTION-FIX — computed once at creation, not per-dispatch-
    // retry, so a job's persona stays stable across any real redelivery.
    const hat = _suggestJobHat(prompt);
    const job = {
      id, command, provider, prompt, content: content || null, source: source || null,
      tools: Array.isArray(tools) ? tools : null,
      hat,
      status: 'pending', response: '', ts: Date.now(), updatedAt: Date.now(),
    };
    jobs.set(id, job);
    console.log(`[guardian] job created: ${id} → ${provider} /${command}${hat ? ` [hat: ${hat.name}]` : ''}`);
    return job;
  }

  function updateJob(id, patch) {
    const job = jobs.get(id);
    if (!job) return null;
    Object.assign(job, patch, { updatedAt: Date.now() });
    return job;
  }

  // §AGENT-MESH-ARTIFACTS 2026-09-02 — James: "hook it into agent mesh...
  // like idearium works end to end." Real, honest correlation for a
  // download arriving with no jobId attached (clear-glass's download-
  // capture.js has no knowledge of guardian's job objects — different
  // process, and Electron's own will-download event carries no job
  // context at all). The most recent job dispatched-but-not-yet-resolved
  // for that provider is the best real evidence available; when more
  // than one is plausible (e.g. rapid-fire dispatches to the same tab)
  // this picks the most recent by updatedAt and is honest that it's a
  // best-effort match, not a guaranteed one — a caller that needs
  // certainty should pass jobId explicitly instead of relying on this.
  function _findActiveJobForProvider(provider) {
    if (!provider) return null;
    let best = null;
    for (const job of jobs.values()) {
      if (job.provider !== provider) continue;
      if (job.status !== 'dispatched') continue;
      if (!best || job.updatedAt > best.updatedAt) best = job;
    }
    return best ? best.id : null;
  }

  return { jobs, createJob, updateJob, _suggestJobHat, _findActiveJobForProvider };
}

module.exports = { createJobStore };
