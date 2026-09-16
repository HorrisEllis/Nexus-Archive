const crypto = require('crypto');

function uuid() { return crypto.randomUUID(); }

/**
 * HandshakeRegistry
 * Every connection gets its own "location" — a namespaced address
 * (e.g. `hs://nexus-bridge/<connectionId>`) that all subsequent events
 * for that connection are anchored to. Nothing on the event contract
 * layer is accepted until the handshake for that location completes.
 *
 * This exists so that (a) you can tell connections apart even before
 * you trust them, (b) every event can be traced back to exactly which
 * handshake it belongs to, and (c) a connection can be revoked by
 * killing its location without touching any other connection.
 *
 * Usage (server side):
 *   const hs = new HandshakeRegistry({ projectId: 'nexus-bridge' });
 *   const location = hs.open(connectionId, { role: 'client' });
 *   // ... exchange offer/answer over signaling, referencing `location` ...
 *   hs.complete(location, { clientId, publicKeyFingerprint });
 *   hs.isReady(location); // true once complete
 */
class HandshakeRegistry {
  constructor({ projectId, ttlMs = 30_000 }) {
    this.projectId = projectId;
    this.ttlMs = ttlMs;
    this.locations = new Map(); // location -> record
  }

  /** Begin a handshake. Returns the location string to hand to both sides. */
  open(connectionId, meta = {}) {
    const location = `hs://${this.projectId}/${connectionId}/${uuid()}`;
    const record = {
      location,
      connectionId,
      status: 'pending',        // pending -> complete | expired | revoked
      openedAt: Date.now(),
      completedAt: null,
      meta,
      seenRequestHashes: new Set(), // dedup ring for this connection
    };
    this.locations.set(location, record);
    record._expireTimer = setTimeout(() => this.expire(location), this.ttlMs);
    return location;
  }

  /** Mark a handshake complete once both sides have verified each other. */
  complete(location, meta = {}) {
    const record = this.locations.get(location);
    if (!record) throw new Error(`Unknown handshake location: ${location}`);
    if (record.status === 'expired' || record.status === 'revoked') {
      throw new Error(`Handshake ${location} is ${record.status}, cannot complete`);
    }
    clearTimeout(record._expireTimer);
    record.status = 'complete';
    record.completedAt = Date.now();
    record.meta = { ...record.meta, ...meta };
    return record;
  }

  expire(location) {
    const record = this.locations.get(location);
    if (record && record.status === 'pending') record.status = 'expired';
  }

  revoke(location) {
    const record = this.locations.get(location);
    if (!record) return;
    clearTimeout(record._expireTimer);
    record.status = 'revoked';
  }

  isReady(location) {
    const record = this.locations.get(location);
    return !!record && record.status === 'complete';
  }

  get(location) {
    return this.locations.get(location) || null;
  }

  /** Idempotency check — has this exact request hash already been seen on this location? */
  seen(location, hash) {
    const record = this.locations.get(location);
    if (!record) return false;
    return record.seenRequestHashes.has(hash);
  }

  markSeen(location, hash) {
    const record = this.locations.get(location);
    if (!record) return;
    record.seenRequestHashes.add(hash);
    // simple bound so this doesn't grow forever on long-lived connections
    if (record.seenRequestHashes.size > 5000) {
      const [first] = record.seenRequestHashes;
      record.seenRequestHashes.delete(first);
    }
  }
}

module.exports = { HandshakeRegistry };
