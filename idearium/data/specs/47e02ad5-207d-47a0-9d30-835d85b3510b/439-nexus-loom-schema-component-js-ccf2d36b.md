---
chunk_uuid: ccf2d36b-d4a1-4413-912e-fc25c372e4ec
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-loom-schema-component-js
title: nexus/loom/schema/component.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-loom-schema-component-js
contract_id: spec-contract:47e02ad5:nexus-loom-schema-component-js:ccf2d36b
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:08:09.516Z
---

'use strict';
/**
 * loom/schema/component.js — Component: a named, versioned unit of the
 * system. Mirrors architect/registry-components.js's _c() shape.
 * §SPLIT 2026-09-03 — James: "look at all the rest. all schemas should be
 * seperated." Was one entry inside loom/schema/definitions.js (a
 * 5-schema monolith, same shape lib/node-schemas.js was before its own
 * split this same session). Content unchanged — a pure move.
 */
const COMPONENT_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'namespace', 'name', 'version'],
  types: {
    id: 'string', namespace: 'string', name: 'string', version: 'string',
  },
  // uuid is required too, but enforced by the loom.uuid-present Axiom,
  // not duplicated here — see axioms.js. Two mechanisms guarding one
  // field means the first one to run silently decides the reason code;
  // the Axiom runs first in driver.js, so it's the single authority.
});

module.exports = { COMPONENT_SCHEMA };