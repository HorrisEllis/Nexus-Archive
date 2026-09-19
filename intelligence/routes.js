'use strict';
/**
 * intelligence/routes.js — the intelligence-domain HTTP routes that used to
 * be hosted by cortex/boot.js. §BUILT 2026-09-19.
 * docs/2026-09-19-cortex-to-intelligence-and-versionium-consolidation-
 * phasemap.spec (P2). James: "full move. each system needs to be sovereign.
 * if cortex going down breaks something, it needs to be moved."
 *
 * The faculty CODE already lived here (intuition.js, mastermind.js,
 * adversarial.js, spatial/system-lattice, liminal-space). Cortex was only the
 * composition root: it built the instances and injected its own state
 * (jaaDB, _field, taxonomy). This module is that composition root, moved.
 *
 * ROUTES OWNED (canonical paths; cortex's old paths are 410 tombstones):
 *   ANY  /api/intelligence/context            intelligence.getContext() + legacy cortex fields (additive)
 *   ANY  /api/intelligence/intuition
 *   ANY  /api/intelligence/mastermind
 *   ANY  /api/intelligence/mastermind/patterns
 *   ANY  /api/intelligence/adversarial
 *   ANY  /api/intelligence/rca
 *   ANY  /api/intelligence/query              (was /api/cortex/query)
 *   ANY  /api/intelligence/lattice            (was /api/cortex/lattice)
 *   GET  /api/intelligence/crystals           crystals-derived pattern list (cortex's old /patterns shape)
 *   GET  /api/liminal-space/status|list       (moved with the organ)
 *   POST /api/intelligence/bus                event intake for in-process organs (allowlisted)
 *
 * CONTRACT DECISIONS, each found by reading real callers, not assumed:
 *  - /context: the browser userscripts read ctx.failureModes / .reuse /
 *    .patterns[].actionable / .systemState — intelligence.getContext()'s
 *    contract. Cortex's handler shadowed it with {field,gaps,events,rca},
 *    none of which any caller reads, so buildContextHeader() returned ''
 *    on every prompt. The owner's contract wins; cortex's four fields are
 *    kept ADDITIVELY so nothing that might read them breaks.
 *  - /mastermind: cortex's live handler read body.context; a dead,
 *    unreachable duplicate (boot.js:988) read body.contextSnippet. Both are
 *    accepted here (context wins) so neither caller family is ignored.
 *  - /rca: ported as-is ({ok, rca:[...]}). orchestrator/lib/mcp-server.js
 *    reads d.findings with a different shape — a real caller bug, fixed at
 *    the caller in P4, not papered over here.
 *
 * LIMINAL-SPACE (moved 2026-09-19). Its routes read the in-process FOCAL_POINTS map,
 * which only init() + live bus events populate, so the ORGAN moved with them:
 * server.js init()s it on this process's bus, and POST /api/intelligence/bus
 * feeds it the events cortex used to deliver in-process.
 *
 * /api/intelligence/patterns is NOT here on purpose: intelligence/index.js
 * already serves it (bep_patterns shape — what MCP nexus_patterns and the
 * orchestrator CLI read). Copilot's four modules read the CRYSTALS shape
 * (precursor/outcome/count), so that shape gets its own honest path,
 * /api/intelligence/crystals, instead of one path serving two contracts.
 *
 * FRESHNESS (B2). jaaDB is 'one file per table, shared by convention, not
 * single-writer'. These faculties READ tables that other processes write
 * (gaps, event_log, crystals, sigma_records), so every read goes through a
 * throttled reloadTable(). Read-only by design: this module never writes.
 */
const MODULE_ID = 'intelligence.routes';

// Wrap jaaDB so reads see other processes' writes. Throttled per table.
function freshReader(jaaDB, refreshMs, now = Date.now) {
  const last = new Map();
  const refresh = (t) => {
    const n = now();
    if (n - (last.get(t) || 0) < refreshMs) return;
    last.set(t, n);
    try { jaaDB.reloadTable(t); } catch (_) { /* a missing table is an honest empty read */ }
  };
  return {
    tail:  (t, n)       => { refresh(t); return jaaDB.tail(t, n); },
    query: (t, w, o)    => { refresh(t); return jaaDB.query(t, w, o); },
    count: (t, w)       => { refresh(t); return jaaDB.count(t, w); },
  };
}

function createRoutes({ jaaDB, getField, intelligence, refreshMs = 1000, now = Date.now } = {}) {
  const db = freshReader(jaaDB, refreshMs, now);

  const { createIntuition }  = require('./intuition');
  const { createMastermind } = require('./mastermind');
  const adversarial          = require('./adversarial');

  let _taxonomy = null;
  const getTaxonomy = () => {
    if (_taxonomy !== null) return _taxonomy;
    try { _taxonomy = require('../lib/open-loop-taxonomy'); } catch (_) { _taxonomy = false; }
    return _taxonomy;
  };
  let _sysLattice = null;
  const getSystemLattice = () => {
    if (_sysLattice !== null) return _sysLattice;
    try { _sysLattice = require('./spatial/system-lattice'); } catch (_) { _sysLattice = false; }
    return _sysLattice;
  };
  let _CausalGraph = null;
  const getCausalGraphClass = () => {
    if (_CausalGraph !== null) return _CausalGraph;
    try { _CausalGraph = require('./cfr/graph').CausalGraph; } catch (_) { _CausalGraph = false; }
    return _CausalGraph;
  };

  // crystals-derived pattern list: an INTERNAL dependency of intuition (kept
  // exactly as cortex built it). Not what GET /api/intelligence/patterns
  // serves — that is intelligence/index.js's bep_patterns index, which is what
  // every real caller (MCP nexus_patterns, orchestrator CLI) reads.
  function buildPatterns(limit = 5) {
    const crystals = db.tail('crystals', 50);
    if (!crystals.length) return []; // honest empty, not a fabricated fallback
    return crystals
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
  }

  function buildRCA(limit = 5) {
    const gaps = db.query('gaps', { status: 'open' }, { orderBy: 'ts', order: 'DESC', limit });
    return gaps.map(g => ({
      gapId: g.id, type: g.type || 'unknown', cause: g.root_cause || 'unresolved',
      since: g.ts, sigma: getField().entropy,
    }));
  }

  const intuition  = createIntuition({ jaaDB: db, getField, getTaxonomy, getSystemLattice, buildPatterns });
  const mastermind = createMastermind({ jaaDB: db, getField, getCausalGraphClass });

  function contextSnapshotLegacy() {
    const recent = db.tail('event_log', 10).map(e => e.type).join(', ');
    const gaps   = db.count('gaps', { status: 'open' }) || 0;
    return { field: { ...getField() }, gaps: { open: gaps }, events: { recent: recent || 'none' }, rca: buildRCA(3) };
  }

  const OWNED = new Set([
    '/api/intelligence/context', '/api/intelligence/intuition', '/api/intelligence/mastermind',
    '/api/intelligence/mastermind/patterns', '/api/intelligence/adversarial', '/api/intelligence/rca',
    '/api/intelligence/query', '/api/intelligence/lattice', '/api/intelligence/crystals',
  ]);
  const liminal = require('./liminal-space');
  const nexusBus = require('../nexus/nexus-bus');
  const owns = (method, pathname) => {
    if (pathname === '/api/liminal-space/status' || pathname === '/api/liminal-space/list') return method === 'GET';
    if (pathname === '/api/intelligence/bus') return method === 'POST';
    return OWNED.has(pathname);
  };

  // handle(method, pathname, sp, body, json) — json(status, data), the same
  // callback shape intelligence/index.js's handleRequest() already uses.
  async function handle(method, pathname, sp, body, json) {
    body = body || {};
    sp = sp || new URLSearchParams();

    if (pathname === '/api/intelligence/context') {
      const intent   = sp.get('intent')   || '';
      const command  = sp.get('command')  || '';
      const provider = sp.get('provider') || '';
      const ctx = intelligence.getContext({ intent, command, provider });
      json(200, { ok: true, ...ctx, ...contextSnapshotLegacy(), intent: ctx.intent ?? (intent || 'general'), ts: Date.now() });
      return true;
    }

    if (pathname === '/api/intelligence/intuition') {
      json(200, intuition.answer(body.prompt || sp.get('prompt') || ''));
      return true;
    }

    if (pathname === '/api/intelligence/mastermind') {
      const prompt  = body.prompt ?? sp.get('prompt') ?? '';
      const context = body.context ?? body.contextSnippet;
      json(200, mastermind.analyze(prompt, context));
      return true;
    }

    if (pathname === '/api/intelligence/mastermind/patterns') {
      const limit = Number(body.limit ?? sp.get('limit')) || 300;
      const opts = { minChainLen: body.minChainLen, minOccurrences: body.minOccurrences };
      const result = await mastermind.detectRecurringPatterns(limit, opts);
      json(200, result || { ok: true, patternsFound: 0, patterns: [], reason: 'no causal graph available yet' });
      return true;
    }

    if (pathname === '/api/intelligence/adversarial') {
      const i = intuition.answer(body.prompt);
      const m = mastermind.analyze(body.prompt, body.context ?? body.contextSnippet);
      json(200, { intuition: i, mastermind: m, adversarial: adversarial.compareCortexFaculties(i, m) });
      return true;
    }

    if (pathname === '/api/intelligence/rca') {
      json(200, { ok: true, rca: buildRCA(parseInt(sp.get('limit') || '5', 10)) });
      return true;
    }

    if (pathname === '/api/intelligence/lattice') {
      const about = sp.get('about');
      try {
        const sysLattice = require('./spatial/system-lattice');
        if (about) json(200, { ok: true, about, neighbors: sysLattice.neighbors(about), size: sysLattice.size() });
        else       json(200, { ok: true, clusters: sysLattice.clusters(), size: sysLattice.size() });
      } catch (e) {
        // 1.2 — an unavailable lattice is reported, never a fabricated empty success.
        json(503, { ok: false, error: `system-lattice unavailable: ${e.message}` });
      }
      return true;
    }

    if (pathname === '/api/liminal-space/status') { json(200, liminal.status()); return true; }
    if (pathname === '/api/liminal-space/list') {
      json(200, { ok: true, items: liminal.list(sp.get('focalPoint') || undefined) });
      return true;
    }

    // Event intake for organs that live in this process (liminal-space). Cortex
    // relays the events it emits here; producers elsewhere may post directly.
    // Allowlist = the organ's own declared subscription list, so this cannot be
    // used to inject arbitrary events onto the bus.
    if (pathname === '/api/intelligence/bus') {
      const type = body && body.type;
      if (!type || !liminal.SUBSCRIBED_EVENTS.includes(type)) {
        json(400, { ok: false, error: `event type not accepted: ${type}`, accepted: liminal.SUBSCRIBED_EVENTS });
        return true;
      }
      nexusBus.emit(type, body.payload || {}, { source: body.source || 'relay', causedBy: body.causedBy || null });
      json(200, { ok: true });
      return true;
    }

    if (pathname === '/api/intelligence/crystals') {
      json(200, { ok: true, patterns: buildPatterns(parseInt(sp.get('limit') || '5', 10)) });
      return true;
    }

    if (pathname === '/api/intelligence/query') {
      const jaaDB = db; // the query body below reads jaaDB.tail(); route it through the freshness wrapper
      const about  = sp.get('about') || '';
      const window = parseInt(sp.get('window') || '3600000');
      const since  = Date.now() - window;
      if (!about) { json(400, { ok:false, error:'about param required' }); return true; }

      const needle = about.toLowerCase();
      const hay = (v) => {
        if (v == null) return '';
        return (typeof v === 'string' ? v : JSON.stringify(v)).toLowerCase();
      };
      const matches = (row, fields) => fields.some(f => hay(row[f]).includes(needle));

      let gaps = [];
      try {
        gaps = jaaDB.tail('gaps', 500)
          .filter(g => (g.ts || 0) >= since)
          .filter(g => matches(g, ['domain', 'type', 'description', 'reason', 'source']))
          .slice(0, 50);
      } catch (_) {}

      let events = [];
      try {
        events = jaaDB.tail('event_log', 500)
          .filter(e => (e.ts || 0) >= since)
          .filter(e => matches(e, ['type', 'source', 'payload']))
          .slice(0, 50);
      } catch (_) {}

      let sigma = { records: [], note: null };
      try {
        const rows = jaaDB.tail('sigma_records', 200).filter(s => (s.ts || 0) >= since);
        if (!rows.length) {
          sigma.note = 'sigma_records table empty in this window — sigma-writer may not be running against live traffic yet';
        } else {
          const subjectRows = rows.filter(s => matches(s, ['source', 'type', 'eventType']));
          sigma.records = (subjectRows.length ? subjectRows : rows).slice(0, 20);
          if (!subjectRows.length) sigma.note = `no sigma_records matched '${about}' directly — showing recent system-wide records instead`;
        }
      } catch (_) { sigma.note = 'sigma_records table not queryable'; }

      let field = null;
      try { field = { ...getField(), _note: 'system-wide CFR field snapshot, not scoped to this subject specifically' }; } catch (_) {}

      let blueprint = [];
      try {
        const bp = require('../lib/blueprint').load?.();
        if (bp) {
          const text = JSON.stringify(bp).toLowerCase();
          if (text.includes(needle)) blueprint = [{ note: 'subject appears in current blueprint — full divergence diffing not implemented, this is presence-only', found: true }];
        }
      } catch (_) {}

      const commits = [];
      const commitsNote = 'not built — no Versionium commit-tracking implementation exists in this tree (confirmed by grep; only docs/specs/VERSIONIUM.spec.md, no .js source)';

      const labs = [];
      const labsNote = 'not built — no LabSession tracking matching this spec exists (cos/playground/llm-lab.js and eravos edm-lab are unrelated systems)';

      // Narrative — factual summary of what THIS query found, plus
      // mastermind's own causal-trace/regime analysis (which queries global
      // open gaps, not filtered to `about` — a real mismatch worth stating
      // rather than silently blending the two into one falsely-unified voice).
      const factualLine = `Found ${gaps.length} gap(s) and ${events.length} event(s) matching '${about}' in the last ${Math.round(window/60000)} minutes.` +
        (sigma.note ? ` ${sigma.note}.` : ` ${sigma.records.length} sigma record(s) in window.`);
      let mastermindLine = '';
      try { mastermindLine = mastermind.analyze(about, factualLine)?.analysis || ''; } catch (_) {}

      const result = {
        about, window, since, ts: Date.now(),
        gaps, sigma, field, events, blueprint,
        commits, labs,
        narrative: `${factualLine} ${mastermindLine}`.trim(),
        _scope_note: 'Keyword resolution is exact/substring only (spec build_order item 2, fuzzy resolution, not built). commits/labs are stubbed empty — see commits._note/labs._note.',
        commits_note: commitsNote,
        labs_note: labsNote,
      };
      json(200, { ok: true, ...result });
      return true;
    }

    return false;
  }

  // system-lattice is a PER-PROCESS singleton. Cortex used to load() + feed it
  // every 60s in cortex's own process; served from here it would go stale, so
  // the feeder moves with the route (see cortex/boot.js: removed).
  let _latticeTimer = null;
  function startLatticeFeed(intervalMs = 60000) {
    if (_latticeTimer) return;
    try {
      const sysLattice = require('./spatial/system-lattice');
      sysLattice.load();
      const feed = () => {
        try {
          const graph = mastermind.buildRecentCausalGraph();
          if (graph) sysLattice.ingestCFRGraph(graph);
        } catch (e) { console.warn(`[${MODULE_ID}] system-lattice feed failed: ${e.message}`); }
      };
      feed();
      _latticeTimer = setInterval(feed, intervalMs);
      if (_latticeTimer.unref) _latticeTimer.unref();
    } catch (e) { console.warn(`[${MODULE_ID}] system-lattice not available: ${e.message}`); }
  }
  function stopLatticeFeed() { if (_latticeTimer) { clearInterval(_latticeTimer); _latticeTimer = null; } }

  return { owns, handle, buildRCA, buildPatterns, intuition, mastermind, startLatticeFeed, stopLatticeFeed, MODULE_ID };
}

module.exports = { createRoutes, freshReader, MODULE_ID };
