---
chunk_uuid: 8017a650-96c8-4fc5-8abf-fb63c782c2cc
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-cortex-config-js
title: nexus/cortex/config.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-cortex-config-js
contract_id: spec-contract:47e02ad5:nexus-cortex-config-js:8017a650
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:23.475Z
---

'use strict';
/**
 * cortex/config.js — real, distinct config, not inline constants
 * scattered across cortex/boot.js. Matches the pattern established by
 * guardian/config.js, copilot/config.js, bridge/config.js,
 * eravos/config.js, loom/config.js, and intelligence/config.js.
 *
 * §SCOPE — PORT (cortex's own) plus 4 real cross-system URLs cortex
 * calls out to: orchestrator, guardian, ollama, and intelligence
 * (IN_PORT — used to build the real proxy routes to /api/intelligence/*
 * built earlier this session). ROOT is left in boot.js — a structural
 * path derived from __dirname, not a tunable.
 */

module.exports = {
  PORT:    parseInt(process.env.NEXUS_PORT || '3748', 10),
  OR_URL:  process.env.ORCH_URL || 'http://127.0.0.1:9000',
  GD_URL:  process.env.GUARDIAN_URL || 'http://127.0.0.1:7820',
  OL_URL:  process.env.OLLAMA_URL   || 'http://127.0.0.1:3749',
  IN_PORT: parseInt(process.env.INTELLIGENCE_PORT || '3753', 10),
};