'use strict';
// copilot/intuition/handlers/systems.js — system map from the blueprint index
//
// §BUGFIX 2026-07-02: SYSTEMS_RE was referenced but never defined in the old
// monolithic intuition.js (same class of bug as AWARE_RE). Defined here.

const { _getBP } = require('../shared');

const SYSTEMS_RE = /^\/?(systems?)\s*$|^(list systems|what systems|show systems|which systems|systems online)\b/i;

async function handle(prompt, lower) {
  if (!SYSTEMS_RE.test(lower)) return null;
  const bi = _getBP();
  const idx = bi?.load();
  if (!idx) return null;
  const lines = idx.systems
    .filter(s => s.componentCount > 0)
    .map(s => `  ${s.label.padEnd(14)} :${s.port}  — ${s.componentCount} components`);
  return { text: `NEXUS systems (${idx.systemCount}):\n${lines.join('\n')}`,
    modelUsed: 'data-only', intent: 'systems', source: 'intuition.blueprint' };
}

module.exports = { handle };
