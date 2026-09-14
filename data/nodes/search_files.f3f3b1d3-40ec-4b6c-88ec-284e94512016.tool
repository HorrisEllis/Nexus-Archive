envelope: 1
uuid: nexus-export-tool-search_files.f3f3b1d3-40ec-4b6c-88ec-284e94512016
type: tool
id: search_files.f3f3b1d3-40ec-4b6c-88ec-284e94512016
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862107
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862107
lastSeenAt: 1789332862107
fingerprint: null
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
