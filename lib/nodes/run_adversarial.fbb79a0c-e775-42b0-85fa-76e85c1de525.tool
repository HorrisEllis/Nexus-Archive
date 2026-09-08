envelope: 1
uuid: nexus-export-tool-run_adversarial.fbb79a0c-e775-42b0-85fa-76e85c1de525
type: tool
id: run_adversarial.fbb79a0c-e775-42b0-85fa-76e85c1de525
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724943
source: lib/agent-tools
payload:
  name: run_adversarial
  description: >-
    Run an adversarial critique pass over the current system stream — attacks recent activity to
    surface violations, weaknesses, and contradictions. Use to stress-test a proposal or check for
    problems.
  parameters:
    type: object
    properties:
      stream:
        type: array
        description: Optional array of recent events to critique; empty uses the live stream.
        items:
          type: object
    required: []
