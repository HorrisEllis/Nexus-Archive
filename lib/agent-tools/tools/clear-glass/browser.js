'use strict';
/**
 * lib/agent-tools/tools/clear-glass/browser.js — clearglass.browser.tool: Clear Glass, whole, in one tool.
 * comp_id: nexus.agent-tools.clearglass.browser
 * UUID: nexus-agent-tools-clearglass-browser-v1-0000-2026-0927-jamesbrooks-001
 * Version: 1.0.0
 *
 * James, 2026-09-27: "i want copilot completely aware of clearglass, hooked in completely. all of it, copilot can use it."
 *
 * WHY ONE MORE CLEAR GLASS TOOL, when eight already exist (browser_action, macro, dom_archaeology, userscripts,
 * tab_visibility, provider_deploy, command_index, stream_bridge):
 *   - browser_action goes copilot → guardian job → /cmd → bus → SSE → guardian poll → copilot: five hops, a 20s
 *     ceiling, and a dead end whenever guardian is down. This goes copilot → :7702 /cli/driver, and the driver's own
 *     result comes back in the response.
 *   - none of the eight answers "what is on this page" (read) or "what is Clear Glass doing" (state) in one call.
 *   - none can run several steps in one call (sequence). A browser agent pays a full chat round trip per tool call;
 *     filling a 12-field form one call at a time is 12 round trips. sequence is one.
 *   - form work had no select / check / setValue / upload (driver/index.js 0.39.259 adds them; this exposes them).
 * The eight stay: each owns a surface this one does not (macros, erosmancer nodes, provider tabs, userscripts).
 *
 * Every action is a real HTTP call to a real Clear Glass route; nothing is simulated. Clear Glass down → the error
 * names the port and says so; it never returns an empty result that looks like an empty page.
 */

const http = require('http');
const { toolName } = require('../../naming.js');

const IPC_PORT = parseInt(process.env.CLEARGL_IPC_PORT || '7702', 10);
const HOST = process.env.CLEARGL_HOST || '127.0.0.1';

// The driver's own vocabulary (clear-glass/src/driver/index.js _dispatch) — the names `act` and `sequence` accept.
const DRIVER_ACTIONS = Object.freeze([
  'navigate', 'click', 'type', 'setValue', 'select', 'check', 'upload', 'pressKey', 'scroll', 'hover', 'wait', 'waitFor',
  'screenshot', 'toast', 'eval', 'zoom', 'findInPage', 'stopFindInPage', 'print', 'getUrl', 'getTitle', 'back', 'forward',
  'reload', 'cookies.get', 'cookies.set', 'cookies.clear', 'storage.get', 'storage.set', 'network.block',
  'network.intercept', 'picker.enable', 'picker.disable', 'inject', 'record.start', 'record.stop', 'readPage',
]);

function _call(method, path, body, timeoutMs = 45000) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: HOST, port: IPC_PORT, path, method,
      headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {},
      timeout: timeoutMs,
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        let j = null;
        try { j = raw ? JSON.parse(raw) : {}; } catch (_) { return resolve({ ok: false, status: res.statusCode, error: `non-JSON reply from Clear Glass ${path}: ${raw.slice(0, 200)}` }); }
        if (res.statusCode === 404 && !(j && Object.keys(j).length)) return resolve({ ok: false, status: 404, error: `Clear Glass has no ${method} ${path} — an older build? (0.39.259 added /cli/driver, /cli/page/read, /cli/state)` });
        resolve(res.statusCode >= 200 && res.statusCode < 300 ? (j && typeof j === 'object' ? j : { ok: true, result: j }) : { ok: false, status: res.statusCode, ...(j && typeof j === 'object' ? j : {}), error: (j && j.error) || `HTTP ${res.statusCode}` });
      });
    });
    req.on('error', (e) => resolve({ ok: false, status: 0, error: `Clear Glass unreachable on :${IPC_PORT} (${e.code || e.message}) — is it running? (npm start in clear-glass, or autopilot spawns it on demand)` }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: `Clear Glass ${path} timed out after ${timeoutMs}ms` }); });
    if (payload) req.write(payload);
    req.end();
  });
}

// Screenshots are base64 PNG; a model cannot read one and it would flood its context. Keep the size, drop the bytes
// unless asked (keepImage:true) — the image still went out on Clear Glass's own SSE (driver.screenshot) for the UI.
function _trimResult(action, r, keepImage) {
  if (action === 'screenshot' && r && r.result && r.result.screenshot && !keepImage) {
    return { ...r, result: { format: r.result.format, bytes: Math.round(r.result.screenshot.length * 0.75), note: 'image omitted from the tool result (pass keepImage:true to include base64)' } };
  }
  return r;
}

async function act(agentId, step, opts = {}) {
  const { action, ...args } = step || {};
  if (!DRIVER_ACTIONS.includes(action)) return { ok: false, error: `unknown driver action "${action}" — one of: ${DRIVER_ACTIONS.join(', ')}` };
  const r = await _call('POST', '/cli/driver', { action, agentId: agentId || 'default', ...args }, (args.timeoutMs || 30000) + 5000);
  return _trimResult(action, r, opts.keepImage);
}

async function sequence(agentId, steps = [], { stopOnError = true, keepImage = false } = {}) {
  if (!Array.isArray(steps) || !steps.length) return { ok: false, error: 'steps must be a non-empty array of { action, ...args }' };
  if (steps.length > 40) return { ok: false, error: `${steps.length} steps — the limit is 40 per call; split it` };
  const results = [];
  for (let i = 0; i < steps.length; i++) {
    const r = await act(agentId, steps[i], { keepImage });
    results.push({ step: i, action: steps[i] && steps[i].action, ok: r.ok !== false, ...(r.ok === false ? { error: r.error } : { result: r.result }) });
    if (r.ok === false && stopOnError) return { ok: false, stoppedAt: i, results, error: `step ${i} (${steps[i] && steps[i].action}) failed: ${r.error}` };
  }
  return { ok: results.every(x => x.ok), results };
}

const ACTIONS = {
  state:          (a) => _call('GET', `/cli/state${a.agentId ? `?agentId=${encodeURIComponent(a.agentId)}` : ''}`),
  read:           (a) => _call('POST', '/cli/page/read', { agentId: a.agentId || 'default', maxText: a.maxText, maxLinks: a.maxLinks, maxFields: a.maxFields }),
  act:            (a) => act(a.agentId, { action: a.driverAction || (a.step && a.step.action), ...(a.args || {}), ...(a.step || {}) }, a),
  sequence:       (a) => sequence(a.agentId, a.steps, { stopOnError: a.stopOnError !== false, keepImage: !!a.keepImage }),
  open_tab:       (a) => _call('POST', '/cli/bgtab', { agentId: a.agentId, url: a.url || 'about:blank', partition: a.partition }),
  close_tab:      (a) => a.agentId ? _call('DELETE', `/cli/bgtab/${encodeURIComponent(a.agentId)}`) : { ok: false, error: 'agentId required' },
  tabs:           ()  => _call('GET', '/cli/agents'),
  autofill_profiles: () => _call('GET', '/cli/autofill/profiles'),
  autofill_detect:(a) => _call('POST', '/cli/autofill/detect', { agentId: a.agentId || 'default', profileId: a.profileId }),
  autofill_fill:  (a) => _call('POST', '/cli/autofill/fill', { agentId: a.agentId || 'default', profileId: a.profileId, minConfidence: a.minConfidence || 'medium' }),
  questions:      (a) => _call('GET', `/cli/screen-qa/detect?agentId=${encodeURIComponent(a.agentId || 'default')}${a.profileId ? `&profileId=${encodeURIComponent(a.profileId)}` : ''}`),
  inject_answer:  (a) => _call('POST', '/cli/screen-qa/inject', { agentId: a.agentId || 'default', cgId: a.cgId, text: a.text }),
  history:        (a) => _call('GET', `/cli/history?limit=${+a.limit || 30}${a.query ? `&query=${encodeURIComponent(a.query)}` : ''}`),
  bookmarks:      (a) => _call('GET', `/cli/bookmarks${a.query ? `?query=${encodeURIComponent(a.query)}` : ''}`),
  accounts:       ()  => _call('GET', '/cli/accounts'),
  downloads:      ()  => _call('GET', '/cli/downloads'),
};

module.exports = {
  name: toolName('clearglass', 'browser'),
  description:
    'Clear Glass (NEXUS\'s own browser), direct and synchronous — results come back in the call. ' +
    'state: every open tab with its url/title, providers, accounts, autofill profiles, macros, userscripts. ' +
    'read: what is on a page — text, headings, links, every form field with its label + a selector, every button. ' +
    'act: one driver action (driverAction + args), e.g. navigate{url}, click{selector}, setValue{selector,value}, ' +
    'select{selector,value|text}, check{selector,checked}, upload{selector,paths}, type{selector,text}, pressKey{key}, ' +
    'waitFor{selector}, screenshot, eval{code}. sequence: several steps [{action,...}] in ONE call (stops at the first ' +
    'failure). open_tab{agentId?,url,partition?} / close_tab / tabs. autofill_profiles / autofill_detect / autofill_fill ' +
    '{agentId,profileId}. questions (open-ended form questions on screen) / inject_answer{cgId,text}. history / ' +
    'bookmarks{query} / accounts / downloads. agentId names the tab (default "default").',
  parameters: {
    type: 'object',
    properties: {
      action:       { type: 'string', enum: Object.keys(ACTIONS) },
      agentId:      { type: 'string', description: 'which tab — from state/tabs; open_tab creates one' },
      driverAction: { type: 'string', enum: DRIVER_ACTIONS, description: 'act only — the driver action' },
      args:         { type: 'object', description: 'act only — that action\'s arguments (url, selector, value, text, paths, key, code...)' },
      steps:        { type: 'array', items: { type: 'object' }, description: 'sequence only — [{ action, ...args }]' },
      stopOnError:  { type: 'boolean' },
      keepImage:    { type: 'boolean', description: 'screenshot: include the base64 image in the result' },
      url:          { type: 'string' }, partition: { type: 'string' },
      profileId:    { type: 'string' }, minConfidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      cgId:         { type: 'string' }, text: { type: 'string' },
      query:        { type: 'string' }, limit: { type: 'number' },
      maxText:      { type: 'number' }, maxLinks: { type: 'number' }, maxFields: { type: 'number' },
    },
    required: ['action'],
  },
  async execute(a = {}) {
    const fn = ACTIONS[a.action];
    if (!fn) return { ok: false, error: `unknown action "${a.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    return fn(a);
  },
  DRIVER_ACTIONS, act, sequence, _call, IPC_PORT,
};
