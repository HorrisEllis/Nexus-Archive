envelope: 1
uuid: nexus-export-gap-d8a63fdd-5e6b-4222-8520-7b813f880e69
type: gap
id: d8a63fdd-5e6b-4222-8520-7b813f880e69
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822170
source: data/cortex/memory/gaps.json:d8a63fdd-5e6b-4222-8520-7b813f880e69
payload:
  uuid: d0cd32ec-1f6b-42dd-84b1-ffd503fe1776
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.copilot-bridge-direct-dispatch.test.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.copilot-bridge-direct-dispatch.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.copilot-bridge-direct-dispatch.test
  occurrences: 1
  detectedAt: 1789169897158
  lastSeenAt: 1789169897158
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.copilot-bridge-direct-dispatch.test.import
    hookId: nexus.tests.copilot-bridge-direct-dispatch.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.copilot-bridge-direct-dispatch.test
  location: null
  error: null
  resourceState:
    ts: 1789169897158
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5767057408
      freeMemPct: 0.33727426385126685
      usedMemPct: 0.6627257361487331
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81055744
      heapUsed: 32455720
      heapTotal: 60952576
      heapUsedPct: 0.5324749523301525
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.copilot-bridge-direct-dispatch.test
  priority: 0.3925
  id: d8a63fdd-5e6b-4222-8520-7b813f880e69
