envelope: 1
uuid: nexus-export-tool-clear_glass_command_index.4cbfce4d-e3fd-40e5-9187-5c6836a3fd15
type: tool
id: clear_glass_command_index.4cbfce4d-e3fd-40e5-9187-5c6836a3fd15
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862096
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862096
lastSeenAt: 1789332862096
fingerprint: null
payload:
  name: clear_glass_command_index
  description: >-
    Full compatibility with every real ClearGlass command via its live, self-updating command index
    — never hardcoded, always reflects what ClearGlass actually has running right now. Use discover
    to see what is available (optionally filtered by a path fragment like "history" or
    "userscripts"), then call to actually invoke one.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - discover
          - call
        description: 'discover: list real, live commands. call: invoke one directly.'
      query:
        type: string
        description: discover only — filter commands by a path fragment or HTTP method
      method:
        type: string
        description: call only — the real HTTP method (GET/POST/PUT/PATCH/DELETE)
      path:
        type: string
        description: call only — the real path, e.g. "/cli/history" or "/cli/macros/my-macro/run"
      body:
        type: object
        description: call only — the real JSON body for POST/PUT/PATCH calls
    required:
      - action
