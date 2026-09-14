envelope: 1
uuid: nexus-export-tool-run_adversarial.886d5079-cc1d-41db-8c68-074208956687
type: tool
id: run_adversarial.886d5079-cc1d-41db-8c68-074208956687
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862032
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862032
lastSeenAt: 1789332862032
fingerprint: null
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
