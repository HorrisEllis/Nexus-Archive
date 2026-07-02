'use strict';
// copilot/intuition/handlers/seam.js — SEAM hooks from the blueprint index
//
// §BUGFIX 2026-07-02: SEAM_RE was referenced but never defined in the old
// monolithic intuition.js (same class of bug as AWARE_RE). Defined here.

const { _getBP } = require('../shared');

const SEAM_RE = /^\/?(seams?|hooks?)\s*$|^(seam hooks|list hooks|show hooks|what hooks)\b/i;

async function handle(prompt, lower) {
  if (!SEAM_RE.test(lower)) return null;
  const bi  = _getBP();
  const idx = bi?.load();
  if (!idx) return null;
  const lines = idx.allSEAM.slice(0, 15)
    .map(h => `  ${h.componentId}  in:[${(h.in||[]).map(i=>i.id).join(',')}]  out:[${(h.out||[]).map(o=>o.wires_to?.join(',')??'').join(',')}]`);
  return { text: `SEAM hooks (${idx.allSEAM.length}):\n${lines.join('\n')}`,
    modelUsed: 'data-only', intent: 'seam', source: 'intuition.blueprint' };
}

module.exports = { handle };
