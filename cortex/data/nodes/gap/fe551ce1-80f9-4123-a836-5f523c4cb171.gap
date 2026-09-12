envelope: 1
uuid: nexus-export-gap-fe551ce1-80f9-4123-a836-5f523c4cb171
type: gap
id: fe551ce1-80f9-4123-a836-5f523c4cb171
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822170
source: data/cortex/memory/gaps.json:fe551ce1-80f9-4123-a836-5f523c4cb171
payload:
  uuid: 4f5553a2-df1d-4eef-a89a-28996fd514d1
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.lib.cos-seam-parser.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.lib.cos-seam-parser.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.lib.cos-seam-parser.test
  occurrences: 1
  detectedAt: 1789169897161
  lastSeenAt: 1789169897161
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.lib.cos-seam-parser.test.import
    hookId: nexus.tests.lib.cos-seam-parser.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.lib.cos-seam-parser.test
  location: null
  error: null
  resourceState:
    ts: 1789169897161
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766860800
      freeMemPct: 0.337262765644508
      usedMemPct: 0.662737234355492
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81309696
      heapUsed: 32706848
      heapTotal: 60952576
      heapUsedPct: 0.5365950078959747
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.lib.cos-seam-parser.test
  priority: 0.3925
  id: fe551ce1-80f9-4123-a836-5f523c4cb171
