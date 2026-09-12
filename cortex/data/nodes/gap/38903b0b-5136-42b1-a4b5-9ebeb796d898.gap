envelope: 1
uuid: nexus-export-gap-38903b0b-5136-42b1-a4b5-9ebeb796d898
type: gap
id: 38903b0b-5136-42b1-a4b5-9ebeb796d898
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822175
source: data/cortex/memory/gaps.json:38903b0b-5136-42b1-a4b5-9ebeb796d898
payload:
  uuid: 657b5f74-a9f9-48c0-855c-7d1fc5e907f9
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.spawn-provider-tab.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.spawn-provider-tab.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.spawn-provider-tab.test
  occurrences: 1
  detectedAt: 1789169897187
  lastSeenAt: 1789169897187
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.spawn-provider-tab.test.import
    hookId: nexus.tests.spawn-provider-tab.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.spawn-provider-tab.test
  location: null
  error: null
  resourceState:
    ts: 1789169897187
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749620736
      freeMemPct: 0.33625451663934247
      usedMemPct: 0.6637454833606575
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 83132416
      heapUsed: 34748920
      heapTotal: 60952576
      heapUsedPct: 0.5700976444375379
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.spawn-provider-tab.test
  priority: 0.3925
  id: 38903b0b-5136-42b1-a4b5-9ebeb796d898
