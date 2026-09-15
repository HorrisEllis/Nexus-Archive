---
chunk_uuid: 8c237d06-fd62-4586-b1b8-711640361f01
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-12-brainos-main-bootloader-js-c2dc5c67-md
title: nexus/idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/12-brainos-main-bootloader-js-c2dc5c67.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-12-brainos-main-bootloader-js-c2dc5c67-md
contract_id: spec-contract:47e02ad5:nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-12-brainos-main-bootloader-js-c2dc5c67-md:8c237d06
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:59.195Z
---

---
chunk_uuid: c2dc5c67-30ce-4b85-9bba-4871551105ae
spec_uuid: 78a72e70-56a9-4c94-987f-c7285f1b1de2
section: brainos-main-bootloader-js
title: BrainOS-main/bootloader.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:78a72e70:brainos-main-bootloader-js
contract_id: spec-contract:78a72e70:brainos-main-bootloader-js:c2dc5c67
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:27:34.741Z
---

/**
 * bootloader.js — BrainOS Bootloader
 * UUID: brainos-bootloader-v5000-000000000017
 * Phase 0 · Critical Stability
 *
 * Single entry point. Deterministic boot order. Safe-fail on every phase.
 * Every failure is loud and logged. Nothing silently pretends to work.
 *
 * Boot order (from roadmap Phase 0):
 *   1. config load
 *   2. event bus init
 *   3. intent router init
 *   4. agent registry init
 *   5. bridge connect
 *   6. workflow engine init
 *   7. plugin handshake
 *   8. ready
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const http = require('http');

const MODULE_UUID = 'brainos-bootloader-v5000-000000000017';
const VERSION     = '5.0.0';

// Deferred requires — only load after bus is up
function loadModules() {
  return {
    BUS:    require('./bus').BUS,
    PARSER: require('./intent-parser').PARSER,
    SCORER: require('./intent-scoring').SCORER,
    ROUTER: require('./intent-router').ROUTER,
    REGISTRY: require('./agent-registry').REGISTRY,
    FACTORY:  require('./agent-factory').FACTORY,
    ENGINE:   require('./workflow-engine').ENGINE,
  };
}

// ── Phase runner — executes phases in order, loud on any failure ──────────────
class Bootloader {
  constructor(opts = {}) {
    this.uuid     = MODULE_UUID;
    this.version  = VERSION;
    this.dataDir  = opts.dataDir  || path.join(__dirname, 'data');
    this.port     = opts.port     || null;     // bridge port if running server mode
    this.bridgeScan = opts.bridgeScan !== false; // scan for existing bridge
    this._health  = {
      config:    { ok: false },
      bus:       { ok: false },
      router:    { ok: false },
      agents:    { ok: false },
      bridge:    { ok: false, url: null },
      workflows: { ok: false },
      ready:     false,
      startedAt: null,
      readyAt:   null,
      elapsedMs: null,
    };
    this._modules = null;
  }

  /** Main boot sequence. Returns health report. */
  async boot() {
    this._health.startedAt = Date.now();
    console.log(`\n[BOOTLOADER] BrainOS v${VERSION} booting...`);
    console.log(`[BOOTLOADER] Data dir: ${this.dataDir}\n`);

    await this._phase('config',    () => this._loadConfig());
    await this._phase('bus',       () => this._initBus());
    await this._phase('router',    () => this._initRouter());
    await this._phase('agents',    () => this._initAgents());
    await this._phase('bridge',    () => this._connectBridge());
    await this._phase('workflows', () => this._initWorkflows());
    await this._phase('plugin',    () => this._pluginHandshake());

    this._health.ready   = true;
    this._health.readyAt = Date.now();
    this._health.elapsedMs = this._health.readyAt - this._health.startedAt;

    const ok = Object.values(this._health)
      .filter(v => typeof v === 'object' && v !== null)
      .every(v => v.ok !== false);

    this._writeHealthFile();

    this._modules.BUS.emit('system.ready', {
      version: VERSION,
      elapsedMs: this._health.elapsedMs,
      bridge:  this._health.bridge.url,
    });

    console.log(`\n[BOOTLOADER] ✓ Ready in ${this._health.elapsedMs}ms`);
    console.log(`[BOOTLOADER] Bridge: ${this._health.bridge.url || 'disconnected'}\n`);

    return this._health;
  }

  /** Run a named phase. Catches and logs — never throws from _phase(). */
  async _phase(name, fn) {
    process.stdout.write(`[BOOT] ${name.padEnd(12)} ... `);
    try {
      const result = await fn();
      this._health[name] = { ok: true, ...(result || {}) };
      console.log('✓');
    } catch (err) {
      this._health[name] = { ok: false, error: err.message };
      console.log(`✗  ${err.message}`);
      // Emit error if bus is already up
      if (this._modules?.BUS) {
        this._modules.BUS.emit('system.error', {
          source:  'bootloader',
          phase:   name,
          message: err.message,
        });
      }
      // Only abort on bus failure (everything else can degrade gracefully)
      if (name === 'bus') throw err;