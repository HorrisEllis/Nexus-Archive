---
chunk_uuid: 59e1d946-aa28-4c3f-be6e-a6458462ad8f
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-145-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-11-brainos-main-agent-registry-js-3771b6dc-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/145-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-11-brainos-main-agent-registry-js-3771b6dc-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-145-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-11-brainos-main-agent-registry-js-3771b6dc-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-145-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-11-brainos-main-agent-registry-js-3771b6dc-md-md:59e1d946
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:23:59.540Z
---

---
chunk_uuid: 3771b6dc-9bc3-4313-8d03-fb465738b8e6
spec_uuid: a434ae13-9e53-4e45-be1b-7d31929df2d4
section: brainos-main-agent-registry-js
title: BrainOS-main/agent-registry.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a434ae13:brainos-main-agent-registry-js
contract_id: spec-contract:a434ae13:brainos-main-agent-registry-js:3771b6dc
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:26:54.550Z
---

/**
 * agent-registry.js — BrainOS Agent Registry
 * UUID: brainos-agent-registry-v5000-000000000014
 * Phase 3 · Agent Abstraction Layer
 *
 * Central registry of all available agents.
 * Agents register themselves. Registry selects best agent for an intent.
 * Publishes health snapshots on bus. Fails loudly on misconfiguration.
 *
 * Axiom: no agent is called directly — always through registry → factory → bus.
 */

'use strict';

const { AIAgent }          = require('./agents/ai-agent');
const { AutomationAgent }  = require('./agents/automation-agent');
const { SystemAgent }      = require('./agents/system-agent');

const MODULE_UUID    = 'brainos-agent-registry-v5000-000000000014';
const MODULE_VERSION = '5.0.0';

class AgentRegistry {
  constructor(opts = {}) {
    this.uuid      = MODULE_UUID;
    this.version   = MODULE_VERSION;
    this._bus      = null;
    this._agents   = new Map();   // type → Agent instance
    this._stats    = { registered: 0, lookups: 0, notFound: 0 };
    this._opts     = opts;
  }

  /**
   * Wire to event bus AND register all built-in agents.
   * Called once at boot.
   */
  init(bus, opts = {}) {
    this._bus = bus;

    // Register built-in agents
    this.register(new AIAgent({ bridgeUrl: opts.bridgeUrl }));
    this.register(new AutomationAgent({ bridgeUrl: opts.bridgeUrl }));
    this.register(new SystemAgent({ bridgeUrl: opts.bridgeUrl }));

    // Emit health snapshots every 30s
    setInterval(() => this._broadcastHealth(), 30000);

    bus.on('agent.register', ev => {
      this._emit('system.toast', { msg: `Agent registered: ${ev.data?.type}`, type: 'b' });
    });

    this._emit('system.audit', { event: 'registry.init', agents: [...this._agents.keys()] });
    console.log(`[AgentRegistry] Initialized with ${this._agents.size} agents`);
  }

  setBus(bus) { this._bus = bus; }

  _emit(type, data) {
    if (this._bus) this._bus.emit(type, data, { source: 'agent-registry' });
  }

  _fail(ctx, msg) {
    console.error(`[AGENT-REGISTRY] ${ctx}: ${msg}`);
    this._emit('system.error', { source: 'agent-registry', context: ctx, message: msg });
    this._emit('system.toast', { msg: `Registry: ${msg}`, type: 'r' });
  }

  /**
   * Register an agent instance.
   * Agent must extend BaseAgent and implement canHandle() + execute().
   */
  register(agent) {
    if (!agent || typeof agent.execute !== 'function') {
      this._fail('register', 'Agent must implement execute()');
      return;
    }
    if (!agent.type) {
      this._fail('register', 'Agent must have a type string');
      return;
    }
    if (this._agents.has(agent.type)) {
      console.warn(`[AgentRegistry] Overwriting existing agent: ${agent.type}`);
    }

    agent.setBus(this._bus);
    this._agents.set(agent.type, agent);
    this._stats.registered++;
    this._emit('agent.register', { agentId: agent.id, agentType: agent.type });
  }

  /**
   * Get agent by type.
   * Throws loudly if not found (never returns null silently).
   */
  get(type) {
    this._stats.lookups++;
    const agent = this._agents.get(type);
    if (!agent) {
      this._stats.notFound++;
      this._fail('get', `No agent registered for type: "${type}". Registered: ${[...this._agents.keys()].join(', ')}`);
      throw new Error(`AgentRegistry: no agent of type "${type}"`);
    }
    return agent;
  }

  /**
   * Find the best available agent for an intent.
   * Returns { agentId, agentType, available }
   */
  findBest(agentType, intent) {
    this._stats.lookups++;

    // Try exact type first
    if (this._agents.has(agentType)) {
      const agent = this._agents.get(agentType);
      if (agent.canHandle(intent)) {
        return { agentId: agent.id, agentType: agent.type, available: true };
      }
    }

    // Scan all agents for canHandle
    for (const [type, agent] of this._agents) {
      if (agent.canHandle(intent)) {
        return { agentId: agent.id, agentType: type, available: true };
      }
    }

    // Fallback to AIAgent (most