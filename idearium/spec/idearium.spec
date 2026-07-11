spec:
  meta:
    name:        idearium
    version:     3.2.0
    foundation:  nexus-system-foundation@1.0.0
    port:        4800
    uuid:        nexus-idearium-v3-0000-2026-0615-jamesbrooks-001
    purpose: >
      The idea manager and project repository. Every build starts here
      as a seed idea and progresses through phases.
      The Spatial lattice builds a resonance-weighted graph connecting
      ideas to specs to gaps. High-weight edges = strong association.

  addendum:
    - version: 3.2.0
      date:    2026-07-11
      changes: >
        Idea↔spec-engine linkage, previously missing entirely: createSpec
        now accepts ideaUuid, stores it on the manifest (was read by
        _promoteSpecToRepo, never written by anything). speceng.create
        links idea.linkedSpec and advances idea.phase seed/expanding/
        tensioned → specced when given one. spec.promote advances the
        ORIGINATING idea (manifest.ideaUuid, not RepoLayer's own synthetic
        "Repo: X" tracking idea, a distinct bug caught mid-fix) to
        'complete' on a fully-built promotion or 'building' on a partial
        one — never regresses 'archived'. IdeaUpdateGate's allowed-fields
        list gained 'linkedSpec' to make the link-write possible at all.
        This is the actual fix for "can't change the phase" — the manual
        phase buttons always worked (verified via direct API test, 12ms
        response); the automatic seed→specced→building→complete
        transition the state machine implies had just never been wired.
        UI: createSpecForIdea() now opens the multi-template modal
        (ideaUuid pre-filled) instead of posting straight to the
        template-less legacy path; the modal actually sends ideaUuid now
        (captured on open, previously dropped before the POST). Spec
        Library's builder view branches on spec.chunks (spec-engine) vs
        legacy sections — spec-engine specs get a real chunk-status list
        and a "build repository (end-state)" button that loops
        speceng.build to completion and auto-promotes, instead of
        silently hitting legacy-only endpoints that didn't apply to them.
      verified: >
        Live end to end: idea created (phase seed) → linked spec created
        with ideaUuid → phase auto-advanced to specced, linkedSpec set →
        8/10 chunks built (2 failed — no live LLM agent in the test
        sandbox, expected) → emerge-mode promote correctly refused →
        manual-mode promote succeeded, 8/10 files real + 2 TODO → idea
        phase advanced to 'building' (correctly not 'complete', matching
        the partial build).
    - version: 3.1.0
      date:    2026-07-11
      changes: >
        Multi-template spec composition (spec-engine.createSpec now takes
        templateIds[], not just one templateId — seeded sections merge
        across every selected template, first-pick-wins on overlap).
        Six new architecture templates (architecture, schemas, checklists,
        axioms, compartments, plus the existing genesis) seed up to 8 of
        10 spec sections deterministically, zero agent dispatch.
        buildEngine selector (auto|warp|direct) on createSpec — 'warp'
        fails loud instead of silently downgrading when WARP's cache
        isn't loaded; 'direct' bypasses it on purpose.
        RepoLayer materializes real files to disk on promote
        (data/repos/<uuid>/) instead of tracking path+bytes metadata
        only — repo.localPath/materializedCount record this honestly.
        Repo file CRUD: GET/POST/DELETE /api/repos/:uuid/file — read,
        edit, add, and soft-delete (moved to .trash/, §7.4) files inside
        a materialized repo, wired into the UI's repo panel as a real
        editor (was read-only metadata listing before).
      verified: >
        Live-tested end to end against a running idearium server: idea
        capture → 5-template spec creation → 100% deterministic +
        cross-spec-reuse build → promote → materialized repo → file
        read/edit/add/delete, all confirmed on disk.

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
