'use strict';
// 0.60.99 -- James: "the login screen for chatgpt still keeps closing immedie". Three fixes in attention.js (0.60.45, 0.60.52,
// 0.60.98) each stopped one way the sign-in window could be HIDDEN. None of them could help here, because this is not a hide:
// ProviderHost._sweepIdle() runs every 15 s and destroy()s any provider window that has had no dispatch for 2 minutes. It never
// asked whether the window was on screen, and stop() never cleared the idle clock, so a window opened for the person to sign in
// on (attention.attend -> providerHost.start, which does not touch() the clock) was destroyed by the very next tick -- every time.
// Fakes only: Electron and chatgpt.com cannot run here.
const assert = require('assert');
const Module = require('module');
const { EventEmitter } = require('events');

let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log('  PASS ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + ': ' + e.message); } };

// ── a fake BrowserWindow that records destroy/hide and knows whether it is on screen ──
class FakeWin extends EventEmitter {
  constructor(opts = {}) {
    super(); this.opts = opts; this._destroyed = false; this._visible = !!opts.show; this._focused = false; this._min = false;
    const wc = new EventEmitter(); wc.session = { cookies: new EventEmitter() }; wc.getURL = () => this._url || ''; wc.getTitle = () => '';
    wc.executeJavaScript = async () => true; wc.reload = () => {}; this.webContents = wc;
  }
  isDestroyed() { return this._destroyed; }
  destroy() { this._destroyed = true; this.emit('closed'); }
  isVisible() { return this._visible; } isFocused() { return this._focused; } isMinimized() { return this._min; }
  show() { this._visible = true; } hide() { this._visible = false; } focus() { this._focused = true; }
  removeMenu() {} async loadURL(u) { this._url = u; }
}
const fakeSession = () => ({ webRequest: { onHeadersReceived() {} }, getUserAgent: () => 'Mozilla/5.0 Chrome/140', setUserAgent() {}, cookies: new EventEmitter() });
const origLoad = Module._load;
Module._load = function (req, ...r) {
  if (req === 'electron') return { BrowserWindow: FakeWin, session: { fromPartition: fakeSession }, app: { getPath: () => '.' }, ipcMain: { handle() {}, on() {} } };
  return origLoad.call(this, req, ...r);
};
const hostMod = require('../src/providers/host.js');
Module._load = origLoad;
const ProviderHost = hostMod.ProviderHost || hostMod;

const quiet = async (f) => { const l = console.log, w = console.warn; console.log = () => {}; console.warn = () => {}; try { return await f(); } finally { console.log = l; console.warn = w; } };
const newHost = () => { const h = new ProviderHost({ guardianDir: __dirname }); h.IDLE_TIMEOUT_MS = 120000; return h; };
const LONG_AGO = () => Date.now() - 10 * 60 * 1000;

(async () => {
  // ── the report itself ──
  await t('IS-01 a window the person is looking at is NOT destroyed because no job has used it for 2 minutes', async () => {
    const h = newHost(); const w = new FakeWin({ show: true }); w._visible = true;
    h.windows.set('chatgpt', w); h._lastUsed.set('chatgpt', LONG_AGO());
    await quiet(() => h._sweepIdle());
    assert.ok(!w.isDestroyed(), 'the visible ChatGPT sign-in window was destroyed by the idle sweep');
  });

  await t('IS-02 a hidden idle window is still stopped (the sweep still frees memory)', async () => {
    const h = newHost(); const w = new FakeWin({ show: false });
    h.windows.set('chatgpt', w); h._lastUsed.set('chatgpt', LONG_AGO());
    await quiet(() => h._sweepIdle());
    assert.ok(w.isDestroyed(), 'a hidden window idle for 10 minutes should be stopped');
  });

  await t('IS-03 a minimised window is the person\'s too, and is not destroyed', async () => {
    const h = newHost(); const w = new FakeWin({ show: false }); w._min = true;
    h.windows.set('chatgpt', w); h._lastUsed.set('chatgpt', LONG_AGO());
    await quiet(() => h._sweepIdle());
    assert.ok(!w.isDestroyed());
  });

  await t('IS-04 stop() clears the idle clock, so the NEXT window does not inherit it', async () => {
    const h = newHost(); const w = new FakeWin();
    h.windows.set('chatgpt', w); h._lastUsed.set('chatgpt', LONG_AGO());
    await quiet(() => h.stop('chatgpt'));
    assert.ok(!h._lastUsed.has('chatgpt'), 'a stopped provider kept its old last-used time');
  });

  await t('IS-05 the loop the person saw: idle-stop, reopen for sign-in, next tick -- the reopened window survives', async () => {
    const h = newHost();
    const w1 = new FakeWin(); h.windows.set('chatgpt', w1); h._lastUsed.set('chatgpt', LONG_AGO());
    await quiet(() => h._sweepIdle());                       // 1. idle: stopped, as intended
    assert.ok(w1.isDestroyed());
    const w2 = new FakeWin({ show: true }); w2._visible = true;   // 2. attention.attend -> start({ show: true }) opens a window to sign in on
    h.windows.set('chatgpt', w2);
    await quiet(() => h._sweepIdle());                       // 3. the next 15 s tick
    assert.ok(!w2.isDestroyed(), 'the sign-in window was destroyed by the very next sweep tick (the reported bug)');
  });

  await t('IS-06 start() counts as use: a window just created is not idle', async () => {
    const h = newHost(); h._lastUsed.set('chatgpt', LONG_AGO());
    h._load = async () => ({ ok: true, attempts: 1 }); h._guardSignIn = () => {};
    await quiet(() => h.start('chatgpt', { show: true }));
    const last = h._lastUsed.get('chatgpt');
    assert.ok(last && Date.now() - last < 5000, 'start() left the idle clock at its old value');
    for (const w of h.windows.values()) w.destroy();
  });

  await t('IS-07 show() counts as use', async () => {
    const h = newHost(); const w = new FakeWin(); h.windows.set('chatgpt', w); h._lastUsed.set('chatgpt', LONG_AGO());
    h.show('chatgpt');
    assert.ok(Date.now() - h._lastUsed.get('chatgpt') < 5000);
  });

  await t('IS-08 a window mid sign-in (on Google / OpenAI auth, however hidden) is not destroyed', async () => {
    const h = newHost(); const w = new FakeWin({ show: false });
    h.windows.set('chatgpt', w); h._lastUsed.set('chatgpt', LONG_AGO());
    h._signInDepth = h._signInDepth || new Map(); h._signInDepth.set('chatgpt', 1);
    await quiet(() => h._sweepIdle());
    assert.ok(!w.isDestroyed(), 'a window on a sign-in host was destroyed');
  });

  await t('IS-09 the sign-in guard marks the provider while a window is on a sign-in host, and unmarks when it leaves', async () => {
    const h = newHost(); const wc = new FakeWin().webContents; const w = new EventEmitter();
    h.signInGuard = () => () => {};
    h._guardSignIn('chatgpt', w, wc);
    assert.ok(!h._isSigningIn('chatgpt'));
    wc.emit('did-start-navigation', { url: 'https://auth.openai.com/authorize', isMainFrame: true });
    assert.ok(h._isSigningIn('chatgpt'), 'on auth.openai.com: mid sign-in');
    wc.emit('did-navigate', {}, 'https://chatgpt.com/');
    assert.ok(!h._isSigningIn('chatgpt'), 'back on chatgpt.com: not');
  });

  // ── per-repo / per-account tabs share the same rule ──
  await t('IS-10 an agent (profile) tab on screen is not closed by the 15 minute idle sweep; a hidden one is', async () => {
    const h = newHost(); h.AGENT_IDLE_MS = 1000;
    const shown = new FakeWin({ show: true }); shown._visible = true;
    const hid = new FakeWin({ show: false });
    h.agentTabs.set('chatgpt::profile~B', { win: shown, agentId: 'profile~B', providerId: 'chatgpt', lastUsed: LONG_AGO() });
    h.agentTabs.set('chatgpt::repo', { win: hid, agentId: 'repo', providerId: 'chatgpt', lastUsed: LONG_AGO() });
    await quiet(() => h._sweepIdleAgentTabs());
    assert.ok(!shown.isDestroyed(), 'the account tab the person is signing in on was closed');
    assert.ok(hid.isDestroyed(), 'a hidden idle agent tab should still close');
  });

  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
