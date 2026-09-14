envelope: 1
uuid: nexus-export-tool-nexus_capability.bd97dd84-8af2-4e5f-a765-37990d402356
type: tool
id: nexus_capability.bd97dd84-8af2-4e5f-a765-37990d402356
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862047
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862047
lastSeenAt: 1789332862047
fingerprint: null
payload:
  name: nexus_capability
  description: >-
    Call ANY declared capability of ANY NEXUS system. Generated from the 13 registry-components.js
    files at call time, so a system that declares a new route becomes callable with no code change.
    Actions: "list" to discover (narrow with system or q — do this first), "describe" for one
    capability's contract and port, "call" to invoke it, "unserved" to see which capabilities are
    declared but served by nothing. Only VERIFIED-SERVED capabilities can be called; the rest are
    reported and refused rather than pretended to work.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - describe
          - call
          - unserved
      id:
        type: string
        description: capability id, e.g. cortex.health — from action "list"
      system:
        type: string
        description: narrow list to one system
      q:
        type: string
        description: keyword filter across id, path, description, tags
      limit:
        type: number
        description: max rows from list (default 40)
      params:
        type: object
        description: values for :params in the route path
      query:
        type: object
        description: querystring key/values
      body:
        type: object
        description: JSON body for non-GET calls
      intent:
        type: string
        description: why you are calling — recorded in the living tool index
    required:
      - action
