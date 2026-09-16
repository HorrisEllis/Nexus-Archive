---
chunk_uuid: e9be8285-a7e6-4504-bf58-5cab4f383ea1
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-192-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-07-brainos-main-roadmap-md-038ab3ce-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/192-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-07-brainos-main-roadmap-md-038ab3ce-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-192-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-07-brainos-main-roadmap-md-038ab3ce-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-192-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-07-brainos-main-roadmap-md-038ab3ce-md-md:e9be8285
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:21:11.493Z
---

---
chunk_uuid: 038ab3ce-19b7-4c8b-8b17-15ae9eadeafb
spec_uuid: 78a72e70-56a9-4c94-987f-c7285f1b1de2
section: brainos-main-roadmap-md
title: BrainOS-main/ROADMAP.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:78a72e70:brainos-main-roadmap-md
contract_id: spec-contract:78a72e70:brainos-main-roadmap-md:038ab3ce
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:27:34.714Z
---

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