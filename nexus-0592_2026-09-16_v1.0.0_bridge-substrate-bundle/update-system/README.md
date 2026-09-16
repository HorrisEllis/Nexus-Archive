# update-system

Drop-in library for server → client push updates over encrypted WebRTC data
channels. Server is the single source of truth. Clients never push — they
receive, verify, apply, and ack.

## Pieces

| File | Role |
|---|---|
| `schema/update-protocol.schema.json` | Shared message/manifest shapes. Validate against it if you want strict typing. |
| `transport/webrtc-transport.js` | Wraps an already-connected `RTCPeerConnection`'s data channel. Bring your own signaling. |
| `server/update-service.js` | `UpdateService` — revision history, publish(), rollbackTo(), per-client sync tracking. |
| `client/update-client.js` | `UpdateClient` — passive listener, checksum verification, apply + ack. |
| `client/drop-zone-listener.js` | Browser drop zone that stages changes locally; nothing sends until you call `.commit()` — matches "push button" requirement. |
| `contract/handshake-registry.js` | `HandshakeRegistry` — issues a unique **location** per connection, gates all events until that location's handshake completes. |
| `contract/event-contract.js` | `EventContract` — wraps every event in an envelope with `location` + `requestId` + `hash`, supports fire-and-forget `emit()` and correlated `request()/respond()`. |
| `contract/contract-transport.js` | `ContractTransport` — adapter so `UpdateService`/`UpdateClient` run *through* `EventContract` transparently, gaining location/hash/dedup guarantees on every push/ack/heartbeat without any code changes to either. |

## Flow

```
[drop zone] --stage--> [user hits push] --commit()--> [your server code]
                                                             |
                                                    UpdateService.publish()
                                                             |
                                                    (WebRTC data channel)
                                                             v
                                                    UpdateClient (per peer)
                                                    checksum -> applyHandler -> ack
```

## Quick start — server side

```js
const { UpdateService } = require('./server/update-service');
const { WebRTCTransport } = require('./transport/webrtc-transport');

const svc = new UpdateService({ projectId: 'nexus-bridge' });

// after your existing signaling negotiates a peerConnection for clientId:
const transport = new WebRTCTransport(peerConnection);
transport.createChannel();
svc.registerClient(clientId, transport);

// later, when a change is ready:
svc.publish({ summary: 'router hotfix', payload: { file: 'router.js', diff: '...' } });
```

## Quick start — client side

```js
const { UpdateClient } = require('./client/update-client');
const { WebRTCTransport } = require('./transport/webrtc-transport');

const transport = new WebRTCTransport(peerConnection);
peerConnection.ondatachannel = (e) => transport.attachChannel(e.channel);

const client = new UpdateClient({ clientId, transport });
client.applyHandler = async (manifest) => {
  // write manifest.payload.data to disk, update in-memory state, etc.
};
client.on('update:applied', (manifest) => console.log('now on revision', manifest.version.revision));
```

## Quick start — fully wired (recommended)

This is the real setup: signaling → handshake → contract → update service,
so pushes inherit location/hash/dedup guarantees automatically.

```js
// server side, per new connection
const { HandshakeRegistry } = require('./contract/handshake-registry');
const { EventContract } = require('./contract/event-contract');
const { ContractTransport } = require('./contract/contract-transport');
const { WebRTCTransport } = require('./transport/webrtc-transport');
const { UpdateService } = require('./server/update-service');

const registry = new HandshakeRegistry({ projectId: 'nexus-bridge' });
const svc = new UpdateService({ projectId: 'nexus-bridge' });

function onNewConnection(connectionId, peerConnection) {
  const location = registry.open(connectionId, { role: 'client' });
  // ... signaling exchanges offer/answer, referencing `location` as the room key ...
  registry.complete(location, { clientId: connectionId });

  const rawTransport = new WebRTCTransport(peerConnection);
  rawTransport.createChannel();

  const contract = new EventContract({ transport: rawTransport, registry, location });
  const contractTransport = new ContractTransport(contract);

  svc.registerClient(connectionId, contractTransport);
}

svc.publish({ summary: 'router hotfix', payload: { file: 'router.js', diff: '...' } });
```

```js
// client side
const { HandshakeRegistry } = require('./contract/handshake-registry');
const { EventContract } = require('./contract/event-contract');
const { ContractTransport } = require('./contract/contract-transport');
const { WebRTCTransport } = require('./transport/webrtc-transport');
const { UpdateClient } = require('./client/update-client');

const registry = new HandshakeRegistry({ projectId: 'nexus-bridge' });
const location = registry.open(clientId, { role: 'server' });
// ... signaling ...
registry.complete(location);

const rawTransport = new WebRTCTransport(peerConnection);
peerConnection.ondatachannel = (e) => rawTransport.attachChannel(e.channel);

const contract = new EventContract({ transport: rawTransport, registry, location });
const contractTransport = new ContractTransport(contract);

const client = new UpdateClient({ clientId, transport: contractTransport });
client.applyHandler = async (manifest) => { /* write manifest.payload.data */ };
client.on('update:applied', (manifest) => console.log('now on', manifest.version.revision));
```

`UpdateService` and `UpdateClient` are completely unchanged — `ContractTransport` just satisfies the same `send()`/`onMessage()` shape they already expect, while routing underneath through the handshake-gated, hash-checked, dedup'd contract layer.

## Quick start — event contract with handshake (standalone)

```js
const { HandshakeRegistry } = require('./contract/handshake-registry');
const { EventContract } = require('./contract/event-contract');

const registry = new HandshakeRegistry({ projectId: 'nexus-bridge' });

// server side, per new connection:
const location = registry.open(connectionId, { role: 'client' });
// ... your signaling exchanges offer/answer, referencing `location` as the room key ...
registry.complete(location, { clientId, publicKeyFingerprint });

// once the data channel is up on both sides:
const contract = new EventContract({ transport, registry, location });
contract.on('file:changed', (payload, envelope) => {
  console.log('got', envelope.requestId, 'hash', envelope.hash);
});

// request/response with timeout + correlation:
const reply = await contract.request('ping', {});
```

Every event that crosses the wire looks like:

```json
{
  "location": "hs://nexus-bridge/conn-abc/9c1e...-uuid",
  "requestId": "b3f2...-uuid",
  "hash": "sha256 of payload",
  "event": "file:changed",
  "payload": { "path": "router.js" },
  "correlationId": null,
  "timestamp": "2026-08-09T00:00:00.000Z"
}
```

- **Location** ties every event back to the exact handshake that authorized the connection — revoke the location, and every future event on it is dropped regardless of transport state.
- **requestId + hash** together mean each event is both traceable and idempotent — a retried or duplicate-delivered message with the same hash on the same location is dropped silently instead of double-applied.
- **correlationId** is what turns `emit()` into `request()` — set it to the original `requestId` and the caller's pending promise resolves.

## Invented additions beyond what was asked

- **Revision counter separate from semver** — semver (`major.minor.patch`) is yours to bump manually on real releases; `revision` is an internal monotonic counter every push increments, so diffing/rollback logic never depends on you remembering to bump a version number.
- **Checksums on every payload** — client rejects anything that doesn't hash-match before applying, so a corrupted or tampered push never gets written to disk.
- **Staleness rejection** — if a client somehow receives a push older than its current revision (reconnect race, replay), it rejects instead of silently regressing.
- **`rollbackOf` field** — a rollback is just a normal publish() that points back at the manifest it reverts, so rollback history stays visible in the same revision log instead of being a separate mechanism.
- **Channels** (`stable`/`beta`/`canary`/`dev`) baked into the schema — lets you run experimental builds to a subset of clients without a second update system.
- **Heartbeats** — clients ping their current revision periodically; if the server sees a client that's fallen behind (missed a push, e.g. was offline), it force-syncs on the next heartbeat rather than waiting for the client to notice.
- **File-backed revision history** (`.update-store/<projectId>/index.json`) — survives server restarts without a database.
- **Per-connection revocation** — because every event is anchored to a `location`, you can kill one connection's trust (`registry.revoke(location)`) without tearing down the transport or affecting any other client.
- **Idempotency ring per location** — each handshake location keeps a bounded set of seen payload hashes, so retried sends (common over flaky P2P links) never get applied twice.

## Not built here (still needs your signaling layer)

WebRTC offer/answer/ICE exchange isn't included — this assumes you already have a PeerServer/signaling channel (matches what's already in NEXUS Bridge). `WebRTCTransport` only wraps the data channel once a `RTCPeerConnection` exists.
