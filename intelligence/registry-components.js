'use strict';
/**
 * intelligence/registry-components.js
 * comp_id: nexus.intelligence.registry
 * uuid: nexus-intelligence-registry-v1-0000-2026-0822-jamesbrooks-001
 * Matches emerge/registry-components.js's exact, established pattern —
 * checked directly before building this, not assumed.
 */
const V = '1.0.0'; const NS = 'intelligence';
function _c(id, method, path, desc, opts = {}) {
  return {
    id: `${NS}.${id}`, namespace: NS, name: id, version: V,
    grammar: opts.grammar || [id.replace(/\./g, ' '), 'intelligence ' + id.split('.')[0]],
    route: { method, path }, description: desc,
    params: opts.params || [], tags: [NS, ...(opts.tags || [])],
    permissions: opts.permissions || ['system'], hooks: opts.hooks || {},
  };
}
module.exports = [
  _c('health',       'GET',  '/health',                            'Intelligence system health'),
  _c('patterns',     'GET',  '/api/intelligence/patterns',          'Crystallised behavioral patterns'),
  _c('context',      'GET',  '/api/intelligence/context',           'Assembled intelligence context'),
  _c('status',       'GET',  '/api/intelligence/status',            'Intelligence subsystem health'),
  _c('failures',     'GET',  '/api/intelligence/failures',          'Failure mode index'),
  _c('reuse',        'GET',  '/api/intelligence/reuse',             'Reuse index'),
  _c('map',          'GET',  '/api/intelligence/map',               'Real, live loom map'),
  _c('adversarial',  'POST', '/api/adversarial',                    'Inner-critic: reconcile intuition vs mastermind'),
  _c('cfr.field',    'GET',  '/cfr/field',                          'CFR field state (coherence/friction/resonance/entropy)'),
  _c('cfr.health',   'GET',  '/cfr/health',                         'CFR ledger health'),
  _c('cfr.events',   'GET',  '/cfr/events',                         'CFR event ledger, tail', { tags: ['ledger'] }),
  _c('cfr.sse',      'GET',  '/cfr/sse',                            'Real-time CFR event stream', { tags: ['sse'] }),
  _c('framework.create', 'POST', '/api/framework/create',           'Generate a real WARP-based framework skeleton', {
    tags: ['build'],
    hooks: { in: [{ id: 'intelligence.framework.receive', intent: ['create', 'build', 'framework'], tags: ['framework-builder'] }] },
  }),
  _c('sse',          'GET',  '/sse',                                'General intelligence event stream', { tags: ['sse'] }),
  _c('commands',     'GET',  '/api/commands',                       'Real, dynamic command list — this registry, live'),
  _c('commands.history', 'GET', '/api/commands/history',            'Real, persistent, queryable log of every command actually invoked — distinct from the static list above'),
];
