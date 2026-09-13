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
const http = require('http');

// §ADDED 2026-09-11 — the fallback lookup for makeNcpCallModel's failure
// path below. GET /response/:jobId already exists on guardian's server
// (server.js ~1875, built for Forge's GuardianClient) with real, already-
// built multi-layer recovery: in-memory `jobs` Map -> persisted JAA jobs
// table -> matching artifact content. Not new infrastructure — this just
// reaches an endpoint that was already there and already more resilient
// than the in-memory-only path that fails in the screenshot's exact
// scenario (dispatch completes, response never reaches the caller).
const GD_URL = process.env.GUARDIAN_URL || 'http://127.0.0.1:7820';
function _fetchGuardianResponse(jobId, timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (!jobId) return resolve(null);
    const req = http.get(`${GD_URL}/response/${jobId}`, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try {
          const j = JSON.parse(body);
          resolve(j?.ok && j.response ? j : null);
        } catch (_) { resolve(null); }
      });
    });
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}


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
    // §FIXED 2026-09-13 — James: screenshots showing chatgpt's real,
    // dispatched prompt with TWO complete, DIFFERENT-SYNTAX tool catalogs
    // stacked in one message ([[TOOL: name {...}]] followed by a second,
    // full ```tool``` fenced-block catalog) — the exact same class of bug
    // guardian/ask.js's own 2026-09-02 fix already found and fixed for
    // ITS OWN internal manifest ("two independent tool-call mechanisms...
    // never reconciled"), but not for this specific chain: fullPrompt
    // above ALREADY embeds this loop's own complete _toolInstructions(),
    // and dispatchToAgent (copilot/lifeline.js's _tryGuardian) defaults
    // `tools: opts.tools || ESCALATION_TOOLS` — opts here never set
    // `tools`, so ESCALATION_TOOLS fell through every time, and
    // guardian/userscript-<agent>.js's own _buildToolsHeader(tools) then
    // prepended a SECOND, complete, [[TOOL:...]]-syntax catalog on top.
    // Real fix, at the source rather than patched downstream: this loop
    // is always the single source of truth for tool instructions once
    // fullPrompt is built, so it explicitly tells guardian not to build
    // its own — `tools:[]` is truthy (empty array), so it overrides the
    // `|| ESCALATION_TOOLS` fallback correctly rather than being treated
    // as unset.
    const result = await dispatchToAgent(fullPrompt, { ...opts, tools: [] });
    if (!result || !result.ok) {
      // §FIXED 2026-09-11 — this used to always return the canned
      // '[NCP dispatch failed — no response]' string, the exact string
      // shown in the screenshot even though the provider had already
      // answered correctly. Real cause traced to copilot/lifeline.js's
      // _tryGuardian discarding result.jobId on this exact failure path
      // (fixed there too, same pass) — without a jobId there was never
      // anything to recover from. With it, guardian's own GET
      // /response/:jobId (already real, already more resilient than the
      // in-memory-only path that failed) can often still answer.
      const jobId = result && result.jobId;
      const recovered = jobId ? await _fetchGuardianResponse(jobId) : null;
      if (recovered && recovered.response) {
        // §HONEST, per "nothing pretends to work" — a recovered answer
        // is not the same as a live round trip and must stay
        // distinguishable downstream, not silently presented as identical.
        return { text: recovered.response, toolCalls: null, viaLedgerFallback: true, recoveredJobId: jobId };
      }
      // §FIXED 2026-09-13 — James: "with the no response, need to know
      // why, like give me gap or error id... everything error needs to
      // log for every system." This fallback previously returned a bare
      // string with nothing behind it — no id, no record of promptLen/
      // provider/jobId to actually investigate why. Every other failure
      // branch in this same function already reports to lib/gap-field.js
      // (copilot/lifeline.js's own _tryGuardian does too, on its own
      // throw/empty-response paths) — this was the one silent gap in an
      // otherwise-consistent pattern. type/dedup_key stay stable per
      // provider so repeat failures bump occurrences on the same real
      // gap row instead of creating a new one every time (see this
      // file's own _dedupKey — same discipline as every other reporter).
      let gapUuid = null;
      try {
        const gapField = require('../lib/gap-field');
        const rep = gapField.report({
          type: 'copilot.ncp-dispatch-no-response',
          body: `NCP dispatch returned no usable response for provider "${opts.provider || 'unknown'}"` +
            (jobId ? ` (jobId ${jobId}, GET /response/:jobId recovery also came back empty)` : ' (no jobId — recovery was never reachable)'),
          source: opts.provider || 'copilot',
          domain: 'system',
          severity: 'medium',
          meta: {
            jobId,
            provider: opts.provider || null,
            promptLength: fullPrompt.length,
            recoveryAttempted: !!jobId,
            resultError: (result && result.error) || null,
          },
        });
        gapUuid = rep.gap && rep.gap.uuid;
      } catch (e) {
        console.warn(`[copilot/tool-runtime] gap report for NCP no-response failed (non-fatal): ${e.message}`);
      }
      return {
        text: (result && result.text) || `[NCP dispatch failed — no response${gapUuid ? ` — gap ${gapUuid}` : ''}]`,
        toolCalls: null,
        gapUuid,
      };
    }

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
