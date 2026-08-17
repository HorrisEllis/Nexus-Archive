#!/usr/bin/env node
'use strict';
/**
 * scripts/build-userscripts.js — LS1's real build step.
 * UUID: nexus-scripts-build-userscripts-v1-0000-2026-0815-jamesbrooks-001
 *
 * §BUILT 2026-08-15 — checked before writing this: no bundler existed
 * anywhere in this repo (grepped guardian/ for esbuild/rollup/webpack,
 * zero hits). Every userscript was one hand-maintained flat file, and
 * that's exactly why features landed in claude/chatgpt and never reached
 * gemini/perplexity — there was no shared-module layer to add them to
 * once, only four separate files to remember to edit.
 *
 * Composes userscripts/src/shared/*.js (real, tested modules) into each
 * provider's real entry, via esbuild in IIFE mode — so Tampermonkey still
 * receives exactly what it needs: one flat file per provider, no runtime
 * module resolution, nothing changes about what actually gets injected.
 * Source becomes modular; the served artifact doesn't.
 *
 * §OUTPUT SAFETY — writes to userscripts/dist/, never to guardian/
 * directly. Per this phase's own stated risk ("these four files are live,
 * running, injected into real provider pages right now... build in a
 * playground before touching the served copy"), this script never
 * overwrites the actual served guardian/userscript-*.js files. Promoting
 * a built output to the served location is a deliberate, separate,
 * human-reviewed step, not something this script does automatically.
 */
const path = require('path');
const fs = require('fs');
const esbuild = require('../node_modules/esbuild');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'userscripts', 'src');
const DIST_DIR = path.join(ROOT, 'userscripts', 'dist');

const PROVIDERS = ['claude', 'chatgpt', 'gemini', 'perplexity'];

async function buildOne(provider) {
  const entry = path.join(SRC_DIR, `${provider}.entry.js`);
  if (!fs.existsSync(entry)) {
    return { provider, ok: false, reason: `no entry file at ${path.relative(ROOT, entry)} — not composed yet, real gap, not silently skipped` };
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  const outfile = path.join(DIST_DIR, `userscript-${provider}.js`);
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    outfile,
    banner: { js: `// BUILT ${new Date().toISOString()} by scripts/build-userscripts.js — source: userscripts/src/${provider}.entry.js + shared modules. NOT the served copy — see userscripts/dist/README.md.` },
  });
  return { provider, ok: true, outfile: path.relative(ROOT, outfile), bytes: fs.statSync(outfile).size };
}

async function main() {
  const results = [];
  for (const p of PROVIDERS) results.push(await buildOne(p));
  for (const r of results) {
    if (r.ok) console.log(`✓ ${r.provider} -> ${r.outfile} (${r.bytes}b)`);
    else console.log(`— ${r.provider}: ${r.reason}`);
  }
  return results;
}

if (require.main === module) {
  main().then(results => {
    process.exit(results.some(r => !r.ok && process.argv.includes('--strict')) ? 1 : 0);
  }).catch(e => { console.error('[build-userscripts] failed:', e.message); process.exit(1); });
}

module.exports = { buildOne, main, PROVIDERS };
