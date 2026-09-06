---
chunk_uuid: 9bd6fe00-e505-431b-9f7a-65dbbcabb550
spec_uuid: 08af9d3b-44c4-4156-8709-261d224a69e6
section: document-core
title: document — core
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:08af9d3b:document-core
contract_id: spec-contract:08af9d3b:document-core:9bd6fe00
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:17:18.288Z
---

<!-- imported: document → core -->


  core:
    schemas:
      - Idea:    "{ uuid, text, phase, tags, specRef, gapScore, weight, ts }"
      - Project: "{ uuid, name, phase, specFile, artifacts[], gaps[], ts }"
    phases: [seed, expanding, tensioned, specced, building, complete]
    axioms: [AX-001, AX-002, AX-003, AX-007, AX-008]
    constants:
      LATTICE_THRESHOLD:  0.65   # minimum edge weight to cluster
      PHASE_TRANSITIONS:  "seed→expanding→tensioned→specced→building→complete"

  # ── AX-008 (foundation addendum v1.1.0) ────────────────────────────────────
  # ✅ CLOSED 2026-06-29 — idearium/index.js's _broadcast() pushes every
  # os.emit() to all SSE clients on GET /sse. copilot/server.js had an
  # IDR_URL constant declared since at least v3 but never connected to it —
  # scoped, never wired. Added _connectIdeariumStream() (same pattern as
  # _connectCortexStream/_connectGuardianStream), wired into copilot's boot
  # sequence, and added hooks/idearium.hooks.js's 4th entry
  # (idearium-to-copilot, seam:idearium-copilot-bridge) so the wire is
  # registry-visible, not just code. idea/project/lattice activity now
  # reaches copilot live.
