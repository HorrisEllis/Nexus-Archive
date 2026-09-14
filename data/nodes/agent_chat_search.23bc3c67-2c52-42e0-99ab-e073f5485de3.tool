envelope: 1
uuid: nexus-export-tool-agent_chat_search.23bc3c67-2c52-42e0-99ab-e073f5485de3
type: tool
id: agent_chat_search.23bc3c67-2c52-42e0-99ab-e073f5485de3
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862063
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862063
lastSeenAt: 1789332862063
fingerprint: null
payload:
  name: agent_chat_search
  description: >-
    "Do you remember when we talked about X" or "do you remember when I talked to Y about X" — plain
    keyword search across real conversation logs, newest first. Actions: "search" (needs query;
    scope: "mine" for copilot's own conversations [chat_log], "agents" for other providers routed
    through guardian [guardian_chat_log], "all" for both — default all; withAgent filters to one
    provider name, e.g. "claude"/"ollama"/"chatgpt"), "providers" (lists which agent/provider names
    actually appear in the real data, so you know what's valid for withAgent). Literal substring
    match, not semantic — no scoring model, exactly what's there.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - search
          - providers
      query:
        type: string
        description: for "search" — text to look for in prompt/response
      scope:
        type: string
        enum:
          - mine
          - agents
          - all
        description: for "search" — default all
      withAgent:
        type: string
        description: for "search" — filter to one agent/provider name
      limit:
        type: number
        description: for "search" — max results (default 10)
    required:
      - action
