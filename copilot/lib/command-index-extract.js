'use strict';
/**
 * copilot/lib/command-index-extract.js — copilot's own real command-index
 * extractor, same real mechanism guardian/lib/command-index-extract.js
 * already established (docs/command-index-per-system.spec's own named
 * approach for this exact dispatch shape — inline `method===X && p===Y`
 * checks, no router object to introspect live). Deliberately a separate
 * file, not shared code with guardian's version — same real reason that
 * spec gives for bridge's own copy: a different system's dispatch idiom
 * (copilot uses `p`, not `url.pathname`) is calibrated against directly,
 * not assumed to match.
 *
 * §MCO19 2026-09-13 — James: "hook all of that into copilot, .command
 * files and .tool files." copilot was never one of the 5 systems that
 * spec named — this is genuinely new coverage, not a gap in existing
 * scope, built because copilot's own real routes (including this
 * session's new GET /api/tools) had no real command-index anywhere.
 */

const fs = require('fs');
const path = require('path');

const SERVER_FILE = path.join(__dirname, '..', 'server.js');

function extractCommandIndex() {
  const src = fs.readFileSync(SERVER_FILE, 'utf8');
  const commands = [];

  // Idiom 1 — single-path: method === 'GET' && p === '/api/tools'
  const singleRe = /method\s*===\s*'([A-Z]+)'\s*&&\s*p\s*===\s*'([^']*)'/g;
  let m;
  while ((m = singleRe.exec(src))) {
    commands.push({ method: m[1], path: m[2] || '/', idiom: 'single' });
  }

  // Idiom 2 — grouped/OR'd multi-path, same real shape guardian's own
  // extractor already handles.
  const groupRe = /method\s*===\s*'([A-Z]+)'\s*&&\s*\(([^)]*\bp\s*===[^)]*)\)/g;
  while ((m = groupRe.exec(src))) {
    const method = m[1];
    const pathRe = /p\s*===\s*'([^']*)'/g;
    let pm;
    while ((pm = pathRe.exec(m[2]))) {
      commands.push({ method, path: pm[1] || '/', idiom: 'grouped' });
    }
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
    systemId: 'copilot',
    generatedAt: Date.now(),
    commandCount: deduped.length,
    commands: deduped.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)),
  };
}

module.exports = { extractCommandIndex };
