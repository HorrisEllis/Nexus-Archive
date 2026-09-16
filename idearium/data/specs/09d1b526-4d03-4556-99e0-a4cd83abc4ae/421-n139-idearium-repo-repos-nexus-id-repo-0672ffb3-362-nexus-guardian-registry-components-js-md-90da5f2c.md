---
chunk_uuid: 90da5f2c-2fe9-4969-98cf-aec1c06fbe2f
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-362-nexus-guardian-registry-components-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/362-nexus-guardian-registry-components-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-362-nexus-guardian-registry-components-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-362-nexus-guardian-registry-components-js-md:90da5f2c
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:24:39.017Z
---

'use strict';
/**
 * guardian/registry-components.js
 * comp_id: nexus.guardian.registry
 * uuid: nexus-guardian-registry-v1-0000-2026-0627-jamesbrooks-001
 * Declares every Guardian capability to the orchestrator on boot.
 */

const V = '3.6.2';   // §5.4 fix 2026-08-08 — was 3.6.1, drifted from canonical lib/version.js's services.guardian (3.6.2)
const NS = 'guardian';
function _c(id, method, path, desc, opts = {}) {
  return {
    id: `${NS}.${id}`, namespace: NS, name: id, version: V,
    grammar: opts.grammar || [id.replace(/\./g,' '), id.replace(/\./g,'-')],
    route: { method, path },
    description: desc,
    params:      opts.params || [],
    tags:        [NS, ...(opts.tags || [])],
    permissions: opts.permissions || ['system'],
    hooks:       opts.hooks || {},
  };
}

module.exports = [
  // ── Health / introspection ─────────────────────────────────────────────
  _c('health',               'GET',  '/health',                 'Guardian health, job counts, provider status'),
  _c('contract',             'GET',  '/contract',               'Guardian interaction contract'),
  _c('version',              'GET',  '/version',                'Guardian + userscript versions'),
  _c('baseline',             'GET',  '/baseline',               'Friction + sigma baseline'),
  _c('events',               'GET',  '/events',                 'SSE — all guardian bus events', { tags:['stream'] }),
  _c('bus.log',              'GET',  '/bus',                    'Recent SISO bus log'),
  _c('bus.emit',             'POST', '/bus/emit',               'Emit event onto bus'),

  // ── NCP / providers ────────────────────────────────────────────────────
  _c('providers.list',       'GET',  '/providers',              'Connected NCP browser tab providers'),
  _c('provider.channel',     'GET',  '/channel',                'NCP SSE channel — browser tabs connect here', { tags:['ncp'] }),
  _c('provider.result',      'POST', '/result',                 'NCP result from browser tab', { tags:['ncp'] }),

  // ── Jobs ───────────────────────────────────────────────────────────────
  _c('job.list',             'GET',  '/jobs',                   'Active + recent jobs'),
  _c('job.dispatch',         'POST', '/command',                'Dispatch job to provider (raw or SEAM)', {
    tags: ['dispatch'],
    hooks: {
      in:  [{ id:'guardian.job.dispatch.receive', intent:['build','ask','forge','compile'], contract:'nexus-interaction-contract-v1::guardian', tags:['dispatch'] }],
      out: [{ id:'guardian.job.dispatch.complete', wires_to:['cortex.raid.feedback'], tags:['result'] }],
    }
  }),
  _c('job.build',            'POST', '/build',                  'Full T0→T1→T2 build pipeline from spec', { tags:['build'] }),
  _c('job.status',           'GET',  '/status/:jobId',          'Single job status'),
  _c('job.response',         'GET',  '/response/:jobId',        'Full response for a job'),

  // ── SEAM ───────────────────────────────────────────────────────────────
  _c('seam.queues',          'GET',  '/seam/queues',            'Active SEAM queues'),
  _c('seam.queue',           'GET',  '/seam/queues/:id',        'Single SEAM queue detail'),
  _c('seam.sessions',        'GET',  '/seam/sessions',          'SEAM session history'),
  _c('seam.session.create',  'POST', '/seam/sessions',          'Create SEAM session'),
  _c('seam.retry',           'POST', '/seam/retry',             'Retry a failed SEAM chunk'),
  _c('seam.watchdog',        'GET',  '/seam/watchdog/status',   'SEAM watchdog + stall detection'),

  // ── Queue / compartments ───────────────────────────────────────────────
  _c('queue.status',         'GET',  '/queue',                  'Physical queue status'),
  _c('queue.enqueue',        'POST', '/queue/enqueue',          'Enqueue item to physical queue'),
  _c('queue.compartments',   'GET',  '/queue/compartments',     'Job compartment list'),
  _c('queue.compartment.create','POST','/queue/compartments',   'Create job compartment'),

  // ── Artifacts / gaps / sessions ────────────────────────────────────────
  _c('artifacts.list',       'GET',  '/artifacts',              'SHA-256 deduplicated code artifacts'),
  _c('gaps.list',            'GET',  '/gaps',                   'Open gaps detected by guardian'),
  _c('gaps.summary',         'GET',  '/gaps/summary',           'Gap summary by type + severity'),
  _c('sessions.list',        'GET',  '/sessions',               'NCP session history'),
  _c('settings.get',         'GET',  '/settings',               'Guardian settings'),
  _c('settings.reset',       'POST', '/settings/reset',         'Reset settings to defaults'),

  // ── Co-pilot (proxy to :3750) ──────────────────────────────────────────
  _c('copilot.prompt',       'POST', '/api/copilot/prompt',     'Route to co-pilot :3750/api/prompt', {
    tags: ['copilot'],
    hooks: {
      in:  [{ id:'guardian.copilot.receive', intent:['ask','build','diagnose','note'], contract:'nexus-interaction-contract-v1::guardian', tags:['copilot'] }],
      out: [{ id:'guardian.copilot.to-copilot', wires_to:['copilot.prompt.receive'], tags:['proxy'] }],
    }
  }),
  _c('copilot.memory',       'POST', '/api/copilot/memory',     'Co-pilot memory operations'),
];