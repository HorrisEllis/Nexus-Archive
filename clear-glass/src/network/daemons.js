'use strict';
// clear-glass/src/network/daemons.js — optional standalone network
// daemons.
// UUID: cg-network-daemons-v1-0000-2026-0903-001
//
// §RELOCATED 2026-09-03 from mesh/daemons.js (nexus-mesh-daemons-v1) —
// same real reasoning as before the move: dns-server.js, ddns.js,
// reverse-proxy.js, and firewall.js each bind a real port or socket, and
// that's still an explicit, opt-in deployment decision, not something
// clear-glass's own Electron main process should silently do on every
// launch. This file is that explicit, opt-in way to start any of them,
// run separately from clear-glass itself:
//
//   node src/network/daemons.js dns       # starts BrainOSDNS on config.DNS_PORT
//   node src/network/daemons.js proxy     # starts ReverseProxy on config.PROXY_PORT
//   node src/network/daemons.js firewall  # loads FirewallEngine, prints rule count
//   node src/network/daemons.js ddns      # runs one DDNS update check and exits
//
// None of these are wired to clear-glass's own bus by default when run
// this way (they're separate processes).

const config = require('./config');

const which = process.argv[2];
const dataDir = config.DATA_DIR;

function log(...args) { console.log('[network/daemons]', ...args); }

async function main() {
  if (which === 'dns') {
    const { BrainOSDNS } = require('./dns-server.js');
    const dns = new BrainOSDNS({ port: config.DNS_PORT, dataDir });
    await dns.start();
    log(`DNS server listening on :${config.DNS_PORT} (data: ${dataDir})`);
    return;
  }
  if (which === 'proxy') {
    const { ReverseProxy } = require('./reverse-proxy.js');
    const proxy = new ReverseProxy({ port: config.PROXY_PORT, dataDir });
    await proxy.start();
    log(`Reverse proxy listening on :${config.PROXY_PORT} (data: ${dataDir})`);
    return;
  }
  if (which === 'firewall') {
    const { FirewallEngine } = require('./firewall.js');
    const fw = new FirewallEngine({ dataDir });
    log(`Firewall loaded — ${fw._rules?.length ?? 0} rules (data: ${dataDir})`);
    return;
  }
  if (which === 'ddns') {
    const { DDNSClient, getPublicIP } = require('./ddns.js');
    const ddns = new DDNSClient({ dataDir });
    const ip = await getPublicIP();
    log('Public IP:', ip);
    const result = await ddns.check();
    log('DDNS check result:', result);
    return;
  }
  console.error('Usage: node src/network/daemons.js <dns|proxy|firewall|ddns>');
  process.exit(1);
}

if (require.main === module) main().catch(e => { console.error('[network/daemons] fatal:', e.message); process.exit(1); });

module.exports = { main };
