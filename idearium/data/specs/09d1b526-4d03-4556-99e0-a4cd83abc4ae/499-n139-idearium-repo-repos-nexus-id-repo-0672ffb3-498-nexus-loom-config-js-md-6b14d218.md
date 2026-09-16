---
chunk_uuid: 6b14d218-d1de-4e11-a07c-ac3e551385b1
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-498-nexus-loom-config-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/498-nexus-loom-config-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-498-nexus-loom-config-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-498-nexus-loom-config-js-md:6b14d218
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:26:23.801Z
---

'use strict';
/**
 * loom/config.js — real, distinct config, not inline constants
 * scattered across loom/server.js. Matches the pattern established by
 * guardian/config.js, copilot/config.js, bridge/config.js, and
 * eravos/config.js earlier this session.
 *
 * §SCOPE — PORT, DIAG_URL, and OR_URL are the real, tunable config
 * values (checked directly). SYSTEM_ID left in server.js, matching
 * every other config.js's precedent — a fixed identity string, not
 * a config value. SCAFFOLD_TEMPLATES also left in place — a real,
 * structural data array, not a numeric/string tunable.
 */

module.exports = {
  PORT: parseInt(process.env.LOOM_PORT || '3752', 10),
  DIAG_URL: process.env.DIAGNOSTIC_URL || 'http://127.0.0.1:7825',
  OR_URL: process.env.ORCH_URL || 'http://127.0.0.1:9000',
};