envelope: 1
uuid: nexus-export-tool-stub_finder.c6858722-10c5-4a4d-a48a-938e7692ff95
type: tool
id: stub_finder.c6858722-10c5-4a4d-a48a-938e7692ff95
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862055
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862055
lastSeenAt: 1789332862055
fingerprint: null
payload:
  name: stub_finder
  description: >-
    Find real stubs, mocks, and placeholders left in the codebase —
    TODO/FIXME/STUB/MOCK/PLACEHOLDER/HACK comments, throw-new-Error("not implemented") bodies, and
    mock/stub/fake/dummy-named functions outside test files. Pattern matching over real source text,
    not static analysis — see the result's own caveat field for the honest limits. Pair with
    loom_scan's "closed_door" action (real code with zero external consumers) for the other real
    half of "is this actually built or just standing in for something real."
  parameters:
    type: object
    properties:
      dirs:
        type: array
        items:
          type: string
        description: >-
          real directories to scan, relative to project root — defaults to the same real system dirs
          loom/scanners/closed-door.js already scans
      includeTests:
        type: boolean
        description: >-
          also scan test files for markers/throw-not-implemented (mock-named identifiers stay
          excluded there by design regardless) — default false
