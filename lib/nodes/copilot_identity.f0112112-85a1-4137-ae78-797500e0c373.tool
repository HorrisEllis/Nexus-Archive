envelope: 1
uuid: nexus-export-tool-copilot_identity.f0112112-85a1-4137-ae78-797500e0c373
type: tool
id: copilot_identity.f0112112-85a1-4137-ae78-797500e0c373
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724986
source: lib/agent-tools
payload:
  name: copilot_identity
  description: >-
    Get or set co-pilot's own display name, or which provider it dispatches to by default ("the hat"
    — ollama/claude/chatgpt/gemini/mistral/perplexity, or "auto" for the normal ollama-first cascade
    with confidence-based escalation). "get"/"set" are the name. "getAgent"/"setAgent" are the hat —
    persisted, applies to every future message until changed again, RAID-governed the same as
    switching agent for a single request. Setting an empty name or "auto" agent clears back to
    default. Both persist to cortex, survive a restart.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - get
          - set
          - getAgent
          - setAgent
      name:
        type: string
        description: for "set" — the new name, or "" to clear
      agent:
        type: string
        description: for "setAgent" — ollama/claude/chatgpt/gemini/mistral/perplexity/auto
    required:
      - action
