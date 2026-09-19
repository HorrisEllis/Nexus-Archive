'use strict';
/**
 * guardian/lib/dispatcher.js — the dispatch subsystem, decompiled out of
 * guardian/server.js.
 * comp_id: nexus.guardian.dispatcher
 * UUID: nexus-guardian-dispatcher-v1-0000-2026-0902-001
 *
 * WHY (James, 2026-09-02: "decompile guardian into component, remove
 * bottleneck"): dispatchJob() and _doDispatch() lived inline in
 * guardian/server.js (4681 lines, 70+ top-level functions/routes in one
 * file) as closures over that file's module-scoped `jobs`, `updateJob`,
 * `ncp`, `pendingQueue`, `cockpitBroadcast`, and `_dispatchToMistral`.
 * This file is that same logic, moved verbatim (not reimplemented from
 * memory or guessed) into a standalone component, taking those five
 * things as injected dependencies instead of closing over module scope —
 * that's what makes it a real component instead of a copy-paste that
 * happens to also work.
 *
 * The pool-release bottleneck found the same session (dispatch-pool's
 * complete()/fail() had zero call sites anywhere in the repo) is fixed
 * separately in guardian/lib/dispatch-pool-bridge.js, wired to the same
 * bus events every completion path here already emits — not duplicated
 * inline in doDispatch, because NCP-path completion doesn't happen in
 * doDispatch at all (it arrives later, in server.js's _handleNCPMessage,
 * on a real GUARDIAN_DELIVERED/response message) — a bus-level bridge is
 * the only place that's correct for every dispatch path, not just this one.
 *
 * VERIFICATION STATUS: syntax-checked and dependency-shape-tested with
 * fakes (see the accompanying test run). NOT yet run against the live
 * repo with real ncp/bus/pool instances — that requires this file to
 * actually replace the inline functions in server.js, which is the wiring
 * step below, not done automatically here per §16.5 (delete before add —
 * the inline versions in server.js should be removed once this is
 * confirmed working, not left duplicated).
 */

const { randomUUID } = require('crypto');

/**
 * createDispatcher(deps) — deps are exactly the five things _doDispatch
 * and dispatchJob closed over in server.js. Nothing here invents a new
 * dependency shape; each one is used exactly the way server.js already
 * uses it (updateJob(id, patch), bus.emit(name, payload), ncp.isConnected/
 * push(provider, ...), pendingQueue as a Map<provider, job[]>,
 * cockpitBroadcast(data), dispatchToMistral(job) → Promise).
 */
function createDispatcher(deps) {
  const { updateJob, bus, ncp, pendingQueue, cockpitBroadcast, dispatchToMistral, dispatchToDeepseek, pingTimeoutMs, completionTimeoutMs } = deps;
  for (const [name, fn] of Object.entries({ updateJob, bus, ncp, cockpitBroadcast, dispatchToMistral, dispatchToDeepseek })) {
    if (!fn) throw new Error(`[dispatcher] missing required dependency: ${name}`);
  }
  if (!(pendingQueue instanceof Map)) {
    throw new Error('[dispatcher] pendingQueue must be the same Map instance server.js reads elsewhere (queue flush/replay code reads it directly)');
  }

  const { pool: _dispatchPool } = require('./dispatch-pool'); // §P11: per-provider semaphore

  // §BUILT 2026-09-16 — James: "negative space... events to trigger from
  // the lack." Real, confirmed gap traced before building this, not
  // assumed: gap-finder (cortex/gap-finder) only ever reacts to events
  // something ELSE actively emitted (anomaly.detected, sigma.*) — it has
  // no mechanism of its own for noticing an expected event that never
  // arrived. And dispatchJob below has a PRE-dispatch ping timeout, but
  // nothing watched what happens AFTER a job is marked 'delivered' — if
  // completion never comes (dead tab, dropped SSE frame, crashed
  // renderer — every real failure mode this whole session traced back
  // to), the job just sits silently until a human notices the console
  // still says "no response." This map + the two blocks below are that
  // missing watch: jobId → timer. The event fired on expiry is the real
  // shadow/negative-space event — it exists BECAUSE something expected
  // did not happen, not because anything positively went wrong.
  const _completionWatch = new Map();
  const _COMPLETION_TIMEOUT_MS = completionTimeoutMs || 90000;
  const _MAX_TIMEOUT_RETRIES = 2; // §1.2 — bounded, not an infinite requeue loop

  function _armCompletionWatch(job) {
    _clearCompletionWatch(job.id);
    _completionWatch.set(job.id, setTimeout(() => {
      _completionWatch.delete(job.id);
      const retries = (job._timeoutRetries || 0) + 1;
      job._timeoutRetries = retries;
      bus.emit('guardian.job.timeout', {
        jobId: job.id, provider: job.provider, waitedMs: _COMPLETION_TIMEOUT_MS, retry: retries,
      });
      if (retries > _MAX_TIMEOUT_RETRIES) {
        updateJob(job.id, { status: 'failed', failedAt: Date.now(), failReason: `no completion within ${_COMPLETION_TIMEOUT_MS}ms after ${retries - 1} retr${retries - 1 === 1 ? 'y' : 'ies'} — giving up, not requeuing forever` });
        console.warn(`[guardian] ${job.id} → ${job.provider}: no completion within ${_COMPLETION_TIMEOUT_MS}ms, retries exhausted — marked failed`);
        return;
      }
      updateJob(job.id, { status: 'queued', queuedAt: Date.now(), queueReason: `no completion within ${_COMPLETION_TIMEOUT_MS}ms — real absence, not a guess, requeued (attempt ${retries})` });
      console.warn(`[guardian] ${job.id} → ${job.provider}: no completion within ${_COMPLETION_TIMEOUT_MS}ms — requeuing (attempt ${retries})`);
      if (!pendingQueue.has(job.provider)) pendingQueue.set(job.provider, []);
      pendingQueue.get(job.provider).push(job);
    }, _COMPLETION_TIMEOUT_MS));
  }

  function _clearCompletionWatch(jobId) {
    const t = _completionWatch.get(jobId);
    if (t) { clearTimeout(t); _completionWatch.delete(jobId); }
  }

  // Real completion, from anywhere (NCP GUARDIAN_COMPLETE, GUARDIAN_REPLAY's
  // non-replay branch, dispatch-pool-bridge) all emit this same bus event —
  // see this file's own header comment on why that's the one correct place.
  bus.on('guardian.job.complete', ({ jobId }) => _clearCompletionWatch(jobId));

  function dispatchJob(job) {
    // §P11: route through dispatch pool — per-provider semaphore, job stealing.
    // Slot release is NOT here — see dispatch-pool-bridge.js's header for why.
    _dispatchPool.enqueue(job.provider, { id: job.id, provider: job.provider, priority: job.priority || 'normal', payload: job },
      (poolJob) => _doDispatch(poolJob.payload));
    // If pool enqueued (slot available) _doDispatch was called synchronously.
    // If queued or stolen, it will be called when a slot frees.
    return;
  }

  /**
   * _pingProvider(provider, timeoutMs) — real round trip, same proven
   * shape as GUARDIAN_CLAIM/GUARDIAN_CLAIM_ACK: push a GUARDIAN_PING,
   * wait for the matching GUARDIAN_PING_ACK's real bus event
   * ('guardian.ncp.pong', wired in guardian/lib/ncp-handler.js). Genuine
   * confirmation the tab's own JS is alive and processing SSE messages
   * RIGHT NOW — stronger evidence than isConnected()'s passive heartbeat
   * staleness check, which only proves the tab answered something within
   * the last 30s.
   *
   * §HONEST SCOPE — this proves the tab is *responsive*, not that the
   * page is on the right view or that the composer element specifically
   * exists; that failure mode still surfaces the same way it always has,
   * as injectText() honestly failing inside handleJob(). A ping cannot
   * prove the DOM element it hasn't looked at yet is there.
   */
  function _pingProvider(provider, timeoutMs = pingTimeoutMs || 3000) {
    return new Promise((resolve) => {
      const pingId = randomUUID();
      let settled = false;
      const onPong = (ev) => {
        if (ev?.data?.provider !== provider || ev?.data?.pingId !== pingId) return;
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        bus.off('guardian.ncp.pong', onPong);
        resolve({ ok: true });
      };
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        bus.off('guardian.ncp.pong', onPong);
        resolve({ ok: false, reason: 'ping timeout' });
      }, timeoutMs);
      bus.on('guardian.ncp.pong', onPong);
      const sent = ncp.push(provider, { type: 'GUARDIAN_PING', pingId });
      if (sent === 0) {
        // Real evidence up front — no client actually received the
        // write, no reason to wait out the full timeout for nothing.
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        bus.off('guardian.ncp.pong', onPong);
        resolve({ ok: false, reason: 'ping write reached 0 clients' });
      }
    });
  }

  async function _doDispatch(job) {
    // §BUILT 2026-07-13 — Clear Glass command surface, not a chat provider.
    if (job.provider === 'browser') {
      let _approval;
      try {
        const raid = require('../../cortex/core/raid');
        _approval = raid._approveTool(job.source || 'unknown', String(job.command || ''), { action: 'browser' });
      } catch (e) {
        updateJob(job.id, { status: 'error', error: `RAID approval gate unavailable: ${e.message}` });
        bus.emit('guardian.job.error', { jobId: job.id, error: 'raid_unavailable', provider: 'browser' });
        return true;
      }
      if (!_approval.approved) {
        updateJob(job.id, { status: 'error', error: `RAID denied browser dispatch: ${_approval.reason}` });
        bus.emit('guardian.job.error', { jobId: job.id, error: _approval.reason, provider: 'browser' });
        return true;
      }
      updateJob(job.id, { status: 'dispatched', dispatchedAt: Date.now() });
      console.log(`[guardian] browser job → Clear Glass :7702/cmd (${job.command})`);
      const { dispatchBrowserCommand } = require('../clear-glass-bridge.js');
      let cmdData = job.content;
      if (typeof cmdData === 'string') {
        try { cmdData = JSON.parse(cmdData); } catch (_) { cmdData = { raw: cmdData }; }
      }
      dispatchBrowserCommand({ eventType: job.command, data: cmdData || {} })
        .then(result => {
          if (result.ok) {
            updateJob(job.id, { status: 'complete', response: JSON.stringify(result.result), completedAt: Date.now() });
            bus.emit('guardian.job.complete', { jobId: job.id, provider: 'browser', command: job.command });
          } else {
            updateJob(job.id, { status: 'error', error: result.error });
            bus.emit('guardian.job.error', { jobId: job.id, error: result.error, provider: 'browser' });
          }
        })
        .catch(e => {
          updateJob(job.id, { status: 'error', error: e.message });
          bus.emit('guardian.job.error', { jobId: job.id, error: e.message, provider: 'browser' });
        });
      return true;
    }

    // §BUILT 2026-09-19 — James: "guardian creates job, sends to clear
    // glass' agent mesh job queue... tries clear driver, falls back to
    // ncp/userscript." A job whose provider is `agent:<id>` targets one
    // of options/store.js's registered custom agents (an arbitrary site
    // + a picked input/output pair, no NCP/userscript coverage at all —
    // confirmed directly, custom agents don't go through userscript-
    // <provider>.js the way claude/chatgpt/etc do). Plain REST, not
    // clear-glass-bridge.js's two-step POST+SSE round trip — mesh.enqueue()
    // returns {taskId, position} immediately by design (see agent-mesh.js's
    // own enqueue()), so this is the same one-request/one-response shape
    // _dispatchViaGuardian already uses in the other direction (agent-
    // mesh.js → guardian's :7820/api/copilot/prompt), not a new pattern.
    //
    // Deliberately NOT applied to guardian's own known providers (claude/
    // chatgpt/gemini/etc, handled by the generic NCP path below) — agent-
    // mesh.js's own route() already tries guardian's NCP path FIRST for
    // those two via _dispatchViaGuardian; routing them through here too
    // would have each side calling back into the other for the same job.
    if (typeof job.provider === 'string' && job.provider.startsWith('agent:')) {
      const agentRecordId = job.provider.slice('agent:'.length);
      updateJob(job.id, { status: 'dispatched', dispatchedAt: Date.now() });
      console.log(`[guardian] custom-agent job → Clear Glass agent mesh (${agentRecordId})`);
      const http = require('http');
      const body = Buffer.from(JSON.stringify({ prompt: job.prompt, preferAgent: agentRecordId, jobId: job.id }));
      const req = http.request({
        hostname: '127.0.0.1', port: parseInt(process.env.CLEARGL_IPC_PORT || '7702', 10),
        path: '/agent-mesh/enqueue', method: 'POST', timeout: 10000,
        headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
      }, (res) => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(d); } catch (e) { parsed = null; }
          if (!parsed || !parsed.ok) {
            const errMsg = parsed?.error || `Clear Glass /agent-mesh/enqueue returned HTTP ${res.statusCode}`;
            updateJob(job.id, { status: 'error', error: errMsg });
            bus.emit('guardian.job.error', { jobId: job.id, error: errMsg, provider: job.provider });
            return;
          }
          // enqueue() only confirms the task was accepted into agent-
          // mesh's own queue (taskId/position) — the real completion
          // (mesh.queue.complete / mesh.queue.escalated) arrives later
          // over Clear Glass's own SSE stream, which this process does
          // not currently subscribe to. §HONEST LIMIT, same shape as
          // the pre-existing gap this file's own header names for NCP-
          // path completion (arrives via a separate message, not this
          // response): the job is genuinely, correctly dispatched, but
          // this dispatcher has no real way yet to mark it 'complete'
          // on its own. Left 'dispatched' rather than faking completion.
          console.log(`[guardian] ${job.id} → agent mesh accepted (taskId ${parsed.taskId}, position ${parsed.position})`);
        });
      });
      req.on('error', (e) => {
        const errMsg = `Clear Glass unreachable on :${process.env.CLEARGL_IPC_PORT || '7702'}: ${e.message}`;
        updateJob(job.id, { status: 'error', error: errMsg });
        bus.emit('guardian.job.error', { jobId: job.id, error: errMsg, provider: job.provider });
      });
      req.on('timeout', () => {
        req.destroy();
        updateJob(job.id, { status: 'error', error: 'Clear Glass /agent-mesh/enqueue timed out' });
        bus.emit('guardian.job.error', { jobId: job.id, error: 'enqueue_timeout', provider: job.provider });
      });
      req.write(body);
      req.end();
      return true;
    }

    // Mistral routes directly to ollama-bridge — no NCP browser tab needed
    if (job.provider === 'mistral') {
      updateJob(job.id, { status: 'dispatched', dispatchedAt: Date.now() });
      console.log('[guardian] mistral job → ollama-bridge :3749');
      dispatchToMistral(job).catch(e => {
        updateJob(job.id, { status: 'error', error: e.message });
        bus.emit('guardian.job.error', { jobId: job.id, error: e.message, provider: 'mistral' });
      });
      return true;
    }

    // §BUILT — James: "deepseek as a ncp provider." §RECONCILED 2026-09-02's
    // original branch always routed to ollama-bridge unconditionally, which
    // meant a real, connected chat.deepseek.com NCP tab (userscript-
    // deepseek.js, now real) could never be reached — this intercepted
    // every deepseek job before the generic NCP path below ever saw it.
    // Fixed with the same guardian-first-else-fallback precedent already
    // proven in clear-glass/src/mesh/agent-mesh.js's route() (DA1): a real,
    // connected browser tab wins; only fall back to the local ollama model
    // when no tab is connected — never removed, still a real, legitimate
    // option, just no longer unconditionally shadowing the browser path.
    if (job.provider === 'deepseek' && !ncp.isConnected('deepseek')) {
      updateJob(job.id, { status: 'dispatched', dispatchedAt: Date.now() });
      console.log('[guardian] deepseek job → ollama-bridge :3749 (no NCP tab connected)');
      dispatchToDeepseek(job).catch(e => {
        updateJob(job.id, { status: 'error', error: e.message });
        bus.emit('guardian.job.error', { jobId: job.id, error: e.message, provider: 'deepseek' });
      });
      return true;
    }

    // Ollama provider also routes to bridge (legacy path)
    if (job.provider === 'ollama') {
      updateJob(job.id, { status: 'dispatched', dispatchedAt: Date.now() });
      console.log('[guardian] ollama job → ollama-bridge :3749');
      dispatchToMistral({ ...job, provider: 'ollama' }).catch(e => {
        updateJob(job.id, { status: 'error', error: e.message });
        bus.emit('guardian.job.error', { jobId: job.id, error: e.message, provider: 'ollama' });
      });
      return true;
    }

    // NCP: push job via SSE channel instead of WebSocket
    if (!ncp.isConnected(job.provider)) {
      if (!pendingQueue.has(job.provider)) pendingQueue.set(job.provider, []);
      pendingQueue.get(job.provider).push(job);
      updateJob(job.id, { status: 'queued', queuedAt: Date.now(),
        queueReason: `waiting for ${job.provider} NCP channel` });
      console.log(`[guardian] queued ${job.id} — waiting for ${job.provider} userscript`);
      bus.emit('guardian.job.queued', { jobId: job.id, provider: job.provider });
      const provUrls = {
        claude:     'https://claude.ai/new',
        chatgpt:    'https://chatgpt.com/',
        gemini:     'https://gemini.google.com/',
        perplexity: 'https://www.perplexity.ai/',
        mistral:    'https://chat.mistral.ai/',
        deepseek:   'https://chat.deepseek.com/',
      };
      const url = provUrls[job.provider];
      if (url) {
        bus.emit('guardian.tab.needed', { provider: job.provider, url, jobId: job.id });
        cockpitBroadcast({ type: 'GUARDIAN_TAB_NEEDED', provider: job.provider, url, jobId: job.id });
        console.log(`[guardian] tab needed: ${url} — job ${job.id} will flush when connected`);
        // §WIRED 2026-09-12 — James: "only have chatgpt open. the other 3
        // event driven." Real, confirmed gap: guardian.tab.needed has
        // been emitted at exactly this point all along, but nothing ever
        // listened for it — clear-glass's own providerHost.start() (real,
        // already does everything needed: persistent session partition,
        // GM shim, userscript injection) was never actually reachable
        // from here. Fire-and-forget on purpose: the job above is
        // already correctly queued regardless of whether this succeeds
        // or clear-glass is even running right now — this is a nudge to
        // spawn sooner, not the thing the job's delivery depends on.
        try {
          const http = require('http');
          const req = http.request({
            host: '127.0.0.1', port: parseInt(process.env.CLEARGL_IPC_PORT || '7702', 10),
            path: `/providers/${encodeURIComponent(job.provider)}/start`, method: 'POST', timeout: 2000,
          }, (r) => { r.resume(); });
          req.on('error', (e) => console.warn(`[guardian] on-demand provider-start request failed (non-fatal, job still queued): ${e.message}`));
          req.end();
        } catch (e) { console.warn(`[guardian] could not send on-demand provider-start request: ${e.message}`); }
      }
      return false;
    }

    // Push via SSE — userscript's EventSource.onmessage receives it
    // §FIXED 2026-09-06 — see ncp.js's own _write()/push() comments for
    // the full trace. This return value used to be silently discarded —
    // ncp.isConnected() (the check above) can say true one moment and
    // the actual write can still fail the next if the socket died in
    // between (exactly what a disconnect/reconnect cycle produces), and
    // nothing here ever noticed. A job that reaches zero real clients is
    // functionally identical to "not connected" from the job's own point
    // of view, so it gets the exact same real recovery path — requeued,
    // a fresh tab requested — instead of being falsely marked delivered
    // with nothing left to ever retry it.

    // §BUILT 2026-09-13 — James: "each .job created has to wait until
    // the gate clears. the event gate sends the ping command, doesn't
    // dispatch until ping is returned, then dispatch the job." Real
    // gate, real evidence, before the real content ever goes out.
    // §FAIL-OPEN-ON-UNCERTAIN-EVIDENCE — same rule copilot/lifeline.js's
    // own _tryGuardian already uses for the identical shape of problem
    // (fail CLOSED when you have real evidence something is wrong, fail
    // OPEN when you have none): a ping timeout alone doesn't prove the
    // tab is dead — the ack could have been dropped, delayed, or the
    // main thread briefly busy with something else entirely legitimate.
    // Only refuse to dispatch when the ping AND the passive heartbeat
    // both say the same thing — two independent signals agreeing is
    // real evidence; one uncertain signal alone is not.
    updateJob(job.id, { status: 'pinging', pingedAt: Date.now() });
    const ping = await _pingProvider(job.provider);
    if (!ping.ok && !ncp.isConnected(job.provider)) {
      if (!pendingQueue.has(job.provider)) pendingQueue.set(job.provider, []);
      pendingQueue.get(job.provider).push(job);
      updateJob(job.id, { status: 'queued', queuedAt: Date.now(),
        queueReason: `ping gate failed (${ping.reason}) and heartbeat also stale — real evidence, not dispatching blind` });
      console.log(`[guardian] ${job.id} → ${job.provider}: ping gate failed (${ping.reason}), heartbeat also stale — requeued`);
      bus.emit('guardian.job.queued', { jobId: job.id, provider: job.provider, reason: 'ping_gate_failed' });
      return false;
    }
    if (!ping.ok) {
      console.warn(`[guardian] ${job.id} → ${job.provider}: ping gate did not clear (${ping.reason}) but heartbeat is still healthy — dispatching anyway (uncertain evidence, not refusing on it alone)`);
    }

    // §FIXED 2026-09-15 — James: "it doubles every time." Was ncp.push(),
    // which broadcasts a job to every client registered for this
    // provider — the real source of doubled dispatch/acks/completion
    // when clear-glass legitimately has more than one live client for
    // one provider (pre-warm overlapping the real tab, or two windows
    // briefly coexisting mid-restart). pushActive() targets exactly the
    // one client currently tracked as active for this provider — see
    // guardian/lib/ncp.js's own §FIXED note on why nothing gets force-
    // closed to make that true, just correctly aimed.
    const sent = ncp.pushActive(job.provider, {
      type: 'GUARDIAN_JOB', jobId: job.id, command: job.command,
      provider: job.provider, prompt: job.prompt, content: job.content,
      tools: job.tools || null,
      hat: job.hat || null,
    });
    if (sent === 0) {
      if (!pendingQueue.has(job.provider)) pendingQueue.set(job.provider, []);
      pendingQueue.get(job.provider).push(job);
      updateJob(job.id, { status: 'queued', queuedAt: Date.now(),
        queueReason: `NCP reported connected for ${job.provider} but the real write reached zero clients — socket likely stale` });
      console.log(`[guardian] ${job.id} → ${job.provider}: NCP said connected, real write reached 0 clients — requeued, not falsely marked delivered`);
      bus.emit('guardian.job.queued', { jobId: job.id, provider: job.provider, reason: 'stale_socket' });
      return false;
    }
    updateJob(job.id, { status: 'delivered', deliveredAt: Date.now() });
    _armCompletionWatch(job);
    // §FIXED 2026-09-15 — pushActive() only ever returns 0 or 1 now (single-
    // target, not a broadcast count), so the old "(N clients)" phrasing was
    // stale — always printed "(1 client)" and implied a fan-out that no
    // longer happens. Says what actually occurred instead.
    console.log(`[guardian] dispatched ${job.id} → ${job.provider} via NCP (active client)`);
    try {
      const alk = require('../../intelligence/alk');
      alk.record({
        actor:   'llm',
        intent:  'generate',
        payload: { jobId: job.id, provider: job.provider, command: job.command, promptHash: job.prompt?.slice(0,40) },
      });
    } catch(_) {}
    bus.emit('guardian.job.dispatched', { jobId: job.id, provider: job.provider });
    return true;
  }

  return { dispatchJob, _doDispatch, pool: _dispatchPool };
}

module.exports = { createDispatcher };
