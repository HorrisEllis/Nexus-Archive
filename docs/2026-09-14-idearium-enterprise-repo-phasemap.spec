envelope: 1
uuid: nexus-phasemap-idearium-enterprise-repo-2026-09-14
type: spec
id: idearium-enterprise-repo-phasemap
context: >-
  docs/2026-09-14-idearium-enterprise-repo-phasemap.spec — real status + phased plan for Idearium
  as the enterprise-grade repo system, written at the end of a long session (weekly tokens low) so
  the next session can pick up exactly here instead of re-mapping from scratch.
payload:
  decided:
    esm_conversion: >-
      NOT doing this. idearium/ is real, pre-existing "type":"module" across the whole subsystem.
      Converting to CommonJS would touch every file under idearium/ for near-zero functional gain.
      lib/repo-manifest.js (CommonJS, shared/sovereign) is reached from idearium/repo/index.js (ESM)
      via createRequire(import.meta.url) — the standard, permanent Node interop, not a stopgap.
      Leave as-is.

  done_this_session:
    - id: MCO16-16f
      does: "ClearGlass as a real RAID PROCESSING destination (executionSurface:'browser', domSteps,
        the NCP fan-out bug fix, copilot tool parity, loom capability registration)."
      status: DONE, tested.
    - id: MCO18
      does: "Real CLI mode in the floating co-pilot panel (/help, /tools, /raid, /ncp, /responses)."
      status: DONE, tested.
    - id: MCO19
      does: "Real .tool/.command node generation hooked into copilot's and guardian's own boot."
      status: DONE, tested.
    - id: MCO20
      does: "lib/work-surface.js — real operating table (line count, chunk plan) for a massive
        file, closing project-compartment.js's silent-truncation gap. Two real copilot tools
        (create_work_surface, get_work_surface_chunk)."
      status: DONE, tested (18 tests, including full-file reassembly proof).
    - id: MCO21
      does: "compartmentType field + schema on compartment-engine.js ('standard'/'worksurface',
        auto-detected from a real workSurface-flagged projectSeed). THE highest-leverage fix:
        guardian's autonomous executor was single-shot (one prompt, one response) — now runs a
        real multi-turn tool-calling loop (lib/agent-tools.runToolLoop + copilot/tool-runtime.js's
        makeNcpCallModel, guardian's own askSync as the real dispatch — no new dispatch mechanism,
        respecting that file's own sovereignty contract). An agent can now actually call
        get_work_surface_chunk itself instead of the tool sitting unreachable."
      status: >-
        DONE, tested (proved live: a fake agent requests a real tool via the real fenced-
        block syntax, the executor actually runs it, the second turn sees the real result).
    - id: MCO22
      does: "lib/repo-manifest.js — the real 'COS node' James asked for: one .manifest node per
        idearium repo, append-only, recording EVERY compartment that has touched it
        (compartmentUuid, compartmentType, workSurfaces, status). Closes the real gap in
        idearium/repo/index.js's own pre-existing compartmentId field (§SBP1 2026-08-28), which
        only ever held ONE compartment, set once at ingest. Wired into RepoLayer.ingest()."
      status: >-
        DONE, tested (13 tests: 8 pure lib, 5 live end-to-end through real spec-engine
        ingest, run twice to prove real isolation/repeatability).

  next_real_phase:
    title: "Project Compartments hold each repo"
    what_james_said: >-
      "Project Compartments from idearium hold each repo." Real, concrete direction: instead of a
      repo record merely POINTING at one compartmentId (current state, even after MCO22's history
      log), a compartment should be the real CONTAINER a repo's active work happens inside —
      compartmentType:'worksurface' compartments become the real unit idearium's build/CI loop
      spawns and tracks PER REPO, not a side-reference.
    phase_1_map_before_build:
      - "Read compartment-engine.js's execute()/resolve() lifecycle again against RepoLayer's own
        real methods (ingest, materialize, checklist) — confirm exactly where a per-repo
        compartment should be spawned (at ingest? at each build/CI run?) before writing anything."
      - "Check whether idearium/spec-engine's own chunk-dispatch.js (dispatchChunkWithVerification)
        already has an implicit compartment-like concept that would collide with a new one —
        grepped its shape once this session, not deeply enough to build against yet."
      - "Decide: does EVERY repo get exactly one active compartment at a time (the current single-
        compartmentId field, upgraded to be authoritative rather than just a pointer), or can a
        repo have concurrent compartments (e.g. one worksurface build + one CI verification
        running at once)? This is a real product decision, not mine to assume."
    phase_2_backend:
      - "lib/repo-compartment.js (new, likely) — spawn a real compartmentType:'worksurface'
        compartment FOR a specific repoUuid, wired to lib/repo-manifest.js so every spawn is
        recorded (already real and tested from MCO22)."
      - "Real CI concept: a compartment that runs a repo's tests/build and PASSes or FAILs via
        compartment-engine's own real resolve() — this is the literal missing 'CI' piece; compartment-
        engine already has PASS/FAIL/REWOUND, idearium has never used it as a gate before merge/
        promotion."
    phase_3_cli:
      - "idearium CLI commands for: spawn-compartment-for-repo, ci-run <repoUuid>, ci-status
        <repoUuid> — same command-index-extract.js pattern already built for guardian/copilot this
        session (§MCO19), applied to idearium for the first time."
    phase_4_api_routes:
      - "Expose those CLI operations as real HTTP routes on idearium/api/index.js."
    phase_5_interaction_contract:
      - "Register the new routes in idearium's own registry-components.js (confirm whether one
        exists yet — not checked this session) so loom's capability-map can verify them, same
        discipline as every other system this session (§MCO16f)."
    phase_6_ui:
      - "Last, and only once 1-5 are real: UI reflects the now-real backend. Not started, not
        designed yet — deliberately last per James's own stated ordering."

  honest_gaps_not_started:
    - "No branch concept anywhere in idearium — a repo is currently single-line history (fork
      exists, branches within a repo do not)."
    - "No CI gate exists yet — MCO22's manifest records compartment history but nothing currently
      BLOCKS a promotion/merge on a compartment's PASS/FAIL. That's phase_2 above."
    - "idearium's own registry-components.js — not confirmed to exist. Check before phase_5."
    - "BrainOS / ClearGlass integration with any of this — not touched this session beyond what
      MCO16-19 already covered for ClearGlass specifically."
