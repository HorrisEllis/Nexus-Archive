envelope: 1
uuid: nexus-export-gap-da398619-0fb9-4381-a767-62ba0652382c
type: gap
id: da398619-0fb9-4381-a767-62ba0652382c
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822146
source: data/cortex/memory/gaps.json:da398619-0fb9-4381-a767-62ba0652382c
payload:
  uuid: db388887-522b-4339-9e17-d59a4e86790d
  type: dangling-hook
  domain: system
  body: >-
    hook 'copilot.prompt.reply' is declared as an OUTPUT but no wire connects it to anything — an
    emit/call with no possible listener
  source: copilot.prompt
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::copilot.prompt
  occurrences: 1
  detectedAt: 1789169836977
  lastSeenAt: 1789169836977
  meta:
    kernelGapUuid: wire-integrity:copilot.prompt.reply
    hookId: copilot.prompt.reply
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - copilot.prompt
  location: null
  error: null
  resourceState:
    ts: 1789169836977
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7326978048
      freeMemPct: 0.42850295264367727
      usedMemPct: 0.5714970473563228
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102170624
      heapUsed: 52425368
      heapTotal: 71483392
      heapUsedPct: 0.7333922822241004
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: copilot.prompt
  priority: 0.4698
  id: da398619-0fb9-4381-a767-62ba0652382c
