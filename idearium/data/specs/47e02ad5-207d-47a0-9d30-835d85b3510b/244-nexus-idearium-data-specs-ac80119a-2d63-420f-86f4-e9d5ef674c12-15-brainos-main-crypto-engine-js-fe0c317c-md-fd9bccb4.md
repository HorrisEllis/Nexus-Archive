---
chunk_uuid: fd9bccb4-ddd0-48df-9cb6-986721c9ca14
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-15-brainos-main-crypto-engine-js-fe0c317c-md
title: nexus/idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/15-brainos-main-crypto-engine-js-fe0c317c.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-15-brainos-main-crypto-engine-js-fe0c317c-md
contract_id: spec-contract:47e02ad5:nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-15-brainos-main-crypto-engine-js-fe0c317c-md:fd9bccb4
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:06:25.025Z
---

---
chunk_uuid: fe0c317c-a0bb-4aa8-8731-1975b32d707d
spec_uuid: ac80119a-2d63-420f-86f4-e9d5ef674c12
section: brainos-main-crypto-engine-js
title: BrainOS-main/crypto-engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac80119a:brainos-main-crypto-engine-js
contract_id: spec-contract:ac80119a:brainos-main-crypto-engine-js:fe0c317c
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:28:01.803Z
---

/**
 * NEXUS Crypto Engine — v1.0.0
 * UUID: crypto-engine-module-v1000-0000-000000000001
 *
 * Standalone cryptographic primitives. Zero external dependencies.
 * Pure Node.js crypto. No opinions about persistence or routing.
 *
 * Consumed by: key-manager.js, snr-filter.js, vault, anything needing real crypto.
 *
 * Primitives:
 *   ECDH P-256          — keypair generation + shared secret derivation
 *   AES-256-GCM         — authenticated encryption / decryption
 *   HKDF-SHA256         — key derivation from shared secret
 *   scrypt              — password-based key derivation
 *   HMAC-SHA256         — message authentication
 *   SHA-256 / SHA-512   — hashing
 *   Random              — cryptographically secure random bytes / UUIDs / tokens
 *   Key wrapping        — encrypt a key with another key (AES-256-GCM)
 *
 * Design axioms:
 *   - Every operation returns a typed result object, never throws silently
 *   - All errors are explicit — { ok: false, error: '...' }
 *   - Keys are never logged or emitted to bus
 *   - Input validation before every operation
 *   - Constant-time comparison for secrets (timingSafeEqual)
 */

'use strict';

const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────
const VERSION     = '1.0.0';
const MODULE_UUID = 'crypto-engine-module-v1000-0000-000000000001';

const ALG = {
  ECDH:    'prime256v1',   // P-256
  AES_GCM: 'aes-256-gcm',
  HMAC:    'sha256',
  HASH256: 'sha256',
  HASH512: 'sha512',
};

const SIZES = {
  IV:       16,   // AES-GCM IV bytes
  TAG:      16,   // GCM auth tag bytes
  SALT:     32,   // scrypt salt bytes
  KEY:      32,   // AES-256 key bytes
  HKDF_OUT: 32,   // HKDF output bytes
  TOKEN:    32,   // random token bytes
};

// ─── Result helpers ───────────────────────────────────────────────────────────
const ok  = (data)  => ({ ok: true,  ...data });
const err = (msg, detail = null) => ({ ok: false, error: msg, detail });

// ─── Input guards ─────────────────────────────────────────────────────────────
function requireBuffer(val, name) {
  if (Buffer.isBuffer(val)) return null;
  if (typeof val === 'string') return null; // hex strings accepted
  return `${name} must be Buffer or hex string`;
}

function toBuffer(val, name) {
  if (Buffer.isBuffer(val)) return { buf: val, err: null };
  if (typeof val === 'string') {
    try { const b = Buffer.from(val, 'hex'); return { buf: b, err: null }; }
    catch { return { buf: null, err: `${name}: invalid hex string` }; }
  }
  return { buf: null, err: `${name}: expected Buffer or hex string, got ${typeof val}` };
}

// ─── CryptoEngine class ───────────────────────────────────────────────────────
class CryptoEngine {
  constructor() {
    this.version    = VERSION;
    this.uuid       = MODULE_UUID;
    this._keyCache  = new Map(); // derived key cache (keyed by derivation params)
  }

  // ═══════════════════════════════════════════════════════
  // RANDOM
  // ═══════════════════════════════════════════════════════

  /**
   * Cryptographically secure random bytes.
   * @param {number} bytes
   * @returns {{ ok, hex, buffer, bytes }}
   */
  randomBytes(bytes = SIZES.TOKEN) {
    if (!Number.isInteger(bytes) || bytes < 1 || bytes > 65536)
      return err('randomBytes: bytes must be integer 1–65536');
    try {
      const buf = crypto.randomBytes(bytes);
      return ok({ hex: buf.toString('hex'), buffer: buf, bytes });
    } catch (e) { return err('randomBytes failed', e.message); }
  }

  /**
   * Cryptographically secure UUID v4.
   */
  randomUUID() {
    try { return ok({ uuid: crypto.randomUUID() }); }
    catch (e) { return err('randomUUID failed', e.message); }
  }

  /**
   * Random token — URL-safe base64.
   * @param {number} bytes
   */
  randomToken(bytes = SIZES.TOKEN) {
    const r = this.randomBytes(bytes);
    if (!r.ok) return r;
    return ok({ token: r.buffer.toString('base64url'), bytes });
  }

  // ══════════════════════════════════════