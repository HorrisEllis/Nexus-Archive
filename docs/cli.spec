spec:
  meta:
    name:        cli
    version:     1.1.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-cli-v1-0000-2026-0615-jamesbrooks-001
    purpose: >
      Command-line tools for NEXUS operation, diagnosis, and boot.
      Not a service. Scripts run on demand.
      Phase 36 unifies nexus-repl into the grammar-engine-driven model
      cli/nexus-cli.js already uses.

  stale_status_fixed: >
    v1.0 said grammar-engine.js was "not yet built" / "PENDING — Phase 3".
    It's shipped — see docs/grammar-engine.spec, 16/16 tests passing.
    This file just hadn't been updated when that landed. Cross-spec drift
    isn't something spec-drift.js currently checks (it only compares
    spec-vs-code, not spec-vs-spec) — worth a future gap type, not fixed
    here, just flagged.

  modules:
    - id: diagnose
      path: "cli/diagnose.js"
      lines: 1450
      description: >
        Runs all 12 diagnostic engines against a system's ledger.
        Called automatically by boot-systems when a service fails to come up.
        Also callable manually: node cli/diagnose.js <systemId>
        Output: health score, alerts, causal chain, circuit state,
        entropy rate, fault tree, homeostasis score.

    - id: boot-systems
      path: "cli/boot-systems.js"
      description: >
        Starts all NEXUS subsystems in sequence.
        Called by orchestrator after its own boot sequence completes.
        Each system: spawn → wait for health → verify contract.
        On failure: run diagnose → log to event ledger → continue.
        Order: bridge → cortex → guardian → idearium → architect → emerge → diagnostic.

    - id: nexus-cli
      path: "cli/nexus-cli.js"
      status: built
      description: >
        Already grammar-engine-driven. Resolves componentId via
        ge.resolve(), dispatches to component.route, tracks history. The
        model Phase 36 brings nexus-repl up to.

    - id: nexus-repl
      path: "cli/nexus-repl.js"
      lines: 858
      status: phase_36_target
      description: >
        Interactive REPL — forge/heal/snapshot/intents/tension/selfheal/
        chatlog/dispatch/gaps/bus/events. Currently does NOT use
        grammar-engine at all, unlike nexus-cli.js — confirmed directly
        in the live file, not assumed. This is the real Phase 36 gap:
        re-register nexus-repl's existing commands into component-registry
        so they resolve through grammar-engine, not a rewrite of the
        commands themselves.
      phase_36:
        flow: "grammarEngine.registerCommand(descriptor) → incremental blueprint recompile → new cli-map.json section → grammar tree reads updated map → command available"
        constraint: "Direct registerCommand() calls bypassing the descriptor→blueprint path are §6.1 violations."
        why_it_matters_beyond_itself: >
          Phase 40.5 (Descriptor-Driven CLI) is blocked on this — its
          automatic CLI projection has nothing to project for nexus-repl's
          commands until they're grammar-resolved. Confirmed by tracing
          orchestrator.js's cliDispatch (the actual Guardian-dispatch body
          builder): manual REPL command, zero grammar-engine resolution,
          zero componentId in scope. Phase 36 is what makes that not true
          anymore.
        deps: "grammar-engine ✓ · component-registry ✓ · nexus-repl ✓ · jaa ✓ — fully unblocked, not waiting on Phase 40"

  notes:
    - "All existing CLI tools remain functional during Phase 36 build"
    - "diagnose.js is the manual entry point to the 12-engine suite"
