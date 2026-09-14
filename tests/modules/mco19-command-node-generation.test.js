'use strict';

/**
 * tests/modules/mco19-command-node-generation.test.js
 *
 * §MCO19 2026-09-13 — James: "hook all of that into copilot, .command
 * files and .tool files." Real tests for lib/generate-command-nodes.js
 * (shared writer) and copilot/lib/command-index-extract.js (copilot's
 * own real extractor, new this pass).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { generateCommandNodes, checkCommandDrift } = require('../../lib/generate-command-nodes.js');
const { extractCommandIndex } = require('../../copilot/lib/command-index-extract.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

test('CMD-001: extractCommandIndex finds the real, current GET /api/tools route', () => {
  const r = extractCommandIndex();
  assert.ok(r.commands.some(c => c.method === 'GET' && c.path === '/api/tools'));
});

test('CMD-002: generateCommandNodes refuses missing required args', () => {
  assert.throws(() => generateCommandNodes({}));
});

test('CMD-003: generateCommandNodes writes one real .command file per real route, into an isolated dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-nodes-test-'));
  const fakeExtract = () => ({ generatedAt: Date.now(), commands: [{ method: 'GET', path: '/api/tools', idiom: 'single' }, { method: 'POST', path: '/api/prompt', idiom: 'single' }] });
  const r = generateCommandNodes({ systemId: 'fake-system', extractCommandIndex: fakeExtract, destDir: dir });
  assert.strictEqual(r.commandCount, 2);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.command'));
  assert.strictEqual(files.length, 2);
  const { importFromFile } = require('../../lib/node-export.js');
  const docs = files.map(f => importFromFile(path.join(dir, f)));
  assert.ok(docs.some(d => d.payload.method === 'GET' && d.payload.path === '/api/tools'));
  assert.ok(docs.some(d => d.payload.method === 'POST' && d.payload.path === '/api/prompt'));
});

test('CMD-004: a regenerate wipes stale .command files from a prior generation, never leaves orphans', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-nodes-test-'));
  const extractV1 = () => ({ generatedAt: Date.now(), commands: [{ method: 'GET', path: '/old-route', idiom: 'single' }] });
  generateCommandNodes({ systemId: 'fake-system', extractCommandIndex: extractV1, destDir: dir });
  const extractV2 = () => ({ generatedAt: Date.now(), commands: [{ method: 'GET', path: '/new-route', idiom: 'single' }] });
  generateCommandNodes({ systemId: 'fake-system', extractCommandIndex: extractV2, destDir: dir });
  const { importFromFile } = require('../../lib/node-export.js');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.command'));
  const docs = files.map(f => importFromFile(path.join(dir, f)));
  assert.strictEqual(docs.length, 1);
  assert.strictEqual(docs[0].payload.path, '/new-route');
});

test('CMD-005: checkCommandDrift reports zero drift immediately after a real generation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-nodes-test-'));
  const fakeExtract = () => ({ generatedAt: Date.now(), commands: [{ method: 'GET', path: '/x', idiom: 'single' }] });
  generateCommandNodes({ systemId: 'fake-system', extractCommandIndex: fakeExtract, destDir: dir });
  const drift = checkCommandDrift({ extractCommandIndex: fakeExtract, destDir: dir });
  assert.strictEqual(drift.drifted, false);
});

test('CMD-006: checkCommandDrift reports a real, specific gap when the live source has a route the disk does not', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-nodes-test-'));
  const extractV1 = () => ({ generatedAt: Date.now(), commands: [{ method: 'GET', path: '/x', idiom: 'single' }] });
  generateCommandNodes({ systemId: 'fake-system', extractCommandIndex: extractV1, destDir: dir });
  const extractV2 = () => ({ generatedAt: Date.now(), commands: [{ method: 'GET', path: '/x', idiom: 'single' }, { method: 'GET', path: '/y', idiom: 'single' }] });
  const drift = checkCommandDrift({ extractCommandIndex: extractV2, destDir: dir });
  assert.strictEqual(drift.drifted, true);
  assert.ok(drift.missing.includes('GET /y'));
});

console.log(`\n  mco19-command-node-generation: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
