---
chunk_uuid: a8b299e2-1128-4578-ac0d-8a7cc6d2af3b
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: runtime-model-storage
title: runtime model — storage
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:runtime-model-storage
contract_id: spec-contract:034dfc10:runtime-model-storage:a8b299e2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.975Z
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