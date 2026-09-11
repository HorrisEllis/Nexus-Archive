envelope: 1
uuid: nexus-export-tool-nexus_heal.c89bf97b-0ac7-42e3-b801-0afeba610860
type: tool
id: nexus_heal.c89bf97b-0ac7-42e3-b801-0afeba610860
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724975
source: lib/agent-tools
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
