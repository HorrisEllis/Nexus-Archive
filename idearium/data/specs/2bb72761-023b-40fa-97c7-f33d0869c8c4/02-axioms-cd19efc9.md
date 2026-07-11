---
chunk_uuid: cd19efc9-1bfc-4ec4-8f6f-e96320023b60
spec_uuid: 2bb72761-023b-40fa-97c7-f33d0869c8c4
section: axioms
title: Axioms Enforced
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:2bb72761:axioms
contract_id: spec-contract:2bb72761:axioms:cd19efc9
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T07:53:14.727Z
---

Seeded deterministically from template `axioms` — no agent dispatched.

## Axioms Enforced

For each axiom: state it, then state the evidence in THIS spec that
satisfies it. An axiom listed with no evidence line is not enforced,
it's quoted.

- **§1.1 NOTHING_EXISTS_UNTIL_PROVEN** — nothing is marked done on claim
  alone; evidence tier (PARSES/BOOTS/SERVING/HEALTHY/CONTRACT) required.
  _Evidence:_
- **§1.2 NOTHING_SILENTLY_FAILS** — every error path is loud and
  specific, traceable to its source.
  _Evidence:_
- **§1.3 NO_STUBS_IN_PRODUCTION** — no placeholder, mock, or TODO ships
  in a path marked production.
  _Evidence:_
- **§2.1 PERSISTENCE_IS_GOLDEN** — state that matters survives a
  restart; nothing load-bearing lives only in memory.
  _Evidence:_
- **§3.1 BOTTOM_UP_ONLY** — dependencies are built and proven before
  what depends on them.
  _Evidence:_
- **§4.3 ENTERPRISE_MILITARY_GRADE** — the component holds up under
  real load and real hostile input, not just the happy path.
  _Evidence:_
- **§5.1 UUID_HOOK_BUS_ON_EVERYTHING** — every unit has its own UUID,
  registers its hooks, and speaks on the bus — not a hidden direct call.
  _Evidence:_
- **§5.2 EVERYTHING_IMPLEMENTS_THE_BRIDGE** — this component is
  reachable through the standard bridge contract, not a private side
  channel.
  _Evidence:_
- **§5.3 NO_MONKEY_PATCHES** — nothing here mutates another module's
  behavior from outside its own file.
  _Evidence:_
- **§8.1 SESSION_CONTEXT_BEFORE_BUILD** — this spec states its own
  purpose and dependencies before any implementation section.
  _Evidence:_
- **§8.2 HOSTILE_REVIEW_BEFORE_SPEC** — this spec's claims have been
  checked against what actually exists, not assumed.
  _Evidence:_

Sovereign-system axioms (apply when this spec's `type` scaffolds a
system, per genesis.spec — otherwise mark not-applicable, don't delete):

- **SOVEREIGN** — answers to no external authority
- **AGNOSTIC** — core does not care what data or system touches it
- **NOTHING_INLINE** — no cross-system call is hand-wired; wire or gate only
- **GATE_BEFORE_CROSS** — no compartment reaches another without passing its gate
- **HOT_SWAPPABLE** — any isolate module may be replaced at runtime without reboot
- **CONFIG_OUTSIDE_CODE** — anything adjustable lives in config, never hardcoded
- **LEDGER_IS_TRUTH** — every runtime writes its event stream to an append-only ledger

> Source: idearium/spec-engine/templates/axioms.spec § axioms