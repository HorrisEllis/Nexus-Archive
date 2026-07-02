'use strict';
// copilot/intuition/handlers/patterns.js — dominant event-type summary from stream

const PATTERN_RE = /^(patterns?|what patterns|dominant|frequent|what do you see)\b/i;

async function handle(prompt, lower, session, stream = []) {
  if (!PATTERN_RE.test(lower)) return null;
  const types = {};
  for (const e of stream) types[e.type] = (types[e.type] || 0) + 1;
  const top = Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (!top.length) return null;
  return { text: `Dominant patterns in stream:\n${top.map(([t,n])=>`  ${t}: ${n}×`).join('\n')}`,
    modelUsed: 'data-only', intent: 'patterns', source: 'intuition.patterns' };
}

module.exports = { handle };
