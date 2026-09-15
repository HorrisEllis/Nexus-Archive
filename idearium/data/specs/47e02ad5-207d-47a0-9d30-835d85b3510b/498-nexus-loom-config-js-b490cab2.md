---
chunk_uuid: b490cab2-f52f-4b0a-a5c8-a5ba1dd7ba05
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-loom-config-js
title: nexus/loom/config.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-loom-config-js
contract_id: spec-contract:47e02ad5:nexus-loom-config-js:b490cab2
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:08:58.371Z
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