spec:
  meta:
    name:        phase-map
    version:     1.0.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-phase-map-v1-0000-2026-0615-jamesbrooks-001
    purpose: >
      Complete build phase map. Bottom up. File system first. UI last.
      The canonical record of what's been built and what's next.
      Update this spec every session.

  # ── FLAGGED 2026-06-24, not silently fixed ──────────────────────────────────
  # Two structural defects found while adding the raid_integration entry below:
  #   1. phase_9 and phase_10 each appear TWICE under `next:`, with completely
  #      different content each time ("Request Handler" vs "User Model" for 9;
  #      "Constitutional AI" vs "nexus-shell.html" for 10). Left both pairs
  #      in place rather than guessing which one is current — pick one and
  #      delete the other when you next touch this file.
  #   2. This file caps at phase_16, but other real specs in this codebase
  #      already cite higher numbers: gap-lifecycle.spec = phase 23.7,
  #      lib/compartment-engine.js = "Phase 25," the uploaded roadmap HTML =
  #      up to Phase 68. This file has not been the source of truth for
  #      phase numbering for a while. Treat its numbers as unreliable until
  #      reconciled against those.
  # raid_integration below is therefore NOT given a numeric phase — assigning
  # one against a numbering scheme already known to be broken would just be
  # a third instance of the thing this session has spent itself catching.

  complete:
    phase_0: "Kernel — bus, JAA, boot-sequence, auth, contracts, version"
    phase_1: "Persistence — vector-memory, chat-logger, event-ledger, spec-drift"
    phase_2: "Organs — gap-finder, healer, self-heal, escalation, orion, RAID, heartbeat, intelligence, behavioral-boundary"
    phase_3: "Meta layer — topo-kernel, telemetry-codec, liminal, bda, spatial, alk-perception"
    phase_4: "Registry — component-registry (16/16), ui-registry (12/12)"
    phase_5: "Grammar engine — trie, resolve, complete, parseParams (16/16)"
    phase_6: "CLI runtime — nexus-cli.js + cli-reasoning.js (Qwen 0.5b)"

  next:
    phase_9:
      name: "Request Handler (constitutional choke point)"
      file: "lib/request-handler.js + lib/constitutional-ai.js + lib/reflection.js"
      description: >
        Single entry. No bypasses. No exceptions.
        Phase A: should we act? (intent → goal graph → constitution → cost → ALLOW/DEFER/DENY/CLARIFY/UNRESOLVED)
        Phase B: how? (grammar → SNR → memory → RAID → execute)
        Phase C: reflect (was this worth doing?)
        Phase D: learn (memory update → crystallisation → gap registration)

    phase_10:
      name: "Constitutional AI"
      file: "lib/constitutional-ai.js"
      description: "Goal graph, constitution (USER_AUTONOMY/REVERSIBILITY/TRUTH/EXPLAINABILITY), cost analysis, identity kernel"

    phase_11:
      name: "Reflection Engine"
      file: "lib/reflection.js"
      description: "Was this worth doing? UNRESOLVED as first-class state. Decision+reason+outcome not event streams."

    phase_12:
      name: "User Model + Guardian Understanding"
      file: "JAA user_model table + organ event wiring"
      description: "BDA baseline, flow signature, friction profile, regime history — guardian routes better over time"

    phase_13:
      name: "Autonomous Loop"
      description: "Ollama as brain. Agent fallback with full context. Lattice maintains continuity. Rewind on failure."

    phase_14:
      name: "Hot Module Loader"
      file: "lib/hot-module-loader.js"
      description: "Drop file → validate schema → integrate live. Build anything. Same architecture every time."

    phase_15:
      name: "Emerge Removal + Cleanup"
      description: ".spec replaced it. Remove from boot sequence."

    phase_16:
      name: "nexus-shell.html — Layered TV Channel UI"
      file: "ui/nexus-shell.html"
      description: >
        Layer 0: meta shell — always visible, floating menu, system grid.
        Layer 1: active channel — each system sovereign, alive, animated.
        Consistent design language. Each system has its own character.
        Inline assistant in every channel — logs to Cortex, request handler takes it.
        Editor mode — any channel becomes full-screen spec editor.
        Tutorial flow baked in — step by step guided tour.
        Hotswappable. Bootstraps from registry. Last phase.

    phase_7:
      name: "Liminal Organ"
      file: "cortex/liminal-space/index.js"
      change: "ONE LINE in organs array"
      description: >
        5 interstitial spaces as JAA-backed live data structures.
        L0∩L2 constitutional threshold, L1∩L3 pattern-causality membrane,
        L2∩L4 velocity field, L3∩L0 root terminus, L1∩L2 coherence surface.
        Forward inference on crystallised patterns — same architecture as
        spec-drift, time direction reversed. Gap shape is the diagnostic signal.
        Crystallisation requires evidence threshold OR focal point confirmation.

    phase_8:
      name: "SNR Filter on RAID + Self-Heal"
      description: >
        Cortex first — known invariants, crystallised patterns.
        Open loop + known invariant = deterministic fix, zero tokens.
        Unresolved → orchestrator → agents → AI.
        Invariants are constraints not suggestions.
        Only genuine unknowns reach AI.
        Feedback loop: system observes itself, heals itself
        using what it already knows before asking for help.

    phase_9:
      name: "User Model + Guardian Understanding"
      file: "JAA user_model table + organ event wiring"
      description: >
        Guardian understands user better over time via BDA baseline,
        RAID outcome history, friction profile, liminal gap frequency,
        regime history. Used for: provider weighting, context injection
        from similar regime states, gap anticipation, velocity awareness,
        contradiction surfacing. Sovereign — local only, never transmitted.

    phase_10:
      name: "nexus-shell.html"
      description: >
        LAST. One file replacing 33,814 lines of fragmented HTML.
        Three panels: system map, dynamic CLI, context+liminal.
        Bootstraps from registry. Hotswappable.
        Hotswap test: delete file, system continues via CLI.

  guides_to_write:
    - "getting-started.guide — boot, models, userscripts, first command"
    - "architecture.guide — six layers, event bus, zones"
    - "building.guide — add system, organ, component"
    - "healing.guide — gaps, friction, escalation, failure modes"
    - "cli.guide — grammar engine, Qwen reasoning, tab completion"
    - "recovery.guide — rebuild from specs if code is lost"
    - "user-model.guide — what guardian knows about you and why"

  raid_integration:
    phase: UNASSIGNED   # see flag at top of this file — numbering scheme broken, not guessing
    status: blocked
    spec_file: raid-integration.spec
    purpose: >
      Wire RAID's actual decision pipeline (_cluster → _decide →
      intelligence-bridge → _dispatch → _updateW, verified against
      cortex/core/raid/index.js) to ALK, replay-engine, reflection, and
      compartment-engine — all five named real, none currently connected
      to RAID except _brainTick's existing async batch use of Ollama.
    ready_to_build:
      - "ALK logging inside _decide() — actor:'raid' records, currently test-only"
      - "replay-engine snapshot around the _decide() call site — header already names this trigger, never wired"
    blocked_on_open_decision:
      - "4.1 Mistral fork: live in the hot path (breaks _decide()'s declared determinism, raid/index.js line 11) vs extending _brainTick() (async, determinism intact, tunes weights rather than picking per-call)"
      - "4.2 reflection write-back: reverses lib/reflection.js's own documented decision — 'no RAID-side change' — confirm before building, don't infer"
    blocked_regardless:
      - "compartment-engine full wiring — Phase 25's own sub-steps 4 (adversary suite) and 5 (crystal/lattice updates) don't exist yet; skeleton hookup on _dispatch() is the ceiling right now"
    full_detail: see raid-integration.spec, Sections 1-4
