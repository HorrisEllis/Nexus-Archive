envelope: 1
uuid: nexus-export-tool-cos_blueprint.4ab18144-99d4-4846-bbc1-1b0dafafe03b
type: tool
id: cos_blueprint.4ab18144-99d4-4846-bbc1-1b0dafafe03b
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725051
source: lib/agent-tools
payload:
  name: cos_blueprint
  description: >-
    Manage COS blueprints (reusable multi-compartment topology templates) and their instances.
    Actions: "list", "show" (needs idOrName), "create" (needs idOrName + instanceName — spawns a
    real compartment instance from a blueprint), "status" (needs instanceId), "destroy" (needs
    instanceId). Import from a file is deliberately not exposed — that's a file-system write left to
    the real CLI.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - show
          - create
          - status
          - destroy
      idOrName:
        type: string
        description: for "show"/"create" — the blueprint
      instanceName:
        type: string
        description: for "create" — name of the new compartment instance
      instanceId:
        type: string
        description: for "status"/"destroy"
    required:
      - action
