'use strict';
/**
 * cos/src/compartments/drivers.js — COS Compartment Drivers
 * UUID: cos-drivers-v1-0000-0000-000000000015
 *
 * Each driver knows how to: start, stop, destroy, snapshot a compartment type.
 * Drivers are registered on the kernel. The kernel calls them via gates.
 *
 * Browser driver  → Clear Glass :7702 IPC
 * CDP driver      → ErosmancerOS :7432 REST (via wire :7704)
 * Node driver     → child_process.spawn
 */

const fetch         = require('node-fetch');
const { spawn }     = require('child_process');
const { v4: uuidv4 } = require('uuid');

const CG_IPC   = process.env.CG_IPC_URL  || 'http://localhost:7702';
const WIRE_URL = process.env.WIRE_URL    || 'http://localhost:7704';
const EROS_URL = process.env.EROS_URL    || 'http://localhost:7432';

// ── Browser Driver — Clear Glass ──────────────────────────────────────────
class BrowserDriver {
  constructor() {
    this.type = 'browser';
  }

  async start(record) {
    // Tell Clear Glass to open an agent window for this compartment
    const res = await fetch(`${CG_IPC}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        eventType: 'window.open',
        data:      { agentId: record.id, url: record.config.url || 'about:blank' },
      }),
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`ClearGlass window.open failed: ${res.status}`);

    // Create a fingerprinted context for this compartment
    await fetch(`${CG_IPC}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        eventType: 'context.create',
        data:      { agentId: record.id, profileOptions: record.config.fingerprint || {} },
      }),
      timeout: 10000,
    }).catch(() => {}); // Context may already exist

    return { cgAgentId: record.id, url: record.config.url || 'about:blank' };
  }

  async stop(record) {
    await fetch(`${CG_IPC}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ eventType: 'window.close', data: { agentId: record.id } }),
      timeout: 5000,
    }).catch(() => {});
  }

  async destroy(record) {
    await this.stop(record);
    // Snapshot cookies before destroy
    await fetch(`${CG_IPC}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ eventType: 'cookie.snapshot', data: { agentId: record.id } }),
      timeout: 5000,
    }).catch(() => {});
  }

  async navigate(record, { url }) {
    return this._cmd(record.id, 'driver.exec', { action: 'navigate', url });
  }

  async driverExec(record, args) {
    return this._cmd(record.id, 'driver.exec', args);
  }

  async copilot(record, { message, domContext, systemExtra }) {
    return this._cmd(record.id, 'copilot.message', { message, agentId: record.id, domContext, systemExtra });
  }

  async snapshot(record) {
    const res = await fetch(`${CG_IPC}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ eventType: 'cookie.snapshot', data: { agentId: record.id } }),
      timeout: 5000,
    });
    return res.ok ? await res.json() : { error: 'snapshot failed' };
  }

  async _cmd(agentId, eventType, data) {
    const res = await fetch(`${CG_IPC}/cmd`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ eventType, data: { ...data, agentId } }),
      timeout: 30000,
    });
    if (!res.ok) throw new Error(`ClearGlass ${eventType} failed: ${res.status}`);
    return res.json();
  }
}

// ── CDP Driver — ErosmancerOS ─────────────────────────────────────────────
class CdpDriver {
  constructor() {
    this.type = 'cdp';
  }

  async start(record) {
    const url = record.config.url || 'about:blank';

    // Open a tab in ErosmancerOS
    const res = await fetch(`${EROS_URL}/api/tab/open`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
      timeout: 15000,
    });

    if (!res.ok) throw new Error(`ErosmancerOS tab.open failed: ${res.status}`);
    const { tabId, targetId } = await res.json();

    return { erosTabId: tabId || targetId, url };
  }

  async stop(record) {
    const tabId = record.meta?.erosTabId;
    if (!tabId) return;
    await fetch(`${EROS_URL}/api/tab/close`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tabId }),
      timeout: 5000,
    }).catch(() => {});
  }

  async destroy(record) {
    await this.stop(record);
    // Sweep the node registry for this compartment
    await fetch(`${EROS_URL}/api/node/sweep`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), timeout: 5000,
    }).catch(() => {});
  }

  async exec(record, { action, ...args }) {
    const tabId = record.meta?.erosTabId;
    const endpoints = {
      click:         '/api/os/click',
      type:          '/api/os/type',
      navigate:      '/api/os/navigate',
      evaluate:      '/api/os/evaluate',
      screenshot:    '/api/os/screenshot',
      waitForSelector: '/api/os/wait',
    };
    const endpoint = endpoints[action];
    if (!endpoint) throw new Error(`No ErosmancerOS endpoint for action: ${action}`);

    const res = await fetch(`${EROS_URL}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tabId, ...args }),
      timeout: 30000,
    });
    if (!res.ok) throw new Error(`ErosmancerOS ${action} failed: ${res.status}`);
    return res.json();
  }

  async snapshot(record) {
    const tabId = record.meta?.erosTabId;
    if (!tabId) return { error: 'no tabId' };
    const res = await fetch(`${EROS_URL}/api/node/tab/${tabId}`, { timeout: 5000 });
    return res.ok ? { nodes: await res.json() } : { error: 'snapshot failed' };
  }
}

// ── Node Process Driver ────────────────────────────────────────────────────
class NodeDriver {
  constructor({ onOutput } = {}) {
    this.type     = 'node';
    this.onOutput = onOutput || (() => {}); // SSE callback
    this.processes = new Map(); // compartmentId → child process
  }

  async start(record) {
    const cmd      = record.config.cmd || 'node';
    const args     = record.config.args || [];
    const cwd      = record.config.cwd || process.cwd();
    const env      = { ...process.env, ...record.config.env };

    const child = spawn(cmd, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });

    child.stdout.on('data', data => {
      this.onOutput('process.output', { compartmentId: record.id, stream: 'stdout', output: data.toString() });
    });
    child.stderr.on('data', data => {
      this.onOutput('process.output', { compartmentId: record.id, stream: 'stderr', output: data.toString() });
    });
    child.on('exit', (code) => {
      this.onOutput('process.exit', { compartmentId: record.id, code });
      this.processes.delete(record.id);
    });

    this.processes.set(record.id, child);
    return { pid: child.pid, cmd, args };
  }

  async stop(record) {
    const child = this.processes.get(record.id);
    if (child) {
      child.kill('SIGTERM');
      this.processes.delete(record.id);
    }
  }

  async destroy(record) {
    const child = this.processes.get(record.id);
    if (child) { child.kill('SIGKILL'); this.processes.delete(record.id); }
  }

  async exec(record, { cmd }) {
    const child = this.processes.get(record.id);
    if (!child?.stdin) throw new Error('No stdin for process compartment');
    child.stdin.write(cmd + '\n');
    return { sent: cmd };
  }

  async snapshot(record) {
    const child = this.processes.get(record.id);
    return { pid: child?.pid, running: !!child };
  }
}

module.exports = { BrowserDriver, CdpDriver, NodeDriver };
