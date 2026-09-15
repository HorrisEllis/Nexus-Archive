/**
 * agents/base-agent.js — BrainOS Base Agent
 * UUID: brainos-base-agent-v5000-000000000010
 * Phase 3 · Agent Abstraction Layer
 *
 * Standard interface every agent MUST implement:
 *   execute(plan, context) → result
 *   canHandle(intent)      → boolean
 *   health()               → { ok, ... }
 *
 * Base handles:
 *   - Bus wiring
 *   - Trace event emission (agent.executed / agent.failed)
 *   - Timeout enforcement
 *   - Retry logic
 *   - Loud failure — never silent
 */

'use strict';

const crypto = require('crypto');

class BaseAgent {
  constructor(opts = {}) {
    this.id       = opts.id      || crypto.randomBytes(6).toString('hex');
    this.type     = opts.type    || 'BaseAgent';
    this.version  = opts.version || '5.0.0';
    this._bus     = null;
    this._stats   = { executions: 0, successes: 0, failures: 0, totalMs: 0 };
    this._maxRetries    = opts.maxRetries    ?? 2;
    this._defaultTimeout = opts.defaultTimeout ?? 60000;
  }

  /** Wire to event bus — called by AgentRegistry */
  setBus(bus) {
    this._bus = bus;
  }

  /** Emit event on bus */
  _emit(type, data) {
    if (this._bus) this._bus.emit(type, data, { source: this.type });
  }

  /** Loud failure — logs, toasts, emits */
  _fail(ctx, msg, extra = {}) {
    this._stats.failures++;
    const full = `[${this.type}] ${ctx}: ${msg}`;
    console.error(full);
    this._emit('agent.failed', { agentId: this.id, agentType: this.type, context: ctx, message: msg, ...extra });
    this._emit('system.toast', { msg: `${this.type}: ${msg}`, type: 'r' });
    this._emit('system.error', { source: this.type, context: ctx, message: msg });
  }

  // ── INTERFACE — subclasses MUST override ────────────────────────────────────

  /**
   * Execute a plan step.
   * @param {object} plan   — ExecutionPlan from IntentRouter
   * @param {object} context — runtime context (bridgeUrl, injected frameworks, etc)
   * @returns {Promise<any>} — result
   */
  async execute(plan, context = {}) {
    throw new Error(`${this.type}.execute() not implemented`);
  }

  /**
   * Can this agent handle the given intent?
   * @param {object} intent — normalized Intent
   * @returns {boolean}
   */
  canHandle(intent) {
    return false;
  }

  // ── HELPERS — provided to all subclasses ────────────────────────────────────

  /**
   * Run execute() with automatic:
   *   - timeout enforcement
   *   - retry on transient failure
   *   - trace event emission
   */
  async run(plan, context = {}) {
    const timeout = plan.constraints?.timeoutMs || this._defaultTimeout;
    const maxRetries = this._maxRetries;
    let attempt = 0;
    let lastErr;

    this._stats.executions++;
    this._emit('agent.started', { agentId: this.id, agentType: this.type, traceId: plan.traceId, intentId: plan.intentId });

    const startMs = Date.now();

    while (attempt <= maxRetries) {
      attempt++;
      try {
        // Race between execute() and timeout
        const result = await Promise.race([
          this.execute(plan, context),
          new Promise((_, rej) => setTimeout(() => rej(new Error(`Timeout after ${timeout}ms`)), timeout)),
        ]);

        const latencyMs = Date.now() - startMs;
        this._stats.successes++;
        this._stats.totalMs += latencyMs;

        this._emit('agent.executed', {
          agentId:    this.id,
          agentType:  this.type,
          traceId:    plan.traceId,
          intentId:   plan.intentId,
          provider:   plan.provider,
          latencyMs,
          attempt,
        });

        return result;

      } catch (err) {
        lastErr = err;
        const isTransient = err.message.includes('Timeout') || err.message.includes('ECONNRESET')
          || err.message.includes('ECONNREFUSED') || err.message.includes('503')
          || err.message.includes('429');

        if (isTransient && attempt <= maxRetries) {
          const delay = 500 * attempt;
          console.warn(`[${this.type}] Attempt ${attempt} failed, retrying in ${delay}ms: ${err.message}`);
          this._emit('agent.retry', { agentId: this.id, agentType: this.type, attempt, delay, error: err.message });
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        break;
      }
    }

    // All attempts exhausted
    this._fail('run', `Failed after ${attempt} attempt(s): ${lastErr.message}`, {
      traceId: plan.traceId, intentId: plan.intentId, attempts: attempt,
    });
    throw lastErr;
  }

  /** Standard health response */
  health() {
    const avgMs = this._stats.successes
      ? Math.round(this._stats.totalMs / this._stats.successes) : 0;
    return {
      ok:      true,
      id:      this.id,
      type:    this.type,
      version: this.version,
      stats:   { ...this._stats, avgLatencyMs: avgMs },
    };
  }
}

module.exports = { BaseAgent };
