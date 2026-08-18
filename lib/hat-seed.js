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
 * §IDEMPOTENT — BY ROLE, NOT BY NAME (§FIXED 2026-08-18)
 * seedHats() only forges a hat whose ROLE (seedKey) is not already filled. A hat you
 * revoked stays revoked until the next boot re-seeds it; a hat you edited by
 * hand is never overwritten. Nothing here deletes.
 */

const hatForge = require('./hat-forge');

const MODULE_ID = 'nexus.lib.hat-seed';
const VERSION = '1.1.0';

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

  // §FIXED 2026-08-18 — this used to test `existing.has(def.name)`, which
  // made seeding idempotent on the one field a person is expected to
  // change. Reproduced live: rename `the_auditor` to `the_inspector`, and
  // the next boot found no hat called `the_auditor`, forged a fresh one
  // with a NEW uuid, and left five hats where there were four. The renamed
  // hat kept its scheduled tasks and its gaps; every reference by name —
  // including intent-hat-router's own verb table — silently followed the
  // empty duplicate instead. Idempotency now keys off the permanent
  // seedKey, which a rename cannot touch.
  // Every hat gets a real uuid before anything is looked up by one. Safe on
  // the boot path: idempotent, and it starts no dispatch.
  try {
    const m = hatForge.migrateLegacyIds();
    if (m.ok && m.migrated.length) {
      for (const r of m.migrated) log(`[hat-seed] migrated "${r.name}" from legacy id "${r.legacyId}" to real uuid ${r.uuid}`);
    }
  } catch (e) { log(`[hat-seed] legacy id migration failed: ${e.message}`); }

  const migrated = [];
  for (const def of SEED_HATS) {
    if (hatForge.bySeedKey(def.seedKey)) continue;
    // Migration: a hat forged before seedKey existed still fills the role
    // if it is standing there under the role's original name. Adopt rather
    // than duplicate. This runs once; after that the label is permanent.
    const legacy = hatForge.get(def.name);
    if (legacy && !legacy.seedKey) {
      const a = hatForge.adoptSeedKey(legacy.uuid || legacy.id, def.seedKey);
      if (a.ok) { migrated.push(def.seedKey); log(`[hat-seed] adopted existing "${def.name}" into role "${def.seedKey}" (uuid ${legacy.uuid || legacy.id})`); }
      else log(`[hat-seed] could not adopt "${def.name}" into "${def.seedKey}": ${a.reason || JSON.stringify(a.errors)}`);
    }
  }

  const forged = [], skipped = [], failed = [];

  for (const def of SEED_HATS) {
    const held = hatForge.bySeedKey(def.seedKey);
    if (held) { skipped.push(held.name); continue; }
    // The role is genuinely unfilled — but the DEFAULT name may have been
    // taken by something else in the meantime. Forging into an occupied
    // name is refused by hat-forge, so say so rather than fail opaquely.
    if (hatForge.get(def.name)) {
      failed.push({ name: def.name, errors: [`role "${def.seedKey}" is unfilled, but the name "${def.name}" is already worn by a different hat — rename that hat or forge this role under a different name`] });
      log(`[hat-seed] FAIL ${def.name} — name taken by a hat that does not hold the role`);
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
  if (skipped.length) log(`[hat-seed] ${skipped.length} already present: ${skipped.join(', ')}`);
  if (migrated.length) log(`[hat-seed] ${migrated.length} existing hat(s) adopted into their role: ${migrated.join(', ')}`);
  if (failed.length) log(`[hat-seed] ${failed.length} FAILED — see above`);
  return { forged, skipped, failed, migrated };
}

module.exports = { seedHats, SEED_HATS, MODULE_ID, VERSION };
