---
chunk_uuid: 958ee399-e010-41b3-98ec-499f6e3fbdbe
spec_uuid: ac80119a-2d63-420f-86f4-e9d5ef674c12
section: brainos-main-ddns-js
title: BrainOS-main/ddns.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac80119a:brainos-main-ddns-js
contract_id: spec-contract:ac80119a:brainos-main-ddns-js:958ee399
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:28:01.817Z
---

/**
 * ddns.js — BrainOS Dynamic DNS Client
 * UUID: brainos-ddns-module-v5000-0000-000000000005
 *
 * No-IP style DDNS. Detects public IP changes, updates records.
 * No port forwarding required via tunnel relay.
 * Cloudflare + custom DNS integration. Fails loudly.
 */
'use strict';

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const MODULE_UUID = 'brainos-ddns-module-v5000-0000-000000000005';

function uid() {
  return crypto.randomBytes(16).toString('hex');
}

// IP detection services (tried in order)
const IP_SOURCES = [
  'https://api.ipify.org',
  'https://ifconfig.me/ip',
  'https://checkip.amazonaws.com',
  'https://ipecho.net/plain',
];

async function getPublicIP(timeoutMs = 5000) {
  for (const url of IP_SOURCES) {
    try {
      const ip = await new Promise((resolve, reject) => {
        const req = (url.startsWith('https') ? https : http).get(url, { timeout: timeoutMs }, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(d.trim()));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      });
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return ip;
    } catch { /* try next source */ }
  }
  throw new Error('Could not detect public IP from any source');
}

class DDNSClient {
  constructor(opts = {}) {
    this.uuid     = MODULE_UUID;
    this.dataDir  = opts.dataDir || './data';
    this.stateFile = path.join(this.dataDir, 'ddns-state.json');
    this._state   = { lastIP: null, entries: {}, lastCheck: null };
    this._timer   = null;
    this._bus     = null;
    this._stats   = { checks: 0, updates: 0, errors: 0 };
    this._load();
  }

  setBus(bus) {
    this._bus = bus;
    bus.on('net.ddns.force_check', () => this.check());
    bus.on('net.ddns.add_entry',   ev => this.addEntry(ev.data));
  }

  _emit(t, d) { if (this._bus) this._bus.emit(t, d, { source: 'ddns' }); }

  _fail(ctx, msg) {
    console.error(`[DDNS ERROR] ${ctx}: ${msg}`);
    this._stats.errors++;
    this._emit('system.error', { source: 'ddns', context: ctx, message: msg });
  }

  _load() {
    try {
      if (fs.existsSync(this.stateFile))
        this._state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } catch (e) { this._fail('load', e.message); }
  }

  _save() {
    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
      const tmp = this.stateFile + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this._state, null, 2));
      fs.renameSync(tmp, this.stateFile);
    } catch (e) { this._fail('save', e.message); }
  }

  /** Add a DDNS entry. Returns a token for updates. */
  addEntry({ hostname, provider = 'internal', config = {} }) {
    const token = uid();
    this._state.entries[hostname] = { hostname, provider, config, token, ip: null, updated: null };
    this._save();
    this._emit('net.ddns.entry_added', { hostname, token });
    return { hostname, token };
  }

  /** Check public IP and update all entries if changed */
  async check() {
    this._stats.checks++;
    this._state.lastCheck = Date.now();
    let ip;
    try { ip = await getPublicIP(); }
    catch (e) { this._fail('getPublicIP', e.message); return; }

    const changed = ip !== this._state.lastIP;
    this._state.lastIP = ip;
    this._emit('net.ddns.ip_detected', { ip, changed });

    if (changed) {
      for (const entry of Object.values(this._state.entries)) {
        await this._updateEntry(entry, ip).catch(e => this._fail('update', e.message));
      }
    }
    this._save();
    return { ip, changed };
  }

  async _updateEntry(entry, ip) {
    switch (entry.provider) {
      case 'cloudflare':   await this._updateCloudflare(entry, ip); break;
      case 'noip':         await this._updateNoIP(entry, ip); break;
      case 'dyndns':       await this._updateDynDNS(entry,