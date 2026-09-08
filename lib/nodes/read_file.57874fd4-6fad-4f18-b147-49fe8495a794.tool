envelope: 1
uuid: nexus-export-tool-read_file.57874fd4-6fad-4f18-b147-49fe8495a794
type: tool
id: read_file.57874fd4-6fad-4f18-b147-49fe8495a794
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724927
source: lib/agent-tools
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
