#!/usr/bin/env node
'use strict';
/**
 * ============================================================================
 *  NEXUS — kernel
 *  anonymousservers.info
 *
 *  node nexus.js up              — start all engines
 *  node nexus.js up dns proxy    — start named engines only
 *  node nexus.js stop [name]     — graceful shutdown
 *  node nexus.js restart <name>  — hot-restart one engine
 *  node nexus.js status          — engine health snapshot
 *  node nexus.js init            — write default .conf for every engine
 *  node nexus.js logs <name>     — tail engine log (last 100 lines)
 * ============================================================================
 */

const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');
const net  = require('net');
const rl   = require('readline');

const ROOT    = __dirname;
const ENG_DIR = path.join(ROOT, 'engines');
const CONF    = path.join(ROOT, 'conf');
const STATE   = path.join(ROOT, 'state');
const LOGS    = path.join(ROOT, 'logs');
const DB_DIR  = path.join(STATE, 'jaa');

// Windows uses a named pipe; Unix uses a domain socket
const IS_WIN  = process.platform === 'win32';
const SOCK    = IS_WIN
  ? '\\\\.\\pipe\\nexus'
  : path.join(STATE, 'nexus.sock');

// ─── util ─────────────────────────────────────────────────────────────────────

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function readJSON(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return fallback; }
}

function writeJSON(p, obj) {
  ensureDir(path.dirname(p));
  const tmp = p + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, p);
}

function log(tag, msg, level = 'INFO') {
  const line = `[${new Date().toISOString()}] [${level}] [${tag}] ${msg}`;
  console.log(line);
  ensureDir(LOGS);
  fs.appendFileSync(path.join(LOGS, `${tag.toLowerCase()}.log`), line + '\n');
}

// ─── JAA — embedded flat-JSON db ─────────────────────────────────────────────

class JAA {
  constructor(dir) { this.dir = dir; ensureDir(dir); }
  _file(t)  { return path.join(this.dir, `${t}.json`); }
  _load(t)  { return readJSON(this._file(t), { seq: 0, rows: [] }); }
  _save(t, d) { writeJSON(this._file(t), d); }
  insert(table, row) {
    const d = this._load(table);
    d.seq += 1;
    const rec = { _id: d.seq, _ts: Date.now(), ...row };
    d.rows.push(rec);
    this._save(table, d);
    return rec;
  }
  all(table) { return this._load(table).rows; }
  query(table, gate) { return this._load(table).rows.filter(gate); }
  update(table, gate, patch) {
    const d = this._load(table);
    let n = 0;
    d.rows = d.rows.map(r => gate(r) ? (n++, { ...r, ...patch, _ts: Date.now() }) : r);
    this._save(table, d);
    return n;
  }
  delete(table, gate) {
    const d = this._load(table);
    const before = d.rows.length;
    d.rows = d.rows.filter(r => !gate(r));
    this._save(table, d);
    return before - d.rows.length;
  }
  upsert(table, gate, row) {
    const hits = this.query(table, gate);
    if (hits.length) { this.update(table, gate, row); return this.query(table, gate)[0]; }
    return this.insert(table, row);
  }
}

const db = new JAA(DB_DIR);

// ─── engine registry ──────────────────────────────────────────────────────────

const ENGINE_DEFS = [
  { name: 'dns'      },
  { name: 'ddns'     },
  { name: 'tls'      },
  { name: 'proxy'    },
  { name: 'relay'    },
  { name: 'firewall' },
  { name: 'auth'     },
  { name: 'signal'   },
  { name: 'smtp'     },
  { name: 'cache'    },
  { name: 'storage'  },
  { name: 'queue'    },
  { name: 'billing'  },
  { name: 'monitor'  },
  { name: 'optimizer'},
  { name: 'catalog'    },
  { name: 'registrar'  },
  { name: 'provisioner'},
  { name: 'glue'       },
  { name: 'peer'       },
  { name: 'tunnel'     },
  { name: 'autodns'    },
  { name: 'webserver'  },
  { name: 'deploy'     },
  { name: 'setup'      },
  { name: 'ui'         },
];

const engines = new Map();

// ─── cross-engine route/reply correlation ──────────────────────────────────────
// §0.1 reality check, not memory: `ipc.send('route', {type, ...}, target)` from
// _engine.js is a TWO-hop pattern (request forwarded to target, target's bare
// reply forwarded back to the requester) but the kernel previously only
// implemented hop one, and only in a form the destination's `ipc.on(type, ...)`
// handlers could never actually match (forwarded messages kept the outer
// `type: 'route'` instead of unwrapping to the real message type). Every
// engine's `ipc.on('X:list', ...)`-style handler and every caller's
// `ipc.send('route', {type:'X:list',...}, engine)` was therefore silently
// dead code — requests timed out, replies were dropped, and nothing surfaced
// it because timeouts look identical to "the other engine is just slow."
// This map + the two blocks below close both hops without changing a single
// call site — `ipc.send`/`ipc.on` in `_engine.js` and every engine's existing
// handler code are unmodified.
const routePending = new Map(); // requestId -> { from, expires }
setInterval(() => {
  const now = Date.now();
  for (const [rid, v] of routePending) if (v.expires < now) routePending.delete(rid);
}, 30_000).unref();

// ─── IPC ──────────────────────────────────────────────────────────────────────

function send(child, msg) {
  if (!child || child.killed || !child.stdin || child.stdin.destroyed) return;
  try {
    child.stdin.write(JSON.stringify(msg) + '\n');
  } catch (e) {
    // EPIPE = engine exited between the alive check and the write — safe to ignore
  }
}

function handleIPC(name, raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }
  const { type, id, payload, to } = msg;

  if (type.startsWith('db:')) {
    let result, error;
    try {
      switch (type) {
        case 'db:insert': result = db.insert(payload.table, payload.row); break;
        case 'db:all':    result = db.all(payload.table); break;
        case 'db:query':  result = db.query(payload.table, new Function('r', `return (${payload.gate})(r)`)); break;
        case 'db:update': result = db.update(payload.table, new Function('r', `return (${payload.gate})(r)`), payload.patch); break;
        case 'db:delete': result = db.delete(payload.table, new Function('r', `return (${payload.gate})(r)`)); break;
        case 'db:upsert': result = db.upsert(payload.table, new Function('r', `return (${payload.gate})(r)`), payload.row); break;
      }
    } catch (e) { error = e.message; }
    const child = engines.get(name)?.proc;
    if (child) send(child, { type: 'db:result', id, result, error });
    return;
  }

  if (type === 'log') {
    log(name, payload.msg, payload.level || 'INFO');
    return;
  }

  if (type === 'port:claim') {
    const e = engines.get(name);
    if (e) { e.ports = e.ports || []; if (!e.ports.includes(payload.port)) e.ports.push(payload.port); }
    log('KERNEL', `${name} claimed port ${payload.port}`);
    const proxy = engines.get('proxy')?.proc;
    if (proxy) send(proxy, { type: 'port:registered', payload: { name, port: payload.port } });
    return;
  }

  if (type === 'route' && to) {
    const dest = engines.get(to)?.proc;
    if (dest) {
      // Unwrap: payload.type is the REAL message type the destination's
      // ipc.on(realType, handler) is listening for. Forwarding the envelope
      // as-is (old behavior) left the outer type stuck at 'route', which no
      // handler anywhere is registered for — this line is the actual fix.
      const innerType = payload && payload.type;
      if (innerType && payload.requestId) {
        routePending.set(payload.requestId, { from: name, expires: Date.now() + 15000 });
      }
      send(dest, { type: innerType || type, payload: { ...payload, from: name }, id, from: name });
    } else {
      const src = engines.get(name)?.proc;
      if (src) send(src, { type: 'route:error', id, error: `engine '${to}' not running` });
    }
    return;
  }

  if (type === 'status:ping') {
    const child = engines.get(name)?.proc;
    if (child) send(child, { type: 'status:pong', payload: kernelStatus() });
    return;
  }

  // ─── reply hop: a bare `ipc.send(replyType, {requestId, ...})` from the
  // engine that just handled a routed request. No `to` field — the sender
  // doesn't know who asked. Correlate by requestId and deliver it home.
  if (payload && payload.requestId && routePending.has(payload.requestId)) {
    const origin = routePending.get(payload.requestId).from;
    routePending.delete(payload.requestId);
    const originChild = engines.get(origin)?.proc;
    if (originChild) send(originChild, msg);
    return;
  }
}

// ─── spawn / watch ────────────────────────────────────────────────────────────

function spawnEngine(def) {
  const script = path.join(ENG_DIR, `${def.name}.js`);
  if (!fs.existsSync(script)) {
    log('KERNEL', `engine not found: engines/${def.name}.js — skipping`, 'WARN');
    return;
  }
  const existing  = engines.get(def.name);
  const backoff   = def._restart?.backoff  || 1000;
  const restarts  = def._restart?.restarts || 0;
  log('KERNEL', `spawning ${def.name} (restarts: ${restarts})`);

  const proc = cp.spawn(process.execPath, [script], {
    cwd:   ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
    env:   { ...process.env, NEXUS_ENGINE: def.name, NEXUS_ROOT: ROOT }
  });

  const state = { proc, name: def.name, pid: proc.pid, startedAt: Date.now(), restarts, backoff, ports: [], alive: true };
  engines.set(def.name, state);

  // suppress EPIPE on stdin — happens when engine exits while kernel is still writing
  proc.stdin.on('error', () => {});

  rl.createInterface({ input: proc.stdout }).on('line', raw => handleIPC(def.name, raw));
  proc.stderr.on('data', chunk => {
    chunk.toString().split('\n').filter(Boolean).forEach(l => log(def.name, l, 'WARN'));
  });

  proc.on('exit', (code, signal) => {
    state.alive = false;
    // destroy stdin so any pending writes fail fast instead of hanging
    try { proc.stdin.destroy(); } catch {}
    const nextBackoff = Math.min(backoff * 2, 30000);
    log('KERNEL', `${def.name} exited (code=${code}) — restart in ${backoff}ms`, 'WARN');
    setTimeout(() => spawnEngine({ ...def, _restart: { backoff: nextBackoff, restarts: restarts + 1 } }), backoff);
  });
}

function startEngines(names) {
  const defs = names ? ENGINE_DEFS.filter(d => names.includes(d.name)) : ENGINE_DEFS;
  for (const def of defs) spawnEngine(def);
}

function stopEngine(name) {
  const e = engines.get(name);
  if (!e?.proc) return false;
  e.proc.removeAllListeners('exit');
  e.proc.kill('SIGTERM');
  engines.delete(name);
  log('KERNEL', `stopped ${name}`);
  return true;
}

function stopAll() { for (const name of engines.keys()) stopEngine(name); }

function restartEngine(name) {
  const def = ENGINE_DEFS.find(d => d.name === name);
  if (!def) return false;
  stopEngine(name);
  setTimeout(() => spawnEngine(def), 500);
  return true;
}

function kernelStatus() {
  const snap = {};
  for (const [name, e] of engines) {
    snap[name] = { alive: e.alive, pid: e.pid, ports: e.ports, restarts: e.restarts, uptime: e.startedAt ? Math.floor((Date.now() - e.startedAt) / 1000) : 0 };
  }
  return { engines: snap, pid: process.pid, uptime: Math.floor(process.uptime()) };
}

// ─── orphan process cleanup ───────────────────────────────────────────────────
// Kills any node.js processes running nexus engines from a previous session.
// Called automatically on `up` so stale ports are released before we bind.

async function killOrphans(force = false) {
  const myPid = process.pid;

  if (IS_WIN) {
    // Windows: use WMIC to find node.exe processes running our engine files
    try {
      const { execSync } = require('child_process');
      // Get all node.exe PIDs except ourselves
      const raw = execSync('wmic process where "name=\'node.exe\'" get processid,commandline /format:csv', { encoding: 'utf8', timeout: 5000 });
      const pids = [];
      for (const line of raw.split('\n')) {
        if (!line.includes('node') && !line.includes('Node')) continue;
        // Check if this process is running one of our engine files or nexus.js
        const isOurs = line.includes('nexus.js') || line.includes('engines\\') || line.includes('engines/');
        if (!isOurs) continue;
        const parts = line.trim().split(',');
        const pid = parseInt(parts[parts.length - 1]);
        if (pid && pid !== myPid && !isNaN(pid)) pids.push(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { timeout: 3000 });
          log('KERNEL', `killed orphan pid ${pid}`);
        } catch {}
      }
      if (pids.length) {
        // Give OS a moment to release ports
        await new Promise(r => setTimeout(r, 800));
      }
    } catch {}

    // Also delete stale named pipe if possible
    // (Windows auto-releases named pipes when the owning process dies)

  } else {
    // Unix: pkill node processes running our engines
    try {
      const { execSync } = require('child_process');
      execSync(`pkill -f "engines/" 2>/dev/null || true`, { timeout: 3000 });
      execSync(`pkill -f "nexus.js" 2>/dev/null || true`, { timeout: 3000 });
      await new Promise(r => setTimeout(r, 500));
    } catch {}

    // Remove stale socket
    if (fs.existsSync(SOCK)) {
      try { fs.unlinkSync(SOCK); } catch {}
    }
  }
}

// ─── control socket (cross-platform) ─────────────────────────────────────────

function startControlSocket() {
  // On Unix, remove stale socket file
  if (!IS_WIN && fs.existsSync(SOCK)) {
    try { fs.unlinkSync(SOCK); } catch {}
  }
  ensureDir(path.dirname(IS_WIN ? STATE : SOCK));

  const server = net.createServer(socket => {
    const reader = rl.createInterface({ input: socket });
    reader.on('line', async raw => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      let resp;
      switch (msg.cmd) {
        case 'status':  resp = kernelStatus(); break;
        case 'restart': resp = { ok: restartEngine(msg.name) }; break;
        case 'stop':
          if (msg.name) resp = { ok: stopEngine(msg.name) };
          else { stopAll(); resp = { ok: true }; setTimeout(() => process.exit(0), 500); }
          break;
        case 'logs': {
          const f = path.join(LOGS, `${msg.name}.log`);
          resp = { lines: fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').slice(-100).join('\n') : '' };
          break;
        }
        case 'ipc': {
          // forward a message to a specific engine and return its reply
          const target = engines.get(msg.engine);
          if (!target || !target.child) { resp = { error: `engine not running: ${msg.engine}` }; break; }
          const replyType = msg.type + ':reply';
          const rid = Math.random().toString(36).slice(2);
          const waitForReply = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('ipc timeout')), 8000);
            const handler = (line) => {
              try {
                const m = JSON.parse(line);
                if (m.type === replyType) {
                  clearTimeout(timer);
                  target.child.stdout.off('data', handler);
                  resolve(m.payload);
                }
              } catch {}
            };
            target.child.stdout.on('data', handler);
          });
          send(target.child, { type: msg.type, payload: msg.payload || {}, id: rid });
          resp = await waitForReply.catch(e => ({ error: e.message }));
          break;
        }
        default: resp = { error: `unknown cmd: ${msg.cmd}` };
      }
      socket.write(JSON.stringify(resp) + '\n');
    });
  });

  server.on('error', err => log('KERNEL', `control socket error: ${err.message}`, 'WARN'));
  server.listen(SOCK, () => log('KERNEL', `control socket ready`));
}

// ─── ctl client (used by status/stop/restart/logs subcommands) ───────────────

function ctlCmd(cmd) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(SOCK);
    let out = '';
    socket.on('data',  d   => out += d);
    socket.on('end',   ()  => resolve(out));
    socket.on('error', err => reject(new Error(`nexus not running (${err.message})`)));
    socket.write(JSON.stringify(cmd) + '\n');
    socket.end();
  });
}

// ─── init ─────────────────────────────────────────────────────────────────────

function initAll() {
  [ENG_DIR, CONF, STATE, LOGS].forEach(ensureDir);
  for (const def of ENGINE_DEFS) {
    const script = path.join(ENG_DIR, `${def.name}.js`);
    if (!fs.existsSync(script)) continue;
    try {
      cp.execFileSync(process.execPath, [script], {
        cwd: ROOT,
        env: { ...process.env, NEXUS_ENGINE: def.name, NEXUS_ROOT: ROOT, NEXUS_INIT: '1' },
        stdio: 'inherit', timeout: 8000,
      });
    } catch (e) { log('KERNEL', `init failed for ${def.name}: ${e.message}`, 'WARN'); }
  }
  log('KERNEL', 'all engine configs initialised in ./conf/');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function cli() {
  const [,, subcmd, ...args] = process.argv;

  switch (subcmd) {

    case 'init':
      initAll();
      break;

    case 'up': {
      [ENG_DIR, CONF, STATE, LOGS].forEach(ensureDir);

      // ── kill any orphaned nexus process from a previous session ──────────
      // On Windows, tasklist/taskkill; on Unix, pkill. Both are best-effort.
      await killOrphans();

      const names = args.length ? args : null;
      startControlSocket();
      startEngines(names);
      log('KERNEL', `nexus up — engines: ${(names || ENGINE_DEFS.map(d => d.name)).join(', ')}`);
      process.on('SIGTERM', () => { stopAll(); process.exit(0); });
      process.on('SIGINT',  () => { stopAll(); process.exit(0); });
      break;
    }

    case 'kill':
    case 'stop': {
      // Try graceful IPC stop first, then force-kill as fallback
      const resp = await ctlCmd({ cmd: 'stop', name: args[0] || null }).catch(() => null);
      if (resp) {
        console.log(typeof resp === 'string' ? resp : JSON.stringify(resp, null, 2));
      } else {
        console.log('IPC stop failed — force-killing node processes...');
        await killOrphans(true);
        console.log('done');
      }
      break;
    }

    case 'restart': {
      const resp = await ctlCmd({ cmd: 'restart', name: args[0] }).catch(e => ({ error: e.message }));
      console.log(JSON.stringify(resp, null, 2));
      break;
    }

    case 'status': {
      const resp = await ctlCmd({ cmd: 'status' }).catch(e => `nexus not running: ${e.message}`);
      console.log(typeof resp === 'string' ? resp : JSON.stringify(JSON.parse(resp), null, 2));
      break;
    }

    case 'logs': {
      const resp = await ctlCmd({ cmd: 'logs', name: args[0] || 'kernel' }).catch(e => JSON.stringify({ lines: e.message }));
      console.log(JSON.parse(resp).lines || '(empty)');
      break;
    }

    case 'firewall:apply': {
      const resp = await ctlCmd({ cmd: 'ipc', engine: 'firewall', type: 'sysfw:apply', payload: {} })
        .catch(e => JSON.stringify({ ok: false, error: e.message }));
      const r = JSON.parse(resp);
      if (r.skipped) { console.log('sysfw: OS firewall not available on this platform'); break; }
      console.log(r.ok ? 'sysfw: OS firewall rules applied ✓' : 'sysfw: some rules failed — check logs');
      (r.results || []).forEach(x => console.log(`  ${x.ok ? '✓' : '✗'} ${x.cmd}`));
      break;
    }

    case 'firewall:remove': {
      const resp = await ctlCmd({ cmd: 'ipc', engine: 'firewall', type: 'sysfw:remove', payload: {} })
        .catch(e => JSON.stringify({ ok: false, error: e.message }));
      const r = JSON.parse(resp);
      console.log(r.ok ? 'sysfw: OS firewall rules removed ✓' : 'sysfw: removal had errors — check logs');
      break;
    }

    case 'firewall:list': {
      const resp = await ctlCmd({ cmd: 'ipc', engine: 'firewall', type: 'sysfw:list', payload: {} })
        .catch(e => JSON.stringify({ output: e.message }));
      console.log(JSON.parse(resp).output || '(empty)');
      break;
    }

    case 'firewall:detect': {
      const resp = await ctlCmd({ cmd: 'ipc', engine: 'firewall', type: 'sysfw:detect', payload: {} })
        .catch(e => JSON.stringify({ error: e.message }));
      console.log(JSON.parse(resp));
      break;
    }

    case 'upnp:open': {
      console.log('Discovering router and forwarding ports — this may take a few seconds...');
      const resp = await ctlCmd({ cmd: 'ipc', engine: 'firewall', type: 'upnp:open', payload: {} })
        .catch(e => JSON.stringify({ ok: false, error: e.message }));
      const r = JSON.parse(resp);
      if (r.skipped) { console.log(`upnp: ${r.reason || 'no gateway found'} — forward ports manually on your router`); break; }
      console.log(r.ok ? 'upnp: all ports forwarded ✓' : 'upnp: some ports failed — see below');
      (r.results || []).forEach(x => console.log(`  ${x.ok ? '✓' : '✗'} ${x.protocol}/${x.port} — ${x.detail}`));
      break;
    }

    case 'upnp:close': {
      const resp = await ctlCmd({ cmd: 'ipc', engine: 'firewall', type: 'upnp:close', payload: {} })
        .catch(e => JSON.stringify({ ok: false, error: e.message }));
      const r = JSON.parse(resp);
      console.log(r.ok ? 'upnp: port mappings removed ✓' : 'upnp: removal had errors — check logs');
      break;
    }

    case 'upnp:status': {
      const resp = await ctlCmd({ cmd: 'ipc', engine: 'firewall', type: 'upnp:status', payload: {} })
        .catch(e => JSON.stringify({ error: e.message }));
      const r = JSON.parse(resp);
      console.log(r.ok ? `upnp: gateway found at ${r.controlUrl}` : `upnp: ${r.detail || 'no gateway found'}`);
      break;
    }

    default:
      console.log(`
  NEXUS — sovereign hosting kernel — anonymousservers.info

  node nexus.js init              write default .conf for every engine
  node nexus.js up [names...]     start all engines (or named subset)
  node nexus.js stop [name]       stop all or one engine
  node nexus.js restart <name>    hot-restart one engine
  node nexus.js status            health of all engines
  node nexus.js logs <name>       last 100 lines of engine log
  node nexus.js firewall:apply    apply OS firewall rules (netsh/ufw/iptables)
  node nexus.js firewall:remove   remove OS firewall rules
  node nexus.js firewall:list     show current OS firewall rules
  node nexus.js firewall:detect   show which OS firewall tool is in use
  node nexus.js upnp:open         auto-forward ports 80/443/53/587/2525 on router
  node nexus.js upnp:close        remove those port forwards
  node nexus.js upnp:status       check if a UPnP gateway is reachable

  Engines:
    dns        authoritative DNS + zonefile
    ddns       IP watcher → Cloudflare / DuckDNS push
    tls        ACME Let's Encrypt + auto-renew
    proxy      reverse proxy + auto port mapping
    relay      phantom encrypted tunnel (origin masking)
    firewall   rate limiting + auto-ban + port knocking
    auth       JWT + API keys + anonymous accounts
    signal     bot / human classification (signal-to-noise)
    smtp       full MTA inbound + outbound + DKIM
    cache      LRU + edge cache + stale-while-revalidate
    storage    S3-compatible object storage
    queue      job queue + cron scheduler
    billing    tenants + plans + usage metering + secrets vault
    monitor    uptime + latency + alerts
    optimizer  Brotli/Gzip + preload hints + perf scoring
    catalog    one-click app installer (WordPress, Ghost, etc.)
    ui         admin control panel at admin.anonymousservers.info
`);
  }
}

if (require.main === module) cli();
module.exports = { db, log, engines, kernelStatus };
