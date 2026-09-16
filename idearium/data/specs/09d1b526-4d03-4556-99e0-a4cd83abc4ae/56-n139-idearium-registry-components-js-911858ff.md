---
chunk_uuid: 911858ff-2af7-4067-80b7-a6964d68bd1a
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-registry-components-js
title: n139/idearium/registry-components.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-registry-components-js
contract_id: spec-contract:09d1b526:n139-idearium-registry-components-js:911858ff
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:53.587Z
---

// ── idearium/registry-components.js — Canonical component descriptors ───────
// UUID: idearium-registry-components-v1-0000-4000-0000-000000000001
// Version: 1.0.0
//
// §FIX-ROADMAP-61/62: backfills idearium's real API surface into
// lib/component-registry.js (the canonical registry, per architectural
// decision — see roadmap Phase 62). hooks/idearium.hooks.js declared 3 hooks
// with 1 real seam.componentId against 20+ real undeclared actions; this
// covers all 42 real routes idearium/api/index.js actually serves, derived
// directly from its routing tables (both static `routes` and `dynRoutes`),
// not invented separately.
//
// Registered via POST /api/register's existing `components` field
// (lib/component-registry.js's onSystemRegister(), already wired in
// orchestrator.js but never previously fed real data from any system).

function _grammarFor(action) {
  // Mechanical phrase generation from 'resource.verb' action names —
  // e.g. 'idea.create' -> ['create idea', 'idea create'].
  const parts = action.split('.');
  if (parts.length < 2) return [action];
  const [resource, verb] = parts;
  return [`${verb} ${resource}`, `${resource} ${verb}`];
}

function _comp(action, method, pathStr, description, opts = {}) {
  return {
    id:          `idearium.${action}`,
    namespace:   'idearium',
    name:        action,
    version:     opts.version || '1.0.0',
    grammar:     opts.grammar || _grammarFor(action),
    route:       { method, path: pathStr },
    description,
    params:      opts.params || [],
    returns:     opts.returns || { type: 'object', render: 'json' },
    tags:        ['idearium', ...(opts.tags || [])],
    permissions: opts.permissions || ['system'],
  };
}

const COMPONENTS = [
  // ── Health / introspection ─────────────────────────────────────────────
  _comp('health',          'GET',  '/',                                  'Service liveness check'),
  _comp('contract.get',    'GET',  '/api/contract',                      "Return idearium's API contract descriptor"),
  _comp('stats.get',       'GET',  '/api/stats',                         'Runtime stats — idea/spec/gap counts, SNR'),
  _comp('snr.current',     'GET',  '/api/snr',                           'Current SNR (signal-to-noise) score'),
  _comp('snr.history',     'GET',  '/api/snr/history',                   'Historical SNR score timeline'),
  _comp('events.log',      'GET',  '/api/events',                        'Recent internal event log'),
  _comp('sse',             'GET',  '/sse',                               'Live SSE event stream', { tags: ['stream'] }),

  // ── Ideas ───────────────────────────────────────────────────────────────
  _comp('idea.list',       'GET',  '/api/ideas',                         'List all ideas'),
  _comp('idea.create',     'POST', '/api/ideas',                         'Create a new idea from free text',
    { params: [{ name: 'text', type: 'string' }, { name: 'tags', type: 'json' }, { name: 'compartment', type: 'string' }] }),
  _comp('idea.show',       'GET',  '/api/ideas/:uuid',                   'Get a single idea by uuid'),
  _comp('idea.update',     'PATCH','/api/ideas/:uuid',                   "Update an idea's fields"),
  _comp('idea.archive',    'DELETE','/api/ideas/:uuid',                  'Archive (soft-delete) an idea'),
  _comp('idea.tension',    'POST', '/api/ideas/:uuid/tension',           'Recompute tension score for an idea'),
  _comp('idea.link',       'POST', '/api/ideas/:uuid/link',              'Link two ideas together'),
  _comp('idea.spec',       'POST', '/api/ideas/:uuid/spec',              'Promote an idea into a spec'),
  _comp('idea.phase',      'POST', '/api/ideas/:uuid/phase',             "Advance an idea's lifecycle phase"),
  _comp('idea.progress',   'POST', '/api/ideas/:uuid/progress',          'Record progress against an idea'),

  // ── Specs ───────────────────────────────────────────────────────────────
  _comp('spec.list',       'GET',  '/api/specs',                        'List all specs'),
  _comp('spec.create',     'POST', '/api/specs',                        'Create a new spec from an idea'),
  _comp('spec.show',       'GET',  '/api/specs/:uuid',                  'Get a single spec by uuid'),
  _comp('spec.update',     'PATCH','/api/specs/:uuid',                  "Update a spec's section content"),
  _comp('spec.check',      'POST', '/api/specs/:uuid/check',            'Validate spec completeness before build'),
  _comp('spec.build',      'POST', '/api/specs/:uuid/build',            'Compile a spec via the Tier 0/1 pipeline (compiler-bridge)'),
  _comp('spec.export',     'GET',  '/api/specs/:uuid/export',           'Export a spec as a portable document'),

  // ── Gaps ────────────────────────────────────────────────────────────────
  _comp('gap.list',        'GET',  '/api/gaps',                         'List open gaps'),
  _comp('gap.open',        'POST', '/api/gaps',                         'Open a new gap'),
  _comp('gap.show',        'GET',  '/api/gaps/:uuid',                   'Get a single gap by uuid'),
  _comp('gap.resolve',     'POST', '/api/gaps/:uuid/resolve',           'Resolve an open gap'),
  _comp('gap.ignore',      'POST', '/api/gaps/:uuid/ignore',            'Mark a gap as ignored'),

  // ── Snapshots ───────────────────────────────────────────────────────────
  _comp('snapshot.list',   'GET',  '/api/snapshots',                    'List saved snapshots'),
  _comp('snapshot.push',   'POST', '/api/snapshots',                    'Push a new snapshot of current state'),
  _comp('snapshot.show',   'GET',  '/api/snapshots/:uuid',              'Get a single snapshot by uuid'),
  _comp('snapshot.diff',   'GET',  '/api/snapshots/:a/diff/:b',         'Diff two snapshots'),
  _comp('snapshot.restore','POST', '/api/snapshots/:uuid/restore',      'Restore state from a snapshot'),

  // ── Repos ───────────────────────────────────────────────────────────────
  _comp('repo.list',       'GET',  '/api/repos',                        'List ingested repos'),
  _comp('repo.ingest',     'POST', '/api/repos',                        "Ingest a repo's file tree as a new repo entry"),
  _comp('repo.show',       'GET',  '/api/repos/:uuid',                  'Get a single repo by uuid'),
  _comp('repo.fork',       'POST', '/api/repos/:uuid/fork',             'Fork a repo into a new lineage'),
  _comp('repo.archive',    'DELETE','/api/repos/:uuid',                 'Archive a repo'),
  _comp('repo.lineage',    'GET',  '/api/repos/:uuid/lineage',          "Get a repo's fork lineage"),

  // ── Queue ───────────────────────────────────────────────────────────────
  _comp('queue.show',      'GET',  '/api/queue/:queueId',               'Get queue item status'),
  _comp('queue.progress',  'POST', '/api/queue/:queueId/progress',      'Record progress against a queue item'),

  // ── CLI ─────────────────────────────────────────────────────────────────
  _comp('cli.exec',        'POST', '/api/cli/exec',                     'Execute a unified CLI command'),
];

export { COMPONENTS };
export default { COMPONENTS };