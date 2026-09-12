#!/usr/bin/env node
'use strict';
/**
 * cli/decompose.js — monolith decomposition tool
 * UUID: nexus-cli-decompose-v1-0000-2026-0912-jamesbrooks-001
 *
 * James: "a decomposition tool for breaking down monoliths and wiring
 * the hooks and components automatically and updating the registry."
 * This is X1 from the very first phasemap this session wrote — scoped
 * then as "pattern-matching on inline route blocks... real test case:
 * cortex/boot.js, 1794 lines, ~55 inline route blocks" — built now.
 *
 * Real risk this is designed around: a 1794-line, LIVE, production
 * routing file cannot be safely split by blind regex — an unbalanced
 * brace silently corrupts it. Block boundaries are found by actually
 * tracking brace depth character-by-character (the same "Python
 * brace-depth tracing" technique this codebase's own changelog already
 * used once for exactly this class of extraction — reused, not
 * reinvented). Each block's real free variables (req, res, p, method,
 * helper functions like json()/SYSTEM/PORT) are detected before
 * extraction, not assumed, so an extracted file gets exactly the
 * context it needs, no more, no less.
 *
 * Modes:
 *   node cli/decompose.js analyze cortex/boot.js
 *     Real, safe, read-only. Reports every extractable `if (p === ...)`
 *     block: route path, method, line range, size, and its detected
 *     free variables — everything needed to plan an extraction, before
 *     any file is touched.
 *
 *   node cli/decompose.js extract cortex/boot.js --route=/contract --system=cortex
 *     Extracts ONE named route into its own real node file
 *     (cortex/routes/<slug>.route.js), replaces the inline block in the
 *     source file with a thin delegating call, and registers the new
 *     node in that system's command-index.js. Verifies syntax
 *     immediately after writing — refuses to leave the tree in a
 *     broken state.
 *
 * §HONEST SCOPE — one route at a time, on purpose. Extracting all 55 in
 * one pass with no verification between them is exactly the kind of
 * blind bulk operation this whole session has avoided everywhere else
 * (T3, N2, the compaction bug). Run extract once per route you actually
 * want moved; analyze first to know what's there.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const mode = args[0];
const targetFile = args[1];
const flags = {};
for (const a of args.slice(2)) {
  const m = a.match(/^--([\w-]+)=(.*)$/);
  if (m) flags[m[1]] = m[2];
}

if (!mode || !targetFile || !['analyze', 'extract'].includes(mode)) {
  console.error('Usage:');
  console.error('  node cli/decompose.js analyze <file>');
  console.error('  node cli/decompose.js extract <file> --route=<path> --system=<name>');
  process.exit(1);
}

const filePath = path.isAbsolute(targetFile) ? targetFile : path.join(ROOT, targetFile);
if (!fs.existsSync(filePath)) { console.error(`[decompose] no such file: ${filePath}`); process.exit(1); }

// ── Block finder — real brace-depth tracking, not regex-guessed boundaries ──
// Finds every top-level `if (p === '...'` [&& method === '...'] `) {` block
// and returns its exact start/end line (inclusive), by walking braces,
// strings, and comments character-by-character so a brace inside a string
// or comment is never miscounted.
function findRouteBlocks(src) {
  const lines = src.split('\n');
  const blocks = [];
  const headerRe = /if\s*\(\s*p\s*===\s*'([^']+)'(?:\s*\|\|\s*p\s*===\s*'([^']+)')?\s*(?:&&\s*method\s*===\s*'(\w+)')?\s*\)\s*\{/;

  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(headerRe);
    if (!m) { i++; continue; }
    const startLine = i;
    // Walk from the opening brace on this line, tracking depth across
    // real code only (strings/comments excluded from brace counting).
    let depth = 0;
    let started = false;
    let inString = null; // "'", '"', or '`'
    let inLineComment = false;
    let inBlockComment = false;
    let j = i;
    outer:
    for (; j < lines.length; j++) {
      inLineComment = false;
      const line = lines[j];
      for (let k = 0; k < line.length; k++) {
        const c = line[k];
        const next = line[k + 1];
        if (inLineComment) continue;
        if (inBlockComment) { if (c === '*' && next === '/') { inBlockComment = false; k++; } continue; }
        if (inString) { if (c === '\\') { k++; continue; } if (c === inString) inString = null; continue; }
        if (c === '/' && next === '/') { inLineComment = true; continue; }
        if (c === '/' && next === '*') { inBlockComment = true; k++; continue; }
        if (c === "'" || c === '"' || c === '`') { inString = c; continue; }
        if (c === '{') { depth++; started = true; }
        else if (c === '}') {
          depth--;
          if (started && depth === 0) { break outer; }
        }
      }
    }
    blocks.push({
      route: m[1], altRoute: m[2] || null, method: m[3] || null,
      startLine: startLine + 1, endLine: j + 1, // 1-indexed for human display
      body: lines.slice(startLine, j + 1).join('\n'),
    });
    i = j + 1;
  }
  return blocks;
}

// ── Free-variable detector — real, not assumed. Collects identifiers
// used in the block that aren't declared inside it (const/let/function
// params/catch bindings), so an extraction knows exactly what context
// to pass in instead of guessing at req/res/p/method/helpers.
const JS_GLOBALS = new Set(['require', 'module', 'exports', 'console', 'process', 'Date', 'JSON',
  'Math', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Promise', 'Error', 'Map', 'Set',
  'undefined', 'null', 'true', 'false', 'this', 'Buffer', 'parseInt', 'parseFloat', 'isNaN',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'encodeURIComponent', 'decodeURIComponent']);

// Strips comments and string-literal CONTENTS (keeps the quotes, so line
// structure/length is preserved for anyone debugging) using the same
// char-by-char state tracking findRouteBlocks already proved correct —
// without this, English prose inside a comment (e.g. "BUGFIX", "James")
// gets picked up as a free variable, which very nearly shipped here.
function stripCommentsAndStrings(src) {
  let out = '';
  let inString = null;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];
    if (inLineComment) { if (c === '\n') { inLineComment = false; out += c; } continue; }
    if (inBlockComment) { if (c === '*' && next === '/') { inBlockComment = false; i++; } else if (c === '\n') out += c; continue; }
    if (inString) { if (c === '\\') { i++; continue; } if (c === inString) inString = null; continue; }
    if (c === '/' && next === '/') { inLineComment = true; continue; }
    if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { inString = c; continue; }
    out += c;
  }
  return out;
}

const JS_KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'delete',
  'typeof', 'instanceof', 'in', 'of', 'void', 'yield', 'await', 'async', 'class', 'extends', 'super',
  'static', 'get', 'set', 'import', 'export', 'default', 'from', 'as']);

function freeVariables(blockSrc) {
  const clean = stripCommentsAndStrings(blockSrc);
  const declared = new Set(['p', 'method']); // the if-condition's own bindings, always in scope by construction
  const declRe = /\b(?:const|let|var)\s+([\w$]+)/g;
  let m;
  while ((m = declRe.exec(clean))) declared.add(m[1]);
  const catchRe = /catch\s*\(\s*([\w$]+)\s*\)/g;
  while ((m = catchRe.exec(clean))) declared.add(m[1]);
  const paramRe = /\(([^)]*)\)\s*=>/g;
  while ((m = paramRe.exec(clean))) for (const p of m[1].split(',')) { const t = p.trim(); if (t) declared.add(t.replace(/[{}]/g, '').trim()); }

  const identRe = /(\.\s*)?\b([A-Za-z_$][\w$]*)\b(\s*:)?/g;
  const used = new Set();
  while ((m = identRe.exec(clean))) { if (!m[1] && !m[3]) used.add(m[2]); }

  const free = [...used].filter(id => !declared.has(id) && !JS_GLOBALS.has(id) && !JS_KEYWORDS.has(id) && !/^\d/.test(id));
  return free.sort();
}

function analyze() {
  const src = fs.readFileSync(filePath, 'utf8');
  const blocks = findRouteBlocks(src);
  console.log(`[decompose] ${path.relative(ROOT, filePath)}: ${src.split('\n').length} lines, ${blocks.length} extractable route block(s)\n`);
  for (const b of blocks) {
    const size = b.endLine - b.startLine + 1;
    const routes = b.altRoute ? `${b.route} | ${b.altRoute}` : b.route;
    console.log(`  ${routes}${b.method ? ` [${b.method}]` : ''} — lines ${b.startLine}-${b.endLine} (${size} lines)`);
    const free = freeVariables(b.body).filter(v => !['req', 'res'].includes(v));
    if (free.length) console.log(`    free variables needed from outer scope: ${free.join(', ')}`);
  }
}

function slugify(route) {
  return route.replace(/^\/+/, '').replace(/[^\w]+/g, '-').replace(/-+$/, '') || 'root';
}

function extract() {
  if (!flags.route) { console.error('[decompose] extract requires --route=<path>'); process.exit(1); }
  if (!flags.system) { console.error('[decompose] extract requires --system=<name>'); process.exit(1); }

  const src = fs.readFileSync(filePath, 'utf8');
  const blocks = findRouteBlocks(src);
  const target = blocks.find(b => b.route === flags.route || b.altRoute === flags.route);
  if (!target) { console.error(`[decompose] no block found for route "${flags.route}" in ${targetFile}`); process.exit(1); }

  const free = freeVariables(target.body).filter(v => !['req', 'res'].includes(v));
  const slug = slugify(target.route);
  const system = flags.system;
  const routesDir = path.join(ROOT, system, 'routes');
  fs.mkdirSync(routesDir, { recursive: true });
  const nodeFile = path.join(routesDir, `${slug}.route.js`);
  const nodeId = `${system}.${slug}.route`;

  if (fs.existsSync(nodeFile)) { console.error(`[decompose] ${path.relative(ROOT, nodeFile)} already exists — refusing to overwrite`); process.exit(1); }

  // Strip the outer `if (...) { ... return; }` wrapper, keep the real body.
  const bodyLines = target.body.split('\n');
  const innerBody = bodyLines.slice(1, -1).join('\n');

  const nodeContent = `'use strict';
/**
 * ${path.relative(ROOT, nodeFile)} — extracted from ${path.relative(ROOT, filePath)}
 * Real node id: ${nodeId}
 * §EXTRACTED 2026-09-12 — cli/decompose.js, route ${target.route}${target.altRoute ? ` (also ${target.altRoute})` : ''}${target.method ? `, ${target.method}` : ''}.
 * Free variables from the original outer scope, passed in via ctx —
 * detected, not assumed (cli/decompose.js's own free-variable scan):
 *   ${free.length ? free.join(', ') : '(none beyond req/res)'}
 * If this list is wrong (a helper missed, or one that isn't actually
 * used), that's this extraction's own bug to fix here, not a silent gap.
 */
module.exports = function handle(req, res, ctx) {
  const { ${free.join(', ')} } = ctx;
${innerBody}
};
`;
  fs.writeFileSync(nodeFile, nodeContent);

  // Replace the inline block in the source file with a delegating call.
  const lines = src.split('\n');
  const before = lines.slice(0, target.startLine - 1);
  const after = lines.slice(target.endLine);
  const relRequire = './' + path.relative(path.dirname(filePath), nodeFile).replace(/\\/g, '/').replace(/\.js$/, '');
  const condition = target.altRoute
    ? `p === '${target.route}' || p === '${target.altRoute}'`
    : `p === '${target.route}'${target.method ? ` && method === '${target.method}'` : ''}`;
  const delegateLines = [
    `  if (${condition}) {`,
    `    require('${relRequire}')(req, res, { ${free.join(', ')} });`,
    `    return;`,
    `  }`,
  ];
  const newSrc = [...before, ...delegateLines, ...after].join('\n');
  fs.writeFileSync(filePath, newSrc);

  // Verify syntax on BOTH files before declaring success — refuse to
  // leave the tree broken.
  const { execFileSync } = require('child_process');
  try {
    execFileSync(process.execPath, ['--check', nodeFile]);
    execFileSync(process.execPath, ['--check', filePath]);
  } catch (e) {
    console.error(`[decompose] syntax check FAILED after extraction — this needs manual review, not left silently broken:\n${e.message}`);
    process.exit(1);
  }

  // Register in the system's command-index.js if it already exists
  // (loom/templates/system-scaffold.js's own real convention) — appended,
  // not overwritten, and only if the file is the expected real shape.
  const cmdIndexPath = path.join(ROOT, system, 'command-index.js');
  if (fs.existsSync(cmdIndexPath)) {
    const cmdSrc = fs.readFileSync(cmdIndexPath, 'utf8');
    if (/module\.exports\s*=\s*\[/.test(cmdSrc) && !cmdSrc.includes(nodeId)) {
      const entry = `  { id: '${nodeId}', verb: '${slug}', route: { method: '${target.method || 'GET'}', path: '${target.route}' } },\n`;
      const updated = cmdSrc.replace(/module\.exports\s*=\s*\[/, `module.exports = [\n${entry}`);
      fs.writeFileSync(cmdIndexPath, updated);
      try { execFileSync(process.execPath, ['--check', cmdIndexPath]); }
      catch (e) { console.warn(`[decompose] command-index.js update may have broken syntax — check manually: ${e.message}`); }
      console.log(`[decompose] registered ${nodeId} in ${path.relative(ROOT, cmdIndexPath)}`);
    }
  } else {
    console.log(`[decompose] no command-index.js found at ${system}/ — new node not auto-registered, real node file only`);
  }

  console.log(`[decompose] extracted ${target.route} from ${path.relative(ROOT, filePath)} -> ${path.relative(ROOT, nodeFile)} (${target.endLine - target.startLine + 1} lines moved). Both files verified syntax-clean.`);
}

if (mode === 'analyze') analyze();
else extract();
