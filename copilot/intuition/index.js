'use strict';
/**
 * copilot/intuition/index.js
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
 *
 * §REFACTOR 2026-07-02: was a single 235-line file with a 13-branch
 * if-chain. Six of those branches referenced regex constants
 * (AWARE_RE, SYSTEMS_RE, COMP_RE, CLI_RE, SEAM_RE, ROUTE_RE) that were
 * never defined — the first user prompt to reach AWARE_RE crashed the
 * whole copilot process (ReferenceError, restart-looped in production
 * logs 2026-07-02T03:04). Split into one handler module per intent so
 * each one is independently testable and a missing symbol fails to
 * `require()` immediately instead of crashing mid-request.
 */

const greeting   = require('./handlers/greeting');
const stream     = require('./handlers/stream');
const patterns   = require('./handlers/patterns');
const crystals   = require('./handlers/crystals');
const gaps       = require('./handlers/gaps');
const sigma      = require('./handlers/sigma');
const status     = require('./handlers/status');
const awareness  = require('./handlers/awareness');
const systems    = require('./handlers/systems');
const components = require('./handlers/components');
const cli        = require('./handlers/cli');
const seam       = require('./handlers/seam');
const route      = require('./handlers/route');

// Order matters: earlier handlers get first refusal. This mirrors the
// original if-chain order exactly so behavior is unchanged.
const HANDLERS = [
  greeting, stream, patterns, crystals, gaps, sigma, status,
  awareness, systems, components, cli, seam, route,
];

/**
 * Attempt to answer from patterns, crystals, stream, user model.
 * Returns { text, modelUsed, intent, source } or null if can't answer confidently.
 *
 * @param {string}   prompt  — user's input
 * @param {object}   session — current session context
 * @param {object[]} stream  — recent events from consciousness stream
 */
async function answer(prompt, session, streamEvents = []) {
  const lower = prompt.toLowerCase().trim();
  for (const h of HANDLERS) {
    const result = await h.handle(prompt, lower, session, streamEvents);
    if (result) return result;
  }
  return null; // → ANALYSIS
}

module.exports = { answer, contextSummary: awareness.contextSummary };
