---
chunk_uuid: 2029506c-1746-4656-8534-d6b207a3cf49
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: runtime-model-storage
title: runtime model — storage
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:runtime-model-storage
contract_id: spec-contract:f4232853:runtime-model-storage:2029506c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.638Z
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
