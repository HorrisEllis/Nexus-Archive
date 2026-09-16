const crypto = require('crypto');

function sha256(data) {
  return crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

/**
 * UpdateClient
 * Passive receiver. Never initiates a push — only listens, applies,
 * and acknowledges. Emits events other parts of your app (file browser,
 * UI, whatever) can subscribe to instead of reaching into this class.
 *
 * Usage:
 *   const client = new UpdateClient({ clientId, transport, currentRevision: 0 });
 *   client.on('update:applied', (manifest) => { ... refresh UI ... });
 *   client.on('update:failed', (err) => { ... });
 *   client.applyHandler = async (manifest) => { ...write files, update state... };
 */
class UpdateClient {
  constructor({ clientId, transport, currentRevision = 0, heartbeatMs = 15000 }) {
    this.clientId = clientId;
    this.transport = transport;
    this.currentRevision = currentRevision;
    this._listeners = {};

    this.applyHandler = async (_manifest) => {
      throw new Error('UpdateClient.applyHandler not implemented — set it before use.');
    };

    transport.onMessage((msg) => this._handleMessage(msg));
    transport.onOpen(() => {
      this._emit('connected');
      this._heartbeat();
      this._heartbeatTimer = setInterval(() => this._heartbeat(), heartbeatMs);
    });
    transport.onClose(() => {
      this._emit('disconnected');
      clearInterval(this._heartbeatTimer);
    });
  }

  on(event, fn) {
    (this._listeners[event] = this._listeners[event] || []).push(fn);
    return this;
  }

  _emit(event, payload) {
    (this._listeners[event] || []).forEach(fn => fn(payload));
  }

  _heartbeat() {
    this.transport.send({ type: 'heartbeat', clientId: this.clientId, currentRevision: this.currentRevision });
  }

  async _handleMessage(msg) {
    if (msg.type !== 'push') return;
    const { manifest } = msg;

    // Staleness check — don't apply an update we've already surpassed
    if (manifest.version.revision <= this.currentRevision) {
      this._ack(manifest, 'rejected-stale');
      return;
    }

    // Integrity check
    const actualChecksum = sha256(JSON.stringify(manifest.payload.data));
    if (actualChecksum !== manifest.payload.checksum) {
      this._emit('update:failed', { manifest, reason: 'checksum-mismatch' });
      this._ack(manifest, 'rejected-checksum');
      return;
    }

    this._emit('update:incoming', manifest);
    try {
      await this.applyHandler(manifest);
      this.currentRevision = manifest.version.revision;
      this._emit('update:applied', manifest);
      this._ack(manifest, 'applied');
    } catch (err) {
      this._emit('update:failed', { manifest, reason: err.message });
      this._ack(manifest, 'failed', err.message);
    }
  }

  _ack(manifest, status, error = null) {
    this.transport.send({
      type: 'ack',
      manifestId: manifest.id,
      clientId: this.clientId,
      status,
      currentRevision: this.currentRevision,
      error,
      appliedAt: new Date().toISOString(),
    });
  }
}

module.exports = { UpdateClient };
