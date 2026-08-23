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

  // Background tabs — real defaults for src/main/index.js's already-real
  // openBackgroundTab/closeBackgroundTab/listBackgroundTabs. No UI or
  // boot-time consumer reads this yet (that's Phase 2/5's job); the key
  // exists now so Phase 1 is a real, complete config surface rather than
  // one item short of what the plan named.
  backgroundTabDefaults: {
    openInBackground: true,   // "Move to Background Tab" context-menu default state
  },

  // §PLACEHOLDER, real shape not real behavior yet — Phase 3/4's own
  // job to make this mean something (account/uuid model, Agent Suite).
  // Present now, empty now, so later phases extend an existing key
  // rather than introduce a new one mid-plan.
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
        fs.writeFileSync(OPTIONS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
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
    const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    const merged = { ...this.data };
    for (const [k, v] of Object.entries(updates)) {
      merged[k] = isPlainObject(v) && isPlainObject(this.data[k]) ? { ...this.data[k], ...v } : v;
    }
    this.data = merged;
    fs.writeFileSync(OPTIONS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    return { ...this.data };
  }

  get() { return { ...this.data }; }
}

module.exports = NexusOptions;
