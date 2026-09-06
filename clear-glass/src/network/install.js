'use strict';
// clear-glass/src/network/install.js — wires the network modules together.
// UUID: cg-network-install-v1-0000-2026-0903-001
//
// §RELOCATED 2026-09-03 from mesh/install.js (nexus-mesh-install-v1) —
// James: "DNS/firewall/crypto/host-rotation/reverse-proxy maybe recycle
// to clearglass." Same real modules, same real wiring; only the bus
// changed — this now connects to clear-glass's own real bus
// (src/core/bus.js's SISO Stream) instead of guardian's, since these are
// genuinely browser/network-adjacent concerns and clear-glass is the app
// that actually has a network surface to protect (DNS, firewall, a
// reverse proxy) — guardian never had a real reason to own them beyond
// being where the original BrainOS port first landed.
//
// All 10 real files moved together, not a partial 5 (see clear-glass/
// src/network/config.js's header for why): none of them require() each
// other directly (checked — every real dependency, like key-manager's
// use of a crypto engine, is constructor DI, not a file-level require),
// so moving fewer than all of them would have created a needless
// cross-workspace require for zero correctness benefit.
//
// §NOT PORTED (carried over from the original mesh/README.md finding,
// still true here) — BrainOS's own agent-factory/agent-registry/intent-
// parser/intent-router/intent-scoring/routing-engine/workflow-engine/
// account-manager/delta/router/adapters are BrainOS's own provider/agent
// orchestration layer. Nexus already has a larger, more developed
// equivalent (lib/intent-classifier.js, guardian/lib/jobs.js, the RAID
// pipeline, orchestrator/) — porting BrainOS's version here would still
// mean two competing orchestration layers, same as before the move.

const fs   = require('fs');
const path = require('path');
const config = require('./config');
const { Event } = require('../core/bus');

let _snr      = null;
let _keys     = null;
let _hosts    = null;
let _ports    = null;
let _canvas   = null;
let _engine   = null;
let _installed = false;
let _bus      = () => {};

function loadModule(name, modulePath) {
  try {
    return require(modulePath);
  } catch (e) {
    console.error(`[network/install] Failed to load ${name}: ${e.message}`);
    return null;
  }
}

// ─── INSTALL ────────────────────────────────────────────────────────────────
// install(bus, opts?) — bus is clear-glass's real Stream instance (its
// .emit(Event) is what every module's connectBus() gets bound to).
// §FIX 2026-09-03, found by actually running this, not by review: unlike
// guardian's SISOStream (bus.emit(type, data), plain args), clear-glass's
// real Stream.emit() requires an actual Event instance (siso/index.js's
// own §1.2: "emit() requires an Event instance") — passing (type, data)
// straight through, as the original guardian-side mesh/install.js did,
// throws immediately on the very first event any network module emits.
// Every bus.emit call below now wraps its payload in a real `new Event`.
function install(bus, opts = {}) {
  if (_installed) return module.exports;
  _installed = true;
  _bus = (type, data, level) => { try { bus.emit(new Event(`network.${type}`, { ...data, level })); } catch (_) {} };

  const dataDir = opts.dataDir || config.DATA_DIR;
  fs.mkdirSync(dataDir, { recursive: true });

  // ── Crypto Engine (no persistence, just primitives) ───────────────────────
  const CryptoModule = loadModule('crypto-engine', path.join(__dirname, 'crypto-engine.js'));
  if (CryptoModule) {
    _engine = CryptoModule.CryptoEngine ? new CryptoModule.CryptoEngine() : CryptoModule;
    const h = _engine.health?.();
    if (!h?.allOk) console.warn('[network/install] CryptoEngine partial:', h?.checks);
  }

  // ── SNR Filter (network-scoped — distinct from cortex/core/raid/
  //    snr-filter.js, which gates RAID call resolution; this one is a
  //    general rule/blocklist gate: ublock/DNS-firewall/AV-list imports,
  //    used by the DNS/firewall daemons below) ───────────────────────────
  const SNRFilter = loadModule('network-snr-filter', path.join(__dirname, 'network-snr-filter.js'));
  if (SNRFilter) {
    _snr = new SNRFilter({
      name:    'Network SNR Gate',
      persist: path.join(dataDir, 'snr-rules.json'),
      logFile: path.join(dataDir, 'snr-decisions.jsonl'),
    });
    _snr.connectBus(_bus);
    if (SNRFilter.PRESETS?.security) SNRFilter.PRESETS.security(_snr);
  }

  // ── Key Manager ─────────────────────────────────────────────────────────────
  const KeyManager = loadModule('key-manager', path.join(__dirname, 'key-manager.js'));
  if (KeyManager) {
    _keys = new KeyManager({
      name:         'Network Key Manager',
      persist:      path.join(dataDir, 'canvas-keys.json'),
      cryptoEngine: _engine || null,
      intervals:    config.KEY_INTERVALS,
    });
    _keys.connectBus(_bus);
    _keys.startAllSchedules();
  }

  // ── Host Rotation ────────────────────────────────────────────────────────────
  const HostRotation = loadModule('host-rotation', path.join(__dirname, 'host-rotation.js'));
  if (HostRotation) {
    _hosts = new HostRotation({
      name:    'Network Host Rotation',
      persist: path.join(dataDir, 'canvas-hosts.json'),
    });
    _hosts.connectBus(_bus);
  }

  // ── Port Registry ────────────────────────────────────────────────────────────
  const PortRegistry = loadModule('port-registry', path.join(__dirname, 'port-registry.js'));
  if (PortRegistry) {
    _ports = new PortRegistry({
      name:     'Network Port Registry',
      persist:  path.join(dataDir, 'canvas-ports.json'),
      defaults: true,
    });
    _ports.connectBus(_bus);
  }

  // ── Canvas Persistence ────────────────────────────────────────────────────────
  const CanvasPersist = loadModule('canvas-persistence', path.join(__dirname, 'canvas-persistence.js'));
  if (CanvasPersist) {
    CanvasPersist.install(dataDir, _bus, opts.saveCfg || (() => {}));
    _canvas = CanvasPersist;
  }

  bus.emit(new Event('network.ready', {
    snr: !!_snr, keys: !!_keys, hosts: !!_hosts, ports: !!_ports,
    canvas: !!_canvas, engine: !!_engine,
  }));

  return module.exports;
}

module.exports = {
  install,
  get snr()    { return _snr;    },
  get keys()   { return _keys;   },
  get hosts()  { return _hosts;  },
  get ports()  { return _ports;  },
  get canvas() { return _canvas; },
  get engine() { return _engine; },
  get installed() { return _installed; },
  VERSION: '1.0.0',
  UUID:    'cg-network-install-v1-0000-2026-0903-001',
};
