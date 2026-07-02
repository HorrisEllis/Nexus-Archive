'use strict';
// copilot/intuition/handlers/route.js — direct single-token lookup, e.g.
// "/gaps" or "job.dispatch", against the grammar/CLI index.
//
// §BUGFIX 2026-07-02: ROUTE_RE was referenced but never defined in the old
// monolithic intuition.js (same class of bug as AWARE_RE). Defined here.
// Matches one bare token — an optional leading slash followed by a
// word/dotted-identifier — so it only fires as the last-resort handler.

const { _getBP } = require('../shared');

const ROUTE_RE = /^\/?([a-z][a-z0-9_.\-]{1,40})\s*$/i;

async function handle(prompt) {
  const routeMatch = ROUTE_RE.exec(prompt.trim());
  if (!routeMatch) return null;
  const word = routeMatch[1].toLowerCase();
  const bi   = _getBP();
  // Try grammar index first (fastest)
  const gramHits = bi?.lookupGrammar(word) || [];
  if (gramHits.length) {
    const h = gramHits[0];
    const cli = bi?.lookupCLI(h.componentId.split('.').pop()) || null;
    const detail = cli
      ? `${cli.method} ${cli.path} (${cli.systemId}) — ${cli.description}`
      : h.description;
    return { text: `${h.componentId}: ${detail}`,
      modelUsed: 'data-only', intent: 'lookup', source: 'intuition.grammar' };
  }
  // Try direct CLI lookup
  const cliHit = bi?.lookupCLI(word);
  if (cliHit) {
    return {
      text: `${cliHit.command}: ${cliHit.method} ${cliHit.path} (${cliHit.systemId})\n${cliHit.description}\nUsage: ${cliHit.usage}`,
      modelUsed: 'data-only', intent: 'lookup', source: 'intuition.cli'
    };
  }
  return null;
}

module.exports = { handle };
