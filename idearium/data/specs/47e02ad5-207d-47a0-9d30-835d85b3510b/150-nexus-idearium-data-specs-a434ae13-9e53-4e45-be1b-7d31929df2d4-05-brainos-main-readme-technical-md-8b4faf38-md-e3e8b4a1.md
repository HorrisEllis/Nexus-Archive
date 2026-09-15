---
chunk_uuid: e3e8b4a1-3dec-4ce0-bfc1-b4d2b4f1fbec
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-05-brainos-main-readme-technical-md-8b4faf38-md
title: nexus/idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/05-brainos-main-readme-technical-md-8b4faf38.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-05-brainos-main-readme-technical-md-8b4faf38-md
contract_id: spec-contract:47e02ad5:nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-05-brainos-main-readme-technical-md-8b4faf38-md:e3e8b4a1
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:47.720Z
---

---
chunk_uuid: 8b4faf38-9636-4761-b398-0df93821b3d0
spec_uuid: a434ae13-9e53-4e45-be1b-7d31929df2d4
section: brainos-main-readme-technical-md
title: BrainOS-main/README-technical.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a434ae13:brainos-main-readme-technical-md
contract_id: spec-contract:a434ae13:brainos-main-readme-technical-md:8b4faf38
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:26:54.512Z
---

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