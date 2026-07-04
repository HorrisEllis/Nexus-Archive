'use strict';
/**
 * clear-glass/src/api/wire.js — Clear Glass Wire API
 * UUID: cg-wire-api-v1-0000-2026-0702-jamesbrooks-001
 *
 * Sovereign HTTP API surface for Clear Glass (:7704).
 * Extracted from main/index.js — each route is now a named, testable function.
 *
 * Routes:
 *   GET  /contract        — contract for orchestrator verification
 *   GET  /health          — wire server health
 *   ANY  /eros/*          — ErosmancerOS proxy passthrough
 *   POST /bridge/driver   — ClearDriver → ErosmancerOS action bridge
 *   POST /hook/hostile    — hostile detection → SISO bus
 *   POST /hook/behavior   — behavior plan → Cortex intelligence
 */

const http = require('http');

function createWireHandler({ CONTRACT, WIRE_PORT, EROS_PORT, ACTION_MAP, emit, _postEvent, _proxyEros }) {
  return function wireHandler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      let parsed = {};
      try { parsed = body ? JSON.parse(body) : {}; } catch(_) {}

      const u = req.url;
      const method = req.method;

      if (u === '/contract' && method === 'GET')
        return res.end(JSON.stringify(CONTRACT));

      if ((u === '/health' || u === '/wire/health') && method === 'GET')
        return res.end(JSON.stringify({ ok: true, module: 'nexus-wire', port: WIRE_PORT, ts: Date.now() }));

      if (u.startsWith('/eros/')) {
        const erosPath = '/api' + u.replace(/^\/eros/, '');
        const up = await _proxyEros(method, erosPath, parsed);
        res.writeHead(up.status);
        return res.end(JSON.stringify(up.body));
      }

      if (u === '/bridge/driver' && method === 'POST') {
        const { action, agentId, ...args } = parsed;
        const endpoint = ACTION_MAP[action];
        if (!endpoint) { res.writeHead(400); return res.end(JSON.stringify({ error: `No Eros mapping: ${action}` })); }
        const up = await _proxyEros('POST', endpoint, { tabId: agentId, ...args }, 30000);
        res.writeHead(up.status);
        return res.end(JSON.stringify(up.body));
      }

      if (u === '/hook/hostile' && method === 'POST') {
        const { level, type, tabId, recommendation } = parsed;
        if (level === 'high' || level === 'critical')
          emit('context.fp.switch', { agentId: tabId, mode: 'firefox', reason: `hostile:${type}` });
        _postEvent('eros.hostile.detected', { level, type, tabId, recommendation });
        return res.end(JSON.stringify({ ok: true }));
      }

      if (u === '/hook/behavior' && method === 'POST') {
        const { planId, profile, variant, meta } = parsed;
        _postEvent('eros.behavior.plan', { planId, profile, variant, meta });
        return res.end(JSON.stringify({ ok: true }));
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'not found', path: u }));
    });
  };
}

function startWireServer({ port, handler }) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

module.exports = { createWireHandler, startWireServer };
