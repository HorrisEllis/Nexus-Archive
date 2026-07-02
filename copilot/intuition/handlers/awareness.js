'use strict';
// copilot/intuition/handlers/awareness.js — "who are you / what can you see"
//
// §BUGFIX 2026-07-02: this handler referenced AWARE_RE, but AWARE_RE was
// never defined anywhere in the old monolithic intuition.js — it crashed
// every server instance the first time a prompt reached this branch
// (ReferenceError: AWARE_RE is not defined, copilot/intuition.js:130).
// Defined properly here as part of the handler split.

const { _getBP } = require('../shared');

const AWARE_RE = /^(who are you|what are you|introduce yourself|are you (self-)?aware|what can you see|what are you aware of)\b/i;

async function contextSummary() {
  const bi = _getBP();
  if (!bi) return 'Blueprint index not built. Run: POST /api/blueprint/index on orchestrator.';
  const idx = bi.load();
  if (!idx) return 'Blueprint index empty — no systems registered yet.';
  const sys = idx.systems.filter(s => s.componentCount > 0);
  return [
    `I can see ${idx.totalComponents} components across ${sys.length} active systems:`,
    ...sys.map(s => `  ${s.label.padEnd(14)} :${s.port}  — ${s.componentCount} components`),
    ``,
    `${idx.allCLI.length} CLI commands  ·  ${idx.allSEAM.length} SEAM hooks  ·  ${idx.allCopilot.length} co-pilot entry points`,
    `Index built: ${new Date(idx.builtAt).toISOString().slice(0,19)}`,
    ``,
    `Ask me: systems / components / commands / hooks / cfr / status / patterns / gaps`,
  ].join('\n');
}

async function handle(prompt, lower) {
  if (!AWARE_RE.test(lower)) return null;
  const summary = await contextSummary();
  return { text: summary, modelUsed: 'data-only', intent: 'awareness', source: 'intuition.awareness' };
}

module.exports = { handle, contextSummary };
