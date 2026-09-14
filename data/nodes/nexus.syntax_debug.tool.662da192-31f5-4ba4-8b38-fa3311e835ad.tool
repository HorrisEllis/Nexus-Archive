envelope: 1
uuid: nexus-export-tool-nexus.syntax_debug.tool.662da192-31f5-4ba4-8b38-fa3311e835ad
type: tool
id: nexus.syntax_debug.tool.662da192-31f5-4ba4-8b38-fa3311e835ad
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862123
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862123
lastSeenAt: 1789332862123
fingerprint: null
payload:
  name: nexus.syntax_debug.tool
  description: >-
    Scan a subtree for real JS syntax errors via `node --check` (same mechanism
    scripts/precommit-check.js uses for staged files, applied here to an arbitrary scope). Returns
    ONLY files that fail, with the real error — a clean subtree returns an explicit pass, not
    silence.
  parameters:
    type: object
    properties:
      scope:
        type: string
        default: .
        description: subdirectory to scan, relative to repo root
      maxFiles:
        type: number
        default: 500
        description: safety cap on how many files to check in one call
