envelope: 1
uuid: nexus-export-tool-versionium_history.bea686c8-3d84-4bb2-9741-f1810945a9a9
type: tool
id: versionium_history.bea686c8-3d84-4bb2-9741-f1810945a9a9
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725060
source: lib/agent-tools
payload:
  name: versionium_history
  description: >-
    Read real Versionium commit history, optionally filtered by system — the live source for "what
    changed in system X" and for a spec's version_history: section (LM1).
  parameters:
    type: object
    properties:
      system:
        type: string
        description: optional — filter to commits for this system
