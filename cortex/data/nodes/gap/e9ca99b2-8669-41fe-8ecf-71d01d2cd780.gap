envelope: 1
uuid: nexus-export-gap-e9ca99b2-8669-41fe-8ecf-71d01d2cd780
type: gap
id: e9ca99b2-8669-41fe-8ecf-71d01d2cd780
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822173
source: data/cortex/memory/gaps.json:e9ca99b2-8669-41fe-8ecf-71d01d2cd780
payload:
  uuid: 0a950632-afad-476a-adff-47ddd63b760e
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.raid-retry-escalation.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.raid-retry-escalation.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.raid-retry-escalation.test
  occurrences: 1
  detectedAt: 1789169897171
  lastSeenAt: 1789169897171
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.raid-retry-escalation.test.import
    hookId: nexus.tests.modules.raid-retry-escalation.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.raid-retry-escalation.test
  location: null
  error: null
  resourceState:
    ts: 1789169897171
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5757657088
      freeMemPct: 0.3367245058406099
      usedMemPct: 0.6632754941593901
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81928192
      heapUsed: 33489368
      heapTotal: 60952576
      heapUsedPct: 0.5494331855638062
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.raid-retry-escalation.test
  priority: 0.3925
  id: e9ca99b2-8669-41fe-8ecf-71d01d2cd780
