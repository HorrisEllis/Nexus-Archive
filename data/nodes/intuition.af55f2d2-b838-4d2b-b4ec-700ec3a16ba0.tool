envelope: 1
uuid: nexus-export-tool-intuition.af55f2d2-b838-4d2b-b4ec-700ec3a16ba0
type: tool
id: intuition.af55f2d2-b838-4d2b-b4ec-700ec3a16ba0
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862033
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862033
lastSeenAt: 1789332862033
fingerprint: null
payload:
  name: intuition
  description: >-
    Fast, associative, pattern-based answer from what the system already knows — cortex's own
    intuition faculty (<50ms, no model call). Falls through to null if there is no confident answer;
    use analyze for a deeper, reasoned answer.
  parameters:
    type: object
    properties:
      prompt:
        type: string
        description: The prompt or question to answer intuitively.
    required:
      - prompt
