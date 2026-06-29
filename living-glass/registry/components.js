'use strict';
/**
 * living-glass/registry/components.js
 * UUID: living-glass-registry-v1-0000-0000-000000000006
 *
 * Living Glass component declarations.
 * Sent to orchestrator on boot: POST /api/register { components: [...] }
 * Makes Living Glass a first-class citizen in the component registry
 * and grammar trie — the NEXUS UI can surface its endpoints automatically.
 *
 * Also declares the MISSING registry-components for:
 *   guardian, cortex, bridge, architect, emerge, diagnostic
 * — because Living Glass is the meta-system that declares what exists.
 *   These declarations let the component registry go from ~42 (idearium only)
 *   to ~200+ components, unlocking RAID component-level routing.
 */

function _comp(namespace, action, method, pathStr, description, opts = {}) {
  const parts = action.split('.');
  const [resource, verb] = parts.length >= 2 ? [parts[0], parts[1]] : [action, 'get'];
  return {
    id:          `${namespace}.${action}`,
    namespace,
    name:        action,
    version:     '1.0.0',
    grammar:     opts.grammar || [`${verb} ${resource}`, `${resource} ${verb}`, `${namespace} ${action}`],
    route:       { method, path: pathStr },
    description,
    params:      opts.params || [],
    returns:     opts.returns || { type: 'object', render: 'json' },
    tags:        [namespace, ...(opts.tags || [])],
    permissions: opts.permissions || ['system'],
  };
}

// ── Living Glass components (self) ─────────────────────────────────────────────
const LIVING_GLASS = [
  _comp('living-glass', 'health',              'GET',  '/health',                    'Living Glass liveness'),
  _comp('living-glass', 'field.snapshot',      'GET',  '/field',                     'Full relational field snapshot — all systems, components, gaps, sigma'),
  _comp('living-glass', 'components.list',     'GET',  '/components',                'All registered components across all NEXUS systems', { tags: ['registry'] }),
  _comp('living-glass', 'components.get',      'GET',  '/components/:id',            'Single component detail with live status and sigma', { tags: ['registry'] }),
  _comp('living-glass', 'gaps.list',           'GET',  '/gaps',                      'All open gaps across all systems, annotated with causal trace', { tags: ['gaps'] }),
  _comp('living-glass', 'gaps.trace',          'GET',  '/gaps/:id/trace',            'Causal trace for a specific gap — root cause walk', { tags: ['gaps', 'causal'] }),
  _comp('living-glass', 'fires.list',          'GET',  '/fires',                     'Active diagnostic contracts (fires being fought)', { tags: ['diagnostic'] }),
  _comp('living-glass', 'fires.get',           'GET',  '/fires/:id',                 'Single fire detail: contract + diagnosis + repair spec', { tags: ['diagnostic'] }),
  _comp('living-glass', 'fires.dispatch',      'POST', '/fires/:id/dispatch',        'Manually trigger repair dispatch for a fire', { tags: ['diagnostic', 'repair'] }),
  _comp('living-glass', 'sigma.field',         'GET',  '/sigma',                     'Causal sigma per component — the health field', { tags: ['causal'] }),
  _comp('living-glass', 'ledger.tail',         'GET',  '/ledger',                    'Living Glass event ledger tail'),
  _comp('living-glass', 'sse',                 'GET',  '/sse',                       'Live correlated event stream — all systems', { tags: ['stream'] }),
  _comp('living-glass', 'contract',            'GET',  '/contract',                  'Living Glass interaction contract'),
];

// ── Guardian components (previously undeclared) ────────────────────────────────
const GUARDIAN = [
  _comp('guardian', 'health',              'GET',  '/health',                    'Guardian liveness + NCP provider status'),
  _comp('guardian', 'copilot.send',        'POST', '/api/copilot/prompt',        '7-layer co-pilot prompt — routes through RAID', { tags: ['copilot', 'ai'] }),
  _comp('guardian', 'job.create',          'POST', '/api/jobs',                  'Create and dispatch a job', { tags: ['jobs'] }),
  _comp('guardian', 'job.list',            'GET',  '/api/jobs',                  'List jobs with status', { tags: ['jobs'] }),
  _comp('guardian', 'job.get',             'GET',  '/api/jobs/:id',              'Get single job', { tags: ['jobs'] }),
  _comp('guardian', 'gap.list',            'GET',  '/gaps',                      'Open gaps in Guardian', { tags: ['gaps'] }),
  _comp('guardian', 'gap.open',            'POST', '/api/gaps',                  'Open a new gap in Guardian', { tags: ['gaps'] }),
  _comp('guardian', 'ncp.providers',       'GET',  '/providers',                 'NCP provider status — claude, chatgpt, gemini, perplexity', { tags: ['ncp'] }),
  _comp('guardian', 'seam.queues',         'GET',  '/seam/queues',               'SEAM queue status', { tags: ['seam'] }),
  _comp('guardian', 'seam.dispatch',       'POST', '/seam/dispatch',             'Dispatch a SEAM chunk', { tags: ['seam'] }),
  _comp('guardian', 'blueprint.get',       'GET',  '/blueprint',                 'System blueprint — live CLI map', { tags: ['blueprint'] }),
  _comp('guardian', 'events',              'GET',  '/events',                    'Guardian SSE stream', { tags: ['stream'] }),
  _comp('guardian', 'mcp.tools',           'GET',  '/mcp/tools',                 'List MCP tools (17)', { tags: ['mcp'] }),
  _comp('guardian', 'cfr.state',           'GET',  '/cfr/state',                 'CFR causal field state', { tags: ['cfr'] }),
  _comp('guardian', 'diagnose.repair',     'POST', '/api/jobs',                  'Diagnose and repair via Ollama (forge_repair)', { tags: ['diagnostic', 'repair'],
    params: [{ name: 'command', type: 'string' }, { name: 'gapId', type: 'string' }] }),
];

// ── Cortex components (previously undeclared) ──────────────────────────────────
const CORTEX = [
  _comp('cortex', 'health',              'GET',  '/health',                    'Cortex liveness'),
  _comp('cortex', 'raid.route',          'POST', '/api/raid/route',            'RAID intent routing — classify + dispatch', { tags: ['raid', 'ai'] }),
  _comp('cortex', 'raid.weights',        'GET',  '/api/raid/weights',          'RAID cluster weights', { tags: ['raid'] }),
  _comp('cortex', 'cfr.state',           'GET',  '/cfr/state',                 'CFR causal field — sigma, regime, chains', { tags: ['cfr', 'causal'] }),
  _comp('cortex', 'cfr.graph',           'GET',  '/cfr/graph',                 'CFR graph nodes + edges', { tags: ['cfr', 'causal'] }),
  _comp('cortex', 'gaps.list',           'GET',  '/api/gaps',                  'Open loops in Cortex', { tags: ['gaps'] }),
  _comp('cortex', 'gap.open',            'POST', '/api/gaps',                  'Open a gap in Cortex', { tags: ['gaps'] }),
  _comp('cortex', 'memory.query',        'POST', '/api/memory/query',          'Query Cortex memory (JAA tables)', { tags: ['memory'] }),
  _comp('cortex', 'intelligence.scan',   'POST', '/api/intelligence/scan',     'Pattern crystallization scan', { tags: ['intelligence'] }),
  _comp('cortex', 'snapshot.create',     'POST', '/api/snapshot',              'Create .nex snapshot', { tags: ['snapshot'] }),
  _comp('cortex', 'snapshot.rollback',   'POST', '/api/snapshot/rollback',     'Rollback to snapshot', { tags: ['snapshot'] }),
  _comp('cortex', 'event.emit',          'POST', '/api/event',                 'Emit event to Cortex bus', { tags: ['bus'] }),
  _comp('cortex', 'events',              'GET',  '/events',                    'Cortex SSE stream', { tags: ['stream'] }),
];

// ── Bridge components (previously undeclared) ──────────────────────────────────
const BRIDGE = [
  _comp('bridge', 'health',              'GET',  '/health',                    'Bridge liveness + circuit status'),
  _comp('bridge', 'handshake',           'POST', '/bridge/handshake',          'System identity handshake — issues token', { tags: ['identity', 'trust'] }),
  _comp('bridge', 'request.create',      'POST', '/bridge/request',            'Route a request through Bridge trust relay', { tags: ['relay'] }),
  _comp('bridge', 'request.list',        'GET',  '/bridge/requests',           'List bridge requests with status', { tags: ['relay'] }),
  _comp('bridge', 'registry',            'GET',  '/bridge/registry',           'Bridge system registry — all known nodes', { tags: ['registry'] }),
  _comp('bridge', 'circuits',            'GET',  '/bridge/circuits',           'Circuit breaker status per system', { tags: ['circuit'] }),
  _comp('bridge', 'causal.emit',         'POST', '/bridge/causal/emit',        'Emit a causal event to the spine graph', { tags: ['causal'] }),
  _comp('bridge', 'causal.trace',        'GET',  '/bridge/trace/:eventId',     'Causal trace — ancestors + descendants', { tags: ['causal'] }),
  _comp('bridge', 'causal.query',        'GET',  '/bridge/trace',              'Query causal events with filters', { tags: ['causal'] }),
  _comp('bridge', 'causal.forensics',    'GET',  '/bridge/trace/session/:id',  'Full session forensics with gap detection', { tags: ['causal', 'diagnostic'] }),
  _comp('bridge', 'sse',                 'GET',  '/bridge/sse',                'Bridge SSE stream', { tags: ['stream'] }),
];

// ── Diagnostic components (previously undeclared) ──────────────────────────────
const DIAGNOSTIC = [
  _comp('diagnostic', 'health',          'GET',  '/status',                    'Diagnostic service health'),
  _comp('diagnostic', 'gaps.list',       'GET',  '/gaps',                      'All open gaps across all systems', { tags: ['gaps'] }),
  _comp('diagnostic', 'friction',        'GET',  '/friction',                  'Per-system friction scores', { tags: ['friction'] }),
  _comp('diagnostic', 'audit',           'GET',  '/audit',                     'Full system audit: requires, syntax, endpoints, ledger health', { tags: ['audit'] }),
  _comp('diagnostic', 'tension',         'GET',  '/tension',                   '12-engine diagnostic tension field', { tags: ['engines'] }),
  _comp('diagnostic', 'engines',         'GET',  '/engines',                   'Diagnostic engine suite results', { tags: ['engines'] }),
  _comp('diagnostic', 'baseline',        'GET',  '/baseline/:system',          'Baseline stats for a system', { tags: ['baseline'] }),
  _comp('diagnostic', 'sse',             'GET',  '/events',                    'Diagnostic SSE stream', { tags: ['stream'] }),
];

// ── Architect components (previously undeclared) ───────────────────────────────
const ARCHITECT = [
  _comp('architect', 'health',           'GET',  '/health',                    'Architect liveness'),
  _comp('architect', 'hooks.list',       'GET',  '/api/hooks',                 'Registered hooks', { tags: ['hooks'] }),
  _comp('architect', 'hooks.register',   'POST', '/api/hooks',                 'Register a hook', { tags: ['hooks'] }),
  _comp('architect', 'spec.create',      'POST', '/api/specs',                 'Create a spec via 11-dimension wizard', { tags: ['spec'] }),
  _comp('architect', 'blueprint',        'GET',  '/api/blueprint',             'Architecture blueprint', { tags: ['blueprint'] }),
  _comp('architect', 'sse',              'GET',  '/sse',                       'Architect SSE stream', { tags: ['stream'] }),
];

// ── Emerge components (previously undeclared) ──────────────────────────────────
const EMERGE = [
  _comp('emerge', 'health',              'GET',  '/status',                    'Emerge liveness'),
  _comp('emerge', 'compile',             'POST', '/api/compile',               'Compile a spec through T0/T1 pipeline', { tags: ['compiler'] }),
  _comp('emerge', 'grammar',             'GET',  '/api/grammar',               'Live grammar trie', { tags: ['grammar'] }),
  _comp('emerge', 'descriptor',          'GET',  '/api/descriptor/:id',        'Component descriptor with 6 projections', { tags: ['descriptor'] }),
  _comp('emerge', 'cli.map',             'GET',  '/api/cli-map',               'Generated CLI map from descriptors', { tags: ['cli'] }),
  _comp('emerge', 'sse',                 'GET',  '/sse',                       'Emerge SSE stream', { tags: ['stream'] }),
];

// ── All components — Living Glass self + all other systems ────────────────────
const ALL_COMPONENTS = [
  ...LIVING_GLASS,
  ...GUARDIAN,
  ...CORTEX,
  ...BRIDGE,
  ...DIAGNOSTIC,
  ...ARCHITECT,
  ...EMERGE,
];

module.exports = ALL_COMPONENTS;
module.exports.LIVING_GLASS = LIVING_GLASS;
module.exports.GUARDIAN     = GUARDIAN;
module.exports.CORTEX       = CORTEX;
module.exports.BRIDGE       = BRIDGE;
module.exports.DIAGNOSTIC   = DIAGNOSTIC;
module.exports.ARCHITECT    = ARCHITECT;
module.exports.EMERGE       = EMERGE;
