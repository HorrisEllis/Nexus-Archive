'use strict';
// James: "a toggle switch to switch between ollama and guardian." Real gap
// found before building anything new: copilot/lifeline.js's route() already
// accepts an explicit opts.provider override (validated against guardian's
// own live /providers), but copilot/server.js's real POST /bridge/deliver
// handler never passed the caller's own choice through — always let
// lifeline auto-decide. Fixed at that exact gap.
//
// §FIX 2026-09-07 (merge) — this test's own first draft asserted
// `body.provider`, which turned out to be a real, separate bug: body is
// the RAW, still-wrapped {request:{uuid,payload}} object this handler
// receives — provider actually lives at payload.provider (this same
// handler's own top already does the real unwrap for exactly this
// reason). body.provider was always undefined, so the original fix
// never actually worked end to end despite this test passing — caught
// while merging a parallel thread's real toggle-UI work, which sends a
// real, specific provider value that only surfaced the bug once
// something downstream actually depended on receiving it correctly.
// Updated to assert the real, correct field.
//
// Same real, established pattern this test suite already uses for
// copilot/lifeline.js itself (tests/modules/test-lifeline-ask.js) — a
// structural check against the real shipped source, since spinning up
// copilot's full real HTTP server (session store, context assembly, RAG
// checks, guardian reachability) for one isolated behavior is a much
// bigger, riskier undertaking than this file's own convention already
// avoids.
const assert = require('assert');
const path = require('path');
const fs = require('fs');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const SRC = fs.readFileSync(path.join(ROOT, 'copilot/server.js'), 'utf8');
const LIFELINE_SRC = fs.readFileSync(path.join(ROOT, 'copilot/lifeline.js'), 'utf8');

test('T-001', '/bridge/deliver\'s real _lifeline.route() call passes payload.provider through — NOT body.provider, the raw wrapped object', () => {
  const callSiteStart = SRC.indexOf("`${contextText}\\n\\nUSER: ${prompt}\\nNEXUS CO-PILOT: `");
  assert.ok(callSiteStart > -1, 'could not find the real route() call site at all — has it moved or been rewritten?');
  const optsSlice = SRC.slice(callSiteStart, callSiteStart + 400);
  assert.ok(/provider:\s*payload\.provider/.test(optsSlice), `expected provider: payload.provider in the real opts object passed to route(), got: ${optsSlice}`);
  assert.ok(!/provider:\s*body\.provider/.test(optsSlice), 'the old, always-undefined body.provider read must be genuinely gone, not just shadowed');
});

test('T-002', 'an existing caller that never sends payload.provider gets undefined, not a crash or a forced value', () => {
  const callSiteStart = SRC.indexOf("`${contextText}\\n\\nUSER: ${prompt}\\nNEXUS CO-PILOT: `");
  const optsSlice = SRC.slice(callSiteStart, callSiteStart + 400);
  assert.ok(/payload\.provider\s*\|\|\s*undefined/.test(optsSlice), 'expected payload.provider || undefined — an absent provider must stay genuinely absent, not silently become a real value the caller never chose');
});

test('T-003', 'lifeline.route() genuinely already supports an explicit provider override (the real capability this fix reuses, not duplicates)', () => {
  assert.ok(/let\s+ragProvider\s*=\s*opts\.provider/.test(LIFELINE_SRC), 'route() no longer reads opts.provider — the real capability this fix depends on may have changed underneath it');
});

test('T-004', 'lifeline.route() already treats \'auto\' as a real, valid value — the toggle\'s "guardian" option can rely on it rather than guessing a real agent name', () => {
  assert.ok(/'auto'/.test(LIFELINE_SRC), "expected a real 'auto' literal somewhere in lifeline's own provider-resolution logic");
});

// §NEW 2026-09-07 (merge) — the two real, symmetric gaps found while
// merging: neither side of the toggle actually guaranteed staying on
// its chosen backend before this fix.
test('T-005', 'provider:"guardian" has real, explicit handling that skips Ollama entirely, before the normal cascade ever runs', () => {
  const guardianIdx = LIFELINE_SRC.indexOf("if (opts.provider === 'guardian')");
  const ollamaCascadeIdx = LIFELINE_SRC.indexOf('// ── 1. Try Ollama');
  assert.ok(guardianIdx !== -1, 'expected a real, explicit provider:guardian branch');
  assert.ok(guardianIdx < ollamaCascadeIdx, 'the guardian branch must return before Ollama is ever attempted');
});

test('T-006', 'provider:"ollama" has real, explicit handling that never auto-escalates to Guardian on low confidence — honoring the user\'s explicit choice', () => {
  const ollamaExplicitIdx = LIFELINE_SRC.indexOf("if (opts.provider === 'ollama')");
  const ollamaCascadeIdx = LIFELINE_SRC.indexOf('// ── 1. Try Ollama');
  assert.ok(ollamaExplicitIdx !== -1, 'expected a real, explicit provider:ollama branch');
  assert.ok(ollamaExplicitIdx < ollamaCascadeIdx, 'the explicit-ollama branch must return before the normal (escalating) cascade runs');
  const block = LIFELINE_SRC.slice(ollamaExplicitIdx, ollamaExplicitIdx + 700);
  assert.ok(!/_tryGuardian/.test(block), 'the explicit-ollama branch must never call guardian — that is the exact real bug this closes');
});

test('T-007', 'both explicit branches fail honestly (ok:false) rather than silently falling back to the other backend — a silent fallback would recreate the exact "toggle shows one thing, does another" bug', () => {
  const guardianIdx = LIFELINE_SRC.indexOf("if (opts.provider === 'guardian')");
  const guardianBlock = LIFELINE_SRC.slice(guardianIdx, guardianIdx + 1600);
  assert.ok(/ok: false, text: null/.test(guardianBlock));

  const ollamaIdx = LIFELINE_SRC.indexOf("if (opts.provider === 'ollama')");
  const ollamaBlock = LIFELINE_SRC.slice(ollamaIdx, ollamaIdx + 700);
  assert.ok(/ok: false, text: null/.test(ollamaBlock));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
