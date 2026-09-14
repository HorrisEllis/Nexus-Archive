envelope: 1
uuid: nexus-export-tool-loom_scan.d471f569-16dc-4d9e-94a5-18c63b12b8d1
type: tool
id: loom_scan.d471f569-16dc-4d9e-94a5-18c63b12b8d1
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862054
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862054
lastSeenAt: 1789332862054
fingerprint: null
payload:
  name: loom_scan
  description: >-
    Scan the real NEXUS tree to expand/diagnose the map — the "what actually exists" layer under
    nexus_status's summaries. Actions: "capabilities" (all declared routes across every
    registry-components.js, with version-collision duplicates flagged), "dangling" (require()/import
    paths pointing at nothing on disk, grouped by file), "specs" (parsed .spec files and where they
    diverge from the registry; pass checkRegistry:true for full coverage check — slower), "source"
    (raw source tree structure), "closed_door" (undeclared components — real code nobody
    registered), "stubs" (real TODO/FIXME/STUB/MOCK markers, throw-not-implemented bodies, and
    mock-named identifiers outside tests — pass includeTests:true to also scan test files),
    "mock_data" (real placeholder emails/names/lorem-ipsum/phone numbers — literal fake DATA,
    distinct from "stubs"' code shapes), "phasemap" (roadmap/phase state, optionally scoped to one
    system). Use before nexus_heal's "propose" so a proposed fix is grounded in a real finding, not
    a guess.
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
          - stubs
          - mock_data
          - phasemap
      checkRegistry:
        type: boolean
        description: for "specs" — also run the slower full registry-coverage check
      minLines:
        type: number
        description: for "closed_door" — minimum file size to flag (default 80)
      includeTests:
        type: boolean
        description: >-
          for "stubs"/"mock_data" — also scan test files (mock-named identifiers/placeholder data
          still excluded there by default per-signal, per each scanner's own design)
      system:
        type: string
        description: for "phasemap" — scope to one system
    required:
      - action
