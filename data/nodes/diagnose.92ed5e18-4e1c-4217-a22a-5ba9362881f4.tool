envelope: 1
uuid: nexus-export-tool-diagnose.92ed5e18-4e1c-4217-a22a-5ba9362881f4
type: tool
id: diagnose.92ed5e18-4e1c-4217-a22a-5ba9362881f4
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862026
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862026
lastSeenAt: 1789332862026
fingerprint: null
payload:
  name: diagnose
  description: >-
    Diagnose the NEXUS system via the real diagnostic service. Actions: "status" (every system's
    online/friction/sigma/open-gap state), "gaps" (open gaps, optionally filtered by system),
    "friction" (current friction readings), "summary" (deep diagnosis of ONE system — requires
    system name, e.g. guardian/cortex/ollama/idearium/bridge), "tension" (cross-system relational
    tension), "heal" (trigger the diagnostic self-heal surface).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - status
          - gaps
          - friction
          - summary
          - tension
          - heal
        description: Which diagnostic action to run
      system:
        type: string
        description: System name — required for "summary", optional filter for "gaps"
      status:
        type: string
        description: 'Gap status filter for "gaps": open (default), closed, or all'
    required:
      - action
