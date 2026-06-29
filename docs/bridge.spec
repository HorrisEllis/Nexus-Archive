spec:
  meta:
    name:     bridge
    version:  3.0.0
    foundation: nexus-system-foundation@1.0.0
    port:     9999
    uuid:     nexus-bridge-v3-0000-2026-0615-jamesbrooks-001
    purpose: >
      The trust relay. Every request between systems passes through Bridge.
      Ledger-backed persistence. Circuit breaker. Identity trust tiers.
      If a downstream system is down, Bridge holds requests and replays them.

  core:
    schemas:
      - BridgeRequest:  "{ uuid, from, to, method, path, body, status, retries, ts }"
      - TrustRecord:    "{ systemId, trust, lastSeen, consecutiveFails }"
    axioms: [AX-002, AX-003, AX-007]
    constants:
      TRUST_TIERS:      "{ UNKNOWN, CANDIDATE, MEMBER }"
      CIRCUIT_STATES:   "{ CLOSED, HALF_OPEN, OPEN }"
      REPLAY_LIMIT:     3
      HB_POLL_MS:       5000

  events:
    emits:
      - "bridge.booted"
      - "bridge.request.received"
      - "bridge.request.forwarded"
      - "bridge.request.held"
      - "bridge.request.replayed"
      - "bridge.circuit.opened"
      - "bridge.circuit.closed"
      - "bridge.identity.upgraded"
    handles:
      - "system.registered → identity.candidate"
      - "heartbeat.tick    → registry.poll"

  # 🔴 Previous version of this section listed bridge.status / bridge.held
  # at /api/bridge/status and /api/bridge/held — neither route exists in
  # bridge/registry-components.js. Replaced with the real 11 components,
  # checked directly against the file.
  handshake:
    components:
      - id: "bridge.health"
        route: { method: GET, path: "/health" }
        description: "Bridge health + relay stats"

      - id: "bridge.contract"
        route: { method: GET, path: "/api/contract" }
        description: "Bridge interaction contract"

      - id: "bridge.events"
        route: { method: GET, path: "/events" }
        description: "SSE — all bridge events"

      - id: "bridge.relay.request"
        route: { method: POST, path: "/api/relay" }
        description: "Route request through P2P trust relay"
        hooks: { out: ["cortex.cfr.graph"] }

      - id: "bridge.nodes.list"
        route: { method: GET, path: "/api/nodes" }
        description: "Connected relay nodes"

      - id: "bridge.node.register"
        route: { method: POST, path: "/api/nodes" }
        description: "Register a relay node"

      - id: "bridge.node.trust"
        route: { method: POST, path: "/api/nodes/:id/trust" }
        description: "Set trust score for a node"

      - id: "bridge.requests.list"
        route: { method: GET, path: "/api/requests" }
        description: "Request log"

      - id: "bridge.circuit.status"
        route: { method: GET, path: "/api/circuit" }
        description: "Circuit breaker state per node"

      - id: "bridge.circuit.reset"
        route: { method: POST, path: "/api/circuit/:id/reset" }
        description: "Reset circuit breaker for node"

      - id: "bridge.identity.verify"
        route: { method: POST, path: "/api/identity/verify" }
        description: "Verify system identity token"

  # ── AX-008 (foundation addendum v1.1.0) ────────────────────────────────────
  # 🔴 OPEN — none of the 11 components above wire to copilot.*. relay.request
  # is the one with a real hooks.out today (→ cortex.cfr.graph). Needs a
  # second wire — e.g. bridge.relay.held → copilot.* — so a held/replayed
  # request is visible to copilot, not just to CFR.

  # ── L4-EXTERNAL (foundation addendum v1.1.0) ──────────────────────────────
  # This spec's identity.verify route is internal L4 — shared secret via
  # bridge/identity.js, SYSTEM_SECRETS map, the 9 known services. If/when
  # bridge needs to talk to a foreign sovereign system (Bridge OS, a future
  # NEXUS-family project), that's a second, parallel path — kern-v2's
  # Ed25519 + grammar-intersection handshake, not a replacement for the
  # route above. See the addendum doc for why these stay separate.

  tests:
    - "Trust tier advances UNKNOWN → CANDIDATE → MEMBER on consecutive successful contracts"
    - "Circuit opens after REPLAY_LIMIT consecutive fails, half-opens after cooldown"
    - "Held requests replay in original order on downstream recovery"
    - "identity.verify rejects an expired or unknown token with explicit 401, never silent pass (§1.2)"

  ui:
    type: "panel in nexus-shell"
    hotswap: true
