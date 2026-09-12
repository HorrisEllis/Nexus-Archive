envelope: 1
uuid: nexus-export-gap-228a2a85-befc-418b-93bd-93f6b8a0b18f
type: gap
id: 228a2a85-befc-418b-93bd-93f6b8a0b18f
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822140
source: data/cortex/memory/gaps.json:228a2a85-befc-418b-93bd-93f6b8a0b18f
payload:
  uuid: 3812a52e-adc2-427d-8b2f-7462ed9bac06
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.tools.schedule-task.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.lib.agent-tools.tools.schedule-task
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.tools.schedule-task
  occurrences: 1
  detectedAt: 1789169836955
  lastSeenAt: 1789169836955
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.tools.schedule-task.export
    hookId: nexus.lib.agent-tools.tools.schedule-task.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.tools.schedule-task
  location: null
  error: null
  resourceState:
    ts: 1789169836955
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7318417408
      freeMemPct: 0.42800230155771957
      usedMemPct: 0.5719976984422804
      cpuPct: 0.6941747572815534
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101122048
      heapUsed: 51333912
      heapTotal: 71483392
      heapUsedPct: 0.7181236167416342
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.tools.schedule-task
  priority: 0.4387
  id: 228a2a85-befc-418b-93bd-93f6b8a0b18f
