'use strict';

/**
 * SEAM — Sovereign Module Registration
 * Registers Clear Glass as a NEXUS component with UUID, hooks, and wire declarations.
 * Handles heartbeat, deregistration, and hook dispatch.
 */

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

class SeamModule {
  constructor({ moduleId, uuid, nexusBusUrl, sse, hooks = {} }) {
    this.moduleId     = moduleId;
    this.uuid         = uuid;
    this.nexusBusUrl  = nexusBusUrl;
    this.sse          = sse;
    this.hooks        = hooks;
    this.registered   = false;
    this.heartbeatInterval = null;
    this.retryDelay   = 3000;
    this.maxRetries   = 10;
  }

  // ── Registration ────────────────────────────────────────────────────────
  async register() {
    const payload = {
      moduleId:    this.moduleId,
      uuid:        this.uuid,
      type:        'browser',
      version:     '0.1.0',
      capabilities: Object.keys(this.hooks),
      hooks: Object.keys(this.hooks).map(name => ({
        name,
        direction: 'in',
        schema: 'any',
      })),
      wires: [
        { name: 'dom.events',    direction: 'out', description: 'Live DOM mutation stream' },
        { name: 'cookie.events', direction: 'out', description: 'Cookie lifecycle events' },
        { name: 'nav.events',    direction: 'out', description: 'Navigation events' },
        { name: 'copilot.out',   direction: 'out', description: 'Co-pilot responses' },
        { name: 'driver.result', direction: 'out', description: 'Automation results' },
      ],
      sse: {
        port: this.sse?.port,
        path: '/events',
      },
      ts: Date.now(),
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const res = await fetch(`${this.nexusBusUrl}/api/seam/register`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
          timeout: 5000,
        });

        if (res.ok) {
          this.registered = true;
          this._startHeartbeat();
          console.log(`[SEAM] Registered — ${this.moduleId}:${this.uuid}`);
          return true;
        }

        console.warn(`[SEAM] Registration attempt ${attempt + 1} failed: ${res.status}`);
      } catch (err) {
        console.warn(`[SEAM] Registration attempt ${attempt + 1} error: ${err.message}`);
      }

      attempt++;
      await this._sleep(this.retryDelay * Math.min(attempt, 5));
    }

    // Non-fatal — Clear Glass works standalone if NEXUS bus is offline
    console.warn('[SEAM] Could not reach NEXUS bus — running standalone');
    return false;
  }

  async deregister() {
    this._stopHeartbeat();
    if (!this.registered) return;

    try {
      await fetch(`${this.nexusBusUrl}/api/seam/deregister`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ uuid: this.uuid, moduleId: this.moduleId }),
      });
      this.registered = false;
      console.log('[SEAM] Deregistered');
    } catch (err) {
      console.warn('[SEAM] Deregister error:', err.message);
    }
  }

  // ── Hook dispatch ────────────────────────────────────────────────────────
  async dispatch(hookName, payload) {
    const handler = this.hooks[hookName];
    if (!handler) {
      console.warn(`[SEAM] No handler for hook: ${hookName}`);
      return { error: `Unknown hook: ${hookName}` };
    }

    try {
      const result = await handler(payload);
      this.sse?.emit('hook.result', { hook: hookName, result, ts: Date.now() });
      return { ok: true, result };
    } catch (err) {
      console.error(`[SEAM] Hook error [${hookName}]:`, err);
      this.sse?.emit('hook.error', { hook: hookName, error: err.message, ts: Date.now() });
      return { error: err.message };
    }
  }

  // ── Heartbeat ────────────────────────────────────────────────────────────
  _startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`${this.nexusBusUrl}/api/seam/heartbeat`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ uuid: this.uuid, ts: Date.now() }),
        });
      } catch {
        // Silent — NEXUS may be temporarily offline
      }
    }, 15000);
  }

  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

module.exports = SeamModule;
