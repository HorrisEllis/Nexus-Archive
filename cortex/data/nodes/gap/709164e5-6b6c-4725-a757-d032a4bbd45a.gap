envelope: 1
uuid: nexus-export-gap-709164e5-6b6c-4725-a757-d032a4bbd45a
type: gap
id: 709164e5-6b6c-4725-a757-d032a4bbd45a
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822173
source: data/cortex/memory/gaps.json:709164e5-6b6c-4725-a757-d032a4bbd45a
payload:
  uuid: 56a90a7a-82d7-4016-abb1-5b4be720e2ce
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-artifact-namer.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-artifact-namer
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-artifact-namer
  occurrences: 1
  detectedAt: 1789169897174
  lastSeenAt: 1789169897174
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-artifact-namer.import
    hookId: nexus.tests.modules.test-artifact-namer.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-artifact-namer
  location: null
  error: null
  resourceState:
    ts: 1789169897174
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5757878272
      freeMemPct: 0.33673744132321365
      usedMemPct: 0.6632625586767864
      cpuPct: 0.30348258706467657
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82042880
      heapUsed: 33654112
      heapTotal: 60952576
      heapUsedPct: 0.5521360081647739
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-artifact-namer
  priority: 0.3925
  id: 709164e5-6b6c-4725-a757-d032a4bbd45a
