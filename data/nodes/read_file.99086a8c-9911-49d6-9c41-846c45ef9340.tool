envelope: 1
uuid: nexus-export-tool-read_file.99086a8c-9911-49d6-9c41-846c45ef9340
type: tool
id: read_file.99086a8c-9911-49d6-9c41-846c45ef9340
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862016
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862016
lastSeenAt: 1789332862016
fingerprint: null
payload:
  name: read_file
  description: >-
    Read a text file from the project by its path, relative to the project root. Returns the file
    content as plain text.
  parameters:
    type: object
    properties:
      path:
        type: string
        description: File path relative to the project root, e.g. "lib/seam/gates.js"
    required:
      - path
