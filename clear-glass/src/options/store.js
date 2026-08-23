'use strict';
/**
 * src/options/store.js — Nexus Options Store
 * UUID: cg-options-store-v1-0000-0000-000000000011
 *
 * Persistent, bus-controllable settings for Clear Glass's own behavior —
 * distinct from src/api/settings.js (provider API keys/credentials).
 *
 * This is the home for "Nexus options": window behavior, defaults, and
 * (in later phases) bookmarks-bar visibility, userscript auto-attach,
 * rewind retention, etc. New option keys get added to DEFAULTS as each
 * phase lands — nothing here is a stub, every key wired here is read by
 * real code the moment it's added.
 *
 * Exposed on the bus as options.get / options.set so Cortex/copilot can
 * read and change these remotely, same as any other gate.
 */

const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

const OPTIONS_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'nexus-options.json'
);

const DEFAULTS = {
  // Window behavior
  hideToTrayOnClose:    true,   // close (✕) button / OS close → hide to tray instead of destroying
  defaultStartUrl:       'about:blank',

  // Co-pilot pane
  autoOpenCopilotPane:   true,

  // Toolbar customization — ids of feature buttons pinned to the main
  // chrome bar. Anything not listed here lives in the overflow menu only.
  pinnedToolbarButtons:  ['copilot-toggle', 'btn-bookmark'],

  // §PHASE-1 2026-08-23 — CLEAR-GLASS-EXPANSION-PLAN-2026-08-23.md,
  // "NexusOptions: real config surface... per-provider autoStartOnBoot."
  // Real provider ids, matching src/providers/registry.js's own
  // NCP_PROVIDERS exactly (checked directly, not guessed) — a provider
  // added there later needs a matching entry here, same one-source-of-
  // truth discipline that file's own header already states for itself.
  autoStartOnBoot: {
    claude:     true,
    chatgpt:    true,
    gemini:     true,
    perplexity: true,
  },

  // §BL24 2026-08-23 — James: "also have the ability to disable opening
  // in the background on startup" (for userscripts specifically —
  // distinct from backgroundTabDefaults below, which is about tabs, not
  // script injection). Real, confirmed gap before this: autoInject() in
  // src/userscripts/manager.js fires unconditionally on every matching
  // nav.loaded event, with zero distinction between a real, person-
  // initiated navigation and a navigation that only happened because
  // autoBootAll() pre-warmed a hidden provider tab at startup. Default
  // false — matches the real, existing behavior exactly (auto-inject
  // everywhere, always) so this key changes nothing until someone
  // explicitly opts into the new, narrower behavior.
  disableUserscriptAutoInjectOnStartup: false,

  // Background tabs — real defaults for src/main/index.js's already-real
  // openBackgroundTab/closeBackgroundTab/listBackgroundTabs. No UI or
  // boot-time consumer reads this yet (that's Phase 2/5's job); the key
  // exists now so Phase 1 is a real, complete config surface rather than
  // one item short of what the plan named.
  backgroundTabDefaults: {
    openInBackground: true,   // "Move to Background Tab" context-menu default state
  },

  // §PHASE-3 2026-08-23 — CLEAR-GLASS-EXPANSION-PLAN-2026-08-23.md item 6:
  // real account entities now live here — the placeholder shape from
  // Phase 1 becomes real data as of this phase. Keyed by a stable, real
  // UUID (not the agentKey string, not the literal "default" that every
  // real call site in agent-mesh.js hardcoded before this phase), each
  // account real-linked to one or more agentKeys via its own agentKeys
  // array. See createAccount/resolveDefaultAccountForAgent below for the
  // real, safe CRUD surface — accounts are NEVER mutated through the
  // generic set() path (its one-level merge can't express a real delete
  // or a wholesale agentKeys replace without genuinely corrupting sibling
  // accounts), only through these dedicated methods.
  accounts: {},
};

class NexusOptions {
  constructor() {
    this.data = { ...DEFAULTS };
  }

  async load() {
    try {
      fs.mkdirSync(path.dirname(OPTIONS_PATH), { recursive: true });
      if (fs.existsSync(OPTIONS_PATH)) {
        const raw = JSON.parse(fs.readFileSync(OPTIONS_PATH, 'utf8'));
        this.data = { ...DEFAULTS, ...raw };
      } else {
        this._persist();
      }
    } catch (err) {
      console.warn('[NexusOptions] Load error:', err.message);
    }
    return this.data;
  }

  async set(updates) {
    // §BUGFIX 2026-08-23 — found while adding the first real nested
    // option keys (autoStartOnBoot, backgroundTabDefaults, accounts):
    // the old shallow merge silently WIPED OUT every sibling key on a
    // partial nested update — set({autoStartOnBoot:{claude:false}})
    // deleted chatgpt/gemini/perplexity's real settings entirely, not
    // just left them unset. Confirmed directly before fixing, not
    // assumed. Real fix: merge one level deep specifically for values
    // that are plain objects (not arrays, not primitives) — arrays like
    // pinnedToolbarButtons and simple keys like hideToTrayOnClose keep
    // their original, correct "replace wholesale" behavior; only the
    // new nested-object keys get real, safe partial-update semantics.
    //
    // §NOTE — this one-level merge is exactly why accounts get their own
    // dedicated methods below instead of going through set({accounts:...}):
    // a real account delete needs a key to actually disappear, which this
    // merge can never do (it only adds/overwrites, never removes).
    const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    const merged = { ...this.data };
    for (const [k, v] of Object.entries(updates)) {
      merged[k] = isPlainObject(v) && isPlainObject(this.data[k]) ? { ...this.data[k], ...v } : v;
    }
    this.data = merged;
    this._persist();
    return { ...this.data };
  }

  get() { return { ...this.data }; }

  // ── Accounts — §PHASE-3 2026-08-23, real CRUD, never through set() ──────
  // Real account entity: { id (stable uuid), label, agentKeys: [string],
  // createdAt, updatedAt }. One account can link more than one agentKey
  // (e.g. the same real person's Claude and ChatGPT logins); an agentKey
  // is not itself required to be linked to exactly one account, though
  // resolveDefaultAccountForAgent below picks a single, deterministic one
  // when a caller needs "the" account for a given agent and didn't say
  // which.

  /** _persist() — the one real place this store writes to disk. */
  _persist() {
    fs.writeFileSync(OPTIONS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
  }

  listAccounts() {
    return Object.values(this.data.accounts || {}).sort((a, b) => a.createdAt - b.createdAt);
  }

  getAccount(id) {
    return this.data.accounts?.[id] || null;
  }

  /**
   * createAccount({label, agentKeys}) — real, stable uuid, never reused.
   * agentKeys defaults to [] — an account can exist unlinked (e.g. created
   * from an Agent Suite "add account" flow before the person picks which
   * agent it's for).
   */
  createAccount({ label, agentKeys = [] } = {}) {
    const id  = randomUUID();
    const now = Date.now();
    const account = {
      id,
      label:      label || `Account ${Object.keys(this.data.accounts || {}).length + 1}`,
      agentKeys:  [...new Set(agentKeys)],
      createdAt:  now,
      updatedAt:  now,
    };
    this.data = { ...this.data, accounts: { ...this.data.accounts, [id]: account } };
    this._persist();
    return { ...account };
  }

  /**
   * updateAccount(id, updates) — real, in-place field update (label and/or
   * a wholesale agentKeys replacement). Not a merge of agentKeys arrays —
   * an array field is always "replace wholesale," matching the same
   * convention set() already uses for arrays like pinnedToolbarButtons;
   * use linkAgent/unlinkAgent below for a real, additive/subtractive
   * single-key change instead of hand-building the whole array.
   */
  updateAccount(id, updates = {}) {
    const existing = this.data.accounts?.[id];
    if (!existing) return { error: `no account "${id}"` };
    const updated = {
      ...existing,
      ...(updates.label !== undefined ? { label: updates.label } : {}),
      ...(updates.agentKeys !== undefined ? { agentKeys: [...new Set(updates.agentKeys)] } : {}),
      updatedAt: Date.now(),
    };
    this.data = { ...this.data, accounts: { ...this.data.accounts, [id]: updated } };
    this._persist();
    return { ...updated };
  }

  /**
   * deleteAccount(id) — real removal, not a soft-delete flag. Rebuilds
   * the accounts object without this key rather than going through set()
   * (which, per the note above, cannot express a real delete).
   */
  deleteAccount(id) {
    if (!this.data.accounts?.[id]) return { error: `no account "${id}"` };
    const { [id]: _removed, ...rest } = this.data.accounts;
    this.data = { ...this.data, accounts: rest };
    this._persist();
    return { ok: true, id };
  }

  linkAgent(id, agentKey) {
    const existing = this.data.accounts?.[id];
    if (!existing) return { error: `no account "${id}"` };
    if (existing.agentKeys.includes(agentKey)) return { ...existing };
    return this.updateAccount(id, { agentKeys: [...existing.agentKeys, agentKey] });
  }

  unlinkAgent(id, agentKey) {
    const existing = this.data.accounts?.[id];
    if (!existing) return { error: `no account "${id}"` };
    return this.updateAccount(id, { agentKeys: existing.agentKeys.filter(k => k !== agentKey) });
  }

  /**
   * resolveDefaultAccountForAgent(agentKey) — the real replacement for
   * every hardcoded accountId:'default' call site in agent-mesh.js.
   * Deterministic: if one or more real accounts are already linked to
   * this agentKey, returns the earliest-created one's id (stable choice,
   * not "whichever iterates first"). If none exist yet, auto-creates a
   * real account — labeled "Default — <agentKey>" so it's identifiable
   * later in an Agent Suite UI, not a mystery uuid — links it, and
   * returns its id. Every future call for the same agentKey gets that
   * same real uuid back, not a fresh one each time.
   */
  resolveDefaultAccountForAgent(agentKey) {
    const linked = this.listAccounts().filter(a => a.agentKeys.includes(agentKey));
    if (linked.length) return linked[0].id;
    const created = this.createAccount({ label: `Default — ${agentKey}`, agentKeys: [agentKey] });
    return created.id;
  }
}

module.exports = NexusOptions;
