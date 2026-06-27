'use strict';

/**
 * Agent Mesh
 * Free AI agent channels baked into Clear Glass.
 * Each agent runs in its own fingerprinted context.
 * ClearDriver automates their web UIs — no API keys needed.
 * RAID routes tasks to whichever agent is healthy.
 * 
 * Agents: Claude, ChatGPT, Gemini, Perplexity, Mistral, Grok, Meta AI
 */

const { v4: uuidv4 } = require('uuid');

const AGENT_REGISTRY = {
  claude: {
    id:       'claude',
    name:     'Claude',
    url:      'https://claude.ai',
    inputSel: 'div[contenteditable="true"]',
    sendSel:  'button[aria-label*="Send"]',
    respSel:  '.font-claude-message',
    color:    '#cc785c',
  },
  chatgpt: {
    id:       'chatgpt',
    name:     'ChatGPT',
    url:      'https://chatgpt.com',
    inputSel: '#prompt-textarea',
    sendSel:  'button[data-testid="send-button"]',
    respSel:  '.markdown.prose',
    color:    '#19c37d',
  },
  gemini: {
    id:       'gemini',
    name:     'Gemini',
    url:      'https://gemini.google.com',
    inputSel: 'rich-textarea .ql-editor',
    sendSel:  'button.send-button',
    respSel:  'message-content',
    color:    '#4285f4',
  },
  perplexity: {
    id:       'perplexity',
    name:     'Perplexity',
    url:      'https://perplexity.ai',
    inputSel: 'textarea[placeholder*="Ask"]',
    sendSel:  'button[aria-label*="Submit"]',
    respSel:  '.prose',
    color:    '#20b2aa',
  },
  mistral: {
    id:       'mistral',
    name:     'Mistral',
    url:      'https://chat.mistral.ai',
    inputSel: 'textarea',
    sendSel:  'button[type="submit"]',
    respSel:  '.message-content',
    color:    '#f97316',
  },
  grok: {
    id:       'grok',
    name:     'Grok',
    url:      'https://grok.com',
    inputSel: 'textarea',
    sendSel:  'button[aria-label*="Send"]',
    respSel:  '.message-bubble',
    color:    '#1da1f2',
  },
};

class AgentMesh {
  constructor({ ctxMgr, driver, sse, seam }) {
    this.ctxMgr  = ctxMgr;
    this.driver  = driver;
    this.sse     = sse;
    this.seam    = seam;
    this.agents  = new Map(); // agentKey → AgentState
    this.queue   = [];        // pending tasks
    this.processing = false;
  }

  async init() {
    console.log(`[AgentMesh] Registry: ${Object.keys(AGENT_REGISTRY).join(', ')}`);
  }

  // ── Spawn agent context ───────────────────────────────────────────────
  async spawn(agentKey, options = {}) {
    const def = AGENT_REGISTRY[agentKey];
    if (!def) throw new Error(`Unknown agent: ${agentKey}`);

    const contextId = `mesh-${agentKey}-${uuidv4().slice(0, 8)}`;

    // Create isolated context
    await this.ctxMgr.create({
      agentId: contextId,
      profileOptions: options.fingerprint || {},
    });

    const state = {
      key:       agentKey,
      contextId,
      def,
      status:    'spawned',
      health:    100,
      taskCount: 0,
      lastUsed:  Date.now(),
      windowId:  null,
    };

    this.agents.set(contextId, state);

    this.sse.emit('mesh.agent.spawned', {
      agentKey, contextId, url: def.url, ts: Date.now(),
    });

    return state;
  }

  // ── Send prompt to agent ──────────────────────────────────────────────
  async send({ agentKey, prompt, contextId, waitForResponse = true, timeout = 60000 }) {
    // Find or spawn context
    let state = contextId
      ? this.agents.get(contextId)
      : this._getBestAgent(agentKey);

    if (!state) {
      state = await this.spawn(agentKey);
    }

    const def = state.def;
    const taskId = uuidv4();

    this.sse.emit('mesh.task.start', {
      taskId, agentKey: state.key, contextId: state.contextId,
      promptSnippet: prompt.slice(0, 100), ts: Date.now(),
    });

    try {
      // Navigate to agent URL if needed
      const currentUrl = await this.driver.exec({ action: 'getUrl', agentId: state.contextId });
      if (!currentUrl.url?.includes(new URL(def.url).hostname)) {
        await this.driver.exec({ action: 'navigate', agentId: state.contextId, url: def.url });
        await this.driver.exec({ action: 'waitFor', agentId: state.contextId, selector: def.inputSel, timeout: 15000 });
      }

      // Clear and type prompt
      await this.driver.exec({ action: 'click',  agentId: state.contextId, selector: def.inputSel });
      await this.driver.exec({ action: 'type',   agentId: state.contextId, selector: def.inputSel, text: prompt, clearFirst: true });
      await this.driver.exec({ action: 'wait',   agentId: state.contextId, ms: 300 + Math.random() * 200 });
      await this.driver.exec({ action: 'click',  agentId: state.contextId, selector: def.sendSel });

      state.taskCount++;
      state.lastUsed = Date.now();
      state.status   = 'working';

      if (!waitForResponse) {
        return { taskId, contextId: state.contextId, status: 'sent' };
      }

      // Wait for response
      const response = await this._waitForResponse(state, taskId, timeout);

      state.status = 'idle';
      state.health = Math.min(100, state.health + 5);

      this.sse.emit('mesh.task.complete', {
        taskId, agentKey: state.key, contextId: state.contextId,
        responseSnippet: response?.slice(0, 200), ts: Date.now(),
      });

      // Fire NEXUS hook if registered
      await this.seam?.dispatch('mesh.response', {
        taskId, agentKey: state.key, contextId: state.contextId, response,
      }).catch(() => {});

      return { taskId, contextId: state.contextId, response, agentKey: state.key };

    } catch (err) {
      state.status  = 'error';
      state.health  = Math.max(0, state.health - 20);

      this.sse.emit('mesh.task.error', {
        taskId, agentKey: state.key, contextId: state.contextId,
        error: err.message, ts: Date.now(),
      });

      throw err;
    }
  }

  // ── RAID-style routing — best healthy agent ───────────────────────────
  async route({ prompt, preferAgent, fallbackOrder }) {
    const order = fallbackOrder || (preferAgent
      ? [preferAgent, ...Object.keys(AGENT_REGISTRY).filter(k => k !== preferAgent)]
      : Object.keys(AGENT_REGISTRY));

    for (const agentKey of order) {
      const state = this._getBestAgent(agentKey);
      if (state && state.health >= 50 && state.status !== 'error') {
        try {
          return await this.send({ agentKey, prompt, contextId: state.contextId });
        } catch {
          continue; // Try next agent
        }
      }

      // Spawn fresh if none healthy
      if (!state) {
        try {
          const newState = await this.spawn(agentKey);
          return await this.send({ agentKey, prompt, contextId: newState.contextId });
        } catch {
          continue;
        }
      }
    }

    throw new Error('All agents unavailable');
  }

  // ── Queue management ──────────────────────────────────────────────────
  enqueue(task) {
    const queuedTask = { ...task, queuedAt: Date.now(), taskId: uuidv4() };
    this.queue.push(queuedTask);
    this.sse.emit('mesh.queue.add', { taskId: queuedTask.taskId, depth: this.queue.length, ts: Date.now() });
    this._processQueue();
    return { taskId: queuedTask.taskId, position: this.queue.length };
  }

  async _processQueue() {
    if (this.processing || !this.queue.length) return;
    this.processing = true;

    while (this.queue.length) {
      const task = this.queue.shift();
      this.sse.emit('mesh.queue.processing', { taskId: task.taskId, remaining: this.queue.length, ts: Date.now() });

      try {
        await this.route(task);
      } catch (err) {
        this.sse.emit('mesh.queue.error', { taskId: task.taskId, error: err.message, ts: Date.now() });
      }
    }

    this.processing = false;
  }

  // ── Wait for agent response ───────────────────────────────────────────
  async _waitForResponse(state, taskId, timeout) {
    const def   = state.def;
    const start = Date.now();

    // Get initial response count
    let initialCount = 0;
    try {
      initialCount = await this.driver.exec({
        action: 'eval',
        agentId: state.contextId,
        code: `document.querySelectorAll(${JSON.stringify(def.respSel)}).length`,
      });
      initialCount = initialCount.result || 0;
    } catch {}

    // Poll for new response
    while (Date.now() - start < timeout) {
      await this._sleep(1500);

      try {
        const result = await this.driver.exec({
          action: 'eval',
          agentId: state.contextId,
          code: `
            (function() {
              const els = document.querySelectorAll(${JSON.stringify(def.respSel)});
              if (els.length <= ${initialCount}) return null;
              // Get last response — check it's not still streaming
              const last = els[els.length - 1];
              const text = last?.innerText?.trim();
              // Detect streaming (cursor element present or text too short)
              const streaming = document.querySelector('[data-is-streaming]') ||
                                document.querySelector('.result-streaming') ||
                                document.querySelector('.cursor-blink');
              if (streaming) return null; // still generating
              return text || null;
            })()
          `,
        });

        if (result.result && result.result.length > 10) {
          return result.result;
        }
      } catch {}
    }

    throw new Error(`Response timeout after ${timeout}ms`);
  }

  // ── Internals ──────────────────────────────────────────────────────────
  _getBestAgent(agentKey) {
    let best = null;
    for (const state of this.agents.values()) {
      if (state.key !== agentKey) continue;
      if (state.status === 'error') continue;
      if (!best || state.health > best.health) best = state;
    }
    return best;
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  listAgents() {
    return [...this.agents.values()].map(s => ({
      key:       s.key,
      contextId: s.contextId,
      status:    s.status,
      health:    s.health,
      taskCount: s.taskCount,
      lastUsed:  s.lastUsed,
    }));
  }

  getRegistry() { return Object.values(AGENT_REGISTRY); }
}

module.exports = AgentMesh;
