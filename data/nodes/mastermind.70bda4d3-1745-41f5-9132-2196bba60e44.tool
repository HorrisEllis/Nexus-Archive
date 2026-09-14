envelope: 1
uuid: nexus-export-tool-mastermind.70bda4d3-1745-41f5-9132-2196bba60e44
type: tool
id: mastermind.70bda4d3-1745-41f5-9132-2196bba60e44
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862034
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862034
lastSeenAt: 1789332862034
fingerprint: null
payload:
  name: mastermind
  description: >-
    Strategic, predictive, causal answer — cortex's own mastermind faculty, answering "if this is
    true, what follows?" using the real causal graph. The opposite question from intuition's "what
    does this resemble?".
  parameters:
    type: object
    properties:
      prompt:
        type: string
        description: The situation or claim to reason forward from.
      contextSnippet:
        type: string
        description: Optional additional context.
    required:
      - prompt
