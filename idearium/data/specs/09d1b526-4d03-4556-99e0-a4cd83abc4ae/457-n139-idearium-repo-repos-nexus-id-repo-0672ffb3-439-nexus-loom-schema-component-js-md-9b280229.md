---
chunk_uuid: 9b280229-18fd-41e3-9879-d6233859aec4
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-439-nexus-loom-schema-component-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/439-nexus-loom-schema-component-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-439-nexus-loom-schema-component-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-439-nexus-loom-schema-component-js-md:9b280229
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:25:27.443Z
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