envelope: 1
uuid: nexus-export-tool-compiler_info.584137ff-990d-443f-b0d4-1c3eaa081e37
type: tool
id: compiler_info.584137ff-990d-443f-b0d4-1c3eaa081e37
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862109
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862109
lastSeenAt: 1789332862109
fingerprint: null
payload:
  name: compiler_info
  description: >-
    Look up COS's known compilers/bundlers and the config file each is identified by. Actions:
    "list" (all 18, with configFile), "get" (needs id — one compiler's detail). Read-only reference
    data; does not run a build — no real "compile" execution gate exists anywhere in COS to call.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - get
      id:
        type: string
        description: for "get" — a compiler id, e.g. "tsc", "webpack", "cargo"
    required:
      - action
