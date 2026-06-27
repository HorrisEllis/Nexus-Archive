'use strict';
// ── lib/semantic-gap-types.js ───────────────────────────────────────────────
// UUID: nexus-semantic-gap-types-v1-0000-2026-0627-jamesbrooks-001
// Version: 1.0.0
//
// Single source of truth for "which gap types are about LLM-output quality,
// not infrastructure, and therefore have no module path a forge patch could
// ever touch."
//
// Originated in cortex/self-heal/index.js as §FIX-24.3 (a local Set, not
// shared). Extracted here because the exact same gap types were causing the
// exact same structural problem in a second place — service/nexus-diagnostic.js's
// _escalateHighSeverityGaps() dispatches gaps to guardian's /diagnose_and_repair
// route, which only ever produces a text analysis, never a real artifact
// (§23.10, documented in that file). gap-loop's closure verifier correctly
// never marks a textual analysis as resolved, so the same semantic gap gets
// redispatched every sweep, forever — confirmed live in a real boot log,
// 2026-06-27, hundreds of repeating job-creation lines for exactly these types.
//
// §5.6 (Fractal Law) — one classification, every caller. §10.3 — this
// replaces two independently-maintained copies of the same list, not adds
// a third place that could drift from the other two.

const SEMANTIC_GAP_TYPES = new Set([
  'obligation', 'assumption', 'logical', 'contradiction', 'evidential',
  'temporal', 'definitional', 'reference', 'communication', 'hierarchy',
]);

function isSemanticGap(gap) {
  return SEMANTIC_GAP_TYPES.has(gap?.type);
}

module.exports = { SEMANTIC_GAP_TYPES, isSemanticGap, MODULE_ID: 'semantic-gap-types', VERSION: '1.0.0' };
