'use strict';
/**
 * loom/maps/ui-map.js — maps plain UI files (not tools, not backend
 * modules) into LOOM's component/hook/wire registry, one component per
 * FILE, wired only by REAL dependency edges — mirroring loom/maps/
 * observability-map.js, warp-map.js, and copilot-capability-map.js
 * exactly. New file because none of the other three are semantically
 * about UI; forcing forge-shell into copilot-capability-map.js (about
 * copilot's own tool session) would have been a wrong-drawer fix.
 * comp_id: nexus.loom.maps.ui
 * UUID: nexus-loom-map-ui-v1-0000-2026-0813-001
 *
 * WHY THIS FILE EXISTS — ui/forge-shell/index.html had NO loom registry
 * entry at all (confirmed by direct grep, not assumed) when its LOOM tab
 * was built this session — a real, pre-existing gap, not created by that
 * change. Registered here, honestly wired to its one real new dependency:
 * loom/server.js's /api/phasemap endpoint (added this session), which the
 * LOOM tab's fetch() call actually depends on.
 */

const FILES = [
  ['ui/forge-shell/index.html', 'nexus.ui.forge-shell',
    ['nexus.loom.server']],
    // §2026-08-13 — the LOOM tab's fetch(`${LOOM}/api/phasemap`) is a real
    // HTTP dependency on loom/server.js, not a require() edge (this is a
    // static HTML/JS file, no require() at all) — wired anyway because the
    // dependency is real, same reasoning warp-map.js and observability-map.js
    // already use for their own HTTP-shaped edges.
];

function mapUi(driver) {
  const results = { components: [], hooks: [], wires: [], failures: [] };

  for (const [file, id] of FILES) {
    const r = driver.declare('component', {
      id, namespace: id.split('.').slice(0, 2).join('.'), name: file, version: '1.0.0',
      uuid: `nexus-loom-map-ui-${id}-v1-0000-2026-0813-001`,
    });
    (r.ok ? results.components : results.failures).push({ id, r });
  }

  const requiredBy = new Set();
  for (const [, id, requires] of FILES) for (const dep of requires) requiredBy.add(dep);

  for (const [, id, requires] of FILES) {
    if (requiredBy.has(id)) {
      const e = driver.declare('hook', {
        id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
        uuid: `nexus-loom-map-ui-${id}-export-v1-0000-2026-0813-001`,
      });
      (e.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r: e });
    }
    if (requires.length > 0) {
      const i = driver.declare('hook', {
        id: `${id}.import`, component_id: id, name: 'import', type: 'direct', direction: 'in',
        uuid: `nexus-loom-map-ui-${id}-import-v1-0000-2026-0813-001`,
      });
      (i.ok ? results.hooks : results.failures).push({ id: `${id}.import`, r: i });
    }
  }

  let wireN = 0;
  for (const [, id, requires] of FILES) {
    for (const dep of requires) {
      wireN++;
      const r = driver.declare('wire', {
        id: `ui-map.wire.${wireN}.${dep}--${id}`,
        from_hook_id: `${dep}.export`, to_hook_id: `${id}.import`,
        uuid: `nexus-loom-map-ui-wire-${wireN}-v1-0000-2026-0813-001`,
      });
      (r.ok ? results.wires : results.failures).push({ from: dep, to: id, r });
    }
  }

  return results;
}

module.exports = { mapUi, FILES };