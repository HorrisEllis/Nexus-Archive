'use strict';
/**
 * lib/agent-tools/tools/clear-glass/eros-wire-client.js
 *
 * §BUILT 2026-09-06 — extracted from macro.js's own _erosRequest/
 * _erosExecute/_erosSetProfile, verbatim, not reimplemented. Reason:
 * guardian/clear-glass-bridge.js needed the exact same erosmancer-wire
 * call (confirmed directly — Guardian's dispatchBrowserCommand only ever
 * reaches ClearGlass's IpcBridge on :7702, never erosmancer's pipeline on
 * :7704, despite the pipeline already existing and working here). Copying
 * the function into guardian/ instead of sharing it would recreate the
 * exact drift risk that file's own header already calls out for
 * _responseTypeFor — two copies of "how to talk to erosmancer" that could
 * silently diverge. This module is the single source of truth instead;
 * macro.js now requires it rather than defining these locally.
 *
 * §HONEST LIMIT — same as macro.js's own: erosmancer targets elements by
 * a real NodeRegistry UUID, not a raw CSS selector. A caller needs a real,
 * already-resolved targetUuid — this module doesn't create one.
 */
const http = require('http');

const WIRE_PORT = parseInt(process.env.EROS_WIRE_PORT || '7704', 10);
const EROS_EXECUTE_ACTIONS = new Set(['click', 'type', 'hover', 'scroll', 'evaluate', 'navigate', 'screenshot']);

function _erosRequest(method, urlPath, body) {
  return new Promise((resolve) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request(
      { hostname: '127.0.0.1', port: WIRE_PORT, path: urlPath, method,
        timeout: 20000, headers: data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {} },
      (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (_) { resolve({ status: res.statusCode, body: { ok: false, error: 'erosmancer wire returned an unparseable body' } }); }
      }); }
    );
    req.on('error', (e) => resolve({ status: 503, body: { ok: false, error: `erosmancer wire unreachable on :${WIRE_PORT}: ${e.code || e.message}` } }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 503, body: { ok: false, error: 'erosmancer wire timed out' } }); });
    if (data) req.write(data);
    req.end();
  });
}

/** _erosSetProfile — real, once-per-run behavior profile for a tab. */
async function _erosSetProfile(tabId, profile) {
  const r = await _erosRequest('POST', '/eros/behavior/profile', { sessionId: tabId, profile });
  return r.body;
}

/**
 * _erosExecute — one real step through erosmancer's real, unified
 * pipeline. §GUARDIAN-SAFETY 2026-09-06 — deliberately does NOT include
 * any password-field awareness here: this module has no way to know an
 * element's tag/type from a UUID alone without a registry lookup, so
 * enforcing the non-silent-autofill boundary (plugins/passwords/
 * index.js's real, stated policy) is the CALLER's responsibility — every
 * caller of this function (Guardian included) must not route a
 * credential-field target through here directly; that boundary is
 * documented, not silently assumed to be someone else's problem.
 */
async function _erosExecute(tabId, action, targetUuid, payload, profile) {
  if (!EROS_EXECUTE_ACTIONS.has(action)) {
    return { error: `"${action}" is not one of erosmancer's real execute actions: ${[...EROS_EXECUTE_ACTIONS].join(', ')}` };
  }
  const r = await _erosRequest('POST', '/eros/execute', { action, uuid: targetUuid, tabId, payload, profile });
  if (r.status >= 400 || r.body?.ok === false) return { error: r.body?.error || `erosmancer execute failed (HTTP ${r.status})` };
  return { ok: true, result: r.body.result, planId: r.body.planId };
}

module.exports = { WIRE_PORT, EROS_EXECUTE_ACTIONS, _erosRequest, _erosSetProfile, _erosExecute };
