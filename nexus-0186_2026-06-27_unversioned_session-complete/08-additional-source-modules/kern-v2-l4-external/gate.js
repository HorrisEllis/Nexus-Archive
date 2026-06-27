'use strict'
const { verify, importPublicKey, fingerprintOf } = require('./identity')
const { signable, REGIME } = require('./envelope')

const FIDELITY_PASS   = 0.85
const FIDELITY_FLAG   = 0.70
const FIDELITY_DROP   = 0.70

function create(ledger, sigmaEngine, events) {
  const emit = events ? events.emit.bind(events) : () => {}

  // seq tracking per node to catch replays
  const seqMap = new Map()

  function evaluate(envelope) {
    const nodeHex = Buffer.from(envelope.fingerprint).toString('hex')

    // --- Must have pub key to verify ---
    if (!envelope.pub || envelope.pub.length === 0) {
      emit('drop', { reason: 'no_pubkey', node: nodeHex.slice(0,8) })
      return { pass: false, fidelity: 0, reason: 'no_pubkey' }
    }

    // --- Signature verification (0.30 weight) ---
    let signatureScore = 0
    try {
      const pubKey = importPublicKey(envelope.pub)
      const derivedFingerprint = fingerprintOf(pubKey)
      const fingerprintMatch = Buffer.from(envelope.fingerprint).equals(derivedFingerprint)
      if (!fingerprintMatch) {
        emit('drop', { reason: 'fingerprint_mismatch', node: nodeHex.slice(0,8) })
        return { pass: false, fidelity: 0, reason: 'fingerprint_mismatch' }
      }
      const data = signable(envelope)
      const valid = verify(pubKey, data, envelope.sig)
      signatureScore = valid ? 1.0 : 0.0
      if (!valid) {
        emit('drop', { reason: 'bad_signature', node: nodeHex.slice(0,8) })
        return { pass: false, fidelity: 0, reason: 'bad_signature' }
      }
    } catch (e) {
      emit('drop', { reason: 'verify_error', node: nodeHex.slice(0,8), err: e.message })
      return { pass: false, fidelity: 0, reason: 'verify_error' }
    }

    // --- Replay check via monotonic seq (0.25 weight) ---
    const lastSeq = seqMap.get(nodeHex) ?? -1
    const seqScore = envelope.seq > lastSeq ? 1.0 : 0.0
    if (seqScore === 0) {
      emit('drop', { reason: 'replay', node: nodeHex.slice(0,8), seq: envelope.seq })
      return { pass: false, fidelity: 0, reason: 'replay' }
    }
    seqMap.set(nodeHex, envelope.seq)

    // --- Timing score: ts within reasonable window (0.25 weight) ---
    const now = Date.now()
    const age = Math.abs(now - envelope.ts)
    const timingScore = age < 5000 ? 1.0 : age < 15000 ? 0.5 : 0.0

    // --- Regime coherence: self-reported sigma/delta must be in [0,1] (0.20 weight) ---
    // Out-of-range self-report is a hard indicator of a misbehaving or compromised node.
    // Score 0.0 (not 0.3) so composite fidelity always falls below FIDELITY_PASS (0.85),
    // guaranteeing flagged=true even when all cryptographic checks pass perfectly.
    const sigmaInRange = envelope.sigma >= 0 && envelope.sigma <= 1
    const deltaInRange = envelope.delta >= 0 && envelope.delta <= 1
    const sigmaScore = (sigmaInRange && deltaInRange) ? 1.0 : 0.0

    // --- Composite fidelity ---
    const fidelity = (
      signatureScore * 0.30 +
      seqScore       * 0.25 +
      timingScore    * 0.25 +
      sigmaScore     * 0.20
    )

    // --- Score via sigma engine if available ---
    let sigmaResult = null
    if (sigmaEngine) {
      sigmaResult = sigmaEngine.score(envelope)
    }

    if (fidelity < FIDELITY_DROP) {
      emit('drop', { reason: 'low_fidelity', fidelity: +fidelity.toFixed(3), node: nodeHex.slice(0,8) })
      return { pass: false, fidelity: +fidelity.toFixed(3), reason: 'low_fidelity' }
    }

    const flagged = fidelity < FIDELITY_PASS
    const trust = flagged ? fidelity : 1.0

    emit('pass', {
      node: nodeHex.slice(0,8),
      fidelity: +fidelity.toFixed(3),
      flagged,
      regime: sigmaResult?.regimeName ?? 'UNKNOWN',
      trust: +trust.toFixed(3)
    })

    return {
      pass: true,
      fidelity: +fidelity.toFixed(3),
      flagged,
      trust: +trust.toFixed(3),
      sigma: sigmaResult,
      nodeHex
    }
  }

  return Object.freeze({ evaluate, FIDELITY_PASS, FIDELITY_DROP })
}

module.exports = { create, FIDELITY_PASS, FIDELITY_DROP }
