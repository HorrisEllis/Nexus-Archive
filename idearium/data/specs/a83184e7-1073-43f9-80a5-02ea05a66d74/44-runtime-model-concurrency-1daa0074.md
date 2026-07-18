---
chunk_uuid: 1daa0074-484d-448d-9303-e5e31382e239
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:runtime-model-concurrency
contract_id: spec-contract:a83184e7:runtime-model-concurrency:1daa0074
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:53.013Z
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
