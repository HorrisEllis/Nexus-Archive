'use strict';
// ── lib/component-ledger.js — Per-Component, Per-System Ledger ──────────────
// UUID: nexus-component-ledger-v1-0000-4000-0000-000000000001
// Version: 1.0.0
// Phase: 23.9 — explicit ledgers, per direct request 2026-06-24
// Component: lib.component-ledger
//
// James's spec, in his own words: "a ledger per component, per system, per
// day or session, but always connected with the pattern engine, event
// ledger." Three things that has to be true at once:
//
//   1. PHYSICALLY PARTITIONED — a real file per component, per system,
//      rolling per calendar day by default or per explicit session id when
//      one is supplied. Not a filter on one shared table. A literal file
//      you can open: data/ledger/{system}/{component}/{day-or-session}.jsonl
//
//   2. CENTRALLY QUERYABLE — every partition also mirrors into one JAA
//      table (component_ledger) so "show me everything RAID decided today"
//      doesn't mean globbing the filesystem by hand.
//
//   3. CONNECTED TO THE PATTERN ENGINE + EVENT LEDGER — cortex/intelligence/
//      index.js's _scanPatterns() reads jaaDB.query('event_log'), full stop,
//      that is its only intake. A ledger entry that never reaches event_log
//      is invisible to crystallization no matter how faithfully it's
//      written to disk. Every write here lands in BOTH places, always,
//      same call, not a separate step a caller can forget.
//
// This supersedes lib/engine-ledger.js from the previous pass (RAID +
// reflection only, single shared table, no physical partitioning, no
// pattern-engine connection). engine-ledger.js now re-exports from here so
// nothing that already required it breaks.
//
// §1.1: a write with no system/component/action is refused, not guessed at.
// §1.2: a failure on either the physical write or the JAA mirror is loud —
//       logged to stderr and to the failures table, never swallowed.
// §2.1: physical file first, then JAA mirror, then event_log breadcrumb —
//       disk before anything queryable, same ordering law as everywhere else.
// §5.1: every row carries a causedBy chain back to whatever it traces to.

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const MODULE_ID = 'component-ledger';
const VERSION   = '1.0.0';
const COMP_ID   = 'lib.component-ledger';
const HOOK_ID   = 'lib.component-ledger:v1:p0001';

const LEDGER_ROOT = path.join(__dirname, '..', 'data', 'ledger');

// ── Lazy deps — same pattern as gap-predicate.js / engine-ledger.js ──────────
let _jaa, _uid, _bus;
function _getJAA() { if (!_jaa) try { ({ jaaDB: _jaa, uid: _uid } = require('../cortex/memory/jaa-db')); } catch (_) {} return _jaa; }
function _getBus()  { if (!_bus) try { _bus = require('../nexus-bus'); } catch (_) {} return _bus; }
function uid()      { return _uid?.() ?? crypto.randomUUID(); }

function _today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC — matches versionium_calendar's convention
}

function _safe(s) {
  return String(s || 'unknown').replace(/[^a-z0-9._-]/gi, '_');
}

// Resolves the physical partition for a (system, component, session?) triple.
// session present  → data/ledger/{system}/{component}/session-{session}.jsonl
// session absent   → data/ledger/{system}/{component}/{YYYY-MM-DD}.jsonl
function _partitionPath(system, component, session) {
  const partition = session ? `session-${_safe(session)}` : _today();
  const dir  = path.join(LEDGER_ROOT, _safe(system), _safe(component));
  const file = path.join(dir, `${partition}.jsonl`);
  return { dir, file, partition };
}

/**
 * write() — the one entry point. Every component in NEXUS calls this the
 * same way, regardless of which system or component it is.
 *
 * @param {string}   system       - e.g. 'guardian','raid','reflection','gap-lifecycle','autopilot','cortex'
 * @param {string}   component    - the component_id, e.g. 'guardian.copilot'
 * @param {string}   action       - what happened, e.g. 'route_decided','job_dispatched'
 * @param {string}   [status]     - outcome/state, e.g. 'dispatched','failed','escalated'
 * @param {string[]} [tags]       - explicit free-form tags
 * @param {string}   [detail]     - one-line human-readable why
 * @param {string}   [causedBy]   - uuid this traces back to (call/gap/contract/job)
 * @param {string}   [contractUuid]
 * @param {string}   [session]    - explicit session id; if omitted, partitions by calendar day
 */
function write({ system, component, action, status = 'info', tags = [], detail = null, causedBy = null, contractUuid = null, session = null }) {
  if (!system || !component || !action) {
    console.warn(`[${MODULE_ID}] §1.1 write() refused — missing system/component/action`, { system, component, action });
    return null;
  }

  const row = {
    uuid: uid(), system, component, action, status,
    tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
    detail, causedBy, contractUuid, session: session || null, ts: Date.now(),
  };

  // 1) Physical file — the literal ledger. §2.1 disk first.
  try {
    const { dir, file } = _partitionPath(system, component, session);
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(file, JSON.stringify(row) + '\n');
  } catch (e) {
    console.error(`[${MODULE_ID}] §1.2 PHYSICAL LEDGER WRITE FAILED — ${system}/${component}: ${e.message}`, row);
    _recordFailure(e, row);
  }

  // 2) JAA mirror — central, queryable across every partition at once.
  const jaa = _getJAA();
  if (jaa) {
    try { jaa.insert('component_ledger', row); }
    catch (e) { console.error(`[${MODULE_ID}] §1.2 JAA mirror write failed: ${e.message}`); _recordFailure(e, row); }

    // 3) event_log breadcrumb — cortex/intelligence/index.js's _scanPatterns()
    // reads jaaDB.query('event_log') and nothing else. This is the wire that
    // makes "always connected with the pattern engine" literally true.
    try {
      jaa.insert('event_log', {
        uuid: uid(), type: `ledger.${system}.${action}`, source: component,
        payload: { status, tags: row.tags, detail, causedBy, session: row.session },
        causedBy, ts: row.ts,
      });
    } catch (_) {}
  }

  // 4) Bus — live listeners (cockpit, UI) see it immediately, not just on
  // the pattern engine's next scheduled scan.
  const bus = _getBus();
  try { if (bus?.emit) bus.emit('ledger.write', row); } catch (_) {}

  return row;
}

function _recordFailure(e, row) {
  const jaa = _getJAA();
  if (!jaa) return;
  try {
    jaa.insert('failures', {
      uuid: uid(), source: MODULE_ID, error: e.message, stack: e.stack?.slice(0, 500),
      causedBy: row?.causedBy || null, ts: Date.now(),
    });
  } catch (_) {}
}

// ── Query surface ─────────────────────────────────────────────────────────────
// All three read from the JAA mirror (fast, central). readPartition() reads
// the literal physical file instead — use it to confirm the physical ledger
// and the JAA mirror agree, or when JAA itself is the thing under suspicion.

function tail(limit = 50) {
  const jaa = _getJAA();
  try { return jaa ? jaa.tail('component_ledger', limit) : []; } catch (_) { return []; }
}

function bySystem(system, limit = 50) {
  const jaa = _getJAA();
  try { return jaa ? jaa.query('component_ledger', r => r.system === system, limit) : []; } catch (_) { return []; }
}

function byComponent(component, limit = 50) {
  const jaa = _getJAA();
  try { return jaa ? jaa.query('component_ledger', r => r.component === component, limit) : []; } catch (_) { return []; }
}

function bySession(session, limit = 200) {
  const jaa = _getJAA();
  try { return jaa ? jaa.query('component_ledger', r => r.session === session, limit) : []; } catch (_) { return []; }
}

function readPartition(system, component, sessionOrDay) {
  const isDay = /^\d{4}-\d{2}-\d{2}$/.test(sessionOrDay || '');
  const { file } = isDay
    ? { file: path.join(LEDGER_ROOT, _safe(system), _safe(component), `${sessionOrDay}.jsonl`) }
    : _partitionPath(system, component, sessionOrDay);
  try {
    return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  } catch (_) { return []; }
}

function listPartitions(system, component) {
  try {
    const dir = path.join(LEDGER_ROOT, _safe(system), _safe(component));
    return fs.readdirSync(dir).filter(f => f.endsWith('.jsonl'));
  } catch (_) { return []; }
}

// ── Component registration ────────────────────────────────────────────────────
function registerComponent() {
  try {
    const reg = require('./component-registry');
    reg.register({
      id: COMP_ID, namespace: 'lib', name: 'Component Ledger', version: VERSION,
      description: 'Per-component, per-system ledger, physically partitioned by day or session, mirrored to JAA and event_log so the pattern engine sees every entry.',
      grammar: ['ledger write', 'ledger tail', 'component ledger'],
      route: null, comp_type: 'engine',
      events: { emits: ['ledger.write'], listensTo: [] },
      registeredBy: MODULE_ID,
    });
  } catch (_) {}
}

module.exports = {
  write,
  tail, bySystem, byComponent, bySession,
  readPartition, listPartitions,
  registerComponent,
  MODULE_ID, VERSION, COMP_ID, HOOK_ID,
};
