'use strict';
/**
 * bridge/config.js — real, distinct config, not inline constants
 * scattered across bridge/server.js. Matches the pattern established
 * by guardian/config.js, copilot/config.js, intelligence/config.js,
 * and ollama/config.js earlier this session.
 *
 * §SCOPE — genuinely small: bridge/server.js only had 2 real,
 * top-level constants (checked directly, not guessed). No hidden
 * scattered timeouts or thresholds nearby worth extracting.
 */

module.exports = {
  BRIDGE_PORT: parseInt(process.env.BRIDGE_PORT || '9999', 10),
  BRIDGE_HOST: process.env.BRIDGE_HOST || '127.0.0.1',
};
