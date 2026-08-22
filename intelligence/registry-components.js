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

  // ── §MIGRATION 2026-08-22 — meta/* now lives here ───────────────────────
  _c('meta.status','GET','/api/meta/status',
    'Status of the relocated meta faculties (rfr2, alk, bda, gap, spatial, causal, liminal, lattice)',{
    grammar:['meta status','intelligence faculties'],tags:['meta','migration']}),
  _c('gap.tension','GET','/api/gaps/tension',
    'Measured strain per gap — rate, acceleration, recency. Reported separately, never bundled (§17.11)',{
    grammar:['gap tension','which gap is worst','nearest bottleneck','what is straining'],
    tags:['gaps','tension','measured'],
    hooks:{in:[{id:'intelligence.gap-tension.read',intent:['ask'],tags:['read-only']}],
           out:[{id:'intelligence.gap-tension.ranked',wires_to:['ui.copilot.receive'],tags:['ordering']}]}}),
  _c('gap.friction','POST','/api/gaps/friction',
    'Compare two gap surveys — did a change relieve strain or add it (cos compartment testing)',{
    grammar:['friction delta','did that help'],tags:['gaps','friction','cos']}),

  // ── §MIGRATION 2026-08-22 chunks 1-3 — faculties relocated from cortex ──
  _c('orion.classify','POST','/api/orion/classify',
    'SISO classification gate — anomaly/sigma in, RAID _decide() shape out (pure, §14.2)',{
    grammar:['orion','classify anomaly','classification'],tags:['orion','siso','classification'],
    hooks:{in:[{id:'intelligence.orion.in',intent:['event'],tags:['anomaly.detected','sigma.event']}],
           out:[{id:'intelligence.orion.classified',wires_to:['cortex.core.raid.decide'],tags:['policy']}]}}),
  _c('gapfinder.status','GET','/api/gap-finder/status',
    'Gap-Finder organ — opens gaps from anomaly and sigma streams',{
    grammar:['gap finder','find gaps'],tags:['gaps','organ']}),
  _c('liminal.status','GET','/api/liminal-space/status',
    'Liminal Space — held items awaiting resolution or dissolution',{
    grammar:['liminal space','what is held','holding'],tags:['liminal','organ']}),
  _c('liminal.list','GET','/api/liminal-space/list',
    'List held items by focal point',{grammar:['list held','liminal list'],tags:['liminal','organ']}),
];
