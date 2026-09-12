envelope: 1
uuid: nexus-export-gap-eed89f9a-344d-4c6b-8085-befd1e697125
type: gap
id: eed89f9a-344d-4c6b-8085-befd1e697125
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822175
source: data/cortex/memory/gaps.json:eed89f9a-344d-4c6b-8085-befd1e697125
payload:
  uuid: 444000de-1be9-4d1e-a61f-faaa8092774f
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.node-export-idea-tagged-query.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.node-export-idea-tagged-query.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.node-export-idea-tagged-query.test
  occurrences: 1
  detectedAt: 1789169897185
  lastSeenAt: 1789169897185
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.node-export-idea-tagged-query.test.import
    hookId: nexus.tests.node-export-idea-tagged-query.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.node-export-idea-tagged-query.test
  location: null
  error: null
  resourceState:
    ts: 1789169897185
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
      rss: 83009536
      heapUsed: 34576712
      heapTotal: 60952576
      heapUsedPct: 0.5672723659784289
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.node-export-idea-tagged-query.test
  priority: 0.3925
  id: eed89f9a-344d-4c6b-8085-befd1e697125
