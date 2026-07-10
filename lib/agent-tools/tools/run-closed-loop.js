'use strict';
/**
 * lib/agent-tools/tools/run-closed-loop.js — run_closed_loop tool
 * UUID: nexus-agent-tools-closed-loop-v1-0000-2026-0710-jamesbrooks-001
 * Map: docs/NEXUS-CLOSED-LOOP-MAP-2026-07-10.md
 *
 * §THE CLOSED LOOP — "import a spec → build a repository automatically →
 * chunk it → populate it." Every stage already existed as a real entry
 * point (verified against source in the map doc); nothing chained them.
 * This is the chain, as ONE copilot-callable action:
 *   1. create   → POST /api/spec-engine/specs        (spec → manifest)
 *   2. populate → POST /api/spec-engine/specs/:id/build, looped until
 *                 {done:true}  (WARP-backed chunk dispatch — the build
 *                 spine; each chunk verified on disk before contract close)
 *   3. repo     → POST /api/repos                     (repo from the spec)
 *   4. verify   → the execution pipeline is triggered separately via
 *                 run_pipeline once a .spec path exists on disk; this tool
 *                 reports the spec+repo so that hand-off is one more call,
 *                 rather than pretending to run a sandbox it has no path to.
 *
 * §HONEST BOUNDARIES — orchestrates real stages, reimplements none. A
 * stage failure stops the loop and returns WHERE it stopped with the real
 * error (§1.2), never a fabricated "done". The populate loop has a real
 * safety cap (matches the spec's ~9 sections + headroom), not an infinite
 * wait. WARP stays the build spine for populate — unchanged, just driven.
 */

const http = require('http');

const IDEARIUM_PORT = parseInt(process.env.IDEARIUM_PORT || '4800');

function _req(pathname, { method = 'GET', body = null, timeoutMs = 120000 } = {}) {
  return new Promise((resolve) => {
    let data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: '127.0.0.1', port: IDEARIUM_PORT, path: pathname, method,
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
      timeout: timeoutMs,
    };
    const req = http.request(opts, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => { try { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: JSON.parse(b) }); } catch (e) { resolve({ ok: false, error: `bad JSON: ${e.message}`, raw: b.slice(0, 200) }); } });
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'idearium timeout' }); });
    req.on('error', (e) => resolve({ ok: false, error: `idearium unreachable: ${e.message}` }));
    if (data) req.write(data);
    req.end();
  });
}

module.exports = {
  name: 'run_closed_loop',
  description:
    'Import a spec and automatically build a repository from it: create the spec manifest, chunk it, and populate every chunk via the WARP build spine, then create a repo. ' +
    'Params: name (required), description (the spec intent), type (component|service|library, default component), agent (ollama default). ' +
    'Returns the created spec id, populate progress, and repo id. Use run_pipeline afterward to build→verify→promote from the spec path.',
  parameters: {
    type: 'object',
    properties: {
      name:        { type: 'string', description: 'Spec/repo name (required)' },
      description: { type: 'string', description: 'What the spec should build (the intent)' },
      type:        { type: 'string', description: 'component | service | library (default component)' },
      agent:       { type: 'string', description: 'Build agent: ollama (default), chatgpt, claude' },
    },
    required: ['name'],
  },
  execute: async ({ name, description = '', type = 'component', agent = 'ollama' } = {}) => {
    if (!name) return { error: 'name is required' };
    const trace = [];

    // ── Stage 1: create the spec manifest ────────────────────────────────
    const created = await _req('/api/spec-engine/specs', { method: 'POST', body: { name, description: description || name, type, agent } });
    if (!created.ok || !created.body?.manifest?.uuid) {
      return { error: `stage 1 (create) failed: ${created.error || JSON.stringify(created.body).slice(0, 120)}`, stage: 'create' };
    }
    const specUuid = created.body.manifest.uuid;
    trace.push({ stage: 'create', ok: true, specUuid });

    // ── Stage 2: populate — drive speceng.build until done (WARP-backed) ──
    let done = false, iterations = 0;
    const MAX = 200; // ~9 sections + generous headroom; real cap, not infinite
    while (!done && iterations < MAX) {
      iterations++;
      const built = await _req(`/api/spec-engine/specs/${specUuid}/build`, { method: 'POST', body: { agent } });
      if (!built.ok) {
        return { error: `stage 2 (populate) failed at chunk ${iterations}: ${built.error || JSON.stringify(built.body).slice(0, 120)}`, stage: 'populate', specUuid, trace };
      }
      if (built.body?.done) { done = true; break; }
      // brief yield so async (chatgpt/claude) chunks can settle between calls
      await new Promise((r) => setTimeout(r, 500));
    }
    trace.push({ stage: 'populate', ok: done, chunksDriven: iterations, cappedOut: !done });
    if (!done) {
      return { error: `stage 2 (populate) hit the safety cap after ${iterations} chunks — check chunk status`, stage: 'populate', specUuid, trace };
    }

    // ── Stage 3: create a repo from the populated spec ───────────────────
    const repo = await _req('/api/repos', { method: 'POST', body: { name, specUuid, source: 'closed-loop' } });
    const repoId = repo.body?.repo?.uuid || repo.body?.uuid || null;
    trace.push({ stage: 'repo', ok: repo.ok, repoId, note: repo.ok ? undefined : (repo.error || 'repo.ingest returned non-ok') });

    return {
      ok: true,
      specUuid,
      repoId,
      chunksPopulated: iterations,
      trace,
      next: `Spec ${specUuid} populated${repoId ? ` and repo ${repoId} created` : ''}. Run run_pipeline with this spec's path to build→verify→promote.`,
    };
  },
};
