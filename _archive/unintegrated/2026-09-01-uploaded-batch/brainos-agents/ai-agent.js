/**
 * agents/ai-agent.js — BrainOS AI Agent
 * UUID: brainos-ai-agent-v5000-000000000011
 * Phase 3 · Agent Abstraction Layer
 *
 * Routes AI requests through the bridge to any configured provider.
 * Handles: provider fallback, streaming, conversation context, framework injection.
 */

'use strict';

const http  = require('http');
const https = require('https');
const { BaseAgent } = require('./base-agent');

const AI_ACTIONS = new Set([
  'analysis', 'reasoning', 'code', 'research', 'summarize',
  'creative', 'fast', 'default',
]);

class AIAgent extends BaseAgent {
  constructor(opts = {}) {
    super({ ...opts, type: 'AIAgent', defaultTimeout: 90000 });
    this._bridgeUrl = opts.bridgeUrl || 'http://localhost:3747';
  }

  canHandle(intent) {
    return AI_ACTIONS.has(intent.action) || !intent.action;
  }

  async execute(plan, context = {}) {
    const { intent, provider, fallbackChain, steps } = plan;
    const step = steps?.[0] || {};

    const bridgeUrl = context.bridgeUrl || this._bridgeUrl;
    const providers = [provider, ...(fallbackChain || []).filter(p => p !== provider)];

    // Build message payload
    const prompt = this._buildPrompt(intent, step, context);
    const system = this._buildSystem(intent, step, context);

    let lastErr;
    for (const prov of providers) {
      try {
        const result = await this._callProvider(bridgeUrl, prov, prompt, system, intent, step);
        return { text: result, provider: prov, intentId: intent.id };
      } catch (e) {
        lastErr = e;
        console.warn(`[AIAgent] ${prov} failed: ${e.message}, trying next`);
        this._emit('agent.provider.failed', { agentId: this.id, provider: prov, error: e.message });
      }
    }

    throw lastErr || new Error('All AI providers failed');
  }

  _buildPrompt(intent, step, context) {
    // Template interpolation: {{prev}} → previous output from context
    let prompt = step.config?.agentInput || intent.target || '';
    const prev = context.previousOutput || '';
    prompt = prompt.replace(/\{\{prev\}\}/gi, prev)
                   .replace(/\{\{input\}\}/gi, intent.raw || intent.target);

    // Inject framework if present
    if (context.injected && Object.keys(context.injected).length) {
      const fwStr = JSON.stringify(context.injected, null, 2);
      prompt = `[Framework Context]\n${fwStr}\n\n${prompt}`;
    }

    return prompt;
  }

  _buildSystem(intent, step, context) {
    const base = step.config?.agentSystem || step.config?.system || '';
    const actionHints = {
      code:      'You are an expert software engineer. Provide clean, well-commented code.',
      analysis:  'You are a senior analyst. Be precise, structured, and evidence-based.',
      reasoning: 'You are a careful reasoner. Show your thinking step by step.',
      research:  'You are a thorough researcher. Cite sources and be comprehensive.',
      creative:  'You are a creative writer. Be original, vivid, and engaging.',
      summarize: 'You are an expert at clear, concise summaries. Be brief but complete.',
      fast:      'Be concise and direct. Answer in as few words as possible.',
    };
    return base || actionHints[intent.action] || '';
  }

  async _callProvider(bridgeUrl, provider, prompt, system, intent, step) {
    const body = {
      provider,
      intent:     intent.action,
      model:      step.config?.agentModel || step.config?.model || undefined,
      messages:   [{ role: 'user', content: prompt }],
      system:     system || undefined,
      max_tokens: step.config?.maxTokens || intent.constraints?.maxTokens || 2048,
    };

    const result = await this._post(`${bridgeUrl}/v1/messages`, body,
      intent.constraints?.timeoutMs || 90000);

    const text = result?.content?.[0]?.text
      || result?.choices?.[0]?.message?.content
      || result?.response
      || null;

    if (!text) throw new Error(`${provider}: empty response`);
    return text;
  }

  _post(url, body, timeoutMs = 90000) {
    return new Promise((resolve, reject) => {
      let u;
      try { u = new URL(url); } catch (e) { return reject(new Error(`Invalid URL: ${url}`)); }

      const data = JSON.stringify(body);
      const opts = {
        hostname: u.hostname,
        port:     u.port || (u.protocol === 'https:' ? 443 : 80),
        path:     u.pathname,
        method:   'POST',
        headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      };

      const ac  = new (require('abort-controller') || AbortController)();
      const tid = setTimeout(() => ac.abort(), timeoutMs);

      const req = (u.protocol === 'https:' ? https : http).request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          clearTimeout(tid);
          try { resolve(JSON.parse(d)); }
          catch (e) { reject(new Error(`Invalid JSON from ${url}: ${d.slice(0, 100)}`)); }
        });
      });

      req.on('error', e => { clearTimeout(tid); reject(e); });
      req.on('timeout', () => { req.destroy(); reject(new Error(`Request timeout: ${url}`)); });
      req.setTimeout(timeoutMs);
      req.write(data);
      req.end();
    });
  }
}

module.exports = { AIAgent };
