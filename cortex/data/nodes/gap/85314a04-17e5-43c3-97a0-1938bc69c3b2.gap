envelope: 1
uuid: nexus-export-gap-85314a04-17e5-43c3-97a0-1938bc69c3b2
type: gap
id: 85314a04-17e5-43c3-97a0-1938bc69c3b2
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822175
source: data/cortex/memory/gaps.json:85314a04-17e5-43c3-97a0-1938bc69c3b2
payload:
  uuid: 3b337f68-3c1b-4dcf-b811-231686fc991b
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.node-schemas-split.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.node-schemas-split.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.node-schemas-split.test
  occurrences: 1
  detectedAt: 1789169897186
  lastSeenAt: 1789169897186
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.node-schemas-split.test.import
    hookId: nexus.tests.node-schemas-split.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.node-schemas-split.test
  location: null
  error: null
  resourceState:
    ts: 1789169897186
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749755904
      freeMemPct: 0.3362624216564892
      usedMemPct: 0.6637375783435109
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 83038208
      heapUsed: 34666136
      heapTotal: 60952576
      heapUsedPct: 0.568739473783684
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.node-schemas-split.test
  priority: 0.3925
  id: 85314a04-17e5-43c3-97a0-1938bc69c3b2
