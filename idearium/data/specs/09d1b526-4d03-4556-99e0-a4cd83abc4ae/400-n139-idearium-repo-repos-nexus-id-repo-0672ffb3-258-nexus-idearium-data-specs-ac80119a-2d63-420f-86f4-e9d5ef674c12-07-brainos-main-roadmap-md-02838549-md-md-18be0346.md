---
chunk_uuid: 18be0346-faa3-49d2-9b91-42eca88d4581
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-258-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-07-brainos-main-roadmap-md-02838549-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/258-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-07-brainos-main-roadmap-md-02838549-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-258-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-07-brainos-main-roadmap-md-02838549-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-258-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-07-brainos-main-roadmap-md-02838549-md-md:18be0346
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:24:12.138Z
---

---
chunk_uuid: 02838549-091c-4324-9a5a-44b521f6de3f
spec_uuid: ac80119a-2d63-420f-86f4-e9d5ef674c12
section: brainos-main-roadmap-md
title: BrainOS-main/ROADMAP.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac80119a:brainos-main-roadmap-md
contract_id: spec-contract:ac80119a:brainos-main-roadmap-md:02838549
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:28:01.736Z
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