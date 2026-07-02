'use strict';
// copilot/intuition/handlers/cli.js — CLI command list from the blueprint index
//
// §BUGFIX 2026-07-02: CLI_RE was referenced but never defined in the old
// monolithic intuition.js (same class of bug as AWARE_RE). Defined here.

const { _getBP } = require('../shared');

const CLI_RE = /^\/?(commands?|cli)\s*$|^(list commands|what commands|show commands|cli commands)\b/i;

async function handle(prompt, lower) {
  if (!CLI_RE.test(lower)) return null;
  const bi  = _getBP();
  const idx = bi?.load();
  if (!idx) return null;
  const lines = idx.allCLI.slice(0, 20)
    .map(c => `  ${c.command.padEnd(20)} ${c.method.padEnd(6)} ${c.path.slice(0,40).padEnd(40)} ${c.systemId}`);
  return { text: `CLI commands (${idx.allCLI.length} total, top 20):\n${lines.join('\n')}`,
    modelUsed: 'data-only', intent: 'cli', source: 'intuition.blueprint' };
}

module.exports = { handle };
