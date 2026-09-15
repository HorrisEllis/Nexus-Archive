---
chunk_uuid: eced9f6f-678c-477a-90b6-2303b1c828cb
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-loom-schema-seam-js
title: nexus/loom/schema/seam.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-loom-schema-seam-js
contract_id: spec-contract:47e02ad5:nexus-loom-schema-seam-js:eced9f6f
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:08:14.381Z
---

'use strict';
/**
 * loom/schema/seam.js — Seam: a named boundary a component exposes or
 * crosses. "Seam" means what it means across the rest of NEXUS's own
 * docs (grep hits in cortex/guardian/bridge hook files, per phase 61's
 * note on backfilling seam.componentIds) — a declared crossing point,
 * not a synonym for hook. A hook is *how* you cross it; a seam is *that*
 * a crossing point exists and which component owns it.
 * §SPLIT 2026-09-03 — see component.js's header for the split rationale.
 * Content unchanged — a pure move.
 */
const SEAM_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'component_id', 'name', 'kind'],
  types: {
    id: 'string', component_id: 'string', name: 'string', kind: 'string',
  },
  // kind: 'ingress' | 'egress' | 'bidirectional' — checked by axiom,
  // not baked into the type table (Gate.schema only checks JS typeof).
  // uuid enforced by loom.uuid-present Axiom, same reasoning as above.
});

module.exports = { SEAM_SCHEMA };