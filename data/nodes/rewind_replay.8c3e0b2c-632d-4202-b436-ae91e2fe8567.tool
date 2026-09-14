envelope: 1
uuid: nexus-export-tool-rewind_replay.8c3e0b2c-632d-4202-b436-ae91e2fe8567
type: tool
id: rewind_replay.8c3e0b2c-632d-4202-b436-ae91e2fe8567
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862062
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862062
lastSeenAt: 1789332862062
fingerprint: null
payload:
  name: rewind_replay
  description: >-
    Snapshot and restore a Clear Glass agent session's state via RewindEngine. Actions: "list"
    (recent snapshots for an agentId, optional limit), "snapshot" (capture current state now,
    optional label), "restore" (needs snapshotId — replay session state back to that snapshot),
    "clear" (delete all snapshots for an agentId). Direct HTTP to Clear Glass's own rewind routes —
    real state, not a preview.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - snapshot
          - restore
          - clear
      agentId:
        type: string
        description: which browser agent/session — required for every action
      label:
        type: string
        description: optional label for "snapshot"
      snapshotId:
        type: string
        description: required for "restore"
      limit:
        type: number
        description: for "list" — max snapshots to return (default 20)
    required:
      - action
