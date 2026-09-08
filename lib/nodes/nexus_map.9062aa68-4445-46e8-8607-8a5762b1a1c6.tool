envelope: 1
uuid: nexus-export-tool-nexus_map.9062aa68-4445-46e8-8607-8a5762b1a1c6
type: tool
id: nexus_map.9062aa68-4445-46e8-8607-8a5762b1a1c6
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725052
source: lib/agent-tools
payload:
  name: nexus_map
  description: >-
    Walk NEXUS's real, already-computed system graph (loom's registry — components, hooks, wires) in
    agent-sized chunks, instead of reading the file tree from scratch. Actions: "systems" (list
    every system and its component count — start here to pick where to look), "graph" (optional
    system filter, optional agentId to size the page to that agent's real token limit, optional
    cursor/pageSize to page manually — returns a page of components plus the wires between them, and
    a nextCursor to continue), "component" (needs id — full detail for one real component: its hooks
    and every wire touching it).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - systems
          - graph
          - component
      system:
        type: string
        description: >-
          for "graph" — restrict to one system, e.g. "guardian", "cortex" (see "systems" action for
          real names)
      agentId:
        type: string
        description: >-
          for "graph" — size the page to this agent's real token limit
          (claude/chatgpt/gemini/perplexity/mistral/grok/ollama)
      cursor:
        type: integer
        description: for "graph" — resume from this offset, from a prior call's nextCursor
      pageSize:
        type: integer
        description: for "graph" — override the auto-sized page, if you know better than the estimate
      id:
        type: string
        description: for "component" — a real component id from "graph" or "systems"
    required:
      - action
