envelope: 1
uuid: nexus-export-gap-8b69c74d-1378-4598-922b-23c752cd3a68
type: gap
id: 8b69c74d-1378-4598-922b-23c752cd3a68
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822146
source: data/cortex/memory/gaps.json:8b69c74d-1378-4598-922b-23c752cd3a68
payload:
  uuid: 0f7dfdbc-556c-450e-bfc4-71cf41121eaa
  type: dangling-hook
  domain: system
  body: >-
    hook 'eravos.organism.spawn.complete' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: eravos.organism.spawn
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::eravos.organism.spawn
  occurrences: 1
  detectedAt: 1789169836975
  lastSeenAt: 1789169836975
  meta:
    kernelGapUuid: wire-integrity:eravos.organism.spawn.complete
    hookId: eravos.organism.spawn.complete
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - eravos.organism.spawn
  location: null
  error: null
  resourceState:
    ts: 1789169836975
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7311142912
      freeMemPct: 0.42757686790764254
      usedMemPct: 0.5724231320923574
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102674432
      heapUsed: 52340424
      heapTotal: 71483392
      heapUsedPct: 0.7322039782331538
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: eravos.organism.spawn
  priority: 0.4387
  id: 8b69c74d-1378-4598-922b-23c752cd3a68
