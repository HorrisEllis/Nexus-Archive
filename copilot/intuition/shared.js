'use strict';
/**
 * copilot/intuition/shared.js
 * Helpers shared by every intuition handler: cortex fetch + blueprint-index
 * access. Split out so handlers don't each reimplement this plumbing.
 */

const http = require('http');
const CX_URL = process.env.CORTEX_URL || 'http://127.0.0.1:3748';

async function _fetch(url) {
  return new Promise((res) => {
    http.get(url, { timeout: 2000 }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(_) { res(null); } });
    }).on('error', () => res(null)).on('timeout', () => res(null));
  });
}

// Blueprint index — component awareness substrate (§BP-01)
let _blueprintIndex = null;
function _getBP() {
  if (_blueprintIndex) return _blueprintIndex;
  try { _blueprintIndex = require('../../lib/blueprint-index'); return _blueprintIndex; } catch(_) { return null; }
}

module.exports = { _fetch, _getBP, CX_URL };
