'use strict';
/**
 * brainos/route-graph.js — the real data layer behind docs/brainos-live-
 * control-panel.spec's route_graph. James: "nodes are endpoints" — each
 * node in the canvas's route graph IS one real {method, path} (or
 * {method, path, action}) entry from a system's real, live command
 * index, not an abstract per-system blob.
 *
 * §3.1_BOTTOM_UP_ONLY — docs/command-index-per-system.spec is the real
 * dependency this file honors, not works around: only phases 1
 * (idearium) and 5 (clear-glass) are DONE today. guardian/ollama/bridge
 * are SPECCED, not built. Per §NO_CAP_ON_VISIBILITY, this file does not
 * fabricate placeholder routes for the unbuilt three — it emits one
 * honest not_yet_indexed node per system instead, naming the real reason
 * (the spec phase that hasn't run).
 *
 * §VERIFIED, NOT ASSUMED, 2026-09-03 — idearium's real shape was
 * confirmed by actually booting idearium/api/index.js on a scratch port
 * this session and curling GET /api/contract/live:
 *   { ok, system, version, generatedFrom, endpointCount, endpoints:
 *     [{method, path, action}] }
 * clear-glass's shape was confirmed by reading _buildCommandIndex()
 * directly (clear-glass/src/ipc/bridge.js) — NOT live-tested this
 * session: clear-glass is an Electron main-process app and this sandbox
 * has no display/GPU to boot it (same honest limit macro.js's own header
 * already states for the same real reason). Its real shape:
 *   { systemId, port, generatedAt, commandCount, commands: [{method, path}] }
 * (no `action` field — clear-glass's mechanism is live Express
 * introspection, which has no notion of a named action, only a route).
 *
 * This module does no capture of its own — it is a thin, honest fetch +
 * normalize layer over two already-real, already-live endpoints, same
 * "compose, don't reimplement" discipline as lib/hat-forge.js's
 * exportHat() composing with lib/node-export.js.
 */

const http = require('http');

/**
 * §CORRECTED 2026-09-03 — the prior turn's plan named guardian:7820/mesh/
 * canvas/* as the live persistence target. That was wrong, and wrong for
 * a real, findable reason: mesh/README.md (same day, prior session)
 * records that the WHOLE mesh subsystem — including canvas-persistence —
 * was deliberately relocated to clear-glass on 2026-09-03 ("DNS/firewall/
 * crypto/host-rotation/reverse-proxy maybe recycle to clearglass").
 * guardian/routes/mesh.js was REMOVED as part of that same commit; the
 * real, live surface is clear-glass/src/network/routes.js, confirmed
 * wired at clear-glass/src/main/index.js:574, served at /network/* on
 * clear-glass's own IPC_PORT (7702) — not guardian, not /mesh/*. This
 * should have been checked (§6.2 "always read before building") before
 * naming guardian last turn; corrected here against the real record
 * instead of memory, per §0.1.
 */
const CLEAR_GLASS_IPC_PORT = parseInt(process.env.CLEARGL_IPC_PORT || '7702', 10);

/**
 * persistNodeToCanvas(node, timeoutMs) -> real POST /network/canvas/node
 * result, or a real, specific error — never silently swallowed. One node
 * at a time, matching canvas-persistence.js's real upsertNode() contract
 * (UUID-keyed, {id, ...} in, {ok, node} out) — not a bulk endpoint,
 * because none exists for nodes (only /network/canvas/state does bulk,
 * and that's the whole canvas — nodes, tunnels, cam — a different real
 * shape this module doesn't produce).
 */
function persistNodeToCanvas(node, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(node));
    const req = http.request({
      hostname: '127.0.0.1', port: CLEAR_GLASS_IPC_PORT, path: '/network/canvas/node',
      method: 'POST', timeout: timeoutMs,
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`unparseable response from :${CLEAR_GLASS_IPC_PORT}/network/canvas/node: ${e.message}`)); }
      });
    });
    req.on('error', e => reject(new Error(`clear-glass :${CLEAR_GLASS_IPC_PORT} unreachable: ${e.code || e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`:${CLEAR_GLASS_IPC_PORT}/network/canvas/node timed out after ${timeoutMs}ms`)); });
    req.write(data);
    req.end();
  });
}

/**
 * persistRouteGraphToCanvas(graph, opts) -> { attempted, persisted, failed }
 * Persists every real node in a buildRouteGraph() result as one canvas
 * node each (id-keyed, matching canvas-persistence's own convention).
 * A single node's failure (e.g. clear-glass not running) is recorded,
 * never lets one failure abort the rest — same "one failure doesn't take
 * the whole thing down" discipline as this session's SnapshotEngine fix.
 */
async function persistRouteGraphToCanvas(graph, opts = {}) {
  const timeoutMs = opts.timeoutMs || 2000;
  let persisted = 0;
  const failed = [];
  for (const node of graph.nodes) {
    try {
      await persistNodeToCanvas({
        id: node.id, name: `${node.system}:${node.method || ''}:${node.path || ''}`.replace(/:+$/, ''),
        type: 'route-graph-node', system: node.system, status: node.status,
        method: node.method || null, path: node.path || null, action: node.action || null,
        reason: node.reason || null, source: node.source || null,
      }, timeoutMs);
      persisted++;
    } catch (err) {
      failed.push({ id: node.id, error: err.message });
    }
  }
  return { attempted: graph.nodes.length, persisted, failed };
}

// Real, confirmed default ports/paths — see header for how each was
// confirmed this session.
const SYSTEMS = Object.freeze({
  idearium: {
    port: parseInt(process.env.IDEARIUM_PORT || '4800', 10),
    path: '/api/contract/live',
    parse(body) {
      const data = JSON.parse(body);
      if (!Array.isArray(data.endpoints)) throw new Error('unexpected shape — no endpoints array');
      return data.endpoints.map(e => ({ method: e.method, path: e.path, action: e.action || null }));
    },
  },
  'clear-glass': {
    port: parseInt(process.env.CLEARGL_IPC_PORT || '7702', 10),
    path: '/cli/commands',
    parse(body) {
      const data = JSON.parse(body);
      if (!Array.isArray(data.commands)) throw new Error('unexpected shape — no commands array');
      return data.commands.map(c => ({ method: c.method, path: c.path, action: null }));
    },
  },
});

// docs/command-index-per-system.spec's real build_order — phases 2/3/4
// are SPECCED, not built, as of this file's last edit. Re-check that
// spec before assuming this list is still accurate; it is data ABOUT a
// real spec's status, not an independent claim.
const NOT_YET_INDEXED = Object.freeze([
  { system: 'ollama',   reason: 'command-index-per-system.spec phase 2 (SPECCED, not built) — GET /commands does not exist yet' },
  { system: 'guardian', reason: 'command-index-per-system.spec phase 3 (SPECCED, not built) — GET /commands does not exist yet' },
  { system: 'bridge',   reason: 'command-index-per-system.spec phase 4 (SPECCED, not built) — GET /commands does not exist yet' },
]);

/**
 * fetchJSON(port, path, timeoutMs) -> real response body text, or throws
 * with a real, specific reason (never a generic "failed").
 */
function fetchJSON(port, path, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path, timeout: timeoutMs }, res => {
      if (res.statusCode >= 400) { res.resume(); reject(new Error(`HTTP ${res.statusCode} from :${port}${path}`)); return; }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    });
    req.on('error', e => reject(new Error(`:${port}${path} unreachable: ${e.code || e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`:${port}${path} timed out after ${timeoutMs}ms`)); });
  });
}

/**
 * buildRouteGraph(opts) -> { generatedAt, nodeCount, nodes }
 * One real node per endpoint for every system with a real, live,
 * reachable command index; one honest status node per system that
 * isn't (either not yet indexed at all, per the real spec's phase
 * status, or indexed-but-unreachable right now — a real, different
 * condition from "doesn't exist yet", not collapsed into one).
 */
async function buildRouteGraph(opts = {}) {
  const timeoutMs = opts.timeoutMs || 2000;
  const nodes = [];

  for (const [system, cfg] of Object.entries(SYSTEMS)) {
    try {
      const body = await fetchJSON(cfg.port, cfg.path, timeoutMs);
      const entries = cfg.parse(body);
      for (const e of entries) {
        nodes.push({
          id: `${system}:${e.method}:${e.path}`,
          system, method: e.method, path: e.path, action: e.action,
          status: 'indexed',
          source: `live GET ${cfg.path} :${cfg.port}`,
        });
      }
    } catch (err) {
      // §NO_CAP_ON_VISIBILITY — a real, indexed system that's just not
      // reachable right now still gets a real node, honestly marked, not
      // silently dropped from the graph.
      nodes.push({
        id: `${system}:unreachable`,
        system, status: 'unreachable',
        reason: err.message,
        source: `expected live GET ${cfg.path} :${cfg.port}`,
      });
    }
  }

  for (const { system, reason } of NOT_YET_INDEXED) {
    nodes.push({ id: `${system}:not-yet-indexed`, system, status: 'not_yet_indexed', reason, source: 'docs/command-index-per-system.spec' });
  }

  return { generatedAt: Date.now(), nodeCount: nodes.length, nodes };
}

module.exports = { buildRouteGraph, SYSTEMS, NOT_YET_INDEXED, fetchJSON, persistNodeToCanvas, persistRouteGraphToCanvas, CLEAR_GLASS_IPC_PORT };
