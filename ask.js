'use strict';
/**
 * guardian/ask.js — synchronous ask over Guardian's real async job machinery
 * UUID: nexus-guardian-ask-v1-0000-2026-0707-jamesbrooks-001
 * Version: 1.0.0
 *
 * §GAP CLOSED 2026-07-07 — Guardian had ZERO working synchronous ask
 * endpoints, confirmed two independent ways this session:
 *   - /api/copilot/prompt: called by copilot/lifeline.js's escalation
 *     path, does not exist anywhere in guardian/server.js.
 *   - /chatgpt-mode/query: exists, correctly written, but 503s on every
 *     call — the file it requires (guardian/agents/chatgpt-mode.js) does
 *     not exist.
 * This blocked lifeline's RAID escalation, which was itself wired and
 * tested earlier this session but terminated at a dead endpoint.
 *
 * §WHY NOT BUILD chatgpt-mode.js — that path implies a real browser-tab
 * agent driving ChatGPT directly. Guardian already HAS that: the NCP
 * (browser-tab) job machinery, working, with RAID provider selection
 * already wired into /command's raw path. Building a second, parallel
 * agent would duplicate real infrastructure — exactly the "competing
 * truth layers" mistake this session repeatedly found and undid. This
 * wraps the real machinery instead.
 *
 * §HONEST ABOUT WHAT THIS IS — a synchronous facade over an inherently
 * asynchronous system. It cannot make a job finish faster; it can only
 * wait for it. Two consequences, both handled explicitly rather than
 * hidden:
 *   1. FAIL FAST — if no NCP provider is connected, the job would sit in
 *      'queued_waiting_for_provider' forever. This checks first and
 *      returns a clear error immediately instead of polling for 60s and
 *      then timing out with a vague message.
 *   2. REAL TIMEOUT — a connected-but-slow provider gets a bounded wait,
 *      then a specific timeout error naming the jobId, so the caller can
 *      still poll GET /jobs for it later. The work is never lost, only
 *      un-awaited.
 *
 * §FIELD-NAME INCONSISTENCY — Guardian itself stores completion text in
 * `responseText` on one code path (GUARDIAN_COMPLETE) and `result` on
 * another (the stream-buffer path). This reads both. That is a real
 * inconsistency in Guardian, and this is an honest patch over it, not a
 * fix to Guardian — noted so it isn't mistaken for one.
 *
 * §INJECTABLE — takes createJob/dispatchJob/getJob/isProviderConnected
 * rather than reaching into server internals. Testable standalone.
 */

const DEFAULT_TIMEOUT_MS = 90000;
const POLL_INTERVAL_MS   = 500;

function _extractText(job) {
  // Both real field names, plus a defensive third. Never invents text.
  return job.responseText || job.result || job.text || null;
}

/**
 * askSync(prompt, opts, deps) — enqueue a job through Guardian's real
 * pipeline and wait for it to reach a terminal state.
 *
 * @param {string} prompt
 * @param {object} opts — { provider, content, timeoutMs, command }
 * @param {object} deps — { createJob, dispatchJob, getJob, isProviderConnected }
 * @returns {Promise<{ok, text?, jobId, provider, error?}>}
 */
async function askSync(prompt, opts = {}, deps = {}) {
  const { createJob, dispatchJob, getJob, isProviderConnected } = deps;
  if (typeof createJob !== 'function' || typeof dispatchJob !== 'function' || typeof getJob !== 'function') {
    return { ok: false, error: 'guardian/ask: createJob, dispatchJob and getJob must be injected' };
  }
  if (!prompt) return { ok: false, error: 'prompt required' };

  const provider  = opts.provider || 'auto';
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;

  // §BUG FIXED 2026-07-07 (caught before shipping) — the first version of
  // this passed provider straight to createJob. But createJob stores the
  // provider verbatim and dispatchJob enqueues to pendingQueue[provider];
  // a literal 'auto' therefore creates a job queued to a bucket NO real
  // provider ever drains — a permanently-stuck job that only the timeout
  // below would ever release. /command resolves 'auto' via RAID BEFORE
  // createJob, and so must this. resolveProvider is injected (not a hard
  // RAID require) so this module stays sovereign and testable standalone.
  let resolved = provider;
  if (resolved === 'auto') {
    if (typeof deps.resolveProvider !== 'function') {
      return { ok: false, error: "provider 'auto' requires an injected resolveProvider() — refusing to enqueue a job to a queue nothing drains" };
    }
    try {
      resolved = deps.resolveProvider(prompt);
    } catch (e) {
      return { ok: false, error: `provider resolution failed: ${e.message}` };
    }
    if (!resolved || resolved === 'auto') {
      return { ok: false, error: 'provider resolution returned no concrete provider' };
    }
  }

  // §FAIL FAST — an unconnected provider means this job can never complete
  // in the caller's lifetime. Say so now, don't poll into a timeout.
  //
  // §MESSAGE CORRECTED TWICE. It first said "no browser tab available",
  // which encoded an unverified assumption. It then pointed at
  // clear-glass/ncp-client.js — a provider *I* wrote, which turned out to
  // duplicate the real mechanism: Clear Glass's ProviderHost injects
  // Guardian's own userscripts (guardian/userscript-<agent>.js) into its
  // webviews, and those connect to /channel. That is canonical; my client
  // is now tests/helpers/clear-glass-ncp-provider.js, a test double only.
  // The real production failure is upstream and specific: ProviderHost
  // needs GUARDIAN_DIR set (autopilot now sets it), and CookieVault must
  // restore a session or the tab lands on a login page and can never answer.
  if (typeof isProviderConnected === 'function' && !isProviderConnected(resolved)) {
    return { ok: false, error: `no provider connected on NCP channel '${resolved}' — check that Clear Glass booted with GUARDIAN_DIR set and that its '${resolved}' tab has a restored session (not a login page)`, provider: resolved };
  }

  let job;
  try {
    job = createJob({ command: opts.command || 'ask', provider: resolved, prompt, content: opts.content || '' });
    dispatchJob(job);
  } catch (e) {
    return { ok: false, error: `failed to enqueue job: ${e.message}` };
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    const current = getJob(job.id);
    if (!current) continue; // not yet visible in the store — keep waiting

    if (current.status === 'complete' || current.status === 'done') {
      const text = _extractText(current);
      if (!text) {
        // §1.2 — a "complete" job with no text is a real anomaly, not an
        // empty success. Report it as the failure it is.
        return { ok: false, jobId: job.id, provider: current.provider, error: 'job completed but carried no response text' };
      }
      return { ok: true, jobId: job.id, provider: current.provider, text, modelUsed: current.provider };
    }
    if (current.status === 'error') {
      return { ok: false, jobId: job.id, provider: current.provider, error: current.error || 'job failed' };
    }
    // still queued/dispatching/streaming — keep polling
  }

  // Timed out. The job is still alive and may complete later — name it so
  // the caller can retrieve it via GET /jobs rather than assume it's lost.
  return { ok: false, jobId: job.id, provider: resolved, error: `timed out after ${timeoutMs}ms — job ${job.id} may still complete; poll GET /jobs` };
}

module.exports = { askSync, DEFAULT_TIMEOUT_MS };
