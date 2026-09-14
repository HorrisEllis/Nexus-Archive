// tests/modules/mco22-idearium-repo-manifest.test.mjs
//
// §MCO22 2026-09-13 — real, live test: idearium/repo/index.js's own
// RepoLayer.ingest(), given a real compartmentId, now also records that
// compartment into a real, append-only manifest (lib/repo-manifest.js),
// via createRequire interop from this real ESM module. .mjs because
// idearium/ is "type":"module" — same real convention idearium-repo-
// watcher.test.mjs already established.
//
// §ISOLATED — a fresh JAA_DATA_DIR per run (set BEFORE any dynamic
// import touches the JAA store, which reads that env var at module-load
// time — static imports are hoisted in ESM and would run too early for
// this, so this file uses dynamic import() instead). Without this,
// RepoLayer.ingest()'s own real, documented content-dedup would reuse a
// PRIOR run's real repo for identical content and this test would only
// ever pass on its first-ever run.
import fs from 'fs';
import os from 'os';
import path from 'path';

process.env.JAA_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mco22-jaa-'));
const TMP_IDEARIUM_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'idearium-repo-manifest-test-'));
process.env.IDEARIUM_DATA_DIR = TMP_IDEARIUM_DATA;

const { RepoLayer } = await import('../../idearium/repo/index.js');
const specEngine = await import('../../idearium/spec-engine/index.js');
const { createRequire } = await import('module');
const require = createRequire(import.meta.url);
const { loadRepoManifest } = require('../../lib/repo-manifest.js');

let passed = 0, failed = 0;
function ok(id, desc, cond, detail) {
  if (cond) { console.log(`  ✓ ${id} ${desc}`); passed++; }
  else { console.error(`  ✗ ${id} ${desc}${detail ? ' — ' + detail : ''}`); failed++; }
}

const fakeIdeaOS = { db: { ideas: [] } }; // real, minimal — no createIdea method, exercises the fallback push path

const repoLayer = new RepoLayer({ ideaOS: fakeIdeaOS, specEngine, dataDir: TMP_IDEARIUM_DATA });

const result = repoLayer.ingest({
  name: 'mco22-test-repo',
  files: [{ path: 'hello.txt', content: 'real test content' }],
  source: 'test',
  compartmentId: 'compartment-mco22-1',
});

ok('IRM-001', 'ingest() with a real compartmentId succeeds and returns a real repo', !result.error && !!result.repo, JSON.stringify(result));

if (result.repo) {
  const manifest = loadRepoManifest(result.repo.uuid, path.join(process.cwd(), 'data', 'nodes', 'manifest'));
  ok('IRM-002', 'a real .manifest node was created for this repo, keyed by its real uuid', manifest.ok && manifest.exists, JSON.stringify(manifest));
  ok('IRM-003', 'the manifest\'s first entry is the real compartmentId from ingest()', manifest.compartments?.[0]?.compartmentUuid === 'compartment-mco22-1');
  ok('IRM-004', 'the repo record itself STILL has its own real compartmentId field (§SBP1, unchanged)', result.repo.compartmentId === 'compartment-mco22-1');

  const result2 = repoLayer.ingest({
    name: 'mco22-test-repo-2',
    files: [{ path: 'other.txt', content: 'different real content' }],
    source: 'test',
    compartmentId: 'compartment-mco22-2',
  });
  if (result2.repo) {
    const manifest2 = loadRepoManifest(result2.repo.uuid, path.join(process.cwd(), 'data', 'nodes', 'manifest'));
    ok('IRM-005', 'a second real repo gets its OWN separate manifest, never mixed with the first', manifest2.compartments?.[0]?.compartmentUuid === 'compartment-mco22-2' && manifest2.compartments.length === 1);
  } else {
    ok('IRM-005', 'a second real repo gets its OWN separate manifest, never mixed with the first', false, 'second ingest failed: ' + JSON.stringify(result2));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
