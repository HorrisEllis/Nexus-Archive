'use strict';
/**
 * scripts/verify-wires.js — Wire Integrity Checker
 * UUID: nexus-verify-wires-v1-0000-2026-0706-jamesbrooks-001
 *
 * §17.7-DRIVEN — the actual missing primitive behind five separate
 * "looks-wired-but-isn't" bugs found this session (bridge/copilot
 * double-wrap, Guardian's dropzone, Architect's heal-loop shape
 * mismatch, Idearium's queued-chunk dead end, orchestrator's missing
 * heartbeat/bus-stats routes). Every one of those was a declared wire
 * — a hook, an endpoint reference, an event name — that nothing ever
 * checked against what the receiving system actually implements.
 *
 * This uses hooks/index.js's real 82-hook registry (not invented data)
 * and checks, for each hook with a real config.path, whether the target
 * system's real source file actually contains that path as a literal
 * route match. A "not found" result is a CANDIDATE, not a confirmed
 * bug — some systems route by URL-segment array (orchestrator.js does
 * this; a path like /api/bus/stats never appears as one literal string
 * there even though the route is real) rather than one literal string.
 * Every candidate this script surfaces gets manually confirmed before
 * being reported as broken, same discipline as every other finding
 * this session — a heuristic scan generates leads, it doesn't replace
 * verification.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const SURFACE_FILES = {
  guardian:     ['guardian/server.js'],
  cortex:       ['cortex/boot.js'],
  orchestrator: ['orchestrator.js'],
  idearium:     ['idearium/api/index.js'],
  copilot:      ['copilot/server.js'],
  architect:    ['architect/service.js'],
  ollama:       ['ollama/server.js'],
  bridge:       ['bridge/server.js', 'bridge/router.js'],
  emerge:       ['emerge-kernel.js', 'emerge-codegen-v2.js', 'emerge-ide.js'],
};

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function containsPath(rel, routePath, surface) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  const content = fs.readFileSync(full, 'utf8');
  // Some hook files store config.path with a redundant surface prefix
  // (e.g. "cortex/api/snapshots/create" instead of "/api/snapshots/create")
  // — a real inconsistency in the registry data itself, not something to
  // silently work around without noting it. Check both forms.
  const stripped = routePath.startsWith(surface + '/') ? routePath.slice(surface.length) : routePath;
  return content.includes(routePath) || content.includes(stripped);
}

function main() {
  const h = require(path.join(ROOT, 'hooks/index.js'));
  const all = h.allHooks().filter(x => x.config?.path && SURFACE_FILES[x.to?.surface]);

  console.log(`Checking ${all.length} declared hooks with a real config.path against a real target surface...\n`);

  const candidates = [];
  for (const hook of all) {
    const surface = hook.to.surface;
    const files = SURFACE_FILES[surface];
    const existingFiles = files.filter(fileExists);
    if (!existingFiles.length) {
      candidates.push({ hook: hook.name, surface, path: hook.config.path, reason: 'target file(s) not found', files });
      continue;
    }
    const found = existingFiles.some(f => containsPath(f, hook.config.path, surface));
    if (!found) {
      candidates.push({ hook: hook.name, surface, path: hook.config.path, reason: 'path string not found in target file(s)', files: existingFiles });
    }
  }

  console.log(`=== ${candidates.length} CANDIDATES (need manual confirmation, not confirmed bugs) ===\n`);
  for (const c of candidates) {
    console.log(`${c.hook}  ->  ${c.surface}${c.path}`);
    console.log(`   reason: ${c.reason}  |  checked: ${c.files.join(', ')}`);
  }
}

main();
