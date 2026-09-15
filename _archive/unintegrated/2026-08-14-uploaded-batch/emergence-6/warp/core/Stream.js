'use strict';
/**
 * Stream — the dispatch loop. O(1) signature-lookup discipline.
 * Every transform runs through registered Axioms first. A hard-axiom
 * failure rejects the transform — logged, event routed to `rejected`,
 * never silently completed and never silently dropped (both are failure
 * modes; this distinguishes them).
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
    this.rejected = []; // axiom failures land here, not pending
    this.eventCount = 0;
    this.log = log;
    this.streamId = log ? log.nextStreamId() : null;
    this.parentStreamId = parentStreamId;
    this._hooks = { scorer: [], crystallizer: [], cascader: [] };
    this._observers = new Map(); // event type -> [handler] — pub/sub, separate from gate routing
  }

  register(gate) {
    if (this.gates.has(gate.signature)) {
      throw new Error(`[warp/Stream] Signature collision: '${gate.signature}'`);
    }
    this.gates.set(gate.signature, gate);
  }

  /**
   * on(type, handler) — observe every event of a given type as it passes
   * through emit(), without owning a gate for it. A caller that wants a
   * live feed (a UI, a logger) registers here instead of registering a
   * competing Gate for the same signature, which would throw on
   * collision. An observer's own error is caught and swallowed — same
   * §1.2-shaped guarantee as axiom-check failures: something watching
   * must never be able to break something running.
   */
  on(type, handler) {
    if (!this._observers.has(type)) this._observers.set(type, []);
    this._observers.get(type).push(handler);
    return () => {
      const arr = this._observers.get(type) || [];
      const i = arr.indexOf(handler);
      if (i >= 0) arr.splice(i, 1);
    };
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

  /**
   * emit(event) — synchronous when every gate.transform() on the path is
   * synchronous (byte-identical to the pre-2026-07-06 behavior: void
   * return, throws propagate synchronously, loom/schema/driver.js's
   * `stream.emit(event)` followed by its own redundant `gate.transform()`
   * call keeps working exactly as it does today). Returns a Promise only
   * when a transform on the path actually returned one — an async gate's
   * caller can `await stream.emit(event)` to know when it's really done;
   * a sync caller that never awaits anything sees no behavior change at
   * all, because until an async gate exists on the path, nothing here
   * ever returns a thenable.
   *
   * §WHY NOT BLANKET async emit() — checked a real, current consumer
   * first (loom/schema/driver.js): it calls stream.emit(event) unawaited
   * today and relies on errors propagating synchronously. A blanket
   * `async emit()` would silently convert that into an unhandled promise
   * rejection instead of a catchable throw — a real regression for the
   * one system already using this as its backbone, not a hypothetical.
   */
  emit(event) {
    this.eventCount++;
    for (const handler of this._observers.get(event.type) || []) {
      try { handler(event); } catch (_) { /* an observer's error never breaks the stream */ }
    }
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
      this.rejected.push({ event, gate: gate.signature, failures: axiomResult.failures });
      return;
    }

    const produced = gate.transform(event);

    // Thenable check, not `produced instanceof Promise` — a caller could
    // hand back any promise-shaped object (e.g. from a different realm/
    // library), duck-typing is the correct check here, same reasoning
    // Node's own util.types.isPromise-adjacent code uses.
    if (produced && typeof produced.then === 'function') {
      return produced.then(resolved => this._emitProduced(resolved));
    }
    return this._emitProduced(produced);
  }

  /**
   * _emitProduced — normalize void/single-Event/Event[] into an array and
   * recurse. Split out from emit() so both the sync and async branches
   * above share one implementation instead of two copies that could drift.
   * Recursion itself follows the same sync-unless-thenable rule: if any
   * downstream emit() call in the chain returns a Promise (because
   * something further down the graph is async), this correctly awaits it
   * before continuing — Promise.all over the recursive calls, so sibling
   * events at the same depth still process depth-first per-branch, same
   * ordering guarantee as the fully-synchronous version.
   */
  _emitProduced(produced) {
    const events = produced == null ? [] : (Array.isArray(produced) ? produced : [produced]);
    const results = events.map(next => this.emit(next));
    if (results.some(r => r && typeof r.then === 'function')) {
      return Promise.all(results);
    }
    // Every recursive call was synchronous — return nothing, exactly
    // like the original void contract.
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
