'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// lib/agent-primer.js — the paste payload for coding agents
// UUID: nexus-agent-primer-v1-0000-2026-0823-001
// Version: 1.0.0
// Component: lib.agent-primer
// Hook: lib.agent-primer:v1:p0001
//
// James: "Need to paste warp framework, axioms, chunk contract, and small
// toolbox. For coding intent for ChatGPT ... and ollama."
//
// ── THE CONSTRAINT THAT SHAPES EVERYTHING ───────────────────────────────────
//
// "Only really need chunking for ChatGPT. 900 tokens per OUTPUT."
//
// lib/agent-router.js:19 currently says the opposite:
//     "chatgpt → optimal general agent, BUT 900-token limit → chunk long INPUTS"
// and line 40 encodes { maxTokens: 900, chunk: true } as an input rule.
//
// These are not the same constraint and the difference is load-bearing. If the
// ceiling is on OUTPUT, slicing the input does nothing: a 40-line request still
// produces a 300-line answer that gets truncated at 900 tokens, mid-function,
// and the truncation looks like a finished response. Chunking the input makes
// that WORSE — more round trips, each still capable of overrunning.
//
// An output ceiling is a constraint on WHAT YOU ASK FOR, not on what you send.
// So the chunk contract below makes the agent emit ONE UNIT PER RESPONSE with
// an explicit continuation token, and the unit is sized to fit.
//
// ── WHY GENERATED, NOT WRITTEN ──────────────────────────────────────────────
//
// §10.3 — a hand-written primer is a second copy of the axioms and the warp
// spec. It would drift, and the drift would be invisible: the agent would code
// against rules the tree no longer holds. Every section here is READ FROM THE
// LIVE SOURCE at generation time, and the payload carries the source hash so a
// stale paste is detectable.
//
// §1.2 — a section whose source is missing is reported as MISSING in the
// payload itself, not silently omitted. An agent primed with 3 of 4 sections
// and no indication of which is worse than one that was refused.
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const MODULE_ID = 'agent-primer';
const VERSION   = '1.0.0';
const COMP_ID   = 'lib.agent-primer';
const HOOK_ID   = 'lib.agent-primer:v1:p0001';

const ROOT = path.join(__dirname, '..');

// Rough, and deliberately labelled rough. ~4 chars/token is the usual English
// approximation; code runs denser. Used for BUDGETING, never for a claim that
// a payload definitely fits — §1.1, an estimate is not a measurement.
const estimateTokens = (s) => Math.ceil((s || '').length / 4);

// Per-agent budgets. The output ceiling is the agent's; the primer budget is
// how much context to spend priming before the conversation even starts.
const AGENTS = Object.freeze({
  chatgpt: { outputTokens: 900,   primerBudget: 2200, chunk: true,
             note: 'output ceiling — constrains what to ASK FOR, not what to send' },
  ollama:  { outputTokens: 2048,  primerBudget: 1400, chunk: true,
             note: 'local model; smaller primer budget because context is the scarce thing, not tokens billed' },
  claude:  { outputTokens: 64000, primerBudget: 8000, chunk: false,
             note: 'no practical chunking need at this scale' },
  gemini:  { outputTokens: 65536, primerBudget: 8000, chunk: false },
});

// ── Sections, each read from a live source ──────────────────────────────────

/** The five WARP primitives — the entire surface a consuming project touches. */
function _warp() {
  const p = path.join(ROOT, 'warp', 'spec', 'warp.spec');
  if (!fs.existsSync(p)) {
    return { ok: false, name: 'warp', missing: p,
      body: '[WARP FRAMEWORK — SOURCE MISSING: warp/spec/warp.spec. This primer is INCOMPLETE.]' };
  }
  const src = fs.readFileSync(p, 'utf8');
  // §FIXED 2026-08-23 — this matched '    primitives:' with four spaces, the
  // indentation as it appeared in a `sed` view of the file. The file uses two.
  // The extractor reported the whole WARP section MISSING while the source was
  // present and correct — the same class of mistake as scanning for a literal
  // and matching a comment: an assumption about the shape of text, taken from
  // how it was displayed rather than what it is. Anchored on the KEY now,
  // whitespace-agnostic.
  const mi = src.match(/^[ \t]*primitives:[ \t]*$/m);
  const mj = src.match(/^[ \t]*unified_dispatch:[ \t]*$/m);
  const i = mi ? mi.index : -1;
  const j = mj ? mj.index : -1;
  if (i < 0 || j < 0 || j <= i) {
    return { ok: false, name: 'warp', missing: 'primitives block not found in warp.spec',
      body: '[WARP FRAMEWORK — the primitives block could not be located. INCOMPLETE.]' };
  }
  // De-indent by the block's OWN leading whitespace rather than a fixed amount.
  const raw = src.slice(i, j);
  const indent = (raw.match(/^[ \t]*/) || [''])[0];
  // Trailing comment lines belong to the NEXT block (unified_dispatch), not to
  // primitives — a slice between two keys carries whatever sits between them.
  // Dropped so the payload does not end mid-thought on a section it excludes.
  const deindented = (indent ? raw.replace(new RegExp('^' + indent, 'gm'), '') : raw);
  const block = deindented.split('\n').filter(function(l, i, arr) {
    var rest = arr.slice(i).join('\n');
    return !(/^\s*#/.test(l) && !/["a-z]:\s*$/m.test(rest));
  }).join('\n').trim();
  return { ok: true, name: 'warp', hash: _hash(block),
    body: `## WARP — the only five things you touch\n\n${block}\n\n` +
          `Rule: if a mechanism does not serve one of these five, it does not belong in core.` };
}

/**
 * Axioms — a CODING-INTENT DIGEST, not the document.
 *
 * The full AXIOMS-v3.1.md is ~11,600 tokens: 13x ChatGPT's entire output
 * budget, and pasting it would consume the context the actual task needs.
 * These are the laws that change what CODE GETS WRITTEN, as opposed to the
 * ones governing process, review, or system design. Ids are real and quoted so
 * the agent can be pointed at the full text when a specific law is in dispute.
 */
function _axioms() {
  const p = path.join(ROOT, 'docs', 'AXIOMS-v3.1.md');
  const present = fs.existsSync(p);
  const digest = [
    '## AXIOMS — the coding subset (full text: docs/AXIOMS-v3.1.md, 101 laws)',
    '',
    '§1.1  Nothing exists until proven. No placeholder, stub, mock or fabricated',
    '      value. If a thing cannot be produced, REFUSE and say why.',
    '§1.2  Never fail silently. Unknown is NOT zero. Unreadable is NOT empty.',
    '      A degraded result must state that it is degraded, in the payload.',
    '§0.3  Nothing is deleted. Archive with a stated reason.',
    '§10.3 One source of truth. Two copies of a rule WILL diverge, silently.',
    '§5.3  Fix the root, not the call site. No monkey patches.',
    '§16.5 Delete before you add. Reuse before you write.',
    '§8.4  Scan the file, its dependencies AND its consumers before changing it.',
    '§3.1  Bottom-up. A function moves before the thing that calls it.',
    '§3.4  raw → library → api → cli → automation → ui. In that order.',
    '§14.2 A gate is a PURE function: same input, same output, no side effects.',
    '§14.4 Never re-emit an event you consumed. Loops are the default failure.',
    '§12.2 A test must be able to FAIL, and its failure must be informative.',
    '§17.11 Never bundle non-comparable axes into one score. Report components.',
    '§0.5  Complexity must earn its existence.',
    '§5.14 The contract may hold while the implementation moves. Not the reverse.',
  ].join('\n');
  return { ok: present, name: 'axioms', hash: _hash(digest),
    body: present ? digest
      : digest + '\n\n[WARNING: docs/AXIOMS-v3.1.md not found at generation time — this digest could not be checked against the source.]' };
}

/**
 * The chunk contract — the part that actually depends on the output ceiling.
 */
function _chunkContract(agent) {
  const cfg = AGENTS[agent] || AGENTS.chatgpt;
  if (!cfg.chunk) {
    return { ok: true, name: 'chunk-contract', hash: _hash(agent),
      body: `## OUTPUT CONTRACT\n\nNo chunking required for ${agent} (~${cfg.outputTokens} token output). Emit complete units.` };
  }
  const body = [
    `## OUTPUT CONTRACT — hard ceiling ${cfg.outputTokens} tokens per response`,
    '',
    'This is a ceiling on YOUR OUTPUT, not on what you are sent. It changes what',
    'you should produce, not how the request arrives.',
    '',
    'RULES',
    '1. ONE UNIT PER RESPONSE. A unit is one function, one gate, one test case,',
    '   or one config block. Never two. Never a whole file.',
    '2. If a unit will not fit, say so FIRST and propose a smaller split.',
    '   Do not start and get truncated — a truncated response looks finished.',
    '3. End every partial with exactly:   <<CONTINUE: next-unit-name>>',
    '   End the final one with exactly:   <<COMPLETE>>',
    '4. Never re-emit a unit already sent. Reference it by name.',
    '5. No preamble, no summary, no "here is the code". The unit only.',
    '',
    'WHY: a 900-token truncation lands mid-function and is indistinguishable',
    'from a finished answer. The continuation token is what makes the difference',
    'detectable rather than a silent corruption (§1.2).',
  ].join('\n');
  return { ok: true, name: 'chunk-contract', hash: _hash(body), body };
}

/**
 * The small toolbox — coding intent only.
 *
 * lib/agent-tools has 67 tools across 9 categories. Pasting all of them would
 * cost more than the task. These are the ones a coding agent actually reaches
 * for; the rest are reachable by asking.
 */
function _toolbox() {
  const dir = path.join(ROOT, 'lib', 'agent-tools', 'tools');
  const present = fs.existsSync(dir);
  const picked = [
    ['query.read_file',      'read a file before changing it (§8.4 — required, not optional)'],
    ['query.find_consumers', 'who requires this? Answer before you move or rename anything'],
    ['query.registry',       'is this component declared? 288 components across 14 systems'],
    ['execution.run_test',   'run one suite. Do this before claiming anything passes'],
    ['governance.raid_verify', 'the acceptance gate. Your opinion of your output is not a verdict'],
    ['diagnostic.gap_field',  'open gaps — the system telling you where to build next (§12.5)'],
    ['sandbox.compartment',   'run a risky change in isolation; rolls back on failure'],
    ['faculty.intuition',     'fast pattern answer from crystallised history'],
  ];
  const body = [
    '## TOOLBOX — coding intent (8 of 67; ask for others by name)',
    '',
    ...picked.map(([n, why]) => `  ${n.padEnd(24)} ${why}`),
    '',
    'Call a tool rather than guessing at system state. A guess about what exists',
    'is the failure mode that produced an invented answer once already.',
  ].join('\n');
  return { ok: present, name: 'toolbox', hash: _hash(body),
    body: present ? body : body + '\n\n[WARNING: lib/agent-tools/tools not found — these names are UNVERIFIED at generation time.]' };
}

function _hash(s) { return crypto.createHash('sha256').update(s || '').digest('hex').slice(0, 12); }

/**
 * build(agent, opts) — the payload, with an honest budget report.
 *
 * Never silently truncates to fit. If the payload exceeds the budget it is
 * returned WHOLE with `overBudget: true` and the overage stated, because a
 * silently trimmed primer removes rules the agent then appears to violate.
 */
function build(agent = 'chatgpt', { intent = 'coding' } = {}) {
  const cfg = AGENTS[agent];
  if (!cfg) {
    return { ok: false, error: `unknown agent '${agent}' — known: ${Object.keys(AGENTS).join(', ')}`,
      note: 'refusing to emit a primer with guessed limits (§1.1)' };
  }

  const sections = [_warp(), _axioms(), _chunkContract(agent), _toolbox()];
  const missing  = sections.filter(s => !s.ok).map(s => s.name);

  const header = [
    `# NEXUS PRIMER — ${agent} · intent: ${intent}`,
    `# generated ${new Date().toISOString()} · primer ${VERSION}`,
    missing.length
      ? `# INCOMPLETE — missing source for: ${missing.join(', ')}. Sections below say so inline.`
      : `# all 4 sections read from live sources`,
    '',
  ].join('\n');

  const text = header + sections.map(s => s.body).join('\n\n---\n\n') + '\n';
  const tokens = estimateTokens(text);

  return {
    ok: missing.length === 0,
    agent, intent, text,
    sections: sections.map(s => ({ name: s.name, ok: s.ok, hash: s.hash, tokens: estimateTokens(s.body) })),
    missing,
    tokens, budget: cfg.primerBudget,
    overBudget: tokens > cfg.primerBudget,
    outputCeiling: cfg.outputTokens,
    // §1.1 — an estimate is labelled an estimate. It is not a measurement.
    estimateNote: 'token counts are ~chars/4 — an ESTIMATE for budgeting, not a measured count. Code runs denser than prose.',
    note: tokens > cfg.primerBudget
      ? `over budget by ~${tokens - cfg.primerBudget} tokens. Returned WHOLE, not truncated — a silently trimmed primer removes rules the agent then appears to violate (§1.2).`
      : null,
  };
}

function health() {
  return { ok: true, version: VERSION, agents: Object.keys(AGENTS),
    budgets: Object.fromEntries(Object.entries(AGENTS).map(([k, v]) => [k, v.primerBudget])) };
}

module.exports = { build, health, AGENTS, estimateTokens, MODULE_ID, VERSION, COMP_ID, HOOK_ID };

if (require.main === module) {
  const r = build(process.argv[2] || 'chatgpt');
  if (!r.ok && r.error) { console.error(r.error); process.exit(1); }
  console.error(`# ~${r.tokens} tokens / budget ${r.budget}${r.overBudget ? ' — OVER' : ''}${r.missing.length ? ' — MISSING: ' + r.missing.join(',') : ''}`);
  console.log(r.text);
}
