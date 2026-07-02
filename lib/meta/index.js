'use strict';
/**
 * lib/meta/index.js — FORWARDING SHIM
 * The meta layer has moved to meta/ at the project root.
 * This shim exists for backward compatibility only — update
 * any require('../lib/meta') to require('../meta') directly.
 */
module.exports = require('../../meta/index.js');
