'use strict';
/**
 * clear-glass/src/providers/account-switch.js — a provider tab runs as the account a job was routed to.
 * comp_id: nexus.clear-glass.src.providers.account-switch
 * UUID: cg-provider-account-switch-v1-0000-2026-1012-jamesbrooks-001
 *
 * James (2026-10-12): "can we build the actual cookie vault using jaa? that way we can have actual account routing, and
 * hat specific accounts."
 *
 * Each provider has ONE tab (persist:ncp-<provider>; guardian runs its jobs one at a time — dispatch-pool), so running a
 * job as another account means switching that tab's identity between jobs. The cookie vault (src/cookies/vault.js, JAA,
 * encrypted) already keeps cookies per (provider, account); this module uses it:
 *
 *   use(provider, accountId)   the account must be one Clear Glass knows for that provider (NexusOptions — the account
 *                              authority) and must have a saved sign-in. The tab's cookies now are saved under the account
 *                              it was (or, not knowing, as a vault snapshot — nothing is lost), the session's cookies are
 *                              replaced by the routed account's, and the provider's tabs reload. -> { ok, switched, restored }
 *   capture(provider, account) the tab's cookies saved for that account (after a sign-in: the attention panel's "save this
 *                              sign-in as …"), and the tab marked as that account.
 *   current(provider)          which account the tab is signed in as, as far as Nexus knows (null: never told).
 *
 *   sync(provider)             §0.60.12 — the tab runs as the provider's DISPATCH account (the starred one, else the oldest)
 *                              (guardian's per-job routing still switches it for a job; the next sync brings it back): the account's saved sign-in is put in the tab's
 *                              session (before its first load, when ProviderHost asks), and a sign-in the tab already holds
 *                              that the account has not saved is saved to it, not overwritten. Called when the tab starts,
 *                              and when a session is saved, an account is starred, or one is signed out (Accounts & sign-in).
 *   signedOut(provider, id)    the account was signed out on the Accounts page: if the tab runs as it, the tab is signed out too.
 *
 * Which account a job runs as is guardian's choice (guardian/lib/account-routing.js: hat / intent / repo rules); the
 * switch happens here, before the job is typed (guardian/lib/dispatcher.js). The tab's account is kept in the vault's own
 * JAA store (table provider_tab_account) — no cookie leaves the vault unencrypted.
 */
const MODULE_ID = 'clear-glass.provider-account-switch';
const VERSION = '1.1.0';
const T_TAB = 'provider_tab_account';
// the same test the login portal uses for "this session looks signed in" (one definition, not a second)
const AUTH_COOKIE_RE = /sess|token|auth|jwt|sid|__Secure|__Host|SAPISID|SSID/i;
const _siteOf = (host) => String(host || '').replace(/^\./, '').split('.').slice(-2).join('.');

function createAccountSwitch({ providerHost, vault, options, getProvider = () => null, sessionFor, log = () => {}, now = Date.now, reloadWaitMs = 20000 } = {}) {
  if (!providerHost || !vault || !options || typeof sessionFor !== 'function') throw new Error('account-switch needs providerHost, vault, options and sessionFor');
  const _chain = new Map();   // provider -> the switch in flight (one at a time per provider)

  const st = () => vault._jaa();
  function current(provider) { const r = st().get(T_TAB, { id: provider }); return r ? r.account : null; }
  function _setCurrent(provider, account, how) { st().upsert(T_TAB, { id: provider, account, how, at: now() }); st().flushAll(); }

  function _known(provider, accountId) {
    const r = options.resolveAccountForDispatch(provider, accountId);
    return r && !r.error ? null : ((r && r.error) || `unknown account ${accountId} for ${provider}`);
  }
  function _saved(provider, accountId) { return (vault.accounts(provider) || []).find(a => a.accountId === accountId) || null; }

  function _windows(provider) {
    const out = [];
    const w = providerHost.windows && providerHost.windows.get(provider);
    if (w && !w.isDestroyed()) out.push(w);
    for (const [k, e] of (providerHost.agentTabs || new Map())) if (k.startsWith(`${provider}::`) && e.win && !e.win.isDestroyed()) out.push(e.win);
    return out;
  }
  function _reload(win, url) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok, why) => { if (done) return; done = true; resolve({ ok, why }); };
      const t = setTimeout(() => finish(false, `no load in ${reloadWaitMs} ms`), reloadWaitMs);
      try { win.webContents.once('did-finish-load', () => { clearTimeout(t); finish(true); }); } catch (_) {}
      Promise.resolve(url ? win.loadURL(url) : win.webContents.reload()).catch(e => { clearTimeout(t); finish(false, e.message); });
    });
  }

  async function capture(provider, accountId, { makeCurrent = true } = {}) {
    const acct = accountId || current(provider);
    if (!acct) return { ok: false, error: `which account is the ${provider} tab signed in as? name one (Clear Glass → Accounts)` };
    const bad = _known(provider, acct);
    if (bad) return { ok: false, error: bad };
    const r = await vault.capture({ agentId: provider, accountId: acct, ses: sessionFor(provider) });
    if (makeCurrent) _setCurrent(provider, acct, 'captured');
    try { options.recordSession && options.recordSession(acct, provider, { capturedAt: now(), cookieCount: r.count, sites: r.sites.slice(0, 20), via: 'provider-tab' }); } catch (_) {}
    log(`[account-switch] ${provider} — the tab's sign-in saved as ${acct}: ${r.count} cookie(s) on ${r.sites.length} site(s)`);
    return { ok: true, provider, accountId: acct, cookies: r.count, sites: r.sites };
  }

  async function _use(provider, accountId, { reason = null } = {}) {
    if (!accountId) return { ok: false, error: 'accountId required' };
    const bad = _known(provider, accountId);
    if (bad) return { ok: false, error: bad };
    const was = current(provider);
    if (was === accountId) return { ok: true, switched: false, provider, accountId };
    const saved = _saved(provider, accountId);
    if (!saved || !saved.count) return { ok: false, error: `no saved sign-in for account ${accountId} on ${provider} — sign in once as it (the Nexus panel on the ${provider} tab: "save this sign-in as")` };
    const ses = sessionFor(provider);
    // nothing the tab holds now is lost: saved under the account it was, else as a snapshot
    try {
      if (was) await vault.capture({ agentId: provider, accountId: was, ses });
      else await vault.snapshot(provider, ses, `before switching to ${accountId}`);
    } catch (e) { return { ok: false, error: `could not save the tab's current sign-in before switching: ${e.message}` }; }
    const r = await vault.restore({ agentId: provider, accountId, ses, replace: true });
    if (!r.restored) return { ok: false, error: `account ${accountId}: none of its ${r.total} saved cookie(s) could be set (${(r.failed || []).slice(0, 2).join('; ')})` };
    _setCurrent(provider, accountId, 'switched');
    const def = (() => { try { return getProvider(provider); } catch (_) { return null; } })();
    const loads = await Promise.all(_windows(provider).map(w => _reload(w, def && def.url)));
    log(`[account-switch] ${provider} — ${was || '(unknown account)'} → ${accountId}${reason ? ` (${reason})` : ''}: ${r.restored}/${r.total} cookie(s), ${loads.filter(l => l.ok).length}/${loads.length} tab(s) reloaded`);
    return { ok: true, switched: true, provider, accountId, from: was, restored: r.restored, total: r.total, failed: r.failed || [], tabs: loads.length };
  }
  function use(provider, accountId, opts = {}) {
    const prev = _chain.get(provider) || Promise.resolve();
    const next = prev.catch(() => {}).then(() => _use(provider, accountId, opts));
    _chain.set(provider, next);
    next.finally(() => { if (_chain.get(provider) === next) _chain.delete(provider); }).catch(() => {});
    return next;
  }

  // ── §0.60.12 sync — the Accounts page and the provider tab are one sign-in ───────────────────────────────────────────
  // James (2026-10-13): \"the logins for the agent providers needs to be all the same. the accounts and sign in, isn't wired
  // into the provider tabs in clearglass.\" Before this the Accounts page signed in to persist:mesh-<provider>-<id> and saved
  // it to the vault, the provider tab ran in persist:ncp-<provider>, and only guardian's per-job dispatch ever copied one
  // into the other — so a tab started signed out beside an account that said \"Signed in\".
  async function _tabAuth(provider) {
    // the tab's own sign-in: auth-looking cookies on the provider's own site(s), read from the tab's session
    let sites = [];
    try { const d = getProvider(provider); sites = [d.url, ...(d.hosts || []).map(h => `https://${h}`)].map(u => { try { return _siteOf(new URL(u).hostname); } catch (_) { return null; } }).filter(Boolean); } catch (_) {}
    try {
      const all = await sessionFor(provider).cookies.get({});
      const mine = sites.length ? all.filter(c => sites.includes(_siteOf(c.domain))) : all;
      return { cookies: all.length, auth: mine.filter(c => AUTH_COOKIE_RE.test(c.name)).length };
    } catch (_) { return { cookies: 0, auth: 0 }; }
  }

  /**
   * sync(provider, { reload }) -> { ok, provider, action, accountId?, why? }
   * action: 'restored'  the dispatch account's saved sign-in was put in the tab (tabs reloaded unless reload:false)
   *         'saved'     the tab was signed in and the account had nothing saved: the tab's sign-in was saved to the account
   *         'unchanged' the tab already runs as the dispatch account and holds its sign-in
   *         'skipped'   nothing to do, and why (no account, nothing saved anywhere, the tab runs as another account on purpose)
   */
  async function _sync(provider, { reload = true } = {}) {
    const r = options.resolveAccountForDispatch(provider, null);
    if (!r || r.error) return { ok: false, provider, action: 'skipped', why: (r && r.error) || 'no account authority' };
    const accountId = r.accountId;
    if (!accountId) return { ok: true, provider, action: 'skipped', why: `no ${provider} account yet — add one in Accounts & sign-in` };
    const was = current(provider);
    const tab = await _tabAuth(provider);
    const saved = _saved(provider, accountId);
    const hasSaved = !!(saved && saved.count);

    // a sign-in the tab holds that nothing has saved is never overwritten: it becomes the account's
    if (!hasSaved) {
      if (tab.auth > 0 && (!was || was === accountId)) {
        const c = await capture(provider, accountId);
        return c.ok ? { ok: true, provider, action: 'saved', accountId, cookies: c.cookies, why: `the ${provider} tab was signed in and “${accountId}” had no saved sign-in — the tab's was saved to it` } : { ok: false, provider, action: 'skipped', accountId, why: c.error };
      }
      return { ok: true, provider, action: 'skipped', accountId, why: `no saved sign-in for “${accountId}” on ${provider} yet, and the tab is not signed in — sign in once in Accounts & sign-in` };
    }
    if (was === accountId && tab.auth > 0) return { ok: true, provider, action: 'unchanged', accountId };
    const ses = sessionFor(provider);
    if (was && was !== accountId && tab.auth > 0) { try { await vault.capture({ agentId: provider, accountId: was, ses }); } catch (_) {} }
    const rs = await vault.restore({ agentId: provider, accountId, ses, replace: true });
    if (!rs.restored) return { ok: false, provider, action: 'skipped', accountId, why: `none of the ${rs.total} saved cookie(s) for “${accountId}” could be set (${(rs.failed || []).slice(0, 2).join('; ')})` };
    _setCurrent(provider, accountId, 'synced');
    let tabs = 0;
    if (reload) {
      const def = (() => { try { return getProvider(provider); } catch (_) { return null; } })();
      const loads = await Promise.all(_windows(provider).map(w => _reload(w, def && def.url)));
      tabs = loads.length;
    }
    log(`[account-switch] ${provider} — tab now runs as ${accountId} (sync): ${rs.restored}/${rs.total} cookie(s)${reload ? `, ${tabs} tab(s) reloaded` : ''}`);
    return { ok: true, provider, action: 'restored', accountId, from: was, restored: rs.restored, total: rs.total, tabs };
  }
  function sync(provider, opts = {}) {
    const prev = _chain.get(provider) || Promise.resolve();
    const next = prev.catch(() => {}).then(() => _sync(provider, opts)).then(r => (r && r.ok === false && !r.error ? { ...r, error: r.why } : r));
    _chain.set(provider, next);
    next.finally(() => { if (_chain.get(provider) === next) _chain.delete(provider); }).catch(() => {});
    return next;
  }

  /** signedOut(provider, accountId) — the Accounts page signed that account out; a tab that runs as it is signed out too */
  async function signedOut(provider, accountId) {
    if (current(provider) !== accountId) return { ok: true, provider, action: 'unchanged', why: `the tab does not run as “${accountId}”` };
    try { await sessionFor(provider).clearStorageData({ storages: ['cookies'] }); } catch (e) { return { ok: false, provider, action: 'skipped', error: e.message }; }
    try { st().delete(T_TAB, { id: provider }); st().flushAll(); } catch (_) {}
    const def = (() => { try { return getProvider(provider); } catch (_) { return null; } })();
    const loads = await Promise.all(_windows(provider).map(w => _reload(w, def && def.url)));
    log(`[account-switch] ${provider} — “${accountId}” signed out; the tab is signed out too (${loads.length} tab(s) reloaded)`);
    return { ok: true, provider, action: 'signed-out', accountId, tabs: loads.length };
  }

  function state(provider) {
    const d = options.resolveAccountForDispatch(provider, null);
    return { provider, current: current(provider), dispatch: d && !d.error ? d.accountId : null, saved: vault.accounts(provider),
      known: (options.listAccounts ? options.listAccounts() : []).filter(a => (a.agentKeys || []).includes(provider)).map(a => ({ id: a.id, label: a.label })) };
  }

  return { MODULE_ID, VERSION, current, capture, use, sync, signedOut, state };
}

module.exports = { MODULE_ID, VERSION, createAccountSwitch };
