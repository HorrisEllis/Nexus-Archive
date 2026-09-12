envelope: 1
uuid: nexus-export-gap-18abcfb8-3b4d-4ee3-a1e5-27f33960a3da
type: gap
id: 18abcfb8-3b4d-4ee3-a1e5-27f33960a3da
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822174
source: data/cortex/memory/gaps.json:18abcfb8-3b4d-4ee3-a1e5-27f33960a3da
payload:
  uuid: b595fa82-7d6f-423f-9b99-eb7c892b5f03
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-copilot-tools-guardian-ncp-mesh.import' is declared as an INPUT
    but no wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-copilot-tools-guardian-ncp-mesh
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-copilot-tools-guardian-ncp-mesh
  occurrences: 1
  detectedAt: 1789169897177
  lastSeenAt: 1789169897177
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-copilot-tools-guardian-ncp-mesh.import
    hookId: nexus.tests.modules.test-copilot-tools-guardian-ncp-mesh.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-copilot-tools-guardian-ncp-mesh
  location: null
  error: null
  resourceState:
    ts: 1789169897177
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5747814400
      freeMemPct: 0.33614887686474565
      usedMemPct: 0.6638511231352544
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82292736
      heapUsed: 33907512
      heapTotal: 60952576
      heapUsedPct: 0.5562933386113165
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-copilot-tools-guardian-ncp-mesh
  priority: 0.3925
  id: 18abcfb8-3b4d-4ee3-a1e5-27f33960a3da
