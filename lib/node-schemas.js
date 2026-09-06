'use strict';
/**
 * lib/node-schemas.js — the real schema for every node/extension type
 * lib/node-export.js's envelope can carry.
 * UUID: nexus-node-schemas-v1-0000-2026-0903-001
 *
 * §GROUNDING RULE — every schema below is either (a) a direct reference to
 * a schema that already exists as real code (HAT_SCHEMA, loom's
 * COMPONENT/HOOK/WIRE_SCHEMA — never redefined here, since duplicating an
 * existing schema is a second source of truth for the same real fields),
 * or (b) freshly written from the real record-construction code for that
 * type, read this session, cited in each entry's `source`. Nothing below
 * was invented from the extension name alone. All 17 named types are now
 * status: 'REAL' — macro and failure_mode were the last two, found after
 * James pointed at where to look ("clear-glass: .macro", "data folders:
 * .failure_mode") rather than guessed at: macro -> lib/agent-tools/tools/
 * clear-glass/macro.js's real record; failure_mode -> lib/ico.js's real
 * per-system failures/ ledger (every data/<system>/failures/ dir is this
 * exact shape).
 *
 * Shape every entry follows:
 *   {
 *     status: 'REAL' | 'OPEN',        // REAL = grounded in existing code; OPEN = proposed, unbacked
 *     source: 'file.js — what real construction site this came from',
 *     fields: { name: { type, required, description } },
 *   }
 * `type` is a plain JS typeof string, or 'array'/'any' where the real
 * field is looser than that (matching loom's own Gate.schema convention
 * of only checking typeof, not a deep shape).
 */

const HAT_SCHEMA = require('./hat-forge.js').HAT_SCHEMA;
const { COMPONENT_SCHEMA, HOOK_SCHEMA, WIRE_SCHEMA } = require('../loom/schema/definitions.js');

const SCHEMAS = {

  // ── Already real, formal schemas elsewhere — referenced, not duplicated ──
  hat: {
    status: 'REAL',
    source: 'lib/hat-forge.js — HAT_SCHEMA (own real schema, this session added exportHat()/importHat())',
    fields: HAT_SCHEMA, // {field: 'description'} shape — hat-forge's own convention, kept as-is
  },
  component: {
    status: 'REAL',
    source: 'loom/schema/definitions.js — COMPONENT_SCHEMA (real, enforced by componentDeclareGate)',
    fields: {
      id:        { type: 'string', required: true,  description: COMPONENT_SCHEMA.types.id },
      namespace: { type: 'string', required: true,  description: 'component namespace' },
      name:      { type: 'string', required: true,  description: 'component display/file name' },
      version:   { type: 'string', required: true,  description: 'semver-ish version string' },
      dir:       { type: 'string', required: false, description: 'optional real filesystem path, added by SB1' },
      uuid:      { type: 'string', required: true,  description: 'enforced by the loom.uuid-present Axiom, not this schema' },
    },
  },
  node: {
    status: 'REAL',
    source: 'loom/schema/definitions.js — a generic loom graph node is one of component|hook|wire; this schema is the union',
    fields: {
      kind:            { type: 'string', required: true, description: "'component' | 'hook' | 'wire' — which real loom declare() this node is" },
      id:              { type: 'string', required: true, description: 'real id, meaning depends on kind' },
      component_id:    { type: 'string', required: false, description: 'present on hook nodes only' },
      from_hook_id:    { type: 'string', required: false, description: 'present on wire nodes only' },
      to_hook_id:      { type: 'string', required: false, description: 'present on wire nodes only' },
      direction:       { type: 'string', required: false, description: "hook only — 'in' | 'out' | 'bidirectional'" },
    },
  },

  // ── Newly grounded this pass, from real construction sites ──────────────
  contract: {
    status: 'REAL',
    source: 'cortex/core/raid/contract-intake.js — BUILD_CONTRACT_SCHEMA + synthesizeContract() (B1, built 2026-09-03). Supersedes the older, narrower submitContract() queue-row shape this entry originally documented — every field below is real, validated, and persisted, not just a queue-row description.',
    fields: {
      uuid:            { type: 'string', required: true,  description: 'real queue id, assigned by submitContract()' },
      forAgent:        { type: 'string', required: true,  description: 'real target agent or hat name' },
      intention:       { type: 'string', required: true,  description: 'a real verb from intent-classifier.js\'s VALID_VERBS, validated. §NAMING — B1\'s own phasemap spec calls this field "intent"; the real persisted RAID queue-row field has been named `intention` since before B1 existed (submitContract()\'s own real param). synthesizeContract() honors the existing real field name rather than introducing a second, conflicting one for the same fact.' },
      system:          { type: 'string', required: false, description: 'which real SYSTEM this contract concerns' },
      endState:        { type: 'string', required: true,  description: 'the real target condition, not a task description' },
      conditions:      { type: 'object', required: false, description: 'structured { pre: string[], post: string[] }' },
      context:         { type: 'string', required: false, description: 'real context, pulled on demand via toolScope' },
      warpPrimitives:  { type: 'array',  required: false, description: 'subset of the real 5: Event, Gate, Axiom, Stream, StreamLog — validated against warp/core' },
      axioms:          { type: 'array',  required: false, description: 'real §N.N refs, validated live against docs/AXIOMS-v3.1.md' },
      tools:           { type: 'array',  required: false, description: 'real toolScope; defaults from forAgent\'s hat when omitted' },
      compartmentUuid: { type: 'string', required: false, description: 'a real, specific existing compartment to target' },
      fileDirectory:   { type: 'string', required: false, description: 'real target directory this contract\'s work lands in' },
      fileName:        { type: 'string', required: false, description: 'real target file name' },
    },
  },
  agent: {
    status: 'REAL',
    source: 'cortex/core/raid/index.js — _agentAvailable()\'s real per-agent health snapshot fields',
    fields: {
      dispatchName:     { type: 'string',  required: true,  description: 'real provider/hat dispatch name' },
      online:           { type: 'boolean', required: true,  description: 'real live reachability' },
      consecutiveFails: { type: 'number',  required: false, description: 'real streak, gates availability at >=3 (or 1 under CFR stress)' },
      callCount:        { type: 'number',  required: false, description: 'real total calls, used to gate successRate at >=5' },
      successRate:      { type: 'number',  required: false, description: 'real 0-1 rate, refuses dispatch below 0.2 once callCount>=5' },
      role:             { type: 'string',  required: false, description: "real role tag — dispatch refused if 'violated'" },
    },
  },
  model: {
    status: 'REAL',
    source: 'ollama/config.js — the one real place model tags live (DEFAULT_MODEL/FALLBACK_MODEL)',
    fields: {
      tag:  { type: 'string', required: true,  description: 'a real, verified Ollama model tag, e.g. "mistral:7b-instruct-q4_K_M"' },
      role: { type: 'string', required: false, description: "'default' | 'fallback' — which real config slot this fills" },
      envVar: { type: 'string', required: false, description: 'the real env var that overrides this tag, if any' },
    },
  },
  schema: {
    status: 'REAL',
    source: 'this file\'s own convention, and hat-forge.js\'s HAT_SCHEMA / loom\'s definitions.js — the real, established shape a NEXUS schema object already takes',
    fields: {
      status: { type: 'string', required: true, description: "'REAL' | 'OPEN'" },
      source: { type: 'string', required: true, description: 'the real file/construction-site this schema is grounded in' },
      fields: { type: 'object', required: true, description: 'field name -> {type, required, description}' },
    },
  },
  crystal: {
    status: 'REAL',
    source: 'meta/crystal-lattice.js — _maybeCrystallize()\'s real crystal record',
    fields: {
      uuid:                          { type: 'string', required: true, description: 'real crystal id' },
      kind:                          { type: 'string', required: true, description: "'CREATE_CRYSTAL' | 'CREATE_NEGATIVE_CRYSTAL'" },
      pattern_signature:             { type: 'string', required: true, description: 'the real pattern key this crystallized from' },
      entry_conditions:              { type: 'object', required: true, description: '{domain, verb, risk_ceiling}' },
      exit_conditions:               { type: 'object', required: true, description: '{outcome}' },
      success_probability:           { type: 'number', required: true, description: '1.0 for positive, 0.0 for negative crystals' },
      failure_boundaries:            { type: 'array',  required: true, description: 'real outcome kinds this crystal fails on' },
      support_paths:                 { type: 'array',  required: true, description: 'real compartment ids that support this crystal' },
      usage_count:                   { type: 'number', required: true, description: 'real usage counter' },
      pattern_frequency_at_creation: { type: 'number', required: true, description: 'real frequency count at the moment of crystallization' },
    },
  },
  pat: {
    status: 'REAL',
    source: 'lib/case-library.js — the real case_index entry (past-compartment pattern memory)',
    fields: {
      uuid:                  { type: 'string', required: true,  description: 'real case id' },
      signature:             { type: 'string', required: true,  description: 'real pattern signature (domain:verb)' },
      domain:                { type: 'string', required: true,  description: 'real declared domain' },
      verb:                  { type: 'string', required: true,  description: 'real declared verb' },
      compartment_uuid:      { type: 'string', required: true,  description: 'the real compartment this pattern came from' },
      intent_uuid:           { type: 'string', required: false, description: 'real intent id, if any' },
      working_memory:        { type: 'any',    required: false, description: 'a real snapshot, not a live reference (§BUGFIX 2026-08-28)' },
      result:                { type: 'any',    required: false, description: 'real compartment result' },
      trace_log:             { type: 'array',  required: true,  description: 'a real deep-copied snapshot, never the live array' },
      constraint_frame_uuid: { type: 'string', required: false, description: 'real constraint frame this ran under' },
    },
  },
  gap: {
    status: 'REAL',
    source: 'lib/gap-field.js — the real gap record construction',
    fields: {
      uuid:            { type: 'string', required: true,  description: 'real gap id' },
      type:            { type: 'string', required: true,  description: 'real gap type' },
      domain:          { type: 'string', required: false, description: 'real domain this gap belongs to' },
      body:            { type: 'string', required: true,  description: 'real description of the gap' },
      source:          { type: 'string', required: true,  description: 'real SYSTEM that logged this gap' },
      severity:        { type: 'string', required: true,  description: 'real severity level' },
      status:          { type: 'string', required: true,  description: "starts 'open'" },
      causedBy:        { type: 'string', required: false, description: 'real causal chain reference' },
      dedup_key:       { type: 'string', required: false, description: 'real dedup key — repeated gaps bump occurrences instead of duplicating' },
      occurrences:     { type: 'number', required: true,  description: 'real repeat counter, starts at 1' },
      component:       { type: 'string', required: false, description: "the specific real loom-known thing inside `source`" },
      location:        { type: 'string', required: false, description: 'real file/location this gap concerns' },
      resourceState:   { type: 'any',    required: false, description: 'real auto-captured resource state' },
      priority:        { type: 'number', required: false, description: 'real composite score from lib/gap-priority.js' },
    },
  },
  ledger: {
    status: 'REAL',
    source: 'lib/component-ledger.js — write()\'s real parameters/row shape',
    fields: {
      system:       { type: 'string', required: true,  description: 'real system name — refused if missing (§1.1)' },
      component:    { type: 'string', required: true,  description: 'real component name — refused if missing' },
      action:       { type: 'string', required: true,  description: 'real action taken — refused if missing' },
      status:       { type: 'string', required: false, description: "defaults to 'info'" },
      tags:         { type: 'array',  required: false, description: 'real tags, defaults to []' },
      detail:       { type: 'any',    required: false, description: 'real free-form detail' },
      causedBy:     { type: 'string', required: false, description: 'real causal chain reference' },
      contractUuid: { type: 'string', required: false, description: 'real RAID contract this ledger entry traces to' },
      session:      { type: 'string', required: false, description: 'real session id' },
    },
  },
  tool: {
    status: 'REAL',
    source: 'lib/agent-tools/tools/**/*.js — the real, universal tool export shape (checked against read-file.js)',
    fields: {
      name:        { type: 'string', required: true, description: 'real, unique tool name agents call by' },
      description: { type: 'string', required: true, description: 'real, model-facing description' },
      parameters:  { type: 'object', required: true, description: 'real JSON-schema-shaped {type, properties, required}' },
      execute:     { type: 'any',    required: true, description: 'the real async function — not serializable, present only in-process' },
    },
  },
  command: {
    status: 'REAL',
    source: 'clear-glass/src/ipc/bridge.js — _buildCommandIndex()\'s real, live-introspected route entries',
    fields: {
      method: { type: 'string', required: true, description: "real HTTP method, e.g. 'GET'" },
      path:   { type: 'string', required: true, description: 'real route path, introspected from Express\'s own route table, never hand-maintained' },
    },
  },
  cos: {
    status: 'REAL',
    source: 'cos/kernel.js — the real Compartment class constructor',
    fields: {
      id:        { type: 'string', required: true,  description: 'real, unique compartment id' },
      name:      { type: 'string', required: false, description: 'real human-readable name, defaults to id' },
      axioms:    { type: 'array',  required: true,  description: '1-5 real identity-defining invariant strings' },
      llmConfig: { type: 'object', required: false, description: 'real {model, host, port} for Ollama' },
    },
  },

  // ── Genuinely open — no real backing module or table found this pass ────
  macro: {
    status: 'REAL',
    source: 'lib/agent-tools/tools/clear-glass/macro.js — the real macro record (create action), James: "clear-glass: .macro" pointed here directly',
    fields: {
      uuid:        { type: 'string', required: true,  description: 'real macro id' },
      name:        { type: 'string', required: true,  description: 'real macro name' },
      urlPattern:  { type: 'string', required: false, description: 'real glob ("*") pattern the current page must match before running' },
      steps:       { type: 'array',  required: true,  description: 'real [{action, data}] or [{engine:"erosmancer", action, targetUuid, data}] — each a real, valid browser_action name' },
      params:      { type: 'array',  required: false, description: 'real named parameters a caller fills in per run' },
      profile:     { type: 'string', required: false, description: "one of 'precise'|'cautious'|'exploratory'|'turbo' — erosmancer behavior profile, or null for its own adaptive pick" },
      description: { type: 'string', required: false, description: 'real, optional human description' },
      createdAt:   { type: 'number', required: true,  description: 'real creation timestamp' },
      runCount:    { type: 'number', required: true,  description: 'real run counter, starts at 0' },
      lastRunAt:   { type: 'any',    required: false, description: 'real timestamp of last run, null until first run' },
    },
  },
  failure_mode: {
    status: 'REAL',
    source: 'lib/ico.js — logFailure()\'s real failure-mode ledger record. James: "data folders: .failure_mode" pointed here — every system\'s data/<system>/failures/ dir (confirmed real: data/guardian/failures, data/cortex/*, data/idearium/failures, etc., one per ICO kernel instance) is this exact shape, appended as ndjson',
    fields: {
      error:    { type: 'string', required: true,  description: 'real error description — logFailure()\'s only truly required field' },
      solution: { type: 'any',    required: false, description: 'real fix/workaround, null until one is known' },
      friction: { type: 'number', required: false, description: 'real friction score, defaults to 0' },
      source:   { type: 'string', required: false, description: 'real originating system, null if not given' },
      ts:       { type: 'number', required: true,  description: 'real timestamp, defaults to Date.now()' },
    },
  },
};

/** get(type) -> the schema entry, or null if the type is unknown. */
function get(type) { return SCHEMAS[type] || null; }

/** list() -> [{type, status, source}] for every known type, real state at a glance. */
function list() {
  return Object.entries(SCHEMAS).map(([type, s]) => ({ type, status: s.status, source: s.source }));
}

/**
 * checkPayload(type, payload) -> {ok, missing, wrongType}. A real, shallow
 * typeof-based check — same depth loom's own Gate.schema uses (checks
 * required keys + top-level typeof only), not a deep structural validator.
 */
function checkPayload(type, payload) {
  const schema = get(type);
  if (!schema) return { ok: false, missing: [], wrongType: [], reason: `unknown type "${type}"` };
  if (!payload || typeof payload !== 'object') return { ok: false, missing: Object.keys(schema.fields), wrongType: [], reason: 'payload is not an object' };

  const missing = [];
  const wrongType = [];
  for (const [field, def] of Object.entries(schema.fields)) {
    if (def.required !== true) continue; // HAT_SCHEMA's {field: 'string'} entries have no .required flag — treated as documentation-only, not enforced here
    if (!(field in payload) || payload[field] === undefined) { missing.push(field); continue; }
    if (def.type && def.type !== 'any') {
      const actual = Array.isArray(payload[field]) ? 'array' : typeof payload[field];
      if (def.type !== actual) wrongType.push({ field, expected: def.type, actual });
    }
  }
  return { ok: missing.length === 0 && wrongType.length === 0, missing, wrongType };
}

module.exports = { SCHEMAS, get, list, checkPayload };
