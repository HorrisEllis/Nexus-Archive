envelope: 1
uuid: nexus-export-gap-50e70c7c-c05f-4f0c-88a1-140ac1a25408
type: gap
id: 50e70c7c-c05f-4f0c-88a1-140ac1a25408
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822168
source: data/cortex/memory/gaps.json:50e70c7c-c05f-4f0c-88a1-140ac1a25408
payload:
  uuid: 18d83310-1e82-4898-bed9-f26725f603cd
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.loom.schema.wire.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.loom.schema.wire
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.loom.schema.wire
  occurrences: 1
  detectedAt: 1789169897145
  lastSeenAt: 1789169897145
  meta:
    kernelGapUuid: wire-integrity:nexus.loom.schema.wire.export
    hookId: nexus.loom.schema.wire.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.loom.schema.wire
  location: null
  error: null
  resourceState:
    ts: 1789169897145
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5750423552
      freeMemPct: 0.33630146765027435
      usedMemPct: 0.6636985323497256
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80875520
      heapUsed: 31781472
      heapTotal: 60952576
      heapUsedPct: 0.5214131064780593
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.loom.schema.wire
  priority: 0.3925
  id: 50e70c7c-c05f-4f0c-88a1-140ac1a25408
