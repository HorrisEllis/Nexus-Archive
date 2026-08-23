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
  seedKey:         'string, optional — a permanent ROLE label (snake_case), unique across live hats. Survives every rename. This is what a well-known hat is looked up by; name is for humans, uuid is for references, seedKey is for "whichever hat currently fills this role".',
  // §PERSONALITY-MODEL 2026-08-23 — James: "personalities are also hats
  // using the hat forge, and a model per model." Real, new field, not
  // folded into personaPrompt: a hat's PROMPT and a hat's MODEL are
  // genuinely separate axes — two hats can share a persona with
  // different models, or share a model with different personas.
  // Meaningful only when 'ollama' is reachable through this hat (its
  // baseAgent, or present in allowedAgents) — claude/chatgpt/gemini/
  // mistral/perplexity are fixed, hosted services with no real per-hat
  // model choice to make.
  model:           'string, optional — a specific, real Ollama model tag this hat dispatches through when worn. Requires "ollama" to be this hat\'s baseAgent or present in allowedAgents.',
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

  // §PERSONALITY-MODEL 2026-08-23 — real, not decorative: a model tag is
  // meaningless unless this hat can actually reach ollama to use it.
  if (def.model !== undefined) {
    if (typeof def.model !== 'string' || !def.model.trim()) errors.push('model: if given, must be a non-empty string (a real, exact Ollama tag)');
    const reachesOllama = def.baseAgent === 'ollama' || (Array.isArray(def.allowedAgents) && def.allowedAgents.includes('ollama'));
    if (!reachesOllama) errors.push(`model: "${def.model}" given, but this hat can't reach ollama — baseAgent must be "ollama" or allowedAgents must include it`);
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

  // §BUILT 2026-08-18 — seedKey. A hat has THREE identifiers and they do
  // three different jobs; collapsing any two of them is what caused every
  // defect this patch closes:
  //   uuid    — permanent, machine, for references (scheduled tasks, gaps)
  //   name    — mutable, human, for wearing and reading
  //   seedKey — permanent, machine, for ROLES ("whichever hat audits")
  // Without the third, anything that needs a well-known hat has no choice
  // but to hardcode the mutable name, which is exactly what hat-seed.js and
  // intent-hat-router.js each did.
  if (def.seedKey !== undefined && def.seedKey !== null) {
    if (typeof def.seedKey !== 'string' || !/^[a-z][a-z0-9_]{2,48}$/.test(def.seedKey)) {
      errors.push(`seedKey: "${def.seedKey}" must be snake_case, 3-49 chars, starting with a letter`);
    }
  }

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
  // A seedKey names a ROLE, and two live hats claiming the same role is
  // ambiguous in exactly the way a duplicate name is — refuse it here rather
  // than let bySeedKey() pick one arbitrarily later.
  if (def.seedKey) {
    const held = bySeedKey(def.seedKey);
    if (held) return { ok: false, errors: [`seedKey: "${def.seedKey}" is already held by the live hat "${held.name}" (uuid ${held.uuid || held.id})`], schema: HAT_SCHEMA };
  }
  if (byName(def.name)) return { ok: false, errors: [`name: "${def.name}" is already worn by a live hat`], schema: HAT_SCHEMA };

  const uuid = crypto.randomUUID();
  const record = {
    id: uuid, uuid, name: def.name, baseAgent: def.baseAgent,
    allowedAgents: def.allowedAgents || null,
    toolScope: def.toolScope || null, personaPrompt: def.personaPrompt || null,
    responsibilities: def.responsibilities || null,
    seedKey: def.seedKey || null,
    model: def.model || null,
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

// §BUILT 2026-08-18 — the id namespace and the name namespace must be
// DISJOINT, and until now they were not. Every hat forged before the
// permanent-id change has id === name and no uuid field (on this machine:
// the four seeded hats, and co_pilot). rename()'s migration backfilled the
// uuid from that old id, so a migrated hat's "permanent uuid" was literally
// its old NAME — proven live against the real co_pilot row: rename it, and
// get('co_pilot') still returns the renamed hat, because get() tries the
// uuid map before the name map. The old name never actually becomes free.
//
// A real uuid contains hyphens; a valid hat name cannot (the name regex is
// [a-z][a-z0-9_]{2,48}). So once every identifier is a real uuid the two
// namespaces can never collide again. Legacy ids are kept as `legacyId` and
// resolved LAST, so references written before the migration still work
// without ever outranking a name.
const _UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function _isRealUuid(v) { return typeof v === 'string' && _UUID_RE.test(v); }

/** _identity(existing) — {uuid, legacyId}: a real uuid, minted once if the hat predates them. */
function _identity(existing) {
  const current = existing.uuid || existing.id;
  if (_isRealUuid(current)) return { uuid: current, legacyId: existing.legacyId || null };
  return { uuid: crypto.randomUUID(), legacyId: current || null };
}

/**
 * _byIdentity() — every row folded down to one CURRENT record per hat.
 *
 * Append-only: forge, rename, adopt and revoke all insert. Current state is
 * the latest row for a hat, and "a hat" is a uuid — except across the legacy
 * migration, where the uuid deliberately changes. §CAUGHT BY TEST 2026-08-18:
 * grouping on the uuid alone made a migrated hat's pre-migration rows a
 * SECOND live hat, so `rename` on a legacy hat produced exactly the
 * duplication this whole patch exists to stop. Any row carrying `legacyId`
 * declares an alias, and rows under that old identifier fold into it.
 */
function _byIdentity() {
  const jaa = _jaa();
  if (!jaa) return new Map();
  const rows = jaa.query(TABLE, () => true, 5000);

  const aliasOf = new Map();   // old identifier → the uuid that superseded it
  for (const r of rows) if (r.legacyId && r.uuid) aliasOf.set(r.legacyId, r.uuid);
  const resolve = (key) => {
    // Follow the chain, guarding against a cycle rather than trusting there
    // isn't one (§1.2 — a hang is a worse failure than a wrong answer).
    const seen = new Set();
    while (aliasOf.has(key) && !seen.has(key)) { seen.add(key); key = aliasOf.get(key); }
    return key;
  };

  const byUuid = new Map();
  for (const r of rows) {
    const key = resolve(r.uuid || r.id);
    const existing = byUuid.get(key);
    if (!existing || (r.ts || 0) >= (existing.ts || 0)) byUuid.set(key, r);
  }
  return byUuid;
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
  const byUuid = _byIdentity();
  // Try direct uuid match first (permanent, unambiguous).
  if (byUuid.has(nameOrUuid)) {
    const hat = byUuid.get(nameOrUuid);
    return hat._revoked ? null : hat;
  }
  // Then CURRENT name (only ever the latest real row per uuid).
  for (const hat of byUuid.values()) {
    if (hat.name === nameOrUuid && !hat._revoked) return hat;
  }
  // Finally a pre-migration id, so references written before uuids existed
  // still resolve — but never ahead of a name someone is using today.
  for (const hat of byUuid.values()) {
    if (hat.legacyId === nameOrUuid && !hat._revoked) return hat;
  }
  return null;
}

/**
 * byName(name) — the live hat WEARING this name right now, or null.
 *
 * Distinct from get(), which also resolves uuids and pre-migration ids. The
 * collision checks below must use this one: get('old_name') still finds a
 * migrated hat through its legacyId, and treating that as an occupied name
 * would mean a name could never be released — the opposite of the point of
 * a permanent id.
 */
function byName(name) {
  for (const hat of list()) if (hat.name === name) return hat;
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
  const collision = byName(newName);
  if (collision && (collision.uuid || collision.id) !== (existing.uuid || existing.id)) return { ok: false, reason: `"${newName}" is already worn by a different real hat (uuid ${collision.uuid})` };

  const jaa = _jaa();
  if (!jaa) return { ok: false, reason: 'cortex unavailable' };
  // §FIXED — a hat forged before this fix (the real, existing co_pilot
  // hat included) has no separate uuid field; existing.uuid is
  // undefined. Backfilling from the old id (which WAS the real, de-facto
  // stable identifier before this session's change) rather than letting
  // undefined propagate forward — this is the first-rename migration
  // point, and it must establish a genuine, permanent uuid, not carry a
  // gap forward.
  const { uuid: stableUuid, legacyId } = _identity(existing);
  const renamed = { ...existing, id: stableUuid, uuid: stableUuid, legacyId, name: newName, ts: Date.now() };
  jaa.insert(TABLE, renamed);
  return { ok: true, hat: renamed, previousName: existing.name, migrated: stableUuid !== (existing.uuid || existing.id) };
}

/**
 * bySeedKey(key) — the hat that CURRENTLY fills a role, whatever it is
 * called today. This is the lookup anything with a well-known hat should
 * use: hat-seed asking "have I already seeded the auditor", the intent
 * router asking "which hat builds". Both used to ask by name, so both
 * broke the moment a name changed — silently, because a missing hat and a
 * renamed hat look identical when you only have the name.
 */
function bySeedKey(key) {
  if (!key) return null;
  for (const hat of list()) if (hat.seedKey === key) return hat;
  return null;
}

/**
 * adoptSeedKey(nameOrUuid, seedKey) — attach a role label to a hat that
 * has none. This is the real migration point: every hat forged before this
 * patch (the four seeded ones on your machine included) has seedKey
 * undefined, and without a backfill the first boot after this patch would
 * see zero hats holding the seed roles and forge four duplicates — the
 * exact bug being fixed, reintroduced by the fix. Refuses to overwrite an
 * existing seedKey (a role label that can be reassigned is just a name
 * again) and refuses a key another live hat already holds.
 */
function adoptSeedKey(nameOrUuid, seedKey) {
  const existing = get(nameOrUuid);
  if (!existing) return { ok: false, reason: `no forged hat found for "${nameOrUuid}"` };
  if (existing.seedKey) {
    return existing.seedKey === seedKey
      ? { ok: true, hat: existing, unchanged: true }
      : { ok: false, reason: `hat "${existing.name}" already holds seedKey "${existing.seedKey}" — a role label is permanent` };
  }
  const check = validate({ ...existing, seedKey });
  const keyErrors = (check.errors || []).filter(e => e.startsWith('seedKey:'));
  if (keyErrors.length) return { ok: false, errors: keyErrors };
  const held = bySeedKey(seedKey);
  if (held) return { ok: false, reason: `seedKey "${seedKey}" is already held by "${held.name}" (uuid ${held.uuid || held.id})` };

  const jaa = _jaa();
  if (!jaa) return { ok: false, reason: 'cortex unavailable' };
  const { uuid: stableUuid, legacyId } = _identity(existing);
  const row = { ...existing, id: stableUuid, uuid: stableUuid, legacyId, seedKey, ts: Date.now() };
  jaa.insert(TABLE, row);
  return { ok: true, hat: row };
}

/**
 * migrateLegacyIds() — give every live hat a real uuid, once. Idempotent,
 * writes nothing for a hat that already has one, and starts no dispatch, so
 * it is safe on the boot path. Called by hat-seed at seed time.
 *
 * Without this the migration only happens on a hat's first rename, which
 * means the identifier is "permanent" only for hats forged after the change
 * — and the four seeded hats plus co_pilot on this machine are not among
 * them.
 */
function migrateLegacyIds() {
  const jaa = _jaa();
  if (!jaa) return { ok: false, reason: 'cortex unavailable', migrated: [] };
  const migrated = [];
  for (const hat of list()) {
    if (_isRealUuid(hat.uuid || hat.id)) continue;
    const { uuid, legacyId } = _identity(hat);
    jaa.insert(TABLE, { ...hat, id: uuid, uuid, legacyId, ts: Date.now() });
    migrated.push({ name: hat.name, legacyId, uuid });
  }
  return { ok: true, migrated };
}

/** list() — every forged hat, latest real row per uuid. */
function list() {
  return [..._byIdentity().values()].filter(h => !h._revoked);
}

/** revoke(nameOrUuid) — remove a forged hat. Does not affect anyone currently wearing it this session. */
function revoke(nameOrUuid) {
  const jaa = _jaa();
  if (!jaa) return { ok: false, reason: 'cortex unavailable' };
  const existing = get(nameOrUuid);
  if (!existing) return { ok: false, reason: `no forged hat named "${nameOrUuid}"` };
  // The tombstone carries the whole record, not just the id/name. A thin
  // tombstone loses baseAgent, toolScope and seedKey, so the history of
  // what a revoked hat WAS is unreadable afterwards — and §0.3 says
  // nothing is lost, not "nothing but the identifier is lost".
  const { uuid: stableUuid, legacyId } = _identity(existing);
  jaa.insert(TABLE, { ...existing, id: stableUuid, uuid: stableUuid, legacyId, _revoked: true, ts: Date.now() });
  return { ok: true, hat: { ...existing, _revoked: true } };
}

module.exports = { HAT_SCHEMA, VALID_BASE_AGENTS, validate, forge, get, list, revoke, rename, byName, bySeedKey, adoptSeedKey, migrateLegacyIds, TABLE, VERSION: '0.3.0' };
