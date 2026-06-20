'use strict';
// ── agents/chatgpt/index.js ───────────────────────────────────────────────────
// UUID: mod-chatgpt-v5-0000-4000-0000-000000000001
//
// §GAP-FIX: cortex/agents/index.js's setDeps({ ollama, claude, chatgpt, gemini })
// has expected a chatgpt sub-agent since v5 — it never existed. Any agent_calls
// row with routedTo==='chatgpt' hit the dispatcher's "No sub-agent registered"
// branch and failed silently. This fills that gap.
//
// Unlike agents/claude/index.js (which reimplements its own raw HTTPS call to
// api.anthropic.com), this delegates to guardian/api-dispatch.js — that module
// already has a complete, working OpenAI provider config (model, body shape,
// text/usage extraction) built for the same purpose. Reusing it instead of a
// second hand-rolled HTTPS client is the §FIX-ROADMAP-62 lesson applied here:
// don't fork a second source of truth for "how to call OpenAI" when one
// already exists and works.
//
// LAW I: only reached when ollama is unavailable or explicitly requested.
// §M1: init(cfg) + stop() + dispatch(call).
// §M2: reads: agent_calls. writes: agent_calls, event_log, failures.

const { jaaDB, uid } = require('../../memory/jaa-db');
const apiDispatch     = require('../../../guardian/api-dispatch');

const MODULE_ID = 'agents/chatgpt';
const PROVIDER  = 'chatgpt';

let _interval = null;
let _cfg      = {};

function init(cfg = {}) {
  _cfg      = cfg;
  _interval = setInterval(_tick, _cfg.pollMs ?? 3000);
  _interval.unref();
}

function stop() {
  clearInterval(_interval);
  _interval = null;
}

async function _tick() {
  try {
    const pending = jaaDB.query('agent_calls', r => r.routedTo === PROVIDER && r.status === 'routed', 3);
    for (const call of pending) await dispatch(call).catch(() => {});
  } catch {}
}

async function dispatch(call) {
  if (!apiDispatch.isAvailable(PROVIDER)) {
    const err = 'OPENAI_API_KEY not set — chatgpt agent unavailable';
    jaaDB.update('agent_calls', call.uuid, { status: 'failed', error: err });
    jaaDB.insert('failures', { uuid: uid(), source: MODULE_ID, error: err, ts: Date.now() });
    throw new Error(err);
  }

  jaaDB.update('agent_calls', call.uuid, { status: 'processing', agentModule: MODULE_ID, startedAt: Date.now() });

  try {
    const res = await apiDispatch.dispatch(PROVIDER, call.prompt || call.content || '', {
      command: call.command || 'code',
      jobId:   call.uuid,
    });
    if (!res.ok) throw new Error(res.error || 'chatgpt dispatch failed');

    jaaDB.update('agent_calls', call.uuid, {
      status: 'complete', result: res.text, usage: res.usage, completedAt: Date.now(),
    });
    jaaDB.insert('event_log', {
      uuid: uid(), type: 'agent.response.received',
      payload: { callUuid: call.uuid, agent: PROVIDER, chars: (res.text || '').length, usage: res.usage },
      source: MODULE_ID, causedBy: call.uuid, ts: Date.now(),
    });
  } catch (err) {
    jaaDB.update('agent_calls', call.uuid, { status: 'failed', error: err.message });
    jaaDB.insert('failures', { uuid: uid(), source: MODULE_ID, error: err.message, stack: err.stack, causedBy: call.uuid, ts: Date.now() });
    throw err;
  }
}

module.exports = { init, stop, dispatch };
