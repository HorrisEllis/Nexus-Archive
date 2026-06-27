spec:
  meta:
    name:        copilot-migration-and-new-capabilities
    version:     1.0.0
    foundation:  nexus-system-foundation@1.0.0
    status:      proposed
    uuid:        nexus-copilot-migration-v1-0000-2026-0627-jamesbrooks-001

  # ── Migration findings ──────────────────────────────────────────────────────
  # The naming tell: "co-pilot" (hyphenated) = pre-sovereign-split legacy.
  # "copilot" (no hyphen) = the real system, :3750. Every fix below moves
  # a hyphenated reference onto the no-hyphen target.

  migration_items:
    - id: MIG-01
      file: cli/co-pilot.js
      problem: >
        _talkToCopilot() POSTs to /api/guardian/copilot/prompt. guardian/
        server.js's own comments confirm that route was removed — "sovereign
        copilot service at :3750 handles these." The CLI's main way of
        talking to copilot has been pointed at a dead route since the split.
      fix: 'POST to copilot:3750/api/prompt directly, matching copilot/server.js line 357.'

    - id: MIG-02
      file: lib/copilot-context.js
      problem: >
        "Co-pilot Complete System Awareness," 7 sensing layers — orphaned.
        grep across the entire codebase: nothing requires it. Pre-split
        leftover, never deleted (§A-4 compliant, just never reconciled).
      fix: >
        Either confirm copilot/ has its own equivalent context-assembly
        (the phase map names copilot/analysis.js for this — not present in
        this code export, needs a live check) and delete this file, or — if
        no equivalent exists yet — this IS copilot's missing context layer
        and should move into copilot/ rather than stay orphaned in lib/.

    - id: MIG-03
      file: Nexus-Chat (uploaded, standalone prototype)
      problem: >
        runAI() talks to Ollama directly. Bypasses copilot entirely, despite
        cli/co-pilot.js's own stated design intent — "one real agent all
        [surfaces] are clients of."
      fix: 'Route runAI() through copilot:3750/api/prompt instead of Ollama directly, same change as MIG-01, different file.'

    - id: MIG-04
      file: 'guardian/server.js (reference only — already correct)'
      note: >
        Already migrated correctly. copilot.agent disabled, /copilot/* routes
        removed with comments pointing at :3750. This is what MIG-01 and
        MIG-03 should end up looking like.

  # ── New capability 1: copilot creates CLI commands ──────────────────────────
  # Mostly already wired — this isn't a new pipeline, it's exposing an
  # existing one as something copilot can trigger conversationally.

  capability_cli_authoring:
    existing_pipeline: >
      module-builder.js (map→spec→QC→build) already produces a component
      descriptor. descriptor-projector.js already derives a .cli projection
      from any descriptor automatically — six projections per descriptor,
      .cli is one of them, zero-LLM, deterministic (§CC-002). grammar-engine
      already picks up new components live via component.registered SSE.
    the_actual_gap: >
      None of this is exposed as something you ask copilot for directly —
      "add a CLI command that does X" has to go through the general
      module-build flow today, framed as building a whole module.
    fix: >
      Add a focused intent in module-builder.map() — when the mapped intent
      is specifically "new CLI command" (not a full module), short-circuit
      to declaring just the component + grammar array, skip the full L0-L5
      spec generation. Smaller ask, smaller pipeline.

  # ── New capability 2: copilot changes settings ──────────────────────────────
  # This one's a real gap, not an exposure problem — Phase 114 was always
  # ⬛ PENDING, and a direct grep for "settings"/"/api/settings" across
  # lib/ and orchestrator.js turned up nothing. Nothing built yet.

  capability_settings_change:
    status: 'genuinely unbuilt — Phase 114 on the original roadmap'
    spec: >
      Each system implements POST /api/settings, accepting runtime config
      from copilot (or the control panel UI, same endpoint either way —
      §AXIOM CLI=UI=API holds here too). Per system:
        guardian:  ncp_log_rate_ms, seam thresholds
        cortex:    sigma thresholds, gap batch size
        copilot:   lifeline confidence threshold, stream chunk size
        ollama:    max_concurrent, timeout
    constitutional_check: >
      Settings changes should run through constitutional-ai.check() before
      applying — same axiom-check path every other action-with-consequence
      already goes through. A setting change is a REVERSIBILITY-class action
      (axiom AX in constitutional-ai.js), not exempt just because it's config.
    copilot_side: >
      A new intent classification ("change setting") routes to the target
      system's /api/settings instead of module-builder — settings changes
      aren't a build, they shouldn't go through the build pipeline at all.
