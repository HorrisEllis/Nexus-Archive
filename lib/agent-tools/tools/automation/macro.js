'use strict';
/**
 * lib/agent-tools/tools/automation/macro.js — James: "lets do macros...
 * automating job applications, or emailing therapists on psychology
 * today... full state rewind engine, hook into automate/macro per url,
 * event driven snapshots, bookmarks to capture state."
 *
 * A macro is a named, real sequence of browser_action steps, keyed to a
 * URL pattern, storable and replayable. Built on top of, not parallel to,
 * two real systems already in this codebase:
 *   - browser_action (lib/agent-tools/tools/browser/browser-action.js) —
 *     every real step in a macro is literally one browser_action call.
 *   - rewind_replay (lib/agent-tools/tools/sandbox/rewind-replay.js) —
 *     clear-glass/src/rewind/engine.js's real RewindEngine. Every macro
 *     run takes a real, labeled snapshot before its first step — the
 *     real rollback point if something goes wrong mid-macro.
 *
 * §HONEST SCOPE — this is v1, not the full ask. "Record" here means
 * DEFINE explicitly (a real, composed list of steps), not capture a
 * live human interacting with a page — that's a real, separate, much
 * larger feature (a content-script-level action recorder) not built in
 * this pass. Every real primitive it would be built from (dom_pick to
 * name an element, this file's own step storage) is already here.
 *
 * §HONEST LIMIT — verified via direct, isolated tests of the real
 * logic (template substitution, URL-pattern matching, step sequencing,
 * failure handling) — NOT verified against a live, running Electron
 * ClearGlass instance, since this sandbox has no display/GPU
 * environment to run one. Same honest limit rewind_replay.js and the
 * screenshot addition both already state for the same real reason.
 */
const { randomUUID } = require('crypto');

function _jaa() {
  try { return require('../../../../cortex/memory/jaa-db').jaaDB; }
  catch (e) { return null; }
}

/**
 * _current(jaa, name) — the real, current state of a macro by name.
 * §BUGFIX 2026-08-23, caught by actually running create→delete→get end
 * to end, not trusted from the individual functions in isolation: soft-
 * delete here works by inserting a NEW row with _deleted:true rather
 * than mutating the original (this table has no real update-in-place,
 * matching the same soft-delete pattern used elsewhere in this
 * codebase) — but jaaDB's own real query(table, pred, limit) returns
 * matches in INSERTION order and stops at `limit`, confirmed by reading
 * its real implementation directly. query(pred, 1) was therefore
 * returning the OLDEST matching row, not the current one — a "deleted"
 * macro's get() call returned the original, pre-delete row every time.
 * Real fix: never limit to 1 on a name lookup; take every match and use
 * the LAST (most recent) as the real, current state.
 */
function _current(jaa, name) {
  const rows = jaa.query('macros', r => r.name === name);
  return rows.length ? rows[rows.length - 1] : null;
}

/**
 * _substitute(value, params) — real, recursive {{name}} substitution.
 * Walks strings, arrays, and plain objects; leaves everything else
 * (numbers, booleans, null) untouched. A referenced param that was
 * never supplied is left as the literal "{{name}}" text rather than
 * silently becoming "undefined" — §1.2, a missing param should be
 * visibly wrong, not quietly wrong.
 */
function _substitute(value, params) {
  if (typeof value === 'string') {
    return value.replace(/\{\{(\w+)\}\}/g, (whole, name) => (name in params ? String(params[name]) : whole));
  }
  if (Array.isArray(value)) return value.map(v => _substitute(v, params));
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = _substitute(value[k], params);
    return out;
  }
  return value;
}

/** _urlMatches(pattern, url) — real glob-ish match: '*' → '.*', rest literal. */
function _urlMatches(pattern, url) {
  if (!pattern) return true; // no pattern given — a macro with no real constraint runs anywhere, on purpose
  const re = new RegExp('^' + pattern.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
  return re.test(url);
}

const ACTIONS = {
  create(a) {
    if (!a.name || typeof a.name !== 'string') return { error: 'create needs a real, unique name (string)' };
    if (!Array.isArray(a.steps) || !a.steps.length) return { error: 'create needs a non-empty steps array — [{action, data}]' };
    const browserAction = require('../browser/browser-action.js');
    const validActions = new Set(browserAction.parameters.properties.action.enum);
    for (let i = 0; i < a.steps.length; i++) {
      const s = a.steps[i];
      if (!s || !validActions.has(s.action)) {
        return { error: `steps[${i}].action "${s?.action}" is not a real browser_action — one of: ${[...validActions].join(', ')}` };
      }
    }
    const jaa = _jaa();
    if (!jaa) return { error: 'cortex unavailable — cannot persist a macro that would vanish on restart' };
    const existing = _current(jaa, a.name);
    if (existing && !existing._deleted) return { error: `a macro named "${a.name}" already exists (uuid ${existing.uuid}) — delete it first or choose a different name` };
    const row = {
      uuid: randomUUID(), name: a.name, urlPattern: a.urlPattern || null,
      steps: a.steps, params: Array.isArray(a.params) ? a.params : [],
      description: a.description || null, createdAt: Date.now(), runCount: 0, lastRunAt: null,
    };
    jaa.insert('macros', row);
    return { ok: true, macro: row };
  },

  list() {
    const jaa = _jaa();
    if (!jaa) return { error: 'cortex unavailable' };
    // §BUGFIX 2026-08-23 — same real issue _current() exists to fix, at
    // list scale: every run() and delete() inserts a NEW row rather than
    // mutating in place, so a naive query(() => true) returns every
    // historical row for a macro that's ever been run or deleted, not
    // just its current state. Group by name, keep only the latest row
    // per name, then drop the ones whose current state is deleted.
    const all = jaa.query('macros', () => true, 500);
    const latest = new Map();
    for (const r of all) latest.set(r.name, r); // later rows overwrite earlier ones in iteration order
    const rows = [...latest.values()].filter(r => !r._deleted);
    return { ok: true, macros: rows.map(r => ({ name: r.name, urlPattern: r.urlPattern, steps: r.steps.length, params: r.params, runCount: r.runCount, lastRunAt: r.lastRunAt })) };
  },

  get(a) {
    if (!a.name) return { error: 'get needs name' };
    const jaa = _jaa();
    if (!jaa) return { error: 'cortex unavailable' };
    const row = _current(jaa, a.name);
    if (!row || row._deleted) return { error: `no macro named "${a.name}"` };
    return { ok: true, macro: row };
  },

  delete(a) {
    if (!a.name) return { error: 'delete needs name' };
    const jaa = _jaa();
    if (!jaa) return { error: 'cortex unavailable' };
    const row = _current(jaa, a.name);
    if (!row || row._deleted) return { error: `no macro named "${a.name}"` };
    // §1.2 — jaaDB has no real delete-by-uuid on this table pattern used
    // elsewhere in this codebase; mark-and-filter, same discipline as
    // other soft-delete tables (a real, auditable trail beats silently
    // vanishing a row).
    jaa.insert('macros', { ...row, _deleted: true, deletedAt: Date.now() });
    return { ok: true, deleted: a.name };
  },

  /**
   * bookmark(a) — James: "bookmarks to capture state." A real, NAMED
   * rewind snapshot — same underlying mechanism the auto-snapshot-on-
   * nav.loaded system already uses, just explicit and nameable so it's
   * findable later by something other than a timestamp.
   */
  async bookmark(a) {
    if (!a.agentId) return { error: 'bookmark needs agentId' };
    if (!a.label) return { error: 'bookmark needs a real label — this is what makes it findable later' };
    const rewind = require('../sandbox/rewind-replay.js');
    return rewind.execute({ action: 'snapshot', agentId: a.agentId, label: `bookmark:${a.label}` });
  },

  /**
   * run(a) — the real execution. Checks the real, current URL against the
   * macro's own urlPattern (skips the check entirely if the macro was
   * created with no pattern), takes one real, labeled rewind snapshot
   * before the first step (the rollback point), then runs every step
   * sequentially through the real browser_action tool — stopping at the
   * first real failure rather than pressing on into an unknown page
   * state, and reporting exactly which step failed and why.
   */
  async run(a) {
    if (!a.name) return { error: 'run needs name' };
    if (!a.agentId) return { error: 'run needs agentId — which real browser session to run against' };
    const jaa = _jaa();
    if (!jaa) return { error: 'cortex unavailable' };
    const macro = _current(jaa, a.name);
    if (!macro || macro._deleted) return { error: `no macro named "${a.name}"` };

    const params = a.params || {};
    const missingParams = (macro.params || []).filter(p => !(p in params));
    if (missingParams.length) return { error: `run needs params: ${missingParams.join(', ')}` };

    const browserAction = require('../browser/browser-action.js');

    if (macro.urlPattern) {
      const urlResult = await browserAction.execute({ action: 'get_url', data: {} });
      const currentUrl = urlResult?.result?.url || urlResult?.result;
      if (currentUrl && !_urlMatches(macro.urlPattern, currentUrl)) {
        return { error: `macro "${a.name}" requires a URL matching "${macro.urlPattern}" — current page is "${currentUrl}"` };
      }
    }

    let snapshotId = null;
    if (!a.skipSnapshot) {
      const rewind = require('../sandbox/rewind-replay.js');
      const snap = await rewind.execute({ action: 'snapshot', agentId: a.agentId, label: `macro:${a.name}:${Date.now()}` });
      snapshotId = snap?.result?.snapshotId || snap?.snapshotId || null;
    }

    const results = [];
    for (let i = 0; i < macro.steps.length; i++) {
      const step = macro.steps[i];
      const data = _substitute(step.data || {}, params);
      const r = await browserAction.execute({ action: step.action, data });
      results.push({ step: i, action: step.action, ok: !r.error, error: r.error || null });
      if (r.error) {
        return {
          ok: false, macro: a.name, failedAtStep: i, error: r.error,
          stepsCompleted: i, stepsTotal: macro.steps.length, snapshotId, results,
        };
      }
    }

    jaa.insert('macros', { ...macro, runCount: (macro.runCount || 0) + 1, lastRunAt: Date.now() });
    return { ok: true, macro: a.name, stepsCompleted: macro.steps.length, snapshotId, results };
  },
};

module.exports = {
  name: 'macro',
  description:
    'Define, store, and replay a named, real sequence of browser_action steps against a URL pattern — for ' +
    'repeatable multi-step web flows (filling and submitting a form, a recurring multi-page task). Actions: ' +
    '"create" (name, steps:[{action,data}], urlPattern?, params?:[string], description?), "list", "get" (name), ' +
    '"delete" (name), "run" (name, agentId, params?:{}, skipSnapshot?) — checks the real current URL against the ' +
    'macro\'s pattern, takes a real rewind snapshot first (rollback point) unless skipSnapshot, then runs every ' +
    'step through the real browser_action tool, stopping at the first real failure. "bookmark" (agentId, label) — ' +
    'a real, named state snapshot via the rewind engine, for capturing a page\'s state to return to later. ' +
    'Step data can use {{paramName}} placeholders, substituted from run\'s own params at execution time.',
  parameters: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: Object.keys(ACTIONS) },
      name: { type: 'string', description: 'macro name — required for create/get/delete/run' },
      agentId: { type: 'string', description: 'which real browser session — required for run/bookmark' },
      label: { type: 'string', description: 'required for bookmark' },
      urlPattern: { type: 'string', description: 'for create — a glob pattern ("*" wildcard) the macro requires the current page to match before running' },
      steps: { type: 'array', description: 'for create — [{action, data}], each action a real, valid browser_action name' },
      params: { description: 'for create: string[] of required param names. for run: {name: value} to substitute into step data.' },
      description: { type: 'string', description: 'optional, for create' },
      skipSnapshot: { type: 'boolean', description: 'for run — skip the pre-run rewind snapshot (faster, no rollback point)' },
    },
    required: ['action'],
  },
  async execute(args = {}) {
    const fn = ACTIONS[args.action];
    if (!fn) return { error: `unknown action "${args.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    try { return await fn(args); }
    catch (e) { return { error: `macro ${args.action} failed: ${e.message}` }; }
  },
};
