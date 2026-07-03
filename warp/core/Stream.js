'use strict';
/**
 * Stream — the dispatch loop. Same O(1) signature-lookup discipline as
 * SISO's Stream. The addition: every transform runs through registered
 * Axioms first. A hard-axiom failure rejects the transform — logged,
 * event routed to `rejected`, never silently completed and never
 * silently dropped (both are failure modes; this distinguishes them).
 *
 * hook(kind, plugin) is the one extension point — scorer/crystallizer/
 * cascader all attach here, all pure-function-shaped like Gate, no
 * special-casing per kind.
 */
class Stream {
  constructor({ log = null, parentStreamId = null, axioms = [] } = {}) {
    this.gates = new Map();
    this.axioms = [...axioms];
    this.pending = [];
    this.rejected = []; // NEW vs SISO: axiom failures land here, not pending
    this.eventCount = 0;
    this.log = log;
    this.streamId = log ? log.nextStreamId() : null;
    this.parentStreamId = parentStreamId;
    this._hooks = { scorer: [], crystallizer: [], cascader: [] };
  }

  register(gate) {
    if (this.gates.has(gate.signature)) {
      throw new Error(`[warp/Stream] Signature collision: '${gate.signature}'`);
    }
    this.gates.set(gate.signature, gate);
  }

  registerAxiom(axiom) {
    this.axioms.push(axiom);
  }

  hook(kind, plugin) {
    if (!this._hooks[kind]) {
      throw new Error(`[warp/Stream] unknown hook kind: '${kind}'`);
    }
    if (typeof plugin !== 'function') {
      throw new Error(`[warp/Stream] hook '${kind}' plugin must be a function`);
    }
    this._hooks[kind].push(plugin);
  }

  hooks(kind) {
    return this._hooks[kind] ? [...this._hooks[kind]] : [];
  }

  /**
   * Run all hard axioms against a gate about to fire on an event.
   * Returns { ok: bool, failures: [{ axiomId, severity }] }.
   * Soft-axiom failures are recorded but never block.
   */
  _checkAxioms(event, gate) {
    const failures = [];
    for (const axiom of this.axioms) {
      let passed;
      try {
        passed = !!axiom.check(event, gate, this.sampleHere());
      } catch (e) {
        // §1.2-equivalent: an axiom that throws is a failure, not a pass.
        passed = false;
      }
      if (!passed) failures.push({ axiomId: axiom.id, severity: axiom.severity });
    }
    const hardFail = failures.some(f => f.severity === 'hard');
    return { ok: !hardFail, failures };
  }

  emit(event) {
    this.eventCount++;
    const gate = this.gates.get(event.type);

    if (!gate) {
      if (this.log) {
        this.log.record({
          streamId: this.streamId, parentStreamId: this.parentStreamId,
          eventType: event.type, gateClaimed: null, axiomResult: null,
        });
      }
      this.pending.push(event);
      return;
    }

    const axiomResult = this._checkAxioms(event, gate);

    if (this.log) {
      this.log.record({
        streamId: this.streamId, parentStreamId: this.parentStreamId,
        eventType: event.type, gateClaimed: gate.signature,
        axiomResult,
      });
    }

    if (!axiomResult.ok) {
      // Hard rejection — never runs, never silently drops. Distinct bucket
      // from `pending` (no gate found) so callers can tell the two apart.
      this.rejected.push({ event, gate: gate.signature, failures: axiomResult.failures });
      return;
    }

    // v1.0.1: gate.transform is pure — it returns events, Stream emits
    // them. Normalize void/single-Event/Event[] into an array, then
    // recurse depth-first, same ordering guarantee as before.
    const produced = gate.transform(event);
    const events = produced == null ? [] : (Array.isArray(produced) ? produced : [produced]);
    for (const next of events) this.emit(next);
  }

  sampleHere() {
    return {
      pending: [...this.pending],
      rejected: [...this.rejected],
      eventCount: this.eventCount,
      gateCount: this.gates.size,
      axiomCount: this.axioms.length,
    };
  }
}

module.exports = { Stream };
