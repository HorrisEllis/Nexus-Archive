spec:
  meta:
    name:        nexus-tablet
    version:     0.1.0-spec
    status:      SPEC ONLY — no code. Written 2026-07-24 per §8.5 ("do not
                 build anything without creating a spec file first") and §3.3
                 (map before build).
    uuid:        nexus-tablet-v0-0000-2026-0724-001
    author:      James Brooks (concept) / execution layer (mapping)
    purpose: >
      A decoupled diagnostic tablet for NEXUS. Not a dashboard that reports
      numbers — an instrument where the system's movement is directly visible.

  # ── THE THESIS ──
  thesis: >
    "All movement needs to be seen." (James, 2026-07-24)

    Every interaction space — every href, button, panel, tab, request, handshake,
    packet — carries live sigma scoring and visibly changes state. Nothing
    happens invisibly.

    This is the direct inverse of the disease this entire session diagnosed:
    subsystems built and never wired, events emitted with no consumer, two
    registries silently disagreeing, a drift report reading a stale mirror for
    months, an idle despawn misread as a crash. Every one of those bugs shared
    a single property — THE SYSTEM COULD NOT SEE ITSELF DOING IT. The tablet is
    the structural answer: make invisible state impossible.

  # ── WHAT ALREADY EXISTS (verified this session, not assumed) ──
  existing_data_sources:
    topology_nodes:
      source: "lib/component-registry (217 components, 8 namespaces), lib/hook-registry (230 hooks, projected from 226 components)"
      status: LIVE
    topology_edges:
      source: "lib/consumer-registry — producer→event edges derived from event_log + live bus"
      status: LIVE, 27 edges / 15 sources / 23 event types observed
      gap: "SINGLE-PROCESS. Subscriber counts reflect cortex's bus only. Cross-process consumers invisible. THIS BLOCKS THE BRAIN VIEW — see build order."
    packets:
      source: "cortex/core/raid/envelope.js — every request carries an immutable `trail` stamping {system, status, ts} at each hop"
      status: LIVE
      note: "This IS the animatable packet. It already exists and already records its own journey."
    color_coding_tension:
      source: "meta/cfr/field.js — four live numbers (coherence/friction/resonance/entropy) + regime (stable/resonant/turbulent/chaotic)"
      status: LIVE — visible in boot logs (e.g. coherence 1, friction 0.0583, regime resonant)
    sigma_scoring:
      source: "orchestrator/lib/sigma-writer.js — per-event scoring, WARN 0.50 / HALT 0.70, writes sigma_records"
      status: LIVE
    friction_ledger:
      source: "cortex/self-heal/escalation.js — fault_taxonomy with friction per fault class, bands NOMINAL→FAILURE_MODE"
      status: LIVE
    event_ledgers:
      source: "data/ledger/<system>/<hook>/<date>.jsonl — per-system, per-hook, per-day"
      status: LIVE, 14 systems
    snapshots_rewind:
      source: "the ledger tree above is already an append-only time series; cortex-v2 CLI has a rewind concept"
      status: PARTIAL — data exists, no snapshot/restore surface
    containers:
      source: "cos/ compartments; sovereign per-compartment memory (JaaDB class, made real 2026-07-20)"
      status: PARTIAL — compartments exist, largely unwired to boot

  # ── HONEST BLOCKERS (§1.1 — do not build over these) ──
  blockers:
    - id: B1
      what: "Consumer graph is single-process"
      why_it_blocks: "The brain view's value IS cross-system flow. Rendering it now shows a brain with most synapses missing — worse than not rendering it, because it would look authoritative while being wrong."
      fix: "Each process reports its own subscriptions to a shared surface. Own phase, before the topology view."
    - id: B2
      what: "ESM/CJS fault line"
      why_it_blocks: "RFR2 and the entire meta/ intelligence substrate (45 ESM files) cannot be imported by the CJS core. You cannot animate what you cannot reach — and RFR2/CFR analysis is exactly what the color-coding depends on."
      fix: "Resolve interop (route through lib/rfr2-bridge.js, or convert). Named in nexus-mind-map.md Tier 0."
    - id: B3
      what: "UI cannot be verified from the build environment"
      why_it_blocks: "No renderer available in the sandbox; Clear Glass and the live stack are on James's machine. Every visual claim must be verified by James, not asserted by the builder."
      mitigation: "Build in small increments James can see. Never claim a view 'works' — claim it 'is built, unverified'."

  # ── THE SURFACES ──
  surfaces:
    brain_view:
      description: "Live animated topology. Nodes = components/systems. Edges = real consumer-graph relationships. Packets (RAID envelopes) visibly traverse edges in real time."
      colour: "Edge/node colour from CFR + sigma: friction rising = warming, bottleneck = saturation, halt-risk (sigma>=0.70) = alarm state. Regime (stable/resonant/turbulent/chaotic) sets the overall field."
      requires: [B1, B2]
    system_containers:
      description: "One container per system, thumbnail snapshot of its current state, play/pause, per-system event stream, controls (spawn/despawn/restart via autopilot's existing on-demand path)."
      note: "autopilot already exposes requestSpawn + status; the despawn/respawn lifecycle is real and now correctly distinguishes intentional stops from crashes (fixed 2026-07-24)."
    ledger_explorer:
      description: "The full data/ledger tree, browsable: system → hook → day → events. Explicit, nothing aggregated away."
      requires: []   # data exists today
    interaction_instrumentation:
      description: >
        THE THESIS, applied to the tablet's own UI. Every interaction space —
        href, button, panel, tab — is itself sigma-scored and visibly changes
        state on activity. The instrument obeys its own rule: the tablet's own
        movement is also seen.
      note: "This is what separates the tablet from a dashboard. A dashboard shows the system; the tablet is subject to the same visibility law it enforces."
    copilot_surface:
      description: "Floating menu + embedded Co-pilot. Observation AND control from one place. Co-pilot reaches its cognitive tools (intuition, mastermind, adversarial, memory-recall) through RAID."
      requires: "cognitive tools registered as RAID capabilities — nexus-mind-map.md Tier 3, not yet built"
    snapshot_rewind:
      description: "Scrub the ledger time series. Play/pause/rewind system state. Thumbnails per snapshot."
      requires: "snapshot/restore surface over the existing append-only ledgers"

  # ── DECOUPLING ──
  decoupling:
    principle: "The tablet is a CONSUMER of contracts, never an owner of them (§5.12 — the UI is disposable)."
    means: >
      It reads through existing HTTP/SSE surfaces (orchestrator :9000, cortex
      :3748 /api/consumers, guardian :7820, loom :3752) and holds no
      authoritative state of its own. Killing the tablet must have zero effect
      on the running system. If the tablet ever becomes load-bearing, that is a
      §10.3 violation and a bug.
    exe: "Packaged standalone (Electron, as Clear Glass already is) so it runs beside NEXUS rather than inside it."

  # ── BUILD ORDER (§3.1 bottom-up, smallest first) ──
  phases:
    T0_cross_process_consumers:
      why_first: "B1. Everything visual depends on a true edge set. Without it the brain view lies."
      gate: "consumer graph shows edges originating in ≥3 distinct processes, verified against a real boot."
    T1_ledger_explorer:
      why: "Zero blockers — the data exists today. Smallest real surface, immediately useful, proves the decoupled read path."
      gate: "browse system→hook→day→events from the live tree with no writes to NEXUS."
    T2_system_containers:
      why: "Builds on autopilot's existing status + on-demand lifecycle."
      gate: "per-system state, live event stream, spawn/despawn control that round-trips through autopilot."
    T3_brain_view:
      requires: [T0, B2]
      gate: "packets (real RAID envelope trails) animate along real consumer-graph edges, coloured by real CFR/sigma."
    T4_interaction_instrumentation:
      gate: "the tablet's own hrefs/buttons carry sigma scores and change state visibly — the thesis applied to itself."
    T5_copilot_surface:
      requires: "cognitive tools as RAID capabilities (mind-map Tier 3)"
    T6_snapshot_rewind:
      gate: "scrub to a past state and see the topology as it was."

  # ── WHAT WOULD MAKE THIS FAIL ──
  failure_modes:
    - "Building the brain view before cross-process consumers — an authoritative-looking picture that is mostly wrong (worse than nothing, §1.2)."
    - "The tablet acquiring its own state and becoming load-bearing (§10.3 competing truth)."
    - "Animating declared relationships instead of observed ones — the consumer registry derives from behaviour precisely so the picture cannot drift from reality (§13.4)."
    - "Claiming a view works without James seeing it render (B3)."
