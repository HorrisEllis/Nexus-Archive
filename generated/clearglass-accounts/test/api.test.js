'use strict';
/**
 * generated/clearglass-accounts/test/api.test.js
 * Runs a minimal fake vaultd on localhost so accounts.add/remove are
 * tested against a real HTTP round-trip, not mocked at the function level.
 * The fake implements only what this client calls: POST /secrets,
 * DELETE /secrets/:compartment/:key — same shape as the real cos/vaultd
 * server.js, not invented.
 * Run: node generated/clearglass-accounts/test/api.test.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const assert = require('assert');

let pass = 0, fail = 0;
async function check(label, fn) {
  try { await fn(); pass++; console.log(`  PASS  ${label}`); }
  catch (e) { fail++; console.log(`  FAIL  ${label} — ${e.message}`); }
}

function startFakeVaultd(port) {
  const secrets = new Map();
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      const parts = req.url.split('/').filter(Boolean);
      if (req.method === 'POST' && parts[0] === 'secrets') {
        const b = JSON.parse(body || '{}');
        const key = `${b.compartmentName}/${b.key}`;
        secrets.set(key, b.value);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ record: { key: b.key } }));
        return;
      }
      if (req.method === 'DELETE' && parts[0] === 'secrets') {
        const key = `${parts[1]}/${parts[2]}`;
        const existed = secrets.delete(key);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ record: existed ? { key: parts[2] } : null }));
        return;
      }
      res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{}');
    });
  });
  return new Promise(resolve => server.listen(port, () => resolve({ server, secrets })));
}

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cga-test-'));
  process.env.CLEARGLASS_ACCOUNTS_DATA = dataDir;
  const vaultdPort = 17650;
  process.env.VAULTD_URL = `http://127.0.0.1:${vaultdPort}`;
  process.env.ACCOUNTS_USAGE_THRESHOLD = '90';

  const { server: fakeVaultd, secrets } = await startFakeVaultd(vaultdPort);
  const { dispatch } = require('../api/index');

  console.log('\nclearglass-accounts — real API test (against a fake local vaultd)\n');

  let acctA, acctB;

  await check('accounts.add fails cleanly with missing fields, does not touch vaultd', async () => {
    const r = await dispatch('accounts.add', { provider: 'claude' }); // no sessionRef
    assert.strictEqual(r.ok, false);
    assert.strictEqual(secrets.size, 0);
  });

  await check('accounts.add writes the secret to vaultd (real HTTP round trip) and returns an account', async () => {
    const r = await dispatch('accounts.add', { provider: 'claude', label: 'work account', sessionRef: 'sess-abc-123' });
    assert.strictEqual(r.ok, true, JSON.stringify(r));
    acctA = r.account;
    assert.strictEqual(secrets.get(`clearglass-accounts/${acctA.vaultKey}`), 'sess-abc-123');
  });

  await check('accounts.add persists account metadata to disk (not the raw secret)', async () => {
    const onDisk = JSON.parse(fs.readFileSync(path.join(dataDir, 'accounts.json'), 'utf8'));
    assert.ok(onDisk[acctA.id]);
    assert.strictEqual(JSON.stringify(onDisk).includes('sess-abc-123'), false, 'raw secret leaked into local disk store — must live in vaultd only');
  });

  await check('accounts.list reflects what was added', async () => {
    const r = await dispatch('accounts.list', {});
    assert.strictEqual(r.accounts.length, 1);
  });

  await check('accounts.route with only one account under threshold returns it', async () => {
    const r = await dispatch('accounts.route', { provider: 'claude' });
    assert.strictEqual(r.ok, true, JSON.stringify(r));
    assert.strictEqual(r.routedTo, acctA.id);
  });

  await check('second account added for the same provider', async () => {
    const r = await dispatch('accounts.add', { provider: 'claude', label: 'backup account', sessionRef: 'sess-xyz-789' });
    assert.strictEqual(r.ok, true);
    acctB = r.account;
  });

  await check('usage-report rejects an out-of-range percent', async () => {
    const r = await dispatch('accounts.usage-report', { id: acctA.id, percent: '150' });
    assert.strictEqual(r.ok, false);
  });

  await check('reporting acctA at 95% (over the 90% threshold) is flagged', async () => {
    const r = await dispatch('accounts.usage-report', { id: acctA.id, percent: '95', source: 'dom-scrape' });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.overThreshold, true);
  });

  await check('reporting acctB at 40% (under threshold)', async () => {
    const r = await dispatch('accounts.usage-report', { id: acctB.id, percent: '40', source: 'dom-scrape' });
    assert.strictEqual(r.overThreshold, false);
  });

  await check('dynamic routing now picks acctB (under threshold), skips acctA (over threshold) — this is the actual 90%-detection feature', async () => {
    const r = await dispatch('accounts.route', { provider: 'claude' });
    assert.strictEqual(r.ok, true, JSON.stringify(r));
    assert.strictEqual(r.routedTo, acctB.id, `expected routing to skip the over-threshold account and pick ${acctB.id}, got ${r.routedTo}`);
  });

  await check('if ALL accounts for a provider are over threshold, routing fails honestly instead of returning a bad account', async () => {
    await dispatch('accounts.usage-report', { id: acctB.id, percent: '99', source: 'dom-scrape' });
    const r = await dispatch('accounts.route', { provider: 'claude' });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('none available'));
  });

  await check('accounts.remove revokes the vaultd secret and removes local metadata', async () => {
    const before = secrets.size;
    const r = await dispatch('accounts.remove', { id: acctA.id });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(secrets.size, before - 1);
    const list = await dispatch('accounts.list', {});
    assert.strictEqual(list.accounts.find(a => a.id === acctA.id), undefined);
  });

  await check('when vaultd is unreachable, accounts.add fails honestly and does not silently register an unprotected account', async () => {
    fakeVaultd.close();
    const r = await dispatch('accounts.add', { provider: 'chatgpt', sessionRef: 'sess-should-not-land' });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('vaultd write failed'));
  });

  console.log(`\n${pass} passed, ${fail} failed\n`);
  if (fail > 0) process.exit(1);
  process.exit(0);
}

main();
