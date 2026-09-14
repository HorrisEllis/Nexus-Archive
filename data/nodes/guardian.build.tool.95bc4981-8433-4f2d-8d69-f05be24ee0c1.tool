envelope: 1
uuid: nexus-export-tool-guardian.build.tool.95bc4981-8433-4f2d-8d69-f05be24ee0c1
type: tool
id: guardian.build.tool.95bc4981-8433-4f2d-8d69-f05be24ee0c1
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862120
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862120
lastSeenAt: 1789332862120
fingerprint: null
payload:
  name: guardian.build.tool
  description: >-
    Run a real spec through guardian's build pipeline (spec → scaffold → wiring → provider
    generation → files) via the real POST /build route. Pass either specPath (existing .spec file)
    or specText (inline spec). Honestly surfaces a RAID denial (403) or pipeline failure rather than
    pretending success.
  parameters:
    type: object
    properties:
      specPath:
        type: string
        description: path to an existing .spec file
      specText:
        type: string
        description: inline spec text, alternative to specPath
      name:
        type: string
        description: build name, used for default outputDir when specText is used
      outputDir:
        type: string
        description: optional explicit output directory
      provider:
        type: string
        description: default "ollama"
      dryRun:
        type: boolean
        description: default false
      verbose:
        type: boolean
        description: default false
      proof:
        type: string
        description: optional — proof payload for RAID's _approveTool gate
