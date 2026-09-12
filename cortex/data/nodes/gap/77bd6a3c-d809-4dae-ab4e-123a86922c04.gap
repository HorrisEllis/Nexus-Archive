envelope: 1
uuid: nexus-export-gap-77bd6a3c-d809-4dae-ab4e-123a86922c04
type: gap
id: 77bd6a3c-d809-4dae-ab4e-123a86922c04
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822147
source: data/cortex/memory/gaps.json:77bd6a3c-d809-4dae-ab4e-123a86922c04
payload:
  uuid: 4067ab1e-11ca-4db1-a866-43bda325bd7e
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.intake.export' is declared as an OUTPUT but no wire connects it to anything — an
    emit/call with no possible listener
  source: nexus.lib.intake
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.intake
  occurrences: 1
  detectedAt: 1789169836986
  lastSeenAt: 1789169836986
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.intake.export
    hookId: nexus.lib.intake.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.intake
  location: null
  error: null
  resourceState:
    ts: 1789169836986
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7323127808
      freeMemPct: 0.4282777794279834
      usedMemPct: 0.5717222205720166
      cpuPct: 1
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102608896
      heapUsed: 52799096
      heapTotal: 71483392
      heapUsedPct: 0.7386204616591222
      external: 1947901
      uptimeSec: 0
    pressure:
      level: pressure
      reasons:
        - cpu 100%
      spawnSafe: true
  why: null
  component: nexus.lib.intake
  priority: 0.3925
  id: 77bd6a3c-d809-4dae-ab4e-123a86922c04
