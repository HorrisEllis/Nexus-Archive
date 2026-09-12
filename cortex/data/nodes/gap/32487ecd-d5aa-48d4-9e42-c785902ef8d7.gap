envelope: 1
uuid: nexus-export-gap-32487ecd-d5aa-48d4-9e42-c785902ef8d7
type: gap
id: 32487ecd-d5aa-48d4-9e42-c785902ef8d7
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822175
source: data/cortex/memory/gaps.json:32487ecd-d5aa-48d4-9e42-c785902ef8d7
payload:
  uuid: 2eddbe02-ffa2-451e-b0ea-d29e59cfd3cc
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-versionium-migration.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-versionium-migration
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-versionium-migration
  occurrences: 1
  detectedAt: 1789169897182
  lastSeenAt: 1789169897182
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-versionium-migration.import
    hookId: nexus.tests.modules.test-versionium-migration.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-versionium-migration
  location: null
  error: null
  resourceState:
    ts: 1789169897182
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749952512
      freeMemPct: 0.336273919863248
      usedMemPct: 0.6637260801367519
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82755584
      heapUsed: 34325144
      heapTotal: 60952576
      heapUsedPct: 0.5631450916857066
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-versionium-migration
  priority: 0.3925
  id: 32487ecd-d5aa-48d4-9e42-c785902ef8d7
