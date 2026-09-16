---
chunk_uuid: 4da4fd8e-4251-47f6-8cef-29a578a0e524
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-447-nexus-loom-schema-concern-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/447-nexus-loom-schema-concern-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-447-nexus-loom-schema-concern-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-447-nexus-loom-schema-concern-js-md:4da4fd8e
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:20:19.726Z
---

'use strict';
/**
 * loom/schema/concern.js — Concern: a real, detected roadmap item.
 * §BUILT 2026-07-14 — "a roadmap that loom automatically builds from...
 * I'm a dialectic thinker, there isn't a category." A flat todo list with
 * one category field can't hold that; this can, the same way wire already
 * holds relationships instead of a flat list of components. `kind` is an
 * open string, same philosophy as hook/wire's own type fields — not a
 * closed enum, since the real kinds of concern found so far (closed
 * door, spec-drift, stuck cross-system state, weak safety gate, a failed
 * hypothesis) weren't known in advance and more will exist later.
 * relatesTo/blocks are plain id arrays, not wires — a concern isn't a
 * hook and doesn't need one just to be connected to another concern or
 * to a component; this stays purely additive to concern's own schema
 * rather than changing what a wire means everywhere else it's used.
 * §SPLIT 2026-09-03 — see component.js's header for the split rationale.
 * Content unchanged — a pure move.
 */
const CONCERN_SCHEMA = Object.freeze({
  requiredKeys: ['id', 'kind', 'title', 'severity', 'source'],
  types: {
    id: 'string', kind: 'string', title: 'string', severity: 'string', source: 'string',
  },
  // severity: 'low'|'medium'|'high' — informational, not axiom-enforced.
  // source: which scanner found this (e.g. 'closed-door-scanner') — real
  // provenance, so a concern's origin is never a guess later.
  // Optional pass-through: relatesTo: [id], blocks: [id], detail: {} —
  // scanner-specific context, same pattern as wire's own 'intent' field.
});

module.exports = { CONCERN_SCHEMA };