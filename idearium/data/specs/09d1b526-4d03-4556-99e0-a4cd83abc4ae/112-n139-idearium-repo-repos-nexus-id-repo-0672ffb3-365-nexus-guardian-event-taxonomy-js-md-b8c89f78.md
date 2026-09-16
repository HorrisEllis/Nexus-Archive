---
chunk_uuid: b8c89f78-7c54-4d3c-a916-e8d91660c2a4
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-365-nexus-guardian-event-taxonomy-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/365-nexus-guardian-event-taxonomy-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-365-nexus-guardian-event-taxonomy-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-365-nexus-guardian-event-taxonomy-js-md:b8c89f78
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:18:38.565Z
---

'use strict';
// guardian/event-taxonomy.js — ET2_guardian_event_taxonomy.
// Conforms to lib/event-taxonomy-pattern.js's real ET1 shape.
//
// §CORRECTED against the phasemap's own summary — ET2's phasemap entry
// named the job-lifecycle events as "job.created, job.dispatched,
// job.acked, job.completed, job.failed... guardian/server.js already
// logs all of these as free-text console lines... this phase just
// gives them governed names." Checked directly before trusting that
// summary: guardian/server.js already has 6 REAL, governed bus.emit()
// calls for job lifecycle (guardian.job.queued, .dispatched, .confirmed,
// .chunk, .complete, .error) — not free-text console lines needing a
// name invented for them, and not the 5 names the phasemap guessed at.
// Documented the real, current vocabulary instead of the phase's own
// (inaccurate, in this one respect) description of it.

module.exports = Object.freeze({
  // ── NCP client connection state — guardian/lib/ncp.js ──────────────────────
  NCP_CLIENT_CONNECTED: {
    description: 'A provider tab (claude/chatgpt/gemini/perplexity) established a real NCP connection to guardian.',
    payloadShape: ['provider', 'tabId', 'key'],
    severity: 'info',
  },
  NCP_CLIENT_DISCONNECTED: {
    description: 'A previously-connected provider tab deliberately dropped its NCP connection.',
    payloadShape: ['provider', 'tabId', 'key'],
    severity: 'notable',
  },
  NCP_CLIENT_STALE: {
    description: 'A connected provider tab missed enough real heartbeats to be considered stale (not a clean disconnect).',
    payloadShape: ['provider', 'tabId', 'key', 'lastHeartbeat'],
    severity: 'warning',
  },
  NCP_MESSAGE_RECEIVED: {
    description: 'Guardian received a real message from a connected NCP client.',
    payloadShape: ['type', 'provider'],
    severity: 'info',
  },
  NCP_STREAM_CHUNK: {
    description: 'One real streamed token/chunk arrived from a provider tab mid-response.',
    payloadShape: ['jobId', 'token', 'done', 'seq', 'provider', 'tabId', 'ts'],
    severity: 'info',
  },

  // ── Job lifecycle — guardian/server.js — real, already-governed events,
  //    not free-text console lines needing a name (see the correction
  //    note above this export) ────────────────────────────────────────────
  GUARDIAN_JOB_QUEUED: {
    description: 'A real job was accepted and placed on the real queue.',
    payloadShape: ['jobId', 'provider', 'filename'],
    severity: 'info',
  },
  GUARDIAN_JOB_DISPATCHED: {
    description: 'A real, queued job was sent to its real target provider.',
    payloadShape: ['jobId', 'provider'],
    severity: 'info',
  },
  GUARDIAN_JOB_CONFIRMED: {
    description: 'The target provider acknowledged receiving a real dispatched job.',
    payloadShape: ['jobId', 'provider'],
    severity: 'info',
  },
  GUARDIAN_JOB_CHUNK: {
    description: "One real chunk of a job's streamed response arrived.",
    payloadShape: ['jobId', 'text', 'full', 'provider'],
    severity: 'info',
  },
  GUARDIAN_JOB_COMPLETE: {
    description: 'A real job finished successfully. Real payload varies by dispatch path (browser/mistral/ollama/replay) — this documents the richest real shape, from the real gap-loop-aware completion path.',
    payloadShape: ['jobId', 'provider', 'chars', 'gaps', 'gapDrift', 'command', 'meta'],
    severity: 'info',
  },
  GUARDIAN_JOB_ERROR: {
    description: 'A real job failed — RAID unavailable, approval denied, a dispatch exception, or a real gate failure.',
    payloadShape: ['jobId', 'error', 'provider', 'gate'],
    severity: 'failure',
  },

  // ── DOM response lifecycle — §MCO16f 2026-09-14 — guardian/lib/
  //    response-nodes.js + response-watchdog.js. These are the first
  //    events in this taxonomy that get a real `.event` NODE written per
  //    occurrence, not just a bus emit — guardian/data/nodes/event/ has
  //    existed (node-registry creates it) with zero writers since it was
  //    made. Every one of the four below fires from exactly one real call
  //    site; none are aspirational.
  GUARDIAN_DOM_RESPONSE: {
    description: 'One real live DOM mutation was recorded as a real .response node. Emitted per mutation by POST /dom/event, not batched.',
    payloadShape: ['jobId', 'compartmentUuid', 'domEventType', 'agentId', 'sequence', 'responseUuid', 'ts'],
    severity: 'info',
  },
  GUARDIAN_RESPONSE_TIMEOUT: {
    description: "A real in-flight job's .response nodes went silent past the applicable threshold — firstTokenMs when no mutation has ever landed, streamSilenceMs when the DOM moved and then stopped. Two thresholds, because a long wait before the first token is normal and a mid-stream stall is not.",
    payloadShape: ['jobId', 'provider', 'verdict', 'reason', 'attempt', 'maxRetries', 'evidence'],
    severity: 'warning',
  },
  GUARDIAN_RESPONSE_RETRY: {
    description: 'The response watchdog forced a real redispatch of a job whose response never arrived. Distinct from the userscripts\u2019 own autoRetry(), which re-prompts a response that DID arrive but failed detectResponseErrors() — this one is about delivery, that one about quality.',
    payloadShape: ['jobId', 'provider', 'attempt', 'maxRetries', 'triggeredBy', 'reason'],
    severity: 'notable',
  },
  GUARDIAN_RESPONSE_FAILED: {
    description: 'A real response failure with evidence — the provider disconnected mid-flight, or a watchdog redispatch itself threw.',
    payloadShape: ['jobId', 'provider', 'stage', 'error', 'verdict', 'reason', 'attempt'],
    severity: 'failure',
  },
  GUARDIAN_RESPONSE_ABANDONED: {
    description: 'The watchdog stopped retrying a job after exhausting maxRetries. The last real record written for that job, and deliberately its own event rather than a silent stop — a job that quietly leaves the sweep is exactly the invisible failure this whole path exists to end.',
    payloadShape: ['jobId', 'provider', 'reason', 'finalVerdict', 'evidence'],
    severity: 'failure',
  },

  // ── §HONEST GAP — gate.checked / gate.failed, named in ET2's own
  //    phasemap entry for ET6's sigma work, deliberately not included.
  //    Confirmed directly (grepped guardian/server.js for both strings):
  //    neither exists anywhere yet. ET6 hasn't been built. Documenting
  //    an event that can't fire would be worse than the honest gap.
});