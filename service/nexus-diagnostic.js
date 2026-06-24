'use strict';
// service/nexus-diagnostic.js — System Auditing + Monitoring Service
// UUID: nexus-diagnostic-service-v1-0000-4000-0000-000000000001
//
// A running ICO kernel that:
//   - Reads all system ledgers every N seconds
//   - Computes sigma/friction/drift per system
//   - Detects gaps (baseline deviations, missing heartbeats, stuck queues)
//   - Surfaces gaps in real-time via SSE + REST
//   - Logs its own events to data/diagnostic/ledger/
//   - Failure mode ledger with solution + friction scoring
//
// HTTP :7825:
//   GET /status          — full system health snapshot
//   GET /gaps            — all open gaps across all systems
//   GET /friction        — per-system friction scores
//   GET /audit           — full audit: requires, syntax, endpoints, ledger health
//   GET /ledger/:system  — tail of a system's ledger
//   GET /baseline/:sys   — baseline stats for a system
//   GET /events          — SSE stream of all diagnostic events
//
// CLI:
//   node service/nexus-diagnostic.js           — start service
//   node service/nexus-diagnostic.js status    — check health
//   node service/nexus-diagnostic.js gaps      — print open gaps
//   node service/nexus-diagnostic.js audit     — full audit

const fs     = require('fs');
const path   = require('path');
const http   = require('http');
const crypto = require('crypto');

const { createICO }      = require('../lib/ico');
const { createContractVerifier, loadContracts } = require('../lib/cfr/contract-verifier');
const { createCFRField, computeRegime }         = require('../lib/cfr/field');
const { createBaseline } = require('../lib/baseline');
const { sigma, mean }    = require('../lib/baseline');
// ── Meta layer: telemetry codec replaces hand-rolled stats where available ────
let _metaTelemetry = null;
function _getMetaTel() {
  if (_metaTelemetry !== null) return _metaTelemetry;
  try { _metaTelemetry = require('../lib/meta/telemetry-codec/index.js'); } catch(_) { _metaTelemetry = false; }
  return _metaTelemetry;
}
// Per-system TelemetryRuntime instances — keyed by system name
const _sysRuntimes = {};
function _getSysRuntime(name) {
  if (!_sysRuntimes[name]) {
    const tel = _getMetaTel();
    if (tel) _sysRuntimes[name] = new tel.TelemetryRuntime({ serviceId: name });
  }
  return _sysRuntimes[name] || null;
}

// ── Diagnostic engines: 12-engine composite health pack (entropy_rate, snr_floor,
//    homeostasis, fault_tree, cascade_risk, fingerprint, ...) ─────────────────
// FIX: this function was called at two sites (/engines and /tension) but never
// defined anywhere in the file — a bare `_getDiagEngines()` call threw
// ReferenceError and crashed the entire diagnostic process (Node exits on an
// uncaught exception in an http handler), which cascaded into
// "contract.unreachable" for every other system on the next health pass.
// Follows the exact same lazy-require/cache-false precedent as _getMetaTel()
// above: if the engines module isn't present, this returns null instead of
// throwing, and both existing call sites already null-check it correctly
// (`if (!de) return 503` / `if (de2) {...}`) — they just needed the function
// to actually exist. §1.2 (nothing silent): logs once, not per-request.
// §FIX-14.8a-CORRECTED: the Phase 14.x expansion shipped lib/diag-engines/index.js,
// but it exports runAll(snapshot) -> {composite,status,engines,critical} — a
// different API than what /engines and /tension below actually call
// (runAllEngines({events,systemStates}) -> {healthScore,alertCount,alerts,
// engines:{X:{regime}}}). That exact API already exists, fully implemented
// with all 12 engines, in lib/diagnostic-engines.js — it was just never wired
// in here. Pointing the loader there fixes the real 503s with zero API risk.
// lib/diag-engines/ (the JAA-snapshot-based pack) is still installed and
// reachable via lib/nexus-expansion-boot.js#getDiagEngines() for future use
// against buildDiagSnapshot(jaaDB, bus) — just not as this endpoint's source.
let _diagEngines = null;
let _diagEnginesWarned = false;
function _getDiagEngines() {
  if (_diagEngines !== null) return _diagEngines || null;
  try {
    _diagEngines = require('../lib/diagnostic-engines.js');
  } catch (_) {
    _diagEngines = false;
    if (!_diagEnginesWarned) {
      _diagEnginesWarned = true;
      console.warn(`[nexus-diagnostic] diagnostic engines module not found (../lib/diagnostic-engines) — ` +
        `/engines and the engine summary on /tension will report unavailable instead of crashing. ` +
        `This is a real gap (Phase 47/CG-class: missing module, not a transient failure) — ` +
        `build or wire ../lib/diag-engines if the 12-engine composite health pack is needed.`);
    }
  }
  return _diagEngines || null;
}

const ROOT    = path.join(__dirname, '..');

const PORT    = 7825;
const PID_FILE = path.join(ROOT, 'data/diagnostic/diagnostic.pid');

function uid() { return crypto.randomUUID(); }

// ── System registry ───────────────────────────────────────────────────────────

const SYSTEMS = {
  // §LEDGER-FIX: paths now match flat JSONL written by ledger-writer + jaaDB
  guardian:    { port: 7820, dataDir: 'data/guardian',    healthPath: '/health',   label: 'Guardian' },
  cortex:      { port: 3748, dataDir: 'cortex/data',      healthPath: '/health', label: 'Cortex' },
  idearium:    { port: 4800, dataDir: 'data/idearium',    healthPath: '/health', label: 'Idearium' },
  orchestrator:{ port: 9000, dataDir: 'data/orchestrator',healthPath: '/health',   label: 'Orchestrator' },
  emerge:      { port: 4242, dataDir: 'data/emerge',      healthPath: '/status',  label: 'Emerge' },
  bridge:      { port: 9999, dataDir: 'data/bridge',      healthPath: '/health',   label: 'Bridge' },
  architect:   { port: 3747, dataDir: 'data/architect',   healthPath: '/health', label: 'Architect' },
  diagnostic:  { port: 7825, dataDir: 'data/diagnostic',  healthPath: '/status',   label: 'Diagnostic' },
  // §MONITOR-03: UI surfaces — probed as virtual systems, no dataDir
  'forge-shell':{ port: 9000, dataDir: 'data/orchestrator', healthPath: '/ui/forge-shell.html',
    label: 'Forge Shell', virtual: true,
    // Forge shell is served by orchestrator — it's healthy when orch is healthy
    // We track it separately to surface in the diagnostic tile
  },
};

// ── CLI dispatch ──────────────────────────────────────────────────────────────

const cmd = process.argv[2];
if      (cmd === 'status') { checkStatus(); }
else if (cmd === 'stop')   { stopService(); }
else if (cmd === 'gaps')   { printGaps(); }
else if (cmd === 'audit')  { runAudit().then(r => { console.log(JSON.stringify(r, null, 2)); process.exit(0); }); }
else                       { startService(); }

// ── Check / Stop ──────────────────────────────────────────────────────────────

function checkStatus() {
  if (!fs.existsSync(PID_FILE)) { console.log('NOT RUNNING'); process.exit(1); }
  const pid = parseInt(fs.readFileSync(PID_FILE,'utf8').trim());
  try {
    process.kill(pid, 0);
    const req = http.get(`http://127.0.0.1:${PORT}/status`, { timeout:2000 }, res => {
      let b=''; res.on('data',d=>b+=d); res.on('end',()=>{
        try { const d=JSON.parse(b); console.log('RUNNING pid='+pid+'\n'+JSON.stringify(d.summary,null,2)); process.exit(0); }
        catch { console.log('RUNNING pid='+pid); process.exit(0); }
      });
    });
    req.on('error',()=>{ console.log('RUNNING pid='+pid+' (port not responding)'); process.exit(0); });
  } catch { fs.unlinkSync(PID_FILE); console.log('NOT RUNNING (stale pid)'); process.exit(1); }
}

function stopService() {
  if (!fs.existsSync(PID_FILE)) { console.log('NOT RUNNING'); process.exit(0); }
  const pid = parseInt(fs.readFileSync(PID_FILE,'utf8').trim());
  try { process.kill(pid,'SIGTERM'); console.log(`SIGTERM → pid=${pid}`); fs.unlinkSync(PID_FILE); }
  catch { console.log('Failed to stop'); }
  process.exit(0);
}

async function printGaps() {
  const req = http.get(`http://127.0.0.1:${PORT}/gaps`, { timeout:3000 }, res => {
    let b=''; res.on('data',d=>b+=d); res.on('end',()=>{
      try {
        const d = JSON.parse(b);
        const gaps = d.gaps || [];
        if (!gaps.length) { console.log('No open gaps'); process.exit(0); }
        for (const g of gaps) {
          console.log(`[${g.severity||'medium'}] ${g.system} — ${g.type}: ${g.body||g.description||''}`);
        }
      } catch { console.log(b); }
      process.exit(0);
    });
  });
  req.on('error', () => {
    console.log('Diagnostic service not running. Start with: node service/nexus-diagnostic.js');
    process.exit(1);
  });
}

// ── Start service ─────────────────────────────────────────────────────────────

function startService() {
  fs.mkdirSync(path.join(ROOT, 'data/diagnostic/ledger'),   { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'data/diagnostic/gaps'),     { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'data/diagnostic/friction'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'data/diagnostic/invariant'),{ recursive: true });
  fs.writeFileSync(PID_FILE, String(process.pid));

  // Diagnostic ICO kernel
  const ico = createICO({
    name: 'diagnostic',
    root: path.join(ROOT, 'data/diagnostic'),
  });

  // Per-system baseline monitors
  const monitors = {};
  for (const [name, cfg] of Object.entries(SYSTEMS)) {
    monitors[name] = createBaseline({
      name,
      ledgerDir:    path.join(ROOT, cfg.dataDir),   // §LEDGER-FIX: dataDir is now the source
      failuresDir:  path.join(ROOT, cfg.dataDir, 'failures'),
      invariantDir: path.join(ROOT, cfg.dataDir, 'invariant'),
      baselineN:    10,
      sigmaThreshold: 0.25,
      onGap: (gap) => {
        gap.system = name;
        openGaps.set(gap.uuid, gap);
        broadcast({ type: 'gap.found', gap, ts: Date.now() });
        ico.ledger.append('gaps', { ...gap, ts: Date.now() });
        const cfrSnap = cfrFeed('cortex.gap.found', gap.sigma || 0);
        broadcast({ type: 'cfr.update', cfr: cfrSnap, ts: Date.now() });
        console.log(`[diag] GAP ${name}: ${gap.type} sigma=${gap.sigma}`);
      },
    });
  }

  // In-memory gap store (backed by ledger)
  const openGaps = new Map();

  // ── CFR field — local diagnostic field, nudged by gap/poll events ──────────
  const cfrField = createCFRField();
  function cfrFeed(type, sigmaScore = 0) {
    return cfrField.update(type, sigmaScore);
  }

  // ── Guardian CFR field — proxied from the ledger-backed source of truth ────
  let guardianCFR = null; // last fetched snapshot from :7820/cfr/state, or null if unreachable
  function fetchGuardianCFR() {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${SYSTEMS.guardian.port}/cfr/state`, { timeout: 1500 }, res => {
        let b = ''; res.on('data', d => b += d); res.on('end', () => {
          try { guardianCFR = JSON.parse(b); } catch { guardianCFR = null; }
          resolve(guardianCFR);
        });
      });
      req.on('error', () => { guardianCFR = null; resolve(null); });
      req.on('timeout', () => { req.destroy(); guardianCFR = null; resolve(null); });
    });
  }

  // SSE clients
  const sseClients = new Set();
  function broadcast(msg) {
    const payload = 'data: ' + JSON.stringify(msg) + '\n\n';
    for (const res of sseClients) {
      try { res.write(payload); } catch { sseClients.delete(res); }
    }
  }

  // ── Contract verifier — validates runtime behavior vs interaction contracts ──
  const contracts = loadContracts(ROOT);
  const _verifier = createContractVerifier({
    contracts,
    onViolation: (v) => {
      // Write violation to diagnostic ledger
      if (v.severity > 0) {
        ico.ledger.append('gaps', {
          type:     v.type,
          body:     v.message,
          system:   v.system,
          severity: v.severity > 0.7 ? 'high' : v.severity > 0.4 ? 'medium' : 'low',
          status:   'open',
          source:   'contract-verifier',
          ts:       Date.now(),
        });
        // Broadcast to diagnostic SSE
        _broadcast({ type: v.type, ...v });
      }
    },
  });

  // Tick the contract verifier every 5s to catch expired behavioral rules
  setInterval(() => _verifier.tick(), 5000).unref();

  // ── Polling loop — read ledgers + probe health ────────────────────────────

  const systemState = {};

  async function pollSystem(name, cfg) {
    const state = systemState[name] || { online: false, uptime: 0, friction: 0, gaps: [] };

    // 1. Probe health endpoint
    let online = false, uptime = 0, jobs = 0;
    try {
      await new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${cfg.port}${cfg.healthPath}`, { timeout: 2000 }, res => {
          let b = '';
          res.on('data', d => b += d);
          res.on('end', () => {
            online = res.statusCode === 200; // status code is ground truth regardless of body shape
            try {
              const d = JSON.parse(b);
              uptime = d.uptime || 0;
              jobs   = d.jobs   || 0;
            } catch {}
            resolve();
          });
        });
        req.on('error', () => resolve());
        req.on('timeout', () => { req.destroy(); resolve(); });
      });
    } catch {}

    // Feed to baseline
    monitors[name].observe({
      type:      online ? 'health.ok' : 'health.fail',
      latencyMs: 0,
      error:     !online,
      ts:        Date.now(),
    });

    // 2. Read recent ledger entries from flat JSONL (§LEDGER-FIX)
    // ledger-writer writes: data/<system>/event_log.jsonl
    // guardian still writes: data/guardian/ledger/events.ndjson (legacy path — read both)
    let recentEvents = [];
    try {
      const dataPath  = path.join(ROOT, cfg.dataDir);
      // Primary: flat event_log.jsonl (ledger-writer format)
      const flatFile  = path.join(dataPath, 'event_log.jsonl');
      if (fs.existsSync(flatFile)) {
        const lines = fs.readFileSync(flatFile, 'utf8').trim().split('\n').filter(Boolean);
        const recent = lines.slice(-20).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
        recentEvents.push(...recent);
      }
      // Legacy: guardian-style ledger/events.ndjson (backwards compat)
      const legacyFile = path.join(dataPath, 'ledger', 'events.ndjson');
      if (!recentEvents.length && fs.existsSync(legacyFile)) {
        const lines = fs.readFileSync(legacyFile, 'utf8').trim().split('\n').filter(Boolean);
        const recent = lines.slice(-20).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
        recentEvents.push(...recent);
      }
    } catch {}

    // Feed recent events into baseline monitor
    for (const ev of recentEvents) {
      if (!ev._ts) continue;
      monitors[name].observe({ type: ev.type || 'event', latencyMs: 0, error: !!ev.error, ts: ev._ts });
    }

    // 3. Check physical queue for stuck items
    const queueDir = path.join(ROOT, cfg.dataDir, 'queue');
    let stuckCount = 0;
    if (fs.existsSync(queueDir)) {
      const items = fs.readdirSync(queueDir).filter(f => f.endsWith('.json'));
      for (const item of items) {
        try {
          const state = JSON.parse(fs.readFileSync(path.join(queueDir, item), 'utf8'));
          if (state.status === 'processing' && state.claimedAt) {
            const age = Date.now() - state.claimedAt;
            if (age > 120000) { // 2 minutes stuck = gap
              stuckCount++;
              const gapId = uid();
              if (!openGaps.has(`stuck:${state.uuid}`)) {
                const gap = {
                  uuid:        gapId,
                  type:        'stuck_queue_item',
                  system:      name,
                  body:        `Queue item ${state.uuid} stuck in processing for ${Math.round(age/1000)}s`,
                  severity:    'high',
                  status:      'open',
                  ageMs:       age,
                  itemUuid:    state.uuid,
                  detectedAt:  Date.now(),
                };
                openGaps.set(`stuck:${state.uuid}`, gap);
                broadcast({ type: 'gap.found', gap });
                ico.ledger.append('gaps', gap);
              }
            }
          }
        } catch {}
      }
    }

    // Update state
    const friction = monitors[name].friction();
    const _mStats  = monitors[name].stats();

    // §METRICS-06: write per-system metrics every poll cycle
    try {
      ledgerWriter.writeMetrics(name, {
        sigma: _mStats.sigma||0, slope: _mStats.slope||0,
        errorRate: _mStats.errorRate||0, friction: friction||0,
        latencyMean: _mStats.latencyMean||0, latencyP95: _mStats.latencyP95||_mStats.latencyMean||0,
      });
    } catch(_){}

    systemState[name] = { online, uptime, jobs, friction, stuckCount,
      sigma: _mStats.sigma, slope: _mStats.slope||0,
      openGaps: monitors[name].gaps().length,
      lastChecked: Date.now() };

    return systemState[name];
  }

  async function pollAll() {
    for (const [name, cfg] of Object.entries(SYSTEMS)) {
      await pollSystem(name, cfg);
    }
    await fetchGuardianCFR();
    const allOnline = Object.values(systemState).every(s => s.online);
    const cfrSnap = cfrFeed(allOnline ? 'orchestrator.pulse' : 'pulse.missed');
    broadcast({ type: 'poll.complete', systems: systemState, cfr: cfrSnap, ts: Date.now() });
    ico.ledger.append('poll', { type: 'poll.complete', systems: Object.keys(systemState), cfr: cfrSnap, ts: Date.now() });
  }

  // Poll every 15 seconds
  pollAll();
  const pollTimer = setInterval(pollAll, 15000);

  // ── Active remediation loop (§DIAG-ACTIVE) ──────────────────────────────────
  // Runs every 30s. For each offline system: logs gap + writes to data/diagnostic/
  // For each stuck queue item: attempts unlock.
  // For syntax errors found in audit: logs with fix suggestion.
  // Does NOT restart processes (that's orchestrator's job) but fires HEAL_REQUESTED
  // on the bus so self-heal can attempt forge patching.

  const _remediationLog = path.join(ROOT, 'data/diagnostic/remediation.jsonl');
  const _offlineSince   = {}; // track how long each system has been offline
  const _remediatedGaps = new Set(); // don't spam the same gap

  function _logRemediation(entry) {
    try {
      fs.mkdirSync(path.join(ROOT, 'data/diagnostic'), { recursive: true });
      fs.appendFileSync(_remediationLog, JSON.stringify({ ...entry, ts: Date.now() }) + '\n');
    } catch(_) {}
    // Also write to cortex
    http.request({
      hostname: '127.0.0.1', port: 3748, path: '/api/event', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, () => {}).on('error', () => {}).end(JSON.stringify({
      type: 'diagnostic.remediation', source: 'nexus-diagnostic',
      payload: entry, ts: Date.now(),
    }));
  }

  async function remediationScan() {
    const issues = [];

    // 1. Systems offline — escalate after 30s, emit HEAL_REQUESTED
    for (const [name, cfg] of Object.entries(SYSTEMS)) {
      if (name === 'diagnostic') continue; // don't self-report
      const state = systemState[name] || {};
      if (!state.online) {
        if (!_offlineSince[name]) _offlineSince[name] = Date.now();
        const offlineMs = Date.now() - _offlineSince[name];
        const gapKey = `offline:${name}`;

        if (offlineMs > 30000 && !_remediatedGaps.has(gapKey)) {
          _remediatedGaps.add(gapKey);
          const gap = {
            type: 'system_offline', system: name, port: cfg.port,
            severity: 'high', offlineMs,
            fix: `Start ${name}: node ${name}/boot.js or node service/${name}-service.js`,
            body: `${name} offline for ${Math.round(offlineMs/1000)}s — :${cfg.port} not responding`,
          };
          issues.push(gap);
          openGaps.set(gapKey, { uuid: uid(), ...gap, status: 'open', detectedAt: Date.now() });
          broadcast({ type: 'gap.found', gap: openGaps.get(gapKey) });

          // Emit on nexus-bus if available
          try {
            const bus = require('../nexus-bus');
            bus.emit('HEAL_REQUESTED', {
              gapType: 'system_offline', modulePath: name,
              body: gap.body, sigma: 0.8,
              source: 'diagnostic.remediation', ts: Date.now(),
            });
          } catch(_) {}

          _logRemediation({ action: 'gap_escalated', ...gap });
          console.log(`[diagnostic] ⚠  ${name} offline ${Math.round(offlineMs/1000)}s — gap escalated`);
        }
      } else {
        // Came back online — clear
        if (_offlineSince[name]) {
          const wasDown = Date.now() - _offlineSince[name];
          _logRemediation({ action: 'system_recovered', system: name, downMs: wasDown });
          console.log(`[diagnostic] ✓  ${name} recovered (was down ${Math.round(wasDown/1000)}s)`);
          delete _offlineSince[name];
          _remediatedGaps.delete(`offline:${name}`);
        }
      }
    }

    // 2. High friction systems — log and suggest diagnosis
    for (const [name] of Object.entries(SYSTEMS)) {
      const state = systemState[name] || {};
      if (state.friction > 0.7 && state.online) {
        const gapKey = `friction:${name}:${Math.floor(Date.now()/60000)}`; // one per minute
        if (!_remediatedGaps.has(gapKey)) {
          _remediatedGaps.add(gapKey);
          _logRemediation({
            action: 'high_friction_detected',
            system: name,
            friction: state.friction,
            sigma: state.sigma,
            fix: `node cli/diagnose.js ${name}`,
          });
          console.log(`[diagnostic] ⚠  ${name} friction=${state.friction?.toFixed(3)} — logged`);
        }
      }
    }

    // 3. Syntax check on boot errors written to data/diagnostic/
    // Only run every 5 minutes to avoid performance hit
    if (!remediationScan._lastSyntax || Date.now() - remediationScan._lastSyntax > 300000) {
      remediationScan._lastSyntax = Date.now();
      const { spawnSync } = require('child_process');
      const criticalFiles = [
        'orchestrator.js', 'lib/ncp.js', 'lib/request-handler.js',
        'cortex/boot.js', 'guardian/server.js', 'lib/intent-classifier.js',
      ];
      for (const file of criticalFiles) {
        const fp = path.join(ROOT, file);
        if (!fs.existsSync(fp)) continue;
        const r = spawnSync('node', ['--check', fp], { encoding: 'utf8', timeout: 5000 });
        if (r.status !== 0) {
          const errLine = (r.stderr || '').split('\n').slice(0,2).join(' ');
          const gapKey = `syntax:${file}`;
          if (!_remediatedGaps.has(gapKey)) {
            _remediatedGaps.add(gapKey);
            _logRemediation({ action: 'syntax_error', file, error: errLine, severity: 'critical' });
            console.log(`[diagnostic] ✗  SYNTAX: ${file} — ${errLine.slice(0,80)}`);
          }
        }
      }
    }

    // 4. Cortex gap load — pull open gaps and re-broadcast any untracked ones
    try {
      await new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:3748/api/gaps?status=open&n=20',
          { timeout: 2000 }, res => {
          let b = ''; res.on('data', d => b += d);
          res.on('end', () => {
            try {
              const d = JSON.parse(b);
              const gaps = Array.isArray(d) ? d : (d.gaps || d.rows || []);
              for (const g of gaps) {
                if (!openGaps.has(g.uuid)) {
                  openGaps.set(g.uuid, g);
                  broadcast({ type: 'gap.found', gap: g, source: 'cortex_sync', ts: Date.now() });
                }
              }
            } catch {}
            resolve();
          });
        });
        req.on('error', () => resolve());
        req.on('timeout', () => { req.destroy(); resolve(); });
      });
    } catch(_) {}

    // 5. Forge Shell availability check — it's a UI, not a service
    // Healthy when orchestrator is healthy and the file exists
    const forgeFile = path.join(ROOT, 'ui', 'forge-shell.html');
    const forgeShellExists = fs.existsSync(forgeFile);
    const orchState = systemState['orchestrator'] || {};
    const forgeHealthy = forgeShellExists && orchState.online;
    if (!forgeHealthy) {
      const gapKey = 'forge-shell:unavailable';
      if (!_remediatedGaps.has(gapKey)) {
        _remediatedGaps.add(gapKey);
        const reason = !forgeShellExists ? 'ui/forge-shell.html missing' : 'orchestrator offline';
        _logRemediation({ action: 'forge_shell_unavailable', reason, fix: forgeShellExists ? 'Start orchestrator' : 'Deploy ui/forge-shell.html' });
        console.log(`[diagnostic] ⚠  forge-shell unavailable — ${reason}`);
      }
    } else {
      _remediatedGaps.delete('forge-shell:unavailable');
    }

    // 6. Run escalation for any high-severity gaps that exceeded safe-fix threshold
    await _escalateHighSeverityGaps();

    return issues;
  }

  // ── Escalation bridge — calls escalation ladder for persistent gaps ──────────
  const _escalationCooldown = new Map(); // gapKey → last escalated ts
  async function _escalateHighSeverityGaps() {
    // Pull open high-severity gaps from cortex
    let gaps = [];
    try {
      await new Promise(resolve => {
        const req = http.get('http://127.0.0.1:3748/api/gaps?status=open&severity=high&n=10',
          { timeout: 2000 }, res => {
          let b = ''; res.on('data', d => b += d);
          res.on('end', () => {
            try { const d = JSON.parse(b); gaps = Array.isArray(d) ? d : (d.gaps || d.rows || []); } catch {}
            resolve();
          });
        });
        req.on('error', () => resolve());
        req.on('timeout', () => { req.destroy(); resolve(); });
      });
    } catch(_) {}

    for (const gap of gaps) {
      // Skip gaps already escalated in the last 5 minutes
      const lastEsc = _escalationCooldown.get(gap.uuid) || 0;
      if (Date.now() - lastEsc < 300000) continue;

      // Phase 1: Try RAID routing first — let it decide the best agent
      let raidDecision = null;
      try {
        await new Promise(resolve => {
          const req = http.get(
            `http://127.0.0.1:3748/api/raid/decide?intent=${encodeURIComponent(gap.type + ' ' + (gap.path || ''))}`,
            { timeout: 2000 }, res => {
            let b = ''; res.on('data', d => b += d);
            res.on('end', () => {
              try { raidDecision = JSON.parse(b); } catch {}
              resolve();
            });
          });
          req.on('error', () => resolve());
          req.on('timeout', () => { req.destroy(); resolve(); });
        });
      } catch(_) {}

      // Phase 2: Dispatch to guardian if RAID has a decision
      let guardianDispatched = false;
      if (raidDecision?.agent) {
        const jobPayload = JSON.stringify({
          command:  'diagnose_and_repair',
          provider: raidDecision.agent,
          prompt:   `NEXUS DIAGNOSTIC ESCALATION\nGap: ${gap.type}\nPath: ${gap.path || '?'}\nBody: ${(gap.body || '').slice(0, 200)}\nSeverity: ${gap.severity}\nAttempts: ${gap.attempts || 0}\n\nAnalyse this gap, identify root cause, propose a concrete fix.`,
          meta: { gapUuid: gap.uuid, gapType: gap.type, source: 'diagnostic.escalation', raidAgent: raidDecision.agent },
        });

        guardianDispatched = await new Promise(resolve => {
          const req = http.request({
            hostname: '127.0.0.1', port: 7820, path: '/command', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(jobPayload) },
            timeout: 5000,
          }, res => {
            let b = ''; res.on('data', d => b += d);
            res.on('end', () => {
              try { const d = JSON.parse(b); resolve(d.jobId || d.ok); } catch { resolve(false); }
            });
          });
          req.on('error', () => resolve(false));
          req.on('timeout', () => { req.destroy(); resolve(false); });
          req.write(jobPayload); req.end();
        });
      }

      // Phase 3: If RAID/guardian failed, use escalation ladder (self-heal)
      if (!guardianDispatched) {
        try {
          const escModule = require('../cortex/self-heal/escalation');
          await escModule.escalate(gap);
          _logRemediation({ action: 'escalation_ladder', gapUuid: gap.uuid, gapType: gap.type });
        } catch(e) {
          _logRemediation({ action: 'escalation_failed', gapUuid: gap.uuid, error: e.message });
          console.warn(`[diagnostic] escalation failed for ${gap.uuid}: ${e.message}`);
        }
      } else {
        _logRemediation({ action: 'guardian_dispatched', gapUuid: gap.uuid, gapType: gap.type,
          agent: raidDecision?.agent, note: 'RAID→Guardian dispatch' });
        console.log(`[diagnostic] ↗  gap ${gap.uuid.slice(0,8)} dispatched to guardian via ${raidDecision?.agent}`);
      }

      _escalationCooldown.set(gap.uuid, Date.now());
    }
  }

  // Run remediation scan every 30s (staggered from pollAll)
  setTimeout(() => {
    remediationScan();
    setInterval(remediationScan, 30000);
  }, 15000);

  // Live ledger watching — detect new events within milliseconds
  for (const [name, cfg] of Object.entries(SYSTEMS)) {
    const ledgerDir = path.join(ROOT, cfg.dataDir || cfg.ledgerDir || 'data');
    fs.mkdirSync(ledgerDir, { recursive: true });
    try {
      fs.watch(ledgerDir, { recursive: true }, (event, filename) => {
        if (!filename || !filename.endsWith('.ndjson')) return;
        // Debounce — only process once per 500ms per system
        clearTimeout(monitors[name]._watchDebounce);
        monitors[name]._watchDebounce = setTimeout(async () => {
          await pollSystem(name, cfg);
          const state = systemState[name] || {};
          broadcast({ type: 'ledger.updated', system: name,
            friction: state.friction, sigma: state.sigma, ts: Date.now() });
        }, 500);
      });
    } catch(_) {} // fs.watch may not support recursive on all platforms
  }

  // ── Audit ─────────────────────────────────────────────────────────────────

  async function runAuditInternal() {
    const issues = [];

    // 1. Syntax check all JS files
    const { spawnSync } = require('child_process');
    function walkJs(dir) {
      const results = [];
      if (!fs.existsSync(dir)) return results;
      for (const f of fs.readdirSync(dir)) {
        const fp = path.join(dir, f);
        if (['node_modules','.git','data'].includes(f)) continue;
        const st = fs.statSync(fp);
        if (st.isDirectory()) results.push(...walkJs(fp));
        else if (f.endsWith('.js')) results.push(fp);
      }
      return results;
    }

    let syntaxFails = 0;
    for (const file of walkJs(ROOT)) {
      const r = spawnSync('node', ['--check', file], { encoding: 'utf8', timeout: 5000 });
      if (r.status !== 0) {
        syntaxFails++;
        const errLine = (r.stderr || '').split('\n').slice(0, 2).join(' ');
        issues.push({ type: 'syntax_error', file: file.replace(ROOT + '/', ''), error: errLine, severity: 'critical' });
      }
    }

    // 2. Check all system health endpoints
    for (const [name, cfg] of Object.entries(SYSTEMS)) {
      const state = systemState[name] || {};
      if (!state.online) {
        issues.push({ type: 'system_offline', system: name, port: cfg.port, severity: 'high',
          fix: `Start ${name}: node ${name}/boot.js or service/${name}-service.js` });
      }
      if (state.friction > 0.5) {
        issues.push({ type: 'high_friction', system: name, friction: state.friction, severity: 'medium',
          fix: `Check data/${name}/ledger/ for recent errors` });
      }
    }

    // 3. Check for orphaned pending files (stuck for > 5 minutes)
    for (const [name] of Object.entries(SYSTEMS)) {
      const inputDir = path.join(ROOT, `data/${name}/input`);
      if (!fs.existsSync(inputDir)) continue;
      for (const f of fs.readdirSync(inputDir)) {
        if (!f.includes('.pending.')) continue;
        const fp = path.join(inputDir, f);
        const age = Date.now() - fs.statSync(fp).mtimeMs;
        if (age > 300000) { // 5 min
          issues.push({ type: 'orphaned_pending', system: name, file: f,
            ageMs: age, severity: 'medium',
            fix: `Run: node cli/diagnose.js ${name} or restart ${name} service` });
        }
      }
    }

    // 4. Check for recent failure ledger entries
    for (const [name] of Object.entries(SYSTEMS)) {
      const failDir = path.join(ROOT, cfg.dataDir, 'failures');
      if (!fs.existsSync(failDir)) continue;
      const failFiles = fs.readdirSync(failDir).filter(f => f.endsWith('.ndjson'));
      for (const ff of failFiles.slice(-5)) {
        const lines = fs.readFileSync(path.join(failDir, ff), 'utf8').trim().split('\n').filter(Boolean);
        const recent = lines.slice(-3).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
        for (const entry of recent) {
          if (entry.friction > 0.7) {
            issues.push({ type: 'high_friction_failure', system: name,
              error: entry.error?.slice(0,100), friction: entry.friction, severity: 'medium',
              solution: entry.solution || null });
          }
        }
      }
    }

    // 5. Required files per system
    const REQUIRED_FILES = {
      guardian:  ['guardian/server.js','guardian/userscript-claude.js','guardian/userscript-chatgpt.js'],
      cortex:    ['cortex/boot.js','cortex/core/raid/index.js','cortex/memory/jaa-db.js'],
      idearium:  ['idearium/api/index.js'],
      lib:       ['lib/ess.js','lib/ico.js','lib/baseline.js','lib/queue.js','lib/ncp.js'],
    };
    for (const [group, files] of Object.entries(REQUIRED_FILES)) {
      for (const file of files) {
        if (!fs.existsSync(path.join(ROOT, file))) {
          issues.push({ type:'missing_required_file', group, file, severity:'critical',
            fix:`BUILD REQUIRED: ${file}` });
        }
      }
    }

    // 6. Baseline established per system
    for (const [name, mon] of Object.entries(monitors)) {
      if (!mon.baseline()) {
        issues.push({ type:'baseline_not_established', system:name, severity:'low',
          fix:`Start ${name} service — needs ${mon.baselineN} events to establish baseline` });
      }
    }

    // 7. Ledger health — is each system writing?
    for (const [name, cfg] of Object.entries(SYSTEMS)) {
      const ledgerDir = path.join(ROOT, cfg.dataDir || cfg.ledgerDir || 'data');
      if (!fs.existsSync(ledgerDir)) {
        issues.push({ type:'ledger_missing', system:name, severity:'medium',
          fix:`Start ${name} service to create ledger` }); continue;
      }
      let lastWrite = 0;
      const streams = fs.readdirSync(ledgerDir)
        .filter(f => { try { return fs.statSync(path.join(ledgerDir,f)).isDirectory(); } catch { return false; } });
      for (const stream of streams) {
        const evFile = path.join(ledgerDir, stream, 'events.ndjson');
        if (fs.existsSync(evFile)) {
          const mt = fs.statSync(evFile).mtimeMs;
          if (mt > lastWrite) lastWrite = mt;
        }
      }
      if (lastWrite > 0 && Date.now() - lastWrite > 600000) {
        issues.push({ type:'ledger_stale', system:name, ageMinutes:Math.round((Date.now()-lastWrite)/60000),
          severity:'low', fix:`${name} ledger stale — check if service is running` });
      }
    }

    return {
      ts:          Date.now(),
      totalIssues: issues.length,
      critical:    issues.filter(i => i.severity === 'critical').length,
      high:        issues.filter(i => i.severity === 'high').length,
      medium:      issues.filter(i => i.severity === 'medium').length,
      low:         issues.filter(i => i.severity === 'low').length,
      syntaxFails,
      systems: Object.fromEntries(Object.entries(systemState).map(([k,v])=>[k,{online:v.online,friction:v.friction}])),
      issues,
    };
  }

  // ── HTTP server ───────────────────────────────────────────────────────────

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

    if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }

    // SSE stream
    if (url.pathname === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write('data: ' + JSON.stringify({ type: 'connected', ts: Date.now() }) + '\n\n');
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    // Status
    if (url.pathname === '/status') {
      const summary = {};
      for (const [name, state] of Object.entries(systemState)) {
        summary[name] = { online: state.online, friction: state.friction, sigma: state.sigma, openGaps: state.openGaps };
      }
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, summary, openGaps: openGaps.size,
        cfr: guardianCFR ? guardianCFR.cfr : cfrField.snapshot(),
        cfrSource: guardianCFR ? 'guardian' : 'diagnostic',
        uptime: process.uptime(), ts: Date.now() }));
      return;
    }

    // ── CFR field state ─────────────────────────────────────────────────────
    // GET /cfr/health — { ok, status, regime, cfr } (Guardian primary, local fallback)
    if (url.pathname === '/cfr/health') {
      const localSnap = cfrField.snapshot();
      const source = guardianCFR ? 'guardian' : 'diagnostic';
      const cfr = guardianCFR ? guardianCFR.cfr : localSnap;
      const regime = guardianCFR ? guardianCFR.regime : localSnap.regime;
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, status: 'online', source, regime, cfr, local: localSnap, ts: Date.now() }));
      return;
    }

    // GET /cfr/state — full field state + system summary. Guardian's ledger-backed
    // field is the source of truth when reachable; local diagnostic field is
    // always included so the panel never reports "module offline".
    if (url.pathname === '/cfr/state') {
      const localSnap = cfrField.snapshot();
      const summary = {};
      for (const [name, state] of Object.entries(systemState)) {
        summary[name] = { online: state.online, friction: state.friction, sigma: state.sigma, openGaps: state.openGaps };
      }
      const source = guardianCFR ? 'guardian' : 'diagnostic';
      const cfr = guardianCFR ? guardianCFR.cfr : localSnap;
      const regime = guardianCFR ? guardianCFR.regime : localSnap.regime;
      res.writeHead(200, CORS);
      res.end(JSON.stringify({
        ok: true, source, cfr, regime,
        guardian: guardianCFR,   // null if guardian :7820/cfr/state unreachable
        diagnostic: localSnap,   // always present
        openGaps: openGaps.size, systems: summary, ts: Date.now(),
      }));
      return;
    }

    // GET /cfr/field — raw field dimensions (local diagnostic field only)
    if (url.pathname === '/cfr/field') {
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, ...cfrField.get(), guardianReachable: !!guardianCFR, ts: Date.now() }));
      return;
    }

    // Contract audit
    if (url.pathname === '/audit/contracts') {
      const report = _verifier?.auditReport() || {};
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, report, ts: Date.now() }));
      return;
    }

    // Audit health
    if (url.pathname === '/audit/health') {
      const health = {};
      for (const [name, cfg] of Object.entries(SYSTEMS)) {
        const lp  = require('path').join(ROOT, cfg.dataDir || cfg.ledgerDir || 'data', 'event_log.jsonl');
        const ex  = require('fs').existsSync(lp);
        const st  = ex ? require('fs').statSync(lp) : null;
        health[name] = { ledgerExists: ex, ledgerSizeKB: st ? Math.round(st.size/1024) : 0, port: cfg.port };
      }
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, health, ts: Date.now() }));
      return;
    }

    // Gaps
    if (url.pathname === '/gaps') {
      const status = url.searchParams.get('status') || 'open';
      const system = url.searchParams.get('system');
      let gaps = [...openGaps.values()];
      if (status !== 'all') gaps = gaps.filter(g => g.status === status);
      if (system) gaps = gaps.filter(g => g.system === system);
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, count: gaps.length, gaps }));
      return;
    }

    // Close a gap
    if (url.pathname.startsWith('/gaps/') && req.method === 'DELETE') {
      const gapId = url.pathname.split('/')[2];
      const gap   = openGaps.get(gapId);
      if (gap) { gap.status = 'closed'; gap.closedAt = Date.now(); }
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: !!gap }));
      return;
    }

    // Friction
    if (url.pathname === '/friction') {
      const friction = {};
      for (const [name, mon] of Object.entries(monitors)) {
        friction[name] = { friction: mon.friction(), sigma: mon.stats().sigma,
          errorRate: mon.stats().errorRate, slope: mon.stats().slope };
      }
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, friction, ts: Date.now() }));
      return;
    }

    // Baseline for a system
    if (url.pathname.startsWith('/baseline/')) {
      const system = url.pathname.split('/')[2];
      const mon    = monitors[system];
      if (!mon) { res.writeHead(404, CORS); res.end(JSON.stringify({ ok: false, error: 'unknown system' })); return; }
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, system, stats: mon.stats(), baseline: mon.baseline(), gaps: mon.gaps() }));
      return;
    }

    // Ledger tail for a system
    if (url.pathname.startsWith('/ledger/')) {
      const system = url.pathname.split('/')[2];
      const stream = url.pathname.split('/')[3] || 'events';
      const n      = parseInt(url.searchParams.get('n') || '20');
      const cfg    = SYSTEMS[system];
      if (!cfg) { res.writeHead(404, CORS); res.end(JSON.stringify({ ok: false, error: 'unknown system' })); return; }
      const ledgerFile = path.join(ROOT, cfg.dataDir || cfg.ledgerDir || 'data', stream, 'events.ndjson');
      let events = [];
      if (fs.existsSync(ledgerFile)) {
        const lines = fs.readFileSync(ledgerFile, 'utf8').trim().split('\n').filter(Boolean);
        events = lines.slice(-n).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      }
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, system, stream, events }));
      return;
    }

    // Trace a specific UUID across all system ledgers
    if (url.pathname.startsWith('/trace/')) {
      const traceId = url.pathname.split('/')[2];
      if (!traceId) { res.writeHead(400, CORS); res.end(JSON.stringify({ ok:false, error:'uuid required' })); return; }
      const trace = [];
      for (const [name, cfg] of Object.entries(SYSTEMS)) {
        const ledgerDir = path.join(ROOT, cfg.dataDir || cfg.ledgerDir || 'data');
        if (!fs.existsSync(ledgerDir)) continue;
        const streams = fs.readdirSync(ledgerDir).filter(f => {
          try { return fs.statSync(path.join(ledgerDir,f)).isDirectory(); } catch { return false; }
        });
        for (const stream of streams) {
          const evFile = path.join(ledgerDir, stream, 'events.ndjson');
          if (!fs.existsSync(evFile)) continue;
          const lines = fs.readFileSync(evFile,'utf8').trim().split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const ev = JSON.parse(line);
              const evStr = JSON.stringify(ev);
              if (evStr.includes(traceId)) {
                trace.push({ system: name, stream, event: ev });
              }
            } catch {}
          }
        }
      }
      trace.sort((a,b) => (a.event._ts||0) - (b.event._ts||0));
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok:true, traceId, count:trace.length, trace }));
      return;
    }

    // Gap resolution — POST /gaps/:uuid/fix triggers HEAL_REQUESTED on nexus-bus
    // The diagnostic UI calls this when you click HEAL on an open loop.
    // Self-heal subscribes to HEAL_REQUESTED and runs the forge pipeline.
    if (url.pathname.startsWith('/gaps/') && url.pathname.endsWith('/fix') && req.method === 'POST') {
      const gapId = url.pathname.split('/')[2];
      const gap   = openGaps.get(gapId);
      if (!gap) { res.writeHead(404, CORS); res.end(JSON.stringify({ ok:false, error:'gap not found' })); return; }

      let triggered = false;
      try {
        const bus = require('../nexus-bus');
        bus.emit('HEAL_REQUESTED', {
          gapUuid:    gapId,
          gapType:    gap.type,
          modulePath: gap.file || gap.system || '',
          body:       gap.body || '',
          sigma:      gap.sigma || 0,
          causedBy:   gapId,
          ts:         Date.now(),
          source:     'diagnostic.ui',
        });
        triggered = true;
      } catch(_) {
        // nexus-bus not available — write to cortex event_log for pickup
        try {
          await fetch('http://127.0.0.1:3748/api/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'HEAL_REQUESTED',
              payload: { gapUuid: gapId, gapType: gap.type, source: 'diagnostic.ui' },
              source: 'diagnostic', ts: Date.now(),
            }),
          }).catch(() => {});
        } catch(_) {}
      }

      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, triggered, gapId, ts: Date.now() }));
      return;
    }

    // System summary with trend data
    if (url.pathname.startsWith('/summary/')) {
      const system = url.pathname.split('/')[2];
      const cfg    = SYSTEMS[system];
      if (!cfg) { res.writeHead(404, CORS); res.end(JSON.stringify({ ok:false, error:'unknown system' })); return; }
      const state  = systemState[system] || {};
      const mon    = monitors[system];
      const stats  = mon.stats();
      const base   = mon.baseline();
      const gaps   = mon.gaps();
      const recentFailures = [];
      const failDir = path.join(ROOT, `data/${system}/failures`);
      if (fs.existsSync(failDir)) {
        for (const ff of fs.readdirSync(failDir).filter(f=>f.endsWith('.ndjson')).slice(-3)) {
          const lines = fs.readFileSync(path.join(failDir,ff),'utf8').trim().split('\n').filter(Boolean);
          lines.slice(-5).forEach(l => { try { recentFailures.push(JSON.parse(l)); } catch {} });
        }
      }
      res.writeHead(200, CORS);
      res.end(JSON.stringify({
        ok: true, system,
        state, stats, baseline: base,
        openGaps: gaps,
        recentFailures: recentFailures.sort((a,b)=>(b.loggedAt||0)-(a.loggedAt||0)).slice(0,10),
        pendingQueue: (() => {
          const qDir = path.join(ROOT, `data/${system}/input`);
          if (!fs.existsSync(qDir)) return 0;
          return fs.readdirSync(qDir).filter(f=>f.includes('.pending.')).length;
        })(),
      }));
      return;
    }

    // Audit
    if (url.pathname === '/decay') {
    // Memory pressure — reads cortex decay_log directly
    // Returns: eviction rate, pressure per tier, cycle summaries, working memory size
    const decayFile = path.join(ROOT, 'cortex/data/decay_log.jsonl');
    try {
      if (!fs.existsSync(decayFile)) {
        res.writeHead(200, CORS); res.end(JSON.stringify({ cycles:[], pressure:[], evictions:[], workingMemorySize:0 })); return;
      }
      const lines = fs.readFileSync(decayFile,'utf8').trim().split('\n').filter(Boolean);
      const entries = lines.slice(-500).map(l=>{ try{return JSON.parse(l);}catch{return null;} }).filter(Boolean);

      const cycles    = entries.filter(e => e._isCycleSummary).slice(-20);
      const evictions = entries.filter(e => !e._isCycleSummary);

      const byTable = {};
      for (const e of evictions) {
        if (!byTable[e.table]) byTable[e.table] = { count:0, totalAgeHours:0, tier:e.tier };
        byTable[e.table].count++;
        byTable[e.table].totalAgeHours += e.ageHours || 0;
      }
      const pressure = Object.entries(byTable).map(([table,d]) => ({
        table, tier: d.tier, evictions: d.count,
        avgAgeHours: d.count ? Math.round(d.totalAgeHours / d.count * 10) / 10 : 0,
      })).sort((a,b) => b.evictions - a.evictions);

      const lastCycle = cycles[cycles.length-1] || {};
      res.writeHead(200, CORS);
      res.end(JSON.stringify({
        cycles: cycles.slice(-10), pressure,
        evictions: evictions.slice(-50),
        workingMemorySize: lastCycle.workingMemorySize || 0,
        totalEvictions: evictions.length,
      }));
    } catch(e) { res.writeHead(500,CORS); res.end(JSON.stringify({error:e.message})); }
    return;
  }

  // ── /engines — all 12 diagnostic engines ──────────────────────────────────
  if (url.pathname === '/engines') {
    const de = _getDiagEngines();
    if (!de) {
      res.writeHead(503, CORS);
      return res.end(JSON.stringify({ok:false, error:'diagnostic engines unavailable'}));
    }
    try {
      const allEvents = [];
      for (const [, state] of Object.entries(systemState)) {
        if (Array.isArray(state.recentEvents)) allEvents.push(...state.recentEvents);
      }
      const states = {};
      for (const [name, state] of Object.entries(systemState)) {
        states[name] = { online: state.online, friction: state.friction||0, sigma: state.sigma||0 };
      }
      const result = de.runAllEngines({ events: allEvents, systemStates: states });
      res.writeHead(200, CORS);
      return res.end(JSON.stringify({ ok:true, ...result }));
    } catch(e) {
      res.writeHead(500, CORS);
      return res.end(JSON.stringify({ok:false, error:e.message}));
    }
  }

  if (url.pathname === '/tension') {
    // §TENSION-05: per-system tension score
    // tension = friction × (1 + openGaps × 0.2) × (1 + max(0, slope) × 2)
    // Open gaps are open loops — they accumulate tension via healer.scoreTension()
    const result = {};

    // Load gap-based tension from JAA (open loops)
    let allOpenGaps = [];
    try {
      const cortexUrl = 'http://127.0.0.1:3748';
      const gapRes = await fetch(cortexUrl + '/api/gaps?status=open', {
        signal: AbortSignal.timeout(2000)
      }).catch(() => null);
      if (gapRes?.ok) {
        const gapData = await gapRes.json();
        allOpenGaps = gapData.gaps || gapData.rows || (Array.isArray(gapData) ? gapData : []);
      }
    } catch(_) {}

    // Score each open gap and group by system
    let scoreTension;
    try { scoreTension = require('../cortex/healer/index').scoreTension; } catch(_) {}
    const gapTensionBySystem = {};
    if (!Array.isArray(allOpenGaps)) allOpenGaps = [];
    for (const gap of allOpenGaps) {
      const sys = gap.source?.split('/')?.[0] || gap.system || 'unknown';
      if (!gapTensionBySystem[sys]) gapTensionBySystem[sys] = { total: 0, count: 0, gaps: [] };
      const t = scoreTension ? scoreTension(gap) : (gap.severity === 'high' ? 2 : 1);
      gapTensionBySystem[sys].total += t;
      gapTensionBySystem[sys].count++;
      gapTensionBySystem[sys].gaps.push({ uuid: gap.uuid, type: gap.type, tension: t, severity: gap.severity });
    }

    for (const [name, mon] of Object.entries(monitors)) {
      const s       = mon.stats();
      const fric    = mon.friction();
      const monGaps = mon.gaps().length;
      const slope   = Math.max(0, s.slope || 0);
      const gapData = gapTensionBySystem[name] || { total: 0, count: 0, gaps: [] };

      // Combined tension: monitoring signal + open loop accumulation
      const monitorTension = fric * (1 + monGaps * 0.2) * (1 + slope * 2);
      const loopTension    = gapData.total;
      const tension        = monitorTension + loopTension * 0.3; // loops add 30% weight

      result[name] = {
        tension:        Math.round(tension * 1000) / 1000,
        monitorTension: Math.round(monitorTension * 1000) / 1000,
        loopTension:    Math.round(loopTension * 1000) / 1000,
        friction:       fric,
        openGaps:       monGaps + gapData.count,
        openLoops:      gapData.count,
        topLoops:       gapData.gaps.slice(0, 3),
        slope:          s.slope || 0,
        sigma:          s.sigma || 0,
        online:         (systemState[name] || {}).online || false,
        regime: tension > 2.0 ? 'critical' : tension > 1.0 ? 'turbulent' : tension > 0.4 ? 'elevated' : 'stable',
      };
    }

    // System-wide tension summary
    const tensions = Object.values(result).map(r => r.tension);
    const maxTension = tensions.length ? Math.max(...tensions) : 0;
    const totalLoops = allOpenGaps.length;

    res.writeHead(200, CORS);
    // Engine summary for composite health picture
    let engineSummary = null;
    const de2 = _getDiagEngines();
    if (de2) {
      try {
        const evts = []; for (const [,s] of Object.entries(systemState)) { if (Array.isArray(s.recentEvents)) evts.push(...s.recentEvents); }
        const sts  = {}; for (const [n,s] of Object.entries(systemState)) { sts[n]={online:s.online,friction:s.friction||0,sigma:s.sigma||0}; }
        const er = de2.runAllEngines({ events: evts, systemStates: sts });
        engineSummary = { healthScore:er.healthScore, alertCount:er.alertCount, alerts:er.alerts.slice(0,3),
          entropyRegime:er.engines?.entropy_rate?.regime, snrRegime:er.engines?.snr_floor?.regime,
          homeostasis:er.engines?.homeostasis?.regime, faultTree:er.engines?.fault_tree?.topEventActive,
          cascadeRisks:(er.engines?.cascade_risk||[]).length, fingerprint:er.engines?.fingerprint?.regime };
      } catch(_) {}
    }
    res.end(JSON.stringify({ systems: result, maxTension, totalLoops, openGapCount: allOpenGaps.length, engines: engineSummary }));
    return;
  }

  if (url.pathname === '/tension/edges') {
    // §TENSION-05: per-edge tension (sigma divergence between communicating system pairs)
    // Edges = system pairs that share data flow in the architecture
    const EDGES = [
      ['orchestrator','guardian'],
      ['orchestrator','cortex'],
      ['orchestrator','bridge'],
      ['guardian','cortex'],
      ['guardian','bridge'],
      ['cortex','bridge'],
      ['cortex','idearium'],
      ['cortex','architect'],
      ['cortex','diagnostic'],
      ['diagnostic','orchestrator'],
    ];
    const edges = [];
    for (const [a, b] of EDGES) {
      const ma = monitors[a], mb = monitors[b];
      if (!ma || !mb) continue;
      const sa   = ma.stats(), sb = mb.stats();
      const diff = Math.abs((sa.sigma||0) - (sb.sigma||0));
      const fric = ((ma.friction()||0) + (mb.friction()||0)) / 2;
      const edgeTension = diff * (1 + fric * 2);
      edges.push({
        from: a, to: b,
        tension:    Math.round(edgeTension * 1000) / 1000,
        sigmaDiff:  Math.round(diff * 1000) / 1000,
        sigmaA:     sa.sigma || 0,
        sigmaB:     sb.sigma || 0,
        regime: edgeTension > 1.5 ? 'critical' : edgeTension > 0.7 ? 'turbulent' : edgeTension > 0.2 ? 'elevated' : 'stable',
      });
    }
    edges.sort((a,b) => b.tension - a.tension);
    res.writeHead(200, CORS);
    res.end(JSON.stringify(edges));
    return;
  }

  if (url.pathname === '/self-heal') {
    // Self-heal status — open loops, pending patches, human-required gaps
    // This is what the diagnostic UI shows in the self-heal panel
    try {
      const cortexUrl = 'http://127.0.0.1:3748';
      const [gapsRes, patchRes] = await Promise.all([
        fetch(cortexUrl + '/api/gaps?status=all', { signal: AbortSignal.timeout(2000) }).catch(() => null),
        fetch(cortexUrl + '/api/gaps?status=forge_patch_ready', { signal: AbortSignal.timeout(2000) }).catch(() => null),
      ]);
      const allGaps   = gapsRes?.ok   ? (await gapsRes.json()).gaps   || [] : [];
      const readyPatch= patchRes?.ok  ? (await patchRes.json()).gaps  || [] : [];

      let scoreTension;
      try { scoreTension = require('../cortex/healer/index').scoreTension; } catch(_) {}

      const byStatus = {};
      let totalTension = 0;
      for (const g of allGaps) {
        byStatus[g.status] = (byStatus[g.status] || 0) + 1;
        if (g.status !== 'resolved' && g.status !== 'forge_applied') {
          totalTension += scoreTension ? scoreTension(g) : 1;
        }
      }

      const humanRequired = allGaps.filter(g => g.status === 'human_required');
      const openLoops     = allGaps.filter(g => !['resolved','forge_applied'].includes(g.status));

      res.writeHead(200, CORS);
      res.end(JSON.stringify({
        ok:             true,
        totalGaps:      allGaps.length,
        openLoops:      openLoops.length,
        totalTension:   Math.round(totalTension * 100) / 100,
        byStatus,
        pending:        byStatus['pending']        || 0,
        processing:     byStatus['processing']     || 0,
        needsManual:    byStatus['needs_manual']   || 0,
        forgeReady:     readyPatch.length,
        humanRequired:  humanRequired.length,
        humanRequiredGaps: humanRequired.slice(0,5).map(g => ({
          uuid: g.uuid, type: g.type, path: g.path, body: g.body?.slice(0,100)
        })),
        recentPatches:  byStatus['forge_applied']  || 0,
      }));
    } catch(e) {
      res.writeHead(500, CORS);
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  if (url.pathname === '/audit') {
      const result = await runAuditInternal();
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ ok: true, ...result }));
      return;
    }

    res.writeHead(404, CORS);
    res.end(JSON.stringify({ ok: false, error: 'not found' }));
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[nexus-diagnostic] running :${PORT} pid=${process.pid}`);
    console.log(`[nexus-diagnostic] monitoring: ${Object.keys(SYSTEMS).join(', ')}`);
    ico.ledger.append('boot', { type: 'service.start', port: PORT, pid: process.pid, ts: Date.now() });
    broadcast({ type: 'service.start', port: PORT, ts: Date.now() });
  });

  // ── Shutdown ──────────────────────────────────────────────────────────────

  process.on('SIGTERM', () => {
    clearInterval(pollTimer);
    server.close();
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    ico.ledger.append('boot', { type: 'service.stop', reason: 'SIGTERM', ts: Date.now() });
    process.exit(0);
  });

  process.on('SIGINT', () => {
    clearInterval(pollTimer);
    server.close();
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    process.exit(0);
  });
}

// Export for use by other modules
module.exports = { SYSTEMS };

// Make runAudit available as CLI
async function runAudit() {
  // Stub for CLI usage without running service
  const issues = [];
  const { spawnSync } = require('child_process');
  function walkJs(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f);
      if (['node_modules','.git','data'].includes(f)) continue;
      if (fs.statSync(fp).isDirectory()) results.push(...walkJs(fp));
      else if (f.endsWith('.js')) results.push(fp);
    }
    return results;
  }
  let syntaxFails = 0;
  for (const file of walkJs(ROOT)) {
    const r = spawnSync('node', ['--check', file], { encoding:'utf8', timeout:5000 });
    if (r.status !== 0) { syntaxFails++; issues.push({ type:'syntax_error', file: file.replace(ROOT+'/',''), error:(r.stderr||'').split('\n')[0] }); }
  }
  return { ts: Date.now(), syntaxFails, totalIssues: issues.length, issues };
}
