'use strict';
/**
 * lib/agent-tools/tools/browser-action.js — browser_action tool
 * UUID: nexus-agent-tools-browser-action-v1-0000-2026-0713-jamesbrooks-001
 *
 * §BUILT 2026-07-13 — "Guardian is supposed to use Clear Glass. It's
 * NEXUS' browser. Give the co-pilot more access." This is that access:
 * copilot's agent loop can now issue real browser actions (navigate,
 * read the DOM, click/type, restore a cookie jar) through Guardian's new
 * 'browser' provider dispatch (guardian/server.js's _doDispatch), which
 * calls Clear Glass's real command surface (guardian/clear-glass-bridge.js)
 * instead of a chat provider's NCP channel.
 *
 * §HONEST SCOPE — this creates a real Guardian job and returns once it
 * completes or errors; it does not poll indefinitely. A browser action
 * that hangs past its timeout comes back as a real, honest error, not a
 * silent hang in the tool-calling loop.
 */

const http = require('http');

const GUARDIAN_PORT = parseInt(process.env.GUARDIAN_PORT || '7820');

// §FIXED 2026-08-12 — traced the full chain while wiring P5 (url-listener) and
// found this map was wrong for 5 of its 6 entries: clear-glass/src/gates/
// index.js registers SISO gates with UNSUFFIXED signatures ('dom.query',
// 'dom.mutate', 'dom.pick', 'driver.exec', 'cookie.save', 'cookie.restore' —
// singular "cookie", not "cookies"), and clear-glass/src/core/bus.js's emit()
// passes eventType through to the real SISO Stream with no suffix-stripping
// (confirmed by reading it directly — SISO gate lookup is exact-match, no
// fuzzy fallback, per its own design law). This map instead sent
// 'dom.query.request', 'dom.mutate.request', 'dom.pick.request',
// 'driver.exec.request', 'cookies.save.request', 'cookies.restore.request' —
// none of which match any registered gate signature. An event with no
// matching gate lands in the Stream's pending[] as unclaimed residue; the
// caller never sees an error, just a response that never arrives. Only
// 'navigate' → 'driver.exec' was ever actually correct. This tool's own
// header claims "verified end-to-end against a real mock of the full chain"
// (2026-07-13) — the mock evidently didn't catch a wrong event-type string,
// only a wrong route. §HONEST LIMIT — this fix is a string correction,
// traced against real source (gates/index.js, core/bus.js, siso/index.js),
// not guessed; it has NOT been run against a live Electron instance (no
// Electron runtime in this environment) the way the tools built earlier this
// session were run against live cortex/loom. Confirm against the real app
// before trusting it further than "traced correct."
const REAL_ACTIONS = {
  navigate:        'driver.exec',      // { action: 'navigate', url } — was already correct
  navigate_provider: 'provider.navigate', // §BUILT 2026-08-14 — { providerId, url }: navigates a SPECIFIC agent's own ClearGlass window (distinct from 'navigate' above, which drives a generic browser context, not any one provider's real tab). See clear-glass/src/providers/host.js's navigateTo() and switch-agent's real use of this, self-model.js.
  dom_query:       'dom.query',        // was 'dom.query.request'
  dom_mutate:      'dom.mutate',       // was 'dom.mutate.request'
  dom_pick:        'dom.pick',         // was 'dom.pick.request'
  driver_exec:     'driver.exec',      // was 'driver.exec.request'
  cookies_save:    'cookie.save',      // was 'cookies.save.request' (wrong word + suffix)
  cookies_restore: 'cookie.restore',   // was 'cookies.restore.request' (wrong word + suffix)
  // §ADDED 2026-08-12 (P5) — url.listen/url.listen.remove ARE real, registered
  // gates (gates/index.js:181-188), and urlListener IS passed into
  // registerAll's deps (main/index.js:786-794) — confirmed live-wired, not
  // orphaned as first assumed. Reuses this tool rather than a new one:
  // same guardian→clear-glass-bridge round trip, same REAL_ACTIONS shape.
  url_listen:      'url.listen',       // data: { pattern, hook, agentId?, intercept?, capture?, label? }
  url_unlisten:    'url.listen.remove',// data: { listenerId }
};

function _createGuardianJob(command, content) {
  return new Promise((resolve) => {
    // §FIXED 2026-07-13 — checked the real route before shipping, not
    // assumed: guardian's raw job dispatch is POST /command (guardian/
    // server.js), not /api/jobs — that path belongs to a different
    // service entirely (ollama-bridge, port 3749, referenced in a
    // comment elsewhere in guardian/server.js that this tool's first
    // draft copied the wrong assumption from).
    const body = Buffer.from(JSON.stringify({ command, provider: 'browser', content: JSON.stringify(content || {}) }));
    const req = http.request({
      hostname: '127.0.0.1', port: GUARDIAN_PORT, path: '/command', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
      timeout: 20000,
    }, (res) => {
      let raw = ''; res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { resolve({ ok: false, error: `bad response from guardian: ${e.message}` }); } });
    });
    req.on('error', (e) => resolve({ ok: false, error: `could not reach guardian (:${GUARDIAN_PORT}): ${e.message}` }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'guardian job submission timed out' }); });
    req.write(body);
    req.end();
  });
}

function _pollJob(jobId, deadlineMs) {
  const started = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      // §FIXED 2026-07-13 — checked before shipping: there is no GET
      // /jobs/:id (or /api/jobs/:id) route anywhere in guardian/server.js
      // — only a bulk GET /jobs?limit=N&status=X listing. Polling a
      // single job means fetching the recent list and finding it by id;
      // a large limit keeps a slightly-older job from scrolling out
      // before it completes.
      const req = http.request({ hostname: '127.0.0.1', port: GUARDIAN_PORT, path: '/jobs?limit=200', method: 'GET', timeout: 5000 }, (res) => {
        let raw = ''; res.on('data', c => raw += c);
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
          const job = parsed?.jobs?.find(j => j.id === jobId);
          if (job?.status === 'complete') { resolve({ ok: true, response: job.response }); return; }
          if (job?.status === 'error')    { resolve({ ok: false, error: job.error || 'browser action failed' }); return; }
          if (Date.now() - started > deadlineMs) { resolve({ ok: false, error: `browser action did not complete within ${deadlineMs}ms` }); return; }
          setTimeout(tick, 500);
        });
      });
      req.on('error', (e) => resolve({ ok: false, error: `lost contact with guardian while polling: ${e.message}` }));
      req.end();
    };
    tick();
  });
}

module.exports = {
  name: 'browser_action',
  description:
    'Control NEXUS\' real browser (Clear Glass) — navigate to a URL, read/mutate the DOM, manage cookies, ' +
    'or register a backend URL listener that fires a hook on matching traffic. This is a real browser, not ' +
    'a simulation; actions take real time and can fail for real reasons (page not loaded, element not found). ' +
    `Params: action (required — one of: ${Object.keys(REAL_ACTIONS).join(', ')}), data (object — action-specific: ` +
    'navigate needs {url}, dom_query needs {selector}, dom_mutate needs {selector, value}, cookies_save/restore ' +
    'need {agentId}, url_listen needs {pattern, hook, agentId?, intercept?, capture?, label?}, url_unlisten needs ' +
    '{listenerId}).',
  parameters: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: Object.keys(REAL_ACTIONS), description: 'Which browser action to perform' },
      data:   { type: 'object', description: 'Action-specific parameters' },
    },
    required: ['action'],
  },
  execute: async ({ action, data = {} } = {}) => {
    const eventType = REAL_ACTIONS[action];
    if (!eventType) return { error: `unknown action "${action}" — expected one of: ${Object.keys(REAL_ACTIONS).join(', ')}` };

    const created = await _createGuardianJob(eventType, data);
    if (!created.ok) return { error: created.error || 'guardian rejected the job' };

    const result = await _pollJob(created.jobId, 20000);
    if (!result.ok) return { error: result.error };
    return { ok: true, action, result: result.response };
  },
};
