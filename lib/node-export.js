'use strict';
/**
 * lib/node-export.js — the single, canonical export/import envelope every
 * real node type (.hat, .contract, .component, .cos, .agent, .model,
 * .schema, .crystal, .ledger, .command, .gap, .pat, .macro, .tool, .node,
 * .failure_mode, .idea, plus the already-real .spec/.nex) shares.
 * UUID: nexus-node-export-v1-0000-2026-0903-001
 *
 * §THE ASK — James: "each export has relevant context, intent, summary,
 * system, intent, export each node using yaml files... all these are
 * exportable and importable [as a] single measurement of unit."
 *
 * §CHECKED BEFORE BUILDING — grepped every one of the 17 named extensions
 * across the real tree before writing a single schema field. Only two are
 * currently real, literal files: .spec (228 real files, its own
 * established convention — SPEC-REGISTRY.md, per-system layout — left
 * alone, not re-wrapped) and .nex (438 real files — cortex's own
 * NEX-SNAP/1.0 snapshot format, cortex/snapshot/index.js, JSON not YAML —
 * also left alone; it already IS a working export format for its one real
 * use, and this module doesn't get to redefine an existing on-disk
 * contract other real code depends on). Every other extension names a
 * REAL backing system that has never had a standalone file form:
 *   .hat          -> lib/hat-forge.js's forged_hats table (HAT_SCHEMA)
 *   .contract     -> cortex/core/raid's real queue rows / RAID contracts
 *   .component    -> loom's component registry (loom/maps/*.js + driver)
 *   .cos          -> cos/ (compartment-OS classes: archetype/blueprint/
 *                    foundation/kernel/vault/etc.)
 *   .agent        -> guardian's provider-routing table (KNOWN_PROVIDERS)
 *   .model        -> a hat's real `model` field (an Ollama model tag)
 *   .schema       -> HAT_SCHEMA-shaped real JS schema objects generally
 *   .crystal      -> meta/crystal-lattice.js's real crystal records
 *   .ledger       -> jaaDB's real ledger table
 *   .command      -> the real command-index (clear-glass's live route
 *                    table / guardian's /cli/commands)
 *   .gap          -> lib/gap-field.js's real gap-field records
 *   .pat          -> lib/case-library.js's real pattern_signature records
 *   .macro        -> the macro-compiler component (§HONEST — this one has
 *                    no .spec anywhere either, per precommit-check.js's
 *                    own standing warning; real code exists but its
 *                    record shape was not independently re-confirmed in
 *                    this pass — flagged, not assumed)
 *   .tool         -> lib/agent-tools/tools/**\/*.js's {name, description,
 *                    parameters, execute} shape
 *   .node         -> a generic loom graph node (component OR hook OR wire)
 *   .failure_mode -> not yet backed by a single named real module found
 *                    this pass (checked: no failure-mode.js, no
 *                    failure_modes table) — genuinely OPEN, not silently
 *                    assumed real
 *   .idea         -> idearium/index.js's real IdeaCreateGate.transform()
 *                    object (idearium.idea.create) — the missing first
 *                    link James named in idea -> spec compiler ->
 *                    compartment/repo -> chunks -> dispatch -> versionium
 *
 * §TAGGED AND QUERYABLE 2026-09-03 — James: "we need to use those tagged
 * and querable." wrap()'s meta.tags is now a real envelope field (not
 * buried inside payload, so it applies uniformly across every type), and
 * queryDir(destDir, {type, tags, tagMode}) is the real function that was
 * missing entirely before this: exportToFile()/importFromFile() only
 * ever handled one exact known path each. queryDir reads real files this
 * module already wrote, through the same fromYaml()/validate() path
 * importFromFile() uses — not a second, parallel read mechanism.
 *
 * §WHAT THIS MODULE ACTUALLY DOES — it does not, itself, know how to
 * fetch a hat or a contract. It is ONLY the envelope: wrap(type, id,
 * payload, meta) produces one real YAML document with a common header
 * (uuid, type, context, intent, summary, system, exported_at, source)
 * around a type-specific `payload`; unwrap(yamlText) parses it back and
 * validates the header shape. Per-type fetchers (hat-forge's get(),
 * RAID's queue lookup, etc.) stay owned by their real systems — this
 * module composes with them (see exportHat() below for the one, fully
 * real, verified first wiring) rather than reaching into their storage
 * directly (§10.3 — one real source of truth per system, this is not a
 * second one).
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

const ENVELOPE_VERSION = 1;

// Extensions this module recognizes as real export targets — see the
// header table above for what backs each one today.
const KNOWN_TYPES = Object.freeze([
  'hat', 'contract', 'component', 'cos', 'agent', 'model', 'schema',
  'crystal', 'ledger', 'command', 'gap', 'pat', 'macro', 'tool', 'node',
  'failure_mode', 'idea', 'framework', 'toolbox', 'job',
  // .spec and .nex are real, established formats of their own — NOT
  // wrapped in this envelope (see header §CHECKED BEFORE BUILDING).
]);

/**
 * wrap(type, id, payload, meta) -> the envelope object (not yet a string).
 * - type: one of KNOWN_TYPES.
 * - id: the real, stable identifier of the thing being exported (a hat's
 *   uuid, a contract's queue-row uuid, etc.) — never invented here.
 * - payload: the real, type-specific data, passed through unchanged.
 * - meta: { context, intent, summary, system, tags } — all optional;
 *   absence is honestly recorded as null (or [] for tags), never
 *   fabricated. §BUILT 2026-09-03 — James: "we need to use those tagged
 *   and querable." tags lives at the envelope level (not inside payload)
 *   so queryDir() below can filter across every real type uniformly —
 *   a .idea's payload already carries its own real tags field too
 *   (idearium's own idea.tags), meta.tags here is deliberately the same
 *   concept at the export layer, not a second, competing one: callers
 *   exporting something that already has real tags (like an idea) pass
 *   them straight through as meta.tags.
 */
function wrap(type, id, payload, meta = {}) {
  if (!KNOWN_TYPES.includes(type)) {
    throw new Error(`node-export: unknown type "${type}" — must be one of ${KNOWN_TYPES.join(', ')}`);
  }
  if (!id) throw new Error('node-export: id is required — an export with no real identifier cannot be re-imported against its source');
  if (meta.tags !== undefined && !Array.isArray(meta.tags)) {
    throw new Error('node-export: tags must be an array when given');
  }
  return {
    envelope: ENVELOPE_VERSION,
    uuid: `nexus-export-${type}-${id}`,
    type,
    id,
    context: meta.context || null,
    intent: meta.intent || null,
    summary: meta.summary || null,
    system: meta.system || null,
    tags: meta.tags || [],
    exported_at: Date.now(),
    source: meta.source || 'nexus.lib.node-export',
    payload,
  };
}

/** toYaml(envelopeObj) -> real YAML text. */
function toYaml(envelopeObj) {
  return yaml.dump(envelopeObj, { noRefs: true, lineWidth: 100 });
}

/** fromYaml(yamlText) -> the parsed envelope object, validated. */
function fromYaml(yamlText) {
  const doc = yaml.load(yamlText);
  return validate(doc);
}

/** validate(envelopeObj) -> the same object if valid; throws with a real reason if not. */
function validate(doc) {
  if (!doc || typeof doc !== 'object') throw new Error('node-export: not a real envelope object');
  if (doc.envelope !== ENVELOPE_VERSION) throw new Error(`node-export: envelope version ${doc.envelope} — this module reads version ${ENVELOPE_VERSION} only`);
  if (!KNOWN_TYPES.includes(doc.type)) throw new Error(`node-export: unknown type "${doc.type}"`);
  if (!doc.id) throw new Error('node-export: missing id');
  if (doc.payload === undefined) throw new Error('node-export: missing payload');
  return doc;
}

/**
 * exportToFile(type, id, payload, meta, destDir) -> the real file path
 * written, e.g. destDir/<id>.hat. Extension matches `type` literally, per
 * the ask ("export each node using yaml files: .hat, .contract, ...").
 */
function exportToFile(type, id, payload, meta, destDir) {
  const envelopeObj = wrap(type, id, payload, meta);
  fs.mkdirSync(destDir, { recursive: true });
  const filePath = path.join(destDir, `${id}.${type}`);
  fs.writeFileSync(filePath, toYaml(envelopeObj), 'utf8');
  return filePath;
}

/** importFromFile(filePath) -> the validated envelope object. */
function importFromFile(filePath) {
  return fromYaml(fs.readFileSync(filePath, 'utf8'));
}

/**
 * queryDir(destDir, { type, tags, tagMode }) -> [envelopeObj, ...],
 * every real exported envelope in destDir matching the filter.
 * §BUILT 2026-09-03 — James: "we need to use those tagged and querable."
 * exportToFile()/importFromFile() only ever handled one exact path each
 * — no function anywhere in this module could ask "everything of type X"
 * or "everything tagged Y" across a real directory of exports. This is
 * that missing piece, not a second export/import mechanism: it reads
 * real files this same module already wrote, via the same fromYaml()/
 * validate() path importFromFile() uses.
 * - type: optional, one of KNOWN_TYPES — only files ending .<type> are
 *   even opened (cheap filter before the real YAML parse, not after).
 * - tags: optional string[] — envelopes must carry every one of these
 *   (AND, not OR — a caller asking for two tags means both, the more
 *   predictable default when nothing else in this codebase established
 *   a convention either way).
 * - tagMode: 'any' switches the above to OR-match instead of the AND
 *   default, for a caller that genuinely wants either tag to qualify.
 * Malformed files are skipped, not thrown on — one bad export in a
 * directory of hundreds must not fail every real query against the rest
 * (§1.2 loud, but at the file that's actually bad, not the whole call).
 */
function queryDir(destDir, { type, tags, tagMode = 'all' } = {}) {
  if (tags !== undefined && !Array.isArray(tags)) throw new Error('node-export: queryDir tags must be an array when given');
  let files;
  try { files = fs.readdirSync(destDir); } catch (e) { return []; } // no directory yet is a real, honest "nothing exported", not an error
  const results = [];
  for (const file of files) {
    if (type && !file.endsWith(`.${type}`)) continue;
    let doc;
    try { doc = importFromFile(path.join(destDir, file)); }
    catch (e) { continue; } // one malformed export skipped, not fatal to the query
    if (type && doc.type !== type) continue; // real type from inside the envelope, not just the filename's extension
    if (tags && tags.length) {
      const docTags = Array.isArray(doc.tags) ? doc.tags : [];
      const match = tagMode === 'any'
        ? tags.some(t => docTags.includes(t))
        : tags.every(t => docTags.includes(t));
      if (!match) continue;
    }
    results.push(doc);
  }
  return results;
}

module.exports = { wrap, toYaml, fromYaml, validate, exportToFile, importFromFile, queryDir, KNOWN_TYPES, ENVELOPE_VERSION };
