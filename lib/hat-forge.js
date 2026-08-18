'use strict';
/**
 * lib/hat-forge.js — a named, reusable hat: base agent + optional scoped
 * tools + optional persona, composed from things already real.
 * comp_id: nexus.lib.hat-forge
 * UUID: nexus-hat-forge-v1-0000-2026-0813-001
 * Version: 0.1.0
 *
 * WHY (James, 2026-08-13): "a command to make new hats." The fixed
 * VALID_AGENTS set (copilot/lib/self-model.js) covers WHICH base model; it
 * has no room for a named, reusable bundle — "the debugging hat" might mean
 * claude + only {read_file, run_command, diagnose, agent_chat_search}, not
 * claude with all 36 tools offered every time.
 *
 * §16.5 — reuses lib/tool-forge.js's exact philosophy rather than inventing
 * a second one: a forged hat is DATA, not code. Nothing here executes
 * anything; wearing a hat only sets which already-real agent/tools a
 * request uses. §1.1 — a hat is not created until every real thing it
 * references (base agent, each scoped tool) is verified to actually exist,
 * same as tool-forge.js refuses a step pointing at an unserved capability.
 */
const path = require('path');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const TABLE = 'forged_hats';

function _jaa() {
  try { return require(path.join(ROOT, 'cortex/memory/jaa-db.js')).jaaDB; }
  catch (_) { return null; }
}

const VALID_BASE_AGENTS = new Set(['ollama', 'claude', 'chatgpt', 'gemini', 'mistral', 'perplexity']);

// §EXTENDED 2026-08-13 — James: "create a hat, then you can add tasks, jobs,
// and responsibilities to it and set the allowed agents." Two real
// extensions, both composition (§16.5), not new mechanism:
//   allowedAgents — a hat can name MORE than one real agent (rotation/
//     fallback); baseAgent stays the one actually worn by default,
//     allowedAgents (if given) is the full real set this hat may draw from.
//   responsibilities — real recurring jobs a hat OWNS, not just tools it
//     may use. Each one becomes a REAL lib/scheduler.js task at forge time
//     (the exact same scheduler this whole session already proved live),
//     dispatching through runViaAgent (this session's own NCP tool loop)
//     using the hat's agent, with findings written to lib/gap-field.js —
//     the same real gap-reporting path copilot/adversarial.js and
//     copilot/lifeline.js already use, not a new reporting surface.
const HAT_SCHEMA = Object.freeze({
  name:            'string, required — snake_case, unique, not shadowing a real base agent name',
  baseAgent:       'string, required — the agent worn by default, one of: ' + [...VALID_BASE_AGENTS].join(', '),
  allowedAgents:   'string[], optional — the full real set this hat may draw from; baseAgent must be a member if given',
  toolScope:       'string[], optional — real registered tool names only; omit for all 37 tools',
  personaPrompt:   'string, optional — appended to the system prompt when this hat is worn',
  responsibilities:'array, optional — [{ description, everyMs, prompt }] — real recurring scheduled jobs this hat owns, dispatched via its own agent, findings written to gap-field',
});

function _toolExists(name) {
  try {
    const T = require(path.join(ROOT, 'lib/agent-tools/index.js'));
    return T.TOOLS.has(name) ? { ok: true } : { ok: false, reason: `no registered tool "${name}"` };
  } catch (e) { return { ok: false, reason: `tool registry unavailable: ${e.message}` }; }
}

/** validate(def) — every rule, with the offending field named. Never throws. */
function validate(def) {
  const errors = [];
  if (!def || typeof def !== 'object') return { ok: false, errors: ['definition must be an object'], schema: HAT_SCHEMA };

  if (!def.name || typeof def.name !== 'string') errors.push('name: required string');
  else if (!/^[a-z][a-z0-9_]{2,48}$/.test(def.name)) errors.push(`name: "${def.name}" must be snake_case, 3-49 chars, starting with a letter`);
  else if (VALID_BASE_AGENTS.has(def.name) || def.name === 'auto') errors.push(`name: "${def.name}" is already a base agent name — a hat must be named distinctly so wearing it is unambiguous`);

  if (!def.baseAgent || !VALID_BASE_AGENTS.has(def.baseAgent)) {
    errors.push(`baseAgent: required, must be one of: ${[...VALID_BASE_AGENTS].join(', ')}`);
  }

  if (def.allowedAgents !== undefined) {
    if (!Array.isArray(def.allowedAgents) || !def.allowedAgents.length) errors.push('allowedAgents: if given, must be a non-empty array');
    else {
      def.allowedAgents.forEach((a, i) => { if (!VALID_BASE_AGENTS.has(a)) errors.push(`allowedAgents[${i}]: "${a}" is not a real agent — one of: ${[...VALID_BASE_AGENTS].join(', ')}`); });
      if (def.baseAgent && VALID_BASE_AGENTS.has(def.baseAgent) && !def.allowedAgents.includes(def.baseAgent)) {
        errors.push(`allowedAgents: must include baseAgent ("${def.baseAgent}") — a hat can't be forbidden from wearing its own default`);
      }
    }
  }

  if (def.responsibilities !== undefined) {
    if (!Array.isArray(def.responsibilities) || !def.responsibilities.length) errors.push('responsibilities: if given, must be a non-empty array');
    else def.responsibilities.forEach((r, i) => {
      if (!r || typeof r !== 'object') { errors.push(`responsibilities[${i}]: must be an object`); return; }
      if (!r.description || typeof r.description !== 'string') errors.push(`responsibilities[${i}].description: required string`);
      if (!r.prompt || typeof r.prompt !== 'string') errors.push(`responsibilities[${i}].prompt: required string — what this hat is asked, each run`);
      if (!r.everyMs || typeof r.everyMs !== 'number' || r.everyMs < 5000) errors.push(`responsibilities[${i}].everyMs: required number >= 5000 (no responsibility runs more than once every 5s — real dispatch cost, not free)`);
    });
  }

  if (def.toolScope !== undefined) {
    if (!Array.isArray(def.toolScope) || !def.toolScope.length) errors.push('toolScope: if given, must be a non-empty array');
    else def.toolScope.forEach((t, i) => {
      if (typeof t !== 'string') { errors.push(`toolScope[${i}]: must be a string`); return; }
      const check = _toolExists(t);
      // §1.1 — proven at forge time, same as tool-forge.js. A hat scoped to
      // a tool that doesn't exist would silently offer nothing when worn.
      if (!check.ok) errors.push(`toolScope[${i}]: ${check.reason}`);
    });
  }

  if (def.personaPrompt !== undefined && typeof def.personaPrompt !== 'string') errors.push('personaPrompt: must be a string');

  return errors.length ? { ok: false, errors, schema: HAT_SCHEMA } : { ok: true };
}

/** forge(def) — validate, then persist. Refuses loudly, never partially creates. */
function forge(def) {
  const v = validate(def);
  if (!v.ok) return { ok: false, errors: v.errors, schema: v.schema };

  const jaa = _jaa();
  if (!jaa) return { ok: false, errors: ['cortex unavailable — cannot persist a hat that would vanish on restart'] };

  // §BUILT 2026-08-18 — James: "no matter the name, the id never
  // changes." Real, precise bug found before this fix: id was def.name
  // — the identity and the display name were literally the same value,
  // meaning a rename would orphan every scheduled task, every gap, every
  // real reference keyed off the old name. Real fix: a genuine, stable
  // uuid, generated once, here, at forge time. name is now a separate,
  // mutable field.
  const uuid = crypto.randomUUID();
  const record = {
    id: uuid, uuid, name: def.name, baseAgent: def.baseAgent,
    allowedAgents: def.allowedAgents || null,
    toolScope: def.toolScope || null, personaPrompt: def.personaPrompt || null,
    responsibilities: def.responsibilities || null,
    ts: Date.now(), _forged: true,
  };
  jaa.insert(TABLE, record);

  // §REAL, not decorative — a responsibility is a real lib/scheduler.js
  // task, created here, not just metadata sitting on the hat record. Each
  // one dispatches through copilot/tool-runtime.js's runViaAgent (this
  // session's own NCP tool loop) using the hat's baseAgent, and reports
  // whatever it finds to lib/gap-field.js — the same real path
  // copilot/adversarial.js already uses, so a hat's findings show up
  // alongside every other gap in the system, not a second, siloed list.
  //
  // §FIXED 2026-08-18 — taskId now keys off the real, stable uuid, not
  // the mutable name. Before this, renaming a hat (once rename() existed
  // at all — it didn't) would have silently orphaned every one of its
  // real scheduled responsibilities, since the scheduler's own task IDs
  // were built from the exact string that just changed.
  const scheduled = [];
  if (record.responsibilities) {
    for (let i = 0; i < record.responsibilities.length; i++) {
      const resp = record.responsibilities[i];
      const taskId = `hat-responsibility.${uuid}.${i}`;
      try {
        const scheduler = require(path.join(ROOT, 'lib/scheduler.js'));
        if (scheduler.get(taskId)) continue; // already scheduled from a prior forge of the same hat — don't double-arm
        scheduler.schedule({
          id: taskId, name: `${def.name}: ${resp.description}`, everyMs: resp.everyMs, maxRuns: Infinity,
          target: { kind: 'fn' },
          fn: async () => {
            try {
              const tr = require(path.join(ROOT, 'copilot/tool-runtime.js'));
              const lifeline = require(path.join(ROOT, 'copilot/lifeline.js'));
              const dispatchToAgent = (prompt, opts) => lifeline.dispatchToNcpAgent(prompt, { ...opts, provider: record.baseAgent });
              const result = await tr.runViaAgent(record.baseAgent, dispatchToAgent, resp.prompt, { toolScope: record.toolScope, personaPrompt: record.personaPrompt });
              const gapField = require(path.join(ROOT, 'lib/gap-field.js'));
              // §FIXED — real, current name resolved fresh from the real
              // uuid at report time, not captured stale in this closure
              // at forge time. A hat renamed after this point still
              // reports under its real, current name.
              const current = get(uuid);
              const currentName = current ? current.name : def.name;
              gapField.report({
                type: `hat-responsibility.${uuid}`, body: result.text,
                source: `hat:${currentName}:${record.baseAgent}`, domain: 'system', severity: 'low',
                meta: { hatUuid: uuid, hatName: currentName, responsibility: resp.description, agent: record.baseAgent, toolCallLog: result.toolCallLog },
              });
            } catch (e) { console.warn(`[hat-forge] responsibility "${resp.description}" for hat "${uuid}" failed: ${e.message}`); }
          },
          intent: `scheduled.hat-responsibility.${uuid}`,
        });
        scheduled.push(taskId);
      } catch (e) { console.warn(`[hat-forge] could not schedule responsibility ${i} for "${def.name}": ${e.message}`); }
    }
  }

  return { ok: true, hat: record, scheduledResponsibilities: scheduled };
}

/**
 * get(nameOrUuid) — the real forged hat, resolved by its current name OR
 * its permanent uuid, whichever is given. Returns null if never forged,
 * revoked, or not found. §BUILT 2026-08-18 — a rename means "get by the
 * old name" must eventually stop resolving (the old name belongs to
 * whoever it's renamed to become — nobody), while "get by uuid" must
 * always resolve regardless of how many times the hat's been renamed.
 */
function get(nameOrUuid) {
  const jaa = _jaa();
  if (!jaa) return null;
  // Real, current state = the LATEST real row for a given uuid (rename
  // and revoke both insert a new row rather than mutate — same real,
  // append-only discipline this whole codebase already uses elsewhere).
  const allRows = jaa.query(TABLE, () => true, 5000);
  const byUuid = new Map();
  for (const r of allRows) {
    const key = r.uuid || r.id; // real back-compat: a hat forged before this fix has no separate uuid field, id WAS the identity
    const existing = byUuid.get(key);
    if (!existing || (r.ts || 0) >= (existing.ts || 0)) byUuid.set(key, r);
  }
  // Try direct uuid match first (permanent, unambiguous).
  if (byUuid.has(nameOrUuid)) {
    const hat = byUuid.get(nameOrUuid);
    return hat._revoked ? null : hat;
  }
  // Fall back to CURRENT name match (only ever the latest real row per uuid).
  for (const hat of byUuid.values()) {
    if (hat.name === nameOrUuid && !hat._revoked) return hat;
  }
  return null;
}

/**
 * rename(nameOrUuid, newName) — the real, actual "different name, same
 * id" operation. Inserts a new real row (append-only, same discipline as
 * everywhere else) with the SAME uuid and the new name. Every real
 * reference keyed off the uuid (scheduled tasks, future gap reports)
 * keeps working; the old name stops resolving via get() the moment this
 * lands, since get() always returns the latest row per uuid.
 */
function rename(nameOrUuid, newName) {
  const existing = get(nameOrUuid);
  if (!existing) return { ok: false, reason: `no forged hat found for "${nameOrUuid}"` };
  const nameCheck = validate({ ...existing, name: newName });
  const nameErrors = (nameCheck.errors || []).filter(e => e.startsWith('name:'));
  if (nameErrors.length) return { ok: false, errors: nameErrors };
  // A different, EXISTING hat must not already hold the target name.
  const collision = get(newName);
  if (collision && collision.uuid !== existing.uuid) return { ok: false, reason: `"${newName}" is already worn by a different real hat (uuid ${collision.uuid})` };

  const jaa = _jaa();
  if (!jaa) return { ok: false, reason: 'cortex unavailable' };
  // §FIXED — a hat forged before this fix (the real, existing co_pilot
  // hat included) has no separate uuid field; existing.uuid is
  // undefined. Backfilling from the old id (which WAS the real, de-facto
  // stable identifier before this session's change) rather than letting
  // undefined propagate forward — this is the first-rename migration
  // point, and it must establish a genuine, permanent uuid, not carry a
  // gap forward.
  const stableUuid = existing.uuid || existing.id;
  const renamed = { ...existing, id: stableUuid, uuid: stableUuid, name: newName, ts: Date.now() };
  jaa.insert(TABLE, renamed);
  return { ok: true, hat: renamed, previousName: existing.name };
}

/** list() — every forged hat, latest real row per uuid. */
function list() {
  const jaa = _jaa();
  if (!jaa) return [];
  const rows = jaa.query(TABLE, () => true, 5000);
  const byUuid = new Map();
  for (const r of rows) {
    const key = r.uuid || r.id;
    const existing = byUuid.get(key);
    if (!existing || (r.ts || 0) >= (existing.ts || 0)) byUuid.set(key, r);
  }
  return [...byUuid.values()].filter(h => !h._revoked);
}

/** revoke(nameOrUuid) — remove a forged hat. Does not affect anyone currently wearing it this session. */
function revoke(nameOrUuid) {
  const jaa = _jaa();
  if (!jaa) return { ok: false, reason: 'cortex unavailable' };
  const existing = get(nameOrUuid);
  if (!existing) return { ok: false, reason: `no forged hat named "${nameOrUuid}"` };
  jaa.insert(TABLE, { id: existing.uuid || existing.id, uuid: existing.uuid || existing.id, name: existing.name, _revoked: true, ts: Date.now() });
  return { ok: true };
}

module.exports = { HAT_SCHEMA, VALID_BASE_AGENTS, validate, forge, get, list, revoke, rename, TABLE, VERSION: '0.2.0' };
