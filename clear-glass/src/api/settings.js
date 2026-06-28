'use strict';
/**
 * src/api/settings.js — NEXUS Connection Settings
 * UUID: cg-api-settings-v3-0000-0000-000000000021
 *
 * Stores NEXUS service ports and co-pilot routing config.
 * No Claude API key here — co-pilot routes through NEXUS copilot at :3750,
 * which handles all model routing (Ollama → Guardian NCP → fallback).
 * Direct API key lives in NEXUS copilot's own config, not here.
 */

const path = require('path');
const fs   = require('fs');

const SETTINGS_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'nexus-settings.json'
);

const DEFAULTS = {
  // ── NEXUS service ports ────────────────────────────────────────────────
  orchestratorPort: 9000,
  cortexPort:       3748,
  guardianPort:     7820,
  copilotPort:      3750,
  ollamaPort:       3749,
  bridgePort:       9999,
  idearium:         4800,

  // ── Clear Glass own ports ──────────────────────────────────────────────
  ssePort:  7701,
  ipcPort:  7702,
  tlsPort:  7703,

  // ── Co-pilot routing ───────────────────────────────────────────────────
  useCortex:        true,   // route copilot through NEXUS copilot :3750
  raidEnabled:      true,   // enable RAID routing in NEXUS
  copilotChannel:   'clear-glass', // channel name for copilot sessions

  // ── Fallback only — used when NEXUS copilot is unreachable ────────────
  // (Set these in NEXUS copilot's own config, not here.)
  fallbackApiKey:  '',
  fallbackModel:   'claude-sonnet-4-6',
  fallbackEndpoint: 'https://api.anthropic.com/v1/messages',
};

class ApiSettings {
  constructor() { this.data = { ...DEFAULTS }; }

  async load() {
    try {
      fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
      if (fs.existsSync(SETTINGS_PATH)) {
        const raw = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
        this.data = { ...DEFAULTS, ...raw };
      } else {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('[Settings] Load error:', err.message);
    }
  }

  async set(updates) {
    this.data = { ...this.data, ...updates };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    return { ok: true };
  }

  get() { return { ...this.data }; }

  getPublic() {
    const { fallbackApiKey: _, ...safe } = this.data;
    return { ...safe, hasFallbackKey: !!this.data.fallbackApiKey };
  }

  // Convenience helpers used by other modules
  nexusUrl(path = '') {
    return `http://127.0.0.1:${this.data.orchestratorPort}${path}`;
  }
  copilotUrl(path = '') {
    return `http://127.0.0.1:${this.data.copilotPort}${path}`;
  }
  guardianUrl(path = '') {
    return `http://127.0.0.1:${this.data.guardianPort}${path}`;
  }
  cortexUrl(path = '') {
    return `http://127.0.0.1:${this.data.cortexPort}${path}`;
  }
}

module.exports = ApiSettings;
