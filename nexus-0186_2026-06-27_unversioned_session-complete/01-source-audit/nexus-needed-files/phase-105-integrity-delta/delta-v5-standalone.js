/**
 * @module       delta
 * @uuid         7a4219d0-04a3-4276-8a52-83e7d52db10a
 * @project      causal-nexus
 * @project-uuid eecaa718-c6a6-4433-b02a-11ecbefd4740
 * @version      1.0.0
 * @file         modules/delta/delta.js
 *
 * @hooks (module-level, see hooks.json for full registry)
 * @hook c2237d17-ca86-4938-ba4c-83975cef1681      computeEventDelta
 * @hook 67240917-2b71-4c71-b990-f70d8fb63815      computeDeltaStream
 * @hook e3bb7a99-ec6a-4515-96a7-21e30b8bd1bd      detectBottlenecks
 * @hook 728a38ea-5e0b-4389-a3b8-8f2b34c4bbad      computeThroughputTimeline
 * @hook 24ded596-d004-4c08-aa21-ee215fa87bf2      compressToL1
 * @hook f86550cf-140f-4f57-895f-3dd125d977be      overlayMacros
 * @hook 060b1fc1-bbf7-4d27-8780-025609afd030      clusterByAnomaly
 * @hook e3a6c710-7d0f-4997-8a2f-953f6568f730      detectFractals
 * @hook b70350bf-59b9-4589-9ed8-b72c26a244cc      createGraphBranch
 * @hook a97b25f7-73e4-4cdf-9a86-f25a2bcdd8ff      createBranchRegistry
 * @hook 7fd8b41e-95bc-438d-9d98-ab8925c9203e      BOTTLENECK_THRESHOLD
 * @hook 339a1033-8919-465f-b9d5-71802442ac85      LATENCY_WINDOW
 * @hook 62e32268-eb88-47fe-b48c-b89faaf1abf2      THROUGHPUT_WINDOW
 * @hook d0234be7-bfe3-42bd-9c93-8f8cea822754      FAN_OUT_ALERT_THRESHOLD
 * @hook 0fa077b8-30ca-4b11-9b6f-df32c211cfe2      DEPTH_ALERT_THRESHOLD
 * @hook ef133825-4823-4ad3-b156-4c16ac20ce3c      ZOOM_LEVELS
 */
import { newEventId } from '../identity/identity.js';
import { wallTsToMinute } from '../lazy/lazy.js';

// ── Constants ─────────────────────────────────────────────────────────────────

// @hook 7fd8b41e-95bc-438d-9d98-ab8925c9203e  delta:BOTTLENECK_THRESHOLD
export const BOTTLENECK_THRESHOLD    = 0.7;  // instabilityScore above this → bottleneck
// @hook 339a1033-8919-465f-b9d5-71802442ac85  delta:LATENCY_WINDOW
export const LATENCY_WINDOW          = 50;   // rolling window for latency baseline
// @hook 62e32268-eb88-47fe-b48c-b89faaf1abf2  delta:THROUGHPUT_WINDOW
export const THROUGHPUT_WINDOW       = 100;  // events counted for rate calculation
// @hook d0234be7-bfe3-42bd-9c93-8f8cea822754  delta:FAN_OUT_ALERT_THRESHOLD
export const FAN_OUT_ALERT_THRESHOLD = 8;    // children count that signals fan-out explosion
// @hook 0fa077b8-30ca-4b11-9b6f-df32c211cfe2  delta:DEPTH_ALERT_THRESHOLD
export const DEPTH_ALERT_THRESHOLD   = 15;   // causal depth that signals explosion

// ── Delta record ──────────────────────────────────────────────────────────────

/**
 * Compute the delta for a single event given its context.
 *
 * @param {object} ev          — the event
 * @param {object} parent      — parent event or null
 * @param {number} parentDepth — causal depth of parent (0 for roots)
 * @param {number[]} recentGaps — last N inter-event gaps (eventTs deltas)
 * @param {number} recentRate  — events per 1000 ticks in trailing window
 * @param {number} prevRate    — rate from the previous window
 * @param {number} childCount  — direct causal children of this event (known at call time)
 */
// @hook c2237d17-ca86-4938-ba4c-83975cef1681  delta:computeEventDelta
export function computeEventDelta(ev, parent, parentDepth, recentGaps, recentRate, prevRate, childCount) {
  // ── Latency impact ────────────────────────────────────────────────────────
  const gap = parent ? (ev.eventTs - parent.eventTs) : 0;
  let latencyImpact = 0;
  if (recentGaps.length >= 3) {
    const mean = recentGaps.reduce((a, b) => a + b, 0) / recentGaps.length;
    const variance = recentGaps.reduce((s, g) => s + (g - mean) ** 2, 0) / recentGaps.length;
    const std = Math.sqrt(variance) || 1;
    latencyImpact = Math.max(0, (gap - mean) / std); // z-score, clamped to >=0
  }

  // ── Branch depth change ───────────────────────────────────────────────────
  const ownDepth = parentDepth + (parent ? 1 : 0);
  const branchDepthChange = ownDepth - parentDepth;

  // ── Throughput change ─────────────────────────────────────────────────────
  const throughputChange = prevRate > 0
    ? (recentRate - prevRate) / prevRate   // negative = slowdown
    : 0;

  // ── Fan-out anomaly ───────────────────────────────────────────────────────
  const fanOutExploding = childCount >= FAN_OUT_ALERT_THRESHOLD;
  const depthExploding  = ownDepth >= DEPTH_ALERT_THRESHOLD;

  // ── DOM storm contribution ────────────────────────────────────────────────
  const isDomStorm = ev.type === 'dom:unstable' &&
    ev.payload.classification === 'render_storm';

  // ── Instability score: composite 0..1 ────────────────────────────────────
  const latencyContrib    = Math.min(1, latencyImpact / 5);      // z>5 → max
  const fanOutContrib     = fanOutExploding ? 0.4 : 0;
  const depthContrib      = depthExploding  ? 0.3 : 0;
  const rateContrib       = throughputChange < -0.5 ? 0.3 : 0;  // >50% rate drop
  const domStormContrib   = isDomStorm ? 0.75 : 0;
  const alertContrib      = ev.type === 'alert:critical' ? 0.8 : 0;

  const instabilityScore = Math.min(1,
    latencyContrib + fanOutContrib + depthContrib +
    rateContrib + domStormContrib + alertContrib
  );

  // ── Anomaly type (most severe wins) ──────────────────────────────────────
  let anomalyType = null;
  if      (ev.type === 'alert:critical')       anomalyType = 'critical_alert';
  else if (isDomStorm)                         anomalyType = 'dom_storm';
  else if (depthExploding)                     anomalyType = 'depth_explosion';
  else if (fanOutExploding)                    anomalyType = 'fan_out';
  else if (rateContrib > 0)                    anomalyType = 'rate_collapse';
  else if (latencyContrib > 0.6)               anomalyType = 'latency_spike';

  return Object.freeze({
    eventId:           ev.id,
    eventType:         ev.type,
    eventTs:           ev.eventTs,
    seq:               ev.seq,
    gap,
    latencyImpact:     Math.round(latencyImpact * 1000) / 1000,
    branchDepthChange,
    ownDepth,
    throughputChange:  Math.round(throughputChange * 1000) / 1000,
    childCount,
    instabilityScore:  Math.round(instabilityScore * 1000) / 1000,
    isBottleneck:      instabilityScore >= BOTTLENECK_THRESHOLD,
    anomalyType,
  });
}

// ── Delta stream ─────────────────────────────────────────────────────────────

/**
 * Compute deltas for all events in an array.
 * O(n) pass — builds the full delta stream.
 *
 * @param {Event[]} events     — from kernel.getAll() or rangeView
 * @param {Function} findById  — kernel.findById
 * @param {Function} edgeMeta  — kernel.edgeMeta
 * @param {Function} getChildren — kernel.getChildren
 */
// @hook 67240917-2b71-4c71-b990-f70d8fb63815  delta:computeDeltaStream
export function computeDeltaStream(events, findById, edgeMeta, getChildren) {
  const deltas = new Array(events.length);
  const gapWindow = [];       // rolling gap buffer
  let prevRate = 0;
  let rateWindowStart = 0;

  // Build depth cache: eventId → depth
  const depthCache = new Map();

  function getDepth(ev) {
    if (depthCache.has(ev.id)) return depthCache.get(ev.id);
    if (!ev.causedBy) { depthCache.set(ev.id, 0); return 0; }
    const parent = findById(ev.causedBy);
    const d = parent ? getDepth(parent) + 1 : 1;
    depthCache.set(ev.id, d);
    return d;
  }

  for (let i = 0; i < events.length; i++) {
    const ev     = events[i];
    const parent = ev.causedBy ? findById(ev.causedBy) : null;
    const parentDepth = parent ? getDepth(parent) : 0;

    // Rolling gap window
    if (parent) {
      const gap = ev.eventTs - parent.eventTs;
      gapWindow.push(gap);
      if (gapWindow.length > LATENCY_WINDOW) gapWindow.shift();
    }

    // Rolling throughput rate (events per 1000 ticks)
    let recentRate = prevRate;
    if (i >= THROUGHPUT_WINDOW) {
      const windowEv = events[i - THROUGHPUT_WINDOW];
      const span = ev.eventTs - windowEv.eventTs;
      recentRate = span > 0 ? (THROUGHPUT_WINDOW / span) * 1000 : prevRate;
      if (i === THROUGHPUT_WINDOW) prevRate = recentRate;
    }

    // Child count at this moment
    const childCount = (getChildren(ev.id) || new Set()).size;

    deltas[i] = computeEventDelta(
      ev, parent, parentDepth,
      [...gapWindow], recentRate, prevRate,
      childCount
    );

    prevRate = recentRate;
  }

  return deltas;
}

// ── Bottleneck detector ───────────────────────────────────────────────────────

/**
 * Scan a delta stream for bottleneck zones.
 * A zone is a contiguous run of events where instabilityScore > threshold.
 *
 * Returns array of BottleneckZone objects sorted by severity descending.
 */
// @hook e3bb7a99-ec6a-4515-96a7-21e30b8bd1bd  delta:detectBottlenecks
export function detectBottlenecks(deltas, threshold = BOTTLENECK_THRESHOLD) {
  const zones = [];
  let zoneStart = -1;
  let zoneMaxScore = 0;
  let zoneTypes = new Set();

  function closeZone(endIdx) {
    if (zoneStart < 0) return;
    const span = deltas.slice(zoneStart, endIdx + 1);
    zones.push(Object.freeze({
      id:            newEventId(),
      startSeq:      span[0].seq,
      endSeq:        span[span.length - 1].seq,
      startEventTs:  span[0].eventTs,
      endEventTs:    span[span.length - 1].eventTs,
      eventCount:    span.length,
      maxInstability: Math.round(zoneMaxScore * 1000) / 1000,
      anomalyTypes:  [...zoneTypes],
      // Severity bucket
      severity:      zoneMaxScore >= 0.9 ? 'critical' :
                     zoneMaxScore >= 0.7 ? 'high' :
                     zoneMaxScore >= 0.5 ? 'medium' : 'low',
      deltaIndices:  { start: zoneStart, end: endIdx },
    }));
    zoneStart = -1;
    zoneMaxScore = 0;
    zoneTypes = new Set();
  }

  for (let i = 0; i < deltas.length; i++) {
    const d = deltas[i];
    if (d.instabilityScore >= threshold) {
      if (zoneStart < 0) zoneStart = i;
      if (d.instabilityScore > zoneMaxScore) zoneMaxScore = d.instabilityScore;
      if (d.anomalyType) zoneTypes.add(d.anomalyType);
    } else {
      closeZone(i - 1);
    }
  }
  closeZone(deltas.length - 1);

  return zones.sort((a, b) => b.maxInstability - a.maxInstability);
}

// ── Throughput timeline ───────────────────────────────────────────────────────

/**
 * Bucket events by wall-clock minute, compute per-bucket stats.
 * Returns array of { minute, count, avgInstability, bottleneckCount }
 * sorted chronologically.
 */
// @hook 728a38ea-5e0b-4389-a3b8-8f2b34c4bbad  delta:computeThroughputTimeline
export function computeThroughputTimeline(events, deltas) {
  const buckets = new Map(); // 'YYYY-MM-DD HH:MM' → stats

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const d  = deltas[i];
    const min = wallTsToMinute(ev.ts);

    if (!buckets.has(min)) {
      buckets.set(min, { minute: min, count: 0, totalInstability: 0, bottleneckCount: 0 });
    }
    const b = buckets.get(min);
    b.count++;
    b.totalInstability += d.instabilityScore;
    if (d.isBottleneck) b.bottleneckCount++;
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, b]) => Object.freeze({
      ...b,
      avgInstability: b.count > 0
        ? Math.round((b.totalInstability / b.count) * 1000) / 1000
        : 0,
    }));
}

// ── Zoom levels ───────────────────────────────────────────────────────────────

/**
 * Zoom level definitions:
 *   L0 — raw events (1:1)
 *   L1 — compressed causal chains (collapse linear A→B→C runs)
 *   L2 — macro patterns (show detected macros as nodes)
 *   L3 — system behaviour clusters (group by anomalyType + time window)
 *   L4 — fractal summaries (self-similar pattern nodes)
 */
// @hook ef133825-4823-4ad3-b156-4c16ac20ce3c  delta:ZOOM_LEVELS
export const ZOOM_LEVELS = Object.freeze({
  L0: 0,  // raw
  L1: 1,  // chains
  L2: 2,  // macros
  L3: 3,  // clusters
  L4: 4,  // fractal
});

/**
 * L1: Compress a linear causal chain (A→B→C→D where each has one causal child)
 * into a single chain node. Returns compressed event list.
 *
 * Compression rule: merge runs where every event has exactly one causal child
 * and one causal parent — unbranched sequences.
 */
// @hook 24ded596-d004-4c08-aa21-ee215fa87bf2  delta:compressToL1
export function compressToL1(events, getChildren, edgeMeta) {
  const compressed = [];
  const absorbed = new Set();

  for (const ev of events) {
    if (absorbed.has(ev.id)) continue;

    const kids  = getChildren ? getChildren(ev.id) : new Set();
    const edge  = edgeMeta ? edgeMeta(ev.id) : null;

    // Start of a potential linear chain: single causal child, no parent or has parent
    if (kids.size === 1) {
      const chainIds = [ev.id];
      let cur = [...kids][0];

      while (cur) {
        const curKids = getChildren(cur);
        chainIds.push(cur);
        absorbed.add(cur);
        if (curKids.size === 1) {
          cur = [...curKids][0];
        } else {
          break;
        }
      }

      if (chainIds.length > 1) {
        // Emit a chain node
        compressed.push(Object.freeze({
          _isChain:    true,
          id:          ev.id,           // chain identified by root ID
          chainIds,
          chainLength: chainIds.length,
          firstSeq:    ev.seq,
          type:        'chain:' + ev.type,
          source:      ev.source,
          eventTs:     ev.eventTs,
          ts:          ev.ts,
          seq:         ev.seq,
          causedBy:    ev.causedBy,
          payload:     { ...ev.payload, chainLength: chainIds.length },
        }));
        continue;
      }
    }

    compressed.push(ev);
  }

  return compressed;
}

/**
 * L2: Overlay macro pattern nodes onto the event list.
 * Each detected macro becomes a node positioned at its trigger seq.
 */
// @hook f86550cf-140f-4f57-895f-3dd125d977be  delta:overlayMacros
export function overlayMacros(events, macros) {
  if (!macros.length) return events;

  // Build lookup: triggerEventId → macro
  const macroByTrigger = new Map();
  for (const m of macros) macroByTrigger.set(m.triggerEventId, m);

  const result = [];
  for (const ev of events) {
    result.push(ev);
    const macro = macroByTrigger.get(ev.id);
    if (macro) {
      result.push(Object.freeze({
        _isMacroNode: true,
        id:           macro.id,
        type:         'macro:' + macro.pattern.split(' → ')[0],
        pattern:      macro.pattern,
        count:        macro.count,
        source:       'projection:macro',
        eventTs:      ev.eventTs + 0.5, // display after trigger
        ts:           ev.ts,
        seq:          ev.seq,
        causedBy:     ev.id,
        payload:      { pattern: macro.pattern, count: macro.count },
      }));
    }
  }
  return result;
}

/**
 * L3: Cluster events by anomaly type + time bucket.
 * Returns cluster nodes representing groups of problematic events.
 */
// @hook 060b1fc1-bbf7-4d27-8780-025609afd030  delta:clusterByAnomaly
export function clusterByAnomaly(events, deltas, ticksPerBucket = 500) {
  const clusterMap = new Map(); // 'anomalyType:bucketId' → cluster

  for (let i = 0; i < events.length; i++) {
    const d = deltas[i];
    if (!d || !d.anomalyType) continue;

    const bucketId = Math.floor(events[i].eventTs / ticksPerBucket);
    const key = d.anomalyType + ':' + bucketId;

    if (!clusterMap.has(key)) {
      clusterMap.set(key, {
        _isCluster:    true,
        id:            newEventId(),
        anomalyType:   d.anomalyType,
        bucketId,
        eventIds:      [],
        maxInstability: 0,
        firstTs:       events[i].ts,
        lastTs:        events[i].ts,
        firstEventTs:  events[i].eventTs,
        firstSeq:      events[i].seq,
        source:        'projection:cluster',
      });
    }

    const c = clusterMap.get(key);
    c.eventIds.push(events[i].id);
    if (d.instabilityScore > c.maxInstability) c.maxInstability = d.instabilityScore;
    if (events[i].ts > c.lastTs) c.lastTs = events[i].ts;
  }

  return [...clusterMap.values()]
    .map(c => Object.freeze({
      ...c,
      count:   c.eventIds.length,
      type:    'cluster:' + c.anomalyType,
      payload: { anomalyType: c.anomalyType, count: c.eventIds.length, maxInstability: c.maxInstability },
    }))
    .sort((a, b) => a.firstEventTs - b.firstEventTs);
}

// ── Fractal engine ────────────────────────────────────────────────────────────

/**
 * Detect self-similar subgraphs in the event stream.
 *
 * A fractal exists when a subgraph (by event type sequence + edge shape)
 * statistically resembles a higher-level pattern.
 *
 * Algorithm:
 *   1. Compute structural hash of every causal chain of length >= minChainLen
 *   2. Count occurrences of each hash
 *   3. Chains with occurrence >= minOccurrences are fractal candidates
 *   4. Score self-similarity as (actual_occurrences / expected_by_chance)
 *
 * Returns array of FractalNode objects.
 */
// @hook e3a6c710-7d0f-4997-8a2f-953f6568f730  delta:detectFractals
export function detectFractals(events, getChildren, edgeMeta, {
  minChainLen   = 3,
  minOccurrences = 3,
  maxChainLen   = 8,
} = {}) {
  const patternCounts = new Map(); // patternHash → { pattern, occurrences: [{rootId, ids}] }

  // Walk all chains of depth minChainLen..maxChainLen
  function chainHash(typeSeq) {
    return typeSeq.join('→');
  }

  function walkChains(startId, typeSeq, idSeq, depth) {
    if (depth > maxChainLen) return;

    // Record this chain if it meets minimum length
    if (typeSeq.length >= minChainLen) {
      const hash = chainHash(typeSeq);
      if (!patternCounts.has(hash)) {
        patternCounts.set(hash, {
          patternHash:  hash,
          typeSequence: [...typeSeq],
          chainLength:  typeSeq.length,
          occurrences:  [],
        });
      }
      patternCounts.get(hash).occurrences.push({ rootId: idSeq[0], ids: [...idSeq] });
    }

    // Extend chain via causal children only
    const kids = getChildren ? getChildren(startId) : new Set();
    for (const kidId of kids) {
      const edge = edgeMeta ? edgeMeta(kidId) : null;
      if (!edge || !['causal/explicit', 'causal/rule', 'causal/adapter'].includes(edge.edgeType)) continue;
      const kidEv = events.find(e => e.id === kidId);
      if (!kidEv) continue;
      walkChains(kidId, [...typeSeq, kidEv.type], [...idSeq, kidId], depth + 1);
    }
  }

  // Only start walks from root events (no causedBy)
  for (const ev of events) {
    if (ev.causedBy || ev.type.startsWith('system:')) continue;
    walkChains(ev.id, [ev.type], [ev.id], 1);
  }

  // Filter to candidates and build FractalNode objects
  const fractals = [];
  for (const [, p] of patternCounts) {
    if (p.occurrences.length < minOccurrences) continue;

    // Self-similarity score: how much more frequent than a uniform random baseline
    const totalEvents  = events.length || 1;
    const expectedRate = Math.pow(1 / Math.max(1, totalEvents), p.chainLength);
    const actualRate   = p.occurrences.length / totalEvents;
    const selfSimilarityScore = Math.min(1, actualRate / Math.max(expectedRate, 1e-10) / 1000);

    fractals.push(Object.freeze({
      id:                  newEventId(),
      patternHash:         p.patternHash,
      typeSequence:        p.typeSequence,
      chainLength:         p.chainLength,
      occurrenceCount:     p.occurrences.length,
      selfSimilarityScore: Math.round(selfSimilarityScore * 1000) / 1000,
      rootIds:             p.occurrences.map(o => o.rootId),
      // The first occurrence is the canonical example
      canonicalIds:        p.occurrences[0].ids,
    }));
  }

  return fractals.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

// ── Graph fork (causal branch on bottleneck) ──────────────────────────────────

/**
 * Create a parallel causal branch when a bottleneck is detected.
 *
 * The fork is an IMMUTABLE snapshot of the current graph state at the
 * moment of the bottleneck. The live graph is NEVER modified.
 *
 * This is the correct implementation of the fork model:
 *   - GraphBranch = parallel causal universe, not an edit
 *   - Original edges remain intact
 *   - Branch carries: reason, snapshotSeq, bottleneck zone reference
 *
 * Branches accumulate in the branch registry. Each can be independently
 * queried (traceToRoot, descendants) using its snapshot event set.
 *
 * @param {BottleneckZone} zone       — the triggering bottleneck zone
 * @param {Event[]} snapshotEvents    — kernel.getAll() at fork time
 * @param {number}  currentSeq        — kernel.clock.seq at fork time
 */
// @hook b70350bf-59b9-4589-9ed8-b72c26a244cc  delta:createGraphBranch
export function createGraphBranch(zone, snapshotEvents, currentSeq) {
  return Object.freeze({
    id:              newEventId(),
    type:            'graph-branch',
    forkReason:      zone.anomalyTypes.join('+') || 'bottleneck',
    forkSeq:         currentSeq,
    bottleneckZoneId: zone.id,
    severity:        zone.severity,
    snapshotEventCount: snapshotEvents.length,
    // Snapshot is indexed by ID for O(1) lookup within the branch
    snapshotIndex:   new Map(snapshotEvents.map(e => [e.id, e])),
    // Range of events in this branch
    firstSeq:        snapshotEvents[0]?.seq ?? 0,
    lastSeq:         snapshotEvents[snapshotEvents.length - 1]?.seq ?? 0,
    createdTs:       Date.now(),
  });
}

// ── Branch registry ───────────────────────────────────────────────────────────

/**
 * Registry that accumulates graph branches.
 * Read-only view into forked causal universes.
 */
// @hook a97b25f7-73e4-4cdf-9a86-f25a2bcdd8ff  delta:createBranchRegistry
export function createBranchRegistry() {
  const branches = [];

  function addBranch(branch) {
    branches.push(branch);
    return branch;
  }

  function getById(id) {
    return branches.find(b => b.id === id) || null;
  }

  function getAll() { return [...branches]; }

  function findEventInBranch(branchId, eventId) {
    const branch = getById(branchId);
    return branch ? (branch.snapshotIndex.get(eventId) || null) : null;
  }

  function clear() { branches.length = 0; }

  return {
    addBranch, getById, getAll, findEventInBranch, clear,
    get count() { return branches.length; },
  };
}
