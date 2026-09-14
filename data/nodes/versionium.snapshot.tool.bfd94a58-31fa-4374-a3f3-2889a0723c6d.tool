envelope: 1
uuid: nexus-export-tool-versionium.snapshot.tool.bfd94a58-31fa-4374-a3f3-2889a0723c6d
type: tool
id: versionium.snapshot.tool.bfd94a58-31fa-4374-a3f3-2889a0723c6d
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862123
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862123
lastSeenAt: 1789332862123
fingerprint: null
payload:
  name: versionium.snapshot.tool
  description: >-
    Read or restore a specific commit's snapshot. action:"read" (default) returns the captured state
    for commitId. action:"restore" actually restores NEXUS to that commit — a real mutating action,
    not a preview.
  parameters:
    type: object
    properties:
      commitId:
        type: string
        description: the versionium commit id
      action:
        type: string
        enum:
          - read
          - restore
        description: read (default) or restore
    required:
      - commitId
