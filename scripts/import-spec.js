#!/usr/bin/env node
'use strict';
// ── scripts/import-spec.js ──────────────────────────────────────────────────
// UUID: nexus-import-spec-v1-0000-0000-0000-000000000001
// Version: 1.1.0
//
// Practical import for nexus-system.spec-format files, right now — before
// Phase 66 (Idearium-native import) exists. Verify+decode logic now lives in
// lib/spec-container.js (shared with idearium/repo/watcher.js, which does
// the same job automatically on drop — this script is the manual/CLI path
// for when you want a plain directory on disk instead of an idearium repo
// record). §FIX 2026-06-21: this used to inline the same hash-verify logic
// watcher.js needed too — factored out so neither duplicates it.
//
// Usage:
//   node scripts/import-spec.js path/to/nexus-system.spec [output-dir]
//
// Default output-dir: ./imported-<name>-<version>

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { verifyAndDecode } = require('../lib/spec-container');

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const specPath = process.argv[2];
if (!specPath) fail('Usage: node scripts/import-spec.js path/to/nexus-system.spec [output-dir]');
if (!fs.existsSync(specPath)) fail(`File not found: ${specPath}`);

console.log(`Reading + verifying ${specPath}...`);
let result;
try {
  result = verifyAndDecode(specPath);
} catch (e) {
  fail(e.message);
}
console.log(`  name: ${result.name}, version: ${result.version}`);
console.log(`  ✓ hash verified: ${result.hash}`);

const outDir = process.argv[3] || `imported-${result.name}-${result.version}`;
if (fs.existsSync(outDir)) fail(`Output dir already exists: ${outDir} — refusing to overwrite, pick a different path`);

const tmpZip = `.${result.name}-${result.version}-import.zip`;
fs.writeFileSync(tmpZip, result.archiveBuffer);

console.log(`Extracting to ${outDir}/...`);
fs.mkdirSync(outDir, { recursive: true });
try {
  execSync(`unzip -q "${tmpZip}" -d "${outDir}"`, { stdio: 'inherit' });
} catch (e) {
  fs.unlinkSync(tmpZip);
  fail(`unzip failed: ${e.message}`);
}
fs.unlinkSync(tmpZip);

console.log(`\n✓ Imported ${result.name}@${result.version} into ${outDir}/`);
console.log(`  Verified hash: ${result.hash}`);
console.log(`  This is byte-identical to the repo state at generation time.`);
if (result.buildSpec) {
  fs.writeFileSync(path.join(outDir, '.import-build-spec.md'), result.buildSpec);
  console.log(`  Build spec text saved to ${outDir}/.import-build-spec.md`);
}
