'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// intelligence/gap-tension.js — how hard is the system straining against a gap?
// UUID: nexus-gap-tension-v1-0000-2026-0822-001
// Version: 1.0.0
// Component: intelligence.gap-tension
// Hook: intelligence.gap-tension:v1:p0001
//
// James: "what if we use deltas to measure the tension of each gap?"
//
// ── WHY THIS IS THE RIGHT QUESTION ──────────────────────────────────────────
//
// §16.1 says the next bottleneck determines the next task. That requires an
// ORDERING over gaps. Today the only ordering available is `severity`, which is
// a label somebody typed once and nothing has revisited since.
//
// The live store proves the problem outright: a gap carrying
//
//     occurrences: 45   severity: "low"
//
// Forty-five recurrences is not low. Something has been pushing against that
// gap continuously and the label never moved, because a label cannot notice.
// A delta can. Tension is measured, so it updates itself.
//
// ── §17.11 — NO SINGLE BUNDLED NUMBER ───────────────────────────────────────
//
// "Non-comparable axes are never bundled into one aggregate multiplier." That
// law was written about performance claims and it applies exactly here: rate
// (per day), acceleration (ratio), and recency (hours) do not share units, and
// multiplying them into one "tension: 0.83" would produce a number nobody can
// argue with because nobody can decompose it.
//
// So every reading reports its components separately AND names the method that
// produced each. A rank is offered for convenience, and it always ships next to
// the parts it came from — never instead of them.
//
// §0.1 — this measures; it does not reprioritise anything on its own.
// §1.2 — a gap with too little history to measure is UNMEASURABLE, never 0.
//        Zero tension and unknown tension mean opposite things: one says "stop
//        worrying about this", the other says "you cannot see this yet".
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_ID = 'gap-tension';
const VERSION   = '1.0.0';
const COMP_ID   = 'intelligence.gap-tension';
const HOOK_ID   = 'intelligence.gap-tension:v1:p0001';

const HOUR = 3600000;
const DAY  = 86400000;

// A gap seen once, ever, has no rate to speak of. Stated so a reader can argue.
const MIN_OCCURRENCES = +(process.env.GAP_TENSION_MIN_OCC || 2);
// Beyond this with no recurrence, a gap is dormant rather than resolved.
const DORMANT_HOURS   = +(process.env.GAP_TENSION_DORMANT_H || 72);

/**
 * measure(gap, now) — the strain around one gap, decomposed.
 *
 * RATE          occurrences per day since first detection. How hard it pushes.
 * ACCELERATION  recent rate ÷ lifetime rate. >1 means getting worse. This is
 *               the delta, and it is the part severity can never express.
 * RECENCY       hours since last seen. Separates live strain from dormant.
 */
function measure(gap, now = Date.now()) {
  if (!gap || typeof gap !== 'object') {
    return { ok: false, error: 'no gap given', tension: null };
  }
  const occ   = Number(gap.occurrences || 0);
  const first = Number(gap.detectedAt || 0);
  const last  = Number(gap.lastSeenAt || gap.detectedAt || 0);

  if (!first || occ < MIN_OCCURRENCES) {
    // §1.2 — UNMEASURABLE is not zero. A gap seen once may be the worst one in
    // the tree; it simply has no history yet, and saying "0" would hide it.
    return {
      ok: true, id: gap.uuid || gap.id || null, type: gap.type || null,
      measurable: false, tension: null,
      reason: !first ? 'no detectedAt — cannot compute a rate without a start'
                     : `only ${occ} occurrence(s); need ${MIN_OCCURRENCES} to have a rate at all`,
      note: 'UNMEASURABLE, not zero — unknown strain and no strain are opposite findings',
      declaredSeverity: gap.severity || null,
    };
  }

  const ageMs = Math.max(HOUR, now - first);
  const ageDays = ageMs / DAY;

  // RATE — occurrences per day across the whole life of the gap.
  const rate = occ / ageDays;

  // ACCELERATION — the delta. Compares the most recent stretch against the
  // lifetime. Uses only fields the store actually has (detectedAt, lastSeenAt,
  // occurrences); it does not invent a per-occurrence timeline that was never
  // recorded (§1.1 — the data does not exist, so it is not modelled).
  const activeMs   = Math.max(HOUR, last - first);
  const activeRate = occ / (activeMs / DAY);
  const acceleration = rate > 0 ? activeRate / rate : null;

  const idleHours = (now - last) / HOUR;

  return {
    ok: true, id: gap.uuid || gap.id || null, type: gap.type || null,
    measurable: true,
    components: {
      rate:         { value: +rate.toFixed(3),  unit: 'occurrences/day',
                      method: `${occ} occurrences ÷ ${ageDays.toFixed(2)} days since detectedAt` },
      acceleration: { value: acceleration == null ? null : +acceleration.toFixed(3), unit: 'ratio',
                      method: 'rate over the active window ÷ rate over full age; >1 = worsening' },
      recency:      { value: +idleHours.toFixed(1), unit: 'hours since lastSeenAt',
                      method: 'now − lastSeenAt' },
    },
    state: idleHours > DORMANT_HOURS ? 'dormant'
         : acceleration != null && acceleration > 1.2 ? 'worsening'
         : rate >= 1 ? 'sustained' : 'low',
    occurrences: occ,
    declaredSeverity: gap.severity || null,
    // The finding that makes this worth building: where the label and the
    // measurement disagree, the label is the thing that never updated.
    severityMismatch: _mismatch(gap.severity, rate, occ),
    // §17.11 — offered for ordering, never as a substitute for the components.
    rank: +(_rank(rate, acceleration, idleHours)).toFixed(3),
    rankCaveat: 'ordering aid only — the three components have different units and are NOT bundled into this. Read them, not this.',
  };
}

function _mismatch(severity, rate, occ) {
  const s = String(severity || '').toLowerCase();
  if (!s) return null;
  if ((s === 'low' || s === 'info') && occ >= 10) {
    return `declared "${s}" but recurred ${occ}× at ${rate.toFixed(2)}/day — the label predates the evidence`;
  }
  if ((s === 'high' || s === 'critical') && rate < 0.1 && occ < 3) {
    return `declared "${s}" but barely recurs (${occ}× at ${rate.toFixed(2)}/day) — may be over-weighted`;
  }
  return null;
}

// Deliberately transparent and dull. A clever formula here would be a bundled
// multiplier by another name (§17.11), so this stays a stated, arguable sum.
function _rank(rate, accel, idleHours) {
  const r = Math.min(1, rate / 10);
  const a = accel == null ? 0 : Math.min(1, Math.max(0, (accel - 1)));
  const live = idleHours > DORMANT_HOURS ? 0.2 : 1;
  return (r * 0.5 + a * 0.5) * live;
}

/**
 * survey(gaps, now) — measure a whole field, ordered by strain.
 * Reports the unmeasurable count separately; folding them in as zeros would
 * quietly sort every young gap to the bottom.
 */
function survey(gaps = [], now = Date.now()) {
  const open = gaps.filter(g => g && g.status !== 'closed' && g.status !== 'resolved');
  const all  = open.map(g => measure(g, now));
  const measured   = all.filter(m => m.measurable);
  const unmeasured = all.filter(m => !m.measurable);

  measured.sort((a, b) => b.rank - a.rank);

  return {
    ok: true, version: VERSION, generatedAt: now,
    openGaps: open.length,
    measured: measured.length,
    unmeasurable: unmeasured.length,
    // §16.1 — this is the ordering the law asks for, and it is measured.
    nearest: measured.slice(0, 10),
    worsening: measured.filter(m => m.state === 'worsening').map(m => m.id),
    dormant: measured.filter(m => m.state === 'dormant').length,
    mismatches: measured.filter(m => m.severityMismatch)
      .map(m => ({ id: m.id, type: m.type, note: m.severityMismatch })),
    unmeasurableIds: unmeasured.map(m => ({ id: m.id, reason: m.reason })),
    note: unmeasured.length
      ? `${unmeasured.length} gap(s) UNMEASURABLE — listed separately, never ranked as zero-tension`
      : null,
  };
}

/**
 * frictionDelta(before, after) — did a change relieve strain or add it?
 *
 * The cos half of the idea: run a candidate change inside a compartment, survey
 * the gap field before and after, and compare. A change that closes one gap
 * while raising the rate on three others has not helped, and a pass/fail gate
 * cannot see that — only a delta can.
 *
 * Pure comparison. It does not spawn the compartment; lib/compartment-engine
 * already owns snapshot-and-rollback, and duplicating that here would be a
 * second authority over the same thing (§10.3).
 */
function frictionDelta(before, after) {
  if (!before || !after || !before.ok || !after.ok) {
    return { ok: false, error: 'both surveys required',
      note: 'a missing survey is UNKNOWN friction, not zero friction' };
  }
  const idx = s => new Map((s.nearest || []).map(m => [m.id, m]));
  const b = idx(before), a = idx(after);

  const relieved = [], worsened = [], introduced = [];
  for (const [id, m] of b) {
    const post = a.get(id);
    if (!post) { relieved.push({ id, was: m.rank, note: 'no longer in the strained set' }); continue; }
    const d = +(post.rank - m.rank).toFixed(3);
    if (d < -0.05) relieved.push({ id, delta: d });
    else if (d > 0.05) worsened.push({ id, delta: d });
  }
  for (const [id, m] of a) if (!b.has(id)) introduced.push({ id, rank: m.rank });

  return {
    ok: true,
    openGapsDelta: after.openGaps - before.openGaps,
    relieved, worsened, introduced,
    verdict: introduced.length || worsened.length
      ? (relieved.length > (worsened.length + introduced.length) ? 'NET RELIEF' : 'NET FRICTION')
      : relieved.length ? 'RELIEF' : 'NO MEASURABLE CHANGE',
    // The reason this beats a pass/fail gate, stated on the payload so a caller
    // cannot use the verdict without meeting it.
    caveat: 'a change that closes one gap and raises three others still "passes" a boolean gate. ' +
            'Read relieved/worsened/introduced, not the verdict alone.',
  };
}

/** fromStore() — measure the live gap field. */
function fromStore() {
  try {
    const { jaaDB } = require('../cortex/memory/jaa-db');
    return survey(jaaDB.query('gaps', () => true, 100000) || []);
  } catch (e) {
    // §1.2 — unreadable is not empty.
    return { ok: false, error: e.message,
      note: 'gap store unreadable — this is NOT the same as a system with no gaps' };
  }
}

module.exports = { measure, survey, frictionDelta, fromStore,
  MIN_OCCURRENCES, DORMANT_HOURS, MODULE_ID, VERSION, COMP_ID, HOOK_ID };
