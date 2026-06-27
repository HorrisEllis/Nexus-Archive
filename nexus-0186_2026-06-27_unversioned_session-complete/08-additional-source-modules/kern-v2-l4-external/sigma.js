'use strict'

const { REGIME, REGIME_NAME } = require('./envelope')

// Regime thresholds
const THRESHOLDS = [
  { regime: REGIME.STABLE,       minSigma: 0.85, maxDelta: 0.05 },
  { regime: REGIME.ACTIVATING,   minSigma: 0.75, maxDelta: 0.15 },
  { regime: REGIME.OSCILLATING,  minSigma: 0.65, maxDelta: Infinity },
  { regime: REGIME.UNGROUNDED,   minSigma: 0.45, maxDelta: Infinity },
  { regime: REGIME.DYSREGULATED, minSigma: 0.25, maxDelta: Infinity },
  { regime: REGIME.COLLAPSING,   minSigma: -Infinity, maxDelta: Infinity },
]

function assignRegime(sigma, delta) {
  for (const t of THRESHOLDS) {
    if (sigma >= t.minSigma && delta <= t.maxDelta) return t.regime
  }
  return REGIME.COLLAPSING
}

// Routing trust multiplier per regime
const TRUST = [1.0, 0.90, 0.75, 0.50, 0.20, 0.00]

function routingTrust(regime) {
  return TRUST[regime] ?? 0
}

function create(grammar, ledger, nodeHex) {
  // Rolling window of measurements
  const window = []
  const WINDOW_SIZE = 20

  let currentSigma = 1.0
  let currentDelta = 0.0
  let currentRegime = REGIME.STABLE
  let lastPulseTs = Date.now()
  let seq = 0
  let lastSeq = -1

  function score(envelope) {
    const now = Date.now()
    const g = grammar

    // --- Sigma components ---

    // 1. Timing score: how close is this pulse to declared interval
    const elapsed = now - lastPulseTs
    const interval = g.pulse.interval
    const tolerance = g.pulse.tolerance
    const timingDiff = Math.abs(elapsed - interval)
    const timingScore = Math.max(0, 1 - (timingDiff / (tolerance * 4)))

    // 2. Sequence monotonicity
    const seqScore = (envelope.seq > lastSeq) ? 1.0 : 0.0

    // 3. Sigma self-report vs our measurement
    // (on first few pulses, trust self-report)
    const reportedSigma = envelope.sigma
    const sigmaConsistency = window.length < 3
      ? 1.0
      : Math.max(0, 1 - Math.abs(reportedSigma - currentSigma) * 2)

    // 4. Grammar version stability
    const grammarScore = envelope.grammar === g.versionHash ? 1.0 : 0.5

    // Composite sigma (weighted)
    const newSigma = (
      timingScore    * 0.30 +
      seqScore       * 0.25 +
      sigmaConsistency * 0.25 +
      grammarScore   * 0.20
    )

    // --- Delta: rate of change of sigma ---
    window.push(newSigma)
    if (window.length > WINDOW_SIZE) window.shift()

    let newDelta = 0
    if (window.length >= 2) {
      const diffs = []
      for (let i = 1; i < window.length; i++) {
        diffs.push(Math.abs(window[i] - window[i-1]))
      }
      newDelta = diffs.reduce((a, b) => a + b, 0) / diffs.length
    }

    // Smooth with EMA
    currentSigma = window.length < 3 ? newSigma : currentSigma * 0.7 + newSigma * 0.3
    currentDelta = currentDelta * 0.7 + newDelta * 0.3
    currentSigma = Math.max(0, Math.min(1, currentSigma))
    currentDelta = Math.max(0, Math.min(1, currentDelta))

    lastPulseTs = now
    lastSeq = envelope.seq
    seq++

    const prevRegime = currentRegime
    const newRegime = assignRegime(currentSigma, currentDelta)

    const transition = newRegime !== prevRegime
    if (transition) {
      currentRegime = newRegime
      if (ledger) {
        ledger.append(nodeHex, 'REGIME', {
          from: REGIME_NAME[prevRegime],
          to: REGIME_NAME[newRegime],
          sigma: +currentSigma.toFixed(4),
          delta: +currentDelta.toFixed(4)
        })
      }
    }

    return {
      sigma: +currentSigma.toFixed(4),
      delta: +currentDelta.toFixed(4),
      regime: currentRegime,
      regimeName: REGIME_NAME[currentRegime],
      transition,
      prevRegime: REGIME_NAME[prevRegime],
      trust: routingTrust(currentRegime),
    }
  }

  function snapshot() {
    return {
      sigma: +currentSigma.toFixed(4),
      delta: +currentDelta.toFixed(4),
      regime: currentRegime,
      regimeName: REGIME_NAME[currentRegime],
      trust: routingTrust(currentRegime),
    }
  }

  return Object.freeze({ score, snapshot, assignRegime, routingTrust })
}

module.exports = { create, assignRegime, routingTrust, REGIME_NAME, THRESHOLDS }
