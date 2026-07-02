'use strict';
// copilot/intuition/handlers/status.js — stream health + orchestrator online count

const { _fetch } = require('../shared');

const STATUS_RE = /^\/(status|health)$|^(status|health|is everything ok|how's the system)\b/i;

async function handle(prompt, lower, session, stream = []) {
  if (!STATUS_RE.test(lower)) return null;
  const errors = stream.slice(-20).filter(e => e.type?.includes('error') || e.type?.includes('fail')).length;
  const label = errors > 3 ? `${errors} errors in last 20 stream events` : 'stream nominal';
  try {
    const h = await _fetch(`http://127.0.0.1:9000/health`);
    const online = h?.online ?? '?';
    const total  = h?.total  ?? '?';
    return { text: `${online}/${total} systems online. ${label}.`,
      modelUsed: 'data-only', intent: 'status', source: 'intuition.status' };
  } catch(_) {
    return { text: `Stream: ${label}. Orchestrator unreachable.`,
      modelUsed: 'data-only', intent: 'status', source: 'intuition.status' };
  }
}

module.exports = { handle };
