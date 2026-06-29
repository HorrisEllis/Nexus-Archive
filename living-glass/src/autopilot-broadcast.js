'use strict';
/**
 * living-glass/src/autopilot-broadcast.js
 * UUID: living-glass-autopilot-v1-0000-0000-000000000004
 *
 * Aggregates all field events and fire events into a single correlated stream.
 * Pushes to Living Glass SSE (:7800/sse) and formats annotations for the co-pilot.
 *
 * This is the consciousness layer:
 *   - Every system event is tagged with which component it came from (if known)
 *   - Every error event gets its causal sigma appended
 *   - Every gap gets its fire status appended
 *   - Every fire gets its diagnosis appended as it progresses
 *   - The stream is ordered by importance, not by arrival time
 *
 * Consumers:
 *   - Clear Glass co-pilot panel (via SSE client)
 *   - Future: Mastermind cognitive map (via SSE → inject as node)
 *   - Future: ERAVOS visualization layer (gaps as audio events)
 */

'use strict';

const IMPORTANCE_MAP = {
  'living-glass.fire.opened':    10,
  'living-glass.fire.diagnosed': 9,
  'living-glass.fire.escalated': 10,
  'living-glass.system.offline': 9,
  'living-glass.gap.opened':     8,
  'living-glass.fire.dispatched':7,
  'living-glass.fire.resolved':  6,
  'living-glass.system.online':  5,
};

class AutopilotBroadcast {
  constructor({ field, fire, pushSSE, ledger }) {
    this._field   = field;
    this._fire    = fire;
    this._push    = pushSSE;
    this._ledger  = ledger;
    this._buffer  = [];   // importance-sorted event buffer
    this._flush   = null; // flush timer
  }

  start() {
    // Flush buffer every 500ms in importance order
    this._flush = setInterval(() => this._flushBuffer(), 500);
    console.log('[LivingGlass/Autopilot] broadcast started');
  }

  stop() {
    if (this._flush) clearInterval(this._flush);
  }

  // Field monitor calls this for every event
  ingest(ev) {
    const importance = IMPORTANCE_MAP[ev.type] || this._scoreEvent(ev);
    this._buffer.push({ ...ev, _importance: importance, _receivedAt: Date.now() });
  }

  _flushBuffer() {
    if (!this._buffer.length) return;

    // Sort: importance DESC, then ts ASC (newest high-importance first)
    this._buffer.sort((a, b) =>
      b._importance - a._importance || (a.ts || 0) - (b.ts || 0)
    );

    // Emit top 20 per cycle to avoid flooding SSE
    const batch = this._buffer.splice(0, 20);
    for (const ev of batch) {
      const annotated = this._annotate(ev);
      this._push(`autopilot.${ev.type}`, annotated);
    }
  }

  _annotate(ev) {
    const data = { ...ev };

    // Attach component info if we can identify it
    const system = ev._source || ev.data?.system || '';
    const compId = ev.data?.componentId || ev.data?.component;
    if (compId) {
      const comp = this._field?.getComponent(compId);
      if (comp) data._component = { id: comp.id, name: comp.name, sigma: comp._sigma };
    }

    // Attach active fire for this system
    const activeFires = this._fire?.activeFires() || [];
    const fire = activeFires.find(f => f.system === system);
    if (fire) {
      data._fire = {
        id:     fire.id,
        status: fire.status,
        regime: fire.diagnosis?.regime,
        score:  fire.diagnosis?.healthScore,
      };
    }

    // Sigma annotation
    const sigma = this._field?.sigmaField()?.[system] || this._field?.sigmaField()?.[compId];
    if (sigma !== undefined) data._sigma = sigma;

    return data;
  }

  _scoreEvent(ev) {
    const type = ev.type || '';
    if (type.includes('error') || type.includes('fail') || type.includes('crash')) return 7;
    if (type.includes('gap'))       return 6;
    if (type.includes('offline'))   return 8;
    if (type.includes('online'))    return 4;
    if (type.includes('warning'))   return 5;
    return 2;
  }
}

module.exports = { AutopilotBroadcast };
