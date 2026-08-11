'use strict';
/**
 * lib/agent-tools/tool-guide.js — CA2 of the awareness/routing phasemap
 * UUID: nexus-agent-tools-guide-v1-0000-2026-0730-001
 *
 * §PHASEMAP CA2 (docs/copilot-awareness-routing-phasemap.spec). Tool schemas
 * already carry name + description (WHAT a tool does). This adds the operational
 * knowledge they DON'T: edge cases, how-to-use, and when to PREFER one tool over
 * another — so co-pilot picks the right tool instead of guessing or escalating.
 * §8.6 — built on the existing registry; the guide is keyed by tool name and
 * only augments. §12.5 — each note carries a version so tool-behavior drift from
 * its note is detectable (drift accounting, per the phasemap).
 *
 * A note is intentionally short: the ONE thing a model needs to use the tool
 * well that the description doesn't say.
 */

const GUIDE_VERSION = '1.0.0';

// tool name → { use, edge, prefer }
const NOTES = {
  // §2026-08-09 — the three tools added this session. CA2 requires FULL
  // coverage and test-tool-guide.js T-001 enforces it; it caught these three
  // missing, which is the guide working.
  propose_idea:    { use: "Propose an improvement to NEXUS, yourself, or the user process — it lands in idearium tagged with its provenance.", edge: "Evidence is MANDATORY and must name where a reviewer can check it. You cannot accept your own proposal; that is refused in code.", prefer: "Propose when you have observed something specific. A proposal without evidence is a wish, and a queue of wishes stops being read." },
  forge_tool:      { use: 'Make your own tool: a name, a JSON-schema, and steps binding to a capability, lens, or existing tool.', edge: 'A forged tool is DATA, not code — it can only package what you could already do. Every step is verified BEFORE the tool exists; an unserved capability is refused with the step number.', prefer: 'Read action "schema" first. Forge when you find yourself making the same 2-3 calls repeatedly, not to reach something new.' },
  query_movement:  { use: 'All movement for one system: process, events, ledgers, changes, gaps, sigma, friction, drift, file drift, errors.', edge: 'blind[] comes FIRST in the reply — a source that could not be read is named, never shown as zero. Read it before any number.', prefer: 'Use instead of diagnose when you want WHAT a system is doing over time, not just whether it is up.' },
  parse_lenses:    { use: 'Read one input through five independent lenses and contrast them.', edge: 'A lens can return UNAVAILABLE (e.g. axioms, whose table is empty) — that is not a clean read. Check coverage before trusting a CLEAN verdict.', prefer: 'Use action "contrast" over "parse": a SOLE FINDING (one lens fires, the rest abstain) is the signal, and the raw readings bury it.' },
  nexus_capability:{ use: 'Call any declared capability of any system — 239 of them, generated from the registry at call time.', edge: 'Always "list" first (narrow by system or q); 255 schemas will not fit your context. 16 capabilities are declared but served by nothing and are refused by name, not called.', prefer: 'Use over call_system when you do not already know the exact route — this one discovers it.' },
  read_file:       { use: 'Read a known file path before editing or answering about it.', edge: 'Fails on binary/missing paths — check the error, do not retry blindly.' },
  run_command:     { use: 'Run a shell command for build/test/inspect.', edge: 'Long-running or interactive commands can hang; keep them non-interactive and bounded.' },
  diagnose:        { use: 'Get live health/gaps for a system when something seems wrong.', edge: 'Reports state; it does not fix — pair with a repair path.', prefer: 'Use before proposing a fix, so the fix is grounded.' },
  move_data:       { use: 'Move/transform data between systems via the pipeline.', edge: 'Consequential — this goes through raid.verify; a failed verify leaves the target untouched.' },
  run_pipeline:    { use: 'Build a spec through the execution pipeline (isolate→verify→promote).', edge: 'Needs a real spec path; a trivial spec fails at validate.' },
  nexus_intelligence: { use: 'Query cortex intelligence (patterns, failures, context).', edge: 'Best for "what do we know about X"; not a general chat.' },
  run_closed_loop: { use: 'Run an autonomous build/verify loop.', edge: 'Consequential + long; prefer for a well-specified task, not exploration.' },
  module_builder:  { use: 'Scaffold a new module/capability when none exists — the "no is not an answer" path.', edge: 'Creates real files; goes through verification. Use when a capability is genuinely missing, not to avoid a simpler tool.' },
  run_adversarial: { use: 'Adversarially probe a build/answer for weaknesses.', edge: 'Returns findings, not a verdict; read them.', prefer: 'Pair with gemini-class agents for adversarial testing (CA5).' },
  axiom_check:     { use: 'Check an action/plan against the constitution/axioms before doing it.', edge: 'A WARN is not a block; a BLOCK names the axiom.' },
  analyze:         { use: 'Analyze a file/topic in depth.', edge: 'For understanding, not mutation.' },
  call_system:     { use: 'Reach any registered system by capability (resolves via the registry).', edge: 'The action must be in that system\'s allowed_actions or it is denied — that denial is the contract working.' },
  ui_spotlight:    { use: 'Highlight a system in the tv-ui to guide the user.', edge: 'Needs the UI running (:3000); unreachable → it reports, does not crash.' },
  ui_nerve:        { use: 'Show the live CFR field in the tv-ui.', edge: 'Visual only; on/off/sigma.' },
  query_recall:    { use: 'Search past conversations/memory for context.', edge: 'Short queries (<8 chars) are skipped as too thin.' },
  browser_action:  { use: 'Drive a browser tab (navigate, read DOM, act) via the bridge.', edge: 'Needs a live provider tab; routes through guardian NCP.' },
  nexus_status:    { use: 'Report real health/proposals/cross-system status.', edge: 'For "how is X"; the system-status path (CA1) already handles "how are you".' },
};

/**
 * toolGuide(names) — a compact usage guide for the given tool names (or all).
 * Injected into the co-pilot system prompt so the model knows how/when to use
 * each tool. Returns a short string; unknown tools are simply omitted.
 */
function toolGuide(names) {
  const keys = Array.isArray(names) && names.length ? names : Object.keys(NOTES);
  const lines = [];
  for (const k of keys) {
    const n = NOTES[k];
    if (!n) continue;
    let line = `- ${k}: ${n.use}`;
    if (n.edge) line += ` (edge: ${n.edge})`;
    if (n.prefer) line += ` (prefer: ${n.prefer})`;
    lines.push(line);
  }
  return lines.join('\n');
}

/** noteFor(name) — the structured note for one tool (for tests / drift checks). */
function noteFor(name) { return NOTES[name] || _forgedNote(name); }

/**
 * §2026-08-09 — FORGED tools carry their OWN note.
 *
 * CA2 requires full coverage and test-tool-guide.js T-001 enforces it. A tool
 * copilot forged at runtime cannot have a hand-written note, and exempting
 * forged tools from CA2 would make coverage a lie the moment one is created.
 * So a forged tool self-documents from its definition — description plus the
 * steps it composes — and NOTES stays the hand-authored layer for built-ins.
 * The note is real content, not a placeholder: it names exactly what the tool
 * calls, which is the one thing a caller needs and the schema does not say.
 */
function _forgedNote(name) {
  try {
    const T = require('./index.js');
    const t = T.TOOLS.get(name);
    if (!t || !t._forged) return null;
    const calls = (t._steps || []).map(s => s.call).join(' → ') || 'unknown steps';
    return {
      use: String(t.description || '').replace(/^\[forged\]\s*/, ''),
      edge: `Forged, not built-in. It composes: ${calls}. It can only do what those already do — a failing step stops the tool and returns the trail.`,
      prefer: 'Prefer the underlying calls when you need one of them alone; prefer this when you need the whole sequence.',
      forged: true,
    };
  } catch (_) { return null; }
}

// NOTES is the hand-authored layer; allNoteNames() is what coverage should be
// judged against, so a forged tool counts as covered by its own note.
function allNoteNames() {
  const names = new Set(Object.keys(NOTES));
  try { for (const [n, t] of require('./index.js').TOOLS) if (t._forged) names.add(n); } catch (_) {}
  return [...names];
}

module.exports = { toolGuide, noteFor, GUIDE_VERSION, NOTES, allNoteNames, _forgedNote };
