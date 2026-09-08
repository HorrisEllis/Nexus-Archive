envelope: 1
uuid: nexus-export-tool-loom_scan.dbad43f1-88b6-4abf-a63b-1a4ba5e7ddbf
type: tool
id: loom_scan.dbad43f1-88b6-4abf-a63b-1a4ba5e7ddbf
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724975
source: lib/agent-tools
payload:
  name: loom_scan
  description: >-
    Scan the real NEXUS tree to expand/diagnose the map — the "what actually exists" layer under
    nexus_status's summaries. Actions: "capabilities" (all declared routes across every
    registry-components.js, with version-collision duplicates flagged), "dangling" (require()/import
    paths pointing at nothing on disk, grouped by file), "specs" (parsed .spec files and where they
    diverge from the registry; pass checkRegistry:true for full coverage check — slower), "source"
    (raw source tree structure), "closed_door" (undeclared components — real code nobody
    registered), "phasemap" (roadmap/phase state, optionally scoped to one system). Use before
    nexus_heal's "propose" so a proposed fix is grounded in a real finding, not a guess.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - capabilities
          - dangling
          - specs
          - source
          - closed_door
          - phasemap
      checkRegistry:
        type: boolean
        description: for "specs" — also run the slower full registry-coverage check
      minLines:
        type: number
        description: for "closed_door" — minimum file size to flag (default 80)
      system:
        type: string
        description: for "phasemap" — scope to one system
    required:
      - action
