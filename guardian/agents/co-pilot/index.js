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
    context: context ? { sections: context.sections?.length || 0, tokensUsed: context.tokensUsed } : null,
    toolResult,
    recentEvents: recentEvents(5),
  };

  _logDecision(requestId, prompt, { executed: wantsTool, toolResult });
  return response;
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
