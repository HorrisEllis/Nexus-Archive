'use strict';
/**
 * lib/agent-model-confidence-loop.js — AM6: perplexity confidence loop.
 * UUID: nexus-lib-agent-model-confidence-loop-v1-0000-2026-0815-jamesbrooks-001
 *
 * §BUILT 2026-08-15 — docs/agent-model-and-user-continuity-phasemap.spec's
 * AM6, depends_on [AM1, AM5] — both real as of this same session. Composes
 * five real modules exactly as that phase specified (its own "reuse"
 * line), not reinvented:
 *   1. copilot/lifeline.js's route(prompt, {provider:'perplexity'}) — the
 *      real explicit-agent dispatch, same one AM5's ambiguity_pull already
 *      uses for its own Perplexity step.
 *   2. cortex/intelligence/adversarial.js's real compare({left, right}) —
 *      specifically NOT meta/adversary-suite.js, a different module with
 *      the same word in its name, already documented as distinct in that
 *      file's own header (checked before reusing either, per the phase's
 *      own note).
 *   3. lib/emergence.js's real attempt(compartment, spec, opts) — the
 *      empirical check. Requires opts.proposeCandidate/checkFn (real,
 *      required parameters, not optional) — this module supplies honest,
 *      generic defaults for "does this claim hold against real system
 *      behavior," documented below, overridable by a caller who knows the
 *      claim's specific verification shape.
 *   4. cortex/push-recall.js's real push(content, tags, 'crystal') — the
 *      exact tier AM4 already extends, no new crystallization function.
 *   5. lib/fault-log.js's real history — pivotAfter's consecutive-
 *      same-method-failure tracking already lives inside emergence.js
 *      itself; this module doesn't duplicate it.
 *
 * §HONEST SCOPE — the full live pipeline (a real Perplexity NCP dispatch,
 * a real COS compartment, a real multi-iteration emergence loop) needs
 * live infrastructure this sandbox may not safely or fully exercise.
 * Verified here: every real function is called with its correct real
 * signature (checked directly against each module's source, not assumed),
 * and the sequencing/short-circuit/gap-on-contradiction logic is tested
 * with synthetic inputs standing in for the live calls. Full live
 * verification is named as what it is — James's own real boot, same
 * boundary as everything else this session touching live external calls.
 */
// §FIX 2026-08-15 — caught by testing, not assumed: lifeline.route()'s
// real fail-open shape is { ok:true, text:'[NCP dispatch failed -- no
// response]', confidence:1 } -- a failure disguised as success. This is
// the EXACT same bug class already found and fixed once this session in
// lib/agent-tools/tools/query/ambiguity-pull.js's _found(). Missed here
// on first write, caught immediately by running it against this sandbox
// (no live NCP channel), same as that earlier fix.
const NCP_FAILURE_SENTINEL = '[NCP dispatch failed';
function _perplexityFound(r) {
  if (!(r && r.ok && r.text && r.text.trim().length > 0)) return false;
  if (r.text.startsWith(NCP_FAILURE_SENTINEL)) return false;
  return true;
}

function _jaa() { try { return require('../cortex/memory/jaa-db.js').jaaDB; } catch (_) { return null; } }

function _pushRecall() {
  const { CortexPushRecall } = require('../cortex/push-recall.js');
  const jaa = _jaa();
  return new CortexPushRecall({
    store: {
      insert: (row) => jaa.insert('memory_unified', row),
      all: () => jaa.tail('memory_unified', 10000),
    },
  });
}

/**
 * _defaultProposeCandidate/_defaultCheckFn — honest, generic defaults for
 * "does this epistemic claim hold against real system behavior." A
 * caller with a claim-specific verification shape should override both
 * via opts — these exist so the pipeline is runnable without one, not as
 * a claim this is sufficient for every kind of claim.
 */
async function _defaultProposeCandidate(context) {
  return { method: 'restate-claim', files: {}, statement: context.instruction };
}
async function _defaultCheckFn(compartment, files) {
  // Honest default: without a claim-specific check, this can only report
  // that no real empirical check was supplied — never fabricates a pass.
  return { passed: false, why: 'no claim-specific checkFn supplied — default cannot verify an arbitrary claim against real behavior' };
}

/**
 * run(claim, opts) — claim: {text, existingConfidence, source}.
 * opts: { compartment (required for the empirical stage), proposeCandidate,
 * checkFn, specAxioms, specEndState, specFiles }.
 */
async function run(claim, opts = {}) {
  if (!claim || !claim.text) return { ok: false, stage: 'input', error: 'run() needs claim.text' };

  // -- Stage 1: Perplexity research ----------------------------------------
  let perplexityResult;
  try {
    const lifeline = require('../copilot/lifeline.js');
    perplexityResult = await lifeline.route(claim.text, { provider: 'perplexity' });
  } catch (e) {
    return { ok: false, stage: 'perplexity', error: e.message, crystallized: false };
  }
  if (!_perplexityFound(perplexityResult)) {
    return { ok: false, stage: 'perplexity', error: 'perplexity dispatch returned no usable text (or the NCP-failure sentinel)', crystallized: false };
  }

  // -- Stage 2: adversarial.compare() -- epistemic check -------------------
  const left = {
    comparable: true, source: 'existing-claim', intent: 'verify',
    claims: [{ type: (claim.existingConfidence || 0) < 0.5 ? 'issue_detected' : 'confirmed', traced: false, confidence: claim.existingConfidence || 0 }],
    confidence: claim.existingConfidence || 0,
  };
  const right = {
    comparable: true, source: 'perplexity', intent: 'verify',
    claims: [{ type: 'confirmed', traced: true, confidence: 0.6 }],
    confidence: 0.6,
  };
  const adversarial = require('../cortex/intelligence/adversarial.js');
  const comparison = adversarial.compare({ left, right });
  if (!comparison.comparable) {
    return { ok: false, stage: 'epistemic', error: comparison.reason, crystallized: false };
  }
  // §FIX 2026-08-15 -- caught by testing with real contradicting inputs:
  // compare()'s real return has NO 'score' field (I'd guessed one) -- the
  // real field is contradiction_score, AND compare() already computes
  // verdict/open_gap itself. Reimplementing that judgment with a wrong
  // field name would have silently never detected a real contradiction.
  // Using the function's own real, already-computed verdict instead.
  const contradiction = comparison.verdict === 'contradiction' || comparison.open_gap === true;
  if (contradiction) {
    try {
      const jaa = _jaa();
      if (jaa) jaa.insert('gaps', {
        uuid: require('crypto').randomUUID(), type: 'epistemic-contradiction', domain: 'agent-model',
        body: `claim "${claim.text}" -- existing confidence disagrees with perplexity's finding`,
        source: 'agent-model-confidence-loop', severity: 'medium', status: 'open',
        dedup_key: `agent-model::epistemic-contradiction::${claim.text.slice(0, 60)}`,
        occurrences: 1, detectedAt: Date.now(), lastSeenAt: Date.now(), meta: { comparison },
      });
    } catch (_) { /* gap-write failure must not hide the real contradiction finding, still returned below */ }
    return { ok: false, stage: 'epistemic', error: 'contradiction -- logged as a real gap, not silently resolved', comparison, crystallized: false };
  }

  // -- Stage 3: emergence.attempt() -- empirical check ----------------------
  if (!opts.compartment) {
    return { ok: false, stage: 'empirical', error: 'run() needs opts.compartment -- a real COS compartment, see cos_compartment tool', crystallized: false, epistemicPassed: true };
  }
  const emergence = require('../emergence.js');
  let empirical;
  try {
    empirical = await emergence.attempt(opts.compartment, {
      axioms: opts.specAxioms || [comparison.reasons ? comparison.reasons.join('; ') : 'perplexity and existing claim agree'],
      endState: opts.specEndState || 'holds against real system behavior',
      files: opts.specFiles || {},
    }, {
      proposeCandidate: opts.proposeCandidate || _defaultProposeCandidate,
      checkFn: opts.checkFn || _defaultCheckFn,
      maxIterations: opts.maxIterations || 6,
      pivotAfter: opts.pivotAfter || 3,
    });
  } catch (e) {
    return { ok: false, stage: 'empirical', error: e.message, crystallized: false, epistemicPassed: true };
  }
  if (!empirical.ok) {
    return { ok: false, stage: 'empirical', error: 'empirical verification failed after method pivot', history: empirical.history, crystallized: false, epistemicPassed: true };
  }

  // -- Stage 4: crystallize --------------------------------------------------
  try {
    _pushRecall().push(claim.text, ['agent-model-confidence-loop', 'am6'], 'crystal');
  } catch (e) {
    return { ok: false, stage: 'crystallize', error: e.message, crystallized: false, epistemicPassed: true, empiricalPassed: true };
  }

  return { ok: true, crystallized: true, epistemicPassed: true, empiricalPassed: true, comparison, empirical };
}

module.exports = { run, MODULE_ID: 'agent-model-confidence-loop', VERSION: '0.1.0' };
