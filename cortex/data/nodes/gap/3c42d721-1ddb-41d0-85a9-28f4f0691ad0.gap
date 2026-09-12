envelope: 1
uuid: nexus-export-gap-3c42d721-1ddb-41d0-85a9-28f4f0691ad0
type: gap
id: 3c42d721-1ddb-41d0-85a9-28f4f0691ad0
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822145
source: data/cortex/memory/gaps.json:3c42d721-1ddb-41d0-85a9-28f4f0691ad0
payload:
  uuid: 4e14c885-3ecc-43ae-a037-68b1982cfe17
  type: dangling-hook
  domain: system
  body: >-
    hook 'guardian.job.dispatch.complete' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: guardian.job.dispatch
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::guardian.job.dispatch
  occurrences: 1
  detectedAt: 1789169836973
  lastSeenAt: 1789169836973
  meta:
    kernelGapUuid: wire-integrity:guardian.job.dispatch.complete
    hookId: guardian.job.dispatch.complete
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - guardian.job.dispatch
  location: null
  error: null
  resourceState:
    ts: 1789169836973
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7314649088
      freeMemPct: 0.4277819192615085
      usedMemPct: 0.5722180807384916
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102293504
      heapUsed: 52189216
      heapTotal: 71483392
      heapUsedPct: 0.7300886896917259
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: guardian.job.dispatch
  priority: 0.4569
  id: 3c42d721-1ddb-41d0-85a9-28f4f0691ad0
