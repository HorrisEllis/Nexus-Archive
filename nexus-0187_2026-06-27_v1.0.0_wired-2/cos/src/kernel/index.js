'use strict';
/**
 * cos/src/kernel/index.js — COS Host Kernel
 * UUID: cos-kernel-v1-0000-0000-000000000014
 * Phase: 1 — Host Core
 *
 * The kernel owns:
 *   - The host SISO bus (one stream, all events)
 *   - The compartment state store (UUID → CompartmentRecord)
 *   - The gate registry (what happens when each event arrives)
 *   - The system map (live graph of all compartments + their state)
 *
 * §COS-5.1: The host bus is SISO. Gates own behavior.
 * §COS-5.2: Compartments do not call each other directly.
 * §COS-1.2: Every error is an event on the host bus.
 */

const { Stream, StreamLog, Event, Gate } = require('../../../clear-glass-v3/siso/index');
const { uid, COMPARTMENT_TYPES, COMPARTMENT_STATES, validateCompartmentConfig, validateEvent } = require('../foundation/index');

// ── Gate factory ──────────────────────────────────────────────────────────
function gate(sig, fn) {
  const g = new Gate(sig);
  g.transform = fn;
  return g;
}

class CosKernel {
  constructor({ nexusBusUrl, sseEmit } = {}) {
    this.nexusBusUrl   = nexusBusUrl || 'http://localhost:9000';
    this.sseEmit       = sseEmit || (() => {}); // optional SSE broadcast

    // SISO host bus
    this.log    = new StreamLog('EVENTS');
    this.bus    = new Stream({ log: this.log });

    // State store
    this.compartments = new Map(); // UUID → CompartmentRecord
    this.drivers      = new Map(); // type → CompartmentDriver

    this._registerGates();
    console.log('[COS/Kernel] Host bus ready →E→E→');
  }

  // ── Emit shorthand ────────────────────────────────────────────────────────
  emit(type, data = {}) {
    const { ok, errors } = validateEvent(type, data);
    if (!ok) {
      console.warn(`[COS/Kernel] Invalid event '${type}': ${errors.join(', ')}`);
    }
    this.bus.emit(new Event(type, { ...data, _cos: true, ts: data.ts || Date.now() }));
    this.sseEmit(type, data);
  }

  // ── Register a compartment driver ─────────────────────────────────────────
  registerDriver(type, driver) {
    this.drivers.set(type, driver);
    console.log(`[COS/Kernel] Driver registered: ${type}`);
  }

  // ── Subscribe ─────────────────────────────────────────────────────────────
  on(type, fn) { return this.bus.on(type, fn); }

  // ── Gates ─────────────────────────────────────────────────────────────────
  _registerGates() {
    // compartment.create
    this.bus.register(gate('compartment.create', (event, stream) => {
      const { type, config, requestId } = event.data;
      const v = validateCompartmentConfig({ type, ...config });
      if (!v.ok) {
        stream.emit(new Event('compartment.error', { error: v.errors.join('; '), requestId }));
        return;
      }

      const id = uid();
      const record = {
        id,
        type,
        name:      config.name,
        config:    config,
        state:     COMPARTMENT_STATES.PENDING,
        createdAt: Date.now(),
        startedAt: null,
        stoppedAt: null,
        meta:      {},
      };

      this.compartments.set(id, record);
      console.log(`[COS/Kernel] Created compartment: ${id} (${type})`);
      stream.emit(new Event('compartment.created', { compartmentId: id, type, name: config.name, requestId }));
    }));

    // compartment.start
    this.bus.register(gate('compartment.start', (event, stream) => {
      const { compartmentId } = event.data;
      const record = this.compartments.get(compartmentId);
      if (!record) {
        stream.emit(new Event('compartment.error', { compartmentId, error: 'Compartment not found' }));
        return;
      }
      if (record.state === COMPARTMENT_STATES.RUNNING) return; // idempotent

      record.state = COMPARTMENT_STATES.STARTING;
      const driver = this.drivers.get(record.type);

      if (!driver) {
        record.state = COMPARTMENT_STATES.ERROR;
        stream.emit(new Event('compartment.error', { compartmentId, error: `No driver for type: ${record.type}` }));
        return;
      }

      driver.start(record)
        .then(meta => {
          record.state     = COMPARTMENT_STATES.RUNNING;
          record.startedAt = Date.now();
          record.meta      = { ...record.meta, ...meta };
          stream.emit(new Event('compartment.started', { compartmentId, type: record.type, name: record.name, meta }));
        })
        .catch(err => {
          record.state = COMPARTMENT_STATES.ERROR;
          stream.emit(new Event('compartment.error', { compartmentId, error: err.message }));
        });
    }));

    // compartment.stop
    this.bus.register(gate('compartment.stop', (event, stream) => {
      const { compartmentId } = event.data;
      const record = this.compartments.get(compartmentId);
      if (!record || record.state === COMPARTMENT_STATES.STOPPED) return;

      record.state = COMPARTMENT_STATES.STOPPING;
      const driver = this.drivers.get(record.type);

      if (!driver) {
        record.state     = COMPARTMENT_STATES.STOPPED;
        record.stoppedAt = Date.now();
        stream.emit(new Event('compartment.stopped', { compartmentId }));
        return;
      }

      driver.stop(record)
        .then(() => {
          record.state     = COMPARTMENT_STATES.STOPPED;
          record.stoppedAt = Date.now();
          stream.emit(new Event('compartment.stopped', { compartmentId }));
        })
        .catch(err => {
          record.state = COMPARTMENT_STATES.ERROR;
          stream.emit(new Event('compartment.error', { compartmentId, error: err.message }));
        });
    }));

    // compartment.destroy
    this.bus.register(gate('compartment.destroy', (event, stream) => {
      const { compartmentId } = event.data;
      const record = this.compartments.get(compartmentId);
      if (!record) return;

      const driver = this.drivers.get(record.type);
      const cleanup = driver ? driver.destroy(record).catch(() => {}) : Promise.resolve();

      cleanup.then(() => {
        this.compartments.delete(compartmentId);
        stream.emit(new Event('compartment.destroyed', { compartmentId }));
      });
    }));

    // compartment.list
    this.bus.register(gate('compartment.list', (event, stream) => {
      stream.emit(new Event('compartment.listed', {
        compartments: this.listCompartments(),
        requestId:    event.data.requestId,
      }));
    }));

    // compartment.status — single compartment
    this.bus.register(gate('compartment.status', (event, stream) => {
      const { compartmentId } = event.data;
      const record = this.compartments.get(compartmentId);
      if (!record) {
        stream.emit(new Event('compartment.error', { compartmentId, error: 'Not found' }));
        return;
      }
      stream.emit(new Event('compartment.status.response', { ...record }));
    }));

    // compartment.snapshot
    this.bus.register(gate('compartment.snapshot', (event, stream) => {
      const { compartmentId } = event.data;
      const record = this.compartments.get(compartmentId);
      if (!record) {
        stream.emit(new Event('compartment.error', { compartmentId, error: 'Not found' }));
        return;
      }
      const driver = this.drivers.get(record.type);
      const snap   = driver?.snapshot ? driver.snapshot(record) : Promise.resolve({ state: record.state });

      Promise.resolve(snap).then(snapshot => {
        stream.emit(new Event('compartment.snapshotted', { compartmentId, snapshot }));
      });
    }));

    // compartment.swap — hot-swap §COS-7.1
    this.bus.register(gate('compartment.swap', (event, stream) => {
      const { fromId, toId } = event.data;
      const from = this.compartments.get(fromId);
      const to   = this.compartments.get(toId);
      if (!from || !to) {
        stream.emit(new Event('compartment.error', { error: `swap: compartment not found (from=${fromId}, to=${toId})` }));
        return;
      }
      // to must be running before we stop from
      if (to.state !== COMPARTMENT_STATES.RUNNING) {
        stream.emit(new Event('compartment.error', { error: `swap: target ${toId} not running (state=${to.state})` }));
        return;
      }
      // Stop the old one
      stream.emit(new Event('compartment.stop', { compartmentId: fromId }));
      stream.emit(new Event('compartment.swapped', { fromId, toId }));
    }));

    // host.status
    this.bus.register(gate('host.status', (event, stream) => {
      stream.emit(new Event('host.status.response', {
        compartments: this.listCompartments(),
        busStats:     this.bus.sampleHere(),
        drivers:      [...this.drivers.keys()],
        ts:           Date.now(),
      }));
    }));

    // browser.* — route to browser compartment driver
    this.bus.register(gate('browser.navigate', (event, stream) => {
      const { compartmentId, url } = event.data;
      this._routeToDriver('browser', compartmentId, 'navigate', { url }, stream);
    }));

    this.bus.register(gate('browser.driver.exec', (event, stream) => {
      const { compartmentId, ...args } = event.data;
      this._routeToDriver('browser', compartmentId, 'driverExec', args, stream);
    }));

    this.bus.register(gate('browser.copilot', (event, stream) => {
      const { compartmentId, message, ...rest } = event.data;
      this._routeToDriver('browser', compartmentId, 'copilot', { message, ...rest }, stream);
    }));

    // cdp.* — route to CDP compartment driver (ErosmancerOS)
    this.bus.register(gate('cdp.cmd', (event, stream) => {
      const { compartmentId, ...args } = event.data;
      this._routeToDriver('cdp', compartmentId, 'exec', args, stream);
    }));

    // process.exec — route to process compartment driver
    this.bus.register(gate('process.exec', (event, stream) => {
      const { compartmentId, cmd, ...args } = event.data;
      this._routeToDriver('node', compartmentId, 'exec', { cmd, ...args }, stream);
    }));
  }

  // ── Route to compartment driver ────────────────────────────────────────────
  _routeToDriver(type, compartmentId, method, args, stream) {
    const record = this.compartments.get(compartmentId);
    if (!record) {
      stream.emit(new Event('compartment.error', { compartmentId, error: 'Not found' }));
      return;
    }
    if (record.state !== COMPARTMENT_STATES.RUNNING) {
      stream.emit(new Event('compartment.error', { compartmentId, error: `Not running (state=${record.state})` }));
      return;
    }

    const driver = this.drivers.get(type || record.type);
    if (!driver || typeof driver[method] !== 'function') {
      stream.emit(new Event('compartment.error', { compartmentId, error: `Driver has no method: ${method}` }));
      return;
    }

    driver[method](record, args)
      .then(result => stream.emit(new Event(`${type || record.type}.result`, { compartmentId, method, result })))
      .catch(err  => stream.emit(new Event('compartment.error', { compartmentId, error: err.message })));
  }

  // ── Enumeration ────────────────────────────────────────────────────────────
  listCompartments() {
    return [...this.compartments.values()].map(r => ({
      id: r.id, type: r.type, name: r.name, state: r.state,
      createdAt: r.createdAt, startedAt: r.startedAt,
    }));
  }

  getCompartment(id) { return this.compartments.get(id); }
  busLog()           { return this.log.sample(); }
}

module.exports = CosKernel;
