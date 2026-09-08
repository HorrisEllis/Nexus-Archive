envelope: 1
uuid: nexus-export-tool-cos_playground.31242923-a812-4d91-9275-f036c428cc26
type: tool
id: cos_playground.31242923-a812-4d91-9275-f036c428cc26
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725051
source: lib/agent-tools
payload:
  name: cos_playground
  description: >-
    Create, list, check status of, promote, or destroy a COS playground — a disposable isolated
    compartment meant for trying something before committing to it. Actions: "create" (needs name,
    optional networkMode), "list", "status" (needs idOrName), "destroy" (needs idOrName), "promote"
    (needs compartmentId — turns a playground that worked into a real permanent compartment).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - create
          - list
          - status
          - destroy
          - promote
      name:
        type: string
        description: for "create"
      networkMode:
        type: string
        description: for "create" — optional network mode override
      idOrName:
        type: string
        description: for "status"/"destroy"
      compartmentId:
        type: string
        description: for "promote"
    required:
      - action
