envelope: 1
uuid: nexus-export-tool-query_movement.a69e44a3-188c-4e20-88d0-97d28722e1f8
type: tool
id: query_movement.a69e44a3-188c-4e20-88d0-97d28722e1f8
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724962
source: lib/agent-tools
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
