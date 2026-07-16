---
chunk_uuid: 48ec69cf-9278-4c10-9abf-7f66833df58a
spec_uuid: 2bb72761-023b-40fa-97c7-f33d0869c8c4
section: schema
title: Data Schema
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:2bb72761:schema
contract_id: spec-contract:2bb72761:schema:48ec69cf
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T07:53:14.731Z
---

Seeded deterministically from template `schemas` — no agent dispatched.

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

> Source: idearium/spec-engine/templates/schemas.spec § schema