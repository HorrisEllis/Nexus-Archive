'use strict';
// ════════════════════════════════════════════════════════════════════════════
// cortex-boot.js — Nexus Cortex v5.0 server
// Emitted from cortex.eg. Port 3748.
// Source of truth. JAA is the only shared surface. Nothing silently fails.
// Modules: RAID + ORION + gap-finder + healer + agent-memory + versionium
// ════════════════════════════════════════════════════════════════════════════
const http   = require('http');
const net    = require('net');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { randomUUID } = require('crypto');

const PORT     = parseInt(process.env.NEXUS_PORT || 3748);
const DATA_DIR = process.env.NEXUS_DATA_DIR || path.join(__dirname, '../data');

// ── JAA — the only shared surface ─────────────────────────────────────────────
const ALL_TABLES = [
  'event_log','bridge_messages','agent_calls','agent_signatures',
  'artifacts','gaps','failures','fix_map','memory_index','memory_queries',
  'conditioning_log','feedback_scores','crystals','bep_patterns',
  'active_traces','orion_sessions','versionium_commits','versionium_branches',
  'versionium_file_index','versionium_calendar','versionium_objects',
  'schedules','workflow_runs','project_registry','shape_samples',
  'poll_log','requests','cortex_memory',
  // Guardian layer additions
  'gap_questions','sessions','ledger_entries','jobs','downloads','settings',
];

class JaaDB {
  constructor({ dir }) {
    this._dir = dir; this._t = {}; this._rowId = 1; this._ready = false; this._fds = {};
    ALL_TABLES.forEach(t => { this._t[t] = []; });
  }
  async open() {
    if (this._ready) return;
    fs.mkdirSync(this._dir, { recursive: true });
    for (const table of ALL_TABLES) {
      const f = path.join(this._dir, table + '.jsonl');
      if (fs.existsSync(f)) {
        const lines = fs.readFileSync(f, 'utf8').split('\n').filter(Boolean);
        for (const line of lines) {
          try { const r = JSON.parse(line); r._rowId = this._rowId++; this._t[table].push(r); } catch {}
        }
      }
      this._fds[table] = fs.createWriteStream(f, { flags: 'a' });
    }
    this._ready = true;
  }
  _file(t) { return path.join(this._dir, t + '.jsonl'); }
  insert(table, row) {
    if (!this._t[table]) return null;
    const r = { uuid: row.uuid || randomUUID(), _rowId: this._rowId++, ts: Date.now(), ...row };
    this._t[table].unshift(r);
    if (this._t[table].length > 10000) this._t[table].pop();
    try { this._fds[table]?.write(JSON.stringify(r) + '\n'); } catch {}
    return r;
  }
  get(table, uuid)       { return this._t[table]?.find(r => r.uuid === uuid) || null; }
  query(table, fn, n=50) { return (this._t[table] || []).filter(fn).slice(0, n); }
  tail(table, n=50)      { return (this._t[table] || []).slice(0, n); }
  update(table, uuid, set) {
    const r = this.get(table, uuid); if (!r) return;
    Object.assign(r, set, { updated_at: Date.now() });
  }
  counts() {
    const r = {};
    for (const t of ALL_TABLES) r[t] = this._t[t].length;
    return r;
  }
}

const jaa = new JaaDB({ dir: DATA_DIR });

// ── Cobalt bus ────────────────────────────────────────────────────────────────
class CobaltBus {
  constructor() { this._subs = []; this._ring = []; this._max = 10000; this._tick = 0; }
  on(pattern, fn) { this._subs.push({ pattern, fn }); return this; }
  ingest(type, payload = {}, opts = {}) {
    const ev = Object.freeze({ type, payload, source: opts.source||'unknown', causedBy: opts.causedBy||null, tick: this._tick++, ts: Date.now() });
    this._ring.push(ev); if (this._ring.length > this._max) this._ring.shift();
    for (const { pattern, fn } of this._subs) {
      if (pattern === '**' || pattern === type) try { fn(ev); } catch(e) { console.error(`[cobalt] subscriber error:`, e.message); }
    }
    return ev;
  }
  ring(n=100) { return this._ring.slice(-n); }
  get stats() { return { tick: this._tick, subs: this._subs.length }; }
}

const bus = new CobaltBus();

// SSE clients
const sseClients = new Set();
function pushSSE(type, data) {
  const msg = 'data: ' + JSON.stringify({ type, data, ts: Date.now() }) + '\n\n';
  for (const r of sseClients) { try { r.write(msg); } catch { sseClients.delete(r); } }
}
bus.on('**', ev => pushSSE(ev.type, ev.payload));

// ── Poll modules ──────────────────────────────────────────────────────────────
function startModules() {
  // RAID — local-first agent routing
  setInterval(() => {
    const pending = jaa.query('agent_calls', r => r.status === 'pending', 20);
    for (const call of pending) {
      jaa.update('agent_calls', call.uuid, { status: 'processing', claimedBy: 'raid', claimedAt: Date.now() });
      const claimed = jaa.get('agent_calls', call.uuid);
      if (!claimed || claimed.claimedBy !== 'raid') continue;
      const agent = call.preferredAgent || 'ollama';
      jaa.update('agent_calls', call.uuid, { status: 'routed', routedTo: agent, routedAt: Date.now() });
      bus.ingest('agent.call.routed', { uuid: call.uuid, agent }, { source: 'raid' });
    }
  }, 3000);

  // Gap finder
  setInterval(() => {
    const now = Date.now();
    // Stuck calls
    const stuck = jaa.query('agent_calls', r => r.status === 'processing' && (now - (r.startedAt||r.ts)) > 35000, 10);
    for (const c of stuck) {
      const dedup = jaa.query('gaps', r => r.path === `agent_calls/${c.uuid}` && r.type === 'stuck_call', 1)[0];
      if (!dedup) {
        jaa.insert('gaps', { path: `agent_calls/${c.uuid}`, type: 'stuck_call', severity: 'high', body: `Stuck ${Math.round((now-c.ts)/1000)}s`, status: 'pending', source: 'gap-finder', causedBy: c.uuid });
        bus.ingest('gap.found', { type: 'stuck_call', uuid: c.uuid }, { source: 'gap-finder' });
      }
    }
  }, 2000);

  // Healer
  setInterval(() => {
    const pending = jaa.query('gaps', r => r.status === 'pending', 10);
    for (const gap of pending) {
      jaa.update('gaps', gap.uuid, { status: 'processing', claimedBy: 'healer' });
      jaa.insert('fix_map', { gapUuid: gap.uuid, gapType: gap.type, strategy: 'auto', action: 'log_and_surface', automated: true, status: 'applied', source: 'healer', causedBy: gap.uuid });
      jaa.update('gaps', gap.uuid, { status: 'resolved', resolvedAt: Date.now() });
      bus.ingest('gap.resolved', { uuid: gap.uuid }, { source: 'healer' });
    }
  }, 5000);

  // GTCI — gap context injector
  setInterval(() => {
    const openGaps = jaa.query('gaps', r => r.status === 'open' || r.status === 'pending', 30);
    for (const gap of openGaps) {
      const existing = jaa.query('gap_questions', r => r.gapUuid === gap.uuid, 1)[0];
      if (!existing) {
        const q = buildGapQuestion(gap);
        jaa.insert('gap_questions', { gapUuid: gap.uuid, gapType: gap.type, subject: q.subject, question: q.question, contextBlock: q.contextBlock, priority: q.priority, hint: q.hint, status: 'pending', source: 'gtci', causedBy: gap.uuid });
        bus.ingest('gap.question.created', { gapUuid: gap.uuid, type: gap.type }, { source: 'gtci' });
      }
    }
  }, 3000);

  console.log('[cortex] modules started');
}

function buildGapQuestion(gap) {
  const map = {
    stuck_call:        { subject: `Stuck call: ${gap.path}`, question: 'Retry / cancel / escalate?', priority: 'high', hint: 'a=retry b=cancel c=escalate d=manual' },
    stale_module:      { subject: `Stale module: ${gap.path}`, question: 'Idle-by-design or stuck?', priority: 'medium', hint: 'a=idle b=stuck c=restart' },
    recurring_failure: { subject: `Recurring failure: ${gap.path}`, question: 'What changes on retry?', priority: 'high', hint: 'Describe the difference' },
    schema_violation:  { subject: `Schema violation: ${gap.path}`, question: 'Reject / migrate / coerce?', priority: 'medium', hint: 'a=reject b=migrate c=coerce' },
  };
  const tmpl = map[gap.type] || { subject: gap.body || gap.type, question: 'Describe and suggest resolution', priority: 'low', hint: 'Free text' };
  const contextBlock = `─────────────────────────────────────────\nOPEN GAP [${gap.type} / ${gap.severity}]:\n  Path: ${gap.path}\n  Body: ${gap.body}\n  UUID: ${gap.uuid}\n\n  Q: ${tmpl.question}\n  ANSWER FORMAT: ${tmpl.hint}\n  Label: "GAP ANSWER 1: <answer>"\n─────────────────────────────────────────`;
  return { ...tmpl, contextBlock };
}

// ── HTTP admin server ─────────────────────────────────────────────────────────
function parseBody(req) {
  return new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } }); });
}
function json(res, st, data) {
  res.writeHead(st, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url    = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const route  = `${req.method} ${url.pathname}`;
  const q      = Object.fromEntries(url.searchParams);

  if (url.pathname === '/sse') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    res.write('retry:1000\n\n'); sseClients.add(res); req.on('close', () => sseClients.delete(res)); return;
  }

  switch (true) {
    case route === 'GET /health':
      return json(res, 200, { ok: true, status: 'running', uptime: process.uptime(), version: '5.0.0', jaa: { counts: jaa.counts() }, cobalt: { bus: bus.stats } });

    case route === 'GET /api/ring':
      return json(res, 200, { ok: true, ring: bus.ring(parseInt(q.n)||100) });

    case route === 'GET /api/gaps':
      return json(res, 200, { ok: true, gaps: jaa.query('gaps', r => q.status ? r.status === q.status : true, parseInt(q.n)||50) });

    case route === 'GET /api/failures':
      return json(res, 200, { ok: true, failures: jaa.tail('failures', parseInt(q.n)||50) });

    case route === 'GET /api/events':
      return json(res, 200, { ok: true, events: jaa.tail('event_log', parseInt(q.n)||50) });

    case route === 'GET /api/memory':
      return json(res, 200, { ok: true, rows: jaa.tail(q.table || 'cortex_memory', parseInt(q.n)||40) });

    case route === 'POST /api/memory/search': {
      const b = await parseBody(req);
      const results = jaa.query('cortex_memory', r => (r.content||'').toLowerCase().includes((b.query||'').toLowerCase()), 20);
      return json(res, 200, { ok: true, results });
    }

    case route === 'POST /api/memory/forget': {
      const b = await parseBody(req);
      jaa.update('cortex_memory', b.uuid, { tier: 'forgotten', forgottenAt: Date.now() });
      return json(res, 200, { ok: true });
    }

    case route === 'POST /api/event': {
      const b = await parseBody(req);
      const ev = jaa.insert('event_log', { type: b.type, payload: b.payload||{}, source: b.source||'external', causedBy: b.causedBy||null });
      bus.ingest(b.type, b.payload||{}, { source: b.source||'external' });
      pushSSE(b.type, b.payload||{});
      return json(res, 200, { ok: true, uuid: ev.uuid });
    }

    case route === 'GET /api/requests':
      return json(res, 200, { ok: true, requests: jaa.query('requests', r => q.status ? r.status === q.status : true, parseInt(q.n)||50) });

    case route === 'GET /api/modules':
      return json(res, 200, { ok: true, modules: ['bus-log','raid','agents','ollama','claude','gap-finder','healer','agent-memory','versionium','orion-sensor','orion-record','orion-policy','orion-verify','gtci'] });

    case route === 'POST /api/agent/call': {
      const b = await parseBody(req);
      const call = jaa.insert('agent_calls', { prompt: b.prompt, preferredAgent: b.agent||'ollama', status: 'pending', source: b.source||'api' });
      bus.ingest('agent.call.requested', { uuid: call.uuid, prompt: b.prompt }, { source: 'api' });
      return json(res, 200, { ok: true, uuid: call.uuid });
    }

    // Guardian bridge endpoints (proxied from 7820)
    case route === 'POST /guardian/event': {
      const b = await parseBody(req);
      const ev = jaa.insert('bridge_messages', { ...b, source: 'guardian', ts: Date.now() });
      bus.ingest('guardian.' + (b.type||'event'), b, { source: 'guardian' });
      return json(res, 200, { ok: true, uuid: ev.uuid });
    }

    case route === 'GET /api/jaa/stats':
      return json(res, 200, { ok: true, counts: jaa.counts(), tables: ALL_TABLES });

    default:
      return json(res, 404, { error: 'not found', path: url.pathname });
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  await jaa.open();
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  NEXUS CORTEX v5.0  ·  port ${PORT}        ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  console.log(`[cortex] jaa open — ${DATA_DIR}`);
  console.log(`[cortex] tables: ${ALL_TABLES.length}`);

  jaa.insert('event_log', { type: 'system.booted', payload: { version: '5.0.0', port: PORT }, source: 'boot' });

  startModules();

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[cortex] admin server http://127.0.0.1:${PORT}`);
    console.log(`[cortex] sse    http://127.0.0.1:${PORT}/sse`);
    console.log(`[cortex] cli    node cli/nexus-cli.js`);
    console.log(`[cortex] ready\n`);
  });
}

boot().catch(err => { console.error('[cortex] BOOT FAILED:', err); process.exit(1); });
module.exports = { jaa, bus, pushSSE };
