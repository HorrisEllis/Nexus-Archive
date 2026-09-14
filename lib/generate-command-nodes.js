'use strict';
/**
 * lib/generate-command-nodes.js — real, shared writer for `.command`
 * node files, given a real {systemId, commands:[{method,path}]} shape
 * from any system's own extractCommandIndex() (guardian/lib/command-
 * index-extract.js, copilot/lib/command-index-extract.js — each
 * system's own real extractor, per docs/command-index-per-system.spec's
 * own rule that the EXTRACTION mechanism is per-system, since dispatch
 * idioms differ; the WRITE side below it is genuinely identical for
 * any system once it has that real shape, so it is shared, not
 * duplicated — §16.5/§0.5, no new abstraction unless it earns its
 * keep, and one real writer for N real extractors does).
 *
 * §MCO19 2026-09-13 — James: "hook all of that into copilot, .command
 * files and .tool files." Same real discipline generate-tool-nodes.js
 * already established for `.tool`: wipe stale files for THIS system
 * only (never another system's directory), write one real `.command`
 * file per real route, never hand-maintained.
 */

const fs = require('fs');
const path = require('path');
const { exportToFile } = require('./node-export.js');

/**
 * generateCommandNodes({ systemId, extractCommandIndex, destDir }) —
 * @param systemId            real system name (e.g. 'guardian', 'copilot')
 * @param extractCommandIndex the system's own real extractor function
 * @param destDir              real, per-system commands/ directory
 */
function generateCommandNodes({ systemId, extractCommandIndex, destDir }) {
  if (!systemId || typeof extractCommandIndex !== 'function' || !destDir) {
    throw new Error('[generate-command-nodes] systemId, extractCommandIndex, and destDir are all required');
  }
  fs.mkdirSync(destDir, { recursive: true });

  // §1.2 — same real stale-file cleanup generate-tool-nodes.js uses: a
  // route removed from the real source must not leave an orphaned
  // .command file claiming it still exists.
  for (const f of fs.readdirSync(destDir)) {
    if (f.endsWith('.command')) fs.unlinkSync(path.join(destDir, f));
  }

  const index = extractCommandIndex();
  const written = [];
  for (const c of index.commands) {
    const slug = `${c.method.toLowerCase()}-${c.path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'root'}`;
    const filePath = exportToFile('command', slug, { method: c.method, path: c.path }, {
      system: systemId, tags: [systemId, 'command', c.idiom || 'single'],
    }, destDir);
    written.push(filePath);
  }
  return { systemId, commandCount: written.length, dir: destDir, generatedAt: index.generatedAt };
}

/**
 * checkCommandDrift({ systemId, extractCommandIndex, destDir }) — same
 * real drift-detection shape generate-tool-nodes.js's checkDrift()
 * already established, applied to .command files instead of .tool.
 */
function checkCommandDrift({ extractCommandIndex, destDir }) {
  const index = extractCommandIndex();
  const realPaths = new Set(index.commands.map(c => `${c.method} ${c.path}`));
  let onDisk = new Set();
  try {
    for (const f of fs.readdirSync(destDir)) {
      if (!f.endsWith('.command')) continue;
      const { importFromFile } = require('./node-export.js');
      try {
        const doc = importFromFile(path.join(destDir, f));
        onDisk.add(`${doc.payload.method} ${doc.payload.path}`);
      } catch (_) { /* an unreadable file is real drift too — falls through to missing/stale check below */ }
    }
  } catch (_) {
    return { drifted: true, reason: 'commands dir does not exist — generateCommandNodes() has never run', missing: [...realPaths], stale: [] };
  }
  const missing = [...realPaths].filter(p => !onDisk.has(p));
  const stale = [...onDisk].filter(p => !realPaths.has(p));
  return { drifted: missing.length > 0 || stale.length > 0, missing, stale, realCount: realPaths.size, onDiskCount: onDisk.size };
}

module.exports = { generateCommandNodes, checkCommandDrift };
