envelope: 1
uuid: nexus-export-tool-cos_compartment.36ba9ebc-046a-447b-af00-f32b03afdd3b
type: tool
id: cos_compartment.36ba9ebc-046a-447b-af00-f32b03afdd3b
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862065
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862065
lastSeenAt: 1789332862065
fingerprint: null
payload:
  name: cos_compartment
  description: >-
    Create, start, stop, destroy, list, or check status of a real COS (Compartment OS) compartment —
    an isolated sandbox with its own process/network/runtime boundary. Also real file operations
    SCOPED TO A SPECIFIC COMPARTMENT (never the wider project): "listFiles" (needs name), "readFile"
    (needs name, file), "writeFile" (needs name, file, content — creates or replaces the file, real
    and persistent). Lifecycle actions: "create" (needs name, optional
    purpose/runtimeId/networkIsolated), "start"/"stop"/"destroy" (need name; destroy takes optional
    force/wipe), "list", "status" (needs name). Real, persistent state on disk — not a dry run.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - create
          - start
          - stop
          - destroy
          - list
          - status
          - listFiles
          - readFile
          - writeFile
      name:
        type: string
        description: compartment name — required for all actions except list
      purpose:
        type: string
        description: for "create" — what this compartment is for
      runtimeId:
        type: string
        description: for "create" — runtime override
      networkIsolated:
        type: boolean
        description: for "create" — default true
      force:
        type: boolean
        description: for "destroy"
      wipe:
        type: boolean
        description: for "destroy" — also remove data on disk
      file:
        type: string
        description: for "readFile"/"writeFile" — a real path relative to the compartment root
      content:
        type: string
        description: for "writeFile" — the real, full new content of the file
    required:
      - action
