envelope: 1
uuid: nexus-export-tool-nexus_help.847ab664-afb5-4bdd-8b0f-7bd7834b4cce
type: tool
id: nexus_help.847ab664-afb5-4bdd-8b0f-7bd7834b4cce
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725001
source: lib/agent-tools
payload:
  name: nexus_help
  description: >-
    Ask anything about NEXUS itself — the system, not the user's task. Actions: "rundown"
    (capability count, versions, live coverage, declared-vs-served — the full current-state
    picture), "diagnose" (real findings from the diagnostic causal layer, optionally pass findings:
    gaps already known), "ask" (routes a NEXUS-state question like "what's wrong" or "system status"
    to the right real source; returns ok:false if the prompt isn't actually a NEXUS-state question),
    "search_docs" (full-text search over docs/*.spec and docs/*.md, returns file + excerpt, never
    the whole file). Use search_docs when the question is about how a specific subsystem or tool
    works in depth.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - rundown
          - diagnose
          - ask
          - search_docs
      prompt:
        type: string
        description: for "ask" — the question
      findings:
        type: array
        description: for "diagnose" — known gaps to diagnose against, optional
      query:
        type: string
        description: for "search_docs" — text to find
      limit:
        type: number
        description: for "search_docs" — max files with a match (default 10)
    required:
      - action
