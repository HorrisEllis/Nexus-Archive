envelope: 1
uuid: nexus-export-tool-intelligence_query.8524f388-81ae-44b4-a600-73fadc5ff45a
type: tool
id: intelligence_query.8524f388-81ae-44b4-a600-73fadc5ff45a
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725022
source: lib/agent-tools
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
