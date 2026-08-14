'use strict';
/**
 * lib/agent-tools/index.js — Sovereign agent tool-calling core
 * UUID: nexus-agent-tools-v1-0000-2026-0706-jamesbrooks-001
 * Version: 1.0.0
 *
 * §ARCHITECTURE — sovereign, not a monolith bolted onto copilot. This
 * file knows nothing about Ollama, WARP, or Copilot specifically.
 * `callModel` is injected by the caller — same dependency-injection
 * pattern already established for `jaa`/`busEmit` elsewhere in this
 * codebase (lib/seam/queue.js's QueueCompartment, lib/seam/gates.js's
 * CascadeGate). Guardian, Idearium, or anything else that wants a real
 * tool-calling loop uses this same module; only the thing that actually
 * talks to a model differs per caller.
 *
 * §WHY THIS EXISTS — checked before building: zero tool-calling
 * infrastructure existed anywhere in this codebase (confirmed by grep
 * across copilot/, idearium/agent-suite/, and the whole tree for
 * tool_calls/function_call/toolSchema — nothing). This is genuinely new
 * capability, not a duplicate of something that already existed.
 *
 * §TOOLS — starts with one real tool: read_file. This is the actual
 * fix for "Ollama reading a file should be a tool it decides to use,
 * not an explicit pre-upload step" — the model requests a path mid-
 * generation; the loop executes it and feeds the real content back in,
 * same turn, no human in the loop.
 */
const fs = require('fs');
const path = require('path');

// ── Tool registry ────────────────────────────────────────────────────────────
// Each tool: {name, description, parameters (JSON schema), execute(args)}.
// `execute` is real, not a stub — read_file actually reads the file.
const TOOLS = new Map();

function registerTool(tool) {
  if (!tool.name || typeof tool.execute !== 'function') {
    throw new Error('[agent-tools] registerTool requires {name, execute}');
  }
  TOOLS.set(tool.name, tool);
}

function getToolSchemas() {
  // Ollama's /api/chat `tools` param shape — OpenAI-compatible function schema.
  return [...TOOLS.values()].map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

async function executeTool(name, args, opts = {}) {
  const tool = TOOLS.get(name);
  if (!tool) return { error: `unknown tool '${name}' — available: ${[...TOOLS.keys()].join(', ')}` };

  // §ADDED 2026-08-13 — James: "before each action, needs to check for
  // relevant failure mode or fault from fault taxonomy." Real precedent,
  // surfaced, not silently blocking — a fault having happened before to
  // this exact tool is real information the caller/model can weigh, not
  // proof it will happen again. Attached to the result, never hidden.
  let faultHistory = null;
  try { faultHistory = require('../fault-log.js').checkFaultHistory(name, { intent: opts.intent || null, limit: 3 }); } catch (_) {}

  let result, outcome = 'executed', errMsg = null;
  try {
    result = await tool.execute(args || {});
    if (result && result.error) { outcome = 'error'; errMsg = result.error; }
  } catch (e) {
    // §1.2 — a tool failure is a result the model can see and react to,
    // not a thrown exception that kills the whole loop.
    outcome = 'error'; errMsg = e.message;
    result = { error: `tool '${name}' failed: ${e.message}` };
  }
  if (result && typeof result === 'object' && faultHistory && faultHistory.sampleSize > 0) {
    result._faultHistory = faultHistory; // real precedent, visible on every call whether it succeeded or not
  }

  // §ADDED 2026-08-13 — the actual logging half of the same request. Every
  // tool call that errors, from ANY of the 40 tools, gets a real, richly
  // tagged fault_log row — system/agent/component/status/intent/CFR
  // conditions — with zero changes needed to any individual tool file.
  if (outcome === 'error') {
    try {
      require('../fault-log.js').logFault({
        system: 'agent-tools', agent: opts.agent || null, component: name,
        faultClass: null, status: 'error', intent: opts.intent || null,
        causedBy: opts.causedBy || null, meta: { args, error: errMsg },
      });
    } catch (_) { /* fault-log unreachable — the tool result itself is unaffected, §1.2 non-blocking */ }
  }

  // §PHASEMAP P1 — record every tool decision to RAID → cortex (§8.6 built
  // outward from RAID.recordDecision, §2.2 cortex-persisted, §17.6 auditable).
  // Observe-only: a recording failure never affects the tool result (§1.2).
  try {
    require('../../cortex/core/raid').recordDecision({
      source: opts.source || 'agent-tools',
      tool: name, args, outcome, error: errMsg, causedBy: opts.causedBy || null,
    });
  } catch (_) { /* RAID unreachable — the tool still ran; P1 is non-blocking */ }
  return result;
}

/**
 * runToolLoop — the actual agentic loop.
 *
 * @param {function} callModel  — (messages, toolSchemas) => Promise<{
 *   text, toolCalls: [{id, name, arguments}] | null }>
 *   INJECTED — the caller decides how this actually talks to a model.
 *   This is where WARP's unifiedDispatch plugs in for callers that want
 *   cache/population behavior; runToolLoop itself has no opinion about it.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} opts — { maxIterations = 6 }
 * @returns {Promise<{text, iterations, toolCallLog}>}
 */
async function runToolLoop(callModel, systemPrompt, userPrompt, opts = {}) {
  const maxIterations = opts.maxIterations || 6;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  const toolCallLog = [];
  const schemas = getToolSchemas();
  // §GENERIC, sovereign (2026-08-13) — an optional allow-list restricting
  // which tools may actually EXECUTE this run. Not copilot- or hat-
  // specific: any caller of runToolLoop can pass this. Enforced here, not
  // just left to the caller's own prompt-narrowing (a callModel adapter
  // can narrow what's OFFERED, but only this loop can guarantee what's
  // ALLOWED to run — the model still names the tool, this is the actual
  // gate).
  const allowedTools = Array.isArray(opts.allowedTools) && opts.allowedTools.length ? new Set(opts.allowedTools) : null;

  for (let i = 0; i < maxIterations; i++) {
    const response = await callModel(messages, schemas);

    if (!response.toolCalls || !response.toolCalls.length) {
      // No tool requested — this is the final answer.
      return { text: response.text || '', iterations: i + 1, toolCallLog };
    }

    // Model requested one or more tools. Execute each for real, append
    // both the assistant's tool-call message and the tool results, then
    // loop back so the model can use them.
    messages.push({ role: 'assistant', content: response.text || '', tool_calls: response.toolCalls });
    for (const call of response.toolCalls) {
      const result = allowedTools && !allowedTools.has(call.name)
        ? { error: `"${call.name}" is outside the allowed tool scope for this run (${[...allowedTools].join(', ')}) — not executed` }
        : await executeTool(call.name, call.arguments);
      toolCallLog.push({ name: call.name, arguments: call.arguments, result, iteration: i + 1, scopeRejected: !!(allowedTools && !allowedTools.has(call.name)) });
      messages.push({ role: 'tool', name: call.name, content: JSON.stringify(result) });
    }
  }

  return { text: '[agent-tools] exceeded maxIterations without a final answer', iterations: maxIterations, toolCallLog };
}

module.exports = { registerTool, getToolSchemas, executeTool, runToolLoop, TOOLS };

// Register the one real tool built so far — read_file (lib/agent-tools/tools/read-file.js).
registerTool(require('./tools/query/read-file.js'));
registerTool(require('./tools/execution/run-command.js'));
// §MERGED 2026-07-09 from nexus-merged-v7 — diagnose reads the real
// diagnostic service (:7825); move-data moves records between JAA tables.
registerTool(require('./tools/diagnostic/diagnose.js'));
registerTool(require('./tools/execution/move-data.js'));

// §MERGED 2026-07-09 — from nexus-v8-rfr2-wired + copilot-full-tool-access.
// run_pipeline executes a real cockpit pipeline; nexus_intelligence queries
// cortex's faculties (intuition/mastermind/adversarial).
//
// §DUPLICATE REFUSED — the incoming index also registered
// tools/run-cockpit-command.js alongside tools/run-command.js. Both read
// cockpit's INTERACTION_CONTRACT and both execute via ForgeCLI.exec(): they
// are the same tool under two names. A model offered both would pick
// arbitrarily, and the two would drift. run_command stays canonical (it
// enumerates args, which run_cockpit_command does not). Merge duplicates by
// picking one and deleting the other — never by keeping both.
registerTool(require('./tools/execution/run-pipeline.js'));
registerTool(require('./tools/query/query-intelligence.js'));

// §MERGED 2026-07-10 from nexus-v9 — run_closed_loop drives the full pipeline
// (idea → spec → chunk → build → repo) as a single agent tool. This is
// "co-pilot can do anything nexus can": it calls the same idearium HTTP API a
// human would. Its test passes (4/4).
//
// §DUPLICATE REFUSED AGAIN — v9's index also registered run-cockpit-command
// alongside run-command, for the second time. Both read cockpit's
// INTERACTION_CONTRACT and both exec via ForgeCLI. Same tool, two names.
// run_command stays canonical. Refused once, refused again — a prior decision
// isn't undone by re-uploading the file.
registerTool(require('./tools/execution/run-closed-loop.js'));

// §PHASEMAP P5 — faculty-as-tool adapters (module_builder, run_adversarial,
// axiom_check, analyze). Thin wrappers over the copilot faculties so the loop
// can invoke them; faculties stay sovereign in copilot/ (§16.5). Exports an
// array — register each. Both copilot's and Guardian's loops get them.
for (const facultyTool of require('./tools/faculty/faculty-tools.js')) registerTool(facultyTool);

// §PHASEMAP P6 — call_system: every registered system reachable through one
// tool, resolving via the capability registry (the self-register work) and
// dispatching via nexus-client. Routes THROUGH the registry, not a competing
// path (§10.3).
registerTool(require('./tools/execution/call-system.js'));

// §PHASEMAP P8 (bridge) — UI as co-pilot tools: ui_spotlight + ui_nerve wrap the
// existing tv-shell HTTP surfaces so co-pilot can guide the user through the UI.
for (const uiTool of require('./tools/faculty/ui-tools.js')) registerTool(uiTool);

// §MERGED 2026-07-10 — query_recall. cortex /api/recall EXISTS
// (CortexPushRecall) with two real lanes, lexical + recency. copilot WROTE to
// recall but never READ it: it had no way to query its own past conversations.
// This is that read path, exposed to the agent loop — "what did we decide about
// X". Honest scope: 3 of 5 lanes (causal/failure/bep) need the absent kernel
// causal graph, so the tool only offers the intents whose lanes are real.
registerTool(require('./tools/query/query-recall.js'));

// §BUILT 2026-07-13 — browser_action. "Guardian is supposed to use Clear
// Glass. It's NEXUS' browser. Give the co-pilot more access." Guardian and
// Clear Glass only ever talked one direction before this — Clear Glass's
// userscripts connect INTO guardian's NCP channel, guardian never called
// out to Clear Glass at all, despite a real, complete command surface
// (IpcBridge's /cmd) sitting there unused. This tool is the first real
// path the other way: navigate/dom-query/dom-mutate/driver-exec/cookie
// management, through guardian's new 'browser' provider dispatch
// (guardian/server.js) → guardian/clear-glass-bridge.js's real two-step
// round trip (POST /cmd to submit, SSE /events to collect the actual
// result — checked Clear Glass's real wire format directly, not assumed).
// Verified end-to-end against a real mock of the full chain: tool →
// guardian job creation (POST /command — not /api/jobs, an assumption
// caught and fixed before shipping) → guardian job polling (GET /jobs,
// filtered by id — there is no single-job route, also caught before
// shipping) → the real clear-glass-bridge.js → a real Clear Glass mock
// implementing both /cmd and /events exactly. Full round trip confirmed.
registerTool(require('./tools/browser/browser-action.js'));

// §BUILT 2026-07-14 — nexus_status. "Copilot needs to be the face of
// NEXUS, can do anything the system can." Checked what was actually
// missing: LOOM (concerns, impact queries), nexus-healer (proposal
// status), and hooks' impact-propagation queries had zero agent-tool
// coverage. This is the read-only half of that gap — five real, live
// queries, nothing here mutates anything, so it doesn't need the same
// authorization questions browser_action or forge needed. Verified
// against real declared LOOM data (concerns, a real component/hook/wire
// chain producing a real impactOf() relation) and real hooks/*.hooks.js
// data (writersOf/emittersOf against the real idearium.idea.create hook)
// — found and documented a real, honest distinction along the way: LOOM's
// own 'hook' kind and the hooks/*.hooks.js system are genuinely separate,
// not one system split across two stores, despite sharing a name.
registerTool(require('./tools/query/nexus-status.js'));

// §WIRED 2026-08-08 — movement + manifest drift had a CLI and an HTTP route but
// no agent access at all. The agent could not ask what a system was doing.
registerTool(require('./tools/query/query-movement.js'));
registerTool(require('./tools/query/query-lenses.js'));
registerTool(require('./tools/execution/forge-tool.js'));
registerTool(require('./tools/governance/propose-idea.js'));

// §2026-08-09 — re-attach tools copilot forged in earlier sessions. Each is
// RE-VALIDATED on load: one whose target capability has since been removed does
// not come back (§0.1 — proven now, not when it was written).
try { require('../tool-forge.js').loadAll(); } catch (_) {}
registerTool(require('./tools/coordination/capability-tools.js'));

// §WIRED 2026-08-12 — James: "Tasks, schedule jobs, polling... fully
// programmable... use co-pilot to use loom to expand, diagnose/heal/monitor."
// lib/scheduler.js, lib/triggers.js, nexus-healer's proposal API, and loom's
// scanners all existed complete with zero agent-tool coverage (§1.1 — a
// capability the agent cannot call is not the agent's capability). All four
// are thin wrappers (§16.5) — no new scheduling, governance, persistence, or
// scanning logic; that all already lives in the wrapped modules.
registerTool(require('./tools/governance/schedule-task.js'));
registerTool(require('./tools/governance/register-trigger.js'));
registerTool(require('./tools/diagnostic/nexus-heal.js'));
registerTool(require('./tools/diagnostic/loom-scan.js'));
registerTool(require('./tools/governance/raid-snr.js'));
registerTool(require('./tools/sandbox/rewind-replay.js'));
registerTool(require('./tools/identity/copilot-identity.js'));
registerTool(require('./tools/diagnostic/resource-monitor.js'));
registerTool(require('./tools/query/agent-chat-search.js'));
registerTool(require('./tools/query/nexus-help.js'));
registerTool(require('./tools/sandbox/cos-compartment.js'));
registerTool(require('./tools/sandbox/cos-simulate.js'));
registerTool(require('./tools/query/meta-query.js'));
registerTool(require('./tools/execution/run-chain.js'));
registerTool(require('./tools/identity/hat-forge.js'));
registerTool(require('./tools/coordination/agent-capability.js'));
registerTool(require('./tools/execution/safe-apply.js'));
registerTool(require('./tools/coordination/agent-council.js'));
registerTool(require('./tools/query/fault-log.js'));
registerTool(require('./tools/coordination/roundtable.js'));
registerTool(require('./tools/coordination/parallel-dispatch.js'));
registerTool(require('./tools/execution/emergence.js'));

// §WIRED 2026-08-14 — James: "give you a tool to check loom, cortex and
// file tree and system." read_file only ever handled one named file — no
// way for the model to discover what's there before requesting it.
// Checked before building: zero listDir/fileTree/walkTree coverage
// anywhere in lib/agent-tools. file_tree is the read-side counterpart to
// read_file, same safe-path containment pattern, reused not re-derived.
registerTool(require('./tools/query/file-tree.js'));

// §WIRED 2026-08-14 — James: "build any copilot tools you can. all the
// compartment tools. compiler? hats? mapping tool?" hat_forge (identity/
// hat-forge.js) already covers forge/wear/list/get/revoke in full —
// checked, nothing to add there. cos_compartment (2026-08-12) only ever
// wrapped host/gates/compartment.js; its five siblings in the same
// directory had zero coverage until now. compiler_info is honestly
// scoped — no real "run a build" gate exists anywhere in COS to wrap, so
// this is reference lookup over the real compiler-enum, not a fabricated
// compile action. nexus_map composes loom's already-computed real graph
// with agent-system/contracts.js's real per-agent token limits — a
// chunked reader over existing data, not a second file-tree parser.
registerTool(require('./tools/sandbox/cos-archetype.js'));
registerTool(require('./tools/sandbox/cos-blueprint.js'));
registerTool(require('./tools/sandbox/cos-playground.js'));
registerTool(require('./tools/sandbox/cos-plugin.js'));
registerTool(require('./tools/sandbox/cos-vault.js'));   // get/export deliberately excluded — see file header
registerTool(require('./tools/query/compiler-info.js'));
registerTool(require('./tools/query/nexus-map.js'));

// §WIRED 2026-08-14 — James: "co-pilot can create its own capabilities...
// reference its models... switch agent... log ideas... create compartment
// types, axioms... build new capabilities and add hook/wires but has to
// have a consumer." Checked before building: forge-tool.js (2026-08-09)
// already covers "create its own capabilities/commands." propose_idea
// (2026-08-09) already covers "log ideas" — confirmed empty in the store
// this session, but the mechanism is real and complete, nothing to add.
// agent-capability.js already covers "reference its models." Genuinely
// missing: the WRITE half of axioms (axiom_check was read-only), a
// consumer-enforced way to register new hooks/wires (registry.add() had
// zero consumer check — the exact shape of the dangling-hook flood this
// session already fought), and a dedicated switch_agent (hat_forge's
// "wear" already did this, just buried inside hat-shaped params).
registerTool(require('./tools/governance/axiom-manage.js'));
registerTool(require('./tools/governance/loom-register.js'));
registerTool(require('./tools/identity/switch-agent.js'));

// §WIRED 2026-08-14 (same session, continued) — "take notes. to do list...
// versionium." notes_todo: genuinely missing primitive, checked directly
// (zero hits anywhere for notes/todo). versionium_commit: wraps the ONE
// real function cortex/versionium/index.js has (commit) — rewind/branch/
// snapshot are explicitly mapped-not-built (R2, loom-hub phasemap), not
// wrapped here since there's nothing real behind them yet.
registerTool(require('./tools/query/notes-todo.js'));
registerTool(require('./tools/governance/versionium-commit.js'));
registerTool(require('./tools/execution/delete-file.js'));

// §WIRED 2026-08-14 — James, directly: "co-pilot should not give 'no' for
// an answer — either figures it out, asks me, or uses lifeline contract."
// This is AM8(d) of docs/agent-model-and-user-continuity-phasemap.spec,
// already mapped three turns ago, confirmed still true by re-reading
// lifeline.js's route() directly this turn: the escalation chain is
// AI-to-AI only, zero "ask the actual person" rung. Uses AM7(e)'s already-
// scoped {needs, why, whatWouldUnblock} shape rather than a new one.
registerTool(require('./tools/governance/ask-james.js'));

// §BUILT 2026-08-14 — AM5 of agent-model-and-user-continuity-phasemap.spec.
// Composes real pieces (query_recall, loom_scan, lifeline.route to
// perplexity, browser_action) in the exact cheap-to-expensive order the
// phasemap specified, not a new dispatch mechanism. AM1's step honestly
// skipped — that phase is still mapped, not built.
registerTool(require('./tools/query/ambiguity-pull.js'));
