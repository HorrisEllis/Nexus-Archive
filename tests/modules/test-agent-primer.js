'use strict';
// tests/modules/test-agent-primer.js
// Load-bearing: AP-004 (never silently truncates) and AP-006 (a missing source
// is stated IN the payload, not omitted).
const assert = require('assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const P = require(path.join(ROOT, 'lib', 'agent-primer'));

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}

console.log('\n\u2550\u2550 AGENT PRIMER \u2014 the paste payload \u2550\u2550\n');

test('AP-001', 'all four sections are present and read from LIVE sources', () => {
  const r = P.build('chatgpt');
  assert.deepStrictEqual(r.sections.map(s => s.name).sort(),
    ['axioms', 'chunk-contract', 'toolbox', 'warp']);
  assert.deepStrictEqual(r.missing, [], `missing sources: ${r.missing.join(', ')}`);
  assert.strictEqual(r.ok, true);
});

test('AP-002', 'it fits the budget \u2014 and is far smaller than pasting the axioms', () => {
  const r = P.build('chatgpt');
  assert.ok(!r.overBudget, `~${r.tokens} over budget ${r.budget}`);
  const full = fs.readFileSync(path.join(ROOT, 'docs', 'AXIOMS-v3.1.md'), 'utf8');
  const fullTokens = P.estimateTokens(full);
  assert.ok(r.tokens < fullTokens / 5,
    `primer ~${r.tokens} vs axioms alone ~${fullTokens} \u2014 the digest must be dramatically smaller or it defeats its purpose`);
});

test('AP-003', 'THE CONSTRAINT: the contract targets OUTPUT, not input', () => {
  const r = P.build('chatgpt');
  assert.ok(/ceiling on YOUR OUTPUT, not on what you are sent/.test(r.text),
    'lib/agent-router.js:19 says "chunk long INPUTS" \u2014 the opposite constraint. ' +
    'If the limit is on output, slicing the input does nothing.');
  assert.ok(/ONE UNIT PER RESPONSE/.test(r.text));
  assert.strictEqual(r.outputCeiling, 900);
});

test('AP-004', 'OVER BUDGET returns the payload WHOLE, never truncated', () => {
  const r = P.build('ollama');
  assert.ok(r.text.includes('WARP') && r.text.includes('AXIOMS') &&
            r.text.includes('OUTPUT CONTRACT') && r.text.includes('TOOLBOX'),
    'every section must survive regardless of budget');
  if (r.overBudget) {
    assert.ok(/Returned WHOLE, not truncated/.test(r.note),
      'a silently trimmed primer removes rules the agent then appears to violate');
  }
});

test('AP-005', 'continuation tokens make truncation DETECTABLE', () => {
  const r = P.build('chatgpt');
  assert.ok(/<<CONTINUE: next-unit-name>>/.test(r.text));
  assert.ok(/<<COMPLETE>>/.test(r.text));
  assert.ok(/looks finished/.test(r.text),
    'the reason must be stated \u2014 a 900-token truncation is indistinguishable from a finished answer');
});

test('AP-006', 'a MISSING source is stated IN the payload, not omitted', () => {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'agent-primer.js'), 'utf8');
  assert.ok(/SOURCE MISSING/.test(src) && /INCOMPLETE/.test(src),
    'an agent primed with 3 of 4 sections and no indication of which is worse than one refused');
});

test('AP-007', '\u00a71.1 an unknown agent is REFUSED, not given guessed limits', () => {
  const r = P.build('gpt-9');
  assert.strictEqual(r.ok, false);
  assert.ok(/unknown agent/.test(r.error));
  assert.ok(/guessed limits/.test(r.note));
});

test('AP-008', 'claude/gemini get NO chunk contract \u2014 the constraint is chatgpt\u2019s', () => {
  assert.ok(!/ONE UNIT PER RESPONSE/.test(P.build('claude').text),
    'James: "Only really need chunking for ChatGPT"');
  assert.ok(/No chunking required/.test(P.build('claude').text));
  assert.ok(/ONE UNIT PER RESPONSE/.test(P.build('ollama').text), 'ollama chunks too');
});

test('AP-009', 'the WARP block is extracted whole, and stops before the next section', () => {
  const r = P.build('chatgpt');
  const warp = r.text.split('---')[0];
  for (const prim of ['Event:', 'Gate:', 'Stream:', 'StreamLog:', 'Axiom:']) {
    assert.ok(warp.includes(prim), `primitive ${prim} missing from the WARP block`);
  }
  assert.ok(!/unified_dispatch|research pass/.test(warp),
    'the slice leaked the NEXT section\u2019s lead-in \u2014 the payload must not end mid-thought on a section it excludes');
});

test('AP-010', 'the extractor anchors on the KEY, not on indentation', () => {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'agent-primer.js'), 'utf8');
  const code = src.replace(/(?<!:)\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/indexOf\('    primitives:'\)/.test(code),
    'a fixed-indent match reported WARP missing while the source was present \u2014 warp.spec uses 2 spaces, not 4');
  assert.ok(/\^\[ \\t\]\*primitives:/.test(code), 'must match whitespace-agnostically');
});

test('AP-011', 'token counts are labelled ESTIMATES, not measurements', () => {
  const r = P.build('chatgpt');
  assert.ok(/ESTIMATE/.test(r.estimateNote), '\u00a71.1 \u2014 chars/4 is not a measured token count');
  assert.ok(/denser/.test(r.estimateNote), 'and code runs denser than prose');
});

test('AP-012', 'sections carry a source hash so a stale paste is detectable', () => {
  const r = P.build('chatgpt');
  for (const s of r.sections) assert.ok(s.hash && s.hash.length === 12, `${s.name} has no hash`);
});


test('AP-013', 'ROOT FIXED: agent-router no longer says "chunk long inputs"', () => {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'agent-router.js'), 'utf8');
  assert.ok(!/chunk long inputs/.test(src),
    'the router documented the constraint BACKWARDS — fixed at the root, not compensated for in the primer (§5.3)');
  assert.ok(/outputTokens: 900/.test(src),
    'the key must read as an OUTPUT limit so it cannot be misread as licence to slice a prompt');
  assert.ok(/nothing reads THIS TABLE/.test(src),
    '§1.1 — that this table\'s keys are unread must be STATED, not left for the next reader');
  assert.ok(/different claims and only one of them is true/.test(src),
    'and the claim must be PRECISE: nexus-map.js does read constraints.maxTokens, but from ' +
    'agent-system/contracts.js where it correctly means context budget. "Nothing reads this" ' +
    'and "nothing reads a key of this name" are different claims.');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
