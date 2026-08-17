'use strict';
/**
 * lib/agent-tools/tools/diagnostic/gap-rating.js — gap_rating tool
 * UUID: nexus-tool-gap-rating-v1-0000-2026-0815-jamesbrooks-001
 * §WIRED 2026-08-15 — wraps lib/gap-rating.js. See that module's own
 * header for the full real-vs-invented accounting.
 */
const gr = require('../../../gap-rating.js');

module.exports = {
  name: 'gap_rating',
  description:
    'Rate a real gap: signal-to-noise with a fidelity read, tension/friction (entropy regime — honestly ' +
    'null if there\'s not enough real history to say), pressure (reused from the gap\'s own captured ' +
    'resourceState, not re-derived), an objective causal chain, and this gap\'s real contribution to ' +
    'overall system homeostasis. Needs a real gap object (from cortex\'s gaps table), not just an id.',
  parameters: {
    type: 'object',
    properties: { gap: { type: 'object', description: 'a real gap record, e.g. from querying the gaps table' } },
    required: ['gap'],
  },
  async execute({ gap } = {}) {
    if (!gap) return { error: 'gap is required — a real gap object, not an id' };
    try { return gr.rate(gap); }
    catch (e) { return { error: `gap_rating failed: ${e.message}` }; }
  },
};
