envelope: 1
uuid: nexus-export-tool-analyze.3334c8bc-eef4-481a-8eb4-d9dfbaa1e2da
type: tool
id: analyze.3334c8bc-eef4-481a-8eb4-d9dfbaa1e2da
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862033
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862033
lastSeenAt: 1789332862033
fingerprint: null
payload:
  name: analyze
  description: >-
    Deep analytical answer to a question about the system or a problem, using the analysis faculty
    (assembles context and reasons over it). Use for "why" and "how" questions that need reasoning,
    not just a lookup.
  parameters:
    type: object
    properties:
      question:
        type: string
        description: The question to analyze.
    required:
      - question
