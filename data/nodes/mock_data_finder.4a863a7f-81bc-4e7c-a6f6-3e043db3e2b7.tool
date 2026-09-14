envelope: 1
uuid: nexus-export-tool-mock_data_finder.4a863a7f-81bc-4e7c-a6f6-3e043db3e2b7
type: tool
id: mock_data_finder.4a863a7f-81bc-4e7c-a6f6-3e043db3e2b7
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
  name: mock_data_finder
  description: >-
    Find real, literal placeholder/fake data left in the codebase — example.com/test.com/foo.com
    email addresses, "John Doe"/"Jane Doe"/"Foo Bar" stand-in names, lorem-ipsum text, and the
    reserved 555-01xx (or 123-456-7890) placeholder phone number patterns. Pattern matching over
    real source text, not data-flow tracing — see the result's own caveat field for the honest
    limits. Pair with stub_finder (code SHAPES that look fake) for the other real half of "is this
    actually real content."
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
          also scan test files — placeholder data there is expected and excluded by default, since a
          real test fixture legitimately uses it
