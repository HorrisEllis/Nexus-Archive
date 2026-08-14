'use strict';
/**
 * StreamLog — append-only audit trail. Observes, never consumes.
 * Axiom-check entries land here alongside dispatch steps, one shared log.
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
