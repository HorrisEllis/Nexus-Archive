'use strict';
/**
 * guardian/lib/wake-relay.js — James, Option A, in his own words: "Drop the
 * in-page detection, wire the assistant-side trigger through guardian the
 * way ClearGlass already does it. Real work, but it removes the guessing."
 *
 * This is that real work, for the case ClearGlass's own version
 * (clear-glass/src/copilot/wake-relay.js) does not cover: a standalone
 * Tampermonkey install with no Electron ProviderHost, no BrowserWindow map,
 * and therefore no injectAnswer(). guardian/userscript-claude.js runs in an
 * ordinary browser tab — the only channel back into that tab guardian has is
 * the NCP SSE connection it already holds open for job dispatch.
 *
 * §HONEST NOTE — checked, not assumed: ClearGlass's own wake-relay.js calls
 * `guardianHost:guardianPort/copilot/prompt`, a route that does not exist
 * anywhere in guardian/server.js (confirmed by direct search). That relay is
 * therefore not currently functional either, independent of this file. Not
 * fixed here — out of scope for this change, flagged so it isn't mistaken
 * for a working reference implementation. This file dispatches straight to
 * co-pilot's own real, confirmed endpoint instead of repeating that gap.
 *
 * The real chain this file closes, end to end:
 *   1. guardian/userscript-claude.js's _nexusLogMessage() reports EVERY
 *      message (both roles) to cortex's /api/meta/observe once the message
 *      text is stable and complete — reusing the exact stabilization
 *      technique startWatch() already proves reliable, not the fragile
 *      count-changed trigger the old in-page detection used.
 *   2. cortex/boot.js's /api/meta/observe handler runs the real, shared
 *      WAKE_RE against that text server-side (identical grammar to
 *      lib/agent-chat.js and guardian/userscript-nexus-wake.js — one
 *      pattern, checked at boot by tests/modules/test-nexus-wake.js's own
 *      NW-002, not duplicated blind) and broadcasts nexus.wake.detected
 *      over its own /sse, including the real tabId the message came from.
 *   3. THIS FILE subscribes to that broadcast, dispatches the request to
 *      co-pilot's real /api/prompt/tools (the same full agentic tool loop
 *      the composer-typed path already uses via GM_xmlhttpRequest — direct
 *      HTTP here, no CORS to work around since this is server-to-server),
 *      and pushes the real answer back down guardian's own NCP channel to
 *      the exact tab it came from via ncp.pushTab().
 *   4. guardian/userscript-claude.js's _handleServerMessage() receives
 *      GUARDIAN_WAKE_ANSWER and calls nexus-wake's own deliverAnswer(),
 *      reusing the SAME _deliver() the composer-typed path already uses —
 *      one delivery mechanism, two triggers, not two that can drift.
 */
const http = require('http');

function startWakeRelay(ncp, opts = {}) {
  const cortexHost = opts.cortexHost || '127.0.0.1';
  const cortexPort = opts.cortexPort || 3748;
  const copilotHost = opts.copilotHost || '127.0.0.1';
  const copilotPort = opts.copilotPort || 3750;
  const log = opts.log || (() => {});

  let stopped = false;

  function connect() {
    if (stopped) return;
    const req = http.request(
      { hostname: cortexHost, port: cortexPort, path: '/sse', method: 'GET', headers: { Accept: 'text/event-stream' } },
      (res) => {
        let buf = '';
        res.on('data', (chunk) => {
          buf += chunk.toString();
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const l of lines) {
            if (!l.startsWith('data:')) continue;
            let d; try { d = JSON.parse(l.slice(5).trim()); } catch (_) { continue; }
            if (d.type !== 'nexus.wake.detected') continue;
            handleWake(d);
          }
        });
        res.on('end', () => { if (!stopped) setTimeout(connect, 3000); });
      }
    );
    req.on('error', () => { if (!stopped) setTimeout(connect, 3000); });
    req.end();
  }

  async function handleWake(d) {
    // §1.2 — the two real facts pushTab needs to reach the right tab. A
    // wake row with either missing is a real, statable miss, not a silent
    // drop — the operator should be able to see WHY an assistant-said "hey
    // nexus" never got answered, from this process's own log, not by
    // guessing.
    if (!d.agent) { log(`[wake-relay] event with no agent, cannot route back — "${(d.request || '').slice(0, 60)}"`); return; }
    if (!d.tabId) { log(`[wake-relay] event with no tabId (older client, or ClearGlass-side path) — skipped, not this relay's case: "${(d.request || '').slice(0, 60)}"`); return; }
    log(`[wake-relay] wake from ${d.agent}:${d.tabId}${d.account ? ' (' + d.account + ')' : ''}: ${(d.request || '').slice(0, 80)}`);
    try {
      const r = await new Promise((resolve, reject) => {
        const body = JSON.stringify({ prompt: d.request, sessionId: d.sessionId || undefined });
        const req2 = http.request(
          { hostname: copilotHost, port: copilotPort, path: '/api/prompt/tools', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
          (res2) => { let b = ''; res2.on('data', c => b += c); res2.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } }); }
        );
        req2.on('error', reject);
        req2.write(body); req2.end();
      });
      if (!r.ok) { log(`[wake-relay] co-pilot refused for ${d.agent}:${d.tabId} — ${r.error || 'no reason given'}`); return; }
      const text = r.text || null;
      if (!text) { log(`[wake-relay] co-pilot returned no answer for ${d.agent}:${d.tabId}`); return; }
      const sent = ncp.pushTab(d.agent, d.tabId, {
        type: 'GUARDIAN_WAKE_ANSWER', request: d.request, answer: text,
      });
      if (!sent) log(`[wake-relay] pushTab failed for ${d.agent}:${d.tabId} — tab no longer connected; the answer is real but has nowhere to land`);
    } catch (e) {
      log(`[wake-relay] relay failed for ${d.agent}:${d.tabId}: ${e.message}`);
    }
  }

  connect();
  return { stop: () => { stopped = true; } };
}

module.exports = { startWakeRelay };
