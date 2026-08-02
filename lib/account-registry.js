'use strict';
/**
 * lib/account-registry.js — CA7 (backend) of the awareness/routing phasemap
 * UUID: nexus-account-registry-v1-0000-2026-0730-001
 *
 * §PHASEMAP CA7 (docs/copilot-awareness-routing-phasemap.spec, CHUNK D). ClearGlass
 * routes to providers (claude/chatgpt/gemini/perplexity) one connection each
 * today. This adds MULTIPLE ACCOUNT SLOTS per provider (James: "login to multiple
 * accounts in ClearGlass like an app password"), so CA5 routing can target a
 * specific account. Stored as editable cortex rows (the schema-registry /
 * routing-config pattern) — §2.2 cortex is truth, §0.3 versioned, §0.4 fluid.
 *
 * SECURITY NOTE (§honest): this stores an account LABEL + a credential REFERENCE
 * (a key name / app-password id), NOT a raw secret in plaintext where avoidable.
 * The real secret lives in the OS/Electron credential store; this registry holds
 * the reference the ClearGlass shell resolves at login. The live login + the
 * tv-ui gear are Electron-side and prove out on James's machine — this backend
 * is what they read/write.
 */

const ACCOUNTS_TABLE = 'provider_accounts';
const PROVIDERS = ['claude', 'chatgpt', 'gemini', 'perplexity'];

function _jaa() { return require('../cortex/memory/jaa-db'); }

/**
 * addAccount(provider, label, opts) — register an account slot for a provider.
 * opts.credentialRef is a REFERENCE (key name / app-password id), not a raw
 * secret. Returns the stored row.
 */
function addAccount(provider, label, opts = {}) {
  if (!PROVIDERS.includes(provider)) return { error: `unknown provider "${provider}" — one of: ${PROVIDERS.join(', ')}` };
  if (!label) return { error: 'an account label is required' };
  const { jaaDB, uid } = _jaa();
  const row = {
    uuid: uid ? uid() : `acct-${provider}-${Date.now()}`,
    kind: 'provider_account',
    provider,
    label,                                   // e.g. "work", "personal"
    credentialRef: opts.credentialRef || null,  // reference, NOT a raw secret
    active: opts.active !== false,
    default: !!opts.default,
    addedBy: opts.addedBy || 'user',
    status: 'registered',                    // registered | connected | failed
    ts: Date.now(),
  };
  try {
    // If this is set default, clear other defaults for the provider first.
    if (row.default) {
      for (const a of listAccounts(provider)) {
        if (a.default) jaaDB.update(ACCOUNTS_TABLE, a.uuid, { default: false });
      }
    }
    jaaDB.insert(ACCOUNTS_TABLE, row);
    return row;
  } catch (e) { return { error: `failed to persist account: ${e.message}` }; }
}

/** listAccounts(provider?) — account slots, optionally filtered by provider. */
function listAccounts(provider) {
  try {
    const { jaaDB } = _jaa();
    const rows = jaaDB.query(ACCOUNTS_TABLE, r => (provider ? r.provider === provider : true) && r.status !== 'removed', 1000) || [];
    return rows;
  } catch (_) { return []; }
}

/** getAccountForRoute(provider, accountLabel?) — pick the account CA5 routing
 *  should use: the named one, else the provider's default, else the first active. */
function getAccountForRoute(provider, accountLabel) {
  const accts = listAccounts(provider).filter(a => a.active);
  if (!accts.length) return null;
  if (accountLabel) return accts.find(a => a.label === accountLabel) || null;
  return accts.find(a => a.default) || accts[0];
}

/** setAccountStatus(uuid, status) — mark connected/failed after a login attempt
 *  (§1.2 — a failed account is observable, not swallowed). */
function setAccountStatus(uuid, status) {
  try { const { jaaDB } = _jaa(); jaaDB.update(ACCOUNTS_TABLE, uuid, { status, statusAt: Date.now() }); return { ok: true }; }
  catch (e) { return { error: e.message }; }
}

/** removeAccount(uuid) — archive an account slot (§0.3 not deleted). */
function removeAccount(uuid) {
  try { const { jaaDB } = _jaa(); jaaDB.update(ACCOUNTS_TABLE, uuid, { status: 'removed', removedAt: Date.now() }); return { ok: true }; }
  catch (e) { return { error: e.message }; }
}

module.exports = {
  ACCOUNTS_TABLE, PROVIDERS,
  addAccount, listAccounts, getAccountForRoute, setAccountStatus, removeAccount,
  MODULE_ID: 'account-registry', VERSION: '1.0.0',
};
