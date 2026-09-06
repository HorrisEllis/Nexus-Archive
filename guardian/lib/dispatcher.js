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
  const { updateJob, bus, ncp, pendingQueue, cockpitBroadcast, dispatchToMistral, dispatchToDeepseek } = deps;
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

  function _doDispatch(job) {
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

    // §RECONCILED 2026-09-02 — same-day deepseek addition in server.js,
    // added here so wiring this module in doesn't regress it (see
    // provider-routing.js's header for the same note).
    if (job.provider === 'deepseek') {
      updateJob(job.id, { status: 'dispatched', dispatchedAt: Date.now() });
      console.log('[guardian] deepseek job → ollama-bridge :3749');
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
    const sent = ncp.push(job.provider, {
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
    console.log(`[guardian] dispatched ${job.id} → ${job.provider} via NCP (${sent} client${sent === 1 ? '' : 's'})`);
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
