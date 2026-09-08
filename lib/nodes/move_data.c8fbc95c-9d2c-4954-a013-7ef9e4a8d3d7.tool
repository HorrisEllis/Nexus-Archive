envelope: 1
uuid: nexus-export-tool-move_data.c8fbc95c-9d2c-4954-a013-7ef9e4a8d3d7
type: tool
id: move_data.c8fbc95c-9d2c-4954-a013-7ef9e4a8d3d7
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724935
source: lib/agent-tools
payload:
  name: move_data
  description: >-
    Move data in/out of Cortex (NEXUS's memory). Actions: "push" (store content with tags into a
    memory tier: recent/session/long), "recall" (retrieve memories by intent/query), "read" (tail
    the last N rows of a named table, e.g. chat_log, event_log, gaps), "insert" (write a raw row
    into a named table). There is deliberately no delete — nothing is lost, ever.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - push
          - recall
          - read
          - insert
        description: Which memory operation
      content:
        type: string
        description: 'For push: the text content to store'
      tags:
        type: array
        items:
          type: string
        description: 'For push: tags for later recall'
      tier:
        type: string
        description: 'For push: memory tier (recent, session, long); recall: optional tier filter'
      intent:
        type: string
        description: 'For recall: what you are trying to remember/find'
      query:
        type: string
        description: 'For recall: optional keyword query'
      table:
        type: string
        description: 'For read/insert: table name (chat_log, event_log, gaps, ...)'
      'n':
        type: number
        description: 'For read: how many rows (default 10)'
      row:
        type: object
        description: 'For insert: the row object to write'
    required:
      - action
