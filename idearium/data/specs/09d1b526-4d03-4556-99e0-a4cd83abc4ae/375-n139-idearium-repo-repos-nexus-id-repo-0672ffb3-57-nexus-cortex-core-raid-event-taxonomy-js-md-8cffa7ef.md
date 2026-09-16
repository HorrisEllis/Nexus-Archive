---
chunk_uuid: 8cffa7ef-b418-41e8-9501-c98836b72aeb
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-57-nexus-cortex-core-raid-event-taxonomy-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/57-nexus-cortex-core-raid-event-taxonomy-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-57-nexus-cortex-core-raid-event-taxonomy-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-57-nexus-cortex-core-raid-event-taxonomy-js-md:8cffa7ef
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:23:36.388Z
---

'use strict';
// cortex/core/raid/event-taxonomy.js — RAID's own real event vocabulary.
// Conforms to lib/event-taxonomy-pattern.js's ET1 shape (same convention as
// guardian/event-taxonomy.js, clear-glass's, orchestrator's — one agreed
// shape, each system's own file, no cross-system requires between them).
//
// §BUILT 2026-08-31, James live: "raid needs events" / "get the taxonomy
// done." Traced first, before writing this: contract-intake.js had ZERO
// real event emissions anywhere — not to the bus, not to the ledger — the
// only place RAID's real contract lifecycle (submit/acknowledge/pass/fail)
// existed was jaaDB rows, invisible to the causal graph and to intelligence's
// pattern-scanning, unlike guardian's own job lifecycle which already shows
// up as real, cfr-annotated ledger entries (confirmed directly against
// guardian's own bus.emit intercept at guardian/server.js's _evLedger.record
// call). These four events are the real, minimal set matching RR4's own
// already-built lifecycle (submitContract, acknowledge, reportExternalOutcome
// pass/fail) — not invented ahead of what the module actually does.

module.exports = Object.freeze({
  RAID_CONTRACT_SUBMITTED: {
    description: 'A new contract entered RAID\'s real queue via submitContract() — status QUEUED, stage QUEUED.',
    payloadShape: ['queueId', 'source', 'system', 'forAgent', 'intention'],
    severity: 'info',
  },
  RAID_CONTRACT_ACKNOWLEDGED: {
    description: 'A receiving system called acknowledge() — RR4\'s real handshake ACK, confirming it received the contract and its constraints before work starts. Advances stage QUEUED -> HANDSHAKE_VERIFIED.',
    payloadShape: ['queueId', 'acknowledgedBy'],
    severity: 'info',
  },
  RAID_CONTRACT_PASSED: {
    description: 'reportExternalOutcome() recorded a real PASS verdict for a contract — the receiving system\'s work was verified and accepted.',
    payloadShape: ['queueId', 'verdict'],
    severity: 'info',
  },
  RAID_CONTRACT_FAILED: {
    description: 'reportExternalOutcome() recorded a real FAIL verdict for a contract — the receiving system\'s work was rejected or errored.',
    payloadShape: ['queueId', 'verdict'],
    severity: 'warning',
  },
});