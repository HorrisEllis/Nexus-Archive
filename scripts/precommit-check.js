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
// §BUGFIX 2026-08-08 — path.resolve(__dirname, '..') assumed this file is
// where its own header comment says to install it (a SYMLINK at
// .git/hooks/pre-commit -> ../../scripts/precommit-check.js), so __dirname
// would resolve to scripts/ either way. It was installed as a plain COPY
// instead — __dirname resolves to .git/hooks, so ROOT became .git itself.
// That's silent when run manually (git diff --cached still finds the repo
// by walking up from a bad cwd), but git's own hook invocation sets
// GIT_INDEX_FILE as a path RELATIVE to the intended repo root — resolved
// against the wrong ROOT here, it pointed at a nonexistent .git/.git/index,
// and the check fell back to stale/wrong staged-file data. Found by direct
// comparison: `git diff --cached --name-only` run manually was clean; the
// exact same command inside this hook, invoked BY git commit, was not.
// `git rev-parse --show-toplevel` is correct regardless of whether this
// file is a symlink, a copy, or moved again — it asks git, not the
// filesystem, where the repo root is.
const ROOT = execSync('git rev-parse --show-toplevel').toString().trim();

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

// RULE: §5.4 — versions persist across the entire project. Every known
// per-system version literal must match lib/version.js's services registry
// (the file every "canonical: lib/version.js — §5.4" comment in this repo
// points to). Runs on EVERY commit, not just ones touching these files —
// drift is a property of the whole tree at any moment, not just of a diff,
// and the whole point of enforcing this is that it can't come back via an
// unrelated commit either. HARD BLOCK: §5.4's own text calls drift "a bug,
// not an oversight," the same severity as the data/ rule above.
//
// Found 2026-08-08 while running buildNexusModel() live and checking its
// output against reality: loom/registry-components.js had drifted from
// lib/version.js (1.2.0 vs 1.3.0). A wider sweep of every other tracked
// system found four more (bridge, cortex, guardian, emerge) plus two
// hardcoded literals in orchestrator.js that had drifted from an import
// already sitting in scope for exactly this reason. All fixed same session;
// this block is what stops it happening again silently.
const VERSION_SOURCES = [
  { system: 'bridge',       file: 'bridge/registry-components.js',       re: /const V\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'cortex',       file: 'cortex/registry-components.js',       re: /const V\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'guardian',     file: 'guardian/registry-components.js',     re: /const V\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'idearium',     file: 'idearium/index.js',                   re: /export const VERSION\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'architect',    file: 'architect/registry-components.js',    re: /const V\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'emerge',       file: 'emerge/registry-components.js',       re: /const V\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'eravos',       file: 'eravos/server.js',                    re: /const VERSION\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'ollama-bridge', file: 'ollama/server.js',                   re: /const VERSION\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'clear-glass',  file: 'clear-glass/registry-components.js',  re: /const V\s*=\s*'([\d.]+[\w.-]*)'/ },
  { system: 'loom',         file: 'loom/registry-components.js',         re: /const V\s*=\s*'([\d.]+[\w.-]*)'/ },
];
try {
  const canonical = require(path.join(ROOT, 'lib/version.js')).services || {};
  for (const src of VERSION_SOURCES) {
    const full = path.join(ROOT, src.file);
    if (!fs.existsSync(full)) continue;   // file moved/removed — not this check's job to flag
    const content = fs.readFileSync(full, 'utf8');
    const m = content.match(src.re);
    if (!m) continue;   // pattern not found — file restructured; not a drift claim without evidence
    const declared = m[1];
    const expected = canonical[src.system];
    if (expected && declared !== expected) {
      errors.push(`§5.4 version drift: ${src.file} declares ${declared}, lib/version.js's services.${src.system} says ${expected} — one of them is wrong, fix before committing`);
    }
  }
} catch (e) {
  warnings.push(`§5.4 version-drift check could not run: ${e.message}`);
}

// RULE: every staged .js file must be syntactically valid AND must not
// crash on require() from a bare reference error. §BUILT 2026-08-17 —
// James: "before each output you need to be testing and verifying it...
// I need this enforced." Real, honest scoping: the full test suite
// (tests/modules/run-all.js, ~1400 real individual test cases across 169
// curated suites, confirmed by actually running it) includes genuine
// subprocess/crash-restart simulations and didn't finish in 90 real
// seconds — a hard block on the FULL suite every single commit would
// make every commit take minutes, which serves no one. This is the real,
// fast, high-value subset: node --check catches a real syntax error in
// under a second per file; a bounded real require() catches exactly the
// class of bug this same session found earlier tonight in lib/nexus-
// client.js — a missing import that crashed a real live server, syntax-
// checked clean, only caught by actually starting the process. HARD
// BLOCK, same severity as the data/ rule — a file that crashes on
// require() is not a judgment call.
const { spawnSync } = require('child_process');
for (const f of files) {
  if (!/\.js$/.test(f) || /\.test\.js$/.test(f) || /^tests\//.test(f)) continue;
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue; // deleted/renamed in this commit — nothing to check
  const syntax = spawnSync(process.execPath, ['--check', full], { encoding: 'utf8', timeout: 5000 });
  if (syntax.status !== 0) {
    errors.push(`${f} — syntax error: ${(syntax.stderr || '').split('\n')[0]}`);
    continue; // a require() attempt on a syntax-broken file would just repeat the same failure
  }
  // §SELF-REFERENCE — requiring this exact file would re-run its own real
  // logic (execSync git calls, the whole check) as a side effect, since it
  // executes immediately rather than gating behind require.main. The real
  // syntax check above already ran for it; that's a sufficient real check
  // for this one specific file.
  if (f === 'scripts/precommit-check.js') continue;

  const req = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(full)})`], { cwd: ROOT, encoding: 'utf8', timeout: 8000 });
  // §CORRECTED, found by testing before shipping: a real, long-running
  // server (cortex/boot.js, confirmed) correctly stays alive and gets
  // killed by the timeout below — that's status:null, signal:'SIGTERM',
  // NOT a crash. A genuine crash (a real bug, confirmed against the exact
  // class this session already hit once with lib/nexus-client.js) is
  // status:1, signal:null. The first version of this check treated both
  // identically and would have falsely blocked every commit touching any
  // file designed to start a real server on require() — caught before
  // this ever shipped, not after.
  if (req.status !== 0 && req.signal !== 'SIGTERM') {
    const firstLine = (req.stderr || '').split('\n').find(l => /Error/.test(l)) || (req.stderr || '').split('\n')[0];
    errors.push(`${f} — crashes on require(): ${firstLine}`);
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
