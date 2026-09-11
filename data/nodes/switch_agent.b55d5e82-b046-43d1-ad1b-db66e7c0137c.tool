envelope: 1
uuid: nexus-export-tool-switch_agent.b55d5e82-b046-43d1-ad1b-db66e7c0137c
type: tool
id: switch_agent.b55d5e82-b046-43d1-ad1b-db66e7c0137c
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725052
source: lib/agent-tools
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
