---
chunk_uuid: 02cc0981-1f54-4913-b0c5-ced7c4dfad81
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: event-model-event-types
title: event model — event_types
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:event-model-event-types
contract_id: spec-contract:f4232853:event-model-event-types:02cc0981
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.477Z
---

<!-- imported: event model → event_types -->


    event_types:
      - id: EVT-001
        name: command:running
        category: request
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id. Used as calltoMap key.
            - name: action
              type: string
              required: true
              description: Action being performed (e.g. click, submit).
          example:
            id: cmd-1
            action: click
        producers: [adapter]
        consumers: [kernel, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-002
        name: command:success
        category: response
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id. Matches running entry.
            - name: status
              type: string
              required: true
              description: '"ok"'
          example:
            id: cmd-1
            status: ok
        producers: [adapter]
        consumers: [kernel, delta, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-003
        name: command:failed
        category: error
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id.
            - name: error
              type: string
              required: true
              description: Error message or code.
          example:
            id: cmd-1
            error: "timeout"
        producers: [adapter]
        consumers: [kernel, delta, enforcement]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-004
        name: session:boundary
        category: state_change
        schema:
          fields:
            - name: ref
              type: string
              required: true
              description: ID of the page:navigated event that triggered this gate output.
          example:
            ref: evt-uuid-page-nav
        producers: [kernel]
        consumers: [kernel, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: conditional
        idempotency_key: ref
        delivery:
          guarantee: exactly_once
          ordering: strict
          on_failure: halt

      - id: EVT-005
        name: system:ring:evicted
        category: system
        schema:
          fields:
            - name: cap
              type: number
              required: true
              description: Ring buffer capacity at eviction time.
            - name: evictedSeq
              type: number
              required: true
              description: Logical sequence of evicted event. Object NOT in payload.
          example:
            cap: 5000000
            evictedSeq: 4999999
        producers: [kernel]
        consumers: [persist, enforcement]
        retention_ms: 0
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: strict
          on_failure: discard

      - id: EVT-006
        name: invariant:violation
        category: error
        schema:
          fields:
            - name: invariantId
              type: string
              required: true
              description: "e.g. I-1, C-4, H-1."
            - name: message
              type: string
              required: true
              description: Human-readable violation description.
            - name: context
              type: object
              required: false
              description: Additional context for debugging.
          example:
            invariantId: I-1
            message: "event.id is not UUID v4: abc-123"
            context:
              eventType: command:running
        producers: [enforcement]
        consumers: [enforcement]
        retention_ms: 604800000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: exactly_once
          ordering: strict
          on_failure: halt


      - id: EVT-007
        name: macro:detected
        category: signal
        schema:
          fields:
            - name: pattern
              type: string
              required: true
              description: Pattern key that crossed threshold.
            - name: count
              type: number
              required: true
              description: Current pattern occurrence count.
          example:
            pattern: "command:success:sequential"
            count: 5
        producers: [projection]
        consumers: [observer]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-008
        name: system:diamond:rejected
        category: system
        schema:
          fields:
            - name: fromId
              type: string
              required: true
              description: Event ID that attempted a diamond parent edge.
            - name: toId
              type: string
              required: true
              description: Existing ancestor that would create the diamond.
          example:
            fromId: evt-abc-123
            toId: evt-root-001
        producers: [causality, kernel]
        consumers: [enforcement]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-009
        name: idea:recorded
        category: audit
        schema:
          fields:
            - name: idea
              type: object
              required: true
              description: IdeaEntry that was recorded.
          example:
            idea:
              id: idea-001
              type: hypothesis
              description: "Try reducing walFlushEvery to 50"
        producers: [ledger]
        consumers: [observer]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: idea.id
        delivery:
          guarantee: at_least_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-010
        name: idea:promoted
        category: audit
        schema:
          fields:
            - name: idea
              type: object
              required: true
              description: The IdeaEntry being promoted.
            - name: upgrade
              type: object
              required: true
              description: The resulting UpgradeEntry.
          example:
            idea:
              id: idea-001
            upgrade:
              id: upgrade-001
              type: passing_test
        producers: [ledger]
        consumers: [observer]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: upgrade.id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-011
        name: upgrade:committed
        category: audit
        schema:
          fields:
            - name: upgrade
              type: object
              required: true
              description: The committed UpgradeEntry.
          example:
            upgrade:
              id: upgrade-001
              type: passing_test
              description: "195 tests passing after walFlushEvery reduction"
        producers: [ledger]
        consumers: [observer]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: upgrade.id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-012
        name: bottleneck
        category: signal
        schema:
          fields:
            - name: metrics
              type: object
              required: true
              description: "{ pendingIdeas: number, threshold: number, oldestIdea: IdeaEntry }."
          example:
            metrics:
              pendingIdeas: 6
              threshold: 5
              oldestIdea:
                id: idea-001
        producers: [ledger]
        consumers: [observer]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_least_once
          ordering: best_effort
          on_failure: discard
