'use strict';
// tests/modules/test-mco6-repo-compartment.js — MCO6, closing the two real
// gaps found while mapping it: spec.promote and speceng.create's
// auto-repo path both created repos with compartmentId permanently null
// (no compartment attached at all, not even a caller-supplied one — the
// same class of gap idearium-phase-compartment-integration.test.js
// already closed for idea.phase, one caller over). Real server, real
// scratch port, real HTTP, real COS compartment store — no fixtures.

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 18712; // real scratch port — distinct from every other test's
const HOST = '127.0.0.1';

function req(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request({
      hostname: HOST, port: PORT, path: urlPath, method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
    }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => { try { resolve({ code: res.statusCode, body: JSON.parse(raw || '{}') }); } catch (e) { reject(new Error(`bad JSON from ${urlPath}: ${raw.slice(0, 300)}`)); } });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function waitForReady(child, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('idearium API did not report ready in time')), timeoutMs);
    let buf = '';
    child.stdout.on('data', (d) => { buf += d.toString(); if (buf.includes('Idearium ready')) { clearTimeout(timer); resolve(); } });
    child.stderr.on('data', (d) => { buf += d.toString(); });
  });
}

let passed = 0, failed = 0;
const t = (id, name, cond) => { if (cond) { passed++; console.log(`  ✓ ${id} ${name}`); } else { failed++; console.log(`  ✗ ${id} ${name}`); } };

async function main() {
  const child = spawn('node', ['idearium/api/index.js'], {
    cwd: path.join(__dirname, '..', '..'),
    env: { ...process.env, IDEARIUM_PORT: String(PORT) },
  });
  let stderrBuf = '';
  child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

  try {
    await waitForReady(child);

    console.log('\n[1] speceng.create — the auto-repo path (comment already said "specs build compartments"; never wired)');
    const created = await req('POST', '/api/spec-engine/specs', { name: 'mco6-auto-' + Date.now(), templateId: 'genesis' });
    t('M6-001', 'a real spec + auto-repo really got created over real HTTP', created.code === 200 && typeof created.body.repoUuid === 'string');

    const autoRepo = await req('GET', `/api/repos/${created.body.repoUuid}`);
    t('M6-002', 'the auto-created repo has a real, non-null compartmentId — this used to be null forever', typeof autoRepo.body.repo?.compartmentId === 'string' && autoRepo.body.repo.compartmentId.length > 0);

    console.log('\n[2] spec.promote — the explicit promote path (same class of gap, second call site)');
    const promoted = await req('POST', `/api/spec-engine/specs/${created.body.manifest.uuid}/promote`, { mode: 'manual' });
    t('M6-003', 'manual-promote of the same spec succeeds', promoted.code === 200 && typeof promoted.body.repoUuid === 'string');

    const promotedRepo = await req('GET', `/api/repos/${promoted.body.repoUuid}`);
    t('M6-004', 'the promoted repo has a real, non-null compartmentId', typeof promotedRepo.body.repo?.compartmentId === 'string' && promotedRepo.body.repo.compartmentId.length > 0);

    console.log('\n[3] one real abstraction, not two — both ids resolve in the same real COS store');
    // Bridging into the same process's COS store the way any real NEXUS
    // caller would (lib/cos-bridge.js), not a second implementation of
    // "look up a compartment" for this test.
    const cosBridge = require(path.join(__dirname, '..', '..', 'lib', 'cos-bridge.js'));
    const c1 = cosBridge.getCompartment ? cosBridge.getCompartment(autoRepo.body.repo.compartmentId) : null;
    t('M6-005', 'cos-bridge.js exports a real getCompartment lookup', typeof cosBridge.getCompartment === 'function');
    t('M6-006', 'the auto-repo compartment id is a real COS compartment, findable in the real COS store', !!c1);

    // §REAL BEHAVIOR, NOT A BUG — RepoLayer.ingest()'s own §DEDUP check
    // (idearium/repo/index.js) reuses an existing repo by content
    // rootHash. Promoting the same spec that already auto-created its
    // repo hits that dedup and returns the SAME repo — so the SAME
    // compartmentId here is correct, not a collision in my fix. Proven
    // directly rather than assumed:
    t('M6-007', 'promoting the already-auto-created spec correctly DEDUPED to the same repo (same compartmentId follows from that, not a bug)',
      promoted.body.repoUuid === created.body.repoUuid);

    // The real "two different repos -> two different compartments" case
    // needs two genuinely different specs (idearium-auto-repo-creation.
    // test.js's own T-002 establishes the same distinction for repos).
    const created2 = await req('POST', '/api/spec-engine/specs', { name: 'mco6-auto-2-' + Date.now(), templateId: 'genesis' });
    const autoRepo2 = await req('GET', `/api/repos/${created2.body.repoUuid}`);
    t('M6-007b', 'two genuinely DIFFERENT specs get two DIFFERENT compartments, not one shared/faked id',
      created2.body.repoUuid !== created.body.repoUuid &&
      autoRepo2.body.repo?.compartmentId !== autoRepo.body.repo?.compartmentId);

    console.log('\n[4] idea.phase — regression check on the migration off compartment-engine.js');
    const idea = await req('POST', '/api/ideas', { text: 'mco6 regression idea' });
    const phased = await req('POST', `/api/ideas/${idea.body.idea.uuid}/phase`, { phase: 'building' });
    t('M6-008', 'idea.phase still returns a real compartmentId after the cos-bridge migration', typeof phased.body.compartmentId === 'string' && phased.body.compartmentId.length > 0);
    const c2 = cosBridge.getCompartment ? cosBridge.getCompartment(phased.body.compartmentId) : null;
    t('M6-009', 'idea.phase\'s compartment is now in the SAME real COS store as a repo\'s — one id-space, not two', !!c2);
    t('M6-010', 'no error logged for any of the above (no silent failures counted as passes)', !stderrBuf.toLowerCase().includes('compartment create failed') && !stderrBuf.toLowerCase().includes('compartment create threw'));

  } finally {
    child.kill();
  }

  console.log(`\n${failed ? '✗' : '✓'} mco6-repo-compartment: ${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
