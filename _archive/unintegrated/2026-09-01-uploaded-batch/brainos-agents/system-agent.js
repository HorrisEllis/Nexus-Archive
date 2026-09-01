/**
 * agents/system-agent.js — BrainOS System Agent
 * UUID: brainos-sys-agent-v5000-000000000013
 * Phase 3 · Agent Abstraction Layer
 *
 * Handles infrastructure actions: monitoring, health, key rotation,
 * host bounce, SNR gate, firewall rules, DNS ops.
 * Acts as safe wrapper around infra modules — never calls OS directly.
 */

'use strict';

const { BaseAgent } = require('./base-agent');

const SYS_ACTIONS = new Set(['monitor', 'deploy', 'health', 'rotate', 'bounce', 'snr', 'firewall', 'dns']);

class SystemAgent extends BaseAgent {
  constructor(opts = {}) {
    super({ ...opts, type: 'SystemAgent', defaultTimeout: 30000 });
    this._bridgeUrl = opts.bridgeUrl || 'http://localhost:3747';
  }

  canHandle(intent) {
    return SYS_ACTIONS.has(intent.action)
      || intent.agentHint === 'system'
      || intent.signals?.infra === true;
  }

  async execute(plan, context = {}) {
    const { intent } = plan;
    const bridgeUrl  = context.bridgeUrl || this._bridgeUrl;

    switch (intent.action) {
      case 'monitor':
      case 'health': return this._checkHealth(bridgeUrl, intent);
      case 'rotate': return this._rotateKeys(bridgeUrl, intent);
      case 'bounce': return this._bounceHost(bridgeUrl, intent);
      default:       return this._genericBridgeCall(bridgeUrl, intent);
    }
  }

  async _checkHealth(bridgeUrl, intent) {
    const ac  = new AbortController();
    const tid = setTimeout(() => ac.abort(), 5000);
    try {
      const res = await fetch(`${bridgeUrl}/health`, { signal: ac.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error(`Health check HTTP ${res.status}`);
      const data = await res.json();
      this._emit('system.health', { source: 'SystemAgent', bridgeUrl, health: data });
      return { ok: true, health: data, intentId: intent.id };
    } finally { clearTimeout(tid); }
  }

  async _rotateKeys(bridgeUrl, intent) {
    const type = intent.signals?.keyType || 'all';
    const ac   = new AbortController();
    setTimeout(() => ac.abort(), 10000);
    const endpoint = type === 'all' ? '/keys/rotate-all' : `/keys/rotate/${type}`;
    const res  = await fetch(`${bridgeUrl}${endpoint}`, { method: 'POST', signal: ac.signal });
    if (!res.ok) throw new Error(`Key rotate HTTP ${res.status}`);
    const data = await res.json();
    this._emit('key.rotate', { type, result: data });
    return { rotated: true, type, data, intentId: intent.id };
  }

  async _bounceHost(bridgeUrl, intent) {
    const ac  = new AbortController();
    setTimeout(() => ac.abort(), 10000);
    const res = await fetch(`${bridgeUrl}/hosts/bounce`, { method: 'POST', signal: ac.signal });
    if (!res.ok) throw new Error(`Host bounce HTTP ${res.status}`);
    const data = await res.json();
    return { bounced: true, data, intentId: intent.id };
  }

  async _genericBridgeCall(bridgeUrl, intent) {
    const endpoint = intent.signals?.endpoint || '/health';
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 15000);
    const res = await fetch(`${bridgeUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: intent.action, target: intent.target }),
      signal: ac.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { result: data, intentId: intent.id };
  }
}

module.exports = { SystemAgent };
