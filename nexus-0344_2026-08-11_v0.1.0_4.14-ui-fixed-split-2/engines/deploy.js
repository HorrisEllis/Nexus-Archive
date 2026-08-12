'use strict';
// [NEXUS-COMPONENT-ID]
const COMPONENT_ID   = 'dp7c2e14';
const COMPONENT_UUID = '6b5f52fb-24c4-4f80-b800-16637b1701b8';
const COMPONENT_NAME = 'deploy';
// [/NEXUS-COMPONENT-ID]
/**
 * engines/deploy.js — universal project/zip deploy engine
 * ─────────────────────────────────────────────────────────────────────────────
 * §5.9 sovereign: owns its own state (state/deploy/*), its own persistence
 * (release directories under each site's releases dir), and its own execution. It
 * does not read webserver.js's vhost config files directly — vhost data is
 * webserver's, requested over the (now-fixed) IPC route/reply bus, never
 * read off disk out-of-band (§5.9, §10.3).
 *
 * Built on two already-tested, dependency-free layers (§3.1 bottom-up):
 *   engines/lib/safe-zip.js     — hostile-input-safe archive parsing (Phase 1)
 *   engines/lib/deploy-store.js — staging / atomic promote / rollback (Phase 2)
 * Neither of those layers knows this file exists. This file is the thin
 * HTTP + IPC shell around them (§3.4 — raw code proven before the API).
 *
 * HTTP API (proxied through UI on :9000/ui/deploy/*):
 *   GET  /deploy/sites                 list deployable sites (via webserver IPC)
 *   GET  /deploy/releases/:hostname    release history + current marker
 *   POST /deploy/run                   multipart upload -> stage -> gate -> promote
 *   POST /deploy/rollback              { hostname, deployId } -> promote an old release
 *   POST /deploy/prune                 { hostname, keep } -> explicit history cleanup
 *
 * Interaction contract (§5.10):
 *   Input:  hostname (must be an existing vhost, or newSite:{hostname,stack}),
 *           mode: 'replace'|'merge'|'subfolder', subfolder?, archive bytes
 *   Output: { ok, deployId, filesWritten, bytesWritten, warnings[], rejectedEntries[] }
 *   Failure modes (§1.2, named and loud):
 *     ARCHIVE_INVALID, BUDGET_EXCEEDED, PATH_ESCAPE, EXEC_MODE_REJECTED,
 *     SITE_NOT_FOUND, DISK_FULL, ALREADY_IN_PROGRESS, HEALTH_CHECK_FAILED
 *   HEALTH_CHECK_FAILED (§17.10 verify before you promote, now actually
 *   enforced): after promote(), the deployed site is hit with a real HTTP
 *   request. A non-2xx/3xx response auto-rolls back to whatever release was
 *   live before this deploy — the failed release stays in history (nothing
 *   is deleted, §0.3) but is never left as the live site. Skippable per-call
 *   via the `skipHealthCheck` form field, for sites that intentionally 404
 *   on `/` or aren't meant to answer plain HTTP.
 *   Permissions: filesystem writes scoped to sites/*\/releases + state/deploy/*
 *   only — never NEXUS_ROOT itself. See DEPLOY_DROPZONE_MAP_AND_SPEC.md §1 for
 *   why that boundary is non-negotiable.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { ipc, conf, log, claimPort, isInit, NAME } = require('./_engine');
const { inspectZip } = require('./lib/safe-zip');
const store = require('./lib/deploy-store');

const ROOT       = process.env.NEXUS_ROOT || path.join(__dirname, '..');
const STATE_DIR  = path.join(ROOT, 'state', 'deploy');

const DEFAULTS = {
  listenPort:      4010,
  maxUploadBytes:  1024 * 1024 * 1024,   // 1 GB request body ceiling
  maxEntries:      20000,
  maxTotalBytes:   2 * 1024 * 1024 * 1024,
  maxEntryBytes:   512 * 1024 * 1024,
  maxRatio:        300,
  // Execution-mode gate (Phase 4): extensions that are server-executable.
  // Default posture is REJECT the whole deploy if the target site's stack
  // is 'static' and any of these appear — not strip-and-continue, not
  // silently-serve-as-text. See §2 of the spec doc for why reject-by-default.
  execExtensions:  ['.php', '.php3', '.php4', '.php5', '.phtml', '.cgi', '.pl', '.sh', '.asp', '.aspx', '.jsp'],
  execModeDefault: 'reject', // 'reject' | 'strip'
};

if (isInit()) {
  conf.init(DEFAULTS);
  fs.mkdirSync(STATE_DIR, { recursive: true });
  log('deploy: wrote default conf');
  process.exit(0);
}

const cfg = conf.load(DEFAULTS);
fs.mkdirSync(STATE_DIR, { recursive: true });

// only one deploy per hostname in flight at a time — §"ALREADY_IN_PROGRESS"
const inFlight = new Set();

// ─── IPC request/reply to webserver (uses the now-fixed route bus) ──────────
function ipcReq(engine, type, payload, ms = 6000) {
  return new Promise((resolve, reject) => {
    const requestId = `deploy-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const replyType = type + ':reply';
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      ipc.off(replyType, handler);
      reject(new Error(`${type} timeout — is ${engine} running?`));
    }, ms);
    function handler(payload) {
      if (payload?.requestId !== requestId) return;
      if (done) return;
      done = true;
      clearTimeout(timer);
      ipc.off(replyType, handler);
      resolve(payload);
    }
    ipc.on(replyType, handler);
    ipc.send('route', { type, ...payload, requestId }, engine);
  });
}

async function getVhosts() {
  const r = await ipcReq('webserver', 'webserver:vhost:list', {});
  return r?.vhosts || [];
}

async function getVhost(hostname) {
  const list = await getVhosts();
  return list.find(v => v.hostname === hostname) || null;
}

async function createVhost(hostname, stack) {
  const r = await ipcReq('webserver', 'webserver:vhost:add', {
    vhost: { hostname, stack: stack || 'static', root: path.join(ROOT, 'sites', hostname, 'public'), index: ['index.html', 'index.htm'] },
  });
  return r;
}

// ─── execution-mode gate (Phase 4) ───────────────────────────────────────────
function execGate(entries, stack) {
  if (stack === 'php') return { ok: true, entries, warnings: [] }; // explicit trust decision the user already made for this site
  const bad = entries.filter(e => !e.isDir && cfg.execExtensions.includes(path.extname(e.name).toLowerCase()));
  if (bad.length === 0) return { ok: true, entries, warnings: [] };

  if (cfg.execModeDefault === 'strip') {
    const badNames = new Set(bad.map(e => e.name));
    return {
      ok: true,
      entries: entries.filter(e => !badNames.has(e.name)),
      warnings: bad.map(e => `stripped executable-extension file from static deploy: ${e.name}`),
    };
  }
  return {
    ok: false,
    error: {
      code: 'EXEC_MODE_REJECTED',
      message: `deploy contains ${bad.length} server-executable file(s) (${bad.slice(0, 5).map(e => e.name).join(', ')}${bad.length > 5 ? ', ...' : ''}) but this site's stack is 'static' — refusing by default. Change the site's stack to 'php' if this is intentional, or remove these files from the archive.`,
      rejectedEntries: bad.map(e => e.name),
    },
  };
}

// ─── multipart parser (buffers to memory — deploy needs the whole zip in RAM
//     for safe-zip.inspectZip anyway; bounded by maxUploadBytes) ─────────────
function readMultipartFile(req, boundary, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', d => {
      size += d.length;
      if (size > maxBytes) { req.destroy(); reject(Object.assign(new Error('upload too large'), { code: 'BUDGET_EXCEEDED' })); return; }
      chunks.push(d);
    });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const sep = Buffer.from('--' + boundary);
        const fields = {};
        let fileBuf = null;
        let start = body.indexOf(sep);
        while (start !== -1) {
          const next = body.indexOf(sep, start + sep.length);
          if (next === -1) break;
          const part = body.slice(start + sep.length, next);
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const header = part.slice(0, headerEnd).toString('utf8');
            let data = part.slice(headerEnd + 4);
            if (data.slice(-2).toString() === '\r\n') data = data.slice(0, -2);
            const nameMatch = header.match(/name="([^"]+)"/i);
            const fileMatch = header.match(/filename="([^"]+)"/i);
            if (nameMatch && fileMatch) {
              fileBuf = data;
            } else if (nameMatch) {
              fields[nameMatch[1]] = data.toString('utf8');
            }
          }
          start = next;
        }
        resolve({ fields, fileBuf });
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ─── post-promote health check (§ "verify before you promote" — the part
// that was previously only staged, never actually checked) ─────────────────
function healthCheck(hostname, timeoutMs = 6000) {
  return new Promise(resolve => {
    const req = http.request({
      hostname: '127.0.0.1', port: 7700, path: '/', method: 'GET',
      headers: { host: hostname }, timeout: timeoutMs,
    }, res => {
      res.resume();
      // 2xx-3xx = healthy. 4xx/5xx = the deploy is live but broken — that's
      // exactly the case this exists to catch, not to wave through.
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: null, error: 'timeout — webserver did not respond' }); });
    req.on('error', e => resolve({ ok: false, status: null, error: e.message }));
    req.end();
  });
}

// ─── HTTP handler ─────────────────────────────────────────────────────────────
function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const pathname = url.pathname;

    if (req.method === 'GET' && pathname === '/deploy/sites') {
      const vhosts = await getVhosts();
      return json(res, 200, { sites: vhosts.map(v => ({ hostname: v.hostname, stack: v.stack || 'static' })) });
    }

    if (req.method === 'GET' && pathname.startsWith('/deploy/releases/')) {
      const hostname = decodeURIComponent(pathname.slice('/deploy/releases/'.length));
      return json(res, 200, { releases: store.listReleases(ROOT, hostname) });
    }

    if (req.method === 'POST' && pathname === '/deploy/run') {
      const ct = req.headers['content-type'] || '';
      const m = ct.match(/boundary=(.+)$/);
      if (!m) return json(res, 400, { ok: false, error: { code: 'ARCHIVE_INVALID', message: 'expected multipart/form-data' } });

      let parsed;
      try {
        parsed = await readMultipartFile(req, m[1], cfg.maxUploadBytes);
      } catch (e) {
        return json(res, 413, { ok: false, error: { code: e.code || 'ARCHIVE_INVALID', message: e.message } });
      }
      const { fields, fileBuf } = parsed;
      if (!fileBuf) return json(res, 400, { ok: false, error: { code: 'ARCHIVE_INVALID', message: 'no file part found in upload' } });

      const hostname = fields.hostname;
      const mode = fields.mode || 'replace';
      const subfolder = fields.subfolder || undefined;
      if (!hostname) return json(res, 400, { ok: false, error: { code: 'SITE_NOT_FOUND', message: 'hostname is required' } });
      if (!['replace', 'merge', 'subfolder'].includes(mode)) return json(res, 400, { ok: false, error: { code: 'ARCHIVE_INVALID', message: `unknown mode "${mode}"` } });

      if (inFlight.has(hostname)) {
        return json(res, 409, { ok: false, error: { code: 'ALREADY_IN_PROGRESS', message: `a deploy for ${hostname} is already running` } });
      }

      let vhost = await getVhost(hostname).catch(() => null);
      if (!vhost) {
        if (fields.createSite === 'true') {
          await createVhost(hostname, fields.stack || 'static');
          vhost = await getVhost(hostname);
        }
        if (!vhost) return json(res, 404, { ok: false, error: { code: 'SITE_NOT_FOUND', message: `no site "${hostname}" — pass createSite=true to create it` } });
      }

      inFlight.add(hostname);
      try {
        const inspection = inspectZip(fileBuf, {
          maxEntries: cfg.maxEntries, maxTotalBytes: cfg.maxTotalBytes,
          maxEntryBytes: cfg.maxEntryBytes, maxRatio: cfg.maxRatio,
        });
        if (!inspection.ok) return json(res, 422, { ok: false, error: inspection.error });

        const gated = execGate(inspection.entries, vhost.stack || 'static');
        if (!gated.ok) return json(res, 422, { ok: false, error: gated.error });

        const staged = store.stageRelease(ROOT, hostname, gated.entries, mode, subfolder);
        const previousReleaseId = store.currentReleaseId(ROOT, hostname); // capture BEFORE promote — this is what we roll back to
        store.promote(ROOT, hostname, staged.deployId);

        const skipHealthCheck = fields.skipHealthCheck === 'true';
        let health = { ok: true, skipped: true };
        if (!skipHealthCheck) {
          health = await healthCheck(hostname);
          if (!health.ok) {
            let rolledBackTo = null;
            if (previousReleaseId) {
              store.rollback(ROOT, hostname, previousReleaseId);
              rolledBackTo = previousReleaseId;
              log(`deploy: ${hostname} <- ${staged.deployId} FAILED health check (${health.status || health.error}) — auto-rolled back to ${previousReleaseId}`, 'WARN');
            } else {
              log(`deploy: ${hostname} <- ${staged.deployId} FAILED health check (${health.status || health.error}) — no prior release to roll back to, left live`, 'WARN');
            }
            return json(res, 502, {
              ok: false,
              error: {
                code: 'HEALTH_CHECK_FAILED',
                message: `deployed but the site returned ${health.status || health.error} on the root path — ${rolledBackTo ? 'automatically rolled back to the previous release' : 'no previous release existed, so it was left live — fix and redeploy'}`,
                deployId: staged.deployId, rolledBackTo,
              },
            });
          }
        }

        log(`deploy: ${hostname} <- ${staged.deployId} (${staged.filesWritten} files, ${staged.bytesWritten}B, mode=${mode}, health=${health.skipped ? 'skipped' : 'ok:' + health.status})`);
        ipc.send('deploy:completed', {
          hostname, deployId: staged.deployId, filesWritten: staged.filesWritten,
          bytesWritten: staged.bytesWritten, warnings: gated.warnings, ts: Date.now(),
        });

        return json(res, 200, {
          ok: true, deployId: staged.deployId, filesWritten: staged.filesWritten,
          bytesWritten: staged.bytesWritten, warnings: gated.warnings, rejectedEntries: [],
        });
      } catch (e) {
        log(`deploy: ${hostname} failed — ${e.message}`, 'ERROR');
        return json(res, 500, { ok: false, error: { code: 'DISK_FULL', message: e.message } });
      } finally {
        inFlight.delete(hostname);
      }
    }

    if (req.method === 'POST' && pathname === '/deploy/rollback') {
      const chunks = []; for await (const c of req) chunks.push(c);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      const { hostname, deployId } = body;
      if (!hostname || !deployId) return json(res, 400, { ok: false, error: { code: 'ARCHIVE_INVALID', message: 'hostname and deployId required' } });
      try {
        store.rollback(ROOT, hostname, deployId);
        ipc.send('deploy:completed', { hostname, deployId, rollback: true, ts: Date.now() });
        return json(res, 200, { ok: true, deployId });
      } catch (e) {
        return json(res, 404, { ok: false, error: { code: 'ARCHIVE_INVALID', message: e.message } });
      }
    }

    if (req.method === 'POST' && pathname === '/deploy/prune') {
      const chunks = []; for await (const c of req) chunks.push(c);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      const { hostname, keep } = body;
      if (!hostname) return json(res, 400, { ok: false, error: { code: 'ARCHIVE_INVALID', message: 'hostname required' } });
      const deleted = store.pruneReleases(ROOT, hostname, typeof keep === 'number' ? keep : 5);
      return json(res, 200, { ok: true, deleted });
    }

    json(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'no such deploy route' } });
  } catch (e) {
    log(`deploy: unhandled error — ${e.message}`, 'ERROR');
    json(res, 500, { ok: false, error: { code: 'INTERNAL', message: e.message } });
  }
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    const next = cfg.listenPort + 1;
    log(`deploy: port ${cfg.listenPort} in use — trying :${next}`, 'WARN');
    setTimeout(() => server.listen(next, () => { log(`deploy: on :${next}`); claimPort(next); }), 300);
  } else { throw err; }
});

server.listen(cfg.listenPort, () => {
  log(`deploy engine on :${cfg.listenPort}`);
  claimPort(cfg.listenPort);
});

ipc.on('status:ping', payload => {
  ipc.send('status:pong', { requestId: payload?.requestId, engine: NAME, alive: true, ts: Date.now() });
});

log('deploy engine ready');
