'use strict'
const crypto = require('crypto')

const FINGERPRINT_LEN = 32

function generate() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519')
  const pub = publicKey.export({ type: 'spki', format: 'der' })
  const fingerprint = crypto.createHash('sha256').update(pub).digest()
  return Object.freeze({ privateKey, publicKey, pub, fingerprint })
}

function fingerprintOf(publicKey) {
  const pub = publicKey.export({ type: 'spki', format: 'der' })
  return crypto.createHash('sha256').update(pub).digest()
}

function sign(identity, data) {
  return crypto.sign(null, Buffer.isBuffer(data) ? data : Buffer.from(data), identity.privateKey)
}

function verify(publicKey, data, signature) {
  try {
    return crypto.verify(null, Buffer.isBuffer(data) ? data : Buffer.from(data), publicKey, signature)
  } catch { return false }
}

function fingerprintHex(fingerprint) {
  return fingerprint.toString('hex').slice(0, 8) + '...' + fingerprint.toString('hex').slice(-4)
}

function exportPublicKey(identity) {
  return identity.pub
}

function importPublicKey(der) {
  return crypto.createPublicKey({ key: Buffer.from(der), type: 'spki', format: 'der' })
}

module.exports = { generate, fingerprintOf, sign, verify, fingerprintHex, exportPublicKey, importPublicKey, FINGERPRINT_LEN }
