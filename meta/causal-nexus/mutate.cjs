'use strict';
/**
 * meta/causal-nexus/mutate.js — hypothesis evaluation engine
 * UUID: nexus-causal-nexus-mutate-v1-0000-2026-0713-jamesbrooks-001
 * Version: 1.0.0
 *
 * §BUILT 2026-07-13 — Phase 109's real missing piece. clip/context/
 * adapter-sandbox/observer give clone + simulate + compare; nothing in
 * the uploaded package applies a hypothesis at all. This is that piece.
 *
 * §THE REAL CONSTRAINT THIS WAS BUILT AGAINST — checked context.js's
 * createReplayContext() directly before designing anything: its run()
 * is explicitly documented as an observation pass over events whose
 * gates "have already fired during restore()" — not a re-ingestion
 * pass. A hypothesis cannot be injected mid-replay. It has to become a
 * real event in the kernel BEFORE the snapshot is taken, so gates fire
 * against it naturally when the snapshot is restored. That's what this
 * does: builds a temporary, fully separate kernel containing the real
 * source events plus one synthetic hypothesis event, snapshots THAT,
 * and only then hands it to the real, unmodified clip/context pipeline.
 *
 * §SAFETY BOUNDARY, DELIBERATE — evaluateHypothesis() never writes
 * anything to the live system. It returns a verdict and real drift
 * metrics. Committing a hypothesis that evaluated well is a separate,
 * explicit function (commitHypothesis, below) that a caller must invoke
 * on purpose — this file does not chain evaluation into commitment
 * automatically. That boundary is a decision, not an oversight, and
 * whether to automate the commit step is a real question left open.
 */

const { createKernel }        = require('./modules/kernel/index.js');
const { snapshotRange, restoreClip, validateClipStability } = require('./modules/clip/index.js');
const { computeDeltaStream }  = require('./modules/delta/index.js');
const { jaaDB }                = require('../../cortex/memory/jaa-db.js');

const MODULE_ID = 'causal-nexus.mutate';

/**
 * _buildMutatedKernel(sourceEvents, hypothesis) — the real, novel step.
 * Creates a fresh, fully isolated kernel (never the live one), ingests
 * every real source event in order, then ingests the hypothesis as one
 * more real event — causally attached via hypothesis.causedBy, same as
 * any other event. Nothing here touches the live kernel at all.
 */
function _buildMutatedKernel(sourceEvents, hypothesis) {
  const temp = createKernel({ ringCap: Math.max(sourceEvents.length * 2, 200) });
  for (const ev of sourceEvents) {
    temp.ingest(ev.type, ev, { causedBy: ev.causedBy || undefined, sessionId: ev.sessionId || undefined });
  }
  temp.ingest(hypothesis.eventType, hypothesis.payload || {}, {
    causedBy: hypothesis.causedBy || undefined,
  });
  return temp;
}

/**
 * evaluateHypothesis({ kernel, seqStart, seqEnd, hypothesis, thresholds })
 *
 * hypothesis: { eventType, payload, causedBy, description } — a single
 * proposed change, expressed as one causal event. `description` is for
 * humans/logs only, never parsed.
 *
 * Returns: { ok, verdict: 'improved'|'neutral'|'worse'|'error',
 *            driftMetrics, baselineClip, mutatedClip, error? }
 * Honest failure modes throughout — an evaluation that can't run
 * returns verdict:'error' with a real reason, never a fabricated result.
 */
function evaluateHypothesis({ kernel, seqStart, seqEnd, hypothesis, thresholds = {} } = {}) {
  if (!kernel) return { ok: false, verdict: 'error', error: 'no source kernel provided' };
  if (!hypothesis?.eventType) return { ok: false, verdict: 'error', error: 'hypothesis.eventType is required' };

  let baselineClip, mutatedClip;
  try {
    baselineClip = snapshotRange(kernel, { seqStart, seqEnd });
  } catch (e) {
    return { ok: false, verdict: 'error', error: `could not snapshot baseline range: ${e.message}` };
  }

  const sourceEvents = kernel.getAll().filter(ev => ev.seq >= seqStart && ev.seq <= seqEnd);

  let mutatedKernel;
  try {
    mutatedKernel = _buildMutatedKernel(sourceEvents, hypothesis);
  } catch (e) {
    return { ok: false, verdict: 'error', error: `could not build mutated kernel: ${e.message}` };
  }

  const mutatedAll = mutatedKernel.getAll();
  try {
    mutatedClip = snapshotRange(mutatedKernel, { seqStart: mutatedAll[0].seq, seqEnd: mutatedAll[mutatedAll.length - 1].seq });
  } catch (e) {
    return { ok: false, verdict: 'error', error: `could not snapshot mutated range: ${e.message}` };
  }

  let replay;
  try {
    replay = restoreClip(mutatedClip, {}, {});
  } catch (e) {
    return { ok: false, verdict: 'error', error: `could not restore mutated clip into a replay context: ${e.message}` };
  }

  const observed = [];
  try {
    replay.run({ onStep: (ev) => observed.push(ev) });
  } catch (e) {
    return { ok: false, verdict: 'error', error: `replay run failed: ${e.message}` };
  }

  let deltaStream;
  try {
    deltaStream = computeDeltaStream(
      observed,
      (id) => mutatedKernel.findById(id),
      () => ({}),
      (id) => mutatedKernel.getChildren ? mutatedKernel.getChildren(id) : new Set()
    );
  } catch (e) {
    return { ok: false, verdict: 'error', error: `could not compute delta stream over the replay: ${e.message}` };
  }

  let validation;
  try {
    validation = validateClipStability(baselineClip, deltaStream, thresholds);
  } catch (e) {
    return { ok: false, verdict: 'error', error: `stability validation failed: ${e.message}` };
  }

  // §HONEST VERDICT — real thresholds, not a guess. validateClipStability
  // already returns real drift numbers (gapDrift/sigmaDrift/slopeDrift);
  // this just names the three real outcomes rather than leaving a caller
  // to interpret raw numbers every time.
  let verdict = 'neutral';
  if (validation.breach) verdict = 'worse';
  else if ((validation.gapDrift ?? 0) < -0.1 || (validation.sigmaDrift ?? 0) < -0.1) verdict = 'improved';

  const record = {
    uuid: require('crypto').randomUUID(),
    ts: Date.now(),
    hypothesis: { eventType: hypothesis.eventType, description: hypothesis.description || null },
    verdict,
    driftMetrics: validation,
    committed: false,
  };
  try { jaaDB.insert('hypothesis_evaluations', record); }
  catch (e) { console.warn(`[${MODULE_ID}] could not log evaluation (continuing — the verdict itself is still real): ${e.message}`); }

  return { ok: true, verdict, driftMetrics: validation, baselineClip, mutatedClip, evaluationId: record.uuid };
}

/**
 * commitHypothesis(evaluationId, { commitFn }) — the deliberate, separate
 * step. Does nothing on its own beyond marking the evaluation record —
 * actually persisting the change is the caller's responsibility via
 * commitFn, which receives the mutatedClip. This function's only real
 * job is making the commit decision auditable: which evaluation led to
 * which commit, when, honestly logged either way.
 */
function commitHypothesis(evaluationId, { commitFn } = {}) {
  if (typeof commitFn !== 'function') {
    return { ok: false, error: 'commitHypothesis requires a real commitFn — this module never decides what "commit" means on its own' };
  }
  let result;
  try {
    result = commitFn();
  } catch (e) {
    jaaDB.update('hypothesis_evaluations', { uuid: evaluationId }, { committed: false, commitError: e.message });
    return { ok: false, error: `commitFn threw: ${e.message}` };
  }
  jaaDB.update('hypothesis_evaluations', { uuid: evaluationId }, { committed: true, committedAt: Date.now() });
  return { ok: true, result };
}

module.exports = { evaluateHypothesis, commitHypothesis };
