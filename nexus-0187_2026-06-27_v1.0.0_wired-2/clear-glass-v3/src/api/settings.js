'use strict';

const path = require('path');
const fs   = require('fs');

const SETTINGS_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'api-settings.json'
);

const DEFAULTS = {
  apiKey:    '',
  endpoint:  'https://api.anthropic.com/v1/messages',
  model:     'claude-sonnet-4-6',
  maxTokens: 4096,
  nexusBus:  'http://localhost:7700',
  ssePort:   7701,
  ipcPort:   7702,
  useCortex: true,
  raidEnabled: true,
};

class ApiSettings {
  constructor() {
    this.data = { ...DEFAULTS };
  }

  async load() {
    try {
      fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
      if (fs.existsSync(SETTINGS_PATH)) {
        const raw = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
        this.data = { ...DEFAULTS, ...raw };
      }
    } catch (err) {
      console.warn('[ApiSettings] Load error:', err.message);
    }
  }

  async set(updates) {
    this.data = { ...this.data, ...updates };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    return { ok: true };
  }

  get() { return { ...this.data }; }

  // Return safe version (no API key)
  getPublic() {
    const { apiKey: _, ...safe } = this.data;
    return { ...safe, hasApiKey: !!this.data.apiKey };
  }
}

module.exports = ApiSettings;
