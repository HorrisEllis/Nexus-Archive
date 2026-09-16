---
chunk_uuid: 55a5ca61-1829-462c-bde7-e7b3bd92b885
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-442-nexus-loom-schema-index-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/442-nexus-loom-schema-index-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-442-nexus-loom-schema-index-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-442-nexus-loom-schema-index-js-md:55a5ca61
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:22:12.922Z
---

'use strict';
/**
 * loom/schema/index.js — public surface of Phase 131.
 * comp_id: nexus.loom.schema (entry point)
 *
 * Everything CLI (Phase 132) and API (Phase 133-adjacent, per the stated
 * order CLI-then-API) will call lives behind this one export. Neither
 * layer touches gates.js, axioms.js, or registry.js directly.
 */
const { LoomDriver } = require('./driver');
const definitions = require('./definitions');

module.exports = { LoomDriver, ...definitions };