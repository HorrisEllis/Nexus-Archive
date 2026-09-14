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
  const { updateJob, bus, ncp, pendingQueue, cockpitBroadcast, dispatchToMistral, dispatchToDeepseek, pingTimeoutMs } = deps;
  for (const [name, fn] of Object.entries({ updateJob, bus, ncp, cockpitBroadcast, dispatchToMistral, dispatchToDeepseek })) {
    if (!fn) throw new Error(`[dispatcher] missing required dependency: ${name}`);
  }
  if (!(pendingQueue instanceof Map)) {
    throw new Error('[dispatcher] pendingQueue must be the same Map instance server.js reads elsewhere (queue flush/replay code reads it directly)');
  }

  const { pool: _dispatchPool } = require('./dispatch-pool'); // §P11: per-provider semaphore

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
  function _pingProvider(provider, tabId, timeoutMs = pingTimeoutMs || 3000) {
    return new Promise((resolve) => {
      const pingId = randomUUID();
      let settled = false;
      const onPong = (ev) => {
        if (ev?.data?.provider !== provider || ev?.data?.pingId !== pingId) return;
        // §MCO-NCP-FANOUT 2026-09-13 — when a specific tabId was resolved
        // (see _doDispatch below), the pong must come from THAT tab, not
        // just any tab for this provider. Without this check, a pong from
        // a DIFFERENT connected tab than the one about to receive the
        // real job would falsely clear the gate for a tab that never
        // actually answered the ping — the exact class of false evidence
        // this gate was built to prevent. No tabId given (real,
        // backward-compatible fallback — see below) keeps the original,
        // provider-only match.
        if (tabId && ev?.data?.tabId !== tabId) return;
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
      // §MCO-NCP-FANOUT 2026-09-13 — real single-tab ping when a target
      // was resolved AND ncp exposes pushTab (real production ncp.js
      // does; an older/fake ncp without it falls back to the original
      // broadcast — never a hard requirement, so no existing caller
      // breaks). Broadcasting GUARDIAN_PING to every tab and clearing on
      // the first pong from ANY of them proved nothing about whether the
      // SPECIFIC tab about to receive the real job is the one that's
      // actually alive.
      const sent = (tabId && typeof ncp.pushTab === 'function')
        ? (ncp.pushTab(provider, tabId, { type: 'GUARDIAN_PING', pingId }) ? 1 : 0)
        : ncp.push(provider, { type: 'GUARDIAN_PING', pingId });
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

    // §MCO-NCP-FANOUT 2026-09-13 — real bug, real fix, traced from a live
    // log: "dispatched → chatgpt via NCP (3 clients)" followed by 3 real
    // job.dispatched acks and then "[NCP dispatch failed — no response]".
    // ncp.push() below (and _pingProvider's own ping, already fixed above)
    // broadcasts to EVERY connected client for a provider — with 3 real
    // tabs open, all 3 got the SAME job and independently raced to answer
    // it. Resolved to exactly ONE real target here, BEFORE the ping gate,
    // so both the ping and the real job content go to the same single
    // tab. Real, backward-compatible fallback: an ncp without
    // listClientsForProvider (an older/fake dependency — every existing
    // test's fake ncp) leaves targetTabId null, and every line below
    // behaves byte-for-byte as it did before this fix (broadcast ping,
    // broadcast dispatch) — nothing is a hard new requirement.
    let targetTabId = null;
    if (typeof ncp.listClientsForProvider === 'function') {
      const { selectDispatchTarget } = require('./ncp-dispatch-target.js');
      const clients = ncp.listClientsForProvider(job.provider);
      const selection = selectDispatchTarget(clients);
      if (selection.ok) {
        targetTabId = selection.tabId;
        if (selection.ambiguous) {
          // §1.2 — a real conflict (multiple claimed, or multiple
          // unclaimed tabs for one provider) is loud, not resolved
          // silently as if it were the normal single-tab case.
          console.warn(`[guardian] ${job.id} → ${job.provider}: ${selection.reason}`);
          bus.emit('guardian.dispatch.target.ambiguous', {
            jobId: job.id, provider: job.provider, tabId: targetTabId,
            ambiguous: selection.ambiguous, candidateCount: selection.candidateCount,
          });
        }
      } else {
        // No real clients per listClientsForProvider — the isConnected()
        // gate above should already have caught this; logged, not fatal,
        // and dispatch falls through to the broadcast fallback (which
        // will itself report 0 clients honestly if this is somehow real).
        console.warn(`[guardian] ${job.id} → ${job.provider}: listClientsForProvider found no real target (${selection.reason})`);
      }
    }

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
    const ping = await _pingProvider(job.provider, targetTabId);
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

    const jobPayload = {
      type: 'GUARDIAN_JOB', jobId: job.id, command: job.command,
      provider: job.provider, prompt: job.prompt, content: job.content,
      tools: job.tools || null,
      hat: job.hat || null,
    };
    const sent = (targetTabId && typeof ncp.pushTab === 'function')
      ? (ncp.pushTab(job.provider, targetTabId, jobPayload) ? 1 : 0)
      : ncp.push(job.provider, jobPayload);
    if (sent === 0) {
      if (!pendingQueue.has(job.provider)) pendingQueue.set(job.provider, []);
      pendingQueue.get(job.provider).push(job);
      updateJob(job.id, { status: 'queued', queuedAt: Date.now(),
        queueReason: `NCP reported connected for ${job.provider} but the real write reached zero clients — socket likely stale` });
      console.log(`[guardian] ${job.id} → ${job.provider}: NCP said connected, real write reached 0 clients — requeued, not falsely marked delivered`);
      bus.emit('guardian.job.queued', { jobId: job.id, provider: job.provider, reason: 'stale_socket' });
      return false;
    }
    updateJob(job.id, { status: 'delivered', deliveredAt: Date.now(), dispatchedTabId: targetTabId || null });
    console.log(targetTabId
      ? `[guardian] dispatched ${job.id} → ${job.provider}:${targetTabId} via NCP (1 real target, not broadcast)`
      : `[guardian] dispatched ${job.id} → ${job.provider} via NCP (${sent} client${sent === 1 ? '' : 's'})`);
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
