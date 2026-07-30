spec:
  meta:
    name:        loom
    version:     1.2.0
    status:      SPEC written 2026-07-25 to close GAP_1 (docs/nexus-tablet.spec).
                 Describes what runs; version matches lib/version.js services.loom.
    uuid:        nexus-loom-v1-0000-2026-0725-001
    foundation:  nexus-system-foundation@1.0.0
    port:        3752

  purpose: >
    LOOM builds and maps NEXUS. It is the component / hook / wire / seam
    registry + contracts — the WRITE AUTHORITY for the hook registry (§10.1,
    one write authority per data type). It is the system that answers "what is
    NEXUS made of and how is it wired."

  authority:
    hook_registry:
      role: "WRITE AUTHORITY. Architect holds a read view; all hook mutations go through loom (§10.1)."
      projection: >
        Hooks are a PROJECTION of the canonical component registry
        (FIX-ROADMAP-62): syncFromComponentRegistry runs at boot and every 30s.
        The hooks table is DERIVED, not an independent source of truth.
      seed: "Seeds built-in hooks only if the registry is empty; never competes with the projection."

  routes:
    - "GET / and /ui — the registry UI"
    - "GET /health — reports what loom owns: hooks.total, components.total (§12.6)"
    - "GET|POST /api/hooks[/:id] — full CRUD, write authority"
    - "POST /api/hooks/wire — create a hook→hook binding (fromId → toId); POST /api/hooks/unwire"
    - "GET|POST /api/registry/* — component registry access"
    - "GET /api/graph, /api/context-graph — the wire graph"
    - "GET /api/impact/:id — blast-radius / impact query"
    - "POST /api/ingest, /api/ingest-upload, /api/scaffold, /api/contracts — build surfaces"
    - "GET /api/revisions, /api/templates"

  the_tablet_depends_on_this:
    why_the_spec_matters: >
      docs/nexus-tablet.spec routes config-writes through the hook/wire registry
      so topology updates dynamically, and gives loom its own tile as "the system
      that builds and maps NEXUS." GAP_1 flagged that this load-bearing authority
      had no spec. Now its contract (write authority, the projection relationship,
      the wire/impact routes) is declared, so the tablet and RAID depend on a
      contract, not on loom's source.
    wire_binding_is_the_consumer_edge: >
      /api/hooks/wire creates fromId→toId bindings — a binding's toId IS a
      consumer relationship. This is the write path behind the consumer graph
      the tablet's brain view and the what-if walk read.

  known_state_2026_07:
    - "loom is optional:true in autopilot's manifest — it has booted OFFLINE in some runs (seen in v43 screenshots). When offline, architect's read view and the projection still hold from cortex's store, but live hook WRITES are unavailable until loom is up."
    - "hook projection populated: a real boot logged 226 components → 226 hooks created, 230 persisted (226 + 4 seeded)."

  axioms_enforced:
    §10.1: one write authority — loom owns hook writes, architect reads
    §10.3: hooks project from components — no competing truth layer
    §12.6: /health reports the registry loom owns
    §17.1: the system owns its own spec (this file, system-local, canonical)
