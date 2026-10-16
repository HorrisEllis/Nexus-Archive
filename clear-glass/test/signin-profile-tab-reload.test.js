'use strict';
// 0.60.99 -- James: "it needs to have profile or hat dependant cookies. or compartment cookies. like we need multiaccount routing."
// 0.60.98 gave a non-primary account its own jar to sign in in. What it left: that account's OWN provider tab (persist:ncp-<provider>~<account>),
// if already open and signed out, was never reloaded when the sign-in window closed, so a job routed to the account found a signed-out page.
const assert = require('assert');
const { EventEmitter } = require('events');
const { LoginPortal } = require('../src/accounts/login-portal.js');
const { createProfileTabs, tabIdFor } = require('../src/providers/profile-tabs.js');

(async () => {
  // profile-tabs.reload: the tab is reloaded if open, and says so if not (nothing silent)
  let reloads = 0;
  const win = { isDestroyed: () => false, webContents: { reload: () => { reloads++; } } };
  const host = { agentTabs: new Map([[`chatgpt::${tabIdFor('B')}`, { win }]]), listAgentTabs: () => [] };
  const pt = createProfileTabs({ providerHost: host, vault: {}, options: {}, sessionFor: () => ({}) });
  assert.deepStrictEqual(pt.reload('chatgpt', 'B'), { ok: true, reloaded: true }); assert.strictEqual(reloads, 1);
  const none = pt.reload('chatgpt', 'Z'); assert.ok(none.ok && !none.reloaded && /not open/.test(none.why), JSON.stringify(none));
  host.agentTabs.set(`chatgpt::${tabIdFor('D')}`, { win: { isDestroyed: () => true, webContents: { reload() { reloads++; } } } });
  assert.ok(!pt.reload('chatgpt', 'D').reloaded && reloads === 1, 'a destroyed tab is not reloaded');

  // login-portal: closing a PROFILE account's window reloads that account's tab; closing the PRIMARY's does not (endSignIn does that)
  const wins = [], seen = [];
  function BW(o) { const w = new EventEmitter(); w.opts = o; w.webContents = new EventEmitter(); w.webContents.executeJavaScript = async () => ({}); w.show = w.focus = () => {}; w.isDestroyed = () => false; w.loadURL = async () => {}; w.close = () => w.emit('closed'); wins.push(w); return w; }
  const jar = () => ({ cookies: { get: async () => [], on() {}, removeListener() {} }, getUserAgent: () => 'Chrome/130', setUserAgent() {} });
  const accounts = { A: { id: 'A', label: 'one', sessions: {} }, B: { id: 'B', label: 'two', sessions: {} } };
  const as = { beginSignIn: async () => ({ ok: true }), endSignIn: async () => {}, current: () => null };
  const lp = new LoginPortal({ options: { getAccount: (id) => accounts[id], getDefaultAccount: () => 'A', resolveAccountForDispatch: () => ({ accountId: 'A' }), linkAgent() {}, recordSession() {} },
    vault: { accountMeta: () => null }, registry: () => [{ id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com' }], BrowserWindow: BW,
    session: { defaultSession: jar(), fromPartition: () => jar() }, accountSwitch: () => as, hub: { quiet: () => () => {}, sessionFor: () => jar() },
    profileTabs: () => ({ reload: (p, id) => { seen.push([p, id]); return { ok: true, reloaded: true }; } }), log: () => {} });
  await lp.open({ id: 'A', provider: 'chatgpt' }); await lp.open({ id: 'B', provider: 'chatgpt' });
  lp.close({ id: 'A', provider: 'chatgpt' }); assert.deepStrictEqual(seen, [], 'the primary account\'s tabs are reloaded by endSignIn, not here');
  lp.close({ id: 'B', provider: 'chatgpt' }); assert.deepStrictEqual(seen, [['chatgpt', 'B']], 'a profile account\'s own tab reloads when its sign-in window closes');
  // a portal built without profile tabs (older callers) still closes cleanly
  const bare = new LoginPortal({ options: { getAccount: (id) => accounts[id], getDefaultAccount: () => 'A', resolveAccountForDispatch: () => ({ accountId: 'A' }), linkAgent() {}, recordSession() {} },
    vault: { accountMeta: () => null }, registry: () => [{ id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com' }], BrowserWindow: BW, session: { defaultSession: jar(), fromPartition: () => jar() }, accountSwitch: () => as, hub: { quiet: () => () => {}, sessionFor: () => jar() } });
  await bare.open({ id: 'B', provider: 'chatgpt' }); bare.close({ id: 'B', provider: 'chatgpt' });
  console.log('signin-profile-tab-reload: ok');
})().catch(e => { console.error(e); process.exit(1); });
