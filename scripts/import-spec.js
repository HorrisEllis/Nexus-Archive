#!/usr/bin/env node
'use strict';
// ── scripts/import-spec.js ──────────────────────────────────────────────────
// UUID: nexus-import-spec-v1-0000-0000-0000-000000000001
// Version: 1.0.0
//
// Practical import for nexus-system.spec-format files, right now — before
// Phase 66 (Idearium-native import) exists. Reads the header fast (same
// regex spec-drift.js uses), verifies archive_sha256 BEFORE writing
// anything (§1.2 — corrupt input fails loud, not partially), then extracts.
//
// Usage:
//   node scripts/import-spec.js path/to/nexus-system.spec [output-dir]
//
// Default output-dir: ./imported-<name>-<version>

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const specPath = process.argv[2];
if (!specPath) fail('Usage: node scripts/import-spec.js path/to/nexus-system.spec [output-dir]');
if (!fs.existsSync(specPath)) fail(`File not found: ${specPath}`);

console.log(`Reading header from ${specPath}...`);
const fd = fs.openSync(specPath, 'r');
const headerBuf = Buffer.alloc(8192);
fs.readSync(fd, headerBuf, 0, 8192, 0);
fs.closeSync(fd);
const header = headerBuf.toString('utf8');

const nameMatch    = header.match(/^\s+name:\s+['"]?([^\s'"#\n]+)['"]?/m);
const versionMatch = header.match(/^\s+version:\s+['"]?([0-9]+\.[0-9]+\.[0-9][^\s'"#\n]*)['"]?/m);
const hashMatch    = header.match(/^\s+archive_sha256:\s+['"]?([a-f0-9]{64})['"]?/m);
const bytesMatch   = header.match(/^\s+archive_bytes:\s+(\d+)/m);

if (!nameMatch || !versionMatch) fail('Could not parse name/version from header — is this a valid .spec file?');
const name    = nameMatch[1];
const version = versionMatch[1];
console.log(`  name: ${name}, version: ${version}`);

if (!hashMatch) fail('No archive_sha256 in header — this .spec has no verifiable archive, or is a module-level spec (no payload to import). Module specs (docs/*.spec) describe code, they don\'t contain it.');
const expectedHash = hashMatch[1];
const expectedBytes = bytesMatch ? parseInt(bytesMatch[1], 10) : null;

const outDir = process.argv[3] || `imported-${name}-${version}`;
if (fs.existsSync(outDir)) fail(`Output dir already exists: ${outDir} — refusing to overwrite, pick a different path`);

console.log('Extracting base64 archive block...');
const content = fs.readFileSync(specPath, 'utf8');
const archiveIdx = content.indexOf('archive: |\n');
if (archiveIdx === -1) fail('No "archive: |" block found — this .spec has no embedded payload.');

const afterMarker = content.slice(archiveIdx + 'archive: |\n'.length);
const b64Lines = afterMarker.split('\n').filter(l => l.startsWith('    '));
const b64 = b64Lines.map(l => l.slice(4)).join('');

console.log(`Decoding ${b64.length} base64 chars...`);
const decoded = Buffer.from(b64, 'base64');

if (expectedBytes && decoded.length !== expectedBytes) {
  fail(`Decoded size mismatch: expected ${expectedBytes} bytes, got ${decoded.length}. Archive is corrupt or truncated — refusing to write anything.`);
}

console.log('Verifying SHA-256 before writing anything...');
const actualHash = crypto.createHash('sha256').update(decoded).digest('hex');
if (actualHash !== expectedHash) {
  fail(`SHA-256 MISMATCH.\n  expected: ${expectedHash}\n  actual:   ${actualHash}\nArchive is corrupt — refusing to write anything (§1.2: corrupt input fails loud, not partially).`);
}
console.log(`  ✓ hash verified: ${actualHash}`);

const tmpZip = `.${name}-${version}-import.zip`;
fs.writeFileSync(tmpZip, decoded);

console.log(`Extracting to ${outDir}/...`);
fs.mkdirSync(outDir, { recursive: true });
try {
  execSync(`unzip -q "${tmpZip}" -d "${outDir}"`, { stdio: 'inherit' });
} catch (e) {
  fs.unlinkSync(tmpZip);
  fail(`unzip failed: ${e.message}`);
}
fs.unlinkSync(tmpZip);

console.log(`\n✓ Imported ${name}@${version} into ${outDir}/`);
console.log(`  Verified hash: ${actualHash}`);
console.log(`  This is byte-identical to the repo state at generation time.`);
