envelope: 1
uuid: nexus-export-tool-hat_forge.ac5a2bd6-a24c-488d-81ec-0a958d01d771
type: tool
id: hat_forge.ac5a2bd6-a24c-488d-81ec-0a958d01d771
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725019
source: lib/agent-tools
payload:
  name: hat_forge
  description: >-
    Make and manage named, reusable hats — a bundle of base agent + optional scoped tools + optional
    persona + optional real recurring responsibilities, distinct from the raw per-message agent
    switch. Actions: "forge" (needs name, baseAgent — one of
    ollama/claude/chatgpt/gemini/mistral/perplexity; optional allowedAgents array for
    rotation/fallback, optional toolScope array of real tool names to narrow which tools are offered
    AND enforced, optional personaPrompt, optional responsibilities array of {description, everyMs
    (>=5000), prompt} — each becomes a REAL scheduled task dispatching through this hat's agent,
    findings written to gap-field), "wear" (needs name — a forged hat OR a raw base agent name,
    persists until changed), "list", "get", "revoke", "rename" (needs name — hat name or uuid — and
    newName; the permanent role/seedKey is untouched, only the human-facing name changes). A hat
    scoped to a tool or agent that doesn't exist is refused at forge time, not silently accepted.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - forge
          - wear
          - list
          - get
          - revoke
          - rename
      name:
        type: string
        description: hat name (or uuid) for forge/wear/get/revoke/rename
      newName:
        type: string
        description: for "rename" — the new human-facing name; the hat's permanent uuid/seedKey are unaffected
      baseAgent:
        type: string
        description: for "forge" — ollama/claude/chatgpt/gemini/mistral/perplexity
      allowedAgents:
        type: array
        items:
          type: string
        description: for "forge" — the full real agent set this hat may draw from, must include baseAgent
      toolScope:
        type: array
        items:
          type: string
        description: for "forge" — real tool names this hat is limited to; omit for all 37
      personaPrompt:
        type: string
        description: for "forge" — appended to the system prompt when worn
      responsibilities:
        type: array
        items:
          type: object
        description: for "forge" — [{description, everyMs, prompt}] real recurring jobs this hat owns
    required:
      - action
