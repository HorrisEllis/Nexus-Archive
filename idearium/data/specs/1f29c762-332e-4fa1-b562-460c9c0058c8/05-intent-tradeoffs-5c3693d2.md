---
chunk_uuid: 5c3693d2-6996-471c-ba19-495a7080e94a
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: intent-tradeoffs
title: intent — tradeoffs
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:intent-tradeoffs
contract_id: spec-contract:1f29c762:intent-tradeoffs:5c3693d2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:15.299Z
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
