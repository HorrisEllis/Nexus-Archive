envelope: 1
uuid: nexus-export-gap-76088e6a-0251-4cc9-85eb-0ff2423b7139
type: gap
id: 76088e6a-0251-4cc9-85eb-0ff2423b7139
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822148
source: data/cortex/memory/gaps.json:76088e6a-0251-4cc9-85eb-0ff2423b7139
payload:
  uuid: f37bb9c7-da3b-4c39-b65e-94e3941850f5
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.src.downloads.intake-bridge.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.clear-glass.src.downloads.intake-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.src.downloads.intake-bridge
  occurrences: 2
  detectedAt: 1789169836995
  lastSeenAt: 1789169836997
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.src.downloads.intake-bridge.export
    hookId: nexus.clear-glass.src.downloads.intake-bridge.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.src.downloads.intake-bridge
  location: null
  error: null
  resourceState:
    ts: 1789169836995
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7324413952
      freeMemPct: 0.42835299686386413
      usedMemPct: 0.5716470031361358
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102797312
      heapUsed: 53019768
      heapTotal: 71483392
      heapUsedPct: 0.7417075003939376
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.src.downloads.intake-bridge
  priority: 0.3925
  id: 76088e6a-0251-4cc9-85eb-0ff2423b7139
