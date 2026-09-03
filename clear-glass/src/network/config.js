'use strict';
// clear-glass/src/network/config.js — config for clear-glass's network
// subsystem (DNS/firewall/reverse-proxy/DDNS/crypto/keys/hosts/ports/
// canvas-persistence/SNR-filter).
// UUID: cg-network-config-v1-0000-2026-0903-001
//
// §RELOCATED 2026-09-03 — James: "DNS/firewall/crypto/host-rotation/
// reverse-proxy maybe recycle to clearglass." Originally ported into a
// standalone top-level mesh/ next to guardian (see mesh/README.md's
// historical record of the BrainOS port). Moved here as one whole unit
// (all 10 real mesh/lib/*.js files, not a partial split) after confirming
// none of them require() each other directly — every real cross-module
// dependency (e.g. key-manager's use of a crypto engine) is constructor
// dependency-injection, not a file-level require — so there was no
// correctness reason to leave any of them behind, and moving all of them
// together keeps one real dependency graph in one process instead of
// straddling guardian and clear-glass with a cross-workspace require.
// Data now lives under clear-glass's own user-data convention (matching
// downloads/store.js, history, passwords, etc.) instead of nexus's
// top-level data/ dir — this subsystem is clear-glass's own now, not a
// guardian-adjacent one.

const path = require('path');

module.exports = {
  DATA_DIR: path.join(
    process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'network'
  ),

  // Key rotation intervals — carried over unchanged from the original port.
  KEY_INTERVALS: {
    session: 60 * 60 * 1000,       // 1 hour
    e2e:     15 * 60 * 1000,       // 15 min
    gate:    24 * 60 * 60 * 1000,  // 24 hours
    turn:    24 * 60 * 60 * 1000,  // 24 hours
  },

  // Optional standalone network daemons (dns-server, reverse-proxy,
  // firewall, ddns). None of these are started by clear-glass's own boot
  // either (same reasoning as when this lived under guardian) — they bind
  // real ports/sockets, a deployment decision, not something to silently
  // start inside an Electron app's main process. See daemons.js to start
  // any of them explicitly.
  DNS_PORT:   53535,
  PROXY_PORT: 8088,
};
