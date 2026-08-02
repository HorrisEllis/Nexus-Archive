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
function noteFor(name) { return NOTES[name] || null; }

module.exports = { toolGuide, noteFor, GUIDE_VERSION, NOTES };
