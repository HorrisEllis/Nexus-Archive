/**
 * host/event-bus.js
 * COMPARTMENT OS — Host Event Bus
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * The host event bus. Backed by a SISO Stream — not EventEmitter.
 *
 * Every kernel event flows through a Stream instance.
 * Gates registered on the stream are the canonical handlers.
 * Observers (onAny, on) are read-only — they see events but do not transform.
 *
 * Public API is identical to v1.0.0 so all existing code and tests are
 * unchanged. Internally:
 *   - emit(type, payload) → stream.emit(new Event(type, payload))
 *   - on(type, fn)        → stream.on(type, fn)  [observer, not gate]
 *   - onAny(fn)           → stream.onAny(fn)      [observer]
 *   - tail(n)             → stream.tail(n)
 *   - since(seq)          → stream.since(seq)
 *   - register(gate)      → stream.register(gate) [the new primary API]
 *   - deregister(sig)     → stream.deregister(sig)
 *
 * COS-10: All inter-compartment communication via host event bus.
 * COS-15: All pipe traffic is logged to the master kernel (StreamLog).
 */

'use strict';

const { Stream, StreamLog, Event } = require('../siso/index.js');
const { DEFAULT_RING_CAP } = require('../foundation/constants.js');

// ─── EventBus ─────────────────────────────────────────────────────────────────

class EventBus {
  /**
   * @param {{ ringCap?: number, logLevel?: string }} opts
   *   logLevel: 'OFF' | 'EVENTS' | 'DEEP' | 'DATA' (default: 'EVENTS')
   */
  constructor({ ringCap = DEFAULT_RING_CAP, logLevel = 'EVENTS' } = {}) {
    this._log    = new StreamLog(logLevel);
    this._stream = new Stream({ log: this._log, ringCap });
  }

  // ── Emit ──────────────────────────────────────────────────────────────────

  /**
   * Emit a typed kernel event into the SISO stream.
   * Returns the stamped event (seq + timestamp).
   *
   * @param {string} type     EventType string e.g. 'host:compartment:created'
   * @param {object} payload
   * @returns {object} stamped event { seq, type, payload, timestamp }
   */
  emit(type, payload = {}) {
    // §ADAPTER 2026-09-11 — warp/core/Stream.emit() no longer returns the
    // stamped event directly (it returns undefined for a sync chain, or a
    // Promise for an async gate chain — see warp/core/Stream.js's own
    // _emitProduced comment). EventBus's public contract ("returns the
    // stamped event") predates that change and real callers depend on it
    // (process-runner.js, host boot, spawnProcess tests). warp still
    // builds and ring-buffers the exact same {seq,type,payload,timestamp}
    // shape internally before gate dispatch runs — reading it back via
    // tail(1) is correct regardless of whether the gate's own transform
    // was sync or async, since the ring push happens before either path.
    this._stream.emit(new Event(type, payload));
    return this._stream.tail(1)[0];
  }

  // ── Gate Registration (primary SISO API) ──────────────────────────────────

  /**
   * Register a Gate on the stream.
   * The gate's signature must match an event type string.
   * Collision throws immediately — COS-1 (nothing silently fails).
   *
   * @param {Gate} gate
   */
  register(gate) {
    return this._stream.register(gate);
  }

  /**
   * Deregister a gate by signature.
   * Called when a compartment is destroyed.
   * @param {string} signature
   */
  deregister(signature) {
    return this._stream.deregister(signature);
  }

  // ── Observers (read-only, not gates) ─────────────────────────────────────

  /**
   * Subscribe to a specific event type as a read-only observer.
   * Returns an unsubscribe function.
   *
   * @param {string} type
   * @param {function} fn  receives stamped event { seq, type, payload, timestamp }
   * @returns {function} unsubscribe
   */
  on(type, fn) {
    // §ADAPTER 2026-09-11 — warp/core/Stream.on(type, handler) calls
    // handler(event) with the raw Event (.data, .uuid, .ts), not the
    // {seq,type,payload,timestamp} stamped shape this bus's on() has
    // always handed observers (onAny's wildcard path already gets
    // "stamped" natively from warp — this is the one place that diverged).
    return this._stream.on(type, (event) => {
      fn({ seq: this._stream.seq, type: event.type, payload: event.data, timestamp: event.ts || Date.now() });
    });
  }

  /**
   * Subscribe to ALL events as a read-only observer.
   * Returns an unsubscribe function.
   *
   * @param {function} fn  receives stamped event
   * @returns {function} unsubscribe
   */
  onAny(fn) {
    return this._stream.onAny(fn);
  }

  // ── Ring Buffer ───────────────────────────────────────────────────────────

  /** Return last N stamped events. */
  tail(n = 50) {
    return this._stream.tail(n);
  }

  /** Return all stamped events since a given seq number. */
  since(afterSeq) {
    return this._stream.since(afterSeq);
  }

  get seq() { return this._stream.seq; }

  // ── StreamLog (audit trail) ───────────────────────────────────────────────

  /**
   * Access the StreamLog directly.
   * Used by the Nexus master kernel and snapshot system.
   */
  get log() { return this._log; }

  /**
   * Set the StreamLog level at runtime.
   * @param {'OFF'|'EVENTS'|'DEEP'|'DATA'} level
   */
  setLogLevel(level) {
    this._log.level = level;
  }

  // ── SSE ───────────────────────────────────────────────────────────────────

  subscribeSSE(client) {
    return this._stream.subscribeSSE(client);
  }

  get sseClientCount() { return this._stream.sseClientCount; }

  // ── Introspection ─────────────────────────────────────────────────────────

  /** Expose the underlying stream for direct gate registration / sampleHere(). */
  get stream() { return this._stream; }

  sampleHere() { return this._stream.sampleHere(); }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function createEventBus(opts = {}) {
  return new EventBus(opts);
}

module.exports = { EventBus, createEventBus };
