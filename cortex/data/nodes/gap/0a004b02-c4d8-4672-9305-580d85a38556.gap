envelope: 1
uuid: nexus-export-gap-0a004b02-c4d8-4672-9305-580d85a38556
type: gap
id: 0a004b02-c4d8-4672-9305-580d85a38556
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822139
source: data/cortex/memory/gaps.json:0a004b02-c4d8-4672-9305-580d85a38556
payload:
  uuid: decbf864-3d6f-4f3b-ab72-b6c1bbe35210
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.gap-priority.import' is declared as an INPUT but no wire ever targets it — dead
    code, or a caller that was never wired
  source: nexus.lib.gap-priority
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.gap-priority
  occurrences: 1
  detectedAt: 1789169836950
  lastSeenAt: 1789169836950
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.gap-priority.import
    hookId: nexus.lib.gap-priority.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.gap-priority
  location: null
  error: null
  resourceState:
    ts: 1789169836950
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7326687232
      freeMemPct: 0.4284859448795132
      usedMemPct: 0.5715140551204868
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100868096
      heapUsed: 51108808
      heapTotal: 71483392
      heapUsedPct: 0.7149745775913935
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.gap-priority
  priority: 0.3925
  id: 0a004b02-c4d8-4672-9305-580d85a38556
