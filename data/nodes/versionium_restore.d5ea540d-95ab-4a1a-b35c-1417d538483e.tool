envelope: 1
uuid: nexus-export-tool-versionium_restore.d5ea540d-95ab-4a1a-b35c-1417d538483e
type: tool
id: versionium_restore.d5ea540d-95ab-4a1a-b35c-1417d538483e
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725060
source: lib/agent-tools
payload:
  name: versionium_restore
  description: >-
    Real temporal replay — given a commitId, returns that commit plus the completion record from
    replaying its stored kernel snapshot. Read-only: does not mutate any live state.
  parameters:
    type: object
    properties:
      commitId:
        type: string
        description: required — a real commitId, e.g. from versionium_history
    required:
      - commitId
