envelope: 1
uuid: nexus-export-gap-169a72cc-548c-42bb-a038-48399ef01e6c
type: gap
id: 169a72cc-548c-42bb-a038-48399ef01e6c
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822140
source: data/cortex/memory/gaps.json:169a72cc-548c-42bb-a038-48399ef01e6c
payload:
  uuid: 1ee6fef2-4e00-46f5-8794-a3f649e819c0
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.tools.register-trigger.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.lib.agent-tools.tools.register-trigger
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.tools.register-trigger
  occurrences: 1
  detectedAt: 1789169836957
  lastSeenAt: 1789169836957
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.tools.register-trigger.export
    hookId: nexus.lib.agent-tools.tools.register-trigger.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.tools.register-trigger
  location: null
  error: null
  resourceState:
    ts: 1789169836957
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7315447808
      freeMemPct: 0.42782863072646626
      usedMemPct: 0.5721713692735337
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101187584
      heapUsed: 51410056
      heapTotal: 71483392
      heapUsedPct: 0.7191888152145886
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.tools.register-trigger
  priority: 0.4387
  id: 169a72cc-548c-42bb-a038-48399ef01e6c
