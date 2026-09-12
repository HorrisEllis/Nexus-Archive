envelope: 1
uuid: nexus-export-gap-d78f4778-7518-4c27-a338-dcf6bf4d679d
type: gap
id: d78f4778-7518-4c27-a338-dcf6bf4d679d
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822138
source: data/cortex/memory/gaps.json:d78f4778-7518-4c27-a338-dcf6bf4d679d
payload:
  uuid: 0ce3768a-a9ee-4ae9-a777-6c581ef4d2c5
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.component-ledger.import' is declared as an INPUT but no wire ever targets it —
    dead code, or a caller that was never wired
  source: nexus.lib.component-ledger
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.component-ledger
  occurrences: 1
  detectedAt: 1789169836946
  lastSeenAt: 1789169836946
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.component-ledger.import
    hookId: nexus.lib.component-ledger.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.component-ledger
  location: null
  error: null
  resourceState:
    ts: 1789169836946
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7320920064
      freeMemPct: 0.4281486641479206
      usedMemPct: 0.5718513358520794
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100741120
      heapUsed: 50950688
      heapTotal: 71483392
      heapUsedPct: 0.7127625952612882
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.component-ledger
  priority: 0.3925
  id: d78f4778-7518-4c27-a338-dcf6bf4d679d
