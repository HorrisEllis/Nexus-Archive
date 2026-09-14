envelope: 1
uuid: nexus-export-tool-cos_blueprint.31c35669-0da8-42f4-8381-9f299e80b424
type: tool
id: cos_blueprint.31c35669-0da8-42f4-8381-9f299e80b424
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862107
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862107
lastSeenAt: 1789332862107
fingerprint: null
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
