#!/usr/bin/env node
'use strict';
/**
 * scripts/precommit-check.js — mechanical enforcement of CLAUDE.md's rules.
 * Install as a git hook:  ln -sf ../../scripts/precommit-check.js .git/hooks/pre-commit
 * (or run manually: node scripts/precommit-check.js)
 *
 * It does NOT replace judgment — it catches the three failures that have
 * actually happened: committing data/, adding a component with no registry
 * wire, and authoring a spec that never gets registered.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function staged() {
  try { return execSync('git diff --cached --name-only', { cwd: ROOT }).toString().trim().split('\n').filter(Boolean); }
  catch { return []; }
}

const files = staged();
const errors = [];
const warnings = [];

// RULE: never commit data/** (§2.2 — state, not code). HARD BLOCK.
for (const f of files) {
  if (/^data\//.test(f) || /\/data\//.test(f)) errors.push(`data/ staged: ${f} — state is never committed`);
}

// RULE: a new lib/ or system component should be in a loom map WITH wires.
const loomMaps = fs.existsSync(path.join(ROOT, 'loom/maps'))
  ? fs.readdirSync(path.join(ROOT, 'loom/maps')).map(f => fs.readFileSync(path.join(ROOT, 'loom/maps', f), 'utf8')).join('\n')
  : '';
for (const f of files) {
  if (!/^(lib|copilot|cortex|guardian|bridge)\/.*\.js$/.test(f)) continue;
  if (/test|\.test\.|maps\//.test(f)) continue;
  // is this file referenced in any loom map?
  const base = f.replace(/\.js$/, '');
  if (loomMaps && !loomMaps.includes(f) && !loomMaps.includes(base)) {
    warnings.push(`${f} is not referenced in any loom/maps/*.js — component registry may be missing its wires (CLAUDE.md rule 3)`);
  }
}

// RULE: a new .spec should be registered in docs/SPEC-REGISTRY.md (§6.3).
const specReg = fs.existsSync(path.join(ROOT, 'docs/SPEC-REGISTRY.md'))
  ? fs.readFileSync(path.join(ROOT, 'docs/SPEC-REGISTRY.md'), 'utf8') : '';
for (const f of files) {
  if (!/\.spec$/.test(f)) continue;
  const base = path.basename(f);
  if (specReg && !specReg.includes(base) && !specReg.includes(f)) {
    warnings.push(`${f} is not in docs/SPEC-REGISTRY.md — register it (CLAUDE.md rule 4 / §6.3)`);
  }
}

if (warnings.length) {
  console.warn('\n⚠ NEXUS working-agreement warnings:');
  for (const w of warnings) console.warn('  · ' + w);
}
if (errors.length) {
  console.error('\n✗ NEXUS working-agreement BLOCKS this commit:');
  for (const e of errors) console.error('  · ' + e);
  console.error('\nSee CLAUDE.md. Fix or use --no-verify only with reason.\n');
  process.exit(1);
}
if (warnings.length) console.warn('  (warnings do not block — but address them)\n');
process.exit(0);
