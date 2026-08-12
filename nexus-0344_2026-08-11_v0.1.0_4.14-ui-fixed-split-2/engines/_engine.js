'use strict';
/**
 * engines/_engine.js — SDK required by every engine
 * anonymousservers.info
 *
 * Every engine requires this at the top:
 *   const { ipc, conf, log, claimPort, isInit } = require('./_engine');
 */

const fs   = require('fs');
const path = require('path');
const rl   = require('readline');

const NAME = process.env.NEXUS_ENGINE || 'unknown';
const ROOT = process.env.NEXUS_ROOT   || path.join(__dirname, '..');
const CONF = path.join(ROOT, 'conf');

// ─── IPC (newline-delimited JSON over stdin/stdout) ───────────────────────────

let _msgId = 0;
const _pending  = new Map();
const _handlers = new Map();

const reader = rl.createInterface({ input: process.stdin, terminal: false });
reader.on('line', raw => {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }

  if (msg.id && _pending.has(msg.id)) {
    const { resolve, reject } = _pending.get(msg.id);
    _pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error));
    else resolve(msg.result !== undefined ? msg.result : msg);
    return;
  }

  const fns = _handlers.get(msg.type) || [];
  for (const fn of fns) fn(msg.payload, msg);
});

function send(type, payload, to) {
  const id  = ++_msgId;
  const msg = { from: NAME, type, id, payload };
  if (to) msg.to = to;
  process.stdout.write(JSON.stringify(msg) + '\n');
  return id;
}

function request(type, payload, to) {
  return new Promise((resolve, reject) => {
    const id = send(type, payload, to);
    _pending.set(id, { resolve, reject });
    setTimeout(() => {
      if (_pending.has(id)) { _pending.delete(id); reject(new Error(`IPC timeout: ${type}`)); }
    }, 10000);
  });
}

function on(type, handler) {
  if (!_handlers.has(type)) _handlers.set(type, []);
  _handlers.get(type).push(handler);
}

function off(type, handler) {
  if (!_handlers.has(type)) return;
  const fns = _handlers.get(type).filter(h => h !== handler);
  if (fns.length === 0) _handlers.delete(type);
  else _handlers.set(type, fns);
}

const db = {
  insert: (table, row)         => request('db:insert', { table, row }),
  all:    (table)              => request('db:all',    { table }),
  query:  (table, gate)        => request('db:query',  { table, gate: gate.toString() }),
  update: (table, gate, patch) => request('db:update', { table, gate: gate.toString(), patch }),
  delete: (table, gate)        => request('db:delete', { table, gate: gate.toString() }),
  upsert: (table, gate, row)   => request('db:upsert', { table, gate: gate.toString(), row }),
};

// ─── config ───────────────────────────────────────────────────────────────────

function confFile() { return path.join(CONF, `${NAME}.conf`); }

function loadConf(defaults = {}) {
  try {
    const raw = fs.readFileSync(confFile(), 'utf8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch { return { ...defaults }; }
}

function saveConf(obj) {
  fs.mkdirSync(CONF, { recursive: true });
  const tmp = confFile() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, confFile());
}

function initConf(defaults) {
  if (!fs.existsSync(confFile())) saveConf(defaults);
}

// ─── log / util ───────────────────────────────────────────────────────────────

function log(msg, level = 'INFO') {
  send('log', { msg, level });
}

function claimPort(port) {
  send('port:claim', { port });
}

function route(toEngine, type, payload) {
  // `type` last, always: the routing discriminator must never lose to a
  // payload field of the same name (e.g. DNS record `type`: A/NS/CNAME).
  // See dns.js's zone:update/zone:delete — record type travels as `type2`
  // specifically because `type` is reserved for routing, codebase-wide.
  return request('route', { ...payload, type }, toEngine);
}

function isInit() { return process.env.NEXUS_INIT === '1'; }

module.exports = {
  ipc: { send, on, off, request, route, db },
  conf: { load: loadConf, save: saveConf, init: initConf, file: confFile },
  log,
  claimPort,
  isInit,
  NAME,
  ROOT,
};
