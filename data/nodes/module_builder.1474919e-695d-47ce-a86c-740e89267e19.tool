envelope: 1
uuid: nexus-export-tool-module_builder.1474919e-695d-47ce-a86c-740e89267e19
type: tool
id: module_builder.1474919e-695d-47ce-a86c-740e89267e19
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862031
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862031
lastSeenAt: 1789332862031
fingerprint: null
payload:
  name: module_builder
  description: >-
    Build a new NEXUS module from a natural-language description, running the full spec → QC → build
    pipeline. Returns the build result. Use when the user wants to CREATE a new component or
    capability.
  parameters:
    type: object
    properties:
      description:
        type: string
        description: What the module should do, in plain language.
    required:
      - description
