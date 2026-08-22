'use strict';
/**
 * intelligence/config.js — real, distinct config, not inline constants
 * scattered across server.js/consumer.js. Matches the shape already
 * declared for this system in lib/uid/component-map.js's nexus-in.config.
 */
const path = require('path');

module.exports = {
  PORT: parseInt(process.env.INTELLIGENCE_PORT || '3753', 10),
  DATA_DIR: path.join(__dirname, '..', 'data', 'intelligence'),
  POLL_MS: parseInt(process.env.INTELLIGENCE_POLL_MS || '5000', 10),
  MAX_LEDGER_HISTORY: 500,
  RING_CAP: 500,
};
