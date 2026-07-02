'use strict';
// copilot/intuition/handlers/sigma.js — CFR field sigma/regime from cortex

const { _fetch, CX_URL } = require('../shared');

const SIGMA_RE = /^(sigma|cfr|field state|what'?s sigma)\b/i;

async function handle(prompt, lower) {
  if (!SIGMA_RE.test(lower)) return null;
  try {
    const d = await _fetch(`${CX_URL}/cfr/health`);
    const sigma = d?.cfr?.sigma?.toFixed(3) ?? '?';
    const regime = d?.cfr?.regime ?? '?';
    return { text: `CFR field: sigma=${sigma} regime=${regime}`,
      modelUsed: 'data-only', intent: 'cfr', source: 'intuition.sigma' };
  } catch(_) { return null; }
}

module.exports = { handle };
