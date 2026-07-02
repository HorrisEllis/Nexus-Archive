'use strict';
// copilot/intuition/handlers/stream.js — recent consciousness-stream events

const STREAM_RE = /^(stream|what'?s happening|recent events|show me the stream|what'?s going on)\b/i;

async function handle(prompt, lower, session, stream = []) {
  if (!STREAM_RE.test(lower)) return null;
  if (!stream.length) return { text: 'Stream empty — no events yet.',
    modelUsed: 'data-only', intent: 'stream', source: 'intuition.stream' };
  const recent = stream.slice(-8).map(e => `  ${e.type || '?'}`).join('\n');
  return { text: `Last ${Math.min(stream.length, 8)} events:\n${recent}`,
    modelUsed: 'data-only', intent: 'stream', source: 'intuition.stream' };
}

module.exports = { handle };
