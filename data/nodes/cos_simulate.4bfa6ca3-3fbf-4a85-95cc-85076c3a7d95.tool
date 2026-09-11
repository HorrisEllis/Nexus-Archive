envelope: 1
uuid: nexus-export-tool-cos_simulate.4bfa6ca3-3fbf-4a85-95cc-85076c3a7d95
type: tool
id: cos_simulate.4bfa6ca3-3fbf-4a85-95cc-85076c3a7d95
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725002
source: lib/agent-tools
payload:
  name: cos_simulate
  description: >-
    Run a real LLM mental simulation before committing to a real action — a scenario against a real
    provider, scored and tracked. Actions: "run" (needs type: "single" one-shot, "h2h" compare two
    providers on the same prompt [providerB], "loop" feedback iterations [iterations], "chain"
    multi-step, "stress" repeated stress test; needs prompt; provider defaults to claude; optional
    hypothesis to record what you expect), "stop"/"get" (need sessionId), "list", "history". This
    dispatches a REAL job to a real provider through guardian — it costs real time/tokens, it is not
    free.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - run
          - stop
          - get
          - list
          - history
      type:
        type: string
        enum:
          - single
          - h2h
          - loop
          - chain
          - stress
        description: for "run"
      prompt:
        type: string
        description: for "run"
      provider:
        type: string
        description: for "run" — default claude
      providerB:
        type: string
        description: for "run" type h2h — the second provider to compare
      iterations:
        type: number
        description: for "run" type loop/stress
      hypothesis:
        type: string
        description: for "run" — what you expect, recorded for scoring
      sessionId:
        type: string
        description: for stop/get
      limit:
        type: number
        description: for "history" — default 20
    required:
      - action
