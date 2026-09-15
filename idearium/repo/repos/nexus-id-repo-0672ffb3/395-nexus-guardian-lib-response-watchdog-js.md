'use strict';

/**
 * guardian/lib/response-watchdog.js
 *
 * §MCO16f 2026-09-14 — the retry half of James's ask: "events and .events per
 * event, for failure, timeout and have retry logic like checking the
 * .response."
 *
 * §WHAT THIS IS NOT, so it doesn't get read as a duplicate of two real things
 * that already exist and are deliberately left alone:
 *   - lib/seam/watchdog.js watches SEAM QUEUE COMPARTMENTS stuck in
 *     GENERATING and routes through SEAMQueue#forceRetryActive. Different
 *     subject (compartments, not jobs), different lever. Its two trip
 *     conditions (provider_disconnected / stall_timeout) are the right shape
 *     and are deliberately mirrored here rather than reinvented — same two
 *     questions, asked about a job.
 *   - guardian/userscript-*.js's autoRetry() re-prompts when a response
 *     ARRIVED but detectResponseErrors() found something wrong with it. That
 *     is a quality retry inside the tab. This is a delivery retry, from
 *     guardian's side, for a response that never arrived at all.
 *
 * §THE FAILURE THIS ACTUALLY CATCHES — traced, not assumed. guardian/
 * userscript-chatgpt.js's startWatch() has NO deadline. checkStable()
 * reschedules itself every 300ms forever; the only two exits are (a) 3
 * consecutive stable reads while not generating -> _onJobComplete, or (b)
 * currentJobId changing out from under it. If the tab navigates away, is
 * backgrounded into timer throttling, or the generation dies mid-stream, the
 * loop simply keeps running and _onJobComplete NEVER fires. No error, no
 * event, nothing in any log. Guardian sits on a 'delivered' job with no
 * response, askSync times out, and copilot prints "[NCP dispatch failed — no
 * response]" — a message about dispatch, for a failure that happened long
 * after dispatch succeeded. That mismatch is why the error has been so
 * misleading to read.
 *
 * §THE GATE IS THE NODES. Every decision below is made by reading
 * `.response` nodes off disk (response-nodes.inspectJob) rather than the
 * in-memory job Map — see that module's own §WHY FROM DISK note. A watchdog
 * that consults the same volatile state that already failed cannot see the
 * failure.
 *
 * §FAIL-OPEN-ON-UNCERTAIN-EVIDENCE — the identical rule guardian/lib/
 * dispatcher.js's ping gate and copilot/lifeline.js's _tryGuardian already
 * use, applied to the same shape of problem. A quiet DOM is not proof of
 * death: a model can genuinely think for 30+ seconds before emitting a token.
 * So there are two different thresholds, not one:
 *   - silence AFTER real mutation  -> streamSilenceMs (the tab was alive and
 *     typing and stopped — strong evidence)
 *   - silence with NO mutation ever -> firstTokenMs (weak evidence; a long
 *     wait before the first token is normal, so this is much more generous)
 * Both must also survive a provider-connected check before a retry fires.
 */

const DEFAULT_INTERVAL_MS        = 5_000;
const DEFAULT_FIRST_TOKEN_MS     = 90_000;  // no DOM movement at all yet — generous on purpose
const DEFAULT_STREAM_SILENCE_MS  = 25_000;  // was moving, then stopped, never went stable
const DEFAULT_MAX_RETRIES        = 2;

const responseNodes = require('./response-nodes.js');

class ResponseWatchdog {
  /**
   * @param {Function} opts.listWatchedJobs  () => [{ id, provider, status, deliveredAt }] — real jobs guardian believes are in flight
   * @param {Function} opts.redispatch       (job, reason) => Promise<boolean> — the SAME lever a human has; never a private retry path
   * @param {Function} [opts.ncpIsConnected] (provider) => boolean
   * @param {Function} [opts.busEmit]        (type, data) => void
   */
  constructor({
    listWatchedJobs, redispatch, ncpIsConnected, busEmit,
    intervalMs, firstTokenMs, streamSilenceMs, maxRetries,
  } = {}) {
    if (typeof listWatchedJobs !== 'function') throw new Error('ResponseWatchdog: listWatchedJobs fn required');
    if (typeof redispatch !== 'function')      throw new Error('ResponseWatchdog: redispatch fn required');

    this._listWatchedJobs = listWatchedJobs;
    this._redispatch      = redispatch;
    this._ncpIsConnected  = ncpIsConnected || (() => true); // no checker supplied is no evidence — fail open, don't assume dead
    this._busEmit         = busEmit || (() => {});

    this.intervalMs       = intervalMs       || DEFAULT_INTERVAL_MS;
    this.firstTokenMs     = firstTokenMs     || DEFAULT_FIRST_TOKEN_MS;
    this.streamSilenceMs  = streamSilenceMs  || DEFAULT_STREAM_SILENCE_MS;
    this.maxRetries       = maxRetries === undefined ? DEFAULT_MAX_RETRIES : maxRetries;

    this._timer    = null;
    this._attempts = new Map(); // jobId -> retries this watchdog has forced
    this._settled  = new Set(); // jobIds already resolved or given up on — never re-examined
    this.sweeps    = 0;
    this.fires     = 0;
  }

  start() {
    if (this._timer) return this;
    this._timer = setInterval(() => { this.check().catch(() => {}); }, this.intervalMs);
    if (this._timer.unref) this._timer.unref();
    return this;
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    return this;
  }

  /**
   * assess(job) -> { verdict, reason, evidence } — pure given the nodes on
   * disk. Exposed and tested directly, because a watchdog whose decision can
   * only be observed by watching it retry something is a watchdog nobody can
   * debug.
   *
   * verdicts:
   *   'complete'      — a terminal .response node exists; done, stop watching
   *   'healthy'       — movement recently enough; leave it alone
   *   'timeout'       — real silence past the applicable threshold
   *   'disconnected'  — provider dropped while this job was in flight
   */
  assess(job, now = Date.now()) {
    const info    = responseNodes.inspectJob(job.id);
    const started = job.deliveredAt || job.ts || now;

    if (info.terminal) {
      return { verdict: 'complete', reason: `terminal ${info.terminalPhase} node present`, evidence: info };
    }
    if (!this._ncpIsConnected(job.provider)) {
      return { verdict: 'disconnected', reason: `provider ${job.provider} is not connected`, evidence: info };
    }
    if (info.count === 0) {
      const waited = now - started;
      return waited > this.firstTokenMs
        ? { verdict: 'timeout', reason: `no .response node at all after ${Math.round(waited / 1000)}s (first-token threshold ${Math.round(this.firstTokenMs / 1000)}s)`, evidence: { ...info, waitedMs: waited } }
        : { verdict: 'healthy', reason: `waiting for first DOM movement (${Math.round(waited / 1000)}s)`, evidence: info };
    }
    const silent = now - (info.lastTs || started);
    return silent > this.streamSilenceMs
      ? { verdict: 'timeout', reason: `DOM moved ${info.count}× then went silent for ${Math.round(silent / 1000)}s (threshold ${Math.round(this.streamSilenceMs / 1000)}s)`, evidence: { ...info, silentMs: silent } }
      : { verdict: 'healthy', reason: `last mutation ${Math.round(silent / 1000)}s ago`, evidence: info };
  }

  async check() {
    this.sweeps++;
    let jobs;
    try { jobs = this._listWatchedJobs() || []; }
    catch (e) { console.warn(`[guardian/response-watchdog] listWatchedJobs failed: ${e.message}`); return; }

    for (const job of jobs) {
      if (!job || !job.id || this._settled.has(job.id)) continue;
      const a = this.assess(job);

      if (a.verdict === 'complete') {
        this._settled.add(job.id);
        this._attempts.delete(job.id);
        continue;
      }
      if (a.verdict === 'healthy') continue;

      await this._trip(job, a);
    }
  }

  async _trip(job, assessment) {
    const attempt = (this._attempts.get(job.id) || 0);
    const eventType = assessment.verdict === 'disconnected'
      ? 'guardian.response.failed'
      : 'guardian.response.timeout';

    // §TANGIBLE — every trip writes a real .event node before anything is
    // decided about it. The record of the failure must not depend on the
    // retry that follows succeeding, or on this process surviving.
    responseNodes.writeEventNode({
      type: eventType,
      source: 'guardian/lib/response-watchdog.js',
      id: job.id,
      payload: {
        jobId: job.id, provider: job.provider || null,
        verdict: assessment.verdict, reason: assessment.reason,
        attempt, maxRetries: this.maxRetries,
        evidence: assessment.evidence,
      },
    });
    this._busEmit(eventType, { jobId: job.id, provider: job.provider, reason: assessment.reason, attempt });
    this.fires++;

    if (attempt >= this.maxRetries) {
      // §1.2 — giving up is itself a real, recorded event, not a silent
      // stop. This is the node a human or a copilot tool reads to find out
      // why a job died, and it is the last thing written for this job.
      this._settled.add(job.id);
      responseNodes.writeEventNode({
        type: 'guardian.response.abandoned',
        source: 'guardian/lib/response-watchdog.js',
        id: job.id,
        payload: {
          jobId: job.id, provider: job.provider || null,
          reason: `${assessment.reason} — ${attempt}/${this.maxRetries} watchdog retries already used`,
          finalVerdict: assessment.verdict, evidence: assessment.evidence,
        },
      });
      this._busEmit('guardian.response.abandoned', { jobId: job.id, provider: job.provider, attempt });
      console.warn(`[guardian/response-watchdog] ${job.id}: ${assessment.reason} — retry cap reached, abandoned (see .event node)`);
      return;
    }

    this._attempts.set(job.id, attempt + 1);
    responseNodes.writeEventNode({
      type: 'guardian.response.retry',
      source: 'guardian/lib/response-watchdog.js',
      id: job.id,
      payload: {
        jobId: job.id, provider: job.provider || null,
        attempt: attempt + 1, maxRetries: this.maxRetries,
        triggeredBy: assessment.verdict, reason: assessment.reason,
      },
    });
    this._busEmit('guardian.response.retry', { jobId: job.id, provider: job.provider, attempt: attempt + 1 });
    console.warn(`[guardian/response-watchdog] ${job.id}: ${assessment.reason} — retry ${attempt + 1}/${this.maxRetries}`);

    try {
      await this._redispatch(job, `${assessment.verdict}: ${assessment.reason}`);
    } catch (e) {
      // A failed retry is a real failure with its own real node — not a
      // swallowed exception and not silently folded into the timeout above.
      responseNodes.writeEventNode({
        type: 'guardian.response.failed',
        source: 'guardian/lib/response-watchdog.js',
        id: job.id,
        payload: { jobId: job.id, provider: job.provider || null, stage: 'redispatch', error: e.message, attempt: attempt + 1 },
      });
      console.warn(`[guardian/response-watchdog] ${job.id}: redispatch threw — ${e.message}`);
    }
  }

  /** Called when a response really lands, so a completed job stops being swept. */
  settle(jobId) { this._settled.add(jobId); this._attempts.delete(jobId); }

  stats() {
    return { sweeps: this.sweeps, fires: this.fires, watching: this._attempts.size, settled: this._settled.size };
  }
}

function createResponseWatchdog(opts) { return new ResponseWatchdog(opts); }

module.exports = {
  ResponseWatchdog, createResponseWatchdog,
  DEFAULT_INTERVAL_MS, DEFAULT_FIRST_TOKEN_MS, DEFAULT_STREAM_SILENCE_MS, DEFAULT_MAX_RETRIES,
};