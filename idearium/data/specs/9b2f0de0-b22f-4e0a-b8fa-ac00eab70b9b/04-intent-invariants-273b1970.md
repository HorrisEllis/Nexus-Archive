---
chunk_uuid: 273b1970-184d-4caa-822d-ac608f77307f
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: intent-invariants
title: intent — invariants
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:intent-invariants
contract_id: spec-contract:9b2f0de0:intent-invariants:273b1970
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.599Z
---

<!-- imported: intent → invariants -->


    invariants:
      - id: INV-I1
        statement: >
          event.id is UUID v4 — never deterministic, never reused.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: enforcement.BoundaryIndex monitors every ingested event. Throws InvariantViolationError.
        consequence: Dedup, causal graph, and snapshot replay all break. Events become indistinguishable.

      - id: INV-I2
        statement: >
          contentHash is orthogonal to eventId — identical payloads produce the same hash
          but always different ids. contentHash must never be used as a dedup key for id assignment.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: enforcement.BoundaryIndex. Throws InvariantViolationError.
        consequence: Identical payloads become indistinguishable. Dedup incorrectly suppresses real events.

      - id: INV-C1
        statement: >
          Every causal edge has an explicitly declared edgeType at ingestion time.
          edgeType is never inferred post-hoc from event shape.
        criticality: fatal
        enforced_by: [GATE-003]
        detection: enforcement.BoundaryIndex checks edgeType on every edge creation.
        consequence: Causal traversal (traceToRoot, descendants) becomes unreliable.

      - id: INV-C2
        statement: >
          macro:detected is never a kernel event — projection-only. No component may call
          kernel.ingest('macro:detected', ...).
        criticality: fatal
        enforced_by: [GATE-003]
        detection: BoundaryIndex monitors ingest calls. Throws immediately on C-2 violation.
        consequence: Macro projection corrupts event ring with synthetic events.

      - id: INV-C3
        statement: >
          traceToRoot traverses only causal/* edges. Observational edges are never traversed
          in causal path queries.
        criticality: fatal
        enforced_by: [GATE-003]
        detection: causality.isCausalEdge() guards every traversal step.
        consequence: Causal chains include spurious observational hops. Root cause analysis breaks.

      - id: INV-C4
        statement: Gates execute before listeners. Listener callbacks never fire before gate phase completes.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: Kernel pipeline order is fixed. BoundaryIndex validates pipeline order on every ingest.
        consequence: Listeners observe events before gate-generated consequences exist. Race conditions.

      - id: INV-A2
        statement: >
          Gates return GateOutput[] — they never call kernel.ingest() directly.
          Gate output is collected atomically and ingested after the gate phase.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: Kernel wraps gate execution. GATE_DEPTH_MAX=20 guards recursive gate chains.
        consequence: Recursive ingest inside gate phase causes infinite loops or ordering violations.

      - id: INV-VM1
        statement: >
          All .nex artifacts (SNAP, BP, CLIP) must pass version-gate validation before
          parsing, migration, or runtime hydration.
        criticality: fatal
        enforced_by: [GATE-007]
        detection: version-gate.validate() throws GateValidationError on mismatch.
        consequence: Stale or corrupt artifacts hydrate silently. Ring state is corrupted.

      - id: INV-L2
        statement: >
          UpgradeLedger and IdeaLedger are structurally separate. Mixing is a hard throw.
        criticality: fatal
        enforced_by: [GATE-008]
        detection: LedgerError thrown on any mixing attempt. validateSeparation() enforces.
        consequence: Speculative ideas contaminate the authoritative truth ledger.

      - id: INV-L4
        statement: >
          An idea becomes an upgrade only through explicit validation via promoteIdea().
          No bypass path exists.
        criticality: fatal
        enforced_by: [GATE-008]
        detection: promoteIdea() validates entry type. Throws LedgerError on invalid type.
        consequence: Unvalidated ideas enter the authoritative record. Truth ledger is contaminated.

      - id: INV-H1
        statement: >
          The causal edge graph is bounded. pruneEdgesFor() is called on every ring eviction.
        criticality: high
        enforced_by: [GATE-004]
        detection: BoundaryIndex monitors edge count vs ring capacity.
        consequence: Memory grows unbounded. Process OOM on long-running sessions.

      - id: INV-H6
        statement: >
          seenMap (dedup LRU) is bounded at MAX_SEEN_MAP=10,000 entries under replay flood.
        criticality: high
        enforced_by: [GATE-004]
        detection: BoundaryIndex monitors seenMap.size on every replay.
        consequence: Replay flood causes unbounded seenMap growth and eventual OOM.
