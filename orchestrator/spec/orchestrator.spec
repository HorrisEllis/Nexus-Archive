spec:
  meta:
    name:        orchestrator
    version:     2.2.0
    foundation:  nexus-system-foundation@1.0.0
    port:        9000
    uuid:        nexus-orchestrator-v2-0000-2026-0615-jamesbrooks-001
    purpose: >
      The root coordinator. Single focal point for every UI, CLI,
      and external consumer. Every system registers here.
      The orchestrator never does business logic — it routes,
      verifies, and coordinates. The component registry and UI
      handshake live here because they are system-wide concerns.

  core:
    schemas:
      - SystemRegistration: "{ systemId, port, version, meta, components, contract }"
      - ContractVerification: "{ systemId, trust, hash, checkedAt, routeCount }"
      - UISession: "{ id, name, type, capabilities, sessionId, online, lastSeen }"
      - Component: "imported from component-registry"
    axioms: [AX-001, AX-002, AX-003, AX-007]
    constants:
      PORT:            9000
      BIND_HOST:       "127.0.0.1"
      CONTRACT_TRUST:  "{ VERIFIED, DEGRADED, MISMATCH, UNREACHABLE }"
      HB_TIMEOUT_MS:   70000

  events:
    emits:
      - "orchestrator.booted"
      - "system.registered"
      - "system.contract.verified"
      - "system.contract.unreachable"
      - "component.registered"
      - "component.updated"
      - "component.unavailable"
      - "ui.registered"
      - "ui.disconnected"
      - "registry.grammar.rebuilt"
    handles:
      - "All events from all systems via bridge relay"

  routes:
    external:
      - "GET  /                         NEXUS shell UI"
      - "GET  /health                   All systems health"
      - "GET  /events (SSE)             All system events broadcast"
      - "GET  /api/contract             Full system map"
      - "GET  /api/status               System registry state"
      - "GET  /api/version              Version registry"
      - "POST /api/register             System registration"
      - "GET  /api/components           Component index"
      - "GET  /api/components/grammar   Grammar tree for CLI"
      - "GET  /api/components/schema    Component schema"
      - "GET  /api/components/:id       Single component"
      - "POST /api/components/register  Register components"
      - "PUT  /api/components/:id       Update component"
      - "DELETE /api/components/:id     Deprecate component"
      - "POST /api/ui/register          UI handshake"
      - "POST /api/ui/heartbeat         UI keepalive"
      - "GET  /api/ui/connected         Connected UIs"
      - "DELETE /api/ui/:sessionId      UI disconnect"
      - "GET  /api/search/*             Proxied to cortex"
      - "GET  /api/engines              Proxied to diagnostic"
      - "GET  /api/guardian/*           Proxied to guardian"
      - "GET  /api/cortex/*             Proxied to cortex"
      - "GET  /api/bridge/*             Proxied to bridge"

  handshake:
    note: >
      The orchestrator is the handshake authority.
      It does not register with itself — it IS the registry.
      But it does declare its own components so they appear in the CLI.
    components:
      - id: "orchestrator.status"
        grammar: ["orchestrator status", "status", "st"]
        route: { method: GET, path: "/api/status" }
        description: "Full system status — all registered services"

      - id: "orchestrator.systems"
        grammar: ["orchestrator systems", "systems", "sys"]
        route: { method: GET, path: "/api/status" }
        description: "List all registered systems and their trust state"

      - id: "orchestrator.version"
        grammar: ["orchestrator version", "version", "ver"]
        route: { method: GET, path: "/api/version" }
        description: "NEXUS version registry — all module versions"

      - id: "orchestrator.contract"
        grammar: ["orchestrator contract", "contract"]
        route: { method: GET, path: "/api/contract" }
        description: "Full system contract — services, routes, schemas"

      - id: "orchestrator.components"
        grammar: ["components list", "components", "comp"]
        route: { method: GET, path: "/api/components" }
        description: "Component registry — all available commands"
        params: [{ name: namespace, type: string, cli: "--namespace" },
                 { name: tag, type: string, cli: "--tag" },
                 { name: q, type: string, cli: "--q" }]

      - id: "orchestrator.ui.connected"
        grammar: ["ui connected", "ui list", "uis"]
        route: { method: GET, path: "/api/ui/connected" }
        description: "Connected UI sessions"

  modules:
    - id: component-registry
      version: "1.0.0"
      description: "Self-describing kernel. Persists to JAA components table."

    - id: ui-registry
      version: "1.0.0"
      description: "UI session tracking. Heartbeat. SSE event routing."

    - id: contract-handshake
      version: "1.0.0"
      description: "RSA-verified contract verification for registered systems."

    - id: boot-sequence
      version: "1.0.0"
      description: "Phase-gated HARD/SOFT boot with §1.2 loud failure."

    - id: peer-relay
      version: "1.0.0"
      description: "Two NEXUS instances discover each other and proxy through each other."

  ui:
    type: "nexus-shell.html (Phase 4)"
    hotswap: true
    panels:
      - "SYSTEM MAP — live service health, trust state, version"
      - "CLI — dynamic grammar from component registry"
      - "EVENTS — live SSE event stream"
      - "COMPONENTS — full component registry browser"
      - "UI SESSIONS — connected UIs, types, heartbeat status"

  # §ADDED 2026-09-03 — James: "update the living models." orchestrator.spec
  # had none of the real LM1/AX-013 fields despite this session touching
  # its own contract-verification code directly (a real bug, found from a
  # live boot log). History starts from what's genuinely verifiable this
  # session (§1.1 — an honest, shorter log beats a fabricated one).
  history:
    - date: 2026-09-02
      summary: >
        The officiator (cortex/core/raid/officiator.js, see cortex.spec's
        own matching entry) started here, alongside cortex/core/raid/
        worker.js — same real pattern, same real idempotent start().
    - date: 2026-09-02
      summary: >
        New real POST /api/officiator/synthesize route — the sovereign-
        transport door a tool running in guardian's or copilot's own
        process needs to reach officiator.js, which runs in THIS
        process, not theirs.
    - date: 2026-09-02
      summary: >
        §BUGFIX — James, live, from a real boot log: "[orch]
        contract.unreachable — versionium (invalid JSON: Unexpected
        token 'N', "Not found" is not valid JSON)". Real root cause:
        this system's own orchestrator/lib/contract-handshake.js
        CONTRACT_PATHS map never got a versionium entry when VS1 made it
        sovereign (a same-session gap, not an old one) — every real poll
        fell through to the wrong default path and hit a genuine 404
        whose plain-text body isn't valid JSON. One-line fix; a new test
        (tests/modules/test-contract-handshake-paths.js) now checks
        every sovereign system's claimed contract path against its own
        real route file, so a third addition can't repeat this silently.
    - date: 2026-09-05
      summary: "docs: update the living models — real history entries, plus a real pre-existing YAML bug found and fixed in 4 specs (1 real file touched)"
    - date: 2026-09-05
      summary: "chore: register the two orphans the new post-commit hook itself flagged (1 real file touched)"
    - sha: f66c6f434bd997c38ccef6de34109805a2767ee8
      date: 2026-09-05
      summary: "fix: real, tested merge safety for parallel-session history writes — found a genuine, silent data-loss risk before it could bite (1 real file touched)"

  gaps:
    as_of: 2026-09-03
    entries:
      - id: O1
        type: coverage
        summary: >
          This spec itself had zero real history/gaps/version_history
          fields until this pass — the exact class of staleness AX-013/
          LM1 exists to prevent, found only because "update the living
          models" was asked directly.
        opened: 2026-09-03
        status: CLOSED
        closed: 2026-09-03
        resolution: "This same pass — closed by writing the schema this gap describes as missing."
      - id: O2
        type: coverage
        summary: >
          CONTRACT_PATHS (orchestrator/lib/contract-handshake.js) is a
          real, hand-maintained map with no single authoritative source
          — a system's own real bare-/contract-vs-/api/contract choice
          has to be discovered and added here manually each time, which
          is exactly how the versionium gap (above) happened, and how
          loom's own identical gap happened before it (§BUGFIX
          2026-07-04, this file's own prior comment). A real, structural
          fix (e.g. each system self-reporting its own contract path at
          registration time) is undecided, unbuilt work.
        opened: 2026-09-02

  version_history:
    - version: 2.2.0
      date: 2026-09-03
      summary: "Retroactive first entry — living-model schema added for the first time, matching lib/version.js's own real, currently-tracked orchestrator version. No schema-only bump implied."
      versioniumCommitId: null
