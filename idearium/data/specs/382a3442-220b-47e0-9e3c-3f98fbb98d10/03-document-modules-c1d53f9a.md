---
chunk_uuid: c1d53f9a-76c8-4281-98b8-6eaa14e6a3cc
spec_uuid: 382a3442-220b-47e0-9e3c-3f98fbb98d10
section: document-modules
title: document — modules
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:382a3442:document-modules
contract_id: spec-contract:382a3442:document-modules:c1d53f9a
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:03:56.152Z
---

<!-- imported: document → modules -->


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
