---
chunk_uuid: 9c7844bb-635b-47ca-aba8-a410e7c6cbdf
spec_uuid: 08af9d3b-44c4-4156-8709-261d224a69e6
section: document-modules
title: document — modules
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:08af9d3b:document-modules
contract_id: spec-contract:08af9d3b:document-modules:9c7844bb
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:17:18.296Z
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
