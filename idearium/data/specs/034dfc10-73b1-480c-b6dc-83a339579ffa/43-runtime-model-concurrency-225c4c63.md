---
chunk_uuid: 225c4c63-9606-40a9-a7c4-c05939d6b43f
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:runtime-model-concurrency
contract_id: spec-contract:034dfc10:runtime-model-concurrency:225c4c63
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.880Z
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