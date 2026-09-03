/**
 * cli/commands/export.js
 * COMPARTMENT OS — cos export <name> [file] [--dir=<destDir>]
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * §2026-09-03 — the CLI surface for the real .cos export path built this
 * session: cos/host/export.js's exportCompartment(), reached via the
 * ExportCompartmentGate registered on the host bus. This file does not
 * capture or wrap anything itself — it resolves <name>/<id> the same way
 * every other compartment command does (store.getCompartmentByName ||
 * store.getCompartment, same fallback DestroyCompartmentGate uses), emits
 * the gate event, and reports the real result.
 *
 * Dispatches via SISO gate pipeline:
 *   emit('host:compartment:export') → ExportCompartmentGate → emit('host:compartment:exported')
 *
 * Usage:
 *   cos export <name>                    → data/exports/compartments/<id>.cos
 *   cos export <name> ./backup.cos       → same, then renamed to the given path
 *   cos export <name> --dir=/some/dir    → written under /some/dir instead
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const { HOST } = require('../../foundation/event-contracts.js');

function exportCompartmentCommand(host, name, outFile, flags = {}, out = {}) {
  const log   = out.log   || ((...a) => console.log(...a));
  const error = out.error || ((...a) => console.error(...a));

  if (!name) { error('  Usage: cos export <name> [file] [--dir=<destDir>]'); return null; }

  const comp = host.store.getCompartmentByName(name) || host.store.getCompartment(name);
  if (!comp) { error(`  Error: compartment "${name}" not found`); return null; }

  let result    = null;
  let errorData = null;
  const unsubExported = host.bus.on(HOST.COMPARTMENT_EXPORTED, ev => {
    if (ev.payload.compartmentId === comp.id) result = ev.payload;
  });
  const unsubError = host.bus.on(HOST.COMPARTMENT_ERROR, ev => {
    if (ev.payload.operation === 'export') errorData = ev.payload;
  });

  host.bus.emit('host:compartment:export', {
    host, compartmentId: comp.id,
    destDir: flags.dir ? path.resolve(flags.dir) : undefined,
  });

  unsubExported();
  unsubError();

  if (errorData) { error(`  Error: ${errorData.reason}`); return null; }
  if (!result)   { error(`  Error: export gate did not produce a result for "${name}"`); return null; }

  let finalPath = result.filePath;
  if (outFile) {
    const dest = path.resolve(outFile);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(result.filePath, dest);
    finalPath = dest;
  }

  log(`  ✓ Exported "${comp.name}" [${comp.id}] → ${finalPath}`);
  log(`    snapshot ${result.snapId}`);
  return { ...result, filePath: finalPath };
}

module.exports = { exportCompartmentCommand };
