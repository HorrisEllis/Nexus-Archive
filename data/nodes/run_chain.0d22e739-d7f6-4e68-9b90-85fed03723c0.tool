envelope: 1
uuid: nexus-export-tool-run_chain.0d22e739-d7f6-4e68-9b90-85fed03723c0
type: tool
id: run_chain.0d22e739-d7f6-4e68-9b90-85fed03723c0
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862089
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862089
lastSeenAt: 1789332862089
fingerprint: null
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
