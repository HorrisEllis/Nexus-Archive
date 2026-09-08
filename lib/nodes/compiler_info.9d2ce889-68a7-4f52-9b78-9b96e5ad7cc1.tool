envelope: 1
uuid: nexus-export-tool-compiler_info.9d2ce889-68a7-4f52-9b78-9b96e5ad7cc1
type: tool
id: compiler_info.9d2ce889-68a7-4f52-9b78-9b96e5ad7cc1
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725051
source: lib/agent-tools
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
