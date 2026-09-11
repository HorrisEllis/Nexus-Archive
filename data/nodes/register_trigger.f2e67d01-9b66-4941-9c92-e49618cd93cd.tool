envelope: 1
uuid: nexus-export-tool-register_trigger.f2e67d01-9b66-4941-9c92-e49618cd93cd
type: tool
id: register_trigger.f2e67d01-9b66-4941-9c92-e49618cd93cd
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724974
source: lib/agent-tools
payload:
  name: register_trigger
  description: >-
    Register a "when X, do Y" condition→action binding: fires when an event of a given type lands on
    the fan-in (condition.type "event", matchType exact or "prefix." ) or when a numeric predicate
    holds (condition.type "metric"). RAID-governed and cortex-persisted, same as schedule_task.
    Actions: "register" (needs condition + target), "disarm" (needs id), "list", "get" (needs id).
    Defaults to firing once — pass once:false with maxFires for a bounded repeating trigger.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - register
          - disarm
          - list
          - get
      id:
        type: string
        description: trigger id — required for disarm/get
      name:
        type: string
      condition:
        type: object
        description: '{ type: "event"|"metric", matchType?, source? } — the fan-in filter'
      target:
        type: object
        description: '{ kind: "agent"|"system"|"command", id, payload }'
      once:
        type: boolean
        description: default true — fire once then disarm
      maxFires:
        type: number
        description: cap on repeats when once=false (default Infinity)
      intent:
        type: string
        description: RAID intent label
      status:
        type: string
        description: filter for "list"
    required:
      - action
