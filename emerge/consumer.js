'use strict';
/**
 * emerge/consumer.js — the other half of the build pipeline
 * UUID: nexus-emerge-consumer-v1-0000-2026-0711-jamesbrooks-001
 * Version: 1.0.0
 *
 * §NEW 2026-07-11 — this is what was missing. copilot/module-builder.js's
 * build() has always correctly dispatched a real contract to
 * emerge/input/<uuid>.json via lib/contract-queue.js's dispatch() — but
 * dispatch() only writes a file. Confirmed by grep, nothing under emerge/
 * ever read it: no accept(), no complete(), no consumer at all. Emerge
 * itself is a compiler LIBRARY, not a service (no http.createServer
 * anywhere under emerge/) — so this isn't a bug in an existing server,
 * it's a process that never existed. This is that process: a small
 * poller, not a new architecture. Watches emerge/input/ (via
 * lib/contract-queue.js's own pending()/accept()/complete()/fail() —
 * the same file-drop queue module-builder already writes to, no new
 * queue mechanism invented), and for every module_build contract it
 * finds, writes the spec to disk and runs it through the REAL compiler
 * (emerge/compiler/pipeline.js's compile()) that already existed and had
 * zero callers.
 *
 * Reports accept/complete/fail back two ways:
 *   1. Into the contract's own file (cq.accept/complete/fail) — the
 *      record of what happened, durable, no network needed.
 *   2. As an event POSTed to copilot's new /api/event endpoint — so the
 *      'module-build-dispatched-then-accepted' expectation (copilot/lib/
 *      expectation-watcher.js) actually sees it and stops firing. This
 *      is the thing that turns an always-red expectation into one that
 *      goes quiet the moment this process actually does its job.
 *
 * Run standalone: `node emerge/consumer.js`
 * Or required and started programmatically: `require('./consumer').start()`
 */

const fs   = require('fs');
const path = require('path');
const http = require('http');
const cq   = require('../lib/contract-queue');
const { compile } = require('./compiler/pipeline');

const MODULE_ID = 'emerge/consumer';
const VERSION   = '1.0.0';

const POLL_MS      = parseInt(process.env.EMERGE_POLL_MS || '5000', 10);
const COPILOT_URL   = process.env.COPILOT_URL || 'http://127.0.0.1:3750';
const OUTPUT_ROOT   = process.env.EMERGE_OUTPUT_ROOT || path.join(__dirname, '..', 'data', 'emerge', 'builds');

function _post(url, body) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(url); } catch (e) { return reject(e); }
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 5000,
    }, res => { res.on('data', () => {}); res.on('end', resolve); });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('request timeout')); });
    req.write(data);
    req.end();
  });
}

// Best-effort — a copilot outage must never stop Emerge from actually
// doing builds (§1.2: the real work happens regardless; the observability
// signal is separate from the work itself, not a dependency of it).
async function _reportEvent(type, payload) {
  try {
    await _post(`${COPILOT_URL}/api/event`, { type, payload, ts: Date.now() });
  } catch (e) {
    console.warn(`[${MODULE_ID}] failed to report ${type} to copilot (build itself is unaffected): ${e.message}`);
  }
}

// §WIRED 2026-08-22 — James: "wire it all." One real place for
// build_output, used by all 3 real exit paths in processOne() below.
function _reportBuildOutput(uuid, name, ok, error) {
  try {
    const et = require('../lib/event-types.js');
    require('../cortex/memory/jaa-db.js').jaaDB.insert('event_log', {
      type: et.INTENT.BUILD_OUTPUT, blockId: uuid,
      agent: 'emerge', moduleName: name, ok: !!ok, error: error || null, ts: Date.now(),
    });
  } catch (_) { /* event pipeline unreachable — the real build result is unaffected */ }
}

async function processOne(contract) {
  const { uuid } = contract;
  const name = contract.payload?.name || 'unnamed-module';
  console.log(`[${MODULE_ID}] accepting ${uuid} (${name})`);

  cq.accept('emerge', uuid);
  await _reportEvent('emerge.contract.accepted', { contractUuid: uuid, moduleName: name });
  // §WIRED 2026-08-22 — James: "wire it all." Real build_input, same
  // canonical registry every other real system event uses now.
  try {
    require('../lib/event-types.js');
    require('../cortex/memory/jaa-db.js').jaaDB.insert('event_log', {
      type: require('../lib/event-types.js').INTENT.BUILD_INPUT, blockId: uuid,
      agent: 'emerge', moduleName: name, ts: Date.now(),
    });
  } catch (_) { /* event pipeline unreachable — the real build proceeds regardless */ }

  try {
    if (contract.payload?.type !== 'module_build') {
      throw new Error(`unknown contract payload type: ${contract.payload?.type || '(none)'}`);
    }
    if (!contract.payload.spec || typeof contract.payload.spec !== 'string') {
      throw new Error('contract has no spec text to compile');
    }

    const buildDir = path.join(OUTPUT_ROOT, uuid);
    fs.mkdirSync(buildDir, { recursive: true });
    const safeName = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'module';
    const specPath = path.join(buildDir, `${safeName}.spec`);
    fs.writeFileSync(specPath, contract.payload.spec, 'utf8');

    // The architecture-selection metadata from module-builder.js (idearium
    // spec uuid/rootHash/templateIds, if it ran) rides along for anyone
    // inspecting this build directory later — written once, next to the
    // spec, not just living in the contract file.
    if (contract.payload.architecture) {
      fs.writeFileSync(
        path.join(buildDir, 'architecture.json'),
        JSON.stringify(contract.payload.architecture, null, 2),
        'utf8'
      );
    }

    const result = await compile(specPath, buildDir, { verbose: false });

    if (result.ok) {
      cq.complete('emerge', uuid, { outputDir: buildDir, ok: true, skipped: !!result.skipped });
      await _reportEvent('emerge.contract.complete', { contractUuid: uuid, moduleName: name, outputDir: buildDir });
      _reportBuildOutput(uuid, name, true);
      console.log(`[${MODULE_ID}] ✓ ${uuid} compiled → ${buildDir}`);
    } else {
      const errMsg = result.error || 'compile pipeline produced no result';
      cq.fail('emerge', uuid, errMsg);
      await _reportEvent('emerge.contract.failed', { contractUuid: uuid, moduleName: name, error: errMsg });
      _reportBuildOutput(uuid, name, false, errMsg);
      console.warn(`[${MODULE_ID}] ✗ ${uuid} failed: ${errMsg}`);
    }
  } catch (e) {
    cq.fail('emerge', uuid, e.message);
    await _reportEvent('emerge.contract.failed', { contractUuid: uuid, moduleName: name, error: e.message });
    _reportBuildOutput(uuid, name, false, e.message);
    console.warn(`[${MODULE_ID}] ✗ ${uuid} threw: ${e.message}`);
  }
}

async function tick() {
  let contracts = [];
  try { contracts = cq.pending('emerge'); }
  catch (e) { console.warn(`[${MODULE_ID}] pending() failed: ${e.message}`); return; }

  for (const c of contracts) {
    // pending() already filters to QUEUED|DISPATCHED — accept() below
    // moves it to RUNNING so it won't be picked up again next tick.
    await processOne(c);
  }
}

let _timer = null;

function start() {
  console.log(`[${MODULE_ID}] v${VERSION} — watching emerge/input/ every ${POLL_MS}ms, reporting to ${COPILOT_URL}`);
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  tick().catch(e => console.error(`[${MODULE_ID}] tick error:`, e.message));
  _timer = setInterval(() => {
    tick().catch(e => console.error(`[${MODULE_ID}] tick error:`, e.message));
  }, POLL_MS);
}

function stop() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

if (require.main === module) start();

module.exports = { start, stop, tick, processOne, MODULE_ID, VERSION };
