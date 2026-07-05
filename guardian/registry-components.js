'use strict';
/**
 * guardian/registry-components.js — Canonical component descriptors
 * UUID: nexus-guardian-registry-v1-0000-2026-0705-001
 * Version: 1.0.0
 *
 * Guardian had no registry-components.js at all — cortex and idearium
 * each declare their real routes this way (see cortex/registry-components.js,
 * idearium/registry-components.js); guardian's NCP hub was undeclared even
 * though cortex/core/raid/index.js and idearium/agent-suite/index.js both
 * depend on it by URL. This backfills guardian's surface the same way
 * idearium's registry backfilled its own (§FIX-ROADMAP-61/62 note there).
 */
const V = '1.0.0';
const NS = 'guardian';

function _c(id, method, path, desc, opts = {}) {
  return {
    id: `${NS}.${id}`, namespace: NS, name: id, version: opts.version || V,
    grammar: opts.grammar || [id.replace(/\./g, ' ')],
    route: { method, path }, description: desc,
    params: opts.params || [], tags: [NS, ...(opts.tags || [])],
    permissions: opts.permissions || ['system'], hooks: opts.hooks || {},
  };
}

module.exports = [
  // ── NCP hub (guardian/ncp/server.js) ────────────────────────────────────
  _c('ncp.health',     'GET',  '/health',    'NCP hub liveness + per-provider connected-tab counts', { tags: ['ncp'] }),
  _c('ncp.channel',    'GET',  '/channel',   'SSE stream a browser tab holds open to receive jobs', {
    tags: ['ncp', 'stream'], params: ['tabId', 'provider'],
  }),
  _c('ncp.command',    'POST', '/command',   'Queue a job for a provider tab, routed through the warp dispatch pipeline', {
    tags: ['ncp', 'dispatch'], params: ['provider', 'prompt', 'meta'],
    hooks: {
      in: [{ id: 'guardian.ncp.command.receive', intent: ['ask', 'build', 'spec'], contract: 'nexus-interaction-contract-v1::guardian', tags: ['ncp'] }],
      out: [{ id: 'guardian.ncp.command.dispatched', wires_to: ['cortex.intelligence.event'], tags: ['ncp'] }],
    },
  }),
  _c('ncp.result',     'POST', '/result',    'Browser tab → hub result/telemetry messages (GUARDIAN_*)', { tags: ['ncp'] }),
  _c('ncp.heartbeat',  'POST', '/heartbeat', 'Browser tab liveness + usage-limit state', { tags: ['ncp'] }),

  // ── Direct API dispatch (guardian/api-dispatch.js) ──────────────────────
  _c('api.dispatch',   'POST', '/api/dispatch', 'Direct REST dispatch for non-NCP providers (chatgpt/gemini/perplexity/claude API)', {
    tags: ['api'], params: ['provider', 'prompt', 'opts'],
  }),

  // ── Agent seam panels (guardian/ui/agents/*) ────────────────────────────
  _c('ui.agent.chatgpt', 'GET', '/ui/agents/chatgpt/index.html', 'ChatGPT agent seam panel — reads ui/agents/chatgpt/index.yml', {
    tags: ['ui', 'chatgpt'],
    hooks: { in: [{ id: 'guardian.ui.agent.chatgpt.receive', intent: ['status'], contract: 'guardian-ui-agent-contract-v1', tags: ['seam'] }] },
  }),
];
