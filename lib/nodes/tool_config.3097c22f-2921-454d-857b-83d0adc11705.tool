envelope: 1
uuid: nexus-export-tool-tool_config.3097c22f-2921-454d-857b-83d0adc11705
type: tool
id: tool_config.3097c22f-2921-454d-857b-83d0adc11705
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725061
source: lib/agent-tools
payload:
  name: tool_config
  description: >-
    Read and change the configuration of NEXUS tools. Actions: "list" (every configured tool), "get"
    (one tool's effective config — unconfigured tools report their defaults), "history" (every
    change to a tool, with who and why), "disable" (needs tool + reason), "enable" (needs tool),
    "require_confirm" (needs tool + reason), "set_defaults" (needs tool + defaults and/or notes),
    "restrict" (needs tool + agents array + reason). TIGHTENING a config — disabling, requiring
    confirmation, narrowing which agents may use a tool — applies immediately. LOOSENING — enabling,
    widening — returns a proposal for James to confirm, because an agent that can grant itself
    capability has no gate at all. Say so plainly when it happens.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - get
          - history
          - disable
          - enable
          - require_confirm
          - set_defaults
          - restrict
      tool:
        type: string
        description: the tool being configured
      reason:
        type: string
        description: why — required for every tightening change
      defaults:
        type: object
        description: for "set_defaults" — argument defaults, merged UNDER caller arguments
      notes:
        type: string
        description: for "set_defaults"
      agents:
        type: array
        items:
          type: string
        description: for "restrict"
    required:
      - action
