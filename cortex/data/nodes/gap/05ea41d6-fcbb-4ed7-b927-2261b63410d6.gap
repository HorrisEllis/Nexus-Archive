envelope: 1
uuid: nexus-export-gap-05ea41d6-fcbb-4ed7-b927-2261b63410d6
type: gap
id: 05ea41d6-fcbb-4ed7-b927-2261b63410d6
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822172
source: data/cortex/memory/gaps.json:05ea41d6-fcbb-4ed7-b927-2261b63410d6
payload:
  uuid: aaed0fbe-41a4-4a67-ad49-425321005f05
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.agent-mesh-hostile.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.agent-mesh-hostile.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.agent-mesh-hostile.test
  occurrences: 1
  detectedAt: 1789169897164
  lastSeenAt: 1789169897164
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.agent-mesh-hostile.test.import
    hookId: nexus.tests.modules.agent-mesh-hostile.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.agent-mesh-hostile.test
  location: null
  error: null
  resourceState:
    ts: 1789169897164
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766664192
      freeMemPct: 0.3372512674377492
      usedMemPct: 0.6627487325622508
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81715200
      heapUsed: 32956904
      heapTotal: 60952576
      heapUsedPct: 0.5406974760180767
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.agent-mesh-hostile.test
  priority: 0.3925
  id: 05ea41d6-fcbb-4ed7-b927-2261b63410d6
