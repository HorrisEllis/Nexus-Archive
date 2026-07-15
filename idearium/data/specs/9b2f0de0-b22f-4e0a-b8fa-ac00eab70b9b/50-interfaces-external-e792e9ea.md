---
chunk_uuid: e792e9ea-33a5-4bad-bc66-2d4787fec05a
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: interfaces-external
title: interfaces — external
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:interfaces-external
contract_id: spec-contract:9b2f0de0:interfaces-external:e792e9ea
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:56.043Z
---

<!-- imported: interfaces → external -->

# BLOCK 8 — INTERFACES
  # ════════════════════════════════════════════════════════════════
  interfaces:
    external:
      - id: IFACE-001
        name: anthropic-api
        type: http_api
        direction: outbound
        protocol: HTTPS REST
        version: "claude-sonnet-4-20250514"
        auth:
          method: api_key
          location: header
          required: true
        schema_ref: https://docs.anthropic.com/api/messages
        sla:
          availability_pct: 99.5
          max_latency_ms: 30000
          rate_limit: "varies by plan"
        breaking_change_policy: >
          Model version pinned in forge module. On deprecation, forge returns
          { ok: false, error: 'model_deprecated' }. Operator updates model string.
        failure_contract: >
          Non-200: "forge returns { ok: false, error }. Timeout: { ok: false, error: 'timeout' }."
        consumers: [forge]
        mock_available: true

      - id: IFACE-002
        name: guardian-bridge
        type: websocket
        direction: inbound
        protocol: WebExtension message passing
        version: "5.0.0"
        auth:
          method: none
          location: none
          required: false
        schema_ref: Guardian/handshake.js
        sla:
          availability_pct: 95.0
          max_latency_ms: 100
          rate_limit: "browser-rate-limited"
        breaking_change_policy: >
          Adapter handles unknown bridge event types gracefully (logged, not crashed).
        failure_contract: >
          On Guardian disconnect: calltoMap retains pending entries until TTL expiry.
          Adapter continues. Kernel ring continues normally.
        consumers: [adapter]
        mock_available: true
