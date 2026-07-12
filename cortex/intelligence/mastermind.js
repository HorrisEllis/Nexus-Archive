'use strict';
/**
 * cortex/intelligence/mastermind.js — MASTERMIND faculty
 * UUID: nexus-cortex-mastermind-v1-0000-2026-0706-jamesbrooks-001
 * Spec: docs/cortex-dual-cognition.spec
 *
 * "Strategic, predictive, causal... source: what the system can derive
 * from evidence." Answers "if this is true, what follows?" — the
 * opposite question from Intuition's "what does this resemble?".
 * Deliberately kept in a separate file with its own memory read (the
 * causal graph), not sharing Intuition's crystal-lattice/taxonomy reads.
 *
 * §STRUCTURED-FIELDS 2026-07-06 — added gapCount/tracedCount/untracedCount
 * alongside the existing prose `analysis` string. Adversarial (the third
 * faculty, cortex/intelligence/adversarial.js) needs to compare Intuition
 * and Mastermind's reads programmatically; regex-parsing English sentences
 * out of `analysis` would be fragile and dishonest precision. These fields
 * are the same data the prose is built from, just also exposed structured.
 */

function createMastermind({ jaaDB, getField, getCausalGraphClass }) {
  function buildRecentCausalGraph(limit = 300) {
    const CausalGraph = getCausalGraphClass();
    if (!CausalGraph) return null;
    const graph = new CausalGraph();
    const events = jaaDB.tail('event_log', limit);
    for (const e of events) graph.ingest(e);
    return graph;
  }

  function analyze(prompt, contextSnippet) {
    const gaps   = jaaDB.query('gaps', { status: 'open' }, { limit: 3 });
    const _field = getField();
    const regime = _field.regime;
    const lines  = [
      `Causal field: regime=${regime}, coherence=${_field.coherence.toFixed(2)}, entropy=${_field.entropy.toFixed(2)}.`,
    ];

    let tracedCount = 0, untracedCount = 0;

    if (gaps.length) {
      const graph = buildRecentCausalGraph();
      const traces = [];
      const untraced = [];
      if (graph) {
        // ingest() overwrites nodes unconditionally — only fill in a gap
        // as a node when nothing richer (a real causedBy chain from
        // event_log) is already there. See git history for the clobber
        // bug this guards against.
        for (const g of gaps) {
          if (!graph.nodes.has(g.id)) {
            graph.ingest({ uuid: g.id, id: g.id, ts: g.ts, type: g.type, causedBy: g.causedBy || null, source: g.source });
          }
        }
        for (const g of gaps) {
          const chain = graph.ancestors(g.id, 8);
          if (chain.length > 1) {
            traces.push(`Root-cause trace for '${g.type || g.id}': ${chain.map(e => e.type || e.id).join(' \u2192 ')}.`);
          } else {
            untraced.push(g.type || g.id);
          }
        }
      } else {
        untraced.push(...gaps.map(g => g.type || g.id));
      }
      tracedCount = traces.length;
      untracedCount = untraced.length;
      lines.push(...traces);
      if (untraced.length) lines.push(`Open issues (no traced cause) (${untraced.length}): ${untraced.join(', ')}.`);
    } else {
      lines.push('No open issues.');
    }

    if (contextSnippet) lines.push(`Context: ${String(contextSnippet).slice(0, 200)}`);

    return {
      ok: true,
      analysis: lines.filter(Boolean).join(' '),
      regime,
      field: { ..._field },
      modelUsed: 'cortex.mastermind',
      gapCount: gaps.length,
      tracedCount,
      untracedCount,
    };
  }

  return { analyze, buildRecentCausalGraph, detectRecurringPatterns };

  /**
   * §RFR2 WIRE 2026-07-09 — the one defensible rfr2 sub-engine wire.
   * delta.detectFractals finds recurring causal SHAPES (type→type→type
   * sequences occurring ≥N times) — a real question mastermind's
   * ancestor-tracing cannot answer today ("is this failure a one-off or
   * a recurring pattern"). Loads delta through the real rfr2-bridge
   * (async ESM→CJS import) — the bridge's first live consumer, proving
   * it. Honest degrade: any failure (bridge missing, ESM import error,
   * empty graph) returns null; mastermind's existing output is untouched.
   * Async because the ESM import is; callers that only want the sync
   * analyze() are unaffected.
   */
  async function detectRecurringPatterns(limit = 300, opts = {}) {
    try {
      const graph = buildRecentCausalGraph(limit);
      if (!graph || graph.nodes.size < 3) return null;

      const { loadRFR2Module } = require('../../lib/rfr2-bridge.js');
      const delta = await loadRFR2Module('delta');
      if (!delta?.detectFractals) return null;

      // Adapt CausalGraph → detectFractals's expected inputs. events need
      // {id, type}; getChildren(id) → child ids; edgeMeta(id) → {edgeType}.
      // CausalGraph edges are {from,to,type}; map its 'causal' type to the
      // 'causal/explicit' class detectFractals walks. Honest: only real
      // edges are surfaced, none fabricated.
      const events = [...graph.nodes.entries()].map(([id, n]) => ({
        id, type: n.type || n.payload?.type || 'unknown', causedBy: n.causedBy || null,
      }));
      const childMap = new Map();
      const edgeType = new Map();
      for (const e of graph.edges) {
        // Only real causal edges form the chain graph. CausalGraph also
        // adds 'type-sequence'/temporal edges — those are NOT causal
        // parentage and must not pollute getChildren or the edge-type
        // map (they were silently breaking chain detection: a temporal
        // edge to the same node overwrote its causal classification).
        if (e.type !== 'causal' && !e.type?.startsWith('causal')) continue;
        if (!childMap.has(e.from)) childMap.set(e.from, new Set());
        childMap.get(e.from).add(e.to);
        edgeType.set(e.to, 'causal/explicit');
      }
      const getChildren = (id) => childMap.get(id) || new Set();
      const edgeMeta    = (id) => ({ edgeType: edgeType.get(id) || 'unknown' });

      const fractals = delta.detectFractals(events, getChildren, edgeMeta, {
        minChainLen:    opts.minChainLen    ?? 3,
        minOccurrences: opts.minOccurrences ?? 2,
      });
      const recurring = (fractals || []).filter(f => (f.occurrenceCount || 0) >= (opts.minOccurrences ?? 2));
      return {
        ok: true,
        patternsFound: recurring.length,
        patterns: recurring.map(f => ({
          sequence: f.typeSequence?.join(' → '),
          occurrences: f.occurrenceCount || 0,
          chainLength: f.chainLength,
          selfSimilarity: f.selfSimilarityScore,
        })),
      };
    } catch (_) {
      return null; // honest degrade — existing mastermind output unaffected
    }
  }
}

module.exports = { createMastermind };
