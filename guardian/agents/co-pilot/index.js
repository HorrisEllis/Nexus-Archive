'use strict';
// ── guardian/agents/co-pilot/index.js ───────────────────────────────────────
// UUID: nexus-copilot-v1-0000-0000-0000-000000000001
// Version: 1.0.0
//
// PATH NOTE: requested at guardian/agents/ollama/co-pilot/. That path
// collides with the existing guardian/agents/ollama.js — a flat FILE, not
// a directory — so guardian/agents/ollama/ can't also exist as a directory
// without breaking the existing require('./ollama') resolution. Built at
// guardian/agents/co-pilot/ instead: same intent (lives alongside the
// other agents, uses ollama as its inference engine via guardian/agents/
// ollama.js's existing dispatch()), without the path collision. Flagging
// this rather than silently doing it — if the nested path matters for a
// reason not visible here, say so and this can be restructured.
//
// SCOPE, deliberately not "everything": per the pushback already given
// this session before building started — this module does NOT reinvent
// context-building (reuses lib/context-builder.js), does NOT invent a
// second memory store (writes through to cortex's JAA), does NOT invent
// a second tool-permission system (reuses cortex/contract/index.js via
// RAID's _approveTool gate), and does NOT execute commands directly
// (routes through guardian's existing /cli/exec, which already does
// §LAW II ledger-before-execute). What's actually new here: a continuous
// event listener, the glue that makes a prompt go through
// context → RAID approval → existing exec → cortex memory in one place.

const crypto = require('crypto');

const MODULE_ID = 'copilot';
const VERSION   = '1.0.0';
const SOURCE    = 'copilot'; // matches cortex/contract/index.js's 'copilot' entry

let _jaa = null;
let _bus = null;
let _raid = null;
let _contextBuilder = null;
let _ollamaAgent = null;
let _dispatchAndWait = null; // chatgpt narration — the REAL path: guardian's NCP + userscript-chatgpt.js browser tab, same mechanism /cli/exec's `send` command already uses. NOT guardian/api-dispatch.js (OPENAI_API_KEY) — see §FIX below.
let _execFn = null; // injected — how to actually run an approved command
let _listening = false;
let _eventBuffer = []; // rolling window of recent bus events, for "what just happened" context
const EVENT_BUFFER_MAX = 200;

let _pollTimer = null;
let _lastSeenSeq = -1;
const POLL_MS = 1000;

function init(opts = {}) {
  _jaa            = opts.jaaDB !== undefined ? opts.jaaDB : null;
  _bus            = opts.bus !== undefined ? opts.bus : null;
  _raid           = opts.raid !== undefined ? opts.raid : safeRequire('../../../cortex/core/raid');
  _contextBuilder = opts.contextBuilder !== undefined ? opts.contextBuilder : safeRequire('../../../lib/context-builder');
  _ollamaAgent    = opts.ollamaAgent !== undefined ? opts.ollamaAgent : safeRequire('../ollama');
  _dispatchAndWait = opts.dispatchAndWait !== undefined ? opts.dispatchAndWait : null; // no safeRequire default — this isn't a requireable module, guardian/server.js must inject its own dispatchJobAndWait
  _execFn         = opts.execFn !== undefined ? opts.execFn : null; // caller (guardian/server.js) injects the real /cli/exec handler

  // §FIX: guardian's SISOStream.on(type, fn) is per-exact-type only — no
  // wildcard support (checked the class directly: this._listeners is a
  // Map keyed by literal type string, emit() only fires listeners whose
  // key matches the emitted type exactly). on('*', fn) would silently
  // register a listener that never fires, since nothing ever emits the
  // literal type '*'. The real "see everything" mechanism is bus.sample(n)
  // — the same one the existing /bus HTTP route already uses — so this
  // polls that instead, deduped by sequence number so nothing gets
  // double-processed across polls.
  if (_bus?.sample && !_listening) {
    _pollTimer = setInterval(_pollBus, POLL_MS);
    if (_pollTimer.unref) _pollTimer.unref();
    _listening = true;
  }

  return { ok: true, listening: _listening };
}

function _pollBus() {
  if (!_bus?.sample) return;
  const { entries } = _bus.sample(50);
  for (const entry of entries) {
    if (entry.seq <= _lastSeenSeq) continue;
    _lastSeenSeq = entry.seq;
    // entry.data only present when bus.logLevel === 'DATA' — otherwise
    // this is type/seq/claimed only, still useful as an activity signal
    // even without payload detail.
    _onBusEvent(entry.type, entry.data);
  }
}

function safeRequire(p) {
  try { return require(p); } catch (e) { console.warn(`[${MODULE_ID}] optional dep unavailable: ${p} (${e.message})`); return null; }
}

function _onBusEvent(type, data) {
  _eventBuffer.push({ type, data, ts: Date.now() });
  if (_eventBuffer.length > EVENT_BUFFER_MAX) _eventBuffer.shift();
  // Persist to cortex, not a local store — §2.1 persistence is the golden
  // rule, and "remember everything" means cortex's event_log, the same
  // place every other module's history already lives, not a co-pilot-only
  // log nothing else can query.
  if (_jaa) {
    try {
      _jaa.insert('event_log', {
        uuid: crypto.randomUUID(), type: `copilot.observed.${type}`, source: MODULE_ID,
        ts: Date.now(), payload: { originalType: type, data },
      });
    } catch (_) { /* observation logging must never throw and block the actual event */ }
  }
}

function recentEvents(n = 20) {
  return _eventBuffer.slice(-n);
}

/**
 * The main entry point: a prompt comes in, gets full system context,
 * and — if it implies running a command — that command is gated through
 * RAID before anything executes.
 */
async function handlePrompt(prompt, opts = {}) {
  if (!prompt || typeof prompt !== 'string') {
    return { ok: false, error: 'prompt is required' };
  }
  const requestId = crypto.randomUUID();

  let context = null;
  if (_contextBuilder?.buildContext) {
    try {
      context = await _contextBuilder.buildContext({ intent: prompt, ...opts.contextOpts });
    } catch (e) {
      console.warn(`[${MODULE_ID}] context build failed, continuing without it: ${e.message}`);
    }
  }

  const wantsTool = !!opts.command; // caller decides intent classification upstream — this module doesn't reinvent that either
  let toolResult = null;

  if (wantsTool) {
    if (!_raid?._approveTool) {
      return { ok: false, requestId, error: 'RAID approval gate unavailable — refusing to execute a tool call without it (fail-closed, not fail-open)' };
    }
    const approval = _raid._approveTool(SOURCE, opts.command, { action: 'tool', proof: opts.proof });
    if (!approval.approved) {
      _logDecision(requestId, prompt, { executed: false, denied: true, reason: approval.reason });
      return { ok: false, requestId, executed: false, denied: true, reason: approval.reason };
    }
    if (!_execFn) {
      return { ok: false, requestId, error: 'approved by RAID, but no execFn injected — caller must wire guardian\'s real /cli/exec handler in' };
    }
    try {
      toolResult = await _execFn(opts.command, { source: SOURCE, requestId });
    } catch (e) {
      toolResult = { ok: false, error: e.message };
    }
  }

  const response = {
    ok: true,
    requestId,
    // §FIX: was `context.sections?.length || 0` — context-builder.js returns
    // `sections: sections.length` (already a count, a number). Calling
    // .length on a number is undefined, so this always read 0 regardless
    // of how much context actually got built. Confirmed against the real
    // file, not assumed.
    context: context ? { sections: context.sections || 0, tokensUsed: context.tokensUsed } : null,
    toolResult,
    narration: context ? await _narrate(prompt, context, toolResult, opts.provider) : null,
    recentEvents: recentEvents(5),
  };

  _logDecision(requestId, prompt, { executed: wantsTool, toolResult, narration: response.narration?.provider || null });
  return response;
}

/**
 * Turns the built context (+ tool result, if any) into an actual narrated
 * response. LAW I: ollama (local) is tried first unless a specific provider
 * was requested or ollama isn't running; chatgpt is the explicit fallback,
 * never silent — every outcome reports which provider answered (or why
 * neither did), the same honesty rule docs/copilot.spec's not_built list
 * was flagging before this existed.
 *
 * §FIX 2026-06-22 (James): chatgpt here means the REAL mechanism this
 * system is built around — the logged-in browser tab via
 * guardian/userscript-chatgpt.js + lib/ncp.js, the same path /cli/exec's
 * `send <provider> <prompt>` already uses (createJob/dispatchJob). This
 * used to call guardian/api-dispatch.js's direct OpenAI API instead,
 * which needs OPENAI_API_KEY — a different mechanism entirely
 * (cortex/agents/chatgpt's RAID job-queue fallback uses that one on
 * purpose). Wrong default for an everyday narrator with no API key
 * configured; the browser tab needs no key at all. Removed, not patched
 * around.
 *
 * Deliberately NOT chatgpt-mode.js here either — chatgpt-mode does its
 * own Nexus-records retrieval (cortex's /api/search) as its whole
 * purpose, and ALSO calls api-dispatch.js's API-key path by design for
 * THAT feature. Co-pilot already built its own context via
 * lib/context-builder.js; this just needs to narrate it through whichever
 * tab is actually connected.
 */
async function _narrate(prompt, context, toolResult, requestedProvider) {
  if (!context?.systemPrompt) return null;

  const system = context.systemPrompt +
    (toolResult ? `\n=== TOOL RESULT ===\n${JSON.stringify(toolResult).slice(0, 1000)}\n` : '');
  // The NCP/userscript job shape has no separate system-role field — see
  // handleJob() in guardian/userscript-chatgpt.js, it just concatenates
  // prompt+content into one message. Building the combined text here
  // rather than relying on that concatenation's exact field order, so
  // this doesn't silently break if that ordering ever changes.
  const combined = `${system}\n\n=== USER ===\n${prompt}`;

  const wantsOllama  = requestedProvider === 'ollama';
  const wantsChatgpt = requestedProvider === 'chatgpt';
  const isAuto       = !wantsOllama && !wantsChatgpt; // LAW I default

  if (wantsOllama || isAuto) {
    if (_ollamaAgent?.generate && _ollamaAgent.isRunning?.()) {
      try {
        const text = await _ollamaAgent.generate(system, prompt);
        return { provider: 'ollama', text };
      } catch (e) {
        if (wantsOllama) return { provider: 'ollama', error: e.message };
        // isAuto: fall through to chatgpt below — LAW I fallback, not a dead end
      }
    } else if (wantsOllama) {
      return { provider: 'ollama', error: 'ollama not running' };
    }
  }

  if (wantsChatgpt || isAuto) {
    if (!_dispatchAndWait) {
      return { provider: 'chatgpt', error: 'guardian did not inject a dispatcher — co-pilot.init() needs dispatchAndWait wired in' };
    }
    const res = await _dispatchAndWait('chatgpt', combined, { command: 'chat' });
    return res.ok
      ? { provider: 'chatgpt', text: res.text }
      : { provider: 'chatgpt', error: res.error };
  }

  return { provider: requestedProvider, error: `unknown provider: ${requestedProvider}` };
}

function _logDecision(requestId, prompt, outcome) {
  if (!_jaa) return;
  try {
    _jaa.insert('event_log', {
      uuid: crypto.randomUUID(), type: 'copilot.decision', source: MODULE_ID,
      ts: Date.now(), payload: { requestId, prompt: prompt.slice(0, 500), ...outcome },
    });
  } catch (_) {}
}

function status() {
  return {
    listening: _listening,
    eventBufferSize: _eventBuffer.length,
    raidAvailable: !!_raid?._approveTool,
    contextBuilderAvailable: !!_contextBuilder?.buildContext,
  };
}

function stop() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
  _listening = false;
}

module.exports = { init, stop, handlePrompt, recentEvents, status, MODULE_ID, VERSION };
