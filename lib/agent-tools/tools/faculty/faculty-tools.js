'use strict';
/**
 * lib/agent-tools/tools/faculty-tools.js — P5 of the omniscience phasemap
 * UUID: nexus-agent-tools-faculty-v1-0000-2026-0730-001
 *
 * §PHASEMAP P5. The copilot faculties (adversarial, module-builder,
 * axiom-manager, analysis) are NOT tools — they have their own shapes. Rather
 * than move them (which would break their interfaces and mix abstractions),
 * these are thin ADAPTERS that give the agentic loop a tool-shaped door into
 * each faculty (§16.5 — wrap, don't move; the faculty keeps owning its logic,
 * §10.1). Requiring the faculty lazily inside execute() keeps this loadable even
 * where a faculty's own deps aren't all present.
 *
 * Registered by lib/agent-tools/index.js alongside the base 10 tools, so both
 * copilot's and Guardian's loops (P1/P4) get them for free — the mesh.
 */

function _lazy(modPath) {
  return () => require(modPath);
}

const moduleBuilderTool = {
  name: 'module_builder',
  description: 'Build a new NEXUS module from a natural-language description, running the full spec → QC → build pipeline. Returns the build result. Use when the user wants to CREATE a new component or capability.',
  parameters: {
    type: 'object',
    properties: {
      description: { type: 'string', description: 'What the module should do, in plain language.' },
    },
    required: ['description'],
  },
  execute: async ({ description }) => {
    if (!description) return { error: 'description is required' };
    try {
      const mb = require('../../../../copilot/module-builder');
      const result = await mb.build(description, { source: 'agent-tools' });
      return { ok: true, result };
    } catch (e) { return { error: `module_builder failed: ${e.message}` }; }
  },
};

const adversarialTool = {
  name: 'run_adversarial',
  description: 'Run an adversarial critique pass over the current system stream — attacks recent activity to surface violations, weaknesses, and contradictions. Use to stress-test a proposal or check for problems.',
  parameters: {
    type: 'object',
    properties: {
      stream: { type: 'array', description: 'Optional array of recent events to critique; empty uses the live stream.', items: { type: 'object' } },
    },
    required: [],
  },
  execute: async ({ stream }) => {
    try {
      const adv = require('../../../../copilot/adversarial');
      const result = await adv.run(Array.isArray(stream) ? stream : []);
      return { ok: true, result };
    } catch (e) { return { error: `run_adversarial failed: ${e.message}` }; }
  },
};

const axiomCheckTool = {
  name: 'axiom_check',
  description: 'Check a prompt, spec, or proposed action against the NEXUS axioms. Returns which axioms are engaged and any violations. Use before acting on something consequential.',
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'The prompt, spec, or action description to check against the axioms.' },
    },
    required: ['text'],
  },
  execute: async ({ text }) => {
    if (!text) return { error: 'text is required' };
    try {
      const ax = require('../../../../copilot/axiom-manager');
      const result = ax.check(text);
      return { ok: true, result };
    } catch (e) { return { error: `axiom_check failed: ${e.message}` }; }
  },
};

const analyzeTool = {
  name: 'analyze',
  description: 'Deep analytical answer to a question about the system or a problem, using the analysis faculty (assembles context and reasons over it). Use for "why" and "how" questions that need reasoning, not just a lookup.',
  parameters: {
    type: 'object',
    properties: {
      question: { type: 'string', description: 'The question to analyze.' },
    },
    required: ['question'],
  },
  execute: async ({ question }) => {
    if (!question) return { error: 'question is required' };
    try {
      const an = require('../../../../copilot/analysis');
      const result = await an.answer(question, 'agent-tools', [], {});
      return { ok: true, result };
    } catch (e) { return { error: `analyze failed: ${e.message}` }; }
  },
};

const synthesizeTool = {
  name: 'synthesize',
  description: 'Synthesize a real, structured build contract (fileName, primitives, compartmentUuid, synthesized context, endState, conditions, axioms, tools) from plain-text context — the same the_officiator hat and B1 schema officiate() uses for staged artifacts, but callable directly by any agent for its OWN reasoning. Does NOT queue a contract by default — pass submit:true to also submit one via the real RAID contract-intake path.',
  parameters: {
    type: 'object',
    properties: {
      contextText: { type: 'string', description: 'The context to synthesize a contract from — a task description, spec excerpt, or any real context the agent has.' },
      submit: { type: 'boolean', description: 'If true, also queues the synthesized result as a real RAID build contract. Defaults to false (synthesis only, for the agent\'s own context).' },
      forAgent: { type: 'string', description: 'Which agent wears the_officiator hat for this synthesis call. Defaults to claude.' },
    },
    required: ['contextText'],
  },
  execute: async ({ contextText, submit, forAgent }) => {
    if (!contextText) return { error: 'contextText is required' };
    try {
      const officiator = require('../../../../cortex/core/raid/officiator');
      const result = await officiator.synthesizeFromContext(contextText, { submit: !!submit, forAgent });
      return result.ok ? { ok: true, result } : { error: `synthesize failed: ${result.reason}` };
    } catch (e) { return { error: `synthesize failed: ${e.message}` }; }
  },
};

module.exports = [moduleBuilderTool, adversarialTool, axiomCheckTool, analyzeTool, synthesizeTool];
