spec:
  meta:
    name:        autopilot
    version:     1.0.0
    status:      SPEC written 2026-07-25 to close GAP_1 (docs/nexus-tablet.spec). The
                 code predates the spec; this DESCRIBES what runs, it does not
                 propose. §8.4 — read the real surface, spec what exists.
    uuid:        nexus-autopilot-v1-0000-2026-0725-001
    foundation:  nexus-system-foundation@1.0.0
    note: >
      autopilot is NOT in lib/version.js services — it is the supervisor that
      starts the services, not one of them. Its version is declared here.

  purpose: >
    The supervisor and single entry point for NEXUS. Boots every kernel in
    phases, keeps them alive with backoff + circuit breaker, and is the ONE
    endpoint the tablet talks to (the connection broker). "Start point doesn't
    matter as long as it goes through autopilot."

  responsibilities:
    supervision:
      - "Spawns the kernel manifest in boot phases; a kernel that can't start yet doesn't trip the whole system."
      - "Restarts a dead kernel with exponential backoff (§1.2 — every crash/restart/trip logged, nothing silent)."
      - "Circuit breaker: a kernel that crashes repeatedly (6 in the window) is stopped, NOT retried forever — 'needs a human or a forge patch, not another retry.' Other kernels keep running."
      - "On circuit-open, writes a REAL gap (kernel_circuit_open, severity critical) into cortex — the failure becomes tracked data, not just a log line."
      - "Distinguishes INTENTIONAL stops (idle despawn 'dormant', global 'stopping') from crashes — an idle despawn must never be counted as a crash (fixed 2026-07-24, the clear-glass restart-storm root cause)."
    on_demand_lifecycle:
      - "onDemand kernels (clear-glass) stay dormant until requested, despawn after idle, respawn on request."
      - "requestSpawn(kernel) — the real on-demand trigger; touchActivity(kernel) — resets the idle timer."
    broker_and_observation:
      - "Status server (default :7799, AUTOPILOT_STATUS_PORT, 0 disables)."
      - "GET /status — every kernel's live state + boot result. A HALTED boot is visible here to any observer, not just the terminal (§1.2)."
      - "POST /spawn/:kernel — on-demand spawn trigger."
      - "POST /touch/:kernel — activity touch."
      - "The tablet's T1 ledger explorer read-surface lives here BY DESIGN — the tablet's connection law ('one endpoint, autopilot resolves the rest') and observation law (DISK-BACKED, still answers when the system whose ledger you're reading is wedged)."

  kernel_manifest:
    always: [orchestrator, bridge, cortex, guardian, idearium, architect, diagnostic, eravos]
    optional: [ollama-bridge, copilot, emerge, loom]
    on_demand: [clear-glass]
    note: "optional:true means a missing/failing start does not trip the circuit breaker (e.g. missing Electron for clear-glass, missing browser tabs for ollama-bridge)."

  the_tablet_depends_on_this:
    why_the_spec_matters: >
      docs/nexus-tablet.spec makes autopilot the connection broker for the whole
      tablet. GAP_1 flagged that the system the tablet most depends on had no
      spec — building the tablet on an unspecced broker inverts §8.5. This spec
      closes that: the broker's contract (/status, /spawn, /touch, the T1
      surface) is now declared, so the tablet depends on a contract, not on
      reading autopilot's source.

  axioms_enforced:
    §1.2: every crash, restart, circuit-trip, and halted boot is observable (logged + /status)
    §0.3: a circuit-open writes a gap — the failure is not lost, it becomes tracked data
    §5.12: the tablet is a consumer of this contract; killing the tablet does not affect supervision
