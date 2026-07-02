'use strict';
// copilot/intuition/handlers/crystals.js — crystallised patterns from cortex

const { _fetch, CX_URL } = require('../shared');

async function handle(prompt, lower) {
  if (!(lower.includes('crystal') || lower.includes('learned') || lower.includes('what do you know'))) return null;
  try {
    const d = await _fetch(`${CX_URL}/api/intelligence/patterns?limit=5`);
    const patterns = d?.patterns || [];
    if (!patterns.length) return null;
    return { text: `Crystallised patterns:\n${patterns.slice(0,5).map(p=>`  ${p.precursor} → ${p.outcome} (${p.count}×, ${Math.round((p.confidence||0)*100)}%)`).join('\n')}`,
      modelUsed: 'data-only', intent: 'patterns', source: 'intuition.crystals' };
  } catch(_) { return null; }
}

module.exports = { handle };
