---
chunk_uuid: 3bce6d6e-7bee-4639-93ec-1a2818d5c3a2
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-333-nexus-idearium-core-index-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/333-nexus-idearium-core-index-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-333-nexus-idearium-core-index-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-333-nexus-idearium-core-index-js-md:3bce6d6e
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:23:15.258Z
---

// ── idearium/core/index.js ────────────────────────────────────────────────────
// Re-exports from idearium/index.js (the actual IdeaOS implementation).
// This file was deleted during the audit cleanup but is required by api/index.js.
// §M1 compliant — no logic lives here, all in ../index.js.
export { getIdeaOS, VERSION, NAMESPACE, PORT,
         IDEA_PHASES, GAP_STATUSES, GAP_SEVERITIES, LINK_TYPES,
         SNR_WEIGHTS } from '../index.js';