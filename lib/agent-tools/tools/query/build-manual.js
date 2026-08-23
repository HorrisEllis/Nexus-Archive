'use strict';
/**
 * lib/agent-tools/tools/query/build-manual.js — buildmanual tool
 * UUID: nexus-agent-tools-build-manual-v1-0000-2026-0823-001
 *
 * James: "What about a tool command call buildmanual that injects a framework
 * with the most important axioms, and warp primitives."
 *
 * ── WHY A TOOL AND NOT A PASTE ──────────────────────────────────────────────
 *
 * lib/agent-primer.js already generates that payload, and pasting it works.
 * But a paste is a snapshot: it is correct when copied and silently wrong
 * afterward. As a TOOL the agent pulls it at the moment it needs it, against
 * the live tree, and the payload carries the source hashes that make a stale
 * one detectable.
 *
 * It also solves a sequencing problem a paste cannot. An agent that has already
 * begun coding can call buildmanual mid-task when it hits a rule it does not
 * know — "am I allowed to delete this file?" — instead of guessing and being
 * corrected three responses later.
 *
 * §16.5 — this DELEGATES to lib/agent-primer. It does not re-implement the
 * payload. A second copy of the axioms digest would drift from the first, and
 * the drift would be invisible: two agents primed differently, both confident.
 *
 * ── THE SYSTEM ARGUMENT ─────────────────────────────────────────────────────
 *
 * Optional `system` scopes the manual to one system's real registry: its
 * components, its declared events, its grammar. That is the difference between
 * "here are the house rules" and "here is what YOU are building inside".
 * Derived from the component registry at call time (§10.2 — a projection), so
 * it cannot describe a component that no longer exists.
 *
 * §1.1 — an unknown system name is REFUSED with the list of real ones, not
 * answered with a generic manual. Silently ignoring the argument would give
 * the agent a manual it believes is scoped and is not.
 */

const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..', '..');

/** Per-system section, generated from the live registry. Never authored. */
function _systemSection(system) {
  let idx;
  try { idx = require(path.join(ROOT, 'lib', 'blueprint-index')).build().index; }
  catch (e) {
    // §1.2 — the manual still returns, and says which part is missing.
    return { ok: false, body: `## SYSTEM: ${system}\n\n[registry unreadable: ${e.message}. This manual is INCOMPLETE — it carries the framework but not this system's surface.]` };
  }

  const sys = (idx.systems || []).find(s => s.systemId === system);
  if (!sys) {
    return { ok: false, known: (idx.systems || []).map(s => s.systemId),
      body: null };
  }

  const comps = sys.components || [];
  const tags  = [...new Set(comps.flatMap(c => c.tags || []))].sort();

  // §FIXED 2026-08-23 — this read only per-component emits[] and hooks.out[],
  // and reported copilot as having ZERO events while it declares 11 hook
  // outputs AND a system-level `events: { emits, handles }` block. Two
  // mistakes: events live at the REGISTRY level, not only on components, and
  // lib/blueprint-index does not carry that key through — it projects
  // components only. So the registry file is read DIRECTLY here for the
  // system-level block, and the aggregator for the component-level one.
  //
  // Reporting "0 events" for a system with 11 declared outputs is exactly the
  // unknown-vs-zero error (§1.2): an agent would read it as "this system emits
  // nothing" rather than "I looked in the wrong place".
  let sysEmits = [], sysHandles = [];
  try {
    const raw = require(path.join(ROOT, system, 'registry-components.js'));
    const ev = raw.events || raw.default?.events || {};
    sysEmits   = Array.isArray(ev.emits)   ? ev.emits   : [];
    sysHandles = Array.isArray(ev.handles) ? ev.handles : [];
  } catch (_) { /* system-level block absent — component-level still counts */ }

  const events = [...new Set([
    ...sysEmits,
    ...comps.flatMap(c => c.emits || []),
    ...comps.flatMap(c => (c.hooks?.out || []).map(h => h.id)),
  ])].filter(Boolean).sort();
  const handles = [...new Set([
    ...sysHandles,
    ...comps.flatMap(c => (c.hooks?.in || []).map(h => h.id)),
  ])].filter(Boolean).sort();
  const routes = comps.filter(c => c.route).map(c => `${c.method || 'GET'} ${c.route}`);

  const body = [
    `## SYSTEM: ${system} — ${comps.length} components, port ${sys.port}`,
    '',
    events.length ? `EVENTS IT EMITS (${events.length}):\n  ${events.slice(0, 24).join('\n  ')}` +
      (events.length > 24 ? `\n  ...and ${events.length - 24} more` : '') : 'EVENTS: none declared.',
    '',
    handles.length ? `EVENTS IT CONSUMES (${handles.length}):\n  ${handles.slice(0, 16).join('\n  ')}` +
      (handles.length > 16 ? `\n  ...and ${handles.length - 16} more` : '') : 'CONSUMES: none declared.',
    '',
    tags.length ? `TAGS (${tags.length}): ${tags.join(', ')}` : 'TAGS: none declared.',
    '',
    routes.length ? `ROUTES (${routes.length}):\n  ${routes.slice(0, 20).join('\n  ')}` +
      (routes.length > 20 ? `\n  ...and ${routes.length - 20} more` : '') : 'ROUTES: none declared.',
    '',
    'These are READ FROM THE REGISTRY at call time. If something is missing here,',
    'it is missing from the registry — declare it there, not in your code (§6.3).',
  ].join('\n');

  return { ok: true, body, counts: { components: comps.length, emits: events.length, handles: handles.length, tags: tags.length, routes: routes.length } };
}

module.exports = {
  name: 'buildmanual',
  description:
    'Get the NEXUS build manual: WARP primitives, the coding axioms digest, the output contract, ' +
    'and the tool list — generated from live sources. Pass a system name to also get that system\'s ' +
    'real components, events, tags and routes from the registry. Call this before writing code, or ' +
    'mid-task when you hit a rule you are unsure about.',
  parameters: {
    type: 'object',
    properties: {
      agent:  { type: 'string', description: 'Which agent this manual is for: chatgpt, ollama, claude, gemini. Sets the output ceiling and chunk contract. Default chatgpt.' },
      system: { type: 'string', description: 'Optional. Scope the manual to one system (e.g. "copilot", "intelligence") — adds its real components, events, tags and routes.' },
    },
    required: [],
  },
  execute: async ({ agent = 'chatgpt', system = null } = {}) => {
    let primer;
    try { primer = require(path.join(ROOT, 'lib', 'agent-primer')); }
    catch (e) {
      return { error: `agent-primer unavailable: ${e.message}`,
        note: 'refusing to emit a hand-written substitute — a second copy of the axioms would drift from the first (§10.3)' };
    }

    const built = primer.build(agent, { intent: 'coding' });
    if (!built.ok && built.error) {
      return { error: built.error, note: built.note };   // unknown agent — §1.1 refusal, passed through
    }

    let text = built.text;
    let systemInfo = null;

    if (system) {
      const sec = _systemSection(system);
      if (sec.ok === false && sec.known) {
        // §1.1 — do NOT silently return a generic manual for a name that does
        // not exist. The agent would believe it was scoped.
        return { error: `unknown system '${system}'`, knownSystems: sec.known,
          note: 'refusing to return a generic manual for an unknown system — the agent would believe it was scoped when it was not' };
      }
      text += '\n\n---\n\n' + sec.body;
      systemInfo = sec.counts || null;
      if (!sec.ok) systemInfo = { incomplete: true };
    }

    return {
      manual: text,
      agent, system: system || null,
      sections: built.sections,          // each with its source hash
      missingSections: built.missing,    // §1.2 stated, never omitted
      approxTokens: primer.estimateTokens(text),
      outputCeiling: built.outputCeiling,
      systemInfo,
      estimateNote: built.estimateNote,
      note: built.missing.length
        ? `INCOMPLETE — could not read: ${built.missing.join(', ')}. The sections say so inline.`
        : null,
    };
  },
};
