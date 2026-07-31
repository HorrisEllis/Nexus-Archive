'use strict';
/**
 * ollama/chat-tools.js — single-round-trip tool-capable model call
 * UUID: nexus-ollama-chat-tools-v1-0000-2026-0731-001
 * Version: 1.0.0
 *
 * §PHASEMAP P1 (docs/copilot-omniscience-phasemap.spec) — closes p1_open_drift.
 *
 * WHY THIS EXISTS. Ollama exposes tool-calling on /api/chat only; /api/generate
 * has no `tools` param at all. The bridge's job queue (/api/jobs) resolves to
 * /api/generate, so a job can never carry tools and a job result can never carry
 * tool_calls. copilot's tool-loop was posting to /api/jobs with `tools` in its
 * opts and getting text back forever — one iteration, no tool, silently.
 *
 * This is the ONE primitive both loop callers sit on: ONE model turn, tools
 * declared, tool_calls returned. It does NOT run a loop. That is deliberate
 * (§10.3 — one loop implementation, lib/agent-tools; this is the model call the
 * loop is built from). Whoever drives the loop owns the system prompt, the
 * memory and the stream — which is what makes P4 possible: guardian injects the
 * same loop with its own providers and never calls copilot.
 *
 * EXTRACTED, NOT COPIED (§16.5). ollama/server.js had this inline as
 * _callOllamaChatWithTools since 2026-07-07. It could not be tested: server.js
 * calls server.listen(PORT) at module scope, so requiring it to reach the
 * function binds :3749 and starts the health interval. Same reasoning that put
 * copilot/tool-runtime.js in its own file. server.js now requires this; the
 * inline copy is gone, not left behind to drift.
 */

const http = require('http');

const MODULE_ID = 'ollama/chat-tools';
const VERSION = '1.0.0';
const DEFAULT_TIMEOUT_MS = 60000;

/**
 * callChatWithTools(host, model, messages, toolSchemas, timeoutMs)
 *
 * @param {string} host        — Ollama host root, e.g. http://127.0.0.1:11434
 * @param {string} model
 * @param {Array}  messages    — OpenAI-shaped [{role, content, tool_calls?, name?}]
 * @param {Array}  toolSchemas — from lib/agent-tools getToolSchemas()
 * @returns {Promise<{text, toolCalls, model, raw}>}
 *   toolCalls is ALWAYS an array (empty when the model gave a final answer) —
 *   never null, never undefined, so a caller cannot mistake "no tools" for
 *   "field missing" (§1.3 — the shape is the same on both branches).
 */
function callChatWithTools(host, model, messages, toolSchemas, timeoutMs) {
  if (!host) return Promise.reject(new Error('[chat-tools] host is required'));
  if (!model) return Promise.reject(new Error('[chat-tools] model is required'));
  if (!Array.isArray(messages) || !messages.length) {
    return Promise.reject(new Error('[chat-tools] messages must be a non-empty array'));
  }

  const body = JSON.stringify({
    model,
    messages,
    tools: Array.isArray(toolSchemas) ? toolSchemas : [],
    stream: false,
  });

  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(`${host}/api/chat`); }
    catch (e) { reject(new Error(`[chat-tools] bad host '${host}': ${e.message}`)); return; }

    const req = http.request({
      hostname: u.hostname,
      port: u.port || 11434,
      path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: timeoutMs || DEFAULT_TIMEOUT_MS,
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(d); }
        catch (e) {
          // §1.3 — a non-JSON body from the model host is a loud specific
          // failure, not an empty answer that looks like the model had
          // nothing to say.
          reject(new Error(`[chat-tools] non-JSON response from ${host}/api/chat (${r.statusCode}): ${String(d).slice(0, 200)}`));
          return;
        }
        if (parsed.error) {
          reject(new Error(`[chat-tools] ollama error: ${typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error)}`));
          return;
        }
        const msg = parsed.message || {};
        resolve({
          text: msg.content || '',
          toolCalls: normalizeToolCalls(msg.tool_calls),
          model: parsed.model || model,
          raw: parsed,
        });
      });
    });

    req.on('error', e => reject(new Error(`[chat-tools] transport: ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`[chat-tools] timeout after ${timeoutMs || DEFAULT_TIMEOUT_MS}ms`)); });
    req.write(body);
    req.end();
  });
}

/**
 * normalizeToolCalls(raw) — one shape out, whatever came in.
 *
 * Ollama returns OpenAI-shaped {id, function:{name, arguments}}. `arguments`
 * arrives as an object from Ollama itself but as a JSON STRING from anything
 * OpenAI-compatible sitting in front of it. Both are handled here, once, so no
 * caller has to guess which it got — the original P1 bug was exactly this
 * (argument extraction checking the wrong nesting level).
 *
 * A call with no resolvable name is DROPPED rather than passed through as
 * {name: undefined} — executeTool would report "unknown tool 'undefined'",
 * which reads like a tool registry problem when it is really a malformed
 * response. Dropping it keeps the failure honest at its real source.
 */
function normalizeToolCalls(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((c, i) => {
    const fn = c.function || {};
    const rawArgs = c.arguments !== undefined ? c.arguments : fn.arguments;
    let args;
    if (typeof rawArgs === 'string') {
      try { args = JSON.parse(rawArgs); } catch { args = {}; }
    } else {
      args = rawArgs || {};
    }
    return { id: c.id || `call_${i}`, name: c.name || fn.name, arguments: args };
  }).filter(c => c.name);
}

module.exports = { MODULE_ID, VERSION, DEFAULT_TIMEOUT_MS, callChatWithTools, normalizeToolCalls };
