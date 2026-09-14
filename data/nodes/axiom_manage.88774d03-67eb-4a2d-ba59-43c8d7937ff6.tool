envelope: 1
uuid: nexus-export-tool-axiom_manage.88774d03-67eb-4a2d-ba59-43c8d7937ff6
type: tool
id: axiom_manage.88774d03-67eb-4a2d-ba59-43c8d7937ff6
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
  name: axiom_manage
  description: >-
    Add, remove, freeze, list, or summarize NEXUS axioms — the mutation half of axiom access (use
    axiom_check to test something against them first). Actions: "list" (optional tier/status
    filter), "add" (needs id, text, reason — every agent-added axiom is tagged source:"agent", never
    blended with ones James added), "remove" (needs id, confirm:true), "freeze" (needs id — makes it
    immutable, irreversible by this tool), "summary".
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - add
          - remove
          - freeze
          - summary
      id:
        type: string
        description: for "add"/"remove"/"freeze"
      text:
        type: string
        description: for "add" — the axiom itself
      reason:
        type: string
        description: for "add" — required, why this axiom is needed
      tier:
        type: string
        description: for "add"/"list" — defaults to RUNTIME on add
      status:
        type: string
        description: for "list" — filter by status
      confirm:
        type: boolean
        description: for "remove" — required true, no accidental removal
    required:
      - action
