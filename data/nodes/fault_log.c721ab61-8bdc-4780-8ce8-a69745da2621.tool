envelope: 1
uuid: nexus-export-tool-fault_log.c721ab61-8bdc-4780-8ce8-a69745da2621
type: tool
id: fault_log.c721ab61-8bdc-4780-8ce8-a69745da2621
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862102
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862102
lastSeenAt: 1789332862102
fingerprint: null
payload:
  name: fault_log
  description: >-
    Real fault/failure precedent for a component — not a fabricated risk score. Every tool call that
    errors already logs here automatically (no action needed for that). "check" (needs component,
    optional intent) returns real past faults for it, most recent first, with the real CFR
    conditions at the time — use this before a consequential action to see if this exact thing has
    failed before. "log" manually records a fault outside the automatic tool-call path (e.g. from
    your own reasoning about something that went wrong).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - check
          - log
      component:
        type: string
        description: the real thing that failed — a tool name, a system, a file
      intent:
        type: string
        description: optional — narrow to a specific intent
      limit:
        type: number
        description: for "check" — how many recent faults to return, default 5
      system:
        type: string
        description: for "log" — which system
      agent:
        type: string
        description: for "log" — which agent
      faultClass:
        type: string
        description: for "log" — one of fault-taxonomy's known classes if it fits
      status:
        type: string
        description: for "log" — default "failed"
      causedBy:
        type: string
        description: for "log" — a real pointer (jobId/branchId/taskId/requestId)
      meta:
        type: object
        description: for "log" — anything else real and relevant
    required:
      - action
