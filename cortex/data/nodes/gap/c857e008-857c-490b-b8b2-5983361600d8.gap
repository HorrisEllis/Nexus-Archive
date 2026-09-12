envelope: 1
uuid: nexus-export-gap-c857e008-857c-490b-b8b2-5983361600d8
type: gap
id: c857e008-857c-490b-b8b2-5983361600d8
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822136
source: data/cortex/memory/gaps.json:c857e008-857c-490b-b8b2-5983361600d8
payload:
  uuid: 51f3fca2-b556-4830-b908-b9c958af6e53
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.closed-loop-tool.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.closed-loop-tool.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.closed-loop-tool.test
  occurrences: 1
  detectedAt: 1789169836936
  lastSeenAt: 1789169836936
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.closed-loop-tool.test.import
    hookId: nexus.tests.modules.closed-loop-tool.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.closed-loop-tool.test
  location: null
  error: null
  resourceState:
    ts: 1789169836936
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7326388224
      freeMemPct: 0.4284684580234008
      usedMemPct: 0.5715315419765992
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100114432
      heapUsed: 50421088
      heapTotal: 71483392
      heapUsedPct: 0.7053538813603025
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.closed-loop-tool.test
  priority: 0.3925
  id: c857e008-857c-490b-b8b2-5983361600d8
