---
chunk_uuid: f6fc5deb-64a6-4007-afa5-38c996e213cd
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-37-nexus-cortex-registry-components-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/37-nexus-cortex-registry-components-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-37-nexus-cortex-registry-components-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-37-nexus-cortex-registry-components-js-md:f6fc5deb
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:20:51.797Z
---

'use strict';
/**
 * cortex/registry-components.js
 * comp_id: nexus.cortex.registry
 * uuid: nexus-cortex-registry-v1-0000-2026-0627-jamesbrooks-001
 */
const V = '3.5.0'; const NS = 'cortex';   // §5.4 fix 2026-08-08 — was 3.2.0, drifted from canonical lib/version.js's services.cortex (3.5.0)
function _c(id, method, path, desc, opts={}) {
  return { id:`${NS}.${id}`, namespace:NS, name:id, version:V,
    grammar: opts.grammar||[id.replace(/\./g,' ')],
    route:{method,path}, description:desc,
    params:opts.params||[], tags:[NS,...(opts.tags||[])],
    permissions:opts.permissions||['system'], hooks:opts.hooks||{} };
}
module.exports = [
  // ── Health ─────────────────────────────────────────────────────────────
  _c('health',                'GET',  '/health',                       'Cortex health + JAA stats'),
  _c('contract',              'GET',  '/contract',                     'Cortex interaction contract'),
  _c('events',                'GET',  '/events',                       'SSE — all cortex events', {tags:['stream']}),
  // ── Memory ─────────────────────────────────────────────────────────────
  _c('memory.browse',         'GET',  '/api/memory',                   'Browse any JAA table', {tags:['memory']}),
  _c('memory.insert',         'POST', '/api/memory/insert',            'Insert row into any JAA table', {tags:['memory'],
    hooks:{in:[{id:'cortex.memory.insert.receive',intent:['persist','write','log'],contract:'nexus-interaction-contract-v1::cortex',tags:['memory']}]}}),
  _c('memory.search',         'POST', '/api/memory/search',            'Semantic search across memory', {tags:['memory']}),
  _c('memory.forget',         'POST', '/api/memory/forget',            'Archive memory row (never delete)', {tags:['memory']}),
  _c('memory.working',        'GET',  '/api/memory/working',           'Working memory snapshot'),
  // ── Gaps ───────────────────────────────────────────────────────────────
  _c('gaps.list',             'GET',  '/api/gaps',                     'Open gaps by severity'),
  _c('gaps.open',             'POST', '/api/gaps',                     'Open a new gap', {tags:['gaps']}),
  // ── Events / CFR ───────────────────────────────────────────────────────
  _c('events.log',            'GET',  '/api/events',                   'Query event log'),
  _c('events.write',          'POST', '/api/event',                    'Write event to JAA event_log', {tags:['ledger']}),
  _c('cfr.health',            'GET',  '/cfr/health',                   'CFR field health — sigma, regime, coherence'),
  _c('cfr.field',             'GET',  '/cfr/field',                    'Live CFR field state'),
  _c('cfr.graph',             'GET',  '/cfr/graph',                    'Causal graph nodes + edges'),
  _c('cfr.deltas',            'GET',  '/cfr/deltas',                   'Recent delta records'),
  _c('cfr.compounds',         'POST', '/cfr/compounds',                'Compound effect scan (ripple/wave/tidal)'),
  // ── Intelligence ───────────────────────────────────────────────────────
  _c('intelligence.status',   'GET',  '/api/intelligence/status',      'Intelligence core status'),
  _c('intelligence.context',  'GET',  '/api/intelligence/context',     'Pre-request context for intent'),
  _c('intelligence.patterns', 'GET',  '/api/intelligence/patterns',    'Crystallised BEP patterns'),
  _c('intelligence.failures', 'GET',  '/api/intelligence/failures',    'Failure mode taxonomy'),
  _c('intelligence.rca',      'GET',  '/api/intelligence/rca',         'Root cause analysis findings'),
  _c('intelligence.reuse',    'GET',  '/api/intelligence/reuse',       'SEAM reuse candidates'),
  _c('intelligence.event',    'POST', '/api/intelligence/event',       'Feed event for analysis'),
  _c('intelligence.intuition','GET',  '/api/intelligence/intuition',   'INTUITION fast-path answer', {tags:['cognition'],
    hooks:{out:[{id:'cortex.intelligence.intuition.answer',wires_to:['copilot.prompt.receive_result'],tags:['answer']}]}}),
  _c('intelligence.mastermind','GET', '/api/intelligence/mastermind',  'MASTERMIND strategic analysis', {tags:['cognition']}),
  _c('intelligence.predict',  'GET',  '/api/intelligence/predict',     'Predicted next gap from precursors', {tags:['cognition']}),
  _c('intelligence.confidence','GET', '/api/intelligence/confidence',  'Confidence score for query'),
  // ── RAID ───────────────────────────────────────────────────────────────
  _c('raid.decide',           'POST', '/api/raid/decide',              'Route intent to best agent/component', {
    tags:['routing'],
    hooks:{
      in:[{id:'cortex.raid.receive',intent:['build','ask','forge','classify'],contract:'nexus-interaction-contract-v1::cortex',tags:['raid']}],
      out:[{id:'cortex.raid.feedback',wires_to:['ollama.jobs.dispatch.receive','guardian.job.dispatch.receive'],tags:['routing']}],
    }}),
  _c('raid.health',           'GET',  '/api/raid/health',              'RAID agent health + weights'),
  // ── Snapshots ──────────────────────────────────────────────────────────
  _c('snapshot.list',         'GET',  '/api/snapshots',                'Snapshot list'),
  _c('snapshot.create',       'POST', '/api/snapshots/create',         'Create snapshot', {tags:['snapshot']}),
  _c('snapshot.rollback',     'POST', '/api/snapshots/rollback',       'Rollback to snapshot', {tags:['snapshot']}),
  // ── Versionium ─────────────────────────────────────────────────────────
  _c('versionium.log',        'GET',  '/api/versionium/log',           'Version commit log'),
  // ── Chat log ───────────────────────────────────────────────────────────
  _c('chat.log',              'GET',  '/api/chat-log',                 'Co-pilot conversation log'),
  // ── Search ─────────────────────────────────────────────────────────────
  _c('search',                'GET',  '/api/search',                   'Cross-table search'),
  _c('search.context',        'POST', '/api/search/context',           'Context assembly for search query'),
  // ── Tags ───────────────────────────────────────────────────────────────
  _c('tags.list',             'GET',  '/api/tags',                     'All tags in memory'),
  _c('tags.add',              'POST', '/api/tags',                     'Add tag'),
];