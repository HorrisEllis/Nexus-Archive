envelope: 1
uuid: nexus-export-gap-6a57ddb2-796a-48bb-a246-bdaf2b8fd5a5
type: gap
id: 6a57ddb2-796a-48bb-a246-bdaf2b8fd5a5
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822165
source: data/cortex/memory/gaps.json:6a57ddb2-796a-48bb-a246-bdaf2b8fd5a5
payload:
  uuid: 6d201385-c9c0-47eb-a54e-1e3b11b983cf
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.loom.schema.component.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.loom.schema.component
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.loom.schema.component
  occurrences: 1
  detectedAt: 1789169897139
  lastSeenAt: 1789169897139
  meta:
    kernelGapUuid: wire-integrity:nexus.loom.schema.component.export
    hookId: nexus.loom.schema.component.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.loom.schema.component
  location: null
  error: null
  resourceState:
    ts: 1789169897139
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5756186624
      freeMemPct: 0.3366385088358928
      usedMemPct: 0.6633614911641073
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80416768
      heapUsed: 31369728
      heapTotal: 60952576
      heapUsedPct: 0.5146579530945501
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.loom.schema.component
  priority: 0.3925
  id: 6a57ddb2-796a-48bb-a246-bdaf2b8fd5a5
