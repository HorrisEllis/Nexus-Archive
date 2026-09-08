envelope: 1
uuid: nexus-export-tool-spec_wizard.a50028c1-f073-4624-94da-79bdc902310c
type: tool
id: spec_wizard.a50028c1-f073-4624-94da-79bdc902310c
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724976
source: lib/agent-tools
payload:
  name: spec_wizard
  description: >-
    Walk someone through building a real, compiled .spec file using idearium's real spec-engine —
    the 10 real dimensions (meta, purpose, axioms, schema, api, events, integration, failure_modes,
    build_order, tests), one at a time. Typical flow: "list_templates" to show options,
    "wizard_question" repeatedly (passing back specMeta/answeredSections each time) until done:true
    for the first 6 dimensions, then "create" to start the real build, then loop "next_dimension" ->
    ask the person -> "answer_dimension" with their real answer, until progress reaches 100 — the
    real spec auto-compiles the moment the last dimension completes, no separate finish step.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list_templates
          - wizard_question
          - create
          - status
          - next_dimension
          - answer_dimension
      name:
        type: string
        description: for "create"
      type:
        type: string
        description: for "create" — component/service/engine/bridge/agent/system/codebase/library
      description:
        type: string
        description: for "create"
      agent:
        type: string
        description: for "create" — which agent builds unanswered chunks
      templateId:
        type: string
        description: for "create" — optional, seeds some dimensions deterministically
      specMeta:
        type: object
        description: for "wizard_question" — what's been gathered so far
      answeredSections:
        type: object
        description: 'for "wizard_question" — {sectionId: answer} already given'
      specUuid:
        type: string
        description: for "status"/"next_dimension"/"answer_dimension"
      chunkUuid:
        type: string
        description: for "answer_dimension"
      content:
        type: string
        description: for "answer_dimension" — the real content for that dimension
    required:
      - action
