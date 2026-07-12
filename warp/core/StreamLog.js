'use strict';
/**
 * StreamLog — append-only audit trail. Observes, never consumes.
 * Same shape as SISO's log, plus axiom-check entries WARP's Stream writes.
 */
class StreamLog {
  constructor() {
    this._entries = [];
    this._nextId = 0;
  }

  nextStreamId() {
    return ++this._nextId;
  }

  record(entry) {
    this._entries.push({ ...entry, loggedAt: Date.now() });
  }

  entries() {
    return [...this._entries];
  }
}

module.exports = { StreamLog };
