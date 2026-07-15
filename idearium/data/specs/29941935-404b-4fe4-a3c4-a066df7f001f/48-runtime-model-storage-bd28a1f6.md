---
chunk_uuid: bd28a1f6-916f-4a6e-b518-f42f44434fce
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: runtime-model-storage
title: runtime model — storage
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:runtime-model-storage
contract_id: spec-contract:29941935:runtime-model-storage:bd28a1f6
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.944Z
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
