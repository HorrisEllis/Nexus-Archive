envelope: 1
uuid: nexus-export-gap-7be32df8-3b81-4401-8031-41f96e8a530d
type: gap
id: 7be32df8-3b81-4401-8031-41f96e8a530d
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822139
source: data/cortex/memory/gaps.json:7be32df8-3b81-4401-8031-41f96e8a530d
payload:
  uuid: 8088431b-c33b-4775-891e-b2cdd07e3eb6
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.copilot.wake-relay.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.clear-glass.copilot.wake-relay
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.copilot.wake-relay
  occurrences: 1
  detectedAt: 1789169836954
  lastSeenAt: 1789169836954
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.copilot.wake-relay.import
    hookId: nexus.clear-glass.copilot.wake-relay.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.copilot.wake-relay
  location: null
  error: null
  resourceState:
    ts: 1789169836954
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7320817664
      freeMemPct: 0.42814267549856705
      usedMemPct: 0.5718573245014329
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101003264
      heapUsed: 51259320
      heapTotal: 71483392
      heapUsedPct: 0.7170801296054894
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.copilot.wake-relay
  priority: 0.3925
  id: 7be32df8-3b81-4401-8031-41f96e8a530d
