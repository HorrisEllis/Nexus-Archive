envelope: 1
uuid: nexus-export-gap-463ed103-7631-4cc2-a6c5-662650cdffa1
type: gap
id: 463ed103-7631-4cc2-a6c5-662650cdffa1
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822140
source: data/cortex/memory/gaps.json:463ed103-7631-4cc2-a6c5-662650cdffa1
payload:
  uuid: ad3f8142-dfbc-4ecd-ba97-85d6b453110b
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.tools.raid-snr.export' is declared as an OUTPUT but no wire connects
    it to anything — an emit/call with no possible listener
  source: nexus.lib.agent-tools.tools.raid-snr
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.tools.raid-snr
  occurrences: 1
  detectedAt: 1789169836961
  lastSeenAt: 1789169836961
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.tools.raid-snr.export
    hookId: nexus.lib.agent-tools.tools.raid-snr.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.tools.raid-snr
  location: null
  error: null
  resourceState:
    ts: 1789169836961
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7312936960
      freeMemPct: 0.427681789044317
      usedMemPct: 0.572318210955683
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101380096
      heapUsed: 51639536
      heapTotal: 71483392
      heapUsedPct: 0.7223990713815035
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.tools.raid-snr
  priority: 0.4698
  id: 463ed103-7631-4cc2-a6c5-662650cdffa1
