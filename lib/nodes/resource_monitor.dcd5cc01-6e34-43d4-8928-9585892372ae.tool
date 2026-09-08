envelope: 1
uuid: nexus-export-tool-resource_monitor.dcd5cc01-6e34-43d4-8928-9585892372ae
type: tool
id: resource_monitor.dcd5cc01-6e34-43d4-8928-9585892372ae
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724987
source: lib/agent-tools
payload:
  name: resource_monitor
  description: >-
    Real resource/load signals — system-wide (CPU load average, memory), a specific process by pid
    (default: this process), a running COS compartment's watchdog state, or ollama's real queue
    depth. This is signal only, not a dispatcher — it reports load, it does not route or balance
    anything itself. There is no fleet of interchangeable instances in this system to balance
    across; use this to check whether a heavy action is safe to run now, not to pick between
    equivalent workers.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - system
          - process
          - compartment
          - ollama_queue
      pid:
        type: number
        description: for "process" — defaults to this process's own pid
      compartmentId:
        type: string
        description: for "compartment" — required
    required:
      - action
