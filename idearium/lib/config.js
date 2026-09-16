/**
 * idearium/lib/config.js — idearium.config, MCO-F (idearium-repository-overhaul
 * phasemap §MCO-F_config).
 *
 * §BUILT 2026-09-15 — James: "limit 500 for chunks needs to change. have
 * that as an option in the configuration file in idearium." Per the
 * merged phasemap's config_schema, this is the one real, live-adjustable
 * store for idearium.config — not a second env-var-only file next to
 * lib/project-import.config.js (that file's ZIP.maxFiles stays as the
 * deploy-time env-var default/floor; this is the runtime value both it
 * and the drop-ingest chunk cap actually read on every call, so a change
 * here takes effect immediately, no redeploy).
 *
 * §PERSISTENCE — same seam every other idearium store uses (idearium/lib/db.js
 * -> cortex/memory/jaa-db.js), one singleton row in table 'idearium_config'.
 * §1.2 loud, not silent: an out-of-range set() throws instead of silently
 * clamping or ignoring.
 *
 * §COPILOT-WRITABLE — the schema marks each key copilot_writable or not
 * (ssh_key_path is human-only). set() takes an `actor` ('user'|'copilot'|
 * other agent id) and rejects a copilot actor writing a non-writable key.
 * A human write and a copilot write differ ONLY in that actor field on the
 * returned event — same validation, same persistence, same shape.
 */

import { loadTable, syncTable } from './db.js';

const TABLE = 'idearium_config';
const ROW_UUID = 'idearium-config-singleton';

// ── schema — mirrors idearium-repository-overhaul-phasemap.spec's
// MCO-F_config.config_schema.idearium.config exactly ─────────────────────
const SCHEMA = {
  chunk_cap:     { default: 500,   min: 1, max: 5000, copilot_writable: true,  type: 'number' },
  zoom_levels:   { default: 4,     copilot_writable: true,  type: 'number' },
  snapshot_mode: { default: 'delta', enum: ['full', 'delta'], copilot_writable: true, type: 'string' },
  auto_phasemap: { default: true,  copilot_writable: true,  type: 'boolean' },
  cicd: {
    push_enabled:  { default: false, copilot_writable: true,  type: 'boolean' },
    pull_enabled:  { default: false, copilot_writable: true,  type: 'boolean' },
    ssh_key_path:  { default: null,  copilot_writable: false, type: 'string|null' },
  },
};

function _defaults() {
  const out = {};
  for (const [k, v] of Object.entries(SCHEMA)) {
    if (k === 'cicd') {
      out.cicd = {};
      for (const [ck, cv] of Object.entries(v)) out.cicd[ck] = cv.default;
    } else {
      out[k] = v.default;
    }
  }
  return out;
}

function _load() {
  const rows = loadTable(TABLE);
  const row = rows.find((r) => r.uuid === ROW_UUID);
  // Additive merge over defaults — a schema key added later (or an older
  // persisted row missing a newer key) never crashes a reader; it just
  // falls back to that key's own default until explicitly set.
  const defaults = _defaults();
  if (!row) return { uuid: ROW_UUID, values: defaults, updatedAt: null, updatedBy: null };
  return {
    uuid: ROW_UUID,
    values: { ...defaults, ...row.values, cicd: { ...defaults.cicd, ...(row.values && row.values.cicd) } },
    updatedAt: row.updatedAt || null,
    updatedBy: row.updatedBy || null,
  };
}

function _save(state) {
  syncTable(TABLE, [state], 'uuid');
}

function _resolve(keyPath) {
  // 'chunk_cap' -> [SCHEMA.chunk_cap]; 'cicd.push_enabled' -> [SCHEMA.cicd.push_enabled]
  const parts = String(keyPath).split('.');
  let node = SCHEMA;
  for (const p of parts) {
    node = node && node[p];
    if (!node) throw new Error(`idearium/lib/config: unknown config key '${keyPath}'`);
  }
  return { parts, def: node };
}

function _getAt(values, parts) {
  let v = values;
  for (const p of parts) v = v == null ? undefined : v[p];
  return v;
}

function _setAt(values, parts, val) {
  let node = values;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = val;
}

/** Full current config, e.g. for idearium.config.get with no key. */
export function getConfig() {
  return _load().values;
}

/** One key's current live value — e.g. getValue('chunk_cap'). */
export function getValue(keyPath) {
  const { parts } = _resolve(keyPath);
  return _getAt(_load().values, parts);
}

/**
 * setConfig(keyPath, value, { actor }) — validates against SCHEMA (type,
 * min/max, enum), enforces copilot_writable, persists, and returns the
 * event idearium.config.set fires. actor defaults to 'user'; anything
 * else (an agent id, 'copilot') is treated as non-human for the
 * copilot_writable check.
 */
export function setConfig(keyPath, value, { actor = 'user' } = {}) {
  const { parts, def } = _resolve(keyPath);
  const isHuman = actor === 'user';
  if (!isHuman && !def.copilot_writable) {
    throw new Error(`idearium/lib/config: '${keyPath}' is not copilot_writable — human write required`);
  }
  if (def.type === 'number') {
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error(`idearium/lib/config: '${keyPath}' must be a number`);
    if (def.min != null && n < def.min) throw new Error(`idearium/lib/config: '${keyPath}' must be >= ${def.min}`);
    if (def.max != null && n > def.max) throw new Error(`idearium/lib/config: '${keyPath}' must be <= ${def.max}`);
    value = n;
  } else if (def.enum && !def.enum.includes(value)) {
    throw new Error(`idearium/lib/config: '${keyPath}' must be one of ${def.enum.join(', ')}`);
  } else if (def.type === 'boolean') {
    value = !!value;
  }

  const state = _load();
  _setAt(state.values, parts, value);
  state.updatedAt = Date.now();
  state.updatedBy = actor;
  _save(state);

  const event = {
    type: 'idearium.config.set', key: keyPath, value, actor,
    at: state.updatedAt,
  };
  console.log(`[idearium/config] ${keyPath} -> ${JSON.stringify(value)} (actor: ${actor})`);
  return event;
}

export const MODULE_ID = 'idearium-config';
export const VERSION = '1.0.0';
export { SCHEMA };
