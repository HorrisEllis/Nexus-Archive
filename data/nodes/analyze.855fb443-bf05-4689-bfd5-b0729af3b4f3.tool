envelope: 1
uuid: nexus-export-tool-analyze.855fb443-bf05-4689-bfd5-b0729af3b4f3
type: tool
id: analyze.855fb443-bf05-4689-bfd5-b0729af3b4f3
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724948
source: lib/agent-tools
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
