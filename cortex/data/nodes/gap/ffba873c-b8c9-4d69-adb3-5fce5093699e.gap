envelope: 1
uuid: nexus-export-gap-ffba873c-b8c9-4d69-adb3-5fce5093699e
type: gap
id: ffba873c-b8c9-4d69-adb3-5fce5093699e
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822166
source: data/cortex/memory/gaps.json:ffba873c-b8c9-4d69-adb3-5fce5093699e
payload:
  uuid: 9142a039-4a9e-462f-b35c-57e2b8ee370a
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.loom.schema.concern.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.loom.schema.concern
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.loom.schema.concern
  occurrences: 1
  detectedAt: 1789169897140
  lastSeenAt: 1789169897140
  meta:
    kernelGapUuid: wire-integrity:nexus.loom.schema.concern.export
    hookId: nexus.loom.schema.concern.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.loom.schema.concern
  location: null
  error: null
  resourceState:
    ts: 1789169897140
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5754208256
      freeMemPct: 0.336522808130382
      usedMemPct: 0.6634771918696181
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80416768
      heapUsed: 31450888
      heapTotal: 60952576
      heapUsedPct: 0.5159894800836637
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.loom.schema.concern
  priority: 0.3925
  id: ffba873c-b8c9-4d69-adb3-5fce5093699e
