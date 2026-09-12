envelope: 1
uuid: nexus-export-gap-e5443f57-418e-4e31-9a1a-aff7df32e5d4
type: gap
id: e5443f57-418e-4e31-9a1a-aff7df32e5d4
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822138
source: data/cortex/memory/gaps.json:e5443f57-418e-4e31-9a1a-aff7df32e5d4
payload:
  uuid: 56599744-a60a-476e-83b5-e80ab6a28ded
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.run-pipeline-tool.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.run-pipeline-tool.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.run-pipeline-tool.test
  occurrences: 1
  detectedAt: 1789169836940
  lastSeenAt: 1789169836940
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.run-pipeline-tool.test.import
    hookId: nexus.tests.modules.run-pipeline-tool.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.run-pipeline-tool.test
  location: null
  error: null
  resourceState:
    ts: 1789169836940
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7324160000
      freeMemPct: 0.4283381450134673
      usedMemPct: 0.5716618549865327
      cpuPct: 0.5982905982905983
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100343808
      heapUsed: 50650872
      heapTotal: 71483392
      heapUsedPct: 0.7085683902632937
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.run-pipeline-tool.test
  priority: 0.3925
  id: e5443f57-418e-4e31-9a1a-aff7df32e5d4
