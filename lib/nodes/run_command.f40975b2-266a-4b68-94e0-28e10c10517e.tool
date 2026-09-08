envelope: 1
uuid: nexus-export-tool-run_command.f40975b2-266a-4b68-94e0-28e10c10517e
type: tool
id: run_command.f40975b2-266a-4b68-94e0-28e10c10517e
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724931
source: lib/agent-tools
payload:
  name: run_command
  description: >-
    Execute a NEXUS cockpit command. Commands follow cockpit's real interaction contract (v1.0.0).
    Available commands:

    forge pipeline list — List all pipelines

    forge pipeline create <name> — Create a new pipeline

    forge pipeline run <id> — Trigger a pipeline run

    forge pipeline add-node <pipeline_id> <type> — Add a node to a pipeline

    forge pipeline connect <pipeline_id> <from_id> <to_id> — Connect two nodes with an optional
    condition

    forge pipeline arm <id> — Enable pipeline scheduler

    forge pipeline disarm <id> — Disable pipeline scheduler

    forge pipeline delete <id> — Delete a pipeline

    forge pipeline export <id> — Export pipeline as JSON

    forge pipeline import <json> — Import pipeline from JSON

    forge seam compile <source> — Compile SEAM source → constraint field + JS

    forge seam validate <source> — Validate SEAM source (Pass 0 only)

    forge seam chunk <source> — Chunk SEAM/spec source into delivery protocol chunks

    forge idea list — List ideas from Idearium

    forge idea create <title> — Create a new idea in Idearium

    forge gap list — List gaps

    forge gap create <title> — Create a gap

    forge gap resolve <id> <resolution> — Resolve a gap

    forge snapshot create — Create Idearium snapshot

    forge trust list — List all trust scores (Beta distribution)

    forge trust record <sourceId> — Record a trust event for a source

    forge guardian dispatch <provider> <prompt> — Dispatch prompt to Guardian agent

    forge guardian health — Check Guardian connection

    forge idearium health — Check Idearium connection

    forge bus emit <channel> — Emit a SISO bus event

    forge bus history — Show recent SISO bus events

    forge jaa stats — Show JAA store row counts by table

    forge jaa query <table> — Query a JAA table

    forge help — Show all available commands

    Also: "forge help" lists commands.
  parameters:
    type: object
    properties:
      command:
        type: string
        description: The full command string, e.g. "forge pipeline list" or "forge pipeline create My Pipeline"
      opts:
        type: object
        description: >-
          Optional named options for the command, e.g. {"payload": "{\"key\":1}"} for forge pipeline
          run
    required:
      - command
