spec:
  meta:
    name:        idearium
    version:     4.1.0   # §5.4 drift fix 2026-09-13 — was 3.2.0, out of sync with
                         # idearium/package.json's 4.1.0 since at least the
                         # 2026-09-03 "idearium 3.3.0" session. package.json is
                         # the one actually bumped per-release; this field had
                         # simply stopped being updated alongside it.
    foundation:  nexus-system-foundation@1.0.0
    port:        4800
    uuid:        nexus-idearium-v3-0000-2026-0615-jamesbrooks-001
    purpose: >
      The idea manager and project repository. Every build starts here
      as a seed idea and progresses through phases.
      The Spatial lattice builds a resonance-weighted graph connecting
      ideas to specs to gaps. High-weight edges = strong association.

  core:
    schemas:
      - Idea:    "{ uuid, text, phase, tags, specRef, gapScore, weight, ts }"
      - Project: "{ uuid, name, phase, specFile, artifacts[], gaps[], ts }"
    phases: [seed, expanding, tensioned, specced, building, complete]
    axioms: [AX-001, AX-002, AX-003, AX-007, AX-008]
    constants:
      LATTICE_THRESHOLD:  0.65   # minimum edge weight to cluster
      PHASE_TRANSITIONS:  "seed→expanding→tensioned→specced→building→complete"

  # ── AX-008 (foundation addendum v1.1.0) ────────────────────────────────────
  # ✅ CLOSED 2026-06-29 — idearium/index.js's _broadcast() pushes every
  # os.emit() to all SSE clients on GET /sse. copilot/server.js had an
  # IDR_URL constant declared since at least v3 but never connected to it —
  # scoped, never wired. Added _connectIdeariumStream() (same pattern as
  # _connectCortexStream/_connectGuardianStream), wired into copilot's boot
  # sequence, and added hooks/idearium.hooks.js's 4th entry
  # (idearium-to-copilot, seam:idearium-copilot-bridge) so the wire is
  # registry-visible, not just code. idea/project/lattice activity now
  # reaches copilot live.

  events:
    emits:
      - "idearium.booted"
      - "idearium.idea.created"
      - "idearium.idea.phase_changed"
      - "idearium.project.created"
      - "idearium.project.spec_dropped"
      - "idearium.project.build_started"
      - "idearium.lattice.connected"
      - "idearium.lattice.crystallised"
    handles:
      - "guardian.job.complete → artifact.store"
      - "cortex.gap.found     → project.gap_attach"
      - "spec.compile.complete → project.build_start"

  modules:
    - id: idea-store
      description: "CRUD for ideas. Phase management. JAA-backed."

    - id: project-repo
      description: >
        Project manager. Accepts dropped zips via file-push router.
        Watches for .spec files and queues them for build.
        Links projects to ideas, specs, artifacts, gaps.

    - id: lattice
      description: >
        Spatial engine integration. Builds resonance-weighted graph.
        Nodes: ideas, specs, gaps, artifacts.
        Edges: reinforced on every association (view, link, co-occurrence).
        Connected-components clustering above weight threshold.
        High-weight edges crystallise into long-term cortex memory.

    - id: queue-listener
      description: >
        Watches for .spec files. On detect: validates, queues,
        dispatches to spec-compiler via Guardian.

  command_index:
    status: DONE       # verified 2026-09-03 -- GET /api/contract/live, 72 real endpoints, 72=72 against fresh grep
    spec: "docs/command-index-per-system.spec"
    note: "idearium's existing routes array (72 entries) maps directly -- cheapest phase, exposure not extraction."

  routes:
    external:
      - "GET  /health"
      - "GET  /contract"
      - "GET  /api/projects"
      - "POST /api/projects"
      - "GET  /api/projects/:id"
      - "POST /api/projects/:id/spec"
      - "GET  /api/ideas"
      - "POST /api/ideas"
      - "PUT  /api/ideas/:id/phase"
      - "GET  /api/lattice"
      - "POST /api/lattice/connect"

  handshake:
    components:
      - id: "idearium.projects.list"
        grammar: ["idearium projects", "projects", "proj"]
        route: { method: GET, path: "/api/idearium/projects" }
        description: "List all projects by phase"

      - id: "idearium.ideas.list"
        grammar: ["idearium ideas", "ideas"]
        route: { method: GET, path: "/api/idearium/ideas" }
        description: "List all ideas with phase and weight"

      - id: "idearium.ideas.create"
        grammar: ["idearium new idea", "new idea", "idea"]
        route: { method: POST, path: "/api/idearium/ideas" }
        description: "Create a new seed idea"
        params: [{ name: text, type: string, required: true }]

      - id: "idearium.lattice.view"
        grammar: ["idearium lattice", "lattice"]
        route: { method: GET, path: "/api/idearium/lattice" }
        description: "View the current idea-spec-gap lattice"

  ui:
    type: "panel in nexus-shell"
    hotswap: true
    panels:
      - "PROJECTS — phase board (seed→complete), spec drop zone"
      - "IDEAS — idea list with weight and lattice connections"
      - "LATTICE — resonance graph visualisation"

  built_2026_09_19_compiler_t0_and_bottom_up_build:
    what: >-
      idearium/spec-engine/compiler-t0.js — docs/spec-compiler.spec's T0 tier (directory tree + placeholder
      emission, zero LLM tokens), reusing addChunk()'s existing real chunk-creation path rather than a new
      one. addChunk() gained real dependsOn support (validated against the manifest's real sectionIds,
      fails loudly on a bad reference). New _topoOrder() — real Kahn's-algorithm bottom-up sort over
      build_order's own per-file dependsOn edges; throws on a genuine cycle rather than emitting an
      unbuildable graph in file-list order. isPrimitive derived directly from the real dependency graph
      (no dependencies of its own, but something else depends on it), not a separate, driftable flag.
    two_real_bugs_fixed: >-
      ingestFilesAsSpec() used to mark an empty/uncaptured file COMPLETE with a fabricated markdown-comment
      placeholder instead of failing — now calls failChunk() instead. RepoLayer.materialize() (repo/
      index.js) returned ok:true even when every chunk failed and zero real files were written — now
      ok:false when a non-empty manifest produces zero real output with nothing legitimately deferred to a
      real source file.
    also: >-
      lib/extract-code.js (real fenced-code-block extraction from an agent's raw chat reply, fails loudly
      on zero/unclosed/empty/ambiguous-multiple blocks) wired opt-in into warp-build-dispatch.js's
      generate() via chunk.realPath's extension (record.expectCode) — none of the 10 real blocks.yaml
      section types (all realPath:null) are affected; only a real target-file chunk with a real code
      extension opts in.
    proven: >-
      parseBuildOrder's dependency validation, _topoOrder against a chain/diamond/real-cycle (cycle fails
      loudly naming the exact stuck files), extractCode against 10 real cases including every failure path.
    honest_gap: >-
      No real caller in this system's own dispatch orchestration (index.js/api/index.js) yet builds a
      build_order chunk or calls emitStructure() as part of a real spec's own lifecycle — proven standalone,
      not yet wired end-to-end without a human calling it directly.
