envelope: 1
uuid: nexus-export-tool-delete_file.54cd4d26-5955-495c-8ce2-eb6bca484fa8
type: tool
id: delete_file.54cd4d26-5955-495c-8ce2-eb6bca484fa8
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862111
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862111
lastSeenAt: 1789332862111
fingerprint: null
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
