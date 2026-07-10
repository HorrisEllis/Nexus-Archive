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

async function executeTool(name, args) {
  const tool = TOOLS.get(name);
  if (!tool) return { error: `unknown tool '${name}' — available: ${[...TOOLS.keys()].join(', ')}` };
  try {
    return await tool.execute(args || {});
  } catch (e) {
    // §1.2 — a tool failure is a result the model can see and react to,
    // not a thrown exception that kills the whole loop.
    return { error: `tool '${name}' failed: ${e.message}` };
  }
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
// §WIRED 2026-07-09 — the highest-value orphan: lib/execution-pipeline.js
// (the full autonomous build→verify→compare→promote loop) had zero
// callers despite expectation-watcher already listening for its events.
registerTool(require('./tools/run-pipeline.js'));
// §GAP CLOSED 2026-07-10 — run_cockpit_command was a real, complete tool
// file with zero call sites, including here: never registered, so the
// loop couldn't offer it regardless of whether a ForgeCLI was wired.
// wireCockpit() is called separately by copilot/server.js's boot with the
// live instance from cockpit/live.js — registering here just makes the
// tool visible to the loop; without wiring it fails closed with a clear
// error ('cockpit not wired'), never a fabricated result.
registerTool(require('./tools/run-cockpit-command.js'));
// §CLOSED LOOP 2026-07-10 — chains spec→populate→repo (create → WARP-backed
// chunk populate → repo) into one copilot-callable action. The stages were
// all real, nothing chained them. Map: docs/NEXUS-CLOSED-LOOP-MAP-2026-07-10.md
registerTool(require('./tools/run-closed-loop.js'));
// §ADDED 2026-07-10 — "query and use the apis from all systems: event
// ledgers, intelligence system, intuition, mastermind, cfr, rfr2, causal
// graph, continuous event stream, sse" — these were wired into diagnose's
// bundled per-system summary only. nexus_intelligence exposes each as its
// own standalone, directly-callable action.
registerTool(require('./tools/query-intelligence.js'));
