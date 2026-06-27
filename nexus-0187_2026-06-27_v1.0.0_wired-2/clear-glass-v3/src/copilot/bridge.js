'use strict';

/**
 * Co-pilot Bridge
 * Wires the existing NEXUS co-pilot (Cortex) into Clear Glass.
 * Co-pilot sees the live DOM, can issue driver commands, and builds onto the browser.
 * All interactions are CFR-logged.
 */

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

class CoPilotBridge {
  constructor({ sse, apiSettings, nexusBusUrl }) {
    this.sse         = sse;
    this.apiSettings = apiSettings;
    this.nexusBusUrl = nexusBusUrl;
    this.history     = [];    // conversation history per context
    this.maxHistory  = 20;
  }

  // ── Send message to Cortex ────────────────────────────────────────────
  async send({ message, agentId = 'default', domContext, systemExtra, requestId }) {
    const msgId = requestId || uuidv4();

    this.sse.emit('copilot.thinking', { msgId, agentId, ts: Date.now() });

    // Build context
    const systemPrompt = this._buildSystem(agentId, domContext, systemExtra);

    // Add to history
    this.history.push({ role: 'user', content: message, agentId, ts: Date.now() });
    if (this.history.length > this.maxHistory * 2) {
      this.history = this.history.slice(-this.maxHistory * 2);
    }

    // Messages for this agent's context
    const messages = this.history
      .filter(h => h.agentId === agentId)
      .slice(-this.maxHistory)
      .map(h => ({ role: h.role, content: h.content }));

    let response;

    // Try Cortex (NEXUS) first
    try {
      response = await this._callCortex({ systemPrompt, messages, msgId });
    } catch (err) {
      console.warn('[CoPilot] Cortex unavailable, falling back to direct API:', err.message);
      // Fallback: direct Claude API call via API settings
      response = await this._callDirectApi({ systemPrompt, messages, msgId });
    }

    // Add assistant response to history
    this.history.push({ role: 'assistant', content: response.text, agentId, ts: Date.now() });

    // Parse any driver commands embedded in response
    const commands = this._parseCommands(response.text);

    this.sse.emit('copilot.response', {
      msgId,
      agentId,
      text:     response.text,
      commands,
      ts:       Date.now(),
    });

    // CFR log
    this.sse.emit('cfr.entry', {
      id:         uuidv4(),
      intent:     'copilot.message',
      agent:      'copilot',
      componentId: 'clear-glass',
      agentId,
      input:      message.slice(0, 200),
      output:     response.text.slice(0, 200),
      commands:   commands.length,
      ts:         Date.now(),
    });

    return { text: response.text, commands, msgId };
  }

  // ── Try NEXUS Cortex first ────────────────────────────────────────────
  async _callCortex({ systemPrompt, messages, msgId }) {
    const res = await fetch(`${this.nexusBusUrl}/api/cortex/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ systemPrompt, messages, msgId, source: 'clear-glass' }),
      timeout: 30000,
    });

    if (!res.ok) throw new Error(`Cortex HTTP ${res.status}`);
    const data = await res.json();
    return { text: data.response || data.text || data.content || '' };
  }

  // ── Fallback: direct API ─────────────────────────────────────────────
  async _callDirectApi({ systemPrompt, messages, msgId }) {
    const settings = this.apiSettings.get();
    if (!settings.apiKey) {
      return { text: 'No API key configured. Set one in API Settings.' };
    }

    const res = await fetch(settings.endpoint || 'https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      settings.model || 'claude-sonnet-4-6',
        max_tokens: settings.maxTokens || 4096,
        system:     systemPrompt,
        messages,
      }),
      timeout: 60000,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    return { text };
  }

  // ── System prompt builder ─────────────────────────────────────────────
  _buildSystem(agentId, domContext, extra = '') {
    const domSection = domContext
      ? `\n\n## Current Page DOM Context\n\`\`\`json\n${JSON.stringify(domContext, null, 2).slice(0, 3000)}\n\`\`\``
      : '';

    return `You are Clear Glass Co-pilot — the AI intelligence layer of the NEXUS sovereign browser.

You have full access to the browser through ClearDriver commands. You can navigate, click, type, scroll, inject scripts, pick elements, and build onto the browser itself.

## Current Agent Context
Agent ID: ${agentId}

## Available Driver Commands
Issue commands by including JSON blocks tagged with \`\`\`driver:
{
  "action": "navigate",
  "url": "https://example.com"
}
\`\`\`

Available actions: navigate, click, type, scroll, hover, wait, waitFor, screenshot, eval, cookies.get, cookies.set, storage.get, storage.set, picker.enable, inject, record.start, record.stop, network.block, network.intercept

## Co-pilot Powers
- Read and mutate any DOM element
- Inject persistent scripts into pages
- Save and restore cookie vaults
- Create and switch agent contexts
- Build new SEAM modules into Clear Glass
${domSection}
${extra ? '\n## Additional Context\n' + extra : ''}

Always be direct and action-oriented. If you can do something, do it — don't ask for confirmation unless destructive.`;
  }

  // ── Parse driver commands from response ───────────────────────────────
  _parseCommands(text) {
    const commands = [];
    const regex = /```driver\s*\n([\s\S]*?)\n```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        commands.push(JSON.parse(match[1].trim()));
      } catch {}
    }
    return commands;
  }

  clearHistory(agentId) {
    this.history = agentId
      ? this.history.filter(h => h.agentId !== agentId)
      : [];
  }
}

module.exports = CoPilotBridge;
