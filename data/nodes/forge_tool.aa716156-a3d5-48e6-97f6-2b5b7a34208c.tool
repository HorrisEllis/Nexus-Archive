envelope: 1
uuid: nexus-export-tool-forge_tool.aa716156-a3d5-48e6-97f6-2b5b7a34208c
type: tool
id: forge_tool.aa716156-a3d5-48e6-97f6-2b5b7a34208c
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724964
source: lib/agent-tools
payload:
  name: forge_tool
  description: >-
    Create your own tools. A forged tool is a NAME + JSON-schema + STEPS that bind to things that
    already exist: "capability:<id>" (any of the 239 verified-served capabilities), "lens:<name>",
    or "tool:<name>". It is data, not code — nothing new executes, so a forged tool can only package
    what you could already do into one repeatable call. Actions: "schema" (read the contract and an
    example — start here), "validate" (check a definition without creating it), "forge" (create and
    register), "list", "revoke", "reload". Every step is verified BEFORE the tool exists; a step
    naming an unserved capability or an unknown lens is refused with the step number.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - schema
          - validate
          - forge
          - list
          - revoke
          - reload
      definition:
        type: object
        description: '{ name, description, parameters, steps } — see action "schema"'
      name:
        type: string
        description: for revoke
      intent:
        type: string
        description: why you are forging this — recorded with the tool
      forgedBy:
        type: string
    required:
      - action
