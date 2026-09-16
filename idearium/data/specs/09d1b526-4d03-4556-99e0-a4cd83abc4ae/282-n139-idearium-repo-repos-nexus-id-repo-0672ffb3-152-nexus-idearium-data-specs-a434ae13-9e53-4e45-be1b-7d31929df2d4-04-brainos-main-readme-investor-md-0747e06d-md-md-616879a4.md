---
chunk_uuid: 616879a4-f275-4298-b182-290169631889
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-152-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-04-brainos-main-readme-investor-md-0747e06d-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/152-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-04-brainos-main-readme-investor-md-0747e06d-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-152-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-04-brainos-main-readme-investor-md-0747e06d-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-152-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-04-brainos-main-readme-investor-md-0747e06d-md-md:616879a4
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:21:38.786Z
---

---
chunk_uuid: 0747e06d-b13f-4a9b-9dde-c92114652792
spec_uuid: a434ae13-9e53-4e45-be1b-7d31929df2d4
section: brainos-main-readme-investor-md
title: BrainOS-main/README-investor.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a434ae13:brainos-main-readme-investor-md
contract_id: spec-contract:a434ae13:brainos-main-readme-investor-md:0747e06d
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:26:54.507Z
---

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