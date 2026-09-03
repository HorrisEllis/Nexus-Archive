'use strict';
/**
 * lib/schemas/cos.js — split out of lib/node-schemas.js (2026-09-03).
 * See lib/schemas/hat.js header for the split rationale.
 *
 * §CORRECTED 2026-09-03 — the original entry (carried over unchanged from
 * node-schemas.js) documented cos/kernel.js's `Compartment` class
 * ({id, name, axioms, llmConfig} — the "K-15" mesh-compartment concept).
 * Checked directly this session: that class is used ONLY by
 * cos/playgrounds/factory.js. It is NOT what `cos create` (the real,
 * live CLI) builds — that goes through cos/host/gates/compartment.js ->
 * cos/foundation/types.js's makeCompartment()/DEFAULT_COMPARTMENT, the
 * shape vault, blueprint, archetype, and state-store all actually operate
 * on. This entry now documents THAT real, live shape instead — as the
 * NexSnapshot payload cos/foundation/snapshot.js's SnapshotEngine.take()
 * actually produces, since that's what a .cos export now wraps (a real,
 * already-built full capture: config + file manifest + process state +
 * event tail — not files' contents, hashes/paths only, so it stays
 * genuinely small enough to live in a YAML envelope). See
 * cos/host/export.js for the real exportCompartment()/importCompartment()
 * wiring this schema now describes.
 */
module.exports = {
  status: 'REAL',
  source: 'cos/foundation/snapshot.js — SnapshotEngine.take()\'s real NexSnapshot record (config from cos/foundation/types.js\'s DEFAULT_COMPARTMENT, the shape the live `cos create` CLI/vault/blueprint/archetype actually use — NOT cos/kernel.js\'s separate, playgrounds-only Compartment class this entry incorrectly documented before this correction)',
  fields: {
    schemaVersion: { type: 'string', required: true,  description: 'real snapshot schema version (SNAP_SCHEMA_VERSION, e.g. "1.0.0") — SnapshotEngine warns, does not refuse, on mismatch' },
    id:            { type: 'string', required: true,  description: 'real snapshot id (shortId())' },
    compartmentId: { type: 'string', required: true,  description: 'real, live compartment id this snapshot captures' },
    triggerEvent:  { type: 'string', required: true,  description: "real cause, e.g. 'host:snapshot:manual'" },
    compartment:   { type: 'object', required: true,  description: 'real, deep-cloned DEFAULT_COMPARTMENT-shaped config at capture time (id/name/purpose/runtimeId/archetypeId/network/fs/compiler/watchdog/hooks/tags/...)' },
    fileManifest:  { type: 'array',  required: true,  description: 'real [{path, sizeBytes, sha256, mtime}] — hashes/paths only, never file contents, from walkManifest()' },
    processState:  { type: 'any',    required: false, description: 'real {pid, runtimeId, startedAt, uptime} if the compartment process was running at capture time, else null' },
    eventTail:     { type: 'array',  required: true,  description: 'real last-N bus events at capture time, [{seq, type, timestamp, payload}]' },
    createdAt:     { type: 'number', required: true,  description: 'real capture timestamp' },
    sizeBytes:     { type: 'number', required: true,  description: 'real gzip-compressed size, filled after serialisation' },
  },
};
