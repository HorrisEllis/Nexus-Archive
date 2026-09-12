envelope: 1
uuid: nexus-export-gap-2b41a3fc-ad66-4bee-b196-2fbc1e49ee8b
type: gap
id: 2b41a3fc-ad66-4bee-b196-2fbc1e49ee8b
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822146
source: data/cortex/memory/gaps.json:2b41a3fc-ad66-4bee-b196-2fbc1e49ee8b
payload:
  uuid: 84e149a8-cf62-4926-bc56-be0dee0b7c00
  type: dangling-hook
  domain: system
  body: >-
    hook 'copilot.prompt.stream.chunk' is declared as an OUTPUT but no wire connects it to anything
    — an emit/call with no possible listener
  source: copilot.prompt.stream
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::copilot.prompt.stream
  occurrences: 1
  detectedAt: 1789169836979
  lastSeenAt: 1789169836979
  meta:
    kernelGapUuid: wire-integrity:copilot.prompt.stream.chunk
    hookId: copilot.prompt.stream.chunk
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - copilot.prompt.stream
  location: null
  error: null
  resourceState:
    ts: 1789169836979
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7325483008
      freeMemPct: 0.4284155183631153
      usedMemPct: 0.5715844816368847
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102289408
      heapUsed: 52499224
      heapTotal: 71483392
      heapUsedPct: 0.7344254732623768
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: copilot.prompt.stream
  priority: 0.3925
  id: 2b41a3fc-ad66-4bee-b196-2fbc1e49ee8b
