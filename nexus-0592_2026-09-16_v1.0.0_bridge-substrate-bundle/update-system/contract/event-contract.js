const crypto = require('crypto');

function uuid() { return crypto.randomUUID(); }
function sha256(data) {
  return crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

/**
 * EventContract
 * Wraps a transport (WebRTCTransport or anything with send()/onMessage())
 * so every event that crosses the wire has a consistent envelope:
 *
 *   {
 *     location,      // which handshake this event belongs to
 *     requestId,      // uuid, unique per request
 *     hash,           // sha256 of the payload — integrity + idempotency key
 *     event,          // event name, e.g. 'file:changed', 'update:push'
 *     payload,        // your actual data
 *     correlationId,  // set on responses, equals the requestId being answered
 *     timestamp
 *   }
 *
 * Requires a HandshakeRegistry — events on a location that hasn't
 * completed its handshake are dropped rather than processed.
 *
 * Usage:
 *   const contract = new EventContract({ transport, registry, location });
 *   contract.on('file:changed', (payload, envelope) => { ... });
 *   const { requestId } = contract.emit('file:changed', { path: 'a.js' });
 *
 *   // request/response pattern with timeout:
 *   const result = await contract.request('ping', {}, { timeoutMs: 5000 });
 */
class EventContract {
  constructor({ transport, registry, location }) {
    this.transport = transport;
    this.registry = registry;
    this.location = location;
    this._listeners = {};      // event name -> [fn]
    this._pending = new Map(); // requestId -> { resolve, reject, timer }

    transport.onMessage((msg) => this._handleIncoming(msg));
  }

  on(eventName, fn) {
    (this._listeners[eventName] = this._listeners[eventName] || []).push(fn);
    return this;
  }

  off(eventName, fn) {
    if (!this._listeners[eventName]) return;
    this._listeners[eventName] = this._listeners[eventName].filter(f => f !== fn);
  }

  /** Fire-and-forget emit. Returns the requestId in case the caller wants to correlate a later response manually. */
  emit(eventName, payload = {}, { correlationId = null } = {}) {
    const requestId = uuid();
    const envelope = {
      location: this.location,
      requestId,
      hash: sha256(payload),
      event: eventName,
      payload,
      correlationId,
      timestamp: new Date().toISOString(),
    };
    this.transport.send(envelope);
    return { requestId };
  }

  /**
   * Request/response. Resolves when a matching correlationId arrives,
   * or rejects on timeout. Use for anything that expects an answer
   * rather than a plain broadcast event.
   */
  request(eventName, payload = {}, { timeoutMs = 10_000 } = {}) {
    const { requestId } = this.emit(eventName, payload);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(requestId);
        reject(new Error(`Request '${eventName}' (${requestId}) timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this._pending.set(requestId, { resolve, reject, timer });
    });
  }

  /** Reply to a specific incoming envelope. */
  respond(envelope, payload = {}) {
    return this.emit(envelope.event + ':response', payload, { correlationId: envelope.requestId });
  }

  _handleIncoming(envelope) {
    if (!envelope || !envelope.location || !envelope.requestId) return;

    // Reject anything for a location that hasn't completed its handshake.
    if (!this.registry.isReady(envelope.location)) {
      this._dispatch('contract:rejected', { reason: 'handshake-not-ready', envelope });
      return;
    }

    // Integrity check.
    const expectedHash = sha256(envelope.payload);
    if (expectedHash !== envelope.hash) {
      this._dispatch('contract:rejected', { reason: 'hash-mismatch', envelope });
      return;
    }

    // Idempotency — drop exact repeats (retries, dupe delivery) on this location.
    if (this.registry.seen(envelope.location, envelope.hash)) {
      this._dispatch('contract:duplicate', { envelope });
      return;
    }
    this.registry.markSeen(envelope.location, envelope.hash);

    // Resolve a pending request() if this is a response to one.
    if (envelope.correlationId && this._pending.has(envelope.correlationId)) {
      const { resolve, timer } = this._pending.get(envelope.correlationId);
      clearTimeout(timer);
      this._pending.delete(envelope.correlationId);
      resolve(envelope.payload);
    }

    this._dispatch(envelope.event, envelope.payload, envelope);
  }

  _dispatch(eventName, payload, envelope) {
    (this._listeners[eventName] || []).forEach(fn => fn(payload, envelope));
  }
}

module.exports = { EventContract, sha256 };
