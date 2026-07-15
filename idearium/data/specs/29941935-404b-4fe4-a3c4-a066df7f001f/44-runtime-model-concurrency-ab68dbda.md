---
chunk_uuid: ab68dbda-02a0-4c98-bef3-20b9f556ac90
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:runtime-model-concurrency
contract_id: spec-contract:29941935:runtime-model-concurrency:ab68dbda
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.908Z
---

<!-- imported: runtime model → concurrency -->

# BLOCK 7 — RUNTIME MODEL
  # ════════════════════════════════════════════════════════════════
  runtime_model:
    concurrency:
      model: async
      max_concurrency: 1
      isolation: none
      async_model: >
        Node.js single-threaded event loop. Kernel ingest is synchronous (no await in hot path).
        Persist WAL flush and forge API calls are async. No worker threads in core.
