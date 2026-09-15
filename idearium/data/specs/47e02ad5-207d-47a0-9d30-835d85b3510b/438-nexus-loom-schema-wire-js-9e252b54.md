---
chunk_uuid: 9e252b54-a573-4148-9efb-01abea42e869
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-loom-schema-wire-js
title: nexus/loom/schema/wire.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-loom-schema-wire-js
contract_id: spec-contract:47e02ad5:nexus-loom-schema-wire-js:9e252b54
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:08:08.926Z
---

'use strict';
/**
 * loom/schema/wire.js — Wire: the connection between exactly two hooks.
 * §SPLIT 2026-09-03 — see component.js's header for the split rationale.
 * Content unchanged — a pure move.
 */
const WIRE_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'from_hook_id', 'to_hook_id'],
  types: {
    id: 'string', from_hook_id: 'string', to_hook_id: 'string',
  },
  // uuid — see component.js's own note on the loom.uuid-present Axiom.
});

module.exports = { WIRE_SCHEMA };