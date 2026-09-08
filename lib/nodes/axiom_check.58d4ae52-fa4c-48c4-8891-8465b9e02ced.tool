envelope: 1
uuid: nexus-export-tool-axiom_check.58d4ae52-fa4c-48c4-8891-8465b9e02ced
type: tool
id: axiom_check.58d4ae52-fa4c-48c4-8891-8465b9e02ced
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724943
source: lib/agent-tools
payload:
  name: axiom_check
  description: >-
    Check a prompt, spec, or proposed action against the NEXUS axioms. Returns which axioms are
    engaged and any violations. Use before acting on something consequential.
  parameters:
    type: object
    properties:
      text:
        type: string
        description: The prompt, spec, or action description to check against the axioms.
    required:
      - text
