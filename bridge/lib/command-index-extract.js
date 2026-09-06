'use strict';
/**
 * bridge/lib/command-index-extract.js — phase 4 of docs/command-index-
 * per-system.spec. Same MECHANISM as guardian/lib/command-index-
 * extract.js (static source-extraction from literal dispatch code, not
 * live introspection — bridge has no router object either), kept as a
 * deliberately separate file per the spec's own stated build_order
 * reasoning ("deliberately not shared code with guardian's version
 * until guardian's is proven") — not a second, competing mechanism,
 * the SAME approach recalibrated against bridge/server.js's own,
 * genuinely different literal idioms.
 * comp_id: nexus.bridge.command-index
 * uuid: nexus-bridge-command-index-extract-v1-0000-2026-0903-001
 *
 * §CALIBRATED AGAINST THE REAL FILE — four real, distinct idioms found
 * by direct inspection before writing this, not assumed to match
 * guardian's:
 *   1. Single-path, REVERSED order from guardian's own idiom:
 *      `pathname === '/health' && method === 'GET'` (pathname first,
 *      no `url.` prefix — bridge destructures `pathname` directly from
 *      its own real `const pathname = url.pathname`).
 *   2. Grouped/OR'd multi-path: `(pathname === '/bridge/sse' ||
 *      pathname === '/bridge/subscribe') && method === 'GET'`.
 *   3. Dynamic param via an inline regex test: `/^\/bridge\/requests\/
 *      [^/]+$/.test(pathname) && method === 'GET'` — real,
 *      confirmed distinct from guardian's dispatch shape entirely
 *      (guardian has no equivalent idiom).
 *   4. Prefix delegation: `pathname.startsWith('/cfr')` — a real
 *      sub-router handoff, named not resolved, same honest-gap
 *      treatment as guardian's sub-routers.
 *
 * §REAL, NAMED FINDING WHILE BUILDING THIS — bridge/server.js already
 * has its own hand-maintained `routes:` array (in its /contract
 * response, 15 entries) — exactly the kind of list this whole spec
 * exists to replace with something that cannot silently drift. This
 * extractor does not read or trust that array; it re-derives from the
 * literal dispatch code every call, same as guardian's.
 */

const fs = require('fs');
const path = require('path');

const SERVER_FILE = path.join(__dirname, '..', 'server.js');

function extractCommandIndex() {
  const src = fs.readFileSync(SERVER_FILE, 'utf8');
  const commands = [];

  // Idiom 1 — single-path, pathname first.
  const singleRe = /pathname\s*===\s*'([^']*)'\s*&&\s*method\s*===\s*'([A-Z]+)'/g;
  let m;
  while ((m = singleRe.exec(src))) {
    commands.push({ method: m[2], path: m[1] || '/', idiom: 'single' });
  }

  // Idiom 2 — grouped/OR'd multi-path, pathname first.
  const groupRe = /\(([^)]*pathname[^)]*)\)\s*&&\s*method\s*===\s*'([A-Z]+)'/g;
  while ((m = groupRe.exec(src))) {
    const method = m[2];
    const pathRe = /pathname\s*===\s*'([^']*)'/g;
    let pm;
    while ((pm = pathRe.exec(m[1]))) {
      commands.push({ method, path: pm[1] || '/', idiom: 'grouped' });
    }
  }

  // Idiom 3 — dynamic param via an inline regex .test(pathname) check.
  // Extracted as its own real entry with the literal regex source kept
  // (not resolved to a fake ':param' guess beyond what the code's own
  // comment already documents) so the real match is honest about what
  // it actually found, not a prettified invention.
  const dynRe = /\/\^([^$]*)\$\/\.test\(pathname\)\s*&&\s*method\s*===\s*'([A-Z]+)'/g;
  while ((m = dynRe.exec(src))) {
    commands.push({ method: m[2], path: m[1].replace(/\\\//g, '/'), idiom: 'dynamic-regex' });
  }

  // Idiom 4 — prefix delegation, named not resolved (same honest
  // treatment as guardian's sub-routers — see this file's own header).
  const prefixRe = /pathname\.startsWith\('([^']*)'\)/g;
  const prefixes = new Map();
  while ((m = prefixRe.exec(src))) {
    prefixes.set(m[1], (prefixes.get(m[1]) || 0) + 1);
  }
  const subRouters = [];
  for (const [prefix, count] of prefixes) {
    subRouters.push({ prefix: `${prefix}/*`, subRouter: true, realNestedCheckCount: count });
  }

  const seen = new Set();
  const deduped = [];
  for (const c of commands) {
    const key = `${c.method} ${c.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }

  return {
    systemId: 'bridge',
    generatedAt: Date.now(),
    commandCount: deduped.length,
    commands: deduped.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)),
    subRouters: subRouters.sort((a, b) => a.prefix.localeCompare(b.prefix)),
    unresolvedNestedCheckCount: subRouters.reduce((s, r) => s + r.realNestedCheckCount, 0),
  };
}

module.exports = { extractCommandIndex };
