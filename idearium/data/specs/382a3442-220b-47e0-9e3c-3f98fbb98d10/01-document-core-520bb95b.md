---
chunk_uuid: 520bb95b-775f-497f-ad0d-a8ab7aa0ab22
spec_uuid: 382a3442-220b-47e0-9e3c-3f98fbb98d10
section: document-core
title: document — core
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:382a3442:document-core
contract_id: spec-contract:382a3442:document-core:520bb95b
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:03:56.147Z
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
