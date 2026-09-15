---
chunk_uuid: d7c734b0-fad3-4893-9019-cbe92d671851
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-loom-schema-index-js
title: nexus/loom/schema/index.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-loom-schema-index-js
contract_id: spec-contract:47e02ad5:nexus-loom-schema-index-js:d7c734b0
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:08:12.161Z
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