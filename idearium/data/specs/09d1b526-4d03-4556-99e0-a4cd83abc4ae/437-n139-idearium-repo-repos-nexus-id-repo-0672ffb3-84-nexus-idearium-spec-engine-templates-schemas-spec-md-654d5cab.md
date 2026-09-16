---
chunk_uuid: 654d5cab-e4b6-407e-9ee5-76e3e083ada8
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-84-nexus-idearium-spec-engine-templates-schemas-spec-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/84-nexus-idearium-spec-engine-templates-schemas-spec.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-84-nexus-idearium-spec-engine-templates-schemas-spec-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-84-nexus-idearium-spec-engine-templates-schemas-spec-md:654d5cab
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:25:02.734Z
---

// SCHEMAS TEMPLATE v1.0.0
// UUID: idearium-template-schemas-v1-0000-2026-0711-jamesbrooks-001
// Deterministic schema shape — every field a real data spec must declare,
// so "what's the schema" stops being answered freehand per spec.

version 1.0.0

## SECTION: meta

# Meta — Schema Baseline

Seeded from the schemas template. Fields below are the fixed minimum
every table/record declares — not proposed, required.

## SECTION: schema

## Data Schema

Every table/record in this spec declares, at minimum:

- **table/entity name** — kebab-case, singular
- **uuid** — every row's own identity (§5.1 UUID on everything)
- **fields** — `name: type` pairs; type is one of the JAA primitives
  (`string`, `number`, `boolean`, `timestamp`, `uuid`, `json`)
- **constraints** — required / unique / foreign-key, stated explicitly,
  never implied
- **decay tier** — how long this data is retained and what happens when
  it expires (hot / warm / cold / permanent) — a schema with no decay
  tier is assumed permanent, which must be a deliberate choice, not a
  default nobody made
- **baseline** — the shape this schema is graded against at boot,
  registered as a hard Axiom check (severity:hard) so drift between
  declared shape and actual shape is caught at the gate, not in
  production

Template for one entity:

```
entity "<name>"
  uuid          uuid      required unique
  <field>       <type>    <constraint>
  createdAt     timestamp required
  updatedAt     timestamp required
  decay         permanent | hot | warm | cold
```

A schema chunk that only lists field names without types, constraints,
and a decay tier is incomplete — §1.1, nothing exists until proven, and
an untyped field is an unproven shape.