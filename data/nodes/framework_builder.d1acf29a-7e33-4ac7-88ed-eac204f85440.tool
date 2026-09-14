envelope: 1
uuid: nexus-export-tool-framework_builder.d1acf29a-7e33-4ac7-88ed-eac204f85440
type: tool
id: framework_builder.d1acf29a-7e33-4ac7-88ed-eac204f85440
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862092
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862092
lastSeenAt: 1789332862092
fingerprint: null
payload:
  name: framework_builder
  description: >-
    Generates a real, working WARP-based module skeleton (warp/core Gate/Axiom/Stream, syntactically
    correct and independently tested — not a template string that merely looks right) and drops it
    into intelligence/input/, the real, physical per-system queue folder. Needs "name" (becomes the
    file name and the createXxx() function name). Optional: "agent" (who asked for it),
    "description", "tags" (array). The generated file documents the real, currently-registered NEXUS
    tool vocabulary and points at the real chunker (lib/chunk-service.js) for oversized content —
    nothing fabricated, both pulled from the live registries at generation time.
  parameters:
    type: object
    properties:
      name:
        type: string
        description: the framework name — becomes the file name and function name
      agent:
        type: string
        description: which agent is asking for this
      description:
        type: string
      tags:
        type: array
        items:
          type: string
    required:
      - name
