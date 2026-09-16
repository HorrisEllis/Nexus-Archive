/**
 * WebRTCTransport
 * Thin wrapper around a WebRTC RTCDataChannel so update-service.js and
 * update-client.js never touch signaling/ICE directly. Swap this out for
 * a websocket-transport.js later without touching the service logic.
 *
 * Signaling itself is NOT handled here — bring your own signaling
 * (your existing PeerServer / PeerJS setup). This class just wraps
 * an already-negotiated RTCPeerConnection's data channel.
 */

class WebRTCTransport {
  /**
   * @param {RTCPeerConnection} peerConnection - already connected
   * @param {object} opts
   * @param {string} [opts.label='update-channel']
   * @param {boolean} [opts.ordered=true]
   */
  constructor(peerConnection, opts = {}) {
    this.pc = peerConnection;
    this.label = opts.label || 'update-channel';
    this.ordered = opts.ordered !== false;
    this.channel = null;
    this._onMessage = null;
    this._onOpen = null;
    this._onClose = null;
    this._queue = []; // buffered sends while channel is not yet open
  }

  /** Call on the offering side to create the channel. */
  createChannel() {
    this.channel = this.pc.createDataChannel(this.label, { ordered: this.ordered });
    this._bind();
    return this.channel;
  }

  /** Call on the answering side, from pc.ondatachannel event. */
  attachChannel(channel) {
    this.channel = channel;
    this._bind();
  }

  _bind() {
    this.channel.onopen = () => {
      while (this._queue.length) this.channel.send(this._queue.shift());
      if (this._onOpen) this._onOpen();
    };
    this.channel.onclose = () => { if (this._onClose) this._onClose(); };
    this.channel.onmessage = (event) => {
      if (!this._onMessage) return;
      try {
        const msg = JSON.parse(event.data);
        this._onMessage(msg);
      } catch (err) {
        this._onMessage({ type: 'error', error: 'malformed-message', raw: event.data });
      }
    };
  }

  send(messageObj) {
    const encoded = JSON.stringify(messageObj);
    if (this.channel && this.channel.readyState === 'open') {
      this.channel.send(encoded);
    } else {
      this._queue.push(encoded); // flushed on open
    }
  }

  onMessage(fn) { this._onMessage = fn; }
  onOpen(fn) { this._onOpen = fn; }
  onClose(fn) { this._onClose = fn; }

  get isOpen() {
    return !!this.channel && this.channel.readyState === 'open';
  }

  close() {
    if (this.channel) this.channel.close();
  }
}

module.exports = { WebRTCTransport };
