envelope: 1
uuid: nexus-export-gap-1a42bd2b-1694-4c1b-b00d-309391db657a
type: gap
id: 1a42bd2b-1694-4c1b-b00d-309391db657a
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822175
source: data/cortex/memory/gaps.json:1a42bd2b-1694-4c1b-b00d-309391db657a
payload:
  uuid: bd470032-2f8f-4676-b04d-22ad8a1f8590
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.tool-call-listener.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.tool-call-listener.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.tool-call-listener.test
  occurrences: 1
  detectedAt: 1789169897184
  lastSeenAt: 1789169897184
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.tool-call-listener.test.import
    hookId: nexus.tests.modules.tool-call-listener.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.tool-call-listener.test
  location: null
  error: null
  resourceState:
    ts: 1789169897184
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749886976
      freeMemPct: 0.3362700871276617
      usedMemPct: 0.6637299128723383
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82878464
      heapUsed: 34493048
      heapTotal: 60952576
      heapUsedPct: 0.5658997578707748
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.tool-call-listener.test
  priority: 0.3925
  id: 1a42bd2b-1694-4c1b-b00d-309391db657a
