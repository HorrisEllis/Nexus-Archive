envelope: 1
uuid: nexus-export-gap-98188276-4e7d-4d52-81e2-2c0a3fb0ba81
type: gap
id: 98188276-4e7d-4d52-81e2-2c0a3fb0ba81
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822176
source: data/cortex/memory/gaps.json:98188276-4e7d-4d52-81e2-2c0a3fb0ba81
payload:
  uuid: 8e3bac03-1595-4f72-990e-bf987be681ec
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.tools.agent-mesh-route.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.lib.agent-tools.tools.agent-mesh-route
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.tools.agent-mesh-route
  occurrences: 1
  detectedAt: 1789170197134
  lastSeenAt: 1789170197134
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.tools.agent-mesh-route.import
    hookId: nexus.lib.agent-tools.tools.agent-mesh-route.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.tools.agent-mesh-route
  location: null
  error: null
  resourceState:
    ts: 1789170197134
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 6178197504
      freeMemPct: 0.3613189305517894
      usedMemPct: 0.6386810694482106
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101691392
      heapUsed: 36023752
      heapTotal: 58961920
      heapUsedPct: 0.6109664000086835
      external: 2282684
      uptimeSec: 360
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.tools.agent-mesh-route
  priority: 0.3925
  id: 98188276-4e7d-4d52-81e2-2c0a3fb0ba81
