---
chunk_uuid: 7f185598-8ea3-4245-aaa0-ee6637a3b53d
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-core-index-js
title: nexus/idearium/core/index.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-core-index-js
contract_id: spec-contract:47e02ad5:nexus-idearium-core-index-js:7f185598
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:07.687Z
---

// ── idearium/core/index.js ────────────────────────────────────────────────────
// Re-exports from idearium/index.js (the actual IdeaOS implementation).
// This file was deleted during the audit cleanup but is required by api/index.js.
// §M1 compliant — no logic lives here, all in ../index.js.
export { getIdeaOS, VERSION, NAMESPACE, PORT,
         IDEA_PHASES, GAP_STATUSES, GAP_SEVERITIES, LINK_TYPES,
         SNR_WEIGHTS } from '../index.js';