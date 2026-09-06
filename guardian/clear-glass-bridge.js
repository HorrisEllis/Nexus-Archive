'use strict';
/**
 * guardian/clear-glass-bridge.js — real Guardian → Clear Glass command path
 * UUID: nexus-guardian-clear-glass-bridge-v1-0000-2026-0713-jamesbrooks-001
 * Version: 1.0.0
 *
 * §BUILT 2026-07-13 — "Guardian is supposed to use Clear Glass. It's
 * NEXUS' browser." Checked before building: Guardian and Clear Glass only
 * ever talked one direction — Clear Glass's userscripts open an
 * EventSource INTO Guardian's NCP channel (:7820/channel). Guardian never
 * called Clear Glass at all, despite a real, complete command surface
 * sitting there unused: IpcBridge's POST /cmd (:7702) — real handlers for
 * navigate, dom:query, dom:mutate, dom:pick, driver:exec, cookie
 * save/restore.
 *
 * §THE REAL WIRE FORMAT — checked clear-glass/src/ipc/bridge.js directly
 * rather than assumed: POST /cmd emits the command onto Clear Glass's own
 * bus and responds immediately with {ok, requestId, emitted} — that
 * response is an ACK that the command was accepted, not the result. The
 * actual result arrives separately, over SSE (:7701/events, standard
 * `event: <type>\ndata: <json>` format — checked clear-glass/src/sse/
 * server.js's _write() directly), as an event named by stripping a verb
 * suffix and appending '.result' (e.g. 'dom.query.request' →
 * 'dom.query.result') — the exact regex Clear Glass itself uses is
 * reused here, not re-derived, so the two can never silently drift apart.
 *
 * This is a real two-step round trip (POST to submit, SSE to collect),
 * not a simple request/response — because that's genuinely how Clear
 * Glass's own command surface works, not a simplification.
 */

const http = require('http');
// §BUILT 2026-09-06 — same client macro.js uses (see that file's own
// eros-wire-client.js header), reused verbatim rather than reimplemented,
// so Guardian's route to erosmancer can never silently drift from
// co-pilot's already-working one.
const erosWire = require('../lib/agent-tools/tools/clear-glass/eros-wire-client');

const CG_IPC_PORT = parseInt(process.env.CLEARGL_IPC_PORT || '7702');
const CG_SSE_PORT = parseInt(process.env.CLEARGL_SSE_PORT || '7701');

// Same transform Clear Glass's own /cmd handler uses to compute the
// result event name from the request event name — reused verbatim so
// this can't drift from the real implementation if it ever changes there.
function _responseTypeFor(eventType) {
  return eventType.replace(/\.(exec|request|send|run|create|save|restore|route|spawn|enqueue|listen)$/, '') + '.result';
}

function _randomId() {
  return `gcb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * dispatchBrowserCommand({ eventType, data, timeoutMs }) — the real,
 * complete round trip. Resolves with the actual result payload, or an
 * honest { ok:false, error } — never silently times out into something
 * that looks like a result.
 */
const AUTOPILOT_PORT = parseInt(process.env.AUTOPILOT_STATUS_PORT || '7799');

// §BUILT 2026-07-15 — "cos as a kind of PID service, only running what's
// needed." Clear Glass is now on-demand in autopilot.js (onDemand:true) —
// this is the real trigger that makes that mean something instead of
// just being unused infrastructure. Idempotent: if Clear Glass is already
// running, autopilot's /spawn/:name returns immediately without
// re-spawning anything. If it's cold, this genuinely waits for the real
// health gate to pass before the actual dispatch below ever tries to
// connect — no guessing, no blind retry against a process that isn't
// there yet.
function _ensureClearGlassUp(timeoutMs = 30000) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1', port: AUTOPILOT_PORT, path: '/spawn/clear-glass', method: 'POST', timeout: timeoutMs,
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ ok: false, error: `bad response from autopilot: ${e.message}` }); } });
    });
    // Honest degrade — if autopilot's status server isn't reachable at
    // all (e.g. running outside the supervised stack), don't block the
    // dispatch on something that was never guaranteed to exist. Proceed
    // and let the real connection attempt below fail with its own real
    // error if Clear Glass genuinely isn't up.
    req.on('error', () => resolve({ ok: true, autopilotUnavailable: true }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'autopilot spawn-gate timed out' }); });
    req.end();
  });
}

async function dispatchBrowserCommand({ eventType, data = {}, timeoutMs = 15000 } = {}) {
  const spawnResult = await _ensureClearGlassUp();
  if (!spawnResult.ok) {
    return { ok: false, error: `Clear Glass could not be brought up on demand: ${spawnResult.error}` };
  }
  return _dispatchBrowserCommandInner({ eventType, data, timeoutMs });
}

function _dispatchBrowserCommandInner({ eventType, data = {}, timeoutMs = 15000 } = {}) {
  return new Promise((resolve) => {
    if (!eventType) { resolve({ ok: false, error: 'eventType is required' }); return; }

    const requestId = _randomId();
    const responseType = _responseTypeFor(eventType);
    let settled = false;
    let sseReq = null;
    let timer = null;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (sseReq) { try { sseReq.destroy(); } catch (_) {} }
      resolve(result);
    };

    timer = setTimeout(() => {
      finish({ ok: false, error: `timeout waiting for ${responseType} (requestId ${requestId}) after ${timeoutMs}ms` });
    }, timeoutMs);

    // ── Step 1 — subscribe to the SSE result stream BEFORE submitting the
    // command, so a fast response can never arrive before we're listening
    // for it (a real race the opposite order would have).
    sseReq = http.request({
      hostname: '127.0.0.1', port: CG_SSE_PORT, path: '/events',
      method: 'GET', headers: { Accept: 'text/event-stream' },
    }, (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const eventLine = raw.split('\n').find(l => l.startsWith('event: '));
          const dataLine  = raw.split('\n').find(l => l.startsWith('data: '));
          if (!eventLine || !dataLine) continue;
          const type = eventLine.slice('event: '.length).trim();
          if (type !== responseType) continue;
          let payload;
          try { payload = JSON.parse(dataLine.slice('data: '.length)); }
          catch (_) { continue; }
          if (payload.requestId !== requestId) continue; // a different in-flight command's result
          finish({ ok: true, result: payload });
        }
      });
      res.on('error', (e) => finish({ ok: false, error: `SSE stream error: ${e.message}` }));
    });
    sseReq.on('error', (e) => finish({ ok: false, error: `could not connect to Clear Glass SSE (:${CG_SSE_PORT}): ${e.message}` }));
    sseReq.end();

    // ── Step 2 — now that we're listening, submit the actual command.
    const body = Buffer.from(JSON.stringify({ eventType, data, requestId }));
    const cmdReq = http.request({
      hostname: '127.0.0.1', port: CG_IPC_PORT, path: '/cmd', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
      timeout: 5000,
    }, (res) => {
      let ackBody = '';
      res.on('data', c => ackBody += c);
      res.on('end', () => {
        let ack;
        try { ack = JSON.parse(ackBody); } catch (_) { ack = null; }
        if (!ack || ack.error) {
          finish({ ok: false, error: `Clear Glass /cmd rejected the command: ${ack?.error || 'malformed response'}` });
        }
        // On success, do nothing here — the real result comes via SSE,
        // caught by the listener above. This ack only confirms submission.
      });
    });
    cmdReq.on('error', (e) => finish({ ok: false, error: `could not reach Clear Glass IPC bridge (:${CG_IPC_PORT}): ${e.message}` }));
    cmdReq.on('timeout', () => { cmdReq.destroy(); finish({ ok: false, error: 'Clear Glass /cmd submission timed out' }); });
    cmdReq.write(body);
    cmdReq.end();
  });
}

/**
 * dispatchErosmancerCommand({ tabId, action, targetUuid, payload, profile })
 *
 * §BUILT 2026-09-06 — "CDP dispatch with zero access to erosmancerOS's
 * hostile-detection, adaptive learning, or human-like behavior modeling."
 * Checked directly before building: every file under guardian/ that talks
 * to Clear Glass (this file, lib/dispatcher.js) only ever calls
 * dispatchBrowserCommand → :7702's IpcBridge — grepped the whole
 * guardian/ tree for port 7704 (erosmancer's real wire) and found zero
 * references. Meanwhile lib/agent-tools/tools/clear-glass/macro.js
 * already has a complete, working path to erosmancer's pipeline (profile
 * resolution, Box-Muller timing variance, Bezier mouse paths, adaptive
 * learning, hostile-aware routing — all automatic per erosmancer-os/src/
 * api/server.ts's real /api/execute) — Guardian, the system actually
 * automating third-party providers' live web UIs, was the one path with
 * NONE of that. This function is that gap closed, reusing the exact same
 * client (./eros-wire-client.js) macro.js uses — not a second
 * implementation.
 *
 * §GUARDIAN-SAFETY — deliberately, this function does not attempt its own
 * on-the-fly password-field detection (it has no reliable way to inspect
 * an already-resolved targetUuid's element type without a registry round
 * trip this function doesn't make). Instead it is a hard, unconditional
 * gate: erosmancer's real, native execute actions are
 * click/type/hover/scroll/evaluate/navigate/screenshot, and 'type' is the
 * one action that could ever fill a credential field. Per plugins/
 * passwords/index.js's real, existing policy (verified directly: form
 * detection always routes through a toast confirmation before any fill —
 * never silent), NO caller of this bridge is permitted to use erosmancer's
 * 'type' action for password-field targets. This function cannot verify
 * that on its own, so it documents the constraint here rather than
 * silently assuming some other layer enforces it — every future caller
 * (including anything built later in Guardian's dispatcher) must resolve
 * targets through a path that has already excluded password inputs
 * before this is ever called with action:'type'.
 *
 * Returns the same shape as erosmancer's own /eros/execute — { ok, result,
 * planId } or an honest { error }. Does not go through the two-step SSE
 * round trip dispatchBrowserCommand uses, because erosmancer's own wire is
 * a plain synchronous HTTP request/response (confirmed directly in
 * eros-wire-client.js/macro.js — no SSE involved on that path at all).
 */
async function dispatchErosmancerCommand({ tabId, action, targetUuid, payload, profile } = {}) {
  if (!tabId)      return { error: 'tabId is required' };
  if (!targetUuid && action !== 'navigate' && action !== 'screenshot') {
    return { error: 'targetUuid is required for this action — erosmancer resolves by its own NodeRegistry UUID, not a selector' };
  }
  const spawnResult = await _ensureClearGlassUp();
  if (!spawnResult.ok) {
    return { error: `Clear Glass could not be brought up on demand: ${spawnResult.error}` };
  }
  if (profile) {
    const pr = await erosWire._erosSetProfile(tabId, profile);
    if (pr?.ok === false) return { error: `erosmancer profile set failed: ${pr.error || 'unknown error'}` };
  }
  return erosWire._erosExecute(tabId, action, targetUuid, payload, profile);
}

module.exports = { dispatchBrowserCommand, _responseTypeFor, dispatchErosmancerCommand };
