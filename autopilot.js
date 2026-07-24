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

// §RESOURCE GOVERNANCE 2026-07-10 — see _spawnKernel for the crash this fixes.
// 1024MB per Node child: twelve of them is ~12GB worst case rather than the
// ~48GB twelve uncapped V8 heaps could theoretically claim. Override per kernel
// with `maxOldSpaceMB` for a system that genuinely needs more (cortex holds the
// memory tables; guardian holds job state).
const DEFAULT_MAX_OLD_SPACE_MB = Number(process.env.NEXUS_MAX_OLD_SPACE_MB || 1024);
const MEM_BACKOFF_MS = 15000;
const { ResourceMonitor } = require('./lib/resource-monitor');
const _resourceMonitor = new ResourceMonitor({ name: 'autopilot', intervalMs: 15000 }).start();
const LOG_DIR  = path.join(ROOT, 'data', 'autopilot');
const LOG_FILE = path.join(LOG_DIR, 'autopilot.log');
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch(_) {}

// ── Kernel set — mirrors package.json's start:all, single source of truth ────
// §FIXED 2026-07-16 — root cause of a live crash loop: "clear-glass ...
// The system cannot find the path specified." The npm workspaces change
// (added 2026-07-15 so `npm install` at root also installs clear-glass's
// deps) can hoist `electron` to the ROOT node_modules/.bin instead of
// clear-glass's own — npm's hoisting decision depends on whether anything
// else in the workspace conflicts with electron's version, which nothing
// currently does, so it hoisted. The clear-glass kernel below was hardcoded
// to the pre-workspaces layout (clear-glass/node_modules/.bin/electron.cmd)
// only, from the 2026-07-02 bugfix — that fix was correct for the layout
// that existed then, but never anticipated the binary moving. Checking both
// real locations on disk at boot, instead of assuming one, means this
// doesn't silently break again the next time `npm install`'s hoisting
// decision changes (e.g. once clear-glass gains a dependency that conflicts
// with something at root and stops being hoistable).
const _ELECTRON_BIN     = process.platform === 'win32' ? 'electron.cmd' : 'electron';
const _ELECTRON_LOCAL   = path.join(ROOT, 'clear-glass', 'node_modules', '.bin', _ELECTRON_BIN);
const _ELECTRON_HOISTED = path.join(ROOT, 'node_modules', '.bin', _ELECTRON_BIN);
const _ELECTRON_CMD = fs.existsSync(_ELECTRON_LOCAL)
  ? path.join('node_modules', '.bin', _ELECTRON_BIN)  // relative — resolved against clear-glass's cwd below, matches the 2026-07-02 fix's join logic
  : _ELECTRON_HOISTED;                                 // absolute — root-hoisted install; resolvedCmd in _spawnKernel passes absolute paths through unchanged

const ALL_KERNELS = [
  // §FIX 2026-06-20: orchestrator.js normally boots bridge/cortex/guardian/
  // idearium/architect/diagnostic itself via _bootSystems(). Autopilot is
  // ALSO spawning all of those as siblings below — without this env var,
  // both copies fight over the same ports (3748, 7820, 3747, 7825, 4800...)
  // and every one but the first to bind throws EADDRINUSE. NEXUS_SUPERVISED
  // tells orchestrator.js to skip its internal boot and just be the HTTP/UI
  // front end — autopilot owns spawning every sub-system instead.
  // §BOOT PHASES 2026-07-20 — derived from real boot-log evidence, not
  // guessed. Every symptom in the 17:55 and 18:04 live logs traced to all
  // 12 kernels spawning in the same instant:
  //   - orchestrator's gap-relay hit ECONNREFUSED on guardian:7820 and
  //     diagnostic:7825 (spawned same tick, not yet listening)
  //   - contract poller logged contract.unreachable for systems mid-boot
  //   - six processes parsed the ENTIRE shared JAA store simultaneously —
  //     the memory spike that OOM-killed the gemini renderer at 17:56
  // Phase N+1 does not begin until every phase-N kernel passes its real
  // /health gate (or its timeout expires LOUDLY — a slow system delays
  // boot, it must never deadlock it, §1.2). Same _pollHealth discipline
  // the on-demand path has used since 2026-07-15, applied to the whole
  // sequence. Phasing also serializes the JAA load spikes instead of
  // stacking all of them.
  //   Phase 1: orchestrator — registration authority (§AXIOM: everyone
  //            registers with it) + the bus + gap-relay live here
  //   Phase 2: guardian + diagnostic (gap-relay's two dial targets),
  //            bridge (trust relay), cortex (memory core)
  //   Phase 3: the app layer — everything that registers and serves
  //   Phase 4: emerge — reports to copilot:3750, so copilot must be up
  //   clear-glass: onDemand, unchanged — no phase, dormant until requested
  { name: 'orchestrator', cmd: 'node', args: ['orchestrator.js'], env: { NEXUS_SUPERVISED: '1' },
    phase: 1, healthUrl: 'http://127.0.0.1:9000/health' },
  // §FIX 2026-06-20: bridge/server.js only exports createBridgeServer() — it
  // has no bootstrap code and never calls .start(), so running it directly
  // loads, does nothing, and exits 0 immediately. bridge/index.js is the
  // actual entrypoint: it boots via BootSequence and calls server.start().
  { name: 'bridge',       cmd: 'node', args: ['bridge/index.js'],
    phase: 2, healthUrl: 'http://127.0.0.1:9999/health' },
  { name: 'cortex',       cmd: 'node', args: ['cortex/boot.js'],
    phase: 2, healthUrl: 'http://127.0.0.1:3748/health' },
  { name: 'guardian',     cmd: 'node', args: ['guardian/server.js'],
    phase: 2, healthUrl: 'http://127.0.0.1:7820/health' },
  { name: 'idearium',     cmd: 'node', args: ['idearium/api/index.js'],
    phase: 3, healthUrl: 'http://127.0.0.1:4800/health' },
  { name: 'architect',    cmd: 'node', args: ['architect/service.js'],
    phase: 3, healthUrl: 'http://127.0.0.1:3747/health' },
  { name: 'diagnostic',   cmd: 'node', args: ['service/nexus-diagnostic.js'],
    phase: 2, healthUrl: 'http://127.0.0.1:7825/health' },
  { name: 'eravos',       cmd: 'node', args: ['eravos/server.js'],
    phase: 3, healthUrl: 'http://127.0.0.1:3751/health' },
  { name: 'ollama-bridge',cmd: 'node', args: ['ollama/server.js'], optional: true,
    phase: 3, healthUrl: 'http://127.0.0.1:3749/health' },
  { name: 'copilot',      cmd: 'node', args: ['copilot/server.js'], optional: true,
    phase: 3, healthUrl: 'http://127.0.0.1:3750/health' },
  // §NEW 2026-07-11 — emerge/consumer.js. Emerge itself is a compiler
  // LIBRARY (no http.createServer anywhere under emerge/, confirmed by
  // grep) — this is the process that was missing entirely, not a service
  // that existed and wasn't supervised. Without it, every contract
  // copilot/module-builder.js dispatches to emerge/input/ sits there
  // forever; the 'module-build-dispatched-then-accepted' expectation
  // (copilot/lib/expectation-watcher.js) exists specifically to make that
  // failure loud instead of silent. optional: true — a build request
  // that can't be picked up yet shouldn't trip the whole system's circuit
  // breaker, same reasoning as copilot/loom above.
  // phase 4 — reports to copilot:3750, so copilot (phase 3) must be up.
  // No healthUrl: emerge is a file-watcher with no HTTP server (confirmed
  // above) — process-alive is the only honest readiness signal it has.
  { name: 'emerge',       cmd: 'node', args: ['emerge/consumer.js'], optional: true, phase: 4 },
  { name: 'loom',         cmd: 'node', args: ['loom/server.js'],    optional: true,
    phase: 3, healthUrl: 'http://127.0.0.1:3752/health' },
  // Clear Glass sovereign browser — Electron + inline wire bridge.
  // Registers itself AND ErosmancerOS with the orchestrator on boot.
  // optional: true — missing Electron install won't trip the circuit breaker.
  // One-time: run `npm install` inside clear-glass/ before first boot.
  // Windows needs electron.cmd; Unix uses the symlink — detect at runtime.
  { name: 'clear-glass',
    cmd: _ELECTRON_CMD,
    args: ['.'], cwd: 'clear-glass', optional: true,
    // §BUILT 2026-07-15 — "cos as a kind of PID service, only running
    // what's needed." Clear Glass is the heaviest single process in the
    // stack (Electron + however many provider webviews) and the clearest
    // real case of "not needed most of the time" — nobody's controlling
    // a browser unless something is actively using it. onDemand:true
    // means autopilot does NOT auto-spawn this at boot; it stays dormant
    // until a real request needs it (see _requestSpawn/_maybeDespawnIdle
    // below), health-gated the same way orchestrator's own boot sequence
    // already gates every other system ("Verify /health returns
    // ok=true") before anything is allowed to treat it as available.
    onDemand: true,
    healthUrl: 'http://127.0.0.1:7701/health',
    idleTimeoutMs: 10 * 60 * 1000, // 10 min with no activity -> despawn
    // §GAP CLOSED 2026-07-09 (from a live console log) — clear-glass logged
    // "[ProviderHost] no guardianDir configured … userscript loading will
    // fail until configured", then "[Userscripts] 0 scripts loaded".
    // Consequence: the 4 provider tabs boot, but none ever connects to
    // Guardian's NCP /channel, so guardian has no answerer and every ask
    // fails fast. clear-glass/src/main/index.js deliberately removed its
    // hardcoded '../../../guardian' fallback ("not supposed to be baked
    // in") and requires GUARDIAN_DIR explicitly — but nothing set it. The
    // supervisor knows where guardian lives; that is the right place to say
    // so. Absolute, because clear-glass runs with cwd='clear-glass'.
    env: { GUARDIAN_DIR: path.join(ROOT, 'guardian') },
    // §CRITICAL fix 2026-06-30 — root cause of a real 6-crash circuit-
    // breaker trip, traced from a live boot log: requestSingleInstanceLock()
    // was failing on every restart because Windows hadn't finished
    // releasing the previous Electron instance's lock file before
    // autopilot's 1s/2s/4s backoff fired the next attempt. Electron/OS-
    // level process teardown (especially on Windows) is measurably slower
    // than a plain `node` process exiting — the uniform BACKOFF_BASE_MS=1000
    // that works fine for every other kernel here was too aggressive
    // specifically for this one. minRestartDelay enforces a floor
    // independent of the exponential backoff curve.
    minRestartDelay: 3000 },
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

// §BUILT 2026-07-24 — clear-glass needs to know the REAL status port to call
// POST /touch/clear-glass (see the idle-vs-open fix below), and it can't just
// assume DEFAULT_STATUS_PORT: --status-port= or AUTOPILOT_STATUS_PORT could
// have overridden it above. ALL_KERNELS is a plain array literal defined
// before STATUS_PORT is resolved, so this has to happen here, not inline in
// that literal. STATUS_PORT === 0 means the status server is disabled
// entirely — pass 0 through so clear-glass knows not to bother calling it,
// rather than silently retrying against a server that was never started.
{
  const cg = ALL_KERNELS.find(k => k.name === 'clear-glass');
  if (cg) cg.env = { ...(cg.env || {}), AUTOPILOT_STATUS_PORT: String(STATUS_PORT) };
}

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
    lastActivity: null, // §BUILT 2026-07-15 — on-demand idle tracking
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

  const path = require('path');
  const resolvedCwd = kernel.cwd ? path.join(ROOT, kernel.cwd) : ROOT;
  // §BUGFIX 2026-07-02: a relative kernel.cmd (e.g. clear-glass's
  // 'node_modules\.bin\electron.cmd') was being looked up against
  // autopilot.js's own process.cwd() (the repo root), not against the
  // `cwd` option below — that option only sets the CHILD's working
  // directory once it starts, it does not change where Node/Windows
  // looks for the executable itself. That's the exact cause of "The
  // system cannot find the path specified" — Windows was looking for
  // <repo root>/node_modules/.bin/electron.cmd, which doesn't exist;
  // the real one is at clear-glass/node_modules/.bin/electron.cmd.
  // Resolving to an absolute path here removes the ambiguity entirely.
  const resolvedCmd = (kernel.cwd && !path.isAbsolute(kernel.cmd))
    ? path.join(resolvedCwd, kernel.cmd)
    : kernel.cmd;

  // §CRASH ROOT CAUSE 2026-07-10 — from a live Windows console:
  //     [orchestrator] exited code=3221226505   (0xC0000409, STATUS_STACK_BUFFER_OVERRUN
  //                                              — Node's fatal fast-fail, usually OOM)
  //     Error: spawn UNKNOWN  errno: -4094      (UV_UNKNOWN, on the RESTART)
  // The same command spawned fine seconds earlier, so the path was never wrong:
  // the machine had no memory left to fork into.
  //
  // Measured: this supervisor spawns twelve Node processes and passed NO heap
  // limit to any of them. Each was free to grow to V8's default (~4GB on
  // 64-bit). Add Clear Glass (Electron + four provider webviews) and there is
  // no headroom. Nothing was watching, so the first symptom was a crash.
  //
  // Two changes, both real:
  //   1. Every Node child gets an explicit --max-old-space-size. A process that
  //      exceeds it dies with a clean JS heap OOM naming itself, instead of
  //      taking the machine down and fast-failing with a Windows status code.
  //      Per-kernel override via `kernel.maxOldSpaceMB`.
  //   2. A spawn is gated on real free memory. Restarting into an exhausted
  //      machine is how one crash becomes a crash storm: the spawn fails with
  //      UNKNOWN, the supervisor counts it as a crash, and immediately retries.
  const isNode = /(^|[\\/])node(\.exe)?$/i.test(kernel.cmd);
  const heapMB = kernel.maxOldSpaceMB || DEFAULT_MAX_OLD_SPACE_MB;
  const kernelArgs = isNode && !kernel.args.some(a => String(a).startsWith('--max-old-space-size'))
    ? [`--max-old-space-size=${heapMB}`, ...kernel.args]
    : kernel.args;

  if (!_resourceMonitor.spawnSafe()) {
    const s = _resourceMonitor.current();
    console.error(`[autopilot] REFUSING to spawn ${kernel.name}: only ${(s.system.freeMemPct * 100).toFixed(1)}% memory free. ` +
                  `Spawning now would fail with 'spawn UNKNOWN' and be miscounted as a crash. Retrying in ${MEM_BACKOFF_MS / 1000}s.`);
    // §1.2 — a refusal must re-arm. Neither caller of _spawnKernel inspects the
    // return value, so returning null without rescheduling would leave the
    // kernel permanently dead and silent. Back off long enough for the machine
    // to actually recover rather than hammering a full memory subsystem.
    const t = setTimeout(() => _spawnKernel(kernel, color), MEM_BACKOFF_MS);
    if (t.unref) t.unref();
    return null;
  }

  // §CRASH ROOT CAUSE 2026-07-14 — from a real Windows console: clear-glass
  // crash-looped with "'D:\Backups\Downloads\nexus-merged-0.9.13' is not
  // recognized as an internal or external command." The install directory
  // has a space in its name ("nexus-merged-0.9.13 (1)") — a completely
  // normal thing for a real download folder to have, not a misconfiguration.
  // shell:true is required for .cmd files on Windows (see comment below),
  // but spawn() does NOT auto-quote the command string for you when shell
  // is true — that's the caller's job, and nothing here was doing it. cmd.exe
  // received the unquoted absolute path and split it at the first space,
  // trying to run "D:\Backups\Downloads\nexus-merged-0.9.13" (truncated) as
  // the command. Every kernel using a relative .cmd path (currently just
  // clear-glass) resolves to an absolute path via resolvedCmd above and was
  // equally exposed — this isn't clear-glass-specific, it's anything under
  // shell:true with a space anywhere in the real install path.
  const _needsQuoting = (s) => /\s/.test(s) && !(s.startsWith('"') && s.endsWith('"'));
  const isShell = process.platform === 'win32' && kernel.cmd.endsWith('.cmd');
  const spawnCmd  = isShell && _needsQuoting(resolvedCmd) ? `"${resolvedCmd}"` : resolvedCmd;
  const spawnArgs = isShell ? kernelArgs.map(a => _needsQuoting(String(a)) ? `"${a}"` : a) : kernelArgs;

  const proc = spawn(spawnCmd, spawnArgs, {
    cwd: resolvedCwd,
    env: { ...process.env, ...(kernel.env || {}) },
    stdio: ['ignore', 'pipe', 'pipe'],
    // .cmd files on Windows must run through the shell
    shell: isShell,
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
        // §timestamping fix 2026-06-30 — every console line from a child
        // system now carries [ISO timestamp] [system:entrypoint-file]
        // before the line, not just [system]. Without the timestamp,
        // reconstructing event order across a multi-system log dump
        // (like the screenshot's console output) required guessing —
        // lines from different systems interleave with no way to tell
        // which happened first. Source file makes it traceable to the
        // exact entrypoint per Phase 116's component→file mapping intent.
        const ts = new Date().toISOString();
        const srcFile = kernel.args?.[0] || kernel.name;
        console.log(`[${ts}] ${color}[${kernel.name}:${srcFile}]${RESET} ${isErr ? '\x1b[31m' : ''}${line}${isErr ? RESET : ''}`);
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

    // §FIX 2026-07-24 — an INTENTIONAL stop is not a crash. Two statuses mean
    // "autopilot did this on purpose": 'stopping' (global shutdown) and
    // 'dormant' (idle reaper despawning an on-demand kernel).
    // The idle reaper's deliberate SIGTERM was previously counted as crash 1/6,
    // which triggered an immediate restart that raced the dying Electron's
    // single-instance lock → exit(1) → crash 2/6 … → CIRCUIT BREAKER TRIPPED.
    // The whole clear-glass restart storm came from despawn being misread as
    // failure. (§1.2 — the log said "despawning (on-demand)" and then
    // "crashes in window: 1/6" one line later; the system was lying to itself.)
    if (s.status === 'stopping' || s.status === 'dormant') {
      const wasIdleDespawn = s.status === 'dormant';
      s.status = wasIdleDespawn ? 'dormant' : 'stopped';
      _log(`${color}[${kernel.name}]${RESET} ${wasIdleDespawn
        ? 'despawned cleanly (idle, on-demand — will respawn on request)'
        : 'stopped cleanly (autopilot shutdown)'}`);
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
    // §CRITICAL fix 2026-06-30 — minRestartDelay enforces a floor for
    // kernels whose OS-level process teardown lags the generic exponential
    // backoff (Electron on Windows, specifically — see clear-glass's kernel
    // definition above for the full trace). Math.max with backoffMs so the
    // floor only ever raises the delay, never shortens the normal
    // exponential curve once it's already past the floor.
    const delay = kernel.minRestartDelay ? Math.max(kernel.minRestartDelay, s.backoffMs) : s.backoffMs;
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
    // §BUILT 2026-07-15 — the real on-demand trigger surface. A caller
    // that needs an on-demand kernel (e.g. guardian's browser dispatch
    // needing clear-glass) hits this instead of assuming the process is
    // already up.
    const spawnMatch = req.url.match(/^\/spawn\/([a-zA-Z0-9-]+)$/);
    if (spawnMatch && req.method === 'POST') {
      requestSpawn(spawnMatch[1]).then(result => {
        res.writeHead(result.ok ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
      return;
    }
    const touchMatch = req.url.match(/^\/touch\/([a-zA-Z0-9-]+)$/);
    if (touchMatch && req.method === 'POST') {
      touchActivity(touchMatch[1]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.writeHead(404); res.end('not found — try /status, POST /spawn/:name, POST /touch/:name');
  });
  server.listen(STATUS_PORT, () => _log(`autopilot status: http://127.0.0.1:${STATUS_PORT}/status`));
}

// ── On-demand: spawn-request, health-gate, idle-despawn ────────────────────
// §BUILT 2026-07-15 — "cos as a kind of PID service, only running what's
// needed." Reuses _spawnKernel exactly as-is (same memory-safety checks,
// same Windows path quoting, same heap limits — no second, divergent
// spawn implementation) and adds the one real thing that was missing:
// gating readiness on an actual health check instead of a fixed timer,
// and tearing a process down again once nothing needs it.

let _jaaDB = null;
function _getJaaDB() {
  if (_jaaDB) return _jaaDB;
  try { ({ jaaDB: _jaaDB } = require('./cortex/memory/jaa-db.js')); }
  catch (e) { console.warn(`[autopilot] jaaDB unavailable — on-demand events will log to console only: ${e.message}`); _jaaDB = false; }
  return _jaaDB;
}

// §THE EVENT-TRACKING PIECE — "all the events are supposed to be tracked,
// using the meta system." Every real spawn/gate/despawn transition below
// writes a real event_log row with a causedBy chain (request -> spawn ->
// gate result), the same shape meta/cfr/graph.js's CausalGraph already
// ingests everywhere else in this codebase — not a new, parallel logging
// path, the same one.
function _logOnDemandEvent(type, payload, causedBy) {
  const db = _getJaaDB();
  const uuid = require('crypto').randomUUID();
  if (db) {
    try { db.insert('event_log', { uuid, type, ts: Date.now(), causedBy: causedBy || undefined, ...payload }); }
    catch (e) { console.warn(`[autopilot] could not log ${type}: ${e.message}`); }
  }
  return uuid;
}

function _pollHealth(url, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      const req = http.request(url, { timeout: 3000 }, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) { resolve(true); return; }
          // Non-2xx while booting means "not ready yet", not "failed" —
          // retry until the timeout, same as a connection error. The old
          // behavior resolved false on the FIRST 503 and never retried.
          if (Date.now() - started > timeoutMs) { resolve(false); return; }
          setTimeout(tick, 500);
        });
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) { resolve(false); return; }
        setTimeout(tick, 500);
      });
      req.on('timeout', () => { req.destroy(); if (Date.now() - started > timeoutMs) resolve(false); else setTimeout(tick, 500); });
      req.end();
    };
    tick();
  });
}

/**
 * requestSpawn(name) — the real on-demand entry point. Idempotent: a
 * kernel that's already running (or already spawning) resolves
 * immediately once healthy, rather than double-spawning.
 * Returns { ok, alreadyRunning?, error? }.
 */
async function requestSpawn(name) {
  const kernel = KERNELS.find(k => k.name === name);
  if (!kernel) return { ok: false, error: `no such kernel: ${name}` };
  if (!kernel.onDemand) return { ok: false, error: `${name} is not an on-demand kernel — it's already always-on` };

  const s = _state[name];
  s.lastActivity = Date.now();
  // §FIX 2026-07-20 — guard was `running`/`stable` only. A clear-glass caught
  // mid-lifecycle is `starting` (spawn in flight) or `online` (alive but not
  // yet marked stable). A second requestSpawn in either state launched a
  // SECOND Electron, and the two raced requestSingleInstanceLock() — the exact
  // two-genuine-instances crash in the 2026-07-20 log (distinct from the
  // lock-RELEASE race minRestartDelay already handles). Any state where a
  // process exists or is being launched must short-circuit, not re-spawn.
  const ALIVE_OR_SPAWNING = new Set(['starting', 'online', 'running', 'stable']);
  if (ALIVE_OR_SPAWNING.has(s.status)) {
    return { ok: true, alreadyRunning: true, state: s.status };
  }

  const requestEvt = _logOnDemandEvent('autopilot.spawn.requested', { kernel: name });
  const idx = KERNELS.indexOf(kernel);
  _spawnKernel(kernel, COLORS[idx % COLORS.length]);
  s.status = 'starting';

  if (!kernel.healthUrl) {
    // No real health check configured — honest: can't gate on something
    // that doesn't exist. Treat as spawned, not verified.
    _logOnDemandEvent('autopilot.spawn.unverified', { kernel: name, reason: 'no healthUrl configured' }, requestEvt);
    return { ok: true, verified: false };
  }

  const healthy = await _pollHealth(kernel.healthUrl, kernel.spawnTimeoutMs || 30000);
  if (!healthy) {
    _logOnDemandEvent('autopilot.spawn.gate_failed', { kernel: name, healthUrl: kernel.healthUrl }, requestEvt);
    return { ok: false, error: `${name} spawned but never became healthy at ${kernel.healthUrl}` };
  }
  s.status = 'stable';
  _logOnDemandEvent('autopilot.spawn.gate_passed', { kernel: name }, requestEvt);
  return { ok: true, verified: true };
}

function _startIdleReaper() {
  const onDemandKernels = KERNELS.filter(k => k.onDemand);
  if (onDemandKernels.length === 0) return;
  const timer = setInterval(() => {
    for (const kernel of onDemandKernels) {
      const s = _state[kernel.name];
      if (!s || s.status !== 'stable' || !s.proc) continue;
      const idleMs = Date.now() - (s.lastActivity || 0);
      if (idleMs > (kernel.idleTimeoutMs || Infinity)) {
        _log(`[${kernel.name}] idle for ${Math.round(idleMs / 1000)}s — despawning (on-demand)`);
        _logOnDemandEvent('autopilot.despawn.idle', { kernel: kernel.name, idleMs });
        // §FIX 2026-07-24 — set status BEFORE kill(). The exit handler reads
        // s.status to decide crash-vs-intentional; if kill() fires the exit
        // callback before this assignment lands, the despawn is misread as a
        // crash and the restart storm begins.
        s.status = 'dormant';
        try { s.proc.kill('SIGTERM'); } catch (_) {}
      }
    }
  }, 30000);
  timer.unref();
}

/** touchActivity(name) — any real caller can mark a kernel as "still in
 * use" without going through requestSpawn again, resetting the idle
 * clock. */
function touchActivity(name) {
  if (_state[name]) _state[name].lastActivity = Date.now();
}

// ── Phased boot ───────────────────────────────────────────────────────────────

/**
 * _phasePlan(kernels) — pure (§14.2): groups always-on kernels by phase,
 * ascending. Kernels with no phase declared land in a final catch-all phase
 * rather than being silently skipped (§1.2). onDemand kernels are excluded —
 * they have their own gated entry point (requestSpawn).
 */
function _phasePlan(kernels) {
  const active = kernels.filter(k => !k.onDemand);
  const declared = active.filter(k => Number.isFinite(k.phase));
  const undeclared = active.filter(k => !Number.isFinite(k.phase));
  const byPhase = new Map();
  for (const k of declared) {
    if (!byPhase.has(k.phase)) byPhase.set(k.phase, []);
    byPhase.get(k.phase).push(k);
  }
  const plan = [...byPhase.entries()].sort(([a], [b]) => a - b).map(([phase, list]) => ({ phase, kernels: list }));
  if (undeclared.length) {
    const last = (plan.length ? plan[plan.length - 1].phase : 0) + 1;
    plan.push({ phase: last, kernels: undeclared, undeclared: true });
  }
  return plan;
}

const PHASE_GATE_TIMEOUT_MS = 30000;

async function _bootPhases() {
  const plan = _phasePlan(KERNELS);
  for (const { phase, kernels, undeclared } of plan) {
    _log(`── boot phase ${phase} — ${kernels.map(k => k.name).join(', ')}${undeclared ? ' (no phase declared — booted last, loudly)' : ''}`);
    for (const kernel of kernels) {
      const idx = KERNELS.indexOf(kernel);
      _spawnKernel(kernel, COLORS[idx % COLORS.length]);
    }
    // Gate: every kernel in this phase must pass its real /health check
    // before the next phase begins. A kernel with no healthUrl (emerge —
    // no HTTP server exists to ask) is spawned-not-verified, stated as such.
    // A gate timeout is LOUD and boot continues — the old behavior was
    // full parallelism, so proceeding past a slow system is never worse
    // than what every previous boot already did (§1.2: no silent deadlock,
    // no silent skip).
    await Promise.all(kernels.map(async (kernel) => {
      if (!kernel.healthUrl) {
        _log(`[${kernel.name}] phase ${phase} — no healthUrl (no HTTP surface) — spawned, not verified`);
        return;
      }
      const healthy = await _pollHealth(kernel.healthUrl, kernel.spawnTimeoutMs || PHASE_GATE_TIMEOUT_MS);
      if (healthy) {
        _log(`[${kernel.name}] phase ${phase} gate passed — ${kernel.healthUrl}`);
      } else {
        _log(`[${kernel.name}] ⚠ phase ${phase} gate TIMED OUT after ${(kernel.spawnTimeoutMs || PHASE_GATE_TIMEOUT_MS) / 1000}s — ${kernel.healthUrl} never answered ok. Continuing boot; supervisor backoff/restart still applies.`);
      }
    }));
  }
  _log(`── boot sequence complete — ${plan.length} phase(s)`);
}

function start() {
  _log(`autopilot starting — supervising: ${KERNELS.map(k => k.name).join(', ')}`);
  KERNELS.forEach((kernel, i) => {
    _initState(kernel.name);
    // §BUILT 2026-07-15 — on-demand kernels stay dormant at boot. Real,
    // not a stub: _requestSpawn (below) is the only path that starts
    // them, gated on a real health check, same discipline as everything
    // else this session has been about — no shortcut around the gate.
    if (kernel.onDemand) {
      _log(`${COLORS[i % COLORS.length]}[${kernel.name}]${RESET} on-demand — staying dormant until requested`);
      _state[kernel.name].status = 'dormant';
    }
  });
  _bootPhases().catch(e => _log(`⚠ phased boot error: ${e.message} — kernels already spawned keep running under supervision`));
  _startStatusServer();
  _startIdleReaper();
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

module.exports = { start, _statusSnapshot, KERNELS, requestSpawn, touchActivity, _state, _spawnKernel, _phasePlan, _pollHealth, ALL_KERNELS };
