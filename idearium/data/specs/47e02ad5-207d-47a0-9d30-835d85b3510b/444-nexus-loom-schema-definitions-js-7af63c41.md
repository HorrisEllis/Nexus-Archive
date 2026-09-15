---
chunk_uuid: 7af63c41-4a03-4d83-9ed0-8451614d58f4
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-loom-schema-definitions-js
title: nexus/loom/schema/definitions.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-loom-schema-definitions-js
contract_id: spec-contract:47e02ad5:nexus-loom-schema-definitions-js:7af63c41
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:08:13.602Z
---

'use strict';
/**
 * loom/schema/definitions.js — LOOM Phase 131: component/seam/hook/wire
 * schema.
 * comp_id: nexus.loom.schema
 * UUID: nexus-loom-schema-v1-0000-2026-0701-jamesbrooks-001
 * Spec source: NEXUS-LATTICE-COGNITION-ROADMAP-v0.2.md, phase-map entry 131
 *
 * §SPLIT 2026-09-03 — James: "look at all the rest. all schemas should be
 * seperated." Was a 5-schema monolith (component/seam/hook/wire/concern
 * all defined inline in this one file) — same shape lib/node-schemas.js
 * was before its own split earlier this session. This file is now a real
 * thin loader, same real export names as before (both real consumers —
 * lib/node-schemas/component.js's destructure, and anything else that
 * requires this file — keep working unchanged), sourcing each schema
 * from its own file under this directory instead of defining it inline.
 *
 * Four primitives, matching the four nouns James named, plus concern
 * (added 2026-07-14). Each mirrors the shape architect/registry-
 * components.js already uses for its own per-component declarations
 * (id, namespace, version, tags) so LOOM doesn't invent a fifth
 * convention next to Architect's existing one.
 */

const { COMPONENT_SCHEMA }               = require('./component.js');
const { SEAM_SCHEMA }                    = require('./seam.js');
const { HOOK_SCHEMA, KNOWN_HOOK_TYPES }  = require('./hook.js');
const { WIRE_SCHEMA }                    = require('./wire.js');
const { CONCERN_SCHEMA }                 = require('./concern.js');

module.exports = {
  KNOWN_HOOK_TYPES,
  COMPONENT_SCHEMA,
  SEAM_SCHEMA,
  HOOK_SCHEMA,
  WIRE_SCHEMA,
  CONCERN_SCHEMA,
};