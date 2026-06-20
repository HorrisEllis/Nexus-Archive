'use strict';
// ── autopilot.js — NEXUS Process Supervisor ─────────────────────────────────
// UUID: nexus-autopilot-v1-0000-4000-0000-000000000001
//
// §AUTOPILOT-01: everything in cortex/boot.js's organs.init phase (RAID,
// healer, gap-loop, escalation) heals problems *inside* a running process.
// None of it helps if the process itself dies — and `npm run start:all` runs
// every kernel under `concurrently --kill-others-on-fail`, which means one
// crashed process takes the entire system down with it. That's the opposite
// of self-healing; it's a single point of failure wired to a tripwire.
//
// This replaces that. Each kernel is its own child_process. A crash is
// logged, the *other* kernels are left running, and the dead one is
// restarted with exponential backoff. A circuit breaker stops a process that
// won't stay up (config error, missing dependency) from crash-looping
// forever — it's marked DOWN, reported clearly, and left for a human or the
// forge pipeline, instead of spinning.
//
// §1.2 NOTHING_SILENT — every crash, restart, and circuit-trip is logged to
// both stdout and an append-only file, so this has its own ledger even if
// every other ledger in the system is the thing that's down.
//
// Usage:
//   node autopilot.js                 — boots the default kernel set
//   node autopilot.js --only=cortex,guardian
//   node autopilot.js --status-port=7799
//
// npm:
//   "autopilot": "node autopilot.js"

const { spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');
const http = require('http');

const ROOT     = __dirname;
const LOG_DIR  = path.join(ROOT, 'data', 'autopilot');
const LOG_FILE = path.join(LOG_DIR, 'autopilot.log');
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch(_) {}

// ── Kernel set — mirrors package.json's start:all, single source of truth ────
const ALL_KERNELS = [
  // §FIX 2026-06-20: orchestrator.js normally boots bridge/cortex/guardian/
  // idearium/architect/diagnostic itself via _bootSystems(). Autopilot is
  // ALSO spawning all of those as siblings below — without this env var,
  // both copies fight over the same ports (3748, 7820, 3747, 7825, 4800...)
  // and every one but the first to bind throws EADDRINUSE. NEXUS_SUPERVISED
  // tells orchestrator.js to skip its internal boot and just be the HTTP/UI
  // front end — autopilot owns spawning every sub-system instead.
  { name: 'orchestrator', cmd: 'node', args: ['orchestrator.js'], env: { NEXUS_SUPERVISED: '1' } },
  // §FIX 2026-06-20: bridge/server.js only exports createBridgeServer() — it
  // has no bootstrap code and never calls .start(), so running it directly
  // loads, does nothing, and exits 0 immediately. bridge/index.js is the
  // actual entrypoint: it boots via BootSequence and calls server.start().
  { name: 'bridge',       cmd: 'node', args: ['bridge/index.js'] },
  { name: 'cortex',       cmd: 'node', args: ['cortex/boot.js'] },
  { name: 'guardian',     cmd: 'node', args: ['guardian/server.js'] },
  { name: 'idearium',     cmd: 'node', args: ['idearium/api/index.js'] },
  { name: 'architect',    cmd: 'node', args: ['architect/service.js'] },
  { name: 'diagnostic',   cmd: 'node', args: ['service/nexus-diagnostic.js'] },
];

// ── Restart policy ────────────────────────────────────────────────────────────
const BACKOFF_BASE_MS   = 1000;
const BACKOFF_MAX_MS    = 30000;
const STABLE_MS         = 60000;   // alive this long → backoff resets to base
const CIRCUIT_MAX_CRASHES = 6;     // crashes within window → trip the breaker
const CIRCUIT_WINDOW_MS   = 5 * 60 * 1000;

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const onlyArg = argv.find(a => a.startsWith('--only='));
const statusArg = argv.find(a => a.startsWith('--status-port='));
const ONLY_NAMES = onlyArg ? new Set(onlyArg.split('=')[1].split(',').map(s => s.trim())) : null;
const DEFAULT_STATUS_PORT = 7799;
let STATUS_PORT;
if (statusArg) {
  STATUS_PORT = parseInt(statusArg.split('=')[1]);
} else if (process.env.AUTOPILOT_STATUS_PORT !== undefined) {
  // Explicit env var wins even if it's "0" (opt-out) — `|| DEFAULT` would
  // silently override 0 since 0 is falsy, defeating the opt-out.
  STATUS_PORT = parseInt(process.env.AUTOPILOT_STATUS_PORT);
} else {
  STATUS_PORT = DEFAULT_STATUS_PORT;
}
// --status-port=0 or AUTOPILOT_STATUS_PORT=0 disables it (checked via !STATUS_PORT below).

const KERNELS = ALL_KERNELS.filter(k => !ONLY_NAMES || ONLY_NAMES.has(k.name));

const COLORS = ['\x1b[36m','\x1b[35m','\x1b[32m','\x1b[33m','\x1b[34m','\x1b[31m','\x1b[37m'];
const RESET  = '\x1b[0m';

// ── State ─────────────────────────────────────────────────────────────────────
// _state[name] = { proc, status, crashes:[ts,...], restarts, lastExit, downSince, backoffMs, stableTimer }
const _state = {};

function _log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  try { fs.appendFileSync(LOG_FILE, stamped + '\n'); } catch(_) {}
}

function _initState(name) {
  _state[name] = {
    proc: null, status: 'starting', crashes: [], restarts: 0,
    lastExit: null, downSince: null, backoffMs: BACKOFF_BASE_MS, stableTimer: null,
  };
}

function _prune(crashes) {
  const cutoff = Date.now() - CIRCUIT_WINDOW_MS;
  return crashes.filter(ts => ts > cutoff);
}

function _spawnKernel(kernel, color) {
  const s = _state[kernel.name];
  if (s.stableTimer) { clearTimeout(s.stableTimer); s.stableTimer = null; }

  _log(`${color}[${kernel.name}]${RESET} starting — ${kernel.cmd} ${kernel.args.join(' ')}`);

  const proc = spawn(kernel.cmd, kernel.args, {
    cwd: ROOT,
    env: { ...process.env, ...(kernel.env || {}) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  s.proc = proc;
  s.status = 'online';
  s.downSince = null;
  s.sawAddrInUse = false;

  const pipe = (stream, isErr) => {
    stream.on('data', d => {
      const text = d.toString();
      if (isErr && text.includes('EADDRINUSE')) s.sawAddrInUse = true;
      for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        console.log(`${color}[${kernel.name}]${RESET} ${isErr ? '\x1b[31m' : ''}${line}${isErr ? RESET : ''}`);
      }
    });
  };
  pipe(proc.stdout, false);
  pipe(proc.stderr, true);

  // §AUTOPILOT-02: a process that's been up for STABLE_MS is treated as a
  // genuine recovery, not a lucky crash-loop gap — backoff resets to base so
  // a real transient failure later doesn't inherit a maxed-out delay.
  s.stableTimer = setTimeout(() => {
    s.backoffMs = BACKOFF_BASE_MS;
    _log(`${color}[${kernel.name}]${RESET} stable for ${Math.round(STABLE_MS/1000)}s — backoff reset`);
  }, STABLE_MS);
  if (s.stableTimer.unref) s.stableTimer.unref();

  proc.on('exit', (code, signal) => {
    s.proc = null;
    s.lastExit = { code, signal, ts: Date.now() };
    if (s.stableTimer) { clearTimeout(s.stableTimer); s.stableTimer = null; }

    if (s.status === 'stopping') {
      s.status = 'stopped';
      _log(`${color}[${kernel.name}]${RESET} stopped cleanly (autopilot shutdown)`);
      return;
    }

    s.crashes.push(Date.now());
    s.crashes = _prune(s.crashes);
    s.status = 'down';
    s.downSince = Date.now();

    _log(`${color}[${kernel.name}]${RESET} \x1b[31mexited\x1b[0m code=${code} signal=${signal} — crashes in window: ${s.crashes.length}/${CIRCUIT_MAX_CRASHES}`);

    if (s.crashes.length >= CIRCUIT_MAX_CRASHES) {
      s.status = 'circuit_open';
      _log(`${color}[${kernel.name}]${RESET} \x1b[31m§CIRCUIT BREAKER TRIPPED\x1b[0m — ${s.crashes.length} crashes in ${Math.round(CIRCUIT_WINDOW_MS/60000)}min. ` +
           `Not auto-restarting. This needs a human or a forge patch, not another retry. Other kernels keep running.`);
      _writeCircuitGap(kernel.name, s);
      return;
    }

    // §FIX 2026-06-20: a port collision (EADDRINUSE) is almost always caused
    // by an orphaned process from a previous run still holding the port —
    // exponential backoff just burns 5 minutes restarting into the same wall.
    // Trip the breaker on the first sighting with a diagnosis a human can
    // actually act on, instead of waiting for CIRCUIT_MAX_CRASHES retries.
    if (s.sawAddrInUse) {
      s.status = 'circuit_open';
      _log(`${color}[${kernel.name}]${RESET} \x1b[31m§CIRCUIT BREAKER TRIPPED\x1b[0m — port already in use, likely an orphaned process from a ` +
           `previous run still bound to it. Retrying won't free someone else's port. Find and stop it, then restart autopilot. ` +
           `Windows: "Get-Process node | Stop-Process -Force" (kills ALL node processes) or "netstat -ano | findstr :<port>" → "taskkill /PID <pid> /F" for a single one.`);
      _writeCircuitGap(kernel.name, s);
      return;
    }

    s.restarts++;
    const delay = s.backoffMs;
    s.backoffMs = Math.min(s.backoffMs * 2, BACKOFF_MAX_MS);
    _log(`${color}[${kernel.name}]${RESET} restarting in ${Math.round(delay/1000)}s (attempt ${s.restarts})`);
    setTimeout(() => _spawnKernel(kernel, color), delay).unref?.();
  });

  proc.on('error', err => {
    _log(`${color}[${kernel.name}]${RESET} \x1b[31mfailed to spawn:\x1b[0m ${err.message}`);
  });
}

// §AUTOPILOT-03: when a kernel's circuit breaker trips, write a real gap into
// cortex's own gaps table if cortex is reachable — so the self-healing
// pipeline we already wired (RAID/healer/escalation) at least gets a chance
// to see it and dispatch an agent-consult for a forge patch, even though the
// crashing process is one layer below what that pipeline normally watches.
function _writeCircuitGap(name, s) {
  try {
    const { jaaDB, uid } = require('./cortex/memory/jaa-db');
    jaaDB.insert('gaps', {
      uuid: uid(), type: 'kernel_circuit_open', path: name, severity: 'critical',
      body: `Kernel "${name}" crashed ${s.crashes.length} times in ${Math.round(CIRCUIT_WINDOW_MS/60000)}min — ` +
            `autopilot stopped auto-restarting it. lastExit: ${JSON.stringify(s.lastExit)}`,
      status: 'open', source: 'autopilot', causedBy: null, createdAt: Date.now(), attempts: s.restarts, ts: Date.now(),
    });
  } catch(_) {
    // cortex/JAA unreachable (maybe cortex itself is the one that's down) —
    // the appended log file above is still the record of truth.
  }
}

// ── Status surface ────────────────────────────────────────────────────────────
function _statusSnapshot() {
  const out = {};
  for (const [name, s] of Object.entries(_state)) {
    out[name] = {
      status: s.status, restarts: s.restarts,
      crashesInWindow: s.crashes.length, lastExit: s.lastExit,
      downSince: s.downSince, pid: s.proc?.pid || null,
    };
  }
  return out;
}

function _startStatusServer() {
  if (!STATUS_PORT) return;
  const server = http.createServer((req, res) => {
    if (req.url === '/status') {
      const body = JSON.stringify({ ok: true, kernels: _statusSnapshot(), ts: Date.now() }, null, 2);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
      return;
    }
    res.writeHead(404); res.end('not found — try /status');
  });
  server.listen(STATUS_PORT, () => _log(`autopilot status: http://127.0.0.1:${STATUS_PORT}/status`));
}

// ── Boot ──────────────────────────────────────────────────────────────────────
function start() {
  _log(`autopilot starting — supervising: ${KERNELS.map(k => k.name).join(', ')}`);
  KERNELS.forEach((kernel, i) => {
    _initState(kernel.name);
    _spawnKernel(kernel, COLORS[i % COLORS.length]);
  });
  _startStatusServer();
}

// ── Graceful shutdown — kill children once, don't let exit handlers restart them ─
function _shutdown(signal) {
  _log(`autopilot received ${signal} — stopping all kernels`);
  for (const s of Object.values(_state)) {
    s.status = 'stopping';
    if (s.proc) { try { s.proc.kill('SIGTERM'); } catch(_) {} }
  }
  setTimeout(() => process.exit(0), 2000);
}
process.on('SIGINT',  () => _shutdown('SIGINT'));
process.on('SIGTERM', () => _shutdown('SIGTERM'));

if (require.main === module) start();

module.exports = { start, _statusSnapshot, KERNELS };
