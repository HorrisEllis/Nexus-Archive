'use strict';
/**
 * guardian/lib/mesh-client.js — guardian's client for the Clear Glass agent mesh (:7702, CLEARGL_IPC_PORT).
 * Contract (docs/2026-09-19-guardian-mesh-first-dispatch-phasemap.spec):
 *   POST /agent-mesh/send     {provider,prompt,content,agentId,accountId,jobId,selectors,timeoutMs}
 *        -> {ok, text?, chatUrl?, agentId?, accountId?, sent, stage?, error?}
 *   POST /agent-mesh/diagnose {provider,agentId,accountId,stage,selectors}
 *        -> {ok, repaired, selectors?, evidence?}
 * `sent` is the load-bearing field: true once the prompt was injected into the agent's chat.
 * Anything that stops us reaching the mesh (refused, timeout, 404 because the endpoint is not built yet,
 * garbage body) is reported as { ok:false, sent:false, stage:'mesh_unreachable' } so the ladder falls back
 * to the userscript. A transport failure AFTER the mesh accepted the request cannot be told apart from
 * "never sent", so it is reported as sent:true when the mesh had already answered with sent:true, else false
 * only for connection-level errors that provably precede delivery (ECONNREFUSED/ENOTFOUND/EHOSTUNREACH).
 */
const http = require('http');
const PRE_DELIVERY = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ECONNRESET_BEFORE_WRITE']);

function post(pathname, body, timeoutMs, port) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request({ hostname: '127.0.0.1', port, path: pathname, method: 'POST', timeout: timeoutMs,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 404) return resolve({ ok: false, sent: false, stage: 'mesh_unreachable', error: `${pathname} not served by Clear Glass (404)` });
        try { resolve(JSON.parse(d)); } catch (_) { resolve({ ok: false, sent: false, stage: 'mesh_unreachable', error: 'unparseable mesh response' }); }
      });
    });
    req.on('error', (e) => resolve({ ok: false, sent: false, stage: 'mesh_unreachable', error: e.code || e.message, preDelivery: PRE_DELIVERY.has(e.code) }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, sent: null, stage: 'mesh_timeout', error: 'mesh did not answer in time' }); });
    req.write(data); req.end();
  });
}

function createMeshClient({ port = parseInt(process.env.CLEARGL_IPC_PORT || '7702', 10), marginMs = 5000 } = {}) {
  return {
    // A timeout is AMBIGUOUS (the prompt may already be in the chat) => sent:null, which the ladder treats as
    // "possibly sent": it must not fall back to NCP and resend.
    send: (a) => post('/agent-mesh/send', a, (a.timeoutMs || 90000) + marginMs, port),
    diagnose: (a) => post('/agent-mesh/diagnose', a, 30000, port),
  };
}
module.exports = { createMeshClient };
