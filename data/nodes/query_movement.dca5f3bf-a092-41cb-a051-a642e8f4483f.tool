envelope: 1
uuid: nexus-export-tool-query_movement.dca5f3bf-a092-41cb-a051-a642e8f4483f
type: tool
id: query_movement.dca5f3bf-a092-41cb-a051-a642e8f4483f
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862041
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862041
lastSeenAt: 1789332862041
fingerprint: null
payload:
  name: query_movement
  description: >-
    All movement for one NEXUS system: process, events, ledgers, changes, gaps, sigma, friction,
    schema drift, file drift (sha256 manifest vs baseline), and errors. Actions: "systems" lists
    what can be asked about; "snapshot" returns the full picture (pass full=true for the untrimmed
    object); "drift" compares the file manifest against the stored baseline and scores it as a
    sigma; "baseline" stores the current manifest as the new comparison point. Every section reports
    whether it could be READ — a source that is blind is named, never shown as zero.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - systems
          - snapshot
          - drift
          - baseline
        description: which movement surface to query
      system:
        type: string
        description: system name, e.g. guardian, cortex, idearium
      hours:
        type: number
        description: window in hours for snapshot (default 24)
      full:
        type: boolean
        description: return the untrimmed snapshot instead of the agent summary
      expected:
        type: boolean
        description: true when a build/dispatch was running — lowers drift sigma
    required:
      - action
