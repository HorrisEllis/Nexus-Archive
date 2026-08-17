'use strict';
/**
 * lib/agent-tools/tools/diagnostic/agent-model-confidence-loop.js
 * UUID: nexus-tool-agent-model-confidence-loop-v1-0000-2026-0815-jamesbrooks-001
 * §WIRED 2026-08-15 — wraps lib/agent-model-confidence-loop.js (AM6). See
 * that module's own header for the real 4-stage pipeline and its honest
 * scope limits (empirical stage needs a real COS compartment + a claim-
 * specific checkFn to do more than honestly report "unverifiable").
 */
const loop = require('../../../agent-model-confidence-loop.js');

module.exports = {
  name: 'agent_model_confidence_loop',
  description:
    'AM6: run a low-confidence claim through the real 4-stage loop — Perplexity research, adversarial ' +
    'epistemic compare (a real contradiction opens a real gap, never silently resolved), emergence.js ' +
    'empirical verification (needs a real COS compartment and ideally a claim-specific checkFn — the ' +
    'default honestly reports unverifiable rather than fabricating a pass), and only then crystal-tier ' +
    'push-recall. Returns exactly which stage it stopped at if it doesn\'t crystallize.',
  parameters: {
    type: 'object',
    properties: {
      claimText: { type: 'string', description: 'the claim to verify' },
      existingConfidence: { type: 'number', description: 'the claim\'s current confidence, 0-1' },
      compartmentId: { type: 'string', description: 'a real COS compartment name/id for the empirical stage — omit to stop honestly after the epistemic stage' },
    },
    required: ['claimText'],
  },
  async execute({ claimText, existingConfidence, compartmentId } = {}) {
    if (!claimText) return { error: 'claimText is required' };
    let compartment = null;
    if (compartmentId) {
      try {
        const { createHost } = require('../../../../cos/host/index.js');
        const host = createHost();
        compartment = host.getCompartment ? host.getCompartment(compartmentId) : { id: compartmentId };
      } catch (e) { return { error: `could not resolve compartment "${compartmentId}": ${e.message}` }; }
    }
    try { return await loop.run({ text: claimText, existingConfidence: existingConfidence || 0 }, { compartment }); }
    catch (e) { return { error: `agent_model_confidence_loop failed: ${e.message}` }; }
  },
};
