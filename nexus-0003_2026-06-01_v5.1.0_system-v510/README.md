# NEXUS SYSTEM
## Complete Architecture · v5.1.0

**Author:** James Brooks (Erosmancer)  
**UUID:** nexus-system-v510-2026-0601  
**Status:** living

> *"Lets invent, in all ways, nothing seen before."*

---

## What This Is

A unified, self-aware, AI-orchestration system where every layer is in sync, every event is logged, nothing is ever lost, and you can code with any AI agent using the CLI as the primary interface.

```
cortex (3748)          ← source of truth · JAA · 34 tables · Cobalt bus · RAID · ORION
  ↕ all events sync
guardian-server (7820) ← agent API · HTTP + WSS + dropzone + memory
  ↕ WSS bridge
userscript             ← browser bridge · injects prompts · captures artifacts
  ↕ syncs to
forge IDE (4800)       ← IDE + pipeline + .spec parser · SEAM delivery
  ↕ all through
CLI                    ← the tool that talks to everything
```

---

## Ports

| Port | Service | Binding | Purpose |
|------|---------|---------|---------|
| 3748 | Nexus Cortex (admin) | 127.0.0.1 | Source of truth — JAA + Cobalt + RAID + ORION |
| 4800 | Forge IDE / Idearium | 127.0.0.1 | IDE + pipeline + spec parser |
| 7800 | Rheon IDE | 127.0.0.1 | Seam language IDE |
| 7820 | Guardian HTTP API | 127.0.0.1 | Agent API + Cockpit |
| 7821 | Guardian WSS | 127.0.0.1 | Browser userscript bridge |
| 7822 | Dropzone | 0.0.0.0 (LAN) | File upload |
| 7823 | Memory server | 0.0.0.0 (LAN) | JAA memory query |
| 11434 | Ollama | localhost | Local LLM inference |

---

## Boot Order

```bash
# 1. Source of truth first
node src/cortex-boot.js

# 2. Guardian agent server
node src/guardian-server.js

# 3. CLI (anytime)
node cli/nexus-cli.js

# Or REPL:
node cli/nexus-cli.js status
node cli/nexus-cli.js gaps
node cli/nexus-cli.js watch
```

---

## Files

```
nexus-system/
├── emerge-kernel.js          ← SNR gate compiler (JS seed)
├── emerge-cli.js             ← emerge CLI
├── emerge.spec               ← living schema — 41 domains, 500+ keywords
├── package.json
│
├── src/
│   ├── cortex-boot.js        ← Nexus Cortex v5.0 server (port 3748)
│   ├── guardian-server.js    ← Guardian API server (7820/7821/7822)
│   └── siso.js               ← SISO event bus (Stream/Gate/Event)
│
├── cli/
│   └── nexus-cli.js          ← Full CLI: cortex + guardian + forge + memory
│
├── io/                       ← Every component declared in Emerge grammar
│   ├── cockpit-core.eg       ← SISOKernel + JAA browser store + Bayesian trust
│   ├── cockpit-pipeline.eg   ← Pipeline engine + 14 node types + SEAM evaluator
│   ├── cockpit-forge.eg      ← AI self-modification engine
│   ├── guardian-extension.eg ← Firefox extension: app.js + cfr.js + ir-layer + handshake
│   ├── guardian-siphon.eg    ← Siphon + Pulse + Watchman
│   ├── guardian-server-full.eg ← All routes + 15-table schema + 3748 bridge
│   ├── cortex.eg             ← Nexus Cortex: JAA + Cobalt + RAID + ORION + CLI
│   ├── forge.eg              ← Forge engine + pipeline + .spec parser + IDE
│   ├── guardian-bridge.eg    ← Userscript bridge: tab discovery + job queue + SNR
│   └── nexus-system.eg       ← Master wiring: all layers in sync
│
├── schemas/
│   └── schema.sql            ← Authoritative 15-table SQL DDL
│
├── seams/
│   └── seam-contracts.js     ← All seam boundary declarations
│
└── guardian-v83-nexus-patch.js ← Drop into guardian-claude-v8.3.user.js
```

---

## The Emerge Spec

The `.spec` file is the schema for the compiler. Edit it → compiler behavior changes.

```
node emerge-cli.js check io/cortex.eg         # validate
node emerge-cli.js compile io/cortex.eg       # compile → .out.json
node emerge-cli.js watch                       # watch ./io
```

**10 files · 6530+ signal tokens · zero axiom violations**

---

## Userscript Integration

1. Open your `guardian-claude-v8.3.user.js`
2. Add the contents of `guardian-v83-nexus-patch.js` inside the IIFE
3. In the `GUARDIAN_READY` case: add `initNexusPatch();`
4. Replace `injectText(text); setTimeout(submit, 500);` with `await explicitInject(text, jobId);`

**What the patch adds:**
- Every event syncs to Cortex (3748) in real-time
- Tab auto-discovery: if no claimed tab, opens one
- GTCI: gap questions prepended to every prompt automatically
- Explicit data channel: `GUARDIAN_INPUT → ACK → channel stays open → GUARDIAN_DONE`
- Forge sync: SEAM progress pushed to 4800
- ChatGPT provider selectors
- Console SSE sync: cortex events mirror to Guardian panel

---

## CLI Reference

```
nexus status              system health + table counts
nexus gaps [status]       open gaps
nexus memory search <q>   search cortex memory
nexus memory tail [n]     recent memories
nexus ledger [n]          ledger tail
nexus artifacts           list artifacts
nexus jobs [status]       list jobs
nexus watch               live SSE event stream
nexus ask <prompt>        submit agent call, poll for response
nexus cortex              full cortex commands
nexus help                all commands
```

---

## Laws

```
LAW_I    Local first — Ollama before cloud
LAW_II   JAA write before behavior
LAW_III  No module imports another — all via JAA
LAW_IV   Schema over code
LAW_V    CLI first — UI is a skin
LAW_VI   Toast on every failure — nothing silently fails
```

---

## Architectural Invariants

```
§1.1  Nothing exists until proven
§1.2  Nothing silently fails
§2.1  Persistence is the golden rule
§5.1  UUID on everything
§M1   Every module: init(cfg) + stop() only
§M2   Modules only read/write declared tables
§M3   Poll interval is module configuration
§A3   Every row carries causedBy or source
```

---

*NEXUS SYSTEM v5.1.0 · James Brooks · Portland, Oregon · 2026*
