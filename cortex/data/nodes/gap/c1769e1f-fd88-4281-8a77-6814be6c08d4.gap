envelope: 1
uuid: nexus-export-gap-c1769e1f-fd88-4281-8a77-6814be6c08d4
type: gap
id: c1769e1f-fd88-4281-8a77-6814be6c08d4
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822174
source: data/cortex/memory/gaps.json:c1769e1f-fd88-4281-8a77-6814be6c08d4
payload:
  uuid: bc12d76d-79d6-4615-8aa0-8dcd12a2f751
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-brainos-dynamic-mesh-canvas.import' is declared as an INPUT but
    no wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-brainos-dynamic-mesh-canvas
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-brainos-dynamic-mesh-canvas
  occurrences: 1
  detectedAt: 1789169897176
  lastSeenAt: 1789169897176
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-brainos-dynamic-mesh-canvas.import
    hookId: nexus.tests.modules.test-brainos-dynamic-mesh-canvas.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-brainos-dynamic-mesh-canvas
  location: null
  error: null
  resourceState:
    ts: 1789169897176
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5752029184
      freeMemPct: 0.33639536967213823
      usedMemPct: 0.6636046303278618
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82247680
      heapUsed: 33823320
      heapTotal: 60952576
      heapUsedPct: 0.5549120680313823
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-brainos-dynamic-mesh-canvas
  priority: 0.3925
  id: c1769e1f-fd88-4281-8a77-6814be6c08d4
