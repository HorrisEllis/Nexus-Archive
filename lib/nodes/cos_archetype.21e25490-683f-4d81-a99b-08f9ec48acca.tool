envelope: 1
uuid: nexus-export-tool-cos_archetype.21e25490-683f-4d81-a99b-08f9ec48acca
type: tool
id: cos_archetype.21e25490-683f-4d81-a99b-08f9ec48acca
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725050
source: lib/agent-tools
payload:
  name: cos_archetype
  description: >-
    Read, assign, detect, or create COS compartment archetypes (templates a compartment can be based
    on). Actions: "list", "show" (needs idOrName), "assign" (needs compartmentName +
    archetypeIdOrName — attaches an archetype to an existing compartment), "detect" (needs
    targetPath — inspects a real path and reports which archetype it matches, if any), "create"
    (needs archetype — an inline definition object with at least a name; registered directly, no
    file needed).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - show
          - assign
          - detect
          - create
      idOrName:
        type: string
        description: for "show"
      compartmentName:
        type: string
        description: for "assign"
      archetypeIdOrName:
        type: string
        description: for "assign"
      targetPath:
        type: string
        description: for "detect" — path relative to project root
      archetype:
        type: object
        description: for "create" — inline archetype definition, needs at least a name
    required:
      - action
