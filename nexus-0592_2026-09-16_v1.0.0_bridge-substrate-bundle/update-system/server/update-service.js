const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function uuid() { return crypto.randomUUID(); }
function sha256(data) {
  return crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

/**
 * UpdateService
 * Server-side source of truth for one project's revision history.
 * Server is authoritative — clients never push, only receive + ack.
 *
 * Usage:
 *   const svc = new UpdateService({ projectId: 'nexus-bridge', storeDir: './revisions' });
 *   svc.registerClient(clientId, transport);
 *   svc.publish({ summary: 'fix router bug', payload: {...} });
 *   // -> automatically pushed to every connected client on matching channel
 */
class UpdateService {
  constructor({ projectId, storeDir, channel = 'stable' }) {
    this.projectId = projectId;
    this.channel = channel;
    this.storeDir = storeDir || path.join(process.cwd(), '.update-store', projectId);
    this.clients = new Map();      // clientId -> { transport, state }
    this.revisions = [];           // in-memory index; persisted to storeDir
    this._revisionCounter = 0;

    fs.mkdirSync(this.storeDir, { recursive: true });
    this._loadHistory();
  }

  _loadHistory() {
    const indexPath = path.join(this.storeDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      this.revisions = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      this._revisionCounter = this.revisions.length
        ? this.revisions[this.revisions.length - 1].version.revision
        : 0;
    }
  }

  _saveHistory() {
    fs.writeFileSync(
      path.join(this.storeDir, 'index.json'),
      JSON.stringify(this.revisions, null, 2)
    );
  }

  /**
   * Register a connected client. `transport` must implement
   * send(obj) / onMessage(fn) as in webrtc-transport.js.
   */
  registerClient(clientId, transport, { startingRevision = 0 } = {}) {
    const state = {
      clientId,
      projectId: this.projectId,
      currentRevision: startingRevision,
      channel: this.channel,
      lastSeen: new Date().toISOString(),
      connectionStatus: 'connected',
      pendingManifestId: null,
    };
    this.clients.set(clientId, { transport, state });

    transport.onMessage((msg) => this._handleClientMessage(clientId, msg));

    // Catch the client up immediately if it's behind.
    this._syncClient(clientId);
    return state;
  }

  unregisterClient(clientId) {
    const entry = this.clients.get(clientId);
    if (entry) entry.state.connectionStatus = 'disconnected';
  }

  _handleClientMessage(clientId, msg) {
    const entry = this.clients.get(clientId);
    if (!entry) return;
    entry.state.lastSeen = new Date().toISOString();

    if (msg.type === 'ack') {
      if (msg.status === 'applied') {
        entry.state.currentRevision = msg.currentRevision;
        entry.state.pendingManifestId = null;
        entry.state.connectionStatus = 'connected';
      } else {
        // failed / rejected — fall back to sending a full snapshot next time
        entry.state.connectionStatus = 'stale';
        this._syncClient(clientId, { forceFullSnapshot: true });
      }
    } else if (msg.type === 'heartbeat') {
      entry.state.currentRevision = msg.currentRevision;
      if (entry.state.currentRevision < this._revisionCounter) {
        this._syncClient(clientId);
      }
    }
  }

  /**
   * Create a new revision and push it to every connected, in-sync client.
   * @param {object} opts
   * @param {string} opts.summary
   * @param {object} opts.payload - your actual change data (diff or full state)
   * @param {'full'|'diff'} [opts.kind='full']
   * @param {string} [opts.rollbackOf] - manifest id being reverted, if this is a rollback
   */
  publish({ summary, payload, kind = 'full', rollbackOf = null }) {
    this._revisionCounter += 1;
    const encoded = JSON.stringify(payload);

    const manifest = {
      id: uuid(),
      projectId: this.projectId,
      version: {
        major: 0, minor: 0, patch: 0, // bump these yourself on real releases
        revision: this._revisionCounter,
        channel: this.channel,
      },
      parentRevision: this._revisionCounter > 1 ? this._revisionCounter - 1 : null,
      createdAt: new Date().toISOString(),
      summary: summary || '',
      payload: {
        kind,
        encoding: 'json',
        checksum: sha256(encoded),
        sizeBytes: Buffer.byteLength(encoded),
        data: payload,
      },
      rollbackOf,
    };

    this.revisions.push(manifest);
    this._saveHistory();

    for (const clientId of this.clients.keys()) this._syncClient(clientId);
    return manifest;
  }

  /** Publish a manifest that reverts to an earlier revision. */
  rollbackTo(targetRevisionNumber) {
    const target = this.revisions.find(r => r.version.revision === targetRevisionNumber);
    if (!target) throw new Error(`No revision ${targetRevisionNumber} in history`);
    return this.publish({
      summary: `Rollback to revision ${targetRevisionNumber}`,
      payload: target.payload.data,
      kind: 'full',
      rollbackOf: target.id,
    });
  }

  _syncClient(clientId, { forceFullSnapshot = false } = {}) {
    const entry = this.clients.get(clientId);
    if (!entry || !this.revisions.length) return;
    const { transport, state } = entry;

    const latest = this.revisions[this.revisions.length - 1];
    if (!forceFullSnapshot && state.currentRevision >= latest.version.revision) return;

    const manifest = forceFullSnapshot
      ? { ...latest, payload: { ...latest.payload, kind: 'full' } }
      : latest;

    state.pendingManifestId = manifest.id;
    state.connectionStatus = 'syncing';
    transport.send({ type: 'push', manifest, requireAck: true, expiresAt: null });
  }

  getHistory() { return this.revisions; }
  getClientStates() { return Array.from(this.clients.values()).map(e => e.state); }
}

module.exports = { UpdateService, uuid, sha256 };
