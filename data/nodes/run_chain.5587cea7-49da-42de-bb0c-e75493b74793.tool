envelope: 1
uuid: nexus-export-tool-run_chain.5587cea7-49da-42de-bb0c-e75493b74793
type: tool
id: run_chain.5587cea7-49da-42de-bb0c-e75493b74793
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725017
source: lib/agent-tools
payload:
  name: run_chain
  description: >-
    Run a real ordered workflow — a sequence of steps (agent/command/system/http), each RAID-gated
    individually. Each step's output becomes the next step's input (carry) unless overridden. A
    denied or failing step HALTS the chain at that point rather than skipping ahead — a later step
    may depend on an earlier one's real output, so results past a halt are never produced. Needs
    steps: array of { kind: "agent"|"command"|"system"|"http", ...kind-specific fields }, optional
    name and input (initial carry value).
  parameters:
    type: object
    properties:
      name:
        type: string
        description: chain name, for logging
      input:
        description: initial carry value passed into step 1
      steps:
        type: array
        description: 'ordered steps — each { kind: "agent"|"command"|"system"|"http", ... }'
        items:
          type: object
    required:
      - steps
