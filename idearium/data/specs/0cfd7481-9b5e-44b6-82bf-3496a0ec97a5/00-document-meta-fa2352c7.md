---
chunk_uuid: fa2352c7-4511-4442-a98e-abeccd769174
spec_uuid: 0cfd7481-9b5e-44b6-82bf-3496a0ec97a5
section: document-meta
title: document — meta
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:0cfd7481:document-meta
contract_id: spec-contract:0cfd7481:document-meta:fa2352c7
agent: import
model: import:.spec
status: complete
completed_at: 2026-08-17T03:52:43.845Z
---

<!-- imported: document → meta -->

spec:
  meta:
    name:        diagnostic-engine
    version:     0.1.0
    status:      PROPOSED — not built. See docs/session-2026-08-14-and-15-living-schema-phasemap.spec, LS2.
    foundation:  nexus-system-foundation@1.0.0
    port:        null  # undecided — see LS4's own open question: does this run
                        # as its own boot-phase system, or stay a cortex substrate?
    uuid:        nexus-diagnostic-engine-v0-1-0-0000-2026-0815-jamesbrooks-001
    purpose: >
      A living, per-system schema of what each real system is supposed to
      do end-to-end — {produces, consumes, healthSignal, expectedLatency}
      per expectation — with a confidence value on each expectation that
      intelligence's already-real lift-adjusted scoring adjusts from real
      outcomes, not a hand-tuned or second statistics engine. Exists so a
      diagnosis can name a SPECIFIC expectation violation instead of a
      generic error string, and so fault_taxonomy — real, schema'd, and
      still zero rows as of this spec's writing — finally has a real writer.
