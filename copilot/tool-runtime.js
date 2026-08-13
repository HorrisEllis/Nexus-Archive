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

// ── P6.5 (2026-08-13) — "co-pilot is the hat, the agents are who wear
// them." Ollama gets real tool-calling because ollama-bridge's /api/chat
// takes a real `tools` param. Claude/chatgpt/gemini/mistral/perplexity via
// NCP are browser automation (guardian's userscripts driving the actual
// web chat UI) — there is no function-calling API in that path, structurally
// can't be, you're typing into a textbox and reading back what appears. So
// "wearing the copilot hat" for those agents was pure conversation, no
// tools — checked and confirmed live before building this, not assumed.
//
// Fix: give NCP-driven agents the SAME tool loop through prompt-engineered
// structured responses instead of a native API param. Not inventing a new
// convention — clear-glass/src/copilot/bridge.js's _parseCommands() already
// scans co-pilot responses for fenced ```tool blocks containing raw JSON
// (built for browser-driver commands). Reusing that exact fenced-block
// SYNTAX for agent-tools calls too — same shape any of these models can
// already produce reliably (a JSON code block), no retraining, no new
// protocol to teach them beyond what's in the prompt itself.
const TOOL_BLOCK_RE = /```tool\s*\n([\s\S]*?)\n```/g;

function _parseToolBlocks(text) {
  const commands = [];
  TOOL_BLOCK_RE.lastIndex = 0; // regex has /g — reset between calls, a shared module-level regex with lastIndex is a real footgun otherwise
  let m;
  while ((m = TOOL_BLOCK_RE.exec(text || '')) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (parsed && parsed.name) commands.push({ id: `call_${commands.length}`, name: parsed.name, arguments: parsed.arguments || {} });
    } catch (_) { /* malformed block — skip it, don't crash the loop over one bad JSON attempt */ }
  }
  return commands;
}

function _toolInstructions(toolSchemas) {
  const list = toolSchemas.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n');
  return [
    'You have real tools available. To use one, respond with EXACTLY this format (a fenced code block, nothing else in that block):',
    '```tool',
    '{"name": "tool_name_here", "arguments": {"param": "value"}}',
    '```',
    'Only one tool call per response. If you don\'t need a tool, just answer normally in plain text — no fenced block.',
    'Available tools:',
    list,
  ].join('\n');
}

/**
 * makeNcpCallModel(dispatchToAgent) — adapt guardian's NCP dispatch (a
 * browser-driven agent — claude/chatgpt/gemini/mistral/perplexity) into the
 * (messages, toolSchemas) => {text, toolCalls} shape runToolLoop expects.
 * No native function-calling exists on this path; tool calls are parsed
 * from a fenced ```tool block in the plain text response instead.
 *
 * dispatchToAgent(prompt, opts) — a single async call that returns the
 * agent's real text response (e.g. lifeline.js's _tryGuardian shape:
 * {ok, text, confidence}). No separate poll step — NCP dispatch is already
 * one round trip by the time this is called.
 */
function makeNcpCallModel(dispatchToAgent, opts = {}) {
  return async function callModel(messages, toolSchemas) {
    // §EXTENDED 2026-08-13 (P8) — a hat with a toolScope narrows which
    // tools are even OFFERED, not just which are allowed to run. A
    // "debugging hat" scoped to {read_file, diagnose} should never see
    // schedule_task in its own instructions — narrower is honest, not
    // just enforced after the fact.
    const scoped = opts.toolScope && opts.toolScope.length
      ? toolSchemas.filter(t => opts.toolScope.includes(t.function.name))
      : toolSchemas;

    const system = messages.find(m => m.role === 'system')?.content || '';
    const convo = messages
      .filter(m => m.role !== 'system')
      .map(m => {
        if (m.role === 'tool') return `[tool result — ${m.name}] ${m.content}`;
        if (m.role === 'assistant') return `ASSISTANT: ${m.content || ''}`;
        return `USER: ${m.content || ''}`;
      })
      .join('\n');

    const fullPrompt = [system, _toolInstructions(scoped), convo].filter(Boolean).join('\n\n');
    const result = await dispatchToAgent(fullPrompt, opts);
    if (!result || !result.ok) return { text: (result && result.text) || '[NCP dispatch failed — no response]', toolCalls: null };

    const toolCalls = _parseToolBlocks(result.text);
    // Strip the tool block out of the visible text if a call was made — the
    // JSON block is machine-facing, not something the loop should echo back
    // as if it were a real answer once a real tool call is going to run.
    // Enforcement of opts.toolScope now lives in runToolLoop's allowedTools
    // (lib/agent-tools/index.js) — one real gate, not two places pretending
    // to be the same rule.
    const text = toolCalls.length ? result.text.replace(TOOL_BLOCK_RE, '').trim() : result.text;
    return { text, toolCalls: toolCalls.length ? toolCalls : null };
  };
}

/**
 * runViaAgent(agent, dispatchToAgent, userPrompt, opts) — the NCP-agent
 * equivalent of run() below. "Co-pilot is the hat, the agents are who wear
 * them" — whichever agent is dispatched to gets the SAME tool loop, same
 * system prompt discipline (tool-guide, memory, live stream), as ollama.
 */
async function runViaAgent(agent, dispatchToAgent, userPrompt, opts = {}) {
  const callModel = makeNcpCallModel(dispatchToAgent, { ...(opts.modelOpts || {}), toolScope: opts.toolScope });
  const systemPrompt = [
    `You are the NEXUS co-pilot, currently running as ${agent}. You have tools; use them to read files, run diagnostics, query memory, and act on the system.`,
    'ALWAYS look for a tool that can fulfill the request before answering from memory or escalating. Prefer a tool over a guess.',
    (() => { try { return 'YOUR TOOLS (how and when to use them):\n' + require('../lib/agent-tools/tool-guide').toolGuide(); } catch { return ''; } })(),
    opts.personaPrompt ? `\nYOUR CURRENT PERSONA (this hat):\n${opts.personaPrompt}` : '',
    opts.memory ? `\nWHAT YOU REMEMBER ABOUT THIS USER AND SYSTEM:\n${opts.memory}` : '',
    opts.streamDigest ? `\nLIVE SYSTEM STREAM (most recent events):\n${opts.streamDigest}` : '',
  ].filter(Boolean).join('\n');

  return agentTools.runToolLoop(callModel, systemPrompt, userPrompt, {
    maxIterations: opts.maxIterations || 6,
    allowedTools: opts.toolScope || undefined,
  });
}

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
    'You are the NEXUS co-pilot. You have tools; use them to read files, run diagnostics, query memory, and act on the system.',
    'ALWAYS look for a tool that can fulfill the request before answering from memory or escalating. Prefer a tool over a guess.',
    (() => { try { return 'YOUR TOOLS (how and when to use them):\n' + require('../lib/agent-tools/tool-guide').toolGuide(); } catch { return ''; } })(),
    o.memory ? `\nWHAT YOU REMEMBER ABOUT THIS USER AND SYSTEM:\n${o.memory}` : '',
    o.streamDigest ? `\nLIVE SYSTEM STREAM (most recent events):\n${o.streamDigest}` : '',
  ].filter(Boolean).join('\n');

  return agentTools.runToolLoop(callModel, systemPrompt, o.userPrompt, {
    maxIterations: o.maxIterations || 6,
  });
}

module.exports = { run, runViaAgent, makeOllamaCallModel, makeNcpCallModel, _extractToolCalls, _parseToolBlocks, toolCount: () => agentTools.TOOLS.size };
