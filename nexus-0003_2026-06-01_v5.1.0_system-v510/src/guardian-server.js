'use strict';
// ════════════════════════════════════════════════════════════════════════════
// guardian-server.js — Emitted from guardian-server.eg
// Ports: 7820 API | 7821 WSS | 7822 dropzone
// ════════════════════════════════════════════════════════════════════════════
const http = require('http');
const net  = require('net');
const fs2  = require('fs');
const path = require('path');
const crypto = require('crypto');
const { randomUUID } = require('crypto');
const { Bus, Event, Gate } = require('./siso');

const P_API  = parseInt(process.env.GUARDIAN_API_PORT  || 7820);
const P_WSS  = parseInt(process.env.GUARDIAN_WSS_PORT  || 7821);
const P_DROP = parseInt(process.env.GUARDIAN_DROP_PORT || 7822);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');

// ── JAA Store ─────────────────────────────────────────────────────────────────
class JaaStore {
  constructor(dir) {
    this.dir = dir;
    if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
    this._c = {};
  }
  _f(t)  { return path.join(this.dir, t + '.json'); }
  _l(t)  {
    if (this._c[t]) return this._c[t];
    const f = this._f(t);
    if (!fs2.existsSync(f)) { this._c[t] = []; return []; }
    try { this._c[t] = JSON.parse(fs2.readFileSync(f, 'utf8')); } catch(e) { this._c[t] = []; }
    return this._c[t];
  }
  _s(t)  { fs2.writeFileSync(this._f(t), JSON.stringify(this._c[t] || [], null, 2)); }
  insert(t, r) {
    const rows = this._l(t);
    const row  = { id: r.id || randomUUID(), ts: r.ts || Date.now(), ...r };
    rows.unshift(row); if (rows.length > 5000) rows.pop();
    this._c[t] = rows; this._s(t); return row;
  }
  get(t, w = {})    { return this._l(t).find(r => Object.entries(w).every(([k,v]) => r[k] === v)) || null; }
  all(t, w = {}, o = {}) {
    let r = this._l(t).filter(r => Object.entries(w).every(([k,v]) => r[k] === v));
    if (o.limit) r = r.slice(0, o.limit); return r;
  }
  update(t, w = {}, s2 = {}) {
    const rows = this._l(t); let n = 0;
    for (const r of rows) { if (Object.entries(w).every(([k,v]) => r[k] === v)) { Object.assign(r, s2, { updated_at: Date.now() }); n++; } }
    this._s(t); return n;
  }
  count(t) { return this._l(t).length; }
  counts() {
    const r = {};
    try { for (const f of fs2.readdirSync(this.dir)) { if (f.endsWith('.json')) { const t = f.slice(0,-5); r[t] = this._l(t).length; } } } catch(e) {}
    return r;
  }
}

const jaa = new JaaStore(DATA_DIR);
const bus = new Bus();
const sseClients = new Set();
const wsClients  = new Map();

function pushSSE(type, data = {}) {
  const m = 'data: ' + JSON.stringify({ type, data, ts: Date.now() }) + '\n\n';
  for (const r of sseClients) { try { r.write(m); } catch(e) { sseClients.delete(r); } }
}

const ioStream = bus.stream('io');
ioStream.register(new Gate('artifact.store', (ev) => {
  const ex = jaa.get('artifacts', { hash: ev.data.hash });
  if (ex) { jaa.update('artifacts', { hash: ev.data.hash }, { seen_count: (ex.seen_count||1)+1, last_seen: Date.now() }); return; }
  const a = jaa.insert('artifacts', ev.data); pushSSE('artifact.stored', a);
}));
ioStream.register(new Gate('ledger.record', (ev) => {
  const e = jaa.insert('ledger', ev.data); pushSSE('ledger.entry', e);
}));

function parseBody(req) {
  return new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b)); } catch(e) { r({}); } }); });
}
function json(res, st, data) {
  res.writeHead(st, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

const apiServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = req.url.split('?')[0];
  const q   = req.url.includes('?') ? Object.fromEntries(new URLSearchParams(req.url.split('?')[1])) : {};

  if (url === '/sse') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    res.write('retry:1000\n\n'); sseClients.add(res); req.on('close', () => sseClients.delete(res)); return;
  }
  if (url === '/health')              return json(res, 200, { ok: true, uptime: process.uptime(), counts: jaa.counts() });
  if (url === '/' || url === '/cockpit') return res.end('<html><body><h1>Guardian Cockpit</h1></body></html>');
  if (url === '/api/jobs' && req.method === 'GET') {
    const rows = q.status && q.status !== 'all' ? jaa.all('jobs', { status: q.status }, { limit: parseInt(q.limit)||100 }) : jaa.all('jobs', {}, { limit: parseInt(q.limit)||100 });
    return json(res, 200, { ok: true, jobs: rows });
  }
  if (url === '/api/jobs' && req.method === 'POST') {
    const b = await parseBody(req);
    const j = jaa.insert('jobs', { ...b, status: b.status || 'queued' });
    pushSSE('job.created', j);
    for (const [, s] of wsClients) { if (s.readyState === 1) { wsSend(s, { type: 'GUARDIAN_JOB', jobId: j.id, command: j.command || 'prompt', provider: j.provider || 'claude', prompt: j.prompt || '' }); break; } }
    return json(res, 201, { ok: true, job: j });
  }
  if (url === '/api/artifacts' && req.method === 'GET') {
    let rows = jaa.all('artifacts', {}, { limit: parseInt(q.limit)||200 });
    if (q.search) rows = rows.filter(r => (r.content||'').toLowerCase().includes(q.search.toLowerCase()) || (r.name||'').toLowerCase().includes(q.search.toLowerCase()));
    return json(res, 200, { ok: true, artifacts: rows });
  }
  if (url === '/api/artifacts' && req.method === 'POST') {
    const b = await parseBody(req); ioStream.emit(new Event('artifact.store', b));
    return json(res, 201, { ok: true });
  }
  if (url.startsWith('/api/artifacts/') && req.method === 'GET') {
    const id = url.split('/').pop();
    const a  = jaa.get('artifacts', { hash: id }) || jaa.get('artifacts', { id });
    return a ? json(res, 200, { ok: true, artifact: a }) : json(res, 404, { error: 'not found' });
  }
  if (url === '/api/gaps' && req.method === 'GET') {
    return json(res, 200, { ok: true, gaps: jaa.all('gaps', q.status ? { status: q.status } : {}) });
  }
  if (url === '/api/gaps' && req.method === 'POST') {
    const b = await parseBody(req); const g = jaa.insert('gaps', { ...b, status: 'open' });
    pushSSE('gap.opened', g); return json(res, 201, { ok: true, gap: g });
  }
  if (url.match(/\/api\/gaps\/.+\/resolve/) && req.method === 'POST') {
    const id = url.split('/')[3]; const b = await parseBody(req);
    jaa.update('gaps', { id }, { status: 'resolved', resolution: b.resolution, resolved_at: Date.now() });
    pushSSE('gap.resolved', { id }); return json(res, 200, { ok: true });
  }
  if (url === '/api/gap-questions') return json(res, 200, { ok: true, gap_questions: jaa.all('gap_questions', q.status ? { status: q.status } : {}) });
  if (url === '/api/ledger') return json(res, 200, { ok: true, entries: jaa.all('ledger', {}, { limit: parseInt(q.n)||50 }) });
  if (url === '/api/sessions') return json(res, 200, { ok: true, sessions: jaa.all('sessions', {}, { limit: 50 }) });
  if (url.match(/\/api\/sessions\/.+\/name/) && req.method === 'POST') {
    const id = url.split('/')[3]; const b = await parseBody(req);
    jaa.update('sessions', { id }, { name: b.name }); pushSSE('session.named', { id, name: b.name });
    return json(res, 200, { ok: true });
  }
  if (url === '/api/settings' && req.method === 'GET') return json(res, 200, { ok: true, settings: jaa.all('settings') });
  if (url.startsWith('/api/settings/') && req.url !== '/api/settings/reset' && req.method === 'PUT') {
    const key = url.split('/').pop(); const b = await parseBody(req);
    const ex = jaa.get('settings', { key });
    if (ex) jaa.update('settings', { key }, { value: b.value }); else jaa.insert('settings', { key, value: b.value });
    return json(res, 200, { ok: true });
  }
  if (url === '/api/settings/reset' && req.method === 'POST') {
    const defs = { session_greeting_enabled: 'true', scan_debounce_ms: '1500', gap_min_score: '0.25', pa_enabled: 'true', memory_auto_push: 'true', greeting_delay_ms: '1200', poll_interval_ms: '500', stable_count_threshold: '5' };
    for (const [k,v] of Object.entries(defs)) { const ex = jaa.get('settings', { key: k }); if (ex) jaa.update('settings', { key: k }, { value: v }); else jaa.insert('settings', { key: k, value: v }); }
    return json(res, 200, { ok: true });
  }
  if (url === '/api/events') return json(res, 200, { ok: true, events: jaa.all('ledger', {}, { limit: parseInt(q.n)||100 }) });
  if (url === '/api/versions') return json(res, 200, { ok: true, versions: jaa.all('versions', {}, { limit: parseInt(q.limit)||50 }) });
  if (url === '/api/status') return json(res, 200, { ok: true, counts: jaa.counts(), uptime: process.uptime() });
  if (url === '/api/contract') return json(res, 200, { ok: true, contract: { version: '1.0.0', ports: { api: P_API, wss: P_WSS, drop: P_DROP } } });
  json(res, 404, { error: 'not found', path: url });
});

// ── WSS ───────────────────────────────────────────────────────────────────────
function wsHandshake(socket, head) {
  const key = head.match(/Sec-WebSocket-Key: (.+)/i)?.[1]?.trim();
  if (!key) { socket.destroy(); return false; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  return true;
}
function wsFrame(data) {
  const msgs = []; let off = 0;
  while (off < data.length) {
    if (data.length < off + 2) break;
    const op = data[off] & 0x0f, mask = (data[off+1] & 0x80) !== 0;
    let len = data[off+1] & 0x7f; off += 2;
    if (len === 126) { len = data.readUInt16BE(off); off += 2; }
    const mk = mask ? data.slice(off, off+4) : null; if (mask) off += 4;
    if (data.length < off + len) break;
    let pl = data.slice(off, off+len);
    if (mask) pl = Buffer.from(pl.map((b, i) => b ^ mk[i%4]));
    off += len;
    if (op === 1) try { msgs.push(JSON.parse(pl.toString())); } catch(e) {}
    if (op === 8) msgs.push({ __close: true });
  }
  return msgs;
}
function wsSend(socket, obj) {
  const data = Buffer.from(JSON.stringify(obj));
  const h = data.length < 126 ? Buffer.allocUnsafe(2) : Buffer.allocUnsafe(4);
  h[0] = 0x81;
  if (data.length < 126) { h[1] = data.length; } else { h[1] = 126; h.writeUInt16BE(data.length, 2); }
  try { socket.write(Buffer.concat([h, data])); } catch(e) {}
}

const wssServer = net.createServer(socket => {
  let shook = false, tabId = null;
  socket.on('data', raw => {
    if (!shook) { const head = raw.toString(); if (head.includes('Upgrade: websocket')) { shook = wsHandshake(socket, head); return; } }
    for (const msg of wsFrame(raw)) {
      if (msg.__close) { socket.destroy(); return; }
      if (msg.type === 'GUARDIAN_REGISTER') {
        tabId = msg.tabId || randomUUID(); wsClients.set(tabId, socket); socket._tabId = tabId;
        wsSend(socket, { type: 'GUARDIAN_READY', provider: msg.provider || 'claude' });
        jaa.insert('sessions', { uuid: tabId, provider: msg.provider || 'claude', ts: Date.now() });
        pushSSE('provider.registered', { tabId, provider: msg.provider });
      }
      if (msg.type === 'GUARDIAN_HEARTBEAT') wsSend(socket, { type: 'GUARDIAN_HEARTBEAT_ACK' });
      if (msg.type === 'GUARDIAN_INPUT') {
        // LOG INPUT + HANDSHAKE — channel stays open until DONE
        jaa.insert('ledger', { category: 'INPUT', msg: (msg.text||'').slice(0,500), meta: { jobId: msg.jobId, source: msg.source, chatUrl: msg.chatUrl, account: msg.account }, ts: Date.now() });
        wsSend(socket, { type: 'GUARDIAN_INPUT_ACK', jobId: msg.jobId, status: 'pending' });
        if (msg.jobId) jaa.update('jobs', { id: msg.jobId }, { status: 'pending' });
        pushSSE('input.logged', { jobId: msg.jobId, chars: (msg.text||'').length });
      }
      if (msg.type === 'GUARDIAN_DELIVERING') { if (msg.jobId) jaa.update('jobs', { id: msg.jobId }, { status: 'pending' }); pushSSE('job.pending', { jobId: msg.jobId }); }
      if (msg.type === 'GUARDIAN_GENERATING') { if (msg.jobId) jaa.update('jobs', { id: msg.jobId }, { status: 'generating' }); pushSSE('job.generating', { jobId: msg.jobId }); }
      if (msg.type === 'GUARDIAN_CHUNK') pushSSE('job.chunk', { jobId: msg.jobId, text: msg.text });
      if (msg.type === 'GUARDIAN_COMPLETE' || msg.type === 'GUARDIAN_DONE') {
        if (msg.jobId) jaa.update('jobs', { id: msg.jobId }, { status: 'complete', completed_at: Date.now() });
        pushSSE('job.complete', { jobId: msg.jobId });
        jaa.insert('ledger', { category: 'UPGRADE', msg: 'job complete', meta: { jobId: msg.jobId } });
      }
      if (msg.type === 'GUARDIAN_ARTIFACT') ioStream.emit(new Event('artifact.store', { ...msg, ts: Date.now() }));
      if (msg.type === 'GUARDIAN_GAPS') for (const g of (msg.gaps||[])) { const row = jaa.insert('gaps', { ...g, status: 'open', ts: Date.now() }); pushSSE('gap.detected', row); }
      if (msg.type === 'GUARDIAN_LEDGER_EVENT') ioStream.emit(new Event('ledger.record', msg));
      if (msg.type === 'GUARDIAN_SESSION_NAMED') { if (tabId) jaa.update('sessions', { uuid: tabId }, { name: msg.sessionName }); pushSSE('session.named', { name: msg.sessionName, chatId: msg.chatId }); }
    }
  });
  socket.on('close', () => { if (tabId) { wsClients.delete(tabId); pushSSE('provider.disconnected', { tabId }); } });
  socket.on('error', () => {});
});

const dropServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url === '/api/files') return res.end(JSON.stringify({ ok: true, files: jaa.all('files', {}, { limit: 100 }) }));
  if (req.url === '/') return res.end('<html><body><h2>Nexus Dropzone</h2></body></html>');
  res.end('{}');
});

// ── Boot ──────────────────────────────────────────────────────────────────────
apiServer.listen(P_API, '127.0.0.1', () => console.log('[guardian] API  http://127.0.0.1:' + P_API));
wssServer.listen(P_WSS, '127.0.0.1', () => console.log('[guardian] WSS  ws://127.0.0.1:'  + P_WSS));
dropServer.listen(P_DROP, '0.0.0.0', () => console.log('[guardian] Drop http://0.0.0.0:'  + P_DROP));

const defs = { session_greeting_enabled: 'true', scan_debounce_ms: '1500', gap_min_score: '0.25', pa_enabled: 'true', memory_auto_push: 'true', greeting_delay_ms: '1200', poll_interval_ms: '500', stable_count_threshold: '5' };
for (const [k,v] of Object.entries(defs)) { if (!jaa.get('settings', { key: k })) jaa.insert('settings', { key: k, value: v }); }
console.log('[guardian] ready — CLI: node cli/nexus-cli.js');
module.exports = { jaa, bus, pushSSE, wsSend };
