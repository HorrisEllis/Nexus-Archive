envelope: 1
uuid: nexus-export-tool-versionium_commit.735d8dc2-8066-4277-906d-b5c795d74144
type: tool
id: versionium_commit.735d8dc2-8066-4277-906d-b5c795d74144
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
  name: versionium_commit
  description: >-
    Commit the current state via Versionium (message required, optional branch/causedBy/system).
    Real temporal replay (versionium_restore) and calendar playback also exist as of 2026-09-01 —
    this is no longer the only real capability. Branch-switching is still unbuilt.
  parameters:
    type: object
    properties:
      message:
        type: string
        description: required — what this commit represents
      branch:
        type: string
        description: optional, defaults to "main"
      causedBy:
        type: string
        description: optional — what triggered this commit
      system:
        type: string
        description: >-
          optional — which system this commit is for (e.g. "guardian", "ollama-bridge"), for
          per-system version history
    required:
      - message
