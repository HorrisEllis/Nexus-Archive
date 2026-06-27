'use strict';
/**
 * copilot/registry-components-affect.js
 * comp_id: nexus.copilot.affect
 * uuid: nexus-copilot-affect-registry-v1-0000-2026-0627-jamesbrooks-001
 *
 * Merge these into copilot/registry-components.js's existing export array.
 * Written separately here so the addition is a clean diff against the file
 * that's already in nexus-complete, not a guess at the whole file's shape.
 */
const V = '1.0.0'; const NS = 'copilot';
function _c(id, method, path, desc, opts = {}) {
  return { id: `${NS}.${id}`, namespace: NS, name: id, version: V,
    grammar: opts.grammar || [id.replace(/\./g, ' ')],
    route: { method, path }, description: desc,
    params: opts.params || [], tags: [NS, ...(opts.tags || [])],
    permissions: opts.permissions || ['system'], hooks: opts.hooks || {} };
}

module.exports = [
  _c('affect.get',     'GET', '/api/affect',          'Current regime + state vector', {
    tags: ['affect'],
    hooks: { out: [{ id: 'copilot.affect.read', wires_to: ['ui.copilot.receive'], tags: ['affect'] }] },
  }),
  _c('affect.history', 'GET', '/api/affect/history',  'Recent regime transitions', {
    tags: ['affect'],
    grammar: ['copilot affect history', 'mood history'],
  }),
  // hooks.in side: user-model.js's checkContradictions() and (if revived)
  // checkInversions() should call affect.apply('user_model.contradiction', ...)
  // / affect.apply('user_model.inversion_candidate', ...) directly — that's
  // the wire that wasn't there before. Not a registry entry, a call site.
];
