'use strict';
/**
 * copilot/intuition.js
 * comp_id: nexus.copilot.intuition
 * uuid: nexus-copilot-intuition-v1-0000-2026-0627-jamesbrooks-001
 * spec: docs/contract-queue.spec
 *
 * INTUITION — fast, associative, pattern-based cognition.
 * Reads: pattern engine, crystal lattice, user model, stream buffer.
 * Speed: <50ms. No model call. Falls through if no confident answer.
 *
 * This is the first faculty. If it returns null, ANALYSIS takes over.
 * Answers from what the system already knows.
 */

const http = require('http');
const CX_URL = process.env.CORTEX_URL || 'http://127.0.0.1:3748';

async function _fetch(url) {
  return new Promise((res, rej) => {
    http.get(url, { timeout: 2000 }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(_) { res(null); } });
    }).on('error', () => res(null)).on('timeout', () => res(null));
  });
}

// Greeting fast-path
const GREETING_RE = /^(hi|hello|hey|sup|yo|what's up|good (morning|evening|afternoon))\b/i;
const CONVERSATIONAL_RE = /^(how are you|you there|you online|you awake)\b/i;

// Status queries
const STATUS_RE = /^\/(status|health)$|^(status|health|is everything ok|how's the system)\b/i;
const STREAM_RE = /^(stream|what'?s happening|recent events|show me the stream|what'?s going on)\b/i;
const PATTERN_RE = /^(patterns?|what patterns|dominant|frequent|what do you see)\b/i;
const GAPS_RE = /^\/?(gaps?)\s*$|^(any gaps|open gaps|how many gaps|gap count)\b/i;
const SIGMA_RE = /^(sigma|cfr|field state|what'?s sigma)\b/i;

/**
 * Attempt to answer from patterns, crystals, stream, user model.
 * Returns { text, modelUsed, intent, source } or null if can't answer confidently.
 *
 * @param {string}   prompt  — user's input
 * @param {object}   session — current session context
 * @param {object[]} stream  — recent events from consciousness stream
 */
async function answer(prompt, session, stream = []) {
  const lower = prompt.toLowerCase().trim();

  // ── Greeting ────────────────────────────────────────────────────────────────
  if (GREETING_RE.test(lower) || CONVERSATIONAL_RE.test(lower)) {
    const greets = [
      'Online. What do you need?',
      'Here. What are you working on?',
      'Co-pilot active. Go.',
      'Ready.',
    ];
    return { text: greets[Math.floor(Math.random() * greets.length)],
      modelUsed: 'data-only', intent: 'greeting', source: 'intuition.greeting' };
  }

  // ── Stream state ────────────────────────────────────────────────────────────
  if (STREAM_RE.test(lower)) {
    if (!stream.length) return { text: 'Stream empty — no events yet.',
      modelUsed: 'data-only', intent: 'stream', source: 'intuition.stream' };
    const recent = stream.slice(-8).map(e => `  ${e.type || '?'}`).join('\n');
    return { text: `Last ${Math.min(stream.length, 8)} events:\n${recent}`,
      modelUsed: 'data-only', intent: 'stream', source: 'intuition.stream' };
  }

  // ── Pattern summary from stream ─────────────────────────────────────────────
  if (PATTERN_RE.test(lower)) {
    const types = {};
    for (const e of stream) types[e.type] = (types[e.type] || 0) + 1;
    const top = Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,5);
    if (!top.length) return null;
    return { text: `Dominant patterns in stream:\n${top.map(([t,n])=>`  ${t}: ${n}×`).join('\n')}`,
      modelUsed: 'data-only', intent: 'patterns', source: 'intuition.patterns' };
  }

  // ── Crystal patterns from cortex ────────────────────────────────────────────
  if (lower.includes('crystal') || lower.includes('learned') || lower.includes('what do you know')) {
    try {
      const d = await _fetch(`${CX_URL}/api/intelligence/patterns?limit=5`);
      const patterns = d?.patterns || [];
      if (!patterns.length) return null;
      return { text: `Crystallised patterns:\n${patterns.slice(0,5).map(p=>`  ${p.precursor} → ${p.outcome} (${p.count}×, ${Math.round((p.confidence||0)*100)}%)`).join('\n')}`,
        modelUsed: 'data-only', intent: 'patterns', source: 'intuition.crystals' };
    } catch(_) {}
  }

  // ── Gap count ───────────────────────────────────────────────────────────────
  if (GAPS_RE.test(lower)) {
    try {
      const d = await _fetch(`${CX_URL}/api/gaps?status=open&limit=1`);
      const total = d?.total ?? (d?.gaps?.length ?? '?');
      return { text: `${total} open gap(s).`,
        modelUsed: 'data-only', intent: 'tool', source: 'intuition.gaps' };
    } catch(_) {}
  }

  // ── Sigma / CFR field ───────────────────────────────────────────────────────
  if (SIGMA_RE.test(lower)) {
    try {
      const d = await _fetch(`${CX_URL}/cfr/health`);
      const sigma = d?.cfr?.sigma?.toFixed(3) ?? '?';
      const regime = d?.cfr?.regime ?? '?';
      return { text: `CFR field: sigma=${sigma} regime=${regime}`,
        modelUsed: 'data-only', intent: 'cfr', source: 'intuition.sigma' };
    } catch(_) {}
  }

  // ── Status from stream + cortex ─────────────────────────────────────────────
  if (STATUS_RE.test(lower)) {
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

  return null; // → ANALYSIS
}

module.exports = { answer };
