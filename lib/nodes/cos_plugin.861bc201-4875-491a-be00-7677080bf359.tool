envelope: 1
uuid: nexus-export-tool-cos_plugin.861bc201-4875-491a-be00-7677080bf359
type: tool
id: cos_plugin.861bc201-4875-491a-be00-7677080bf359
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725051
source: lib/agent-tools
payload:
  name: cos_plugin
  description: >-
    Read or manage the lifecycle of an already-existing COS plugin. Actions: "list", "show" (needs
    idOrName), "enable" (needs idOrName), "disable" (needs idOrName), "remove" (needs idOrName).
    Scaffolding brand-new plugin source is deliberately not exposed here.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - show
          - enable
          - disable
          - remove
      idOrName:
        type: string
        description: required for every action except "list"
    required:
      - action
