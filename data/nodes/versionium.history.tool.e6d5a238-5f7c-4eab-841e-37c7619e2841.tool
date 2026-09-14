envelope: 1
uuid: nexus-export-tool-versionium.history.tool.e6d5a238-5f7c-4eab-841e-37c7619e2841
type: tool
id: versionium.history.tool.e6d5a238-5f7c-4eab-841e-37c7619e2841
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862122
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862122
lastSeenAt: 1789332862122
fingerprint: null
payload:
  name: versionium.history.tool
  description: >-
    Read versionium's real commit history — either action:"log" (optionally filtered by system) or
    action:"calendar" for all commits on a given date (YYYY-MM-DD).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - log
          - calendar
        description: log (default) or calendar
      system:
        type: string
        description: optional filter for action:"log" — e.g. "guardian"
      date:
        type: string
        description: required for action:"calendar" — YYYY-MM-DD
