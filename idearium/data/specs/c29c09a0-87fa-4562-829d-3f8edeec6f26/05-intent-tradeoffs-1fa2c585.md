---
chunk_uuid: 1fa2c585-2a26-44c4-80db-2a5623254f26
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: intent-tradeoffs
title: intent — tradeoffs
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:intent-tradeoffs
contract_id: spec-contract:c29c09a0:intent-tradeoffs:1fa2c585
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:32.958Z
---

<!-- imported: intent → tradeoffs -->


    tradeoffs:
      - id: TRDE-001
        accepted: >
          Ring eviction loses event history. Events older than ringCap are gone from the ring.
        rationale: >
          Unbounded ring growth causes OOM on long-running processes. WAL + archive handles
          durability at the cost of query latency for cold data.
        revisit_condition: >
          Revisit when cold archive query latency exceeds 500ms for date-range queries,
          or when ring capacity requirements exceed 10M events.
        accepted_at: 2025-06-01T00:00:00Z
        accepted_by: james-brooks

      - id: TRDE-002
        accepted: >
          query accesses kernel._typeIndex directly for the O(1) fast path.
          Deliberate tight coupling to a _ prefixed internal field.
        rationale: >
          The typeIndex fast path reduces query latency from O(n) to O(1) for type-equality
          root conditions. Without this, every type query is a full ring scan.
        revisit_condition: >
          Revisit when a public query API stable enough to replace _typeIndex is added,
          or when _typeIndex shape changes break the query module.
        accepted_at: 2025-08-01T00:00:00Z
        accepted_by: james-brooks

      - id: TRDE-003
        accepted: >
          persist uses dynamic import of compress at flush/recover time to avoid a circular
          dependency (compress imports kernel; persist importing compress at load time cycles).
        rationale: >
          Dynamic import localizes the coupling to the call site and is cheaper than
          restructuring the module graph.
        revisit_condition: >
          Revisit when compress is decoupled from kernel (kernel passed as argument),
          making the circular dependency moot.
        accepted_at: 2025-09-01T00:00:00Z
        accepted_by: james-brooks

      - id: TRDE-004
        accepted: >
          forge requires Anthropic API access. No local-first fallback for AI self-modification.
        rationale: >
          Local model inference for module-level code rewriting at required quality is not
          available without significant infrastructure. forge is operator-invoked, not hot-path.
        revisit_condition: >
          Revisit when local code-generation models reach quality parity with claude-sonnet-4
          for module-level JS rewriting tasks.
        accepted_at: 2025-10-01T00:00:00Z
        accepted_by: james-brooks
