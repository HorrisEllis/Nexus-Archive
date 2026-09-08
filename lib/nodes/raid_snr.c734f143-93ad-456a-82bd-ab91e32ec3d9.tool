envelope: 1
uuid: nexus-export-tool-raid_snr.c734f143-93ad-456a-82bd-ab91e32ec3d9
type: tool
id: raid_snr.c734f143-93ad-456a-82bd-ab91e32ec3d9
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724976
source: lib/agent-tools
payload:
  name: raid_snr
  description: >-
    Introspect RAID's real routing decisions and tunables, and run the SNR pre-gate on demand.
    Read-only for "decisions" (most recent real routing outcomes, newest first) and "tunables"
    (current threshold values). "snr" and "snr_stats" call the REAL SNR filter — "snr" writes an
    event_log row and counts toward "snr_stats", same as a real dispatch would, because it runs the
    actual pre-gate, not a simulation. Never calls RAID's own routing/approval functions — this is
    introspection, not a second way to route a request.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - decisions
          - tunables
          - snr
          - snr_stats
      limit:
        type: number
        description: for "decisions" — how many recent rows (default 10)
      intent:
        type: string
        description: for "snr" — the intent/prompt text being classified
      cluster:
        type: string
        description: for "snr" — optional cluster hint
      faultClass:
        type: string
        description: for "snr" — optional fault class for the open-loop tier
      causedBy:
        type: string
        description: for "snr" — causal chain id
      sessionId:
        type: string
      jobId:
        type: string
    required:
      - action
