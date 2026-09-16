/**
 * ContractTransport
 * Makes an EventContract look like a plain transport (send()/onMessage())
 * so UpdateService and UpdateClient don't need to change at all — they
 * were written against WebRTCTransport's interface, and this satisfies
 * the same shape while routing everything through the handshake/hash/
 * dedup guarantees of EventContract underneath.
 *
 * Every push/ack/heartbeat message therefore gets, for free:
 *   - rejected if the connection's handshake location isn't complete
 *   - a requestId + payload hash attached automatically
 *   - silently dropped if it's an exact duplicate delivery
 *
 * Usage (server side):
 *   const contractTransport = new ContractTransport(eventContract);
 *   svc.registerClient(clientId, contractTransport);
 *
 * Usage (client side):
 *   const contractTransport = new ContractTransport(eventContract);
 *   const client = new UpdateClient({ clientId, transport: contractTransport });
 */
class ContractTransport {
  constructor(eventContract) {
    this.contract = eventContract;
    this._onMessageFn = null;
    this._openFn = null;
    this._closeFn = null;

    // update-service.js / update-client.js only ever send objects with
    // a `type` field ('push' | 'ack' | 'heartbeat') — use that as the
    // contract event name so each message kind is independently
    // addressable/traceable, but reconstruct the original flat shape
    // for the handlers so they're none the wiser.
    ['push', 'ack', 'heartbeat'].forEach((type) => {
      this.contract.on(type, (payload, envelope) => {
        if (!this._onMessageFn) return;
        this._onMessageFn({ type, ...payload, _envelope: envelope });
      });
    });

    this.contract.on('contract:rejected', (info) => {
      // A message arrived on a location whose handshake wasn't ready,
      // or failed its hash check. Surface it as a distinct message type
      // rather than silently eating it, so callers can log/alert.
      if (this._onMessageFn) this._onMessageFn({ type: 'contract:rejected', ...info });
    });
  }

  send(messageObj) {
    const { type, ...rest } = messageObj;
    this.contract.emit(type, rest);
  }

  onMessage(fn) { this._onMessageFn = fn; }

  // update-service.js's UpdateService doesn't currently call onOpen/onClose,
  // but WebRTCTransport exposes them, so these are here for interface parity
  // if you extend either side later.
  onOpen(fn) { this._openFn = fn; }
  onClose(fn) { this._closeFn = fn; }

  get isOpen() {
    return this.contract.transport.isOpen !== undefined ? this.contract.transport.isOpen : true;
  }
}

module.exports = { ContractTransport };
