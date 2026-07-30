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
// ── §UNIVERSAL LEDGER SCHEMA 2026-07-24 ─────────────────────────────────────
// James: "They all need event ledgers, with consistent schema… hook, wire,
// intent, contract uuid, beginning end point, component, fault."
//
// 9 of the 13 fields he listed already existed here, so this is EXTEND AND
// ENFORCE, not a new schema — a second schema would be the competing truth
// that produced six ledger destinations in the first place.
//
// ADDED: hook, wire (the begin/end point — the strongest item on the list and
// recorded nowhere before), sourceRef, faultId, intent.
// REJECTED, with reasons recorded in docs/nexus-sentinel.spec: `next event`
// (an append-only ledger cannot know the future; derivable as a causedBy
// reverse index), ledger file/dir as fields (already derived by
// _partitionPath, and self-referential), embedded `context` (rows are ~300
// bytes and the tree is 9.6MB — references, not cargo), and `relation`
// (dropped from v1 entirely: causedBy already carries causal relation and no
// caller has needed a non-causal one. Blocking the schema on it was backwards.)
//
// WHY NOT REFUSE ON MISSING hook/wire YET: 14 live call sites exist. Making
// them required today would make write() return null across the system —
// silently disabling the ledger to enforce a schema about observability. So
// the gap is made VISIBLE AND MEASURABLE instead: unknown is recorded as
// null (never invented), warned once per component, and counted by
// schemaCoverage() below. Enforcement flips when coverage reaches 100%, and
// the coverage number is what says when.
const _hookWarned = new Set();

// sourceRef is DERIVED, not asked for — the real file:line that called
// write(), read off a stack trace. This is the useful form of James's
// "file names / file directory" request: WHERE IT WAS EMITTED FROM, as
// opposed to the row's own path, which is already implied by its location.
function _callerRef() {
  const st = new Error().stack || '';
  const lines = st.split('\n').slice(2);
  for (const l of lines) {
    if (l.includes('component-ledger.js')) continue;
    const m = l.match(/\(?([^()\s]+\.js):(\d+):\d+\)?/);
    if (m) return `${m[1].replace(/^.*[\\/](?=[^\\/]*[\\/][^\\/]*$)/, '')}:${m[2]}`;
  }
  return null;
}

function write({ system, component, action, status = 'info', tags = [], detail = null, causedBy = null, contractUuid = null, session = null,
                 hook = null, wire = null, intent = null, faultId = null, sourceRef = null }) {
  if (!system || !component || !action) {
    console.warn(`[${MODULE_ID}] §1.1 write() refused — missing system/component/action`, { system, component, action });
    return null;
  }

  // §1.2 — an unsupplied hook/wire is a REAL gap in traceability. Say so once
  // per component so it is measurable, without flooding the log.
  if ((!hook || !wire) && !_hookWarned.has(component)) {
    _hookWarned.add(component);
    console.warn(`[${MODULE_ID}] §schema — '${component}' writes without ${!hook ? 'hook' : ''}${!hook && !wire ? '/' : ''}${!wire ? 'wire' : ''}; movement is recorded but not locatable in the architecture`);
  }

  // §CAP 2026-07-27 — found by adversarial simulation (UC4.3): a 2MB detail
  // payload was accepted with no limit. Rows are normally ~300 bytes and the
  // whole tree is ~10MB, so a single runaway caller can bloat the ledger past
  // usefulness — and every reader (the tablet, the pattern engine, the CLI)
  // pays for it on every read. Capped, with the truncation VISIBLE in the
  // value: silent truncation would be data loss nobody could detect, which is
  // worse than a large row.
  const DETAIL_MAX = parseInt(process.env.LEDGER_DETAIL_MAX || '16384', 10);
  if (detail != null) {
    let enc;
    try { enc = typeof detail === 'string' ? detail : JSON.stringify(detail); }
    catch (_) { enc = String(detail); }   // circular etc — never throw on telemetry
    if (enc && enc.length > DETAIL_MAX) {
      console.warn(`[${MODULE_ID}] detail for ${component}.${action} was ${enc.length}B, capped at ${DETAIL_MAX}B — the full payload belongs in an artifact, not a ledger row`);
      detail = { _truncated: true, originalBytes: enc.length, cappedAt: DETAIL_MAX, preview: enc.slice(0, DETAIL_MAX) };
    }
  }

  const row = {
    uuid: uid(), system, component, action, status,
    tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
    detail, causedBy, contractUuid, session: session || null,
    // Unknown stays NULL. Never derived from something adjacent, never
    // defaulted to a plausible value — a fabricated hook would be worse than
    // an absent one, because it would look like evidence.
    hook, wire, faultId,
    // intent ships UNCONSTRAINED on purpose. The existing `action` field
    // carries only two distinct verbs across 3,400 rows ('updated',
    // 'registered'), so there is no real vocabulary to constrain intent to
    // yet. Inventing one before the evidence exists is authoring, not
    // observing. It gets constrained once real usage shows what needs saying.
    intent,
    sourceRef: sourceRef || _callerRef(),
    ts: Date.now(),
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
    } catch (e) {
      // §1.2 FIXED 2026-07-24 — this was `catch (_) {}`. Silent.
      //
      // This is the ONE wire that makes "always connected with the pattern
      // engine" literally true: _scanPatterns() reads jaaDB.query('event_log')
      // and NOTHING else. If this insert fails, the intelligence core simply
      // stops being fed — and, being silent, it starves while every other
      // signal says the ledger is healthy. The mirror write immediately above
      // logs AND calls _recordFailure(); this one did neither, so the more
      // important failure was the quieter one.
      //
      // That matters more as of today specifically: the intelligence core was
      // switched on this session after never having run. A silently broken
      // intake would make it look like the core is running and finding
      // nothing, which is indistinguishable from a healthy system with no
      // patterns — the exact confident-and-wrong shape this codebase keeps
      // producing.
      console.error(`[${MODULE_ID}] §1.2 event_log breadcrumb FAILED for ${system}.${action}: ${e.message} — the pattern engine will not see this entry`);
      _recordFailure(e, row);
    }
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

// How far the schema migration actually is — the number that decides when
// hook/wire become enforced rather than warned. Reports per-component so the
// remaining work is a list, not a percentage nobody can act on.
function schemaCoverage(limit = 4000) {
  const rows = tail(limit) || [];
  const byComponent = new Map();
  for (const r of rows) {
    const c = r.component || '(none)';
    if (!byComponent.has(c)) byComponent.set(c, { component: c, total: 0, withHook: 0, withWire: 0, withSource: 0 });
    const e = byComponent.get(c);
    e.total++;
    if (r.hook) e.withHook++;
    if (r.wire) e.withWire++;
    if (r.sourceRef) e.withSource++;
  }
  const comps = [...byComponent.values()].sort((a, b) => b.total - a.total);
  const total = rows.length || 1;
  return {
    rows: rows.length,
    hookPct:   +(comps.reduce((a, c) => a + c.withHook, 0)   / total * 100).toFixed(1),
    wirePct:   +(comps.reduce((a, c) => a + c.withWire, 0)   / total * 100).toFixed(1),
    sourcePct: +(comps.reduce((a, c) => a + c.withSource, 0) / total * 100).toFixed(1),
    components: comps.slice(0, 30),
  };
}

// Is the pattern engine actually being fed? _scanPatterns() reads event_log
// and nothing else, so a breadcrumb gap IS intelligence starvation. Compares
// canonical ledger writes against the breadcrumbs they should have produced.
// Only counts rows written since `since`, because breadcrumbs began on
// 2026-07-20 and everything before that is legitimately absent rather than
// lost — conflating the two would manufacture a false alarm.
const BREADCRUMB_EPOCH = Date.parse('2026-07-20T15:28:05Z');
function intakeCoverage(since = BREADCRUMB_EPOCH) {
  // _getJAA(), not _jaa() — _jaa is the cached VARIABLE, the accessor is
  // _getJAA(). Caught by running it rather than by reading it back.
  const jaa = _getJAA();
  if (!jaa) return { observed: false, reason: 'no store' };
  const mirror = (jaa.tail ? jaa.tail('component_ledger', 99999) : []) || [];
  const events = (jaa.tail ? jaa.tail('event_log', 99999) : []) || [];
  const m = mirror.filter(r => (r.ts || 0) >= since).length;
  const b = events.filter(r => (r.ts || 0) >= since && String(r.type || '').startsWith('ledger.')).length;
  return {
    observed: true, since: new Date(since).toISOString(),
    canonicalWrites: m, breadcrumbs: b,
    coveragePct: m ? +((b / m) * 100).toFixed(1) : null,
    starving: m > 0 && b < m,
    note: 'rows before `since` predate the breadcrumb wire and are legitimately absent, not lost',
  };
}

module.exports = {
  write, schemaCoverage, intakeCoverage,
  tail, bySystem, byComponent, bySession,
  readPartition, listPartitions,
  registerComponent,
  MODULE_ID, VERSION, COMP_ID, HOOK_ID,
};
