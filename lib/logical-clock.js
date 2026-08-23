'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// lib/logical-clock.js — §3.2 the ordering axis, made durable and per-system
// UUID: nexus-logical-clock-v1-0000-2026-0822-001
// Version: 1.0.0
// Component: lib.logical-clock
// Hook: lib.logical-clock:v1:p0001
//
// versionium.spec build step 0 (§BLOCKER-E1). Per-event rewind is impossible
// until every event carries eventTs. Measured on the live store 2026-08-22:
//
//     event_log         464 rows · eventTs 0.0% · ts 100%
//     component_ledger  380 rows · eventTs 0.0% · ts 100%
//
// §3.2 "eventTs is the ONLY axis for ordering events, gate windows, and
// analytics. Wall clock is display metadata only. Mixing the two is a category
// error." Today every ordering in NEXUS runs on wall clock.
//
// ── WHAT ALREADY EXISTED (§8.4, checked before building) ────────────────────
//
// intelligence/meta/rfr2/time/index.js has createClock() with nextTick/nextSeq/
// causalOrder/seqPrecedes — correct, tested, and called by NOTHING outside
// rfr2. This does not reimplement it (§16.5); it wraps it and adds the two
// things a system-wide ledger needs and an in-kernel clock does not:
//
//   DURABILITY  createClock holds `let _tick = 0`. On restart it returns to
//               zero and re-issues tick 1, 2, 3 — values already used by the
//               previous session. Two events would share an eventTs, and the
//               replay order across a restart boundary would be undefined.
//               §2.1/§2.2: state that is not persisted does not exist.
//   PER-SYSTEM  §5.9 each sovereign system owns its own sequence. One global
//               counter would impose a total order across systems that never
//               actually happened, which is a fabricated causal claim.
//
// ── WHY NOT Date.now() ──────────────────────────────────────────────────────
//
// Deriving eventTs from wall clock reproduces the exact bug this closes. Clocks
// go backwards (NTP), two events land in the same millisecond, and a replay
// then reorders them differently from the live run — silently, because both
// orders look sorted. Causal-Nexus v5.0.0 Axis T: "if ts is ever used in a gate
// window, the session diverges between live and replayed runs."
//
// §1.2 — a row without eventTs is UNORDERED. It is never quietly ts-ordered.
// lib/pressure-window.js:59 currently does exactly that (`row.eventTs != null ?
// row.eventTs : row.ts`) and its own comment says §3.2 two lines above. That
// fallback is what makes the violation invisible: every consumer believes it is
// ordering logically. isOrdered() below exists so callers can stop guessing.
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const MODULE_ID = 'logical-clock';
const VERSION   = '1.0.0';
const COMP_ID   = 'lib.logical-clock';
const HOOK_ID   = 'lib.logical-clock:v1:p0001';

const CLOCK_DIR = process.env.NEXUS_CLOCK_DIR ||
  path.join(__dirname, '..', 'data', 'versionium', 'clocks');

// How often the high-water mark is flushed. Between flushes the clock RESERVES
// a block, so a crash loses unused ticks rather than reissuing used ones —
// gaps in eventTs are harmless, duplicates are not.
const RESERVE_BLOCK = +(process.env.NEXUS_CLOCK_BLOCK || 100);

let _rfr2Clock;
function _createInner() {
  if (_rfr2Clock === undefined) {
    // §PORTED 2026-08-23 — rfr2 lives at intelligence/rfr2 on this branch (the
    // meta/ consolidation flattened it) and at intelligence/meta/rfr2 on the
    // other. Both are tried, flat FIRST since that is the newer shape. This is
    // not defensive guessing: each path is a real location rfr2 has occupied,
    // and the module REFUSES rather than substituting its own clock if neither
    // resolves (§10.3 — two clock implementations would order differently).
    for (const p of ['../intelligence/rfr2/time', '../intelligence/meta/rfr2/time', '../meta/rfr2/time']) {
      try { ({ createClock: _rfr2Clock } = require(p)); if (_rfr2Clock) break; }
      catch (_) { /* try the next real location */ }
    }
    if (!_rfr2Clock) _rfr2Clock = null;
  }
  // §1.2 — if rfr2 is unavailable this must NOT silently fall back to a private
  // counter with different semantics. It fails loudly at construction.
  if (!_rfr2Clock) {
    throw new Error(`[${MODULE_ID}] intelligence/meta/rfr2/time is unavailable — refusing to substitute a second clock implementation (§10.3). Ordering would differ between this and rfr2's own.`);
  }
  return _rfr2Clock();
}

const _clocks = new Map();   // system → clock handle

function _file(system) { return path.join(CLOCK_DIR, `${system}.clock.json`); }

function _readHighWater(system) {
  try {
    const raw = JSON.parse(fs.readFileSync(_file(system), 'utf8'));
    // A reserved-but-unused block is skipped on purpose. Resuming inside it
    // would reissue ticks the previous process may have handed out.
    return { tick: +raw.reservedTo || 0, seq: +raw.seqReservedTo || 0, restored: true };
  } catch (_) {
    return { tick: 0, seq: 0, restored: false };
  }
}

function _writeHighWater(system, reservedTo, seqReservedTo) {
  try {
    fs.mkdirSync(CLOCK_DIR, { recursive: true });
    const tmp = _file(system) + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ system, reservedTo, seqReservedTo, wroteAt: Date.now() }));
    fs.renameSync(tmp, _file(system));
    return true;
  } catch (e) {
    // §1.2 — a clock that cannot persist is a clock that will collide after the
    // next restart. Loud once, and health() keeps reporting it.
    return e.message;
  }
}

/**
 * clockFor(system) — the durable logical clock for one sovereign system.
 *
 * Reserves ticks in blocks so a crash loses unused numbers rather than
 * reissuing used ones. Gaps in eventTs are harmless — it is an ORDER, not a
 * count, and nothing may treat a gap as a missing event (§1.1).
 */
function clockFor(system) {
  if (!system || typeof system !== 'string') {
    throw new Error(`[${MODULE_ID}] §1.1 clockFor requires a system name — an unattributed clock cannot be ordered against anything`);
  }
  if (_clocks.has(system)) return _clocks.get(system);

  const hw    = _readHighWater(system);
  const inner = _createInner();

  let base        = hw.tick;              // last reserved tick from a prior run
  let seqBase     = hw.seq;
  let reservedTo  = base + RESERVE_BLOCK;
  let seqReserved = seqBase + RESERVE_BLOCK;
  let persistError = _writeHighWater(system, reservedTo, seqReserved);
  if (persistError !== true) {
    console.warn(`[${MODULE_ID}] '${system}' clock cannot persist (${persistError}) — eventTs WILL collide after restart. Ordering across a restart boundary is not trustworthy until this is fixed.`);
  }

  const handle = {
    system,
    restored: hw.restored,

    /** nextTick() — the eventTs for one event. Monotonic, never wall clock. */
    nextTick() {
      const t = base + inner.nextTick();
      if (t >= reservedTo) {
        reservedTo  = t + RESERVE_BLOCK;
        seqReserved = seqBase + inner.seq + RESERVE_BLOCK;
        persistError = _writeHighWater(system, reservedTo, seqReserved);
      }
      return t;
    },

    /** nextSeq() — global ingestion order within this system. */
    nextSeq() { return seqBase + inner.nextSeq(); },

    get tick() { return base + inner.tick; },
    get seq()  { return seqBase + inner.seq; },

    health() {
      return { system, tick: base + inner.tick, seq: seqBase + inner.seq,
        reservedTo, restoredFromDisk: hw.restored,
        persistent: persistError === true,
        // The distinction a caller needs: a fresh clock and a clock that lost
        // its file look identical from the outside unless this says so.
        note: hw.restored ? null
          : 'no prior clock file found — starting at 0. If this system HAS run before, its earlier eventTs values are unrecoverable and those rows are UNORDERED (§1.2).' };
    },
  };

  _clocks.set(system, handle);
  return handle;
}

/**
 * stamp(row, system) — attach eventTs + seq to a row about to be written.
 * Returns the SAME row, mutated, because every ledger writer builds its row
 * inline and a copy here would be silently discarded by the caller.
 */
function stamp(row, system) {
  if (!row || typeof row !== 'object') return row;
  const c = clockFor(system || row.system || 'unknown');
  row.eventTs = c.nextTick();
  row.seq     = c.nextSeq();
  return row;
}

/**
 * isOrdered(row) — can this row participate in a deterministic replay?
 *
 * The function lib/pressure-window.js needed and did not have. A row without
 * eventTs is UNORDERED: it may be displayed, it may be counted, it must NOT be
 * used to establish sequence. Historical rows written before this module
 * existed will all answer false, and that is the correct answer — their causal
 * order is genuinely unrecoverable and must not be inferred from ts.
 */
function isOrdered(row) { return !!(row && typeof row.eventTs === 'number'); }

/**
 * order(rows) — sort by the real axis, and REPORT what could not be ordered.
 * Never silently interleaves unordered rows by ts; they are returned separately
 * so a caller must decide, rather than receiving a list that looks sorted.
 */
function order(rows = []) {
  const ordered   = rows.filter(isOrdered).sort((a, b) => a.eventTs - b.eventTs);
  const unordered = rows.filter(r => !isOrdered(r));
  return {
    ordered, unordered,
    complete: unordered.length === 0,
    note: unordered.length
      ? `${unordered.length}/${rows.length} row(s) have no eventTs and are UNORDERED. They are NOT ts-sorted into the result — a replay over them would diverge from the live run (§3.2).`
      : null,
  };
}

function health() {
  const clocks = [...
    _clocks.values()].map(c => c.health());
  return { ok: true, version: VERSION, dir: CLOCK_DIR, blockSize: RESERVE_BLOCK,
    clocks, systems: clocks.length,
    nonPersistent: clocks.filter(c => !c.persistent).map(c => c.system) };
}

function _resetForTest(dir) {
  _clocks.clear();
  if (dir) process.env.NEXUS_CLOCK_DIR = dir;
}

module.exports = { clockFor, stamp, isOrdered, order, health,
  RESERVE_BLOCK, CLOCK_DIR, MODULE_ID, VERSION, COMP_ID, HOOK_ID, _resetForTest };
