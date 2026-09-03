spec:
  meta:
    name:        idearium
    version:     3.3.0
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
      # §BUILT 2026-09-03 — spec-engine (spec-engine/index.js) has been the
      # real, actively-built chunk/agent-routing system this whole session
      # and had NO schema entry here at all — core.schemas only ever
      # described the legacy Idea/Project system. Adding it now, not
      # retroactively claiming it was always documented.
      - SpecManifest: >
          { uuid, name, type, description, author, version, phase, status,
            agent, agentPriority[], buildEngine, ideaUuid, totalChunks,
            doneChunks, failedChunks, progress, templateId, templateIds[],
            templateSeeded[], duplicateOf, rootHash, chunks[] }
          agent: 'auto' when each chunk carries its own agent (the normal
          case, from blocks.yaml/sectionAgents), or a forced single agent
          name when the whole spec was created with an explicit override.
      - Chunk: >
          { uuid, specUuid, chunkIdx, sectionId, sectionTitle, sectionDesc,
            comp_id, seam_id, contract_id, filePath, fileName, status,
            agent, agentModel, attempts, failureMode, content, byteSize,
            createdAt, updatedAt, completedAt, tags[],
            jobId, dispatchDir, dispatchedAt }
          status: pending|building|verifying|complete|failed|escalated.
          agent: this chunk's real, assigned agent — set per-block from
          spec-engine/blocks.yaml at creation, overridable per-spec
          (sectionAgents) or per-chunk (setChunkAgent, PENDING only).
          jobId/dispatchDir/dispatchedAt: real, only non-null while a
          dispatch to an async (guardian/NCP) provider is genuinely in
          flight — the chunk's own return address, written the instant
          the job exists on guardian's side (chunk-dispatch.js's onQueued
          hook), cleared the instant the chunk resolves (completeChunk/
          failChunk). No RAID compartment involved — dispatchDir IS this
          spec's own directory (specs/<spec-uuid>/); the spec is the
          compartment, per project-repo's own design (repo/index.js:
          "the repo is an archive using the spec ... the spec is the
          metadata").
      - Block: >
          { id, title, desc, agent }  — spec-engine/blocks.yaml, the
          declared schema for the 10 standard chunk slots (was a hardcoded
          JS array; now one YAML file, loaded at module start, loud error
          if missing/malformed). `agent` is the routing-table default for
          that slot — real precedence at chunk creation:
          sectionAgents[id] > explicit spec-wide agent param > block.agent > 'ollama'.
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
      # §RE-ADDED, NOW REAL 2026-09-03 — corrected out earlier this
      # session as a false claim (grepped, nothing implemented it). Now
      # genuinely built and tested: lib/guardian-stream.cjs subscribes to
      # guardian's real /events SSE (not copilot's own buggy /bus path —
      # see that file's header), resolves matching chunks via
      # completeChunk/failChunk on guardian.job.complete/.error. Wired
      # into boot (api/index.js's guardian.reconcile SOFT phase), which
      # also sweeps any chunk left 'building' by a prior restart before
      # subscribing live — verified end to end with a real mock guardian:
      # boot reconciliation, live push resolution, and correct no-op on
      # an unrelated job, all three independently confirmed.
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
        §BUILT 2026-09-03 — repo-first: a repo record can now be created
        the moment a spec-engine spec exists (repo.ingest accepts
        specUuid directly), not only once every chunk is complete. The
        repo is never a second content store — RepoLayer resolves live
        off specUuid every read, so a repo created early shows chunks
        landing into it as each one completes. dedup (same rootHash →
        reuse the existing repo) only applies once a manifest has real
        completed content — an all-pending manifest's rootHash is
        identical across every spec built from the same block set, so
        dedup on an empty manifest would silently collapse every new
        repo into the first one ever made; guarded against directly.

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

    # §BUILT 2026-09-03 — the actual, actively-developed chunk/agent
    # system had no module entry here at all until now — every other
    # real module in this file is documented; this one, despite being
    # the largest and most-built piece of idearium this session, wasn't.
    - id: spec-engine
      description: >
        Chunk-based spec compiler. Every spec splits into 10 standard
        blocks (spec-engine/blocks.yaml — meta/purpose/axioms/schema/api/
        events/integration/failure_modes/build_order/tests), each block
        a first-class, independently-dispatched chunk with its own
        uuid/comp_id/seam_id/contract_id and its own agent (per-block
        default from blocks.yaml, overridable per-spec or per-chunk).
        Dispatch is direct (agent-suite → guardian or ollama), verified
        against Guardian's real Detector/retry ladder
        (chunk-dispatch.js's dispatchChunkWithVerification) — not routed
        through a RAID compartment; that's a deliberate, current scope
        boundary, not an oversight (see RAID note below). A chunk
        genuinely in flight to an async provider carries its own return
        address (jobId, dispatchDir) written the instant the job exists,
        cleared the instant it resolves.
        §BUILT 2026-09-03 — restart survival: lib/guardian-stream.cjs
        sweeps any chunk left 'building' with a real jobId on boot
        (resolves it if guardian already finished the job, or fails it
        honestly if genuinely orphaned), then subscribes live to
        guardian's real job-completion events for the rest of the
        process's life. No new persisted queue — chunk.jobId/dispatchDir
        already is the durable, disk-backed record.

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
