'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// intelligence/patterns.js — crystallised patterns + root-cause rollup
// UUID: nexus-intelligence-patterns-v1-0000-2026-0822-001
// Version: 1.0.0
// Component: intelligence.patterns
// Hook: intelligence.patterns:v1:p0001
//
// §MIGRATION 2026-08-22 — extracted from cortex/boot.js (_buildPatterns:215,
// _buildRCA:245). These were the only two intelligence routes in boot.js whose
// LOGIC lived there rather than in intelligence/. Every other route was already
// a call into intelligence or a proxy; these two were the real migration work,
// and they had to move before any route could be re-pointed (§3.1 bottom-up —
// moving the route first would have produced a 404 against a function that does
// not exist here yet).
//
// ── DEPENDENCY INJECTION, NOT REACHING ──────────────────────────────────────
//
// Both functions read boot.js-local state: jaaDB, and _buildRCA reaches
// _field.entropy — cortex's live CFR field. A module in intelligence/ cannot
// reach into cortex's closure, and it must not require cortex to get at it:
// that would make intelligence depend on cortex, inverting the direction every
// other faculty runs in.
//
// So they are injected, exactly as cortex/boot.js:132 already does for
// intuition and mastermind:
//     createIntuition({ jaaDB, getField: () => _field, getTaxonomy })
// This follows that established shape rather than inventing a second one
// (§8.5 — use the component architecture that exists).
//
// §1.2 — getField is OPTIONAL. When absent, sigma is reported as null and the
// row says so, rather than defaulting to 0. A sigma of 0 means "measured, no
// deviation"; null means "not measured". A rollup that silently reports 0 for
// an unavailable field is the unknown-vs-zero error this codebase keeps
// re-learning.
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_ID = 'intelligence/patterns';
const VERSION   = '1.0.0';
const COMP_ID   = 'intelligence.patterns';
const HOOK_ID   = 'intelligence.patterns:v1:p0001';

/**
 * createPatterns({ jaaDB, getField }) — the factory.
 *
 * @param jaaDB     required — the store. Refused if absent (§1.1).
 * @param getField  optional — () => the live CFR field. Absent means sigma:null.
 */
function createPatterns({ jaaDB, getField = null } = {}) {
  if (!jaaDB) {
    throw new Error(`[${MODULE_ID}] §1.1 createPatterns requires jaaDB — a pattern reader with no store cannot report an honest empty, only a fabricated one`);
  }

  /**
   * buildPatterns(limit) — crystallised patterns, newest-value first.
   *
   * The comment carried over from boot.js records why this reads `crystals`
   * rather than tallying event_log, and it is preserved because it is the
   * reason the function has the shape it has:
   *
   *   copilot/intuition.js has called this endpoint expecting
   *   {precursor, outcome, count, confidence} since it was written — but the
   *   original implementation tallied event_log types and returned
   *   {type, count, lastSeen}. Every field intuition.js read (p.precursor,
   *   p.outcome, p.confidence) was undefined against that shape, so
   *   "Crystallised patterns" rendered as "undefined → undefined (NaN%)"
   *   whenever the path fired. crystal-lattice writes real (domain, verb,
   *   outcome) crystals to the 'crystals' table; this reads that instead of
   *   re-deriving a shallower stand-in.
   */
  function buildPatterns(limit = 5) {
    let crystals;
    try { crystals = jaaDB.tail('crystals', 50); }
    catch (e) {
      // §1.2 — unreadable is NOT empty. The original returned [] on any
      // failure, which a caller could not tell from "no patterns yet".
      return { ok: false, patterns: [], error: e.message,
        note: 'crystals table unreadable — this is NOT the same as no patterns having crystallised' };
    }
    if (!crystals || !crystals.length) {
      return { ok: true, patterns: [], empty: true,
        note: 'no crystals yet — honest empty, not a fabricated fallback' };
    }
    const patterns = crystals
      .slice()
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, limit)
      .map(c => ({
        precursor:  `${c.entry_conditions?.domain || '?'}:${c.entry_conditions?.verb || '?'}`,
        outcome:    c.exit_conditions?.outcome || 'unknown',
        count:      c.usage_count || c.pattern_frequency_at_creation || 0,
        confidence: c.success_probability ?? 0,
        kind:       c.kind,
        ts:         c.ts,
      }));
    return { ok: true, patterns, empty: false, total: crystals.length };
  }

  /**
   * buildRCA(limit) — open gaps with their root cause and the field sigma.
   *
   * sigma comes from the injected field. When no field is available it is null
   * and `sigmaAvailable:false` says why — see the header note on 0 vs null.
   */
  function buildRCA(limit = 5) {
    let gaps;
    try { gaps = jaaDB.query('gaps', { status: 'open' }, { orderBy: 'ts', order: 'DESC', limit }); }
    catch (e) {
      return { ok: false, rca: [], error: e.message,
        note: 'gaps table unreadable — NOT the same as no open gaps' };
    }

    let sigma = null, sigmaAvailable = false;
    if (typeof getField === 'function') {
      try {
        const f = getField();
        if (f && typeof f.entropy === 'number') { sigma = f.entropy; sigmaAvailable = true; }
      } catch (_) { /* stays null — §1.2, a failed read is not a zero reading */ }
    }

    return {
      ok: true, sigmaAvailable,
      rca: (gaps || []).map(g => ({
        gapId: g.id, type: g.type || 'unknown',
        cause: g.root_cause || 'unresolved', since: g.ts, sigma,
      })),
      note: sigmaAvailable ? null
        : 'no CFR field injected — sigma is null, meaning NOT MEASURED. It is not 0, which would mean measured-and-stable.',
    };
  }

  return { buildPatterns, buildRCA, MODULE_ID, VERSION, COMP_ID, HOOK_ID };
}

module.exports = { createPatterns, MODULE_ID, VERSION, COMP_ID, HOOK_ID };
