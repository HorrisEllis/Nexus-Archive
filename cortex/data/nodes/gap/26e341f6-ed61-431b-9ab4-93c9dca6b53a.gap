envelope: 1
uuid: nexus-export-gap-26e341f6-ed61-431b-9ab4-93c9dca6b53a
type: gap
id: 26e341f6-ed61-431b-9ab4-93c9dca6b53a
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822165
source: data/cortex/memory/gaps.json:26e341f6-ed61-431b-9ab4-93c9dca6b53a
payload:
  uuid: 293813bd-1dff-4559-b8e6-7106a5c9e5a8
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.system-registry.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.lib.system-registry
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.system-registry
  occurrences: 1
  detectedAt: 1789169897138
  lastSeenAt: 1789169897138
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.system-registry.export
    hookId: nexus.lib.system-registry.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.system-registry
  location: null
  error: null
  resourceState:
    ts: 1789169897138
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
      heapUsed: 31284528
      heapTotal: 60952576
      heapUsedPct: 0.5132601450675358
      external: 2090575
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.system-registry
  priority: 0.3925
  id: 26e341f6-ed61-431b-9ab4-93c9dca6b53a
