envelope: 1
uuid: nexus-export-tool-intelligence_query.730a50d3-856f-4964-9c9d-c5fb52c1b1ef
type: tool
id: intelligence_query.730a50d3-856f-4964-9c9d-c5fb52c1b1ef
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862095
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862095
lastSeenAt: 1789332862095
fingerprint: null
payload:
  name: intelligence_query
  description: >-
    Real access to the intelligence system (patterns, status, failures, reuse index, loom map, CFR
    field state, and the live command list). "patterns"/"status"/"failures"/"reuse"/"map"/"commands"
    are reached in-process, always available. "cfr" needs intelligence/server.js actually running —
    genuinely fails, not fabricated numbers, if it is not. For generating a real WARP framework
    skeleton, use the separate framework_builder tool.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - patterns
          - status
          - failures
          - reuse
          - map
          - commands
          - cfr
    required:
      - action
