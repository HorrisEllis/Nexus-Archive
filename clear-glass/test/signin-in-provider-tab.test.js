'use strict';
// 0.60.97 -- James: "looook at clearglass, trying to get chatgpt signed in" (Google: "We've detected a problem with your cookie settings",
// in a window titled "Sign in - Google Accounts"). That sign-in runs in the provider's OWN jar -- the ChatGPT tab navigated to Google, or
// a popup of it -- while guardian keeps dispatching to ChatGPT: the account switch restored saved cookies (replace:true) and reloaded the
// tab, settled() saved/removed vault copies, the attention bounce sent the window back to the chat. Now the host marks the provider as
// mid sign-in while any of its windows is on a sign-in host, and none of those touch the jar. Fakes only: Electron and Google cannot run here.
const assert = require('assert');
const Module = require('module');
const { EventEmitter } = require('events');
const origResolve = Module._resolveFilename, origLoad = Module._load;
Module._load = function (req, ...r) { if (req === 'electron') return { BrowserWindow: function () {}, session: {}, app: { getPath: () => '.' }, ipcMain: { handle() {}, on() {} } }; return origLoad.call(this, req, ...r); };
const hostMod = require('../src/providers/host.js');
Module._load = origLoad;
const ProviderHost = hostMod.ProviderHost || hostMod;
const { createAccountSwitch } = require('../src/providers/account-switch.js');

const wcFake = () => { const w = new EventEmitter(); w.session = { cookies: new EventEmitter() }; w.session.cookies.removeListener = w.session.cookies.off.bind(w.session.cookies); w.getURL = () => ''; return w; };

(async () => {
  // ── 1. account-switch: frozen = no restore, no reload, no vault write ──
  const loads = []; let restores = 0, captures = 0;
  const win = { isDestroyed: () => false, webContents: { once: (e, f) => setImmediate(f), reload: () => loads.push('reload') }, loadURL: async (u) => { loads.push(u); } };
  const rows = new Map();
  const vault = { _jaa: () => ({ get: (t, k) => rows.get(k.id) || null, upsert: (t, r) => rows.set(r.id, r), delete: () => {}, flushAll() {} }),
    accounts: () => [{ accountId: 'A', count: 5 }], restore: async () => { restores++; return { restored: 5, total: 5 }; }, capture: async () => { captures++; return { count: 1, sites: [] }; }, snapshot: async () => {}, deleteAccountCookies() {}, _loadAccountCookies: async () => [] };
  const options = { resolveAccountForDispatch: () => ({ accountId: 'A' }), recordSession() {}, listAccounts: () => [] };
  const ses = { cookies: { get: async () => [] } };
  const sw = createAccountSwitch({ providerHost: { windows: new Map([['chatgpt', win]]), agentTabs: new Map() }, vault, options, getProvider: () => ({ url: 'https://chatgpt.com', hosts: ['chatgpt.com'] }), sessionFor: () => ses, reloadWaitMs: 200 });
  const rel = sw.freeze('chatgpt'); const rel2 = sw.freeze('chatgpt');
  assert.ok(sw.isFrozen('chatgpt') && !sw.isFrozen('claude'));
  const s1 = await sw.sync('chatgpt'), u1 = await sw.use('chatgpt', 'A'), st = await sw.settled('chatgpt');
  assert.ok(s1.action === 'skipped' && u1.skipped && st.action === 'skipped', JSON.stringify([s1, u1, st]));
  assert.strictEqual(restores + captures + loads.length, 0, 'frozen: nothing restored, saved or reloaded');
  rel(); assert.ok(sw.isFrozen('chatgpt'), 'two sign-ins in flight: one release does not unfreeze'); rel2(); rel2();
  assert.ok(!sw.isFrozen('chatgpt'), 'released (and release is idempotent)');
  const s2 = await sw.sync('chatgpt'); assert.ok(s2.action !== 'skipped' || !/sign-in is in progress/.test(s2.why || ''), 'unfrozen: sync works as before: ' + JSON.stringify(s2));

  // ── 2. host: a window on Google, and a popup of it, hold the guard until they leave / close ──
  const events = [];
  const fakeThis = { _guardSignIn: ProviderHost.prototype._guardSignIn, signInGuard: (id) => { events.push(['guard', id]); return () => events.push(['release', id]); } };
  const log = []; const origLog = console.log; console.log = (...m) => log.push(m.map(String).join(' '));
  const wc = wcFake(), w = new EventEmitter();
  ProviderHost.prototype._guardSignIn.call(fakeThis, 'chatgpt', w, wc);
  wc.emit('did-start-navigation', { url: 'https://chatgpt.com/', isMainFrame: true });
  assert.strictEqual(events.length, 0, 'the provider\'s own page is not a sign-in');
  wc.emit('did-start-navigation', { url: 'https://accounts.google.com/v3/signin', isMainFrame: true });
  wc.emit('did-start-navigation', { url: 'https://accounts.google.com/v3/signin/challenge', isMainFrame: true });
  assert.deepStrictEqual(events, [['guard', 'chatgpt']], 'one guard however many Google pages: ' + JSON.stringify(events));
  wc.session.cookies.emit('changed', {}, { name: 'GAPS', value: 'SECRET', domain: 'accounts.google.com' }, 'explicit', false);
  wc.emit('did-navigate', {}, 'https://chatgpt.com/api/auth/callback/google');
  assert.deepStrictEqual(events[1], ['release', 'chatgpt'], 'back on the provider: released');
  console.log = origLog;
  assert.ok(log.some(l => /\+GAPS\(explicit\)/.test(l)) && !log.join('').includes('SECRET'), 'cookie changes logged by name and cause, never a value: ' + log.join('|'));

  events.length = 0;
  const pop = new EventEmitter(); pop.webContents = wcFake();
  wc.emit('did-create-window', pop);
  assert.deepStrictEqual(events, [['guard', 'chatgpt']], 'a popup of the provider window is a sign-in at once');
  pop.emit('closed');
  assert.deepStrictEqual(events[1], ['release', 'chatgpt'], 'closing the popup releases');
  events.length = 0; w.emit('closed'); assert.strictEqual(events.length, 0, 'nothing held: closing the opener releases nothing');

  console.log('signin-in-provider-tab: ok');
})().catch(e => { console.error(e); process.exit(1); });
