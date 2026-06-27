'use strict';
/**
 * lib/ase.js — Art/Content Signature Engine
 * UUID: nexus-ase-v1-0000-2026-0627-jamesbrooks-001
 * Version: 1.0.0
 *
 * Ported from rfr2/packages/ase/spatial-ase. Renamed in this header from
 * "Art Signature Engine" to "Content Signature Engine" only in the comment
 * below, not the API — same engine, NEXUS posts/content instead of
 * standalone artworks. Behavioral geometry of how a piece of content moves
 * through its audience over time. Not streams. Not likes.
 *
 * §IDL3-equivalent: this tracks WORKS, never builds a profile of a PERSON.
 * personFingerprint exists only to detect returning encounters with the
 * same work (so "deepens on return" can be measured) — it is never read
 * back out as a person-level signature, never aggregated across works into
 * anything resembling a psychological profile. If you ever find yourself
 * querying "all works a personFingerprint touched," that's a different
 * module than this one, and a different conversation.
 *
 * §AX-008 (foundation addendum v1.1.0): wires out to copilot — a work
 * crossing into 'deepening' trend is exactly the kind of structural signal
 * copilot should be able to see, same reasoning as gap.opened.
 */

const MODULE_ID = 'ase';
const VERSION   = '1.0.0';

// ── Work signature ──────────────────────────────────────────────────────────

function createWorkSignature({ workId, title = '', medium = 'post', creatorId = null }) {
  return {
    workId, title, medium, creatorId,
    signature: {
      tonalCenter:     [0, 0, 0, 0, 0], // mean latent response across encounters
      radiusProfile:   [0, 0, 0, 0, 0], // variance — how differently people respond
      suppressionLift: 0,
      coherenceShift:  0,
      engagementArc:   'unknown',        // rising | falling | sustained | spike
    },
    encounters: [],
    trajectory: {
      firstEncounterTs:  null,
      totalEncounters:   0,
      resonanceOverTime: [],
      peakResonance:     0,
      currentResonance:  0,
      trend:             'unknown',      // deepening | dissolving | stable | emerging
    },
    createdAt: Date.now(),
  };
}

function recordEncounter(sig, { personFingerprint, responseVector, preVector, duration, returnCount = 1, ts }) {
  const delta = responseVector.map((v, i) => v - (preVector[i] ?? 0));
  sig.encounters.push({ personFingerprint, responseVector, delta, duration, returnCount, ts });

  // Update tonal center + radius profile (running mean/variance, simple form)
  const n = sig.encounters.length;
  for (let i = 0; i < 5; i++) {
    const prevMean = sig.signature.tonalCenter[i];
    const newMean  = prevMean + (responseVector[i] - prevMean) / n;
    sig.signature.tonalCenter[i]   = newMean;
    sig.signature.radiusProfile[i] = sig.signature.radiusProfile[i] + (Math.abs(responseVector[i] - newMean) - sig.signature.radiusProfile[i]) / n;
  }

  const resonance = responseVector.reduce((a, b) => a + Math.abs(b), 0) / 5;
  sig.trajectory.totalEncounters += 1;
  sig.trajectory.firstEncounterTs = sig.trajectory.firstEncounterTs ?? ts ?? Date.now();
  sig.trajectory.resonanceOverTime.push({ ts: ts ?? Date.now(), resonance });
  sig.trajectory.peakResonance    = Math.max(sig.trajectory.peakResonance, resonance);
  sig.trajectory.currentResonance = resonance;

  // Trend over the last 5 encounters — deliberately small window, recent shape over long history
  const recent = sig.trajectory.resonanceOverTime.slice(-5).map(r => r.resonance);
  if (recent.length >= 3) {
    const first = recent[0], last = recent[recent.length - 1];
    sig.trajectory.trend = last > first + 0.08 ? 'deepening' : last < first - 0.08 ? 'dissolving' : 'stable';
  } else if (recent.length > 0) {
    sig.trajectory.trend = 'emerging';
  }

  return sig;
}

// ── Engine ───────────────────────────────────────────────────────────────────

class ASEEngine {
  constructor({ bus } = {}) {
    if (!bus) throw new Error('[ase] bus required — §1.2, nothing silently fails');
    this._bus       = bus;
    this._works     = new Map();   // workId → signature
    this._preStates = new Map();   // personFingerprint → last latent vector (pre-encounter)
    this._active    = new Map();   // personFingerprint → { workId, startTs, preVector }
    this._attach();
  }

  _attach() {
    this._bus.on('ase.latent.update', ({ vector, subject }) => {
      this._preStates.set(subject ?? 'default', vector);
    });

    this._bus.on('ase.encounter.start', ({ workId, personFingerprint, ts }) => {
      const pre = this._preStates.get(personFingerprint) ?? [0, 0, 0, 0, 0];
      this._active.set(personFingerprint, { workId, startTs: ts ?? Date.now(), preVector: [...pre] });
    });

    this._bus.on('ase.encounter.end', ({ personFingerprint, returnCount = 1, ts }) => {
      const session = this._active.get(personFingerprint);
      if (!session) {
        this._bus.emit('ase.unknown_session', { personFingerprint }); // §1.2
        return;
      }
      this._active.delete(personFingerprint);

      const responseVector = this._preStates.get(personFingerprint) ?? [0, 0, 0, 0, 0];
      const duration = (ts ?? Date.now()) - session.startTs;

      if (!this._works.has(session.workId)) {
        this._bus.emit('ase.unresolve', { workId: session.workId, reason: 'no registered signature' }); // §1.2
        this._works.set(session.workId, createWorkSignature({ workId: session.workId }));
      }

      const sig = this._works.get(session.workId);
      const prevTrend = sig.trajectory.trend;
      recordEncounter(sig, { personFingerprint, responseVector, preVector: session.preVector, duration, returnCount, ts });

      this._bus.emit('ase.encounter.recorded',  { workId: session.workId, response: responseVector, ts });
      this._bus.emit('ase.signature.updated',   { workId: session.workId, signature: sig.signature, ts });
      this._bus.emit('ase.trajectory.updated',  { workId: session.workId, trajectory: sig.trajectory, ts });

      // §AX-008 — a work crossing into 'deepening' is the structural signal worth surfacing
      if (prevTrend !== 'deepening' && sig.trajectory.trend === 'deepening') {
        this._bus.emit('ase.work.deepening', { workId: session.workId, trajectory: sig.trajectory, ts });
      }
    });
  }

  register(opts)         { const s = createWorkSignature(opts); this._works.set(s.workId, s); return s; }
  signature(workId)       { return this._works.get(workId) ?? null; }
  trajectory(workId)      { return this._works.get(workId)?.trajectory ?? null; }
  allWorks()              { return Array.from(this._works.values()); }
  topByResonance(n = 10)  { return [...this._works.values()].sort((a, b) => b.trajectory.currentResonance - a.trajectory.currentResonance).slice(0, n); }
  trending(n = 10)        { return [...this._works.values()].filter(w => w.trajectory.trend === 'deepening').sort((a, b) => b.trajectory.totalEncounters - a.trajectory.totalEncounters).slice(0, n); }
}

module.exports = { ASEEngine, createWorkSignature, recordEncounter, MODULE_ID, VERSION };
