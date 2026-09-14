envelope: 1
uuid: nexus-export-tool-axiom_check.55dab21b-2e64-4573-ae9c-45a9c7c48317
type: tool
id: axiom_check.55dab21b-2e64-4573-ae9c-45a9c7c48317
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862032
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862032
lastSeenAt: 1789332862032
fingerprint: null
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
