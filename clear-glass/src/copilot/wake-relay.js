'use strict';
/**
 * src/copilot/wake-relay.js — closes the real loop James described:
 * "hey nexus" said in any agent tab -> guardian/cortex detects it
 * server-side -> relayed to co-pilot -> the real answer injected back
 * into that exact tab, not just printed somewhere else.
 *
 * Complements cli/nexus-repl.js's `wake` command rather than replacing
 * it — that one is for a human watching a terminal; this one is for
 * ClearGlass itself to close the loop automatically, live, in the
 * browser, since only this process holds the real BrowserWindow map
 * (ProviderHost.windows) needed to inject back into the right tab.
 */
const http = require('http');

function startWakeRelay(providerHost, opts = {}) {
  const cortexHost = opts.cortexHost || '127.0.0.1';
  const cortexPort = opts.cortexPort || 3748;
  const guardianHost = opts.guardianHost || '127.0.0.1';
  const guardianPort = opts.guardianPort || 7820;
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
    if (!d.agent) { log(`[wake-relay] event with no agent, cannot inject back — ${d.request?.slice(0,60)}`); return; }
    log(`[wake-relay] wake from ${d.agent}${d.account ? ' ('+d.account+')' : ''}: ${d.request?.slice(0,80)}`);
    try {
      const r = await new Promise((resolve, reject) => {
        const body = JSON.stringify({ prompt: d.request, contextOpts: { intent: d.request } });
        const req2 = http.request(
          { hostname: guardianHost, port: guardianPort, path: '/copilot/prompt', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
          (res2) => { let b=''; res2.on('data',c=>b+=c); res2.on('end',()=>{ try{resolve(JSON.parse(b));}catch(e){reject(e);} }); }
        );
        req2.on('error', reject);
        req2.write(body); req2.end();
      });
      const text = r.text || r.response || (r.toolResult ? JSON.stringify(r.toolResult.result || r.toolResult, null, 2) : null);
      if (!text) { log(`[wake-relay] co-pilot returned no answer for ${d.agent}`); return; }
      const injected = await providerHost.injectAnswer(d.agent, text);
      if (!injected.ok) log(`[wake-relay] injectAnswer failed for ${d.agent}: ${injected.reason}`);
    } catch (e) {
      log(`[wake-relay] relay failed: ${e.message}`);
    }
  }

  connect();
  return { stop: () => { stopped = true; } };
}

module.exports = { startWakeRelay };
