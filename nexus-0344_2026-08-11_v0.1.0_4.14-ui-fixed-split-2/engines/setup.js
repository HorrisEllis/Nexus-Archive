'use strict';
// [NEXUS-COMPONENT-ID]
const COMPONENT_ID   = 'af7289d4';
const COMPONENT_UUID = 'af7289d4-42a0-4026-a787-2357439b469a';
const COMPONENT_NAME = 'setup';
// [/NEXUS-COMPONENT-ID]
/**
 * engines/setup.js — first-run & dynamic-IP drift-recovery orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 * §5.9 sovereign, §3.4 built on tested raw logic (engines/lib/setup-orchestrator.js).
 * This file's only job is to inject REAL step runners (calling the real
 * firewall/glue/tls engines) into that pure orchestrator, expose it over
 * HTTP for the UI wizard, and subscribe to ddns's ip:changed broadcast for
 * automatic drift recovery.
 *
 * It does NOT own IP detection (ddns.js does — see the Phase 1 fix), does
 * NOT own GoDaddy credentials (glue.js does, via /glue/config), and does NOT
 * reimplement glue/DNS/TLS logic. It only sequences calls to those engines
 * and persists progress so a crash mid-run is resumable (§17.10).
 *
 * conf/setup.conf:
 *   domain              display copy of the configured domain (glue.js is authoritative)
 *   lastKnownIp          IP as of the last successful run
 *   lastSuccessfulRun     { ip, timestamp, steps:{upnp,sysfw,glue,tls}, ok, failedAt?, error? }
 *   firstRunComplete      has the wizard ever completed once
 *   currentStep           resume marker — non-null only while a run is genuinely in flight
 *                          or after a crash left it dangling
 *   autoRerunOnIpChange   whether an ip:changed event auto-triggers glue+tls re-run
 *
 * HTTP API (proxied through UI on :9000/ui/setup/*):
 *   GET  /setup/status        state + live drift check (current IP vs lastKnownIp)
 *   GET  /setup/drift-check   cheap version of the above, no side effects beyond the IP lookup
 *   POST /setup/configure     { domain, registrar, godaddy:{apiKey,apiSecret} } -> glue.js
 *   POST /setup/run           { force?, steps? } full orchestrated run
 *   POST /setup/resume        continue from currentStep after a crash
 * ─────────────────────────────────────────────────────────────────────────────
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { ipc, conf, log, claimPort, isInit, NAME } = require('./_engine');
const { runSteps, createIpDebouncer } = require('./lib/setup-orchestrator');

const ROOT = process.env.NEXUS_ROOT || path.join(__dirname, '..');

const DEFAULTS = {
  listenPort: 4011,
  domain: '',
  lastKnownIp: null,
  lastSuccessfulRun: null,
  firstRunComplete: false,
  currentStep: null,
  autoRerunOnIpChange: true,
  ipStableSeconds: 120, // debounce window before an IP change triggers a real run
  tlsPollTimeoutMs: 40000, // how long the tls step waits for a real cert to land on disk
};

if (isInit()) {
  conf.init(DEFAULTS);
  log('setup: wrote default conf');
  process.exit(0);
}

let cfg = conf.load(DEFAULTS);
function persist(state) { cfg = { ...cfg, ...state }; conf.save(cfg); }

let runLock = false; // only one /setup/run in flight at a time (§ ALREADY_IN_PROGRESS)

// ─── generic ipcReq (same proven pattern as ui.js / deploy.js) ──────────────
function ipcReq(engine, type, payload, ms = 15000) {
  return new Promise((resolve, reject) => {
    const requestId = `setup-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const replyType = type + ':reply';
    let done = false;
    const timer = setTimeout(() => {
      if (done) return; done = true;
      ipc.off(replyType, handler);
      reject(new Error(`${type} timeout — is ${engine} running?`));
    }, ms);
    function handler(payload) {
      if (payload?.requestId !== requestId) return;
      if (done) return; done = true;
      clearTimeout(timer);
      ipc.off(replyType, handler);
      resolve(payload);
    }
    ipc.on(replyType, handler);
    ipc.send('route', { type, ...payload, requestId }, engine);
  });
}

function httpGet(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: urlPath, method: 'GET' }, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.end();
  });
}
function httpPost(port, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const req = http.request({ hostname: '127.0.0.1', port, path: urlPath, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(b) }); } catch { resolve({ status: res.statusCode, body: {} }); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getCurrentIp() {
  const r = await ipcReq('ddns', 'ip:get', {}, 6000);
  return r?.ip || null;
}

// ─── real step runners (thin — no logic of their own, §3.4) ────────────────
const STEP_DEFS = [
  {
    key: 'upnp',
    run: async () => {
      const r = await ipcReq('firewall', 'upnp:open', {}, 20000);
      return { ok: !!(r?.ok || r?.skipped), detail: r?.skipped ? `skipped: ${r.reason}` : (r?.ok ? 'ports forwarded' : 'some ports failed') };
    },
  },
  {
    key: 'sysfw',
    run: async () => {
      const r = await ipcReq('firewall', 'sysfw:apply', {}, 15000);
      return { ok: !!(r?.ok || r?.skipped), detail: r?.skipped ? 'OS firewall tool unavailable' : (r?.ok ? 'rules applied' : 'some rules failed') };
    },
  },
  {
    key: 'glue',
    run: async () => {
      // Prefer the full automated GoDaddy flow if credentials are configured;
      // fall back to the local-zone-only apply (manual registrar path) —
      // never fail the whole run just because no API key was given (§ no
      // credentials configured -> falls back cleanly, not a hard failure).
      const status = await httpGet(4009, '/glue/status').catch(() => null);
      const hasGodaddyCreds = status?.godaddyConfigured; // best-effort; see fallback below
      const r = await httpPost(4009, '/glue/godaddy', {}).catch(() => null);
      if (r && r.body && r.body.ok) return { ok: true, detail: 'glue + NS delegation submitted to GoDaddy' };
      // fall back: at least sync the local zone so the panel is internally
      // consistent, and surface the registrar's manual instructions.
      const applied = await httpPost(4009, '/glue/apply', {}).catch(() => null);
      if (applied && applied.body && applied.body.ok) {
        return { ok: true, detail: 'local zone synced — no GoDaddy API credentials configured, manual glue/NS steps still required at your registrar' };
      }
      return { ok: false, detail: (applied?.body?.error) || 'could not sync local zone' };
    },
  },
  {
    key: 'tls',
    run: async () => {
      if (!cfg.domain) return { ok: false, detail: 'no domain configured' };
      const certPath = path.join(ROOT, 'conf', 'tls', 'certs', `${cfg.domain}.crt`);
      const alreadyIssued = fs.existsSync(certPath);
      if (alreadyIssued) return { ok: true, detail: 'certificate already issued and on disk' };

      ipc.send('route', { type: 'tls:issue', domain: cfg.domain }, 'tls'); // fire-and-forget — tls:issue has no reply

      // Poll for the actual cert file rather than trusting the request was
      // enough — ACME can fail silently (port 80 unreachable, rate limited,
      // DNS not yet propagated) and the old fire-and-forget version had no
      // way to ever report that. This is a real wait (up to ~40s default),
      // not instant, because real ACME issuance isn't instant either.
      const deadline = Date.now() + (cfg.tlsPollTimeoutMs || 40000);
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 3000));
        if (fs.existsSync(certPath)) return { ok: true, detail: 'certificate issued' };
      }
      return {
        ok: false,
        detail: `certificate request submitted but did not issue within ${Math.round((cfg.tlsPollTimeoutMs || 40000) / 1000)}s — usually means port 80 isn't reachable from the internet yet, or DNS hasn't propagated. Check the SSL/TLS page; issuance may still complete in the background.`,
      };
    },
  },
];

async function doRun({ force, steps, startFrom } = {}) {
  if (runLock) return { ok: false, error: { code: 'ALREADY_IN_PROGRESS', message: 'a setup run is already in progress' } };
  runLock = true;
  try {
    const currentIp = await getCurrentIp();
    if (!currentIp) return { ok: false, error: { code: 'NO_IP', message: 'could not determine current public IP — is ddns running and reachable?' } };
    const activeSteps = steps ? STEP_DEFS.filter(s => steps.includes(s.key)) : STEP_DEFS;
    const result = await runSteps(activeSteps, cfg, { currentIp, force, startFrom }, persist);
    return result;
  } finally {
    runLock = false;
  }
}

// ─── ip:changed subscription (Phase 4 — auto drift recovery) ────────────────
const debouncer = createIpDebouncer((cfg.ipStableSeconds || 120) * 1000, async settledIp => {
  if (!cfg.autoRerunOnIpChange || !cfg.firstRunComplete) return;
  log(`setup: IP settled at ${settledIp} — auto re-running glue+tls`);
  const r = await doRun({ steps: ['glue', 'tls'] }).catch(e => ({ ok: false, error: { message: e.message } }));
  log(`setup: auto re-run ${r.ok ? 'succeeded' : 'failed: ' + (r.error?.message || r.results?.[r.failedAt]?.detail)}`, r.ok ? 'INFO' : 'WARN');
});

ipc.on('ip:changed', payload => {
  if (payload?.ip) debouncer.notify(payload.ip);
});

// ─── HTTP API ─────────────────────────────────────────────────────────────────
function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise(resolve => {
    let b = ''; req.on('data', d => b += d);
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url.split('?')[0];

    if (req.method === 'GET' && url === '/setup/status') {
      const currentIp = await getCurrentIp().catch(() => null);
      const drift = !!(currentIp && cfg.lastKnownIp && currentIp !== cfg.lastKnownIp);
      return json(res, 200, { ...cfg, currentIp, drift, runInProgress: runLock });
    }

    if (req.method === 'GET' && url === '/setup/drift-check') {
      const currentIp = await getCurrentIp().catch(() => null);
      const drift = !!(currentIp && cfg.lastKnownIp && currentIp !== cfg.lastKnownIp);
      const lastRunFailed = cfg.lastSuccessfulRun && cfg.lastSuccessfulRun.ok === false;
      return json(res, 200, { currentIp, lastKnownIp: cfg.lastKnownIp, drift, lastRunFailed, firstRunComplete: cfg.firstRunComplete });
    }

    if (req.method === 'POST' && url === '/setup/configure') {
      const body = await readBody(req);
      if (body.domain) { cfg.domain = body.domain; conf.save(cfg); }
      const r = await httpPost(4009, '/glue/config', body).catch(e => ({ status: 502, body: { error: e.message } }));
      return json(res, r.status || 200, r.body);
    }

    if (req.method === 'POST' && url === '/setup/run') {
      const body = await readBody(req);
      const r = await doRun({ force: !!body.force, steps: body.steps });
      return json(res, r.ok ? 200 : (r.error?.code === 'ALREADY_IN_PROGRESS' ? 409 : 422), r);
    }

    if (req.method === 'POST' && url === '/setup/resume') {
      if (!cfg.currentStep) return json(res, 400, { ok: false, error: { code: 'NOTHING_TO_RESUME', message: 'no run is currently pending' } });
      const r = await doRun({ startFrom: cfg.currentStep });
      return json(res, r.ok ? 200 : 422, r);
    }

    json(res, 404, { error: 'not found' });
  } catch (e) {
    log(`setup: unhandled error — ${e.message}`, 'ERROR');
    json(res, 500, { error: e.message });
  }
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    const next = cfg.listenPort + 1;
    log(`setup: port ${cfg.listenPort} in use — trying :${next}`, 'WARN');
    setTimeout(() => server.listen(next, () => { log(`setup: on :${next}`); claimPort(next); }), 300);
  } else { throw err; }
});

server.listen(cfg.listenPort, () => {
  log(`setup engine on :${cfg.listenPort}`);
  claimPort(cfg.listenPort);
});

ipc.on('status:ping', payload => {
  ipc.send('status:pong', { requestId: payload?.requestId, engine: NAME, alive: true, ts: Date.now() });
});

log('setup engine ready');
