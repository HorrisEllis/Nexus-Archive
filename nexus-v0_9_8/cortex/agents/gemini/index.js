'use strict';
// ── agents/gemini/index.js ────────────────────────────────────────────────────
// UUID: mod-gemini-v5-0000-4000-0000-000000000001
//
// §GAP-FIX: same gap as agents/chatgpt — setDeps() expected this since v5,
// it never existed. Delegates to guardian/api-dispatch.js's Gemini config
// rather than reimplementing the generativelanguage.googleapis.com call.
//
// LAW I: only reached when ollama is unavailable or explicitly requested.
// §M1: init(cfg) + stop() + dispatch(call).
// §M2: reads: agent_calls. writes: agent_calls, event_log, failures.

const { jaaDB, uid } = require('../../memory/jaa-db');
const apiDispatch     = require('../../../guardian/api-dispatch');

const MODULE_ID = 'agents/gemini';
const PROVIDER  = 'gemini';

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
    const err = 'GOOGLE_AI_API_KEY not set — gemini agent unavailable';
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
    if (!res.ok) throw new Error(res.error || 'gemini dispatch failed');

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
