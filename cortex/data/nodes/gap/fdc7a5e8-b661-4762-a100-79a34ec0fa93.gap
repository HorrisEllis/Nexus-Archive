envelope: 1
uuid: nexus-export-gap-fdc7a5e8-b661-4762-a100-79a34ec0fa93
type: gap
id: fdc7a5e8-b661-4762-a100-79a34ec0fa93
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822172
source: data/cortex/memory/gaps.json:fdc7a5e8-b661-4762-a100-79a34ec0fa93
payload:
  uuid: de5ecd9b-b449-4067-b704-bc13784ae3c8
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.guardian-job-persistence.test.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.guardian-job-persistence.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.guardian-job-persistence.test
  occurrences: 1
  detectedAt: 1789169897168
  lastSeenAt: 1789169897168
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.guardian-job-persistence.test.import
    hookId: nexus.tests.modules.guardian-job-persistence.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.guardian-job-persistence.test
  location: null
  error: null
  resourceState:
    ts: 1789169897168
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766692864
      freeMemPct: 0.3372529442595682
      usedMemPct: 0.6627470557404318
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81584128
      heapUsed: 33227176
      heapTotal: 60952576
      heapUsedPct: 0.5451316118288422
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.guardian-job-persistence.test
  priority: 0.3925
  id: fdc7a5e8-b661-4762-a100-79a34ec0fa93
