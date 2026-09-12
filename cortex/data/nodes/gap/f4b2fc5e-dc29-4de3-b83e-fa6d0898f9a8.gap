envelope: 1
uuid: nexus-export-gap-f4b2fc5e-dc29-4de3-b83e-fa6d0898f9a8
type: gap
id: f4b2fc5e-dc29-4de3-b83e-fa6d0898f9a8
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822140
source: data/cortex/memory/gaps.json:f4b2fc5e-dc29-4de3-b83e-fa6d0898f9a8
payload:
  uuid: 464ab090-87d8-4a53-88c6-2b668fecef3a
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.tools.nexus-heal.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.lib.agent-tools.tools.nexus-heal
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.tools.nexus-heal
  occurrences: 1
  detectedAt: 1789169836958
  lastSeenAt: 1789169836958
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.tools.nexus-heal.export
    hookId: nexus.lib.agent-tools.tools.nexus-heal.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.tools.nexus-heal
  location: null
  error: null
  resourceState:
    ts: 1789169836958
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7315701760
      freeMemPct: 0.4278434825768631
      usedMemPct: 0.5721565174231369
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101253120
      heapUsed: 51484504
      heapTotal: 71483392
      heapUsedPct: 0.7202302878968027
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.tools.nexus-heal
  priority: 0.3925
  id: f4b2fc5e-dc29-4de3-b83e-fa6d0898f9a8
