envelope: 1
uuid: nexus-export-tool-safe_apply.02a39f5d-64f9-4590-a7e4-a047659f0955
type: tool
id: safe_apply.02a39f5d-64f9-4590-a7e4-a047659f0955
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862102
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862102
lastSeenAt: 1789332862102
fingerprint: null
payload:
  name: safe_apply
  description: >-
    Real verify-before-merge for proposed file changes — isolate, apply, check, and only merge if
    the check genuinely passes. Actions: "mirror" (needs targetDir — copies a real directory into a
    fresh isolated COS compartment, returns compartmentId), "propose" (needs compartmentId + files —
    a real branch is forked, changes applied to it ONLY, optionally run with entryFile as a real
    check — the real target is never touched here), "merge" (needs branchId + targetDir — writes the
    branch's changes into the REAL target, but refuses if the branch was never checked or failed its
    check; RAID-governed). Nothing reaches the real target except through a passing merge.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - mirror
          - propose
          - merge
      targetDir:
        type: string
        description: for "mirror"/"merge" — the real directory
      name:
        type: string
        description: for "mirror" — compartment name, optional
      compartmentId:
        type: string
        description: for "propose" — from a prior mirror
      files:
        type: object
        description: 'for "propose" — { "relative/path.js": "new full content" }'
      entryFile:
        type: string
        description: for "propose" — a real file to run as the check (e.g. the changed file itself)
      entryArgs:
        type: array
        items:
          type: string
        description: for "propose" — extra args to the entry file
      label:
        type: string
        description: for "propose" — human label for this branch
      branchId:
        type: string
        description: for "merge" — from a prior propose
      allowUncheckedMerge:
        type: boolean
        description: for "merge" — only if you genuinely want to merge an unchecked branch; refused by default
    required:
      - action
