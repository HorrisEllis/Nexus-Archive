envelope: 1
uuid: nexus-export-gap-847c7d5c-b31a-4d69-a246-af78f090f227
type: gap
id: 847c7d5c-b31a-4d69-a246-af78f090f227
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822171
source: data/cortex/memory/gaps.json:847c7d5c-b31a-4d69-a246-af78f090f227
payload:
  uuid: 5d471385-c1dc-456a-a476-12bf1416fb64
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.agent-mesh-drainer.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.agent-mesh-drainer.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.agent-mesh-drainer.test
  occurrences: 1
  detectedAt: 1789169897163
  lastSeenAt: 1789169897163
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.agent-mesh-drainer.test.import
    hookId: nexus.tests.modules.agent-mesh-drainer.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.agent-mesh-drainer.test
  location: null
  error: null
  resourceState:
    ts: 1789169897163
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766795264
      freeMemPct: 0.3372589329089217
      usedMemPct: 0.6627410670910783
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81432576
      heapUsed: 32873216
      heapTotal: 60952576
      heapUsedPct: 0.5393244741616827
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.agent-mesh-drainer.test
  priority: 0.3925
  id: 847c7d5c-b31a-4d69-a246-af78f090f227
