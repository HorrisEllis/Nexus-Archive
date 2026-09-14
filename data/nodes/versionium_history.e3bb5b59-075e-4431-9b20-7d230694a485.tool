envelope: 1
uuid: nexus-export-tool-versionium_history.e3bb5b59-075e-4431-9b20-7d230694a485
type: tool
id: versionium_history.e3bb5b59-075e-4431-9b20-7d230694a485
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862111
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862111
lastSeenAt: 1789332862111
fingerprint: null
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
