'use strict';
// copilot/intuition/handlers/gaps.js — open gap count from cortex

const { _fetch, CX_URL } = require('../shared');

const GAPS_RE = /^\/?(gaps?)\s*$|^(any gaps|open gaps|how many gaps|gap count)\b/i;

async function handle(prompt, lower) {
  if (!GAPS_RE.test(lower)) return null;
  try {
    const d = await _fetch(`${CX_URL}/api/gaps?status=open&limit=1`);
    const total = d?.total ?? (d?.gaps?.length ?? '?');
    return { text: `${total} open gap(s).`,
      modelUsed: 'data-only', intent: 'tool', source: 'intuition.gaps' };
  } catch(_) { return null; }
}

module.exports = { handle };
