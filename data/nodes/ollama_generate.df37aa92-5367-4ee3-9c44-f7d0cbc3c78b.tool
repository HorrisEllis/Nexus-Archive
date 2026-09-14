envelope: 1
uuid: nexus-export-tool-ollama_generate.df37aa92-5367-4ee3-9c44-f7d0cbc3c78b
type: tool
id: ollama_generate.df37aa92-5367-4ee3-9c44-f7d0cbc3c78b
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
