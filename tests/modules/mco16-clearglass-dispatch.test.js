'use strict';

/**
 * tests/modules/mco16-clearglass-dispatch.test.js
 *
 * §MCO16 2026-09-13 — real tests for lib/clearglass-dispatch.js. The
 * actual cross-process HTTP calls (POST /compartment/set-active,
 * POST /agent-mesh/route against a live ClearGlass process) need a real
 * running ClearGlass — not available in this environment — so, same
 * discipline MCO10's ledger tests and MCO11's repo-provision tests already
 * used, this file tests the real, pure decisions in isolation: what gets
 * validated, and what gets sent.
 */

const assert = require('assert');
const {
  EXECUTION_SURFACE,
  validateExecutionSurface,
  buildSetActiveBody,
  buildRouteBody,
  extractRouteText,
  validateDomStep,
  buildDomStepRequest,
  domStepResultFailed,
} = require('../../lib/clearglass-dispatch.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

// ── validateExecutionSurface ──────────────────────────────────────────────

test('MCO16-001: undefined executionSurface defaults to a real INTERNAL, not fabricated as browser', () => {
  const r = validateExecutionSurface(undefined);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.value, EXECUTION_SURFACE.INTERNAL);
});

test('MCO16-002: null executionSurface also defaults to INTERNAL', () => {
  const r = validateExecutionSurface(null);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.value, EXECUTION_SURFACE.INTERNAL);
});

test('MCO16-003: an explicit "browser" is accepted and passed through unchanged', () => {
  const r = validateExecutionSurface('browser');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.value, EXECUTION_SURFACE.BROWSER);
});

test('MCO16-004: an explicit "internal" is accepted and passed through unchanged', () => {
  const r = validateExecutionSurface('internal');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.value, EXECUTION_SURFACE.INTERNAL);
});

test('MCO16-005: a typo\'d value is refused, not silently defaulted to internal', () => {
  const r = validateExecutionSurface('browsr');
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('browsr'));
  assert.ok(r.reason.includes('internal'));
  assert.ok(r.reason.includes('browser'));
});

// ── buildSetActiveBody ────────────────────────────────────────────────────

test('MCO16-006: a real compartment + queueRow produce the real, exact set-active body', () => {
  const r = buildSetActiveBody({ id: 'comp-real-1' }, { uuid: 'q-real-1' });
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.body, { compartmentUuid: 'comp-real-1', queueId: 'q-real-1' });
});

test('MCO16-007: no compartment.id is refused, never fabricated as a null-keyed body', () => {
  const r = buildSetActiveBody({}, { uuid: 'q-1' });
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('compartment.id'));
});

test('MCO16-008: a missing compartment object entirely is refused the same way', () => {
  const r = buildSetActiveBody(null, { uuid: 'q-1' });
  assert.strictEqual(r.ok, false);
});

test('MCO16-009: no queueRow.uuid is refused, never fabricated as a null queueId', () => {
  const r = buildSetActiveBody({ id: 'comp-1' }, {});
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('queueRow.uuid'));
});

// ── buildRouteBody ─────────────────────────────────────────────────────────

test('MCO16-010: a real contract with content and forAgent produces prompt + preferAgent', () => {
  const r = buildRouteBody({ forAgent: 'claude', contract: { content: 'do the real thing' } });
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.body, { prompt: 'do the real thing', preferAgent: 'claude' });
});

test('MCO16-011: no forAgent means preferAgent is OMITTED, not sent as null/undefined', () => {
  const r = buildRouteBody({ contract: { content: 'do the thing' } });
  assert.strictEqual(r.ok, true);
  assert.strictEqual('preferAgent' in r.body, false);
  assert.strictEqual(r.body.prompt, 'do the thing');
});

test('MCO16-012: empty content is refused, not sent as an empty prompt', () => {
  const r = buildRouteBody({ contract: { content: '   ' } });
  assert.strictEqual(r.ok, false);
});

test('MCO16-013: a missing contract object entirely is refused, not thrown', () => {
  const r = buildRouteBody({ forAgent: 'claude' });
  assert.strictEqual(r.ok, false);
});

test('MCO16-014: a null queueRow is refused, not thrown', () => {
  const r = buildRouteBody(null);
  assert.strictEqual(r.ok, false);
});

// ── extractRouteText ───────────────────────────────────────────────────────

test('MCO16-015: a real .text field is extracted', () => {
  assert.strictEqual(extractRouteText({ text: 'real answer' }), 'real answer');
});

test('MCO16-016: a real .response field is extracted when .text is absent', () => {
  assert.strictEqual(extractRouteText({ response: 'real answer 2' }), 'real answer 2');
});

test('MCO16-017: neither field present returns null, never fabricated text', () => {
  assert.strictEqual(extractRouteText({ ok: true }), null);
});

test('MCO16-018: a whitespace-only text field is treated as no real text', () => {
  assert.strictEqual(extractRouteText({ text: '   ' }), null);
});

test('MCO16-019: a null response is handled without throwing', () => {
  assert.strictEqual(extractRouteText(null), null);
});

// ── validateDomStep / buildDomStepRequest (§MCO16c) ────────────────────────

test('MCO16-020: a real query step with a fallback providerId builds a real /dom/query body', () => {
  const r = buildDomStepRequest({ action: 'query', selector: '.foo' }, 'claude');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.path, '/dom/query');
  assert.deepStrictEqual(r.body, { providerId: 'claude', query: '.foo' });
});

test('MCO16-021: a query step with no selector requests the real full tree (query undefined, not fabricated)', () => {
  const r = buildDomStepRequest({ action: 'query' }, 'chatgpt');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.body.query, undefined);
});

test('MCO16-022: a step naming its own providerId overrides the contract-level fallback', () => {
  const r = buildDomStepRequest({ action: 'query', providerId: 'gemini' }, 'claude');
  assert.strictEqual(r.body.providerId, 'gemini');
});

test('MCO16-023: no providerId anywhere (step or fallback) is refused, never defaulted', () => {
  const r = buildDomStepRequest({ action: 'query' }, null);
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('providerId'));
});

test('MCO16-024: an unrecognized action is refused', () => {
  const r = buildDomStepRequest({ action: 'click' }, 'claude');
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('action'));
});

test('MCO16-025: a real mutate step with cgId + mutation builds a real /dom/mutate body', () => {
  const r = buildDomStepRequest({ action: 'mutate', cgId: 'cg-1', mutation: { text: 'hi' } }, 'claude');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.path, '/dom/mutate');
  assert.deepStrictEqual(r.body, { providerId: 'claude', cgId: 'cg-1', selector: undefined, mutation: { text: 'hi' } });
});

test('MCO16-026: a mutate step with a selector instead of cgId is also accepted', () => {
  const r = buildDomStepRequest({ action: 'mutate', selector: '#x', mutation: { value: '1' } }, 'claude');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.body.selector, '#x');
});

test('MCO16-027: a mutate step with neither cgId nor selector is refused, not guessed', () => {
  const r = validateDomStep({ action: 'mutate', mutation: { text: 'hi' } }, 'claude');
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('cgId or selector'));
});

test('MCO16-028: a mutate step with no mutation object is refused', () => {
  const r = validateDomStep({ action: 'mutate', cgId: 'cg-1' }, 'claude');
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('mutation'));
});

test('MCO16-029: a mutate step whose mutation is an array (not a real object) is refused', () => {
  const r = validateDomStep({ action: 'mutate', cgId: 'cg-1', mutation: [] }, 'claude');
  assert.strictEqual(r.ok, false);
});

test('MCO16-030: a null step is refused, not thrown', () => {
  const r = validateDomStep(null, 'claude');
  assert.strictEqual(r.ok, false);
});

// ── domStepResultFailed ─────────────────────────────────────────────────────

test('MCO16-031: {ok:false, reason} (ProviderHost\'s own shape) is a real failure', () => {
  assert.strictEqual(domStepResultFailed({ ok: false, reason: 'no live window' }), true);
});

test('MCO16-032: {error:"..."} (the page-side mutate() shape) is a real failure', () => {
  assert.strictEqual(domStepResultFailed({ error: 'Element not found' }), true);
});

test('MCO16-033: a real successful result (no ok:false, no error) is not a failure', () => {
  assert.strictEqual(domStepResultFailed({ ok: true, nodeId: 'cg-1' }), false);
});

test('MCO16-034: a real query tree result (no ok/error keys at all) is not a failure', () => {
  assert.strictEqual(domStepResultFailed({ tag: 'div', children: [] }), false);
});

test('MCO16-035: a null/undefined result IS a real failure — never treated as success', () => {
  assert.strictEqual(domStepResultFailed(null), true);
  assert.strictEqual(domStepResultFailed(undefined), true);
});

console.log(`\n  mco16-clearglass-dispatch: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
