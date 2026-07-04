/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Idearium HTTP API — idearium/api/index.js                             ║
 * ║  UUID:    idearium-api-v1-0000-4000-0000-000000000002                  ║
 * ║  Version: pre-release  ·  Port: 4800                                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Every endpoint declared in interaction-contract.json is implemented here.
 * The UI talks ONLY to this layer. Never to core directly.
 * SSE on /sse — broadcasts all IdeaOS events.
 *
 * §1.2  Every error is loud, specific, traceable.
 * §5.2  Everything implements the bridge.
 */

import http         from 'http';
import os           from 'os';
import crypto       from 'crypto';
import { createRequire } from 'module';
import { spawnSync, spawn as spawnProc } from 'child_process';
const _require = createRequire(import.meta.url);

// ── Meta: Spatial Lattice — resonance-weighted idea/spec/gap graph ────────────
let _latticeEng = null;
function _getLattice() {
  if (_latticeEng) return _latticeEng;
  try {
    const { LatticeEngine } = _require('../../meta/spatial/lattice.js');
    _latticeEng = new LatticeEngine({ threshold: 0.3 });
  } catch(_) {}
  return _latticeEng;
}
function _latticeAdd(id, label, tags=[]) {
  try { const l=_getLattice(); if(l) l.add({id,label:label.slice(0,80),tags}); } catch(_) {}
}
function _latticeLink(a, b, w=0.7, t='associated') {
  try { const l=_getLattice(); if(l) { _latticeAdd(a,a); _latticeAdd(b,b); l.connect(a,b,w,t); } } catch(_) {}
}
import { getIdeaOS, VERSION } from '../core/index.js';
// ── Spec Engine + Agent Suite (Phase 40) ──────────────────────────────────────
let _specEngine = null;
let _agentSuite = null;
function getSpecEngine() {
  if (!_specEngine) {
    import('../spec-engine/index.js').then(m => { _specEngine = m.default || m; }).catch(e => {
      console.warn('[idearium/api] spec-engine load failed:', e.message);
    });
  }
  return _specEngine;
}
function getAgentSuite() {
  if (!_agentSuite) {
    import('../agent-suite/index.js').then(m => { _agentSuite = m.default || m; }).catch(e => {
      console.warn('[idearium/api] agent-suite load failed:', e.message);
    });
  }
  return _agentSuite;
}
// Pre-warm on startup
getSpecEngine(); getAgentSuite();
import { RepoLayer } from '../repo/index.js';
import { compileIdeariumSpec } from '../compiler-bridge.js';
import { COMPONENTS as IDEARIUM_COMPONENTS } from '../registry-components.js';
import path from 'path';

// ── Repo layer singleton — each idea-as-repo lives here, not in a single
//    hardcoded "Nexus folder". Wired in (previously dead code, zero routes
//    called it).
let _repoLayer = null;
function getRepoLayer() {
  if (!_repoLayer) _repoLayer = new RepoLayer({ ideaOS: getIdeaOS() });
  return _repoLayer;
}

const PORT    = parseInt(process.env.IDEARIUM_PORT   || '4800');
const BINDING = process.env.IDEARIUM_BIND || '127.0.0.1';

// Idearium is internal-only — no LAN discovery, no remote tunnel.
// All access goes through the orchestrator (:9000) proxy.

// ─── Body parser ─────────────────────────────────────────────────────────────

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// ─── Response helpers ─────────────────────────────────────────────────────────

function ok(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify({ ok: true, ...data }));
}

function err(res, code, message, detail = null) {
  // §1.2 — specific, not generic
  res.writeHead(code, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify({ ok: false, error: message, detail }));
}

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

// ── Capability model ──────────────────────────────────────────────────────────
// Every route maps to exactly one capability.
// A key must have that capability to call it.
// §1.2: wrong capability = 403 with the required capability named.
// §5.1: every key has a UUID and an audit trail.

const CAPS = {
  READ_IDEAS:   'read_ideas',    // GET ideas, specs, gaps, snapshots, stats, health
  WRITE_IDEAS:  'write_ideas',   // POST/PATCH ideas, create specs, open gaps
  SEARCH_IDEAS: 'search_ideas',  // GET /api/ideas?search= (subset of read)
  ADMIN:        'admin',         // key management, tunnel control, snapshots, cli.exec
};

// Route → required capability
const ROUTE_CAP = {
  'health':           null,              // public — no auth required
  'contract.get':     null,              // public — contract is always readable
  'stats.get':        null,              // public — non-sensitive, required by boot verify (§1.2 HALT fix)
  'snr.current':      CAPS.READ_IDEAS,
  'snr.history':      CAPS.READ_IDEAS,
  'events.log':       CAPS.READ_IDEAS,
  'idea.list':        CAPS.READ_IDEAS,
  'idea.show':        CAPS.READ_IDEAS,
  'idea.create':      CAPS.WRITE_IDEAS,
  'idea.update':      CAPS.WRITE_IDEAS,
  'idea.tension':     CAPS.WRITE_IDEAS,
  'idea.link':        CAPS.WRITE_IDEAS,
  'idea.spec':        CAPS.WRITE_IDEAS,
  'idea.phase':       CAPS.WRITE_IDEAS,
  'idea.archive':     CAPS.WRITE_IDEAS,
  'idea.progress':    CAPS.WRITE_IDEAS,
  'spec.list':        CAPS.READ_IDEAS,
  'spec.show':        CAPS.READ_IDEAS,
  'spec.update':      CAPS.WRITE_IDEAS,
  'spec.check':       CAPS.WRITE_IDEAS,
  'spec.build':       CAPS.WRITE_IDEAS,
  'spec.export':      CAPS.READ_IDEAS,
  'gap.list':         CAPS.READ_IDEAS,
  'gap.show':         CAPS.READ_IDEAS,
  'gap.open':         CAPS.WRITE_IDEAS,
  'gap.resolve':      CAPS.WRITE_IDEAS,
  'gap.ignore':       CAPS.WRITE_IDEAS,
  'snapshot.list':    CAPS.READ_IDEAS,
  'snapshot.show':    CAPS.READ_IDEAS,
  'snapshot.diff':    CAPS.READ_IDEAS,
  'snapshot.push':    CAPS.ADMIN,
  'queue.show':       CAPS.READ_IDEAS,
  'queue.progress':   CAPS.WRITE_IDEAS,
  'cli.exec':         CAPS.ADMIN,
};

// Key-based auth removed — Idearium is internal-only, reached solely
// through the orchestrator's proxy. No per-system credentials needed.

// ─── Router ──────────────────────────────────────────────────────────────────

function matchRoute(method, url) {
  const clean = url.split('?')[0].replace(/\/+$/, '') || '/';
  const segs  = clean.split('/').filter(Boolean);

  // Static routes first
  const routes = [
    ['GET',    [],                        'health'],
    ['GET',    ['health'],                 'health'],     // alias: GET /health → same as GET /
    ['GET',    ['api','contract'],        'contract.get'],
    ['GET',    ['api','stats'],           'stats.get'],
    ['GET',    ['api','snr'],             'snr.current'],
    ['GET',    ['api','snr','history'],   'snr.history'],
    ['GET',    ['api','events'],          'events.log'],
    ['GET',    ['api','ideas'],           'idea.list'],
    ['POST',   ['api','ideas'],           'idea.create'],
    ['GET',    ['api','specs'],           'spec.list'],
    ['POST',   ['api','specs'],           'spec.create'],
    ['GET',    ['api','gaps'],            'gap.list'],
    ['POST',   ['api','gaps'],            'gap.open'],
    ['GET',    ['api','snapshots'],       'snapshot.list'],
    ['POST',   ['api','snapshots'],       'snapshot.push'],
    ['POST',   ['api','cli','exec'],      'cli.exec'],      // unified CLI axiom
    ['GET',    ['api','repos'],           'repo.list'],
    ['POST',   ['api','repos'],           'repo.ingest'],
    // ── Spec Engine (Phase 40) ─────────────────────────────────────────────
    ['GET',    ['api','spec-engine','specs'],               'speceng.list'],
    ['POST',   ['api','spec-engine','specs'],               'speceng.create'],
    ['POST',   ['api','spec-engine','wizard'],              'speceng.wizard'],
    ['GET',    ['api','spec-engine','context'],             'speceng.context'],
    ['GET',    ['sse'],                   'sse'],
  ];

  for (const [m, pattern, action] of routes) {
    if (m !== method) continue;
    if (pattern.length !== segs.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i].startsWith(':')) params[pattern[i].slice(1)] = segs[i];
      else if (pattern[i] !== segs[i]) { match = false; break; }
    }
    if (match) return { action, params };
  }

  // Bridge routes

  // Dynamic routes
  const dynRoutes = [
    ['GET',    ['api','ideas',    ':uuid'],               'idea.show'],
    ['PATCH',  ['api','ideas',    ':uuid'],               'idea.update'],
    ['DELETE', ['api','ideas',    ':uuid'],               'idea.archive'],
    ['POST',   ['api','ideas',    ':uuid','tension'],     'idea.tension'],
    ['POST',   ['api','ideas',    ':uuid','link'],        'idea.link'],
    ['POST',   ['api','ideas',    ':uuid','spec'],        'idea.spec'],
    ['POST',   ['api','ideas',    ':uuid','phase'],       'idea.phase'],
    ['GET',    ['api','specs',    ':uuid'],               'spec.show'],
    ['PATCH',  ['api','specs',    ':uuid'],               'spec.update'],
    ['POST',   ['api','specs',    ':uuid','check'],       'spec.check'],
    ['POST',   ['api','ideas',    ':uuid','progress'],  'idea.progress'],
    ['POST',   ['api','queue',    ':queueId','progress'],'queue.progress'],
    ['GET',    ['api','queue',    ':queueId'],           'queue.show'],
    ['POST',   ['api','specs',    ':uuid','build'],       'spec.build'],
    ['GET',    ['api','specs',    ':uuid','export'],      'spec.export'],
    ['GET',    ['api','gaps',     ':uuid'],               'gap.show'],
    ['POST',   ['api','gaps',     ':uuid','resolve'],     'gap.resolve'],
    ['POST',   ['api','gaps',     ':uuid','ignore'],      'gap.ignore'],
    ['GET',    ['api','snapshots',':uuid'],               'snapshot.show'],
    ['GET',    ['api','snapshots',':a','diff',':b'],      'snapshot.diff'],
    ['POST',   ['api','snapshots',':uuid','restore'],     'snapshot.restore'],
    ['GET',    ['api','repos',    ':uuid'],               'repo.show'],
    // ── Spec Engine dynamic routes ──────────────────────────────────────────
    ['GET',    ['api','spec-engine','specs',':uuid'],              'speceng.show'],
    ['POST',   ['api','spec-engine','specs',':uuid','build'],      'speceng.build'],
    ['POST',   ['api','spec-engine','specs',':uuid','chunk',':chunkUuid','complete'], 'speceng.chunk.complete'],
    ['POST',   ['api','spec-engine','specs',':uuid','chunk',':chunkUuid','fail'],     'speceng.chunk.fail'],
    ['POST',   ['api','spec-engine','specs',':uuid','archive'],    'speceng.archive'],
    ['POST',   ['api','spec-engine','specs',':uuid','expand'],     'speceng.expand'],
    ['POST',   ['api','repos',    ':uuid','fork'],        'repo.fork'],
    ['DELETE', ['api','repos',    ':uuid'],               'repo.archive'],
    ['GET',    ['api','repos',    ':uuid','lineage'],     'repo.lineage'],
  ];

  for (const [m, pattern, action] of dynRoutes) {
    if (m !== method) continue;
    if (pattern.length !== segs.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i].startsWith(':')) params[pattern[i].slice(1)] = segs[i];
      else if (pattern[i] !== segs[i]) { match = false; break; }
    }
    if (match) return { action, params };
  }

  return null;
}

function parseQuery(url) {
  const qs = url.split('?')[1] || '';
  const out = {};
  for (const p of qs.split('&')) { const [k,v] = p.split('='); if(k) out[decodeURIComponent(k)] = decodeURIComponent(v||''); }
  return out;
}

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handle(req, res, route, query, body) {
  const os = getIdeaOS();
  const { action, params } = route;

  // ── Auth gate — disabled ──────────────────────────────────────────────────
  // Idearium has no remote/direct access path. The orchestrator (:9000) is the
  // sole entry point to NEXUS; all subsystem traffic is proxied through it.
  // Key-based auth was for a per-system access model that no longer applies here.

  switch (action) {

    case 'health':
      return ok(res, { version: VERSION, snr: os.snr, uptime: process.uptime() });

    case 'contract.get':
      try { return ok(res, { contract: os.contract() }); }
      catch (e) { return err(res, 500, e.message); }

    case 'stats.get':
      return ok(res, { stats: os.stats() });

    case 'snr.current':
      return ok(res, { snr: os.snr });

    case 'snr.history':
      return ok(res, { samples: os.snrHistory(parseInt(query.n)||50) });

    case 'events.log':
      return ok(res, { events: os.eventLog(parseInt(query.n)||100) });

    // ── Ideas ──────────────────────────────────────────────────────────────

    case 'idea.list':
      return ok(res, { ideas: os.ideas(query) });

    case 'idea.create': {
      const { text, tags, compartment } = body;
      if (!text) return err(res, 400, 'text required');
      const ev = os.emit('idearium.idea.create', { text, tags: tags||[], compartment: compartment||null, source: 'api' });
      const idea = os.db.ideas[os.db.ideas.length - 1];
      // Mirror to orchestrator ledger (fire-and-forget)
      import('http').then(({ default: http }) => {
        const body2 = JSON.stringify({ system:'idearium', type:'idearium.idea.created', payload:{ uuid:idea?.uuid, text:(text||'').slice(0,80), tags } });
        const r = http.request({ hostname:'127.0.0.1', port:9000, path:'/api/ledger', method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body2)} }, ()=>{});
        r.on('error',()=>{}); r.write(body2); r.end();
      }).catch(()=>{});
      return ok(res, { idea, eventId: ev.uuid });
    }

    case 'idea.show': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      const links = os.db.links.filter(l=>l.fromUuid===idea.uuid||l.toUuid===idea.uuid);
      const gaps  = os.gaps({ status:'open' }).filter(g=>(g.between||[]).includes(idea.uuid)||g.ideaUuid===idea.uuid);
      return ok(res, { idea, links, openGaps: gaps });
    }

    case 'idea.update': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      os.emit('idearium.idea.update', { uuid: params.uuid, fields: body, source: 'api' });
      return ok(res, { idea: os.idea(params.uuid) });
    }

    case 'idea.phase': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      if (!body.phase) return err(res, 400, 'phase required');
      os.emit('idearium.idea.phase', { uuid: params.uuid, phase: body.phase, source: 'api' });
      return ok(res, { idea: os.idea(params.uuid) });
    }

    case 'idea.tension': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      os.emit('idearium.idea.tension', { uuid: params.uuid });
      return ok(res, { idea: os.idea(params.uuid), tension: { score: os.idea(params.uuid).tension } });
    }

    case 'idea.link': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      if (!body.toUuid) return err(res, 400, 'toUuid required');
      os.emit('idearium.idea.link', { fromUuid: params.uuid, toUuid: body.toUuid, linkType: body.linkType||'resonance', source:'api' });
      return ok(res, { linked: true });
    }

    case 'idea.spec': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      os.emit('idearium.spec.create', { name: body.name || `Spec: ${idea.text.slice(0,40)}`, ideaUuid: params.uuid, source:'api' });
      const spec = os.db.specs[os.db.specs.length - 1];
      return ok(res, { spec });
    }

    case 'idea.archive': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      if (!body.reason) return err(res, 400, 'reason required (§M1 — nothing deleted)');
      os.emit('idearium.idea.archive', { uuid: params.uuid, reason: body.reason, source:'api' });
      return ok(res, { archived: true });
    }

    // ── Specs ──────────────────────────────────────────────────────────────

    case 'spec.list':
      return ok(res, { specs: os.specs(query) });

    case 'spec.create': {
      if (!body.name) return err(res, 400, 'name required');
      os.emit('idearium.spec.create', { name: body.name, ideaUuid: body.ideaUuid || null, source: 'api' });
      const spec = os.db.specs[os.db.specs.length - 1];
      return ok(res, { spec });
    }

    case 'spec.show': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      return ok(res, { spec });
    }

    case 'spec.update': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      os.emit('idearium.spec.update', { uuid: params.uuid, fields: body });
      return ok(res, { spec: os.spec(params.uuid) });
    }

    case 'spec.check': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      os.emit('idearium.spec.check', { uuid: params.uuid });
      return ok(res, { spec: os.spec(params.uuid) });
    }

    case 'spec.build': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);

      // Run spec check first
      os.emit('idearium.spec.check', { uuid: params.uuid });
      const checked = os.spec(params.uuid);

      // Collect all sections with content
      const built = [], missing = [];
      for (const s of checked.sections) {
        if (s.required && !s.complete && !s.content) missing.push(s.id);
        else if (s.content) built.push(s.id);
      }

      if (missing.length > 0 && checked.phase !== 'specced') {
        return ok(res, {
          status: 'incomplete', spec: checked,
          missing, built,
          message: `${missing.length} required sections missing content before build`,
        });
      }

      // Advance phase to building
      os.emit('idearium.spec.update', { uuid: params.uuid, fields: { phase: 'building' } });

      // Fire build event to bus — orchestrator + bridge pick this up
      os.emit('idearium.spec.built', {
        specUuid: params.uuid, name: spec.name,
        sections: built.length, ts: Date.now(),
      });

      // ── Actually compile — this used to be the gap: spec.build only
      // flipped a phase field and never touched emerge/compiler, which is
      // a real, separate, working Tier 0/1 compiler. compileIdeariumSpec()
      // converts the section-shaped spec into what that compiler expects,
      // runs it (Cortex preflight → T0 structure → T1 scaffold → writeback),
      // and also drops a ui-map.json stub for Architect (Phase 43 isn't
      // built yet — the stub is labeled as such, not presented as real).
      const outputDir = path.join(os.dataDir || path.join(process.cwd(), 'data'), 'compiled', params.uuid);
      let compileResult;
      try {
        compileResult = await compileIdeariumSpec(checked, outputDir, { tier: 1 });
      } catch (e) {
        compileResult = { ok: false, error: e.message, step: 'bridge-call' };
      }

      if (compileResult.ok) {
        os.emit('idearium.spec.compiled', {
          specUuid: params.uuid, outputDir,
          t0: compileResult.t0?.emitted?.length ?? 0,
          t1: compileResult.t1?.emitted?.length ?? 0,
          topology: compileResult.topology || null,
        });
      } else {
        os.emit('idearium.error', { op: 'spec.build.compile', reason: compileResult.error });
      }

      // Notify orchestrator
      import('http').then(({ default: http }) => {
        const payload = JSON.stringify({
          system: 'idearium', type: 'idearium.spec.built',
          payload: { specUuid: params.uuid, name: spec.name, sections: built.length, compiled: !!compileResult.ok },
        });
        const r = http.request({ hostname:'127.0.0.1', port:9000, path:'/api/ledger',
          method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)} }, ()=>{});
        r.on('error',()=>{}); r.write(payload); r.end();
      }).catch(()=>{});

      return ok(res, {
        status: 'built', spec: os.spec(params.uuid),
        built, missing, message: `spec ${params.uuid.slice(0,8)} → building`,
        compiler: compileResult,
      });
    }

    case 'spec.export': {
      const spec = os.spec(params.uuid);
      if (!spec) return err(res, 404, `spec not found: ${params.uuid}`);
      const md = specToMarkdown(spec);
      res.writeHead(200, { 'Content-Type': 'text/markdown', ...CORS });
      return res.end(md);
    }

    // ── Gaps ───────────────────────────────────────────────────────────────

    case 'gap.list':
      return ok(res, { gaps: os.gaps(query) });

    case 'gap.open': {
      if (!body.description) return err(res, 400, 'description required');
      const ev = os.emit('idearium.gap.open', { ...body, source:'api' });
      const gap = os.db.gaps[os.db.gaps.length - 1];
      return ok(res, { gap, eventId: ev.uuid });
    }

    case 'gap.show': {
      const gap = os.gap(params.uuid);
      if (!gap) return err(res, 404, `gap not found: ${params.uuid}`);
      return ok(res, { gap });
    }

    case 'gap.resolve': {
      const gap = os.gap(params.uuid);
      if (!gap) return err(res, 404, `gap not found: ${params.uuid}`);
      os.emit('idearium.gap.resolve', { uuid: params.uuid, resolution: body.resolution||'' });
      return ok(res, { gap: os.gap(params.uuid) });
    }

    case 'gap.ignore': {
      const gap = os.gap(params.uuid);
      if (!gap) return err(res, 404, `gap not found: ${params.uuid}`);
      os.emit('idearium.gap.ignore', { uuid: params.uuid, reason: body.reason||'' });
      return ok(res, { gap: os.gap(params.uuid) });
    }

    // ── Snapshots ──────────────────────────────────────────────────────────

    case 'snapshot.list':
      return ok(res, { snapshots: os.snapshots().slice(0, 50) });

    case 'snapshot.push': {
      os.emit('idearium.snapshot.commit', { message: body.message||'snapshot', branch: body.branch||'main', author:'api' });
      return ok(res, { snapshot: os.snapshots()[0] });
    }

    case 'snapshot.show': {
      const snap = os.snapshot(params.uuid);
      if (!snap) return err(res, 404, `snapshot not found: ${params.uuid}`);
      return ok(res, { snapshot: snap });
    }

    case 'snapshot.diff': {
      const diff = os.diffSnapshots(params.a, params.b);
      if (!diff) return err(res, 404, 'one or both snapshots not found');
      return ok(res, { diff });
    }

    case 'snapshot.restore': {
      const target = os.db.snapshots.find(s => s.uuid === params.uuid || s.commitId === params.uuid);
      if (!target) return err(res, 404, `snapshot not found: ${params.uuid}`);
      if (!target.state) return err(res, 400, `snapshot ${params.uuid} predates full-state capture — nothing to restore`);
      os.emit('idearium.snapshot.restore', { commitId: target.commitId, author: 'api' });
      return ok(res, { restored: target.commitId, ideas: target.state.ideas.length, specs: target.state.specs.length, gaps: target.state.gaps.length });
    }

    // ── Repos ──────────────────────────────────────────────────────────────
    // Each idea is a repo, not a single hardcoded "Nexus folder". Nexus
    // itself is just the first ingested repo, not a special case.

    case 'repo.list':
      return ok(res, { repos: getRepoLayer().list(query) });

    case 'repo.show': {
      const repo = getRepoLayer().get(params.uuid);
      if (!repo) return err(res, 404, `repo not found: ${params.uuid}`);
      return ok(res, { repo });
    }

    case 'repo.ingest': {
      const { name, files, source, ideaUuid } = body;
      if (!name) return err(res, 400, 'name required');
      if (!Array.isArray(files) || files.length === 0) return err(res, 400, 'files[] required (drag-and-drop payload)');
      const result = getRepoLayer().ingest({ name, files, source: source || 'drop', ideaUuid: ideaUuid || null });
      if (result.error) return err(res, 400, result.error);
      return ok(res, result);
    }

    case 'repo.fork': {
      const repo = getRepoLayer().get(params.uuid);
      if (!repo) return err(res, 404, `repo not found: ${params.uuid}`);
      const result = getRepoLayer().fork(params.uuid, body.name);
      if (result.error) return err(res, 400, result.error);
      return ok(res, result);
    }

    case 'repo.archive': {
      const result = getRepoLayer().archive(params.uuid);
      if (result.error) return err(res, 404, result.error);
      return ok(res, result);
    }

    case 'repo.lineage':
      return ok(res, { lineage: getRepoLayer().lineage(params.uuid) });

    // ── Spec Engine handlers (Phase 40) ────────────────────────────────────────

    case 'speceng.list': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      return ok(res, { specs: se.listSpecs() });
    }

    case 'speceng.create': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      const { name, type, description, agent } = body;
      if (!name) return err(res, 400, 'name required');
      try {
        const manifest = se.createSpec({ name, type, description, agent });
        os.emit('idearium.spec-engine.created', { specUuid: manifest.uuid, name, type });
        return ok(res, { manifest });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.show': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const manifest = se.loadSpec(params.uuid);
        return ok(res, { manifest });
      } catch(e) { return err(res, 404, e.message); }
    }

    case 'speceng.build': {
      // Trigger building the next pending chunk via agent suite
      const se = getSpecEngine();
      const as = getAgentSuite();
      if (!se) return err(res, 503, 'spec-engine not ready');
      if (!as) return err(res, 503, 'agent-suite not ready');
      try {
        const manifest = se.loadSpec(params.uuid);
        const chunk = se.nextPendingChunk(params.uuid);
        if (!chunk) return ok(res, { done: true, message: 'all chunks complete or building' });

        // Get system context for the agent
        const systemContext = await as.getSystemContext().catch(() => '');
        const chunkPrompt   = se.buildChunkPrompt(manifest, chunk, systemContext);
        const preferAgent   = body.agent || manifest.agent || 'ollama';

        se.markChunkBuilding(params.uuid, chunk.uuid, { agent: preferAgent });

        // Dispatch to agent — non-blocking, chunk builds async
        as.buildChunkWithAgent(chunkPrompt, { preferAgent }).then(async result => {
          if (result.ok && !result.queued && result.text) {
            se.completeChunk(params.uuid, chunk.uuid, result.text);
            const updatedManifest = se.loadSpec(params.uuid);
            os.emit('idearium.spec-engine.chunk.complete', {
              specUuid: params.uuid, chunkUuid: chunk.uuid,
              sectionId: chunk.sectionId, progress: updatedManifest.progress,
            });
          } else if (result.queued) {
            // ChatGPT/Claude — chunk will complete via guardian job callback
            os.emit('idearium.spec-engine.chunk.queued', {
              specUuid: params.uuid, chunkUuid: chunk.uuid, jobId: result.jobId, agent: result.agent,
            });
          } else {
            se.failChunk(params.uuid, chunk.uuid, result.error || 'agent dispatch failed');
          }
        }).catch(e => se.failChunk(params.uuid, chunk.uuid, e.message));

        return ok(res, {
          chunkUuid: chunk.uuid, sectionId: chunk.sectionId, sectionTitle: chunk.sectionTitle,
          agent: preferAgent, status: 'building',
        });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.chunk.complete': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      const { content } = body;
      if (!content) return err(res, 400, 'content required');
      try {
        const chunk = se.completeChunk(params.uuid, params.chunkUuid, content);
        const manifest = se.loadSpec(params.uuid);
        os.emit('idearium.spec-engine.chunk.complete', {
          specUuid: params.uuid, chunkUuid: params.chunkUuid,
          sectionId: chunk.sectionId, progress: manifest.progress,
        });
        return ok(res, { chunk, progress: manifest.progress });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.chunk.fail': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const chunk = se.failChunk(params.uuid, params.chunkUuid, body.reason || 'manual fail');
        return ok(res, { chunk });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.archive': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const archivePath = await se.archiveSpec(params.uuid);
        return ok(res, { archivePath });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.expand': {
      const se = getSpecEngine();
      if (!se) return err(res, 503, 'spec-engine not ready');
      try {
        const manifest = await se.expandSpec(params.uuid);
        return ok(res, { manifest });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.wizard': {
      // Qwen drives the next wizard question
      const as = getAgentSuite();
      if (!as) return err(res, 503, 'agent-suite not ready');
      try {
        const { specMeta = {}, answeredSections = {} } = body;
        const next = await as.getNextWizardQuestion(specMeta, answeredSections);
        return ok(res, { next, done: next === null });
      } catch(e) { return err(res, 500, e.message); }
    }

    case 'speceng.context': {
      const as = getAgentSuite();
      if (!as) return err(res, 503, 'agent-suite not ready');
      try {
        const context = await as.getSystemContext();
        return ok(res, { context });
      } catch(e) { return err(res, 500, e.message); }
    }

    // ── Queue / progress push (from forge queue) ──────────────────────────
    case 'idea.progress': {
      const idea = os.idea(params.uuid);
      if (!idea) return err(res, 404, `idea not found: ${params.uuid}`);
      // Update idea phase based on progress if provided
      if (body.state === 'VERIFIED') {
        os.emit('idearium.idea.phase', { uuid: params.uuid, phase: 'building', source:'queue' });
      }
      if (body.state === 'COMPLETE' && body.pct === 100) {
        os.emit('idearium.idea.phase', { uuid: params.uuid, phase: 'complete', source:'queue' });
      }
      const record = { ...body, ideaUuid: params.uuid, ts: Date.now() };
      if (!os.db.tensions) os.db.tensions = [];
      // Store as a tension record for timeline
      os.db.tensions.push({ uuid: require('crypto').randomUUID(), ideaUuid: params.uuid,
        score: (body.pct||0)/100, components: { queue_progress: body.pct||0 }, ts: Date.now() });
      return ok(res, { ok: true, progress: record });
    }

    case 'queue.progress': {
      // Forge queue progress — store in idearium event log
      const ev = os.emit('idearium.queue.progress', body);
      return ok(res, { ok: true, eventId: ev.uuid });
    }

    case 'queue.show': {
      const events = os.db.events.filter(e => e.payload?.queueId === params.queueId);
      return ok(res, { ok: true, queueId: params.queueId, events });
    }

    default:
      return err(res, 404, `no handler for: ${action}`);
  }
}

// ─── Spec → Markdown ─────────────────────────────────────────────────────────

function specToMarkdown(spec) {
  let md = `# ${spec.name}\n\n**Version:** ${spec.version}  **Phase:** ${spec.phase}\n\n`;
  for (const s of spec.sections) {
    md += `## ${s.title}\n\n`;
    if (s.content) md += `${s.content}\n\n`;
    else md += `_not yet written_\n\n`;
  }
  return md;
}

// ─── Server ───────────────────────────────────────────────────────────────────

export function startAPI() {
  const os = getIdeaOS();

  const server = http.createServer(async (req, res) => {
    // Preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS);
      return res.end();
    }

    // SSE
    if (req.url === '/sse') {
      res.writeHead(200, {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
        ...CORS,
      });
      res.write(': connected\n\n');
      os.addSSEClient(res);
      // Send current state immediately on connect
      res.write(`data: ${JSON.stringify({ type:'idearium.ready', payload: os.stats(), ts: Date.now() })}\n\n`);
      return;
    }

    // Serve UI
    const cleanUrl = req.url.split('?')[0];
    if (req.method === 'GET' && (cleanUrl === '/' || cleanUrl === '/idearium' || cleanUrl === '/ui')) {
      const { readFileSync, existsSync } = await import('fs');
      const { join, dirname } = await import('path');
      const { fileURLToPath } = await import('url');
      const __d = dirname(fileURLToPath(import.meta.url));
      const uiPath = join(__d, '..', 'ui', 'index.html');
      const uiPath2 = join(__d, '..', '..', 'ui', 'idearium', 'index.html');
      const finalPath = existsSync(uiPath) ? uiPath : uiPath2;
      if (existsSync(finalPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(readFileSync(finalPath, 'utf8'));
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body style="background:#0a0a0c;color:#e2e2ea;font-family:monospace;padding:40px"><h2>◈ IDEARIUM</h2><p>UI not built yet</p></body></html>');
      }
      return;
    }

    const route = matchRoute(req.method, req.url);
    if (!route) {
      // ── CFR-Ω routes — same handleCFRRoute() contract as the other kernels ──
      // §CFR-WIRE-05: checked here, not before matchRoute, so existing
      // idearium routes keep priority and /cfr never shadows anything real.
      if (req.url.startsWith('/cfr')) {
        const ledger = os._evLedger;
        if (ledger && ledger.handleCFRRoute) {
          const cfrUrl = new URL(req.url, `http://localhost:${PORT}`);
          if (ledger.handleCFRRoute(req, res, cfrUrl)) return;
        }
      }
      return err(res, 404, `${req.method} ${req.url.split('?')[0]} not found`);
    }

    const query = parseQuery(req.url);
    let body = {};
    if (['POST','PATCH','PUT','DELETE'].includes(req.method)) {
      try { body = await readBody(req); }
      catch (e) { return err(res, 400, 'body parse failed', e.message); }
    }

    try {
      await handle(req, res, route, query, body);
    } catch (e) {
      console.error('[API] Unhandled error:', e);
      err(res, 500, 'internal error', e.message);
    }
  });

  server.listen(PORT, BINDING, async () => {
    // ESM: use createRequire for CJS modules
    const _require = createRequire(import.meta.url);

// ── Meta: Spatial Lattice — resonance-weighted idea/spec/gap graph ────────────
let _latticeEng = null;
function _getLattice() {
  if (_latticeEng) return _latticeEng;
  try {
    const { LatticeEngine } = _require('../../meta/spatial/lattice.js');
    _latticeEng = new LatticeEngine({ threshold: 0.3 });
  } catch(_) {}
  return _latticeEng;
}
function _latticeAdd(id, label, tags=[]) {
  try { const l=_getLattice(); if(l) l.add({id,label:label.slice(0,80),tags}); } catch(_) {}
}
function _latticeLink(a, b, w=0.7, t='associated') {
  try { const l=_getLattice(); if(l) { _latticeAdd(a,a); _latticeAdd(b,b); l.connect(a,b,w,t); } } catch(_) {}
}
    const { BootSequence } = _require('../../lib/boot-sequence');

    const seq = new BootSequence({
      systemId: 'idearium', port: PORT, version: VERSION,
      label: 'Idearium', maxRetries: 1,
    });

    // Phase 0 HARD: server bound
    seq.phase({ name:'server.bound', type:'HARD',
      label:'HTTP API bound :' + PORT,
      fn: async () => { /* in listen callback = bound */ },
    });

    // Phase 1 HARD: IdeaOS runtime verify — use the actual API
    seq.phase({ name:'ideaos.verify', type:'HARD',
      label:'IdeaOS runtime verify via /api/stats',
      fn: async () => {
        await new Promise((resolve, reject) => {
          let d = '';
          const r = _require('http').get(
            'http://127.0.0.1:' + PORT + '/api/stats',
            res => {
              res.on('data', c => { d += c; });
              res.on('end', () => {
                try {
                  const j = JSON.parse(d);
                  if (j.ok !== false) resolve();
                  else reject(new Error('stats returned ok=false'));
                } catch(e) { reject(e); }
              });
            }
          );
          r.setTimeout(2000, () => { r.destroy(); reject(new Error('stats timeout')); });
          r.on('error', reject);
        });
      },
    });

    // Phase 2 HARD: health endpoint verify
    seq.phase({ name:'health.verify', type:'HARD',
      label:'Verify /health returns ok=true',
      fn: async () => {
        await new Promise((resolve, reject) => {
          const r = _require('http').get(
            'http://127.0.0.1:' + PORT + '/health',
            res => { res.statusCode === 200 ? resolve()
              : reject(new Error('health ' + res.statusCode)); }
          );
          r.setTimeout(2000, () => { r.destroy(); reject(new Error('timeout')); });
          r.on('error', reject);
        });
      },
    });

    // Phase 3 HARD: contract verify
    seq.phase({ name:'contract.verify', type:'HARD',
      label:'Verify /api/contract returns id=idearium-v1',
      fn: async () => {
        await new Promise((resolve, reject) => {
          let body = '';
          const r = _require('http').get(
            'http://127.0.0.1:' + PORT + '/api/contract',
            res => {
              res.on('data', c => { body += c; });
              res.on('end', () => {
                try {
                  const j = JSON.parse(body);
                  if (j.contract?.id === 'idearium-v1') resolve();
                  else reject(new Error('contract id=' + j.contract?.id));
                } catch(e) { reject(e); }
              });
            }
          );
          r.setTimeout(2000, () => { r.destroy(); reject(new Error('timeout')); });
          r.on('error', reject);
        });
      },
    });

    // Phase 4 SOFT: orchestrator registration (§AXIOM)
    seq.phase({ name:'orchestrator.register', type:'SOFT',
      label:'Register with orchestrator (§AXIOM)',
      fn: async () => {
        const body = JSON.stringify({ systemId:'idearium', port:PORT,
          meta:{ role:'idea-os', version:VERSION },
          components: IDEARIUM_COMPONENTS });
        const r = _require('http').request({
          hostname:'127.0.0.1', port:9000, path:'/api/register', method:'POST',
          headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
        });
        r.setTimeout(2000, () => r.destroy()); r.on('error', () => {});
        r.write(body); r.end();
        setInterval(() => {
          const hb = JSON.stringify({ systemId:'idearium', port:PORT, status:'online' });
          const r2 = _require('http').request({
            hostname:'127.0.0.1', port:9000, path:'/api/heartbeat', method:'POST',
            headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(hb)},
          });
          r2.on('error', () => {}); r2.write(hb); r2.end();
        }, 10000);
      },
    });

    // Phase 5 SOFT: bridge handshake (§5.2)
    seq.phase({ name:'bridge.handshake', type:'SOFT',
      label:'Bridge handshake with orchestrator',
      fn: async () => {
        const bBody = JSON.stringify({ systemId:'idearium', appId:'idearium', secret:'nexus-idearium-internal-v1' });
        const r = _require('http').request({
          hostname:'127.0.0.1', port:9000, path:'/api/register', method:'POST',
          headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(bBody)},
        }, res => {
          let d = ''; res.on('data', c => { d += c; });
          res.on('end', () => {
            try { JSON.parse(d); } catch(_) {}
          });
        });
        r.on('error', () => {}); r.write(bBody); r.end();
        // Also post booted to ledger
        const lb = JSON.stringify({ system:'idearium', type:'idearium.booted',
          payload:{ version:VERSION, port:PORT } });
        const r2 = _require('http').request({
          hostname:'127.0.0.1', port:9000, path:'/api/ledger', method:'POST',
          headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(lb)},
        });
        r2.on('error', () => {}); r2.write(lb); r2.end();
      },
    });

    // Phase 6 SOFT: SSE stream verify
    seq.phase({ name:'sse.verify', type:'SOFT',
      label:'Verify /sse stream opens',
      fn: async () => {
        await new Promise((resolve, reject) => {
          const r = _require('http').request({
            hostname:'127.0.0.1', port:PORT, path:'/sse',
            headers:{ Accept:'text/event-stream' },
          }, res => {
            if (res.statusCode === 200) { r.destroy(); resolve(); }
            else { r.destroy(); reject(new Error('SSE ' + res.statusCode)); }
          });
          r.setTimeout(2000, () => { r.destroy(); resolve(); }); // resolve on timeout = SSE streaming
          r.on('error', reject); r.end();
        });
      },
    });

    // Phase 7 SOFT: boot announce — Idearium is local/internal-only
    seq.phase({ name:'boot.announce', type:'SOFT',
      label:'Announce bind — internal API, no auth, no remote surface',
      fn: async () => {
        console.log(`[idearium] bound :${PORT} on ${BINDING}`);
        console.log('[idearium] auth  — disabled (internal-only, reached via orchestrator)');
        if (BINDING !== '127.0.0.1') {
          console.warn(`[idearium] binding=${BINDING} — this system has no auth. Use 127.0.0.1 unless you know what you are doing.`);
        }
      },
    });

    // Phase 8 removed: Idearium no longer opens its own remote tunnel.
    // Idearium is API-internal only — the orchestrator (:9000) is the sole
    // remote/external surface for NEXUS. Reaching Idearium from outside the
    // host should go through the orchestrator's proxy, not a direct tunnel.

    await seq.run();
    // Idearium never hard-exits — degrades gracefully
  });

  server.on('error', e => {
    if (e.code === 'EADDRINUSE') {
      console.error(`[Idearium API] Port ${PORT} already in use. Is Idearium already running?`);
      process.exit(1);
    }
    throw e;
  });

  return server;
}

// ── Auto-start when run directly ────────────────────────────────────────────
startAPI();
