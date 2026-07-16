---
chunk_uuid: ba099d7b-c607-4231-a2a7-7a983258c10f
spec_uuid: 2bb72761-023b-40fa-97c7-f33d0869c8c4
section: failure_modes
title: Failure Modes
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:2bb72761:failure_modes
contract_id: spec-contract:2bb72761:failure_modes:ba099d7b
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T07:53:14.732Z
---

Seeded deterministically from template `checklists` — no agent dispatched.

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

> Source: idearium/spec-engine/templates/checklists.spec § failure_modes