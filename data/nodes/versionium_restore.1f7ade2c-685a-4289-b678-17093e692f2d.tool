envelope: 1
uuid: nexus-export-tool-versionium_restore.1f7ade2c-685a-4289-b678-17093e692f2d
type: tool
id: versionium_restore.1f7ade2c-685a-4289-b678-17093e692f2d
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862111
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862111
lastSeenAt: 1789332862111
fingerprint: null
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
