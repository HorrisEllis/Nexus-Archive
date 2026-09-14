envelope: 1
uuid: nexus-export-tool-ambiguity_pull.98d121f7-135f-4dbd-8f59-abbaf3579424
type: tool
id: ambiguity_pull.98d121f7-135f-4dbd-8f59-abbaf3579424
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862111
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862111
lastSeenAt: 1789332862111
fingerprint: null
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
