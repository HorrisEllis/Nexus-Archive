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
function _intuitionAnswer(prompt) {
  const p = String(prompt || '').toLowerCase();
  // Rule-based fast answers for known query types
  if (p.includes('health') || p.includes('status')) {
    return {
      ok: true,
      text: `System coherence: ${_field.coherence.toFixed(2)}, friction: ${_field.friction.toFixed(2)}, regime: ${_field.regime}.`,
      intent: 'status', confidence: 0.82, modelUsed: 'cortex.intuition',
    };
  }
  if (p.includes('gap') || p.includes('open issue')) {
    const n = jaaDB.count('gaps', { status: 'open' }) || 0;
    return {
      ok: true,
      text: `There are currently ${n} open gaps in the system.`,
      intent: 'gaps', confidence: 0.90, modelUsed: 'cortex.intuition',
    };
  }
  if (p.includes('pattern') || p.includes('most common')) {
    const top = _buildPatterns(3).map(p => `${p.type}(${p.count})`).join(', ');
    return {
      ok: true,
      text: `Top event patterns: ${top || 'insufficient data'}.`,
      intent: 'patterns', confidence: 0.78, modelUsed: 'cortex.intuition',
    };
  }
  // Not a fast-path — caller should use mastermind/Ollama
  return { ok: true, text: null, confidence: 0, modelUsed: 'cortex.intuition' };
}

// ── Intelligence: mastermind (causal analysis) ────────────────────────────────
function _mastermindAnalysis(prompt, contextSnippet) {
  const gaps   = jaaDB.query('gaps', { status: 'open' }, { limit: 3 });
  const regime = _field.regime;

  // §UPGRADED 2026-07-07 — was concatenating current state ("Open issues:
  // TYPE") without ever tracing WHY. Builds a real, bounded causal graph
  // on-demand from the last 300 event_log rows (Cortex has no live CFR
  // ledger of its own — that lives per-process in each of the 9 real
  // consumers — so this is a genuine cross-section of what's actually
  // stored here, not a fabricated or live-streaming one) and walks
  // CausalGraph.ancestors() for each open gap, the same class extended
  // earlier this session for RAID's topologicalProximity. Falls back to
  // the old "Open issues: TYPE" phrasing when no real chain exists —
  // never invents a cause that isn't in the data.
  const { CausalGraph } = require('../meta/cfr/graph.js');
  const graph = new CausalGraph();
  const recentEvents = jaaDB.tail('event_log', 300);
  for (const ev of recentEvents) graph.ingest(ev);
  for (const g of gaps) graph.ingest({ uuid: g.id, id: g.id, ts: g.ts, type: g.type, causedBy: g.causedBy || null, source: g.source });

  const traces = [];
  const untraced = [];
  for (const g of gaps) {
    const chain = graph.ancestors(g.id);
    if (chain.length > 1) {
      traces.push(`Root-cause trace for '${g.type || g.id}': ${chain.map(e => e.type || e.id).join(' → ')}.`);
    } else {
      // §BUG FIXED 2026-07-07 — found by testing a mixed case (one gap
      // with a real trace, one without) directly: the original logic
      // only showed the generic "Open issues" line when NO gap had a
      // trace at all, so an untraced gap sitting alongside a traced one
      // was silently dropped from the output entirely — not degraded,
      // just missing. Every gap now contributes something.
      untraced.push(g.type || g.id);
    }
  }

  const lines  = [
    `Causal field: regime=${regime}, coherence=${_field.coherence.toFixed(2)}, entropy=${_field.entropy.toFixed(2)}.`,
    ...traces,
    untraced.length ? `Open issues (no traced cause) (${untraced.length}): ${untraced.join(', ')}.` : '',
    (!gaps.length) ? 'No open issues.' : '',
    contextSnippet ? `Context: ${String(contextSnippet).slice(0, 200)}` : '',
  ].filter(Boolean);
  return {
    ok: true,
    analysis: lines.join(' '),
    regime,
    field: { ..._field },
    modelUsed: 'cortex.mastermind',
  };
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
let _workingMemory = {};

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

  // ── Gaps ─────────────────────────────────────────────────────────────────
  if (p === '/api/gaps') {
    if (method === 'POST') {
      const body = await readBody(req);
      const row  = { id: uid(), ...body, status: body.status || 'open', ts: Date.now() };
      jaaDB.insert('gaps', row);
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

  if (p === '/api/intelligence/patterns') {
    const limit = parseInt(url.searchParams.get('limit') || '5');
    json(res, 200, { ok: true, patterns: _buildPatterns(limit) });
    return;
  }

  if (p === '/api/intelligence/rca') {
    const limit = parseInt(url.searchParams.get('limit') || '5');
    json(res, 200, { ok: true, rca: _buildRCA(limit) });
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
    const query = url.searchParams.get('query');
    const tier  = url.searchParams.get('tier') || null;
    if (!intent && method === 'POST') {
      const body = await readBody(req);
      intent = body.intent;
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

  if (p === '/api/memory/working') {
    if (method === 'POST') {
      const body = await readBody(req);
      _workingMemory = { ..._workingMemory, ...body };
      json(res, 200, { ok: true });
    } else {
      json(res, 200, { ok: true, working: _workingMemory });
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
    json(res, 200, { ok: true, result: 'cortex cli exec — not implemented', ts: Date.now() });
    return;
  }

  // ── Replay inspect ────────────────────────────────────────────────────────
  if (p === '/api/replay/inspect') {
    const rows = jaaDB.tail('event_log', 50);
    json(res, 200, { ok: true, events: rows, count: rows.length });
    return;
  }

  // ── Settings compat ───────────────────────────────────────────────────────
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
  const components = require('./registry-components');
  const body = JSON.stringify({
    systemId: SYSTEM, port: PORT, version: VERSION, status: 'online',
    meta: { label: 'CORTEX', color: '#2dd4bf' },
    components: components.components || [],
  });
  const u   = new URL(`${OR_URL}/api/register`);
  const req = http.request({
    hostname: u.hostname, port: u.port || 9000, path: u.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    timeout: 4000,
  }, () => console.log(`[cortex] registered with orchestrator :${u.port}`));
  req.on('error', () => setTimeout(_register, 5000));
  req.write(body); req.end();
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
});

module.exports = { server, jaaDB };
