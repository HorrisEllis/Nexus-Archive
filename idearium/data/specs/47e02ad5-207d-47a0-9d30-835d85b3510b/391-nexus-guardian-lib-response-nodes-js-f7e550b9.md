---
chunk_uuid: f7e550b9-4869-41d5-af4b-c72608bcf6e5
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-guardian-lib-response-nodes-js
title: nexus/guardian/lib/response-nodes.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-guardian-lib-response-nodes-js
contract_id: spec-contract:47e02ad5:nexus-guardian-lib-response-nodes-js:f7e550b9
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:38.531Z
---

'use strict';

/**
 * guardian/lib/response-nodes.js
 *
 * §MCO16f 2026-09-14 — James: "we need to generate a .response from the dom
 * mutation live in real time to a .response node... events and .events per
 * event, for failure, timeout and have retry logic like checking the
 * .response. like i want all data tangible using .node types."
 *
 * §WHAT ALREADY EXISTED, checked directly before building anything here —
 * MCO16e (2026-09-13) genuinely built three of the pieces this asks for and
 * they are not rebuilt:
 *   - `.response` is a real KNOWN_TYPE in lib/node-export.js, with a real
 *     schema (lib/node-schemas/schema.response + guardian's sovereign copy).
 *   - guardian/server.js's POST /dom/event writes a real `.response` node
 *     per DOM event, to guardian/data/nodes/response/.
 *   - GET /api/responses reads them back.
 *
 * §WHAT WAS NOT REAL, also checked directly — the four gaps this module
 * closes, none of them guessed at:
 *   1. NOTHING CALLED POST /dom/event. grep across every .js and .html in
 *      the repo: the only callers are tests/modules/mco16e-dom-response-
 *      node.test.js. The real MutationObserver that actually watches a live
 *      response being typed (guardian/userscript-chatgpt.js's startWatch,
 *      and its four sibling userscripts) streams GUARDIAN_CHUNK over NCP and
 *      never posts a DOM event at all. Zero `.response` nodes have ever been
 *      produced from a real live mutation. The route was real and reachable;
 *      nothing reached it.
 *   2. `.response` WAS NOT IN THE REGISTRY. guardian/lib/node-registry.js's
 *      GUARDIAN_NODE_TYPES is ['tool','agent','command','event','intent'] —
 *      no 'response'. So every `.response` file MCO16e wrote landed in a
 *      directory nothing watches: never scanned into _registry, never
 *      appended to that type's _ledger.jsonl, never emitting a registry bus
 *      event. Tangible on disk, invisible to the system. Fixed by adding the
 *      type there (one-line change, in that file, not shadowed here).
 *   3. NO `.event` NODE HAS EVER BEEN WRITTEN. node-registry creates
 *      guardian/data/nodes/event/ and KNOWN_TYPES accepts 'event', but no
 *      code anywhere calls exportToFile('event', ...). The folder has always
 *      been empty. Failure and timeout had no node form at all.
 *   4. NO DELIVERY-LEVEL RETRY. userscript autoRetry() is real but fires only
 *      from detectResponseErrors() on text that ALREADY ARRIVED — it is a
 *      response-QUALITY retry. Nothing retried on a response that never came.
 *
 * §HONEST SCHEMA NOTE — schema.response's `compartmentUuid` was
 * `required: true`, which is correct for MCO16e's only real writer
 * (compartment DOM events) but cannot express this module's real second
 * origin: a guardian JOB, which has a jobId and no compartment. Rather than
 * fabricate a compartmentUuid (§1.2 — MCO16e's own route explicitly refuses
 * to do exactly that), the schema gains a real optional `jobId` and
 * compartmentUuid becomes optional, with the real constraint — at least one
 * of the two — enforced HERE, in the writer. That is deliberate and is the
 * same limitation NODE-TAXONOMY.md already records under "Still mechanically
 * open": node-schemas.js's checkPayload() checks presence and typeof only, so
 * a "one of these two" rule cannot live in the schema file. Documented at the
 * point where it's actually enforced instead of pretended at.
 */

const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

const MODULE_ID = 'guardian/response-nodes';

const NODES_DIR    = path.join(__dirname, '..', 'data', 'nodes');
const RESPONSE_DIR = path.join(NODES_DIR, 'response');
const EVENT_DIR    = path.join(NODES_DIR, 'event');

/**
 * Real DOM phase vocabulary. These are the kinds a live MutationObserver can
 * actually distinguish — not an invented lifecycle. Each maps to a real
 * observable moment in guardian/userscript-*.js's own startWatch():
 *   dom.open     — watch started, first observation scheduled (startWatch)
 *   dom.mutation — text grew; a real delta was observed (the chunk branch)
 *   dom.stable   — text stopped changing and _isGenerating() went false
 *   dom.complete — stability confirmed 3× and _onJobComplete fired
 * `dom.snapshot` and `dom.ready` stay accepted for MCO16e's compartment
 * writer, which already uses them — this is additive, nothing renamed.
 */
const DOM_PHASES = Object.freeze([
  'dom.open', 'dom.mutation', 'dom.stable', 'dom.complete',
  'dom.snapshot', 'dom.ready', 'dom.error',
]);

/** Terminal phases — a job with one of these has really finished in the DOM. */
const TERMINAL_PHASES = Object.freeze(['dom.complete', 'dom.error']);

function _exporter() {
  return require('../../lib/node-export.js');
}

/**
 * writeResponseNode(evt) -> { ok, uuid, path } | { ok:false, reason }
 *
 * One real `.response` node per real DOM event. Never throws: a node write
 * failing must not take down the live stream it is recording (§1.2 — loud,
 * not fatal; same discipline as gapField.report()'s own call sites).
 *
 * @param {object} evt
 * @param {string} [evt.compartmentUuid] real live compartment, when this event came from one
 * @param {string} [evt.jobId]           real guardian job, when this event came from one
 * @param {string} [evt.queueId]         real RAID queue row, when one exists
 * @param {string} evt.domEventType      one of DOM_PHASES
 * @param {string} [evt.agentId]         provider that produced it
 * @param {number} [evt.sequence]        monotonic index within one job/compartment
 * @param {object} [evt.payload]         the real event-specific data (delta, lengths, url)
 * @param {number} [evt.ts]
 */
function writeResponseNode(evt = {}) {
  const {
    compartmentUuid = null, jobId = null, queueId = null,
    domEventType, agentId = null, sequence = null, payload = null, ts,
  } = evt;

  // §1.2 — the real constraint the schema cannot express. A response node
  // anchored to neither a compartment nor a job is not correlatable with
  // anything and is worse than absent: it looks like data.
  if (!compartmentUuid && !jobId) {
    return { ok: false, reason: 'no real compartmentUuid or jobId — not fabricating an anchor' };
  }
  if (!domEventType) {
    return { ok: false, reason: 'domEventType required' };
  }
  if (!DOM_PHASES.includes(domEventType)) {
    // Accepted, not rejected — an unknown phase from a userscript that has
    // moved ahead of this list is real data. Logged so the drift is visible
    // rather than silently normalized into 'unknown'.
    console.warn(`[${MODULE_ID}] unrecognized domEventType "${domEventType}" — written as-is, not coerced`);
  }

  const uuid = randomUUID();
  try {
    _exporter().exportToFile('response', uuid, {
      uuid,
      compartmentUuid, jobId, queueId,
      domEventType,
      agentId,
      sequence,
      payload,
      ts: ts || Date.now(),
    }, {
      system: 'guardian',
      tags: ['dom', 'response', ...(jobId ? ['job'] : []), ...(compartmentUuid ? ['compartment'] : [])],
      context: `live DOM mutation -> .response node (${domEventType})`,
      source: MODULE_ID,
    }, RESPONSE_DIR);
    return { ok: true, uuid, path: path.join(RESPONSE_DIR, `${uuid}.response`) };
  } catch (e) {
    console.warn(`[${MODULE_ID}] .response node write failed (non-fatal): ${e.message}`);
    return { ok: false, reason: e.message };
  }
}

/**
 * writeEventNode({ type, source, payload }) -> { ok, uuid, path } | { ok:false, reason }
 *
 * One real `.event` node per real event, using the already-real schema.event
 * shape (uuid/id/type/source/ts/payload) — confirmed by direct read, not
 * invented here. This is the first code in the repo to ever write one.
 *
 * `type` should be a governed name from guardian/event-taxonomy.js. That is
 * not enforced here for the same reason schema.event's own `type` field says
 * it isn't: no validator exists, and inventing one silently would make the
 * taxonomy look authoritative when it isn't. An unknown type is written and
 * warned about, not dropped.
 */
function writeEventNode({ type, source, payload = null, id = null, ts } = {}) {
  if (!type)   return { ok: false, reason: 'type required' };
  if (!source) return { ok: false, reason: 'source required' };

  const uuid = randomUUID();
  try {
    _exporter().exportToFile('event', uuid, {
      uuid,
      id: id || null,
      type,
      source,
      ts: ts || Date.now(),
      payload,
    }, {
      system: 'guardian',
      tags: ['event', ...(payload && payload.jobId ? ['job'] : [])],
      context: `guardian runtime event -> .event node (${type})`,
      source: MODULE_ID,
    }, EVENT_DIR);
    return { ok: true, uuid, path: path.join(EVENT_DIR, `${uuid}.event`) };
  } catch (e) {
    console.warn(`[${MODULE_ID}] .event node write failed (non-fatal): ${e.message}`);
    return { ok: false, reason: e.message };
  }
}

/**
 * readResponses({ jobId, compartmentUuid, since }) -> [payload, ...] sorted oldest-first.
 *
 * Reads the real files this module wrote, through node-export's own
 * importFromFile (same validate path), not a second parser. A directory that
 * doesn't exist yet is a real, honest empty — not an error.
 */
function readResponses({ jobId = null, compartmentUuid = null, since = 0 } = {}) {
  let files;
  try { files = fs.readdirSync(RESPONSE_DIR); }
  catch (_) { return []; }

  const { importFromFile } = _exporter();
  const out = [];
  for (const f of files) {
    if (!f.endsWith('.response')) continue;
    let p;
    // One malformed file must not fail a query across every valid one —
    // same rule node-export's own queryDir() already established.
    try { p = importFromFile(path.join(RESPONSE_DIR, f)).payload; }
    catch (_) { continue; }
    if (!p) continue;
    if (jobId && p.jobId !== jobId) continue;
    if (compartmentUuid && p.compartmentUuid !== compartmentUuid) continue;
    if (since && (p.ts || 0) < since) continue;
    out.push(p);
  }
  out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return out;
}

/**
 * inspectJob(jobId) -> the real answer the retry gate needs, computed from
 * nodes on disk rather than from in-memory job state.
 *
 * §WHY FROM DISK — this is the whole point of "all data tangible using .node
 * types". guardian/lib/jobs.js's in-memory Map is exactly what was lost in
 * the failure that started this: copilot/tool-runtime.js's own comment says
 * the `/response/:jobId` recovery path is "already more resilient than the
 * in-memory-only path that failed". A gate that reads the same volatile state
 * that already failed would inherit the same blind spot. These nodes survive
 * a process restart; the Map does not.
 *
 * @returns {{
 *   count:number, terminal:boolean, terminalPhase:string|null,
 *   lastTs:number|null, silentMs:number|null, chars:number|null, phases:string[]
 * }}
 */
function inspectJob(jobId) {
  const rows = readResponses({ jobId });
  if (!rows.length) {
    return { count: 0, terminal: false, terminalPhase: null, lastTs: null, silentMs: null, chars: null, phases: [] };
  }
  const last = rows[rows.length - 1];
  const terminalRow = rows.find(r => TERMINAL_PHASES.includes(r.domEventType)) || null;
  // `chars` is only read from a row that actually carried it — absent is
  // null, never 0, because 0 is a real length and would read as "empty
  // response" when the truth is "we never measured".
  const withChars = rows.filter(r => r.payload && typeof r.payload.chars === 'number');
  return {
    count: rows.length,
    terminal: !!terminalRow,
    terminalPhase: terminalRow ? terminalRow.domEventType : null,
    lastTs: last.ts || null,
    silentMs: last.ts ? Date.now() - last.ts : null,
    chars: withChars.length ? withChars[withChars.length - 1].payload.chars : null,
    phases: rows.map(r => r.domEventType),
  };
}

module.exports = {
  writeResponseNode, writeEventNode, readResponses, inspectJob,
  DOM_PHASES, TERMINAL_PHASES, RESPONSE_DIR, EVENT_DIR, MODULE_ID,
};