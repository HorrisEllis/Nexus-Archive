'use strict'
const crypto = require('crypto')
const { intersect } = require('./grammar')
const { TYPE } = require('./envelope')

// AES-256-GCM session encryption
function encryptPayload(key, plaintext) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc])
}

function decryptPayload(key, buf) {
  const iv  = buf.slice(0, 12)
  const tag = buf.slice(12, 28)
  const enc = buf.slice(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()])
}

function create(identity, grammar, gate, ledger, events) {
  const emit = events ? events.emit.bind(events) : () => {}
  const sessions = new Map()   // nodeHex → { key, intersection, ts }
  const pending  = new Map()   // nonce → { resolve, reject, ts }

  function initiateHandshake(peerNodeHex, heartbeat) {
    return new Promise((resolve, reject) => {
      const nonce = crypto.randomBytes(16).toString('hex')
      const grammarStr = JSON.stringify(grammar)
      const payload = JSON.stringify({ grammarStr, nonce, pubKey: identity.pub.toString('hex') })

      pending.set(nonce, { resolve, reject, ts: Date.now(), peerNodeHex })

      const buf = heartbeat.pulse(TYPE.HANDSHAKE, { grammarStr, nonce, pubKey: identity.pub.toString('hex') })

      emit('handshake:init', { peer: peerNodeHex?.slice(0,8), nonce: nonce.slice(0,8) })

      // Timeout after 10s
      setTimeout(() => {
        if (pending.has(nonce)) {
          pending.delete(nonce)
          reject(new Error('Handshake timeout'))
        }
      }, 10000)

      return buf
    })
  }

  function receiveHandshake(envelope, gateResult) {
    if (!gateResult.pass) return null

    let data
    try { data = JSON.parse(Buffer.from(envelope.payload).toString('utf8')) } catch { return null }

    const { grammarStr, nonce, pubKey } = data
    if (!grammarStr || !nonce) return null

    let peerGrammar
    try { peerGrammar = JSON.parse(grammarStr) } catch { return null }

    const ix = intersect(grammar, peerGrammar)
    if (ix.empty) {
      emit('handshake:reject', { reason: 'no_intersection', peer: gateResult.nodeHex?.slice(0,8) })
      return null
    }

    // Generate session key
    const sessionKey = crypto.randomBytes(32)
    const peerNodeHex = gateResult.nodeHex

    sessions.set(peerNodeHex, {
      key: sessionKey,
      intersection: ix,
      ts: Date.now(),
      peerGrammar
    })

    if (ledger) {
      ledger.append(peerNodeHex, 'GRANT', {
        peer: peerNodeHex.slice(0,8),
        intersection: Object.keys(ix.accepts).concat(Object.keys(ix.emits))
      })
    }

    emit('handshake:complete', { peer: peerNodeHex?.slice(0,8), types: Object.keys(ix.accepts).length })

    return { sessionKey, intersection: ix, nonce }
  }

  function completeHandshake(nonce, sessionKey, intersection) {
    const p = pending.get(nonce)
    if (!p) return
    pending.delete(nonce)
    sessions.set(p.peerNodeHex, { key: sessionKey, intersection, ts: Date.now() })
    p.resolve({ sessionKey, intersection })
  }

  function getSession(nodeHex) { return sessions.get(nodeHex) ?? null }

  function encryptFor(nodeHex, data) {
    const session = sessions.get(nodeHex)
    if (!session) throw new Error('No session for ' + nodeHex)
    return encryptPayload(session.key, typeof data === 'string' ? data : JSON.stringify(data))
  }

  function decryptFrom(nodeHex, buf) {
    const session = sessions.get(nodeHex)
    if (!session) throw new Error('No session for ' + nodeHex)
    return decryptPayload(session.key, buf)
  }

  function activeSessions() {
    return [...sessions.entries()].map(([k, v]) => ({
      node: k.slice(0,8),
      types: Object.keys(v.intersection?.accepts ?? {}).length,
      age: Date.now() - v.ts
    }))
  }

  return Object.freeze({ initiateHandshake, receiveHandshake, completeHandshake, getSession, encryptFor, decryptFrom, activeSessions })
}

module.exports = { create }
