envelope: 1
uuid: nexus-export-tool-cortex.node_tag.tool.e15c5d9a-4b6f-4fad-9e96-9da1e8209614
type: tool
id: cortex.node_tag.tool.e15c5d9a-4b6f-4fad-9e96-9da1e8209614
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862120
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862120
lastSeenAt: 1789332862120
fingerprint: null
payload:
  name: cortex.node_tag.tool
  description: >-
    List or add tags on any node (component, event, spec — any entityId) via cortex's real /api/tags
    store. action:"list" optionally filtered by entityId, or action:"add" with entityId + tags[]
    (entityType/system optional).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - add
        description: list or add
      entityId:
        type: string
        description: the node/entity being tagged or queried
      entityType:
        type: string
        description: optional — e.g. "component", "event", "spec"
      system:
        type: string
        description: optional — which NEXUS system owns this entity
      tags:
        type: array
        items:
          type: string
        description: required for action:"add"
    required:
      - action
