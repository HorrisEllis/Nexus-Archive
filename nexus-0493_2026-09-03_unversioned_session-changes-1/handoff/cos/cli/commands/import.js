/**
 * cli/commands/import.js
 * COMPARTMENT OS — cos import <file> [--as=<name>]
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * §2026-09-03 — the CLI surface for the real .cos import path built this
 * session: cos/host/export.js's importCompartment(), reached via the
 * ImportCompartmentGate. §HONEST — same discipline as hat-forge's
 * importHat(): import never fabricates a target. The compartment named
 * by --as (or, if omitted, the snapshot's own original compartmentId)
 * must already exist locally — run `cos create <name>` first. Retargeting
 * onto a different compartment preserves that compartment's own real
 * identity/fs and adopts everything else from the import (see
 * cos/host/export.js's importCompartment() for the exact merge rule).
 *
 * Dispatches via SISO gate pipeline:
 *   emit('host:compartment:import') → ImportCompartmentGate → emit('host:compartment:imported')
 *
 * Usage:
 *   cos import ./backup.cos --as=my-restored-app
 *   cos import ./backup.cos            → targets the snapshot's own original compartmentId
 */

'use strict';

const path = require('path');

const { HOST } = require('../../foundation/event-contracts.js');

function importCompartmentCommand(host, filePath, flags = {}, out = {}) {
  const log   = out.log   || ((...a) => console.log(...a));
  const error = out.error || ((...a) => console.error(...a));

  if (!filePath) { error('  Usage: cos import <file> [--as=<name>]'); return null; }

  let compartmentId;
  if (flags.as) {
    const target = host.store.getCompartmentByName(flags.as) || host.store.getCompartment(flags.as);
    if (!target) { error(`  Error: --as target compartment "${flags.as}" not found — run "cos create ${flags.as}" first`); return null; }
    compartmentId = target.id;
  }

  let result    = null;
  let errorData = null;
  const unsubImported = host.bus.on(HOST.COMPARTMENT_IMPORTED, ev => { result = ev.payload; });
  const unsubError = host.bus.on(HOST.COMPARTMENT_ERROR, ev => {
    if (ev.payload.operation === 'import') errorData = ev.payload;
  });

  host.bus.emit('host:compartment:import', {
    host, filePath: path.resolve(filePath),
    opts: compartmentId ? { compartmentId } : {},
  });

  unsubImported();
  unsubError();

  if (errorData) { error(`  Error: ${errorData.reason}`); return null; }
  if (!result)   { error(`  Error: import gate did not produce a result for "${filePath}"`); return null; }

  const comp = host.store.getCompartment(result.compartmentId);
  log(`  ✓ Imported ${filePath} → "${comp ? comp.name : result.compartmentId}" [${result.compartmentId}]`);
  log(`    restored from snapshot ${result.snapId}`);
  return result;
}

module.exports = { importCompartmentCommand };
