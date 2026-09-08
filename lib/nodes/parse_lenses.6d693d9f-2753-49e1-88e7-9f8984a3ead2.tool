envelope: 1
uuid: nexus-export-tool-parse_lenses.6d693d9f-2753-49e1-88e7-9f8984a3ead2
type: tool
id: parse_lenses.6d693d9f-2753-49e1-88e7-9f8984a3ead2
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724963
source: lib/agent-tools
payload:
  name: parse_lenses
  description: >-
    Read one input through several independent lenses at once and contrast them: liminal (12 gap
    detectors), axioms (constitutional check), edge-cases (known per-system failures), sigma
    (deviation from field baseline), shape (structural markers like empty catch blocks). Each lens
    returns FINDING, ABSTAIN, UNAVAILABLE or ERROR — a lens that could not run is never reported as
    clean. Use action "list" to see the lenses, "parse" for the readings, "contrast" for the verdict
    (recommended: it names where the lenses disagree and where one fired alone).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - list
          - parse
          - contrast
      input:
        type: string
        description: the text, code, or message to read
      lenses:
        type: array
        items:
          type: string
        description: subset by name; default all
      system:
        type: string
        description: system context for the edge-cases lens
    required:
      - action
