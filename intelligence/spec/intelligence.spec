spec:
  meta:
    name:        intelligence
    version:     0.1.0-draft
    foundation:  nexus-system-foundation@1.0.0
    port:        :3753
    uuid:        nexus-intelligence-v1-0000-2026-0822-jamesbrooks-001
    purpose: >
      Consolidates NEXUS's real cognition layer into its own standalone
      system, matching the established architecture (CLI, API, event-
      driven interaction contract, event ledger, event-type registry,
      SSE, input/output queue folders, UI last if applicable). Currently
      scattered across three real locations with no single home:
      cortex/intelligence/ (pattern learning, RFR2/relational-field,
      adversarial, intuition, mastermind), meta/cfr/ (field/regime
      state — the actual sigma/friction/regime math nearly every real
      system reads), and lib/baseline.js + lib/snapshot-trigger.js
      (behavioral baseline and the sigma→snapshot bridge). This spec is
      the map-first + spec-it step James asked for explicitly, before
      any file moves — nothing here has been moved yet.

  # ── Real, current scope — traced directly, not estimated ──────────────────
  current_locations:
    - path: cortex/intelligence/
      files: [index.js, relational-field.js, adversarial.js, intuition.js, mastermind.js]
      lines: 2063
      real_consumers: 8
      consumer_files:
        - lib/diagnostic-report.js
        - lib/ledger-fanin/boot.js
        - lib/diagnostic-causal.js
        - lib/snapshot-trigger.js
        - lib/autopilot-intelligence.js
        - lib/nexus-client.js
        - copilot/adversarial.js
        - copilot/optimizer.js
      risk: low — a small, already-fairly-contained consumer set.

    - path: meta/cfr/
      lines: 1777
      real_consumers: 24
      consumer_files:
        - cortex/boot.js
        - cortex/intelligence/index.js
        - cortex/versionium/causality.js
        - cortex/core/raid/index.js
        - cortex/memory/causal-lookup.js
        - idearium/index.js
        - guardian/server.js
        - orchestrator/lib/sigma-writer.js
        - loom/scanners/source-map.js
        - orchestrator.js
        - autopilot.js
        - meta/lattice/associative-lattice.js
        - meta/causal/compound.js
        - meta/alk/index.js
        - cli/sentinel.js
        - cli/cfr-debug.js
        - service/nexus-diagnostic.js
        - lib/agent-tools/tools/query/meta-query.js
        - architect/service.js
        - copilot/diagnostics.js
        - copilot/movement-map.js
        - bridge/index.js
        - bridge/causal/graph.js
      risk: >
        HIGH — this is load-bearing, synchronous infrastructure most of
        NEXUS reads directly and often (field/regime state, on
        real-time decision paths). Converting 24 real, in-process
        require() calls to network calls in one pass risks introducing
        latency and failure modes system-wide. This is the reason this
        extraction is phased below, not done in one move.

    - path: lib/baseline.js
      lines: 363
      real_consumers: 6
      consumer_files: [guardian/server.js, service/cortex-service.js, service/nexus-diagnostic.js, service/idearium-service.js, service/guardian-service.js]
      risk: low-medium — several service/*.js entry points, worth care but a small, well-understood set.

    - path: lib/snapshot-trigger.js
      lines: 126
      real_consumers: 2
      consumer_files: [lib/ledger-fanin/boot.js, lib/diagnostic-causal.js]
      risk: low.

  core:
    schemas: {}
    axioms: [AX-001, AX-002, AX-003]
    constants:
      COMPONENT_ID_RESERVED: "nexus-in"   # not yet claimed in lib/uid/component-map.js — reserved here, claimed at registry-update step

  # ── Real event-type registry — James: "it needs a registry of event
  # types relevant to the system." Traced from real, current emit/handle
  # sites across the four real pieces above, not invented. ─────────────
  events:
    emits:
      - "intelligence.pattern.crystallised"
      - "intelligence.meta-scan.complete"
      - "cortex.gap.found"              # already real — emitted from cortex/intelligence today
      - "cfr.regime.changed"
      - "cfr.friction.updated"
      - "baseline.deviation.detected"
      - "sigma.snapshot.triggered"
      - "intelligence.failure_precursor.detected"
    handles:
      - "event_log.append"              # reads the shared event log to crystallise patterns from
      - "sigma.event.*"
      - "anomaly.detected"

  modules:
    - id: pattern-learner
      description: "cortex/intelligence/index.js — real pattern crystallisation from event_log + live bus."
      source: cortex/intelligence/
      migration_phase: 1
    - id: relational-field
      description: "RFR2 — cortex/intelligence/relational-field.js, causal depth/supporting-events tracking."
      source: cortex/intelligence/relational-field.js
      migration_phase: 1
    - id: adversarial
      description: "cortex/intelligence/adversarial.js"
      source: cortex/intelligence/
      migration_phase: 1
    - id: intuition
      description: "cortex/intelligence/intuition.js"
      source: cortex/intelligence/
      migration_phase: 1
    - id: mastermind
      description: "cortex/intelligence/mastermind.js"
      source: cortex/intelligence/
      migration_phase: 1
    - id: baseline
      description: "lib/baseline.js — behavioral baseline tracking."
      source: lib/baseline.js
      migration_phase: 2
    - id: snapshot-trigger
      description: "lib/snapshot-trigger.js — sigma-deviation-to-snapshot bridge."
      source: lib/snapshot-trigger.js
      migration_phase: 2
    - id: field-regime
      description: "meta/cfr/ — the real sigma/friction/regime math. 24 real, mostly-synchronous callers across nearly every system. NOT moved until phase 3, and even then via a compatibility shim (see rollout below), not a hard cutover."
      source: meta/cfr/
      migration_phase: 3
    - id: framework-builder
      description: >
        James: "frameworks for co-pilot. Can say, hey nexus lets create
        a framework." Real, new module — not an extraction, a genuine
        new capability. Uses the already-real nexus_wake_events tool
        pipeline (built this session) as its trigger: a wake request
        matching an intent like "create a framework" builds a real
        WARP-based skeleton (reusing warp/core/Axiom.js, Gate.js —
        already real, already built) and writes it to a real, physical
        drop folder (intelligence/frameworks/, watched, per James's
        explicit "drag and drop" ask), tagged.
      source: new
      migration_phase: 4

  # ── Handshake — matches every real sibling system's shape exactly ─────────
  handshake:
    components:
      - { id: "intelligence.health",  route: { method: GET,  path: "/health" } }
      - { id: "intelligence.pattern", route: { method: GET,  path: "/api/patterns" } }
      - { id: "intelligence.cfr",     route: { method: GET,  path: "/api/cfr/state" } }
      - { id: "intelligence.context", route: { method: GET,  path: "/api/context" },
          description: "Replaces cortex's current /api/intelligence/context — same real callers, new home." }
      - { id: "intelligence.framework.create", route: { method: POST, path: "/api/framework/create" },
          hooks: { in: ["nexus.wake.detected"] } }
      - { id: "intelligence.sse",     route: { method: GET,  path: "/sse" } }

  # ── CLI — James: "cli, api, ... event ledger" ──────────────────────────────
  cli:
    entry: cli/intelligence-repl.js   # new, matching cli/nexus-repl.js's real, established pattern
    commands: [patterns, cfr, context, framework, wake]

  # ── Storage — James: "database in cortex" ──────────────────────────────────
  storage: >
    Stays in cortex's existing JAA store (data/cortex/memory), same
    pattern every other real system already uses (each opens its own
    jaaDB connection to the same shared, file-backed directory — not a
    new, separate database). Confirmed this is how agent-notes.js,
    nexus-wake-events.js, and account-identity-index.js (all built this
    session) already work correctly.

  # ── Queue — James: "input and output folder" ────────────────────────────────
  queue:
    input:  intelligence/input/
    output: intelligence/output/
    mechanism: lib/contract-queue.js   # the real, already-general queue library found this session — not a new mechanism

  # ── Rollout — phased explicitly because of CFR's real risk profile ────────
  rollout:
    phase_1: "Move cortex/intelligence/'s 5 files + their 8 real consumers. Smallest, most contained. Proves the pattern."
    phase_2: "Move lib/baseline.js + lib/snapshot-trigger.js + their 8 combined real consumers."
    phase_3: >
      §CORRECTED 2026-08-22, before any phase 3 work began — read
      meta/cfr's actual code (field.js, ledger.js) per §8.7, not just its
      caller count, before touching anything. The original plan below
      (compatibility shim, kept in-process/synchronous) assumed meta/cfr
      was architecturally like cortex/intelligence — a shared service
      worth centralizing. It is not: createCFRField() closes over purely
      local, in-memory state; createCFRLedger() requires a caller-
      provided ledgerDir and persists to real, per-directory disk files.
      Every one of the 24 real callers correctly instantiates its OWN
      independent field + ledger — this is a reusable LIBRARY pattern,
      not a shared service. Centralizing it into one standalone HTTP
      system would collapse 24 legitimately independent, correct,
      per-system health-tracking instances into one shared, network-
      dependent one — a real regression, not a consolidation.
      Real, corrected phase 3: a pure file relocation, same category of
      work as phases 1 and 2 — git mv meta/cfr/ into intelligence/,
      fix the 24 real require paths, keep it exactly as a locally-
      instantiated library. No shim. No service. No behavior change,
      only location — genuinely lower risk than the plan below, not
      higher.
      [ORIGINAL PLAN, superseded, kept for the record per §17.3 —
      alternatives and rejections stay visible, not deleted]: meta/cfr/
      — NOT a straight move. Build the new system's real field-regime
      module first, keep meta/cfr/ itself in place as a thin,
      synchronous, in-process compatibility shim that forwards to the
      new system's local state (kept warm, not a network call on every
      read) so the 24 real, mostly-synchronous callers need zero
      changes at this phase. Only after phase 3 is proven stable does a
      later, separate decision get made about whether those 24 callers
      ever actually convert to real API calls, or whether the shim is
      the permanent, correct answer given how synchronous their real
      usage is.
    phase_4: "framework-builder — new capability, no migration risk, can build any time after phase 1."

  # ── Explicitly NOT done yet, per James's own ordering ──────────────────────
  not_yet_done:
    - "No files moved."
    - "lib/uid/component-map.js not yet updated — nexus-in reserved here, not claimed."
    - "No consumer files edited."
    - "No new system process built or started."
