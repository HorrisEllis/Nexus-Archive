---
chunk_uuid: aba28891-b2a8-4802-a350-8bfca527b46c
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: runtime-model-storage
title: runtime model — storage
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:runtime-model-storage
contract_id: spec-contract:9d4b9a4e:runtime-model-storage:aba28891
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.963Z
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
