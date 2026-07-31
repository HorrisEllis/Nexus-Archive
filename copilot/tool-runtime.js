'use strict';
/**
 * copilot/tool-runtime.js — P1 of the omniscience phasemap
 * UUID: nexus-copilot-tool-runtime-v1-0000-2026-0730-001
 * Version: 1.0.0
 *
 * §PHASEMAP P1 (docs/copilot-omniscience-phasemap.spec). Wires the SOVEREIGN
 * tool-calling loop (lib/agent-tools) into copilot by injecting copilot's own
 * model dispatch as `callModel`. agent-tools stays sovereign — it knows nothing
 * about copilot; copilot brings the model, agent-tools brings the loop and the
 * 10 tools (§10.1 — copilot owns its callModel, not the loop; §16.5 — use the
 * module, don't duplicate it).
 *
 * This is deliberately a SEPARATE module, not inlined into the 1266-line
 * server.js: the loop + the callModel adapter + the persistence/stream threading
 * are testable in isolation here, and server.js just calls run().
 *
 * §B / non-linear — the same lib/agent-tools is wired into guardian in P4 with a
 * DIFFERENT callModel (guardian's providers). Nobody owns the loop.
 */

const agentTools = require('../lib/agent-tools');

/**
 * makeOllamaCallModel(dispatch, pollJob) — adapt copilot's job-based ollama
 * dispatch into the (messages, toolSchemas) => {text, toolCalls} shape
 * runToolLoop expects.
 *
 * copilot's dispatch is async/job-based (POST /api/jobs then poll), and returns
 * ollama's response which may contain tool_calls. This adapter:
 *   1. flattens messages into the prompt/context shape _dispatchToOllama wants,
 *   2. awaits the job to completion,
 *   3. extracts tool_calls from the response (ollama returns them OpenAI-shaped),
 *   4. returns { text, toolCalls } — null toolCalls means "final answer".
 *
 * dispatch(prompt, context, opts) — copilot's _dispatchToOllama (returns a job or job result)
 * pollJob(jobRef) — resolves a job to its final { text, toolCalls?, model } (injected; copilot owns the poll)
 */
function makeOllamaCallModel(dispatch, pollJob, opts = {}) {
  return async function callModel(messages, toolSchemas) {
    // Flatten the running message list: system+user+prior tool results become
    // the context; the latest user/tool content is the live prompt.
    const system = messages.find(m => m.role === 'system')?.content || '';
    const convo = messages
      .filter(m => m.role !== 'system')
      .map(m => {
        if (m.role === 'tool') return `[tool:${m.name}] ${m.content}`;
        if (m.role === 'assistant') return `ASSISTANT: ${m.content || ''}`;
        return `USER: ${m.content || ''}`;
      })
      .join('\n');

    const jobRef = await dispatch(convo, system, {
      ...opts,
      tools: toolSchemas,            // ollama-bridge passes these to /api/chat tools
      intent: 'tool-loop',
      componentId: 'copilot.tool-runtime',
      hookId: 'copilot.tool-runtime.to-ollama',
    });

    const final = await pollJob(jobRef);
    // Normalize: a job result may carry toolCalls (ollama tool_calls) or just text.
    const toolCalls = _extractToolCalls(final);
    return { text: final.text || final.result || '', toolCalls: toolCalls && toolCalls.length ? toolCalls : null };
  };
}

/** Pull OpenAI/ollama-shaped tool_calls out of a job result, normalized to runToolLoop's shape. */
function _extractToolCalls(final) {
  const raw = final.toolCalls || final.tool_calls || final.message?.tool_calls;
  if (!Array.isArray(raw)) return null;
  return raw.map((c, i) => {
    const rawArgs = c.arguments !== undefined ? c.arguments : c.function?.arguments;
    return {
      id: c.id || `call_${i}`,
      name: c.name || c.function?.name,
      arguments: typeof rawArgs === 'string' ? _safeParse(rawArgs) : (rawArgs || {}),
    };
  }).filter(c => c.name);
}

function _safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

/**
 * run(opts) — the P1 entry point copilot/server.js calls.
 *
 * @param {object} o
 *   o.userPrompt   — the user's request
 *   o.dispatch     — copilot's _dispatchToOllama
 *   o.pollJob      — copilot's job-poll resolver
 *   o.memory       — persistent user-model context string (P2), optional
 *   o.streamDigest — live normalized event stream string (P3), optional
 *   o.maxIterations
 * @returns {Promise<{text, iterations, toolCallLog}>}
 */
async function run(o = {}) {
  if (!o.dispatch || !o.pollJob) throw new Error('[tool-runtime] dispatch and pollJob are required');
  const callModel = makeOllamaCallModel(o.dispatch, o.pollJob, o.modelOpts || {});

  // The system prompt carries co-pilot's identity + persistent memory (P2) +
  // the live continuous stream (P3). Both are optional and injected, so P1
  // works alone and P2/P3 enrich it without changing this contract.
  const systemPrompt = [
    'You are the NEXUS co-pilot. You have tools; use them to read files, run diagnostics, query memory, and act on the system. Prefer using a tool over guessing.',
    o.memory ? `\nWHAT YOU REMEMBER ABOUT THIS USER AND SYSTEM:\n${o.memory}` : '',
    o.streamDigest ? `\nLIVE SYSTEM STREAM (most recent events):\n${o.streamDigest}` : '',
  ].filter(Boolean).join('\n');

  return agentTools.runToolLoop(callModel, systemPrompt, o.userPrompt, {
    maxIterations: o.maxIterations || 6,
  });
}

module.exports = { run, makeOllamaCallModel, _extractToolCalls, toolCount: () => agentTools.TOOLS.size };
