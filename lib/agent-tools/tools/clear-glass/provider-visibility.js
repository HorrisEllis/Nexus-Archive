'use strict';
/**
 * lib/agent-tools/tools/clear-glass/provider-visibility.js
 *
 * §BL28/BL29 2026-08-23 — the missing agent surface.
 *
 * The backend for this is ALREADY REAL and was verified before this file was
 * written, not assumed: clear-glass/src/main/index.js:541 exposes
 * POST /provider/move-to-background and /provider/bring-to-foreground, both
 * wired to ProviderHost's real hide(providerId)/show(providerId). Its own
 * comment names what was still missing:
 *
 *   "also genuinely useful on its own, right now, as a real agent tool action
 *    (co-pilot can already say 'move claude to the background' once this is
 *    wired to a real tool)."
 *
 * Nothing was wired to it. Measured: 2 real routes, 0 tools calling them.
 * This is that tool, and nothing more — §16.5, the mechanism exists and is not
 * reimplemented here.
 *
 * BL29's right-click tab menu is a SEPARATE, still-open piece of UI. It will
 * call the same two routes. This tool does not pre-empt it or duplicate it.
 *
 * §1.2 — honest failure. If ClearGlass is not running, or the named provider
 * does not exist, this returns a specific reason. It never reports a successful
 * hide of a window that was never there: ProviderHost.hide() returns a real
 * boolean, and a false is surfaced as a failure with the reason, not swallowed
 * into a cheerful { ok: true }.
 */

const http = require('http');

const WIRE_PORT = process.env.WIRE_PORT || 7704;

// Same transport as clear-glass/dom-archaeology.js, deliberately. Two different
// ways of reaching the same wire server would drift on timeout, error shape and
// port resolution (§10.3).
function _post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: '127.0.0.1', port: WIRE_PORT, path, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout: 5000 },
      (res) => {
        let out = ''; res.on('data', c => out += c);
        res.on('end', () => { try { resolve(JSON.parse(out)); } catch (e) { reject(new Error(`ClearGlass returned unparseable response: ${out.slice(0, 120)}`)); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('ClearGlass wire server unreachable — is ClearGlass running?')); });
    req.write(data);
    req.end();
  });
}

const ROUTES = {
  background: '/provider/move-to-background',
  foreground: '/provider/bring-to-foreground',
};

module.exports = {
  name: 'clear_glass_provider_visibility',
  description:
    'Move a real ClearGlass provider window to the background, or bring it to the foreground. Needs providerId ' +
    '(which real agent tab — e.g. "claude", "chatgpt", "gemini", "perplexity") and where ("background" or ' +
    '"foreground"). Calls ProviderHost\'s real hide()/show() through the ClearGlass wire server — the same ' +
    'primitive the tab right-click menu will use. Honestly fails with a specific reason if ClearGlass is not ' +
    'running or the named provider window does not exist; it never reports having hidden a window that was ' +
    'not there.',
  parameters: {
    type: 'object',
    properties: {
      providerId: { type: 'string', description: 'Which real provider window: claude, chatgpt, gemini, perplexity.' },
      where: { type: 'string', description: '"background" to hide it, "foreground" to bring it forward.' },
    },
    required: ['providerId', 'where'],
  },
  execute: async ({ providerId, where } = {}) => {
    // §1.1 — refuse rather than guess which window the user meant.
    if (!providerId) {
      return { error: 'providerId required — which provider window (claude, chatgpt, gemini, perplexity)?' };
    }
    const key = String(where || '').toLowerCase();
    const path = ROUTES[key];
    if (!path) {
      return { error: `where must be "background" or "foreground", got ${JSON.stringify(where)}`,
        note: 'refusing to pick a direction on the caller\'s behalf — hiding a window the user wanted forward is not a recoverable mistake' };
    }

    let r;
    try { r = await _post(path, { providerId }); }
    catch (e) { return { error: e.message, providerId, where: key }; }

    // The route returns { ok, providerId } where ok is ProviderHost's real
    // boolean. A false means the window was not found — that is a FAILURE, and
    // reporting it as success would be the exact silent-failure this codebase
    // is organised against (§1.2).
    if (r && r.ok === false) {
      return { error: `ClearGlass has no live provider window named "${providerId}"`,
        providerId, where: key,
        note: 'the route was reached and answered — this is a real "not found", not a connectivity failure' };
    }
    if (r && r.error) return { error: r.error, providerId, where: key };

    return { ok: true, providerId, where: key,
      moved: key === 'background' ? 'hidden' : 'shown',
      note: `${providerId} is now in the ${key}` };
  },
};
