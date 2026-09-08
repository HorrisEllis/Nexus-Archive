envelope: 1
uuid: nexus-export-tool-intuition.cb48d964-2fe8-47c6-b65c-1d48ec068c26
type: tool
id: intuition.cb48d964-2fe8-47c6-b65c-1d48ec068c26
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724948
source: lib/agent-tools
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
