envelope: 1
uuid: nexus-export-tool-clear_glass_userscripts.d308bf2b-abe4-44fb-86ca-726c42276801
type: tool
id: clear_glass_userscripts.d308bf2b-abe4-44fb-86ca-726c42276801
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725023
source: lib/agent-tools
payload:
  name: clear_glass_userscripts
  description: >-
    Real userscript management for ClearGlass — the exact same UserscriptManager the Userscripts
    panel itself uses. "list" (optional agentId filter) returns every real script and its current
    enabled state. "enable"/"disable" (need scriptId, from a prior list call) toggle one script.
    Honestly fails — with a specific reason — if ClearGlass is not running or the scriptId does not
    exist, rather than a fabricated success.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - enable
          - disable
      agentId:
        type: string
        description: for "list" — filter to one agent, e.g. claude
      scriptId:
        type: string
        description: for "enable"/"disable" — a real script id from a prior list call
    required:
      - action
