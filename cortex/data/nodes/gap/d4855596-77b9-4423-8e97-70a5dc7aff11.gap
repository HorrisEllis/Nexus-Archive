envelope: 1
uuid: nexus-export-gap-d4855596-77b9-4423-8e97-70a5dc7aff11
type: gap
id: d4855596-77b9-4423-8e97-70a5dc7aff11
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822148
source: data/cortex/memory/gaps.json:d4855596-77b9-4423-8e97-70a5dc7aff11
payload:
  uuid: 7609f33a-85b4-4b95-8688-c54df8ddfd9a
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.guardian.lib.jobs.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.guardian.lib.jobs
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.guardian.lib.jobs
  occurrences: 1
  detectedAt: 1789169836990
  lastSeenAt: 1789169836990
  meta:
    kernelGapUuid: wire-integrity:nexus.guardian.lib.jobs.export
    hookId: nexus.guardian.lib.jobs.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.guardian.lib.jobs
  location: null
  error: null
  resourceState:
    ts: 1789169836990
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7333404672
      freeMemPct: 0.4288788002771068
      usedMemPct: 0.5711211997228932
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102633472
      heapUsed: 52872336
      heapTotal: 71483392
      heapUsedPct: 0.7396450353111391
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.guardian.lib.jobs
  priority: 0.3925
  id: d4855596-77b9-4423-8e97-70a5dc7aff11
