'use strict';
// ── cli/nexus-repl-descriptors.js ───────────────────────────────────────────
// UUID: nexus-repl-descriptors-v1-0000-3600-0000-000000000001
// Version: 1.0.0
// Phase: 36 — Dynamic CLI Commands from Grammar Engine
//
// Registers nexus-repl's existing commands into component-registry so
// they're discoverable/resolvable by ANY grammar-engine consumer (not
// just nexus-repl itself — nexus-cli.js, future Phase 40.5 CLI projection,
// etc.). Per docs/cli.spec: re-register existing commands, don't rewrite
// the handler logic — these descriptors point at routes the underlying
// services already expose; the function bodies in nexus-repl.js are
// untouched.
//
// SCOPE: only `forge` is registered here, not all ~25 nexus-repl commands.
// Checked each one against orchestrator.js's actual proxy routes before
// writing anything — forge has a complete, verified, already-working path
// (POST /api/guardian/dispatch → guardian/command). heal (diagnostic
// :7825/gaps/:id/fix) and snapshot (cortex :3748/api/snapshot) do NOT have
// an orchestrator-relative proxy route yet — registering them with a route
// that doesn't actually work through the dispatcher would be exactly the
// kind of "pretends to work" §1.2 forbids. Same template applies to the
// rest once their proxy routes exist; not done here.

const http = require('http');

const MODULE_ID = 'nexus-repl-descriptors';
const VERSION   = '1.0.0';

const DESCRIPTORS = [
  {
    id: 'repl.forge',
    namespace: 'repl',
    name: 'forge',
    version: '1.0.0',
    description: 'Dispatch a forge job to guardian — RAID picks the provider.',
    grammar: ['forge'],
    route: { method: 'POST', path: '/api/guardian/dispatch' },
    params: [
      { name: 'prompt', type: 'string', required: true },
    ],
    returns: { type: 'object', render: 'json' },
    tags: ['cli', 'forge', 'guardian'],
  },
];

function _request(orchestratorUrl, method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body)) : null;
    const url = new URL(orchestratorUrl + path);
    const req = http.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload ? payload.length : 0 },
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { resolve({ ok: false, error: 'parse error' }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * Registers all descriptors in this file. Safe to call on every nexus-repl
 * startup — component-registry's register() merges on existing id rather
 * than erroring, so re-registration is idempotent, not a duplicate-entry
 * problem.
 */
async function registerAll(orchestratorUrl = 'http://127.0.0.1:9000') {
  const results = [];
  for (const descriptor of DESCRIPTORS) {
    try {
      const r = await _request(orchestratorUrl, 'POST', '/api/components/register', descriptor);
      results.push({ id: descriptor.id, ok: r.ok !== false, result: r });
    } catch (e) {
      results.push({ id: descriptor.id, ok: false, error: e.message });
    }
  }
  return results;
}

module.exports = { DESCRIPTORS, registerAll, MODULE_ID, VERSION };
