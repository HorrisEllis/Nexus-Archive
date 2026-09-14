envelope: 1
uuid: nexus-export-tool-cortex.restep.tool.98d9a8c1-d0f5-45b4-b3e8-7453c8bcac2e
type: tool
id: cortex.restep.tool.98d9a8c1-d0f5-45b4-b3e8-7453c8bcac2e
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862120
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862120
lastSeenAt: 1789332862120
fingerprint: null
payload:
  name: cortex.restep.tool
  description: >-
    Recount real event steps from cortex's event_log ledger (sorted by real timestamp), instead of
    trusting a separately-cached step counter. Optionally pass believedCount to see exactly how far
    a cached counter has drifted from the real ledger.
  parameters:
    type: object
    properties:
      'n':
        type: number
        description: How many recent event_log rows to pull (default 200)
      sessionId:
        type: string
        description: Optional — restrict the recount to one session
      believedCount:
        type: number
        description: Optional — a currently-cached step count to check for drift against the real ledger
