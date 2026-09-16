---
chunk_uuid: d6503fbe-9f3c-412a-907f-c96e73b0df30
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-72-nexus-cortex-config-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/72-nexus-cortex-config-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-72-nexus-cortex-config-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-72-nexus-cortex-config-js-md:d6503fbe
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:20:10.860Z
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