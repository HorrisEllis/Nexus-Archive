'use strict';
/**
 * cortex/contract/index.js — Agent Interaction Contracts
 * UUID: nexus-cortex-contract-v1-0000-2026-0629-jamesbrooks-001
 * Version: 1.0.0
 *
 * One source of truth for "what is this source of requests allowed to do."
 * docs/raid.spec's tool_approval_gate reuses this instead of a second
 * tools.json — built here because it didn't exist anywhere in the tree,
 * despite `cortex/core/raid`'s own test suite requiring it directly.
 *
 * §AX-001 — nothing is trusted until proven. Unregistered sources fall
 * through to _default, which requires proof for everything and explicitly
 * denies 'tool' outright — a registered contract is how a source earns
 * more than that, not something it gets by default.
 */

const CONTRACTS = {
  // Registered, known-internal sources. Add an entry here when a new
  // sovereign system needs to call _approveTool — don't widen _default.
  copilot: {
    trust_level:     'local',
    allowed_actions: ['tool', 'chat', 'build', 'diagnose', 'ask'],
    denied_actions:  ['forge'],
    proof_required:  false,
    rate_limits:     { tool: { max: 20, windowMs: 60000 } },
  },

  guardian: {
    trust_level:     'local',
    allowed_actions: ['tool', 'chat', 'dispatch'],
    denied_actions:  [],
    proof_required:  false,
    rate_limits:     { tool: { max: 30, windowMs: 60000 } },
  },

  cli: {
    trust_level:     'operator',
    allowed_actions: ['tool', 'chat', 'build', 'diagnose', 'forge', 'ask'],
    denied_actions:  [],
    proof_required:  false,
    rate_limits:     { tool: { max: 60, windowMs: 60000 } },
  },

  orchestrator: {
    trust_level:     'system',
    allowed_actions: ['tool', 'dispatch'],
    denied_actions:  [],
    proof_required:  false,
    rate_limits:     { tool: { max: 100, windowMs: 60000 } },
  },

  // Fallback for any source not listed above. Minimal trust by
  // construction — 'tool' is explicitly denied (not just absent from
  // allowed_actions, so the reason can say so plainly), everything else
  // requires proof.
  _default: {
    trust_level:     'minimal',
    allowed_actions: [],
    denied_actions:  ['tool'],
    proof_required:  true,
    rate_limits:     { '*': { max: 10, windowMs: 60000 } },
  },
};

function get(source) {
  return CONTRACTS[source] || CONTRACTS._default;
}

module.exports = { CONTRACTS, get };
