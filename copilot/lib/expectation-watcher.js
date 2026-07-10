'use strict';
/**
 * copilot/lib/expectation-watcher.js — gated interaction event listeners
 * UUID: nexus-copilot-expectation-watcher-v1-0000-2026-0707-jamesbrooks-001
 * Version: 1.0.0
 *
 * "Co-pilot tracks errors from expected events and gated interaction
 * event listeners" — this is that tracker.
 *
 * MODEL: a declared EXPECTATION is a pair — a trigger event type and
 * the event type that must follow it within a timeout, plus which key
 * links the two occurrences together (so build A's dispatch doesn't get
 * satisfied by build B's verify). This mirrors Warp's own Gate shape
 * (matches/transform) but for cross-event timing instead of single-event
 * transformation — attached to nexus-bus.js's real EventEmitter
 * (bus.on('*', handler)), not a new bus.
 *
 * On violation (trigger fired, expected follow-up never arrived within
 * timeoutMs, OR an explicit *.error/*.failed event arrived instead):
 * emits 'copilot.error.detected' with a human-readable message — this
 * is the event ui/toast/toast.js subscribes to.
 *
 * §1.2  Nothing silently fails — every unmet expectation becomes an event.
 * §2.3  All state observable — listExpectations()/listPending() for the UI.
 */

const DEFAULT_EXPECTATIONS = [
  {
    id: 'build-node-dispatched-then-verified',
    trigger: 'build.node',
    triggerMatch: (data) => data.status === 'dispatching' || data.status === 'starting',
    expect: 'build.node',
    expectMatch: (data) => data.status === 'complete' || data.status === 'error' || data.status === 'failed',
    linkKey: (data) => data.buildId + ':' + data.node,
    timeoutMs: 120000,
    message: (data) => `Build node "${data.node}" was dispatched but produced no result within 2 minutes (build ${data.buildId}).`,
  },
  {
    id: 'build-started-then-terminal',
    trigger: 'build.started',
    triggerMatch: () => true,
    expect: 'build.*', // terminal check handled specially below (complete|failed|error)
    expectMatch: (data, type) => type === 'build.complete' || type === 'build.failed' || type === 'build.error',
    linkKey: (data) => data.buildId,
    timeoutMs: 600000,
    message: (data) => `Build ${data.buildId} started but never reached a terminal state within 10 minutes.`,
  },
  {
    id: 'chunk-building-then-complete',
    trigger: 'idearium.spec-engine.chunk.queued',
    triggerMatch: () => true,
    expect: 'idearium.spec-engine.chunk.complete',
    expectMatch: () => true,
    linkKey: (data) => data.specUuid + ':' + data.chunkUuid,
    timeoutMs: 300000,
    message: (data) => `Chunk ${data.chunkUuid} was queued to agent "${data.agent}" but never completed within 5 minutes.`,
  },
  {
    // lib/execution-pipeline.js — build stage inside a pipeline run should
    // reach the pipeline's own build-complete marker, not just build.*'s
    // own (already-watched) node-level expectation. Distinct from
    // 'build-started-then-terminal' because a pipeline run's build must
    // resolve before sandbox verify can even start — a pipeline stuck at
    // 'started' with no 'build-complete' for 10 minutes means the build
    // stage itself never finished, which is worth surfacing on its own.
    id: 'pipeline-started-then-build-complete',
    trigger: 'pipeline.started',
    triggerMatch: () => true,
    expect: 'pipeline.*',
    expectMatch: (data, type) => type === 'pipeline.build-complete' || type === 'pipeline.failed',
    linkKey: (data) => data.pipelineId,
    timeoutMs: 600000,
    message: (data) => `Pipeline ${data.pipelineId} started but the build stage never resolved within 10 minutes.`,
  },
  {
    // sandbox verify / compare / promote should always land on a terminal
    // pipeline event once the build stage clears — this is the "did the
    // whole loop actually close" check, separate from any single stage.
    id: 'pipeline-build-complete-then-terminal',
    trigger: 'pipeline.build-complete',
    triggerMatch: () => true,
    expect: 'pipeline.*',
    expectMatch: (data, type) => type === 'pipeline.complete' || type === 'pipeline.failed' || type === 'pipeline.rolled-back',
    linkKey: (data) => data.pipelineId,
    timeoutMs: 300000,
    message: (data) => `Pipeline ${data.pipelineId}'s build finished but verify/compare/promote never reached a terminal state within 5 minutes.`,
  },
];

function createExpectationWatcher(bus, { expectations = DEFAULT_EXPECTATIONS } = {}) {
  if (!bus || typeof bus.on !== 'function' || typeof bus.emit !== 'function') {
    throw new Error('[expectation-watcher] bus must expose on()/emit() (nexus-bus.js shape)');
  }

  // pending: expectationId -> linkKey -> { timer, triggeredAt, triggerData }
  const pending = new Map();
  for (const exp of expectations) pending.set(exp.id, new Map());

  function _clear(expId, key) {
    const m = pending.get(expId);
    const rec = m?.get(key);
    if (rec?.timer) clearTimeout(rec.timer);
    m?.delete(key);
  }

  function _detect(exp, key, triggerData, reason) {
    bus.emit('copilot.error.detected', {
      source: 'expectation-watcher',
      expectationId: exp.id,
      reason, // 'timeout' | 'explicit-failure'
      message: exp.message(triggerData),
      triggerData,
      ts: Date.now(),
    });
  }

  const unsubscribers = [];

  for (const exp of expectations) {
    // Trigger listener
    const triggerHandler = (event) => {
      if (event.type !== exp.trigger) return;
      if (!exp.triggerMatch(event.payload || event.data || {})) return;
      const data = event.payload || event.data || {};
      const key = exp.linkKey(data);
      _clear(exp.id, key); // re-arm if the same trigger fires again

      const timer = setTimeout(() => {
        _detect(exp, key, data, 'timeout');
        _clear(exp.id, key);
      }, exp.timeoutMs);
      // Don't hold the process open just for a watch timer.
      if (typeof timer.unref === 'function') timer.unref();

      pending.get(exp.id).set(key, { timer, triggeredAt: Date.now(), triggerData: data });
    };

    // Expected-followup listener (satisfies or explicitly fails the expectation)
    const expectHandler = (event) => {
      const m = pending.get(exp.id);
      if (!m || !m.size) return;
      // exp.expect may be a concrete type or 'build.*' style — either way
      // expectMatch() does the real check against the actual event type.
      const typeMatches = exp.expect === event.type || exp.expect.endsWith('*');
      if (!typeMatches) return;
      const data = event.payload || event.data || {};
      if (!exp.expectMatch(data, event.type)) return;
      const key = exp.linkKey(data);
      if (!m.has(key)) return; // no matching pending trigger — not this expectation's concern

      const isFailure = event.type.endsWith('.error') || event.type.endsWith('.failed') || data.status === 'error' || data.status === 'failed';
      if (isFailure) _detect(exp, key, { ...m.get(key).triggerData, ...data }, 'explicit-failure');
      _clear(exp.id, key);
    };

    unsubscribers.push(bus.on('*', (event) => { triggerHandler(event); expectHandler(event); }));
  }

  return {
    stop() { unsubscribers.forEach((fn) => { try { fn && fn(); } catch (_) {} }); },
    listExpectations: () => expectations.map((e) => ({ id: e.id, trigger: e.trigger, expect: e.expect, timeoutMs: e.timeoutMs })),
    listPending: () => [...pending.entries()].flatMap(([expId, m]) =>
      [...m.entries()].map(([key, rec]) => ({ expectationId: expId, key, triggeredAt: rec.triggeredAt, ageMs: Date.now() - rec.triggeredAt }))),
  };
}

module.exports = { createExpectationWatcher, DEFAULT_EXPECTATIONS };
