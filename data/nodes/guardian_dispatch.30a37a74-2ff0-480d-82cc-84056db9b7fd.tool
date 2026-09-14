envelope: 1
uuid: nexus-export-tool-guardian_dispatch.30a37a74-2ff0-480d-82cc-84056db9b7fd
type: tool
id: guardian_dispatch.30a37a74-2ff0-480d-82cc-84056db9b7fd
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
  name: guardian_dispatch
  description: >-
    Dispatch a real command/prompt to a connected agent tab through guardian — the same real POST
    /command route copilot itself already uses for reachability checks. Needs provider (e.g.
    "claude", "chatgpt") and prompt. Honestly fails if guardian is unreachable or the provider has
    no live tab — never fabricates a response.
  parameters:
    type: object
    properties:
      provider:
        type: string
        description: target agent provider id — e.g. claude, chatgpt, gemini, perplexity
      prompt:
        type: string
        description: the prompt/command text to dispatch
      command:
        type: string
        description: 'real guardian job command type (default: "queue")'
    required:
      - provider
      - prompt
