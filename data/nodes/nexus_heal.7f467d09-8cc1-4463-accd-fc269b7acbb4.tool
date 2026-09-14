envelope: 1
uuid: nexus-export-tool-nexus_heal.7f467d09-8cc1-4463-accd-fc269b7acbb4
type: tool
id: nexus_heal.7f467d09-8cc1-4463-accd-fc269b7acbb4
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862051
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862051
lastSeenAt: 1789332862051
fingerprint: null
payload:
  name: nexus_heal
  description: >-
    Propose and track fixes for gaps/diagnostics found elsewhere in NEXUS. Actions: "propose" (needs
    text describing the fix, optional causedBy naming the evidence), "list" (open proposals),
    "evaluate" (needs id, optional targetFile — checks a proposal against real code before it can be
    merged). merge/archive are NOT exposed — nexus-healer's own handlers for those are unfinished
    stubs; calling them would report success for something that did not happen.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - propose
          - list
          - evaluate
      text:
        type: string
        description: proposal text — required for propose
      causedBy:
        type: string
        description: what evidence/gap this proposal addresses
      id:
        type: string
        description: proposal id — required for evaluate
      targetFile:
        type: string
        description: file the proposal targets, for evaluate
    required:
      - action
