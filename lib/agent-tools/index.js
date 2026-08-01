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
      const result = await executeTool(call.name, call.arguments);
      toolCallLog.push({ name: call.name, arguments: call.arguments, result, iteration: i + 1 });
      messages.push({ role: 'tool', name: call.name, content: JSON.stringify(result) });
    }
  }

  return { text: '[agent-tools] exceeded maxIterations without a final answer', iterations: maxIterations, toolCallLog };
}

module.exports = { registerTool, getToolSchemas, executeTool, runToolLoop, TOOLS };

// Register the one real tool built so far — read_file (lib/agent-tools/tools/read-file.js).
registerTool(require('./tools/read-file.js'));
registerTool(require('./tools/run-command.js'));
// §MERGED 2026-07-09 from nexus-merged-v7 — diagnose reads the real
// diagnostic service (:7825); move-data moves records between JAA tables.
registerTool(require('./tools/diagnose.js'));
registerTool(require('./tools/move-data.js'));

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
registerTool(require('./tools/run-pipeline.js'));
registerTool(require('./tools/query-intelligence.js'));

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
registerTool(require('./tools/run-closed-loop.js'));

// §PHASEMAP P5 — faculty-as-tool adapters (module_builder, run_adversarial,
// axiom_check, analyze). Thin wrappers over the copilot faculties so the loop
// can invoke them; faculties stay sovereign in copilot/ (§16.5). Exports an
// array — register each. Both copilot's and Guardian's loops get them.
for (const facultyTool of require('./tools/faculty-tools.js')) registerTool(facultyTool);

// §PHASEMAP P6 — call_system: every registered system reachable through one
// tool, resolving via the capability registry (the self-register work) and
// dispatching via nexus-client. Routes THROUGH the registry, not a competing
// path (§10.3).
registerTool(require('./tools/call-system.js'));

// §MERGED 2026-07-10 — query_recall. cortex /api/recall EXISTS
// (CortexPushRecall) with two real lanes, lexical + recency. copilot WROTE to
// recall but never READ it: it had no way to query its own past conversations.
// This is that read path, exposed to the agent loop — "what did we decide about
// X". Honest scope: 3 of 5 lanes (causal/failure/bep) need the absent kernel
// causal graph, so the tool only offers the intents whose lanes are real.
registerTool(require('./tools/query-recall.js'));

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
registerTool(require('./tools/browser-action.js'));

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
registerTool(require('./tools/nexus-status.js'));
