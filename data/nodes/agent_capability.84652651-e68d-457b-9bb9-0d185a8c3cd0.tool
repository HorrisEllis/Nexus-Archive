envelope: 1
uuid: nexus-export-tool-agent_capability.84652651-e68d-457b-9bb9-0d185a8c3cd0
type: tool
id: agent_capability.84652651-e68d-457b-9bb9-0d185a8c3cd0
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862090
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862090
lastSeenAt: 1789332862090
fingerprint: null
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
