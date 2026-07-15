---
chunk_uuid: de2a0656-5ed6-4efc-aeb4-61921547c93b
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: runtime-model-storage
title: runtime model — storage
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:runtime-model-storage
contract_id: spec-contract:a851a5dc:runtime-model-storage:de2a0656
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.668Z
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