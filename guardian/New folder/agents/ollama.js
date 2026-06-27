'use strict';
// ── guardian/agents/ollama.js ───────────────────────────────────────────────
// UUID: mod-ollama-v6-0000-4000-0000-000000000001
//
// Ollama local agent — LAW I enforcement point. MOVED from
// cortex/agents/ollama/index.js (2026-06-20): Ollama is a local HTTP service,
// not part of Cortex's intelligence/memory stack, and Guardian already owns
// every other local-model touchpoint (ollama-runtime.js, the dispatch-pool
// native path in guardian/server.js). Having a second, independent Ollama
// HTTP client wired unconditionally into cortex/boot.js's setDeps() meant
// Ollama logic was duplicated in two places and "baked in" to Cortex's hard
// boot phases — if Cortex booted, this started, whether or not Ollama (or
// anyone wanting it) was actually present.
//
// This version:
//   - Lives in Guardian, not Cortex.
//   - Is NOT baked in: init() is only called from guardian/server.js's boot
//     sequence, as a SOFT phase, and only after a live ping() succeeds. If
//     Ollama isn't running, this never starts — no interval, no polling, no
//     failed requests every 2s. Guardian boots fine either way.
//   - Reuses ollama-runtime.js (the already-hardened streaming client with
//     the non-200 / silent-hang fixes) instead of re-implementing a second,
//     separate non-streaming HTTP client against /api/chat.
//
// Contract (unchanged from the old Cortex-side module, so nothing downstream
// — Guardian's own LAW I fallback in guardian/agents/index.js, any UI that
// reads agent_calls/cortex_memory/event_log — needs to change):
//   reads:  agent_calls (routedTo='ollama', status='routed')
//   writes: agent_calls, cortex_memory, event_log, failures

const { jaaDB, uid } = require('../../cortex/memory/jaa-db');

const MODULE_ID = 'guardian/agents/ollama';

// Lazy, optional — exactly like guardian/server.js's own _ollamaRuntime load.
// If ollama-runtime.js is missing for some reason, this agent simply never
// becomes available; nothing crashes.
const _runtime = (() => { try { return require('../../ollama-runtime'); } catch (_) { return null; } })();

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:7b-instruct-q4_K_M';

let _interval = null;
let _cfg      = {};

// ── init — only call this after confirming Ollama is actually reachable ────
function init(cfg = {}) {
  if (_interval) return; // already running
  if (!_runtime) {
    console.warn(`[${MODULE_ID}] ollama-runtime.js not found — agent not started`);
    return;
  }
  _cfg      = cfg;
  _interval = setInterval(_tick, _cfg.pollMs ?? 2000);
  _interval.unref();
  console.log(`[${MODULE_ID}] started — model=${OLLAMA_MODEL} pollMs=${_cfg.pollMs ?? 2000}`);
}

function stop() {
  if (_interval) clearInterval(_interval);
  _interval = null;
}

function isRunning() {
  return !!_interval;
}

async function _tick() {
  try {
    const pending = jaaDB.query('agent_calls', r => r.routedTo === 'ollama' && r.status === 'routed', 5);
    for (const call of pending) await dispatch(call);
  } catch (err) {
    jaaDB.insert('failures', { uuid: uid(), source: MODULE_ID, error: err.message, stack: err.stack, ts: Date.now() });
  }
}

// ── dispatch — also used directly by the generic agent dispatcher if it's
// still wired to call sub-agents by name (kept for drop-in compatibility) ──
async function dispatch(call) {
  jaaDB.update('agent_calls', call.uuid, { status: 'processing', agentModule: MODULE_ID, startedAt: Date.now() });

  const mem = jaaDB.tail('cortex_memory', 6)
    .map(m => `[${(m.tags || []).join('·')}] ${m.content}`)
    .join('\n');

  const systemPrompt = `You are CORTEX — the intelligence layer of NEXUS v5.0.\n\nCURRENT MEMORY:\n${mem || '(empty)'}\n\nRespond as CORTEX: concise, technical, system-aware.`;

  try {
    const result = await _generate(systemPrompt, call.prompt || call.content || '');

    jaaDB.update('agent_calls', call.uuid, {
      status:      'complete',
      result,
      completedAt: Date.now(),
    });

    jaaDB.insert('cortex_memory', {
      uuid:    uid(),
      tags:    ['agent', 'ollama', 'response', ...(call.tags || [])],
      type:    'recall',
      content: result.slice(0, 400),
      source:  MODULE_ID,
      causedBy: call.uuid,
      ts:      Date.now(),
    });

    jaaDB.insert('event_log', {
      uuid:     uid(),
      type:     'agent.response.received',
      payload:  { callUuid: call.uuid, agent: 'ollama', chars: result.length },
      source:   MODULE_ID,
      causedBy: call.uuid,
      ts:       Date.now(),
    });

  } catch (err) {
    jaaDB.update('agent_calls', call.uuid, { status: 'failed', error: err.message });
    jaaDB.insert('failures', {
      uuid:     uid(),
      source:   MODULE_ID,
      error:    err.message,
      stack:    err.stack,
      causedBy: call.uuid,
      ts:       Date.now(),
    });
    throw err;
  }
}

// ── generate — wraps ollama-runtime.js's streamGenerate (buffered) instead
// of duplicating a second raw HTTP client. Picks up the same non-200 /
// silent-hang fixes already made there. ──────────────────────────────────
function _generate(system, prompt) {
  if (!_runtime) return Promise.reject(new Error('ollama-runtime.js not available'));
  return new Promise((resolve, reject) => {
    let buf = '';
    _runtime.streamGenerate(
      { model: OLLAMA_MODEL, prompt, system },
      (token) => { buf += token; },
      ()      => resolve(buf),
      (err)   => reject(err instanceof Error ? err : new Error(String(err))),
    );
  });
}

// ── Health check — delegates to ollama-runtime.js's ping() ─────────────────
async function ping() {
  if (!_runtime) return { online: false, status: 'ollama-runtime.js not found' };
  const online = await _runtime.ping();
  return { online, status: online ? 200 : 'unreachable' };
}

module.exports = { init, stop, isRunning, dispatch, ping, MODEL: OLLAMA_MODEL };
