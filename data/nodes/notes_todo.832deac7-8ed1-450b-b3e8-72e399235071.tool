envelope: 1
uuid: nexus-export-tool-notes_todo.832deac7-8ed1-450b-b3e8-72e399235071
type: tool
id: notes_todo.832deac7-8ed1-450b-b3e8-72e399235071
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862110
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862110
lastSeenAt: 1789332862110
fingerprint: null
payload:
  name: notes_todo
  description: >-
    A real, persistent notes and to-do list. Actions: "add" (needs text; kind: "note" or "todo",
    default "note"; optional tags), "list" (optional kind/done filter), "complete" (needs uuid —
    marks a todo done), "delete" (needs uuid).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - add
          - list
          - complete
          - delete
      text:
        type: string
        description: for "add"
      kind:
        type: string
        enum:
          - note
          - todo
        description: for "add"/"list"
      tags:
        type: array
        items:
          type: string
        description: for "add"
      done:
        type: boolean
        description: for "list" — filter by completion
      uuid:
        type: string
        description: for "complete"/"delete"
    required:
      - action
