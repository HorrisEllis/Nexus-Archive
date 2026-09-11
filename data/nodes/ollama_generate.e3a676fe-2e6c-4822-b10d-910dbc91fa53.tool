envelope: 1
uuid: nexus-export-tool-ollama_generate.e3a676fe-2e6c-4822-b10d-910dbc91fa53
type: tool
id: ollama_generate.e3a676fe-2e6c-4822-b10d-910dbc91fa53
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725068
source: lib/agent-tools
payload:
  name: ollama_generate
  description: >-
    Generate text using a local Ollama model, running on this machine — no external API call, no
    cost. Use for fast, private, local reasoning when a full agent dispatch is not needed.
  parameters:
    type: object
    properties:
      model:
        type: string
        description: >-
          Real, exact Ollama model tag (e.g. "huihui_ai/qwen2.5-coder-abliterate:7b"). Must already
          be pulled locally.
      prompt:
        type: string
        description: The real prompt to send to the local model.
    required:
      - model
      - prompt
