'use strict';
/**
 * engines/dns.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative DNS server. UDP/53 + TCP/53. Multi-zone — hosts as many
 * independent domains as are configured, not just one (see
 * engines/lib/dns-zones.js for the actual zone logic; this file is the wire
 * protocol + IPC shell around it, per §3.4).
 *
 * conf/dns.conf:
 *   port           UDP+TCP port (default 53, use 5353 if you don't have root)
 *   primaryDomain  which zone is "this platform's own domain" — used as the
 *                  default target for every caller that doesn't pass an
 *                  explicit `domain` (ddns, glue, smtp, catalog, provisioner,
 *                  autodns, peer, registrar, tunnel, ui all operate on the
 *                  platform's own domain and were never touched for this —
 *                  they keep working unchanged)
 *   zones          { [domain]: { ttl, ns1, ns2, records: [...] } } — see
 *                  dns-zones.js's header comment for the full shape
 *
 * A pre-multi-zone install's old {origin, records} config is migrated into
 * `zones` automatically on first load, once, non-destructively (§0.3).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const dgram = require('dgram');
const net   = require('net');
const { ipc, conf, log, claimPort, isInit, NAME } = require('./_engine');
const dz = require('./lib/dns-zones');

const DEFAULTS = {
  port:   5353,   // use 53 in prod (requires root or cap_net_bind_service)
  origin: 'anonymousservers.info.', // legacy field, migrated into zones on first load
  ttl:    300,
  ns1:    'ns1',
  ns2:    'ns2',
  records: [
    { name: '@',      type: 'A',     value: '127.0.0.1' },
    { name: 'www',    type: 'CNAME', value: '@' },
    { name: 'mail',   type: 'A',     value: '127.0.0.1' },
    { name: '@',      type: 'MX',    value: '10 mail.anonymousservers.info.' },
    { name: '@',      type: 'TXT',   value: 'v=spf1 mx a ~all' },
    { name: '_dmarc', type: 'TXT',   value: 'v=DMARC1; p=quarantine; rua=mailto:admin@anonymousservers.info' },
    { name: 'admin',  type: 'CNAME', value: '@' },
    { name: 'smtp',   type: 'CNAME', value: 'mail' },
    { name: 'vpn',    type: 'CNAME', value: '@' },
  ]
};

if (isInit()) {
  conf.init(DEFAULTS);
  process.stdout.write(JSON.stringify({ type: 'log', payload: { msg: 'dns: wrote default conf', level: 'INFO' } }) + '\n');
  process.exit(0);
}

let cfg = conf.load(DEFAULTS);

// ─── one-time migration to multi-zone, non-destructive ──────────────────────
{
  const { zones, primaryDomain, migrated } = dz.migrateLegacyConfig(cfg);
  cfg.zones = zones;
  cfg.primaryDomain = primaryDomain;
  if (migrated) {
    log(`dns: migrated legacy single-zone config into multi-zone (primary domain: ${primaryDomain})`);
    conf.save(cfg);
  }
}

function persist() { conf.save(cfg); }
function defaultDomain(d) { return d || cfg.primaryDomain; }

// ─── DNS wire format ──────────────────────────────────────────────────────────
//   Minimal RFC 1035 parser/encoder. Only types we need.

const { DNS_TYPES, DNS_TYPES_INV } = dz;

function encodeName(name) {
  const parts = name.split('.');
  const buf = [];
  for (const p of parts) {
    if (!p) continue;
    buf.push(p.length);
    for (const c of p) buf.push(c.charCodeAt(0));
  }
  buf.push(0);
  return Buffer.from(buf);
}

function decodeName(buf, offset) {
  const labels = [];
  let jumped = false, jumpOffset = 0;
  while (true) {
    if (offset >= buf.length) break;
    const len = buf[offset];
    if (len === 0) { if (!jumped) jumpOffset = offset + 1; break; }
    if ((len & 0xc0) === 0xc0) {
      const ptr = ((len & 0x3f) << 8) | buf[offset + 1];
      if (!jumped) jumpOffset = offset + 2;
      jumped = true;
      offset = ptr;
      continue;
    }
    offset++;
    labels.push(buf.slice(offset, offset + len).toString());
    offset += len;
  }
  return { name: labels.join('.').toLowerCase(), end: jumped ? jumpOffset : offset + 1 };
}

function parseQuery(buf) {
  const id = buf.readUInt16BE(0);
  const qdCount = buf.readUInt16BE(4);
  const questions = [];
  let offset = 12;
  for (let i = 0; i < qdCount; i++) {
    const { name, end } = decodeName(buf, offset);
    offset = end;
    const qtype  = buf.readUInt16BE(offset);
    const qclass = buf.readUInt16BE(offset + 2);
    offset += 4;
    questions.push({ name, qtype, qclass });
  }
  return { id, questions };
}

function zoneOriginFor(name) {
  return dz.findZone(cfg.zones, name) || cfg.primaryDomain;
}

function encodeRdata(type, value, zoneOrigin) {
  switch (type) {
    case 'A': {
      return Buffer.from(value.split('.').map(Number));
    }
    case 'AAAA': {
      // simple colon-expansion, no :: shorthand support — matches what the
      // record editor writes out (full form), good enough for this server's
      // scope
      const parts = value.split(':').map(h => parseInt(h || '0', 16));
      const buf = Buffer.alloc(16);
      for (let i = 0; i < 8; i++) buf.writeUInt16BE(parts[i] || 0, i * 2);
      return buf;
    }
    case 'CNAME': case 'NS': {
      return encodeName(dz.fqdn(value.replace(/\.$/, ''), zoneOrigin));
    }
    case 'MX': {
      const [pref, host] = value.split(' ');
      const prefBuf = Buffer.alloc(2);
      prefBuf.writeUInt16BE(Number(pref));
      return Buffer.concat([prefBuf, encodeName(host.replace(/\.$/, ''))]);
    }
    case 'SRV': {
      // value: "priority weight port target"
      const [prio, weight, port, target] = value.trim().split(/\s+/);
      const head = Buffer.alloc(6);
      head.writeUInt16BE(Number(prio) || 0, 0);
      head.writeUInt16BE(Number(weight) || 0, 2);
      head.writeUInt16BE(Number(port) || 0, 4);
      return Buffer.concat([head, encodeName((target || '').replace(/\.$/, ''))]);
    }
    case 'CAA': {
      // value: "flags tag value" e.g. "0 issue letsencrypt.org"
      const m = value.trim().match(/^(\d+)\s+(\S+)\s+"?([^"]+)"?$/);
      const flags = m ? Number(m[1]) : 0, tag = m ? m[2] : 'issue', val = m ? m[3] : value;
      const tagBuf = Buffer.from(tag);
      return Buffer.concat([Buffer.from([flags, tagBuf.length]), tagBuf, Buffer.from(val)]);
    }
    case 'TXT': {
      const text = Buffer.from(value);
      const len  = Buffer.from([text.length]);
      return Buffer.concat([len, text]);
    }
    case 'SOA': {
      const parts = value.trim().split(/\s+/);
      const mname   = parts[0] ? parts[0].replace(/\.$/, '') : `ns1.${zoneOrigin}`;
      const rname   = parts[1] ? parts[1].replace(/\.$/, '') : `hostmaster.${zoneOrigin}`;
      const serial  = parseInt(parts[2])  || (Date.now() / 1000 | 0);
      const refresh = parseInt(parts[3])  || 3600;
      const retry   = parseInt(parts[4])  || 900;
      const expire  = parseInt(parts[5])  || 604800;
      const minimum = parseInt(parts[6])  || 300;
      const fixed = Buffer.alloc(20);
      fixed.writeUInt32BE(serial,  0);
      fixed.writeUInt32BE(refresh, 4);
      fixed.writeUInt32BE(retry,   8);
      fixed.writeUInt32BE(expire,  12);
      fixed.writeUInt32BE(minimum, 16);
      return Buffer.concat([encodeName(mname), encodeName(rname), fixed]);
    }
    default:
      return Buffer.from(value);
  }
}

function buildResponse(query, answers) {
  const { id, questions } = query;

  const hdr = Buffer.alloc(12);
  hdr.writeUInt16BE(id, 0);
  hdr.writeUInt16BE(0x8400 | (answers.length ? 0 : 0x0003), 2); // NXDOMAIN if no answers
  hdr.writeUInt16BE(questions.length, 4);
  hdr.writeUInt16BE(answers.length, 6);
  hdr.writeUInt16BE(0, 8);
  hdr.writeUInt16BE(0, 10);

  const qBufs = questions.map(q => {
    const nameBuf = encodeName(q.name);
    const tail = Buffer.alloc(4);
    tail.writeUInt16BE(q.qtype, 0);
    tail.writeUInt16BE(q.qclass, 2);
    return Buffer.concat([nameBuf, tail]);
  });

  const ansBufs = answers.map(r => {
    const effectiveZone = zoneOriginFor(questions[0]?.name || cfg.primaryDomain);
    // Wildcard match (r.name === '*'): RFC 1034 requires the answer's NAME
    // field to be the name actually queried, never the literal "*.domain"
    // label — a resolver won't accept "*.domain" as an answer to a question
    // about "foo.domain". This was the second half of the wildcard bug: the
    // matching logic alone wasn't enough without this too.
    const answerName = r.name === '*' ? (questions[0]?.name || effectiveZone) : dz.fqdn(r.name, effectiveZone);
    const nameBuf = encodeName(answerName);
    const rdata   = encodeRdata(r.type, r.value, effectiveZone);
    const meta    = Buffer.alloc(10);
    meta.writeUInt16BE(DNS_TYPES[r.type] || 1, 0);
    meta.writeUInt16BE(1, 2);
    meta.writeUInt32BE(r.ttl || (cfg.zones[effectiveZone]?.ttl) || 300, 4);
    meta.writeUInt16BE(rdata.length, 8);
    return Buffer.concat([nameBuf, meta, rdata]);
  });

  return Buffer.concat([hdr, ...qBufs, ...ansBufs]);
}

function handleQuery(buf) {
  try {
    const query   = parseQuery(buf);
    const q       = query.questions[0];
    if (!q) return buildResponse(query, []);
    const answers = dz.lookupRecords(cfg.zones, q.name, q.qtype);
    ipc.db.insert('dns_log', { name: q.name, type: DNS_TYPES_INV[q.qtype], answers: answers.length }).catch(() => {});
    return buildResponse(query, answers);
  } catch (e) {
    log(`parse error: ${e.message}`, 'ERROR');
    return Buffer.alloc(0);
  }
}

// ─── servers ──────────────────────────────────────────────────────────────────

function startUDP(port) {
  port = port || cfg.port;
  const sock = dgram.createSocket('udp4');
  sock.on('message', (msg, rinfo) => {
    const resp = handleQuery(msg);
    if (resp.length) sock.send(resp, rinfo.port, rinfo.address);
  });
  sock.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      const fallback = port === 5353 ? 5354 : port + 1;
      log(`UDP port ${port} in use (mDNS/Bonjour?) — trying :${fallback}`, 'WARN');
      sock.close();
      startUDP(fallback);
    } else {
      log(`UDP error: ${err.message}`, 'ERROR');
    }
  });
  sock.bind(port, () => {
    log(`UDP/DNS listening on :${port}`);
    claimPort(port);
    cfg._udpPort = port;
    reportPortsToFirewall();
  });
}

function startTCP(port) {
  port = port || cfg.port;
  const server = net.createServer(socket => {
    socket.on('data', data => {
      if (data.length < 2) return;
      const msgLen = data.readUInt16BE(0);
      const msg    = data.slice(2, 2 + msgLen);
      const resp   = handleQuery(msg);
      if (resp.length) {
        const lenBuf = Buffer.alloc(2);
        lenBuf.writeUInt16BE(resp.length);
        socket.write(Buffer.concat([lenBuf, resp]));
      }
    });
    socket.on('error', () => {});
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      const next = port + 1;
      log(`TCP port ${port} in use — trying :${next}`, 'WARN');
      startTCP(next);
    } else {
      log(`TCP error: ${err.message}`, 'ERROR');
    }
  });
  server.listen(port, () => {
    cfg.port = port;
    log(`TCP/DNS listening on :${port}`);
    claimPort(port);
    reportPortsToFirewall();
  });
}

// §GAP found 2026-08-12: UDP and TCP fall back independently on EADDRINUSE
// (see startUDP/startTCP's own error handlers) and can end up on different
// real ports (observed: TCP 5353, UDP 5354, same boot, mDNS holding UDP
// 5353 only). Nothing told firewall.js's UPnP mapping, which forwards
// external 53 -> internal 53 unconditionally — router forwards a port
// nothing listens on. Fired from both binds; harmless if the other hasn't
// bound yet (undefined field just omitted), self-corrects once both have.
function reportPortsToFirewall() {
  ipc.send('route', { type: 'dns:ports', tcpPort: cfg.port, udpPort: cfg._udpPort }, 'firewall');
}

// ─── IPC ──────────────────────────────────────────────────────────────────────
// Every handler echoes `requestId` when present — the `ipcReq`/`ipcReq`-style
// callers used throughout this codebase match replies by requestId, and a
// handler that doesn't echo it silently times out every caller forever
// (this was a real, previously undetected bug — zone:get never echoed it).

ipc.on('zone:update', payload => {
  // `type` here is the routing discriminator; the actual DNS record type
  // travels as `type2` — see the comment this repo already carries on this
  // convention in every other engine that calls zone:update.
  const { name, type2, value, ttl, domain, requestId } = payload || {};
  if (!name || !type2 || !value) {
    if (requestId) ipc.send('zone:update:reply', { requestId, ok: false, error: 'name, type2, and value are required' });
    return;
  }
  const r = dz.upsertRecord(cfg.zones, defaultDomain(domain), { name, type: type2, value, ttl });
  if (r.ok) { cfg.zones = r.zones; persist(); log(`zone hot-updated: [${defaultDomain(domain)}] ${name} ${type2} -> ${value}`); }
  if (requestId) ipc.send('zone:update:reply', { requestId, ok: r.ok, error: r.error });
});

ipc.on('zone:delete', payload => {
  const { name, type2, domain, requestId } = payload || {};
  const r = dz.deleteRecord(cfg.zones, defaultDomain(domain), name, type2);
  if (r.ok) { cfg.zones = r.zones; persist(); log(`zone record deleted: [${defaultDomain(domain)}] ${name} ${type2}`); }
  if (requestId) ipc.send('zone:delete:reply', { requestId, ok: r.ok, error: r.error, removed: r.removed });
});

ipc.on('zone:get', payload => {
  const domain = defaultDomain(payload?.domain);
  const zone = cfg.zones[dz.normDomain(domain)];
  ipc.send('zone:get:reply', {
    requestId: payload?.requestId,
    domain, records: zone?.records || [], ttl: zone?.ttl || 300,
    ns1: zone?.ns1, ns2: zone?.ns2, exists: !!zone,
  });
});

ipc.on('zone:list', payload => {
  ipc.send('zone:list:reply', { requestId: payload?.requestId, zones: dz.listZones(cfg.zones), primaryDomain: cfg.primaryDomain });
});

ipc.on('zone:create', payload => {
  const { domain, ns1, ns2, ttl, requestId } = payload || {};
  const r = dz.createZone(cfg.zones, domain, { ns1, ns2, ttl });
  if (r.ok) { cfg.zones = r.zones; persist(); log(`zone created: ${dz.normDomain(domain)}`); }
  if (requestId) ipc.send('zone:create:reply', { requestId, ok: r.ok, error: r.error, domain: dz.normDomain(domain) });
});

ipc.on('zone:remove', payload => {
  const { domain, requestId } = payload || {};
  const r = dz.removeZone(cfg.zones, domain, cfg.primaryDomain);
  if (r.ok) { cfg.zones = r.zones; persist(); log(`zone removed: ${dz.normDomain(domain)}`); }
  if (requestId) ipc.send('zone:remove:reply', { requestId, ok: r.ok, error: r.error });
});

// ─── start ────────────────────────────────────────────────────────────────────

log('dns engine starting');
startUDP();
startTCP();

// ─── status ping (monitor health check) ──────────────────────────────────────
ipc.on('status:ping', payload => {
  ipc.send('status:pong', { requestId: payload?.requestId, engine: NAME, alive: true, ts: Date.now() });
});
