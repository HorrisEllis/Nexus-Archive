envelope: 1
uuid: nexus-export-gap-8e82442a-f9fd-4269-8f95-d4b7d3130d07
type: gap
id: 8e82442a-f9fd-4269-8f95-d4b7d3130d07
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822174
source: data/cortex/memory/gaps.json:8e82442a-f9fd-4269-8f95-d4b7d3130d07
payload:
  uuid: e30d4fd0-5fb3-49ef-af79-c32eee72dac9
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-raid-processnext-am1-gate.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-raid-processnext-am1-gate
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-raid-processnext-am1-gate
  occurrences: 1
  detectedAt: 1789169897180
  lastSeenAt: 1789169897180
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-raid-processnext-am1-gate.import
    hookId: nexus.tests.modules.test-raid-processnext-am1-gate.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-raid-processnext-am1-gate
  location: null
  error: null
  resourceState:
    ts: 1789169897180
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
      rss: 82538496
      heapUsed: 34158728
      heapTotal: 60952576
      heapUsedPct: 0.5604148379225187
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-raid-processnext-am1-gate
  priority: 0.3925
  id: 8e82442a-f9fd-4269-8f95-d4b7d3130d07
