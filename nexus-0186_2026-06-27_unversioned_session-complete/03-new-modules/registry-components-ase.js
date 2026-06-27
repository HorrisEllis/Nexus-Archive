'use strict';
/**
 * registry-components-ase.js — components for lib/ase.js
 * Merge into the relevant system's registry-components.js (wherever
 * post/content creation lives — likely the future social-platform service,
 * not a core NEXUS system, since this is content-domain, not infra-domain).
 */
const V = '1.0.0'; const NS = 'ase';
function _c(id, method, path, desc, opts = {}) {
  return { id: `${NS}.${id}`, namespace: NS, name: id, version: V,
    grammar: opts.grammar || [id.replace(/\./g, ' ')],
    route: { method, path }, description: desc,
    params: opts.params || [], tags: [NS, ...(opts.tags || [])],
    permissions: opts.permissions || ['system'], hooks: opts.hooks || {} };
}

module.exports = [
  _c('signature.get',  'GET', '/api/ase/:workId',           'Signature + trajectory for one work'),
  _c('trending',       'GET', '/api/ase/trending',          'Works currently deepening on return encounters'),
  _c('top',            'GET', '/api/ase/top',               'Works ranked by current resonance', {
    tags: ['ase'],
    hooks: { out: [{ id: 'ase.top.read', wires_to: ['copilot.prompt.receive_result'], tags: ['ase'] }] },
  }),
];
