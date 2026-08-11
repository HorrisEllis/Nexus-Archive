'use strict';
/**
 * lib/gap-field.js — the single agnostic gap-reporting entry point (§P3 fix)
 * UUID: nexus-gap-field-v1-0000-2026-0809-001
 *
 * James: "gap-finder and diagnostic-causal both do gap-detection, live,
 * unreconciled. Merge gap-finder's sigma source INTO diagnostic-causal, keep
 * one output. Needs to stay agnostic. Gap field. This is also for modeling
 * me. Reducing ambiguity."
 *
 * ── WHAT WAS ACTUALLY FOUND, checking before building (same discipline
 * kernel-surface.js's header insists on) ──────────────────────────────────
 * P3 of nexus-live-mind-phasemap.spec (marked DONE 2026-08-07) built
 * lib/diagnostic-causal.js — but diagnoseDeep(findings) takes findings as a
 * PARAMETER; its one live caller (copilot/lib/nexus-awareness.js) defaults
 * to `opts.findings || []`. It was never wired to read real gaps at all.
 * Meanwhile THREE independent things write to the 'gaps' table, none aware
 * of each other:
 *   cortex/gap-finder     — system anomaly.detected + sigma.event.* → gap.
 *                           Deduped (dedup_key, occurrence bump), causal
 *                           wire (causedBy) already correct. Good logic —
 *                           kept, just extracted here instead of duplicated.
 *   user-model.checkContradictions — conflicting high-confidence hypotheses
 *                           about James → gap. This is "modeling me" — and
 *                           it had NO dedup check at all: every call that
 *                           found the same contradiction would insert a
 *                           fresh row. Real bug, found while unifying, fixed
 *                           for free by routing through the same path.
 *   diagnostic-causal      — explains a gap's causal conditions (RFR2), but
 *                           was never handed either of the above's output.
 *
 * ── THE AGNOSTIC PART ──────────────────────────────────────────────────────
 * report()'s shape doesn't know or care whether a gap came from system
 * telemetry or from the user model — `domain` is just a tag on an otherwise
 * identical record, same dedup/occurrence/causal-wire treatment either way.
 * That's the literal ask: system gaps and "gaps in understanding James" are
 * the same kind of object — unresolved ambiguity, worth tracing to its
 * conditions the same way regardless of what produced it.
 */

const { jaaDB, uid } = require('../cortex/memory/jaa-db');

const MODULE_ID = 'gap-field';
const VERSION = '1.0.0';
const TABLE = 'gaps';

function _fanin() { try { return require('./ledger-fanin'); } catch (_) { return null; } }

function _dedupKey(type, source, domain) {
  return `${domain || 'system'}::${type}::${source || 'unknown'}`;
}

function _existingOpen(dedupKey) {
  const rows = jaaDB.query(TABLE, r => r.dedup_key === dedupKey && r.status === 'open', 1);
  return rows[0] || null;
}

/**
 * report({ type, body, source, domain, severity, meta }) — the one entry
 * point for any producer. domain is agnostic: 'system' (default) | 'user-model'
 * | any future domain — nothing here branches on it, it's a tag for querying.
 * meta.causedBy / meta.anomalyUuid / meta.sigmaUuid become the causal parent
 * (ported logic from gap-finder, §16.5 — not re-derived).
 */
function report({ type, body, source, domain = 'system', severity = 'medium', meta = {} } = {}) {
  if (!type) return { created: false, gap: null, reason: 'type required' };
  const dedup_key = _dedupKey(type, source, domain);
  const existing = _existingOpen(dedup_key);
  if (existing) {
    const bumped = { ...existing, occurrences: (existing.occurrences || 1) + 1, lastSeenAt: Date.now() };
    try { jaaDB.update(TABLE, { id: existing.id }, { occurrences: bumped.occurrences, lastSeenAt: bumped.lastSeenAt }); }
    catch (e) { console.warn(`[${MODULE_ID}] occurrence bump failed: ${e.message}`); }
    // Return the bumped view, not the stale pre-update snapshot — the DB
    // write was always correct (verified), only this function's return
    // value lagged it, found while writing this file's own test suite.
    return { created: false, gap: bumped };
  }

  const causedBy = meta.causedBy || meta.anomalyUuid || meta.sigmaUuid || null;
  const gap = {
    uuid: uid(), type, domain, body, source, severity, status: 'open',
    causedBy, dedup_key, occurrences: 1, detectedAt: Date.now(), lastSeenAt: Date.now(),
    meta,
  };
  let stored;
  try { stored = jaaDB.insert(TABLE, gap); }
  catch (e) { console.warn(`[${MODULE_ID}] gap write failed: ${e.message}`); return { created: false, gap: null }; }

  if (_fanin()) { try { _fanin().emit({ type: 'gap-field.found', domain: gap.domain, gapType: gap.type, severity: gap.severity, source: gap.source, uuid: gap.uuid, ts: Date.now() }); } catch (_) {} }
  return { created: true, gap: stored || gap };
}

/** openGaps(opts) — every open gap, optionally filtered by domain. Most
 * recently seen first — a diagnostic surfacing 100 gaps should show what's
 * CURRENT, not an arbitrary slice of whatever the store returns first. */
function openGaps(opts = {}) {
  const rows = jaaDB.query(TABLE, r => {
    if (r.status !== 'open') return false;
    if (!opts.domain) return true;
    // §found 2026-08-09 — pre-gap-field rows (autopilot's kernel_circuit_open,
    // 99 of them found live in this store; also CONSTITUTIONAL/intent.low_confidence)
    // have no domain field at all — treating that as invisible to a domain-
    // scoped query would silently lose real historical data, not just old test
    // rows. Untagged is 'system' by construction: every writer that predates
    // this file wrote system-level findings; nothing untagged is user-model.
    return (r.domain || 'system') === opts.domain;
  }, 10000) || [];
  return rows.sort((a, b) => (b.lastSeenAt || b.detectedAt || 0) - (a.lastSeenAt || a.detectedAt || 0)).slice(0, opts.limit || 100);
}

/**
 * asFindings(opts) — open gaps reshaped into the {type, system, severity,
 * uuid} finding shape lib/diagnostic-causal.explainFinding/diagnoseDeep
 * already expects — the actual wire that closes the loop (see that file's
 * default-findings fix, same commit).
 */
function asFindings(opts = {}) {
  return openGaps(opts).map(g => ({ type: g.type, system: g.source, severity: g.severity, uuid: g.uuid, domain: g.domain, entry: g }));
}

module.exports = { report, openGaps, asFindings, MODULE_ID, VERSION, TABLE };
