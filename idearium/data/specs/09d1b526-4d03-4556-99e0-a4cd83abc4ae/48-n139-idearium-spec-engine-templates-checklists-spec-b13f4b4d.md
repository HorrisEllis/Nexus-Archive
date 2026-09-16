---
chunk_uuid: b13f4b4d-a11f-4934-be4f-aacaeb0f8ac0
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-spec-engine-templates-checklists-spec
title: n139/idearium/spec-engine/templates/checklists.spec
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-spec-engine-templates-checklists-spec
contract_id: spec-contract:09d1b526:n139-idearium-spec-engine-templates-checklists-spec:b13f4b4d
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:47.580Z
---

// CHECKLISTS TEMPLATE v1.0.0
// UUID: idearium-template-checklists-v1-0000-2026-0711-jamesbrooks-001
// Deterministic verification gates — the same checklist every spec is
// graded against, so "is this done" has a fixed answer instead of a
// per-spec agent opinion.

version 1.0.0

## SECTION: meta

# Meta — Checklists

Seeded from the checklists template. The tests and failure-mode
checklists below are the standing gates — apply them to this spec's
actual content, don't restate them as prose.

## SECTION: tests

## Tests & Verification

Evidence tiers, in order — a component is only as done as its highest
PROVEN tier, not its highest claimed one:

- [ ] **PARSES** — the file loads without a syntax/import error
- [ ] **BOOTS** — the module initializes without throwing
- [ ] **SERVING** — it responds to at least one real call end-to-end
- [ ] **HEALTHY** — it responds correctly under its stated normal load
- [ ] **CONTRACT** — every claim in this spec's other sections (schema,
      API, events) has a passing test asserting it, not just a
      manual check

Per-component checklist:

- [ ] Every function/route has at least one test exercising it
- [ ] Every declared failure mode (see below) has a test that
      deliberately triggers it and asserts the failure is loud (§1.2)
- [ ] No stub, mock, or placeholder ships in the path marked production
      (§1.3)
- [ ] Test suite actually runs — a suite that fails to execute is not
      evidence of anything, tier PARSES included

## SECTION: failure_modes

## Failure Modes

What can fail, stated before it happens, not discovered after:

- [ ] **Input validation** — what happens on malformed/missing input?
      Rejected loudly, not silently coerced.
- [ ] **Dependency unavailable** — what happens if something this
      component calls is down? Named fallback or a loud, specific error
      — never a silent no-op.
- [ ] **Partial failure** — if this writes to more than one place, what
      happens if the second write fails after the first succeeded?
      State the recovery path, not just the happy path.
- [ ] **Recovery** — is there a retry, and does it have a ceiling? An
      unbounded retry loop is itself a failure mode.
- [ ] **Observability** — does the failure show up in a log/ledger a
      human or another system can actually find, or does it fail into
      silence?

A failure mode with no listed recovery path is not "acceptable risk" —
it's an unfinished section (§1.1).