'use strict';
/**
 * lib/nexus-client.js — sovereign inter-system transport
 * UUID: nexus-client-v1-0000-2026-0709-jamesbrooks-001
 * Version: 1.0.0
 *
 * §THE INTENT (stated by James, 2026-07-09): "no hardwiring. I need to be
 * able to remove any system and swap in another. They use the API and the
 * orchestrator as a hub for each connection."
 *
 * §WHAT WAS ACTUALLY HAPPENING — measured, not assumed. Twelve direct
 * cross-system `require()` calls exist, reaching into another sovereign
 * system's filesystem:
 *     guardian/server.js      -> require('../cortex/core/raid/routing-ir.js')
 *     guardian/api-dispatch.js-> require('../cortex/core/raid')
 *     copilot/lifeline.js     -> require('../cortex/core/raid/routing-ir.js')
 *     copilot/server.js       -> require('../cortex/personas.js')
 *     copilot/server.js       -> require('../cortex/memory/jaa-db.js')
 *     copilot/adversarial.js  -> require('../cortex/intelligence/adversarial')
 *     copilot/axiom-manager.js-> require('../cortex/memory/jaa-db')
 * Six of these I introduced myself in this session. A `require()` across a
 * system boundary is the hardest possible wire: it couples file layout,
 * module system, and process. Cortex cannot be swapped out while anything
 * requires its files. Sovereignty was intended; hardwiring was implemented.
 *
 * §THE IRONY THAT MAKES IT ONE PROBLEM — cortex already EXPOSES these as
 * real HTTP APIs: /api/raid/decide, /api/intelligence/adversarial,
 * /api/memory/insert. All of them appear in verify-wires' orphaned-route
 * list. They are orphaned BECAUSE everyone reaches around them with
 * require(). The "64 undeclared routes" and the "hardwiring" are the same
 * finding seen from two directions.
 *
 * §HUB — orchestrator.js already has exactly this: a SYS map plus
 * sysReq(systemId, method, path, body). A caller names a SYSTEM and a
 * PATH, never a port. But it is locked inside orchestrator.js, unusable by
 * any other process, so every other system reinvented a hardcoded port.
 * This module is that indirection, extracted and made shared.
 *
 * §SINGLE SOURCE OF TRUTH — resolves systemId -> port from
 * orchestrator.config.json's `ports` block via lib/nexus-config, which is
 * already hot-reloadable (onChange/watch). That block was itself an orphan:
 * nothing in the codebase read `ports.*`. It is now the authority. Swap a
 * system to a new port, or point a systemId at a different implementation,
 * by editing config — no code changes anywhere.
 *
 * §1.2 — an unknown systemId is a loud error, never a guessed default.
 * Guessing a port is how you get two sources of truth.
 */
const http = require('http');
const nexusConfig = require('./nexus-config');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * resolve(systemId) -> { host, port }
 * Reads the live config every call, so a hot config change takes effect on
 * the next request without a restart. That is what makes a system
 * swappable at runtime rather than only at boot.
 */
function resolve(systemId) {
  const ports = nexusConfig.getPath('ports', null);
  if (!ports || typeof ports !== 'object') {
    throw new Error('[nexus-client] orchestrator.config.json has no `ports` block — cannot resolve any system');
  }
  const port = ports[systemId];
  if (!port) {
    throw new Error(`[nexus-client] unknown system '${systemId}'. Known: ${Object.keys(ports).join(', ')}. Refusing to guess a port.`);
  }
  return { host: DEFAULT_HOST, port };
}

/**
 * call(systemId, method, path, body, opts) -> parsed JSON response
 * Never takes a host or a port. That is the whole point: a caller that
 * cannot name a port cannot hardwire one.
 */
function call(systemId, method, path, body, opts = {}) {
  const { host, port } = resolve(systemId);
  const timeout = opts.timeout || DEFAULT_TIMEOUT_MS;
  const payload = body !== undefined && body !== null ? JSON.stringify(body) : null;

  return new Promise((resolve_, reject) => {
    const req = http.request({
      hostname: host, port, path, method,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Nexus-Client': 'nexus-client-v1',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        // §1.2 — a non-2xx is surfaced with its real status, never
        // flattened into a null that a caller mistakes for "no data".
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`[nexus-client] ${systemId} ${method} ${path} -> HTTP ${res.statusCode}: ${d.slice(0, 160)}`));
        }
        try { resolve_(JSON.parse(d)); }
        catch (e) { reject(new Error(`[nexus-client] ${systemId} ${method} ${path} -> non-JSON response: ${e.message}`)); }
      });
    });
    req.on('error',   e => reject(new Error(`[nexus-client] ${systemId} unreachable at ${host}:${port} — ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`[nexus-client] ${systemId} ${method} ${path} timed out after ${timeout}ms`)); });
    if (payload) req.write(payload);
    req.end();
  });
}

const get  = (systemId, path, opts)       => call(systemId, 'GET',  path, undefined, opts);
const post = (systemId, path, body, opts) => call(systemId, 'POST', path, body, opts);

/** health(systemId) — true only on a real ok:true. Never optimistic. */
async function health(systemId) {
  try {
    const r = await get(systemId, '/health', { timeout: 3000 });
    return r?.ok === true;
  } catch (_) { return false; }
}

/** systems() — every systemId the config knows about. */
function systems() {
  const ports = nexusConfig.getPath('ports', {}) || {};
  return Object.keys(ports);
}

module.exports = { call, get, post, health, resolve, systems };
