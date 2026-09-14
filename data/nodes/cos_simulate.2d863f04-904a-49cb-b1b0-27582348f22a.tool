envelope: 1
uuid: nexus-export-tool-cos_simulate.2d863f04-904a-49cb-b1b0-27582348f22a
type: tool
id: cos_simulate.2d863f04-904a-49cb-b1b0-27582348f22a
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862077
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862077
lastSeenAt: 1789332862077
fingerprint: null
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
