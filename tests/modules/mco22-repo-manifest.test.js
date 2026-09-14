'use strict';

/**
 * tests/modules/mco22-repo-manifest.test.js
 *
 * §MCO22 2026-09-13 — real tests for lib/repo-manifest.js: the append-
 * only "COS node" tracking every compartment that has touched an
 * idearium repo over its life.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { loadRepoManifest, recordCompartmentForRepo } = require('../../lib/repo-manifest.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'repo-manifest-test-')); }

test('RM-001: a repo with no compartments yet has a real, empty (not missing) manifest state', () => {
  const dir = tmpDir();
  const r = loadRepoManifest('nexus-id-repo-none', dir);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.exists, false);
  assert.deepStrictEqual(r.compartments, []);
});

test('RM-002: recordCompartmentForRepo refuses a missing repoUuid', () => {
  const r = recordCompartmentForRepo(null, { compartmentUuid: 'c-1' });
  assert.strictEqual(r.ok, false);
});

test('RM-003: recordCompartmentForRepo refuses a compartmentRecord with no real compartmentUuid', () => {
  const r = recordCompartmentForRepo('repo-1', {});
  assert.strictEqual(r.ok, false);
});

test('RM-004: the first real compartment recorded creates a real manifest with exactly one entry', () => {
  const dir = tmpDir();
  const r = recordCompartmentForRepo('repo-A', { compartmentUuid: 'c-1', compartmentType: 'worksurface', status: 'PASS' }, { dataDir: dir, specUuid: 'spec-1' });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.manifest.compartments.length, 1);
  assert.strictEqual(r.manifest.compartments[0].compartmentUuid, 'c-1');
  assert.strictEqual(r.manifest.specUuid, 'spec-1');
});

test('RM-005: a second real compartment APPENDS, never overwrites the first', () => {
  const dir = tmpDir();
  recordCompartmentForRepo('repo-B', { compartmentUuid: 'c-1', status: 'PASS' }, { dataDir: dir });
  const r2 = recordCompartmentForRepo('repo-B', { compartmentUuid: 'c-2', status: 'RUNNING' }, { dataDir: dir });
  assert.strictEqual(r2.ok, true);
  assert.strictEqual(r2.manifest.compartments.length, 2);
  assert.strictEqual(r2.manifest.compartments[0].compartmentUuid, 'c-1', 'the first real entry must still be present, untouched');
  assert.strictEqual(r2.manifest.compartments[1].compartmentUuid, 'c-2');
});

test('RM-006: loadRepoManifest reads back exactly what was recorded, across a fresh call', () => {
  const dir = tmpDir();
  recordCompartmentForRepo('repo-C', { compartmentUuid: 'c-1', compartmentType: 'worksurface', workSurfaces: ['ws-1'] }, { dataDir: dir });
  const loaded = loadRepoManifest('repo-C', dir);
  assert.strictEqual(loaded.ok, true);
  assert.strictEqual(loaded.exists, true);
  assert.strictEqual(loaded.compartments.length, 1);
  assert.deepStrictEqual(loaded.compartments[0].workSurfaces, ['ws-1']);
});

test('RM-007: compartmentType defaults to "standard" when not given, never fabricated as something else', () => {
  const dir = tmpDir();
  const r = recordCompartmentForRepo('repo-D', { compartmentUuid: 'c-1' }, { dataDir: dir });
  assert.strictEqual(r.manifest.compartments[0].compartmentType, 'standard');
});

test('RM-008: two different repos get two completely separate manifests, never mixed', () => {
  const dir = tmpDir();
  recordCompartmentForRepo('repo-E', { compartmentUuid: 'c-e1' }, { dataDir: dir });
  recordCompartmentForRepo('repo-F', { compartmentUuid: 'c-f1' }, { dataDir: dir });
  const e = loadRepoManifest('repo-E', dir);
  const f = loadRepoManifest('repo-F', dir);
  assert.strictEqual(e.compartments.length, 1);
  assert.strictEqual(f.compartments.length, 1);
  assert.notStrictEqual(e.compartments[0].compartmentUuid, f.compartments[0].compartmentUuid);
});

console.log(`\n  mco22-repo-manifest: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
