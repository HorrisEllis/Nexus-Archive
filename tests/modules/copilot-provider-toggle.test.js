'use strict';
// James: "a toggle switch to switch between ollama and guardian." Real gap
// found before building anything new: copilot/lifeline.js's route() already
// accepts an explicit opts.provider override (validated against guardian's
// own live /providers), but copilot/server.js's real POST /api/prompt
// handler never passed the caller's own choice through — always let
// lifeline auto-decide. Fixed at that exact gap.
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

test('T-001', '/api/prompt\'s real _lifeline.route() call passes body.provider through', () => {
  const callSiteStart = SRC.indexOf("`${contextText}\\n\\nUSER: ${prompt}\\nNEXUS CO-PILOT: `");
  assert.ok(callSiteStart > -1, 'could not find the real route() call site at all — has it moved or been rewritten?');
  const optsSlice = SRC.slice(callSiteStart, callSiteStart + 400);
  assert.ok(/provider:\s*body\.provider/.test(optsSlice), `expected provider: body.provider in the real opts object passed to route(), got: ${optsSlice}`);
});

test('T-002', 'an existing caller that never sends body.provider gets undefined, not a crash or a forced value', () => {
  const callSiteStart = SRC.indexOf("`${contextText}\\n\\nUSER: ${prompt}\\nNEXUS CO-PILOT: `");
  const optsSlice = SRC.slice(callSiteStart, callSiteStart + 400);
  assert.ok(/body\.provider\s*\|\|\s*undefined/.test(optsSlice), 'expected body.provider || undefined — an absent provider must stay genuinely absent, not silently become a real value the caller never chose');
});

test('T-003', 'lifeline.route() genuinely already supports an explicit provider override (the real capability this fix reuses, not duplicates)', () => {
  assert.ok(/let\s+ragProvider\s*=\s*opts\.provider/.test(LIFELINE_SRC), 'route() no longer reads opts.provider — the real capability this fix depends on may have changed underneath it');
});

test('T-004', 'lifeline.route() already treats \'auto\' as a real, valid value — the toggle\'s "guardian" option can rely on it rather than guessing a real agent name', () => {
  assert.ok(/'auto'/.test(LIFELINE_SRC), "expected a real 'auto' literal somewhere in lifeline's own provider-resolution logic");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
