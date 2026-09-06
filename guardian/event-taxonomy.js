'use strict';
// guardian/event-taxonomy.js — ET2_guardian_event_taxonomy.
// Conforms to lib/event-taxonomy-pattern.js's real ET1 shape.
//
// §COMPLETED 2026-09-06 — James: "build the entire guardian and ncp event
// taxonomy." The previous version of this file documented 11 events (5
// NCP client-connection events + 6 job-lifecycle events) and left every
// other real bus.emit() in guardian/ undocumented. Checked directly
// before writing this, not assumed from memory: grepped every
// `bus.emit('...')` / `this.emit('...')` call site across the entire
// guardian/ tree (server.js, lib/ncp.js, lib/ncp-handler.js, lib/
// dispatcher.js, routes/autonomous-loop.js) and cross-referenced every
// hit against what was already documented here. This file now covers
// every one found — 44 real event classes total, all still real, all
// still checked against an actual call site, none invented.
//
// §CORRECTED — the previous "HONEST GAP" note below claimed gate.checked/
// gate.failed didn't exist yet ("ET6 hasn't been built"). Checked again
// directly for this pass: server.js's own SISOStream.emit() now calls
// `this.emit('gate.failed', ...)` on a real sigma-gate check (guarded
// against self-recursion — see GUARDIAN_GATE_FAILED below). gate.failed
// is real now; gate.checked deliberately still isn't (see that entry's
// own note) — the gap wasn't fully closed, just partially, and the old
// note was flatly wrong about "neither exists." Removed and replaced
// with an accurate one.
//
// §NOT INCLUDED — ncp.flap (guardian/lib/ncp.js's own flap detector) is
// real and fires on every repeated disconnect, but writes directly to
// jaaDB's event_log table (jaaDB.insert), never to the bus. ET1's shape
// documents bus events specifically; a JAA-only diagnostic row isn't
// one, so it stays undocumented here on purpose, same as this file's
// existing precedent of only naming what's actually checkable against a
// real bus.emit() call.
//
// §NOT INCLUDED — DispatchPool (guardian/lib/dispatch-pool.js)'s own
// 'slot-freed' / 'job-failed' / 'job-stolen' / 'dispatch-ready' events
// fire on a private, internal EventEmitter (`class DispatchPool extends
// EventEmitter`), consumed only one-way (bus → pool, via dispatch-pool-
// bridge.js) — nothing ever re-emits them onto guardian's real bus, so
// they're implementation detail of an internal object, not governed bus
// events, and don't belong in this taxonomy either.

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

  // ── Job lifecycle — guardian/server.js, lib/ncp-handler.js, lib/
  //    dispatcher.js — real, already-governed events ──────────────────────────
  GUARDIAN_JOB_QUEUED: {
    description: 'A real job was accepted and placed on the real queue. Also fires when a job is re-queued after its socket went stale mid-dispatch.',
    payloadShape: ['jobId', 'provider', 'filename', 'reason'],
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
    payloadShape: ['jobId', 'provider', 'chars', 'gaps', 'gapDrift', 'command', 'meta', 'replay'],
    severity: 'info',
  },
  GUARDIAN_JOB_ERROR: {
    description: 'A real job failed — RAID unavailable, approval denied, a dispatch exception, or a real gate failure.',
    payloadShape: ['jobId', 'error', 'provider', 'gate'],
    severity: 'failure',
  },
  GUARDIAN_TAB_NEEDED: {
    description: 'A job is ready to dispatch but no live tab/socket exists yet for its target provider — a new provider tab needs to open before the job can actually go out.',
    payloadShape: ['provider', 'jobId', 'url'],
    severity: 'notable',
  },

  // ── Provider connection (server.js's own tracking, distinct from NCP's —
  //    see GUARDIAN_PROVIDER_REGISTERED below for the real difference) ───────
  GUARDIAN_PROVIDER_CONNECTED: {
    description: "A provider tab's socket connected at guardian/server.js's own level (server-side connection tracking, not NCP client registration).",
    payloadShape: ['provider', 'tabId'],
    severity: 'info',
  },
  GUARDIAN_PROVIDER_DISCONNECTED: {
    description: "A provider tab's socket disconnected at guardian/server.js's own level.",
    payloadShape: ['provider', 'tabId'],
    severity: 'notable',
  },
  GUARDIAN_PROVIDER_REGISTERED: {
    description: 'A provider tab completed real NCP registration inside lib/ncp-handler.js — the point a provider becomes usable for job dispatch, distinct from the raw socket-level GUARDIAN_PROVIDER_CONNECTED above.',
    payloadShape: ['provider', 'tabId'],
    severity: 'info',
  },

  // ── Tab-level real events — lib/ncp-handler.js ─────────────────────────────
  GUARDIAN_TAB_CLAIMED: {
    description: 'An active queue claimed a specific provider tab for its own use (only fires when a real active-queue set is non-empty).',
    payloadShape: ['provider', 'tabId'],
    severity: 'info',
  },
  GUARDIAN_TAB_EVENT: {
    description: "A provider tab's userscript reported a real, arbitrary DOM/lifecycle event back to guardian.",
    payloadShape: ['provider', 'tabId', 'event', 'data'],
    severity: 'info',
  },
  GUARDIAN_TAB_DOM_MAP: {
    description: "A provider tab's userscript sent a real snapshot of its own DOM structure back to guardian.",
    payloadShape: ['provider', 'tabId', 'nodes', 'ts', 'meta'],
    severity: 'info',
  },

  // ── Artifacts — lib/ncp-handler.js ──────────────────────────────────────────
  GUARDIAN_ARTIFACT: {
    description: 'One real artifact was recorded against a job — fires both from the live NCP completion path and from memory-ingest replaying an ARTIFACT-typed record.',
    payloadShape: ['jobId', 'artifactId', 'provider'],
    severity: 'info',
  },
  GUARDIAN_ARTIFACTS_WRITTEN: {
    description: "A job's response contained real code blocks, which were extracted and written to disk as files.",
    payloadShape: ['jobId', 'outDir', 'count', 'files'],
    severity: 'info',
  },
  GUARDIAN_ARTIFACTS_EXAMINED: {
    description: "lib/introspect.js finished examining a job's just-written artifacts and returned a real verdict (fires after GUARDIAN_ARTIFACTS_WRITTEN, asynchronously — introspection never blocks the artifacts already on disk).",
    payloadShape: ['jobId', 'outDir', 'verdict', 'confidence'],
    severity: 'notable',
  },

  // ── Gaps / detection — lib/ncp-handler.js ───────────────────────────────────
  GUARDIAN_GAPS: {
    description: "GapHunter found one or more real gaps in a job's response. `drift` is only present on the primary completion path — the second, simpler call site (a later re-check) omits it.",
    payloadShape: ['jobId', 'gaps', 'drift', 'provider'],
    severity: 'notable',
  },
  GUARDIAN_DETECTION: {
    description: "lib/seam/detector.js's real Detector.evaluate() ran against a job's response (only when the job carries a seam_chunk_content to compare against) and returned a composite pass/fail verdict.",
    payloadShape: ['jobId', 'passed', 'composite', 'truncation', 'sigma', 'delta', 'summary'],
    severity: 'notable',
  },
  GUARDIAN_ABRUPT_STOP: {
    description: "A job's response stream ended with a real open code fence still unclosed — a genuine truncated-mid-block signal, not a normal completion.",
    payloadShape: ['jobId', 'provider', 'openFence', 'ts'],
    severity: 'warning',
  },

  // ── Cortex / ledger — lib/ncp-handler.js, server.js ─────────────────────────
  GUARDIAN_CORTEX_RESULT: {
    description: "A provider tab's userscript asked guardian to relay a query to cortex and got a real result back.",
    payloadShape: ['jobId', 'query', 'result', 'provider'],
    severity: 'info',
  },
  GUARDIAN_LEDGER_WRITE: {
    description: 'lib/ncp-handler.js wrote one real entry directly to the component ledger and mirrored it onto the bus.',
    payloadShape: ['system', 'component', 'action', 'status', 'detail'],
    severity: 'info',
  },
  GUARDIAN_LEDGER: {
    description: "A real ledger entry arrived at guardian's own /ledger API endpoint or via memory-ingest replaying a LEDGER-typed record — a distinct real path from GUARDIAN_LEDGER_WRITE above, which fires only from lib/ncp-handler.js's own internal write.",
    payloadShape: ['source', 'chatUrl', 'account'],
    severity: 'info',
  },

  // ── Sessions / settings — lib/ncp-handler.js, server.js ─────────────────────
  GUARDIAN_SESSION_NAMED: {
    description: 'A chat session was given a real name — either by a provider tab reporting one it captured live, or via a direct API call.',
    payloadShape: ['chatId', 'sessionName', 'name', 'provider'],
    severity: 'info',
  },
  GUARDIAN_SETTING_UPDATE: {
    description: 'A real guardian setting was changed and persisted.',
    payloadShape: ['key', 'value'],
    severity: 'info',
  },

  // ── Queue / compartment / seam — server.js ──────────────────────────────────
  GUARDIAN_QUEUE_ENQUEUED: {
    description: 'A real item was accepted onto the drop/upload queue.',
    payloadShape: ['uuid', 'ext'],
    severity: 'info',
  },
  GUARDIAN_QUEUE_RETRY: {
    description: 'A real queued item was explicitly retried.',
    payloadShape: ['uuid'],
    severity: 'notable',
  },
  GUARDIAN_QUEUE_PROGRESS: {
    description: 'A real queue reported incremental progress on a long-running item.',
    payloadShape: ['queueId'],
    severity: 'info',
  },
  GUARDIAN_QUEUE_COMPARTMENT: {
    description: 'A real queue compartment (one chunk of a larger queued job, tracked independently) was created.',
    payloadShape: ['uuid', 'queueId', 'chunkIdx', 'chunkTitle', 'state', 'provider', 'retries', 'detection', 'ts'],
    severity: 'info',
  },
  GUARDIAN_QUEUE_COMPARTMENT_UPDATED: {
    description: "An existing queue compartment's real state was updated (e.g. QUEUED → DISPATCHED → COMPLETE).",
    payloadShape: ['uuid'],
    severity: 'info',
  },
  GUARDIAN_SEAM_UPDATED: {
    description: 'A real SEAM session record was updated.',
    payloadShape: ['sessionId'],
    severity: 'info',
  },
  GUARDIAN_SEAM_QUEUE_COMPLETE: {
    description: 'Every compartment in a real SEAM queue finished — the queue itself is now complete.',
    payloadShape: ['queueId'],
    severity: 'notable',
  },

  // ── Intake / build / baseline / CLI — server.js ─────────────────────────────
  GUARDIAN_INTAKE_STAGED: {
    description: 'lib/intake.js staged a real dropped file/archive for review before it enters a job or project compartment.',
    payloadShape: ['dropId', 'provider', 'summary', 'jobId', 'raidQueueId', 'ts'],
    severity: 'info',
  },
  GUARDIAN_BUILD_PROGRESS: {
    description: 'A real build/pipeline node reported its own progress.',
    payloadShape: ['node', 'status', 'detail', 'ts'],
    severity: 'info',
  },
  GUARDIAN_BASELINE_DEVIATION: {
    description: "Guardian's own per-kernel baseline monitor (createBaseline, 20-event warm-up, sigma threshold 0.3) detected a real statistical deviation from its established runtime baseline.",
    payloadShape: ['uuid', 'sigma', 'frictions'],
    severity: 'warning',
  },
  GUARDIAN_CLI_EXEC: {
    description: "A real command was executed through guardian's own CLI endpoint.",
    payloadShape: ['command', 'ts'],
    severity: 'info',
  },

  // ── Autonomous loop — guardian/routes/autonomous-loop.js ────────────────────
  GUARDIAN_AUTONOMOUS_HEARTBEAT: {
    description: 'A real autonomous-loop run reported it is still alive and running, on its own heartbeat interval.',
    payloadShape: ['runId', 'elapsedMs', 'status'],
    severity: 'info',
  },
  GUARDIAN_AUTONOMOUS_COMPLETE: {
    description: 'A real autonomous-loop run finished.',
    payloadShape: ['runId', 'ran', 'stage'],
    severity: 'info',
  },
  GUARDIAN_AUTONOMOUS_ERROR: {
    description: 'A real autonomous-loop run failed.',
    payloadShape: ['runId', 'error'],
    severity: 'failure',
  },

  // ── Gate (sigma) — server.js's own SISOStream.emit() ────────────────────────
  // §CORRECTED — see this file's own header note above: this used to be
  // documented as an "HONEST GAP" (claimed not to exist). It does now.
  GUARDIAN_GATE_FAILED: {
    description: "Every real event guardian emits is checked against lib/sigma-gate.js's own expectation model as it passes through SISOStream.emit(); this fires only on a genuine mismatch (self-referentially guarded — gate.failed and gate.checked are never checked against themselves, which would recurse). gate.checked (a per-pass success signal) is deliberately never emitted — ET6's own real scope only ever asked for a toast per gate FAILURE, not a second event doubling guardian's entire real event volume for a signal nothing asked for.",
    payloadShape: ['type', 'taxonomyKey', 'expected', 'actual'],
    severity: 'warning',
  },
});
