/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  IdeaOS — idearium/core/index.js                                       ║
 * ║  UUID:    idearium-core-v1-0000-4000-0000-000000000001                 ║
 * ║  Version: pre-release                                                        ║
 * ║  Layer:   idearium.core                                                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * The Idea OS. Not a notes app. Not a todo list.
 * Every idea is a JAA node with causal ancestry, tension score, and a spec.
 * All state lives here. CLI and API are projections. UI is a projection of API.
 *
 * §8.3  SISO is a load-order prerequisite.
 * §3.1  Foundation before modules. Modules before UI.
 * §1.2  Nothing silently fails.
 * §2.1  Persistence is the golden rule.
 * §5.1  Everything has a UUID.
 * §7.1  Dual ledger — Upgrade Ledger (truth) + Idea Ledger (cognition).
 */

import { Event, Gate, Stream, StreamLog } from '../siso/core/index.js';
import { registerCortexListeners } from './lib/cortex-listeners.js';
import { createRequire } from 'module';
import { randomUUID }    from 'crypto';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadTable, syncTable, migrateOnce } from './lib/db.js';

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── Constants ────────────────────────────────────────────────────────────────

export const VERSION   = '3.0.0';
export const NAMESPACE = 'idearium';
export const PORT      = 4800;

export const IDEA_PHASES   = ['seed','expanding','tensioned','specced','building','complete','archived'];
export const GAP_STATUSES  = ['open','resolved','ignored','archived'];
export const GAP_SEVERITIES= ['fatal','high','medium','low'];
export const LINK_TYPES    = ['resonance','tension','causal','temporal','semantic'];

// SNR translation table — from interaction-contract spec
export const SNR_WEIGHTS = {
  'idea.created':   0.9,
  'spec.created':   0.95,
  'spec.built':     1.0,
  'gap.resolved':   0.85,
  'ci.run':         0.9,
  'push.complete':  0.95,
  'idea.tensioned': 0.7,
  'spec.updated':   0.6,
  'idea.updated':   0.5,
  'idea.linked':    0.65,
  'snr.update':     0.1,
  'guardian.health':0.15,
  'idea.archived':  0.2,
  'gap.ignored':    0.3,
};
const SNR_WINDOW = 50;

// ─── Storage ──────────────────────────────────────────────────────────────────

// §DB-MIGRATION 2026-07-14 — "idearium needs to use a database, in cortex."
// idearium was the last subsystem in NEXUS still on hand-rolled flat-file
// JSON (idearium.json rewritten WHOLE on every single mutation — every idea
// edit re-serialized every idea, every gap, every event, every snapshot's
// full deep-cloned state). Everything else already shares cortex's real
// store (guardian/jaa-store.js, tables-as-Maps, per-table debounced disk
// flush) via cortex/memory/jaa-db.js. idearium/lib/db.js plugs into that
// exact seam — see its header for the full rationale. This file no longer
// owns any storage mechanics of its own, only table names and which keys
// each gate touches.
//
// Was '../../data' — idearium/ -> .. -> nexus/ -> .. -> OUTSIDE the repo
// entirely. Every "ideas 0 / specs 0" all session was this: loadDB() found
// no file at the (wrong) resolved path and silently returned freshDB() —
// never touching the real data at nexus/data/idearium.json. Same off-by-one
// as the event ledger path, same root cause, fixed together. The flat file
// this bug describes is now only read ONCE, as a migration source (below) —
// left on disk afterward, untouched, as an archive (§7.4).
const DATA_DIR = join(__dir, '../data');
const DB_FILE  = join(DATA_DIR, 'idearium.json');

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

// idearium_<key> — kept out of cortex's own table namespace (artifacts,
// gaps, ledger_entries, settings, ...); cortex's own 'gaps' are a different
// thing (system-wide gap detection) from idearium's idea-gaps.
const TABLES = {
  ideas:     'idearium_ideas',
  specs:     'idearium_specs',
  gaps:      'idearium_gaps',
  links:     'idearium_links',
  snapshots: 'idearium_snapshots',
  events:    'idearium_events',
  snr:       'idearium_snr',
  tensions:  'idearium_tensions',
};

function readLegacyFlatFile() {
  if (!existsSync(DB_FILE)) return null;
  try { return JSON.parse(readFileSync(DB_FILE, 'utf8')); }
  catch (err) { console.error(`[IdeaOS] legacy flat-file unreadable, skipping migration: ${err.message}`); return null; }
}

function loadDB() {
  ensureDataDir();
  const db = freshDB();
  const legacy = readLegacyFlatFile();
  for (const [key, table] of Object.entries(TABLES)) {
    const mig = migrateOnce(table, legacy ? (legacy[key] || []) : [], 'uuid');
    if (mig.migrated) console.log(`[IdeaOS] migrated ${mig.count} legacy '${key}' rows -> cortex table '${table}'`);
    db[key] = loadTable(table);
  }
  return db;
}

// `keys`: which of db's arrays actually changed — only those tables get
// diffed/written. Omit (or pass nothing) to sync everything, which stays
// correct but loses the point of a per-table store; every call site below
// names its keys explicitly.
function saveDB(db, keys) {
  const list = (keys && keys.length) ? keys : Object.keys(TABLES);
  for (const key of list) {
    if (!TABLES[key]) { console.error(`[IdeaOS][ERROR] saveDB: unknown table key '${key}'`); continue; }
    syncTable(TABLES[key], db[key] || [], 'uuid');
  }
}

function freshDB() {
  return {
    _version:  VERSION,
    _savedAt:  null,
    ideas:     [],
    specs:     [],
    gaps:      [],
    links:     [],
    snapshots: [],
    events:    [],
    snr:       [],
    tensions:  [],
  };
}

// ─── IdeaOS ───────────────────────────────────────────────────────────────────

export class IdeaOS {
  constructor() {
    this.log    = new StreamLog('DATA');
    this.stream = new Stream({ log: this.log });
    this.db     = loadDB();
    this._sseClients = new Set(); // HTTP SSE subscribers
    // §LAW II — event ledger: every emit written before routing
    try {
      const _require = createRequire(import.meta.url);
      // §CFR-WIRE-04: this used to require('../../lib/event-ledger') — one
      // '..' too many (idearium/ -> .. -> nexus/ -> .. -> outside the repo),
      // so _evLedger was permanently null. Fixed path AND upgraded straight
      // to the CFR-Ω ledger (sigma/delta/field annotation + /cfr/* routes),
      // same drop-in surface as cortex/guardian/bridge/orchestrator.
      const { createCFRLedger } = _require('../meta/cfr/ledger');
      this._evLedger = createCFRLedger({
        ledgerDir: _require('path').join(_require('path').dirname(
          _require('url').fileURLToPath(import.meta.url)), '../data/idearium'),
        systemId: 'idearium',
      });
      this._evLedger.open();
      this._evLedger.startAutoSave(60000);
    } catch(e) { this._evLedger = null; console.error(`[idearium][ERROR] cfr ledger init failed: ${e.message}`); }

    this._registerGates();
    // Side-channel observer, not a gate — persists chunk completions and
    // build artifacts into cortex as they happen. See lib/cortex-listeners.js.
    try { registerCortexListeners(this); }
    catch (e) { console.error(`[IdeaOS] cortex listener registration failed: ${e.message}`); }
    this._recalcSNR();
    console.log(`[IdeaOS] v${VERSION} — ${this.db.ideas.length} ideas, ${this.db.gaps.filter(g=>g.status==='open').length} open gaps, SNR ${this.snr.toFixed(3)}`);
  }

  // ─── Gate Registration ──────────────────────────────────────────────────────

  _registerGates() {
    const S = this.stream;
    // Every mutation is a gate. No state change outside the stream. (§5.1, §5.7)
    S.register(new IdeaCreateGate(this));
    S.register(new IdeaUpdateGate(this));
    S.register(new IdeaPhaseGate(this));
    S.register(new IdeaLinkGate(this));
    S.register(new IdeaTensionGate(this));
    S.register(new IdeaArchiveGate(this));
    S.register(new SpecArchiveGate(this));
    S.register(new SpecCreateGate(this));
    S.register(new SpecUpdateGate(this));
    S.register(new SpecCheckGate(this));
    S.register(new GapOpenGate(this));
    S.register(new GapResolveGate(this));
    S.register(new GapIgnoreGate(this));
    S.register(new SnapshotGate(this));
    S.register(new SnapshotRestoreGate(this));
    S.register(new SNRSampleGate(this));
    S.register(new ErrorGate(this));
  }

  // ─── Public emit (all mutations go through here) ────────────────────────────

  emit(type, data = {}, causedBy = null) {
    // §LAW II — write to ledger before any subscriber sees this event
    if (this._evLedger) {
      this._evLedger.record(type, data, { causedBy, source: 'idearium' });
    }
    const ev = {
      uuid:     randomUUID(),
      type,
      payload:  data,
      causedBy,
      source:   'idearium.core',
      ts:       Date.now(),
    };
    // Append-only event log (§7.6)
    this.db.events.push(ev);
    if (this.db.events.length > 5000) this.db.events = this.db.events.slice(-5000);

    // Route through SISO stream
    this.stream.emit(new Event(type, { ...data, _ev: ev }));

    // SNR sample
    if (SNR_WEIGHTS[type] !== undefined) {
      this.stream.emit(new Event('idearium.snr.sample', { eventType: type, weight: SNR_WEIGHTS[type] }));
    }

    // Broadcast to SSE clients
    this._broadcast(ev);
    return ev;
  }

  // ─── SSE broadcast ──────────────────────────────────────────────────────────

  addSSEClient(res) {
    this._sseClients.add(res);
    res.on('close', () => this._sseClients.delete(res));
  }

  _broadcast(ev) {
    const data = `data: ${JSON.stringify(ev)}\n\n`;
    for (const client of this._sseClients) {
      try { client.write(data); } catch {}
    }
  }

  // ─── Query API (read-only, no gates needed) ──────────────────────────────────

  ideas(filter = {}) {
    let rows = this.db.ideas;
    if (filter.phase)     rows = rows.filter(i => i.phase === filter.phase);
    if (filter.tag)       rows = rows.filter(i => (i.tags||[]).includes(filter.tag));
    if (filter.search)    { const q = filter.search.toLowerCase(); rows = rows.filter(i => i.text?.toLowerCase().includes(q) || (i.tags||[]).some(t=>t.includes(q))); }
    if (filter.sort === 'tension') rows = [...rows].sort((a,b)=>(b.tension||0)-(a.tension||0));
    else if (filter.sort === 'updated') rows = [...rows].sort((a,b)=>b.updatedAt-a.updatedAt);
    if (filter.limit)     rows = rows.slice(0, parseInt(filter.limit));
    return rows;
  }

  idea(uuid)     { return this.db.ideas.find(i=>i.uuid===uuid) || null; }
  spec(uuid)     { return this.db.specs.find(s=>s.uuid===uuid) || null; }
  specs(filter={}) {
    let rows = this.db.specs;
    if (filter.phase) rows = rows.filter(s=>s.phase===filter.phase);
    return rows;
  }
  gap(uuid)      { return this.db.gaps.find(g=>g.uuid===uuid)  || null; }
  gaps(filter={}) {
    let rows = this.db.gaps;
    if (filter.status)   rows = rows.filter(g=>g.status===filter.status);
    if (filter.severity) rows = rows.filter(g=>g.severity===filter.severity);
    if (filter.type)     rows = rows.filter(g=>g.type===filter.type);
    return rows;
  }
  snapshots()    { return this.db.snapshots; }
  snapshot(uuid) { return this.db.snapshots.find(s=>s.uuid===uuid) || null; }
  eventLog(n=100){ return this.db.events.slice(-n); }
  snrHistory(n=50){ return this.db.snr.slice(-n); }

  // ─── SNR ────────────────────────────────────────────────────────────────────

  _recalcSNR() {
    const window = this.db.snr.slice(-SNR_WINDOW);
    if (!window.length) { this.snr = 0.5; return; }
    const avg = window.reduce((s,r) => s + r.snrValue, 0) / window.length;
    this.snr = Math.round(avg * 1000) / 1000;
  }

  // ─── Tension ────────────────────────────────────────────────────────────────

  computeTension(idea) {
    const openGaps = this.db.gaps.filter(g => g.status==='open' && (g.ideaUuid===idea.uuid || (g.between||[]).includes(idea.uuid)));
    const gapDensity = Math.min(openGaps.length * 0.15, 0.30);

    const active = new Set(this.db.ideas.filter(i=>i.phase!=='archived').map(i=>i.uuid));
    const contra = (idea.tensionWith||[]).filter(u=>active.has(u));
    const contradiction = Math.min(contra.length * 0.10, 0.25);

    const staleDays = (Date.now() - idea.updatedAt) / 86400000;
    let novelty = 0;
    if (staleDays > 7  && idea.phase === 'seed')      novelty += 0.10;
    if (staleDays > 21 && idea.phase === 'seed')      novelty += 0.10;
    if (staleDays > 7  && idea.phase === 'expanding') novelty += 0.05;

    const depLinks = this.db.links.filter(l => l.fromUuid===idea.uuid || l.toUuid===idea.uuid);
    const resourceCost = Math.min(depLinks.length * 0.03, 0.15);

    const score = Math.round(Math.min(gapDensity + contradiction + novelty + resourceCost, 1.0) * 1000) / 1000;
    return {
      score,
      components: { gap_density: gapDensity, contradiction, novelty, resource_cost: resourceCost, dependency_depth: 0 },
    };
  }

  // ─── Snapshot diff ──────────────────────────────────────────────────────────

  diffSnapshots(uuidA, uuidB) {
    const a = this.snapshot(uuidA);
    const b = this.snapshot(uuidB);
    if (!a || !b) return null;
    return {
      a: uuidA, b: uuidB,
      gapDelta:   (b.gapCount || 0) - (a.gapCount || 0),
      ideaDelta:  (b.ideasCount || 0) - (a.ideasCount || 0),
      snrDelta:   Math.round(((b.snr||0) - (a.snr||0)) * 1000) / 1000,
    };
  }

  // ─── Contract ───────────────────────────────────────────────────────────────

  contract() {
    const contractPath = join(__dir, 'schemas/interaction-contract.json');
    if (!existsSync(contractPath)) throw new Error('interaction-contract.json not found');
    return JSON.parse(readFileSync(contractPath, 'utf8'));
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────

  stats() {
    const ideas = this.db.ideas;
    const phaseMap = {};
    for (const p of IDEA_PHASES) phaseMap[p] = ideas.filter(i=>i.phase===p).length;
    return {
      version:      VERSION,
      ideasTotal:   ideas.length,
      phaseMap,
      openGaps:     this.db.gaps.filter(g=>g.status==='open').length,
      totalGaps:    this.db.gaps.length,
      snapshots:    this.db.snapshots.length,
      specs:        this.db.specs.length,
      links:        this.db.links.length,
      events:       this.db.events.length,
      snr:          this.snr,
      savedAt:      this.db._savedAt,
    };
  }
}

// ─── Gates ────────────────────────────────────────────────────────────────────

class IdeaCreateGate extends Gate {
  constructor(os) { super('idearium.idea.create'); this.os = os; }
  transform(event, stream) {
    const { text, tags = [], compartment = null, source = 'cli', causedBy = null } = event.data;
    if (!text || text.trim().length < 3) {
      stream.emit(new Event('idearium.error', { op: 'idea.create', reason: 'text must be ≥3 chars' }));
      return;
    }
    const uuid = randomUUID();
    const slug = text.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0,50);
    const idea = {
      uuid, slug, text: text.trim(), tags, phase: 'seed',
      tension: 0, tensionUpdatedAt: null,
      parentIdea: null, linkedSpec: null,
      resonanceWith: [], tensionWith: [], openGaps: [],
      stability: { execution:1.0, runtime:1.0, effectiveness:1.0, rigidity:1.0, persistence:1.0 },
      compartment, archiveReason: null, archivedAt: null,
      causedBy, source, createdAt: Date.now(), updatedAt: Date.now(),
    };
    this.os.db.ideas.push(idea);
    saveDB(this.os.db, ['ideas']);
    stream.emit(new Event('idearium.idea.created', { idea }));
    this.os._broadcast({ uuid: randomUUID(), type: 'idea.created', payload: idea, ts: Date.now() });
  }
}

class IdeaUpdateGate extends Gate {
  constructor(os) { super('idearium.idea.update'); this.os = os; }
  transform(event, stream) {
    const { uuid, fields, causedBy = null } = event.data;
    const idea = this.os.db.ideas.find(i=>i.uuid===uuid);
    if (!idea) { stream.emit(new Event('idearium.error', { op:'idea.update', reason:`uuid not found: ${uuid}` })); return; }
    const allowed = ['text','tags','compartment','resonanceWith','tensionWith','stability','linkedSpec'];
    for (const k of allowed) { if (fields[k] !== undefined) idea[k] = fields[k]; }
    idea.updatedAt = Date.now();
    idea.causedBy  = causedBy;
    saveDB(this.os.db, ['ideas']);
    stream.emit(new Event('idearium.idea.updated', { idea }));
    this.os._broadcast({ uuid: randomUUID(), type: 'idea.updated', payload: idea, ts: Date.now() });
  }
}

class IdeaPhaseGate extends Gate {
  constructor(os) { super('idearium.idea.phase'); this.os = os; }
  transform(event, stream) {
    const { uuid, phase, causedBy = null } = event.data;
    if (!IDEA_PHASES.includes(phase)) { stream.emit(new Event('idearium.error', { op:'idea.phase', reason:`invalid phase: ${phase}` })); return; }
    const idea = this.os.db.ideas.find(i=>i.uuid===uuid);
    if (!idea) { stream.emit(new Event('idearium.error', { op:'idea.phase', reason:`uuid not found: ${uuid}` })); return; }
    const prev = idea.phase;
    idea.phase = phase; idea.updatedAt = Date.now(); idea.causedBy = causedBy;
    saveDB(this.os.db, ['ideas']);
    stream.emit(new Event('idearium.idea.phase.changed', { uuid, from: prev, to: phase }));
    this.os._broadcast({ uuid: randomUUID(), type: 'idea.updated', payload: idea, ts: Date.now() });
  }
}

class IdeaLinkGate extends Gate {
  constructor(os) { super('idearium.idea.link'); this.os = os; }
  transform(event, stream) {
    const { fromUuid, toUuid, linkType = 'resonance', causedBy = null } = event.data;
    if (!LINK_TYPES.includes(linkType)) { stream.emit(new Event('idearium.error', { op:'idea.link', reason:`invalid linkType: ${linkType}` })); return; }
    const a = this.os.db.ideas.find(i=>i.uuid===fromUuid);
    const b = this.os.db.ideas.find(i=>i.uuid===toUuid);
    if (!a||!b) { stream.emit(new Event('idearium.error', { op:'idea.link', reason:'one or both uuids not found' })); return; }
    // Deduplicate
    const existing = this.os.db.links.find(l=>((l.fromUuid===fromUuid&&l.toUuid===toUuid)||(l.fromUuid===toUuid&&l.toUuid===fromUuid))&&l.linkType===linkType);
    if (existing) { stream.emit(new Event('idearium.error', { op:'idea.link', reason:'link already exists' })); return; }
    const link = { uuid: randomUUID(), fromUuid, toUuid, linkType, causedBy, ts: Date.now() };
    this.os.db.links.push(link);
    // Maintain resonanceWith / tensionWith arrays for quick lookup
    if (linkType==='resonance') { if(!a.resonanceWith.includes(toUuid)) a.resonanceWith.push(toUuid); if(!b.resonanceWith.includes(fromUuid)) b.resonanceWith.push(fromUuid); }
    if (linkType==='tension')   { if(!a.tensionWith.includes(toUuid)) a.tensionWith.push(toUuid); if(!b.tensionWith.includes(fromUuid)) b.tensionWith.push(fromUuid); }
    a.updatedAt = b.updatedAt = Date.now();
    saveDB(this.os.db, ['ideas','links']);
    stream.emit(new Event('idearium.idea.linked', { link }));
    this.os._broadcast({ uuid: randomUUID(), type: 'idea.linked', payload: link, ts: Date.now() });
  }
}

class IdeaTensionGate extends Gate {
  constructor(os) { super('idearium.idea.tension'); this.os = os; }
  transform(event, stream) {
    const { uuid } = event.data;
    const idea = this.os.db.ideas.find(i=>i.uuid===uuid);
    if (!idea) { stream.emit(new Event('idearium.error', { op:'idea.tension', reason:`uuid not found: ${uuid}` })); return; }
    const result = this.os.computeTension(idea);
    idea.tension = result.score;
    idea.tensionUpdatedAt = Date.now();
    const record = { uuid: randomUUID(), ideaUuid: uuid, score: result.score, components: result.components, ts: Date.now() };
    this.os.db.tensions.push(record);
    saveDB(this.os.db, ['ideas','tensions']);
    stream.emit(new Event('idearium.idea.tensioned', { uuid, tension: result }));
    this.os._broadcast({ uuid: randomUUID(), type: 'idea.tensioned', payload: { uuid, tension: result }, ts: Date.now() });
  }
}

class IdeaArchiveGate extends Gate {
  constructor(os) { super('idearium.idea.archive'); this.os = os; }
  transform(event, stream) {
    const { uuid, reason, causedBy = null } = event.data;
    if (!reason) { stream.emit(new Event('idearium.error', { op:'idea.archive', reason:'archiveReason required (§M1 — nothing deleted)' })); return; }
    const idea = this.os.db.ideas.find(i=>i.uuid===uuid);
    if (!idea) { stream.emit(new Event('idearium.error', { op:'idea.archive', reason:`uuid not found: ${uuid}` })); return; }
    idea.phase = 'archived'; idea.archiveReason = reason; idea.archivedAt = Date.now(); idea.causedBy = causedBy;
    saveDB(this.os.db, ['ideas']);
    stream.emit(new Event('idearium.idea.archived', { uuid, reason }));
    this.os._broadcast({ uuid: randomUUID(), type: 'idea.archived', payload: { uuid, reason }, ts: Date.now() });
  }
}

class SpecCreateGate extends Gate {
  constructor(os) { super('idearium.spec.create'); this.os = os; }
  transform(event, stream) {
    const { name, ideaUuid = null, source = 'cli', causedBy = null } = event.data;
    if (!name) { stream.emit(new Event('idearium.error', { op:'spec.create', reason:'name required' })); return; }
    const SECTION_IDS = ['intent','api_callto','module_hooks','cli_spec','schemas','gap_contract','failure_modes','tests','phase_map'];
    const spec = {
      uuid: randomUUID(), name, version: '1.0.0', ideaUuid, phase: 'seed',
      sections: SECTION_IDS.map(id => ({ id, title: id.replace(/_/g,' '), complete: false, required: true, content: '', checklist: [] })),
      modules: [], wired: { eventBus:false, cli:false, jaa:false, toast:false, schemaValidated:false },
      buildOrder: [], agentAssignments: {},
      causedBy, source, createdAt: Date.now(), updatedAt: Date.now(),
    };
    this.os.db.specs.push(spec);
    if (ideaUuid) {
      const idea = this.os.db.ideas.find(i=>i.uuid===ideaUuid);
      if (idea) { idea.linkedSpec = spec.uuid; idea.updatedAt = Date.now(); }
    }
    saveDB(this.os.db, ['specs','ideas']);
    stream.emit(new Event('idearium.spec.created', { spec }));
    this.os._broadcast({ uuid: randomUUID(), type: 'spec.created', payload: spec, ts: Date.now() });
  }
}

// §NEW 2026-07-16 — legacy specs (this.os.db.specs, the pre-spec-engine
// 9-section format) had create/update/check/build gates but no way to get
// one OUT of the list short of editing the JSON file by hand. Mirrors
// IdeaArchiveGate above exactly — same §M1 requirement (reason required,
// nothing deleted), same phase-flag mechanism, same event/broadcast shape.
class SpecArchiveGate extends Gate {
  constructor(os) { super('idearium.spec.archive'); this.os = os; }
  transform(event, stream) {
    const { uuid, reason, causedBy = null } = event.data;
    if (!reason) { stream.emit(new Event('idearium.error', { op:'spec.archive', reason:'archiveReason required (§M1 — nothing deleted)' })); return; }
    const spec = this.os.db.specs.find(s=>s.uuid===uuid);
    if (!spec) { stream.emit(new Event('idearium.error', { op:'spec.archive', reason:`uuid not found: ${uuid}` })); return; }
    spec.phase = 'archived'; spec.archiveReason = reason; spec.archivedAt = Date.now(); spec.causedBy = causedBy;
    saveDB(this.os.db, ['specs']);
    stream.emit(new Event('idearium.spec.archived', { uuid, reason }));
    this.os._broadcast({ uuid: randomUUID(), type: 'spec.archived', payload: { uuid, reason }, ts: Date.now() });
  }
}

class SpecUpdateGate extends Gate {
  constructor(os) { super('idearium.spec.update'); this.os = os; }
  transform(event, stream) {
    const { uuid, fields } = event.data;
    const spec = this.os.db.specs.find(s=>s.uuid===uuid);
    if (!spec) { stream.emit(new Event('idearium.error', { op:'spec.update', reason:`spec not found: ${uuid}` })); return; }
    const allowed = ['name','phase','sections','modules','wired','buildOrder','agentAssignments'];
    for (const k of allowed) { if (fields[k] !== undefined) spec[k] = fields[k]; }
    spec.updatedAt = Date.now();
    saveDB(this.os.db, ['specs']);
    stream.emit(new Event('idearium.spec.updated', { spec }));
    this.os._broadcast({ uuid: randomUUID(), type: 'spec.updated', payload: spec, ts: Date.now() });
  }
}

class SpecCheckGate extends Gate {
  constructor(os) { super('idearium.spec.check'); this.os = os; }
  transform(event, stream) {
    const { uuid } = event.data;
    const spec = this.os.db.specs.find(s=>s.uuid===uuid);
    if (!spec) { stream.emit(new Event('idearium.error', { op:'spec.check', reason:`spec not found: ${uuid}` })); return; }
    const checks = spec.sections.map(s => ({ id: s.id, required: s.required, complete: s.complete, hasContent: s.content.length > 0 }));
    const passCount = checks.filter(c=>!c.required || c.complete).length;
    const failCount = checks.length - passCount;
    const passed = failCount === 0;
    if (passed) spec.phase = 'specced';
    spec.updatedAt = Date.now();
    const ciRun = { uuid: randomUUID(), specUuid: uuid, status: passed?'passed':'failed', checks, passCount, failCount, durationMs: 0, causedBy: null, ts: Date.now() };
    saveDB(this.os.db, ['specs']);
    stream.emit(new Event('idearium.spec.checked', { spec, ciRun }));
    this.os._broadcast({ uuid: randomUUID(), type: 'spec.checked', payload: { spec, ciRun }, ts: Date.now() });
  }
}

class GapOpenGate extends Gate {
  constructor(os) { super('idearium.gap.open'); this.os = os; }
  transform(event, stream) {
    const { type, description, severity = 'medium', ideaUuid = null, specUuid = null, causedBy = null, source = 'idearium.core' } = event.data;
    if (!description || description.length < 5) { stream.emit(new Event('idearium.error', { op:'gap.open', reason:'description must be ≥5 chars' })); return; }
    const gap = {
      uuid: randomUUID(), type: type||'unresolved', description,
      ideaUuid, specUuid, between: event.data.between || (ideaUuid?[ideaUuid]:[]),
      status: 'open', severity,
      resolution: null, resolvedAt: null, ignoreReason: null,
      causedBy, source, ts: Date.now(), createdAt: Date.now(),
    };
    this.os.db.gaps.push(gap);
    // Tag openGaps on linked idea
    if (ideaUuid) {
      const idea = this.os.db.ideas.find(i=>i.uuid===ideaUuid);
      if (idea && !idea.openGaps.includes(gap.uuid)) idea.openGaps.push(gap.uuid);
    }
    saveDB(this.os.db, ['gaps','ideas']);
    stream.emit(new Event('idearium.gap.opened', { gap }));
    this.os._broadcast({ uuid: randomUUID(), type: 'gap.created', payload: gap, ts: Date.now() });
  }
}

class GapResolveGate extends Gate {
  constructor(os) { super('idearium.gap.resolve'); this.os = os; }
  transform(event, stream) {
    const { uuid, resolution = '' } = event.data;
    const gap = this.os.db.gaps.find(g=>g.uuid===uuid);
    if (!gap) { stream.emit(new Event('idearium.error', { op:'gap.resolve', reason:`gap not found: ${uuid}` })); return; }
    if (gap.status !== 'open') { stream.emit(new Event('idearium.error', { op:'gap.resolve', reason:`gap ${uuid} is already ${gap.status}` })); return; }
    gap.status = 'resolved'; gap.resolution = resolution; gap.resolvedAt = Date.now();
    // Remove from idea.openGaps
    for (const uuid_ of (gap.between||[])) {
      const idea = this.os.db.ideas.find(i=>i.uuid===uuid_);
      if (idea) idea.openGaps = idea.openGaps.filter(g=>g!==uuid);
    }
    saveDB(this.os.db, ['gaps','ideas']);
    stream.emit(new Event('idearium.gap.resolved', { gap }));
    this.os._broadcast({ uuid: randomUUID(), type: 'gap.resolved', payload: gap, ts: Date.now() });
  }
}

class GapIgnoreGate extends Gate {
  constructor(os) { super('idearium.gap.ignore'); this.os = os; }
  transform(event, stream) {
    const { uuid, reason = '' } = event.data;
    const gap = this.os.db.gaps.find(g=>g.uuid===uuid);
    if (!gap) { stream.emit(new Event('idearium.error', { op:'gap.ignore', reason:`gap not found: ${uuid}` })); return; }
    gap.status = 'ignored'; gap.ignoreReason = reason;
    saveDB(this.os.db, ['gaps']);
    stream.emit(new Event('idearium.gap.ignored', { gap }));
    this.os._broadcast({ uuid: randomUUID(), type: 'gap.ignored', payload: gap, ts: Date.now() });
  }
}

class SnapshotGate extends Gate {
  constructor(os) { super('idearium.snapshot.commit'); this.os = os; }
  transform(event, stream) {
    const { message = 'snapshot', branch = 'main', author = 'cli', causedBy = null } = event.data;
    const os = this.os;
    const tensionMap = {};
    for (const idea of os.db.ideas) {
      const r = os.computeTension(idea);
      idea.tension = r.score; idea.tensionUpdatedAt = Date.now();
      tensionMap[idea.uuid] = r.score;
    }
    const phaseMap = {};
    for (const p of IDEA_PHASES) phaseMap[p] = os.db.ideas.filter(i=>i.phase===p).length;
    const sha = os.db.snapshots.length.toString(16).padStart(12,'0');
    const snap = {
      uuid:        randomUUID(),
      commitId:    `vtm-${sha}`,
      parentId:    os.db.snapshots[0]?.uuid || null,
      branch, message, author,
      ts:          Date.now(),
      ideasCount:  os.db.ideas.length,
      gapCount:    os.db.gaps.filter(g=>g.status==='open').length,
      specCount:   os.db.specs.length,
      snr:         os.snr,
      snrDelta:    0,
      tensionMap,
      phaseMap,
      causedBy,
      // ── Actual state, not just aggregates. Without this, "pull" has
      // nothing real to restore — a count and a tension map aren't a
      // working state, they're a summary of one. Deep-cloned so later
      // mutation of the live db doesn't corrupt history. §7.1 dual ledger:
      // this is the Upgrade Ledger half — actual restorable truth.
      state: {
        ideas: JSON.parse(JSON.stringify(os.db.ideas)),
        specs: JSON.parse(JSON.stringify(os.db.specs)),
        gaps:  JSON.parse(JSON.stringify(os.db.gaps)),
        links: JSON.parse(JSON.stringify(os.db.links)),
      },
    };
    // snr delta vs last snapshot
    if (os.db.snapshots.length) snap.snrDelta = Math.round((os.snr - (os.db.snapshots[0].snr||0)) * 1000)/1000;
    os.db.snapshots.unshift(snap);
    saveDB(os.db, ['snapshots','ideas']);
    stream.emit(new Event('idearium.snapshot.committed', { snapshot: snap }));
    os._broadcast({ uuid: randomUUID(), type: 'push.complete', payload: snap, ts: Date.now() });
  }
}

// ── Restore (pull) — replaces live ideas/specs/gaps/links with a snapshot's
// captured state. Auto-pushes a safety snapshot of CURRENT state first —
// same as git stash before a destructive checkout — so §M1 (nothing ever
// deleted) holds even though this overwrites the working set.
class SnapshotRestoreGate extends Gate {
  constructor(os) { super('idearium.snapshot.restore'); this.os = os; }
  transform(event, stream) {
    const { commitId, author = 'cli' } = event.data;
    const os = this.os;
    const target = os.db.snapshots.find(s => s.commitId === commitId || s.uuid === commitId);
    if (!target) { stream.emit(new Event('idearium.error', { op:'snapshot.restore', reason:`snapshot not found: ${commitId}` })); return; }
    if (!target.state) { stream.emit(new Event('idearium.error', { op:'snapshot.restore', reason:`snapshot ${commitId} predates full-state capture — nothing to restore (old snapshots only have aggregate stats)` })); return; }

    // Safety snapshot of current state before overwriting — pre-restore stash.
    stream.emit(new Event('idearium.snapshot.commit', { message: `pre-restore snapshot (before pulling ${commitId})`, branch: 'main', author }));

    os.db.ideas = JSON.parse(JSON.stringify(target.state.ideas));
    os.db.specs = JSON.parse(JSON.stringify(target.state.specs));
    os.db.gaps  = JSON.parse(JSON.stringify(target.state.gaps));
    os.db.links = JSON.parse(JSON.stringify(target.state.links));
    saveDB(os.db, ['ideas','specs','gaps','links']);
    stream.emit(new Event('idearium.snapshot.restored', { commitId: target.commitId }));
    os._broadcast({ uuid: randomUUID(), type: 'pull.complete', payload: { commitId: target.commitId }, ts: Date.now() });
  }
}

class SNRSampleGate extends Gate {
  constructor(os) { super('idearium.snr.sample'); this.os = os; }
  transform(event, stream) {
    const { eventType, weight } = event.data;
    const sample = { uuid: randomUUID(), eventType, snrValue: weight, ts: Date.now() };
    this.os.db.snr.push(sample);
    if (this.os.db.snr.length > 200) this.os.db.snr = this.os.db.snr.slice(-200);
    // §GAP FIXED 2026-07-14 — this never called saveDB under the old model
    // either; it survived only because saveDB(db) rewrote the WHOLE file on
    // every unrelated mutation, so some later gate's save would catch this
    // table by accident. The new per-table saveDB(db, keys) has no such
    // accidental coverage — without this, snr history would still recalc
    // live but stop surviving a restart.
    saveDB(this.os.db, ['snr']);
    this.os._recalcSNR();
    this.os._broadcast({ uuid: randomUUID(), type: 'snr.update', payload: { snr: this.os.snr }, ts: Date.now() });
  }
}

class ErrorGate extends Gate {
  constructor(os) { super('idearium.error'); this.os = os; }
  transform(event, stream) {
    // §1.2 — never silent
    const { op, reason } = event.data;
    console.error(`[IdeaOS][ERROR] op=${op} reason=${reason}`);
    this.os._broadcast({ uuid: randomUUID(), type: 'idearium.error', payload: { op, reason }, ts: Date.now() });
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _instance = null;
export function getIdeaOS() {
  if (!_instance) _instance = new IdeaOS();
  return _instance;
}
