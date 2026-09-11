envelope: 1
uuid: nexus-export-tool-search_files.a995d9b4-ae20-4e47-8639-3793db8f239b
type: tool
id: search_files.a995d9b4-ae20-4e47-8639-3793db8f239b
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725050
source: lib/agent-tools
payload:
  name: search_files
  description: >-
    Search real file content for a keyword, or real file names by pattern. Returns matching files
    with the matching line(s) for a content search, or just paths for a filename search. Bounded
    (max 3000 files scanned, max 200 matches) and root-contained — cannot read outside the project.
  parameters:
    type: object
    properties:
      keyword:
        type: string
        description: a real string to search file CONTENT for (case-insensitive)
      filenamePattern:
        type: string
        description: a real substring to match against file NAMES instead of content
      dir:
        type: string
        description: optional, real subdirectory to scope the search to; defaults to the whole project
