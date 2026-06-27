'use strict'
const crypto = require('crypto')

// Minimal grammar schema language parser
// Parses kern schema documents into JS objects

function parse(doc) {
  const lines = doc.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  const schema = {
    protocol: null,
    version: null,
    node: null,
    pulse: null,
    fidelity: null,
    sigma: null,
    delta: null,
    accepts: {},
    emits: {},
    invariants: [],
    raw: doc
  }

  let section = null
  for (const line of lines) {
    if (line.startsWith('kern ')) {
      schema.protocol = 'kern'
      schema.version = line.slice(5).trim()
      continue
    }
    if (line.startsWith('node ')) {
      schema.node = line.slice(5).trim()
      section = 'node'
      continue
    }
    if (line === 'accepts') { section = 'accepts'; continue }
    if (line === 'emits')   { section = 'emits';   continue }
    if (line === 'invariants') { section = 'invariants'; continue }

    if (section === 'node') {
      const [key, ...rest] = line.split(/\s+/)
      const val = rest.join(' ')
      if (key === 'pulse')    schema.pulse    = parsePulse(val)
      if (key === 'fidelity') schema.fidelity = parseRange(val)
      if (key === 'sigma')    schema.sigma    = parseRange(val)
      if (key === 'delta')    schema.delta    = parseRange(val)
    }

    if (section === 'accepts' || section === 'emits') {
      const match = line.match(/^(\w+)\s+(\w+)\s*(.*)$/)
      if (match) {
        const [, type, name, fieldStr] = match
        const fields = parseFields(fieldStr)
        const target = section === 'accepts' ? schema.accepts : schema.emits
        target[name] = { type, fields }
      }
    }

    if (section === 'invariants') {
      schema.invariants.push(line)
    }
  }

  schema.versionHash = hashSchema(schema)
  return Object.freeze(schema)
}

function parsePulse(val) {
  // e.g. "500ms ± 20ms"
  const match = val.match(/(\d+)ms\s*[±]\s*(\d+)ms/)
  if (match) return { interval: parseInt(match[1]), tolerance: parseInt(match[2]) }
  const simple = val.match(/(\d+)ms/)
  if (simple) return { interval: parseInt(simple[1]), tolerance: 50 }
  return { interval: 1000, tolerance: 100 }
}

function parseRange(val) {
  // e.g. "0.85..1.0" or "0.00..0.12"
  const match = val.match(/([\d.]+)\.\.([\d.]+)/)
  if (match) return { min: parseFloat(match[1]), max: parseFloat(match[2]) }
  return { min: 0, max: 1 }
}

function parseFields(str) {
  // e.g. "{ text: str, wpm: u16, pitch: f32 }"
  const fields = {}
  const inner = str.replace(/[{}]/g, '').trim()
  if (!inner) return fields
  for (const part of inner.split(',')) {
    const [k, v] = part.trim().split(':').map(s => s.trim())
    if (k && v) fields[k] = v
  }
  return fields
}

function hashSchema(schema) {
  const sig = schema.node + JSON.stringify(schema.accepts) + JSON.stringify(schema.emits)
  return crypto.createHash('sha256').update(sig).digest().readUInt16BE(0)
}

function intersect(schemaA, schemaB) {
  const accepts = {}
  const emits = {}
  // What A accepts that B emits
  for (const [name, def] of Object.entries(schemaA.accepts)) {
    if (schemaB.emits[name]) accepts[name] = def
  }
  // What A emits that B accepts
  for (const [name, def] of Object.entries(schemaA.emits)) {
    if (schemaB.accepts[name]) emits[name] = def
  }
  return { accepts, emits, empty: Object.keys(accepts).length === 0 && Object.keys(emits).length === 0 }
}

// Default minimal kern node grammar
const DEFAULT_GRAMMAR = parse(`
kern 1.0

node KernNode
  pulse 1000ms ± 100ms
  fidelity 0.70..1.0
  sigma 0.60..1.0
  delta 0.00..0.30

accepts
  COMMAND ping {}
  DATA    metrics { sigma: f32, delta: f32, regime: u8 }
  HANDSHAKE connect { grammar: str, nonce: str }

emits
  DATA    metrics { sigma: f32, delta: f32, regime: u8 }
  ACK     pong {}
  HANDSHAKE connect { grammar: str, nonce: str }

invariants
  pulse.interval within declared
  sigma never below 0.40 without ACTIVATING logged
  grammar.version immutable without signed ledger event
`)

module.exports = { parse, intersect, hashSchema, DEFAULT_GRAMMAR }
