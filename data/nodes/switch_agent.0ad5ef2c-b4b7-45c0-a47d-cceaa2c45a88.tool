envelope: 1
uuid: nexus-export-tool-switch_agent.0ad5ef2c-b4b7-45c0-a47d-cceaa2c45a88
type: tool
id: switch_agent.0ad5ef2c-b4b7-45c0-a47d-cceaa2c45a88
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862110
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862110
lastSeenAt: 1789332862110
fingerprint: null
payload:
  name: switch_agent
  description: >-
    Switch which agent handles the conversation, or check which one is active. Actions: "switch"
    (needs agent — ollama/claude/chatgpt/gemini/mistral/perplexity/auto, or the name of a forged
    hat), "current" (no args — reports the active agent and, if it was set via a hat, that hat's
    name).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - switch
          - current
      agent:
        type: string
        description: for "switch"
    required:
      - action
