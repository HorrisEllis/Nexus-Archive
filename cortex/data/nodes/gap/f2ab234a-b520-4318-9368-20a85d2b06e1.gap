envelope: 1
uuid: nexus-export-gap-f2ab234a-b520-4318-9368-20a85d2b06e1
type: gap
id: f2ab234a-b520-4318-9368-20a85d2b06e1
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822165
source: data/cortex/memory/gaps.json:f2ab234a-b520-4318-9368-20a85d2b06e1
payload:
  uuid: a6d9655d-6758-4aff-8aba-a41635aee184
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.seam.cos-seam-parser.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.lib.seam.cos-seam-parser
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.seam.cos-seam-parser
  occurrences: 1
  detectedAt: 1789169897137
  lastSeenAt: 1789169897137
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.seam.cos-seam-parser.export
    hookId: nexus.lib.seam.cos-seam-parser.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.seam.cos-seam-parser
  location: null
  error: null
  resourceState:
    ts: 1789169897137
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5756186624
      freeMemPct: 0.3366385088358928
      usedMemPct: 0.6633614911641073
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80416768
      heapUsed: 31146168
      heapTotal: 60952576
      heapUsedPct: 0.5109901835814126
      external: 2090575
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.seam.cos-seam-parser
  priority: 0.3925
  id: f2ab234a-b520-4318-9368-20a85d2b06e1
