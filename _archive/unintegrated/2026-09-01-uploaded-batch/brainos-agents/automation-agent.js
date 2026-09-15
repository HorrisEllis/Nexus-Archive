/**
 * agents/automation-agent.js — BrainOS Automation Agent
 * UUID: brainos-auto-agent-v5000-000000000012
 * Phase 3 · Agent Abstraction Layer
 *
 * Handles: bridge API calls, CLI commands, webhook triggers, step sequencing.
 * Delegates to routing-engine.js for complex multi-step workflows.
 */

'use strict';

const http  = require('http');
const https = require('https');
const { BaseAgent } = require('./base-agent');

const AUTO_ACTIONS = new Set(['execute', 'deploy', 'trigger', 'run', 'automation']);

class AutomationAgent extends BaseAgent {
  constructor(opts = {}) {
    super({ ...opts, type: 'AutomationAgent', defaultTimeout: 120000 });
    this._bridgeUrl = opts.bridgeUrl || 'http://localhost:3747';
  }

  canHandle(intent) {
    return AUTO_ACTIONS.has(intent.action)
      || intent.agentHint === 'automation'
      || intent.signals?.workflowId !== undefined;
  }

  async execute(plan, context = {}) {
    const { intent, steps } = plan;
    const bridgeUrl = context.bridgeUrl || this._bridgeUrl;
    const step = steps?.[0] || {};
    const cfg  = step.config || intent.signals || {};

    // If a workflowId is specified, queue it via routing-engine
    if (intent.signals?.workflowId) {
      return this._queueWorkflow(bridgeUrl, intent.signals.workflowId, intent);
    }

    // Otherwise execute a direct bridge command
    const endpoint = cfg.cmdEndpoint || cfg.endpoint || '/health';
    const method   = (cfg.cmdMethod || cfg.method || 'POST').toUpperCase();
    const body     = cfg.cmdBody ? this._parseBody(cfg.cmdBody, intent) : { intent: intent.action, input: intent.target };

    const result = await this._request(bridgeUrl + endpoint, method, body,
      intent.constraints?.timeoutMs || 30000);

    return { result, endpoint, intentId: intent.id };
  }

  _parseBody(template, intent) {
    try {
      const interpolated = template
        .replace(/\{\{input\}\}/gi, intent.target || '')
        .replace(/\{\{action\}\}/gi, intent.action || '');
      return JSON.parse(interpolated);
    } catch { return { raw: template }; }
  }

  async _queueWorkflow(bridgeUrl, workflowId, intent) {
    const result = await this._request(
      `${bridgeUrl}/routing/queue`,
      'POST',
      { workflowId, input: intent.target, reason: 'agent', intentId: intent.id },
      15000
    );
    return { queued: true, workflowId, runId: result?.runId, intentId: intent.id };
  }

  _request(url, method, body, timeoutMs) {
    return new Promise((resolve, reject) => {
      let u;
      try { u = new URL(url); } catch (e) { return reject(new Error(`Invalid URL: ${url}`)); }
      const data = body ? JSON.stringify(body) : '';
      const opts = {
        hostname: u.hostname, port: u.port || 80,
        path: u.pathname, method,
        headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
      };
      const req = (u.protocol === 'https:' ? https : http).request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          try { resolve(JSON.parse(d)); } catch { resolve({ raw: d }); }
        });
      });
      req.on('error', reject);
      req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('Timeout')); });
      if (data) req.write(data);
      req.end();
    });
  }
}

module.exports = { AutomationAgent };
