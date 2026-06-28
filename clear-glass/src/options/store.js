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
    this.data = { ...this.data, ...updates };
    fs.writeFileSync(OPTIONS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    return { ...this.data };
  }

  get() { return { ...this.data }; }
}

module.exports = NexusOptions;
