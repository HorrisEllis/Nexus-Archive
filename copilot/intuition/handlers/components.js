'use strict';
// copilot/intuition/handlers/components.js — per-system or all-system component list
//
// §BUGFIX 2026-07-02: COMP_RE was referenced but never defined in the old
// monolithic intuition.js (same class of bug as AWARE_RE). Defined here.

const { _getBP } = require('../shared');

const COMP_RE = /^\/?(components?)\s*$|^(list components|what components|show components|which components)\b/i;

async function handle(prompt, lower) {
  if (!COMP_RE.test(lower)) return null;
  const bi = _getBP();
  const idx = bi?.load();
  if (!idx) return null;
  // Check if a system name is in the prompt
  const sysHit = idx.systems.find(s =>
    lower.includes(s.systemId) || lower.includes(s.label.toLowerCase()));
  const source = sysHit ? [sysHit] : idx.systems.filter(s => s.componentCount > 0);
  const lines  = source.flatMap(s =>
    s.components.slice(0, 5).map(c => `  ${c.id} — ${(c.description||'').slice(0,60)}`)
  ).slice(0, 20);
  const title = sysHit ? `${sysHit.label} components:` : `Components (top 20 of ${idx.totalComponents}):`;
  return { text: `${title}\n${lines.join('\n')}`,
    modelUsed: 'data-only', intent: 'components', source: 'intuition.blueprint' };
}

module.exports = { handle };
