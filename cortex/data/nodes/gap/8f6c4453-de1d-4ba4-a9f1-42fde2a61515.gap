envelope: 1
uuid: nexus-export-gap-8f6c4453-de1d-4ba4-a9f1-42fde2a61515
type: gap
id: 8f6c4453-de1d-4ba4-a9f1-42fde2a61515
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822172
source: data/cortex/memory/gaps.json:8f6c4453-de1d-4ba4-a9f1-42fde2a61515
payload:
  uuid: 771e756a-b65d-49f3-8472-c4fd045f3ea9
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.ncp-hostile-payload.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.ncp-hostile-payload.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.ncp-hostile-payload.test
  occurrences: 1
  detectedAt: 1789169897169
  lastSeenAt: 1789169897169
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.ncp-hostile-payload.test.import
    hookId: nexus.tests.modules.ncp-hostile-payload.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.ncp-hostile-payload.test
  location: null
  error: null
  resourceState:
    ts: 1789169897169
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5765201920
      freeMemPct: 0.33716574952498035
      usedMemPct: 0.6628342504750196
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81739776
      heapUsed: 33323280
      heapTotal: 60952576
      heapUsedPct: 0.5467083130333983
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.ncp-hostile-payload.test
  priority: 0.3925
  id: 8f6c4453-de1d-4ba4-a9f1-42fde2a61515
