'use strict';
/**
 * StreamLog — append-only audit trail. Observes, never consumes.
 * Same shape as SISO's log, plus axiom-check entries WARP's Stream writes.
 *
 * §COS MERGE 2026-07-11 — cos/siso/StreamLog.js added mutable verbosity
 * levels (OFF/EVENTS/DEEP/DATA) and sample()/clear()/since(). Ported the
 * behavior, not the interface: cos's `.entries` was a plain array
 * property; warp's `.entries()` is already a method with real existing
 * callers. Making one name mean two different things depending on which
 * fork you came from is exactly the ambiguity this codebase's own
 * "collision is a hard error, never silently resolved" rule exists to
 * prevent — so `entries()` stays a method, full stop, and any cos code
 * that reads `.entries` as a property gets adapted at the call site
 * instead.
 *
 * Default level is 'DATA' (record everything) — this is warp's existing
 * behavior, unconditional, byte-identical for every current caller that
 * constructs `new StreamLog()` with no arguments. Level filtering is opt
 * in, not a silent behavior change for anyone already using this class.
 */
const LEVELS = { OFF: 0, EVENTS: 1, DEEP: 2, DATA: 3 };

class StreamLog {
  constructor(level = 'DATA') {
    this.level = level;
    this._entries = [];
    this._nextId = 0;
    this._seq = 0;
  }

  nextStreamId() {
    return ++this._nextId;
  }

  /**
   * record(entry) — warp's existing contract: store whatever shape the
   * caller passes, unconditionally, at the default 'DATA' level. At a
   * lower level (set via cos's convention: log.level = 'EVENTS'), fields
   * are progressively dropped — streamId/parentStreamId at EVENTS-only,
   * full entry only at DEEP+. This matches cos's original tiering exactly;
   * the field names it filters on (streamId, parentStreamId) are already
   * present in every entry warp's own Stream.emit() constructs, so no
   * caller needs to change what it passes in.
   */
  record(entry) {
    const lvl = LEVELS[this.level] ?? LEVELS.DATA;
    if (lvl === 0) return;

    const seq = this._seq++;
    const stored = { ...entry, seq, loggedAt: Date.now() };
    if (lvl < 2) { delete stored.streamId; delete stored.parentStreamId; }
    this._entries.push(stored);
  }

  entries() {
    return [...this._entries];
  }

  /** §COS MERGE — observation snapshot, same philosophy as Stream.sampleHere(). */
  sample() {
    return { level: this.level, count: this._entries.length, entries: [...this._entries] };
  }

  /** §COS MERGE — the one concession to mutability, for long-running systems shedding history. */
  clear() {
    this._entries = [];
    this._seq = 0;
  }

  /** §COS MERGE — entries since a given seq number. */
  since(afterSeq) {
    return this._entries.filter(e => e.seq > afterSeq);
  }
}

module.exports = { StreamLog };
