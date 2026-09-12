envelope: 1
uuid: nexus-export-gap-cf85b0df-21b9-4382-a99a-532f6ec0a7e8
type: gap
id: cf85b0df-21b9-4382-a99a-532f6ec0a7e8
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822173
source: data/cortex/memory/gaps.json:cf85b0df-21b9-4382-a99a-532f6ec0a7e8
payload:
  uuid: 08df3c43-e4d9-4e4d-9dc5-2a0ab0d7cccd
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-brainos-canvas-agent-mesh.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-brainos-canvas-agent-mesh
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-brainos-canvas-agent-mesh
  occurrences: 1
  detectedAt: 1789169897175
  lastSeenAt: 1789169897175
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-brainos-canvas-agent-mesh.import
    hookId: nexus.tests.modules.test-brainos-canvas-agent-mesh.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-brainos-canvas-agent-mesh
  location: null
  error: null
  resourceState:
    ts: 1789169897175
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5756502016
      freeMemPct: 0.3366569538759018
      usedMemPct: 0.6633430461240982
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82182144
      heapUsed: 33739512
      heapTotal: 60952576
      heapUsedPct: 0.5535370974312882
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-brainos-canvas-agent-mesh
  priority: 0.3925
  id: cf85b0df-21b9-4382-a99a-532f6ec0a7e8
