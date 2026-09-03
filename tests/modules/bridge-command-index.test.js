// tests/modules/bridge-command-index.test.js — docs/command-index-per-
// system.spec's build_order.phase-4 exit criteria: "same as guardian,
// scaled to bridge's 16 real checks." Self-verifying, same discipline
// as the guardian and ollama phase tests: no hardcoded count, the real
// live server's GET /commands is checked against a fresh, independent
// re-run of the exact same real extractor.
'use strict';
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 18734;
const REPO_ROOT = path.join(__dirname, '..', '..');

function get(urlPath) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port: PORT, path: urlPath }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function waitForPort(port, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function tryOnce() {
      http.get({ hostname: '127.0.0.1', port, path: '/health' }, (res) => { res.resume(); resolve(); })
        .on('error', () => { if (Date.now() - start > timeoutMs) reject(new Error('bridge never came up')); else setTimeout(tryOnce, 200); });
    })();
  });
}

let passed = 0, failed = 0;
const t = (id, name, cond) => { if (cond) { passed++; console.log(`  ✓ ${id} ${name}`); } else { failed++; console.log(`  ✗ ${id} ${name}`); } };

async function main() {
  console.log('\n[1] real, fresh, independent re-extraction');
  delete require.cache[require.resolve(path.join(REPO_ROOT, 'bridge', 'lib', 'command-index-extract.js'))];
  const { extractCommandIndex } = require(path.join(REPO_ROOT, 'bridge', 'lib', 'command-index-extract.js'));
  const expected = extractCommandIndex();

  t('BCI-001', 'the real extractor produces a real, non-trivial command count matching the spec\'s own claimed 16-ish scale', expected.commandCount >= 15);
  t('BCI-002', 'the real dynamic-regex idiom (/bridge/requests/:uuid) was really found, not missed', expected.commands.some((c) => c.idiom === 'dynamic-regex'));
  t('BCI-003', 'the real grouped/OR idiom (sse/subscribe alias) really produced two separate real entries', expected.commands.filter((c) => c.idiom === 'grouped').length === 2);
  t('BCI-004', 'the real /cfr prefix delegation is honestly named as an unresolved sub-router, not silently dropped', expected.subRouters.some((s) => s.prefix === '/cfr/*'));

  console.log('\n[2] the real, live bridge server\'s GET /commands matches the fresh extraction exactly');
  const child = spawn('node', ['bridge/index.js'], { cwd: REPO_ROOT, env: { ...process.env, BRIDGE_PORT: String(PORT) } });
  let stderrBuf = '';
  child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

  try {
    await waitForPort(PORT);
    const live = await get('/commands');

    t('BCI-005', 'GET /commands responds with the real systemId', live.systemId === 'bridge');
    t('BCI-006', 'the real live commandCount matches the fresh, independent extraction exactly', live.commandCount === expected.commandCount);
    t('BCI-007', 'a real, known bridge route is present (proves this isn\'t an empty/stub response)', live.commands.some((c) => c.path === '/bridge/handshake' && c.method === 'POST'));
    t('BCI-008', 'the live index includes /commands itself (real, honest self-reference)', live.commands.some((c) => c.path === '/commands'));

    console.log('\n[3] real, honest comparison against bridge\'s own hand-maintained routes: array (found while building this — the exact kind of drift risk this spec exists to close)');
    const fs = require('fs');
    const bridgeSrc = fs.readFileSync(path.join(REPO_ROOT, 'bridge', 'server.js'), 'utf8');
    const handMaintainedCount = (bridgeSrc.match(/\{\s*method:\s*'[A-Z]+',\s*path:\s*'[^']*'\s*\}/g) || []).length;
    t('BCI-009', 'bridge\'s own hand-maintained routes: array is real and measurable', handMaintainedCount > 0);
    console.log(`    (real, honest measurement: bridge's own hand-maintained routes: array declares ${handMaintainedCount} entries; the real, live-extracted index has ${expected.commandCount} — this extractor is now the one, real, non-drifting source; the hand-maintained array is a real, separate follow-up to either remove or point at this endpoint, not addressed by this pass)`);
  } finally {
    child.kill();
  }

  console.log(`\n  bridge-command-index: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
