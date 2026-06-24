spec:
  meta:
    name:        raid-integration
    version:     0.1.0
    uuid:        nexus-raid-integration-v1-0000-2026-0624-jamesbrooks-001
    phase:       UNASSIGNED   # not inventing a number — fabricating one is the
                               # exact failure this codebase already caught twice
                               # (Phase 36; "Phase 25" before compartment-engine.js existed)
    status:      draft
    author:      James Brooks (Erosmancer)
    foundation:  nexus-system-foundation@1.0.0
    depends_on:
      - cortex/core/raid/index.js@current
      - lib/alk/index.js@current             # Associative Lattice Kernel
      - lib/replay-engine.js@current
      - lib/reflection.js@current
      - lib/compartment-engine.js@current
    supersedes:  none — no prior spec wires these together
    unlocks:
      - rewind capability for RAID routing decisions (currently zero)
      - learned-pattern dispatch, if the Mistral fork below is resolved
      - closed reflection→RAID loop, if the write-back decision below is confirmed

  purpose: >
    RAID decides which provider handles a call. That decision currently
    happens in total isolation: no record of why, no way to rewind it, no
    live reasoning behind it beyond regex + a weights table, and reflection
    explicitly does not feed back into it. This spec maps every point where
    RAID's real pipeline needs to connect to a system that already exists —
    ALK, replay-engine, reflection, compartment-engine, Mistral — each one
    verified against actual source in nexus-v0_9_8.zip, not assumed from any
    roadmap, changelog, or prior spec. Two prior documents in this codebase
    already turned out to claim integration work that was never built
    (the roadmap's "Phase 36"; "Phase 25 — RAID Compartment Engine" before
    compartment-engine.js existed). Nothing below repeats that pattern —
    every line cites the file and line it was checked against.

  core_principle: >
    A wire only appears in this document if it was traced to its real call
    site. "Should probably be wired" does not appear anywhere below —
    every entry is either "confirmed absent, here is exactly where it goes"
    or "blocked, here is exactly what's missing first."

  # ─────────────────────────────────────────────────────────────────────────────
  # SECTION 1 — Current pipeline, verified against cortex/core/raid/index.js
  # ─────────────────────────────────────────────────────────────────────────────

  current_pipeline:
    live_call_path: >
      call
        → _cluster(text)                          [line 186 — regex only, no learning]
        → _decide(call, healthSnap, weights)       [line 238 — pure, deterministic by
                                                      declared invariant, see axiom §1.1]
        → intelligence-bridge.queryBefore()         [advisory nudge, never override]
        → _dispatch(call, decision) → NCP → outcome
        → _updateW(cluster, agent, ok, ms)          [line 148 → writes raid-weights.json]

    separate_async_path: >
      _brainTick() — not in the call path above. Batches _failures[], calls
      Ollama directly (model defaults to 'mistral' — line 283) via
      POST 127.0.0.1:11434/api/generate, parses a JSON suggestion list,
      adjusts _weights, persists to raid-weights.json. This is the ONLY
      existing place RAID talks to an LLM. It reasons about failure batches,
      not about which tool to pick for a given call.

  # ─────────────────────────────────────────────────────────────────────────────
  # SECTION 2 — Integration points, one per piece
  # ─────────────────────────────────────────────────────────────────────────────

  integration_points:

    alk_lattice:
      file:           lib/alk/index.js
      current_state: >
        BUILT 2026-06-24. cortex/core/raid/index.js now exports a public
        decide(prompt, opts) wrapping the pure _decide() — alk.record()
        called inside it on every decision. Verified with a real smoke test
        against the actual lib/alk module (not mocked): two calls to
        decide() produced two real actor:'raid' records, queryable back out
        via alk.query({actor:'raid'}). Production writes with actor:'raid'
        exist now, not just in tests/modules/alk.test.js.
      plug_in_point: >
        Inside the new decide() wrapper, not inside _decide() itself —
        _decide() stays pure (§1.1), side effects live in the wrapper.
      change_required: DONE — see cortex/core/raid/index.js decide()
      conflicts:      none — confirmed, healer.test.js (20/20) and
                       raid-approve-tool.test.js (9/9) still pass unchanged
      status:         BUILT, TESTED — not yet adopted by the 5 external
                       call sites that still call _decide() directly
                       (cortex/gap-loop.js, cortex/foundation/admin-server.js,
                       nexus-heal-loop.js, lib/request-handler.js, and
                       this file's own internal async wrapper) — those get
                       no ALK/replay coverage until migrated to decide()

    replay_engine:
      file:           lib/replay-engine.js
      current_state: >
        BUILT 2026-06-24. Same decide() wrapper calls replay.snapshot()
        before the decision and replay.logDecision() after. Verified with
        a real smoke test: two real snapshots written and queryable via
        replay.listSnapshots(), not mocked.
      plug_in_point: >
        Inside decide(), bracketing the pure _decide() call.
      change_required: DONE — see cortex/core/raid/index.js decide()
      conflicts:      none, same verification as alk_lattice above
      status:         BUILT, TESTED — same external-call-site caveat as
                       alk_lattice; also fixes a separate confirmed bug as
                       a side effect: guardian/server.js was calling
                       _raid.decide() against an export that only had
                       _decide (underscore), throwing TypeError, silently
                       caught, hardcoding 'chatgpt' regardless of RAID's
                       actual routing decision. decide() now actually exists.

    reflection_writeback:
      file:           lib/reflection.js
      current_state: >
        Header comment, verbatim: "RAID FEEDBACK (decision: no RAID-side
        change)." Reflection aggregates RAID's dispatch outcomes into its
        own read-only summary event. It explicitly never mutates RAID's
        weights.
      plug_in_point: >
        _updateW() (or a new function) would need to accept reflection's
        aggregated summary as an input source, not just outcome events.
      change_required: TBD — depends on decision 4.2 below
      conflicts: >
        This is not a missing wire. It is a documented decision that would
        need to be deliberately reversed. Building this without confirmation
        means overturning something already decided and written down.
      status:         BLOCKED — awaiting decision 4.2

    compartment_engine:
      file:           lib/compartment-engine.js
      current_state: >
        Named "Phase 25 — RAID Compartment Engine." Own header states the
        phase was previously marked complete in a phase-map with zero code
        behind it: "no compartment, no constraint frame, no adversary suite,
        no lattice anywhere in the repo" before this file existed. What's
        real now is explicitly sub-step 2 of the Phase 25 build only —
        lifecycle skeleton (spawn → execute → PASS/FAIL → rewind/delete).
        Sub-step 4 (adversary suite) and sub-step 5 (crystal/lattice
        updates) are separate files that do not exist.
      plug_in_point: >
        Wraps _dispatch(), not _decide() — a compartment isolates the
        execution of a decision, not the decision itself.
      change_required: skeleton hookup only possible at this time
      conflicts: >
        Full wiring is blocked on sub-steps 4 and 5 regardless of any
        decision made in this document.
      status:         PARTIAL — skeleton hookup only; full wiring out of reach

    mistral_reasoning:
      file:           N/A — does not exist in any form yet
      current_state: >
        The only existing RAID↔LLM contact is _brainTick(): async, batch,
        failure-only, weight-adjusting. No live per-call reasoning exists
        anywhere in cortex/core/raid/index.js.
      forks_not_decided:
        fork_a_live_hot_path: >
          New step between _cluster() and _decide(). Breaks _decide()'s
          declared invariant — line 11: "§1.1 DETERMINISTIC — f(call,
          healthSnapshot, weights) → same decision always." Every routing
          decision now waits on an LLM round-trip.
        fork_b_extend_braintick: >
          Stays async/batch. Determinism intact — Mistral tunes the weights
          table _decide() reads from, rather than picking per-call. This is
          "Mistral tunes the table," not "Mistral picks the tool for this
          call." Different claim than what live reasoning would mean.
      status:         BLOCKED — awaiting decision 4.1

  # ─────────────────────────────────────────────────────────────────────────────
  # SECTION 3 — Build order
  # ─────────────────────────────────────────────────────────────────────────────

  build_order:
    1: alk_lattice logging inside _decide()              # no conflicts
    2: replay_engine snapshot around the _decide() call  # no conflicts
    3: resolve decision 4.1 (Mistral fork)                # gates all further Mistral work
    4: resolve decision 4.2 (reflection write-back)        # gates _updateW()'s shape
    5: compartment_engine skeleton hookup on _dispatch()   # partial regardless of 3/4
    6: compartment_engine full wiring                      # blocked — Phase 25 sub-steps
                                                            # 4/5 don't exist; out of scope

  # ─────────────────────────────────────────────────────────────────────────────
  # SECTION 4 — Open decisions (blocking — not assumed, not defaulted)
  # ─────────────────────────────────────────────────────────────────────────────

  open_decisions:
    4.1_mistral_fork: >
      Fork A (live, hot path, breaks _decide()'s determinism) or
      Fork B (async, extends _brainTick, determinism intact)?
    4.2_reflection_writeback: >
      Confirmed wanted, knowing it reverses lib/reflection.js's own
      documented "no RAID-side change" decision?

  axioms_enforced:
    §1.1: _decide()'s determinism (raid/index.js line 11) is not silently
          broken — any live-reasoning fork must say so explicitly, hence
          Section 4 exists instead of a default pick.
    §2.1: disk before behavior — ALK and replay-engine writes happen before
          the decision is acted on, not after.
    §6.1: stale docs are the bug, not the code (established this session) —
          every entry above was checked against real source, not against a
          prior spec, changelog, or roadmap.
