---
chunk_uuid: 5ef1f0f2-c960-4ef8-8ca3-dff962f7f04c
spec_uuid: 92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651
section: failure_modes
title: Failure Modes
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:92a8bf9c:failure_modes
contract_id: spec-contract:92a8bf9c:failure_modes:5ef1f0f2
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-12T06:58:46.822Z
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