'use strict';
// clear-glass/src/network/routes.js — routes for the network subsystem
// (network/install.js).
// UUID: cg-network-routes-v1-0000-2026-0903-001
//
// §RELOCATED 2026-09-03 from guardian/routes/mesh.js (nexus-guardian-
// route-mesh-v1) — same real per-module dispatch logic (every network
// module still exposes bridgeRoute(parts, method, body, req), unchanged),
// translated to clear-glass's own _wireServer response style (manual
// res.writeHead/res.end — this file has no pRes/bodyJ helpers to reuse,
// unlike guardian's route modules) instead of guardian's handle(req,res,
// ctx)->boolean + pRes/bodyJ convention.
//
// Namespace changed from /mesh/* to /network/* — "mesh" already names a
// real, different, unrelated system in this codebase (src/mesh/
// agent-mesh.js, the real AM1 per-agent intent-contract mesh) and reusing
// the word here would be confusing in exactly the way §10.3 (don't reuse
// a name for two different things) warns against, even though there was
// no literal route collision (checked, none existed).
//
// Routes:
//   /network/snr/*      — SNR Filter        (network/network-snr-filter.js)
//   /network/keys/*     — Key Manager       (network/key-manager.js)
//   /network/hosts/*    — Host Rotation     (network/host-rotation.js)
//   /network/ports/*    — Port Registry     (network/port-registry.js)
//   /network/canvas/*   — Canvas Persistence(network/canvas-persistence.js)
//   /network/crypto/*   — Crypto Engine health
//   /network/modules     — combined status of every network module

const net = require('./install.js');

/**
 * handle(req, res, { method, url, body }) -> boolean (true if handled).
 * `body` is the already-parsed JSON object clear-glass's _wireServer
 * parses once up front for every request (see main/index.js) — passed
 * through here rather than re-read, matching how every other delegated
 * concern in that file already receives it.
 */
function handle(req, res, { method, url, body }) {
  if (!url.pathname.startsWith('/network/') && url.pathname !== '/network') return false;
  if (!net.installed) return false; // network subsystem not wired at boot — fall through, don't 500

  const parts = url.pathname.slice('/network/'.length).split('/').filter(Boolean);
  const first = parts[0];

  const respond = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };

  const run = async () => {
    if (first === 'snr' && net.snr) return net.snr.bridgeRoute(parts.slice(1), method, body, req);
    if (first === 'keys' && net.keys) return net.keys.bridgeRoute(parts.slice(1), method, body, req);
    if (first === 'hosts' && net.hosts) return net.hosts.bridgeRoute(parts.slice(1), method, body, req);
    if (first === 'ports' && net.ports) return net.ports.bridgeRoute(parts.slice(1), method, body, req);

    if (first === 'canvas' && net.canvas) {
      // §BUGFIX 2026-09-03, caught by actually running a real end-to-end
      // POST through this exact dispatch path (not assumed correct from
      // reading route()/handle() in isolation): canvas-persistence.js's
      // own handle(req,res,parts,method,u) checks `parts[0] !== 'canvas'`
      // internally (matching route()'s own identical check) — it expects
      // the UNSLICED parts array, 'canvas' still at [0]. Slicing it off
      // here before calling handle() meant parts[0] was always the real
      // sub-route name ('nodes', 'state', ...) instead of 'canvas', so
      // handle()'s own guard always failed and returned null — EVERY
      // real /network/canvas/* request 404'd via this path, silently,
      // since the move (and before it: guardian/routes/mesh.js had the
      // exact same bug, carried over from the original BrainOS port,
      // never caught because nothing exercised this path end-to-end
      // until now). Real fix: pass parts through unchanged.
      //
      // Second real bug, same root cause (never exercised end-to-end):
      // canvas-persistence.js's handle() used to call readBody(req)
      // itself — but this file's own `body` above is ALREADY the parsed
      // result of consuming req's stream (main/index.js's _wireServer
      // reads it once, up front, for every route). By the time handle()
      // reached its own readBody(req) call, the stream had already fired
      // 'end' — readBody() would await a 'data'/'end' pair that already
      // happened, and hang forever. Real fix: pass the already-parsed
      // body through instead of re-reading req.
      const handled = await net.canvas.handle(req, res, parts, method, url, body);
      return handled === true ? undefined /* already responded */ : null;
    }

    if (first === 'crypto') {
      if (!net.engine) return { ok: false, error: 'crypto-engine not loaded' };
      if (parts[1] === 'health' || !parts[1]) return net.engine.health();
      return null;
    }

    if (first === 'modules' || !first) {
      return {
        ok: true,
        modules: {
          snr:    net.snr    ? { ok: true, rules: net.snr.size, ...net.snr.stats() }   : { ok: false },
          keys:   net.keys   ? { ok: true, ...net.keys.stats() }                        : { ok: false },
          hosts:  net.hosts  ? { ok: true, ...net.hosts.stats() }                       : { ok: false },
          ports:  net.ports  ? { ok: true, ...net.ports.stats() }                       : { ok: false },
          engine: net.engine ? { ok: true, ...net.engine.health() }                     : { ok: false },
          canvas: net.canvas ? { ok: true, ...net.canvas.watchdog() }                   : { ok: false },
        },
      };
    }

    return null;
  };

  run().then(result => {
    if (result === undefined) return; // canvas branch already wrote the response
    if (result === null) { respond(404, { ok: false, error: `no network route for /network/${parts.join('/')}` }); return; }
    respond(200, result);
  }).catch(err => {
    respond(500, { ok: false, error: err.message });
  });

  return true;
}

module.exports = { handle };
