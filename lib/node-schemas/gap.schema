envelope: 1
uuid: nexus-export-schema-gap
type: schema
id: gap
context: lib/node-schemas — shared node-type schema registry
intent: null
summary: null
system: null
tags: []
exported_at: 1789116323997
source: nexus.lib.node-export
payload:
  status: REAL
  source: lib/gap-field.js — the real gap record construction
  fields:
    uuid:
      type: string
      required: true
      description: real gap id
    type:
      type: string
      required: true
      description: real gap type
    domain:
      type: string
      required: false
      description: real domain this gap belongs to
    body:
      type: string
      required: true
      description: real description of the gap
    source:
      type: string
      required: true
      description: real SYSTEM that logged this gap
    severity:
      type: string
      required: true
      description: real severity level
    status:
      type: string
      required: true
      description: starts 'open'
    causedBy:
      type: string
      required: false
      description: real causal chain reference
    dedup_key:
      type: string
      required: false
      description: real dedup key — repeated gaps bump occurrences instead of duplicating
    occurrences:
      type: number
      required: true
      description: real repeat counter, starts at 1
    component:
      type: string
      required: false
      description: the specific real loom-known thing inside `source`
    location:
      type: string
      required: false
      description: real file/location this gap concerns
    resourceState:
      type: any
      required: false
      description: real auto-captured resource state
    priority:
      type: number
      required: false
      description: real composite score from lib/gap-priority.js
