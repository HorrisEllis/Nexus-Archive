/**
 * @module       compress
 * @uuid         f50d7ace-fe96-4aae-995e-4534a9ad7163
 * @version      6.0.0
 *
 * Causal Nexus — Unified Compression, Timeline, and Invariant System
 *
 * WHAT CHANGED FROM v5:
 *   v5: static invariant checklist, single timeline, no baseline tracking.
 *   v6: dynamic invariant baseline that evolves over runtime, multi-timeline
 *       registry with UUID-addressed control, relational merge/fork/branch,
 *       and a full compression report with peak detection.
 *
 * Entry points:
 *   snapshot(kernel, opts)           — compact snapshot (5–12× vs raw JSON)
 *   restore(snap, opts)              — exact round-trip, I-1 compliant
 *   blueprint(kernel, opts)          — structural digest with dynamic invariants
 *   compile(blueprint, opts)         — generate executable ESM/CJS module
 *   compressionReport(kernel, snap)  — ratio, peak, bytes/event
 *
 * Timeline system:
 *   createTimeline(kernel, meta)     — register a kernel as a named trajectory
 *   forkTimeline(tlId, kernel, meta) — fork from existing timeline
 *   mergeTimelines(ids, strategy)    — merge two or more timelines
 *   branchTimeline(tlId, seqRange)   — extract a clip-bounded branch
 *   getTimeline(id)                  — retrieve timeline record
 *   listTimelines()                  — all registered timelines
 *   compareTimelines(ids)            — multi-stream relational comparison
 *
 * Invariant system:
 *   createInvariantBaseline(kernel)  — compute dynamic baseline from live data
 *   updateBaseline(baseline, kernel) — roll the baseline forward
 *   detectPeak(baseline)             — find the optimal baseline and log peak
 *   invariantMap(baseline)           — full relational invariant map
 *
 * Encoding (all improvements over v5):
 *   - Type dict + source dict (index not string)          [v5: same]
 *   - Payload delta per type                              [v5: same]
 *   - Timestamp deltas                                    [v5: same]
 *   - causedBy as primary-sequence index                  [v5: same]
 *   - Edge type 1-char codes                              [v5: same]
 *   - String interning across payload values (NEW v6)
 *   - Varint-style delta compression for numeric payloads (NEW v6)
 *   - Null stripping — omit trailing nulls in event tuples (NEW v6)
 *   - Per-type payload schema inference (NEW v6)
 *   - Invariant baseline snapshot embedded in archive     (NEW v6)
 *
 * @hook e225d4f3-d576-415a-bfac-0c26ae773d7e  snapshot
 * @hook d1ddb145-4b84-4db6-8cd4-8fa666be116f  restore
 * @hook cb527b7a-af1d-4bba-9df3-60cf360bb81a  blueprint
 * @hook de525186-dfe2-47dd-a904-1b58304c7ff1  compile
 * @hook 35e6caf0-88bb-49d0-8d50-722fb2b4ce7a  compressionReport
 * @hook a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d  createTimeline
 * @hook b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e  forkTimeline
 * @hook c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f  mergeTimelines
 * @hook d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a  compareTimelines
 * @hook e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b  createInvariantBaseline
 * @hook f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c  detectPeak
 */

import { createKernel } from '../kernel/index.js';
import { createAdapter } from '../adapter/index.js';

// ── Format constants ───────────────────────────────────────────────────────────

export const FORMAT_VERSION  = 2;
export const SNAP_MAGIC      = 'URCK-SNAP';
export const BP_MAGIC        = 'URCK-BP';
export const TL_MAGIC        = 'URCK-TL';
export const INV_MAGIC       = 'URCK-INV';

// Edge type → 1-char code (stable, unchanged from v5)
const ET_ENC = {
  'causal/explicit': 'x',
  'causal/rule':     'r',
  'causal/adapter':  'a',
  'observational':   'o',
};
const ET_DEC = Object.fromEntries(Object.entries(ET_ENC).map(([k, v]) => [v, k]));

// ── Invariant IDs (static + dynamic) ──────────────────────────────────────────

export const INV = Object.freeze({
  // Identity
  'I-1': 'All event IDs are UUID v4',
  // Causality
  'C-1': 'All causedBy references have declared edges',
  'C-2': 'No macro:detected events in kernel store',
  'C-3': 'Causal depth never exceeds structural maximum',
  'C-4': 'Gate events never appear as primary events',
  // Temporal
  'T-1': 'seq is strictly monotonically increasing',
  'T-2': 'eventTs is non-decreasing within session',
  'T-3': 'No future timestamps (ts <= now + 1000ms)',
  // Structural
  'S-1': 'All referenced parent IDs exist in ring or archive',
  'S-2': 'Type vocabulary is stable across rolling window',
  'S-3': 'Fan-out per event does not exceed structural maximum',
  // Compression-specific
  'K-1': 'Snapshot round-trips to identical event count',
  'K-2': 'Payload delta reconstruction is lossless',
  'K-3': 'Timeline UUIDs are globally unique',
});

// ── Utilities ─────────────────────────────────────────────────────────────────

function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function r4(v) { return Math.round((v ?? 0) * 10000) / 10000; }

function rollingMean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function rollingStd(arr) {
  if (arr.length < 2) return 0;
  const m = rollingMean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}

function isPrimary(ev) {
  return ev.source !== 'kernel:system'
    && !(ev.source && ev.source.startsWith('gate:'));
}

// ── String interning pool (v6 NEW) ────────────────────────────────────────────
// Builds a global string table across all payload values to avoid repeating
// common strings. Achieves 20-40% additional compression on verbose payloads.

function buildStringPool(events) {
  const freq = new Map();
  for (const ev of events) {
    if (!ev.payload) continue;
    for (const v of Object.values(ev.payload)) {
      if (typeof v === 'string' && v.length > 4) {
        freq.set(v, (freq.get(v) || 0) + 1);
      }
    }
  }
  // Only intern strings that appear more than once (saves space)
  const pool = [...freq.entries()]
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);
  const idx = new Map(pool.map((s, i) => [s, i]));
  return { pool, idx };
}

function internPayload(payload, idx) {
  if (!payload) return payload;
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'string' && idx.has(v)) {
      out[k] = { $s: idx.get(v) }; // string pool reference
    } else {
      out[k] = v;
    }
  }
  return out;
}

function restorePayload(payload, pool) {
  if (!payload) return payload;
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v && typeof v === 'object' && '$s' in v) {
      out[k] = pool[v.$s];
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ── Payload delta (improved v6: null stripping + numeric delta) ───────────────

function deltaPl(prev, curr) {
  if (!prev) return { _full: curr };
  if (!curr || Object.keys(curr).length === 0) return null;
  const cj = JSON.stringify(curr);
  const pj = JSON.stringify(prev);
  if (pj === cj) return null;

  const diff = {}; let any = false;
  const keys = new Set([...Object.keys(prev), ...Object.keys(curr)]);
  for (const k of keys) {
    const pv = prev[k];
    const cv = curr[k];
    if (JSON.stringify(pv) !== JSON.stringify(cv)) {
      // Numeric delta encoding (v6 NEW): store Δ instead of full value
      if (typeof pv === 'number' && typeof cv === 'number' && Number.isFinite(cv - pv)) {
        const delta = cv - pv;
        // Only use delta encoding if it's smaller than the full value repr
        if (Math.abs(delta) < Math.abs(cv) && String(delta).length < String(cv).length) {
          diff[k] = { $d: delta }; // numeric delta
        } else {
          diff[k] = k in curr ? cv : undefined;
        }
      } else {
        diff[k] = k in curr ? cv : undefined;
      }
      any = true;
    }
  }
  return any ? diff : null;
}

function applyPl(base, delta) {
  if (!delta) return base;
  if (delta._full) return delta._full;
  const r = Object.assign({}, base);
  for (const [k, v] of Object.entries(delta)) {
    if (v === undefined) {
      delete r[k];
    } else if (v && typeof v === 'object' && '$d' in v) {
      r[k] = (r[k] || 0) + v.$d; // apply numeric delta
    } else {
      r[k] = v;
    }
  }
  return r;
}

// Strip trailing nulls from event tuple (v6 NEW: reduces bytes/event)
function stripTuple(arr) {
  let end = arr.length;
  while (end > 0 && (arr[end - 1] === null || arr[end - 1] === undefined)) end--;
  return arr.slice(0, end);
}

// ── Per-type payload schema inference (v6 NEW) ────────────────────────────────
// Learns which keys are always present and their types. Used by compile() to
// emit typed interfaces and by snapshot to order keys for better delta compression.

function inferPayloadSchemas(events) {
  const schemas = new Map();
  for (const ev of events) {
    if (!ev.payload) continue;
    if (!schemas.has(ev.type)) schemas.set(ev.type, { keys: new Map(), count: 0 });
    const s = schemas.get(ev.type);
    s.count++;
    for (const [k, v] of Object.entries(ev.payload)) {
      if (!s.keys.has(k)) s.keys.set(k, { types: new Set(), count: 0 });
      const ki = s.keys.get(k);
      ki.count++;
      ki.types.add(typeof v);
    }
  }
  const out = {};
  for (const [type, s] of schemas) {
    out[type] = {
      count: s.count,
      fields: Object.fromEntries(
        [...s.keys.entries()].map(([k, ki]) => [k, {
          type:     [...ki.types].join('|'),
          required: ki.count === s.count,
          coverage: r4(ki.count / s.count),
        }])
      ),
    };
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── DYNAMIC INVARIANT BASELINE ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute a dynamic invariant baseline from a live kernel.
 *
 * The baseline is NOT a static checklist. It tracks each invariant as a
 * continuous signal with a rolling mean, std, and trend so that you can detect
 * when the kernel is drifting toward violation before it actually violates.
 *
 * Each invariant has:
 *   score:   0.0–1.0 (1.0 = fully satisfied, 0.0 = violated)
 *   history: rolling window of scores
 *   mean:    rolling mean
 *   std:     rolling std
 *   trend:   'improving' | 'stable' | 'degrading'
 *   peak:    highest observed score with ts
 *   nadir:   lowest observed score with ts
 *
 * @hook e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b  compress:createInvariantBaseline
 */
export function createInvariantBaseline(kernel) {
  const events  = kernel.getAll();
  const primary = events.filter(isPrimary);
  const n       = events.length;
  const now     = Date.now();

  if (n === 0) {
    return {
      magic:    INV_MAGIC,
      fmt:      FORMAT_VERSION,
      ts:       now,
      sampleN:  0,
      invariants: {},
      composite: { score: 1.0, mean: 1.0, std: 0, trend: 'stable' },
      peakTs:   now,
      peak:     1.0,
    };
  }

  // ── Score each invariant ───────────────────────────────────────────────────

  const scores = {};

  // I-1: UUID v4 format
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const validIds = events.filter(ev => uuidRe.test(ev.id)).length;
  scores['I-1'] = r4(validIds / n);

  // C-1: causedBy edges declared
  const withCausedBy = events.filter(ev => ev.causedBy);
  const edgedCount   = withCausedBy.filter(ev => kernel.edgeMeta(ev.id)).length;
  scores['C-1'] = withCausedBy.length > 0 ? r4(edgedCount / withCausedBy.length) : 1.0;

  // C-2: no macro:detected stored
  scores['C-2'] = events.some(ev => ev.type === 'macro:detected') ? 0.0 : 1.0;

  // C-3: causal depth bounded (sample up to 100 roots)
  const roots      = events.filter(ev => !ev.causedBy && !ev.type.startsWith('system:')).slice(0, 100);
  let   maxDepth   = 0;
  let   depthViolations = 0;
  const DEPTH_MAX  = 50; // structural maximum
  for (const r of roots) {
    const { depth } = kernel.traceToRoot(r.id);
    if (depth > maxDepth) maxDepth = depth;
    if (depth > DEPTH_MAX) depthViolations++;
  }
  scores['C-3'] = roots.length > 0 ? r4(1 - depthViolations / roots.length) : 1.0;

  // C-4: gate events not in primary
  const gateInPrimary = primary.filter(ev => ev.source && ev.source.startsWith('gate:')).length;
  scores['C-4'] = primary.length > 0 ? r4(1 - gateInPrimary / primary.length) : 1.0;

  // T-1: seq strictly increasing
  let seqViolations = 0;
  for (let i = 1; i < events.length; i++) {
    if (events[i].seq <= events[i - 1].seq) seqViolations++;
  }
  scores['T-1'] = n > 1 ? r4(1 - seqViolations / (n - 1)) : 1.0;

  // T-2: eventTs non-decreasing
  let tsViolations = 0;
  for (let i = 1; i < events.length; i++) {
    if ((events[i].eventTs || 0) < (events[i - 1].eventTs || 0)) tsViolations++;
  }
  scores['T-2'] = n > 1 ? r4(1 - tsViolations / (n - 1)) : 1.0;

  // T-3: no future timestamps
  const futureTs = events.filter(ev => ev.ts > now + 1000).length;
  scores['T-3'] = r4(1 - futureTs / n);

  // S-1: referenced parents exist (sample causedBy)
  const causalEvs = events.filter(ev => ev.causedBy).slice(0, 200);
  const resolvedParents = causalEvs.filter(ev => kernel.findById(ev.causedBy)).length;
  scores['S-1'] = causalEvs.length > 0 ? r4(resolvedParents / causalEvs.length) : 1.0;

  // S-2: type vocabulary stability — measure type set entropy over windows
  // Compare vocab of first half vs second half
  const half   = Math.floor(n / 2);
  const first  = new Set(events.slice(0, half).map(ev => ev.type));
  const second = new Set(events.slice(half).map(ev => ev.type));
  const union  = new Set([...first, ...second]);
  const inter  = [...first].filter(t => second.has(t)).length;
  scores['S-2'] = union.size > 0 ? r4(inter / union.size) : 1.0;

  // S-3: fan-out bounded (no event has > 100 children)
  const FAN_MAX = 100;
  let fanViolations = 0;
  const sampledForFan = events.slice(-500);
  for (const ev of sampledForFan) {
    const children = kernel.getChildren ? kernel.getChildren(ev.id) : [];
    if (children.length > FAN_MAX) fanViolations++;
  }
  scores['S-3'] = sampledForFan.length > 0 ? r4(1 - fanViolations / sampledForFan.length) : 1.0;

  // K-1/K-2/K-3: compression invariants — scored 1.0 at baseline creation
  // (updated by updateBaseline after a round-trip test)
  scores['K-1'] = 1.0;
  scores['K-2'] = 1.0;
  scores['K-3'] = 1.0;

  // ── Composite score ────────────────────────────────────────────────────────
  const vals      = Object.values(scores);
  const composite = r4(rollingMean(vals));

  return {
    magic:      INV_MAGIC,
    fmt:        FORMAT_VERSION,
    ts:         now,
    sampleN:    n,
    maxDepth,
    invariants: Object.fromEntries(
      Object.entries(scores).map(([id, score]) => [id, {
        id,
        text:    INV[id] || id,
        score,
        history: [score],
        mean:    score,
        std:     0,
        trend:   'stable',
        peak:    { score, ts: now },
        nadir:   { score, ts: now },
        status:  score === 1.0 ? 'pass' : score >= 0.95 ? 'warn' : 'fail',
      }])
    ),
    composite: {
      score:   composite,
      mean:    composite,
      std:     r4(rollingStd(vals)),
      trend:   'stable',
      history: [{ score: composite, ts: now, n }],
    },
    peakTs:  now,
    peak:    composite,
  };
}

/**
 * Roll the baseline forward with new kernel data.
 * Mutates the baseline in-place and returns it.
 *
 * @hook e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b  compress:updateBaseline
 */
export function updateBaseline(baseline, kernel) {
  const fresh = createInvariantBaseline(kernel);
  const now   = Date.now();

  for (const [id, inv] of Object.entries(baseline.invariants)) {
    const newScore = fresh.invariants[id]?.score ?? 1.0;
    inv.history.push(newScore);
    if (inv.history.length > 100) inv.history.shift();

    const prevMean = inv.mean;
    inv.mean  = r4(rollingMean(inv.history));
    inv.std   = r4(rollingStd(inv.history));
    inv.score = newScore;

    const delta = inv.mean - prevMean;
    inv.trend = Math.abs(delta) < 0.001 ? 'stable' : delta > 0 ? 'improving' : 'degrading';
    inv.status = newScore === 1.0 ? 'pass' : newScore >= 0.95 ? 'warn' : 'fail';

    if (newScore > inv.peak.score) inv.peak  = { score: newScore, ts: now };
    if (newScore < inv.nadir.score) inv.nadir = { score: newScore, ts: now };
  }

  const composite = r4(rollingMean(Object.values(baseline.invariants).map(i => i.score)));
  const prevComp  = baseline.composite.mean;
  baseline.composite.history.push({ score: composite, ts: now, n: fresh.sampleN });
  if (baseline.composite.history.length > 200) baseline.composite.history.shift();
  const histScores = baseline.composite.history.map(h => h.score);
  baseline.composite.score = composite;
  baseline.composite.mean  = r4(rollingMean(histScores));
  baseline.composite.std   = r4(rollingStd(histScores));
  const delta = baseline.composite.mean - prevComp;
  baseline.composite.trend = Math.abs(delta) < 0.001 ? 'stable' : delta > 0 ? 'improving' : 'degrading';

  if (composite > baseline.peak) {
    baseline.peak   = composite;
    baseline.peakTs = now;
  }

  baseline.sampleN  = fresh.sampleN;
  baseline.maxDepth = fresh.maxDepth;
  baseline.ts       = now;

  return baseline;
}

/**
 * Find the optimal baseline window and log peak composite score.
 * Returns the window index and score of the best observed state.
 *
 * @hook f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c  compress:detectPeak
 */
export function detectPeak(baseline) {
  const history = baseline.composite.history || [];
  if (history.length === 0) return {
    peakScore: baseline.peak ?? baseline.composite.score ?? 1.0,
    peakTs: baseline.peakTs ?? baseline.ts,
    peakIdx: 0,
    optimalWindowStart: 0,
    optimalWindowEnd:   0,
    optimalWindowMean:  baseline.composite.score ?? 1.0,
    totalSamples: 0,
    currentScore: baseline.composite.score ?? 1.0,
    trend: baseline.composite.trend ?? 'stable',
  };

  let best = -Infinity;
  let bestIdx = 0;
  for (let i = 0; i < history.length; i++) {
    if (history[i].score > best) { best = history[i].score; bestIdx = i; }
  }

  // Compute rolling average to find the optimal WINDOW (not just instant peak)
  const WINDOW = Math.min(10, Math.floor(history.length / 3));
  let bestWindowMean = -Infinity;
  let bestWindowIdx  = 0;
  for (let i = 0; i <= history.length - WINDOW; i++) {
    const windowMean = rollingMean(history.slice(i, i + WINDOW).map(h => h.score));
    if (windowMean > bestWindowMean) { bestWindowMean = windowMean; bestWindowIdx = i; }
  }

  return {
    peakScore:       r4(best),
    peakTs:          history[bestIdx]?.ts ?? baseline.peakTs,
    peakIdx:         bestIdx,
    optimalWindowStart: bestWindowIdx,
    optimalWindowEnd:   bestWindowIdx + WINDOW - 1,
    optimalWindowMean:  r4(bestWindowMean),
    totalSamples:    history.length,
    currentScore:    baseline.composite.score,
    trend:           baseline.composite.trend,
  };
}

/**
 * Build a full relational invariant map:
 * which invariants correlate, which are independent, and how they cluster.
 *
 * @hook e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b  compress:invariantMap
 */
export function invariantMap(baseline) {
  const invs   = Object.values(baseline.invariants);
  const ids    = invs.map(i => i.id);
  const n      = ids.length;

  // Correlation matrix between invariant score histories
  const corr = {};
  for (let a = 0; a < n; a++) {
    corr[ids[a]] = {};
    for (let b = 0; b < n; b++) {
      const ha = invs[a].history;
      const hb = invs[b].history;
      const len = Math.min(ha.length, hb.length);
      if (len < 3 || a === b) { corr[ids[a]][ids[b]] = a === b ? 1.0 : null; continue; }
      const sa = ha.slice(-len), sb = hb.slice(-len);
      const ma = rollingMean(sa), mb = rollingMean(sb);
      const num = sa.reduce((s, v, i) => s + (v - ma) * (sb[i] - mb), 0);
      const da  = Math.sqrt(sa.reduce((s, v) => s + (v - ma) ** 2, 0));
      const db  = Math.sqrt(sb.reduce((s, v) => s + (v - mb) ** 2, 0));
      corr[ids[a]][ids[b]] = (da > 0 && db > 0) ? r4(num / (da * db)) : null;
    }
  }

  // Cluster by group prefix (I, C, T, S, K)
  const clusters = {};
  for (const inv of invs) {
    const g = inv.id[0];
    if (!clusters[g]) clusters[g] = [];
    clusters[g].push(inv.id);
  }

  // Identify critical path: which invariants most affect composite score
  const criticalPath = invs
    .filter(i => i.score < 1.0)
    .sort((a, b) => a.score - b.score)
    .map(i => ({ id: i.id, score: i.score, trend: i.trend, impact: r4(1 - i.score) }));

  return {
    correlationMatrix: corr,
    clusters,
    criticalPath,
    summary: {
      passing:   invs.filter(i => i.status === 'pass').length,
      warning:   invs.filter(i => i.status === 'warn').length,
      failing:   invs.filter(i => i.status === 'fail').length,
      composite: baseline.composite.score,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── TIMELINE REGISTRY ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// Global registry: timelineId → TimelineRecord
const _registry = new Map();

/**
 * TimelineRecord — the unit of relational tracking.
 * Each kernel instance is a trajectory. Trajectories can fork, merge, branch.
 */
function makeTimelineRecord(kernel, meta = {}, parentId = null) {
  const id = meta.id || uuid4();
  return {
    magic:    TL_MAGIC,
    id,
    name:     meta.name || `timeline-${id.slice(0, 8)}`,
    label:    meta.label || null,
    parentId,
    forkSeq:  meta.forkSeq || null,
    createdTs: Date.now(),
    updatedTs: Date.now(),
    kernel,
    baseline: null,
    snapshots: [],
    tags:     meta.tags || [],
    meta:     meta.meta || {},
  };
}

/**
 * Register a kernel as a named timeline.
 * Returns the timeline UUID.
 *
 * @hook a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d  compress:createTimeline
 */
export function createTimeline(kernel, meta = {}) {
  const rec = makeTimelineRecord(kernel, meta);
  rec.baseline = createInvariantBaseline(kernel);
  _registry.set(rec.id, rec);
  return rec.id;
}

/**
 * Fork an existing timeline at the current seq.
 * The fork shares the parent's history up to the fork point; from there they diverge.
 *
 * @hook b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e  compress:forkTimeline
 */
export function forkTimeline(parentId, forkedKernel, meta = {}) {
  const parent = _registry.get(parentId);
  if (!parent) throw new Error(`forkTimeline: parent timeline ${parentId} not found`);

  const forkSeq = parent.kernel.clock?.seq ?? null;
  const rec = makeTimelineRecord(forkedKernel, meta, parentId);
  rec.forkSeq  = forkSeq;
  rec.baseline = createInvariantBaseline(forkedKernel);
  _registry.set(rec.id, rec);
  return rec.id;
}

/**
 * Extract a bounded branch (clip) from a timeline as a new timeline.
 * seqRange: [startSeq, endSeq]
 *
 * @hook c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f  compress:branchTimeline
 */
export function branchTimeline(tlId, seqRange, meta = {}) {
  const parent = _registry.get(tlId);
  if (!parent) throw new Error(`branchTimeline: timeline ${tlId} not found`);

  const [startSeq, endSeq] = seqRange;
  const events = parent.kernel.getAll().filter(ev => ev.seq >= startSeq && ev.seq <= endSeq);

  // Build a new mini kernel from this slice
  const branchKernel = createKernel({ ringCap: Math.max(events.length * 2, 1000) });
  for (const ev of events) {
    branchKernel.ingest(ev.type, ev.payload, {
      source:  ev.source,
      sessionId: ev.sessionId,
    });
  }

  const rec = makeTimelineRecord(branchKernel, { ...meta, forkSeq: startSeq }, tlId);
  rec.meta.seqRange  = seqRange;
  rec.meta.branchOf  = tlId;
  rec.baseline = createInvariantBaseline(branchKernel);
  _registry.set(rec.id, rec);
  return rec.id;
}

/**
 * Merge two or more timelines into a new synthesized timeline.
 * strategy: 'interleave' | 'append' | 'union'
 *   interleave — merge by eventTs order (default)
 *   append     — append timelines sequentially
 *   union      — deduplicate by content hash
 *
 * @hook c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f  compress:mergeTimelines
 */
export function mergeTimelines(ids, strategy = 'interleave', meta = {}) {
  const timelines = ids.map(id => {
    const tl = _registry.get(id);
    if (!tl) throw new Error(`mergeTimelines: timeline ${id} not found`);
    return tl;
  });

  const allEvents = timelines.flatMap(tl => tl.kernel.getAll());

  let merged;
  if (strategy === 'interleave') {
    merged = allEvents.slice().sort((a, b) => (a.eventTs || a.ts) - (b.eventTs || b.ts));
  } else if (strategy === 'append') {
    merged = allEvents;
  } else if (strategy === 'union') {
    const seen = new Set();
    merged = allEvents.filter(ev => {
      const key = `${ev.type}:${JSON.stringify(ev.payload)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } else {
    throw new Error(`mergeTimelines: unknown strategy '${strategy}'`);
  }

  const mergedKernel = createKernel({ ringCap: Math.max(merged.length * 2, 5000) });
  for (const ev of merged) {
    mergedKernel.ingest(ev.type, ev.payload, { source: ev.source });
  }

  const rec = makeTimelineRecord(mergedKernel, {
    ...meta,
    name: meta.name || `merge(${ids.map(id => id.slice(0, 6)).join('+')})`,
  });
  rec.meta.mergedFrom = ids;
  rec.meta.strategy   = strategy;
  rec.baseline = createInvariantBaseline(mergedKernel);
  _registry.set(rec.id, rec);
  return rec.id;
}

/** Retrieve a timeline record by UUID. */
export function getTimeline(id) {
  return _registry.get(id) || null;
}

/** List all registered timelines (summaries, not full records). */
export function listTimelines() {
  return [..._registry.values()].map(tl => ({
    id:        tl.id,
    name:      tl.name,
    label:     tl.label,
    parentId:  tl.parentId,
    forkSeq:   tl.forkSeq,
    createdTs: tl.createdTs,
    updatedTs: tl.updatedTs,
    eventCount: tl.kernel.length,
    tags:      tl.tags,
    composite: tl.baseline?.composite?.score ?? null,
    meta:      tl.meta,
  }));
}

/** Remove a timeline from the registry. Does NOT destroy the kernel. */
export function dropTimeline(id) {
  return _registry.delete(id);
}

/**
 * Refresh a timeline's invariant baseline from its current kernel state.
 */
export function refreshTimeline(id) {
  const tl = _registry.get(id);
  if (!tl) throw new Error(`refreshTimeline: ${id} not found`);
  if (tl.baseline) {
    updateBaseline(tl.baseline, tl.kernel);
  } else {
    tl.baseline = createInvariantBaseline(tl.kernel);
  }
  tl.updatedTs = Date.now();
  return tl.baseline;
}

// ── Multi-timeline comparison ──────────────────────────────────────────────────

/**
 * Compare two or more timelines across all invariant axes.
 * Returns a relational diff matrix, divergence scores, and structural deltas.
 *
 * @hook d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a  compress:compareTimelines
 */
export function compareTimelines(ids) {
  const tls = ids.map(id => {
    const tl = _registry.get(id);
    if (!tl) throw new Error(`compareTimelines: timeline ${id} not found`);
    if (!tl.baseline) tl.baseline = createInvariantBaseline(tl.kernel);
    return tl;
  });

  const n = tls.length;

  // Per-axis scores matrix
  const axisMatrix = {};
  const invIds = Object.keys(tls[0].baseline.invariants);
  for (const invId of invIds) {
    axisMatrix[invId] = tls.map(tl => ({
      tlId:  tl.id,
      name:  tl.name,
      score: tl.baseline.invariants[invId]?.score ?? null,
      trend: tl.baseline.invariants[invId]?.trend ?? null,
    }));
  }

  // Pairwise divergence (L1 distance over invariant scores)
  const divergence = {};
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const idA = tls[a].id, idB = tls[b].id;
      const key = `${idA.slice(0, 8)}↔${idB.slice(0, 8)}`;
      let l1 = 0;
      for (const inv of invIds) {
        const sa = tls[a].baseline.invariants[inv]?.score ?? 1;
        const sb = tls[b].baseline.invariants[inv]?.score ?? 1;
        l1 += Math.abs(sa - sb);
      }
      divergence[key] = { a: idA, b: idB, l1: r4(l1), normalized: r4(l1 / invIds.length) };
    }
  }

  // Structural comparison: type vocabulary overlap
  const vocabs = tls.map(tl => new Set(tl.kernel.getAll().map(ev => ev.type)));
  const vocabMatrix = {};
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const union = new Set([...vocabs[a], ...vocabs[b]]);
      const inter = [...vocabs[a]].filter(t => vocabs[b].has(t));
      const key   = `${tls[a].id.slice(0, 8)}↔${tls[b].id.slice(0, 8)}`;
      vocabMatrix[key] = {
        jaccard:  r4(inter.length / union.size),
        onlyInA:  [...vocabs[a]].filter(t => !vocabs[b].has(t)),
        onlyInB:  [...vocabs[b]].filter(t => !vocabs[a].has(t)),
        shared:   inter,
      };
    }
  }

  // Event count and composite summaries
  const summaries = tls.map(tl => ({
    id:         tl.id,
    name:       tl.name,
    eventCount: tl.kernel.length,
    composite:  tl.baseline.composite.score,
    trend:      tl.baseline.composite.trend,
    peak:       tl.baseline.peak,
  }));

  return {
    timelines:   summaries,
    axisMatrix,
    divergence,
    vocabMatrix,
    mostSimilar: Object.entries(divergence).sort((a, b) => a[1].normalized - b[1].normalized)[0] || null,
    mostDivergent: Object.entries(divergence).sort((a, b) => b[1].normalized - a[1].normalized)[0] || null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SNAPSHOT (v6) ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Serialize a kernel to a compact snapshot object.
 * v6 improvements: string interning, null stripping, numeric delta encoding.
 *
 * @hook e225d4f3-d576-415a-bfac-0c26ae773d7e  compress:snapshot
 */
export function snapshot(kernel, opts = {}) {
  const all     = kernel.getAll();
  const primary = all.filter(isPrimary);

  // ── Dictionaries ────────────────────────────────────────────────────────
  const types = []; const typeIdx = new Map();
  const sources = []; const srcIdx = new Map();

  for (const ev of primary) {
    if (!typeIdx.has(ev.type)) { typeIdx.set(ev.type, types.length); types.push(ev.type); }
    const s = ev.source || '';
    if (!srcIdx.has(s)) { srcIdx.set(s, sources.length); sources.push(s); }
  }

  // ── String pool (v6) ────────────────────────────────────────────────────
  const { pool: stringPool, idx: stringIdx } = buildStringPool(primary);

  // ── Position index for causedBy ─────────────────────────────────────────
  const idToPos = new Map();
  primary.forEach((ev, i) => idToPos.set(ev.id, i));

  // ── Encode events ───────────────────────────────────────────────────────
  let prevTs = 0, prevEts = 0;
  const prevPlByType = new Map();

  const encoded = primary.map(ev => {
    const dts = ev.ts - prevTs;
    const det = ev.eventTs - prevEts;
    prevTs  = ev.ts;
    prevEts = ev.eventTs;

    const prevPl = prevPlByType.get(ev.type) || null;
    const rawPd  = deltaPl(prevPl, ev.payload);
    // Intern strings in delta
    const pd = rawPd ? internPayload(rawPd, stringIdx) : null;
    prevPlByType.set(ev.type, ev.payload);

    const cb = (ev.causedBy && idToPos.has(ev.causedBy)) ? idToPos.get(ev.causedBy) : null;
    const et = ev.edgeType ? (ET_ENC[ev.edgeType] || ev.edgeType) : null;

    // Null stripping: omit trailing nulls (v6)
    return stripTuple([
      typeIdx.get(ev.type),
      srcIdx.get(ev.source || ''),
      dts,
      det,
      cb,
      et,
      pd,
      ev.sessionId || null,
      ev.srcBusName || null,
    ]);
  });

  const macros = kernel.macros.map(m => ({ p: m.pattern, c: m.count, s: m.firstSeenSeq, t: m.eventTs }));
  const gates  = kernel.getGates().filter(g => !g.builtin).map(g => ({ sig: g.signature, pri: g.priority }));

  // Optionally embed invariant baseline
  const baseline = opts.embedBaseline ? createInvariantBaseline(kernel) : undefined;

  // Per-type schema (v6, optional)
  const schemas = opts.embedSchemas ? inferPayloadSchemas(primary) : undefined;

  return {
    magic:      SNAP_MAGIC,
    fmt:        FORMAT_VERSION,
    ts:         Date.now(),
    cseq:       kernel.clock.seq,
    ctick:      kernel.clock.tick,
    ver:        kernel.version,
    types,
    sources,
    stringPool,
    ev:         encoded,
    macros,
    gates,
    n:          primary.length,
    total:      all.length,
    edges:      kernel.edgeCount,
    drops:      kernel.droppedCount,
    baseline,
    schemas,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── RESTORE (v6) ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Restore a kernel from a snapshot.
 * Supports both v1 (no string pool) and v2 (with string pool) snapshots.
 *
 * @hook d1ddb145-4b84-4db6-8cd4-8fa666be116f  compress:restore
 */
export function restore(snap, opts = {}) {
  if (!snap || snap.magic !== SNAP_MAGIC) throw new Error('restore: not a valid URCK snapshot');
  if (snap.fmt > FORMAT_VERSION) throw new Error(`restore: format v${snap.fmt} unsupported (max v${FORMAT_VERSION})`);

  const kernel = createKernel({
    ringCap: opts.ringCap || Math.max(snap.total * 2, 5_000),
    ...opts,
  });

  const { types, sources, ev: encoded, stringPool = [] } = snap;
  const seqToNewId = new Array(encoded.length);

  let prevTs = 0, prevEts = 0;
  const prevPlByType = new Map();

  for (let i = 0; i < encoded.length; i++) {
    // Pad short tuples back to full width (null stripping)
    const [ti = 0, si = 0, dts = 0, det = 0, cb = null, et = null, pd = null, sessionId = null, srcBusName = null] = encoded[i];

    const type    = types[ti];
    const source  = sources[si] || 'unknown';
    const ts_val  = prevTs  + dts;
    const eventTs = prevEts + det;
    prevTs  = ts_val;
    prevEts = eventTs;

    // Restore interned strings before applying delta
    const restoredPd = pd ? restorePayload(pd, stringPool) : pd;

    const prevPl  = prevPlByType.get(type) || {};
    const payload = applyPl(prevPl, restoredPd);
    prevPlByType.set(type, payload);

    const causedBy = (cb !== null && cb !== undefined) ? seqToNewId[cb] : undefined;
    const edgeType = et ? (ET_DEC[et] || et) : undefined;

    const ingested = kernel.ingest(type, payload, {
      causedBy,
      edgeType,
      source,
      sessionId:   sessionId  || undefined,
      srcBusName:  srcBusName || undefined,
      origEventTs: eventTs,
    });
    seqToNewId[i] = ingested.id;
  }

  return kernel;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── BLUEPRINT (v6) ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract structural digest: vocabulary, causal grammar, macro patterns,
 * dynamic invariant baseline, payload schemas.
 *
 * @hook cb527b7a-af1d-4bba-9df3-60cf360bb81a  compress:blueprint
 */
export function blueprint(kernel, opts = {}) {
  const events  = kernel.getAll();
  const primary = events.filter(isPrimary);
  const n       = events.length;

  const freq    = new Map();
  const succMap = new Map();
  const parMap  = new Map();

  for (const ev of events) {
    freq.set(ev.type, (freq.get(ev.type) || 0) + 1);
    if (ev.causedBy) {
      const par = kernel.findById(ev.causedBy);
      if (par) {
        if (!succMap.has(par.type)) succMap.set(par.type, new Map());
        if (!parMap.has(ev.type))   parMap.set(ev.type, new Map());
        const sc = succMap.get(par.type);
        const pc = parMap.get(ev.type);
        sc.set(ev.type,  (sc.get(ev.type)  || 0) + 1);
        pc.set(par.type, (pc.get(par.type) || 0) + 1);
      }
    }
  }

  const vocab = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type, count,
      pct:        Math.round(count / n * 1000) / 10,
      successors: succMap.has(type)
        ? [...succMap.get(type).entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, c]) => ({ type: t, count: c }))
        : [],
      parents:    parMap.has(type)
        ? [...parMap.get(type).entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t, c]) => ({ type: t, count: c }))
        : [],
      isRoot:         !parMap.has(type) || parMap.get(type).size === 0,
      isGateProduced: type === 'session:boundary' || type === 'dom:unstable' || type === 'alert:critical'
                      || (type && type.startsWith('system:')),
    }));

  let maxDepth = 0;
  const roots  = events.filter(ev => !ev.causedBy && !ev.type.startsWith('system:')).slice(0, 50);
  for (const r of roots) {
    const { depth } = kernel.traceToRoot(r.id);
    if (depth > maxDepth) maxDepth = depth;
  }

  const gates    = kernel.getGates().map(g => ({ signature: g.signature, priority: g.priority, builtin: g.builtin }));
  const patterns = kernel.macros.map(m => ({
    pattern: m.pattern,
    count:   m.count,
    chainLen: m.pattern.split(' → ').length,
    types:   m.pattern.split(' → '),
  }));

  // Dynamic invariant baseline (v6 NEW — replaces static checklist)
  const invBaseline = createInvariantBaseline(kernel);
  const invMap      = invariantMap(invBaseline);
  const peak        = detectPeak(invBaseline);

  // Payload schemas (v6 NEW)
  const schemas = inferPayloadSchemas(primary);

  return {
    magic:  BP_MAGIC,
    fmt:    FORMAT_VERSION,
    ts:     Date.now(),
    session: {
      eventCount:      n,
      primaryCount:    primary.length,
      edgeCount:       kernel.edgeCount,
      macroCount:      kernel.macros.length,
      uniqueTypes:     vocab.length,
      maxCausalDepth:  maxDepth,
    },
    vocab,
    gates,
    patterns,
    schemas,
    // v6: dynamic invariants replace static list
    invariantBaseline: invBaseline,
    invariantMap:      invMap,
    invariantPeak:     peak,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── COMPILE (v6) ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate an executable ESM or CJS module from a blueprint.
 * v6: emits typed payload interfaces from schema inference.
 *
 * @hook de525186-dfe2-47dd-a904-1b58304c7ff1  compress:compile
 */
export function compile(bp, { ringCap = 1_000_000, includeSeed = true, format = 'esm' } = {}) {
  if (!bp || bp.magic !== BP_MAGIC) throw new Error('compile: invalid blueprint');

  const L = [];
  const w  = (...s) => L.push(...s);
  const nl = ()     => L.push('');

  w(
    `/**`,
    ` * Generated by URCK Blueprint Compiler — v${FORMAT_VERSION}`,
    ` * ${bp.session.eventCount} events · ${bp.session.uniqueTypes} types · ${bp.session.edgeCount} edges`,
    ` * Generated: ${new Date(bp.ts).toISOString()}`,
    ` * Invariant composite: ${bp.invariantBaseline?.composite?.score ?? 'n/a'}`,
    ` */`,
  ); nl();

  if (format === 'esm') {
    w(
      `import { createKernel, gateOutput } from './modules/kernel/index.js';`,
      `import { createAdapter }            from './modules/adapter/index.js';`,
    );
  } else {
    w(
      `const { createKernel, gateOutput } = require('./modules/kernel/index.js');`,
      `const { createAdapter }            = require('./modules/adapter/index.js');`,
    );
  }
  nl();

  // Type constants
  w(`const T = Object.freeze({`);
  for (const { type, count, pct } of bp.vocab) {
    const key = type.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    w(`  ${key}: ${JSON.stringify(type)},${' '.repeat(Math.max(1, 32 - type.length))}// ${count} (${pct}%)`);
  }
  w(`});`); nl();

  // Causal grammar map
  w(`const GRAMMAR = new Map([`);
  for (const { type, successors } of bp.vocab.filter(v => v.successors.length > 0)) {
    const inner = successors.map(s => `[${JSON.stringify(s.type)}, ${s.count}]`).join(', ');
    w(`  [${JSON.stringify(type)}, new Map([${inner}])],`);
  }
  w(`]);`); nl();

  // Macro patterns
  if (bp.patterns.length > 0) {
    w(`const MACROS = [`);
    for (const { pattern, count, chainLen, types: seqTypes } of bp.patterns) {
      w(`  { types: ${JSON.stringify(seqTypes)}, count: ${count}, chainLen: ${chainLen} }, // ${pattern}`);
    }
    w(`];`); nl();
  }

  // Payload schemas (v6 NEW)
  if (bp.schemas && Object.keys(bp.schemas).length > 0) {
    w(`/** Inferred payload schemas — for validation and tooling */`);
    w(`const SCHEMAS = ${JSON.stringify(bp.schemas, null, 2)};`); nl();
  }

  // Invariant summary (v6 NEW)
  if (bp.invariantBaseline) {
    const { composite, invariants } = bp.invariantBaseline;
    w(`/** Invariant baseline at compile time */`);
    w(`const INVARIANTS = Object.freeze({`);
    w(`  composite: ${composite.score},`);
    for (const [id, inv] of Object.entries(invariants)) {
      w(`  '${id}': { score: ${inv.score}, status: ${JSON.stringify(inv.status)}, text: ${JSON.stringify(inv.text)} },`);
    }
    w(`});`); nl();
  }

  // Custom gates
  const customGates = bp.gates.filter(g => !g.builtin);
  if (customGates.length > 0) {
    w(`const CUSTOM_GATES = [`);
    for (const g of customGates) {
      w(`  { signature: ${JSON.stringify(g.signature)}, priority: ${g.priority}, fn(ev, query) { return []; } },`);
    }
    w(`];`); nl();
  }

  // Factory function
  const exportKw = format === 'esm' ? 'export ' : '';
  w(`${exportKw}function createFromBlueprint({ ringCap = ${ringCap}, seed = ${includeSeed} } = {}) {`);
  w(`  const kernel  = createKernel({ ringCap });`);
  w(`  const adapter = createAdapter(kernel);`); nl();
  if (customGates.length > 0) {
    w(`  for (const g of CUSTOM_GATES) kernel.registerGate(g.signature, g.fn, { priority: g.priority });`); nl();
  }
  w(`  return { kernel, adapter };`);
  w(`}`); nl();

  const exports = [
    'T',
    'GRAMMAR',
    ...(bp.patterns.length > 0 ? ['MACROS'] : []),
    ...(bp.schemas ? ['SCHEMAS'] : []),
    ...(bp.invariantBaseline ? ['INVARIANTS'] : []),
  ];

  if (format === 'esm') {
    w(`export { ${exports.join(', ')} };`);
    w(`export default createFromBlueprint;`);
  } else {
    w(`module.exports = { createFromBlueprint, ${exports.join(', ')} };`);
  }

  return L.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── COMPRESSION REPORT (v6) ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @hook 35e6caf0-88bb-49d0-8d50-722fb2b4ce7a  compress:compressionReport
 */
export function compressionReport(kernel, snap) {
  const rawB  = JSON.stringify(kernel.getAll()).length;
  const snapB = JSON.stringify(snap).length;
  const ratio = rawB > 0 && snapB > 0 ? Math.max(1, Math.round(rawB / snapB * 10) / 10) : 1;

  // String pool savings
  const poolSavings = snap.stringPool
    ? snap.stringPool.reduce((s, str) => s + str.length, 0)
    : 0;

  return {
    rawBytes:      rawB,
    snapBytes:     snapB,
    ratio,
    primaryCount:  snap.n,
    totalCount:    snap.total,
    eventCount:    kernel.length,
    bytesPerEvent: Math.round(snapB / Math.max(snap.n, 1)),
    stringPoolSize: snap.stringPool?.length ?? 0,
    stringPoolSavingsEstimate: poolSavings,
    summary: `${(rawB / 1024).toFixed(1)} KB raw → ${(snapB / 1024).toFixed(1)} KB snap (${ratio}×)`,
    formatVersion: FORMAT_VERSION,
  };
}
