envelope: 1
uuid: nexus-export-tool-query_recall.d4a325c2-f997-4efb-a109-4a10286e16ec
type: tool
id: query_recall.d4a325c2-f997-4efb-a109-4a10286e16ec
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724954
source: lib/agent-tools
payload:
  name: query_recall
  description: >-
    Search past conversations and stored memory for relevant context. Use when the user references
    something from before ("what did we decide about X", "the thing we discussed") or when past
    context would help. Params: query (required — what to search for), intent (optional:
    general|session_resume|pattern_lookup|crystal_query|debug_failure|gap_fill|causal_trace, default
    general). Returns ranked past exchanges. Recall uses lexical (word-overlap), recency,
    failure-pattern, BEP-pattern, and causal-graph-connectivity ranking — 5 real lanes, weighted per
    intent.
  parameters:
    type: object
    properties:
      query:
        type: string
        description: What to search past conversations for (required)
      intent:
        type: string
        description: >-
          general (default) | session_resume | pattern_lookup | crystal_query | debug_failure |
          gap_fill | causal_trace
      tier:
        type: string
        description: optional memory tier filter
    required:
      - query
