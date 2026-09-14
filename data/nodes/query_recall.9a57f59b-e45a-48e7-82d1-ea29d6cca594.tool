envelope: 1
uuid: nexus-export-tool-query_recall.9a57f59b-e45a-48e7-82d1-ea29d6cca594
type: tool
id: query_recall.9a57f59b-e45a-48e7-82d1-ea29d6cca594
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862038
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862038
lastSeenAt: 1789332862038
fingerprint: null
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
