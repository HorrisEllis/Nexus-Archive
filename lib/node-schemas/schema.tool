envelope: 1
uuid: nexus-export-schema-tool
type: schema
id: tool
context: lib/node-schemas — shared node-type schema registry
intent: null
summary: null
system: null
tags: []
exported_at: 1789116324012
source: nexus.lib.node-export
payload:
  status: REAL
  source: >-
    lib/agent-tools/tools/**/*.js — the real, universal tool export shape (checked against
    read-file.js)
  fields:
    name:
      type: string
      required: true
      description: real, unique tool name agents call by
    description:
      type: string
      required: true
      description: real, model-facing description
    parameters:
      type: object
      required: true
      description: real JSON-schema-shaped {type, properties, required}
    execute:
      type: any
      required: true
      description: the real async function — not serializable, present only in-process
