---
chunk_uuid: c33b3a2d-1eef-4abb-9b83-b82fc91efd9d
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-445-nexus-loom-schema-seam-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/445-nexus-loom-schema-seam-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-445-nexus-loom-schema-seam-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-445-nexus-loom-schema-seam-js-md:c33b3a2d
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:25:21.951Z
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