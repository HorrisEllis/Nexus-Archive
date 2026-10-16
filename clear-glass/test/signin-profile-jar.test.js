'use strict';
// 0.60.98 -- James: "it needs to have profile or hat dependant cookies. or compartment cookies. like we need multiaccount routing."
// The provider's primary account signs in in the one provider jar (parked tabs, quiet hub, as before); every other account signs in in
// its OWN jar (persist:ncp-<provider>~<account>, the one its profile tab uses) -- nothing parked, swapped or quieted, and both stay open.
const assert = require('assert');
const { EventEmitter } = require('events');
const { LoginPortal, profilePartition, partitionFor } = require('../src/accounts/login-portal.js');
const PT = require('../src/providers/profile-tabs.js');

(async () => {
  assert.strictEqual(profilePartition('chatgpt', 'acct-b'), PT.partitionFor('chatgpt', 'acct-b'), 'the portal and the profile tab name the same jar');
  const calls = [], wins = [], uaSet = [];
  function BW(o) { const w = new EventEmitter(); w.opts = o; w.webContents = new EventEmitter(); w.webContents.executeJavaScript = async () => ({}); w.show = w.focus = () => {}; w.isDestroyed = () => false; w.loadURL = async () => {}; w.close = () => w.emit('closed'); wins.push(w); return w; }
  const jars = new Map();
  const jar = (name) => { if (!jars.has(name)) { const ev = new EventEmitter(); jars.set(name, { name, cookies: { get: async () => [], on: (e, f) => ev.on(e, f), removeListener: (e, f) => ev.removeListener(e, f) }, getUserAgent: () => 'Mozilla/5.0 Chrome/130 Electron/33.0.0 Safari/537.36', setUserAgent: (u) => uaSet.push([name, u]) }); } return jars.get(name); };
  const accounts = { A: { id: 'A', label: 'one', sessions: {} }, B: { id: 'B', label: 'two', sessions: {} } };
  const as = { beginSignIn: async (p, id) => { calls.push(['begin', id]); return { ok: true }; }, endSignIn: async () => { calls.push(['end']); }, current: () => null };
  const hub = { quiet: () => { calls.push(['quiet']); return () => {}; }, sessionFor: () => jar('canon') };
  const lp = new LoginPortal({ options: { getAccount: (id) => accounts[id], getDefaultAccount: () => 'A', resolveAccountForDispatch: () => ({ accountId: 'A' }), linkAgent() {}, recordSession() {} },
    vault: { accountMeta: () => null }, registry: () => [{ id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com' }], BrowserWindow: BW,
    session: { defaultSession: jar('default'), fromPartition: (p) => jar(p) }, accountSwitch: () => as, hub });
  const a = await lp.open({ id: 'A', provider: 'chatgpt' });
  assert.strictEqual(a.partition, partitionFor('chatgpt', 'A')); assert.ok(!a.ownJar);
  assert.deepStrictEqual(calls.map(c => c[0]), ['quiet', 'begin'], 'primary: quiet + park, as before');
  calls.length = 0;
  const b = await lp.open({ id: 'B', provider: 'chatgpt' });
  assert.strictEqual(b.partition, 'persist:ncp-chatgpt~B'); assert.ok(b.ownJar);
  assert.strictEqual(wins[1].opts.webPreferences.partition, 'persist:ncp-chatgpt~B', 'the window runs in the account\'s own jar');
  assert.strictEqual(calls.length, 0, 'a profile account\'s sign-in parks, quiets and swaps nothing: ' + JSON.stringify(calls));
  assert.ok(!wins[0].isDestroyed() && lp.list().length === 2, 'both accounts\' windows stay open');
  assert.ok(uaSet.some(u => u[0] === 'persist:ncp-chatgpt~B' && !/Electron/.test(u[1])), 'the profile jar says Chrome, not Electron');
  const st = await lp.status({ id: 'B', provider: 'chatgpt' });
  assert.strictEqual(st.partition, 'persist:ncp-chatgpt~B'); assert.ok(st.ownJar);
  console.log('signin-profile-jar: ok');
})().catch(e => { console.error(e); process.exit(1); });
