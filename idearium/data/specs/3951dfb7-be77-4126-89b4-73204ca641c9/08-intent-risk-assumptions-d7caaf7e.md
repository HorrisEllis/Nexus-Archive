---
chunk_uuid: d7caaf7e-ba0c-4b4d-82cf-2853c94cdf4f
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: intent-risk-assumptions
title: intent — risk_assumptions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:intent-risk-assumptions
contract_id: spec-contract:3951dfb7:intent-risk-assumptions:d7caaf7e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:37.802Z
---

<!-- imported: intent → risk_assumptions -->

    risk_assumptions:
      - id: RISK-001
        assumption: Anthropic API remains available and stable for forge operations.
        confidence: high
        if_wrong: >
          forge becomes unavailable. AI self-modification halts. Manual patching required.
          No runtime impact — forge is not in the hot path.
        validation_method: >
          forge wraps all API calls in try/catch. On failure, returns { ok: false, error }.

      - id: RISK-002
        assumption: ringCap=5_000_000 is sufficient for production use without excessive eviction.
        confidence: medium
        if_wrong: >
          High eviction rates cause H-1 pressure. Cold archive queries increase in frequency.
        validation_method: >
          Monitor system:ring:evicted event rate. Alert if > 1% of ingest rate.

      - id: RISK-003
        assumption: Guardian extension (v5.0.0) bridge protocol is stable across Firefox updates.
        confidence: medium
        if_wrong: Bridge bus events stop arriving. Session boundary detection fails.
        validation_method: >
          Guardian handshake.js tests connection on every popup open. Adapter logs warning
          if no events received within 30s of session start.

  # ════════════════════════════════════════════════════════════════
  