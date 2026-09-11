envelope: 1
uuid: nexus-export-tool-intent_hat.6688e61c-bb2b-417e-9620-86f42f14796e
type: tool
id: intent_hat.6688e61c-bb2b-417e-9620-86f42f14796e
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725053
source: lib/agent-tools
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
