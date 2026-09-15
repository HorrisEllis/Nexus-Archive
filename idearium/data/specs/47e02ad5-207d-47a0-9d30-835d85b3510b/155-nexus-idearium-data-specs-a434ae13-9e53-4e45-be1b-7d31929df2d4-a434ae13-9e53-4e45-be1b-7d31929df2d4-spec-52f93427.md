---
chunk_uuid: 52f93427-9762-4405-b88c-0da51163c985
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-a434ae13-9e53-4e45-be1b-7d31929df2d4-spec
title: nexus/idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/a434ae13-9e53-4e45-be1b-7d31929df2d4.spec
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-a434ae13-9e53-4e45-be1b-7d31929df2d4-spec
contract_id: spec-contract:47e02ad5:nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-a434ae13-9e53-4e45-be1b-7d31929df2d4-spec:52f93427
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:50.450Z
---

spec:
  name: brainos-real-import
  uuid: a434ae13-9e53-4e45-be1b-7d31929df2d4
  version: 0.1.0
  type: codebase
  phase: 40
  status: complete
  agent: ollama
  completed_at: 2026-09-03T10:26:54.595Z

# BrainOS-main/BrainOS-v2.html

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BrainOS — Integrated Control v5.0</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

/* ═══ TOKENS ═══════════════════════════════════════════════════ */
:root {
  --bg:      #06060f;
  --bg2:     #09091a;
  --panel:   #0a0a1c;
  --panel2:  #0d0d22;
  --border:  #12122a;
  --border2: #1e1e40;
  --border3: #2a2a55;
  --text:    #c8ccee;
  --text2:   #525580;
  --text3:   #1e1e40;
  --font:    'Oxanium', monospace;
  --mono:    'DM Mono', monospace;

  --online:  #00e5a0;
  --idle:    #4fc3f7;
  --offline: #1e1e40;
  --relay:   #7c4dff;
  --warn:    #ffd740;
  --danger:  #ff4060;
  --bridge:  #ff6b35;
  --signal:  #00ff88;
  --noise:   #ff3355;

  --tab-h: 40px;
  --bar-h: 42px;
  --status-h: 22px;
}

* { margin:0; padding:0; box-sizing:border-box; }
html,body { height:100%; overflow:hidden; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  display: flex;
  flex-direction: column;
}



.ctx-item { padding:5px 12px; cursor:pointer; color:var(--text2); transition:all .1s; }
.ctx-item:hover { background:var(--bg2); color:var(--text); }

/* ── HELP NAV ─────────────────────────────────────────────────── */
.help-nav-item {
  padding:5px 12px;font-size:9px;font-weight:600;letter-spacing:.08em;
  color:var(--text2);cursor:pointer;transition:all .1s;white-space:nowrap;
  border-left:2px solid transparent;
}
.help-nav-item:hover { color:var(--text);background:rgba(255,255,255,.03); }
.help-nav-item.act { color:var(--idle);border-left-color:var(--idle); }

/* ═══ TOP BAR ═══════════════════════════════════════════════════ */
.bar {
  height: var(--bar-h);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 100;
}

.logo { font-size:13px; font-weight:800; letter-spacing:.22em; color:var(--bridge); white-space:nowrap; }
.logo em { color:var(--text2); font-style:normal; font-weight:300; font-size:9px; margin-left:4px; }

.sep { width:1px; height:18px; background:var(--border2); flex-shrink:0; }

.hb { width:7px;height:7px;border-radius:50%;background:var(--offline);flex-shrink:0;transition:all .3s; }
.hb.live { background:var(--online);box-shadow:0 0 6px var(--online);animation:hb 2s ease infinite; }
@keyframes hb { 0%,100%{opacity:1}50%{opacity:.3} }

.bstat { display:flex;flex-direction:column;align-items:center; }
.bstat-v { font-size:13px;font-weight:700;line-height:1.1; }
.bstat-l { font-size:7px;color:var(--text2);letter-spacing:.07em;font-family:var(--mono); }

.spacer { flex:1; }

/* tab nav in bar */
.tab-nav { display:flex;gap:0; }
.tnav {
  padding:0 12px; height:var(--bar-h); display:flex; align-items:center;
  font-size:9px;font-weight:700;letter-spacing:.12em;color:var(--text2);
  cursor:pointer;border-bottom:2px solid transparent;transition:all .12s;
  white-space:nowrap;
}
.tnav:hover { color:var(--text); }
.tnav.act { color:var(--idle);border-bottom-color:var(--idle); }

.hbtn {
  padding:4px 10px;font-family:var(--font);font-size:9px;font-weight:700;
  letter-spacing:.1em;border:1px solid var(--border2);background:transparent;
  color:var(--text2);cursor:pointer;border-radius:2px;transition:all .12s;white-space:nowrap;
}
.hbtn:hover { color:var(--text);border-color:var(--border3); }
.hbtn.g { border-color:var(--online);color:var(--online); }
.hbtn.g:hover { background:rgba(0,229,160,.07); }
.hbtn.act { background:rgba(79,195,247,.08);border-color:var(--idle);color:var(--idle); }

/* URL input */
.url-row { display:flex;gap:5px;align-items:center; }
.url-in {
  padding:4px 8px;background:rgba(255,255,255,.03);border:1px solid var(--border2);
  color:var(--text);font-family:var(--mono);font-size:9px;border-radius:

---

# BrainOS-main/BrainOS.html

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BrainOS — Integrated Control v5.0</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

/* ═══ TOKENS ═══════════════════════════════════════════════════ */
:root {
  --bg:      #06060f;
  --bg2:     #09091a;
  --panel:   #0a0a1c;
  --panel2:  #0d0d22;
  --border:  #12122a;
  --border2: #1e1e40;
  --border3: #2a2a55;
  --text:    #c8ccee;
  --text2:   #525580;
  --text3:   #1e1e40;
  --font:    'Oxanium', monospace;
  --mono:    'DM Mono', monospace;

  --online:  #00e5a0;
  --idle:    #4fc3f7;
  --offline: #1e1e40;
  --relay:   #7c4dff;
  --warn:    #ffd740;
  --danger:  #ff4060;
  --bridge:  #ff6b35;
  --signal:  #00ff88;
  --noise:   #ff3355;

  --tab-h: 40px;
  --bar-h: 42px;
  --status-h: 22px;
}

* { margin:0; padding:0; box-sizing:border-box; }
html,body { height:100%; overflow:hidden; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  display: flex;
  flex-direction: column;
}



.ctx-item { padding:5px 12px; cursor:pointer; color:var(--text2); transition:all .1s; }
.ctx-item:hover { background:var(--bg2); color:var(--text); }

/* ── HELP NAV ─────────────────────────────────────────────────── */
.help-nav-item {
  padding:5px 12px;font-size:9px;font-weight:600;letter-spacing:.08em;
  color:var(--text2);cursor:pointer;transition:all .1s;white-space:nowrap;
  border-left:2px solid transparent;
}
.help-nav-item:hover { color:var(--text);background:rgba(255,255,255,.03); }
.help-nav-item.act { color:var(--idle);border-left-color:var(--idle); }

/* ═══ TOP BAR ═══════════════════════════════════════════════════ */
.bar {
  height: var(--bar-h);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 100;
}

.logo { font-size:13px; font-weight:800; letter-spacing:.22em; color:var(--bridge); white-space:nowrap; }
.logo em { color:var(--text2); font-style:normal; font-weight:300; font-size:9px; margin-left:4px; }

.sep { width:1px; height:18px; background:var(--border2); flex-shrink:0; }

.hb { width:7px;height:7px;border-radius:50%;background:var(--offline);flex-shrink:0;transition:all .3s; }
.hb.live { background:var(--online);box-shadow:0 0 6px var(--online);animation:hb 2s ease infinite; }
@keyframes hb { 0%,100%{opacity:1}50%{opacity:.3} }

.bstat { display:flex;flex-direction:column;align-items:center; }
.bstat-v { font-size:13px;font-weight:700;line-height:1.1; }
.bstat-l { font-size:7px;color:var(--text2);letter-spacing:.07em;font-family:var(--mono); }

.spacer { flex:1; }

/* tab nav in bar */
.tab-nav { display:flex;gap:0; }
.tnav {
  padding:0 12px; height:var(--bar-h); display:flex; align-items:center;
  font-size:9px;font-weight:700;letter-spacing:.12em;color:var(--text2);
  cursor:pointer;border-bottom:2px solid transparent;transition:all .12s;
  white-space:nowrap;
}
.tnav:hover { color:var(--text); }
.tnav.act { color:var(--idle);border-bottom-color:var(--idle); }

.hbtn {
  padding:4px 10px;font-family:var(--font);font-size:9px;font-weight:700;
  letter-spacing:.1em;border:1px solid var(--border2);background:transparent;
  color:var(--text2);cursor:pointer;border-radius:2px;transition:all .12s;white-space:nowrap;
}
.hbtn:hover { color:var(--text);border-color:var(--border3); }
.hbtn.g { border-color:var(--online);color:var(--online); }
.hbtn.g:hover { background:rgba(0,229,160,.07); }
.hbtn.act { background:rgba(79,195,247,.08);border-color:var(--idle);color:var(--idle); }

/* URL input */
.url-row { display:flex;gap:5px;align-items:center; }
.url-in {
  padding:4px 8px;background:rgba(255,255,255,.03);border:1px solid var(--border2);
  color:var(--text);font-family:var(--mono);font-size:9px;border-radius:

---

# BrainOS-main/CHANGELOG.md

# BrainOS — Changelog

## [5.0.0] — 2026-04-12

### Critical Bug Fixes (were causing blank screen / JS failure)
- **FIXED** Fatal syntax error `const url = ;` in `bayesForceUpdate()` at line 3131 — killed entire script block
- **FIXED** Duplicate `uid()` declaration — `const` at line 1480 AND `function` at line 3809 — caused `SyntaxError` in strict mode
- **FIXED** Double `display:none` on `#pipeline-overlay` and `#automation-overlay` — fought JS `display:flex` toggle

### New Modules (v5)
- **bus.js** — SISO-native typed event bus. All modules now communicate via bus only. Wildcard subscriptions, replay buffer, full audit log.
- **routing-engine.js** — Agent routing engine. If/then/when/fail condition chains. Timer, cron, heartbeat, CLI, data, intent triggers. Feedback loops. Framework injection. Conversation capture to log.
- **dns-server.js** — Full DNS server from scratch (UDP/53). Local zone, recursive resolver, blocklist, DDNS, cache. Import blocklists (uBlock/Pi-hole/hosts format).
- **ddns.js** — Dynamic DNS client. No-port-forward. Cloudflare, No-IP, DynDNS2, internal. Auto-detects public IP change.
- **firewall.js** — Rule-based firewall engine. IP/CIDR, port, protocol, intent, path, user-agent. JSON filter import with variables, sigmas, deltas, invariants. Windows Defender + Linux UFW sync hooks. Request logging.
- **reverse-proxy.js** — HTTP/HTTPS reverse proxy. SNI routing. WebSocket tunnel (CONNECT). Firewall middleware hookpoint.

### New Features (BrainOS.html)
- **NETWORK tab** — DNS server control, DDNS management, firewall rules, reverse proxy config
- **HELP tab** — Full in-app documentation from README + docs/
- **JSON filter import** — Import firewall/SNR filters via JSON engine. Variables, sigmas, deltas, invariants. Format documented in help tab.
- **Conversation logging** — Capture full workflow conversation to structured JSONL log
- **Integration adapters** — Clocky, Make, n8n, Zapier as first-class pipeline step types
- **Framework injection** — Inject engine/framework per step in routing workflows
- **NEXUS Plugin roadmap** — Phase 3 updated: Claude.ai chat listener for each agent chat

### Architecture
- All modules now emit bus events instead of calling functions directly
- SISO Core bundled at `src/siso/` (Event, Gate, Stream, StreamLog)
- CJS wrapper at `src/siso/index.cjs` for Node.js require() compatibility

### Docs
- Full `README.md` at root
- `CHANGELOG.md` (this file)
- `MANIFEST.json` updated with all new module UUIDs
- `ROADMAP.md` updated through Phase 6
- Per-module `.md` files in `docs/modules/`

## [4.0.0] — 2026-04-08 (previous)
- Pipeline canvas, automation tab, Bayesian engine, SNR gate, key manager UI
- Bridge canvas persistence, host rotation, port registry
- 364/364 module tests passing

## [3.2.0] — 2026-04-07
- Phase 1 complete: storage layer, SNR filter v1, crypto engine, key manager, host rotation, port registry
- 364/364 tests passing

---

# BrainOS-main/MANIFEST.json

{
  "name": "brainos",
  "version": "5.0.0",
  "description": "Integrated Control Canvas. SISO-native. Event bus. AI routing. DNS. Firewall. Mesh. Pipeline. Automation.",
  "uuid": "brainos-integrated-canvas-v5000-000000000001",
  "hookId": "brainos:integrated-canvas-v5:b0001",
  "layer": "application",
  "type": "control-canvas",

  "modules": {
    "bus": {
      "uuid": "brainos-bus-module-v5000-0000-000000000001",
      "hookId": "brainos.bus:bus-v5:b0001",
      "file": "bus.js",
      "version": "5.0.0",
      "role": "Event bus — SISO-native typed pub/sub"
    },
    "dns-server": {
      "uuid": "brainos-dns-server-v5000-0000-000000000002",
      "hookId": "brainos.dns:dns-server-v5:d0002",
      "file": "dns-server.js",
      "version": "5.0.0",
      "role": "Custom DNS server from scratch"
    },
    "firewall": {
      "uuid": "brainos-firewall-v5000-0000-000000000003",
      "hookId": "brainos.firewall:firewall-v5:f0003",
      "file": "firewall.js",
      "version": "5.0.0",
      "role": "Rule-based firewall engine"
    },
    "routing-engine": {
      "uuid": "brainos-routing-v5000-0000-000000000004",
      "hookId": "brainos.routing:routing-engine-v5:r0004",
      "file": "routing-engine.js",
      "version": "5.0.0",
      "role": "Agent routing — if/then/when/fail chains"
    },
    "ddns": {
      "uuid": "brainos-ddns-module-v5000-0000-000000000005",
      "hookId": "brainos.ddns:ddns-v5:d0005",
      "file": "ddns.js",
      "version": "5.0.0",
      "role": "Dynamic DNS client"
    },
    "reverse-proxy": {
      "uuid": "brainos-rproxy-v5000-0000-000000000006",
      "hookId": "brainos.rproxy:rproxy-v5:r0006",
      "file": "reverse-proxy.js",
      "version": "5.0.0",
      "role": "HTTP/HTTPS reverse proxy"
    },
    "snr-filter": {
      "uuid": "snr-filter-module-v1000-0000-000000000001",
      "hookId": "snr.filter:snr-filter-v1:s0001",
      "file": "snr-filter.js",
      "version": "1.0.0",
      "role": "Signal-to-noise gate"
    },
    "crypto-engine": {
      "uuid": "crypto-engine-module-v1000-0000-000000000001",
      "file": "crypto-engine.js",
      "version": "1.0.0"
    },
    "key-manager": {
      "uuid": "key-manager-module-v1000-0000-000000000001",
      "file": "key-manager.js",
      "version": "1.0.0"
    },
    "host-rotation": {
      "uuid": "host-rotation-module-v1000-0000-000000000001",
      "file": "host-rotation.js",
      "version": "1.0.0"
    },
    "port-registry": {
      "uuid": "port-registry-module-v1000-0000-000000000001",
      "file": "port-registry.js",
      "version": "1.0.0"
    },
    "canvas-persistence": {
      "uuid": "bridge-canvas-persist-0001-phase1-foundation",
      "file": "bridge-canvas-persistence.js",
      "version": "1.0.0"
    },
    "siso-core": {
      "uuid": "siso-core-f0und4t10n-layer-0000-000000000001",
      "path": "src/siso/",
      "version": "1.0.0",
      "role": "Foundation — Event · Gate · Stream · StreamLog"
    }
  },

  "axioms": [
    "Everything fails loudly — toast + log + event",
    "Nothing pretends to work — no silent failures",
    "Everything has a UUID",
    "Event bus only — no direct cross-module calls",
    "Bottom-up — storage first, transport second, UI last",
    "SISO-native — Event → Gate → Stream",
    "Persistence is the golden rule — atomic writes",
    "Enterprise grade code, military grade security"
  ],

  "ecosystemLinks": {
    "siso": "src/siso/ — Foundation event framework",
    "jaa": "Planned — SQL persistence backend",
    "nexusPlugin": "NEXUS Browser Extension — bridge connector",
    "bridgeServer": "nexus-bridge-server-v2.js"
  }
}

---

# BrainOS-main/README-investor.md

# NEXUS — Investor Brief

**The problem with AI in 2025 is not capability. It is access.**

Every frontier AI model is locked behind an API. Every API has a price, a rate limit, a terms of service that restricts commercial use, and a latency cost that compounds at scale. Developers pay twice — once for compute, once in engineering time building and maintaining provider integrations that break every time a model updates.

There is a second problem nobody talks about: the best AI is not the one with the best model. It is the one the user is already logged into, with their full context, their conversation history, their documents. That AI is locked behind a browser. Nobody has figured out how to use it programmatically without violating terms of service or building brittle scrapers.

NEXUS solves both problems simultaneously.

---

## What It Does

NEXUS is a local AI orchestration runtime — a desktop application that lets any software system route messages to any AI model, with or without an API key, over a simple HTTP interface at `localhost:3747`.

The Firefox extension (Guardian) acts as a programmatic user. It captures any input element on any AI website, registers it as an addressable endpoint, and becomes the hands that type and the eyes that read. When a NEXUS client sends `POST /v1/messages {provider:'guardian', agentId:'chatgpt'}`, Guardian types the message into the actual ChatGPT interface and returns the response — no API key, no rate limit, no per-token cost beyond whatever the user already pays.

The same HTTP interface routes to Ollama (local models), DeepSeek, Claude, GPT-4, Gemini, LM Studio, and Open WebUI with a single unified API. Switching models is a parameter change. Fallback chains are configurable. Intent routing automatically selects the best model for the task type.

---

## The Numbers

| Metric | Value |
|---|---|
| Codebase | 60,000 lines |
| Test coverage | 76/76 passing |
| Core languages | JavaScript / Node.js / Python |
| External dependencies for core functionality | Zero |
| API keys required for browser AI routing | Zero |
| Time from zero to AI response | ~3 seconds |
| Supported AI providers | 9 (Ollama, DeepSeek, Claude, ChatGPT, Gemini, Grok, LM Studio, Open WebUI, Guardian) |
| Bridge protocol overhead | ~2ms per request |
| Concurrent SSE subscribers | Up to 100 |

---

## The Architecture Advantage

Three things are genuinely hard to replicate:

**1. The callto system.** Guardian's element picker uses a zero-reflow algorithm — it fingerprints DOM elements without triggering layout recalculation, generating stable CSS selectors that survive page refreshes and minor DOM changes. The capture-to-execution pipeline is 11 steps, fully observable via a causal event graph, and reconnects automatically after disconnection. This is not a scraper. It is a typed, addressable interface to any web UI.

**2. The causal event engine.** Causal-Nexus (587 tests, 14 modules) is a deterministic causal instrumentation runtime. Every action has a traceable cause. Every session is fully replayable. The kernel uses a ring buffer with O(1) push and eviction, an O(1) typeIndex based on `Set<id>`, LRU-capped seen maps, and atomic gate output — six proven hostile attack vectors were identified and eliminated in a structured adversarial audit. The query language (CQL) executes causal path queries across the event graph. This is the infrastructure layer for reasoning about what an AI did and why.

**3. The unified HTTP interface.** The bridge exposes a single `POST /v1/messages` endpoint that accepts any provider. The client does not need to know whether the response comes from a browser, a local model, or a commercial API. The intent routing system automatically chains providers in order of preference based on task type. This is the abstraction layer that makes AI provider lock-in irrelevant.

---

## Market Position

The AI infrastructure market is bifurcating. On one side: hyperscale API providers (OpenAI, Anthr

---

# BrainOS-main/README-technical.md

# NEXUS · Guardian · Causal-Nexus
## Technical Reference — v0.51.0 / Bridge v3.11.0 / Guardian v3.4.0

> **60,000 lines. 76 tests passing. Zero external AI API keys required for browser routing.**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Components](#2-system-components)
3. [NEXUS Electron Application](#3-nexus-electron-application)
4. [Guardian Firefox Extension](#4-guardian-firefox-extension)
5. [Bridge Server v3.11.0](#5-bridge-server-v3110)
6. [Causal-Nexus Event Engine](#6-causal-nexus-event-engine)
7. [BrainOS Canvas](#7-brainos-canvas)
8. [Process Architecture & Crash Recovery](#8-process-architecture--crash-recovery)
9. [Network & LAN/DDNS](#9-network--landdns)
10. [AI Routing & Intent System](#10-ai-routing--intent-system)
11. [Callto Pipeline](#11-callto-pipeline)
12. [IR Layer & Causal Graph](#12-ir-layer--causal-graph)
13. [UUID & Hook Registry](#13-uuid--hook-registry)
14. [Test Environment](#14-test-environment)
15. [Forge IDE & DeepScan](#15-forge-ide--deepscan)
16. [APK Builder](#16-apk-builder)
17. [Build, Package & Deploy](#17-build-package--deploy)
18. [API Reference — All Endpoints](#18-api-reference--all-endpoints)
19. [SSE Event Reference](#19-sse-event-reference)
20. [Integration Guide](#20-integration-guide)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  NEXUS Electron App  (Chromium renderer + Node main process)        │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  FORGE    │  │ CONSOLE  │  │ BUILDER  │  │ TEST ENV / DIAG  │  │
│  │  IDE      │  │ AI chat  │  │ Projects │  │ 25-check suite   │  │
│  └───────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
│              IPC / contextBridge (preload.js)                        │
├─────────────────────────────────────────────────────────────────────┤
│  main.js  (Electron main — single instance lock, tray, crash log)   │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Bridge process  │  │ Watchdog     │  │  Crash logger        │  │
│  │  detached:true   │  │ detached:true│  │  ring buffer 500     │  │
│  │  :3747 all ifs   │  │ nexus-svc.js │  │  nexus-crash.log     │  │
│  └──────────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │ HTTP/SSE                              │ HTTP/SSE
         ▼                                       ▼
┌─────────────────────┐           ┌──────────────────────────┐
│  Guardian v3.4.0    │           │  BrainOS Canvas           │
│  Firefox Extension  │           │  Single HTML file         │
│  MV2                │◄──────────│  Live mesh visualization  │
│  IR Layer           │           │  WebRTC / TURN / SSE      │
│  URCK causal        │           │  Pipeline builder         │
└─────────────────────┘           └──────────────────────────┘
         │ HTTP                              
         ▼                                  
┌─────────────────────────────────────────────────────────┐
│  Causal-Nexus v4.3.0 / v1.0.0                           │
│  14 modules · 587 tests                                  │
│  identity / time / causality / kernel / adapter          │
│  projection / lazy / delta / compress / gui              │
│  forge / loader / persist / query                        │
└─────────────────────────────────────────────────────────┘
```

### Data flows

**Browser AI routing (no API key):**
```
Your code → POST /v1/messages {provider:'guardian', agentId:'chatgpt'}
         → Bridge → SSE guardian:ai:request → Guardian extension
         → Guardian types text into ChatGPT tab
         → Listener captures ChatGPT response
         → POST /ingest guardian.link.event → Bridge SSE → Your code
```

**Direct API routing:**
```
POST /v1/messages {provider:'deepseek', messages:[...]}
  → Bridge → resolves intent chain → deepseekChat()
  → DeepSeek API

---

# BrainOS-main/README.md

# BrainOS · Guardian Control Panel

**BrainOS-v2.html** — Single-file canvas control panel for the Guardian/NEXUS bridge mesh.

## Features
- Live canvas mesh showing Guardian, NEXUS, Bridge, and Callto nodes
- Nodes turn red with animated ring when pulse stops (30s timeout)
- Right-click any node: connect, disconnect, repair, diagnose, wire callto
- Short ID display — copy to share with other systems
- Labeled pulse packets on tunnel lines (green=guardian, purple=callto, cyan=data)
- Pipeline builder: chain AI steps, Guardian as first-class node type
- SSE events auto-create nodes: guardian-pulse → Guardian node, callto.captured → Callto node

## Connection
The bridge must be running: `node bridge/nexus-bridge-server.js`

Bridge now listens on `0.0.0.0` — connect from any device on your LAN:
1. Open `BrainOS-v2.html` in a browser
2. Enter your bridge URL: `http://{LAN_IP}:3747` (find it with `GET /network/info`)
3. Click SCAN — nodes appear on canvas

## Versions
- Bridge: v3.11.0
- Guardian: v3.4.0  
- NEXUS: v0.51.0

## API Reference
See `guardian-bridge-api.html` for the complete endpoint reference.

---

# BrainOS-main/ROADMAP.md

# BrainOS — Roadmap
v5.0.0 · SISO-native · Enterprise Grade

---

## Phase 0 — Critical Bug Fixes ✓ COMPLETE (v5.0)
- [x] Fatal `const url = ;` syntax error
- [x] Duplicate `uid()` declaration in strict mode
- [x] Double `display:none` on overlays
- [x] All errors toast + log — nothing pretends

## Phase 1 — Event Bus ✓ COMPLETE (v5.0)
- [x] `bus.js` — SISO-native typed event bus
- [x] All modules wired to bus (no direct calls)
- [x] Wildcard subscriptions, replay buffer, audit log

## Phase 2 — Network Stack ✓ COMPLETE (v5.0)
- [x] `dns-server.js` — Custom DNS from scratch
- [x] `ddns.js` — Dynamic DNS, no port-forward
- [x] `reverse-proxy.js` — HTTP/HTTPS reverse proxy
- [x] `firewall.js` — Rule engine + OS integration
- [x] JSON filter import (variables, sigmas, deltas, invariants)
- [x] Cloudflare + No-IP + DynDNS2 DDNS providers
- [x] Blocked request logging (JSONL, loud)

## Phase 3 — Agent Routing ✓ COMPLETE (v5.0)
- [x] `routing-engine.js` — if/then/when/fail chains
- [x] Timer, cron, heartbeat, CLI, intent, data triggers
- [x] Clocky / Make / n8n / Zapier integration
- [x] Framework injection per step
- [x] Conversation capture to log
- [x] Input→output feedback loops
- [x] Bridge + API step types

## Phase 4 — Jaa Integration PLANNED
- [ ] Jaa SQL engine as persistence backend (replace localStorage + JSONL)
- [ ] Workflow state in Jaa tables
- [ ] Delta log queryable via SQL
- [ ] Bridge `/jaa/query` endpoint

## Phase 5 — NEXUS Plugin Integration PLANNED
- [ ] Plugin Phase 3: Claude.ai chat listener per agent
- [ ] MutationObserver — live conversation capture
- [ ] Idea extraction pipeline → bridge `/delta/idea`
- [ ] Plugin ↔ BrainOS routing trigger hook

## Phase 6 — Mesh Intelligence PLANNED
- [ ] Topology auto-layout (force-directed)
- [ ] Delta replay — scrub timeline, reconstruct state
- [ ] Anomaly detection from delta history
- [ ] Auto-heal — detect failed tunnels, suggest reroutes
- [ ] Invariant alerts — sigma threshold notifications

## Phase 7 — Hardening PLANNED
- [ ] Onion routing — multi-hop relay
- [ ] DHT discovery — Kademlia, no central signaling
- [ ] Ed25519 + ChaCha20-Poly1305 cipher support
- [ ] Distributed key authority — Shamir secret sharing
- [ ] Hardware bridge nodes (Raspberry Pi image)

---

# BrainOS-main/account-manager.js

/**
 * NEXUS Account Manager v2
 * Multi-account per AI provider with persistent profile storage.
 *
 * Fixes applied:
 *   [1] In-memory state cache — loadState() no longer hits disk on every call
 *   [2] Write mutex — concurrent saveState() calls serialized, no corruption
 *   [3] Custom providers persisted to disk — LOGIN_URLS/SELECTORS survive restart
 *   [4] Auto-heal cooldown — isAvailable() writes active status back to disk when cooldown expires
 *   [5] connectAccount try/finally — Playwright context always closed, no leaks
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ACCOUNTS_FILE = path.join(__dirname, 'data', 'accounts.json');
const PROFILES_DIR  = path.join(__dirname, 'profiles');

// ─── In-Memory State Cache (Fix #1) ──────────────────────────────────────────

let _stateCache = null;

function invalidateCache() { _stateCache = null; }

// ─── Write Mutex (Fix #2) ────────────────────────────────────────────────────

let _writeLock = Promise.resolve();

function withLock(fn) {
  _writeLock = _writeLock.then(() => fn()).catch(() => fn());
  return _writeLock;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const BUILTIN_PROVIDERS = {
  claude:      { loginUrl: 'https://claude.ai/login',                    successSelector: '[data-testid="chat-input"], div[contenteditable="true"]' },
  chatgpt:     { loginUrl: 'https://chat.openai.com/auth/login',         successSelector: 'textarea#prompt-textarea, textarea[data-id="root"]'      },
  gemini:      { loginUrl: 'https://gemini.google.com/',                 successSelector: 'rich-textarea [contenteditable="true"], div.ql-editor'   },
  perplexity:  { loginUrl: 'https://www.perplexity.ai/',                 successSelector: 'textarea[placeholder]'                                   },
  mistral:     { loginUrl: 'https://chat.mistral.ai/chat',               successSelector: 'textarea, [contenteditable="true"]'                      },
  copilot:     { loginUrl: 'https://copilot.microsoft.com/',             successSelector: 'textarea, cib-text-input'                                },
  poe:         { loginUrl: 'https://poe.com/',                           successSelector: 'textarea.GrowingTextArea_textArea__ZWQbP'                },
  grok:        { loginUrl: 'https://grok.com/',                          successSelector: 'textarea, [data-testid="tweetTextarea_0"]'                },
  cohere:      { loginUrl: 'https://coral.cohere.com/',                  successSelector: 'textarea[placeholder]'                                   },
};

const DEFAULT_STATE = {
  providers:      Object.fromEntries(Object.keys(BUILTIN_PROVIDERS).map(k => [k, { accounts: {} }])),
  customProviders: {},  // Fix #3: persisted custom provider configs
};

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadState() {
  if (_stateCache) return _stateCache;
  try {
    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      _stateCache = JSON.parse(JSON.stringify(DEFAULT_STATE));
      return _stateCache;
    }
    _stateCache = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
    // Ensure shape
    if (!_stateCache.providers)       _stateCache.providers       = {};
    if (!_stateCache.customProviders) _stateCache.customProviders = {};
    return _stateCache;
  } catch {
    _stateCache = JSON.parse(JSON.stringify(DEFAULT_STATE));
    return _stateCache;
  }
}

function saveState(state) {
  return withLock(() => {
    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
    // Write to temp file then rename — atomic on all platforms
    const tmp = ACCOUNTS_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, ACCOUNTS_FILE);
    _stateCache = state;
  });
}

// ─── Provider Config (builtin + custom) ──────────────────────────────────────

function getProviderConfig(provide

---

# BrainOS-main/adapters.js

/**
 * NEXUS Playwright Adapters v2
 * Sends messages to AI providers via persistent Chromium sessions.
 *
 * Fixes applied:
 *   [6]  getContext wraps require('playwright') in try/catch — graceful error
 *   [7]  contextPool has max-size and evicts stale contexts on account removal
 *   [8]  humanType uses evaluate() to clear contenteditable — page.fill() doesn't work on divs
 *   [9]  waitForFunction uses pollingInterval: 500ms — reduces CPU hammering
 *   [10] Multi-turn messages use conversation injection via new chat pages
 */

'use strict';

const { profilePath, markActive, getProviderConfig } = require('./account-manager');

// ─── Chromium Pool (Fix #6, #7) ───────────────────────────────────────────────

const MAX_POOL_SIZE = 20;
const contextPool   = new Map(); // key: "provider/accountId" → { ctx, createdAt, lastUsed }

function getChromium() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    throw new Error(
      'Playwright not installed.\n' +
      'Run: npm install playwright && npx playwright install chromium\n' +
      'Then restart the bridge server.'
    );
  }
  return chromium;
}

async function getContext(provider, accountId) {
  const key   = `${provider}/${accountId}`;
  const pPath = profilePath(provider, accountId);
  const entry = contextPool.get(key);

  if (entry) {
    entry.lastUsed = Date.now();
    return entry.ctx;
  }

  // Evict LRU if at capacity (Fix #7)
  if (contextPool.size >= MAX_POOL_SIZE) {
    let oldest = null, oldestKey = null;
    for (const [k, v] of contextPool) {
      if (!oldest || v.lastUsed < oldest.lastUsed) { oldest = v; oldestKey = k; }
    }
    if (oldestKey) {
      try { await oldest.ctx.close(); } catch { /* ignore */ }
      contextPool.delete(oldestKey);
      console.log(`[Adapters] Evicted context: ${oldestKey}`);
    }
  }

  const chromium = getChromium();
  const ctx = await chromium.launchPersistentContext(pPath, {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--disable-dev-shm-usage',  // prevents crashes in low-memory environments
      '--disable-gpu',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  // Inject stealth on every new page
  ctx.on('page', async page => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
    }).catch(() => {});
  });

  contextPool.set(key, { ctx, createdAt: Date.now(), lastUsed: Date.now() });
  return ctx;
}

async function closeContext(provider, accountId) {
  const key   = `${provider}/${accountId}`;
  const entry = contextPool.get(key);
  if (entry) {
    try { await entry.ctx.close(); } catch { /* ignore */ }
    contextPool.delete(key);
  }
}

async function closeAllContexts() {
  for (const [key, entry] of contextPool) {
    try { await entry.ctx.close(); } catch { /* ignore */ }
    contextPool.delete(key);
  }
}

// ─── Human Typing (Fix #8) ───────────────────────────────────────────────────
// page.fill() does NOT work on contenteditable divs (Claude, Gemini).
// Must use evaluate() to clear + keyboard.type() to fill.

async function humanType(page, selector, text, opts = {}) {
  const { minDelay = 15, maxDelay = 45 } = opts;

  await page.waitForSelector(selector, { timeout: 10_000 });
  await page.click(selector);
  await page.waitForTimeout(100 + Math.random() * 100);

  // Clear existing content — works for both input/textarea AND contenteditable
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable
      el

---

# BrainOS-main/agent-factory.js

/**
 * agent-factory.js — BrainOS Agent Factory
 * UUID: brainos-agent-factory-v5000-000000000015
 * Phase 3 · Agent Abstraction Layer
 *
 * Takes an ExecutionPlan from IntentRouter → selects agent → runs it → returns result.
 * The single execution gateway. Every AI/automation/system call goes through here.
 *
 * Flow:
 *   execute(plan, context)
 *     → registry.get(plan.agentType)
 *     → agent.run(plan, context)   (handles timeout + retry via BaseAgent)
 *     → emit workflow.step.complete
 *     → return result
 */

'use strict';

const { REGISTRY } = require('./agent-registry');
const { ROUTER }   = require('./intent-router');

const MODULE_UUID    = 'brainos-agent-factory-v5000-000000000015';
const MODULE_VERSION = '5.0.0';

class AgentFactory {
  constructor(opts = {}) {
    this.uuid    = MODULE_UUID;
    this.version = MODULE_VERSION;
    this._bus    = null;
    this._registry = REGISTRY;
    this._router   = ROUTER;
    this._stats  = { executed: 0, failed: 0 };
  }

  init(bus, opts = {}) {
    this._bus = bus;
    this._registry.init(bus, opts);
    this._router.setBus(bus);
    this._router.setRegistry(this._registry);

    bus.on('intent.dispatch', ev => {
      const { input, meta, context } = ev.data || {};
      this.dispatch(input, meta, context).catch(e =>
        this._fail('dispatch.event', e.message)
      );
    });
  }

  _emit(type, data) {
    if (this._bus) this._bus.emit(type, data, { source: 'agent-factory' });
  }

  _fail(ctx, msg, extra = {}) {
    this._stats.failed++;
    console.error(`[AGENT-FACTORY] ${ctx}: ${msg}`);
    this._emit('system.error', { source: 'agent-factory', context: ctx, message: msg });
    this._emit('system.toast', { msg: `Factory: ${msg}`, type: 'r' });
  }

  /**
   * Full dispatch pipeline:
   *   raw input → parse → route → execute
   *
   * dispatch(input: string|Intent, meta?, context?) → result
   */
  async dispatch(input, meta = {}, context = {}) {
    // 1. Route to execution plan
    let plan;
    try {
      plan = this._router.route(input, meta);
    } catch (e) {
      this._fail('route', e.message);
      throw e;
    }

    // 2. Execute plan
    return this.execute(plan, context);
  }

  /**
   * Execute a pre-built plan.
   * execute(plan: ExecutionPlan, context?) → result
   */
  async execute(plan, context = {}) {
    const { agentType, intentId, traceId } = plan;

    this._stats.executed++;
    this._emit('workflow.step.start', { traceId, intentId, agentType, step: plan.steps?.[0]?.id });

    let agent;
    try {
      agent = this._registry.get(agentType);
    } catch (e) {
      // Registry fails loudly — rethrow with context
      this._fail('getAgent', e.message, { traceId, intentId });
      throw e;
    }

    let result;
    try {
      result = await agent.run(plan, context);
    } catch (e) {
      this._fail('execute', e.message, { traceId, intentId, agentType });
      this._emit('workflow.step.failed', { traceId, intentId, agentType, error: e.message });
      throw e;
    }

    this._emit('workflow.step.complete', {
      traceId,
      intentId,
      agentType,
      step:    plan.steps?.[0]?.id,
      hasResult: !!result,
    });

    return result;
  }

  health() {
    return {
      ok:       true,
      uuid:     this.uuid,
      version:  this.version,
      stats:    { ...this._stats },
      registry: this._registry.health(),
      router:   this._router.health(),
    };
  }
}

const FACTORY = new AgentFactory();

module.exports = { AgentFactory, FACTORY };

---

# BrainOS-main/agent-registry.js

/**
 * agent-registry.js — BrainOS Agent Registry
 * UUID: brainos-agent-registry-v5000-000000000014
 * Phase 3 · Agent Abstraction Layer
 *
 * Central registry of all available agents.
 * Agents register themselves. Registry selects best agent for an intent.
 * Publishes health snapshots on bus. Fails loudly on misconfiguration.
 *
 * Axiom: no agent is called directly — always through registry → factory → bus.
 */

'use strict';

const { AIAgent }          = require('./agents/ai-agent');
const { AutomationAgent }  = require('./agents/automation-agent');
const { SystemAgent }      = require('./agents/system-agent');

const MODULE_UUID    = 'brainos-agent-registry-v5000-000000000014';
const MODULE_VERSION = '5.0.0';

class AgentRegistry {
  constructor(opts = {}) {
    this.uuid      = MODULE_UUID;
    this.version   = MODULE_VERSION;
    this._bus      = null;
    this._agents   = new Map();   // type → Agent instance
    this._stats    = { registered: 0, lookups: 0, notFound: 0 };
    this._opts     = opts;
  }

  /**
   * Wire to event bus AND register all built-in agents.
   * Called once at boot.
   */
  init(bus, opts = {}) {
    this._bus = bus;

    // Register built-in agents
    this.register(new AIAgent({ bridgeUrl: opts.bridgeUrl }));
    this.register(new AutomationAgent({ bridgeUrl: opts.bridgeUrl }));
    this.register(new SystemAgent({ bridgeUrl: opts.bridgeUrl }));

    // Emit health snapshots every 30s
    setInterval(() => this._broadcastHealth(), 30000);

    bus.on('agent.register', ev => {
      this._emit('system.toast', { msg: `Agent registered: ${ev.data?.type}`, type: 'b' });
    });

    this._emit('system.audit', { event: 'registry.init', agents: [...this._agents.keys()] });
    console.log(`[AgentRegistry] Initialized with ${this._agents.size} agents`);
  }

  setBus(bus) { this._bus = bus; }

  _emit(type, data) {
    if (this._bus) this._bus.emit(type, data, { source: 'agent-registry' });
  }

  _fail(ctx, msg) {
    console.error(`[AGENT-REGISTRY] ${ctx}: ${msg}`);
    this._emit('system.error', { source: 'agent-registry', context: ctx, message: msg });
    this._emit('system.toast', { msg: `Registry: ${msg}`, type: 'r' });
  }

  /**
   * Register an agent instance.
   * Agent must extend BaseAgent and implement canHandle() + execute().
   */
  register(agent) {
    if (!agent || typeof agent.execute !== 'function') {
      this._fail('register', 'Agent must implement execute()');
      return;
    }
    if (!agent.type) {
      this._fail('register', 'Agent must have a type string');
      return;
    }
    if (this._agents.has(agent.type)) {
      console.warn(`[AgentRegistry] Overwriting existing agent: ${agent.type}`);
    }

    agent.setBus(this._bus);
    this._agents.set(agent.type, agent);
    this._stats.registered++;
    this._emit('agent.register', { agentId: agent.id, agentType: agent.type });
  }

  /**
   * Get agent by type.
   * Throws loudly if not found (never returns null silently).
   */
  get(type) {
    this._stats.lookups++;
    const agent = this._agents.get(type);
    if (!agent) {
      this._stats.notFound++;
      this._fail('get', `No agent registered for type: "${type}". Registered: ${[...this._agents.keys()].join(', ')}`);
      throw new Error(`AgentRegistry: no agent of type "${type}"`);
    }
    return agent;
  }

  /**
   * Find the best available agent for an intent.
   * Returns { agentId, agentType, available }
   */
  findBest(agentType, intent) {
    this._stats.lookups++;

    // Try exact type first
    if (this._agents.has(agentType)) {
      const agent = this._agents.get(agentType);
      if (agent.canHandle(intent)) {
        return { agentId: agent.id, agentType: agent.type, available: true };
      }
    }

    // Scan all agents for canHandle
    for (const [type, agent] of this._agents) {
      if (agent.canHandle(intent)) {
        return { agentId: agent.id, agentType: type, available: true };
      }
    }

    // Fallback to AIAgent (most

---

# BrainOS-main/bootloader.js

/**
 * bootloader.js — BrainOS Bootloader
 * UUID: brainos-bootloader-v5000-000000000017
 * Phase 0 · Critical Stability
 *
 * Single entry point. Deterministic boot order. Safe-fail on every phase.
 * Every failure is loud and logged. Nothing silently pretends to work.
 *
 * Boot order (from roadmap Phase 0):
 *   1. config load
 *   2. event bus init
 *   3. intent router init
 *   4. agent registry init
 *   5. bridge connect
 *   6. workflow engine init
 *   7. plugin handshake
 *   8. ready
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const http = require('http');

const MODULE_UUID = 'brainos-bootloader-v5000-000000000017';
const VERSION     = '5.0.0';

// Deferred requires — only load after bus is up
function loadModules() {
  return {
    BUS:    require('./bus').BUS,
    PARSER: require('./intent-parser').PARSER,
    SCORER: require('./intent-scoring').SCORER,
    ROUTER: require('./intent-router').ROUTER,
    REGISTRY: require('./agent-registry').REGISTRY,
    FACTORY:  require('./agent-factory').FACTORY,
    ENGINE:   require('./workflow-engine').ENGINE,
  };
}

// ── Phase runner — executes phases in order, loud on any failure ──────────────
class Bootloader {
  constructor(opts = {}) {
    this.uuid     = MODULE_UUID;
    this.version  = VERSION;
    this.dataDir  = opts.dataDir  || path.join(__dirname, 'data');
    this.port     = opts.port     || null;     // bridge port if running server mode
    this.bridgeScan = opts.bridgeScan !== false; // scan for existing bridge
    this._health  = {
      config:    { ok: false },
      bus:       { ok: false },
      router:    { ok: false },
      agents:    { ok: false },
      bridge:    { ok: false, url: null },
      workflows: { ok: false },
      ready:     false,
      startedAt: null,
      readyAt:   null,
      elapsedMs: null,
    };
    this._modules = null;
  }

  /** Main boot sequence. Returns health report. */
  async boot() {
    this._health.startedAt = Date.now();
    console.log(`\n[BOOTLOADER] BrainOS v${VERSION} booting...`);
    console.log(`[BOOTLOADER] Data dir: ${this.dataDir}\n`);

    await this._phase('config',    () => this._loadConfig());
    await this._phase('bus',       () => this._initBus());
    await this._phase('router',    () => this._initRouter());
    await this._phase('agents',    () => this._initAgents());
    await this._phase('bridge',    () => this._connectBridge());
    await this._phase('workflows', () => this._initWorkflows());
    await this._phase('plugin',    () => this._pluginHandshake());

    this._health.ready   = true;
    this._health.readyAt = Date.now();
    this._health.elapsedMs = this._health.readyAt - this._health.startedAt;

    const ok = Object.values(this._health)
      .filter(v => typeof v === 'object' && v !== null)
      .every(v => v.ok !== false);

    this._writeHealthFile();

    this._modules.BUS.emit('system.ready', {
      version: VERSION,
      elapsedMs: this._health.elapsedMs,
      bridge:  this._health.bridge.url,
    });

    console.log(`\n[BOOTLOADER] ✓ Ready in ${this._health.elapsedMs}ms`);
    console.log(`[BOOTLOADER] Bridge: ${this._health.bridge.url || 'disconnected'}\n`);

    return this._health;
  }

  /** Run a named phase. Catches and logs — never throws from _phase(). */
  async _phase(name, fn) {
    process.stdout.write(`[BOOT] ${name.padEnd(12)} ... `);
    try {
      const result = await fn();
      this._health[name] = { ok: true, ...(result || {}) };
      console.log('✓');
    } catch (err) {
      this._health[name] = { ok: false, error: err.message };
      console.log(`✗  ${err.message}`);
      // Emit error if bus is already up
      if (this._modules?.BUS) {
        this._modules.BUS.emit('system.error', {
          source:  'bootloader',
          phase:   name,
          message: err.message,
        });
      }
      // Only abort on bus failure (everything else can degrade gracefully)
      if (name === 'bus') throw err;

---

# BrainOS-main/bridge-canvas-persistence.js

/**
 * BRIDGE CANVAS PERSISTENCE — Phase 1 Foundation
 * UUID: bridge-canvas-persist-0001-phase1-foundation
 *
 * Adds 6 routes to nexus-bridge-server.js:
 *   GET  /canvas/state          — load full canvas state from disk
 *   POST /canvas/state          — save full canvas state to disk (debounced internally)
 *   GET  /canvas/nodes          — node registry only
 *   POST /canvas/node           — upsert a single node (UUID-keyed)
 *   DELETE /canvas/node/:id     — remove node from registry
 *   GET  /canvas/deltas         — delta log (last N, filterable)
 *   POST /canvas/delta          — append a delta entry
 *   GET  /canvas/snr-rules      — load SNR rules
 *   POST /canvas/snr-rules      — save full SNR rules array
 *   GET  /canvas/keys           — load key rotation state
 *   POST /canvas/keys           — save key rotation state
 *   GET  /canvas/health         — canvas persistence layer health
 *
 * Storage layout (all under DATA_DIR):
 *   canvas-state.json     — full canvas snapshot (nodes, tunnels, cam)
 *   canvas-nodes.json     — UUID-keyed node registry
 *   canvas-deltas.jsonl   — append-only delta log
 *   canvas-snr-rules.json — SNR filter rules
 *   canvas-keys.json      — key rotation timestamps + config
 *
 * Axioms enforced:
 *   - Nothing exists until proven (watchdog verifies files on init)
 *   - Persistence is the golden rule (every write is atomic via temp+rename)
 *   - No fake data — if file missing, returns empty not mock
 *   - UUIDs on everything
 *   - Bridge is the persistence layer — canvas is a client
 *   - Pre-emptive bug fixes: atomic writes, parse guards, CORS, error logging
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Schema version — bump when canvas state shape changes ────────────────────
const SCHEMA_VERSION = 1;
const MAX_DELTAS     = 5000; // JSONL cap before rotation

// ── Module state ─────────────────────────────────────────────────────────────
let _dataDir   = null;
let _busEmit   = () => {};
let _saveCfg   = () => {};
let _installed = false;

// File paths (set on install)
const P = {};

// ── Atomic write — temp + rename, never corrupts on crash ────────────────────
function atomicWrite(filePath, content) {
  const tmp = filePath + '.tmp.' + crypto.randomBytes(4).toString('hex');
  try {
    fs.writeFileSync(tmp, content, 'utf8');
    fs.renameSync(tmp, filePath);
    return true;
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch {}
    throw err;
  }
}

// ── Safe JSON parse — never throws ───────────────────────────────────────────
function safeJSON(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

// ── Read file or return null (no throw) ──────────────────────────────────────
function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch { return null; }
}

// ── Watchdog — verify all storage files exist and are readable ───────────────
function watchdog() {
  const results = {};
  for (const [key, filePath] of Object.entries(P)) {
    const exists = fs.existsSync(filePath);
    const readable = exists ? (() => { try { fs.readFileSync(filePath, 'utf8'); return true; } catch { return false; } })() : false;
    results[key] = { exists, readable, path: filePath };
  }
  const allOk = Object.values(results).every(r => !r.exists || r.readable);
  _busEmit('canvas:watchdog', { results, allOk }, allOk ? 'INFO' : 'ERROR');
  return { ok: allOk, results };
}

// ── Init storage files if absent ─────────────────────────────────────────────
function ensureStorageFiles() {
  // canvas-state.json
  if (!fs.existsSync(P.state)) {
    atomicWrite(P.state, JSON.stringify({
      schema: SCHEMA_VERSION,
      version: '3.2.0',
      created: Date.now(),
      savedAt: null,
      nodes: [],
      tunnels: [],
      cam: { x: 0, y: 0, z: 1 },
      snrConfig: { threshold: 5, fastLane: 7, blockBelow: 2, m

---

# BrainOS-main/bus.js

/**
 * bus.js — BrainOS Event Bus
 * UUID: brainos-bus-module-v5000-0000-000000000001
 * Hook: brainos.bus:bus-v5:b0001
 *
 * SISO-native typed event bus. All BrainOS modules communicate
 * exclusively through this bus. No direct function calls between modules.
 *
 * Architecture: Event → Gate → Stream (SISO pattern)
 * - Typed events with UUID IDs
 * - Wildcard subscriptions (*) supported
 * - Replay buffer (last N events per type)
 * - Signature collision is a hard error
 * - Everything fails loudly — no silent swallowing
 */

'use strict';

const MODULE_UUID = 'brainos-bus-module-v5000-0000-000000000001';
const MODULE_VERSION = '5.0.0';

// ── Tiny uid (no deps) ────────────────────────────────────────────────────────
function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Log levels (mirrors SISO StreamLog) ──────────────────────────────────────
const LOG_LEVELS = { OFF: 0, EVENTS: 1, DEEP: 2, DATA: 3 };

class BusLog {
  constructor(level = 'EVENTS') {
    this.level = level;
    this.entries = [];
    this.seq = 0;
    this.maxEntries = 10000;
  }

  record(entry) {
    const lvl = LOG_LEVELS[this.level] || 0;
    if (lvl === 0) return;
    const e = { seq: this.seq++, ts: Date.now(), type: entry.type, claimed: entry.claimed };
    if (lvl >= 2) e.eventId = entry.eventId;
    if (lvl >= 3) e.data = entry.data;
    this.entries.push(e);
    if (this.entries.length > this.maxEntries) this.entries.shift();
  }

  sample() { return { level: this.level, count: this.entries.length, entries: [...this.entries] }; }
  clear() { this.entries = []; this.seq = 0; }
}

// ── BusEvent (SISO Event equivalent) ─────────────────────────────────────────
class BusEvent {
  constructor(type, data = {}, meta = {}) {
    this.id = uid();
    this.type = type;
    this.data = data;
    this.ts = Date.now();
    this.source = meta.source || 'unknown';
  }
}

// ── EventBus ─────────────────────────────────────────────────────────────────
class EventBus {
  constructor(options = {}) {
    this.uuid = MODULE_UUID;
    this.version = MODULE_VERSION;
    this._handlers = new Map();       // type → Set<{id, fn}>
    this._wildcards = new Set();      // { id, fn }
    this._replayBuffer = new Map();   // type → BusEvent (last N)
    this._replaySize = options.replaySize || 1;
    this._log = new BusLog(options.logLevel || 'EVENTS');
    this._auditLog = [];
    this._errorHandlers = new Set();
    this._stats = { emitted: 0, claimed: 0, pending: 0, errors: 0 };
  }

  /**
   * Subscribe to a specific event type (or '*' for all).
   * Returns an unsubscribe function.
   * Fails loudly if fn is not a function.
   */
  on(type, fn, meta = {}) {
    if (typeof fn !== 'function') {
      this._fail('BUS.on', `Handler for '${type}' must be a function, got ${typeof fn}`);
      throw new Error(`BUS: Handler for '${type}' must be a function`);
    }
    const id = uid();
    const entry = { id, fn, source: meta.source || 'unknown', once: false };

    if (type === '*') {
      this._wildcards.add(entry);
    } else {
      if (!this._handlers.has(type)) this._handlers.set(type, new Set());
      this._handlers.get(type).add(entry);
    }

    // Replay last event of this type to new subscriber
    if (type !== '*' && this._replayBuffer.has(type)) {
      try { fn(this._replayBuffer.get(type)); } catch (e) { this._fail('BUS.on.replay', e.message); }
    }

    return () => this._off(type, id);
  }

  /**
   * Subscribe once — auto-unsubscribes after first event.
   */
  once(type, fn, meta = {}) {
    const id = uid();
    const entry = { id, fn, source: meta.source || 'unknown', once: true };
    if (type === '*') {
      this._wildcards.add(entry);
    } else {
      if (!this._handlers.has(type)) this._handlers.set(type, new Set());
      this._handlers.get(type).add(entry);
    }
    return () => this._off(type,

---

# BrainOS-main/crypto-engine.js

/**
 * NEXUS Crypto Engine — v1.0.0
 * UUID: crypto-engine-module-v1000-0000-000000000001
 *
 * Standalone cryptographic primitives. Zero external dependencies.
 * Pure Node.js crypto. No opinions about persistence or routing.
 *
 * Consumed by: key-manager.js, snr-filter.js, vault, anything needing real crypto.
 *
 * Primitives:
 *   ECDH P-256          — keypair generation + shared secret derivation
 *   AES-256-GCM         — authenticated encryption / decryption
 *   HKDF-SHA256         — key derivation from shared secret
 *   scrypt              — password-based key derivation
 *   HMAC-SHA256         — message authentication
 *   SHA-256 / SHA-512   — hashing
 *   Random              — cryptographically secure random bytes / UUIDs / tokens
 *   Key wrapping        — encrypt a key with another key (AES-256-GCM)
 *
 * Design axioms:
 *   - Every operation returns a typed result object, never throws silently
 *   - All errors are explicit — { ok: false, error: '...' }
 *   - Keys are never logged or emitted to bus
 *   - Input validation before every operation
 *   - Constant-time comparison for secrets (timingSafeEqual)
 */

'use strict';

const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────
const VERSION     = '1.0.0';
const MODULE_UUID = 'crypto-engine-module-v1000-0000-000000000001';

const ALG = {
  ECDH:    'prime256v1',   // P-256
  AES_GCM: 'aes-256-gcm',
  HMAC:    'sha256',
  HASH256: 'sha256',
  HASH512: 'sha512',
};

const SIZES = {
  IV:       16,   // AES-GCM IV bytes
  TAG:      16,   // GCM auth tag bytes
  SALT:     32,   // scrypt salt bytes
  KEY:      32,   // AES-256 key bytes
  HKDF_OUT: 32,   // HKDF output bytes
  TOKEN:    32,   // random token bytes
};

// ─── Result helpers ───────────────────────────────────────────────────────────
const ok  = (data)  => ({ ok: true,  ...data });
const err = (msg, detail = null) => ({ ok: false, error: msg, detail });

// ─── Input guards ─────────────────────────────────────────────────────────────
function requireBuffer(val, name) {
  if (Buffer.isBuffer(val)) return null;
  if (typeof val === 'string') return null; // hex strings accepted
  return `${name} must be Buffer or hex string`;
}

function toBuffer(val, name) {
  if (Buffer.isBuffer(val)) return { buf: val, err: null };
  if (typeof val === 'string') {
    try { const b = Buffer.from(val, 'hex'); return { buf: b, err: null }; }
    catch { return { buf: null, err: `${name}: invalid hex string` }; }
  }
  return { buf: null, err: `${name}: expected Buffer or hex string, got ${typeof val}` };
}

// ─── CryptoEngine class ───────────────────────────────────────────────────────
class CryptoEngine {
  constructor() {
    this.version    = VERSION;
    this.uuid       = MODULE_UUID;
    this._keyCache  = new Map(); // derived key cache (keyed by derivation params)
  }

  // ═══════════════════════════════════════════════════════
  // RANDOM
  // ═══════════════════════════════════════════════════════

  /**
   * Cryptographically secure random bytes.
   * @param {number} bytes
   * @returns {{ ok, hex, buffer, bytes }}
   */
  randomBytes(bytes = SIZES.TOKEN) {
    if (!Number.isInteger(bytes) || bytes < 1 || bytes > 65536)
      return err('randomBytes: bytes must be integer 1–65536');
    try {
      const buf = crypto.randomBytes(bytes);
      return ok({ hex: buf.toString('hex'), buffer: buf, bytes });
    } catch (e) { return err('randomBytes failed', e.message); }
  }

  /**
   * Cryptographically secure UUID v4.
   */
  randomUUID() {
    try { return ok({ uuid: crypto.randomUUID() }); }
    catch (e) { return err('randomUUID failed', e.message); }
  }

  /**
   * Random token — URL-safe base64.
   * @param {number} bytes
   */
  randomToken(bytes = SIZES.TOKEN) {
    const r = this.randomBytes(bytes);
    if (!r.ok) return r;
    return ok({ token: r.buffer.toString('base64url'), bytes });
  }

  // ══════════════════════════════════════

---

# BrainOS-main/ddns.js

/**
 * ddns.js — BrainOS Dynamic DNS Client
 * UUID: brainos-ddns-module-v5000-0000-000000000005
 *
 * No-IP style DDNS. Detects public IP changes, updates records.
 * No port forwarding required via tunnel relay.
 * Cloudflare + custom DNS integration. Fails loudly.
 */
'use strict';

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const MODULE_UUID = 'brainos-ddns-module-v5000-0000-000000000005';

function uid() {
  return crypto.randomBytes(16).toString('hex');
}

// IP detection services (tried in order)
const IP_SOURCES = [
  'https://api.ipify.org',
  'https://ifconfig.me/ip',
  'https://checkip.amazonaws.com',
  'https://ipecho.net/plain',
];

async function getPublicIP(timeoutMs = 5000) {
  for (const url of IP_SOURCES) {
    try {
      const ip = await new Promise((resolve, reject) => {
        const req = (url.startsWith('https') ? https : http).get(url, { timeout: timeoutMs }, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(d.trim()));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      });
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return ip;
    } catch { /* try next source */ }
  }
  throw new Error('Could not detect public IP from any source');
}

class DDNSClient {
  constructor(opts = {}) {
    this.uuid     = MODULE_UUID;
    this.dataDir  = opts.dataDir || './data';
    this.stateFile = path.join(this.dataDir, 'ddns-state.json');
    this._state   = { lastIP: null, entries: {}, lastCheck: null };
    this._timer   = null;
    this._bus     = null;
    this._stats   = { checks: 0, updates: 0, errors: 0 };
    this._load();
  }

  setBus(bus) {
    this._bus = bus;
    bus.on('net.ddns.force_check', () => this.check());
    bus.on('net.ddns.add_entry',   ev => this.addEntry(ev.data));
  }

  _emit(t, d) { if (this._bus) this._bus.emit(t, d, { source: 'ddns' }); }

  _fail(ctx, msg) {
    console.error(`[DDNS ERROR] ${ctx}: ${msg}`);
    this._stats.errors++;
    this._emit('system.error', { source: 'ddns', context: ctx, message: msg });
  }

  _load() {
    try {
      if (fs.existsSync(this.stateFile))
        this._state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } catch (e) { this._fail('load', e.message); }
  }

  _save() {
    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
      const tmp = this.stateFile + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this._state, null, 2));
      fs.renameSync(tmp, this.stateFile);
    } catch (e) { this._fail('save', e.message); }
  }

  /** Add a DDNS entry. Returns a token for updates. */
  addEntry({ hostname, provider = 'internal', config = {} }) {
    const token = uid();
    this._state.entries[hostname] = { hostname, provider, config, token, ip: null, updated: null };
    this._save();
    this._emit('net.ddns.entry_added', { hostname, token });
    return { hostname, token };
  }

  /** Check public IP and update all entries if changed */
  async check() {
    this._stats.checks++;
    this._state.lastCheck = Date.now();
    let ip;
    try { ip = await getPublicIP(); }
    catch (e) { this._fail('getPublicIP', e.message); return; }

    const changed = ip !== this._state.lastIP;
    this._state.lastIP = ip;
    this._emit('net.ddns.ip_detected', { ip, changed });

    if (changed) {
      for (const entry of Object.values(this._state.entries)) {
        await this._updateEntry(entry, ip).catch(e => this._fail('update', e.message));
      }
    }
    this._save();
    return { ip, changed };
  }

  async _updateEntry(entry, ip) {
    switch (entry.provider) {
      case 'cloudflare':   await this._updateCloudflare(entry, ip); break;
      case 'noip':         await this._updateNoIP(entry, ip); break;
      case 'dyndns':       await this._updateDynDNS(entry,