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
const fs = require('fs');
const path = require('path');
const intentHatRouter = require('../../lib/intent-hat-router.js');
const hatForge = require('../../lib/hat-forge.js');
const nodeExport = require('../../lib/node-export.js');

// §BUILT 2026-09-11 — James: "each job sent to guardian is a .job file
// sent to the guardian queue... all payloads into guardian need to be
// tangible, need to use the queue, need to be a .job... persistent and
// doesn't leave until it's delivered." Real, confirmed gap (P23,
// 2026-09-11): this whole module's `jobs` Map is the ONLY record of a
// job while it's in flight. A guardian crash mid-job lost it, no file,
// no journal, nothing on disk until completion. Every createJob/
// updateJob call below now also writes a real .job file via node-
// export.js's real envelope (job already added to KNOWN_TYPES) — same
// discipline data/nodes/*.tool already uses for tool instances, applied
// here for the first time. loadPersistedJobs() hydrates the in-memory
// Map from these files at boot, so a restart recovers real, in-flight
// jobs instead of only ever seeing them after they complete.
const JOBS_DIR = path.join(__dirname, '..', '..', 'data', 'guardian', 'jobs');
function _persistJob(job) {
  try {
    fs.mkdirSync(JOBS_DIR, { recursive: true });
    const envelope = nodeExport.wrap('job', job.id, job, { context: 'guardian real-time job dispatch', system: 'guardian' });
    fs.writeFileSync(path.join(JOBS_DIR, `${job.id}.job`), nodeExport.toYaml(envelope), 'utf8');
  } catch (e) {
    // §1.2 — a failed persist must never crash a real dispatch in
    // progress; the in-memory job still exists and still gets a
    // response. This only degrades the restart-recovery guarantee for
    // this one job, not the job itself.
    console.warn(`[guardian/jobs] failed to persist ${job.id}.job (non-fatal): ${e.message}`);
  }
}

/**
 * loadPersistedJobs() — real boot-time recovery. Reads every .job file
 * left from a prior process, returns them keyed by id so createJobStore's
 * caller can seed the fresh in-memory Map before anything else runs.
 * Jobs already 'complete' or 'error' are still loaded (real history, not
 * discarded) but callers should treat only 'pending'/'dispatched' ones as
 * needing re-dispatch — that decision belongs to server.js's own boot
 * sequence, not this module.
 */
function loadPersistedJobs() {
  const out = new Map();
  try {
    if (!fs.existsSync(JOBS_DIR)) return out;
    for (const f of fs.readdirSync(JOBS_DIR)) {
      if (!f.endsWith('.job')) continue;
      try {
        const doc = nodeExport.importFromFile(path.join(JOBS_DIR, f));
        out.set(doc.payload.id, doc.payload);
      } catch (e) {
        console.warn(`[guardian/jobs] skipping unreadable ${f} (non-fatal): ${e.message}`);
      }
    }
  } catch (e) {
    console.warn(`[guardian/jobs] loadPersistedJobs failed (non-fatal, starting empty): ${e.message}`);
  }
  return out;
}

/**
 * createJobStore() — one call per server.js process (matches the
 * original single module-scope `jobs = new Map()`). Does not take
 * injected deps beyond intentHatRouter/hatForge, which are required
 * directly here exactly as server.js required them — these are stable
 * infrastructure modules, not per-call context like dispatcher.js's
 * bus/ncp/pendingQueue were.
 */
function createJobStore() {
  const jobs = loadPersistedJobs(); // §real boot recovery — seeded from disk, not always empty

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
    // §PHASE2 2026-09-15 (phasemap Bug 3 / open question) — the real
    // command list this job store creates is 'queue', 'code', 'tools',
    // 'wake', and whatever body.command carries through the general
    // dispatch route (normally 'ask'). guardian/userscript-chatgpt.js's
    // own goToNewChat() comment already states the intended rule this
    // implements: fresh chat for every command EXCEPT a first 'tools'
    // dispatch — a tool-call job's own follow-up turns never come back
    // through createJob() at all (they re-inject via handleJob's local
    // _onJobComplete loop, same jobId, same thread), so the only real
    // case to exclude here is the initial 'tools' dispatch itself,
    // which needs the tab's current context/thread, not a blank chat.
    const freshChat = command !== 'tools';
    const job = {
      id, command, provider, prompt, content: content || null, source: source || null,
      tools: Array.isArray(tools) ? tools : null,
      hat, freshChat,
      status: 'pending', response: '', ts: Date.now(), updatedAt: Date.now(),
    };
    jobs.set(id, job);
    _persistJob(job);
    console.log(`[guardian] job created: ${id} → ${provider} /${command}${hat ? ` [hat: ${hat.name}]` : ''}`);
    return job;
  }

  function updateJob(id, patch) {
    const job = jobs.get(id);
    if (!job) return null;
    Object.assign(job, patch, { updatedAt: Date.now() });
    _persistJob(job);
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
