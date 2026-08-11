'use strict';
/**
 * cortex/boot.js — NEXUS Cortex Service v3.0.0
 * UUID: nexus-cortex-boot-v3-0000-2026-0628-001
 * Port: 3748
 *
 * The cortex is NEXUS's memory + intelligence layer. Every other system
 * reads from and writes to cortex. It is the single source of truth for:
 *   - JAA persistent memory (all tables: chat_log, gaps, artifacts, events…)
 *   - CFR field state (coherence, friction, entropy, regime)
 *   - RAID routing decisions
 *   - Intelligence (patterns, RCA, intuition, mastermind)
 *   - Gap management
 *   - Event log
 *   - Self-heal status
 *   - Snapshots
 *
 * Rebuilt from scratch — cortex/boot.js was absent from the uploaded zip.
 * All routes are inferred from every caller across the codebase.
 *
 * Routes (alphabetical):
 *   GET  /health                         — liveness
 *   GET  /cfr/health                     — CFR field state
 *   GET  /cfr/field                      — CFR field (orchestrator poll)
 *   GET  /api/health                     — alias /health
 *   POST /api/event                      — ingest event to event_log
 *   GET  /api/events                     — query event_log
 *   GET  /api/friction                   — current friction value
 *   GET  /api/gaps                       — query gaps table
 *   POST /api/gaps                       — insert gap
 *   GET  /api/failure-modes              — list failure mode entries
 *   GET  /api/intelligence/context       — assembled context snapshot
 *   GET  /api/intelligence/intuition     — fast intuition answer
 *   POST /api/intelligence/intuition     — same, POST body
 *   POST /api/intelligence/mastermind    — causal analysis
 *   POST /api/intelligence/mastermind/patterns — recurring causal-shape detection (RFR2 delta engine)
 *   POST /api/intelligence/adversarial   — inner-critic: scores & reconciles intuition vs mastermind
 *   GET  /api/intelligence/patterns      — pattern log
 *   GET  /api/intelligence/rca           — root cause analysis entries
 *   GET  /api/intelligence/status        — intelligence subsystem health
 *   GET  /api/jaa/:table                 — query any JAA table (safe read)
 *   POST /api/push                        — real Unified API write (cortex/push-recall.js)
 *   GET/POST /api/recall                  — real Unified API read, 2 of 5 lanes (lexical+recency)
 *   GET  /api/memory                     — query memory table
 *   POST /api/memory/insert              — insert to memory table
 *   POST /api/memory/forget              — delete from memory table
 *   GET  /api/memory/working             — working memory set
 *   POST /api/meta/observe               — meta observation ingest
 *   GET  /api/raid/decide                — RAID agent routing decision
 *   POST /api/raid/feedback              — RAID outcome feedback
 *   GET  /api/self-heal/status           — self-heal queue status
 *   GET  /api/snapshot                   — latest system snapshot
 *   GET  /api/snapshots                  — list snapshots
 *   POST /api/snapshot                   — write snapshot
 *   POST /api/table/insert               — generic table insert
 *   GET  /api/cli/exec                   — CLI command exec (internal)
 *   GET  /api/replay/inspect             — replay inspector
 *   GET  /api/settings.js               — settings table (deprecated path)
 *   GET  /api/n=:n                       — compat alias for event query
 */

const http   = require('http');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');

const PORT    = parseInt(process.env.NEXUS_PORT || '3748');
const OR_URL  = process.env.ORCH_URL || 'http://127.0.0.1:9000';
const GD_URL  = process.env.GUARDIAN_URL || 'http://127.0.0.1:7820';
const OL_URL  = process.env.OLLAMA_URL   || 'http://127.0.0.1:3749';

const ROOT    = path.join(__dirname, '..');
const VERSION = '3.0.0';
const SYSTEM  = 'cortex';

// ── JAA memory store ──────────────────────────────────────────────────────────
const { jaaDB, uid } = require('./memory/jaa-db');
// §GAP CLOSED 2026-07-19 — nexus-bus.js already existed at repo root, already
// documented as "the common event fabric," and other systems (guardian,
// orchestrator) were already POSTing to cortex's /api/event with it in mind
// — but this file never required it, so nothing arriving at /api/event ever
// reached an in-process listener. Fixed at the two points below.
const bus = require('../nexus-bus');
let _openLoopTaxonomy = null;
function _getTaxonomy() {
  if (_openLoopTaxonomy !== null) return _openLoopTaxonomy;
  try { _openLoopTaxonomy = require('../lib/open-loop-taxonomy'); } catch (_) { _openLoopTaxonomy = false; }
  return _openLoopTaxonomy;
}
let _sysLattice = null;
function _getSystemLattice() {
  if (_sysLattice !== null) return _sysLattice;
  try { _sysLattice = require('../meta/spatial/system-lattice'); } catch (_) { _sysLattice = false; }
  return _sysLattice;
}
let _CausalGraph = null;
function _getCausalGraphClass() {
  if (_CausalGraph !== null) return _CausalGraph;
  try { _CausalGraph = require('../meta/cfr/graph').CausalGraph; } catch (_) { _CausalGraph = false; }
  return _CausalGraph;
}

// ── Intelligence: three real faculties, per docs/cortex-dual-cognition.spec ──
// §SPLIT 2026-07-06 — _intuitionAnswer/_mastermindAnalysis used to be
// inline functions here. Pulled into cortex/intelligence/{intuition,
// mastermind}.js — the spec's own intended paths — with Adversarial as a
// real third faculty (new, extends the spec's one-line "contradiction =
// gap" with scoring + reconciliation). boot.js is the composition root:
// it owns jaaDB/_field/the causal-graph class and wires them in, each
// faculty file stays independently requirable and testable.
const { createIntuition }  = require('./intelligence/intuition');
const { createMastermind } = require('./intelligence/mastermind');
const adversarial          = require('./intelligence/adversarial');

const _intuition  = createIntuition({
  jaaDB, getField: () => _field, getTaxonomy: _getTaxonomy,
  getSystemLattice: _getSystemLattice, buildPatterns: (n) => _buildPatterns(n),
});
const _mastermind = createMastermind({ jaaDB, getField: () => _field, getCausalGraphClass: _getCausalGraphClass });

// §GAP CLOSED 2026-07-06: the spec's "Unified API" (cortex.push/recall,
// intent IR, 5-lane MQL) was 100% documentation, 0% code — confirmed by
// reading this file's actual /api/memory/insert handler, which was a raw
// {table,row} passthrough with no validation. cortex/push-recall.js is
// the real implementation (2 of 5 lanes honestly — lexical + recency;
// causal/failure/BEP need structures that don't exist yet, see that
// file's header), tested standalone before being wired here. Adapter
// below maps its {insert,tail,all} expectation onto jaaDB's real
// {insert(table,row), tail(table,n)} signature, targeting one fixed
// table ('memory_unified') so push/recall don't scatter across whatever
// table name a caller feels like typing — the exact problem raw
// {table,row} passthrough caused everywhere else.
const { CortexPushRecall } = require('./push-recall.js');
const _pushRecall = new CortexPushRecall({
  store: {
    insert: (row) => jaaDB.insert('memory_unified', row),
    all:    () => jaaDB.tail('memory_unified', 10_000),
  },
});

// Ensure data dirs exist
['data/cortex/memory', 'data/cortex/ledger', 'data/snapshots'].forEach(d => {
  fs.mkdirSync(path.join(ROOT, d), { recursive: true });
});

// ── CFR field state — lightweight in-memory implementation ───────────────────
// Full CFR (lib/cfr/) is wired in orchestrator. Cortex keeps a HTTP-readable
// copy so copilot-context Layer 4 and the cfr-influence poller can read it.
let _field = {
  coherence:  0.6,
  friction:   0.2,
  resonance:  0.3,
  entropy:    0.2,
  tension:    0.1,
  regime:     'stable',
  updatedAt:  Date.now(),
};

// Receive CFR updates from orchestrator (POST /cfr/field)
function _updateField(patch) {
  _field = { ..._field, ...patch, updatedAt: Date.now() };
  // Compute regime
  if (_field.entropy > 0.65 || _field.friction > 0.6) _field.regime = 'chaotic';
  else if (_field.coherence > 0.75 && _field.friction < 0.3) _field.regime = 'ordered';
  else _field.regime = 'stable';
}

// ── RAID state ────────────────────────────────────────────────────────────────
// Lightweight routing table — full RAID is in cortex/core/raid (when present)
const _raidHealth = { ollama: 100, guardian: 100, claude: 80, chatgpt: 75 };
const _raidDecisions = [];

function _raidDecide(intent, cfrCtx = {}) {
  const sigma = cfrCtx.sigmaFloor || 0;
  const regime = cfrCtx.regime || _field.regime;

  // LAW I: Ollama first when healthy and regime is not chaotic
  const candidates = Object.entries(_raidHealth)
    .filter(([, h]) => h >= 50)
    .sort(([, a], [, b]) => b - a);

  // In chaotic regime, prefer faster providers
  const agentOrder = regime === 'chaotic'
    ? ['ollama', 'guardian', 'claude', 'chatgpt']
    : candidates.map(([k]) => k);

  const agent  = agentOrder[0] || 'ollama';
  const reason = `health=${_raidHealth[agent]} regime=${regime} sigma=${sigma.toFixed(3)}`;

  const decision = { agent, reason, intent: String(intent).slice(0, 100),
    sigma, regime, ts: Date.now(), id: uid() };
  _raidDecisions.unshift(decision);
  if (_raidDecisions.length > 200) _raidDecisions.length = 200;

  return decision;
}

// ── Patterns + RCA ───────────────────────────────────────────────────────────
function _buildPatterns(limit = 5) {
  // §GAP CLOSED 2026-07-06 — traced from the user's own description
  // ("pattern engine migrated to intuition"): copilot/intuition.js has
  // called this exact endpoint expecting {precursor, outcome, count,
  // confidence} since it was written — but this function used to just
  // tally event_log types, producing {type, count, lastSeen} instead.
  // Every field intuition.js reads off a returned pattern (p.precursor,
  // p.outcome, p.confidence) was undefined against the old shape,
  // meaning "Crystallised patterns" output has always rendered as
  // "undefined → undefined (NaN%)" whenever this path fired. The real
  // pattern engine is meta/crystal-lattice.js — it writes real
  // (domain, verb, outcome) crystals to the 'crystals' JAA table once a
  // pattern repeats past PATTERN_FREQUENCY_THRESHOLD times, already
  // wired into orchestrator.js via lib/compartment-engine.js. This reads
  // that real table instead of re-deriving a shallower stand-in.
  const crystals = jaaDB.tail('crystals', 50);
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

function _buildRCA(limit = 5) {
  const gaps = jaaDB.query('gaps', { status: 'open' }, { orderBy: 'ts', order: 'DESC', limit });
  return gaps.map(g => ({
    gapId:  g.id,
    type:   g.type || 'unknown',
    cause:  g.root_cause || 'unresolved',
    since:  g.ts,
    sigma:  _field.entropy,
  }));
}

// ── Intelligence: intuition (fast pattern answer) ────────────────────────────
// Real logic now lives in cortex/intelligence/intuition.js — kept as a
// thin wrapper here so existing callers/exports/tests are unaffected.
function _intuitionAnswer(prompt) {
  return _intuition.answer(prompt);
}

// ── Intelligence: mastermind (causal analysis) ────────────────────────────────
// Real logic now lives in cortex/intelligence/mastermind.js.
function _mastermindAnalysis(prompt, contextSnippet) {
  return _mastermind.analyze(prompt, contextSnippet);
}

// ── Intelligence: adversarial (inner critic) ─────────────────────────────────
// Runs both faculties, then has Adversarial score and (where possible)
// reconcile them, per this session's extension of the one-line spec.
function _adversarialCompare(prompt, contextSnippet) {
  const intuitionResult  = _intuition.answer(prompt);
  const mastermindResult = _mastermind.analyze(prompt, contextSnippet);
  const verdict = adversarial.compareCortexFaculties(intuitionResult, mastermindResult);
  return { intuition: intuitionResult, mastermind: mastermindResult, adversarial: verdict };
}

// ── Assembled context snapshot (copilot Layer 2 reads this) ──────────────────
function _contextSnapshot(intent) {
  const recent = jaaDB.tail('event_log', 10).map(e => e.type).join(', ');
  const gaps   = jaaDB.count('gaps', { status: 'open' }) || 0;
  return {
    ok:      true,
    intent:  intent || 'general',
    field:   { ..._field },
    gaps:    { open: gaps },
    events:  { recent: recent || 'none' },
    rca:     _buildRCA(3),
    ts:      Date.now(),
  };
}

// ── Working memory ────────────────────────────────────────────────────────────
// (working memory is now backed by the real `working_memory` JAA table —
// see cortex/memory/decay.js and the /api/memory/working route below)

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const method = req.method;
  const p      = url.pathname;

  if (method === 'OPTIONS') { json(res, 200, {}); return; }

  // ── Health ──────────────────────────────────────────────────────────────
  // ── Contract — orchestrator polls this to verify cortex is spec-compliant ──
  if (p === '/contract' && method === 'GET') {
    try {
      const c = require('fs').readFileSync(require('path').join(__dirname, 'interaction-contract.json'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(c);
    } catch(e) {
      json(res, 500, { ok: false, error: 'interaction-contract.json missing' });
    }
    return;
  }

    if (p === '/health' || p === '/api/health') {
    json(res, 200, { ok: true, system: SYSTEM, version: VERSION, port: PORT,
      field: _field, uptime: process.uptime(), ts: Date.now() });
    return;
  }

  // ── CFR field ───────────────────────────────────────────────────────────

  // ── Nerve snapshot — §5.7 sovereign consumer pattern ─────────────────────────
  // Clear Glass (the browser) fetches this URL as any browser consumer fetches
  // /cfr/field — no direct import between sibling systems. Versionium owns
  // snapshot/commit/replay; this route exposes Nerve's attention-layer read
  // surface over HTTP so the expression layer (alk-gl.js) can pull it without
  // any module coupling between Clear Glass and lib/nerve/.
  if (p === '/nerve/snapshot' && method === 'GET') {
    try {
      const nerve = require('../lib/nerve/index.js');
      json(res, 200, { ok: true, ...nerve.getSnapshot() });
    } catch (e) {
      json(res, 500, { ok: false, error: 'nerve read failed: ' + e.message });
    }
    return;
  }

  if (p === '/cfr/health' || p === '/cfr/field') {
    if (method === 'POST') {
      const body = await readBody(req);
      _updateField(body);
      json(res, 200, { ok: true, field: _field });
    } else {
      json(res, 200, { ok: true, ..._field, ts: Date.now() });
    }
    return;
  }

  // ── Hooks/wires summary — relational pressure feed ────────────────────────
  // §pressure-system fix 2026-06-30 — this is the route
  // ui/tv-shell/spotlight/spotlight.js's wireRelationalTension() has been
  // calling since it was written, with no real endpoint behind it
  // (logged honestly as dead in the code at the time). hooks/index.js's
  // data was always real — 80 hooks across 10 systems — it just was never
  // exposed over HTTP. This is the missing piece, not new data.
  if (p === '/hooks/summary' && method === 'GET') {
    try {
      const hooks = require('../hooks/index.js');
      json(res, 200, {
        ok: true,
        summary: hooks.summary(),
        wires: hooks.allHooks()
          .filter(h => h.type === 'event-bus' || h.type === 'stream')
          .map(h => ({ id: h.id, from: h.from, to: h.to, type: h.type, seam: h.seam, status: h.status })),
      });
    } catch (e) {
      json(res, 500, { ok: false, error: `hooks/index.js failed to load: ${e.message}` });
    }
    return;
  }

  // ── Events ──────────────────────────────────────────────────────────────
  if (p === '/api/event' && method === 'POST') {
    const body = await readBody(req);
    const row = { id: uid(), type: body.type || 'unknown',
      payload: JSON.stringify(body.payload || {}),
      source: body.source || 'unknown', ts: body.ts || Date.now(),
      causedBy: body.causedBy || null }; // §sensation 2026-06-29 — was missing
    jaaDB.insert('event_log', row);
    // §GAP CLOSED 2026-07-19 — this endpoint is how guardian/orchestrator
    // already push events into cortex, but it only ever wrote to
    // event_log. Nothing in-process (liminal-space, or anything else
    // subscribed to `bus`) ever saw these live. Emit is additive — the
    // event_log write and JSON response above are unchanged.
    try { bus.emit(row.type, body.payload || {}, { source: row.source, causedBy: row.causedBy }); }
    catch (e) { console.warn(`[cortex] bus.emit failed for ${row.type}: ${e.message}`); }
    json(res, 200, { ok: true, id: row.id });
    return;
  }

  if (p === '/api/events') {
    const n      = parseInt(url.searchParams.get('n') || url.searchParams.get('limit') || '30');
    const source = url.searchParams.get('source');
    const rows   = jaaDB.tail('event_log', n);
    const result = source ? rows.filter(r => r.source === source) : rows;
    json(res, 200, { ok: true, events: result, total: result.length });
    return;
  }

  // ── Friction ─────────────────────────────────────────────────────────────
  if (p === '/api/friction') {
    json(res, 200, { ok: true, friction: _field.friction, regime: _field.regime });
    return;
  }

  // ── Consumer graph (§8.5) ────────────────────────────────────────────────
  // The bidirectional map: who produces what, who consumes it, and what is
  // emitted into the void. Derived from observed behaviour, never declared.
  if (p === '/api/consumers') {
    try {
      const cr = require('../lib/consumer-registry');
      const view = url.searchParams.get('view');
      if (view === 'unconsumed') return json(res, 200, cr.unconsumed());
      if (view === 'producers')  return json(res, 200, { producers: cr.producers() });
      return json(res, 200, cr.graph());
    } catch (e) {
      return json(res, 503, { ok: false, error: `consumer-registry unavailable: ${e.message}` });
    }
  }

  // ── Gaps ─────────────────────────────────────────────────────────────────
  if (p === '/api/gaps') {
    if (method === 'POST') {
      const body = await readBody(req);
      const row  = { id: uid(), ...body, status: body.status || 'open', ts: Date.now() };
      jaaDB.insert('gaps', row);
      try { bus.emit('cortex.gap.found', { gap: row }, { source: row.source || 'cortex' }); }
      catch (e) { console.warn(`[cortex] bus.emit(cortex.gap.found) failed: ${e.message}`); }
      json(res, 200, { ok: true, id: row.id });
      return;
    }
    const status   = url.searchParams.get('status') || 'open';
    const limit    = parseInt(url.searchParams.get('limit') || url.searchParams.get('n') || '20');
    const severity = url.searchParams.get('severity');
    let where = {};
    if (status !== 'all') where.status = status;
    if (severity) where.severity = severity;
    const rows = jaaDB.query('gaps', where, { orderBy: 'ts', order: 'DESC', limit });
    json(res, 200, { ok: true, gaps: rows, total: rows.length });
    return;
  }

  // ── Failure modes ────────────────────────────────────────────────────────
  if (p === '/api/failure-modes') {
    const rows = jaaDB.tail('failure_modes', 20);
    json(res, 200, { ok: true, modes: rows });
    return;
  }

  // ── Intelligence ─────────────────────────────────────────────────────────
  if (p === '/api/intelligence/status') {
    json(res, 200, { ok: true, regime: _field.regime, field: _field,
      patterns: _buildPatterns(3), openGaps: jaaDB.count('gaps', { status: 'open' }) });
    return;
  }

  // §BUILT 2026-07-13 — chunk_4 of docs/nexus-copilot-recall.spec. Checked
  // before building: lib/agent-tools/tools/query-intelligence.js's
  // `lattice` action has called this exact URL since 2026-07-10 —
  // GET /api/cortex/lattice?about=<system>. It never existed; every call
  // has been a 404. meta/spatial/system-lattice.js itself is real, tested,
  // and has been continuously fed real co-activation data (from the same
  // causal graph mastermind builds) every 60s since a 2026-07-06 fix —
  // the data was there, nothing could reach it.
  //
  // §NON-REDUNDANCY CHECK — this spec's own chunk_4 note said "wire only
  // if a real non-redundant query exists." Checked against the causal
  // recall lane (cortex/memory/causal-lookup.js): that lane answers "is
  // this specific tagged row connected to a specific event in the recent
  // causal graph" — one row, one graph walk. This route answers "what
  // OTHER systems/components co-activate with this one, structurally" —
  // aggregate, standing, system-level association, not event-level.
  // Different question, same underlying graph data — non-redundant.
  if (p === '/api/cortex/lattice') {
    const about = url.searchParams.get('about');
    try {
      const sysLattice = require('../meta/spatial/system-lattice');
      if (about) {
        const neighbors = sysLattice.neighbors(about);
        json(res, 200, { ok: true, about, neighbors, size: sysLattice.size() });
      } else {
        json(res, 200, { ok: true, clusters: sysLattice.clusters(), size: sysLattice.size() });
      }
    } catch (e) {
      // §1.2 — an unavailable lattice is reported, never a fabricated empty success.
      json(res, 503, { ok: false, error: `system-lattice unavailable: ${e.message}` });
    }
    return;
  }

  if (p === '/api/intelligence/context') {
    const intent = url.searchParams.get('intent') || '';
    json(res, 200, _contextSnapshot(intent));
    return;
  }

  if (p === '/api/intelligence/intuition') {
    const body   = method === 'POST' ? await readBody(req) : {};
    const prompt = body.prompt || url.searchParams.get('prompt') || '';
    json(res, 200, _intuitionAnswer(prompt));
    return;
  }

  if (p === '/api/intelligence/mastermind') {
    const body = await readBody(req);
    json(res, 200, _mastermindAnalysis(body.prompt, body.context));
    return;
  }

  // §RFR2 CONSUMER 2026-07-11 — detectRecurringPatterns (mastermind.js,
  // the delta engine wired 2026-07-09) had exactly one caller anywhere in
  // the codebase: its own test (tests/modules/mastermind-fractals.test.js).
  // Real, tested, reachable from nowhere a person or another system could
  // actually ask it a question. This route is that path — no new logic,
  // just the missing door. Honest degrade preserved: a null result (no
  // graph, bridge unavailable, <3 nodes) reports patternsFound: 0, not an
  // error — matches detectRecurringPatterns' own contract.
  if (p === '/api/intelligence/mastermind/patterns') {
    const body = method === 'POST' ? await readBody(req) : {};
    const limit = Number(body.limit ?? url.searchParams.get('limit')) || 300;
    const opts = { minChainLen: body.minChainLen, minOccurrences: body.minOccurrences };
    const result = await _mastermind.detectRecurringPatterns(limit, opts);
    json(res, 200, result || { ok: true, patternsFound: 0, patterns: [], reason: 'no causal graph available yet' });
    return;
  }

  if (p === '/api/intelligence/adversarial') {
    const body = await readBody(req);
    json(res, 200, _adversarialCompare(body.prompt, body.context));
    return;
  }

  // §GAP CLOSED 2026-07-07 — nexus-query-surface.spec, build_order items
  // 1 ("implement the route... reads from JAA directly") and 3 ("narrative
  // synthesis... call mastermind()"). Was status: proposed, zero
  // implementation existed anywhere (confirmed by grep for the route path
  // before this). copilot-system-programmer.spec build_order item 1 names
  // this as "the read layer everything else needs" — this is that layer.
  //
  // §HONEST SCOPE, stated per the spec's own build_order rather than left
  // implicit:
  //  - item 2 (fuzzy keyword resolution via intuition()'s schema-routing
  //    variant) is NOT built. This does exact/substring matching against
  //    gaps/event_log/blueprint text fields only — real signal, not the
  //    full "classify guardian vs chatgpt vs sigma" resolution the spec
  //    envisions.
  //  - `commits` (Versionium) and `labs` (LabSession) fields are always
  //    empty arrays with an explicit `_note` — grepped for both before
  //    writing this; no commit-tracking or lab-session-tracking
  //    implementation exists anywhere in the tree to query. Returning
  //    fabricated-looking empty arrays with no note would be worse than
  //    this being visibly incomplete.
  //  - `field` (CFR) is the live system-wide field snapshot, not scoped
  //    to relationships involving `about` specifically — meta/cfr/field.js
  //    doesn't track per-relationship shape, only one global field.
  //  - reads use jaaDB.tail() (a recent-window scan), same tradeoff
  //    orchestrator.js's /api/recall already makes — a match outside the
  //    scanned window won't surface. Not a full table scan.
  if (p === '/api/cortex/query') {
    const about  = url.searchParams.get('about') || '';
    const window = parseInt(url.searchParams.get('window') || '3600000');
    const since  = Date.now() - window;
    if (!about) { json(res, 400, { ok:false, error:'about param required' }); return; }

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
    try { field = { ..._field, _note: 'system-wide CFR field snapshot, not scoped to this subject specifically' }; } catch (_) {}

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
    try { mastermindLine = _mastermind.analyze(about, factualLine)?.analysis || ''; } catch (_) {}

    const result = {
      about, window, since, ts: Date.now(),
      gaps, sigma, field, events, blueprint,
      commits, labs,
      narrative: `${factualLine} ${mastermindLine}`.trim(),
      _scope_note: 'Keyword resolution is exact/substring only (spec build_order item 2, fuzzy resolution, not built). commits/labs are stubbed empty — see commits._note/labs._note.',
      commits_note: commitsNote,
      labs_note: labsNote,
    };
    json(res, 200, { ok: true, ...result });
    return;
  }

  // §WIRED 2026-08-09 — the idea review surface. Idearium is the landing zone;
  // lib/idea-provenance.js is the discipline that keeps a machine proposal
  // distinguishable from one the user had.
  if (p === '/ideas' && method === 'GET') {
    try {
      const html = require('fs').readFileSync(require('path').join(__dirname, 'ui/ideas.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  if (p === '/api/ideas' && method === 'GET') {
    try {
      const P = require('../lib/idea-provenance.js');
      const f = {};
      for (const k of ['origin', 'status', 'about', 'system']) {
        const v = url.searchParams.get(k); if (v) f[k] = v;
      }
      const rows = (Object.keys(f).length ? P.list(f) : P.pending());
      json(res, 200, { ok: true, ideas: rows.map(r => ({
        slug: r.slug, text: r.text, tags: r.tags,
        origin: P.originOf(r), status: P.statusOf(r),
        evidenceFull: r.evidence || [],
        reviewedBy: r.reviewedBy, reviewNote: r.reviewNote,
      })) });
    } catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  if (p === '/api/ideas/stats' && method === 'GET') {
    try { json(res, 200, require('../lib/idea-provenance.js').stats()); }
    catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  // The ONLY path that can accept. idea-provenance refuses any accept whose
  // reviewerKind is not "user" — enforced there, not here, so a second caller
  // cannot route around it.
  if (p === '/api/ideas/review' && method === 'POST') {
    try {
      const body = await readBody(req);
      const P = require('../lib/idea-provenance.js');
      json(res, 200, P.review(body.slug, body.decision, {
        reviewer: body.reviewer, reviewerKind: body.reviewerKind, note: body.note,
      }));
    } catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  // §WIRED 2026-08-08 — lib/movement.js and lib/manifest.js had no HTTP
  // surface, so only the CLI could reach them. §1.1: a module the rest of the
  // system cannot call is not integrated, it is merely present. These are the
  // same snapshots `nexus movement` renders — one data layer, three consumers
  // (CLI, copilot tool, tablet).
  //
  // Read-only. GET because they compute nothing and persist nothing.
  if (p === '/api/movement' && method === 'GET') {
    try {
      const system = url.searchParams.get('system');
      const M = require('../lib/movement.js');
      if (!system) { json(res, 200, { ok: true, systems: M.systems() }); return; }
      const win = parseInt(url.searchParams.get('windowMs') || '', 10) || 24 * 3600e3;
      json(res, 200, M.collect(system, { windowMs: win }));
    } catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  // Manifest drift for one system. `?baseline=1` STORES the current manifest
  // instead of comparing — explicit on purpose, because a baseline that
  // updates itself can never report drift.
  if (p === '/api/manifest' && method === 'GET') {
    try {
      const system = url.searchParams.get('system');
      if (!system) { json(res, 400, { ok: false, error: 'system required' }); return; }
      const M = require('../lib/manifest.js');
      const fsx = require('fs'), pth = require('path');
      const dir = pth.join(__dirname, '..', 'data', 'manifests');
      const store = pth.join(dir, `${system}.json`);

      if (url.searchParams.get('baseline') === '1') {
        const m = M.capture(system);
        if (!m.ok) { json(res, 404, m); return; }
        fsx.mkdirSync(dir, { recursive: true });
        fsx.writeFileSync(store, JSON.stringify(m));
        json(res, 200, { ok: true, stored: true, system, fileCount: m.fileCount, complete: m.complete });
        return;
      }
      let prev = null;
      if (fsx.existsSync(store)) { try { prev = JSON.parse(fsx.readFileSync(store, 'utf8')); } catch (_) {} }
      json(res, 200, M.drift(system, prev, { expected: url.searchParams.get('expected') === '1' }));
    } catch (e) { json(res, 500, { ok: false, error: e.message }); }
    return;
  }

  if (p === '/api/intelligence/patterns') {
    const limit = parseInt(url.searchParams.get('limit') || '5');
    json(res, 200, { ok: true, patterns: _buildPatterns(limit) });
    return;
  }

  // §GAP CLOSED 2026-07-19 — liminal-space was init'd with a real bus above
  // but had no HTTP surface at all; no way to see its state without
  // reading JAA directly. Read-only, mirrors its own status()/list().
  if (p === '/api/liminal-space/status' && method === 'GET') {
    json(res, 200, require('./liminal-space').status());
    return;
  }
  if (p === '/api/liminal-space/list' && method === 'GET') {
    const fp = url.searchParams.get('focalPoint') || undefined;
    json(res, 200, { ok: true, items: require('./liminal-space').list(fp) });
    return;
  }

  if (p === '/api/intelligence/rca') {
    const limit = parseInt(url.searchParams.get('limit') || '5');
    json(res, 200, { ok: true, rca: _buildRCA(limit) });
    return;
  }

  // §GAP CLOSED 2026-07-19 — three endpoints intelligence/index.js provides
  // that nothing above already handles (checked: no existing /reuse,
  // /failures, or POST /event route in this file). Called directly with
  // this file's own json(res, status, obj) convention rather than through
  // handleRequest() — that function expects a json(status, obj) callback
  // shape (different arg order) built for a standalone router, and reusing
  // it here would mean writing an adapter for one call site. Simpler and
  // safer to call the three underlying exports directly.
  if (p === '/api/intelligence/reuse' && method === 'GET') {
    const q = url.searchParams.get('q') || '';
    const intel = require('./intelligence');
    const all = intel.getReuseIndex();
    const results = q ? all.filter(r => r.intent?.includes(q) || r.keywords?.some(k => k.includes(q))) : all.slice(0, 50);
    json(res, 200, { ok: true, results, total: results.length });
    return;
  }

  if (p === '/api/intelligence/failures' && method === 'GET') {
    const failures = require('./intelligence').getFailures();
    json(res, 200, { ok: true, failures: Object.values(failures), total: Object.keys(failures).length });
    return;
  }

  if (p === '/api/intelligence/event' && method === 'POST') {
    const body = await readBody(req);
    if (body?.type) {
      jaaDB.insert('event_log', {
        uuid: uid(), type: body.type, payload: body.payload || {},
        source: body.source || 'external', causedBy: body.causedBy || null, ts: Date.now(),
      });
    }
    json(res, 200, { ok: true });
    return;
  }

  // ── JAA table direct reads ────────────────────────────────────────────────
  if (p.startsWith('/api/jaa/')) {
    const table = p.slice('/api/jaa/'.length);
    if (!table) { json(res, 400, { ok: false, error: 'table required' }); return; }
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const rows  = jaaDB.tail(table, limit);
    json(res, 200, { ok: true, table, rows, count: rows.length });
    return;
  }

  // ── Memory ───────────────────────────────────────────────────────────────
  if (p === '/api/memory') {
    const table     = url.searchParams.get('table') || 'chat_log';
    const n         = parseInt(url.searchParams.get('n') || '10');
    const sessionId = url.searchParams.get('sessionId');
    let rows = jaaDB.tail(table, n * 2);
    if (sessionId) rows = rows.filter(r => r.sessionId === sessionId || r.session_id === sessionId);
    json(res, 200, { ok: true, table, rows: rows.slice(0, n), count: rows.length });
    return;
  }

  if (p === '/api/push') {
    const body = await readBody(req);
    const { content, tags, tier } = body;
    try {
      const result = _pushRecall.push(content, tags, tier);
      json(res, 200, { ok: true, ...result });
    } catch (e) {
      // §ADDED 2026-07-06 — a rejected push used to just return a 400 and
      // vanish. Real failure now lands in data/cortex/failures.jsonl,
      // queryable via lib/ledger-writer.readLatest('cortex','failures',n).
      try { require('../lib/ledger-writer').writeFailure('cortex', e, { module: 'push-recall', source: 'api.push' }); } catch(_) {}
      json(res, 400, { ok: false, error: e.message });
    }
    return;
  }

  if (p === '/api/recall') {
    let intent = url.searchParams.get('intent');
    let query  = url.searchParams.get('query');
    let tier   = url.searchParams.get('tier') || null;
    // §FIXED 2026-07-13 — found while building chunk_2 of
    // docs/nexus-copilot-recall.spec, not assumed: only `intent` was ever
    // read from a POST body here. `query` and `tier` were declared as
    // `const` from the URL search params and never revisited, so every
    // real POST caller (lib/agent-tools/tools/query-recall.js included,
    // since 2026-07-10) has been silently recalling with query:null —
    // lexical scoring always contributed 0, only recency ever mattered.
    // Verified directly: a real POST with {intent,query,tier} in the body
    // produced a response with query genuinely null server-side. Confirmed
    // this predates the chunk_1 fix two sessions ago — that fix corrected
    // which lanes *could* be real; this bug meant none of them were ever
    // actually being asked a real question.
    if (method === 'POST') {
      const body = await readBody(req);
      if (!intent) intent = body.intent;
      if (!query)  query  = body.query;
      if (!tier)   tier   = body.tier || null;
    }
    try {
      const results = _pushRecall.recall(intent, { query }, tier);
      json(res, 200, { ok: true, results, count: results.length });
    } catch (e) { json(res, 400, { ok: false, error: e.message }); }
    return;
  }

  if (p === '/api/memory/insert') {
    const body = await readBody(req);
    const { table, row } = body;
    if (!table || !row) { json(res, 400, { ok: false, error: 'table + row required' }); return; }
    const inserted = jaaDB.insert(table, { id: uid(), ...row, ts: row.ts || Date.now() });
    json(res, 200, { ok: true, id: inserted.id });
    return;
  }

  if (p === '/api/memory/forget') {
    const body = await readBody(req);
    const { table, where } = body;
    if (!table || !where) { json(res, 400, { ok: false, error: 'table + where required' }); return; }
    const n = jaaDB.delete(table, where);
    json(res, 200, { ok: true, deleted: n });
    return;
  }

  // §BUILT 2026-07-12 — "not flat or stubs." This used to be
  // `_workingMemory = {...working, ...body}` — a single mutable object,
  // no tiering, no expiry, gone the moment the process restarted anyway
  // (which happened to match wipeOnRestart:true for the working tier by
  // accident, not by design — a real restart lost it whether or not that
  // was ever intended). Now backed by the real `working_memory` JAA table,
  // tier-tagged, timestamped, and actually aged out by cortex/memory/decay.js
  // on its real schedule (2h evictAfterMs) instead of only ever clearing
  // on a restart nobody scheduled.
  // §BUGS FOUND AND FIXED 2026-07-19 — checked every real caller before
  // touching this, not just the boot.js side:
  //   1. guardian/userscript-claude.js's _memFetch reads `d.rows || d.memory`
  //      — neither field ever existed in this response (only `working` did),
  //      so the userscript's working-memory panel has always silently
  //      rendered empty. Fixed here, not in the userscript: this is the side
  //      I can actually verify: added `rows` and `memory` as aliases for the
  //      exact same array, existing `working` field untouched — nothing that
  //      already reads `working` changes behavior.
  //   2. No system-scoping at all — every row keyed by a bare `key` with no
  //      owner, so two systems writing the same key (e.g. both use "focus"
  //      or "context") would silently overwrite each other via the upsert.
  //      Added an optional `system` field/query param, folded into the
  //      upsert key as `${system}:${key}` — defaults to 'global' when not
  //      provided, so any existing caller that never passed one keeps
  //      exactly its old behavior (same default namespace it was already
  //      implicitly sharing), while a caller that opts in gets real
  //      isolation from every other system.
  if (p === '/api/memory/working') {
    if (method === 'POST') {
      const body = await readBody(req);
      const system = body.system || 'global';
      const key = body.key || 'default';
      const scopedKey = `${system}:${key}`;
      const inserted = jaaDB.upsert('working_memory', {
        key: scopedKey, system, localKey: key, value: body.value ?? body, tier: 'working', ts: Date.now(),
      }, 'key');
      json(res, 200, { ok: true, id: inserted.id, key: inserted.localKey, system: inserted.system });
    } else {
      const systemFilter = url.searchParams.get('system');
      let rows = jaaDB.query('working_memory', {}).filter(r => !r._evicted);
      if (systemFilter) rows = rows.filter(r => r.system === systemFilter);
      json(res, 200, { ok: true, working: rows, rows, memory: rows });
    }
    return;
  }

  // ── Meta observe ──────────────────────────────────────────────────────────
  if (p === '/api/meta/observe') {
    const body = await readBody(req);
    jaaDB.insert('meta_observations', { id: uid(), ...body, ts: Date.now() });
    json(res, 200, { ok: true });
    return;
  }

  // ── RAID ──────────────────────────────────────────────────────────────────
  if (p === '/api/raid/decide') {
    const intent = url.searchParams.get('intent') || '';
    const cfrCtx = { sigmaFloor: _field.entropy, regime: _field.regime };
    json(res, 200, { ok: true, ..._raidDecide(intent, cfrCtx) });
    return;
  }

  if (p === '/api/raid/feedback' && method === 'POST') {
    const body   = await readBody(req);
    const { agent, outcome } = body;
    if (agent && outcome === 'success') _raidHealth[agent] = Math.min(100, (_raidHealth[agent] || 50) + 5);
    if (agent && outcome === 'failure') _raidHealth[agent] = Math.max(0,   (_raidHealth[agent] || 50) - 20);
    json(res, 200, { ok: true, health: _raidHealth });
    return;
  }

  if (p === '/api/raid/health') {
    json(res, 200, { ok: true, health: _raidHealth, regime: _field.regime });
    return;
  }

  // ── Self-heal status ──────────────────────────────────────────────────────
  if (p === '/api/self-heal/status') {
    const open = jaaDB.count('gaps', { status: 'open' }) || 0;
    json(res, 200, { ok: true, openGaps: open, regime: _field.regime,
      friction: _field.friction, healing: open > 0 && _field.friction < 0.5 });
    return;
  }

  // ── Snapshots ─────────────────────────────────────────────────────────────
  // §DECLARED-BUT-MISSING WIRE CLOSED 2026-07-09 — hook `cortex-snapshot-create`
  // has declared POST /api/snapshots/create since 2026-06-11, intent: "Archive
  // full JAA table state to a .nex snapshot so the system can rewind to any
  // prior state." Nothing implemented it. `/api/snapshots` only ever READ the
  // snapshots table — a table nothing ever wrote to.
  //
  // Integrity uses rfr2's identity.contentHash(), the same primitive proven to
  // be stable across runs, sensitive to content, and independent of key order.
  // That is the versionium primitive (Phase 32/105), and this is its second
  // real production consumer.
  if (p === '/api/snapshots/create' && method === 'POST') {
    try {
      const fs_ = require('fs');
      const path_ = require('path');
      const DIR = path_.join(__dirname, '../data/cortex/memory');
      const { loadRFR2Module } = require('../lib/rfr2-bridge.js');
      const identity = await loadRFR2Module('identity');

      const files = fs_.readdirSync(DIR).filter(f => f.endsWith('.json'));
      const tables = [];
      for (const f of files) {
        // §CAUGHT BEFORE IT BIT 2026-07-09 — a snapshot must never hash its own
        // output table. Today snapshots.json does not exist on disk, so this is
        // latent rather than broken. The moment it appears, every snapshot would
        // include the previous snapshot, stateHash would differ on every call,
        // and the one property the hash exists to provide — "same state, same
        // hash" — would be silently destroyed. Verified: with this exclusion,
        // two consecutive snapshots of unchanged state produce identical hashes.
        if (f === 'snapshots.json') continue;
        const raw = fs_.readFileSync(path_.join(DIR, f), 'utf8');
        let rows = 0;
        try { const parsed = JSON.parse(raw); rows = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length; }
        catch (_) { rows = -1; } // §1.2 — an unparseable table is recorded as such, not skipped
        tables.push({ table: f.replace(/\.json$/, ''), rows, hash: String(identity.contentHash({ table: f, body: raw })) });
      }

      const snapshot = {
        id: jaaDB.uid(),
        ts: Date.now(),
        tableCount: tables.length,
        tables,
        // Hash of the hashes: one value identifying this whole system state.
        stateHash: String(identity.contentHash({ tables: tables.map(t => t.hash) })),
      };
      jaaDB.insert('snapshots', snapshot);
      json(res, 201, { ok: true, snapshot });
    } catch (e) {
      // §1.2 — a snapshot that failed must never look like one that succeeded.
      json(res, 500, { ok: false, error: `snapshot failed: ${e.message}` });
    }
    return;
  }

  if (p === '/api/snapshot' || p === '/api/snapshots') {
    if (method === 'POST') {
      const body = await readBody(req);
      const snap = { id: uid(), ...body, field: { ..._field }, ts: Date.now() };
      jaaDB.insert('snapshots', snap);
      json(res, 200, { ok: true, id: snap.id });
      return;
    }
    const snaps = jaaDB.tail('snapshots', p === '/api/snapshots' ? 20 : 1);
    json(res, 200, { ok: true, snapshots: snaps, latest: snaps[0] || null });
    return;
  }

  // §GAP CLOSED 2026-07-06 — snapshots could be created and read, but
  // nothing ever restored state FROM one. hooks/cortex.hooks.js declares
  // this as /api/snapshots/rollback; real path kept flatter
  // (/api/snapshot/rollback) matching this file's own /api/snapshot
  // singular convention — the registry needs updating to match, not the
  // other way around, since /api/snapshot (not /api/snapshots) is what
  // every other route here already uses as the base.
  if (p === '/api/snapshot/rollback' && method === 'POST') {
    const body = await readBody(req);
    const { id } = body || {};
    if (!id) { json(res, 400, { ok: false, error: 'id required' }); return; }
    const all = jaaDB.tail('snapshots', 500);
    const target = all.find(s => s.id === id);
    if (!target) { json(res, 404, { ok: false, error: `snapshot '${id}' not found` }); return; }
    const before = { ..._field };
    Object.assign(_field, target.field);
    jaaDB.insert('event_log', { type: 'cortex.snapshot.rolled_back', payload: { id, before, after: { ..._field } }, source: 'cortex', ts: Date.now() });
    json(res, 200, { ok: true, restoredFrom: id, field: { ..._field } });
    return;
  }

  // ── Generic table insert ──────────────────────────────────────────────────
  if (p === '/api/table/insert' && method === 'POST') {
    const body = await readBody(req);
    const { table, row } = body;
    if (!table || !row) { json(res, 400, { ok: false, error: 'table + row required' }); return; }
    const inserted = jaaDB.insert(table, { id: uid(), ...row, ts: row.ts || Date.now() });
    json(res, 200, { ok: true, id: inserted.id });
    return;
  }

  // ── CLI exec (internal only) ──────────────────────────────────────────────
  if (p === '/api/cli/exec') {
    // §1.2 / §1.3 FIXED 2026-07-09 — this returned HTTP 200 with
    // `{ ok: true, result: 'cortex cli exec — not implemented' }`. A caller
    // checking `ok` saw success. A stub that reports success is worse than a
    // missing route: the missing route fails loudly at the call site, while
    // this one silently convinced every caller its command had run.
    // The route stays (in a non-linear system a route is an affordance, and
    // its missing implementation is a gap to fill) but it now tells the truth.
    json(res, 501, {
      ok: false,
      error: 'not implemented',
      route: '/api/cli/exec',
      hint: 'cortex does not execute CLI commands. Use the run_command agent tool, which reads cockpit\'s INTERACTION_CONTRACT.',
      ts: Date.now(),
    });
    return;
  }

  // ── Replay inspect ────────────────────────────────────────────────────────
  if (p === '/api/replay/inspect') {
    const rows = jaaDB.tail('event_log', 50);
    json(res, 200, { ok: true, events: rows, count: rows.length });
    return;
  }

  // ── Settings compat ───────────────────────────────────────────────────────
  // §SOVEREIGNTY 2026-07-09 — personas lived only as a module, so
  // copilot/server.js reached across the system boundary with
  // require('../cortex/personas.js') + require('../cortex/memory/jaa-db.js').
  // That is the hardest possible wire: it couples file layout, module system
  // and process, and makes cortex un-swappable. A capability that another
  // system needs must be an API. Here it is.
  if (method === 'GET' && p === '/api/personas') {
    const { PersonaStore } = require('./personas.js');
    const store = new PersonaStore({ jaa: jaaDB });
    const name = url.searchParams.get('name');
    if (name) { json(res, 200, { ok: true, persona: store.get(name) }); return; }
    json(res, 200, { ok: true, personas: store.list() });
    return;
  }

  if (method === 'POST' && p === '/api/personas') {
    const body = await readBody(req);
    try {
      const { PersonaStore } = require('./personas.js');
      const store = new PersonaStore({ jaa: jaaDB });
      json(res, 200, { ok: true, ...store.set(body) });
    } catch (e) {
      // §1.2 — validation errors (missing systemPrompt) surface, never store silently.
      json(res, 400, { ok: false, error: e.message });
    }
    return;
  }

  if (p === '/api/settings.js' || p === '/api/settings') {
    const rows = jaaDB.query('settings', {});
    json(res, 200, { ok: true, settings: rows });
    return;
  }

  // ── n= compat alias ───────────────────────────────────────────────────────
  if (url.searchParams.get('n')) {
    const n    = parseInt(url.searchParams.get('n'));
    const rows = jaaDB.tail('event_log', n);
    json(res, 200, { ok: true, events: rows });
    return;
  }

  res.writeHead(404); res.end(JSON.stringify({ ok: false, error: 'Not found', path: p }));
});

// ── Register with orchestrator ────────────────────────────────────────────────
function _register() {
  const components = require('../lib/component-registry').normalizeDeclarations(require('./registry-components'));
  const body = JSON.stringify({
    systemId: SYSTEM, port: PORT, version: VERSION, status: 'online',
    meta: { label: 'CORTEX', color: '#2dd4bf' },
    components,
  });
  const u   = new URL(`${OR_URL}/api/register`);
  const req = http.request({
    hostname: u.hostname, port: u.port || 9000, path: u.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    timeout: 4000,
  }, () => { console.log(`[cortex] registered with orchestrator :${u.port}`); _startHeartbeat(); });
  req.on('error', () => setTimeout(_register, 5000));
  req.write(body); req.end();
}

// §FIX 2026-07-24 — cortex was the only one of orchestrator's 3
// REQUIRED_SYSTEMS (cortex/guardian/idearium) with no outbound heartbeat.
// guardian, idearium, copilot, and ollama-bridge all POST /api/heartbeat
// on a 10s interval; cortex only ever sent the one-time /api/register at
// boot. orchestrator's watchdog (systemWatchdog(), 10s tick) flips a
// system to OFFLINE only when BOTH the direct /health GET fails/times out
// (3s) AND the registry's lastSeen is >15s stale (allHealth()'s regOnline
// fallback) — for every other required system, a transient health-check
// miss gets absorbed by that fallback because their heartbeat keeps
// lastSeen fresh. Cortex had no heartbeat, so lastSeen only got set once,
// at boot registration — meaning after the first 15 seconds of runtime,
// cortex was running on the raw 3-second health-check timeout ALONE, with
// no safety net, for its entire lifetime. A single momentary event-loop
// block (e.g. synchronous JAA table loading during a busy multi-system
// boot window — this codebase's other systems load 30+ tables the same
// way) was enough to trip a real "[watchdog] cortex → OFFLINE" even
// though the process never crashed (confirmed live: autopilot's own
// "stable for 60s" fired seconds later — the process was fine, only the
// HTTP health check was momentarily unanswered). Mirrors idearium's real,
// working heartbeat pattern (idearium/api/index.js) exactly, not invented
// fresh — same interval, same payload shape, same fire-and-forget error
// handling.
let _heartbeatStarted = false;
// §B1 2026-07-24 — publish cortex's bus subscriptions to the shared store so
// the consumer graph spans processes. Before this, lib/consumer-registry.js
// could only see the subscribers of whichever process happened to be asking,
// so cortex's listeners were invisible to everyone else and its own
// unconsumed() calls reported other systems' real work as "emitted into the
// void."
//
// Deliberately called from _startHeartbeat (i.e. AFTER registration succeeds,
// which is after boot has wired its listeners) rather than at module load.
// Publishing at the top of boot would snapshot a bus that has subscribed to
// nothing yet and record cortex as consuming zero events — a real footgun the
// library's own doc comment warns about. The 10s republish also means any
// listener wired later is picked up within one interval rather than never.
function _startSubscriptionPublisher() {
  try {
    const busSubs = require('../lib/bus-subscriptions');
    busSubs.publishPeriodically({ systemId: SYSTEM, bus, jaa: jaaDB, intervalMs: 10000 });
    console.log(`[cortex] bus subscriptions publishing to the shared store (§B1)`);
  } catch (e) {
    // Never fatal: the connectome is observability, and a system must not
    // fail to boot because the map could not be updated (§1.2 — loud).
    console.error(`[cortex] subscription publisher failed to start: ${e.message}`);
  }
}

function _startHeartbeat() {
  if (_heartbeatStarted) return; // _register() can retry; never double-start the interval
  _heartbeatStarted = true;
  _startSubscriptionPublisher();
  const u = new URL(`${OR_URL}/api/heartbeat`);
  const timer = setInterval(() => {
    const body = JSON.stringify({ systemId: SYSTEM, port: PORT, status: 'online' });
    const req = http.request({
      hostname: u.hostname, port: u.port || 9000, path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 2000,
    });
    req.on('error', () => {}); // fire-and-forget, matches every other system's heartbeat
    req.write(body); req.end();
  }, 10000);
  if (timer.unref) timer.unref();
}

// ── Poll CFR field from orchestrator every 5s ─────────────────────────────────
function _pollOrchestrator() {
  const req = http.request({
    hostname: '127.0.0.1', port: 9000, path: '/cfr/field',
    method: 'GET', timeout: 3000,
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const data = JSON.parse(d);
        if (data && typeof data.coherence === 'number') _updateField(data);
      } catch (_) {}
    });
  });
  req.on('error', () => {});
  req.end();
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[cortex] :${PORT} — v${VERSION} — memory+cfr+raid+intelligence active`);
  setTimeout(_register, 1500);
  setInterval(_pollOrchestrator, 5000);
  // §Phase-97 fix 2026-06-29: this boot log has claimed "raid active" since
  // before cortex/core/raid/index.js existed. It does now — start its
  // health poll so _health stops sitting at boot-time defaults.
  try { require('./core/raid').startHealthPoll(15000); } catch(e) {
    console.warn(`[cortex] RAID health poll failed to start: ${e.message}`);
  }
  // §BUILT 2026-07-12 — cortex.spec has declared MEMORY_TIERS since v3.2.0;
  // this is what actually ages working/short-tier rows out on schedule.
  try { require('./memory/decay').startDecayTicker(5 * 60 * 1000); } catch (e) {
    console.warn(`[cortex] memory decay ticker failed to start: ${e.message}`);
  }
  // §GAP CLOSED 2026-07-19 — versionium/index.js, versionium/causality.js,
  // liminal-space/index.js and intelligence/index.js existed fully written
  // and tested (unintegrated/2026-07-branch-b-cortex-v2) but were never
  // require()'d from anywhere — dead code sitting next to boot.js. All four
  // are self-contained: init(cfg)/stop(), unref'd intervals, no dependency
  // on anything not already in this tree. Starting them here is purely
  // additive — nothing else in boot.js calls into them yet, so this cannot
  // change any existing route's behavior.
  //
  // liminal-space's init(cfg) takes a cfg.bus (Node EventEmitter) to
  // subscribe to events like 'cortex.gap.found' / 'forge.patch.proposed'.
  // Turned out that bus already existed — nexus-bus.js at repo root,
  // documented as "the common event fabric," already used by guardian and
  // orchestrator to POST into cortex's /api/event — but boot.js never
  // required it, so nothing arriving there ever reached an in-process
  // listener. Now required above as `bus`, wired into /api/event and
  // /api/gaps (POST) so both cross-process events and cortex's own gap
  // creation fan out live, and passed to liminal-space for real below.
  try {
    require('./versionium').init({ pollMs: 3000 });
    console.log('[cortex] versionium (causal version control) active');
  } catch (e) {
    console.warn(`[cortex] versionium failed to start: ${e.message}`);
  }
  try {
    require('./versionium/causality').init({ pollMs: 5000 });
    console.log('[cortex] versionium/causality active');
  } catch (e) {
    console.warn(`[cortex] versionium/causality failed to start: ${e.message}`);
  }
  // ── Organs array — one line per bus-wired SISO organ ────────────────────────
  // Replaces six structurally-identical try/catch blocks that accreted one
  // Phase at a time (the exact monolith-bottleneck pattern the organ model
  // exists to prevent — tests/modules/test-liminal-space.js T-015 has pinned
  // this shape since before any of these organs existed). Every organ shares
  // the same contract: init({ bus }), console log convention, isolated failure.
  const organs = [
    { name: 'liminal-space',        path: './liminal-space',        note: 'live on nexus-bus' },
    { name: 'self-heal/escalation', path: './self-heal/escalation', note: 'friction ledger — closes liminal-space\'s escalation.friction.increased listener' },
    { name: 'self-heal',            path: './self-heal',            note: '5-level escalation ladder' },
    { name: 'gap-finder',           path: './gap-finder',           note: 'anomaly.detected + sigma.event.* → cortex.gap.found' },
    { name: 'orion',                path: './orion',                note: 'anomaly/sigma → cortex.orion.classified' },
    { name: 'raid',                 path: './core/raid',            note: 'cortex.orion.classified → cortex.raid.decided (direct-call route unaffected)' },
    // §SWITCHED ON 2026-07-24 (James: "Yes to the core"). intelligence/index.js
    // is 933 lines that had NEVER RUN: nothing outside its own directory
    // required it, init() was never called, and neither bep_patterns.json nor
    // failures.json had ever been created — _scanPatterns() had never once
    // executed. Its three sibling modules (intuition/mastermind/adversarial)
    // WERE live and reachable, which is exactly why the absence went unnoticed:
    // the /api/intelligence/* routes answered, so the core behind them was
    // assumed to be running.
    //
    // Why this is not a new competing pattern engine (§10.3): copilot —
    // THE MIND — reads p.precursor/p.outcome/p.confidence, which is
    // bep_patterns' shape, while cortex's _buildPatterns() serves
    // /api/intelligence/patterns from the crystals table. So the mind has
    // always been asking for THIS core's output and being handed a different
    // engine's. Switching it on supplies what copilot was written to consume;
    // it does not invent a rival. (Whether _buildPatterns then serves
    // bep_patterns, both, or stays as-is remains James's call — recorded in
    // docs/nexus-sentinel.spec, deliberately NOT decided here.)
    //
    // Dry-run before wiring confirmed init() is clean: four staggered unref'd
    // scans plus a 10s-delayed initial build that hydrates _failureIndex from
    // the persisted fault_taxonomy table, so there is no cold-start amnesia.
    // Failure is isolated by the loop's own try/catch, same as every organ.
    { name: 'intelligence',         path: './intelligence',         note: 'pattern recognition + failure taxonomy → bep_patterns/failures (was never running)' },
  ];
  for (const organ of organs) {
    try {
      require(organ.path).init({ bus });
      console.log(`[cortex] ${organ.name} active (${organ.note})`);
    } catch (e) {
      console.warn(`[cortex] ${organ.name} failed to start: ${e.message}`);
    }
  }
  // §Phase P1 2026-07-24 — the CONSUMER side of the registry (§8.5).
  // Scan found: hook_bindings EMPTY (wire() only reachable via loom's HTTP
  // route, nothing calls it), component.events populated on 0 of 217. So
  // relationships are not DECLARED anywhere — but they ARE observable:
  // event_log holds real producer data, and this bus knows its subscribers.
  // Wired here specifically because subscriber counts can only be read from
  // inside a process that holds the bus.
  try {
    const consumerRegistry = require('../lib/consumer-registry');
    const { jaaDB } = require('./memory/jaa-db');
    consumerRegistry.init({ jaa: jaaDB, bus });
    console.log('[cortex] consumer-registry active — derives producer/consumer graph from observed behaviour (event_log + live bus)');
  } catch (e) {
    console.warn(`[cortex] consumer-registry failed to start: ${e.message}`);
  }
  try {
    const capabilityRegistry = require('../lib/capability-registry');
    try { capabilityRegistry.init(require('../lib/component-registry')); } catch (_) {}
    require('./core/raid/router').init({ bus, capabilityRegistry });
    console.log('[cortex] raid/router active — universal entry point (any surface → raid.route.request → raid.route.decided)');
  } catch (e) {
    console.warn(`[cortex] raid/router failed to start: ${e.message}`);
  }
  try {
    require('./intelligence').init({});
    console.log('[cortex] intelligence/index (consolidated context/reuse/failure layer) active');
  } catch (e) {
    console.warn(`[cortex] intelligence/index failed to start: ${e.message}`);
  }

  // §GAP CLOSED 2026-07-06 — meta/spatial/system-lattice.js was real,
  // tested, and persisted, but nothing fed it in production — the
  // "standing, continuously-updated" half of nexus-relationship-shape.spec
  // v0.2 was still dormant. Feeds it from the same on-demand causal graph
  // mastermind now builds from recent event_log rows — one real source,
  // two real consumers, not two separate graph-construction paths.
  // 60s interval: coarser than RAID's 15s health poll or the 5s
  // orchestrator poll on purpose — this aggregates cross-system structure,
  // not live health, doesn't need sub-minute freshness.
  try {
    const sysLattice = require('../meta/spatial/system-lattice');
    sysLattice.load(); // rehydrate from Cortex before the first feed tick
    const _feedLattice = () => {
      try {
        // §BUG FIXED 2026-07-09 (from a live console log) — this called
        // _buildRecentCausalGraph(), which was inline in this file until the
        // 07-07 split moved it into cortex/intelligence/mastermind.js. The
        // helper moved; this caller did not. It threw every 60s in
        // production, caught by the warn below and never fixed. The function
        // is already exposed on the mastermind instance — reuse it rather
        // than reintroducing a second copy of the same graph builder.
        const graph = _mastermind.buildRecentCausalGraph();
        if (graph) sysLattice.ingestCFRGraph(graph);
      } catch (e) { console.warn(`[cortex] system-lattice feed failed: ${e.message}`); }
    };
    _feedLattice(); // run once immediately, don't wait a full interval for first data
    setInterval(_feedLattice, 60000);
  } catch (e) {
    console.warn(`[cortex] system-lattice not available: ${e.message}`);
  }
});

module.exports = {
  server, jaaDB, _intuitionAnswer, _mastermindAnalysis, _adversarialCompare,
  _buildPatterns, _buildRCA, _intuition, _mastermind, adversarial,
};
