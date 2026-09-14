envelope: 1
uuid: nexus-export-tool-schedule_task.965d0dc2-3c23-4c07-904f-462ad11de4bd
type: tool
id: schedule_task.965d0dc2-3c23-4c07-904f-462ad11de4bd
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862048
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862048
lastSeenAt: 1789332862048
fingerprint: null
payload:
  name: schedule_task
  description: >-
    Schedule a task to fire once at a time or on a repeating interval, delivering a payload to an
    agent, system, or command. Every fire is RAID-governed (a denied action logs, it does not run)
    and persisted to cortex so it survives a restart. Actions: "schedule" (needs target + one of
    at/inMs/everyMs), "cancel" (needs id), "list" (optionally filter by status), "get" (needs id).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - schedule
          - cancel
          - list
          - get
      id:
        type: string
        description: task id — required for cancel/get
      name:
        type: string
        description: human-readable task name
      at:
        type: number
        description: fire once at this epoch ms
      inMs:
        type: number
        description: fire once after this delay in ms
      everyMs:
        type: number
        description: fire repeatedly on this interval in ms
      maxRuns:
        type: number
        description: 'cap on repeat fires (default: 1 for one-shot, Infinity for interval)'
      target:
        type: object
        description: '{ kind: "agent"|"system"|"command", id, payload } — what fires'
      intent:
        type: string
        description: RAID intent label; defaults to scheduled.<kind>
      status:
        type: string
        description: 'filter for "list": scheduled | cancelled | denied | ...'
    required:
      - action
