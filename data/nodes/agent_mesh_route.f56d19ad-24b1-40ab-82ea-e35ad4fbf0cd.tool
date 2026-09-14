envelope: 1
uuid: nexus-export-tool-agent_mesh_route.f56d19ad-24b1-40ab-82ea-e35ad4fbf0cd
type: tool
id: agent_mesh_route.f56d19ad-24b1-40ab-82ea-e35ad4fbf0cd
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862112
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862112
lastSeenAt: 1789332862112
fingerprint: null
payload:
  name: agent_mesh_route
  description: >-
    Dispatch a real prompt through clear-glass's agent-mesh — the same real Guardian-first routing
    gate (DA1) that checks live NCP provider connectivity before falling through to DOM automation.
    Needs prompt; preferAgent optionally names which agent to try first (e.g. "claude", "gemini").
    Honestly fails if clear-glass is unreachable — never fabricates a response.
  parameters:
    type: object
    properties:
      prompt:
        type: string
        description: the prompt to route through the mesh
      preferAgent:
        type: string
        description: optional — which agent to try first, e.g. claude, chatgpt, gemini, perplexity
      fallbackOrder:
        type: array
        description: optional — explicit ordered fallback list, overrides the mesh's own default ordering
    required:
      - prompt
