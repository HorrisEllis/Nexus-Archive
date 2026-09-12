envelope: 1
uuid: nexus-export-gap-5bdcb73a-c408-498c-8b94-acb1adfd24ab
type: gap
id: 5bdcb73a-c408-498c-8b94-acb1adfd24ab
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822172
source: data/cortex/memory/gaps.json:5bdcb73a-c408-498c-8b94-acb1adfd24ab
payload:
  uuid: acf5444b-efac-4995-af60-d6025df45c77
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.automation-engine.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.automation-engine.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.automation-engine.test
  occurrences: 1
  detectedAt: 1789169897166
  lastSeenAt: 1789169897166
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.automation-engine.test.import
    hookId: nexus.tests.modules.automation-engine.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.automation-engine.test
  location: null
  error: null
  resourceState:
    ts: 1789169897166
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5767020544
      freeMemPct: 0.33727210793749957
      usedMemPct: 0.6627278920625004
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81338368
      heapUsed: 33046440
      heapTotal: 60952576
      heapUsedPct: 0.5421664213174517
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.automation-engine.test
  priority: 0.3925
  id: 5bdcb73a-c408-498c-8b94-acb1adfd24ab
