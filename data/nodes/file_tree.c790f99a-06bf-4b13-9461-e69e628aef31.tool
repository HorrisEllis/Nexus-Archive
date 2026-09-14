envelope: 1
uuid: nexus-export-tool-file_tree.c790f99a-06bf-4b13-9461-e69e628aef31
type: tool
id: file_tree.c790f99a-06bf-4b13-9461-e69e628aef31
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862104
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862104
lastSeenAt: 1789332862104
fingerprint: null
payload:
  name: file_tree
  description: >-
    List files and directories under a path in the project, relative to the project root,
    recursively up to a max depth. Use this to discover what exists before calling read_file on a
    specific path.
  parameters:
    type: object
    properties:
      path:
        type: string
        description: Directory path relative to the project root. Omit or use "." for the project root.
      maxDepth:
        type: integer
        description: How many directory levels to recurse. Default 3.
