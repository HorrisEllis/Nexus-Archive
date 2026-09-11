envelope: 1
uuid: nexus-export-tool-ambiguity_pull.fddeab2d-c7b3-4af8-ba34-9f7c4b1937dc
type: tool
id: ambiguity_pull.fddeab2d-c7b3-4af8-ba34-9f7c4b1937dc
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725061
source: lib/agent-tools
payload:
  name: ambiguity_pull
  description: >-
    Resolve something ambiguous by pulling in strict cheap-to-expensive order: cortex recall (incl.
    chat history) → loom-map → [agent_model, honestly skipped — not built yet] → Perplexity → raw
    browser search, only reaching each next step if the previous one came back empty or erroring.
    Returns the full trace of what was tried, not just the final answer — use "resolve" (needs
    query, optional session, optional allowBrowserFallback:false to stop before raw browsing).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - resolve
      query:
        type: string
        description: the ambiguous thing to resolve
      session:
        type: string
        description: optional — groups this pull's ledger entries
      allowBrowserFallback:
        type: boolean
        description: default true — set false to stop after Perplexity
    required:
      - action
