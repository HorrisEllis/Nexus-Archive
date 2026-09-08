envelope: 1
uuid: nexus-export-tool-delete_file.1d441d33-e323-42f3-b36b-31c37a5ee993
type: tool
id: delete_file.1d441d33-e323-42f3-b36b-31c37a5ee993
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725060
source: lib/agent-tools
payload:
  name: delete_file
  description: >-
    Delete a single file from the project by its path, relative to the project root. Requires
    confirm:true. Refuses directories and any path resolving outside the project root.
  parameters:
    type: object
    properties:
      path:
        type: string
        description: File path relative to the project root
      confirm:
        type: boolean
        description: must be true — no accidental delete
    required:
      - path
      - confirm
