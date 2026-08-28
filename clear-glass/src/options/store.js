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
const { defaultPinnedIds } = require('../toolbar/commands');

const OPTIONS_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'nexus-options.json'
);

const DEFAULTS = {
  // Window behavior
  hideToTrayOnClose:    true,   // close (✕) button / OS close → hide to tray instead of destroying
  defaultStartUrl:       'about:blank',

  // §NEW 2026-08-24 — real gap named in CLEAR-GLASS-FULL-CHROME-MAP-
  // 2026-08-23.md's §3: "no real 'change download directory' setting
  // anywhere — checked NexusOptions and main/index.js's session config
  // directly, zero matches." null means "use Electron's own default
  // downloads path" (unchanged behavior); a real path here is honored by
  // src/downloads/adapter.js's will-download handler.
  downloadDirectory: null,

  // Co-pilot pane
  autoOpenCopilotPane:   true,

  // Toolbar customization — ids of feature buttons pinned to the main
  // chrome bar. Anything not listed here lives in the command palette only.
  // §STRUCTURAL 2026-08-24 — was a hand-written array here, duplicating
  // src/toolbar/commands.js's defaultPinned flags with no link between the
  // two. Derived now so there's exactly one place that decides what's
  // pinned on a fresh install or a reset.
  pinnedToolbarButtons:  defaultPinnedIds(),

  // §NEW 2026-08-28 — TX16's real, first buildable slice (docs/clearglass-
  // agent-suite-and-cfr-loom-phasemap.spec's own TX16 entry, and TX14's own
  // honest §HONEST LIMIT naming this exact gap: "on-disk callto persistence
  // (matching UserscriptManager's own real convention)"). guardian-picker.js's
  // activeListeners is a plain in-memory Map — confirmed directly, dies on
  // page navigation and on restart. This is the persistence half of the
  // fix: a real listener config survives both. Keyed by id (same object-map
  // convention as accounts below, for the same reason — a real delete needs
  // a key that can actually disappear, which set()'s merge can never do).
  listeners: {},

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

  // ── Listeners — TX16 real slice, real CRUD, never through set() ─────────
  // Real listener entity: { id (stable uuid), urlPattern (glob, same
  // semantics as UserscriptManager's own @match — reused, not reinvented:
  // '*' wildcard segments, e.g. 'https://chatgpt.com/*'), fingerprint (the
  // real element fingerprint object guardian-picker.js's own fingerprint()
  // already produces — not re-derived here, just stored), eventType
  // ('mutation'|'click', matching the listener-config-modal's real options),
  // calltoId (the registered callto this listener triggers on fire —
  // reuses the existing callto system rather than inventing a second
  // action mechanism), enabled, createdAt, updatedAt }.
  //
  // §HONEST LIMIT — this store only holds and returns listener CONFIG. It
  // does not attach anything to a live DOM, does not know whether a tab
  // matching urlPattern is currently open, and does not re-run
  // fingerprint() to re-locate the element after a reload — that real
  // wiring (auto-reattach on navigation) is TX16's own next slice, named
  // honestly as not done here, same as TX14's own honest-limit convention.

  listListeners() {
    return Object.values(this.data.listeners || {}).sort((a, b) => a.createdAt - b.createdAt);
  }

  getListener(id) {
    return this.data.listeners?.[id] || null;
  }

  /**
   * registerListener({urlPattern, fingerprint, eventType, calltoId}) —
   * real, stable uuid, never reused. enabled defaults true — a listener
   * a person just configured should fire the next time its page loads,
   * not require a second "turn it on" step.
   */
  registerListener({ urlPattern, fingerprint, eventType, calltoId, label, matchCriteria, linkTarget } = {}) {
    if (!urlPattern)  return { error: 'urlPattern required' };
    if (!fingerprint) return { error: 'fingerprint required' };
    const id  = randomUUID();
    const now = Date.now();
    const listener = {
      id, urlPattern, fingerprint, eventType: eventType || 'mutation',
      // §EXTENDED 2026-08-28 — James, live, in guardian-picker.js's real
      // listener-config modal: linkTarget already carries far more than a
      // bare calltoId (bridge url, external url, ledger, compartment,
      // sse-system, ollama-stream — real options already built there).
      // calltoId is kept for backward compatibility with anything already
      // written against the narrower shape; linkTarget is the real,
      // current one guardian-picker.js actually produces and this store
      // now holds it honestly instead of silently dropping everything
      // but a callto id.
      calltoId: calltoId || (linkTarget?.type === 'callto' ? linkTarget.calltoId : null) || null,
      label: label || null,
      matchCriteria: matchCriteria || null,
      linkTarget: linkTarget || null,
      enabled: true, createdAt: now, updatedAt: now,
    };
    this.data = { ...this.data, listeners: { ...this.data.listeners, [id]: listener } };
    this._persist();
    return { ...listener };
  }

  updateListener(id, updates = {}) {
    const existing = this.data.listeners?.[id];
    if (!existing) return { error: `no listener "${id}"` };
    const updated = {
      ...existing,
      ...(updates.urlPattern !== undefined ? { urlPattern: updates.urlPattern } : {}),
      ...(updates.fingerprint !== undefined ? { fingerprint: updates.fingerprint } : {}),
      ...(updates.eventType !== undefined ? { eventType: updates.eventType } : {}),
      ...(updates.calltoId !== undefined ? { calltoId: updates.calltoId } : {}),
      ...(updates.enabled !== undefined ? { enabled: !!updates.enabled } : {}),
      updatedAt: Date.now(),
    };
    this.data = { ...this.data, listeners: { ...this.data.listeners, [id]: updated } };
    this._persist();
    return { ...updated };
  }

  /**
   * removeListener(id) — real removal, not a soft-delete flag. Same
   * rebuild-without-the-key pattern deleteAccount uses, for the same
   * reason: set()'s one-level merge can only add/overwrite, never delete.
   */
  removeListener(id) {
    if (!this.data.listeners?.[id]) return { error: `no listener "${id}"` };
    const { [id]: _removed, ...rest } = this.data.listeners;
    this.data = { ...this.data, listeners: rest };
    this._persist();
    return { ok: true, id };
  }

  /**
   * findListenersForUrl(url) — every enabled, persisted listener whose
   * urlPattern matches this url. Real caller: whatever wires TX16's next
   * slice (auto-reattach on navigation) calls this on every real page
   * load to know what to re-attach — this store doesn't call it itself.
   * Same glob semantics as UserscriptManager._matchesUrl (a '*' wildcard
   * segment, anchored full-string match) — but with one honest
   * improvement, not a silent behavior change: this version escapes real
   * regex special characters (the literal '.' in 'chatgpt.com', for one)
   * before building the pattern, where the original leaves them
   * unescaped and matching-too-loosely as a side effect. Worth fixing
   * here since a listener firing on the wrong page is a real, visible
   * mistake in a way userscript over-matching mostly isn't.
   */
  findListenersForUrl(url) {
    if (!url) return [];
    return this.listListeners().filter(l => {
      if (!l.enabled) return false;
      const re = new RegExp('^' + l.urlPattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      return re.test(url);
    });
  }
}

module.exports = NexusOptions;
