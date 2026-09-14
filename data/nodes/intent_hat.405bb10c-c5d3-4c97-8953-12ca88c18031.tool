envelope: 1
uuid: nexus-export-tool-intent_hat.405bb10c-c5d3-4c97-8953-12ca88c18031
type: tool
id: intent_hat.405bb10c-c5d3-4c97-8953-12ca88c18031
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862110
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862110
lastSeenAt: 1789332862110
fingerprint: null
payload:
  name: intent_hat
  description: >-
    Real, automatic intent-to-hat suggestion. Action "suggest" (needs prompt) classifies a message's
    real verb and reports which real hat (the_diagnostician/the_builder/the_auditor/the_librarian)
    it suggests, without switching anything — for a caller that wants to offer the switch rather
    than do it silently. The actual temporary switch-and-restore (withIntentHat) is a direct
    function call for a real dispatch path to wrap, not exposed as a tool action itself — a tool
    call can't hold the "restore after" guarantee across the caller's own dispatch the way a real
    function wrapper can.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - suggest
      prompt:
        type: string
    required:
      - action
      - prompt
