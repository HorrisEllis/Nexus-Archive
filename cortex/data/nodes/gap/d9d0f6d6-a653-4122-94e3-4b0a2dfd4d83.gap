envelope: 1
uuid: nexus-export-gap-d9d0f6d6-a653-4122-94e3-4b0a2dfd4d83
type: gap
id: d9d0f6d6-a653-4122-94e3-4b0a2dfd4d83
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822174
source: data/cortex/memory/gaps.json:d9d0f6d6-a653-4122-94e3-4b0a2dfd4d83
payload:
  uuid: 4a8e608d-e5d5-44e1-aa2d-9f723198356d
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-gm-shim-sse-streaming.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-gm-shim-sse-streaming
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-gm-shim-sse-streaming
  occurrences: 1
  detectedAt: 1789169897179
  lastSeenAt: 1789169897179
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-gm-shim-sse-streaming.import
    hookId: nexus.tests.modules.test-gm-shim-sse-streaming.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-gm-shim-sse-streaming
  location: null
  error: null
  resourceState:
    ts: 1789169897179
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5750149120
      freeMemPct: 0.33628541807000684
      usedMemPct: 0.6637145819299932
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82501632
      heapUsed: 34074576
      heapTotal: 60952576
      heapUsedPct: 0.5590342235904845
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-gm-shim-sse-streaming
  priority: 0.3925
  id: d9d0f6d6-a653-4122-94e3-4b0a2dfd4d83
