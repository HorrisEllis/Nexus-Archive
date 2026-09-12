envelope: 1
uuid: nexus-export-gap-0828e7c6-bdb0-4398-988e-6775de9d2d77
type: gap
id: 0828e7c6-bdb0-4398-988e-6775de9d2d77
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822146
source: data/cortex/memory/gaps.json:0828e7c6-bdb0-4398-988e-6775de9d2d77
payload:
  uuid: 1fb98093-64f1-4aa2-b711-633d19a12c05
  type: dangling-hook
  domain: system
  body: >-
    hook 'ollama.jobs.dispatch.complete' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: ollama.jobs.dispatch
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::ollama.jobs.dispatch
  occurrences: 1
  detectedAt: 1789169836974
  lastSeenAt: 1789169836974
  meta:
    kernelGapUuid: wire-integrity:ollama.jobs.dispatch.complete
    hookId: ollama.jobs.dispatch.complete
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - ollama.jobs.dispatch
  location: null
  error: null
  resourceState:
    ts: 1789169836974
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7312748544
      freeMemPct: 0.4276707699295064
      usedMemPct: 0.5723292300704936
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102838272
      heapUsed: 52265608
      heapTotal: 71483392
      heapUsedPct: 0.7311573575020055
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: ollama.jobs.dispatch
  priority: 0.4698
  id: 0828e7c6-bdb0-4398-988e-6775de9d2d77
