envelope: 1
uuid: nexus-export-tool-mastermind.e90c98ed-5e50-4dfe-a4ac-72d909907c91
type: tool
id: mastermind.e90c98ed-5e50-4dfe-a4ac-72d909907c91
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724949
source: lib/agent-tools
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
