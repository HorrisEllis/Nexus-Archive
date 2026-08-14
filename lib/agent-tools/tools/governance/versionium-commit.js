'use strict';
/**
 * lib/agent-tools/tools/governance/versionium-commit.js — versionium_commit tool
 * UUID: nexus-tool-versionium-commit-v1-0000-2026-0814-jamesbrooks-001
 *
 * §WIRED 2026-08-14, DELIBERATELY MINIMAL — James asked for "versionium."
 * Checked cortex/versionium/index.js directly: init/stop/setDeps/commit —
 * four functions, that's the entire real surface. The rewind/branch/
 * snapshot capability referenced in this session's own earlier transcript
 * ("the system is supposed to backup itself using the versionium, rewind
 * and snapshot system") does NOT exist in code — it's already mapped,
 * explicitly, as R2 in docs/repair-contract-and-loom-hub-phasemap.spec:
 * "the one genuine gap" everything else in that phasemap depends on.
 * Wrapping rewind/branch here would be exposing a tool that calls
 * functions that don't exist. This wraps the one real function honestly
 * and states the gap rather than papering over it.
 */
const versionium = require('../../../../cortex/versionium/index.js');

module.exports = {
  name: 'versionium_commit',
  description:
    'Commit the current state via Versionium (message required, optional branch/causedBy). This is the ' +
    'ONLY real Versionium capability that exists right now — rewind, branch-switching, and snapshot ' +
    'restore are mapped (docs/repair-contract-and-loom-hub-phasemap.spec, phase R2) but not built. Do not ' +
    'assume this tool can undo anything; it can only record a point.',
  parameters: {
    type: 'object',
    properties: {
      message:   { type: 'string', description: 'required — what this commit represents' },
      branch:    { type: 'string', description: 'optional, defaults to "main"' },
      causedBy:  { type: 'string', description: 'optional — what triggered this commit' },
    },
    required: ['message'],
  },
  async execute({ message, branch, causedBy } = {}) {
    if (!message) return { error: 'message is required' };
    try { return { ok: true, result: versionium.commit({ message, branch, causedBy }) }; }
    catch (e) { return { error: `versionium_commit failed: ${e.message}` }; }
  },
};
