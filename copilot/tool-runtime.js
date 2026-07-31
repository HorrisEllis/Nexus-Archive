'use strict';
/**
 * copilot/tool-runtime.js — P1 of the omniscience phasemap
 * UUID: nexus-copilot-tool-runtime-v1-0000-2026-0730-001
 * Version: 2.0.0
 *
 * §PHASEMAP P1 (docs/copilot-omniscience-phasemap.spec). Wires the SOVEREIGN
 * tool-calling loop (lib/agent-tools) into copilot by injecting copilot's own
 * model call as `callModel`. agent-tools stays sovereign — it knows nothing
 * about copilot; copilot brings the model, agent-tools brings the loop and the
 * 10 tools (§10.1 — copilot owns its callModel, not the loop; §16.5 — use the
 * module, don't duplicate it).
 *
 * §B / non-linear — the same lib/agent-tools is wired into guardian in P4 with a
 * DIFFERENT callModel (guardian's providers). Nobody owns the loop.
 *
 * ── 2.0.0, 2026-07-31 — WHAT CHANGED AND WHY ─────────────────────────────────
 * 1.0.0 shipped with makeOllamaCallModel(dispatch, pollJob): it adapted
 * copilot's job-based /api/jobs dispatch, passing `tools` in the opts. That
 * could never work, and it failed silently rather than loudly:
 *
 *   - copilot/server.js _dispatchToOllama built its /api/jobs body by hand and
 *     never forwarded opts.tools;
 *   - /api/jobs resolves to Ollama /api/generate, which has no `tools` param
 *     at all (ollama/server.js says so in its own comment);
 *   - the job record never carries tool_calls, so extraction always returned
 *     null and the loop always exited at iteration 1 with a guess.
 *
 * The job adapter is DELETED rather than kept alongside the working path
 * (§16.5 — delete before add; a second path that cannot work is not a fallback,
 * it is a trap). run() now takes a `chat` function: one model turn, tools
 * declared, tool_calls back — ollama/chat-tools.js behind POST /api/chat/tools.
 *
 * The 1.0.0 test suite passed against this defect because it fabricated the
 * model's side of the wire. The 2.0.0 tests run a real HTTP round trip.
 */

const agentTools = require('../lib/agent-tools');

const MODULE_ID = 'copilot/tool-runtime';
const VERSION = '2.0.0';
const DEFAULT_MAX_ITERATIONS = 6;

/**
 * makeCallModel(chat) — adapt a single-turn tool-capable chat function into the
 * (messages, toolSchemas) => {text, toolCalls} shape runToolLoop expects.
 *
 * @param {function} chat — (messages, toolSchemas) => Promise<{text, toolCalls}>
 *   Injected. copilot passes an HTTP call to the bridge's POST /api/chat/tools;
 *   a test passes a local server's equivalent. Neither this module nor
 *   agent-tools knows or cares which.
 */
function makeCallModel(chat) {
  if (typeof chat !== 'function') throw new Error('[tool-runtime] chat must be a function');
  return async function callModel(messages, toolSchemas) {
    const r = await chat(messages, toolSchemas);
    if (!r || typeof r !== 'object') {
      // §1.3 — loud and specific. A malformed model response must not read as
      // "the model had nothing to say", which is what runToolLoop would infer
      // from a bare falsy return.
      throw new Error('[tool-runtime] chat returned no response object');
    }
    const toolCalls = _extractToolCalls(r);
    return { text: r.text || '', toolCalls: toolCalls.length ? toolCalls : null };
  };
}

/**
 * _extractToolCalls(r) — normalise whatever shape came back into runToolLoop's.
 *
 * The bridge normalises Ollama's own shape already, but copilot must not ASSUME
 * it was the bridge on the other end — this module's whole point is that the
 * model source is injected. So the OpenAI nesting and string-encoded arguments
 * are handled here too. This is the exact defect the P1 session found and
 * pinned (arguments checked at the wrong nesting level); the pin stays.
 *
 * Always returns an array, never null.
 */
function _extractToolCalls(r) {
  const raw = r.toolCalls || r.tool_calls || r.message?.tool_calls;
  if (!Array.isArray(raw)) return [];
  return raw.map((c, i) => {
    const fn = c.function || {};
    const rawArgs = c.arguments !== undefined ? c.arguments : fn.arguments;
    return {
      id: c.id || `call_${i}`,
      name: c.name || fn.name,
      arguments: typeof rawArgs === 'string' ? _safeParse(rawArgs) : (rawArgs || {}),
    };
  }).filter(c => c.name);
}

function _safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

/**
 * buildSystemPrompt(o) — copilot's identity plus injected context.
 *
 * memory (P2) and streamDigest (P3) are OPTIONAL and injected, so P1 works
 * alone and later phases enrich it without changing this contract.
 *
 * §R-BAND NOTE — at 0.2.0 of the phasemap these two stop being whole-digest
 * blobs and become ranked sources inside a budgeted pre-flight block (R5).
 * This function is the seam that changes; run()'s signature is not.
 */
function buildSystemPrompt(o = {}) {
  return [
    'You are the NEXUS co-pilot. You have tools; use them to read files, run diagnostics, query memory, and act on the system. Prefer using a tool over guessing.',
    o.memory ? `\nWHAT YOU REMEMBER ABOUT THIS USER AND SYSTEM:\n${o.memory}` : '',
    o.streamDigest ? `\nLIVE SYSTEM STREAM (most recent events):\n${o.streamDigest}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * run(o) — the P1 entry point copilot/server.js calls.
 *
 * @param {object} o
 *   o.chat          — (messages, toolSchemas) => {text, toolCalls}  REQUIRED
 *   o.userPrompt    — the user's request                            REQUIRED
 *   o.memory        — persistent user-model context string (P2), optional
 *   o.streamDigest  — live normalized event stream string (P3), optional
 *   o.maxIterations
 * @returns {Promise<{text, iterations, toolCallLog}>}
 */
async function run(o = {}) {
  if (typeof o.chat !== 'function') {
    throw new Error('[tool-runtime] chat is required — a (messages, toolSchemas) => {text, toolCalls} function. The job-based dispatch path was removed in 2.0.0: /api/jobs cannot carry tools.');
  }
  if (!o.userPrompt) throw new Error('[tool-runtime] userPrompt is required');

  return agentTools.runToolLoop(
    makeCallModel(o.chat),
    buildSystemPrompt(o),
    o.userPrompt,
    { maxIterations: o.maxIterations || DEFAULT_MAX_ITERATIONS }
  );
}

module.exports = {
  MODULE_ID, VERSION, DEFAULT_MAX_ITERATIONS,
  run, makeCallModel, buildSystemPrompt, _extractToolCalls,
  toolCount: () => agentTools.TOOLS.size,
};
