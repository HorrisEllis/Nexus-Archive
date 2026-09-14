'use strict';

/**
 * lib/clearglass-dispatch.js
 *
 * §MCO16 2026-09-13 — James, explicit gates: "Routing signal: explicit
 * executionSurface: 'browser'." / "DOM step language: not yet; prompt-only
 * first." / "Browser unavailable: retry/fail/escalate, never silently fall
 * back."
 *
 * This file owns the PURE decisions cortex/core/raid/contract-intake.js's
 * real executionSurface:'browser' path needs — same real reason MCO11's
 * lib/contract-repo-provision.js exists: the actual cross-process HTTP call
 * (and jaaDB) can't be exercised in a unit test without a live ClearGlass
 * process, but what gets decided and what gets sent CAN be, and should be,
 * tested in isolation from that (§8.6 — reuse the established division of
 * labor, don't invent a new one for the same real problem).
 */

const EXECUTION_SURFACE = Object.freeze({ INTERNAL: 'internal', BROWSER: 'browser' });

/**
 * validateExecutionSurface(value) — refuses an unrecognized value rather
 * than letting it silently fall through to INTERNAL. A typo'd
 * executionSurface is a contract whose submitter explicitly wanted the
 * browser, quietly misrouted to internal-only processing — exactly the
 * "loud, not silent" failure §1.2 requires for something that changes real
 * dispatch behavior. Undefined/null is real and fine (defaults to
 * INTERNAL, the pre-existing behavior) — only a genuinely wrong string is
 * refused.
 */
function validateExecutionSurface(value) {
  if (value === undefined || value === null) return { ok: true, value: EXECUTION_SURFACE.INTERNAL };
  if (!Object.values(EXECUTION_SURFACE).includes(value)) {
    return { ok: false, reason: `executionSurface must be one of ${Object.values(EXECUTION_SURFACE).join(', ')}, got ${JSON.stringify(value)}` };
  }
  return { ok: true, value };
}

/**
 * buildSetActiveBody(compartment, queueRow) — the real POST body for
 * ClearGlass's /compartment/set-active. compartment.id IS the real
 * compartment uuid (compartmentEngine.spawn()'s own id, not a separate
 * value) — asserted here, not re-derived, so a caller passing the wrong
 * object gets an honest refusal instead of a null-keyed ledger row.
 */
function buildSetActiveBody(compartment, queueRow) {
  if (!compartment || !compartment.id) {
    return { ok: false, reason: 'no real compartment.id — refusing to build a set-active body with a fabricated key' };
  }
  if (!queueRow || !queueRow.uuid) {
    return { ok: false, reason: 'no real queueRow.uuid — refusing to build a set-active body with a fabricated queueId' };
  }
  return { ok: true, body: { compartmentUuid: compartment.id, queueId: queueRow.uuid } };
}

/**
 * buildRouteBody(queueRow) — the real POST body for ClearGlass's
 * /agent-mesh/route. §GATE 2026-09-13 — prompt-only: no domSteps field
 * exists yet (query/mutate step-list language is real, named, NOT built —
 * see contract-intake.js's own header note on _clearGlassExecutor).
 * preferAgent is omitted (not sent as null/empty) when queueRow has no
 * real forAgent, matching /agent-mesh/route's own real destructure
 * ({ prompt, preferAgent, fallbackOrder } = parsed) — an explicit null
 * there is not the same real absence an omitted key is.
 */
function buildRouteBody(queueRow) {
  if (!queueRow || typeof queueRow.contract?.content !== 'string' || !queueRow.contract.content.trim()) {
    return { ok: false, reason: 'no real, non-empty queueRow.contract.content to send as a prompt' };
  }
  const body = { prompt: queueRow.contract.content };
  if (queueRow.forAgent) body.preferAgent = queueRow.forAgent;
  return { ok: true, body };
}

/**
 * extractRouteText(parsedResponse) — real, honest extraction. Two real
 * response shapes checked (mesh.route()'s own real result may key its text
 * either way depending on which real path answered — guardian-dispatch vs
 * this mesh's own send()) — neither is fabricated over the other; null
 * when NEITHER is present, so the caller throws instead of treating an
 * empty response as a real answer.
 */
function extractRouteText(parsedResponse) {
  if (!parsedResponse) return null;
  if (typeof parsedResponse.text === 'string' && parsedResponse.text.trim()) return parsedResponse.text;
  if (typeof parsedResponse.response === 'string' && parsedResponse.response.trim()) return parsedResponse.response;
  return null;
}

/**
 * validateDomStep(step, fallbackProviderId) — §MCO16c 2026-09-13. James:
 * "finish the rest of it" — the DOM step-list language deliberately NOT
 * built in the first MCO16 pass. A contract.domSteps entry describes one
 * real page interaction: {action:'query'|'mutate', providerId?, query?,
 * mutation?, cgId?, selector?}. providerId defaults to the contract's own
 * forAgent (fallbackProviderId) when the step doesn't name one — a step
 * naming a DIFFERENT real provider than the contract's forAgent is real
 * and allowed (a contract can orchestrate more than one tab), just not
 * fabricated when omitted.
 */
function validateDomStep(step, fallbackProviderId) {
  if (!step || typeof step !== 'object') return { ok: false, reason: 'domStep must be a real object' };
  if (step.action !== 'query' && step.action !== 'mutate') {
    return { ok: false, reason: `domStep.action must be "query" or "mutate", got ${JSON.stringify(step.action)}` };
  }
  const providerId = step.providerId || fallbackProviderId;
  if (!providerId) return { ok: false, reason: 'domStep has no providerId and the contract has no real forAgent to fall back to' };
  if (step.action === 'mutate') {
    if (!step.mutation || typeof step.mutation !== 'object' || Array.isArray(step.mutation)) {
      return { ok: false, reason: 'a mutate domStep requires a real, non-array mutation object' };
    }
    if (!step.cgId && !step.selector) {
      return { ok: false, reason: 'a mutate domStep requires a real cgId or selector — refusing to guess a target element' };
    }
  }
  return { ok: true, providerId };
}

/**
 * buildDomStepRequest(step, fallbackProviderId) — the real POST body +
 * path for ClearGlass's /dom/query or /dom/mutate, matching those routes'
 * own real destructure exactly (main/index.js).
 */
function buildDomStepRequest(step, fallbackProviderId) {
  const check = validateDomStep(step, fallbackProviderId);
  if (!check.ok) return check;
  if (step.action === 'query') {
    return { ok: true, path: '/dom/query', body: { providerId: check.providerId, query: step.selector || step.query || undefined } };
  }
  return { ok: true, path: '/dom/mutate', body: { providerId: check.providerId, cgId: step.cgId || undefined, selector: step.selector || undefined, mutation: step.mutation } };
}

/**
 * domStepResultFailed(result) — real, honest failure detection for a page-
 * level result (as opposed to an HTTP-level failure, which
 * _clearGlassRequest already throws on). ProviderHost's own real shapes
 * use {ok:false, reason} (queryDom/mutateDom's own no-live-window/no-mesh
 * paths) or the page-side __cgDomMesh.mutate()'s own {error:'...'}
 * (element not found) — both are checked, neither invented.
 */
function domStepResultFailed(result) {
  if (!result) return true;
  if (result.ok === false) return true;
  if (typeof result.error === 'string' && result.error) return true;
  return false;
}

module.exports = { EXECUTION_SURFACE, validateExecutionSurface, buildSetActiveBody, buildRouteBody, extractRouteText, validateDomStep, buildDomStepRequest, domStepResultFailed };
