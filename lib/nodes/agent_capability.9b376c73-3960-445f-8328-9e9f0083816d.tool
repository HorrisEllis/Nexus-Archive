envelope: 1
uuid: nexus-export-tool-agent_capability.9b376c73-3960-445f-8328-9e9f0083816d
type: tool
id: agent_capability.9b376c73-3960-445f-8328-9e9f0083816d
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725020
source: lib/agent-tools
payload:
  name: agent_capability
  description: >-
    Real, measured capability data for an agent — not assumed constraints. Three sources, each
    clearly labeled: live (chat_log — real success rate, duration, response-size stats for exchanges
    that actually happened), historical (guardian_chat_log — real token counts, but this table has
    no current writer, frozen data), raid (cortex's own live health tracking, coarse — only
    ollama/claude/chatgpt currently wired). A field is null/absent rather than guessed when no real
    data exists. Use this before assuming what an agent can handle — check what actually happened,
    not what was hardcoded.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - profile
          - profileAll
      agent:
        type: string
        description: for "profile" — ollama/claude/chatgpt/gemini/mistral/perplexity
    required:
      - action
