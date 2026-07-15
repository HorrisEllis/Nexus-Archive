---
chunk_uuid: 5eac5c40-4a40-430e-91f2-a54e858e1891
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: runtime-model-storage
title: runtime model — storage
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:runtime-model-storage
contract_id: spec-contract:ac87dd93:runtime-model-storage:5eac5c40
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.996Z
---

<!-- imported: runtime model → storage -->

    storage:
      data_dir: user-configured
      log_dir:  user-configured
      tables:
        - name: wal
          type: append_only_jsonl
          path: user-configured
          max_size_mb: 500
          compact_at_mb: 400
          description: Write-ahead log. Replayed on recoverStore().
        - name: archive
          type: append_only_jsonl
          path: user-configured
          max_size_mb: 5000
          compact_at_mb: 4000
          description: Cold archive of ring-evicted events. Queried via queryArchive().
        - name: snapshot
          type: in_memory
          path: user-configured
          max_size_mb: 200
          compact_at_mb: 150
          description: .nex artifacts (SNAP/BP/CLIP). Validated by version-gate on restore.
        - name: dead_letter_events
          type: append_only_jsonl
          path: user-configured
          max_size_mb: 50
          compact_at_mb: 40
          description: Undeliverable events. on_failure dead_letter.