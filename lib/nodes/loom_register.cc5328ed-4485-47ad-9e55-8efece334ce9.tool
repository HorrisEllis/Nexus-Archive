envelope: 1
uuid: nexus-export-tool-loom_register.cc5328ed-4485-47ad-9e55-8efece334ce9
type: tool
id: loom_register.cc5328ed-4485-47ad-9e55-8efece334ce9
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725052
source: lib/agent-tools
payload:
  name: loom_register
  description: >-
    Register a real new component, hook+wire, or concern into loom's live registry. Actions:
    "component" (needs component: {id, name?, dir?, consumes?, produces?}), "hook_with_wire" (needs
    hook: {id, component_id, type, direction} AND consumerHookId — an already-real hook this one
    wires into; REFUSED if consumerHookId doesn't already exist, so a hook can never be registered
    without a real consumer), "concern" (needs concern: {id, ...} — a roadmap/gap entry, no consumer
    required, this is the mechanism nexus_status's "concerns" action reads from).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - component
          - hook_with_wire
          - concern
      component:
        type: object
        description: for "component"
      hook:
        type: object
        description: for "hook_with_wire" — {id, component_id, type, direction}
      consumerHookId:
        type: string
        description: for "hook_with_wire" — REQUIRED, must already exist
      wireId:
        type: string
        description: for "hook_with_wire" — optional, auto-generated if omitted
      intent:
        type: string
        description: for "hook_with_wire" — why this wire exists
      concern:
        type: object
        description: for "concern"
    required:
      - action
