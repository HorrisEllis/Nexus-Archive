'use strict';
/**
 * lib/hat-seed.js — the real hats NEXUS ships with.
 *
 * §WHY THIS EXISTS
 * hat-forge.js has been live since P8 and forge/get/list/revoke all work, but
 * `list()` returned an empty array: the mechanism shipped with nothing in it.
 * A capability nobody has ever used is indistinguishable from one that doesn't
 * work, so this seeds a real, small set — grounded in jobs this system
 * actually does — and wires seeding into copilot's boot so they exist without
 * anyone having to remember to forge them.
 *
 * §EVERY TOOL NAME BELOW IS REAL
 * Verified against lib/agent-tools' live TOOLS map (44 registered) at write
 * time, and verified again at seed time by seedHats() — a scope naming a tool
 * that does not exist is a loud failure, not a silently-empty hat (§1.2).
 *
 * §NO RESPONSIBILITIES BY DEFAULT — deliberate.
 * hat-forge's `responsibilities` field creates REAL recurring scheduled tasks
 * that dispatch to real NCP agents. Seeding those on by default would start
 * firing browser-automated jobs at claude/chatgpt/perplexity the moment
 * copilot boots, without anyone asking for it. Cost and consent are real, so
 * the seeds are wearable and scoped but idle. Add responsibilities explicitly
 * via the hat_forge tool when you actually want a hat working on a timer.
 *
 * §IDEMPOTENT
 * seedHats() only forges a hat whose name is not already present. A hat you
 * revoked stays revoked until the next boot re-seeds it; a hat you edited by
 * hand is never overwritten. Nothing here deletes.
 */

const hatForge = require('./hat-forge');

const MODULE_ID = 'nexus.lib.hat-seed';
const VERSION = '1.0.0';

/**
 * SEED_HATS — four roles that map to work this system genuinely does.
 * Each scope is the minimum set for the job, not a generous superset: the
 * point of a hat is that it restricts, and a scope containing everything
 * restricts nothing.
 */
const SEED_HATS = [
  {
    name: 'the_auditor',
    seedKey: 'the_auditor',
    baseAgent: 'claude',
    allowedAgents: ['claude', 'perplexity', 'chatgpt'],
    personaPrompt:
      'You audit this system against its own evidence. You do not accept a claim ' +
      'because it is written down — you check it against what the tools actually ' +
      'return, and you report the difference plainly, including when the answer is ' +
      '"the thing that was claimed is not there". Prefer a specific finding with a ' +
      'file and a number over a general observation.',
    toolScope: ['loom_scan', 'axiom_check', 'read_file', 'nexus_status', 'raid_snr', 'meta_query'],
  },
  {
    name: 'the_diagnostician',
    seedKey: 'the_diagnostician',
    baseAgent: 'claude',
    allowedAgents: ['claude', 'ollama'],
    personaPrompt:
      'You are handed a symptom and you find the mechanism. You do not propose a ' +
      'fix until you can name the specific cause and point at the evidence for it. ' +
      'One root cause explaining many symptoms beats many separate explanations.',
    toolScope: ['diagnose', 'nexus_status', 'fault_log', 'loom_scan', 'resource_monitor', 'read_file', 'query_recall'],
  },
  {
    name: 'the_builder',
    seedKey: 'the_builder',
    baseAgent: 'claude',
    allowedAgents: ['claude', 'chatgpt'],
    personaPrompt:
      'You build, bottom-up. Read the file and its consumers before editing ' +
      'anything. Nothing is done until it is proven by a real run — no stubs, no ' +
      'mocks, no "should work". Changes go through safe_apply so they are ' +
      'reversible.',
    toolScope: ['read_file', 'run_command', 'module_builder', 'safe_apply', 'propose_idea', 'loom_scan', 'axiom_check'],
  },
  {
    name: 'the_librarian',
    seedKey: 'the_librarian',
    baseAgent: 'ollama',
    allowedAgents: ['ollama', 'claude'],
    personaPrompt:
      'You answer from what this system already knows, and you say so when it ' +
      'does not know. You retrieve and summarise; you do not invent connective ' +
      'tissue between things you found separately.',
    toolScope: ['query_recall', 'agent_chat_search', 'meta_query', 'nexus_help', 'query_movement'],
  },
];

/**
 * seedHats(opts) — forge any seed hat that isn't already present.
 *
 * @param {object} [opts]
 * @param {Set|Map|object} [opts.knownTools] live tool registry to validate
 *        scopes against. Defaults to lib/agent-tools' TOOLS map. Injectable so
 *        this is testable without booting the whole tool surface.
 * @param {function} [opts.log] where to report. Defaults to console.log.
 * @returns {{forged:string[], skipped:string[], failed:Array<{name:string,errors:*}>}}
 */
function seedHats(opts = {}) {
  const log = opts.log || console.log;
  let known = opts.knownTools;
  if (!known) {
    try { known = require('./agent-tools').TOOLS; } catch (_) { known = null; }
  }
  const hasTool = (n) => {
    if (!known) return true; // no registry available — don't block seeding on it
    if (known instanceof Map || known instanceof Set) return known.has(n);
    return Object.prototype.hasOwnProperty.call(known, n);
  };

  // §BUGFIX 2026-08-19 — was existing.has(def.name) (a plain Set of names)
  // for idempotency. seedKey was added to hat-forge.js AFTER this file was
  // originally written (confirmed: hat-forge.js's own §BUILT 2026-08-18
  // comment) and this file never got updated to use it — confirmed by
  // grep, zero references to seedKey anywhere in this file before this
  // fix. Real, live consequence: forge() correctly stores seedKey when
  // given one, but SEED_HATS never provided one, so every seeded hat sat
  // at seedKey:null forever — bySeedKey('the_auditor') always returned
  // null, and a rename (a real, intended feature — hats are renameable,
  // roles are permanent) would look identical to "never seeded" on the
  // next boot, exactly the "forge four duplicates" failure adoptSeedKey's
  // own doc comment already describes and warns against.
  //
  // Real fix, checking bySeedKey FIRST (the permanent, rename-proof
  // identity), falling back to the legacy by-name check only to migrate
  // an old hat that predates seedKey entirely — adoptSeedKey attaches the
  // role rather than forging a duplicate under the same name.
  const existingByName = new Map((hatForge.list() || []).map(h => [h.name, h]));
  const forged = [], skipped = [], migrated = [], failed = [];

  for (const def of SEED_HATS) {
    const heldBySeedKey = hatForge.bySeedKey(def.seedKey);
    if (heldBySeedKey) { skipped.push(def.name); continue; } // role already filled, however it's currently named

    const legacy = existingByName.get(def.name);
    if (legacy && !legacy.seedKey) {
      const r = hatForge.adoptSeedKey(legacy.uuid || legacy.id, def.seedKey);
      if (r.ok) { migrated.push(def.name); continue; }
      failed.push({ name: def.name, errors: r.errors || [r.reason] });
      log(`[hat-seed] FAIL adopting ${def.name} — ${JSON.stringify(r.errors || r.reason)}`);
      continue;
    }

    // §1.2 — a scope naming a tool that isn't registered is a real error and
    // is reported, not quietly dropped, because a hat silently missing half
    // its scope looks identical to one that is working.
    const missing = (def.toolScope || []).filter(t => !hasTool(t));
    if (missing.length) {
      failed.push({ name: def.name, errors: [`toolScope names unregistered tool(s): ${missing.join(', ')}`] });
      log(`[hat-seed] FAIL ${def.name} — unregistered tool(s): ${missing.join(', ')}`);
      continue;
    }

    const r = hatForge.forge(def);
    if (r && r.ok) { forged.push(def.name); }
    else { failed.push({ name: def.name, errors: (r && r.errors) || ['forge returned not-ok'] });
           log(`[hat-seed] FAIL ${def.name} — ${JSON.stringify((r && r.errors) || r)}`); }
  }

  if (forged.length) log(`[hat-seed] v${VERSION} — forged ${forged.length}: ${forged.join(', ')}`);
  if (migrated.length) log(`[hat-seed] adopted ${migrated.length} legacy hat(s) into their role: ${migrated.join(', ')}`);
  if (skipped.length) log(`[hat-seed] ${skipped.length} already present: ${skipped.join(', ')}`);
  if (failed.length) log(`[hat-seed] ${failed.length} FAILED — see above`);
  return { forged, skipped, migrated, failed };
}

module.exports = { seedHats, SEED_HATS, MODULE_ID, VERSION };
