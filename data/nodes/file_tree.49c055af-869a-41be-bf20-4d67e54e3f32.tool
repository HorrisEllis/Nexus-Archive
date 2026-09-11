envelope: 1
uuid: nexus-export-tool-file_tree.49c055af-869a-41be-bf20-4d67e54e3f32
type: tool
id: file_tree.49c055af-869a-41be-bf20-4d67e54e3f32
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725050
source: lib/agent-tools
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
